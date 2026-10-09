#!/usr/bin/env node
/*
 * Writes icon.svg -- Poom's head in Book 1's ranger helmet, pixel for pixel
 * from js/art.js, on a wasteland dusk --
 * and renders the favicons and the home-screen icon from it.
 *
 *   node tools/make-icons.js
 *
 * Needs rsvg-convert (librsvg) and python3 with Pillow for favicon.ico.
 * The outputs are committed; nothing renders at deploy time. og.png is made
 * separately, in a browser, by tools/og.html.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const art = fs.readFileSync(path.join(root, "js", "art.js"), "utf8");
const EGA = eval(art.match(/const EGA = (\[[\s\S]*?\]);/)[1]);
const EXTRA = eval(art.match(/const EXTRA = ("[^"]*");/)[1]);
const head = eval(art.match(/const RANGER_HEAD = (\[[\s\S]*?\]);/)[1]);

/* the head, then the same automatic outline the game draws */
const rows = head;
const w = Math.max(...rows.map(r => r.length)) + 2, h = rows.length + 2;
const grid = Array.from({ length: h }, () => new Array(w).fill(-1));
rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== ".") grid[y + 1][x + 1] = EXTRA.includes(c) ? 16 + EXTRA.indexOf(c) : parseInt(c, 16); }));
const src = grid.map(r => r.slice());
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  if (src[y][x] !== -1) continue;
  const n = (yy, xx) => yy >= 0 && yy < h && xx >= 0 && xx < w && src[yy][xx] > 0;
  if (n(y - 1, x) || n(y + 1, x) || n(y, x - 1) || n(y, x + 1)) grid[y][x] = 0;
}

/* centred on an 18x18 dusk square */
const S = 18, ox = Math.floor((S - w) / 2), oy = Math.floor((S - h) / 2) + 1;
let rects = "";
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  if (grid[y][x] < 0) continue;
  rects += `<rect x="${x + ox}" y="${y + oy}" width="1" height="1" fill="${EGA[grid[y][x]]}"/>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" shape-rendering="crispEdges" role="img" aria-label="Commander Poom">
<title>Commander Poom</title>
<!-- Poom's head from js/art.js (RANGER_HEAD), outlined as the game outlines it.
     Written by tools/make-icons.js; edit the sprite, not this file. -->
<rect width="${S}" height="${S}" rx="2" fill="#3a1c2a"/>
<rect y="${S - 5}" width="${S}" height="5" fill="#b24a2e"/>
<rect y="${S - 3}" width="${S}" height="3" fill="#e4823a"/>
${rects}
</svg>
`;
fs.writeFileSync(path.join(root, "icon.svg"), svg);

const out = f => path.join(root, f);
for (const [f, size] of [["favicon-16x16.png", 16], ["favicon-32x32.png", 32], ["apple-touch-icon.png", 180], ["icon-512.png", 512]])
  execFileSync("rsvg-convert", ["-w", String(size), "-h", String(size), "-o", out(f), out("icon.svg")]);
execFileSync("python3", ["-c",
  "import sys; from PIL import Image; im=Image.open(sys.argv[1]).convert('RGBA'); im.save(sys.argv[2], sizes=[(16,16),(32,32),(48,48)])",
  out("icon-512.png"), out("favicon.ico")]);
fs.unlinkSync(out("icon-512.png"));
console.log("wrote icon.svg, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, favicon.ico");
