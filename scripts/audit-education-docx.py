"""Audit Education DOCX structure without mutating project content."""

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
    "pic": "http://schemas.openxmlformats.org/drawingml/2006/picture",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def qname(prefix: str, local: str) -> str:
    return f"{{{NS[prefix]}}}{local}"


def text_of(element: etree._Element) -> str:
    parts: list[str] = []
    for node in element.xpath(".//w:t | .//w:tab | .//w:br", namespaces=NS):
        if node.tag == qname("w", "t"):
            parts.append(node.text or "")
        elif node.tag == qname("w", "tab"):
            parts.append("\t")
        else:
            parts.append("\n")
    return "".join(parts).strip()


def paragraph_record(paragraph: etree._Element) -> dict[str, object]:
    style = paragraph.find("w:pPr/w:pStyle", namespaces=NS)
    outline = paragraph.find("w:pPr/w:outlineLvl", namespaces=NS)
    alignment = paragraph.find("w:pPr/w:jc", namespaces=NS)
    numbering = paragraph.find("w:pPr/w:numPr", namespaces=NS)
    drawings = paragraph.xpath(".//w:drawing", namespaces=NS)
    return {
        "kind": "paragraph",
        "style": style.get(qname("w", "val"), "") if style is not None else "",
        "outlineLevel": int(outline.get(qname("w", "val"), "-1")) if outline is not None else None,
        "alignment": alignment.get(qname("w", "val"), "") if alignment is not None else "",
        "numbered": numbering is not None,
        "text": text_of(paragraph),
        "drawingCount": len(drawings),
    }


def table_record(table: etree._Element) -> dict[str, object]:
    rows = table.findall("w:tr", namespaces=NS)
    row_records = []
    for row_index, row in enumerate(rows):
        cells = row.findall("w:tc", namespaces=NS)
        cell_records = []
        for cell_index, cell in enumerate(cells):
            paragraphs = cell.findall("w:p", namespaces=NS)
            nested_tables = cell.findall("w:tbl", namespaces=NS)
            cell_records.append(
                {
                    "cell": cell_index,
                    "text": " | ".join(filter(None, (text_of(p) for p in paragraphs))),
                    "paragraphs": [paragraph_record(p) for p in paragraphs],
                    "drawingCount": len(cell.xpath(".//w:drawing", namespaces=NS)),
                    "nestedTableCount": len(nested_tables),
                }
            )
        row_records.append({"row": row_index, "cells": cell_records})
    return {
        "kind": "table",
        "rowCount": len(rows),
        "rows": row_records,
        "drawingCount": len(table.xpath(".//w:drawing", namespaces=NS)),
    }


def image_records(archive: zipfile.ZipFile, document: etree._Element) -> list[dict[str, object]]:
    rels_root = etree.fromstring(archive.read("word/_rels/document.xml.rels"))
    relationships = {
        rel.get("Id"): rel.get("Target")
        for rel in rels_root.xpath("./pr:Relationship", namespaces=NS)
    }
    records = []
    for index, drawing in enumerate(document.xpath(".//w:drawing", namespaces=NS), start=1):
        container = drawing.find("wp:inline", namespaces=NS)
        placement = "inline"
        if container is None:
            container = drawing.find("wp:anchor", namespaces=NS)
            placement = "anchor"
        if container is None:
            continue
        blip = container.find(".//a:blip", namespaces=NS)
        extent = container.find("wp:extent", namespaces=NS)
        if blip is None or extent is None:
            continue
        rel_id = blip.get(qname("r", "embed"))
        target = relationships.get(rel_id, "")
        media_path = posixpath.normpath(posixpath.join("word", target))
        payload = archive.read(media_path)
        with Image.open(BytesIO(payload)) as image:
            width, height = image.size
            extension = (image.format or PurePosixPath(target).suffix.lstrip(".")).lower()
        src_rect = container.find(".//a:srcRect", namespaces=NS)
        crop = {
            name: int(src_rect.get(xml_name, "0")) if src_rect is not None else 0
            for name, xml_name in (("left", "l"), ("top", "t"), ("right", "r"), ("bottom", "b"))
        }
        parent_paragraph = drawing.xpath("ancestor::w:p[1]", namespaces=NS)[0]
        parent_cell = drawing.xpath("ancestor::w:tc[1]", namespaces=NS)
        parent_row = drawing.xpath("ancestor::w:tr[1]", namespaces=NS)
        records.append(
            {
                "index": index,
                "media": PurePosixPath(target).name,
                "extension": "jpeg" if extension in {"jpeg", "jpg"} else extension,
                "pixels": {"width": width, "height": height},
                "placement": placement,
                "display": {"widthEmu": int(extent.get("cx", "0")), "heightEmu": int(extent.get("cy", "0"))},
                "crop": crop,
                "paragraphText": text_of(parent_paragraph),
                "paragraphAlignment": paragraph_record(parent_paragraph)["alignment"],
                "inTable": bool(parent_cell),
                "tableRowText": text_of(parent_row[0]) if parent_row else "",
            }
        )
    return records


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: audit-education-docx.py INPUT.docx OUTPUT.json")
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    with zipfile.ZipFile(source) as archive:
        document = etree.fromstring(archive.read("word/document.xml"))
        body = document.find("w:body", namespaces=NS)
        blocks = []
        for index, child in enumerate(body):
            if child.tag == qname("w", "p"):
                record = paragraph_record(child)
            elif child.tag == qname("w", "tbl"):
                record = table_record(child)
            else:
                continue
            record["index"] = index
            blocks.append(record)
        payload = {
            "source": str(source),
            "blocks": blocks,
            "images": image_records(archive, document),
        }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"blocks={len(blocks)} images={len(payload['images'])} output={output}")


if __name__ == "__main__":
    main()
