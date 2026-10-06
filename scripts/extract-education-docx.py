"""Extract Education page content and untouched images from DOCX OOXML."""

from __future__ import annotations

import json
import posixpath
import re
import sys
import zipfile
from io import BytesIO
from pathlib import Path, PurePosixPath

from lxml import etree
from PIL import Image


NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def qname(prefix: str, local: str) -> str:
    return f"{{{NS[prefix]}}}{local}"


def paragraph_text(paragraph: etree._Element) -> str:
    parts: list[str] = []
    for node in paragraph.xpath(".//w:t | .//w:tab | .//w:br", namespaces=NS):
        if node.tag == qname("w", "t"):
            parts.append(node.text or "")
        elif node.tag == qname("w", "tab"):
            parts.append("\t")
        else:
            parts.append("\n")
    return "".join(parts).strip()


def rich_segments(paragraph: etree._Element) -> list[dict[str, object]]:
    segments: list[dict[str, object]] = []
    for run in paragraph.xpath(".//w:r", namespaces=NS):
        text = "".join(run.xpath(".//w:t/text()", namespaces=NS))
        if not text:
            continue
        props = run.find("w:rPr", namespaces=NS)
        segment: dict[str, object] = {"text": text}
        if props is not None:
            for field, tag in (("bold", "b"), ("italic", "i"), ("underline", "u")):
                node = props.find(f"w:{tag}", namespaces=NS)
                if node is not None and node.get(qname("w", "val"), "1") not in {"0", "false", "none"}:
                    segment[field] = True
            vert = props.find("w:vertAlign", namespaces=NS)
            if vert is not None:
                value = vert.get(qname("w", "val"), "")
                if value in {"superscript", "subscript"}:
                    segment[value] = True
        segments.append(segment)
    return segments


def heading_id(text: str, level: int, counters: list[int]) -> str:
    if text.casefold() == "overview":
        return "overview"
    if level == 1:
        counters[0] += 1
        counters[1] = 0
        return f"section-{counters[0]}"
    counters[1] += 1
    return f"section-{counters[0]}-{counters[1]}"


def main() -> None:
    if len(sys.argv) != 5:
        raise SystemExit("Usage: extract-education-docx.py INPUT.docx OUTPUT.json IMAGE_DIR ASSET_MAP.json")
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    image_dir = Path(sys.argv[3])
    asset_map_path = Path(sys.argv[4])

    with zipfile.ZipFile(source) as archive:
        document = etree.fromstring(archive.read("word/document.xml"))
        rels_root = etree.fromstring(archive.read("word/_rels/document.xml.rels"))
        relationships = {
            rel.get("Id"): rel.get("Target")
            for rel in rels_root.xpath("./pr:Relationship", namespaces=NS)
        }
        body = document.find("w:body", namespaces=NS)
        drawings = document.xpath(".//w:drawing", namespaces=NS)
        image_dir.mkdir(parents=True, exist_ok=True)
        if any(image_dir.iterdir()):
            raise RuntimeError(f"Image directory must be empty before extraction: {image_dir}")

        images_by_drawing: dict[int, dict[str, object]] = {}
        extracted: list[dict[str, object]] = []
        for index, drawing in enumerate(drawings, start=1):
            container = drawing.find("wp:inline", namespaces=NS)
            placement = "inline"
            if container is None:
                container = drawing.find("wp:anchor", namespaces=NS)
                placement = "anchor"
            if container is None:
                raise RuntimeError(f"Drawing {index} has no inline or anchor container")
            blip = container.find(".//a:blip", namespaces=NS)
            extent = container.find("wp:extent", namespaces=NS)
            if blip is None or extent is None:
                raise RuntimeError(f"Drawing {index} lacks blip or extent")
            target = relationships[blip.get(qname("r", "embed"))]
            media_path = posixpath.normpath(posixpath.join("word", target))
            payload = archive.read(media_path)
            with Image.open(BytesIO(payload)) as image:
                width, height = image.size
                detected = (image.format or PurePosixPath(target).suffix.lstrip(".")).lower()
            extension = "jpeg" if detected in {"jpeg", "jpg"} else detected
            filename = f"Education -{index}.{extension}"
            destination = image_dir / filename
            destination.write_bytes(payload)
            src_rect = container.find(".//a:srcRect", namespaces=NS)
            crop = {
                name: int(src_rect.get(xml_name, "0")) if src_rect is not None else 0
                for name, xml_name in (("left", "l"), ("top", "t"), ("right", "r"), ("bottom", "b"))
            }
            image_record = {
                "src": filename,
                "alt": "Education document image",
                "width": width,
                "height": height,
                "wordLayout": {
                    "widthEmu": int(extent.get("cx", "0")),
                    "heightEmu": int(extent.get("cy", "0")),
                    "crop": crop,
                    "placement": placement,
                },
            }
            images_by_drawing[id(drawing)] = image_record
            extracted.append(
                {
                    "filename": filename,
                    "sourceMedia": PurePosixPath(target).name,
                    "width": width,
                    "height": height,
                    "extension": extension,
                    "bytes": len(payload),
                }
            )

        blocks: list[dict[str, object]] = []
        counters = [0, 0]
        headings: list[dict[str, object]] = []
        title = "Education"
        lead = ""
        for child in body:
            if child.tag in {
                qname("w", "sectPr"),
                qname("w", "bookmarkStart"),
                qname("w", "bookmarkEnd"),
            }:
                continue
            if child.tag != qname("w", "p"):
                raise RuntimeError(
                    f"Education DOCX unexpectedly contains body block {child.tag}"
                )
            text = paragraph_text(child)
            style_node = child.find("w:pPr/w:pStyle", namespaces=NS)
            style = style_node.get(qname("w", "val"), "") if style_node is not None else ""
            paragraph_drawings = child.xpath(".//w:drawing", namespaces=NS)
            images = [images_by_drawing[id(drawing)] for drawing in paragraph_drawings]
            alignment_node = child.find("w:pPr/w:jc", namespaces=NS)
            alignment = alignment_node.get(qname("w", "val"), "") if alignment_node is not None else ""

            if style == "2" and text:
                title = text
                continue
            if style == "3" and text:
                lead = text
                continue
            is_caption = bool(
                re.match(r"^图\s*\d", text)
                or text.startswith("C .LZU-Northwest队服")
                or text.startswith("C.IP贴纸实物")
            )
            if style in {"4", "5"} and text and not is_caption:
                level = 1 if style == "4" else 2
                item_id = heading_id(text, level, counters)
                heading = {"type": "heading", "text": text, "level": level, "id": item_id}
                headings.append({"text": text, "level": level, "id": item_id})
                blocks.append(heading)
                continue
            if not text and not images:
                continue
            block_type = "caption" if is_caption else "paragraph"
            block: dict[str, object] = {
                "type": block_type,
                "text": text,
                "segments": rich_segments(child),
            }
            if alignment:
                block["alignment"] = alignment
            if images:
                block["images"] = images
                block["mediaLayout"] = "inline-group" if len(images) > 1 else "single"
            blocks.append(block)

        # Captions describe the immediately preceding image block(s).
        for index, block in enumerate(blocks):
            if block["type"] != "caption" or not block["text"]:
                continue
            caption = str(block["text"])
            cursor = index - 1
            while cursor >= 0 and blocks[cursor]["type"] == "paragraph":
                candidate = blocks[cursor]
                if candidate.get("images"):
                    for image in candidate["images"]:
                        image["alt"] = caption
                    cursor -= 1
                    continue
                if candidate.get("text"):
                    break
                cursor -= 1

        toc: list[dict[str, object]] = []
        for heading in headings:
            if heading["level"] == 1:
                toc.append({**heading, "children": []})
            elif toc:
                toc[-1]["children"].append(heading)

    if len(extracted) != len(drawings):
        raise RuntimeError(f"Image count mismatch: drawings={len(drawings)} extracted={len(extracted)}")
    for expected, record in enumerate(extracted, start=1):
        if not record["filename"].startswith(f"Education -{expected}."):
            raise RuntimeError(f"Image order mismatch at {expected}: {record['filename']}")

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(
            {
                "title": title,
                "lead": lead,
                "toc": toc,
                "headingIds": [heading["id"] for heading in headings],
                "blocks": blocks,
                "imageAudit": extracted,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    asset_map = json.loads(asset_map_path.read_text(encoding="utf-8"))
    for record in extracted:
        asset_map.setdefault(record["filename"], "")
    asset_map_path.write_text(json.dumps(asset_map, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Extracted and verified {len(extracted)} images; headings={len(headings)} blocks={len(blocks)}")


if __name__ == "__main__":
    main()
