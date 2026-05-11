#!/usr/bin/env python3
"""Transform a Figma get_design_context JSON dump into a TSX screen file.

Usage: build-screen.py <input.json> <output.tsx> <ExportName>

Reads the Figma design-context tool result, rewrites asset URLs to /icons/UUID.svg,
strips data-node-id/data-name noise, and writes a TSX file with a named export.
Also downloads any new assets to ../public/icons/.
"""
import json
import re
import sys
import os
import subprocess
from pathlib import Path

if len(sys.argv) != 4:
    print(__doc__)
    sys.exit(1)

in_path, out_path, export_name = sys.argv[1], sys.argv[2], sys.argv[3]
proj_root = Path(__file__).resolve().parent.parent
icons_dir = proj_root / 'public' / 'icons'
icons_dir.mkdir(parents=True, exist_ok=True)

data = json.load(open(in_path))
code = data[0]['text']

# Find every asset URL and download if not present
url_pattern = re.compile(r'https://www\.figma\.com/api/mcp/asset/([0-9a-f-]+)')
new_downloads = 0
for m in url_pattern.finditer(code):
    uuid = m.group(1)
    target = icons_dir / f'{uuid}.svg'
    if not target.exists():
        url = m.group(0)
        subprocess.run(['curl', '-sf', '-o', str(target), url], check=True)
        new_downloads += 1
print(f'Downloaded {new_downloads} new assets')

# Rewrite URLs to local paths
code = url_pattern.sub(r'/icons/\1.svg', code)

# Strip data-node-id and data-name attrs
code = re.sub(r'\s+data-node-id="[^"]*"', '', code)
code = re.sub(r'\s+data-name="[^"]*"', '', code)

# Rename the export
code = re.sub(r'export default function \w+', f'export function {export_name}', code)

Path(out_path).write_text(code)
print(f'Wrote {out_path}')
