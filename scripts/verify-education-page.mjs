/* global document, getComputedStyle, window */
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  chromium,
} = require('C:/Users/WaterAndSky/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const baseUrl = process.env.EDUCATION_PREVIEW_URL || 'http://127.0.0.1:4173/Education';
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
  const consoleErrors = [];
  const failedRequests = [];
  const httpErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
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
  if (viewport.width <= 704) await page.getByRole('button', { name: /关闭菜单/ }).click();
  await page
    .locator('.education-toc > .education-toc__list > .education-toc__item')
    .nth(1)
    .locator(':scope > a')
    .click();
  await page.waitForTimeout(900);
  const firstBranchExpanded = await page
    .locator('.education-toc > .education-toc__list > .education-toc__item')
    .nth(1)
    .locator('.education-toc__branch')
    .evaluate((element) => element.classList.contains('education-toc__branch--expanded'));
  await page
    .locator('.education-toc > .education-toc__list > .education-toc__item')
    .nth(2)
    .locator(':scope > a')
    .click();
  await page.waitForTimeout(900);
  const previousBranchCollapsed = await page
    .locator('.education-toc > .education-toc__list > .education-toc__item')
    .nth(1)
    .locator('.education-toc__branch')
    .evaluate((element) => !element.classList.contains('education-toc__branch--expanded'));
  const figureLocators = page.locator('.education-document__figure');
  for (let index = 0; index < (await figureLocators.count()); index += 1) {
    await figureLocators.nth(index).scrollIntoViewIfNeeded();
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(250);

  const metrics = await page.evaluate(() => {
    const figures = [...document.querySelectorAll('.education-document__figure')];
    const images = [...document.querySelectorAll('.education-document__figure img')];
    const groups = [...document.querySelectorAll('.education-document__media-group')];
    const lastHeading = document.querySelector('.education-document__h3:last-of-type');
    return {
      figureCount: figures.length,
      loadedImageCount: images.filter((image) => image.naturalWidth > 0).length,
      croppedCount: figures.filter((figure) => figure.dataset.cropped === 'true').length,
      centeredSingles: figures
        .filter((figure) => !figure.closest('.education-document__media-group'))
        .every((figure) => {
          const figureRect = figure.getBoundingClientRect();
          const parentRect = figure.parentElement.getBoundingClientRect();
          const leftSpace = figureRect.left - parentRect.left;
          const rightSpace = parentRect.right - figureRect.right;
          return Math.abs(leftSpace - rightSpace) <= 1;
        }),
      groupMeasurements: groups.map((group) =>
        [...group.querySelectorAll('.education-document__figure')].map((figure) => {
          const rect = figure.getBoundingClientRect();
          return {
            src: figure.dataset.imageSrc,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        }),
      ),
      image11Width: Math.round(
        document.querySelector('[data-image-src="Education -11.jpeg"]').getBoundingClientRect()
          .width,
      ),
      image11CenterDelta: (() => {
        const figure = document.querySelector('[data-image-src="Education -11.jpeg"]');
        const figureRect = figure.getBoundingClientRect();
        const parentRect = figure.parentElement.getBoundingClientRect();
        return Math.round(
          Math.abs(figureRect.left - parentRect.left - (parentRect.right - figureRect.right)),
        );
      })(),
      splitCaptionLines: [...document.querySelectorAll('.education-document__caption')]
        .filter(
          (caption) =>
            caption.textContent.startsWith('图34') ||
            caption.textContent.startsWith('C .LZU-Northwest队服') ||
            caption.textContent.startsWith('图36') ||
            caption.textContent.startsWith('C.IP贴纸实物'),
        )
        .map((caption) => ({
          text: caption.textContent,
          textAlign: getComputedStyle(caption).textAlign,
        })),
      horizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      activeLastHeading:
        Boolean(lastHeading) &&
        document.querySelector('.education-toc__link--active')?.getAttribute('href') ===
          `#${lastHeading.id}`,
      headingCount: document.querySelectorAll('.education-document__h2, .education-document__h3')
        .length,
      tocTargetCount: document.querySelectorAll('.education-toc a[href^="#"]').length,
      missingTocTargets: [...document.querySelectorAll('.education-toc a[href^="#"]')]
        .map((link) => link.getAttribute('href')?.slice(1))
        .filter((id) => id && !document.getElementById(id)),
      submenuEducationHref: document
        .querySelector('.site-header__submenu a[href$="/Education"]')
        ?.getAttribute('href'),
    };
  });

  const firstFrame = page.locator('.education-document__image-frame').first();
  const before = await firstFrame.evaluate((element) => getComputedStyle(element).transform);
  await firstFrame.hover();
  await page.waitForTimeout(250);
  const after = await firstFrame.evaluate((element) => getComputedStyle(element).transform);
  metrics.hoverTransformChanged = before !== after && after !== 'none';
  metrics.consoleErrors = consoleErrors;
  metrics.failedRequests = failedRequests;
  metrics.httpErrors = httpErrors;
  metrics.submenuVisibleOnFocus = submenuVisibleOnFocus;
  metrics.firstBranchExpanded = firstBranchExpanded;
  metrics.previousBranchCollapsed = previousBranchCollapsed;
  await page.screenshot({ path: `output/education-${viewport.name}.png`, fullPage: true });
  results[viewport.name] = metrics;
  await page.close();
}

await browser.close();
await writeFile('output/education-browser-qa.json', `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));

for (const [name, metrics] of Object.entries(results)) {
  if (
    metrics.figureCount !== 37 ||
    metrics.loadedImageCount !== 37 ||
    metrics.croppedCount !== 3 ||
    metrics.horizontalOverflow ||
    !metrics.centeredSingles ||
    !metrics.activeLastHeading ||
    metrics.headingCount !== metrics.tocTargetCount ||
    metrics.missingTocTargets.length ||
    (name === 'desktop' && metrics.image11Width > 360) ||
    metrics.image11CenterDelta > 1 ||
    metrics.splitCaptionLines.length !== 4 ||
    metrics.splitCaptionLines.some((line) => line.textAlign !== 'center') ||
    (name === 'desktop' &&
      [2, 3].some((groupIndex) => {
        const heights = metrics.groupMeasurements[groupIndex].map((item) => item.height);
        return Math.max(...heights) - Math.min(...heights) > 1;
      })) ||
    !metrics.submenuEducationHref ||
    !metrics.submenuVisibleOnFocus ||
    !metrics.firstBranchExpanded ||
    !metrics.previousBranchCollapsed ||
    (name === 'desktop' && !metrics.hoverTransformChanged) ||
    metrics.failedRequests.length ||
    metrics.httpErrors.length
  ) {
    throw new Error(`${name} Education browser verification failed`);
  }
}
