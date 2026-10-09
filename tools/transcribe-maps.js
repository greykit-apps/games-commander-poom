#!/usr/bin/env node
/*
 * Transcribes the mapbuilder maps (maps/<book>/<id>.json) into Poom's glyph
 * set, one file per book:
 *
 *   node tools/transcribe-maps.js
 *
 * writes js/books/A.js .. I.js and ENGINE-SUPPORT.md. The books are data only;
 * nothing loads them yet (see ENGINE-SUPPORT.md).
 *
 * Glyphs the engine already knows keep their js/levels.js meaning. Anything
 * it does not know is kept as its own distinct glyph, never approximated with
 * a tile that merely looks similar, so the engine work can be done later
 * without going back to the sources. Until then the engine treats an unknown
 * glyph as air.
 *
 *   known to the engine
 *     .  air          #  ground        -  one-way ledge   |  pole
 *     ^  spikes       ~  fire/water    f m n c t  points 100 200 500 1000 5000
 *     a  raygun ammo  L  extra life    r y g b  keycard gems
 *     P  start        E  exit
 *   not yet in the engine
 *     / \  slopes        i  ice (was %)         < >  conveyors
 *     S  switch          Q  teleporter (was T)  j    key socket (was O)
 *     H  hint trigger (was ?)   D  warp door    d    locked door, colour not in the source
 *     q  keycard of no stated colour            u    points 2000      w  swim ability
 *     !  objective item         e  enemy        G  turret   N  NPC
 *     M  moving platform        Z  special object            l  world-map level entrance
 *
 * Enemies, turrets, platforms, NPCs, specials, entrances, warp targets and
 * the editor's markers carry detail the glyph can't, so each level also has
 * `things` ([x, y, glyph, name]) and `marks` ([x, y, name]).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const MAPS = path.join(ROOT, "maps");
const OUT = path.join(ROOT, "js", "books");

const PLAIN = { " ": ".", "#": "#", "-": "-", "|": "|", "^": "^", "~": "~", "@": "P", "X": "E",
  "/": "/", "\\": "\\", "%": "i", "<": "<", ">": ">", "S": "S", "T": "Q", "O": "j", "?": "H",
  "e": "e", "g": "G", "n": "N", "p": "M", "*": "Z", "L": "l", "!": "!" };
const POINTS = { 100: "f", 200: "m", 500: "n", 1000: "c", 2000: "u", 5000: "t" };
const KEY = { red: "r", yellow: "y", green: "g", blue: "b" };

/* what each not-yet-supported glyph needs from the engine */
const NEEDS = {
  "/": "slopes rising right", "\\": "slopes falling right", i: "ice / slippery floor", "<": "conveyor left", ">": "conveyor right",
  S: "switches", Q: "teleporters / elevators", j: "key sockets", H: "hint triggers", D: "warp doors",
  d: "locked doors (colour absent from the source)", q: "keycards with no stated colour", u: "2000-point pickup",
  w: "swim ability (and swimming starts)", "!": "objective items", e: "enemies (per-type behaviour)", G: "turrets / emitters",
  N: "NPCs / rescue targets", M: "moving platforms (paths, dropping, sneaky)", Z: "special objects", l: "world-map level entrances",
};

function convert(d) {
  const at = new Map();
  for (const e of d.entities) at.set(e.x + "," + e.y, e);
  const things = [], marks = [], rows = [];
  for (let y = 0; y < d.height; y++) {
    let row = "";
    for (let x = 0; x < d.width; x++) {
      const c = d.grid[y][x], e = at.get(x + "," + y);
      let g;
      if (c === "$") g = POINTS[(e && /points (\d+)/.exec(e.name) || [])[1]] || "f";
      else if (c === "+") g = !e ? "a" : /extra life/.test(e.name) ? "L" : /swim/.test(e.name) ? "w" : "a";
      else if (c === "k") g = !e ? "q" : KEY[(/\((\w+)\)/.exec(e.name) || [])[1]] || "q";
      else if (c === "D") g = d.entities.some(t => t.kind === "door_link" && Math.abs(t.x - x) <= 1 && Math.abs(t.y - y) <= 1) ? "D" : "d";
      else g = PLAIN[c];
      if (g === undefined) throw new Error(`${d.map}: no mapping for '${c}' at ${x},${y}`);
      row += g;
      if (e && "eGNMZl!".includes(g)) things.push([x, y, g, e.name]);
    }
    rows.push(row);
  }
  for (const e of d.entities) {
    if (e.kind === "door_link" || e.kind === "marker" || e.kind === "unknown") marks.push([e.x, e.y, e.name]);
  }
  return { id: d.map, kind: d.kind, w: d.width, h: d.height, notes: d.notes, rows, things, marks };
}

fs.mkdirSync(OUT, { recursive: true });
const report = [];
let total = {};
for (const book of "ABCDEFGHI".split("")) {
  const files = fs.readdirSync(path.join(MAPS, book)).filter(f => /^[A-I]\d\d\.json$/.test(f)).sort();
  const B = { id: book, world: null, chapters: [{ levels: [] }], skipped: [] };
  const per = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(MAPS, book, f), "utf8"));
    if (d.kind === "world") B.world = convert(d);
    else if (d.kind === "level") B.chapters[0].levels.push(convert(d));
    else B.skipped.push({ id: d.map, kind: d.kind });
  }
  for (const m of [B.world, ...B.chapters[0].levels]) {
    const used = {};
    for (const r of m.rows) for (const ch of r) if (NEEDS[ch]) used[ch] = (used[ch] || 0) + 1;
    for (const [g, n] of Object.entries(used)) total[g] = (total[g] || 0) + n;
    per.push([m.id, m.kind || "world", m.w, m.h, used]);
  }
  fs.writeFileSync(path.join(OUT, book + ".js"),
    `/* Book ${book}: transcribed from maps/${book}/ by tools/transcribe-maps.js. Data only; see ENGINE-SUPPORT.md. */\n` +
    `"use strict";\nwindow.BOOKS = window.BOOKS || {};\nBOOKS.${book} = ${JSON.stringify(B)};\n`);
  report.push([book, per, B.skipped]);
}

let md = `# Engine support needed for the transcribed books

Generated by \`tools/transcribe-maps.js\`. The nine books (A–I) are in \`js/books/\`, one file each, as plain data in Poom's glyph set.
Nothing loads them yet, and \`js/levels.js\` (the original 8 levels and world map) is untouched. Each book is \`{ world, chapters: [{ levels }], skipped }\`; every map is
\`{ id, w, h, rows, things, marks, notes }\`. Chapters are one-per-book for now: the cutscene markers that would split them are in \`skipped\`.

## Wiring (not done)

- \`game.js\` assumes one \`WORLD\` and numbered levels 1–8 (\`LEVELS[n]\`, \`G.run.done[n]\`, \`/[1-8]/\` on the map, \`WORLD.barriers\`). It needs books → worlds → levels addressed by id (\`A02\`).
- World maps use \`l\` for each level entrance; the target is in the map's \`things\` (\`entrance to A03\`). The old map uses digits.
- \`loadLevel\` needs themes/art for the new maps (\`theme\` is not set), and the camera/world code must cope with levels up to 250 tall and 208 wide.
- Unknown glyphs are currently air. Features below are listed by glyph.

## Glyphs the engine doesn't know

| Glyph | Needs | Tiles across all books |
|---|---|---|
`;
for (const [g, why] of Object.entries(NEEDS)) md += `| \`${g}\` | ${why} | ${total[g] || 0} |\n`;
md += `
Further notes:
- Enemies are all \`e\`; the per-type behaviour is in \`things\` (\`enemy type 07\`, \`(bouncing)\`, \`(carries key)\`). Types are numbered per book and the engine's six enemies don't map onto them.
- \`marks\` hold the editor's markers: platform path arrows and blockers, camera limits, done-flag spots, "removed when X is done" markers, and warp targets (\`Warp target (x,y)\`).
- Coloured locked doors (\`d\`) can't be told apart from the source: only warp doors have links.
- \`~\` in world maps is shoreline; in levels it is fire/water, as before.
- 69 of the 143 levels have no \`E\`: only books A and G mark an exit door in the source. The rest end some other way (a specific tile, an objective, a boss), which needs working out per book.
- The ledge (\`-\`), pole (\`|\`) and spikes (\`^\`) are used as the engine already has them.

## Per book

`;
for (const [book, per, skipped] of report) {
  md += `### Book ${book}\n\nSkipped (not levels): ${skipped.map(s => s.id + " " + s.kind).join(", ") || "none"}\n\n| Map | Kind | Size | Unsupported glyphs (count) |\n|---|---|---|---|\n`;
  for (const [id, kind, w, h, used] of per) md += `| ${id} | ${kind} | ${w}×${h} | ${Object.entries(used).map(([g, n]) => "`" + g + "` " + n).join(", ") || "none"} |\n`;
  md += "\n";
}
fs.writeFileSync(path.join(ROOT, "ENGINE-SUPPORT.md"), md);
console.log("wrote", report.length, "books; unsupported totals", total);
