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

// Test each back arrow
await jumpTo('base-dose');
await page.locator('.device-shell .cursor-pointer').first().click(); // back arrow is first cursor-pointer
await page.waitForTimeout(150);
console.log('base-dose back →', await curr());

await jumpTo('intervals-empty');
await page.locator('.device-shell .cursor-pointer').first().click();
await page.waitForTimeout(150);
console.log('intervals-empty back →', await curr());

await jumpTo('add-interval-when');
await page.locator('.device-shell .cursor-pointer:has(p:text-is("Cancel"))').click();
await page.waitForTimeout(150);
console.log('add-interval-when Cancel →', await curr());

await jumpTo('add-interval-dose');
await page.locator('.device-shell .cursor-pointer:has(p:text-is("← Back"))').click();
await page.waitForTimeout(150);
console.log('add-interval-dose ← Back →', await curr());

await jumpTo('intervals-populated');
await page.locator('.device-shell .cursor-pointer').first().click();
await page.waitForTimeout(150);
console.log('intervals-populated back →', await curr());

await jumpTo('intervals-populated');
await page.locator('.device-shell .cursor-pointer:has(p:text-is("+  Add interval to Weekdays"))').click();
await page.waitForTimeout(150);
console.log('intervals-populated +Add interval to Weekdays →', await curr());

await jumpTo('review');
await page.locator('.device-shell .cursor-pointer').first().click();
await page.waitForTimeout(150);
console.log('review back →', await curr());

await jumpTo('intervals-empty');
await page.locator('.device-shell .cursor-pointer:has(p:text-is("Skip — use base dose only"))').click();
await page.waitForTimeout(150);
console.log('intervals-empty Skip →', await curr());

await browser.close();
