/* global document */
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/WaterAndSky/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const results = {};
await mkdir('output/playwright', { recursive: true });

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
  await page.goto('http://127.0.0.1:4175/Education', { waitUntil: 'networkidle' });
  const tool = page.locator('.color-guard');
  await tool.scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: '热力图' }).click();
  await page.getByRole('button', { name: '蓝黄色弱' }).click();
  await page.waitForFunction(() => document.querySelector('.color-guard__comparison figure:nth-child(2) img')?.getAttribute('src')?.startsWith('data:image/png'));
  const metrics = await tool.evaluate((element) => {
    const figures = [...element.querySelectorAll('.color-guard__comparison figure')];
    const rects = figures.map((figure) => figure.getBoundingClientRect());
    return {
      figureCount: figures.length,
      loadedImages: [...element.querySelectorAll('.color-guard__image img')].filter((image) => image.naturalWidth > 0).length,
      activePreset: element.querySelector('.color-guard__presets [aria-pressed="true"]')?.textContent?.trim(),
      activeSimulation: element.querySelector('.color-guard__filters [aria-pressed="true"]')?.textContent?.trim(),
      sideBySide: Math.abs(rects[0].top - rects[1].top) < 2,
      stacked: rects[1].top >= rects[0].bottom - 1,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  metrics.consoleErrors = consoleErrors;
  metrics.failedRequests = failedRequests;
  metrics.httpErrors = httpErrors;
  console.log(viewport.name, metrics);
  await tool.screenshot({ path: `output/playwright/colorguard-${viewport.name}.png` });
  results[viewport.name] = metrics;
  if (
    metrics.figureCount !== 2 || metrics.loadedImages !== 2 ||
    metrics.activePreset !== '热力图' || metrics.activeSimulation !== '蓝黄色弱' ||
    metrics.horizontalOverflow || failedRequests.length || httpErrors.length ||
    (viewport.name === 'desktop' && !metrics.sideBySide) ||
    (viewport.name === 'mobile' && !metrics.stacked)
  ) throw new Error(`${viewport.name} ColorGuard verification failed`);
  await page.close();
}

await browser.close();
await writeFile('output/colorguard-browser-qa.json', `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
