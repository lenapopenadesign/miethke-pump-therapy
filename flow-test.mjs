import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 1050 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

// Helper: get the title shown in the "Jump to" panel (which highlights the current screen)
async function currentScreen() {
  return await page.evaluate(() => {
    const bold = Array.from(document.querySelectorAll('button')).find(b => b.style.fontWeight === 'bold');
    return bold ? bold.textContent : 'unknown';
  });
}

const steps = [
  { from: 'home-no-therapy', click: '.cursor-pointer', selector: 'div.cursor-pointer:has-text("Therapy")', expect: 'base-dose', note: 'Therapy card → BaseDose' },
];

console.log('Start:', await currentScreen());

// 1. Home → BaseDose (click Therapy card; the 4th card)
// Click any text "Therapy" inside the device-shell that's in a cursor-pointer ancestor
await page.locator('.device-shell .cursor-pointer:has(p:text-is("Therapy"))').first().click();
await page.waitForTimeout(200);
console.log('After Therapy click:', await currentScreen());

// 2. BaseDose Continue → IntervalsEmpty
await page.locator('.device-shell .cursor-pointer:has(p:text-is("Continue"))').click();
await page.waitForTimeout(200);
console.log('After Continue:', await currentScreen());

// 3. IntervalsEmpty "+ Add your first interval" → AddIntervalSheetWhen
await page.locator('.device-shell .cursor-pointer:has(p:text("Add your first interval"))').click();
await page.waitForTimeout(200);
console.log('After Add your first interval:', await currentScreen());

// 4. AddIntervalSheetWhen "Next: set dose" → AddIntervalSheetDose
await page.locator('.device-shell .cursor-pointer:has(p:text-is("Next: set dose →"))').click();
await page.waitForTimeout(200);
console.log('After Next: set dose:', await currentScreen());

// 5. AddIntervalSheetDose "Add interval" → IntervalsPopulated
await page.locator('.device-shell .cursor-pointer:has(p:text-is("Add interval"))').click();
await page.waitForTimeout(200);
console.log('After Add interval:', await currentScreen());

// 6. IntervalsPopulated Continue → Review
await page.locator('.device-shell .cursor-pointer:has(p:text-is("Continue"))').click();
await page.waitForTimeout(200);
console.log('After Continue (intervals-pop):', await currentScreen());

// 7. Review Activate → Activate
await page.locator('.device-shell .cursor-pointer:has(p:text-is("Activate"))').click();
await page.waitForTimeout(200);
console.log('After Activate:', await currentScreen());

// 8. Activate auto-advances after 2.5s
await page.waitForTimeout(3000);
console.log('After auto-advance:', await currentScreen());

// Final screenshot
await page.screenshot({ path: '/tmp/screen-flow-final.png' });

if (errors.length) console.log('ERRORS:', errors);
else console.log('✅ no errors');

await browser.close();
