"""Extract Integrated Human Practices content and untouched images from DOCX OOXML."""

from __future__ import annotations

import json
import posixpath
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
                if node is not None and node.get(qname("w", "val"), "1") not in {
                    "0",
                    "false",
                    "none",
                }:
                    segment[field] = True
            vert = props.find("w:vertAlign", namespaces=NS)
            if vert is not None:
                value = vert.get(qname("w", "val"), "")
                if value in {"superscript", "subscript"}:
                    segment[value] = True
        segments.append(segment)
    return segments


def next_heading_id(text: str, level: int, counters: list[int]) -> str:
    if text.casefold() == "overview":
        return "overview"
    counters[level - 1] += 1
    for index in range(level, len(counters)):
        counters[index] = 0
    return "section-" + "-".join(str(value) for value in counters[:level])


def append_toc_item(roots: list[dict[str, object]], item: dict[str, object]) -> None:
    level = int(item["level"])
    if level == 1:
        roots.append({**item, "children": []})
        return
    if not roots:
        raise RuntimeError(f"Heading lacks parent: {item['text']}")
    parent = roots[-1]
    if level == 2:
        parent["children"].append({**item, "children": []})
        return
    children = parent["children"]
    if not children or int(children[-1]["level"]) != 2:
        children.append(item)
        return
    children[-1]["children"].append(item)


def main() -> None:
    if len(sys.argv) != 5:
        raise SystemExit("Usage: extract-ihp-docx.py INPUT.docx OUTPUT.json IMAGE_DIR ASSET_MAP.json")
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    image_dir = Path(sys.argv[3])
    asset_map_path = Path(sys.argv[4])

    with zipfile.ZipFile(source) as archive:
        document = etree.fromstring(archive.read("word/document.xml"))
        body = document.find("w:body", namespaces=NS)
        rels_root = etree.fromstring(archive.read("word/_rels/document.xml.rels"))
        relationships = {
            rel.get("Id"): rel.get("Target")
            for rel in rels_root.xpath("./pr:Relationship", namespaces=NS)
        }
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
                raise RuntimeError(f"Drawing {index} has no placement container")
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
            filename = f"Integrated HP -{index}.{extension}"
            (image_dir / filename).write_bytes(payload)
            src_rect = container.find(".//a:srcRect", namespaces=NS)
            crop = {
                name: int(src_rect.get(xml_name, "0")) if src_rect is not None else 0
                for name, xml_name in (
                    ("left", "l"),
                    ("top", "t"),
                    ("right", "r"),
                    ("bottom", "b"),
                )
            }
            image_record = {
                "src": filename,
                "alt": "Integrated Human Practices interview and activity image",
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

        title = "Integrated Human Practices"
        blocks: list[dict[str, object]] = []
        headings: list[dict[str, object]] = []
        toc: list[dict[str, object]] = []
        counters = [0, 0, 0]
        latest_heading = title
        for child in body:
            if child.tag in {
                qname("w", "sectPr"),
                qname("w", "bookmarkStart"),
                qname("w", "bookmarkEnd"),
            }:
                continue
            if child.tag != qname("w", "p"):
                raise RuntimeError(f"Unexpected body block: {child.tag}")
            text = paragraph_text(child)
            style_node = child.find("w:pPr/w:pStyle", namespaces=NS)
            style = style_node.get(qname("w", "val"), "") if style_node is not None else ""
            paragraph_drawings = child.xpath(".//w:drawing", namespaces=NS)
            images = [images_by_drawing[id(drawing)] for drawing in paragraph_drawings]
            alignment_node = child.find("w:pPr/w:jc", namespaces=NS)
            alignment = alignment_node.get(qname("w", "val"), "") if alignment_node is not None else ""

            if style == "2" and text:
                title = text
                latest_heading = text
                continue
            if style in {"3", "4", "5"} and text:
                level = {"3": 1, "4": 2, "5": 3}[style]
                item_id = next_heading_id(text, level, counters)
                heading = {"type": "heading", "text": text, "level": level, "id": item_id}
                blocks.append(heading)
                toc_item = {"text": text, "level": level, "id": item_id}
                headings.append(toc_item)
                append_toc_item(toc, toc_item)
                latest_heading = text
                continue
            if not text and not images:
                continue
            block: dict[str, object] = {
                "type": "paragraph",
                "text": text,
                "segments": rich_segments(child),
            }
            if alignment:
                block["alignment"] = alignment
            if images:
                for image in images:
                    image["alt"] = latest_heading
                block["images"] = images
                block["mediaLayout"] = "inline-group" if len(images) > 1 else "single"
            blocks.append(block)

    if len(extracted) != len(drawings):
        raise RuntimeError(f"Image count mismatch: {len(drawings)} drawings, {len(extracted)} files")
    for expected, record in enumerate(extracted, start=1):
        if not record["filename"].startswith(f"Integrated HP -{expected}."):
            raise RuntimeError(f"Image order mismatch at {expected}")

    payload = {
        "title": title,
        "lead": "Overview",
        "toc": toc,
        "headingIds": [heading["id"] for heading in headings],
        "blocks": blocks,
        "imageAudit": extracted,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    asset_map = json.loads(asset_map_path.read_text(encoding="utf-8"))
    for record in extracted:
        asset_map.setdefault(record["filename"], "")
    asset_map_path.write_text(json.dumps(asset_map, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Extracted and verified {len(extracted)} images; headings={len(headings)} blocks={len(blocks)}")


if __name__ == "__main__":
    main()
