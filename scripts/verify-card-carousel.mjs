/* global document, getComputedStyle, window */
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/WaterAndSky/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const results = {};

const scenarios = [
  { name: 'education-desktop', route: '/Education', width: 1440, height: 900 },
  { name: 'education-mobile', route: '/Education', width: 390, height: 844 },
  { name: 'ihp-desktop', route: '/human-practices', width: 1440, height: 900 },
  { name: 'ihp-mobile', route: '/human-practices', width: 390, height: 844 },
];

for (const viewport of scenarios) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('404 (Not Found)')) {
      consoleErrors.push(message.text());
    }
  });
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  await page.goto(`http://127.0.0.1:4176${viewport.route}`, { waitUntil: 'networkidle' });

  const carousel = page.locator('.card-carousel');
  await carousel.scrollIntoViewIfNeeded();
  const status = carousel.locator('.card-carousel__status');
  const initial = await status.innerText();
  await carousel.getByRole('button', { name: '上一张卡牌' }).click();
  await page.waitForTimeout(600);
  const wrappedPrevious = await status.innerText();
  await carousel.getByRole('button', { name: '下一张卡牌' }).click();
  await page.waitForTimeout(600);
  const wrappedNext = await status.innerText();

  const box = await carousel.locator('.card-carousel__viewport').boundingBox();
  if (!box) throw new Error('Carousel viewport was not rendered');
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(50);
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(650);
  const afterDrag = await status.innerText();

  await carousel.hover();
  const scrollBeforeWheel = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(650);
  const afterWheel = await status.innerText();
  const scrollAfterWheel = await page.evaluate(() => window.scrollY);

  const metrics = await carousel.evaluate((element) => {
    const active = element.querySelector('.card-carousel__card[data-active="true"]');
    const visibleCards = [...element.querySelectorAll('.card-carousel__card')].filter(
      (card) => getComputedStyle(card).visibility !== 'hidden' && Number(getComputedStyle(card).opacity) > 0,
    );
    const rect = element.getBoundingClientRect();
    const activeRect = active?.getBoundingClientRect();
    return {
      cardCount: element.querySelectorAll('.card-carousel__card').length,
      loadedImageCount: [...element.querySelectorAll('img')].filter((image) => image.complete && image.naturalWidth > 0).length,
      visibleCardCount: visibleCards.length,
      activeCentered: Boolean(activeRect) && Math.abs((activeRect.left + activeRect.right) / 2 - (rect.left + rect.right) / 2) < 2,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  await carousel.screenshot({ path: `output/playwright/card-carousel-${viewport.name}.png` });
  results[viewport.name] = {
    ...metrics,
    initial,
    wrappedPrevious,
    wrappedNext,
    afterDrag,
    afterWheel,
    wheelKeptPageStill: Math.abs(scrollAfterWheel - scrollBeforeWheel) < 1,
    consoleErrors,
    failedRequests,
  };
  await page.close();
}

await browser.close();
await writeFile('output/card-carousel-qa.json', `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));

for (const metrics of Object.values(results)) {
  if (
    metrics.cardCount !== 19 ||
    metrics.loadedImageCount < metrics.visibleCardCount ||
    metrics.visibleCardCount < 3 ||
    !metrics.activeCentered ||
    metrics.horizontalOverflow ||
    metrics.initial !== '01 / 19' ||
    metrics.wrappedPrevious !== '19 / 19' ||
    metrics.wrappedNext !== '01 / 19' ||
    metrics.afterWheel === metrics.afterDrag ||
    !metrics.wheelKeptPageStill ||
    metrics.consoleErrors.length ||
    metrics.failedRequests.length
  ) {
    throw new Error('Card carousel verification failed');
  }
}
