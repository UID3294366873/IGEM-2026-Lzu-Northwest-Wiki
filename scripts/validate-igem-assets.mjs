import { readFile } from 'node:fs/promises';
const content = JSON.parse(
  await readFile(new URL('../src/data/entrepreneurshipContent.json', import.meta.url), 'utf8'),
);
const manifest = JSON.parse(
  await readFile(new URL('../src/data/igemAssetUrls.json', import.meta.url), 'utf8'),
);

const referencedImages = new Set();

/**
 * Collect every image filename embedded in the structured Entrepreneurship content.
 * @param {unknown} value Value to traverse.
 */
function collectImageReferences(value) {
  if (Array.isArray(value)) {
    value.forEach(collectImageReferences);
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value.images)) {
    value.images.forEach((image) => {
      if (image && typeof image.src === 'string') referencedImages.add(image.src);
    });
  }
  Object.values(value).forEach(collectImageReferences);
}

collectImageReferences(content);

const missing = [...referencedImages].filter((filename) => !(filename in manifest));
const unexpected = Object.keys(manifest).filter((filename) => !referencedImages.has(filename));
const invalid = Object.entries(manifest).filter(([, url]) => {
  if (typeof url !== 'string' || url.length === 0) return true;
  try {
    return new URL(url).hostname !== 'static.igem.wiki';
  } catch {
    return true;
  }
});

if (missing.length || unexpected.length || invalid.length) {
  console.error('iGEM asset manifest validation failed.');
  if (missing.length) console.error(`Missing keys: ${missing.join(', ')}`);
  if (unexpected.length) console.error(`Unused keys: ${unexpected.join(', ')}`);
  if (invalid.length) {
    console.error(
      `Upload these files in the iGEM Uploads tool, then paste the returned static.igem.wiki URLs for: ${invalid
        .map(([filename]) => filename)
        .join(', ')}`,
    );
  }
  process.exitCode = 1;
} else {
  console.log(`Validated ${referencedImages.size} iGEM-hosted image URLs.`);
}
