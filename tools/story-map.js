#!/usr/bin/env node
/*
 * Writes a book's story map: where in its world and levels the story has to
 * say something, so the script can be written to lead up to it.
 *
 *   node tools/story-map.js A        writes docs/story/book-A.md
 *
 * Reads js/books/<book>.js (run tools/transcribe-maps.js first). Positions
 * are tiles, (x, y) from the top left. "Early / middle / late" is how far
 * along a rough path from the start a thing is: walking, jumps of up to
 * five tiles (the pogo), falls, poles and warp doors, with key doors open,
 * bridges either way, and a moving platform's whole route counted as floor.
 * Where that rough path doesn't reach, the guess is from straight-line
 * distance to the start, marked "≈".
 * On the world map, / and \ are diagonal walls, as maps2/README.md says
 * and the game has them; here a whole slope tile counts as wall, which
 * gives Book A the same order of play as the game's half-tile walls.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const book = (process.argv[2] || "A").toUpperCase();
global.window = global; global.BOOKS = {};
require(path.join(ROOT, "js", "books", book + ".js"));
const B = BOOKS[book];
const LEVELS = B.chapters.flatMap(c => c.levels);
const byId = Object.fromEntries(LEVELS.map(l => [l.id, l]));

const SOLID = new Set(["#", "1", "2", "3", "4", "5", "6", "7", "8", "d", "i", "<", ">"]);
const GEMS = ["red", "yellow", "green", "blue"];
const KEYCH = { r: "red", y: "yellow", g: "green", b: "blue", q: "uncoloured" };
const num = id => +id.slice(1) - 1;
/* the book's number in play, from game.js's BOOK_ORDER */
const ORDER = JSON.parse(/const BOOK_ORDER = (\[[^\]]*\])/.exec(fs.readFileSync(path.join(ROOT, "js", "game.js"), "utf8"))[1]);
const BOOKNUM = ORDER.indexOf(book) + 1;
const name = id => `${id} (level ${num(id)})`;
const plural = (n, one, many = one + "s") => `${n} ${n === 1 ? one : many}`;

/* ------------------------------------------------------------------ */
/* the world map: which levels can be reached, in what order             */

function worldOrder() {
  const w = B.world, at = (x, y) => x + "," + y;
  const entrance = {}, barrier = {}, tele = {};
  for (const [x, y, g, nm] of w.things) { const m = /^entrance to ([A-I]\d\d)/.exec(nm); if (g === "l" && m && byId[m[1]]) entrance[at(x, y)] = m[1]; }
  for (const [x, y, nm] of w.marks) { const m = /^removed when ([A-I]\d\d) is done/.exec(nm); if (m) barrier[at(x, y)] = m[1]; }
  for (const [x, y, tx, ty, kind] of w.links) if (kind === "door" && w.rows[y][x] === "Q") tele[at(x, y)] = [tx, ty];
  const start = (w.things.find(t => t[2] === "P" && /player start/.test(t[3])) || w.things.find(t => t[2] === "P")).slice(0, 2);
  /* on an E1 map an unfinished level is a wall: reached by walking up to it */
  const e1 = w.engine === "E1";
  const reach = done => {
    const seen = new Set([at(...start)]), q = [start], got = new Set(), usedTele = new Set();
    while (q.length) {
      const [x, y] = q.pop();
      if (entrance[at(x, y)]) got.add(entrance[at(x, y)]);
      if (e1) for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) { const e = entrance[at(nx, ny)]; if (e) got.add(e); }
      const nexts = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
      if (tele[at(x, y)]) { nexts.push(tele[at(x, y)]); usedTele.add(at(x, y)); }
      for (const [nx, ny] of nexts) {
        const k = at(nx, ny), c = (w.rows[ny] || "")[nx];
        if (!c || seen.has(k)) continue;
        const b = barrier[k];
        if (e1 && entrance[k] && !done.has(entrance[k])) continue;
        /* on world maps / and \\ are diagonal walls (maps2/README.md) */
        if (b ? !done.has(b) : (c === "#" || c === "~" || c === "/" || c === "\\")) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return { got, usedTele };
  };
  const tiers = [], done = new Set();
  for (;;) {
    const { got, usedTele } = reach(done);
    const fresh = [...got].filter(id => !done.has(id)).sort();
    if (!fresh.length) break;
    tiers.push({ levels: fresh, tele: usedTele.size });
    fresh.forEach(id => done.add(id));
  }
  const never = LEVELS.map(l => l.id).filter(id => !done.has(id));
  /* what each level needs done first: a level is needed if, with
     everything else from earlier steps done but it, the map stays shut */
  const needs = {};
  tiers.forEach((t, i) => {
    const before = tiers.slice(0, i).flatMap(x => x.levels);
    for (const id of t.levels) needs[id] = before.filter(d => !reach(new Set(before.filter(o => o !== d))).got.has(id));
  });
  /* which levels' completion lifts which barriers */
  const opens = {};
  for (const id of Object.values(barrier)) opens[id] = (opens[id] || 0) + 1;
  /* a level that can't be walked to: what's in its room */
  const arrivals = w.things.filter(t => t[2] === "P" && /arrival/.test(t[3])).map(t => t.slice(0, 2));
  const lone = [];
  w.rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === "Q" && !tele[at(x, y)]) lone.push([x, y]); }));
  return { tiers, never, opens, needs, start, tele: Object.keys(tele).length, arrivals, lone, e1 };
}

/* ------------------------------------------------------------------ */
/* a level: a rough "how far along" for every tile                       */

function progress(l) {
  const R = l.rows, w = l.w, h = l.h, J = 5, S = 6;
  /* key doors count as open: the order through a level isn't about keys */
  const SOL = new Set(["#", "i", "<", ">"]);
  const at = (x, y) => (x < 0 || x >= w || y < 0 || y >= h) ? "#" : R[y][x];
  /* a bridge deck can be either way, so it is both floor and gap */
  const deck = new Set(l.bridges.flatMap(b => b.deck.map(([x, y]) => x + "," + y)));
  const blocked = (x, y) => { const c = at(x, y); return !deck.has(x + "," + y) && (SOL.has(c) || c === "^"); };
  const slope = c => c === "/" || c === "\\";
  /* a moving platform's route is floor: arrow paths, a shuttle's run
     between its blockers or walls, the spot a fixed one sits on */
  const ride = new Set(), marks = new Map();
  for (const [x, y, nm] of l.marks) { if (/^Platform blocker/.test(nm)) marks.set(x + "," + y, "B"); else if (/^Platform path arrow/.test(nm)) marks.set(x + "," + y, "A"); }
  const addRide = (x, y) => { ride.add(x + "," + y); ride.add((x + 1) + "," + y); };
  for (const [k, v] of marks) if (v === "A") addRide(...k.split(",").map(Number));
  for (const [x, y, g, nm] of l.things) if (g === "M") {
    addRide(x, y);
    const m = /\((moving (\w+)|horizontal|vertical)\)/.exec(nm);
    if (!m) continue;
    const dir = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0], horizontal: [1, 0], vertical: [0, 1] }[m[2] || m[1]];
    for (const sgn of [1, -1]) for (let i = 1; i < 80; i++) {
      const cx = x + dir[0] * i * sgn, cy = y + dir[1] * i * sgn;
      if (SOL.has(at(cx, cy)) || (dir[0] && SOL.has(at(cx + 1, cy)))) break;
      addRide(cx, cy);
      if (marks.get(cx + "," + cy) === "B") break;
    }
  }
  const support = (x, y) => { const b = at(x, y + 1), c = at(x, y); return SOL.has(b) || b === "-" || slope(b) || slope(c) || c === "|" || ride.has(x + "," + (y + 1)); };
  let sx = -1, sy = -1;
  R.forEach((r, y) => { const x = r.indexOf("P"); if (x >= 0 && sx < 0) { sx = x; sy = y; } });
  const warp = {};
  for (const [x, y, tx, ty, kind] of l.links) if (kind === "door" && R[y][x] === "D") warp[x + "," + y] = [tx, ty];
  const dist = new Int32Array(w * h).fill(-1), seen = new Uint8Array(w * h * (J + 1) * (S + 1));
  const key = (x, y, j, k) => ((y * w + x) * (J + 1) + j) * (S + 1) + k;
  const q = [[sx, sy, J, S, 0]]; seen[key(sx, sy, J, S)] = 1;
  for (let i = 0; i < q.length; i++) {
    let [x, y, j, k, d] = q[i];
    if (dist[y * w + x] < 0) dist[y * w + x] = d;
    if (support(x, y)) { j = J; k = S; }
    const air = !support(x, y);
    const go = (nx, ny, nj, nk) => { if (blocked(nx, ny) || nj < 0 || nk < 0) return; const kk = key(nx, ny, nj, nk); if (seen[kk]) return; seen[kk] = 1; q.push([nx, ny, nj, nk, d + 1]); };
    go(x, y + 1, 0, k); go(x - 1, y + 1, 0, k); go(x + 1, y + 1, 0, k);
    if (j > 0) go(x, y - 1, j - 1, k);
    if (at(x, y) === "|") { go(x, y - 1, J, S); go(x, y + 1, J, S); }
    go(x - 1, y, air ? j : J, air ? k - 1 : S); go(x + 1, y, air ? j : J, air ? k - 1 : S);
    const wp = warp[x + "," + y]; if (wp) go(wp[0], wp[1], J, S);
  }
  let max = 0; for (const d of dist) if (d > max) max = d;
  let far = 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!blocked(x, y)) far = Math.max(far, Math.hypot(x - sx, y - sy));
  /* nearest reached tile within two, for things set in a wall */
  return (x, y) => {
    let d = -1;
    for (let r = 0; r <= 2 && d < 0; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const v = (x + dx >= 0 && y + dy >= 0 && x + dx < w && y + dy < h) ? dist[(y + dy) * w + x + dx] : -1;
      if (v >= 0 && (d < 0 || v < d)) d = v;
    }
    const band = f => f < 0.34 ? "early" : f < 0.67 ? "middle" : "late";
    if (d >= 0) { const f = d / (max || 1); return { label: band(f), order: f }; }
    /* out of the path's reach: guess from straight-line distance */
    const f = Math.min(1, Math.hypot(x - sx, y - sy) / far);
    return { label: "≈" + band(f), order: f, guess: true };
  };
}

function where(l, x, y) {
  const hz = x < l.w / 3 ? "left" : x < 2 * l.w / 3 ? "centre" : "right";
  const vt = y < l.h / 3 ? "top" : y < 2 * l.h / 3 ? "middle" : "bottom";
  return `(${x}, ${y}), ${vt === "middle" && hz === "centre" ? "centre" : vt + " " + hz}`;
}

/* runs of tiles of one glyph, as groups (doors, edge exits) */
function groups(l, glyph) {
  const seen = new Set(), out = [];
  for (let y = 0; y < l.h; y++) for (let x = 0; x < l.w; x++) {
    if (l.rows[y][x] !== glyph || seen.has(x + "," + y)) continue;
    const cells = [], st = [[x, y]];
    while (st.length) {
      const [a, b] = st.pop(), k = a + "," + b;
      if (seen.has(k) || (l.rows[b] || "")[a] !== glyph) continue;
      seen.add(k); cells.push([a, b]); st.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]);
    }
    out.push(cells);
  }
  return out;
}

function levelSection(l) {
  const at = progress(l), lines = [], events = [];
  const add = (x, y, text) => { const p = at(x, y); events.push({ p, text: `${text} — ${where(l, x, y)}, ${p.label}` }); };
  const s = l.rows.join("");

  /* how it ends */
  const ways = [];
  const doors = groups(l, "E"), edges = groups(l, "X");
  const objectives = l.ends.filter(e => e[4] === "objective"), rescues = l.ends.filter(e => e[4] === "rescue");
  if (doors.length) ways.push(`through ${doors.length === 1 ? "an exit door" : plural(doors.length, "exit door")}`);
  if (edges.length) {
    const sides = [...new Set(edges.map(g => g[0][0] < l.w / 2 ? "left" : "right"))];
    ways.push(`by walking off the ${sides.join(" or ")} edge of the map`);
  }
  if (objectives.length) ways.push(objectives.length === 1 ? "by taking the objective" : `by taking the last of ${objectives.length} objectives`);
  if (rescues.length) ways.push(`by reaching ${rescues.length === 1 ? "the one to rescue" : plural(rescues.length, "rescue")}`);
  const listed = l.completion || [];
  const lost = listed.includes("exit_tile") && !doors.length;

  for (const g of doors) { const [x, y] = g[g.length - 1]; add(x, y, "**Exit door**"); }
  for (const g of edges) { const [x, y] = g[Math.floor(g.length / 2)]; add(x, y, `**Way out: the ${x < l.w / 2 ? "left" : "right"} edge**`); }
  objectives.forEach(([x, y, , nm]) => add(x, y, `**Objective** (${nm}) — taking ${objectives.length > 1 ? "the last of these" : "it"} ends the level`));
  rescues.forEach(([x, y, , nm]) => add(x, y, `**Rescue** (${nm}) — touching them ends the level; the dialogue happens here`));
  for (const [x, y, g, nm] of l.things) {
    if (g === "!" && !objectives.some(o => o[0] === x && o[1] === y)) add(x, y, `**Objective item** (${nm}) — doesn't end the level; what it is and why Poom wants it is the story's`);
    if (g === "N" && !rescues.some(o => o[0] === x && o[1] === y)) add(x, y, `NPC (${nm}), not a rescue`);
    if (g === "Z") add(x, y, `Special object (${nm})`);
    /* a teleporter is two tiles tall: list it once */
    if (g === "Q" && !l.things.some(t => t[2] === "Q" && t[0] === x && t[1] === y - 1)) add(x, y, l.secret ? `**Secret exit: a teleporter to ${name(l.secret)}** — touching it ends this level and starts that one` : "**Teleporter in the level** — where it goes isn't in the data");
  }
  l.rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === "H") add(x, y, "**Hint sign** — needs its text"); }));
  for (const so of l.sockets) add(so.x, so.y, `Key socket, ${GEMS[so.gem]} — opens a door ${so.door.length} tiles tall at (${so.door[0][0]}, ${so.door[0][1]})`);
  l.rows.forEach((r, y) => [...r].forEach((c, x) => { if (KEYCH[c]) add(x, y, `Keycard, ${KEYCH[c]}`); }));
  for (const b of l.bridges) add(b.x, b.y, `Bridge switch — ${b.on ? "removes" : "extends"} a ${b.deck.length}-tile bridge at (${b.deck[0][0]}, ${b.deck[0][1]})`);
  for (const ps of l.pswitches) add(ps.x, ps.y, `Platform switch — changes a moving platform's path at (${ps.tx}, ${ps.ty})`);
  if (s.includes("w")) l.rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === "w") add(x, y, "**Swim ability**"); }));

  /* creatures: per type, how many and where they first turn up */
  const types = {};
  for (const [x, y, g, nm] of l.things) if (g === "e" || g === "G") {
    const k = g === "G" ? "turret" : nm.replace(/^enemy type (\d+).*/, "type $1");
    const p = at(x, y);
    (types[k] = types[k] || { n: 0, first: p, variants: new Set() }).n++;
    if (p.order < types[k].first.order) types[k].first = p;
    if (g === "e" && /\(/.test(nm)) types[k].variants.add(nm.replace(/^enemy type \d+ /, ""));
  }

  const terrain = [];
  const cnt = c => s.split(c).length - 1;
  if (cnt("D")) terrain.push(plural(groups(l, "D").length, "warp door"));
  if (cnt("M")) terrain.push(plural(cnt("M"), "moving platform"));
  if (cnt("/") + cnt("\\")) terrain.push("slopes");
  if (cnt("i")) terrain.push("ice");
  if (cnt("<") + cnt(">")) terrain.push("conveyors");
  if (cnt("^")) terrain.push("hazards");
  if (cnt("|")) terrain.push("poles");
  if (l.swim) terrain.push("under water throughout");

  lines.push(`### ${name(l.id)}`, "");
  lines.push(`${l.w} × ${l.h} tiles. Ends ${ways.join(", or ")}.${lost ? " *The source also lists an exit door, but its only door tiles are the feet of key-socket doors, which the engine treats as door.*" : ""}`, "");
  if (terrain.length) lines.push(`Terrain: ${terrain.join(", ")}.`, "");
  lines.push("**Along the way** (rough order, start first):", "");
  events.sort((a, b) => a.p.order - b.p.order);
  if (events.length) for (const e of events) lines.push(`- ${e.text}`); else lines.push("- nothing that needs words");
  lines.push("");
  const tk = Object.keys(types).sort();
  if (tk.length) {
    lines.push("**Creatures**: " + tk.map(k => `${k} ×${types[k].n}${types[k].variants.size ? ` (${[...types[k].variants].join(", ")})` : ""}, from the ${types[k].first.label} part`).join("; ") + ".", "");
  }
  const items = l.things.filter(t => t[2] === "!" && !objectives.some(o => o[0] === t[0] && o[1] === t[1])).length;
  return { text: lines.join("\n"), ways, objectives: objectives.length, items, rescues: rescues.length, hints: cnt("H"), types };
}

/* ------------------------------------------------------------------ */

const order = worldOrder();
const sections = {}, roster = {};
for (const l of LEVELS) {
  sections[l.id] = levelSection(l);
  for (const [k, v] of Object.entries(sections[l.id].types)) (roster[k] = roster[k] || []).push(`${l.id} ×${v.n}`);
}
const ordered = order.tiers.flatMap(t => t.levels).concat(order.never);

const out = [];
out.push(`# Book ${BOOKNUM} (map set ${book}): story map`, "");
out.push(`Generated from the map data by \`tools/story-map.js ${book}\`. It says where in Book ${book} the story has to say something, so the script can lead up to it. Positions are tiles, (x, y) from the top left.`, "");
out.push(`"Early", "middle" and "late" say how far along a level something is, by a rough path from the start (walking, pogo jumps, poles, warp doors, platforms' routes, with key doors and bridges open). Where that path doesn't get, it is a guess from the straight-line distance to the start, marked "≈": check those by playing.`, "");
out.push(`## The book`, "");
out.push(`- **${LEVELS.length} levels**, ${LEVELS[0].id}–${LEVELS[LEVELS.length - 1].id}. Not levels: ${B.skipped.map(s => `${s.id} (${s.kind})`).join(", ") || "none"}.`);
/* a cutscene splits chapters only if a level comes after it */
const last = LEVELS[LEVELS.length - 1].id, cuts = B.skipped.filter(s => s.kind === "cutscene");
const splits = cuts.filter(c => c.id < last), ending = cuts.filter(c => c.id > last);
out.push(`- **Chapters**: chapters are split at cutscenes between levels. Book ${book} has ${splits.length ? `${plural(splits.length, "such cutscene")} (${splits.map(c => c.id).join(", ")}), so ${splits.length + 1} chapters` : "none, so it is **one chapter**"}${ending.length ? `; ${ending.map(c => c.id).join(", ")} comes after the last level, so it is the ending` : ""}. Its theme is still to choose.`);
const tot = k => LEVELS.reduce((n, l) => n + sections[l.id][k], 0);
out.push(`- **Story elements**: ${plural(tot("objectives"), "objective")} that end levels, ${plural(tot("items"), "objective item")} that don't, ${plural(tot("rescues"), "rescue")}, ${plural(tot("hints"), "hint sign")}, ${plural(Object.keys(roster).filter(k => k !== "turret").length, "enemy type")}, ${roster.turret ? "turrets" : "no turrets"}.`);
out.push("");

out.push(`## The world map`, "");
out.push(`Poom starts at (${order.start.join(", ")}). ${order.tele ? `The map has ${plural(order.tele, "linked teleporter")}. ` : ""}${order.e1 ? "On this map an unfinished level is a wall: Poom can't walk past one until it is done. " : ""}Some paths are shut until a level is done; this is the order the map lets levels be played, if each one is done as soon as it can be:`, "");
order.tiers.forEach((t, i) => {
  out.push(`${i + 1}. ${i === 0 ? "**Open from the start**" : "**Then**"}:`);
  for (const id of t.levels) {
    const nd = order.needs[id] || [];
    out.push(`   - ${name(id)}${i === 0 ? "" : nd.length ? ` — needs ${nd.map(name).join(" and ")} done` : " — opens once the step before is done (more than one way in)"}${order.opens[id] ? `; finishing it clears ${plural(order.opens[id], "barrier tile")}` : ""}`);
  }
});
const secretFrom = Object.fromEntries(LEVELS.filter(l => l.secret).map(l => [l.secret, l.id]));
const lost = order.never.filter(id => !secretFrom[id]);
for (const id of order.never.filter(id => secretFrom[id])) out.push("", `**${name(id)} is a secret level.** The map can't walk to it; ${name(secretFrom[id])} has a teleporter that leads there, and Poom is left on its part of the map afterwards. It isn't needed to finish the book.`);
if (lost.length) {
  out.push("", `**Not reachable by walking the map: ${lost.map(name).join(", ")}.**${order.arrivals.length ? ` The map has a "player arrival point" at ${order.arrivals.map(a => `(${a.join(", ")})`).join(", ")}, in a walled-off part of the map, so something outside the map (a secret exit in a level, perhaps) must bring Poom there. The story needs to say what.` : ""}${order.lone.length ? ` The map has ${plural(order.lone.length, "teleporter")} with no link, at ${order.lone.map(a => `(${a.join(", ")})`).join(", ")}: where ${order.lone.length === 1 ? "it goes" : "they go"} isn't in the data.` : ""}`);
}
out.push("", "Levels in the same step can be played in any order, so the story can't assume one of them comes before another.", "");

out.push(`## Summary`, "");
out.push("| Level | Ends by | Objectives | Items | Rescues | Hints | Creatures |", "|---|---|---|---|---|---|---|");
for (const id of ordered) {
  const s = sections[id];
  out.push(`| ${name(id)} | ${s.ways.join("; ")} | ${s.objectives || "–"} | ${s.items || "–"} | ${s.rescues || "–"} | ${s.hints || "–"} | ${Object.keys(s.types).sort().map(k => k.replace("type ", "")).join(", ") || "–"} |`);
}
out.push("");

out.push(`## Creatures across the book`, "");
out.push(`Creature types are numbered per book; the same number is the same creature only within Book ${book}. Each needs a name, a look and a part in the story.`, "");
out.push("| Type | Where (count) |", "|---|---|");
for (const k of Object.keys(roster).sort()) out.push(`| ${k} | ${roster[k].join(", ")} |`);
out.push("");

out.push(`## Levels`, "", "In the order the map opens them.", "");
for (const id of ordered) out.push(sections[id].text);

fs.mkdirSync(path.join(ROOT, "docs", "story"), { recursive: true });
const file = path.join(ROOT, "docs", "story", `book-${book}.md`);
fs.writeFileSync(file, out.join("\n"));
console.log("wrote", path.relative(ROOT, file));
