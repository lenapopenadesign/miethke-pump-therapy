import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 1050 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

async function curr() {
  return await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => x.style.fontWeight === 'bold');
    return b ? b.textContent : '?';
  });
}
async function jumpTo(name) {
  await page.getByRole('button', { name, exact: true }).click();
  await page.waitForTimeout(150);
}

// Back arrow is the cursor-pointer div inside the header (top-[35px] strip).
// Use a selector that targets only the arrow icon container.
async function clickBackArrow() {
  await page.locator('.device-shell .cursor-pointer:has(.rotate-180)').first().click();
}

await jumpTo('base-dose');
await clickBackArrow();
await page.waitForTimeout(150);
console.log('base-dose back arrow →', await curr());

await jumpTo('intervals-empty');
await clickBackArrow();
await page.waitForTimeout(150);
console.log('intervals-empty back arrow →', await curr());

await jumpTo('intervals-populated');
await clickBackArrow();
await page.waitForTimeout(150);
console.log('intervals-populated back arrow →', await curr());

await jumpTo('review');
await clickBackArrow();
await page.waitForTimeout(150);
console.log('review back arrow →', await curr());

await browser.close();
