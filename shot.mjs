// Usage: node shot.mjs <screen-id> [screen-id...]
// Screenshots each dev-nav screen at full 1200x1920 into /tmp/shot-<id>.png
import { chromium } from 'playwright';

const targets = process.argv.slice(2);
if (targets.length === 0) targets.push('home-active');

const browser = await chromium.launch();
// Wide viewport so the app stays in desktop-preview mode; we screenshot the
// scaled device shell. We force scale=1 by making the window big enough.
const page = await browser.newPage({ viewport: { width: 1360, height: 1680 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
// Reveal the dev jump-list (bound to the backtick key).
await page.keyboard.press('`');
await page.waitForTimeout(200);

for (const target of targets) {
  await page.getByRole('button', { name: target, exact: true }).click();
  await page.waitForTimeout(500);
  const shell = page.locator('.device-shell').first();
  await shell.screenshot({ path: `/tmp/shot-${target}.png` });
  console.log('shot', target);
}
await browser.close();
