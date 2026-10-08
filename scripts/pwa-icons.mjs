// Renders the PWA / home-screen icons into public/pwa/ from the "C" of the
// Clarisa logo (public/splash/clarisa-logo.svg): a white C on Clarisa mint.
// Re-run after a logo change:  node scripts/pwa-icons.mjs
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const logo = readFileSync('public/splash/clarisa-logo.svg', 'utf8');
const cPath = logo.match(/<path id="Vector" d="([^"]+)"/)[1];

const MINT = '#00A388';
// The C's bounds inside the logo's viewBox.
const C = { x: 0, y: 19.73, w: 41.7, h: 51.88 };

// `glyph` = share of the icon's height the C fills. Maskable icons keep it
// inside the 80% safe zone, since launchers crop them to a circle or squircle.
function iconSvg(size, glyph, rounded) {
  const s = (size * glyph) / C.h;
  const tx = (size - C.w * s) / 2 - C.x * s;
  const ty = (size - C.h * s) / 2 - C.y * s;
  const r = rounded ? size * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${MINT}"/>
  <path transform="translate(${tx} ${ty}) scale(${s})" d="${cPath}" fill="#fff"/>
</svg>`;
}

const icons = [
  { file: 'icon-192.png', size: 192, glyph: 0.5 },
  { file: 'icon-512.png', size: 512, glyph: 0.5 },
  { file: 'icon-maskable-512.png', size: 512, glyph: 0.4 },
  { file: 'apple-touch-icon.png', size: 180, glyph: 0.5 },
];

mkdirSync('public/pwa', { recursive: true });
writeFileSync('public/pwa/favicon.svg', iconSvg(64, 0.56, true));

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { file, size, glyph } of icons) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>*{margin:0}</style>${iconSvg(size, glyph, false)}`,
  );
  await page.locator('svg').screenshot({ path: `public/pwa/${file}`, omitBackground: true });
  console.log('wrote', file);
}
await browser.close();
