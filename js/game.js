/* Commander Poom -- the game.
 *
 * A 320x200 canvas, scaled up nearest-neighbour, and a DOM layer of the same
 * size over it for every screen with words on it. Fixed 60 Hz simulation.
 * Modes: title, story, map, level, ending; anything modal (messages, menus,
 * the status window) is an overlay, and the world stands still under it. */
"use strict";

const W = 320, H = 200;
const NS = "commanderpoom";
const KEYS = { save: NS + "_save_v2", scores: NS + "_scores_v1", muted: NS + "_muted_v1", seen: NS + "_seen_v1", speed: NS + "_speed_v1", lastBook: NS + "_book_v1" };

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const stage = document.getElementById("stage");
const uiRoot = document.getElementById("ui");

/* ------------------------------------------------------------------ */
/* storage                                                               */

const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private window */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* no storage */ } },
};

/* Game speed: how many simulation steps a second. Every distance is in steps,
 * so a slower clock leaves every jump height and gap exactly as the levels
 * were laid out -- only time stretches. Classic is Keen's own 60 a second. */
const SPEEDS = { classic: { label: "Classic", hz: 60 }, relaxed: { label: "Relaxed", hz: 48 } };
let speed = SPEEDS[store.get(KEYS.speed, "classic")] ? store.get(KEYS.speed, "classic") : "classic";
let STEP = 1000 / SPEEDS[speed].hz;
function cycleSpeed() {
  const names = Object.keys(SPEEDS);
  speed = names[(names.indexOf(speed) + 1) % names.length];
  STEP = 1000 / SPEEDS[speed].hz;
  store.set(KEYS.speed, speed);
}

function forgetEverything() {
  for (const area of ["localStorage", "sessionStorage"]) {
    try {
      const s = window[area];
      for (let i = s.length - 1; i >= 0; i--) {
        const k = s.key(i);
        if (k && k.startsWith(NS)) s.removeItem(k);
      }
    } catch (e) { /* no storage */ }
  }
  location.reload();
}

/* ------------------------------------------------------------------ */
/* sound: a PC speaker, more or less                                     */

const SFX = {
  jump: [[330, 720, 70]],
  pogo: [[180, 520, 60], [520, 900, 50]],
  bigpogo: [[160, 520, 60], [520, 1100, 90]],
  shoot: [[1400, 260, 90]],
  click: [[110, 110, 25]],
  bump: [[150, 120, 35]],
  item: [[880, 880, 35], [1320, 1320, 45]],
  bigitem: [[660, 660, 40], [880, 880, 40], [1320, 1320, 40], [1760, 1760, 70]],
  gem: [[1047, 1047, 50], [1319, 1319, 50], [1568, 1568, 50], [2093, 2093, 90]],
  door: [[220, 90, 160], [90, 180, 80]],
  push: [[320, 240, 50]],
  stun: [[1100, 500, 110]],
  hit: [[700, 160, 90]],
  kill: [[1200, 80, 220]],
  ricochet: [[2400, 1800, 40]],
  tank: [[260, 120, 110]],
  die: [[900, 700, 120], [700, 500, 120], [500, 300, 150], [300, 60, 400]],
  done: [[523, 523, 90], [659, 659, 90], [784, 784, 90], [1047, 1047, 220]],
  life: [[660, 660, 70], [880, 880, 70], [990, 990, 70], [1320, 1320, 160]],
  enter: [[400, 800, 140]],
  nope: [[200, 200, 60], [150, 150, 90]],
  menu: [[900, 900, 18]],
  pick: [[1200, 1200, 30], [1600, 1600, 40]],
};

const audio = {
  ctx: null, muted: store.get(KEYS.muted, "0") === "1",
  unlock() {
    if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
  },
  play(name) {
    if (this.muted || !this.ctx || !SFX[name]) return;
    const a = this.ctx, o = a.createOscillator(), g = a.createGain();
    o.type = "square";
    let t = a.currentTime + 0.005;
    o.frequency.setValueAtTime(SFX[name][0][0], t);
    g.gain.setValueAtTime(0.0, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.004);
    for (const [f0, f1, ms] of SFX[name]) {
      o.frequency.setValueAtTime(f0, t);
      o.frequency.linearRampToValueAtTime(f1, t + ms / 1000);
      t += ms / 1000;
    }
    g.gain.setValueAtTime(0.06, t - 0.01);
    g.gain.linearRampToValueAtTime(0, t + 0.01);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(t + 0.02);
  },
  setMuted(m) { this.muted = m; store.set(KEYS.muted, m ? "1" : "0"); },
};
const sfx = n => audio.play(n);

/* ------------------------------------------------------------------ */
/* input                                                                 */

const BIND = {
  ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
  ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
  ControlLeft: "jump", ControlRight: "jump", KeyZ: "jump",
  AltLeft: "pogo", AltRight: "pogo", KeyX: "pogo",
  Space: "fire", KeyC: "fire",
  Enter: "status", Escape: "pause", KeyM: "mute",
};
const held = new Set(), pressed = new Set();
const touchHeld = new Set();
let padHeld = new Set();
const isDown = a => held.has(a) || touchHeld.has(a) || padHeld.has(a);
const wasPressed = a => pressed.has(a);

addEventListener("keydown", ev => {
  audio.unlock();
  if (UI.top()) { UI.key(ev); return; }
  const a = BIND[ev.code];
  if (!a) return;
  ev.preventDefault();
  if (!ev.repeat) pressed.add(a);
  held.add(a);
});
addEventListener("keyup", ev => { const a = BIND[ev.code]; if (a) held.delete(a); });
addEventListener("blur", () => { held.clear(); touchHeld.clear(); if (G.mode === "level" || G.mode === "map") openPause(); });
addEventListener("pointerdown", () => audio.unlock());

let padPrev = new Set();
function pollPad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const now = new Set();
  for (const p of pads) {
    if (!p) continue;
    const b = i => p.buttons[i] && p.buttons[i].pressed;
    if (p.axes[0] < -0.4 || b(14)) now.add("left");
    if (p.axes[0] > 0.4 || b(15)) now.add("right");
    if (p.axes[1] < -0.5 || b(12)) now.add("up");
    if (p.axes[1] > 0.5 || b(13)) now.add("down");
    if (b(0)) now.add("jump");
    if (b(1)) now.add("pogo");
    if (b(2)) now.add("fire");
    if (b(3)) now.add("status");
    if (b(9)) now.add("pause");
  }
  for (const a of now) if (!padPrev.has(a)) {
    if (UI.top()) UI.padPress(a); else pressed.add(a);
  }
  padPrev = now;
  padHeld = UI.top() ? new Set() : now;
}

/* ------------------------------------------------------------------ */
/* game state                                                            */

const G = {
  mode: "boot", t: 0,
  run: null,      /* the game in progress: score, lives, parts, map position... */
  lv: null,       /* the level being played */
  map: null,      /* the world map */
  cam: { x: 0, y: 0 },
};

function newRun() {
  return { score: 0, nextLife: 20000, lives: 4, ammo: 0, pogo: true, parts: [false, false, false, false], aboard: [false, false, false, false],
    book: BOOK_IDS[0], done: {}, mx: null, my: null, swim: false };
}

/* ------------------------------------------------------------------ */
/* the books: js/books/<A-I>.js, each a world map and its levels.         */
/* Levels are addressed by map id (A02), never by number.                */

/* The order the books are played in; Book 1 is the first. Map sets keep
 * their letters (H01, H02...), the player sees numbers. */
const BOOK_ORDER = ["H", "A", "B", "C", "D", "E", "F", "G", "I"];
const BOOK_IDS = BOOK_ORDER.filter(b => BOOKS[b]);
const bookNumber = b => BOOK_IDS.indexOf(b) + 1;
/* Themes. A book's theme is everything about how the game looks and reads
 * while that book is played: Poom's look, the items, the creatures and the
 * world map (js/art.js), the title screen and logo, the subtitle, and its
 * words (BOOK_TEXT). The whole game wears the theme of the book being
 * played, or of the last one played: the title screen too. A new book
 * with its own theme adds an entry to BOOK_THEMES and one to THEME_OF_BOOK.
 * Books not listed wear classic, the original game's. Level tilesets are
 * per level (LEVEL_THEME). */
const BOOK_THEMES = {
  classic: { name: "classic", look: "classic", items: "classic", creatures: "classic", map: "classic", title: "classic", subtitle: "Episode One: Lost on Planet Hiss" },
  wasteland: { name: "wasteland", look: "ranger", items: "wasteland", creatures: "wasteland", map: "wasteland", title: "wasteland", subtitle: "Book One: Down in the Glow", hud: "wrist" },
};
const THEME_OF_BOOK = { H: "wasteland" };
/* a book with no theme of its own wears Book 1's */
const themeOf = book => BOOK_THEMES[THEME_OF_BOOK[book] || THEME_OF_BOOK[BOOK_IDS[0]]] || BOOK_THEMES.classic;
/* the book a theme's words come from: the first that has that theme and words */
const themeHome = () => BOOK_IDS.find(b => THEME_OF_BOOK[b] === theme.name && BOOK_TEXT[b]);
let theme = BOOK_THEMES.classic;
/* the book the game is themed for: the one being played, else the last
 * one played, else Book 1 */
function themeBook() {
  if (G.run && G.run.book) return G.run.book;
  const last = store.get(KEYS.lastBook, null);
  return BOOKS[last] ? last : BOOK_IDS[0];
}
/* dress the whole game for a book, and remember it as the last played */
function dressFor(book) {
  theme = themeOf(book);
  useLook(theme.look); useItems(theme.items); useCreatures(theme.creatures);
  mapArt = mapArtSets[theme.map] || mapArtSets.classic;
  logoEl().dataset.look = theme.name; document.getElementById("ui").dataset.look = theme.name;
  document.title = "Commander Poom \u2014 " + theme.subtitle;
  if (BOOKS[book]) store.set(KEYS.lastBook, book);
}
const THEME_OF = { A: "hiss", B: "garden", C: "fort", D: "ice", E: "hiss", F: "garden", G: "fort", H: "ice", I: "hiss" };
/* A level's own tileset, by its type (docs/story/book-1-story.md). Vault 9,
 * the frozen one, is H09, H11 and H17; the raider camps are H04, H08 (Fort
 * Scrap), H13 and H15 (the Nest); the rest are the ruins of Old Litterburg.
 * Levels not listed use their book's. */
const LEVEL_THEME = { H09: "vaultCold", H11: "vaultCold", H17: "vaultCold", H10: "vault", H14: "vault",
  H04: "raiders", H08: "raiders", H13: "raiders", H15: "raiders",
  H02: "ruins", H03: "ruins", H05: "ruins", H06: "ruins", H07: "ruins", H12: "ruins", H16: "ruins" };
const MAPS = {};
for (const b of BOOK_IDS) BOOKS[b].chapters.forEach(ch => ch.levels.forEach(lv => { MAPS[lv.id] = lv; lv.book = b; }));
/* a level's name: its place in a book that names its places, or its number */
const levelName = id => {
  const B = BOOK_TEXT[MAPS[id].book], place = B && B.places && B.places[id];
  return place ? `Level ${+id.slice(1) - 1}: ${place}` : `Book ${bookNumber(MAPS[id].book)}, level ${+id.slice(1) - 1}`;
};

/* what a world map's markers mean, worked out once per book */
const WORLDS = {};
for (const b of BOOK_IDS) {
  const w = BOOKS[b].world, at = (x, y) => x + "," + y;
  const W_ = { rows: w.rows, w: w.w, h: w.h, entrance: {}, barrier: {}, flag: {}, first: {}, need: [], tele: {} };
  /* teleporters: a Q tile with a link goes to the link's target */
  for (const [x, y, tx, ty, kind] of w.links || []) if (kind === "door" && (w.rows[y] || "")[x] === "Q") W_.tele[at(x, y)] = [tx, ty];
  for (const [x, y, g, name] of w.things) {
    const m = /^entrance to ([A-I]\d\d)/.exec(name);
    if (g === "l" && m && MAPS[m[1]]) { W_.entrance[at(x, y)] = m[1]; if (!W_.first[m[1]]) W_.first[m[1]] = [x, y]; }
  }
  for (const [x, y, name] of w.marks) {
    let m;
    if ((m = /^removed when ([A-I]\d\d) is done/.exec(name))) W_.barrier[at(x, y)] = m[1];
    else if ((m = /^done-flag spot for ([A-I]\d\d)/.exec(name))) W_.flag[m[1]] = [x, y];
  }
  const starts = w.things.filter(t => t[2] === "P");
  const start = starts.find(t => /player start/.test(t[3])) || starts[0];
  W_.start = start ? [start[0], start[1]] : [1, 1];
  /* a secret level is a bonus: the book is done without it */
  const secret = new Set(BOOKS[b].chapters.flatMap(c => c.levels).map(l => l.secret).filter(Boolean));
  W_.need = [...new Set(Object.values(W_.entrance))].filter(id => !secret.has(id)).sort();
  /* E1 maps (the older engine) number their objects instead of linking them:
   * 1-16 are levels, the rest the map's own things. An unfinished level
   * there is a wall: Poom walks up to it to go in. */
  W_.e1 = w.engine === "E1";
  /* each entrance's bounding box, in tiles: a marker is drawn once over it */
  W_.box = {};
  for (const [k, id] of Object.entries(W_.entrance)) {
    const [x, y] = k.split(",").map(Number), b = W_.box[id] || (W_.box[id] = { x0: x, y0: y, x1: x, y1: y });
    b.x0 = Math.min(b.x0, x); b.y0 = Math.min(b.y0, y); b.x1 = Math.max(b.x1, x); b.y1 = Math.max(b.y1, y);
  }
  W_.ship = w.ship || null;
  WORLDS[b] = W_;
}
const world = () => WORLDS[G.run.book];

function saveRun() { if (G.run) store.set(KEYS.save, G.run); }
function seen(id) { const s = store.get(KEYS.seen, {}); if (s[id]) return true; s[id] = 1; store.set(KEYS.seen, s); return false; }

function addScore(n) {
  const r = G.run;
  r.score += n;
  while (r.score >= r.nextLife) { r.nextLife += 20000; r.lives++; sfx("life"); popup(G.lv && G.lv.p, "1UP"); }
}

/* ------------------------------------------------------------------ */
/* the level                                                             */

const SOLID = new Set(["#", "=", "1", "2", "3", "4", "5", "6", "7", "8", "d", "i", "<", ">"]);
/* doors a key socket opens: 5 6 7 8, red yellow green blue */
const SOCKET_DOOR = { 5: 0, 6: 1, 7: 2, 8: 3 };
const ITEM_CH = { f: "fish", m: "milk", n: "yarn", c: "catnip", u: "medal", t: "trophy", a: "ammo", L: "life", O: "pogo" };
const POINTS = { fish: 100, milk: 200, yarn: 500, catnip: 1000, medal: 2000, trophy: 5000 };
/* q is a keycard whose colour the map doesn't give; d is a locked door
 * whose colour it doesn't give, and any keycard opens one */
const GEM_CH = { r: 0, y: 1, g: 2, b: 3, q: 4 };
const DOOR_CH = { 1: 0, 2: 1, 3: 2, 4: 3, d: 4 };
const GEM_NAMES = ["red", "yellow", "green", "blue", "silver"];
const BELT = { "<": -1, ">": 1 };

function loadLevel(n) {
  const def = MAPS[n], theme = LEVEL_THEME[n] || THEME_OF[def.book];
  const rows = def.rows.map(r => [...r]);
  const h = rows.length, w = rows[0].length;
  const lv = { n, def, w, h, tiles: rows, back: [], ents: [], items: [], shots: [], fx: [], keys: [false, false, false, false, false],
    theme, ice: false, swim: !!def.swim, t: 0, p: null, exits: [], exitAt: {}, edge: new Set(), npcs: [], endsLeft: 0, warp: {}, warpDoors: [], sockets: [], socketAt: {}, bridges: [], switchAt: {}, deckAt: new Set(), plats: [], pmark: new Map(), pswitchAt: {}, secretAt: new Set(), signDrop: {}, signs: [], over: null, slope: slopesOf(rows) };
  /* Under a slope the maps leave the odd non-solid tile where the ground's
   * edge was drawn. Boxed in on both sides, it is ground. */
  const isSl = (x, y) => !!(lv.slope[y] && lv.slope[y][x]);
  const firm = (x, y) => SOLID.has((rows[y] || [])[x]) || isSl(x, y);
  for (let y = 1; y < h; y++) for (let x = 1; x < w - 1; x++)
    if (rows[y][x] === "." && firm(x - 1, y) && firm(x + 1, y) && (isSl(x - 1, y - 1) || isSl(x, y - 1) || isSl(x + 1, y - 1))) rows[y][x] = "#";
  lv.art = paintTiles(theme);
  lv.far = paintFar(theme);
  /* a tile that held a thing becomes the air around it */
  const airOf = (x, y) => [[1, 0], [-1, 0], [0, -1], [0, 1]].some(([dx, dy]) => (rows[y + dy] || [])[x + dx] === "+") ? "+" : ".";
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = rows[y][x], px = x * T, py = y * T;
    if (c === "P") { lv.p = makePlayer(px + 2, py + T - 22); rows[y][x] = airOf(x, y); }
    else if (c === "E") { lv.exitAt[x + "," + y] = true; rows[y][x] = "."; }
    else if (c === "X") { lv.edge.add(x + "," + y); rows[y][x] = "."; }
    else if (c === "!" || c === "w") {
      /* in a book with a ship, objective types 01-04 are its four parts */
      const th = (def.things || []).find(t => t[0] === x && t[1] === y && t[2] === "!"), type = th && +(/objective type (\d+)/.exec(th[3]) || [])[1];
      if (c === "!" && WORLDS[def.book].ship && type >= 1 && type <= 4) lv.items.push({ kind: "part", part: type - 1, x: px, y: py, t: 0 });
      else lv.items.push({ kind: c === "!" ? "objective" : "swim", part: lv.items.length % 4, x: px, y: py, t: 0 });
      rows[y][x] = airOf(x, y);
    }
    else if (ITEM_CH[c]) { lv.items.push({ kind: ITEM_CH[c], x: px, y: py, t: Math.random() * 60 | 0 }); rows[y][x] = airOf(x, y); }
    else if (GEM_CH[c] !== undefined) { lv.items.push({ kind: "gem", gem: GEM_CH[c], x: px, y: py, t: 0 }); rows[y][x] = airOf(x, y); }
    else if (c === "*") { lv.items.push({ kind: "part", part: def.part, x: px, y: py, t: 0 }); rows[y][x] = airOf(x, y); }
    else if ("xBVTKW".includes(c)) { lv.ents.push(makeEnemy(c, px, py + T)); rows[y][x] = airOf(x, y); }
  }
  /* the books' creatures and turrets, from the map's things */
  const kinds = ENEMY_OF[def.book];
  if (kinds) for (const [x, y, g, name] of def.things || []) {
    if (g === "e") { const t = kinds[(/enemy type (\d+)/.exec(name) || [])[1]]; if (t) lv.ents.push(makeEnemy(t, x * T, y * T + T)); }
    if (g === "G") {
      const e = makeEnemy("G", x * T, y * T + T), d = TURRET_DIR[(/turret \(([\w-]+)\)/.exec(name) || [])[1]] || [1, 0];
      e.aim = d; e.face = d[0] < 0 ? -1 : 1; e.vx = 0;
      lv.ents.push(e);
    }
  }
  /* Exit doors: each connected group of exit tiles is one door. Walking
   * into any of its tiles finishes the level; it is drawn standing on the
   * floor up to three tiles below the group, or at the group's foot. */
  for (const k of Object.keys(lv.exitAt)) {
    if (lv.exitAt[k] !== true) continue;
    const g = { tx0: Infinity, tx1: -1, ty0: Infinity, ty1: -1 }, todo = [k];
    while (todo.length) {
      const c = todo.pop();
      if (lv.exitAt[c] !== true) continue;
      lv.exitAt[c] = g;
      const [x, y] = c.split(",").map(Number);
      g.tx0 = Math.min(g.tx0, x); g.tx1 = Math.max(g.tx1, x); g.ty0 = Math.min(g.ty0, y); g.ty1 = Math.max(g.ty1, y);
      todo.push((x + 1) + "," + y, (x - 1) + "," + y, x + "," + (y + 1), x + "," + (y - 1));
    }
    const cx = Math.floor((g.tx0 + g.tx1) / 2);
    let fy = g.ty1 + 1;
    while (fy <= g.ty1 + 3 && fy < h && !isSolid(rows[fy][cx]) && rows[fy][cx] !== "-") fy++;
    const foot = fy <= g.ty1 + 3 && fy < h ? fy : g.ty1 + 1;
    g.x = (g.tx0 + g.tx1) * T / 2; g.y = foot * T - T * 2;
    lv.exits.push(g);
  }

  /* Warp doors. Each D tile has its own target (the left half of a door
   * leads to the left half of the arrival); a link on anything but a D is
   * not a door and is ignored. A door is two tiles wide; drawn two columns
   * at a time, over its D rows and, when it is one row tall, the row below. */
  for (const [x, y, tx, ty, kind] of def.links || []) if (kind === "door" && rows[y] && rows[y][x] === "D") lv.warp[x + "," + y] = [tx, ty];
  const doneD = new Set();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (rows[y][x] !== "D" || doneD.has(x + "," + y)) continue;
    let x1 = x; while (x1 + 1 < w && rows[y][x1 + 1] === "D" && x1 - x < 1) x1++;
    let y1 = y; while (y1 + 1 < h && rows[y1 + 1][x] === "D") y1++;
    for (let yy = y; yy <= y1; yy++) for (let xx = x; xx <= x1; xx++) doneD.add(xx + "," + yy);
    lv.warpDoors.push({ x: x * T, y: y * T, w: (x1 - x + 1) * T, h: Math.max(2, y1 - y + 1) * T });
  }

  /* key sockets, and the doors they open; bridge switches, and their decks */
  for (const s of def.sockets || []) {
    const k = { ...s, filled: false };
    lv.sockets.push(k); lv.socketAt[s.x + "," + s.y] = k;
    if (rows[s.y][s.x] === "j") rows[s.y][s.x] = ".";
  }
  for (const b of def.bridges || []) {
    const k = { ...b };
    lv.bridges.push(k); lv.switchAt[b.x + "," + b.y] = k;
    for (const [x, y] of b.deck) lv.deckAt.add(x + "," + y);
  }

  /* moving platforms, the markers that steer them, and their switches */
  for (const [x, y, name] of def.marks || []) {
    if (/^Platform blocker/.test(name)) lv.pmark.set(x + "," + y, "B");
    const m = /^Platform path arrow (\w+)$/.exec(name);
    if (m && DIRS[m[1]]) lv.pmark.set(x + "," + y, m[1]);
  }
  for (const [x, y, g, name] of def.things || []) if (g === "M") {
    const pl = makePlat(name, x * T, y * T);
    lv.plats.push(pl); rows[y][x] = ".";
    /* the map holds one object a cell, so an arrow-guided platform's own cell
       has no arrow: its starting direction is that cell's arrow */
    if (pl.kind === "arrow" && !lv.pmark.has(x + "," + y)) lv.pmark.set(x + "," + y, pl.dirName);
  }
  for (const s of def.pswitches || []) {
    const k = { ...s, on: false, mark: lv.pmark.get(s.tx + "," + s.ty) || "B" };
    lv.pswitchAt[s.x + "," + s.y] = k;
  }

  /* a hint sign stands on the floor below it, up to three tiles down: the
     maps put the sign where its message is, not always on the ground */
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (rows[y][x] === "H") {
    let d = 0;
    while (d < 3 && y + d + 1 < h && !isSolid(rows[y + d + 1][x]) && rows[y + d + 1][x] !== "-") d++;
    if (d < 3) lv.signDrop[x + "," + y] = d;
    lv.signs.push({ x: x * T, y: (y + (d < 3 ? d : 0)) * T, n: lv.signs.length });
  }

  /* a secret exit: the level's teleporter */
  if (def.secret) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (rows[y][x] === "Q") { lv.secretAt.add(x + "," + y); rows[y][x] = "."; }

  /* what else finishes the level: the source's rescue NPCs and objectives */
  for (const [x, y, g, , how] of def.ends || []) {
    if (how === "rescue") { lv.npcs.push({ x: x * T, y: y * T + T - 16, w: 14, h: 16, t: 0 }); continue; }
    let it = lv.items.find(i => (i.kind === "objective" || i.kind === "swim") && i.x === x * T && i.y === y * T);
    if (!it) lv.items.push(it = { kind: g === "w" ? "swim" : "objective", part: lv.items.length % 4, x: x * T, y: y * T, t: 0 });
    if (!it.ends) { it.ends = true; lv.endsLeft++; }
  }

  /* back wall behind anything that stands in a walled room */
  for (let y = 0; y < h; y++) { lv.back[y] = []; for (let x = 0; x < w; x++) lv.back[y][x] = rows[y][x] === "+"; }
  for (let pass = 0; pass < 2; pass++) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (lv.back[y][x] || SOLID.has(rows[y][x])) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((lv.back[y + dy] || [])[x + dx]) lv.back[y][x] = true;
  }
  return lv;
}

/* Slopes. A row's run of n like slope tiles climbs one tile height, so a
 * lone / is 45 degrees and a pair is half that. Each slope tile gets its
 * surface heights at its left and right edges, in pixels from its bottom. */
function slopesOf(rows) {
  const out = [];
  rows.forEach((r, y) => {
    out[y] = {};
    for (let x = 0; x < r.length;) {
      const c = r[x];
      if (c !== "/" && c !== "\\") { x++; continue; }
      let n = 0; while (r[x + n] === c) n++;
      for (let k = 0; k < n; k++) out[y][x + k] = c === "/" ? [Math.round(T * k / n), Math.round(T * (k + 1) / n)] : [Math.round(T * (n - k) / n), Math.round(T * (n - k - 1) / n)];
      x += n;
    }
  });
  return out;
}

/* the y of a slope's surface at pixel column px, or null if tx,ty is no slope */
function slopeTop(lv, tx, ty, px) {
  const s = lv.slope[ty] && lv.slope[ty][tx];
  if (!s) return null;
  const f = Math.max(0, Math.min(1, (px - tx * T) / T));
  return ty * T + T - (s[0] + (s[1] - s[0]) * f);
}

const tileAt = (lv, tx, ty) => (tx < 0 || tx >= lv.w) ? "#" : (ty < 0 || ty >= lv.h) ? "." : lv.tiles[ty][tx];
const isSolid = c => SOLID.has(c);

/* the hazard part of a tile, in tile-local pixels, or null */
function hazardRect(c) {
  if (c === "^") return [1, 8, 14, 8];
  if (c === "~") return [0, 6, 16, 10];
  return null;
}

/* move a body sideways through the tiles. On a slope, a body walking into
 * the ground at its top steps up onto it. */
function moveX(lv, b, dx, hit) {
  if (!dx) return;
  let nx = b.x + dx;
  const ty0 = Math.floor(b.y / T), ty1 = Math.floor((b.y + b.h - 1) / T);
  const tx = dx > 0 ? Math.floor((nx + b.w - 1) / T) : Math.floor(nx / T);
  for (let ty = ty0; ty <= ty1; ty++) if (isSolid(tileAt(lv, tx, ty))) {
    if (b.onSlope) for (let up = 1; up <= 10; up++) if (rectClear(lv, nx, b.y - up, b.w, b.h)) { b.y -= up; b.x = nx; return; }
    nx = dx > 0 ? tx * T - b.w : (tx + 1) * T;
    if (dx > 0) hit.right = true; else hit.left = true;
    break;
  }
  b.x = nx;
}

/* move a body through the tiles: x, then y. Returns what it hit. */
function moveBody(lv, b, oneway = true) {
  const hit = { left: false, right: false, top: false, bottom: false };
  moveX(lv, b, b.vx, hit);
  const wasGround = b.onGround, falling = b.vy >= 0, prevBottom = b.y + b.h;
  b.onGround = false;
  let ny = b.y + b.vy;
  const tx0 = Math.floor(b.x / T), tx1 = Math.floor((b.x + b.w - 1) / T);
  if (b.vy >= 0) {
    const ty = Math.floor((ny + b.h) / T), top = ty * T;
    for (let tx = tx0; tx <= tx1; tx++) {
      const c = tileAt(lv, tx, ty);
      if (isSolid(c) || (oneway && c === "-" && !b.dropT && b.y + b.h <= top + 0.01)) {
        if (ny + b.h >= top) { ny = top - b.h; hit.bottom = true; b.onGround = true; }
        break;
      }
    }
  } else {
    const ty = Math.floor(ny / T);
    for (let tx = tx0; tx <= tx1; tx++) if (isSolid(tileAt(lv, tx, ty))) { ny = (ty + 1) * T; hit.top = true; break; }
  }
  b.y = ny;
  /* slopes: stand on the surface; walking down one, stay on it */
  b.onSlope = false;
  if (falling) {
    const fx = b.x + b.w / 2, ftx = Math.floor(fx / T), fty = Math.floor((b.y + b.h - 1) / T);
    for (const ty of [fty, fty + 1]) {
      const top = slopeTop(lv, ftx, ty, fx);
      if (top === null) continue;
      if (b.y + b.h >= top || (wasGround && top - (b.y + b.h) <= 8)) { b.y = top - b.h; hit.bottom = true; b.onGround = true; b.onSlope = true; }
      break;
    }
  }
  /* a moving platform, for Poom: land on it, or keep standing on it */
  if (b === lv.p) {
    b.riding = null;
    if (falling && !hit.bottom && !b.dropT) {
      const pl = landOnPlat(lv, b, prevBottom);
      if (pl) { b.y = pl.y - b.h; hit.bottom = true; b.onGround = true; b.riding = pl; }
    }
  }
  if (hit.bottom || hit.top) b.vy = 0;
  return hit;
}

/* is there floor just ahead of a walker's leading foot? */
function floorAhead(lv, b) {
  const fx = b.vx > 0 ? b.x + b.w + 1 : b.x - 2, fy = b.y + b.h + 2;
  const tx = Math.floor(fx / T), ty = Math.floor(fy / T), c = tileAt(lv, tx, ty);
  return isSolid(c) || c === "-" || slopeTop(lv, tx, ty, fx) !== null || slopeTop(lv, tx, ty - 1, fx) !== null;
}

/* is a rectangle clear of solid tiles? */
function rectClear(lv, x, y, w, h) {
  for (let ty = Math.floor(y / T); ty <= Math.floor((y + h - 1) / T); ty++)
    for (let tx = Math.floor(x / T); tx <= Math.floor((x + w - 1) / T); tx++) if (isSolid(tileAt(lv, tx, ty))) return false;
  return true;
}

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/* ------------------------------------------------------------------ */
/* Poom                                                                  */

const PH = 22, POGO_H = 8;

/* Movement, in pixels and 60 Hz ticks, after Commander Keen 1's engine (the
 * Vorticon engine as Commander Genius reproduces it: 32 sub-units to the
 * pixel). Keen walks briskly but floats: gravity is a third of a modern
 * platformer's, a jump starts with a short crouch that decides its height
 * and stops him dead, air control is weak, and the pogo compresses on every
 * landing before it fires him upward. */
const KP = {
  walkMax: 68 / 32, walkAccel: 3.6 / 32, groundFriction: 14 / 32, airFriction: 2 / 32,
  gravity: 4 / 32, maxFall: 104 / 32,
  jumpSpeed: 120 / 32, jumpCrouch: 5, jumpCarry: 64 / 32, airAccel: 3 / 32,
  pogoBig: 4.98, pogoSmall: 2.76, pogoCompress: 10, pogoAirAccel: 2 / 32,
  shotSpeed: 124 / 32, refire: 7, fireStance: 14,
};

function makePlayer(x, y) {
  return { x, y, w: 12, h: PH, vx: 0, vy: 0, face: 1, onGround: false, pogo: false, climbing: false,
    crouch: 0, crouchHeld: 0, compress: 0, pogoBigAsk: false, coyote: 0, buffer: 0, shootT: 0, fireCool: 0, anim: 0,
    pushV: 0, pushT: 0, dropT: 0, poleCool: 0, land: 0, state: "play", t: 0 };
}

function updatePlayer(lv) {
  const p = lv.p, run = G.run;
  p.t++;
  if (p.state === "dead") {
    p.y += p.vy; p.x += p.vx;
    if (p.t > 100) loseLife();
    return;
  }
  if (p.state === "exit") {
    if (p.t > 50) finishLevel();
    return;
  }

  const L = isDown("left"), R = isDown("right"), U = isDown("up"), D = isDown("down");
  const ax = (R ? 1 : 0) - (L ? 1 : 0);
  if (wasPressed("jump")) p.buffer = 7;
  if (p.buffer > 0) p.buffer--;
  if (p.fireCool > 0) p.fireCool--;
  if (p.shootT > 0) p.shootT--;
  if (p.dropT > 0) p.dropT--;
  if (p.poleCool > 0) p.poleCool--;
  if (p.land > 0) p.land--;
  if (ax) p.face = ax;
  const underfoot = tileAt(lv, Math.floor((p.x + p.w / 2) / T), Math.floor((p.y + p.h + 1) / T));
  const ice = lv.ice || (p.onGround && underfoot === "i");

  /* under water: no pogo, no poles, no raygun; he swims */
  if (lv.swim) swimMove(lv, p, ax, U, D);

  /* pogo on and off */
  if (wasPressed("pogo") && !p.climbing && !lv.swim) {
    if (!run.pogo) { if (!seen("nopogo")) toast(say("noPogo", "You don't have a pogo stick yet.")); sfx("click"); }
    else if (!p.pogo) {
      if (rectClear(lv, p.x, p.y - POGO_H, p.w, POGO_H)) {
        p.pogo = true; p.y -= POGO_H; p.h = PH + POGO_H;
        if (p.onGround) { p.compress = KP.pogoCompress; p.pogoBigAsk = false; }
      } else sfx("bump");
    } else { p.pogo = false; p.y += POGO_H; p.h = PH; }
  }

  /* through a warp door: up, standing in front of one */
  const door = !p.climbing && warpAt(lv, p);
  if (door && !seen("warpdoor")) toast(say("warpDoor", "A door. Press \u2191 to go through."));
  if (door && wasPressed("up")) { warpTo(lv, p, door); return; }

  /* a hint sign: up, standing at it, reads it */
  const sign = !door && !p.climbing && signAt(lv, p);
  if (sign && lv.signNear !== sign) { lv.signNear = sign; toast(say("signNear", "A sign. Press \u2191 to read it.", lv.theme)); }
  if (!sign) lv.signNear = null;
  if (sign && wasPressed("up")) { readSign(lv, sign); return; }

  /* a key socket: stand at it with its keycard */
  for (const k of tilesUnder(p)) {
    const s = lv.socketAt[k];
    if (!s || s.filled) continue;
    if (lv.keys[s.gem]) fillSocket(lv, s);
    else if (lv.socketWarned !== s) { lv.socketWarned = s; toast(say("socket", c => `A ${c} keycard goes here.`, GEM_NAMES[s.gem])); }
  }

  /* a bridge switch: up, standing at it */
  if (wasPressed("up") && !p.climbing) {
    const b = tilesUnder(p).map(k => lv.switchAt[k]).find(Boolean);
    if (b) { flipBridge(lv, b); return; }
    const ps = tilesUnder(p).map(k => lv.pswitchAt[k]).find(Boolean);
    if (ps) { flipPlatSwitch(lv, ps); return; }
  }

  /* grab a pole */
  const cx = p.x + p.w / 2;
  const poleAt = y => tileAt(lv, Math.floor(cx / T), Math.floor(y / T)) === "|";
  if (!p.climbing && !p.pogo && !p.poleCool && (U || (D && !p.onGround)) && poleAt(p.y + 6) ||
      !p.climbing && !p.pogo && !p.poleCool && D && p.onGround && poleAt(p.y + p.h + 4)) {
    const ptx = Math.floor(cx / T);
    p.climbing = true; p.x = ptx * T + T / 2 - p.w / 2; p.vx = 0; p.vy = 0;
    if (D && p.onGround && !poleAt(p.y + 6)) p.y += 4;
  }

  if (p.climbing) {
    p.vx = 0;
    if (U && poleAt(p.y + 4)) { p.y -= 1.3; p.anim++; }
    else if (D) {
      p.y += 2;
      p.anim++;
      const under = tileAt(lv, Math.floor(cx / T), Math.floor((p.y + p.h) / T));
      if (isSolid(under) || under === "-") { p.y = Math.floor((p.y + p.h) / T) * T - p.h; p.climbing = false; p.onGround = true; }
    }
    if (p.climbing && !poleAt(p.y + 6)) { p.climbing = false; }
    /* step sideways off the pole, but only onto floor */
    if (p.climbing && ax) {
      const nx = p.x + ax * 10, fy0 = Math.floor((p.y + p.h - 4) / T);
      const floorAt = fy => [Math.floor(nx / T), Math.floor((nx + p.w - 1) / T)].some(tx => { const c = tileAt(lv, tx, fy); return isSolid(c) || c === "-"; });
      const fy = [fy0, fy0 + 1, fy0 + 2].find(floorAt) ?? -1, feet = fy * T;
      if (fy >= 0 && Math.abs(feet - (p.y + p.h)) <= 20 && rectClear(lv, nx, feet - p.h, p.w, p.h)) {
        p.climbing = false; p.y = feet - p.h; p.x = nx; p.vx = ax; p.vy = 0; p.poleCool = 10;
      }
    }
    if (p.climbing && p.buffer > 0) {
      p.climbing = false; p.buffer = 0; p.poleCool = 12;
      p.vy = -2.6; p.vx = ax * KP.jumpCarry; sfx("jump");
    }
  }

  if (!p.climbing && !lv.swim) {
    const busy = p.crouch > 0 || p.compress > 0;
    const stance = p.shootT > 0 && p.onGround && !p.pogo;

    /* walk: a quick build to top speed, an instant stop on reversing, and
       friction when nothing is held */
    if (p.pushT > 0) { p.pushT--; p.vx = p.pushV; }
    else if (busy || stance) { /* crouching, compressing or firing: feet planted */ }
    else if (p.onGround && !p.pogo) {
      if (ax) {
        if (Math.sign(p.vx) === -ax) p.vx = 0;
        p.vx += ax * (ice ? KP.walkAccel / 3 : KP.walkAccel);
      } else p.vx -= Math.sign(p.vx) * Math.min(Math.abs(p.vx), ice ? KP.airFriction : KP.groundFriction);
    } else {
      if (ax) p.vx += ax * (p.pogo ? KP.pogoAirAccel : KP.airAccel);
      else if (!p.pogo) p.vx -= Math.sign(p.vx) * Math.min(Math.abs(p.vx), KP.airFriction);
    }
    if (Math.abs(p.vx) > KP.walkMax) p.vx = Math.sign(p.vx) * KP.walkMax;

    /* jump: a crouch first. Holding jump through the crouch is a full jump;
       letting go early is a shorter one. Then he leaves the ground carrying
       whatever direction is held. Down + jump drops through a ledge. */
    if (p.onGround) p.coyote = 4; else if (p.coyote > 0) p.coyote--;
    if (!p.pogo && !busy && p.buffer > 0 && p.coyote > 0) {
      const under = tileAt(lv, Math.floor(cx / T), Math.floor((p.y + p.h + 1) / T));
      if (D && (under === "-" || p.riding)) { p.dropT = 10; p.y += 2; p.riding = null; }
      else { p.crouch = KP.jumpCrouch; p.crouchHeld = 0; p.vx = ice ? p.vx : 0; }
      p.buffer = 0; p.coyote = 0;
    }
    if (p.crouch > 0) {
      if (isDown("jump")) p.crouchHeld++;
      if (--p.crouch === 0) {
        p.vy = -KP.jumpSpeed * Math.max(1, p.crouchHeld) / KP.jumpCrouch;
        p.vx = ax ? ax * KP.jumpCarry : 0;
        p.onGround = false;
        sfx("jump");
      }
    }

    /* the pogo: it compresses on landing, then fires him up -- high if jump
       is held as it goes, low if not. Horizontal speed is kept. */
    if (p.compress > 0) {
      if (isDown("jump")) p.pogoBigAsk = true;
      if (--p.compress === 0) {
        const big = p.pogoBigAsk || isDown("jump");
        p.vy = -(big ? KP.pogoBig : KP.pogoSmall);
        p.onGround = false; p.land = 4;
        sfx(big ? "bigpogo" : "pogo");
      }
    }

    if (!busy) {
      p.vy = Math.min(p.vy + KP.gravity, KP.maxFall);
      const wasGround = p.onGround, prevVy = p.vy, vx = p.vx;
      const hit = moveBody(lv, p);
      if (hit.top && prevVy < 0) sfx("bump");
      if (p.onGround && !wasGround) p.land = 6;
      if (p.pogo && p.onGround) { p.compress = KP.pogoCompress; p.pogoBigAsk = isDown("jump"); p.vx = vx; }
    }
    /* a conveyor carries whatever stands on it */
    if (p.onGround && BELT[underfoot]) moveX(lv, p, BELT[underfoot], {});
  }

  /* fire: one shot per press, at most one every seven ticks. On the ground
     he plants his feet to fire; in the air he keeps his momentum. Firing
     takes him off the pogo. */
  if (wasPressed("fire") && p.fireCool === 0 && !lv.swim) {
    p.fireCool = KP.refire; p.shootT = KP.fireStance;
    if (p.pogo && !p.climbing) { p.pogo = false; p.y += POGO_H; p.h = PH; p.compress = 0; }
    if (p.onGround) p.vx = 0;
    if (run.ammo > 0) {
      run.ammo--;
      const sy = p.y + (p.climbing ? 8 : 12);
      lv.shots.push({ kind: "zap", x: p.face > 0 ? p.x + p.w : p.x - 5, y: sy, w: 5, h: 2, vx: KP.shotSpeed * p.face, t: 0, mine: true });
      sfx("shoot");
    } else { sfx("click"); if (!seen("noammo")) toast(say("noAmmo", "Click. The raygun is empty. Look for charges.")); }
  }

  if (!p.onGround && !p.climbing) p.anim = 0; else if (Math.abs(p.vx) > 0.3) p.anim += Math.abs(p.vx) * 0.09; else p.anim = 0;

  /* falling out of the world */
  if (p.y > lv.h * T + 8) return die(lv);

  /* hazards */
  const hx0 = Math.floor((p.x + 2) / T), hx1 = Math.floor((p.x + p.w - 3) / T);
  const hy0 = Math.floor((p.y + 2) / T), hy1 = Math.floor((p.y + p.h - 1) / T);
  for (let ty = hy0; ty <= hy1; ty++) for (let tx = hx0; tx <= hx1; tx++) {
    const r = hazardRect(tileAt(lv, tx, ty));
    if (r && overlap({ x: p.x + 2, y: p.y + 2, w: p.w - 4, h: p.h - 2 }, { x: tx * T + r[0], y: ty * T + r[1], w: r[2], h: r[3] })) return die(lv);
  }

  /* doors: walk into one holding its gem */
  for (const dx of [-1, p.w]) {
    const tx = Math.floor((p.x + dx) / T);
    for (let ty = hy0; ty <= hy1; ty++) {
      const d = DOOR_CH[tileAt(lv, tx, ty)];
      /* a silver door's colour isn't in the maps: any keycard opens it */
      if (d !== undefined && (lv.keys[d] || d === 4 && lv.keys.some(Boolean))) openDoor(lv, tx, ty);
      else if (d !== undefined && !lv.warned) { lv.warned = true; toast(say("lockedDoor", c => c ? `A ${c} door. It needs a ${c} keycard.` : "A locked door. It needs a keycard.", d === 4 ? null : GEM_NAMES[d])); }
    }
  }

  /* things to pick up */
  const pb = { x: p.x, y: p.y, w: p.w, h: p.h };
  for (const it of lv.items) {
    if (it.gone || !overlap(pb, { x: it.x + 3, y: it.y + 3, w: 10, h: 12 })) continue;
    collect(lv, it);
  }

  if (p.state !== "play") return;

  /* the ways out: an exit door, or the map's edge where the map says so */
  for (let ty = hy0; ty <= hy1; ty++) for (let tx = Math.floor(p.x / T); tx <= Math.floor((p.x + p.w - 1) / T); tx++) {
    const k = tx + "," + ty;
    if (lv.edge.has(k)) return finishBy(lv, "edge");
    if (lv.secretAt.has(k)) return finishBy(lv, "secret");
    const door = lv.exitAt[k];
    if (door) { p.x = door.x + T / 2 - p.w / 2; return finishBy(lv, door); }
  }

  /* someone to rescue */
  for (const n of lv.npcs) if (!n.saved && overlap(pb, n)) { n.saved = true; popup(n, "SAVED"); return finishBy(lv, n); }
}

/* Swimming: the arrows push him every way, he drifts and slowly sinks,
 * and jump is a stroke upward. */
const SWIM = { accel: 0.07, max: 1.4, drag: 0.96, sink: 0.012, stroke: 1.3 };
function swimMove(lv, p, ax, U, D) {
  p.climbing = false; p.pogo = false; p.h = PH; p.poleCool = 2; p.crouch = p.compress = 0;
  const ay = (D ? 1 : 0) - (U ? 1 : 0);
  p.vx = (p.vx + ax * SWIM.accel) * SWIM.drag;
  p.vy = (p.vy + ay * SWIM.accel + SWIM.sink) * SWIM.drag;
  if (p.buffer > 0) { p.buffer = 0; p.vy -= SWIM.stroke; sfx("jump"); }
  p.vx = Math.max(-SWIM.max, Math.min(SWIM.max, p.vx));
  p.vy = Math.max(-SWIM.max * 1.5, Math.min(SWIM.max, p.vy));
  moveBody(lv, p);
  p.anim += 0.08;
  if (lv.t % 40 === 0) lv.fx.push({ kind: "bubble", x: p.x + (p.face > 0 ? p.w : 0), y: p.y + 4, t: 0 });
}

/* the "x,y" keys of the tiles a body overlaps */
function tilesUnder(b) {
  const out = [];
  for (let ty = Math.floor(b.y / T); ty <= Math.floor((b.y + b.h - 1) / T); ty++)
    for (let tx = Math.floor(b.x / T); tx <= Math.floor((b.x + b.w - 1) / T); tx++) out.push(tx + "," + ty);
  return out;
}

/* the keycard goes in, and its door opens, top to bottom */
function fillSocket(lv, s) {
  s.filled = true; lv.keys[s.gem] = false;
  s.door.forEach(([x, y], i) => {
    if (SOCKET_DOOR[lv.tiles[y][x]] === undefined) return;
    lv.tiles[y][x] = ".";
    lv.fx.push({ kind: "poof", x: x * T + 3, y: y * T + 5, t: -i * 4 });
  });
  sfx("door");
}

/* a bridge switch: the deck goes solid, or goes away. Not out from under
 * someone standing in its row: it waits until they are clear. */
function flipBridge(lv, b) {
  b.on = !b.on;
  for (const [x, y] of b.deck) lv.tiles[y][x] = b.on ? "#" : ".";
  if (b.on && !rectClear(lv, lv.p.x, lv.p.y, lv.p.w, lv.p.h)) { b.on = false; for (const [x, y] of b.deck) lv.tiles[y][x] = "."; sfx("nope"); return; }
  sfx("click");
}

/* ------------------------------------------------------------------ */
/* moving platforms. Two tiles wide; stood on from above, jumped through
 * from below, and they carry whoever stands on them.                     */

const DIRS = { N: [0, -1], NE: [1, -1], E: [1, 0], SE: [1, 1], S: [0, 1], SW: [-1, 1], W: [-1, 0], NW: [-1, -1],
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0], horizontal: [1, 0], vertical: [0, 1] };

function makePlat(name, x, y) {
  let m, kind = "static", dir = [0, 0];
  let dirName = null;
  if ((m = /\(start (\w+)\)/.exec(name))) { kind = "arrow"; dir = DIRS[m[1]]; dirName = m[1]; }
  else if ((m = /\((moving \w+|horizontal|vertical)\)/.exec(name))) { kind = "line"; dir = DIRS[m[1].replace("moving ", "")]; }
  else if (/Dropping/.test(name)) kind = "drop";
  else if (/Sneaky/.test(name)) kind = "sneaky";
  return { kind, x, y, x0: x, y0: y, w: T * 2, h: 8, dx: 0, dy: 0, dir: dir.slice(), dirName, vy: 0, wait: false };
}

/* a platform switch: its marker comes and goes */
function flipPlatSwitch(lv, s) {
  s.on = !s.on;
  const k = s.tx + "," + s.ty;
  if (lv.pmark.has(k)) lv.pmark.delete(k); else lv.pmark.set(k, s.mark);
  sfx("click");
}

/* is a platform's leading edge going into a wall? */
function platWalled(lv, pl, dir) {
  const [ux, uy] = dir;
  const xs = ux > 0 ? [Math.floor((pl.x + pl.w) / T)] : ux < 0 ? [Math.floor((pl.x - 1) / T)] : [Math.floor(pl.x / T), Math.floor((pl.x + pl.w - 1) / T)];
  const ys = uy > 0 ? [Math.floor((pl.y + T) / T)] : uy < 0 ? [Math.floor((pl.y - 1) / T)] : [Math.floor(pl.y / T)];
  for (const tx of xs) for (const ty of ys) if (isSolid(tileAt(lv, tx, ty))) return true;
  return false;
}

function updatePlats(lv) {
  const p = lv.p;
  for (const pl of lv.plats) {
    const ox = pl.x, oy = pl.y, ridden = p.riding === pl;
    if (pl.kind === "line") {
      /* to and fro: turns back once its own tile (its top-left) reaches a
         blocker, or when its leading edge meets a wall */
      if (pl.x % T === 0 && pl.y % T === 0) {
        const atBlock = (pl.x !== pl.x0 || pl.y !== pl.y0) && lv.pmark.get(pl.x / T + "," + pl.y / T) === "B";
        if (atBlock || platWalled(lv, pl, pl.dir)) { pl.dir = [-pl.dir[0], -pl.dir[1]]; if (platWalled(lv, pl, pl.dir)) pl.dir = [0, 0]; }
      }
      pl.x += pl.dir[0]; pl.y += pl.dir[1];
    } else if (pl.kind === "arrow") {
      /* on each tile it takes the direction of the arrow there; it waits at a blocker */
      if (pl.x % T === 0 && pl.y % T === 0) {
        const mk = lv.pmark.get(pl.x / T + "," + pl.y / T);
        pl.wait = mk === "B";
        if (mk && mk !== "B") pl.dir = DIRS[mk].slice();
      }
      if (!pl.wait) { pl.x += pl.dir[0]; pl.y += pl.dir[1]; }
    } else if (pl.kind === "drop") {
      /* sinks under a rider, faster and faster; comes back up when left */
      if (ridden) { pl.vy = Math.min(pl.vy + 0.08, 3); if (!isSolid(tileAt(lv, Math.floor((pl.x + T) / T), Math.floor((pl.y + pl.vy + T) / T)))) pl.y += pl.vy; }
      else { pl.vy = 0; if (pl.y > pl.y0) pl.y = Math.max(pl.y0, pl.y - 1); }
    } else if (pl.kind === "sneaky") {
      /* jump at it and it slides out of reach; then drifts back */
      const pc = p.x + p.w / 2, mid = pl.x0 + T;
      if (!p.onGround && p.state === "play" && Math.abs(pc - mid) < T * 3 && p.y + p.h < pl.y) pl.flee = pc < mid ? 1 : -1;
      else if (p.onGround && !ridden) pl.flee = 0;
      const want = pl.x0 + (pl.flee || 0) * T * 2;
      pl.x += Math.sign(want - pl.x) * Math.min(Math.abs(want - pl.x), pl.flee ? 4 : 1);
    }
    /* never off the map: back the way it came */
    if (pl.x < 0 || pl.x + pl.w > lv.w * T || pl.y < 0 || pl.y + T > lv.h * T) { pl.x = ox; pl.y = oy; pl.dir = [-pl.dir[0], -pl.dir[1]]; }
    pl.dx = pl.x - ox; pl.dy = pl.y - oy;
  }
  /* carry the rider */
  const r = p.riding;
  if (r && p.state === "play" && !p.climbing) {
    if (r.dx) moveX(lv, p, r.dx, {});
    if (r.dy) { p.y += r.dy; if (r.dy < 0 && !rectClear(lv, p.x, p.y, p.w, p.h)) { p.y -= r.dy; p.riding = null; } }
  }
}

/* land on a platform: a body falling through a platform's top this tick */
function landOnPlat(lv, b, prevBottom) {
  for (const pl of lv.plats) {
    if (b.x + b.w <= pl.x || b.x >= pl.x + pl.w) continue;
    const top = pl.y;
    if (prevBottom <= Math.max(top, top - pl.dy) + 1 && b.y + b.h >= top) return pl;
  }
  return null;
}

function drawPlats(lv, cx, cy) {
  for (const pl of lv.plats) {
    const x = Math.round(pl.x) - cx, y = Math.round(pl.y) - cy;
    if (x < -pl.w || x > W || y < -16 || y > H) continue;
    ctx.drawImage(lv.art.platform[pl.kind === "drop" ? 1 : pl.kind === "static" ? 2 : 0][(lv.t >> 3) % 2], x, y);
  }
}

/* the warp door Poom is standing in, as its target, or null. The tile
 * under his middle wins, so each half of a door goes to its own place. */
/* the hint sign Poom is standing at, if any */
function signAt(lv, p) {
  return lv.signs.find(s => p.x < s.x + T && p.x + p.w > s.x && p.y < s.y + T && p.y + p.h > s.y) || null;
}
/* a sign's words: its book's signs[level], a string or a list (one per
 * sign in the level, in reading order); else a placeholder */
function readSign(lv, s) {
  const B = BOOK_TEXT[lv.def.book], said = B && B.signs && B.signs[lv.n];
  const text = Array.isArray(said) ? said[s.n] || said[said.length - 1] : said;
  sfx("click");
  message(text || say("signBlank", "The sign is too faded to read."));
}

function warpAt(lv, p) {
  const mid = Math.floor((p.x + p.w / 2) / T);
  let found = null;
  for (let ty = Math.floor(p.y / T); ty <= Math.floor((p.y + p.h - 1) / T); ty++)
    for (let tx = Math.floor(p.x / T); tx <= Math.floor((p.x + p.w - 1) / T); tx++) {
      const t = lv.warp[tx + "," + ty];
      if (t && (tx === mid || !found)) found = t;
    }
  return found;
}

/* arrive with his feet in the target tile; if that's no room, a little higher */
function warpTo(lv, p, [tx, ty]) {
  lv.fx.push({ kind: "poof", x: p.x, y: p.y + 6, t: 0 });
  if (p.pogo) { p.pogo = false; p.h = PH; }
  p.x = tx * T + (T - p.w) / 2; p.y = (ty + 1) * T - p.h;
  for (let up = 0; up < 3 && !rectClear(lv, p.x, p.y, p.w, p.h); up++) p.y -= T;
  p.vx = p.vy = 0; p.crouch = p.compress = 0; p.poleCool = 12;
  lv.fx.push({ kind: "poof", x: p.x, y: p.y + 6, t: 0 });
  sfx("door");
  centerCamera(true);
}

/* the level is over: Poom heads out, then finishLevel */
function finishBy(lv, how) {
  const p = lv.p;
  if (p.state !== "play") return;
  if (p.pogo) { p.pogo = false; p.y += POGO_H; p.h = PH; }
  p.state = "exit"; p.t = 0; p.vx = 0; lv.exitUsed = how;
  sfx("done");
}

function openDoor(lv, tx, ty) {
  const c = lv.tiles[ty][tx];
  let y0 = ty, y1 = ty;
  while (lv.tiles[y0 - 1] && lv.tiles[y0 - 1][tx] === c) y0--;
  while (lv.tiles[y1 + 1] && lv.tiles[y1 + 1][tx] === c) y1++;
  for (let y = y0; y <= y1; y++) { lv.tiles[y][tx] = lv.back[y][tx] ? "+" : "."; lv.fx.push({ kind: "poof", x: tx * T + 3, y: y * T + 5, t: 0 }); }
  sfx("door");
}

function collect(lv, it) {
  const r = G.run;
  it.gone = true;
  if (POINTS[it.kind]) { addScore(POINTS[it.kind]); popup(it, String(POINTS[it.kind])); sfx(POINTS[it.kind] >= 1000 ? "bigitem" : "item"); }
  else if (it.kind === "ammo") { r.ammo += 5; popup(it, "+5"); sfx("pick"); if (!seen("ammo")) message(say("ammo", "<b>Raygun charge!</b> Five shots. Fire with <kbd>Space</kbd> or <kbd>C</kbd>.")); }
  else if (it.kind === "life") { r.lives++; popup(it, "1UP"); sfx("life"); }
  else if (it.kind === "gem") { lv.keys[it.gem] = true; sfx("gem"); popup(it, GEM_NAMES[it.gem].toUpperCase()); }
  else if (it.kind === "pogo") {
    r.pogo = true; sfx("bigitem");
    message(say("pogo", "<b>You found a pogo stick!</b><br><br>Press <kbd>Alt</kbd> or <kbd>X</kbd> to hop on and off. Hold <kbd>Ctrl</kbd> or <kbd>Z</kbd> as you land for a big bounce."));
  }
  else if (it.kind === "swim") {
    r.swim = true; addScore(1000); popup(it, "1000"); sfx("bigitem");
    message(say("swim", "<b>You can swim!</b><br><br>On the map, Poom can wade in where the shore meets the water."));
    if (it.ends && --lv.endsLeft === 0) finishBy(lv, "objective");
  }
  else if (it.kind === "objective") {
    addScore(1000); popup(it, "1000"); sfx("bigitem");
    if (it.ends && --lv.endsLeft === 0) finishBy(lv, "objective");
  }
  else if (it.kind === "part") {
    r.parts[it.part] = true; sfx("bigitem"); addScore(1000);
    const have = r.parts.filter(Boolean).length;
    message(say("part", (name, n) => `<b>You found ${name}!</b><br><br>${n === 4 ? "That's all four. Back to the Catamaran!" : `${n} of 4 ship parts. Get it back to the Catamaran.`}`, PART_NAMES[it.part], have), { icon: ART.parts[it.part] });
  }
}

function popup(at, text) { if (at && G.lv) G.lv.fx.push({ kind: "text", x: at.x + 8, y: at.y, t: 0, text }); }

function die(lv) {
  const p = lv.p;
  if (p.state !== "play") return;
  if (p.pogo) { p.pogo = false; p.h = PH; }
  p.state = "dead"; p.t = 0; p.vy = -3; p.vx = (Math.random() - 0.5) * 2; p.climbing = false; p.crouch = p.compress = 0;
  sfx("die");
}

/* ------------------------------------------------------------------ */
/* creatures                                                             */

const ENEMY = {
  /* speeds after Keen 1's yorp, garg, vorticon, butler robot and tank robot */
  x: { w: 12, h: 11, hp: 1, art: "mousel", points: 0, speed: 19 / 32 },
  B: { w: 14, h: 12, hp: 1, art: "barker", points: 200, speed: 19 / 32 },
  V: { w: 14, h: 28, hp: 4, art: "vac", points: 500, speed: 28 / 32 },
  T: { w: 13, h: 8, hp: Infinity, art: "roombot", points: 0, speed: 28 / 32 },
  K: { w: 13, h: 10, hp: Infinity, art: "tank", points: 0, speed: 28 / 32 },
  W: { w: 28, h: 56, hp: 10, art: "boss", points: 5000, speed: 0.9, scale: 2 },
  /* the books': a lieutenant walks and jumps like a vacuumoid but takes five
     shots; a turret is fixed, can't be hurt, and fires along its barrel */
  L: { w: 14, h: 28, hp: 5, art: "lieut", points: 1000, speed: 28 / 32 },
  G: { w: 12, h: 10, hp: Infinity, art: "turret", points: 0, speed: 0 },
};

/* Which engine creature each book's numbered enemy types are
 * (docs/story/book-1-story.md): Book 1's Glowmice (01) push like mousels,
 * scrap hounds (02) charge like barkers, Scrappers (04) are vacuumoids,
 * Sentrybots (05) shove like roombots, the lieutenants (03) are L. Turrets
 * are G in every book. Books not listed have no enemies yet. */
const ENEMY_OF = { H: { "01": "x", "02": "B", "03": "L", "04": "V", "05": "T" } };
const TURRET_DIR = { "up-left": [-1, -1], "up-right": [1, -1], up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function makeEnemy(c, x, bottom) {
  const d = ENEMY[c];
  return { type: c, ...d, x: x + (T - d.w) / 2, y: bottom - d.h, vx: d.speed * (Math.random() < 0.5 ? -1 : 1), vy: 0, face: 1,
    onGround: false, state: "walk", t: (Math.random() * 120) | 0, flash: 0, alive: true };
}

function updateEnemy(lv, e) {
  const p = lv.p;
  e.t++;
  if (e.flash > 0) e.flash--;
  const dxp = (p.x + p.w / 2) - (e.x + e.w / 2), dyp = (p.y + p.h) - (e.y + e.h);
  const sees = Math.abs(dxp) < 150 && Math.abs(dyp) < 24 && p.state === "play";

  switch (e.type) {
    case "x": {
      /* a yorp: stunned about two seconds, looks about a second, hops low */
      if (e.state === "stunned") { e.vx = 0; if (e.t > 120) { e.state = "walk"; e.t = 0; e.vx = e.speed * (dxp > 0 ? 1 : -1); } break; }
      if (e.state === "look") { e.vx = 0; e.face = dxp > 0 ? 1 : -1; if (e.t > 64) { e.state = "walk"; e.t = 0; e.vx = e.speed * e.face; } break; }
      if (e.onGround && Math.random() < 0.008) e.vy = -40 / 32 * 1.6;
      if (e.onGround && Math.random() < 0.006) { e.state = "look"; e.t = 0; }
      break;
    }
    case "B": {
      if (e.state === "walk") {
        if (e.onGround && !floorAhead(lv, e)) e.vx = -e.vx;
        if (sees && Math.sign(dxp) === Math.sign(e.vx) && Math.abs(dxp) < 130) { e.state = "growl"; e.t = 0; }
      } else if (e.state === "growl") {
        e.vx = 0; e.face = dxp > 0 ? 1 : -1;
        if (e.t > 22) { e.state = "charge"; e.t = 0; e.vx = 68 / 32 * e.face; sfx("push"); }
      } else if (e.state === "charge") {
        if (e.onGround && !floorAhead(lv, e) || e.t > 140) { e.state = "walk"; e.t = 0; e.vx = -e.speed * Math.sign(e.vx || 1); }
      }
      break;
    }
    case "G": {
      /* a turret: every so often, when Poom is near, a shot along the barrel */
      if (e.t % 100 === 0 && Math.abs(dxp) < 220 && Math.abs(dyp) < 160 && p.state === "play") {
        const [ax, ay] = e.aim, n = Math.hypot(ax, ay) || 1;
        lv.shots.push({ kind: "hairball", x: e.x + e.w / 2 + ax * 7 - 3, y: e.y + ay * 7, w: 6, h: 6, vx: 2.4 * ax / n, vy: 2.4 * ay / n, t: 0 });
        sfx("tank");
      }
      return;
    }
    case "V": case "W": case "L": {
      const sp = e.speed;
      if (sees || e.type === "W" && Math.abs(dxp) < 200) e.vx = sp * Math.sign(dxp || 1) * (e.type === "W" ? 1.2 : 1);
      /* a vorticon's jump: 90 to 150 sub-units a tick, at random */
      if (e.onGround && e.t > (e.type === "W" ? 70 : 90) && Math.random() < 0.04) { e.vy = -(90 + Math.random() * 60) / 32 * (e.type === "W" ? 1.15 : 1); e.t = 0; }
      if (e.type === "W" && e.onGround && e.t % 100 === 50 && Math.abs(dxp) < 220) {
        lv.shots.push({ kind: "hairball", x: e.x + (e.face > 0 ? e.w : -6), y: e.y + 20, w: 6, h: 6, vx: 2.4 * Math.sign(dxp || 1), t: 0 });
        sfx("tank");
      }
      break;
    }
    case "T": {
      if (e.onGround && !floorAhead(lv, e)) e.vx = -e.vx;
      break;
    }
    case "K": {
      if (e.state === "walk") {
        if (e.onGround && !floorAhead(lv, e)) e.vx = -e.vx;
        if (e.t > 130 && sees && Math.sign(dxp) === Math.sign(e.vx)) { e.state = "aim"; e.t = 0; e.keep = e.vx; e.vx = 0; }
      } else if (e.state === "aim") {
        if (e.t === 30) {
          lv.shots.push({ kind: "hairball", x: e.face > 0 ? e.x + e.w : e.x - 6, y: e.y + 3, w: 6, h: 6, vx: KP.shotSpeed * e.face, t: 0 });
          sfx("tank");
        }
        if (e.t > 56) { e.state = "walk"; e.t = 0; e.vx = e.keep; }
      }
      break;
    }
  }

  if (e.vx) e.face = Math.sign(e.vx);
  e.vy = Math.min(e.vy + KP.gravity, e.type === "V" || e.type === "W" || e.type === "L" ? 6 : KP.maxFall);
  const hit = moveBody(lv, e, true);
  if (hit.left || hit.right) {
    if (e.type === "B" && e.state === "charge") { e.state = "walk"; e.t = 0; }
    e.vx = hit.left ? Math.abs(e.speed) : -Math.abs(e.speed);
  }
  if (e.y > lv.h * T + 40) e.alive = false;

  /* touching Poom */
  if (p.state !== "play" || !overlap(e, p)) return;
  const fromAbove = p.vy > 0 && p.y + p.h - p.vy <= e.y + 5;
  if (e.type === "x") {
    if (e.state === "stunned") return;
    if (fromAbove) { e.state = "stunned"; e.t = 0; p.vy = p.pogo ? -KP.pogoSmall : -2; sfx("stun"); return; }
    p.pushV = dxp > 0 ? 1.4 : -1.4; p.pushT = 8; if (!(e.t % 8)) sfx("push");
  } else if (e.type === "T" || e.type === "K") {
    if (fromAbove && e.type === "K") { p.vy = -3; return; }
    /* the butler robot's shove is 60 sub-units, the tank's 16 */
    p.pushV = (dxp > 0 ? 1 : -1) * (e.type === "T" ? 60 / 32 : 1); p.pushT = e.type === "T" ? 14 : 8;
    if (!(e.t % 10)) sfx("push");
  } else die(lv);
}

function hurtEnemy(lv, e, shot) {
  if (e.hp === Infinity) { sfx("ricochet"); return; }
  e.hp--; e.flash = 6;
  if (e.hp <= 0) {
    e.alive = false; sfx("kill");
    const big = e.type === "W";
    for (let i = 0; i < (big ? 6 : 1); i++) lv.fx.push({ kind: "poof", x: e.x + e.w / 2 - 5 + (big ? (Math.random() - .5) * 30 : 0), y: e.y + e.h / 2 - 3 + (big ? (Math.random() - .5) * 40 : 0), t: -i * 5 });
    if (e.points) { addScore(e.points); popup({ x: e.x + e.w / 2 - 8, y: e.y }, String(e.points)); }
    if (big) message(say("bossDown", "<b>The Grand Vacuumoid has been unplugged!</b><br><br>Grab the Laser Pointer and get out of here."));
  } else sfx("hit");
}

function updateShots(lv) {
  for (const s of lv.shots) {
    s.t++;
    s.x += s.vx; s.y += s.vy || 0;
    const c = tileAt(lv, Math.floor((s.x + s.w / 2) / T), Math.floor((s.y + s.h / 2) / T));
    if (isSolid(c) || s.t > 120) { s.gone = true; lv.fx.push({ kind: "poof", x: s.x - 2, y: s.y - 2, t: 0 }); continue; }
    if (s.mine) {
      for (const e of lv.ents) if (e.alive && overlap(s, e)) { s.gone = true; lv.fx.push({ kind: "poof", x: s.x - 2, y: s.y - 2, t: 0 }); hurtEnemy(lv, e, s); break; }
      /* an objective can be shot as well as picked up: the maps' boss weak points */
      if (!s.gone) for (const it of lv.items) if (!it.gone && it.kind === "objective" && overlap(s, { x: it.x + 2, y: it.y + 2, w: 12, h: 12 })) { s.gone = true; lv.fx.push({ kind: "poof", x: it.x + 3, y: it.y + 3, t: 0 }); collect(lv, it); break; }
    } else if (lv.p.state === "play" && overlap(s, { x: lv.p.x + 2, y: lv.p.y + 2, w: lv.p.w - 4, h: lv.p.h - 4 })) { s.gone = true; die(lv); }
  }
  lv.shots = lv.shots.filter(s => !s.gone);
}

/* ------------------------------------------------------------------ */
/* playing a level                                                       */

function startLevel(n) {
  dressFor(MAPS[n].book);
  G.lv = loadLevel(n);
  G.lv.snapshot = JSON.parse(JSON.stringify(G.run));
  G.mode = "level";
  centerCamera(true);
  sfx("enter");
  mapLabel("");   /* the map's place name is the map's: not over a level */
  levelTitle(levelName(n));
}

function updateLevel() {
  const lv = G.lv;
  lv.t++;
  updatePlats(lv);
  updatePlayer(lv);
  if (G.mode !== "level") return;
  for (const e of lv.ents) if (e.alive && Math.abs(e.x - lv.p.x) < 400) updateEnemy(lv, e);
  lv.ents = lv.ents.filter(e => e.alive);
  updateShots(lv);
  for (const f of lv.fx) { f.t++; if (f.kind === "text") f.y -= 0.5; if (f.kind === "bubble") { f.y -= 0.6; f.x += Math.sin(f.t / 6) * 0.3; } }
  lv.fx = lv.fx.filter(f => f.t < (f.kind === "text" ? 50 : f.kind === "bubble" ? 90 : 12));
  centerCamera(false);
}

function centerCamera(snap) {
  const lv = G.lv, p = lv.p, c = G.cam;
  const px = p.x + p.w / 2, py = p.y + p.h / 2;
  let tx = c.x, ty = c.y;
  if (px - c.x > W / 2 + 20) tx = px - W / 2 - 20;
  if (px - c.x < W / 2 - 20) tx = px - W / 2 + 20;
  if (py - c.y > 120) ty = py - 120;
  if (py - c.y < 70) ty = py - 70;
  if (snap) { tx = px - W / 2; ty = py - H / 2; }
  tx = Math.max(0, Math.min(lv.w * T - W, tx));
  ty = Math.max(0, Math.min(lv.h * T - H, ty));
  if (lv.h * T < H) ty = (lv.h * T - H) / 2;
  c.x = snap ? tx : c.x + (tx - c.x) * 0.5;
  c.y = snap ? ty : c.y + (ty - c.y) * 0.25;
}

function finishLevel() {
  const n = G.lv.n, r = G.run, secret = G.lv.exitUsed === "secret" && G.lv.def.secret;
  r.done[n] = true;
  G.lv = null;
  /* a secret exit: straight into the secret level, with Poom left on its
     part of the map for after */
  if (secret) {
    const spot = nearestOpen(...world().first[secret]);
    if (spot) { r.mx = spot[0] * T + 4; r.my = spot[1] * T + 5; }
    enterMap();
    saveRun();
    startLevel(secret);
    return;
  }
  /* the whole book done: on to the next, or the end. A book with a ship
     ends at the ship instead */
  if (!world().ship && world().need.every(id => r.done[id])) { bookDone(); return; }
  enterMap();
  saveRun();
  if (Object.values(world().barrier).includes(n)) setTimeout(() => toast(say("wayOpens", "Somewhere on the map, the way opens.")), 300);
}

function bookDone() {
  const r = G.run, next = BOOK_IDS[BOOK_IDS.indexOf(r.book) + 1];
  if (!next) { ending(); return; }
  const was = r.book, pages = BOOK_TEXT[was] && BOOK_TEXT[was].ending;
  /* a book with its own ending plays it before moving on */
  if (pages) playPages(pages(r.score, bookNumber(next)), moveOn);
  else moveOn();
  function moveOn() {
    r.book = next; r.mx = r.my = null; r.swim = false;
    r.parts = [false, false, false, false]; r.aboard = [false, false, false, false];
    enterMap();
    saveRun();
    if (!pages) message(`<b>Book ${bookNumber(was)} is done!</b><br><br>On to Book ${bookNumber(next)}.`);
  }
}
/* a run of message pages, then done */
function playPages(pages, done) {
  let i = 0;
  const next = () => { if (i >= pages.length) { done(); return; } message(pages[i++], { onClose: next }); };
  next();
}

/* the ship: Poom brings back what he's found; with all four parts aboard,
 * the book is done */
function boardShip() {
  const r = G.run;
  if (!r.aboard) r.aboard = [false, false, false, false];
  const brought = r.parts.map((h, i) => h && !r.aboard[i] ? i : -1).filter(i => i >= 0);
  brought.forEach(i => { r.aboard[i] = true; });
  if (r.aboard.every(Boolean)) {
    sfx("done");
    saveRun();
    message(say("shipWhole", last => `<b>The Catamaran is whole again!</b>${last ? `<br><br>Poom bolts in ${last}.` : ""}`, brought.length ? PART_NAMES[brought[brought.length - 1]] : null), { iconRow: r.aboard, onClose: bookDone });
    return;
  }
  const missing = r.aboard.map((h, i) => h ? null : PART_NAMES[i]).filter(Boolean);
  const list = missing.join(", ").replace(/, ([^,]*)$/, " and $1");
  if (brought.length) { sfx("bigitem"); saveRun(); }
  else sfx("nope");
  message(say("shipMissing", (fits, still) => `<b>The Catamaran</b><br><br>${fits ? `Poom fits ${fits}. ` : ""}It still won't fly without ${still}.`, brought.map(i => PART_NAMES[i]).join(" and "), list), { iconRow: r.aboard });
}
function onShip(p) {
  const s = world().ship;
  if (!s) return false;
  const tx = Math.floor((p.x + p.w / 2) / T), ty = Math.floor((p.y + p.h / 2) / T);
  return ty === s[1] && (tx === s[0] || tx === s[0] + 1);
}

function loseLife() {
  const snap = G.lv.snapshot;
  G.run = snap;
  G.run.lives--;
  G.lv = null;
  if (G.run.lives < 0) { G.run.lives = 0; gameOver(); return; }
  enterMap();
  saveRun();
  message(say("lostLife", n => n === 0 ? "Poom shakes it off.<br><br><b>This is your last life.</b>" : `Poom shakes it off.<br><br>${n} ${n === 1 ? "life" : "lives"} left.`, G.run.lives));
}

/* ------------------------------------------------------------------ */
/* the world map                                                         */

function enterMap() {
  G.mode = "map";
  dressFor(G.run.book);
  const m = G.map;
  if (G.run.mx === null) {
    const [sx, sy] = world().start;
    G.run.mx = sx * T + 4; G.run.my = sy * T + 5;
  }
  /* a small box: the maps' diagonal passages are narrow */
  m.p = { x: G.run.mx, y: G.run.my, w: 8, h: 6, dir: "down", anim: 0 };
  mapCamera(true);
}

/* A world map's tile. A barrier is whatever the map has there until its
 * level is done, and open ground after. */
function mapTile(tx, ty) {
  const w = world(), need = w.barrier[tx + "," + ty];
  if (need && G.run.done[need]) return ".";
  return (w.rows[ty] || "")[tx] || "#";
}
function barrierOn(tx, ty) { const need = world().barrier[tx + "," + ty]; return !!need && !G.run.done[need]; }
function mapSolid(ch) { return ch === "#" || (ch === "~" && !G.run.swim); }
/* Is a pixel on the world map wall? On a world map / and \\ are diagonal
 * walls (maps2/README.md): wall below the diagonal, open above it, which is
 * what the tiles' own collision says (a top edge only, like a floor).
 * Walls both ways: Book A's order of play depends on it. */
function mapPointSolid(px, py) {
  const tx = Math.floor(px / T), ty = Math.floor(py / T), ch = mapTile(tx, ty);
  if (world().e1) { const lv = entranceAt(tx, ty); if (lv && !G.run.done[lv]) return true; }
  if (ch !== "/" && ch !== "\\") return mapSolid(ch);
  const u = (px - tx * T + 0.5) / T, v = (py - ty * T + 0.5) / T;
  return ch === "/" ? u + v > 1 : v > u;
}
/* the corners and edge midpoints of a box: a diagonal can poke between corners */
function boxPoints(x, y, w, h) {
  const xs = [x, x + w / 2, x + w - 1], ys = [y, y + h / 2, y + h - 1], out = [];
  for (const a of xs) for (const b of ys) if (a !== xs[1] || b !== ys[1]) out.push([a, b]);
  return out;
}
function entranceAt(tx, ty) { return world().entrance[tx + "," + ty] || null; }
/* the level Poom is at: the one underfoot, or on an E1 map, where levels
 * are walls until done, one he is right up against */
function mapHere(p) {
  const at = entranceAt(Math.floor((p.x + p.w / 2) / T), Math.floor((p.y + p.h / 2) / T));
  if (at || !world().e1) return at;
  /* within five pixels: enough to reach a level from the middle of the next tile */
  for (const [cx, cy] of boxPoints(p.x - 5, p.y - 5, p.w + 10, p.h + 10)) { const e = entranceAt(Math.floor(cx / T), Math.floor(cy / T)); if (e) return e; }
  return null;
}

function updateMap() {
  const m = G.map, p = m.p;
  const dx = (isDown("right") ? 1 : 0) - (isDown("left") ? 1 : 0), dy = (isDown("down") ? 1 : 0) - (isDown("up") ? 1 : 0);
  const sp = 1.4;
  const blocked = (x, y) => {
    for (const [cx, cy] of boxPoints(x, y, p.w, p.h)) {
      const ch = mapTile(Math.floor(cx / T), Math.floor(cy / T));
      if (ch === "~" && mapSolid(ch) && !m.waterWarned) { m.waterWarned = true; toast(say("water", "Water. Poom can't swim. Not yet.")); }
      if (mapPointSolid(cx, cy)) { if (barrierOn(Math.floor(cx / T), Math.floor(cy / T)) && !m.fieldWarned) { m.fieldWarned = true; toast(say("blocked", "Something blocks the way. Finish the levels nearby.")); } return true; }
    }
    return false;
  };
  if (dx && !blocked(p.x + dx * sp, p.y)) p.x += dx * sp;
  if (dy && !blocked(p.x, p.y + dy * sp)) p.y += dy * sp;
  if (dx || dy) { p.anim += 0.12; p.dir = dy < 0 ? "up" : dy > 0 ? "down" : dx < 0 ? "left" : "right"; }
  G.run.mx = p.x; G.run.my = p.y;
  m.t++;

  const ctx_ = Math.floor((p.x + p.w / 2) / T), cty = Math.floor((p.y + p.h / 2) / T);
  const here = mapHere(p);
  if (here && (wasPressed("jump") || wasPressed("fire"))) {
    if (G.run.done[here]) { toast(say("levelDone", name => `${name}: done.`, levelName(here))); sfx("nope"); }
    else { saveRun(); startLevel(here); }
  }
  if (!here && onShip(p) && (wasPressed("jump") || wasPressed("fire"))) boardShip();
  const tele = world().tele[ctx_ + "," + cty];
  if (tele && !here && (wasPressed("jump") || wasPressed("fire"))) teleport(tele);
  mapCamera(false);
}

/* the open map tile nearest a tile, within three: open for Poom's box */
function nearestOpen(tx, ty) {
  const open = (x, y) => !boxPoints(x * T + 4, y * T + 5, 8, 6).some(([a, b]) => mapPointSolid(a, b));
  for (let r = 0; r <= 3; r++)
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++)
      if (Math.max(Math.abs(dx), Math.abs(dy)) === r && open(tx + dx, ty + dy)) return [tx + dx, ty + dy];
  return null;
}

/* a teleporter: to its target tile, or the open tile nearest it */
function teleport([tx, ty]) {
  const p = G.map.p, spot = nearestOpen(tx, ty);
  if (!spot) { sfx("nope"); return; }
  p.x = spot[0] * T + (T - p.w) / 2; p.y = spot[1] * T + (T - p.h) / 2;
  G.run.mx = p.x; G.run.my = p.y;
  sfx("enter");
  mapCamera(true);
}

function mapCamera(snap) {
  const p = G.map.p, c = G.cam, mw = world().w * T, mh = world().h * T;
  let tx = Math.max(0, Math.min(mw - W, p.x + p.w / 2 - W / 2)), ty = Math.max(0, Math.min(mh - H, p.y + p.h / 2 - H / 2));
  c.x = snap ? tx : c.x + (tx - c.x) * 0.2; c.y = snap ? ty : c.y + (ty - c.y) * 0.2;
}

/* ------------------------------------------------------------------ */
/* drawing                                                               */

function drawLevel() {
  const lv = G.lv, c = G.cam, art = lv.art;
  const cx = Math.round(c.x), cy = Math.round(c.y);
  /* far background, parallax */
  const fx = -Math.round(cx * 0.25) % W;
  ctx.drawImage(lv.far, fx, 0); ctx.drawImage(lv.far, fx + W, 0);
  const tx0 = Math.floor(cx / T), ty0 = Math.floor(cy / T);
  const solidLike = ch => ch === "#" || ch === "=" || ch === "%" || ch === "i" || ch === "<" || ch === ">" || ch === "/" || ch === "\\";
  for (let ty = ty0; ty <= ty0 + Math.ceil(H / T); ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(W / T); tx++) {
    if (ty < 0 || ty >= lv.h || tx < 0 || tx >= lv.w) continue;
    const ch = lv.tiles[ty][tx], x = tx * T - cx, y = ty * T - cy;
    if (lv.back[ty][tx] && !solidLike(ch)) ctx.drawImage(art.bgwall, x, y);
    const v = (tx * 7 + ty * 13) % 3;
    if (ch === "#" && lv.deckAt.has(tx + "," + ty)) ctx.drawImage(art.bridge, x, y);
    else if (ch === "#" || ch === "%") ctx.drawImage(solidLike((lv.tiles[ty - 1] || [])[tx]) ? art.ground[v] : art.groundTop[v], x, y);
    else if (ch === "=") ctx.drawImage(art.brick, x, y);
    else if (ch === "-") ctx.drawImage(art.plat, x, y);
    else if (ch === "^") ctx.drawImage(art.spikes, x, y);
    else if (ch === "~") ctx.drawImage(art.liquid[(lv.t >> 3) % 4], x, y);
    else if (ch === "|") ctx.drawImage(art.pole, x, y);
    else if (DOOR_CH[ch] !== undefined) ctx.drawImage((lv.tiles[ty - 1] || [])[tx] === ch && art.doorsBelow ? art.doorsBelow[DOOR_CH[ch]] : art.doors[DOOR_CH[ch]], x, y);
    else if (SOCKET_DOOR[ch] !== undefined) ctx.drawImage((lv.tiles[ty - 1] || [])[tx] === ch && art.doorsBelow ? art.doorsBelow[SOCKET_DOOR[ch]] : art.doors[SOCKET_DOOR[ch]], x, y);
    else if (ch === "i") ctx.drawImage(art.ice, x, y);
    else if (ch === "H") ctx.drawImage(art.sign, x, y + (lv.signDrop[tx + "," + ty] || 0) * T);
    else if (BELT[ch]) ctx.drawImage(art.conveyor[ch === ">" ? 1 : 0][(lv.t >> 2) % 4], x, y);
    else if (ch === "/" || ch === "\\") { const sl = lv.slope[ty][tx]; ctx.drawImage(art.slope(sl[0], sl[1]), x, y); }
  }
  for (const s of lv.sockets) { ctx.drawImage(art.socket, s.x * T - cx, s.y * T - cy); if (s.filled) ctx.drawImage(ART.gems[s.gem], s.x * T + 4 - cx, s.y * T + 4 - cy); }
  for (const b of lv.bridges) ctx.drawImage(art.switch[b.on ? 1 : 0], b.x * T - cx, b.y * T - cy);
  for (const k of Object.keys(lv.pswitchAt)) { const s = lv.pswitchAt[k]; ctx.drawImage(art.switch[s.on ? 1 : 0], s.x * T - cx, s.y * T - cy); }
  drawPlats(lv, cx, cy);
  /* the secret teleporter: a warp arch, a tile wide, drawn from its top tile */
  for (const k of lv.secretAt) { const [x, y] = k.split(",").map(Number); if (!lv.secretAt.has(x + "," + (y - 1))) ctx.drawImage(art.warp[(lv.t >> 2) % 4], x * T - cx, y * T - cy, T, T * 2); }
  for (const d of lv.warpDoors) if (d.x - cx > -d.w && d.x - cx < W && d.y - cy > -d.h && d.y - cy < H) ctx.drawImage(art.warp[(lv.t >> 3) % 4], d.x - cx, d.y - cy, d.w, d.h);
  for (const e of lv.exits) ctx.drawImage(art.exit[lv.exitUsed === e ? 1 : 0], e.x - cx, e.y - cy);

  for (const it of lv.items) {
    if (it.gone) continue;
    it.t++;
    const big = it.kind === "part" || it.kind === "objective" || it.kind === "swim";
    const s = it.kind === "gem" ? ART.gems[it.gem] : big ? ART.parts[it.part] : ART.items[it.kind];
    const bob = big || it.kind === "gem" ? Math.round(Math.sin(it.t / 10) * 1.5) : 0;
    ctx.drawImage(s, it.x + ((T - s.width) >> 1) - cx, it.y + T - s.height - cy + bob);
    if (big && (it.t >> 3) % 4 === 0) ctx.drawImage(ART.star, it.x + 2 - cx, it.y - 2 - cy);
  }

  /* rescue targets: a plush Poom for now, waving */
  for (const n of lv.npcs) if (!n.saved) { n.t++; ctx.drawImage(ART.items.life, Math.round(n.x + 2) - cx, Math.round(n.y + 6) - cy - ((n.t >> 4) % 2)); }
  for (const e of lv.ents) drawEnemy(e, cx, cy);
  drawPlayer(lv.p, cx, cy);

  for (const s of lv.shots) {
    const a = s.kind === "zap" ? ART.zap[(s.t >> 1) % 2] : ART.hairball[(s.t >> 2) % 2];
    ctx.drawImage(a, Math.round(s.x) - cx, Math.round(s.y) - cy);
  }
  for (const f of lv.fx) {
    if (f.t < 0) continue;
    if (f.kind === "poof") ctx.drawImage(ART.poof[f.t < 6 ? 0 : 1], Math.round(f.x) - cx, Math.round(f.y) - cy);
    if (f.kind === "bubble") { ctx.strokeStyle = EGA[11]; ctx.beginPath(); ctx.arc(Math.round(f.x) - cx, Math.round(f.y) - cy, 1.5 + (f.t > 40 ? 0.5 : 0), 0, Math.PI * 2); ctx.stroke(); }
    if (f.kind === "text") drawSmallText(f.text, Math.round(f.x) - cx, Math.round(f.y) - cy, f.t % 8 < 4 ? 15 : 14, true);
  }
  if (lv.swim) { ctx.fillStyle = "rgba(0, 0, 170, 0.28)"; ctx.fillRect(0, 0, W, H); }
  drawHud(lv);
}

function drawPlayer(p, cx, cy) {
  if (p.state === "exit") {
    if (p.t > 36) return;
    ctx.globalAlpha = 1 - p.t / 40;
  }
  const a = ART.poom, run = G.run;
  let pose;
  if (p.state === "dead") pose = "dead";
  else if (p.state === "exit") pose = "back";
  else if (p.climbing) pose = (Math.floor(p.anim / 8) % 2) ? "climb1" : "climb0";
  else if (p.pogo) pose = p.shootT ? "shootAir" : "pogo";
  else if (p.crouch > 0) pose = "pogo";
  else if (p.shootT) pose = p.onGround ? "shoot" : "shootAir";
  else if (!p.onGround) pose = p.vy < 0 ? "jump" : "fall";
  else if (Math.abs(p.vx) > 0.3) pose = ["walk0", "walk1", "walk2", "walk1"][Math.floor(p.anim) % 4];
  else pose = "stand";
  const dir = p.face > 0 ? "r" : "l", spr = a[pose][dir];
  const bx = Math.round(p.x + p.w / 2 - spr.width / 2) - cx;
  if (p.pogo) {
    const short = p.compress > 0 || p.land > 0;
    const stick = (short ? ART.pogoShort : ART.pogoLong)[dir];
    const feet = Math.round(p.y + PH) - cy + (short ? 3 : 0);
    ctx.drawImage(stick, Math.round(p.x + p.w / 2 - stick.width / 2) - cx, feet - 2);
    ctx.drawImage(spr, bx, feet - spr.height + 1);
  } else {
    ctx.drawImage(spr, bx, Math.round(p.y + p.h) - spr.height + 1 - cy);
  }
  ctx.globalAlpha = 1;
}

function drawEnemy(e, cx, cy) {
  /* mousels and vacuumoids are drawn facing left, the rest facing right */
  const drawnLeft = e.type === "x" || e.type === "V" || e.type === "W" || e.type === "L";
  const set = ART[ENEMY[e.type].art], dir = (e.face > 0) !== drawnLeft ? "r" : "l", f = (e.t >> 3) % 2;
  let k;
  switch (e.type) {
    case "x": k = e.state === "stunned" ? "stunned" : e.state === "look" ? "look" : f ? "walk1" : "walk0"; break;
    case "B": k = e.state === "charge" || e.state === "growl" ? "charge" : f ? "walk1" : "walk0"; break;
    case "V": case "W": case "L": k = !e.onGround ? "jump" : (e.t >> 4) % 2 ? "walk1" : "walk0"; break;
    default: k = f ? "b" : "a";
  }
  const spr = set[k][dir], sc = e.scale || 1;
  const x = Math.round(e.x + e.w / 2 - spr.width * sc / 2) - cx, y = Math.round(e.y + e.h) + sc - spr.height * sc - cy;
  if (e.flash && e.flash % 2) ctx.globalAlpha = 0.4;
  ctx.drawImage(spr, x, y, spr.width * sc, spr.height * sc);
  ctx.globalAlpha = 1;
  if (e.type === "x" && e.state === "stunned" && (e.t >> 3) % 2) ctx.drawImage(ART.star, x + 6, y - 2);
}

function drawDigits(n, x, y, len, set = "red") {
  const s = String(n).padStart(len, " ");
  [...s].forEach((ch, i) => {
    if (ch === " ") ctx.drawImage((ART.digits[set + "Dim"] || ART.digits.dim)[8], x + i * 6, y);
    else ctx.drawImage(ART.digits[set][+ch], x + i * 6, y);
  });
}

/* the scorebox, top left: score; lives; raygun charges; keycards. A theme
 * may have its own (theme.hud) */
function drawHud(lv) {
  if (theme.hud === "wrist") return drawWristHud(lv);
  const r = G.run;
  ctx.fillStyle = "#000"; ctx.fillRect(3, 3, 59, 22);
  ctx.fillStyle = EGA[8]; ctx.fillRect(3, 3, 59, 1); ctx.fillRect(3, 24, 59, 1); ctx.fillRect(3, 3, 1, 22); ctx.fillRect(61, 3, 1, 22);
  drawDigits(r.score, 6, 6, 9);
  ctx.drawImage(ART.items.life, 5, 14, 9, 10);
  drawDigits(Math.min(r.lives, 99), 15, 16, 2);
  ctx.drawImage(ART.items.ammo, 32, 15, 6, 9);
  drawDigits(Math.min(r.ammo, 99), 40, 16, 2);
  if (lv) lv.keys.forEach((k, i) => { if (k) ctx.drawImage(ART.gems[i], 64 + i * 10, 4, 8, 7); });
}

/* the wasteland's scorebox: a chunky wrist computer, olive casing, a dial,
 * and a green phosphor screen with the icons in green too */
const phosphor = new WeakMap();
function inPhosphor(img) {
  let c = phosphor.get(img);
  if (c) return c;
  c = makeCanvas(img.width, img.height);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    if (!px[i + 3]) continue;
    const l = (px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11) / 255, k = 0.25 + l * 0.85;
    px[i] = 40 * k; px[i + 1] = Math.min(255, 255 * k); px[i + 2] = 70 * k;
  }
  g.putImageData(d, 0, 0);
  phosphor.set(img, c);
  return c;
}
function drawWristHud(lv) {
  const r = G.run, f = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  /* the casing */
  f("#000", 2, 3, 88, 29); f("#000", 3, 2, 86, 31);
  f("#4e4628", 3, 3, 86, 29);
  f("#7c6e44", 4, 3, 84, 1); f("#7c6e44", 3, 4, 1, 27);
  f("#2c2614", 4, 31, 84, 1); f("#2c2614", 88, 4, 1, 27);
  f("#3a3420", 70, 5, 1, 25);
  for (const [sx, sy] of [[5, 5], [5, 28], [85, 5], [85, 28]]) { f("#a8966a", sx, sy, 2, 2); f("#3a3420", sx + 1, sy + 1, 1, 1); }
  /* the screen: dark glass, phosphor glow, scanlines */
  f("#1a1a10", 7, 5, 62, 25);
  f("#04170b", 8, 6, 60, 23);
  ctx.fillStyle = "rgba(110, 255, 140, 0.07)"; ctx.fillRect(8, 6, 60, 11);
  drawDigits(r.score, 10, 8, 9, "green");
  f("#1c5a2a", 10, 16, 56, 1);
  ctx.drawImage(inPhosphor(ART.items.life), 9, 18, 9, 10);
  drawDigits(Math.min(r.lives, 99), 19, 20, 2, "green");
  ctx.drawImage(inPhosphor(ART.items.ammo), 36, 19, 6, 9);
  drawDigits(Math.min(r.ammo, 99), 44, 20, 2, "green");
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)"; for (let y = 6; y < 29; y += 2) ctx.fillRect(8, y, 60, 1);
  /* the dial, and a power light that breathes */
  ctx.fillStyle = "#1e1a0e"; ctx.beginPath(); ctx.arc(79.5, 14.5, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a7a4c"; ctx.beginPath(); ctx.arc(79.5, 14.5, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#62562f"; ctx.beginPath(); ctx.arc(80, 15, 3.5, 0, Math.PI * 2); ctx.fill();
  f("#d8c890", 79, 10, 1, 4);
  const glow = 0.55 + 0.45 * Math.sin(G.t / 30);
  f("#1e1a0e", 76, 24, 7, 4); ctx.fillStyle = `rgba(120, 255, 140, ${glow})`; ctx.fillRect(77, 25, 5, 2);
  if (lv) lv.keys.forEach((k, i) => { if (k) ctx.drawImage(ART.gems[i], 93 + i * 10, 4, 8, 7); });
}

/* a tiny pixel font for floating score text: digits from the LED set,
 * and the few letters we need drawn plainly */
function drawSmallText(text, x, y, col, center) {
  const w = text.length * 6;
  if (center) x -= w / 2;
  ctx.fillStyle = "#000";
  ctx.font = "8px 'Press Start 2P', monospace";
  ctx.textBaseline = "top";
  [...text].forEach((ch, i) => {
    if (/[0-9]/.test(ch)) ctx.drawImage(ART.digits[col === 15 ? "white" : "yellow"][+ch], Math.round(x + i * 6), Math.round(y));
    else { ctx.fillStyle = EGA[col]; ctx.fillText(ch, Math.round(x + i * 6), Math.round(y)); }
  });
}

let mapArt = null, mapArtSets = null;
const MARKER_KINDS = ["dome", "cave", "igloo", "gate", "fort", "castle"];
function drawMap() {
  const m = G.map, c = G.cam, cx = Math.round(c.x), cy = Math.round(c.y);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  const tx0 = Math.floor(cx / T), ty0 = Math.floor(cy / T);
  for (let ty = ty0; ty <= ty0 + Math.ceil(H / T); ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(W / T); tx++) {
    const ch = mapTile(tx, ty), x = tx * T - cx, y = ty * T - cy;
    if (ch === "~") { ctx.drawImage(mapArt.water[((m.t >> 5) + tx + ty) % 2], x, y); continue; }
    ctx.drawImage(Array.isArray(mapArt.ground) ? mapArt.ground[(tx * 7 + ty * 13) & 3] : mapArt.ground, x, y);
    const ent = entranceAt(tx, ty);
    if (barrierOn(tx, ty)) ctx.drawImage(mapArt.field[(m.t >> 2) % 3], x, y);
    else if (ch === "#") {
      /* rock, lit and shaded where it meets open ground, if the set can */
      const open = (dx, dy) => mapTile(tx + dx, ty + dy) !== "#";
      ctx.drawImage(mapArt.rockAt ? mapArt.rockAt((open(0, -1) ? 1 : 0) | (open(1, 0) ? 2 : 0) | (open(0, 1) ? 4 : 0) | (open(-1, 0) ? 8 : 0)) : mapArt.rock, x, y);
    }
    else if (ch === "/" || ch === "\\") drawDiagonal(ch === "/" ? "LR" : "LL", x, y);
    else if (ent && !mapArt.markerFor) ctx.drawImage(mapArt.marker[MARKER_KINDS[+ent.slice(1) % MARKER_KINDS.length]], x, y);
    else if (ch === "Q") ctx.drawImage(mapArt.tele[(m.t >> 3) % 2], x, y);
  }
  /* a set with its own markers draws one per entrance, by the level's type */
  if (mapArt.markerFor) for (const [id, b] of Object.entries(world().box)) {
    const kind = { vault: "vault", vaultCold: "vault", raiders: "camp", ruins: "ruin" }[LEVEL_THEME[id]] || "ruin";
    const mx = (b.x0 + b.x1 + 1) * T / 2 - 16 - cx, my = (b.y1 + 1) * T - 32 - cy;
    if (mx > -32 && mx < W && my > -32 && my < H) ctx.drawImage(mapArt.markerFor[kind], mx, my);
  }
  /* the ship, on its two tiles and the two above */
  if (world().ship) { const [sx, sy] = world().ship; ctx.drawImage(mapArt.ship, sx * T - cx, (sy - 1) * T - cy); }
  /* done flags: on the map's own flag spot, or the level's first entrance tile */
  const w = world();
  for (const id of w.need) if (G.run.done[id]) {
    const [fx, fy] = w.flag[id] || w.first[id];
    ctx.drawImage(mapArt.flag, fx * T - cx, fy * T - cy - 4);
  }
  const p = m.p, f = Math.floor(p.anim) % 2;
  const set = ART.map, spr = p.dir === "up" ? set["up" + f].r : p.dir === "down" ? set["down" + f].r : set["side" + f][p.dir === "left" ? "l" : "r"];
  ctx.drawImage(spr, Math.round(p.x + p.w / 2 - spr.width / 2) - cx, Math.round(p.y + p.h) - spr.height - cy + 1);

  /* the name of the place underfoot */
  const here = mapHere(p);
  const onTele = !here && world().tele[Math.floor((p.x + p.w / 2) / T) + "," + Math.floor((p.y + p.h / 2) / T)];
  const label = here ? levelName(here) + (G.run.done[here] ? " (done)" : "") : onShip(p) ? "The Catamaran" : onTele ? mapArt.teleName || "Teleporter" : "";
  mapLabel(label);
  drawHud(null);
}

/* a diagonal wall: rock in its half of the tile */
function drawDiagonal(half, x, y) {
  const c = { UL: [[0, 0], [T, 0], [0, T]], LR: [[T, 0], [T, T], [0, T]], UR: [[0, 0], [T, 0], [T, T]], LL: [[0, 0], [T, T], [0, T]] }[half];
  ctx.save(); ctx.beginPath(); ctx.moveTo(x + c[0][0], y + c[0][1]); ctx.lineTo(x + c[1][0], y + c[1][1]); ctx.lineTo(x + c[2][0], y + c[2][1]); ctx.closePath(); ctx.clip();
  ctx.fillStyle = EGA[8]; ctx.fillRect(x, y, T, T); ctx.drawImage(mapArt.rock, x, y);
  ctx.restore();
}

let lastLabel = null;
function mapLabel(text) {
  if (text === lastLabel) return;
  lastLabel = text;
  const el = document.getElementById("maplabel");
  el.textContent = text;
  el.hidden = !text;
}

/* the title's backdrop: stars over the red edge of Planet Hiss */
const titleStars = Array.from({ length: 90 }, (_, i) => ({ x: (i * 97) % 320, y: (i * 61) % 150, c: [15, 7, 14, 11][i % 4], s: i % 7 }));
/* the title screen's backdrop, by theme */
let wasteTitleBg = null;
function drawTitleScene(t) {
  if (theme.title === "wasteland") return drawWasteTitle(t);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  for (const s of titleStars) if ((t >> 4) % 7 !== s.s) { ctx.fillStyle = EGA[s.c]; ctx.fillRect(s.x, s.y, 1, 1); }
  /* the planet */
  ctx.fillStyle = EGA[4]; ctx.beginPath(); ctx.ellipse(160, 330, 300, 170, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = EGA[6]; ctx.beginPath(); ctx.ellipse(160, 336, 300, 168, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = EGA[12]; for (let i = 0; i < 40; i++) ctx.fillRect((i * 53) % 320, 172 + (i * 7) % 26, 2, 1);
  /* a ringed moon */
  ctx.fillStyle = EGA[5]; ctx.beginPath(); ctx.arc(268, 46, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = EGA[13]; ctx.beginPath(); ctx.arc(263, 42, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = EGA[14]; ctx.beginPath(); ctx.ellipse(268, 46, 28, 5, -0.3, 0, Math.PI * 2); ctx.stroke();
  /* the Catamaran, and Poom beside it */
  ctx.drawImage(mapArt.shipBare, 0, 0, 32, 32, 30, 140, 64, 64);
  const pose = (t >> 5) % 8 === 0 ? "shoot" : "stand";
  ctx.drawImage(ART.poom[pose].r, 96, 179);
}

/* The wasteland's title: the Glow at dusk over a ruined skyline, the
 * Catamaran crash-landed and smoking, Poom beside it in his ranger gear,
 * Auntie Static's mast blinking far off. */
function drawWasteTitle(t) {
  if (!wasteTitleBg) wasteTitleBg = paintWasteTitle(mapArtSets.classic.shipBare);
  ctx.drawImage(wasteTitleBg, 0, 0);
  /* stars, a few twinkling */
  for (const s of titleStars) if (s.y < 70 && (t >> 4) % 7 !== s.s) { ctx.fillStyle = s.c === 14 ? "#ffe9a8" : "#c8c0d8"; ctx.fillRect(s.x, s.y, 1, 1); }
  /* the mast's light */
  if ((t >> 5) % 2) { ctx.fillStyle = "rgba(255, 59, 47, 0.35)"; ctx.beginPath(); ctx.arc(15, 103, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#ff3b2f"; ctx.fillRect(14, 102, 2, 2); }
  /* smoke off the wreck */
  for (let i = 0; i < 6; i++) {
    const k = ((t * 0.4) + i * 17) % 100;
    ctx.fillStyle = `rgba(70, 64, 60, ${0.6 * (1 - k / 100)})`;
    ctx.beginPath(); ctx.arc(58 + k * 0.3 + Math.sin((t + i * 40) / 25) * 2, 150 - k * 0.8, 2 + k * 0.07, 0, Math.PI * 2); ctx.fill();
  }
  const pose = (t >> 5) % 8 === 0 ? "shoot" : "stand", spr = ART.poom[pose].r;
  ctx.drawImage(spr, 76, 192 - spr.height);
}

/* ------------------------------------------------------------------ */
/* overlays: messages, menus, the status window                          */

const UI = {
  stack: [],
  top() { return this.stack[this.stack.length - 1] || null; },
  push(o) {
    held.clear(); pressed.clear();
    this.stack.push(o);
    uiRoot.appendChild(o.el);
    if (o.focus) o.focus();
  },
  pop() {
    const o = this.stack.pop();
    if (o) { o.el.remove(); if (o.onClose) o.onClose(); }
    held.clear(); pressed.clear();
    const t = this.top(); if (t && t.focus) t.focus();
  },
  clear() { while (this.stack.length) { const o = this.stack.pop(); o.el.remove(); } },
  key(ev) {
    const o = this.top();
    if (ev.code === "KeyM" && !(ev.target.closest && ev.target.closest("input"))) { toggleMute(); ev.preventDefault(); return; }
    if (o && o.key) o.key(ev);
  },
  padPress(a) {
    const o = this.top(); if (!o || !o.key) return;
    const code = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", jump: "Enter", fire: "Enter", pogo: "Escape", pause: "Escape", status: "Escape" }[a];
    if (code) o.key({ code, key: code, preventDefault() {}, synthetic: true });
  },
};

function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
function imgOf(c, scale = 1) { const i = new Image(); i.src = c.toDataURL(); i.width = c.width * scale; i.height = c.height * scale; i.className = "px"; i.alt = ""; return i; }

/* a Keen-style message box; any key closes it */
function message(html, { icon = null, iconRow = null, onClose = null } = {}) {
  const box = el("div", "box msg");
  if (icon) box.appendChild(imgOf(icon, 2));
  if (iconRow) { const row = el("div", "iconrow"); iconRow.forEach((h, i) => { const im = imgOf(ART.parts[i], 1); if (!h) im.classList.add("missing"); row.appendChild(im); }); box.appendChild(row); }
  box.appendChild(el("p", null, html));
  box.appendChild(el("p", "hint", "press a key"));
  const wrap = el("div", "overlay"); wrap.appendChild(box);
  let armed = false; setTimeout(() => { armed = true; }, 250);
  const o = { el: wrap, onClose, key(ev) { if (!armed && !ev.synthetic) return; if (ev.preventDefault) ev.preventDefault(); UI.pop(); } };
  wrap.addEventListener("pointerdown", () => { if (armed) UI.pop(); });
  UI.push(o);
}

/* a level-name card, gone by itself */
function card(text, then) {
  const wrap = el("div", "overlay"), box = el("div", "box card", `<p class="small">Now entering</p><p>${text}</p>`);
  wrap.appendChild(box);
  const o = { el: wrap, onClose: then, key(ev) { ev.preventDefault && ev.preventDefault(); UI.pop(); } };
  UI.push(o);
  setTimeout(() => { if (UI.top() === o) UI.pop(); }, 1300);
}

let toastT = null;
function toast(text) {
  const t = document.getElementById("toast");
  t.textContent = text; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600);
}

/* a menu: items { label, key, act, meta?, disabled? } or "gap" */
function menu(title, items, { cls = "", onBack = null, footer = "" } = {}) {
  const wrap = el("div", "overlay " + cls), box = el("div", "box menu");
  if (title) box.appendChild(el("h2", null, title));
  const list = el("div", "items");
  const buttons = [];
  for (const it of items) {
    if (it === "gap") { list.appendChild(el("div", "gap")); continue; }
    const b = el("button", null, `<span class="cur">&#9658;</span><span class="lbl">${it.label}</span>${it.meta ? `<span class="meta">${it.meta}</span>` : ""}${it.key ? `<kbd>${it.key}</kbd>` : ""}`);
    if (it.disabled) b.disabled = true;
    b.addEventListener("click", () => { sfx("pick"); it.act(); });
    b.addEventListener("mouseenter", () => b.focus());
    b.addEventListener("focus", () => { if (!b.classList.contains("sel")) sfx("menu"); buttons.forEach(o => o.classList.toggle("sel", o === b)); });
    b._item = it;
    buttons.push(b); list.appendChild(b);
  }
  box.appendChild(list);
  if (footer) box.appendChild(el("div", "foot", footer));
  wrap.appendChild(box);
  const live = () => buttons.filter(b => !b.disabled);
  const o = {
    el: wrap,
    focus() { const f = live().find(b => b.classList.contains("sel")) || live()[0]; if (f) { f.focus({ preventScroll: true }); buttons.forEach(o => o.classList.toggle("sel", o === f)); } },
    key(ev) {
      const bs = live(), i = bs.findIndex(b => b.classList.contains("sel"));
      if (ev.code === "ArrowDown" || ev.code === "ArrowUp") { ev.preventDefault(); bs[(i + (ev.code === "ArrowDown" ? 1 : -1) + bs.length) % bs.length].focus(); return; }
      if (ev.code === "Enter" || ev.code === "Space") { ev.preventDefault(); const b = bs[i] || bs[0]; if (b) b.click(); return; }
      if (ev.code === "Escape" && onBack) { ev.preventDefault(); onBack(); return; }
      const k = ev.key && ev.key.length === 1 ? ev.key.toUpperCase() : null;
      const hit = k && bs.find(b => b._item.key && b._item.key.toUpperCase() === k || (k === "H" || k === "/") && b._item.key === "?");
      if (hit) { ev.preventDefault(); hit.click(); }
    },
  };
  UI.push(o);
  return o;
}

/* a page of text with an optional tab bar; Esc goes back */
function page(title, tabs, { onBack = () => UI.pop() } = {}) {
  const wrap = el("div", "overlay"), box = el("div", "box page");
  const head = el("div", "phead"); head.appendChild(el("h2", null, title));
  const x = el("button", "x", "&times;"); x.setAttribute("aria-label", "Close"); x.addEventListener("click", () => onBack()); head.appendChild(x);
  box.appendChild(head);
  const bar = el("div", "tabs"), body = el("div", "pbody");
  let cur = 0;
  const show = i => {
    cur = i; body.innerHTML = ""; const c = tabs[i][1]; if (typeof c === "string") body.innerHTML = c; else body.appendChild(c());
    [...bar.children].forEach((b, j) => b.setAttribute("aria-selected", String(j === i)));
    body.scrollTop = 0;
  };
  if (tabs.length > 1) { tabs.forEach(([name], i) => { const b = el("button", null, name); b.addEventListener("click", () => { sfx("menu"); show(i); }); bar.appendChild(b); }); box.appendChild(bar); }
  box.appendChild(body);
  box.appendChild(el("div", "foot", tabs.length > 1 ? "&larr; &rarr; pages &middot; &uarr; &darr; scroll &middot; Esc back" : "&uarr; &darr; scroll &middot; Esc back"));
  wrap.appendChild(box);
  show(0);
  UI.push({
    el: wrap,
    key(ev) {
      if (ev.code === "Escape" || ev.code === "Enter") { ev.preventDefault(); onBack(); }
      else if (ev.code === "ArrowRight" || ev.code === "ArrowLeft") { ev.preventDefault(); if (tabs.length > 1) { sfx("menu"); show((cur + (ev.code === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length); } }
      else if (ev.code === "ArrowDown" || ev.code === "ArrowUp") { ev.preventDefault(); body.scrollTop += ev.code === "ArrowDown" ? 24 : -24; }
    },
  });
}

/* yes or no, in the game's own box */
function ask(question, yes, then) {
  menu(question, [{ label: yes, key: "Y", act: () => { UI.pop(); then(); } }, { label: "Cancel", key: "N", act: () => UI.pop() }], { onBack: () => UI.pop(), cls: "ask" });
}

function toggleMute() { audio.setMuted(!audio.muted); syncSoundButton(); if (!audio.muted) sfx("pick"); toast(audio.muted ? "Sound off" : "Sound on"); }
function syncSoundButton() { const b = document.getElementById("snd"); if (b) { b.setAttribute("aria-pressed", String(!audio.muted)); b.textContent = audio.muted ? "♪̸" : "♪"; } }

function statusWindow() {
  const r = G.run, wrap = el("div", "overlay"), box = el("div", "box status");
  box.appendChild(el("h2", null, "Status"));
  const grid = el("div", "sgrid");
  const row = (k, v) => { grid.appendChild(el("span", "k", k)); const s = el("span", "v"); if (typeof v === "string") s.textContent = v; else s.appendChild(v); grid.appendChild(s); };
  row("Score", String(r.score));
  row("Extra life at", String(r.nextLife));
  row("Lives", String(r.lives));
  row("Raygun", say("raygun", n => n ? `${n} charge${n === 1 ? "" : "s"}` : "empty", r.ammo));
  const keys = el("span"); (G.lv ? G.lv.keys : [false, false, false, false]).forEach((k, i) => { const im = imgOf(ART.gems[i]); if (!k) im.classList.add("missing"); keys.appendChild(im); });
  row("Keycards", keys);
  const parts = el("span"); r.parts.forEach((h, i) => { const im = imgOf(ART.parts[i]); im.title = PART_NAMES[i]; if (!h) im.classList.add("missing"); parts.appendChild(im); });
  if (world().ship) parts.appendChild(el("span", null, ` ${(r.aboard || []).filter(Boolean).length} aboard`));
  row("Ship parts", parts);
  row("Book", String(bookNumber(r.book)));
  if (r.swim) row("Swimming", "yes");
  row("Levels done", `${world().need.filter(id => r.done[id]).length} of ${world().need.length}`);
  box.appendChild(grid);
  box.appendChild(el("p", "hint", "press a key"));
  wrap.appendChild(box);
  wrap.addEventListener("pointerdown", () => UI.pop());
  UI.push({ el: wrap, key(ev) { ev.preventDefault && ev.preventDefault(); UI.pop(); } });
}

function openPause() {
  if (UI.top()) return;
  const inLevel = G.mode === "level";
  menu("Paused", [
    { label: "Resume", key: "R", act: () => UI.pop() },
    { label: "Status", key: "T", act: () => { UI.pop(); statusWindow(); } },
    { label: "Sound", key: "M", meta: audio.muted ? "off" : "on", act: () => { toggleMute(); UI.pop(); openPause(); } },
    { label: "Game speed", key: "G", meta: SPEEDS[speed].label, act: () => { cycleSpeed(); UI.pop(); openPause(); } },
    { label: "Help", key: "?", act: () => openHelp() },
    "gap",
    inLevel ? { label: "Leave level", key: "L", meta: "costs a life", act: () => ask("Leave this level? It costs a life.", "Leave", () => { UI.pop(); loseLife(); }) } : null,
    { label: "Quit to title", key: "Q", meta: inLevel ? "costs a life" : "game saved", act: () => ask(inLevel ? "Quit to the title? Leaving the level costs a life." : "Quit to the title? The game is saved.", "Quit", () => {
      UI.clear();
      if (inLevel) { G.run = G.lv.snapshot; G.run.lives = Math.max(0, G.run.lives - 1); G.lv = null; }
      saveRun(); openTitle();
    }) },
  ].filter(Boolean), { onBack: () => UI.pop() });
}

/* ------------------------------------------------------------------ */
/* help, about, settings, scores                                         */

function spriteRow(entries) {
  return () => {
    const d = el("div", "entries");
    for (const [c, name, text] of entries) {
      const r = el("div", "entry"), pic = el("div", "pic");
      pic.appendChild(imgOf(c, 2)); r.appendChild(pic);
      r.appendChild(el("div", null, `<b>${name}</b><br>${text}`)); d.appendChild(r);
    }
    return d;
  };
}

const STORY = `<p>Poom Purrington is eight years old, has an IQ of 314, and has built a working starship out of a laundry basket, the cat carrier, a hair dryer and three hundred feet of yarn. He calls it the <b>Catamaran</b>.</p>
<p>One evening, while his parents are out, Poom puts on his big brother's football helmet, becomes <b>Commander Poom</b>, and points the Catamaran at the stars.</p>
<p>He lands on <b>Planet Hiss</b> for a quick look around. When he gets back, the ship has been picked clean. The <b>Vacuumoids</b> &mdash; tall, one-eyed, endlessly sucking machines &mdash; have hauled off four parts: the <b>Yarn Drive</b>, the <b>Catnip Battery</b>, the <b>Whisker Antenna</b> and the <b>Laser Pointer</b>.</p>
<p>Find all four, bring them back to the Catamaran, and get home before your parents do. And whatever you do, stay away from the hose.</p>`;

const CONTROLS = `<table>
<tr><td><kbd>&larr;</kbd> <kbd>&rarr;</kbd> / <kbd>A</kbd> <kbd>D</kbd></td><td>walk</td></tr>
<tr><td><kbd>Ctrl</kbd> / <kbd>Z</kbd></td><td>jump &mdash; hold it to jump higher</td></tr>
<tr><td><kbd>Alt</kbd> / <kbd>X</kbd></td><td>pogo stick on and off</td></tr>
<tr><td><kbd>Space</kbd> / <kbd>C</kbd></td><td>fire the raygun</td></tr>
<tr><td><kbd>&uarr;</kbd> <kbd>&darr;</kbd></td><td>climb a pole</td></tr>
<tr><td><kbd>&uarr;</kbd></td><td>read a sign; go through a door</td></tr>
<tr><td><kbd>&darr;</kbd> + jump</td><td>drop through a ledge</td></tr>
<tr><td><kbd>Enter</kbd></td><td>status: score, lives, keycards, ship parts</td></tr>
<tr><td><kbd>Esc</kbd></td><td>pause</td></tr>
<tr><td><kbd>M</kbd></td><td>sound on and off</td></tr>
</table>
<p>On the map, walk onto a level and press jump or fire to go in. Flags mark the levels you've done. Walk to the Catamaran with all four parts to fly home.</p>
<p>On the pogo, hold jump as you land for a big bounce. A gamepad works too: A jumps, B pogos, X fires.</p>
<p>Too fast, or too slow? Settings &rarr; <b>Game speed</b>: Classic, Keen&rsquo;s own pace, or Relaxed. The levels are the same at every speed.</p>
<p>The game saves itself whenever you are on the map. Dying sends you back to the map, and you lose whatever you picked up in that level.</p>`;

/* The words of a book: its story, its first word on the map, and its help
 * pages. Book 1's, the wasteland, from docs/story/book-1-story.md; other
 * books have the original game's until they have their own. */
const BOOK_TEXT = {
  H: {
    story: `<p>Commander Poom points the <b>Catamaran</b> at the stars. A meteor shower knocks out the Yarn Drive, and he comes down hard in <b>the Glow</b>: the wasteland left behind by a war the cats and dogs should never have fought.</p>
<p>Before the engines have stopped ticking, the <b>Scrappers</b>, a raider gang who strip anything that falls from the sky, have hauled off four of the ship's parts.</p>
<p>Their boss, <b>Junk Baron Rex</b>, gave one to each of his four lieutenants, and each locked it away on their own turf: two in the old underground <b>Vaults</b>, one in <b>Fort Scrap</b>, one in the ruins of <b>Old Litterburg</b>.</p>
<p>Cross the Glow, get past the locks, take the parts back and bolt them into the Catamaran before the Scrappers come back for the rest. And keep an ear on the radio: <b>Auntie Static</b> seems to know things.</p>`,
    arrive: "This is the Glow. Walk up to a place and press <kbd>Ctrl</kbd>, <kbd>Z</kbd> or <kbd>Space</kbd> to go in.<br><br><kbd>Esc</kbd> pauses; <kbd>Enter</kbd> shows your status.",
    map: `<p>On the map, walk up to a place and press jump or fire to go in. A place you haven't cleared blocks the road; a banner marks the ones you have. Jump or fire at a <b>Tube station</b> to ride to the other end. Take the ship's parts back to the <b>Catamaran</b>, where you came down.</p>`,
    creatures: () => { const C = ART.creatureSets.wasteland; return [
      [C.mousel.walk0.r, "Glowmouse", "A mutant mouse: harmless, nosy and pushy. Jump on one to stun it for a while."],
      [C.barker.walk0.r, "Scrap hound", "The Scrappers' dogs. They charge the moment they see you. One shot."],
      [C.vac.walk0.r, "Scrapper", "The raiders, in scrap armour. Deadly to touch, and it takes four shots."],
      [C.lieut.walk0.r, "Lieutenant", "Rex's lieutenants, one guarding each stolen part. Deadly, and it takes five shots."],
      [C.roombot.a.r, "Sentrybot", "Vault security, rewired by the Scrappers. Can't be hurt. It shoves."],
      [C.turret.a.r, "Auto-turret", "Fixed in place, firing along its barrel when you come near. Can't be hurt."],
    ]; },
    items: () => { const I = ART.itemSets.wasteland; return [
      [I.items.fish, "Caps, tuna, clean water, Sunny Snax, a medal, a trophy", "100, 200, 500, 1000, 2000 and 5000 points. An extra life every 20,000."],
      [I.items.ammo, "Energy cell", "Five shots for the raygun."],
      [I.items.life, "Poom bobblehead", "An extra life. Nobody knows why the Glow is full of them."],
      [I.gems[0], "Vault keycards", "Open the door of the same colour, in this level."],
      [ART.parts[0], "Ship parts", "Four, each in a lieutenant's strongroom. Take them to the Catamaran."],
    ]; },
    /* its places: a level's name on the map and its title card */
    places: {
      H02: "The Valley Road", H03: "Auntie's Tower", H04: "Griz's Camp", H05: "Old Litterburg",
      H06: "The Overpass", H07: "The Far Tower", H08: "Fort Scrap", H09: "Vault 9",
      H10: "Vault 6", H11: "Vault 9, Cold Storage", H12: "Scrapper Turf", H13: "The Lookout",
      H14: "Vault 6, the Lab", H15: "The Nest", H16: "Litterburg Main Street", H17: "Vault 9, the Deep Freeze",
    },
    /* the hint signs, by level: who's talking, then what they say. The
       ruins' signs are loudspeakers, the camps' graffiti, the Vaults'
       terminals */
    signs: {
      H03: `<b>Auntie Static, on the loudspeaker</b><br><br><i>"Well, look at you, sugar. Fell out of the sky and landed in the Glow. Four of your bits went north with the Scrappers. I'd get them back if I were you."</i>`,
      H07: `<b>Auntie Static, on the loudspeaker</b><br><br><i>"The Scrappers lock their loot behind Vault doors. Doors want cards, cards come in colours. Match 'em up. And sugar? Fort Scrap sits on the last Tube station that still runs. Clear it, and the Tube'll take you north."</i>`,
      H10: `<b>A Vault terminal</b><br><br>VAULT 6 SECURITY NOTICE: Doors open only to a keycard of matching colour. Report lost cards to your Overseer.<br><br>REMINDER: The transit pad in the Lab is EXPERIMENTAL. Do not step on the transit pad.`,
      H11: `<b>A Vault terminal</b><br><br>VAULT 9 COLD-SLEEP STATUS: COOLANT BREACH. Floors may be slippery. Have a nice day.`,
      H12: `<b>A loudspeaker, in a Scrapper's voice</b><br><br>"THIS IS SCRAPPER TURF. EVERYTHING HERE IS OURS. INCLUDING YOU."<br><br>Then, faintly, Auntie Static: <i>"Don't mind him, sugar."</i>`,
      H13: `<b>Scrapper graffiti</b><br><br>LT. GRIZ HAS THE SHINY THING. DON'T TOUCH THE SHINY THING.<br><br>Under it, smaller: GRIZ'S CAMP IS SOUTH. DON'T GO THERE EITHER.`,
      H16: `<b>Auntie Static, on the loudspeaker</b><br><br><i>"Two ways out of Litterburg, sugar. Either'll do."</i>`,
    },
    /* the game's own talk, in the Glow's words (see say()) */
    say: {
      /* named for what a sign is in its level's tileset (art.js) */
      signNear: tiles => ({ ruins: "A loudspeaker. Press \u2191 to listen.", vault: "A terminal. Press \u2191 to read it.", vaultCold: "A terminal. Press \u2191 to read it.", raiders: "Scrapper graffiti. Press \u2191 to read it." })[tiles] || "A sign. Press \u2191 to read it.",
      noPogo: "No pogo stick. Not yet.",
      warpDoor: "A hatch. Press \u2191 to go through.",
      socket: c => `A ${c} card reader. A ${c} keycard goes here.`,
      noAmmo: "Click. The raygun is empty. Look for energy cells.",
      lockedDoor: c => c ? `A ${c} security door. It wants a ${c} keycard.` : "A locked security door. It wants a keycard.",
      ammo: "<b>Energy cell!</b> Five shots for the raygun. Fire with <kbd>Space</kbd> or <kbd>C</kbd>.",
      pogo: "<b>You found a pogo stick!</b><br><br>Pre-war, rusty, and still springy. Press <kbd>Alt</kbd> or <kbd>X</kbd> to hop on and off. Hold <kbd>Ctrl</kbd> or <kbd>Z</kbd> as you land for a big bounce.",
      swim: "<b>You can swim!</b><br><br>Hold your breath and don't drink it. On the map, Poom can wade in where the shore meets the water.",
      part: (name, n) => `<b>You took back ${name}!</b><br><br>${n === 4 ? "That's all four. Back to the Catamaran, before the Scrappers notice!" : `${n} of 4 ship parts. Get it back to the Catamaran.`}`,
      bossDown: "<b>The lieutenant is down!</b><br><br>Grab the part and get out of here.",
      wayOpens: "Somewhere in the Glow, the road opens.",
      shipWhole: last => `<b>The Catamaran is whole again!</b>${last ? `<br><br>Poom bolts in ${last} and wipes off the Scrapper paint.` : ""}`,
      shipMissing: (fits, still) => `<b>The Catamaran</b><br><br>${fits ? `Poom bolts in ${fits}. ` : ""}It still won't fly without ${still}. The Scrappers have the rest.`,
      lostLife: n => n === 0 ? "Poom dusts himself off.<br><br><b>This is your last life.</b>" : `Poom dusts himself off.<br><br>${n} ${n === 1 ? "life" : "lives"} left.`,
      water: "Glowing water. Poom isn't going in that. Not yet.",
      blocked: "The road's shut. Clear the places nearby.",
      levelDone: name => `${name}: cleared.`,
      raygun: n => n ? `${n} shot${n === 1 ? "" : "s"}` : "empty",
      gameOver: n => `<b>Game over.</b><br><br>The Glow wins this one. Commander Poom is out of lives. Final score: ${n}.`,
      highScore: n => `<b>A high score!</b><br><br>${n} caps' worth. Auntie Static wants your name for the broadcast.`,
    },
    /* the high-score table before anyone's on it */
    scores: [["Junk Baron Rex", 20000], ["Auntie Static", 15000], ["Lt. Griz", 10000], ["Sentrybot", 7500], ["Glowmouse #7", 5000], ["Scrap Hound", 2500], ["The Overseer", 1000]],
    /* the boot screen's lines */
    boot: ["256 colours: ok", "geiger counter: clicking"],
    /* the pages played when the book is done, after the ship's own message;
       the last says what comes next (next: the next book's number, or
       null when this was the last) */
    ending: (score, next) => [
      "The Yarn Drive coughs, catches and hums. Green dust lifts off the hull in a cloud, and the Catamaran rises out of the crash valley.",
      "Below, the Glow spreads out in the last of the light: the Vault hatches, the smoke over Fort Scrap, the broken towers of Old Litterburg. From up here it almost looks pretty.",
      "The radio crackles. <i>\"Nice flying, sugar. Rex is going to be sore about this. Keep your dial right where it is: I'll be in touch.\"</i><br><br>Then static. Poom never told Auntie Static his frequency.",
      "Far below, on a throne of hubcaps, <b>Junk Baron Rex</b> watches a little light climb into the sky.<br><br>\"Find out where it's going,\" he growls.",
      `<b>The End</b> of Book One: Down in the Glow.<br><br>${next ? `Score so far: ${score}.<br><br>On to Book ${next}.` : `Final score: ${score}.<br><br>Commander Poom will return.`}`,
    ],
  },
};
/* the words the help and the game's talk use: the book being played's, or,
 * if it has none yet, those of the book whose theme it wears. A book's
 * places, signs and ending are its own and never borrowed */
const textBook = () => BOOK_TEXT[themeBook()] || BOOK_TEXT[themeHome()];
/* a line of the game's own talk, in the current book's words: its say[key]
 * (text, or a function of args) if it has one, else the original's */
function say(key, original, ...args) {
  const B = textBook(), v = B && B.say && B.say[key];
  return v === undefined ? (typeof original === "function" ? original(...args) : original) : typeof v === "function" ? v(...args) : v;
}

function openHelp() {
  const B = textBook();
  if (B) return page("Help", [
    ["Story", B.story],
    ["Controls", CONTROLS.replace(/<p>On the map[\s\S]*?<\/p>/, B.map)],
    ["Creatures", spriteRow(B.creatures())],
    ["Items", spriteRow(B.items())],
    ["About", aboutText()],
  ]);
  page("Help", [
    ["Story", STORY],
    ["Controls", CONTROLS],
    ["Creatures", spriteRow([
      [ART.mousel.walk0.r, "Mousel", "Harmless, nosy, and pushy. Jump on one to bop it for a while."],
      [ART.barker.walk0.r, "Barker", "Charges the moment it sees you. Don't be there. One shot."],
      [ART.roombot.a.r, "Roombot", "Can't be hurt. It shoves you, preferably off something."],
      [ART.tank.a.r, "Clawtank", "Can't be hurt either. Fires hairballs straight ahead."],
      [ART.vac.walk0.r, "Vacuumoid", "The thieves. Deadly to touch, and it takes three shots."],
    ])],
    ["Items", spriteRow([
      [ART.items.fish, "Fish, milk, yarn, catnip, trophy", "100, 200, 500, 1000 and 5000 points. An extra life every 20,000."],
      [ART.items.ammo, "Raygun charge", "Five shots."],
      [ART.items.life, "Plush Poom", "An extra life."],
      [ART.gems[0], "Keycards", "Open the door of the same colour, for this level."],
      [ART.parts[0], "Ship parts", "Four of them. The whole point."],
    ])],
    ["About", aboutText()],
  ]);
}

const aboutText = () => `<p><b>Commander Poom</b> &mdash; <i>${theme.subtitle}</i>.</p>
<p>A love letter to the Commander Keen games of 1990 and 1991, and to sixteen colours, a PC speaker and a pogo stick. Every sprite, level and sound is new; nothing is borrowed but the feeling.</p>
<p class="credit gk-credit">Built by <a href="https://greykit.com/" target="_blank" rel="noopener">greykit.com</a></p>`;

function openSettings() {
  menu("Settings", [
    { label: "Sound", key: "M", meta: audio.muted ? "off" : "on", act: () => { toggleMute(); UI.pop(); openSettings(); } },
    { label: "Game speed", key: "G", meta: SPEEDS[speed].label, act: () => { cycleSpeed(); UI.pop(); openSettings(); } },
    "gap",
    { label: "Forget everything", key: "F", act: () => ask("Forget your saved game, high scores and settings? This cannot be undone.", "Forget everything", forgetEverything) },
  ], { onBack: () => UI.pop(), footer: "Forget everything clears only what Commander Poom keeps in this browser." });
}

const DEFAULT_SCORES = [
  ["Grandma Puma", 20000], ["Mousel #7", 15000], ["Mr. Whiskers", 10000], ["Roombot", 7500], ["The Hose", 5000], ["Barky", 2500], ["Poom's Mom", 1000],
];
/* until there are real scores, the table is the current book's cast */
function scores() { const B = textBook(); return store.get(KEYS.scores, null) || ((B && B.scores) || DEFAULT_SCORES).slice(); }
function openScores(highlight = -1) {
  const list = scores();
  const rows = list.map(([n, s], i) => `<tr${i === highlight ? ' class="me"' : ""}><td>${i + 1}.</td><td>${escapeHTML(n)}</td><td class="num">${s}</td></tr>`).join("");
  page("High scores", [["", `<table class="scores">${rows}</table>`]]);
}
const escapeHTML = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function enterName(score, then) {
  const wrap = el("div", "overlay"), box = el("div", "box msg");
  box.appendChild(el("p", null, say("highScore", n => `<b>A high score!</b><br><br>${n} points. Your name?`, score)));
  const input = el("input"); input.maxLength = 14; input.value = store.get(NS + "_name_v1", "") || "";
  input.setAttribute("aria-label", "Your name");
  box.appendChild(input);
  box.appendChild(el("p", "hint", "Enter to save"));
  wrap.appendChild(box);
  UI.push({ el: wrap, focus() { input.focus(); input.select(); }, key(ev) {
    if (ev.code === "Enter") { ev.preventDefault(); const n = input.value.trim() || "Poom"; store.set(NS + "_name_v1", n); UI.pop(); then(n); }
  } });
}

function recordScore(score, done) {
  const list = scores();
  if (score <= list[list.length - 1][1]) { done(-1); return; }
  enterName(score, name => {
    list.push([name, score]); list.sort((a, b) => b[1] - a[1]); list.length = 7;
    store.set(KEYS.scores, list);
    done(list.findIndex(e => e[0] === name && e[1] === score));
  });
}

/* ------------------------------------------------------------------ */
/* title, story, game over, the end                                       */

function openTitle() {
  UI.clear();
  dressFor(themeBook());
  G.mode = "title"; G.lv = null; mapLabel("");
  const saved = store.get(KEYS.save, null);
  showLogo();
  const items = [
    saved ? { label: "Continue game", key: "R", meta: `score ${saved.score}`, act: () => { UI.clear(); hideLogo(); G.run = saved; enterMap(); } } : null,
    { label: "New game", key: "N", act: () => {
      const go = () => { UI.clear(); hideLogo(); G.run = newRun(); store.del(KEYS.save); story(); };
      if (saved) ask("Start a new game? Your saved game will be lost.", "New game", go); else go();
    } },
    { label: "High scores", key: "O", act: () => openScores() },
    "gap",
    { label: "Settings", key: "S", act: () => openSettings() },
    { label: "Help", key: "?", act: () => openHelp() },
    { label: "About", key: "A", act: () => page("About", [["", aboutText()]]) },
  ].filter(Boolean);
  menu("", items, { cls: "title", footer: '<span class="gk-credit">Built by <a href="https://greykit.com/" target="_blank" rel="noopener">greykit.com</a></span>' });
}
/* The logo: the title screen's, with its episode line, and a level's title
 * card, with the level's name, which fades after a moment. Nothing keeps
 * it up over play: frame() fades it if it's left showing. */
const logoEl = () => document.getElementById("logo");
let logoTimer = null;
function showLogo(line = theme.subtitle) {
  clearTimeout(logoTimer); logoTimer = null;
  const el = logoEl();
  el.querySelector(".ep").textContent = line;
  el.classList.remove("fading");
  el.hidden = false;
}
function hideLogo() { clearTimeout(logoTimer); logoTimer = null; logoEl().hidden = true; logoEl().classList.remove("fading"); }
function fadeLogo(after = 0) {
  clearTimeout(logoTimer);
  logoTimer = setTimeout(() => {
    logoEl().classList.add("fading");
    logoTimer = setTimeout(hideLogo, 1000);
  }, after);
}
function levelTitle(name) { showLogo(name); fadeLogo(2000); }

function story() {
  G.mode = "story";
  const B = textBook();
  const pages = (B ? B.story : STORY).split("</p>").map(s => s.replace("<p>", "").trim()).filter(Boolean);
  let i = 0;
  const next = () => {
    if (i >= pages.length) { enterMap(); saveRun(); message(B ? B.arrive : "This is Planet Hiss. Walk to a level and press <kbd>Ctrl</kbd>, <kbd>Z</kbd> or <kbd>Space</kbd> to go in.<br><br><kbd>Esc</kbd> pauses; <kbd>Enter</kbd> shows your status."); return; }
    message(pages[i++], { onClose: next });
  };
  next();
}

function gameOver() {
  G.mode = "title";
  const score = G.run.score;
  store.del(KEYS.save);
  sfx("die");
  message(say("gameOver", n => `<b>Game over.</b><br><br>Commander Poom is out of lives. Final score: ${n}.`, score), { onClose: () => recordScore(score, i => { openTitle(); if (i >= 0) openScores(i); }) });
}

function ending() {
  G.mode = "ending";
  sfx("done");
  const r = G.run;
  addScore(10000);
  /* the last book played ends the game in its own words, bonus included */
  const own = BOOK_TEXT[r.book] && BOOK_TEXT[r.book].ending;
  const pages = own ? own(r.score, null) : [
    "<b>The Catamaran is whole again.</b><br><br>Poom bolts in the Laser Pointer, spins up the Yarn Drive, and Planet Hiss falls away beneath him. Bonus: 10,000 points.",
    "He lands in the back yard with a soft <i>thump</i>, hides the ship behind the shed, and is in bed, eyes shut, when the front door opens.",
    "\"Was he good?\" his mom asks the babysitter. \"Purrfect,\" says the babysitter.<br><br>From the hall closet comes a faint, hungry whirr...",
    `<b>The End</b> of Episode One.<br><br>Final score: ${r.score}.<br><br>Commander Poom will return.`,
  ];
  playPages(pages, () => { store.del(KEYS.save); recordScore(r.score, k => { openTitle(); if (k >= 0) openScores(k); }); });
}

/* ------------------------------------------------------------------ */
/* touch controls                                                        */

function setupTouch() {
  const pad = document.getElementById("touch");
  if (!("ontouchstart" in window) && !navigator.maxTouchPoints) return;
  pad.hidden = false;
  for (const b of pad.querySelectorAll("[data-a]")) {
    const a = b.dataset.a;
    const on = ev => { ev.preventDefault(); audio.unlock();
      if (UI.top()) { UI.padPress(a); return; }
      if (a === "pause") { openPause(); return; }
      if (a === "status") { statusWindow(); return; }
      touchHeld.add(a); pressed.add(a); b.classList.add("on"); };
    const off = ev => { ev.preventDefault(); touchHeld.delete(a); b.classList.remove("on"); };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("pointerleave", off);
  }
}

/* ------------------------------------------------------------------ */
/* the loop                                                              */

function fit() {
  const pad = document.getElementById("touch").hidden ? 0 : 0;
  const s0 = Math.min(innerWidth / W, (innerHeight - pad) / H);
  const si = Math.floor(s0);
  const s = si >= 2 && si / s0 > 0.8 ? si : s0;
  stage.style.width = W * s + "px"; stage.style.height = H * s + "px";
  uiRoot.style.transform = `scale(${s})`;
}
addEventListener("resize", fit);

let acc = 0, last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  acc += Math.min(100, now - last); last = now;
  pollPad();
  while (acc >= STEP) {
    acc -= STEP;
    G.t++;
    if (!UI.top()) {
      if (wasPressed("mute")) toggleMute();
      if (G.mode === "level" || G.mode === "map") {
        if (wasPressed("pause")) openPause();
        else if (wasPressed("status")) statusWindow();
      }
      if (!UI.top()) {
        if (G.mode === "level") updateLevel();
        else if (G.mode === "map") updateMap();
      }
    }
    pressed.clear();
  }
  if ((G.mode === "level" || G.mode === "map") && !logoEl().hidden && !logoEl().classList.contains("fading") && !logoTimer) fadeLogo(0);
  if (G.mode === "level" && G.lv) drawLevel();
  else if (G.mode === "map" || (G.mode === "story" && G.map.p) || G.mode === "ending") { if (G.map.p) drawMap(); else drawTitleScene(G.t); }
  else drawTitleScene(G.t);
}

function boot() {
  buildArt();
  const classicMap = paintMapTiles();
  mapArtSets = { classic: classicMap, wasteland: paintWasteMap(classicMap) };
  mapArt = classicMap;
  G.map = { t: 0, p: null };
  injectTitleCSS();
  const B = BOOK_TEXT[themeBook()];
  const run = runBoot({ lines: [bootReloadLine(), ...((B && B.boot) || ["sixteen colours: ok", "pc speaker: ok"])] });
  fit();
  setupTouch();
  syncSoundButton();
  document.getElementById("snd").addEventListener("click", () => { audio.unlock(); toggleMute(); });

  /* debug: ?level=A02 drops straight into a level with everything; ?book=B
   * onto that book's map */
  const q = new URLSearchParams(location.search);
  const lvq = (q.get("level") || "").toUpperCase(), bq = (q.get("book") || "").toUpperCase();
  if (MAPS[lvq] || WORLDS[bq]) {
    run.cancel();
    hideLogo();
    G.run = newRun(); G.run.ammo = 50;
    G.run.book = MAPS[lvq] ? MAPS[lvq].book : bq;
    G.map.p = null;
    enterMap();
    if (MAPS[lvq]) startLevel(lvq);
  } else {
    openTitle();
    const saved = store.get(KEYS.save, null);
    run.finish([saved ? `game in progress: score ${saved.score}` : "no game in progress"]);
  }
  requestAnimationFrame(frame);
}

boot();
