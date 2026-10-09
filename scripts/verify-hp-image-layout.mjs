/* global document, getComputedStyle, window */
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(
  'C:/Users/WaterAndSky/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright',
);
const baseUrl = process.env.HP_PREVIEW_URL || 'http://127.0.0.1:4173';
const outputDirectory = new URL('../output/playwright/', import.meta.url);
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const results = [];

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const education = await browser.newPage({ viewport });
  await education.goto(`${baseUrl}/Education`, { waitUntil: 'domcontentloaded' });
  await education.waitForTimeout(500);
  const educationMetrics = await education.evaluate(() => {
    const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect();
    const figure12 = rect('[data-image-src="Education -12.jpeg"]');
    const figure13 = rect('[data-image-src="Education -13.jpeg"]');
    const figure14 = rect('[data-image-src="Education -14.jpeg"]');
    const figure15 = rect('[data-image-src="Education -15.jpeg"]');
    const figure16Element = document.querySelector('[data-image-src="Education -16.jpeg"]');
    const figure16 = figure16Element?.getBoundingClientRect();
    const figure16Parent = figure16Element?.parentElement?.getBoundingClientRect();
    const figure18 = rect('[data-image-src="Education -18.png"]');
    const figure19 = rect('[data-image-src="Education -19.png"]');
    return {
      figures12And13SameRow: Math.abs((figure12?.top ?? 0) - (figure13?.top ?? 0)) < 2,
      figures14And15SameRow: Math.abs((figure14?.top ?? 0) - (figure15?.top ?? 0)) < 2,
      figure16Centered:
        Boolean(figure16 && figure16Parent) &&
        Math.abs(
          (figure16.left + figure16.right) / 2 -
            (figure16Parent.left + figure16Parent.right) / 2,
        ) < 2,
      figures18And19EqualWidth: Math.abs((figure18?.width ?? 0) - (figure19?.width ?? 0)) < 2,
    };
  });
  const educationPair = education.locator('[data-image-src="Education -12.jpeg"]').locator('..');
  await educationPair.scrollIntoViewIfNeeded();
  await education.waitForTimeout(750);
  await educationPair.screenshot({
    path: fileURLToPath(new URL(`education-figures-12-13-${viewport.name}.png`, outputDirectory)),
  });
  results.push({ page: 'Education', viewport, ...educationMetrics });
  await education.close();

  const ihp = await browser.newPage({ viewport });
  await ihp.goto(`${baseUrl}/human-practices`, { waitUntil: 'domcontentloaded' });
  await ihp.waitForTimeout(500);
  const ihpMetrics = await ihp.evaluate(() => {
    const pair = document.querySelector('.ihp-document__media-pair');
    const pairColumns = pair ? getComputedStyle(pair).gridTemplateColumns.split(' ').length : 0;
    const widths = ['16', '17', '18', '19'].map(
      (number) =>
        document
          .querySelector(`[data-image-src="Integrated HP -${number}.png"]`)
          ?.getBoundingClientRect().width ?? 0,
    );
    return {
      pairColumns,
      remainingImagesEqualWidth: Math.max(...widths) - Math.min(...widths) < 2,
    };
  });
  const ihpPair = ihp.locator('.ihp-document__media-pair');
  await ihpPair.scrollIntoViewIfNeeded();
  await ihp.waitForTimeout(750);
  await ihpPair.screenshot({
    path: fileURLToPath(new URL(`ihp-section-7-3-1-${viewport.name}.png`, outputDirectory)),
  });
  results.push({ page: 'Integrated HP', viewport, ...ihpMetrics });
  await ihp.close();
}

const navigation = {};
for (const route of ['/human-practices', '/Education', '/entrepreneurship']) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
  navigation[route] = await page.locator('.page-navigation').evaluate((element) => ({
    previous: element.querySelector('.page-navigation__previous a')?.getAttribute('href') ?? null,
    next: element.querySelector('.page-navigation__next a')?.getAttribute('href') ?? null,
  }));
  await page.close();
}
const scrollPage = await browser.newPage({ viewport: { width: 1024, height: 768 } });
await scrollPage.goto(`${baseUrl}/human-practices`, { waitUntil: 'domcontentloaded' });
await scrollPage.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await scrollPage.locator('.page-navigation__next a').click();
await scrollPage.waitForURL('**/Education');
await scrollPage.waitForTimeout(100);
const scrollReset = (await scrollPage.evaluate(() => window.scrollY)) === 0;
await scrollPage.close();
await browser.close();

const expectedNavigation = {
  '/human-practices': { previous: null, next: '/Education' },
  '/Education': { previous: '/human-practices', next: '/entrepreneurship' },
  '/entrepreneurship': { previous: '/Education', next: '/team' },
};
const failures = results.filter((result) =>
  result.page === 'Education'
    ? result.viewport.name === 'desktop'
      ? !result.figures12And13SameRow ||
        !result.figures14And15SameRow ||
        !result.figure16Centered ||
        !result.figures18And19EqualWidth
      : result.figures12And13SameRow || result.figures14And15SameRow
    : result.pairColumns !== (result.viewport.name === 'desktop' ? 2 : 1) ||
      !result.remainingImagesEqualWidth,
);
if (JSON.stringify(navigation) !== JSON.stringify(expectedNavigation)) {
  failures.push({ navigation, expectedNavigation });
}
if (!scrollReset) failures.push({ scrollReset });
await writeFile(
  new URL('../output/hp-image-layout-qa.json', import.meta.url),
  `${JSON.stringify({ results, navigation, scrollReset }, null, 2)}\n`,
);

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
} else {
  console.log('Education and Human Practices image layouts and page navigation passed.');
}
