"""Report Word image crop and display geometry in document order."""

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


def main() -> None:
    if len(sys.argv) not in (2, 4) or (len(sys.argv) == 4 and sys.argv[2] != "--update-json"):
        raise SystemExit(
            "Usage: inspect-docx-image-layout.py INPUT.docx [--update-json CONTENT.json]"
        )

    docx_path = sys.argv[1]
    with zipfile.ZipFile(docx_path) as archive:
        document = etree.fromstring(archive.read("word/document.xml"))
        rels_root = etree.fromstring(archive.read("word/_rels/document.xml.rels"))
        relationships = {
            rel.get("Id"): rel.get("Target")
            for rel in rels_root.xpath("./pr:Relationship", namespaces=NS)
        }

        results = []
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

            rel_id = blip.get(f"{{{NS['r']}}}embed")
            target = relationships.get(rel_id, "")
            media_path = posixpath.normpath(posixpath.join("word", target))
            image_bytes = archive.read(media_path)
            with Image.open(BytesIO(image_bytes)) as image:
                pixel_width, pixel_height = image.size

            src_rect = container.find(".//a:srcRect", namespaces=NS)
            crop = {
                side: int(src_rect.get(side, "0")) if src_rect is not None else 0
                for side in ("l", "t", "r", "b")
            }
            cx = int(extent.get("cx", "0"))
            cy = int(extent.get("cy", "0"))
            visible_width = pixel_width * (1 - (crop["l"] + crop["r"]) / 100000)
            visible_height = pixel_height * (1 - (crop["t"] + crop["b"]) / 100000)
            doc_pr = container.find("wp:docPr", namespaces=NS)
            transform = container.find(".//pic:spPr/a:xfrm", namespaces=NS)

            results.append(
                {
                    "index": index,
                    "relationship": rel_id,
                    "media": PurePosixPath(target).name,
                    "name": doc_pr.get("name", "") if doc_pr is not None else "",
                    "placement": placement,
                    "pixels": {"width": pixel_width, "height": pixel_height},
                    "display": {
                        "widthEmu": cx,
                        "heightEmu": cy,
                        "widthInches": round(cx / 914400, 4),
                        "heightInches": round(cy / 914400, 4),
                    },
                    "crop": crop,
                    "visiblePixels": {
                        "width": round(visible_width, 3),
                        "height": round(visible_height, 3),
                    },
                    "rotation": int(transform.get("rot", "0")) if transform is not None else 0,
                    "flipHorizontal": transform.get("flipH") == "1" if transform is not None else False,
                    "flipVertical": transform.get("flipV") == "1" if transform is not None else False,
                }
            )

    if len(sys.argv) == 4:
        content_path = Path(sys.argv[3])
        content = json.loads(content_path.read_text(encoding="utf-8"))
        content_images = []

        def collect_images(value: object) -> None:
            if isinstance(value, dict):
                if {"src", "width", "height"}.issubset(value):
                    content_images.append(value)
                for child in value.values():
                    collect_images(child)
            elif isinstance(value, list):
                for child in value:
                    collect_images(child)

        collect_images(content.get("blocks", []))
        if len(content_images) != len(results):
            raise ValueError(
                f"Image count mismatch: JSON has {len(content_images)}, DOCX has {len(results)}"
            )

        for expected_index, (content_image, layout) in enumerate(
            zip(content_images, results, strict=True), start=1
        ):
            source_number = int(content_image["src"].split(" -", 1)[1].split(".", 1)[0])
            if source_number != expected_index:
                raise ValueError(
                    f"Image order mismatch at {expected_index}: {content_image['src']}"
                )
            if (content_image["width"], content_image["height"]) != (
                layout["pixels"]["width"],
                layout["pixels"]["height"],
            ):
                raise ValueError(f"Image dimensions mismatch at {expected_index}")
            content_image["wordLayout"] = {
                "widthEmu": layout["display"]["widthEmu"],
                "heightEmu": layout["display"]["heightEmu"],
                "crop": {
                    "left": layout["crop"]["l"],
                    "top": layout["crop"]["t"],
                    "right": layout["crop"]["r"],
                    "bottom": layout["crop"]["b"],
                },
            }

        content_path.write_text(
            json.dumps(content, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(f"Updated {len(results)} image layouts in {content_path}")
        return

    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
