"""Extract ordered text, images, and Word display geometry from the Members DOCX."""

from __future__ import annotations

import json
import posixpath
import re
import shutil
import sys
import zipfile
from pathlib import Path, PurePosixPath

from docx import Document
from lxml import etree


NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "pic": "http://schemas.openxmlformats.org/drawingml/2006/picture",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def main() -> None:
    if len(sys.argv) not in (3, 4):
        raise SystemExit("Usage: extract-team-docx.py INPUT.docx OUTPUT_DIR [TEAM_DATA.json]")

    input_path = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    output_dir.mkdir(parents=True, exist_ok=True)

    document = Document(input_path)
    blocks = []
    for child in document.element.body.iterchildren():
        kind = etree.QName(child).localname
        if kind == "p":
            text = "".join(child.xpath(".//w:t/text()"))
            drawing_count = len(child.xpath(".//w:drawing"))
            if text.strip() or drawing_count:
                blocks.append({"kind": "paragraph", "text": text, "images": drawing_count})
        elif kind == "tbl":
            rows = []
            for row in child.xpath("./w:tr"):
                rows.append([
                    "".join(cell.xpath(".//w:t/text()"))
                    for cell in row.xpath("./w:tc")
                ])
            blocks.append({"kind": "table", "rows": rows})

    images = []
    with zipfile.ZipFile(input_path) as archive:
        root = etree.fromstring(archive.read("word/document.xml"))
        rels_root = etree.fromstring(archive.read("word/_rels/document.xml.rels"))
        relationships = {
            rel.get("Id"): rel.get("Target")
            for rel in rels_root.xpath("./pr:Relationship", namespaces=NS)
        }
        for index, drawing in enumerate(root.xpath(".//w:drawing", namespaces=NS), start=1):
            container = drawing.find("wp:inline", namespaces=NS)
            if container is None:
                container = drawing.find("wp:anchor", namespaces=NS)
            if container is None:
                continue
            blip = container.find(".//a:blip", namespaces=NS)
            extent = container.find("wp:extent", namespaces=NS)
            if blip is None or extent is None:
                continue
            rel_id = blip.get(f"{{{NS['r']}}}embed")
            target = relationships[rel_id]
            media_path = posixpath.normpath(posixpath.join("word", target))
            suffix = PurePosixPath(target).suffix.lower()
            filename = f"member-{index:02}{suffix}"
            with archive.open(media_path) as source, (output_dir / filename).open("wb") as target_file:
                shutil.copyfileobj(source, target_file)
            src_rect = container.find(".//a:srcRect", namespaces=NS)
            crop = {
                side: int(src_rect.get(side, "0")) if src_rect is not None else 0
                for side in ("l", "t", "r", "b")
            }
            transform = container.find(".//pic:spPr/a:xfrm", namespaces=NS)
            images.append({
                "index": index,
                "file": filename,
                "widthEmu": int(extent.get("cx", "0")),
                "heightEmu": int(extent.get("cy", "0")),
                "crop": crop,
                "rotation": int(transform.get("rot", "0")) if transform is not None else 0,
                "flipHorizontal": transform.get("flipH") == "1" if transform is not None else False,
                "flipVertical": transform.get("flipV") == "1" if transform is not None else False,
            })

    headings = {
        "PRIMARY PIs": "primary-pis",
        "SECONDARY PIs": "secondary-pis",
        "STUDENT LEADERS": "student-leaders",
        "STUDENT TEAM MEMBERS": "student-members",
        "INSTRUCTORS": "instructors",
    }
    members = []
    group = None
    image_number = 0
    for index, block in enumerate(blocks):
        text = block.get("text", "").strip()
        if text in headings:
            group = headings[text]
            continue
        if block.get("kind") != "paragraph" or block.get("images") != 1:
            continue
        image_number += 1
        name = blocks[index - 1]["text"].strip()
        biography = []
        cursor = index + 1
        while cursor < len(blocks):
            candidate = blocks[cursor]
            if candidate.get("images") == 1 or candidate.get("text", "").strip() in headings:
                break
            if cursor + 1 < len(blocks) and blocks[cursor + 1].get("images") == 1:
                break
            candidate_text = candidate.get("text", "").strip()
            if candidate_text:
                biography.append(candidate_text)
            cursor += 1
        members.append({
            "name": name,
            "group": group,
            "bio": "\n\n".join(biography),
            "image": images[image_number - 1],
        })

    for member in members:
        slug = re.sub(r"[^a-z0-9]+", "-", member["name"].lower()).strip("-")
        image = member["image"]
        old_path = output_dir / image["file"]
        suffix = old_path.suffix.lower()
        filename = f"team-{member['group']}-{slug}{suffix}"
        new_path = output_dir / filename
        if new_path.exists() and new_path != old_path:
            new_path.unlink()
        old_path.replace(new_path)
        image["file"] = filename

    manifest = {
        "source": str(input_path),
        "blocks": blocks,
        "images": images,
        "members": members,
    }
    if len(sys.argv) == 4:
        role_by_group = {
            "primary-pis": "Primary PI",
            "secondary-pis": "Secondary PI",
            "student-leaders": "Student Leader",
            "student-members": "Student Team Member",
            "instructors": "Instructor",
        }
        team_data = []
        for member in members:
            image = member["image"]
            slug = re.sub(r"[^a-z0-9]+", "-", member["name"].lower()).strip("-")
            crop = dict(image["crop"])
            if slug == "hao-yang":
                crop["t"] = 1200
            team_data.append({
                "id": slug,
                "name": member["name"],
                "role": role_by_group[member["group"]],
                "group": member["group"],
                "bio": member["bio"],
                "portraitUrl": f"images/team/{image['file']}",
                "portraitLayout": {
                    "widthEmu": image["widthEmu"],
                    "heightEmu": image["heightEmu"],
                    "crop": crop,
                    "rotation": image["rotation"],
                    "flipHorizontal": image["flipHorizontal"],
                    "flipVertical": image["flipVertical"],
                },
            })
        Path(sys.argv[3]).write_text(
            json.dumps(team_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    else:
        (output_dir / "word-manifest.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    print(
        f"Extracted {len(images)} images, {len(members)} members, "
        f"and {len(blocks)} ordered blocks"
    )


if __name__ == "__main__":
    main()
