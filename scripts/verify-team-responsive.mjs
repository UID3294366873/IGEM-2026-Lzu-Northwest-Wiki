/* global document */
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(
  'C:/Users/WaterAndSky/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright',
);
const outputDirectory = new URL('../output/playwright/', import.meta.url);
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const results = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await page.goto('http://127.0.0.1:4173/team', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const metrics = await page.locator('.team-member-card').first().evaluate((card) => {
    const portrait = card.querySelector('.team-member-card__portrait');
    const cardRect = card.getBoundingClientRect();
    const portraitRect = portrait?.getBoundingClientRect();
    return {
      cardWidth: cardRect.width,
      cardHeight: cardRect.height,
      cardRatio: cardRect.width / cardRect.height,
      portraitWidth: portraitRect?.width ?? 0,
      portraitHeight: portraitRect?.height ?? 0,
      portraitRatio: portraitRect ? portraitRect.width / portraitRect.height : 0,
      contentFits: card.scrollHeight <= card.clientHeight + 1,
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  const overflowingNames = await page.locator('.team-member-card strong').evaluateAll((names) =>
    names
      .filter((name) => name.scrollWidth > name.clientWidth + 1)
      .map((name) => name.textContent?.trim()),
  );
  results.push({ viewport, ...metrics, overflowingNames });
  await page.screenshot({
    path: fileURLToPath(new URL(`team-responsive-${viewport.name}.png`, outputDirectory)),
    fullPage: true,
  });
  await page.close();
}

await browser.close();
await writeFile(
  new URL('../output/team-responsive-qa.json', import.meta.url),
  `${JSON.stringify(results, null, 2)}\n`,
);

const failed = results.filter(
  (result) =>
    Math.abs(result.cardRatio - 209 / 347) > 0.01 ||
    Math.abs(result.portraitRatio - 188 / 242) > 0.01 ||
    !result.contentFits ||
    result.overflowingNames.length > 0,
);
if (failed.length) {
  console.error(JSON.stringify(failed, null, 2));
  process.exitCode = 1;
} else {
  console.log('Team responsive card QA passed for desktop, tablet, and mobile.');
}
