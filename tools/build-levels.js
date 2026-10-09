#!/usr/bin/env node
/*
 * Builds js/levels.js: the world map and every level, as ASCII.
 *
 *   node tools/build-levels.js
 *
 * Levels are laid out here with boxes and strings at coordinates, which keeps
 * them exact, and written out as plain rows, which keeps js/levels.js easy to
 * read and to hand-edit. Edit either; rerunning this overwrites levels.js.
 *
 * Level legend
 *   #  ground          =  bricks          -  one-way ledge     |  pole
 *   +  back wall       %  fake wall       ^  spikes            ~  fire / slush / water
 *   1 2 3 4  doors (red yellow green blue)    r y g b  their keycard gems
 *   f fish 100   m milk 200   n yarn 500   c catnip 1000   t trophy 5000
 *   a raygun charge   L extra life   O pogo stick   *  ship part
 *   P start   E exit (the door's lower tile)
 *   x mousel   B barker   V vacuumoid   T roombot   K clawtank   W the Grand Vacuumoid
 *
 * Reach, for laying levels out: a jump clears 3 tiles up and 4 across; the
 * pogo clears 6 up (5 is comfortable).
 */
const fs = require("fs");
const path = require("path");

function grid(w, h, fill = ".") {
  const g = Array.from({ length: h }, () => new Array(w).fill(fill));
  const o = {
    w, h,
    box(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && x >= 0 && x < w) g[y][x] = c; return o; },
    put(x, y, s) { [...s].forEach((c, i) => { if (c !== " " && g[y] && x + i < w) g[y][x + i] = c; }); return o; },
    col(x, y0, y1, c) { return o.box(x, y0, x, y1, c); },
    frame(c = "#") { o.box(0, 0, w - 1, 0, c); o.box(0, 0, 0, h - 1, c); o.box(w - 1, 0, w - 1, h - 1, c); return o; },
    floor(F, c = "#") { return o.box(0, F, w - 1, h - 1, c); },
    rows() { return g.map(r => r.join("")); },
  };
  return o;
}

const LEVELS = {};

/* 1 ---------------------------------------------------------------- */
{
  const L = grid(110, 16).frame().floor(13);
  L.put(3, 12, "P");
  L.put(6, 11, "f f f");
  L.box(15, 11, 17, 12, "#").put(16, 10, "f");
  L.box(20, 13, 22, 14, ".").put(20, 14, "^^^");
  L.put(30, 12, "x").put(38, 12, "x");
  L.put(28, 10, "------").put(29, 9, "m m m");
  L.box(42, 10, 47, 12, "#").put(43, 9, "n  f");
  L.col(51, 2, 12, "|").box(52, 4, 62, 4, "=").put(54, 3, "c f f f c");
  L.put(56, 12, "a").put(58, 12, "x");
  L.box(64, 13, 70, 13, "~").box(67, 12, 67, 13, "=");
  L.put(76, 12, "x").put(74, 11, "f");
  L.box(80, 12, 82, 12, "#").box(83, 11, 85, 12, "#").box(86, 10, 88, 12, "#").box(89, 9, 96, 12, "#");
  L.put(91, 8, "x").put(90, 6, "f f f");
  /* a hollow under the plateau, walled with fake ground: a trophy for the curious */
  L.box(92, 10, 95, 12, ".").box(96, 10, 96, 12, "%").put(93, 12, "t a");
  L.put(104, 12, "E");
  LEVELS[1] = { name: "Litterbox Landing", theme: "hiss", rows: L.rows(),
    hint: "Arrows walk. Ctrl or Z jumps. Mousels only shove; jump on one to bop it." };
}

/* 2 ---------------------------------------------------------------- */
{
  const L = grid(130, 20).frame().floor(17);
  L.put(3, 16, "P").put(6, 15, "f f");
  L.box(10, 15, 14, 16, "#").box(15, 14, 19, 16, "#").box(20, 15, 23, 16, "#").put(16, 13, "m");
  L.put(25, 16, "a a");
  L.put(30, 13, "-------").put(32, 12, "f f f");
  L.put(38, 10, "-------").put(40, 9, "n c n");
  L.put(36, 16, "B");
  L.box(46, 17, 48, 18, ".").put(46, 18, "^^^");
  L.col(54, 6, 16, "|").box(55, 8, 76, 8, "=").put(58, 7, "f f f f f f").put(72, 7, "x");
  L.put(66, 16, "B").put(60, 16, "a");
  L.put(80, 14, "---").put(84, 11, "---").put(85, 10, "r");
  L.put(92, 16, "O");
  L.box(96, 12, 100, 16, "=").put(98, 11, "c");
  L.put(104, 16, "x");
  L.col(108, 1, 14, "=").col(108, 15, 16, "1");
  L.put(112, 15, "f f f");
  L.put(120, 16, "E");
  LEVELS[2] = { name: "Hairball Hills", theme: "hiss", rows: L.rows(),
    hint: "Barkers charge when they see you. Space or C fires the raygun, if it has a charge." };
}

/* 3 ---------------------------------------------------------------- */
{
  const L = grid(100, 30, "#");
  const carve = (x0, y0, x1, y1) => L.box(x0, y0, x1, y1, "+");
  carve(1, 1, 20, 6);
  carve(21, 3, 41, 6);
  carve(37, 7, 41, 20);
  carve(5, 17, 66, 20);
  carve(67, 13, 80, 20);
  carve(81, 3, 86, 20);
  carve(87, 2, 98, 5);
  L.put(3, 6, "P").put(8, 5, "f f f");
  L.put(14, 6, "x").put(24, 5, "m m").put(30, 6, "x");
  L.col(39, 5, 20, "|");
  L.put(26, 20, "B").put(52, 20, "x").put(45, 19, "a a");
  L.box(30, 21, 32, 21, "^");
  L.box(5, 19, 8, 20, "#").put(6, 18, "y").put(13, 20, "K").put(18, 19, "f f");
  L.box(44, 21, 46, 21, "~");
  L.put(58, 18, "n").put(60, 20, "c");
  L.col(66, 17, 20, "2");
  L.put(70, 19, "f f f").put(76, 20, "*");
  L.put(81, 16, "--").put(85, 11, "--").put(81, 6, "------");
  L.put(82, 15, "m").put(85, 10, "m");
  L.put(91, 5, "f").put(95, 5, "E");
  LEVELS[3] = { name: "Yarn Caves", theme: "hiss", part: 0, rows: L.rows() };
}

/* 4 ---------------------------------------------------------------- */
{
  const L = grid(140, 22).frame().floor(19);
  L.put(3, 18, "P");
  L.box(9, 17, 12, 18, "=").box(13, 16, 16, 18, "=").put(14, 15, "f");
  L.put(24, 18, "T").put(20, 17, "f f f");
  L.box(28, 19, 30, 19, "~");
  L.box(34, 15, 45, 18, "=").put(38, 14, "T").put(36, 13, "m m m");
  L.box(46, 19, 58, 19, "~").put(48, 16, "---").put(53, 14, "---").put(57, 16, "---");
  L.put(54, 13, "c");
  L.put(70, 18, "B").put(64, 18, "a a");
  L.col(78, 6, 18, "|").box(79, 8, 95, 8, "=").put(82, 7, "f x f").put(92, 7, "b");
  L.put(86, 18, "T").put(90, 17, "n");
  L.col(100, 1, 14, "=").col(100, 15, 18, "4");
  L.box(110, 14, 113, 18, "=").put(111, 13, "*");
  L.put(106, 18, "f").put(120, 18, "B").put(124, 17, "m m");
  L.put(132, 18, "E");
  LEVELS[4] = { name: "Frosty Whiskers", theme: "ice", part: 1, ice: true, rows: L.rows(),
    hint: "The ice is slick. Roombots can't be hurt, and they love a ledge." };
}

/* 5 ---------------------------------------------------------------- */
{
  const L = grid(100, 18).frame().floor(15);
  L.put(3, 14, "P");
  L.put(6, 13, "c c c");
  L.box(14, 15, 26, 15, "~").put(15, 12, "--").put(19, 11, "---").put(24, 12, "--");
  L.put(20, 10, "t");
  L.put(30, 14, "x").put(34, 14, "x").put(38, 14, "x");
  L.put(30, 11, "-----------").put(31, 10, "n n n n n");
  L.col(44, 3, 14, "|").box(45, 4, 60, 4, "=").put(46, 3, "c c c c c c c c");
  L.put(50, 14, "a a a").put(56, 14, "x");
  L.box(62, 15, 70, 15, "~").put(64, 12, "--").put(68, 12, "--").put(65, 11, "L");
  L.box(74, 11, 80, 14, "#").put(75, 10, "t").put(76, 14, ".");
  L.put(84, 13, "m m m").put(92, 14, "E");
  LEVELS[5] = { name: "Catnip Gardens", theme: "garden", rows: L.rows() };
}

/* 6 ---------------------------------------------------------------- */
{
  const L = grid(140, 24).frame("=").floor(21, "=");
  L.box(1, 1, 138, 20, "+");
  L.put(3, 20, "P");
  L.put(10, 20, "K").put(7, 19, "f f");
  L.put(16, 18, "----").put(22, 15, "----").put(23, 14, "g");
  L.put(28, 20, "V");
  L.box(34, 17, 40, 20, "=").put(36, 16, "a a");
  L.box(41, 21, 43, 21, "^").put(44, 18, "---").box(47, 21, 49, 21, "^");
  L.col(53, 7, 20, "|").box(54, 9, 72, 9, "=").put(57, 8, "m T m").put(68, 8, "c");
  L.put(64, 20, "V").put(58, 20, "a");
  L.col(76, 1, 16, "=").col(76, 17, 20, "3");
  L.put(80, 20, "K").put(86, 17, "---").put(90, 14, "---").put(91, 13, "r");
  L.put(96, 20, "T");
  L.box(100, 16, 104, 20, "=").put(102, 15, "n");
  L.put(108, 20, "V");
  L.col(114, 1, 16, "=").col(114, 17, 20, "1");
  L.put(118, 20, "f f").put(122, 20, "*").put(130, 20, "E");
  LEVELS[6] = { name: "Vacuumoid Outpost", theme: "fort", part: 2, rows: L.rows(),
    hint: "Vacuumoids take three hits. Clawtanks shrug off the raygun." };
}

/* 7 ---------------------------------------------------------------- */
{
  const L = grid(110, 22).frame().floor(19);
  L.put(3, 18, "P");
  L.box(10, 19, 12, 19, "^").box(16, 19, 18, 19, "^").put(14, 17, "f");
  L.box(13, 18, 15, 18, "#");
  L.put(24, 18, "B").put(30, 18, "B");
  L.put(26, 15, "-----").put(27, 14, "t");
  L.col(36, 4, 18, "|").box(37, 6, 52, 6, "#").put(40, 5, "c K c");
  L.put(48, 5, "L");
  L.box(56, 19, 62, 19, "~").box(59, 17, 59, 19, "#").put(59, 16, "n");
  L.put(66, 18, "K").put(70, 17, "a a");
  L.box(76, 14, 80, 18, "#").put(78, 13, "t");
  L.put(84, 18, "B").put(90, 17, "m m m");
  L.put(100, 18, "E");
  LEVELS[7] = { name: "Scratch Mines", theme: "hiss", rows: L.rows() };
}

/* 8 ---------------------------------------------------------------- */
{
  const L = grid(150, 26).frame("=").floor(23, "=");
  L.box(1, 1, 148, 22, "+");
  L.put(3, 22, "P").put(6, 21, "a a a");
  L.put(14, 22, "V").put(20, 19, "----").put(21, 18, "f f");
  L.box(26, 23, 29, 23, "^").put(27, 20, "--");
  L.put(34, 22, "K").put(40, 22, "T");
  L.box(44, 18, 50, 22, "=").put(46, 17, "y");
  L.col(54, 8, 22, "|").box(55, 10, 70, 10, "=").put(58, 9, "V").put(66, 9, "c c");
  L.put(62, 22, "V").put(68, 22, "a a");
  L.col(74, 1, 18, "=").col(74, 19, 22, "2");
  L.box(80, 23, 84, 23, "^").put(81, 20, "---");
  L.put(90, 22, "K").put(94, 19, "----").put(100, 16, "----").put(101, 15, "b");
  L.put(106, 22, "V");
  L.col(112, 1, 18, "=").col(112, 19, 22, "4");
  /* the Grand Vacuumoid's hall */
  L.box(113, 1, 148, 3, "=");
  L.put(118, 19, "---").put(140, 19, "---");
  L.put(130, 22, "W").put(144, 22, "*");
  L.put(146, 22, "E");
  LEVELS[8] = { name: "The Grand Vacuumoid's Castle", theme: "fort", part: 3, boss: true, rows: L.rows(),
    hint: "The Grand Vacuumoid. Ten hits, they say." };
}

/* the world map ---------------------------------------------------- */
const MAP = [
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~#########~~~",
  "~~~#########~~~~~~~~~~~~~~~~#.......#~~~",
  "~~~#.T..T..#~~~~~~~~~~~~~~~~#..T.8..#~~~",
  "~~~#..5....#~~~~~~~~~~~~~~~~#....,..#~~~",
  "~~~#..,....#~~~~~~~~~~~~~~~~#..T.,..#~~~",
  "~~~#..,,,,.###########~~~~~~#....,..#~~~",
  "~~~#.....,.....T....4#~~~~~~#####C###~~~",
  "~~~#..T..,,,,,,,,,,,,#~~~~~~#....,..#~~~",
  "~~~#.....,.......T...#~~~~~~#....,..#~~~",
  "~~~#.....,....3......#~~~~~~#....,..#~~~",
  "~~~#.....,....,......########....,..#~~~",
  "~~~#.T...,,,,,,,,,,,,,,,B,,,,,,,,,..#~~~",
  "~~~#.....,...........########.6..,7.#~~~",
  "~~~#..T..,.....T.....#~~~~~~#.......#~~~",
  "~~~######A############~~~~~~#.......#~~~",
  "~~~~~~~~#,#~~~~~~~~~~~~~~~~~#.......#~~~",
  "~~~~~~~~#,#~~~~~~~~~~~~~~~~~#########~~~",
  "~~#######,#########~~~~~~~~~~~~~~~~~~~~~",
  "~~#......,........#~~~~~~~~~~~~~~~~~~~~~",
  "~~#.T.2,,,,,,,1.T.#~~~~~~~~~~~~~~~~~~~~~",
  "~~#......,........#~~~~~~~~~~~~~~~~~~~~~",
  "~~#...SS.,....T...#~~~~~~~~~~~~~~~~~~~~~",
  "~~#...SSP,........#~~~~~~~~~~~~~~~~~~~~~",
  "~~#...............#~~~~~~~~~~~~~~~~~~~~~",
  "~~#################~~~~~~~~~~~~~~~~~~~~~",
];
const WORLD = {
  rows: MAP,
  /* where each level's door is drawn as what */
  markers: { 1: "dome", 2: "dome", 3: "cave", 4: "igloo", 5: "gate", 6: "fort", 7: "cave", 8: "castle" },
  /* force fields, and the levels that switch each one off */
  barriers: { A: [2], B: [3, 4], C: [6] },
};

/* checks ----------------------------------------------------------- */
let bad = 0;
const fail = m => { console.error("  error: " + m); bad++; };
for (const [n, lv] of Object.entries(LEVELS)) {
  const w = lv.rows[0].length;
  lv.rows.forEach((r, y) => { if (r.length !== w) fail(`level ${n} row ${y} is ${r.length} wide, want ${w}`); });
  const all = lv.rows.join("");
  const count = c => all.split(c).length - 1;
  if (count("P") !== 1) fail(`level ${n} has ${count("P")} starts`);
  if (count("E") !== 1) fail(`level ${n} has ${count("E")} exits`);
  if (lv.part !== undefined && count("*") !== 1) fail(`level ${n} should hold one ship part`);
  [["1", "r"], ["2", "y"], ["3", "g"], ["4", "b"]].forEach(([d, k]) => {
    if (count(d) && !count(k)) fail(`level ${n} has a ${d} door and no ${k} gem`);
  });
}
/* Can each level be finished? A coarse model of Poom: a standing spot is a
 * clear two-tile column over floor; from one he walks, falls, jumps up to 3
 * tiles and 4 across, or 5 up on the pogo (measured: 3.6 and 6.2), and
 * climbs poles. Keycards open their doors and the pogo stick is picked up
 * along the way, so the search reruns until nothing new opens. Optimistic
 * about tight air paths, never about heights. */
function solve(lv, pogoAtStart) {
  const g = lv.rows.map(r => [...r]), H = g.length, Wd = g[0].length;
  const at = (x, y) => (x < 0 || x >= Wd) ? "#" : (y < 0 ? "." : y >= H ? "." : g[y][x]);
  let keys = new Set(), pogo = pogoAtStart;
  const solid = c => c === "#" || c === "=" || ("1234".includes(c) && !keys.has("1234".indexOf(c)));
  const deadly = c => c === "^" || c === "~";
  const clear = (x, y) => !solid(at(x, y)) && !deadly(at(x, y));
  const floor = (x, y) => solid(at(x, y + 1)) || at(x, y + 1) === "-";
  const stand = (x, y) => clear(x, y) && clear(x, y - 1) && (floor(x, y) || at(x, y) === "|");
  const find = c => { for (let y = 0; y < H; y++) { const x = lv.rows[y].indexOf(c); if (x >= 0) return [x, y]; } return null; };
  /* fall from (x, y) to the first floor, or null into a hazard or out */
  const fall = (x, y) => { for (let yy = y; yy < H; yy++) { if (!clear(x, yy)) return null; if (floor(x, yy) || at(x, yy) === "|") return [x, yy]; } return null; };
  const colClear = (x, y0, y1) => { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) if (!clear(x, y)) return false; return true; };
  const rowClear = (x0, x1, y) => { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) if (!clear(x, y) || !clear(x, y - 1)) return false; return true; };
  function reach(sx, sy) {
    const seen = new Set([sx + "," + sy]), q = [[sx, sy]];
    const add = s => { if (s && !seen.has(s[0] + "," + s[1])) { seen.add(s[0] + "," + s[1]); q.push(s); } };
    while (q.length) {
      const [x, y] = q.shift();
      const onPole = at(x, y) === "|";
      for (const d of [-1, 1]) if (clear(x + d, y) && clear(x + d, y - 1)) add(fall(x + d, y));
      if (onPole) { if (at(x, y - 1) === "|" && clear(x, y - 2)) add([x, y - 1]); if (at(x, y + 1) === "|" || floor(x, y) === false) add(fall(x, y + 1)); }
      if (at(x, y + 1) === "|") add([x, y + 1]);
      if (at(x, y + 1) === "-") add(fall(x, y + 1));
      const rise = onPole ? 2 : pogo ? 5 : 3;
      for (let dx = -4; dx <= 4; dx++) for (let up = 0; up <= rise; up++) {
        const ty = y - up, tx = x + dx;
        if (!colClear(x, y, ty - 1)) break;
        if (!rowClear(x, tx, ty)) continue;
        add(fall(tx, ty));
      }
    }
    return seen;
  }
  const [px, py] = find("P");
  for (let round = 0; round < 6; round++) {
    const seen = reach(px, py);
    let changed = false;
    for (const [c, k] of [["r", 0], ["y", 1], ["g", 2], ["b", 3]]) {
      const s = find(c);
      if (s && !keys.has(k) && [...seen].some(v => { const [x, y] = v.split(",").map(Number); return Math.abs(x - s[0]) <= 0 && y - s[1] >= 0 && y - s[1] <= 1; })) { keys.add(k); changed = true; }
    }
    const o = find("O");
    if (o && !pogo && seen.has(o[0] + "," + o[1])) { pogo = true; changed = true; }
    if (!changed) {
      const got = c => { const s = find(c); return !s || seen.has(s[0] + "," + s[1]) || seen.has(s[0] + "," + (s[1] + 1)); };
      return { exit: got("E"), part: got("*"), pogo: got("O"), from: (c, to) => { const s = find(c); if (!s) return true; const r = reach(s[0], s[1]); const t = find(to); return r.has(t[0] + "," + t[1]); } };
    }
  }
}
for (const [n, lv] of Object.entries(LEVELS)) {
  const s = solve(lv, +n > 2);
  if (!s.exit) fail(`level ${n}: the exit can't be reached`);
  if (!s.part) fail(`level ${n}: the ship part can't be reached`);
  if (!s.pogo) fail(`level ${n}: the pogo stick can't be reached`);
  if (lv.part !== undefined && !s.from("*", "E")) fail(`level ${n}: no way from the ship part to the exit`);
}

const mw = MAP[0].length;
MAP.forEach((r, y) => { if (r.length !== mw) fail(`map row ${y} is ${r.length} wide, want ${mw}`); });
for (let i = 1; i <= 8; i++) if (MAP.join("").split(String(i)).length !== 2) fail(`map has no single marker for level ${i}`);

/* every level marker and the ship reachable from the start, with every
 * force field off; and no level beyond a field reachable with it on */
function reach(open) {
  const H = MAP.length, W = mw, seen = new Set();
  let sy = MAP.findIndex(r => r.includes("P")), sx = MAP[sy].indexOf("P");
  const q = [[sx, sy]]; seen.add(sx + "," + sy);
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, c = (MAP[ny] || "")[nx];
      if (c === undefined || "#~T".includes(c) || (/[ABC]/.test(c) && !open.includes(c))) continue;
      const k = nx + "," + ny;
      if (!seen.has(k)) { seen.add(k); q.push([nx, ny]); }
    }
  }
  const at = ch => { const y = MAP.findIndex(r => r.includes(ch)); return seen.has(MAP[y].indexOf(ch) + "," + y); };
  return at;
}
const full = reach(["A", "B", "C"]);
for (let i = 1; i <= 8; i++) if (!full(String(i))) fail(`level ${i} is unreachable on the map`);
if (!full("S")) fail("the ship is unreachable");
const none = reach([]);
if (!none("1") || !none("2")) fail("levels 1 and 2 must be open from the start");
if (none("3") || none("4") || none("5")) fail("force field A leaks");
const a = reach(["A"]);
if (a("6") || a("8")) fail("force field B leaks");
const ab = reach(["A", "B"]);
if (ab("8")) fail("force field C leaks");

if (bad) { console.error(`\n${bad} problem(s); js/levels.js not written`); process.exit(1); }

const out = "/* Commander Poom -- the world map and the levels. Written by\n" +
  " * tools/build-levels.js, whose header has the legend; hand edits are fine\n" +
  " * but rerunning the builder overwrites them. */\n\"use strict\";\n\n" +
  "const WORLD = " + JSON.stringify(WORLD, null, 1).replace(/\n\s*("[^"]*",?)/g, "\n  $1") + ";\n\n" +
  "const LEVELS = {\n" + Object.entries(LEVELS).map(([n, lv]) => {
    const { rows, ...meta } = lv;
    return "  " + n + ": {\n" + Object.entries(meta).map(([k, v]) => "    " + k + ": " + JSON.stringify(v) + ",\n").join("") +
      "    rows: [\n" + rows.map(r => "      " + JSON.stringify(r) + ",\n").join("") + "    ],\n  },\n";
  }).join("") + "};\n";
fs.writeFileSync(path.join(__dirname, "..", "js", "levels.js"), out);
console.log(`wrote js/levels.js: ${Object.keys(LEVELS).length} levels and the map`);
