import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1300 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

const screens = [
  'home-no-therapy',
  'base-dose',
  'intervals-empty',
  'add-interval-when',
  'add-interval-dose',
  'intervals-populated',
  'regular-therapy',
  'review',
  'activate',
  'home-active',
];

for (const target of screens) {
  await page.getByRole('button', { name: target, exact: true }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `/tmp/flow-${target}.png` });
}

await browser.close();
console.log('Done — screenshots in /tmp/flow-*.png');
