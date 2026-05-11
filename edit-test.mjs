import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 700, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

// Go to BaseDose, click + 8 times → 360 + 80 = 440
await page.getByRole('button', { name: 'base-dose', exact: true }).click();
await page.waitForTimeout(200);
for (let i = 0; i < 8; i++) await page.locator('.device-shell .select-none').nth(1).click();
await page.waitForTimeout(150);
await page.screenshot({ path: '/tmp/edit-base-dose.png' });

// Go to IntervalsPopulated — bars should reflect new base dose
await page.getByRole('button', { name: 'intervals-populated', exact: true }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/edit-intervals-440.png' });

// Click first interval row (Night, dose 200)
await page.locator('.device-shell .cursor-pointer:has(p:text-is("Night"))').click();
await page.waitForTimeout(200);
await page.screenshot({ path: '/tmp/edit-when-night.png' });

// Should be on add-interval-when with draft loaded with Night's values
// Go to dose step
await page.locator('.device-shell .cursor-pointer:has(p:text-is("Next: set dose →"))').click();
await page.waitForTimeout(200);

// Click + 20 times (200 + 200 = 400)
for (let i = 0; i < 20; i++) await page.locator('.device-shell .select-none').nth(1).click();
await page.waitForTimeout(150);
await page.screenshot({ path: '/tmp/edit-night-dose-400.png' });

// Save
await page.locator('.device-shell .cursor-pointer:has(p:text-is("Save interval"))').click();
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/edit-intervals-after-night.png' });

console.log(errors.length ? 'ERRORS: ' + errors.join('|') : 'OK');
await browser.close();
