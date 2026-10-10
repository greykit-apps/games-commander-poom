#!/usr/bin/env node
/*
 * Transcribes the mapbuilder maps (maps2/<book>/<id>.json; maps2/README.md
 * describes them) into Poom's glyph set, one file per book:
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
 *     P  start        E  exit door      X  map-edge exit (walk into it)
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
 * `things` ([x, y, glyph, name]), `marks` ([x, y, name]), `links` (warp
 * doors and switches: [x, y, targetX, targetY, "door" | "switch"]), and
 * `ends` ([x, y, glyph, name, "rescue" | "objective"]): the things whose
 * rescue or collection finishes the level. `completion` is the source's
 * list of ways the level ends: exit_tile, map_edge, rescue, objective.
 *
 * Switches and key sockets are worked out from the raw tiles (E2 only):
 *   sockets  [{ x, y, gem, door: [[x, y]...] }]  a socket's colour comes from
 *            its tile (7 red, 8 yellow, 9 blue, 10 green); its door is the
 *            column of door tiles from its target down, written 5 6 7 8 (red
 *            yellow green blue) in the rows. The foot of such a column the
 *            maps call X; it is door, not exit.
 *   bridges  [{ x, y, deck: [[x, y]...], on }]  a bridge switch (tile 15)
 *            toggles the bridge whose second tile is its target: the deck
 *            in the row below, from the target to the bridge's end. `on` is
 *            whether it starts out solid (58 of 61 do).
 *   pswitches [{ x, y, tx, ty }]  a platform switch (tile 5) toggles the
 *            platform marker (blocker or path arrow) at its target.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const MAPS = path.join(ROOT, "maps2");
const OUT = path.join(ROOT, "js", "books");

const PLAIN = { " ": ".", "#": "#", "-": "-", "|": "|", "^": "^", "~": "~", "@": "P",
  "/": "/", "\\": "\\", "%": "i", "<": "<", ">": ">", "S": "S", "T": "Q", "O": "j", "?": "H",
  "e": "e", "g": "G", "n": "N", "p": "M", "*": "Z", "L": "l", "!": "!" };
const POINTS = { 100: "f", 200: "m", 500: "n", 1000: "c", 2000: "u", 5000: "t" };
const KEY = { red: "r", yellow: "y", green: "g", blue: "b" };

/* what each glyph beyond the original game's needs from the engine */
const NEEDS = {
  "/": "slopes rising right", "\\": "slopes falling right", i: "ice / slippery floor", "<": "conveyor left", ">": "conveyor right",
  S: "switches (bridge and platform switches)", Q: "teleporters (world maps)", j: "key sockets (and the doors they open: 5 6 7 8)", H: "hint triggers", D: "warp doors",
  d: "locked doors (colour absent from the source)", q: "keycards with no stated colour", u: "2000-point pickup (medal)",
  w: "swim ability", "!": "objective items (collected, or shot)", e: "enemies (per-type behaviour: ENEMY_OF in game.js; Book 1 only so far)", G: "turrets / emitters",
  N: "NPCs / rescue targets", M: "moving platforms (paths, dropping, sneaky)", Z: "special objects", l: "world-map level entrances",
  "(": "one-way wall: blocks going left", ")": "one-way wall: blocks going right",
  z: "pulsing hazard: a deadly column that comes and goes",
};

/* deadly columns a level can't be crossed without: they must come and go.
 * Set E's three-tile column (tiles 1838, 1856, 1874) spans E13's corridors
 * floor to ceiling, and walls in E15's keycard pocket */
/* walls opened by hand, per map: [x, y] */
const OPEN_TILES = {
  /* D16: the tunnel along row 87 under (38-39, 86) was one tile high,
     and the way right out of the pocket at (30-32, 114-115), under (32-33, 113) */
  D16: [[38, 86], [39, 86], [32, 113], [33, 113]],
};

/* signs added by hand, per map: [x, y], the text in the Book's signs */
const ADD_SIGNS = {
  /* E07: the drop to the first keycard is a leap of faith */
  E07: [[37, 38]],
};

/* hazards taken out by hand, per map: [x, y] */
const CLEAR_HAZARDS = {
  /* the spikes either side of C17's heartstone */
  C17: [[64, 14], [68, 14]],
  /* the fires beside D16's lower exit */
  D16: [[120, 113], [120, 115]],
};

const PULSE_TILES = { E: new Set([1838, 1856, 1874]) };

const GEM_OF_SOCKET = { 7: 0, 8: 1, 9: 3, 10: 2 };   /* red yellow blue green -> Poom's r y g b order */

/* sockets and bridges, from the raw tiles; edits rows in place */
function switchesOf(d, rows) {
  const out = { sockets: [], bridges: [], pswitches: [] };
  if (d.engine !== "E2") return out;
  const raw = JSON.parse(fs.readFileSync(path.join(MAPS, d.set, d.map + ".raw.json"), "utf8"));
  const fg = raw.planes.foreground, tp = raw.tile_properties;
  const intile = (x, y) => ((tp[fg[y][x]] || {}).intile || 0) & 127;
  const put = (x, y, g) => { rows[y] = rows[y].slice(0, x) + g + rows[y].slice(x + 1); };
  /* a run of one family of tiles: non-empty, each id close to the last */
  const run = (x, y, dx, dy, ok) => {
    const cells = [];
    for (let px = x, py = y, prev = null; py < d.height && px < d.width; px += dx, py += dy) {
      const t = fg[py][px];
      if (!t || (prev !== null && Math.abs(t - prev) > 18 && !ok(px, py))) break;
      cells.push([px, py]); prev = t;
    }
    return cells;
  };
  for (const e of d.entities) {
    if (e.kind !== "switch_link") continue;
    const kind = intile(e.x, e.y), [tx, ty] = e.target;
    if (GEM_OF_SOCKET[kind] !== undefined) {
      const gem = GEM_OF_SOCKET[kind], door = run(tx, ty, 0, 1, () => false);
      for (const [x, y] of door) put(x, y, String(5 + gem));
      out.sockets.push({ x: e.x, y: e.y, gem, door });
    } else if (kind === 5) {
      out.pswitches.push({ x: e.x, y: e.y, tx, ty });
    } else if (kind === 15) {
      const ti = intile(tx, ty);
      const top = run(tx, ty, 1, 0, (x, y) => ti && intile(x, y) === ti);
      /* a bridge can start out or in: its deck is solid in the rows or not */
      const deck = top.map(([x, y]) => [x, y + 1]).filter(([x, y]) => y < d.height);
      out.bridges.push({ x: e.x, y: e.y, deck, on: deck.some(([x, y]) => rows[y][x] === "#") });
    }
  }
  return out;
}

/* E1 maps (books C, D, H) keep their pickups and fixtures as tiles, told
 * apart by the tile's behaviour, not as named objects. Keys 18-21 open
 * doors 2-5, in that order; the colours are a guess (yellow, red, green,
 * blue), the pairing is not. */
const E1_KEY = { 18: "y", 19: "r", 20: "g", 21: "b" };
const E1_POINTS = { 6: "f", 7: "m", 8: "n", 9: "c", 10: "t" };
const E1_DOOR = { 2: "2", 3: "1", 4: "3", 5: "4" };   /* Poom's doors: 1 red 2 yellow 3 green 4 blue */

/* Teleporters the data can't link: E1 maps number their objects, with no
 * targets. On H01, 38 and 41 are the only way between the start region and
 * the main one, so they are a pair. 46 is the only way off the island where
 * H15 is; it goes back to H14, the level whose teleporter leads to H15. */
const TELE_PAIRS = { H01: [[38, 41]] };
const TELE_TO_LEVEL = { H01: [[46, "H14"]] };

/* Secret exits: a level whose in-level teleporter (Q) leads to another,
 * which is then optional for finishing the book. H14's teleporter is the
 * only way to H15, on its island; the map maker can confirm. */
const SECRET_EXITS = { H14: "H15" };

/* The ship on an E1 world map: the object the map numbers 20 (on H01, by
 * the start). Recorded as ship: [x, y], its left tile; walkable. Its parts
 * are the E1 objective items, types 01-04. */
const SHIP = { H01: 20 };

/* Set D's world map (E1) carries its own wiring in the sprite plane, in the
 * Keen engine's codes. 0x0Fab is a teleporter: a is its own number, b the
 * number of the one it sends you to. 0x2000 is a ferry's route over the
 * water, 0x2100 a stop on it, 0x2200 a landing where it can be boarded.
 * Read out as teleporters (Q, with links) and a `ferry`: { path, landings }.
 * Where a map has a ferry, its water is all the open sea: the clear margin
 * round the drawn circle of it is filled in too. */
function e1Wiring(d, rows) {
  if (d.engine !== "E1" || d.kind !== "world") return null;
  const raw = JSON.parse(fs.readFileSync(path.join(MAPS, d.set, d.map + ".raw.json"), "utf8")), spr = raw.planes.sprites;
  const teles = {}, path_ = [], landings = [];
  spr.forEach((row, y) => row.forEach((v, x) => {
    if ((v & 0xff00) === 0x0f00) teles[(v >> 4) & 15] = { x, y, to: v & 15 };
    else if (v === 0x2000 || v === 0x2100) path_.push([x, y]);
    else if (v === 0x2200) landings.push([x, y]);
  }));
  const put = (x, y, g) => { rows[y] = rows[y].slice(0, x) + g + rows[y].slice(x + 1); };
  const links = [];
  for (const t of Object.values(teles)) {
    const to = teles[t.to];
    if (!to) throw new Error(`${d.map}: teleporter at ${t.x},${t.y} goes to ${t.to}, which isn't there`);
    put(t.x, t.y, "Q"); links.push([t.x, t.y, to.x, to.y, "door"]);
  }
  let ferry = null;
  if (path_.length && landings.length) {
    ferry = { path: path_, landings };
    /* the margin: clear ground joined to the map's edge is sea as well */
    const seen = new Set(), q = [];
    const at = (x, y) => x >= 0 && y >= 0 && x < d.width && y < d.height;
    for (let x = 0; x < d.width; x++) q.push([x, 0], [x, d.height - 1]);
    for (let y = 0; y < d.height; y++) q.push([0, y], [d.width - 1, y]);
    while (q.length) {
      const [x, y] = q.pop(), k = x + "," + y;
      if (!at(x, y) || seen.has(k) || rows[y][x] !== ".") continue;
      seen.add(k); put(x, y, "#");
      q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  }
  return { links, ferry };
}

/* Set E's world map (E2) keeps one level off the map's bottom edge: below
 * the camera's limit (row 59) is a strip of tiles the game swaps in to make
 * E10 fade in and out, a mirage. Its entrance is placed where the mirage
 * shows, beside its done-flag (19, 22), as the map's other entrances sit
 * beside theirs, and the strip is cleared. The map's special object at
 * (13, 19) is what carries the player to E15's sealed pocket, a secret
 * level: a pair of teleporters, there and back. */
const MOVE_ENTRANCE = { E01: { id: "E10", to: [16, 21], below: 59 } };
const SECRET_RIDE = { E01: { at: [13, 19], to: [30, 55], back: [31, 55], level: "E15" },
  /* Set A's A14 sits in a walled room with a "player arrival point" (72,
   * 51): in the original, a secret exit in some level brings the player
   * there, and the room's own teleporter (69, 51) leads back out. Which
   * level's exit it was isn't in the data, so a pad just outside the room's
   * west wall leads in instead (no way back needed). */
  A01: { at: [62, 51], to: [72, 51], back: null, level: "A14" } };

/* Switches on an older-engine (E1) level are of three kinds, told apart by
 * the tile's behaviour and the value under it in the sprite plane:
 *   behaviour 25 with a value: a bridge switch. The value is the offset to
 *     the bridge's first tile (low byte x, high byte y, both signed); the
 *     deck runs on from there, away from the switch, over open air to the
 *     first solid tile. Set C's C06 needs its bridge to cross a spike pit.
 *   behaviour 25 with no value: a trap (the levers by set C's heartstones).
 *   behaviour 23: does nothing harmful (a light switch, most likely): a
 *     switch with no deck.
 * Bridges start out off. Returns the bridge list; a trap is left as S. */
function e1Switches(d, rows) {
  if (d.engine !== "E1" || d.kind !== "level") return [];
  const raw = JSON.parse(fs.readFileSync(path.join(MAPS, d.set, d.map + ".raw.json"), "utf8"));
  const tp = raw.tile_properties, t = raw.planes.tiles, spr = raw.planes.sprites;
  const s8 = v => v > 127 ? v - 256 : v, out = [];
  rows.forEach((r, y) => [...r].forEach((c, x) => {
    if (c !== "S") return;
    const b = (tp[t[y][x]] || {}).behavior, v = spr[y][x];
    if (b === 25 && v) {
      const dx = s8(v & 255), dy = s8(v >> 8), ty = y + dy, step = dx >= 0 ? 1 : -1, deck = [];
      for (let cx = x + dx; cx >= 0 && cx < d.width && rows[ty][cx] !== "#" && deck.length < 40; cx += step) deck.push([cx, ty]);
      out.push({ x, y, deck, on: false });
    } else if (b === 23) out.push({ x, y, deck: [], on: false });
  }));
  return out;
}

function convert(d) {
  const at = new Map();
  for (const e of d.entities) at.set(e.x + "," + e.y, e);
  const things = [], marks = [], rows = [];
  let e1 = null, e1solid = null, e1glyph = null, e1side = null, pulse = null, e2glyph = null;
  if (d.engine === "E2") {
    const raw = JSON.parse(fs.readFileSync(path.join(MAPS, d.set, d.map + ".raw.json"), "utf8")), fg = raw.planes.foreground;
    if (PULSE_TILES[d.set]) pulse = (x, y) => PULSE_TILES[d.set].has(fg[y][x]);
    e2glyph = (x, y) => (raw.tile_properties[fg[y][x]] || {}).glyph;
  }
  if (d.engine === "E1") {
    const raw = JSON.parse(fs.readFileSync(path.join(MAPS, d.set, d.map + ".raw.json"), "utf8"));
    const prop = (x, y) => raw.tile_properties[raw.planes.tiles[y][x]] || {};
    e1 = (x, y) => prop(x, y).behavior;
    e1solid = (x, y) => { const t = prop(x, y); return !!(t.top && t.bottom && t.left && t.right); };
    e1glyph = (x, y) => prop(x, y).glyph;
    /* a wall solid on one side only: a one-way passage. "right" is solid to
       something coming from the right, so it blocks going left: ( ; "left"
       blocks going right: ) . Set D has 60 (D13's start room is shut but
       for one) */
    e1side = (x, y) => { const t = prop(x, y); return t.top || t.bottom ? null : t.right && !t.left ? "(" : t.left && !t.right ? ")" : null; };
  }
  for (let y = 0; y < d.height; y++) {
    let row = "";
    for (let x = 0; x < d.width; x++) {
      const c = d.grid[y][x], e = at.get(x + "," + y);
      let g;
      /* E1 points are tiles told apart by behaviour, 6-10: taken as the
         five tiers in order, lowest first (the source doesn't say) */
      if (c === "$" && e1 && E1_POINTS[e1(x, y)]) g = E1_POINTS[e1(x, y)];
      else if (c === "$") g = POINTS[(e && /points (\d+)/.exec(e.name) || [])[1]] || "f";
      else if (c === "+") g = !e ? "a" : /extra life/.test(e.name) ? "L" : /swim/.test(e.name) ? "w" : "a";
      else if (c === "k" && e1 && E1_KEY[e1(x, y)]) g = E1_KEY[e1(x, y)];
      else if (c === "k") g = !e ? "q" : KEY[(/\((\w+)\)/.exec(e.name) || [])[1]] || "q";
      else if (c === "D" && e1 && E1_DOOR[e1(x, y)]) g = E1_DOOR[e1(x, y)];
      else if (c === "D") g = d.entities.some(t => t.kind === "door_link" && Math.abs(t.x - x) <= 1 && Math.abs(t.y - y) <= 1) ? "D" : "d";
      /* an X in the outer two columns is the map's edge: walking out there
         ends the level. Anywhere else it is an exit door */
      else if (c === "X") g = x < 2 || x >= d.width - 2 ? "X" : "E";
      /* E1's behaviour 22 is a sign only where it can be walked through: set
         C builds walls and steps out of solid tiles that carry it too */
      else if (c === "?" && e1solid && e1solid(x, y)) g = "#";
      else if (c === "#" && e1side && e1side(x, y)) g = e1side(x, y);
      else if (c === "^" && pulse && pulse(x, y)) g = "z";
      else g = PLAIN[c];
      if (g === undefined) throw new Error(`${d.map}: no mapping for '${c}' at ${x},${y}`);
      /* E1 keeps a pickup as a tile, so a creature standing on one hides it
         in the grid (a key in each of D05 and D10, points and power-ups in
         C03, C09, D02, D06, D10, H09, H15): the creature goes in things, the
         pickup back in the row */
      let under = null;
      if (e1glyph && c === "e") {
        const tg = e1glyph(x, y);
        if (tg === "k") under = E1_KEY[e1(x, y)] || "q";
        else if (tg === "$") under = E1_POINTS[e1(x, y)] || "f";
        else if (tg === "+") under = "a";
      }
      /* the ground a creature stands in is in the grid as the creature too:
         walls, ledges and poles come back. Hazards don't: a spike under a
         creature was never one a player met, and putting it back adds a
         hazard the level never had (C17's shaft) */
      const tg = c === "e" && (e1glyph || e2glyph) ? (e1glyph || e2glyph)(x, y) : null;
      if (!under && tg && "#-|".includes(tg)) under = tg;
      row += under || g;
      if (e && "eGNMZl!P".includes(g)) things.push([x, y, g, e.name]);
      /* E1 tile objects have no entity: name them from their behaviour */
      else if (e1 && !e && c === "!") things.push([x, y, g, "objective type " + String(e1(x, y) - 10).padStart(2, "0")]);
      else if (e1 && !e && c === "T") things.push([x, y, g, "teleporter (in the level)"]);
    }
    rows.push(row);
  }
  /* a sign standing on a deadly floor tile (both of set C's do) gets a
     safe floor instead, so it can be walked up to and read */
  for (let y = 0; y + 1 < rows.length; y++) for (let x = 0; x < rows[y].length; x++)
    if (rows[y][x] === "H" && rows[y + 1][x] === "^") rows[y + 1] = rows[y + 1].slice(0, x) + "#" + rows[y + 1].slice(x + 1);
  for (const [x, y] of ADD_SIGNS[d.map] || []) if (rows[y][x] === ".") rows[y] = rows[y].slice(0, x) + "H" + rows[y].slice(x + 1);
  for (const [x, y] of OPEN_TILES[d.map] || []) if (rows[y][x] === "#") rows[y] = rows[y].slice(0, x) + "." + rows[y].slice(x + 1);
  for (const [x, y] of CLEAR_HAZARDS[d.map] || []) if ("^z".includes(rows[y][x])) rows[y] = rows[y].slice(0, x) + "." + rows[y].slice(x + 1);
  const links = [], ends = [];
  for (const e of d.entities) {
    if (MOVE_ENTRANCE[d.map] && e.y >= MOVE_ENTRANCE[d.map].below) continue;
    if (e.kind === "door_link" || e.kind === "marker" || e.kind === "unknown") marks.push([e.x, e.y, e.name]);
    if (e.target) links.push([e.x, e.y, e.target[0], e.target[1], e.kind === "door_link" ? "door" : "switch"]);
    /* the grid shows one object per tile, so these come from the entities */
    if (e.ends_level) ends.push([e.x, e.y, e.kind === "npc" ? "N" : e.kind === "powerup" ? "w" : e.glyph === "L" ? "l" : "!", e.name, e.ends_level]);
  }
  /* E1 world teleporters: paired ones get links both ways; all become Q */
  const num = n => things.find(t => t[3] === "entrance to unlisted map " + n);
  const asTele = t => { rows[t[1]] = rows[t[1]].slice(0, t[0]) + "Q" + rows[t[1]].slice(t[0] + 1); t[2] = "Q"; t[3] = t[3].replace("entrance to unlisted map", "teleporter"); };
  for (const [a, z] of TELE_PAIRS[d.map] || []) {
    const ta = num(a), tz = num(z);
    if (!ta || !tz) throw new Error(`${d.map}: no teleporters ${a} and ${z}`);
    links.push([ta[0], ta[1], tz[0], tz[1], "door"], [tz[0], tz[1], ta[0], ta[1], "door"]);
    asTele(ta); asTele(tz);
  }
  for (const [n, lvl] of TELE_TO_LEVEL[d.map] || []) {
    const t = num(n), e = things.find(t => t[3] === "entrance to " + lvl);
    if (!t || !e) throw new Error(`${d.map}: no teleporter ${n} or entrance to ${lvl}`);
    links.push([t[0], t[1], e[0], e[1], "door"]);
    asTele(t);
  }
  let ship = null;
  if (SHIP[d.map]) {
    const tiles = things.filter(t => t[3] === "entrance to unlisted map " + SHIP[d.map]);
    if (!tiles.length) throw new Error(`${d.map}: no ship (object ${SHIP[d.map]})`);
    for (const t of tiles) { rows[t[1]] = rows[t[1]].slice(0, t[0]) + "." + rows[t[1]].slice(t[0] + 1); t[2] = "."; t[3] = "ship"; }
    ship = [Math.min(...tiles.map(t => t[0])), Math.min(...tiles.map(t => t[1]))];
  }
  const mv = MOVE_ENTRANCE[d.map];
  if (mv) {
    const old = things.filter(t => t[3] === "entrance to " + mv.id);
    if (!old.length) throw new Error(`${d.map}: no entrance to ${mv.id} to move`);
    for (const t of old) rows[t[1]] = rows[t[1]].slice(0, t[0]) + "#" + rows[t[1]].slice(t[0] + 1);
    rows.splice(mv.below);
    for (let i = things.length - 1; i >= 0; i--) if (things[i][1] >= mv.below || things[i][3] === "entrance to " + mv.id) things.splice(i, 1);
    const [x0, y0] = mv.to;
    for (const [x, y] of [[x0, y0], [x0 + 1, y0], [x0, y0 + 1], [x0 + 1, y0 + 1]]) {
      if (rows[y][x] !== ".") throw new Error(`${d.map}: ${mv.id}'s new entrance at ${x},${y} isn't open ground`);
      rows[y] = rows[y].slice(0, x) + "l" + rows[y].slice(x + 1); things.push([x, y, "l", "entrance to " + mv.id]);
    }
  }
  const ride = SECRET_RIDE[d.map];
  if (ride) {
    for (const [x, y] of [ride.at, ride.back].filter(Boolean)) {
      if (!"./Z".includes(rows[y][x]) && rows[y][x] !== "Q") throw new Error(`${d.map}: no room for a teleporter at ${x},${y}`);
      rows[y] = rows[y].slice(0, x) + "Q" + rows[y].slice(x + 1);
    }
    for (const t of things) if (t[0] === ride.at[0] && t[1] === ride.at[1]) { t[2] = "Q"; t[3] = "teleporter (the secret ride)"; }
    links.push([...ride.at, ...ride.to, "door"]);
    if (ride.back) links.push([...ride.back, ...ride.at, "door"]);
  }
  const { sockets, bridges, pswitches } = switchesOf(d, rows);
  bridges.push(...e1Switches(d, rows));
  const wiring = e1Wiring(d, rows), ferry = wiring && wiring.ferry;
  if (wiring) links.push(...wiring.links);
  /* a level whose player starts swimming is under water throughout */
  const swim = d.entities.some(e => e.kind === "player" && /swimming/.test(e.name));
  const secret = SECRET_EXITS[d.map];
  if (secret && !rows.some(r => r.includes("Q"))) throw new Error(`${d.map}: a secret exit to ${secret} but no teleporter`);
  return { id: d.map, kind: d.kind, engine: d.engine, w: d.width, h: rows.length, completion: d.completion, notes: d.notes, rows, things, marks, links, ends, sockets, bridges, pswitches, ...(swim ? { swim } : {}), ...(secret ? { secret } : {}), ...(ship ? { ship } : {}), ...(ferry ? { ferry } : {}), ...(ride ? { secrets: [ride.level] } : {}) };
}

/* the ones game.js handles; keep in step with it */
const DONE = new Set(["/", "\\", "i", "<", ">", "d", "q", "u", "l", "!", "D", "j", "S", "M", "Q", "w", "e", "G", "(", ")", "z"]);

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
    `/* Book ${book}: transcribed from maps2/${book}/ by tools/transcribe-maps.js. See ENGINE-SUPPORT.md. */\n` +
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
- How a level ends comes from the source's \`completion\` list (maps2/README.md, *Level completion*). \`exit_tile\`: an \`X\` away from the map edge becomes \`E\`, an exit door; walking into any \`E\` tile finishes the level, and each group of them is drawn as one door standing on the floor below it. \`map_edge\`: an \`X\` in the outer two columns stays \`X\`, unseen; walking into one finishes the level. \`objective\`: the level's \`ends\` objectives (\`!\`, and the two swim-ability pickups flagged as ending E and I levels) are picked up by touch or destroyed by a shot, and the last one finishes the level. \`rescue\`: touching an \`ends\` NPC finishes the level. Falling out of the bottom still kills.
- Warp doors (\`D\`): standing in front of one, ↑ takes Poom to its link's target, with his feet in the target tile (nudged up if that tile has no room). Each \`D\` tile has its own target, so each half of a door leads to its own half of the arrival. Door links that sit on anything but a \`D\` (107 of them: on blocks, ledges and air) are no door and are ignored.
- Moving platforms (\`M\`, kind from \`things\`): two tiles wide, stood on from above, jumped through from below, and they carry their rider; down + jump drops off one. *Fixed-direction* and the E1 *horizontal/vertical* ones go to and fro at 1 px a tick, turning back when their own (top-left) tile reaches a \`Platform blocker\` mark or their leading edge meets a wall. *Arrow-guided* ones take the direction of the \`Platform path arrow\` on each tile they reach, and wait at a blocker; a platform's own starting tile holds no arrow in the source (one object a cell), so its start direction stands in. 129 of 135 come back round to their start. *Dropping* ones sink under a rider and rise back when left; *sneaky* ones slide two tiles away when Poom jumps at them and drift back; *static* ones stay put. Platform switches (\`pswitches\`, ↑ at the switch) toggle the blocker or arrow at their target.
- Teleporters (\`Q\`) are world-map things: 35 of the 37 are on the maps of books A, B, F and G. Standing on one with a link, jump or fire goes to its target (the open tile nearest it, if the target is blocked); it is a press, not a touch, because most targets are themselves teleporters. The unlinked ones (A01 and G01's top rows, and two in level H14) are drawn and do nothing.
- Swimming: the swim ability (\`w\`, in E10 and I10, where collecting it also ends the level) lets Poom swim for the rest of that book. On the world maps, \`~\` shoreline is water: it blocks him until he can swim, which is what keeps E16–E18 and I08, I18 out of reach. Levels whose player starts swimming (\`swim: true\`: E18, I17, I18) are under water throughout: Poom moves freely in all four directions, drifts, sinks slowly, strokes up with jump, and has no pogo or raygun.
- The ship (\`ship\` on a world map, from \`SHIP\`): Book H's map has one, by the start. Its four parts are the E1 objective items (types 01–04, in H05, H04, H09, H17); picked up, they go with Poom until he takes them to the ship, and with all four aboard the book is done. A book with a ship ends there, not by finishing every level.
- Secret exits (\`secret\` on a level, from \`SECRET_EXITS\`): touching the level's in-level teleporter (\`Q\`) finishes it and starts the secret level, which isn't needed to finish the book. H14's teleporter leads to H15; afterwards Poom is on H15's island, whose teleporter (46) takes him back to H14.
- E1 world maps (books C, D, H) number their objects instead of linking them: 1–16 are levels; the rest are the map's own (on H01: 20, by the start, probably the ship; 38, 41 and 46, teleporters). An unfinished level there is a wall, and Poom enters it by walking up to it; done, it is open ground. That is what orders Book H: H02, then H03–H08, then H09–H17. The data gives no teleporter targets: \`TELE_PAIRS\` in game.js pairs H01's 38 and 41, the only way from its start region to its main one. 46 is on an island with H15, Book H's secret level, and waits for the map maker.
- The ledge (\`-\`), pole (\`|\`) and spikes (\`^\`) are used as the engine already has them.
- Pulsing hazards (\`z\`): set E's three-tile spike column (\`PULSE_TILES\`), which spans corridors that must be crossed (E13, E15). Deadly for 60 ticks, gone for 60, then flickers for 30 before it's back; the first time Poom is near, a toast says so.
- On E2 maps a platform's deck is 8 px down its cell (\`sink\`): E15 and G11 run platforms under ceilings two tiles up. Poom's hazard box starts 8 px below his top, so spikes at head height beside a warp door (E15) don't kill him on the first step out.

## Per book

`;
for (const [book, per, skipped] of report) {
  md += `### Book ${book}\n\nSkipped (not levels): ${skipped.map(s => s.id + " " + s.kind).join(", ") || "none"}\n\n| Map | Kind | Size | Glyphs beyond the original game (count) |\n|---|---|---|---|\n`;
  for (const [id, kind, w, h, used] of per) md += `| ${id} | ${kind} | ${w}×${h} | ${Object.entries(used).map(([g, n]) => "`" + g + "` " + n).join(", ") || "none"} |\n`;
  md += "\n";
}
fs.writeFileSync(path.join(ROOT, "ENGINE-SUPPORT.md"), md);
console.log("wrote", report.length, "books; unsupported totals", total);
