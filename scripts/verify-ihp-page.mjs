/* global document, getComputedStyle, window */
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  chromium,
} = require('C:/Users/WaterAndSky/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const baseUrl = process.env.IHP_PREVIEW_URL || 'http://127.0.0.1:4176/human-practices';
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const results = {};

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport });
  const failedRequests = [];
  const httpErrors = [];
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
  if (viewport.width <= 704) await page.getByRole('button', { name: /打开菜单/ }).click();
  const humanPracticesLink = page.getByRole('link', { name: 'Human Practices' });
  await humanPracticesLink.focus();
  const submenuVisibleOnFocus = await page
    .locator('.site-header__submenu')
    .evaluate((element) => getComputedStyle(element).display !== 'none');
  const integratedHpHref = await page
    .getByRole('link', { name: 'Integrated HP' })
    .getAttribute('href');
  if (viewport.width <= 704) await page.getByRole('button', { name: /关闭菜单/ }).click();

  const rootItems = page.locator('.education-toc__list > .education-toc__item');
  await rootItems.nth(1).locator(':scope > a').click();
  await page.waitForTimeout(500);
  const firstBranchExpanded = await rootItems
    .nth(1)
    .locator(':scope > .education-toc__branch')
    .evaluate((element) => element.classList.contains('education-toc__branch--expanded'));
  await rootItems.nth(2).locator(':scope > a').click();
  await page.waitForTimeout(500);
  const previousBranchCollapsed = await rootItems
    .nth(1)
    .locator(':scope > .education-toc__branch')
    .evaluate((element) => !element.classList.contains('education-toc__branch--expanded'));

  const figures = page.locator('.ihp-document .education-document__figure');
  for (let index = 0; index < (await figures.count()); index += 1) {
    await figures.nth(index).scrollIntoViewIfNeeded();
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(250);

  const metrics = await page.evaluate(() => {
    const figures = [...document.querySelectorAll('.ihp-document .education-document__figure')];
    const images = [...document.querySelectorAll('.ihp-document img')];
    const headings = [
      ...document.querySelectorAll('.ihp-document h2, .ihp-document h3, .ihp-document h4'),
    ];
    const tocLinks = [...document.querySelectorAll('.education-toc a[href^="#"]')];
    const lastHeading = headings.at(-1);
    return {
      figureCount: figures.length,
      loadedImageCount: images.filter((image) => image.naturalWidth > 0).length,
      croppedCount: figures.filter((figure) => figure.dataset.cropped === 'true').length,
      centeredFigures: figures.every((figure) => {
        const figureRect = figure.getBoundingClientRect();
        const parentRect = figure.parentElement.getBoundingClientRect();
        return (
          Math.abs(figureRect.left - parentRect.left - (parentRect.right - figureRect.right)) <= 1
        );
      }),
      horizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      headingCount: headings.length,
      tocTargetCount: tocLinks.length,
      missingTocTargets: tocLinks
        .map((link) => link.getAttribute('href')?.slice(1))
        .filter((id) => id && !document.getElementById(id)),
      activeLastHeading:
        Boolean(lastHeading) &&
        document.querySelector('.education-toc__link--active')?.getAttribute('href') ===
          `#${lastHeading.id}`,
      externalLinkCount: document.querySelectorAll('.ihp-document a[href^="http"]').length,
    };
  });

  const firstFrame = page.locator('.ihp-document .education-document__image-frame').first();
  const before = await firstFrame.evaluate((element) => getComputedStyle(element).transform);
  await firstFrame.hover();
  await page.waitForTimeout(250);
  const after = await firstFrame.evaluate((element) => getComputedStyle(element).transform);
  metrics.hoverTransformChanged = before !== after && after !== 'none';
  metrics.integratedHpHref = integratedHpHref;
  metrics.submenuVisibleOnFocus = submenuVisibleOnFocus;
  metrics.firstBranchExpanded = firstBranchExpanded;
  metrics.previousBranchCollapsed = previousBranchCollapsed;
  metrics.failedRequests = failedRequests;
  metrics.httpErrors = httpErrors;
  await page.screenshot({ path: `output/ihp-${viewport.name}.png`, fullPage: true });
  results[viewport.name] = metrics;
  await page.close();
}

await browser.close();
await writeFile('output/ihp-browser-qa.json', `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));

for (const [name, metrics] of Object.entries(results)) {
  if (
    metrics.figureCount !== 20 ||
    metrics.loadedImageCount !== 20 ||
    metrics.croppedCount !== 0 ||
    !metrics.centeredFigures ||
    metrics.horizontalOverflow ||
    metrics.headingCount !== 96 ||
    metrics.tocTargetCount !== 96 ||
    metrics.missingTocTargets.length ||
    !metrics.activeLastHeading ||
    metrics.externalLinkCount < 2 ||
    metrics.integratedHpHref !== '/human-practices' ||
    !metrics.submenuVisibleOnFocus ||
    !metrics.firstBranchExpanded ||
    !metrics.previousBranchCollapsed ||
    (name === 'desktop' && !metrics.hoverTransformChanged) ||
    metrics.failedRequests.length ||
    metrics.httpErrors.length
  ) {
    throw new Error(`${name} Integrated HP browser verification failed`);
  }
}
