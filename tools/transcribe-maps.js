#!/usr/bin/env node
/*
 * Transcribes the mapbuilder maps (maps/<book>/<id>.json) into Poom's glyph
 * set, one file per book:
 *
 *   node tools/transcribe-maps.js
 *
 * writes js/books/A.js .. I.js, which index.html loads, and ENGINE-SUPPORT.md,
 * which tracks what the engine does with each glyph.
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

/* what each glyph beyond the original game's needs from the engine */
const NEEDS = {
  "/": "slopes rising right", "\\": "slopes falling right", i: "ice / slippery floor", "<": "conveyor left", ">": "conveyor right",
  S: "switches", Q: "teleporters / elevators", j: "key sockets", H: "hint triggers", D: "warp doors",
  d: "locked doors (colour absent from the source)", q: "keycards with no stated colour", u: "2000-point pickup (medal)",
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
      if (e && "eGNMZl!P".includes(g)) things.push([x, y, g, e.name]);
    }
    rows.push(row);
  }
  for (const e of d.entities) {
    if (e.kind === "door_link" || e.kind === "marker" || e.kind === "unknown") marks.push([e.x, e.y, e.name]);
  }
  return { id: d.map, kind: d.kind, w: d.width, h: d.height, notes: d.notes, rows, things, marks };
}

/* ------------------------------------------------------------------ */
/* Exits. A level whose X tiles make a door (the same test as loadLevel in
 * game.js) ends there. One without ends the way the source engine ends it:
 * by leaving the map, so it is marked edgeExit. */

const SOLID_G = new Set(["#", "d", "j", "i", "<", ">"]);
const isSol = c => SOLID_G.has(c);

function hasRealExit(m) {
  const R = m.rows;
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    if (R[y][x] !== "E" || isSol((R[y - 1] || "")[x])) continue;
    for (let fy = y + 1; fy <= y + 2 && fy < m.h; fy++) { const c = R[fy][x]; if (isSol(c) || c === "-") return true; if (c !== "." && c !== "E") break; }
  }
  return false;
}

/* the ones game.js handles; keep in step with it */
const DONE = new Set(["/", "\\", "i", "<", ">", "d", "q", "u", "l"]);

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
    else if (d.kind === "level") {
      const m = convert(d);
      if (!hasRealExit(m)) m.edgeExit = true;
      B.chapters[0].levels.push(m);
    }
    else B.skipped.push({ id: d.map, kind: d.kind });
  }
  for (const m of [B.world, ...B.chapters[0].levels]) {
    const used = {};
    for (const r of m.rows) for (const ch of r) if (NEEDS[ch]) used[ch] = (used[ch] || 0) + 1;
    for (const [g, n] of Object.entries(used)) total[g] = (total[g] || 0) + n;
    per.push([m.id, m.kind || "world", m.w, m.h, used]);
  }
  fs.writeFileSync(path.join(OUT, book + ".js"),
    `/* Book ${book}: transcribed from maps/${book}/ by tools/transcribe-maps.js. See ENGINE-SUPPORT.md. */\n` +
    `"use strict";\nwindow.BOOKS = window.BOOKS || {};\nBOOKS.${book} = ${JSON.stringify(B)};\n`);
  report.push([book, per, B.skipped]);
}

let md = `# Engine support for the transcribed books

Generated by \`tools/transcribe-maps.js\`. The nine books (A–I) are in \`js/books/\`, one file each, in Poom's glyph set, and \`index.html\` loads them all.
Each book is \`{ world, chapters: [{ levels }], skipped }\`; every map is \`{ id, w, h, rows, things, marks, notes }\`.
Chapters are one-per-book for now: the cutscene markers that would split them are in \`skipped\`.

## Wiring (done)

- A run plays the books in order. \`G.run.book\` is the current book; levels are addressed by map id (\`A02\`) everywhere, and \`G.run.done\` is keyed by it. The save key moved to \`_v2\`, so old saves are ignored.
- Each book's world map comes from its transcription: \`l\` tiles are entrances (target from \`things\`), \`removed when X is done\` marks are barriers until X is done, \`done-flag spot for X\` marks place the flags, and the \`player start\` thing is where the map begins.
- A book is done when every level with an entrance on its map is done; the run then moves to the next book's map, and after Book I to the ending.
- Themes are assigned per book (\`THEME_OF\` in \`game.js\`); levels are named \`Book A, level 1\` until they have names.
- Debug: \`?level=A02\` drops into a level; \`?book=B\` onto a book's map.
- Still the original game's: the story, the ending, the help text and the ship parts.

## Glyphs beyond the original game

Glyphs marked "no" are air until the engine learns them.

| Glyph | Needs | In the engine | Tiles across all books |
|---|---|---|---|
`;
for (const [g, why] of Object.entries(NEEDS)) md += `| \`${g}\` | ${why} | ${DONE.has(g) ? "yes" : "no"} | ${total[g] || 0} |\n`;
md += `
Further notes:
- Enemies are all \`e\`; the per-type behaviour is in \`things\` (\`enemy type 07\`, \`(bouncing)\`, \`(carries key)\`). Types are numbered per book and the engine's six enemies don't map onto them.
- \`marks\` hold the editor's markers: platform path arrows and blockers, camera limits, done-flag spots, "removed when X is done" markers, and warp targets (\`Warp target (x,y)\`).
- Coloured locked doors (\`d\`) can't be told apart from the source: only warp doors have links. For now any keycard, of any colour, opens a \`d\`; \`d\` and \`q\` are drawn silver.
- Slopes: a row's run of n like slope tiles climbs one tile height, so a lone \`/\` is 45 degrees and a pair is half that. A body standing on a slope steps up onto the ground at its top. Non-solid tiles boxed in under a slope's edge are filled as ground at load.
- Ice (\`i\`) is solid with the original game's ice handling while standing on it; conveyors (\`< >\`) are solid and carry the player 1 px a tick. Enemies ignore both.
- \`~\` in world maps is shoreline; in levels it is fire/water, as before.
- Exits: \`X\` in the source becomes \`E\`, but not every \`X\` is an exit. The engine keeps an \`X\` as a door only if it has open space above and a floor within two tiles below (the door drops to that floor); an \`X\` with ground above is the foot of a wall by a key socket and stays wall, and one with no floor stays air. That gives door exits in 61 of 143 levels: all of C and H, 15 of D, 8 of G, 5 of A, 1 of I. The other 82 (\`edgeExit\` in the data: all of B, E and F, most of A and I, 5 of G, D17) end as the source engine ends them, by leaving the map: walking into the two-tile border at the left, right or top edge finishes the level. Falling out of the bottom still kills.
- The ledge (\`-\`), pole (\`|\`) and spikes (\`^\`) are used as the engine already has them.

## Per book

`;
for (const [book, per, skipped] of report) {
  md += `### Book ${book}\n\nSkipped (not levels): ${skipped.map(s => s.id + " " + s.kind).join(", ") || "none"}\n\n| Map | Kind | Size | Glyphs beyond the original game (count) |\n|---|---|---|---|\n`;
  for (const [id, kind, w, h, used] of per) md += `| ${id} | ${kind} | ${w}×${h} | ${Object.entries(used).map(([g, n]) => "`" + g + "` " + n).join(", ") || "none"} |\n`;
  md += "\n";
}
fs.writeFileSync(path.join(ROOT, "ENGINE-SUPPORT.md"), md);
console.log("wrote", report.length, "books; unsupported totals", total);
