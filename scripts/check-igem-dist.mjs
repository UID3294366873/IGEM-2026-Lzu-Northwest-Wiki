import { readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const distDirectory = fileURLToPath(new URL('../dist/', import.meta.url));

/**
 * Return all files below a directory.
 * @param {string} directory Directory to traverse.
 * @returns {Promise<string[]>} Absolute file paths.
 */
async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = `${directory}/${entry.name}`;
      return entry.isDirectory() ? listFiles(path) : Promise.resolve([path]);
    }),
  );
  return nested.flat();
}

const files = await listFiles(distDirectory);
const sizes = await Promise.all(files.map(async (file) => (await stat(file)).size));
const totalBytes = sizes.reduce((total, size) => total + size, 0);
const bundledLocalImages = files.filter((file) => file.includes('/images/'));

if (!files.some((file) => file.endsWith('/index.html'))) {
  throw new Error('dist/index.html is missing.');
}
if (!bundledLocalImages.length) {
  throw new Error('CloudBase build is missing local images from the public directory.');
}

console.log(
  `CloudBase build size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB; bundled images: ${bundledLocalImages.length}.`,
);
