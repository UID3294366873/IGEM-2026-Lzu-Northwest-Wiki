/* global document, getComputedStyle, window */
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(
  'C:/Users/WaterAndSky/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright',
);

const baseUrl = process.env.MEDIA_PREVIEW_URL || 'http://127.0.0.1:4173';
const outputDirectory = new URL('../output/playwright/', import.meta.url);
const routes = ['/', '/Education', '/human-practices', '/entrepreneurship', '/team'];
const viewports = [
  { name: 'four-three', width: 1024, height: 768 },
  { name: 'sixteen-nine', width: 1440, height: 810 },
  { name: 'portrait', width: 390, height: 844 },
];
const zoomLevels = [0.5, 1, 2];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const results = [];

for (const viewport of viewports) {
  for (const route of routes) {
    const page = await browser.newPage({ viewport });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(750);
    await page.locator('img').evaluateAll((images) => {
      for (const image of images) image.loading = 'eager';
      return Promise.race([
        Promise.all(images.map((image) => image.decode().catch(() => undefined))),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    });

    for (const zoom of zoomLevels) {
      await page.evaluate((value) => {
        document.documentElement.style.zoom = String(value);
      }, zoom);
      const audit = await page.locator('img').evaluateAll((images) =>
        images.map((image) => {
          const rect = image.getBoundingClientRect();
          const style = getComputedStyle(image);
          const naturalRatio = image.naturalWidth / image.naturalHeight;
          const renderedRatio = rect.width / rect.height;
          return {
            alt: image.alt,
            source: image.currentSrc,
            naturalRatio,
            renderedRatio,
            objectFit: style.objectFit,
            distorted:
              image.naturalWidth > 0 &&
              image.naturalHeight > 0 &&
              style.objectFit === 'fill' &&
              Math.abs(renderedRatio / naturalRatio - 1) > 0.01,
          };
        }),
      );
      const horizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      results.push({ route, viewport, zoom, horizontalOverflow, pageErrors, audit });
    }

    if (route === '/Education' && ['sixteen-nine', 'portrait'].includes(viewport.name)) {
      await page.evaluate(() => {
        document.documentElement.style.zoom = '1';
      });
      await page.screenshot({
        path: fileURLToPath(new URL(`media-aspect-${viewport.name}.png`, outputDirectory)),
        fullPage: true,
      });
    }
    await page.close();
  }
}

await browser.close();
await writeFile(
  new URL('../output/media-aspect-qa.json', import.meta.url),
  `${JSON.stringify(results, null, 2)}\n`,
);

const failures = results.flatMap((result) => [
  ...result.audit.filter((image) => image.distorted).map((image) => ({ ...result, audit: image })),
  ...result.pageErrors.map((error) => ({ ...result, audit: error })),
]);

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
} else {
  console.log(`Media aspect QA passed: ${results.length} route/viewport/zoom combinations.`);
}
