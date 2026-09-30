// One-shot rebrand: rewrite every colour literal in src/ from the old B.Braun
// blue palette to the Clarisa mint palette. Mapping lives in rebrand-map.json.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const map = JSON.parse(readFileSync(new URL('./rebrand-map.json', import.meta.url), 'utf8'));
delete map._comment;

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(p)) files.push(p);
  }
})('src');
for (const extra of ['public/icons']) walkInto(extra);
function walkInto(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walkInto(p);
    else if (/\.svg$/.test(p)) files.push(p);
  }
}

const counts = Object.fromEntries(Object.keys(map).map(k => [k, 0]));
let touched = 0;

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  // index.css holds the palette definition itself — leave it alone.
  if (f.endsWith('index.css')) continue;
  const out = src.replace(/#[0-9a-fA-F]{6}/g, m => {
    const key = m.toLowerCase();
    if (!(key in map)) return m;
    counts[key]++;
    return map[key];
  });
  if (out !== src) { writeFileSync(f, out); touched++; }
}

console.log(`rewrote ${touched} files`);
const unused = Object.entries(counts).filter(([, n]) => n === 0).map(([k]) => k);
console.log(`replacements: ${Object.values(counts).reduce((a, b) => a + b, 0)}`);
if (unused.length) console.log(`unused mappings: ${unused.join(', ')}`);
