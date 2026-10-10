/* Commander Poom -- Book 5's art: Termination Day (map set A).
 *
 * TERMINUS, a machine mind's station in orbit, overrun by an alien swarm
 * and stalked by a hunter from the stars: a mashup in the spirit of The
 * Terminator, Aliens and Predator (docs/story/book-5-story.md). Three
 * tilesets (the Machine Decks, the Biodome, the Hive), the creatures, the
 * items, Poom's marine armour, the world map and the title backdrop.
 * Registers with art.js; loads after it. */
"use strict";

const B5_STEEL = ["#0a0c10", "#151920", "#222831", "#323a46", "#47525f", "#646f7d", "#8e99a7", "#c4ccd6"];
const B5_RED = ["#3a0604", "#7a0e08", "#c41a10", "#ff2a1a", "#ff8a6a"];
const B5_RESIN = ["#05070a", "#0c1018", "#141c26", "#1e2a38", "#2e4254", "#466276", "#6a8ea0"];
const B5_ACID = ["#2a4a06", "#4a7a0c", "#7ab816", "#a8e83a", "#e0ff9a"];
const B5_JUNGLE = ["#08160a", "#0e2812", "#163e1c", "#225a28", "#327a36", "#4c9c44", "#78c060"];
const B5_OLIVE = ["#262c16", "#3a4422", "#525e30", "#6c7a42", "#8a9a58"];
const B5_GREEN = { dark: "#04170b", mid: "#1c5a2a", hi: "#5aff8a" };

const b5px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

Object.assign(THEMES, {
  /* the Machine Decks: cold steel, red seams and red eyes */
  machine: { sky: 0, far: [8, 0], ground: [8, 0, 7], crust: ["#ff2a1a", "#ff8a6a"], alt: [8, 0], plat: [7, 8], bg: [0, 8], liquid: ["#ff2a1a", "#ff8a6a", "#3a0604"], liquidName: "molten metal", style: "machine" },
  /* the Biodome: a jungle grown wild under glass */
  biodome: { sky: 0, far: [2, 0], ground: [6, 2, 0], crust: ["#4c9c44", "#78c060"], alt: [2, 6], plat: [6, 14], bg: [0, 2], liquid: ["#327a36", "#78c060", "#08160a"], liquidName: "the swamp", style: "biodome" },
  /* the Hive: black resin over everything, eggs, acid */
  hive5: { sky: 0, far: [1, 0], ground: [1, 0, 8], crust: ["#466276", "#6a8ea0"], alt: [1, 0], plat: [8, 0], bg: [0, 1], liquid: ["#a8e83a", "#e0ff9a", "#2a4a06"], liquidName: "acid", style: "hive5" },
});

/* the pieces every TERMINUS tileset shares */
function b5Common(tiles, mk, E, frame) {
  const px = b5px;
  const door = (a, b, top) => mk(g => {
    px(g, frame, 0, 0, T, T);
    px(g, B5_STEEL[4], 1, 0, T - 2, T); px(g, B5_STEEL[6], 1, 0, 1, T); px(g, B5_STEEL[2], T - 2, 0, 1, T);
    for (let y = top ? 6 : 1; y < T; y += 4) { px(g, B5_STEEL[3], 3, y, T - 6, 2); px(g, B5_STEEL[5], 3, y, T - 6, 1); }
    if (top) { px(g, B5_STEEL[1], 4, 1, 8, 4); px(g, E(b), 5, 2, 6, 2); px(g, E(a), 6, 2, 4, 1); }
    else { px(g, E(b), 3, 13, T - 6, 2); px(g, E(a), 3, 13, T - 6, 1); }
  });
  const COLOURS = [[12, 4], [14, 6], [10, 2], [9, 1], [7, 8]];
  tiles.doors = COLOURS.map(([a, b]) => door(a, b, true));
  tiles.doorsBelow = COLOURS.map(([a, b]) => door(a, b, false));
  /* the exit: an airlock, its light green */
  tiles.exit = [false, true].map(open => { const c = makeCanvas(T, T * 2), g = c.getContext("2d");
    px(g, frame, 0, 2, T, 30); px(g, B5_STEEL[4], 0, 2, T, 3); px(g, B5_STEEL[4], 0, 5, 2, 27); px(g, B5_STEEL[4], T - 2, 5, 2, 27);
    if (open) { px(g, "#020304", 2, 5, 12, 27); g.fillStyle = "rgba(90, 255, 138, 0.15)"; g.fillRect(2, 22, 12, 10); }
    else { px(g, B5_STEEL[3], 2, 5, 6, 27); px(g, B5_STEEL[3], 8, 5, 6, 27); px(g, B5_STEEL[5], 2, 5, 12, 1); px(g, B5_STEEL[1], 7, 5, 2, 27);
      for (let y = 10; y < 30; y += 6) { px(g, "#e0b21c", 2, y, 5, 1); px(g, "#e0b21c", 9, y, 5, 1); } }
    g.fillStyle = "rgba(90, 255, 138, 0.4)"; g.fillRect(4, 0, 8, 3); px(g, "#1f7a33", 6, 0, 4, 2); px(g, "#c8ffd2", 7, 0, 2, 1);
    return c; });
  /* a warp door: an airlock porthole, blue light swirling inside */
  tiles.warp = [0, 1, 2, 3].map(f => { const c = makeCanvas(T * 2, T * 2), g = c.getContext("2d");
    px(g, B5_STEEL[3], 2, 2, 28, 30); px(g, B5_STEEL[5], 2, 2, 28, 2); px(g, B5_STEEL[5], 2, 2, 2, 30); px(g, B5_STEEL[1], 28, 2, 2, 30);
    g.fillStyle = "#081830"; g.beginPath(); g.arc(16, 17, 10, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 3; k++) { g.strokeStyle = k & 1 ? "#4a86e8" : "#9ac8ff"; g.beginPath(); g.arc(16, 17, 3 + k * 3, f * 0.9 + k * 2, f * 0.9 + k * 2 + 2.2); g.stroke(); }
    px(g, "#4a86e8", 13, 0, 6, 2);
    return c; });
  tiles.switch = [0, 1].map(on => mk(g => {
    px(g, B5_STEEL[2], 3, 9, 10, 7); px(g, B5_STEEL[5], 3, 9, 10, 1);
    px(g, on ? B5_GREEN.hi : B5_RED[3], 6, 12, 4, 2);
    g.strokeStyle = B5_STEEL[6]; g.lineWidth = 2; g.beginPath(); g.moveTo(8, 11); g.lineTo(on ? 13 : 3, 3); g.stroke();
    px(g, B5_STEEL[7], on ? 12 : 2, 2, 2, 2);
  }));
  tiles.socket = mk(g => { px(g, B5_STEEL[2], 2, 2, 12, 12); px(g, B5_STEEL[5], 2, 2, 12, 1); px(g, "#000", 4, 4, 8, 8); px(g, B5_RED[3], 5, 5, 1, 1); });
  tiles.bridge = mk(g => { px(g, B5_STEEL[4], 0, 0, T, 5); px(g, B5_STEEL[6], 0, 0, T, 1); for (let x = 1; x < T; x += 3) px(g, B5_STEEL[1], x, 1, 2, 4); px(g, B5_STEEL[0], 0, 5, T, 2); });
  tiles.platform = [[B5_GREEN.hi, "#d8ffe0"], ["#ffb02e", "#fff0b0"], [B5_STEEL[1], B5_STEEL[2]]].map(([l0, l1]) => [0, 1].map(f => {
    const c = makeCanvas(T * 2, 8), g = c.getContext("2d");
    px(g, B5_STEEL[4], 0, 0, 32, 6); px(g, B5_STEEL[6], 0, 0, 32, 1); px(g, B5_STEEL[2], 0, 5, 32, 1); px(g, "#000", 1, 6, 30, 2);
    for (let x = 3; x < 32; x += 8) px(g, (x >> 3) % 2 === f ? l1 : l0, x, 2, 3, 2);
    return c;
  }));
  tiles.pole = mk(g => { px(g, B5_STEEL[1], 6, 0, 4, T); px(g, B5_STEEL[5], 7, 0, 2, T); px(g, B5_STEEL[7], 7, 0, 1, T); });
  tiles.sign = mk(g => { px(g, B5_STEEL[2], 2, 1, 12, 10); px(g, B5_GREEN.dark, 3, 2, 10, 7); for (const y of [3, 5, 7]) px(g, B5_GREEN.hi, 4, y, 5 + (y & 2), 1); px(g, B5_STEEL[3], 7, 11, 2, 5); });
  tiles.ice = tiles.ground[0];
}

/* The Machine Decks: steel plate with a red seam and red indicator lamps,
 * a red-lit edge on top; a ledge a grating, the hazard steel spikes with
 * red-hot tips. */
TILE_STYLES.machine = (tiles, th, mk, E) => {
  const px = b5px;
  const plate = (top, kind, seed) => mk(g => {
    const r = rng(seed);
    px(g, B5_STEEL[3], 0, 0, T, T);
    for (let i = 0; i < 14; i++) px(g, B5_STEEL[r() < .5 ? 2 : 4], r() * T | 0, r() * T | 0, 1 + (r() * 2 | 0), 1);
    px(g, B5_STEEL[1], 0, T - 1, T, 1); px(g, B5_STEEL[1], T - 1, 0, 1, T); px(g, B5_STEEL[5], 0, 0, T, 1); px(g, B5_STEEL[5], 0, 0, 1, T);
    if (kind === 1) { px(g, B5_STEEL[1], 3, 5, 10, 6); for (let x = 4; x < 12; x += 2) px(g, B5_STEEL[0], x, 6, 1, 4); }
    if (kind === 2) { px(g, B5_RED[1], 11, 3, 3, 2); px(g, B5_RED[3], 12, 3, 1, 1); }
    if (top) { px(g, B5_STEEL[5], 0, 0, T, 2); px(g, B5_STEEL[7], 0, 0, T, 1); px(g, B5_RED[2], 0, 2, T, 1); g.fillStyle = "rgba(255, 42, 26, 0.18)"; g.fillRect(0, 3, T, 2); }
  });
  tiles.ground = [plate(false, 0, 1), plate(false, 1, 11), plate(false, 0, 21), plate(false, 0, 31), plate(false, 2, 41), plate(false, 0, 51), plate(false, 0, 61), plate(false, 0, 71)];
  tiles.groundTop = [plate(true, 0, 3), plate(true, 0, 13), plate(true, 2, 23)];
  tiles.plat = mk(g => { px(g, B5_STEEL[4], 0, 0, T, 4); px(g, B5_STEEL[6], 0, 0, T, 1); for (let x = 1; x < T; x += 3) px(g, B5_STEEL[1], x, 1, 2, 3); px(g, B5_RED[2], 0, 4, T, 1); });
  tiles.spikes = mk(g => {
    px(g, B5_STEEL[2], 0, 13, T, 3);
    for (let i = 0; i < 4; i++) { const x = i * 4; g.fillStyle = B5_STEEL[5]; g.beginPath(); g.moveTo(x, 13); g.lineTo(x + 2, 4); g.lineTo(x + 4, 13); g.fill(); px(g, B5_STEEL[7], x + 2, 6, 1, 4); px(g, B5_RED[3], x + 2, 4, 1, 2); }
    g.fillStyle = "rgba(255, 42, 26, 0.2)"; g.fillRect(0, 2, T, 5);
  });
  b5Common(tiles, mk, E, B5_STEEL[1]);
};

/* the decks' far wall: racks of chrome skeletons in rows, red eyes lit, a
 * conveyor carrying more, and the machine's red glow */
FAR_STYLES.machine = () => {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(71);
  for (let y = 0; y < 200; y += 4) { const k = y / 200; b5px(g, `rgb(${Math.round(10 + 30 * k)},${Math.round(10 + 4 * k)},${Math.round(16 + 4 * k)})`, 0, y, 320, 4); }
  for (const [y0, sc] of [[40, 1], [96, 1.4]]) {
    for (let x = 6; x < 320; x += 22 * sc) {
      const col = sc > 1 ? "#1e2228" : "#14171c";
      g.fillStyle = col; g.beginPath(); g.arc(x + 6 * sc, y0 + 5 * sc, 5 * sc, 0, Math.PI * 2); g.fill();
      b5px(g, col, x + 4 * sc, y0 + 9 * sc, 4 * sc, 26 * sc); b5px(g, col, x, y0 + 13 * sc, 12 * sc, 3 * sc);
      b5px(g, "#ff2a1a", x + 3 * sc, y0 + 4 * sc, 2, 1); b5px(g, "#ff2a1a", x + 8 * sc, y0 + 4 * sc, 2, 1);
    }
    b5px(g, "#2a2e36", 0, y0 + 36 * sc, 320, 4); b5px(g, "#3a404a", 0, y0 + 36 * sc, 320, 1);
  }
  const glow = g.createLinearGradient(0, 150, 0, 200); glow.addColorStop(0, "rgba(255, 42, 26, 0)"); glow.addColorStop(1, "rgba(255, 42, 26, 0.3)");
  g.fillStyle = glow; g.fillRect(0, 150, 320, 50);
  for (let i = 0; i < 20; i++) b5px(g, "#ff8a6a", r() * 320 | 0, 160 + (r() * 40 | 0));
  return c;
};

/* The Biodome: dark soil with roots, ferns on top; a ledge a branch, the
 * hazard a row of sharpened stakes, the pole a vine. */
TILE_STYLES.biodome = (tiles, th, mk, E) => {
  const px = b5px;
  const soil = (top, kind, seed) => mk(g => {
    const r = rng(seed);
    px(g, "#2a1e14", 0, 0, T, T);
    for (let i = 0; i < 24; i++) px(g, ["#1a120c", "#3a2a1c", "#4a3626"][r() * 3 | 0], r() * T | 0, r() * T | 0, 1 + (r() * 2 | 0), 1);
    if (kind === 1) { let y = 4 + (r() * 8 | 0); for (let x = 0; x < T; x++) { px(g, "#5a4230", x, y); if (r() < .3) y += r() < .5 ? -1 : 1; } }
    if (kind === 2) { px(g, "#9ac8ff", 6, 9, 1, 1); px(g, "#4a86e8", 7, 10, 2, 1); }
    if (top) {
      for (let x = 0; x < T; x++) { const h = 2 + (r() * 4 | 0); px(g, B5_JUNGLE[r() < .5 ? 3 : 4], x, 0, 1, h); }
      for (let k = 0; k < 3; k++) { const x = r() * 14 | 0; px(g, B5_JUNGLE[5], x, 0, 2, 1); px(g, B5_JUNGLE[6], x, 0, 1, 1); }
    }
  });
  tiles.ground = [soil(false, 0, 5), soil(false, 1, 15), soil(false, 0, 25), soil(false, 0, 35), soil(false, 2, 45), soil(false, 0, 55), soil(false, 1, 65), soil(false, 0, 75)];
  tiles.groundTop = [soil(true, 0, 7), soil(true, 0, 17), soil(true, 0, 27)];
  tiles.plat = mk(g => { px(g, "#4a3220", 0, 0, T, 4); px(g, "#6a4a30", 0, 0, T, 1); px(g, "#2a1a0e", 0, 4, T, 1); px(g, B5_JUNGLE[4], 3, 0, 3, 1); px(g, B5_JUNGLE[3], 11, 4, 1, 3); });
  tiles.spikes = mk(g => {
    px(g, "#2a1e14", 0, 13, T, 3);
    for (let i = 0; i < 4; i++) { const x = i * 4 + 1; g.fillStyle = "#8a6a44"; g.beginPath(); g.moveTo(x, 13); g.lineTo(x + 1, 3 + (i & 1) * 2); g.lineTo(x + 2.5, 13); g.fill(); px(g, "#c8a878", x + 1, 4 + (i & 1) * 2, 1, 2); }
    px(g, "#4a3220", 0, 10, T, 1);
  });
  b5Common(tiles, mk, E, "#1a120c");
  tiles.pole = mk(g => { px(g, B5_JUNGLE[2], 6, 0, 4, T); px(g, B5_JUNGLE[4], 7, 0, 2, T); for (let y = 3; y < T; y += 7) { px(g, B5_JUNGLE[5], 3, y, 3, 2); px(g, B5_JUNGLE[5], 10, y + 3, 3, 2); } });
};

/* the Biodome's view: great trees in mist, the dome's glass ribs and the
 * stars beyond them, and somewhere in the leaves three red dots */
FAR_STYLES.biodome = () => {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(81);
  for (let y = 0; y < 200; y += 4) { const k = y / 200; b5px(g, `rgb(${Math.round(6 + 12 * k)},${Math.round(14 + 36 * k)},${Math.round(16 + 20 * k)})`, 0, y, 320, 4); }
  for (let i = 0; i < 40; i++) b5px(g, "#c8d8e0", r() * 320 | 0, r() * 60 | 0);
  g.strokeStyle = "rgba(140, 180, 200, 0.25)"; g.lineWidth = 2;
  for (const x of [-40, 80, 200, 320]) { g.beginPath(); g.moveTo(x, 200); g.quadraticCurveTo(x + 20, 30, 160, -10); g.stroke(); }
  for (const [col, n, w] of [["#0c2414", 6, 14], ["#12321c", 5, 20]]) for (let i = 0; i < n; i++) {
    const x = r() * 320; b5px(g, col, x, 40, w, 160);
    g.fillStyle = col; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + w / 2 + (r() - .5) * 50, 40 + r() * 60, 22 + r() * 14, 10 + r() * 8, 0, 0, Math.PI * 2); g.fill(); }
  }
  g.fillStyle = "rgba(160, 200, 180, 0.12)"; g.fillRect(0, 150, 320, 50);
  for (const [x, y] of [[230, 96], [234, 99], [238, 96]]) { b5px(g, "#ff2020", x, y, 2, 2); g.fillStyle = "rgba(255, 32, 32, 0.3)"; g.fillRect(x - 1, y - 1, 4, 4); }
  return c;
};

/* The Hive: black resin in ribs and cords over everything, glossy, a sheen
 * of slime on top; a ledge a resin rib, the hazard acid-tipped spines,
 * the pole a resin cord. */
TILE_STYLES.hive5 = (tiles, th, mk, E) => {
  const px = b5px;
  const resin = (top, kind, seed) => mk(g => {
    const r = rng(seed);
    px(g, B5_RESIN[2], 0, 0, T, T);
    for (let x = 0; x < T; x += 4) { px(g, B5_RESIN[3], x, 0, 2, T); px(g, B5_RESIN[4], x, 0, 1, T); }
    for (let i = 0; i < 8; i++) px(g, B5_RESIN[1], r() * T | 0, r() * T | 0, 2, 1);
    for (let y = 3; y < T; y += 6) px(g, B5_RESIN[5], (r() * 12) | 0, y, 3, 1);
    if (kind === 1) { g.fillStyle = "#4a5a3a"; g.beginPath(); g.ellipse(8, 9, 4, 5, 0, 0, Math.PI * 2); g.fill(); px(g, "#6a7a4a", 6, 6, 2, 2); px(g, "#2a3420", 7, 9, 2, 1); }
    if (kind === 2) { px(g, B5_ACID[2], 10, 4, 1, 6); px(g, B5_ACID[3], 10, 4, 1, 2); }
    if (top) { px(g, B5_RESIN[5], 0, 0, T, 2); px(g, B5_RESIN[6], 0, 0, T, 1); for (let x = 0; x < T; x += 3) if (r() < .6) px(g, "#8aa8b8", x, 2, 1, 1 + (r() * 2 | 0)); }
  });
  tiles.ground = [resin(false, 0, 3), resin(false, 0, 13), resin(false, 1, 23), resin(false, 0, 33), resin(false, 2, 43), resin(false, 0, 53), resin(false, 0, 63), resin(false, 0, 73)];
  tiles.groundTop = [resin(true, 0, 5), resin(true, 0, 15), resin(true, 2, 25)];
  tiles.plat = mk(g => { px(g, B5_RESIN[4], 0, 0, T, 4); px(g, B5_RESIN[6], 0, 0, T, 1); for (let x = 2; x < T; x += 5) px(g, B5_RESIN[2], x, 1, 1, 3); px(g, B5_RESIN[1], 0, 4, T, 1); });
  tiles.spikes = mk(g => {
    px(g, B5_RESIN[2], 0, 13, T, 3);
    for (const [x, h] of [[2, 9], [6, 12], [10, 8], [13, 10]]) { g.fillStyle = B5_RESIN[4]; g.beginPath(); g.moveTo(x - 2, 13); g.quadraticCurveTo(x, 13 - h * 0.6, x + 1, 13 - h); g.lineTo(x + 2, 13); g.closePath(); g.fill(); px(g, B5_ACID[3], x + 1, 13 - h, 1, 2); }
  });
  b5Common(tiles, mk, E, B5_RESIN[1]);
  tiles.pole = mk(g => { px(g, B5_RESIN[3], 6, 0, 4, T); px(g, B5_RESIN[5], 7, 0, 1, T); for (let y = 0; y < T; y += 4) px(g, B5_RESIN[2], 6, y, 4, 1); });
};

/* the Hive's far wall: ribbed resin rising like a cathedral, rows of eggs
 * at its foot, a cold blue-green fog */
FAR_STYLES.hive5 = () => {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(91);
  b5px(g, "#05070a", 0, 0, 320, 200);
  for (let x = 0; x < 320; x += 10) { const h = 140 + Math.sin(x / 30) * 30; b5px(g, "#0e141c", x, 200 - h, 6, h); b5px(g, "#18222e", x, 200 - h, 1, h); }
  g.strokeStyle = "#141c26"; g.lineWidth = 3;
  for (let x = -20; x < 340; x += 60) { g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 30, 60, x + 60, 0); g.stroke(); }
  for (let x = 8; x < 320; x += 18) { g.fillStyle = "#2a3424"; g.beginPath(); g.ellipse(x, 186, 6, 8, 0, 0, Math.PI * 2); g.fill(); b5px(g, "#3a4a32", x - 3, 181, 2, 3); }
  const fog = g.createLinearGradient(0, 120, 0, 200); fog.addColorStop(0, "rgba(90, 160, 150, 0)"); fog.addColorStop(1, "rgba(90, 160, 150, 0.22)");
  g.fillStyle = fog; g.fillRect(0, 120, 320, 80);
  for (let i = 0; i < 16; i++) b5px(g, "#7ad8c8", r() * 320 | 0, r() * 200 | 0);
  return c;
};

/* ------------------------------------------------------------------ */
/* Poom's look: a marine's combat helmet with a lamp on it, olive armour,
 * a chest plate, boots. Tail still his.                                 */

const B5_MARINE_PAL = { o: "#3a4422", O: "#566232", P: "#707e44", q: "#262c16", Y: "#fff0b0", A: "#525e30", a: "#8a9a58", K: "#2a2e22", L: "#1c1e16", M: "#3e4430", N: "#6c7a42" };
const B5_MARINE_HEAD = [
  "..............",
  "...ooooooo....",
  ".ooOOOOOOOo...",
  "oOOPPOOOOOOoY.",
  "oOOOOOOOOOOoo.",
  "qqqqqqqqqqqq..",
  ".ggggFFgFFgg..",
  ".ggggF0gF0iii.",
  ".ggggggggiiiD.",
  "..ggggggiii0..",
];
const B5_MARINE_HEAD_BACK = [
  "..............",
  "...ooooooo....",
  ".ooOOOOOOOo...",
  "oOOPPOOOOOOo..",
  "oOOOOOOOOOOo..",
  "qqqqqqqqqqqq..",
  ".gggggggggg...",
  ".gggggggggg...",
  ".gggggggggg...",
  "..gggggggg....",
];
const B5_MARINE_HEAD_OUT = [
  "..............",
  "...ooooooo....",
  ".ooOOOOOOOo...",
  "oOOPPOOOOOOo..",
  "oOOOOOOOOOOoo.",
  "qqqqqqqqqqqq..",
  ".gggFgFgFgFg..",
  ".ggggFgggFgii.",
  ".gggFgFgFgFiiD",
  "..ggggggi000..",
];
LOOKS.marine = {
  pal: B5_MARINE_PAL,
  head: rows => rows === P_HEAD ? B5_MARINE_HEAD : rows === P_HEAD_BACK ? B5_MARINE_HEAD_BACK : B5_MARINE_HEAD_OUT,
  body: rows => rows.map((r, y) => {
    if (y === 0) return r.replace(/h/g, "q");
    const first = r.indexOf("9");
    if (y === 5) return recolour([r], { 9: "K" })[0];
    return [...r].map((c, x) => c === "9" ? (x === first ? "A" : (y === 2 || y === 3) && x > first + 1 && x < first + 7 ? "a" : "N") : c === "5" ? "M" : c === "F" ? "K" : c === "C" ? "L" : c).join("");
  }),
  map: rows => {
    const b = rows.findIndex(r => r.includes("9"));
    return rows.map((r, y) => {
      if (y >= b) return recolour([r], { 9: "N", 5: "M", C: "L" })[0];
      if (y < 2) return recolour([r], { g: "o", i: "O" })[0];
      return recolour([r], { C: "O", F: "P", 4: "q" })[0];
    });
  },
};

/* ------------------------------------------------------------------ */
/* TERMINUS's creatures (docs/story/book-5-story.md)                     */

const B5_PAL = {
  k: "#121212", e: "#000000", w: "#f0e8d8",
  c: "#e08a3a", C: "#f8b060", d: "#a85a20",
  x: "#141820", X: "#26303e", z: "#3e4e62", Z: "#6a7e96", t: "#c8d8e0",
  s: "#646f7d", S: "#c4ccd6", h: "#8e99a7", r: "#ff2a1a", R: "#ff8a6a",
  j: "#1a1410", J: "#3a2a20", u: "#2a2a2a",
  p: "#e8c8b0", P: "#c89a80", q: "#a86a58",
  m: "#9aa4ae", M: "#e8eef4", n: "#5a646e",
  g: "#3a4422", G: "#566232", y: "#e0b21c", Y: "#fff0b0",
  f: "#4a5a2a", F: "#7a8a3a", b: "#2a3218", v: "#c8a060",
  a: "#a8e83a", A: "#e0ff9a", l: "#5aff8a",
  o: "#6a3a2a", O: "#8a5a3a",
};
const b5mirror = rows => { const w = Math.max(...rows.map(r => r.length)); return rows.map(r => [...r.padEnd(w, ".")].reverse().join("")); };

/* a station cat: ginger, unbothered (a pusher, facing left) */
const B5_CAT = {
  walk0: [".c...c......", ".cc.cc......", ".cCCCc......", "ceCCeCc.....", "cCwwwCcccccc", ".cCCcccccccC", "..cccccccc.d", "..c.c..c.c.."],
  walk1: [".c...c......", ".cc.cc......", ".cCCCc......", "ceCCeCc.....", "cCwwwCcccccc", ".cCCcccccccC", "..cccccccc.d", ".c..c.c..c.."],
  look: [".c...c......", ".cc.cc......", ".cCCCc......", "ceCCeCc.....", "cCwwwCccc...", ".cCCccccc...", ".cccccccc..d", ".cccccccccdd"],
  stunned: [".cc.cc......", "ccCCCCccccc.", "cCwwwCccccCd", ".c.c..c.c..."],
};

/* a skulker: a crouched black alien, a long head, a whip of a tail
   (charger, facing right) */
const B5_SKULKER = {
  walk0: ["..........XXXz..", "z......XXXXZZz..", ".zXXXXXXXXXXXtt.", "..XxXXXXXXX.tttt", "..xx.XXXX.......", ".xx..x..x.......", "xx..x....x......", "x...xx...xx....."],
  walk1: ["..........XXXz..", "z......XXXXZZz..", ".zXXXXXXXXXXXtt.", "..XxXXXXXXX.tttt", "..xx.XXXX.......", "..xx.x..x.......", "...xx..xx.......", "...xx..xx......."],
  charge: ["...........XXXz.", ".z......XXXXZZzz", "z.zXXXXXXXXXXXtt", "...XxXXXXXXX.ttt", "...x.XXXX..xx...", "..x..x..x...x...", ".x..x....x......", "x..xx.....xx...."],
};
/* a clinger: a pale many-legged thing that leaps at faces (charger) */
const B5_CLINGER = {
  walk0: ["....pPPp..", "..pPPPPPp.", "q.pPpPpPp.", ".qp.p.p.p.", "..p.p.p.p."],
  walk1: ["....pPPp..", "..pPPPPPp.", "q.pPpPpPp.", "q.p.p.p.p.", ".p.p.p.p.."],
  charge: ["p.p.pPPp.p", ".pPPPPPPp.", "qqpPpPpPp.", "q..p.p.p..", ".........."],
};
/* a burster: a pale worm with a mouthful of steel teeth (charger) */
const B5_BURSTER = {
  walk0: ["....PPP.", "..PPPPwP", "pPPPPPwP", "qppppPP."],
  walk1: ["....PPP.", ".pPPPPwP", "qPPPPPwP", ".ppppPP."],
  charge: [".....PPP", "...PPPwP", ".pPPPPPw", "qqppppPP"],
};
/* a drone of the swarm: the tall alien, upright (walker, facing left) */
const B5_XDRONE_TOP = [
  "...zzZZZZz....",
  "..zXXXXXXZZz..",
  ".zXXXXXXXXXZz.",
  "..XXtttXXXXX..",
  "...XttttXX....",
  "....XXXXX.....",
  "...XXzXXXX....",
  "..XXzzzXXXX...",
  ".XX.XzXXX.XX..",
  "XX..XXXXX..XX.",
  "X...XzXXX...X.",
  "....XXXXX.....",
  "...XXXXXXX..zz",
  "...XX...XX.z..",
];
const B5_XDRONE = {
  walk0: B5_XDRONE_TOP.concat(["..XX....XXz...", "..XX.....XX...", ".XX......XX...", ".X........X...", "XX........XX.."]),
  walk1: B5_XDRONE_TOP.concat(["...XX..XXz....", "...XX..XX.....", "...XX..XX.....", "...X....X.....", "..XX....XX...."]),
  jump: B5_XDRONE_TOP.concat(["..XXXXXXXz....", ".XX.....XX....", "XX.......XX..."]),
};
/* the Brood Mother: the swarm's queen, a crest like a crown (lieutenant,
   facing left) */
const B5_BROOD_TOP = [
  "zzZZZZZZZZz.....",
  ".zZXXXXXXXXZz...",
  "..zXXXXXXXXXZz..",
  "...XXXttXXXXXz..",
  "....XXtttXXXX...",
  "......XXXXX.....",
  ".....XXzzXXXX...",
  "...XXXzzzzXXXX..",
  "..XX.XXzzzXXXXX.",
  ".XX..XXXzXXX..XX",
  "XX...XXXXXX....X",
  "X..XXXXXXXXX..XX",
  "..XXzXXXXXXXXXX.",
  "..XX.XXXXXX.....",
  "....XXXXXXXXzz..",
];
const B5_BROOD = {
  walk0: B5_BROOD_TOP.concat(["...XX.....XX.zz.", "..XX.......XX..z", ".XX.........XX..", ".X...........X..", "XX...........XX."]),
  walk1: B5_BROOD_TOP.concat(["....XX...XX.zz..", "....XX...XX...z.", "...XX.....XX....", "...X.......X....", "..XX.......XX..."]),
  jump: B5_BROOD_TOP.concat(["..XXXXXXXXXXzz..", ".XX.........XX..", "XX...........XX."]),
};
/* an endo: a chrome skeleton with red eyes (walker, facing left); Shades
   is one in a leather jacket and dark glasses */
const B5_ENDO_TOP = [
  "....SSSSS.....",
  "...SMMMMMS....",
  "...SMrMMrMS...",
  "...SMMMMMMS...",
  "...nSmmmmS....",
  "....SmSmS.....",
  ".....SSS......",
  "...ssSSSss....",
  "..sSSsSsSSs...",
  ".sS.SsSsS.Ss..",
  ".S..sSsSs..S..",
  ".S..SsSsS..S..",
  ".m...SSS...m..",
  ".....nnn......",
  "....SSSSS.....",
];
const B5_ENDO = {
  walk0: B5_ENDO_TOP.concat(["....S...S.....", "...SS...SS....", "...S.....S....", "..SS.....SS...", "..S.......S...", ".SSS.....SSS.."]),
  walk1: B5_ENDO_TOP.concat(["....S...S.....", "....S...S.....", "....SS.SS.....", ".....S.S......", ".....S.S......", "....SSSSS....."]),
  jump: B5_ENDO_TOP.concat(["...SSSSSSS....", "..SS.....SS...", ".SSS.....SSS.."]),
};
const B5_SHADES_PAL = { ...B5_PAL, r: "#0a0a0a", s: "#1a1410", S: "#3a2a20", n: "#2a2a2a" };
/* quicksilver: a liquid-metal blob in the shape of a soldier (shover) */
const B5_QUICK = {
  a: ["....MMM......", "...MSSSM.....", "...MSSSM.....", "..MMSSSMM....", ".MSSSSSSSM...", ".MSSShSSSMm..", "MSSSSSSSSSMm.", "MMMMMMMMMMMMM"],
  b: ["...MMM.......", "..MSSSM......", "..MSSSM......", ".MMSSSMMM....", ".MSSSSSSSMm..", "MSSSShSSSSMm.", "MSSSSSSSSSSMm", "MMMMMMMMMMMMM"],
};
/* a sentry gun on a tripod, its ammo counter glowing (shooter) */
const B5_SENTRY = {
  a: ["....gggg.....", "...gGGGGggggg", "...gGlGGg....", "....gggg.....", ".....gg......", "....g..g.....", "...g....g....", "..g......g...", ".g........g.."],
  b: ["....gggg.....", "...gGGGGgggggY", "...gGlGGg....", "....gggg.....", ".....gg......", "....g..g.....", "...g....g....", "..g......g...", ".g........g.."],
};
/* a hunter-killer drone: a black hover craft, a red searchlight
   (charger that flies) */
const B5_HK = {
  walk0: ["..xx......xx..", ".xXXx....xXXx.", "xXXXXXXXXXXXXx", ".xxXXXrrXXXxx.", "...xxxRRxxx...", "......rr......"],
  walk1: ["..xx......xx..", ".xXXx....xXXx.", "xXXXXXXXXXXXXx", ".xxXXXrrXXXxx.", "...xxxrrxxx...", ".....r..r....."],
  charge: ["..xx......xx..", ".xXXx....xXXx.", "xXXXXXXXXXXXXx", ".xxXXXRRXXXxx.", "...xxxRRxxx...", "....RRRRRR...."],
};
/* a hunting hound: a lean spiked alien beast (charger, facing right) */
const B5_HOUND = {
  walk0: ["..........ff..", ".f.f....fFFf..", "..fFFFFFFFFFeF", "..FFFFFFFFFFww", "..FfFFFFFfF...", "..f.f...f.f...", ".f..f..f..f...", ".b..b..b..b..."],
  walk1: ["..........ff..", ".f.f....fFFf..", "..fFFFFFFFFFeF", "..FFFFFFFFFFww", "..FfFFFFFfF...", "...ff...ff....", "...f.f.f.f....", "...b.b.b.b...."],
  charge: [".f.f.......ff.", "..fFFFFFFFFFeF", ".fFFFFFFFFFFwr", "..FfFFFFFfF...", ".f..f...f...f.", "f....f..f....f", "b.....b......b", ".............."],
};
/* the Hunter: tall, masked, net armour, dreadlocks; half cloaked, so
   most of it is a shimmer (lieutenant, facing left). Its three red dots
   are drawn by the sprite too */
const B5_HUNTER_PAL = { ...B5_PAL, H: "rgba(140, 180, 170, 0.45)", I: "rgba(200, 230, 220, 0.55)", m: "#9aa4ae", M: "#d8dee4", r: "#ff2020", j: "rgba(40, 50, 40, 0.6)" };
const B5_HUNTER_TOP = [
  "..j.jjjj......",
  ".j.jjMMMj.....",
  "..jjMmmmMj....",
  "..jMmrmmmM....",
  "..jMmmmmmM....",
  "...jMMmmM.....",
  "....HHHH......",
  "..HHIHHIHH....",
  ".HHHHIIHHHH...",
  ".HH.HHHHH.HH..",
  ".H..HIHIH..H..",
  ".I..HHHHH..mm.",
  "....HHHHH.....",
  "...HHHHHHH....",
];
const B5_HUNTER = {
  walk0: B5_HUNTER_TOP.concat(["...HH...HH....", "..HH.....HH...", "..H.......H...", ".HH.......HH..", ".H.........H..", "HHH.......HHH."]),
  walk1: B5_HUNTER_TOP.concat(["...HH...HH....", "...HH...HH....", "....HH.HH.....", ".....H.H......", ".....H.H......", "....HHHHH....."]),
  jump: B5_HUNTER_TOP.concat(["..HHHHHHHHH...", ".HH.......HH..", "HHH.......HHH."]),
};
/* an acid glob: a blob of the swarm's blood, bouncing or sliding */
const B5_GLOB = {
  walk0: ["..aaaa..", ".aAAaaa.", "aAAaaaaa", "aaaaaaaa", ".aaaaaa.", "..a..a.."],
  walk1: ["..aaaa..", ".aAaaaa.", "aAaaaaaa", "aaaaaaaa", ".aaaaaa.", ".a....a."],
  jump: ["..aaaa..", ".aAAaaa.", "aAAaaaaa", "aaaaaaaa", ".aaaaaa.", "..a..a.."],
};
/* a plasma turret: black steel, its emitter red (points up and right) */
const B5_TURRET = {
  a: ["..........rR", "........xXr.", "......xXXx..", "....xXXx....", "...xxxx.....", "..xXXXXx....", ".xXrXXXXx...", ".xxxxxxxx...", "xXxxxxxxXx..", "xxxxxxxxxx.."],
  b: ["..........RR", "........xXR.", "......xXXx..", "....xXXx....", "...xxxx.....", "..xXXXXx....", ".xXRXXXXx...", ".xxxxxxxx...", "xXxxxxxxXx..", "xxxxxxxxxx.."],
};

/* ------------------------------------------------------------------ */
/* Things to pick up                                                     */

const B5_ITEMS = {
  /* a ration bar */
  fish: ["gggggggg", "gYYYYYYg", "gyyyyyyg", "gggggggg"],
  /* a processor chip */
  milk: [".s.s.s.", "xxxxxxx", "xzzzzzx", "xzlzzzx", "xzzzzzx", "xxxxxxx", ".s.s.s."],
  /* a shoulder lamp */
  yarn: ["..gggg..", ".gGGGGg.", "gGYYYYGg", "gGYYYYGg", ".gGGGGg.", "..g..g.."],
  /* a motion tracker, its screen showing a blip */
  catnip: ["gggggggg", "gxxxxxxg", "gxllllxg", "gxlxxlxg", "gxxllxxg", "gggggggg", ".gGGGGg."],
  /* a hunter's mask */
  medal: ["..mMMMm..", ".mMMMMMm.", "mMrMMMrMm", "mMMMMMMMm", ".mMmmmMm.", "..m.m.m.."],
  /* a chrome skull, red-eyed */
  trophy: ["..SSSSS..", ".SMMMMMS.", "SMrMMMrMS", "SMMMMMMMS", ".SMnnnMS.", "..SnSnS..", "..SSSSS.."],
  /* a pulse cell */
  ammo: [".gg.", "gGGg", "glAg", "glAg", "glAg", "gGGg", "gGGg", ".gg."],
};
/* TERMINUS's termination cores (A02-A16's objectives): a pulsing red
   eye in a steel housing */
const B5_CORE = [
  ["..ssss..", ".sxxxxs.", "sxrRRrxs", "sxRRRRxs", "sxrRRrxs", ".sxxxxs.", "..ssss.."],
  ["..ssss..", ".sxxxxs.", "sxrrrrxs", "sxrRRrxs", "sxrrrrxs", ".sxxxxs.", "..ssss.."],
];

ART_BOOKS.push(() => {
  const each = (src, pal, f = g => g) => Object.fromEntries(Object.entries(src).map(([k, g]) => [k, both(sprite(f(g), { pal }))]));
  ART.creatureSets.terminus = {
    ...ART.creatureSets.wasteland,
    cat: each(B5_CAT, B5_PAL),
    skulker: each(B5_SKULKER, B5_PAL),
    clinger: each(B5_CLINGER, B5_PAL),
    burster: each(B5_BURSTER, B5_PAL),
    xdrone: each(B5_XDRONE, B5_PAL),
    brood: each(B5_BROOD, B5_PAL),
    endo: each(B5_ENDO, B5_PAL),
    shades: each(B5_ENDO, B5_SHADES_PAL),
    quick: each(B5_QUICK, B5_PAL),
    sentry: each(B5_SENTRY, B5_PAL),
    hk: each(B5_HK, B5_PAL),
    hound: each(B5_HOUND, B5_PAL),
    hunter: each(B5_HUNTER, B5_HUNTER_PAL),
    glob: each(B5_GLOB, B5_PAL),
    turret: each(B5_TURRET, B5_PAL),
  };
  const items = { ...ART.itemSets.wasteland.items };
  for (const [k, g] of Object.entries(B5_ITEMS)) items[k] = sprite(g, { pal: B5_PAL });
  const core = B5_CORE.map(g => sprite(g, { pal: B5_PAL }));
  ART.itemSets.terminus = { items, gems: ART.itemSets.wasteland.gems, objectives: [core, core] };
});

/* ------------------------------------------------------------------ */
/* The world map: TERMINUS's decks from above, plate floor, bulkheads with
 * running lights, laser gates for barriers, lift pads for teleporters   */

MAP_PAINTERS.terminus = classic => {
  const mk = (fn, w = T, h = T) => { const c = makeCanvas(w, h); fn(c.getContext("2d")); return c; };
  const px = b5px;
  const ground = [0, 1, 2, 3].map(v => mk(g => {
    px(g, B5_STEEL[2], 0, 0, T, T); px(g, B5_STEEL[3], 0, 0, T, 1); px(g, B5_STEEL[3], 0, 0, 1, T); px(g, B5_STEEL[1], 0, T - 1, T, 1); px(g, B5_STEEL[1], T - 1, 0, 1, T);
    if (v === 1) { for (let x = 6; x < 11; x += 2) px(g, B5_STEEL[1], x, 6, 1, 4); }
    if (v === 2) px(g, B5_RED[1], 7, 7, 1, 1);
  }));
  const cache = {};
  const rockAt = mask => cache[mask] || (cache[mask] = mk(g => {
    px(g, B5_STEEL[4], 0, 0, T, T);
    for (let y = 2; y < T; y += 4) px(g, B5_STEEL[3], 0, y, T, 1);
    if (mask & 1) { px(g, B5_STEEL[6], 0, 0, T, 1); px(g, B5_RED[3], 3, 1, 2, 1); px(g, B5_RED[3], 11, 1, 2, 1); }
    if (mask & 8) px(g, B5_STEEL[5], 0, 0, 1, T);
    if (mask & 2) px(g, B5_STEEL[1], T - 1, 0, 1, T);
    if (mask & 4) px(g, B5_STEEL[0], 0, T - 2, T, 2);
  }));
  const water = [0, 1].map(f => mk(g => { px(g, B5_ACID[0], 0, 0, T, T); for (let y = 2; y < T; y += 5) px(g, B5_ACID[2], (y + f * 3) % 10, y, 4, 1); }));
  /* a barrier: a laser gate, flickering */
  const field = [0, 1, 2].map(f => mk(g => {
    g.drawImage(ground[0], 0, 0);
    px(g, B5_STEEL[5], 0, 0, 2, T); px(g, B5_STEEL[5], T - 2, 0, 2, T);
    for (let y = 2; y < T; y += 3) px(g, f === 1 ? B5_RED[4] : B5_RED[3], 2, y + (f === 2 ? 1 : 0), T - 4, 1);
  }));
  const flag = mk(g => { px(g, B5_STEEL[6], 4, 2, 1, 13); px(g, "#566232", 5, 2, 8, 6); px(g, "#3a4422", 5, 7, 8, 1); px(g, "#dba363", 8, 4, 2, 2); });
  const tele = [0, 1].map(f => mk(g => {
    g.drawImage(ground[0], 0, 0);
    g.fillStyle = B5_STEEL[1]; g.beginPath(); g.arc(8, 9, 6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = f ? "#9ac8ff" : "#4a86e8"; g.beginPath(); g.arc(8, 9, 5, 0, Math.PI * 2); g.stroke();
    g.fillStyle = f ? "rgba(154, 200, 255, 0.5)" : "rgba(74, 134, 232, 0.35)"; g.beginPath(); g.arc(8, 9, 3, 0, Math.PI * 2); g.fill();
  }));
  const ship = mk(g => { g.drawImage(classic.shipBare, 0, 0); }, 32, 32);
  const marker = {
    /* the machine: a chrome skull on a plinth, eyes lit */
    skull: mk(g => {
      px(g, "rgba(0,0,0,0.35)", 4, 28, 24, 3);
      px(g, B5_STEEL[3], 7, 22, 18, 7); px(g, B5_STEEL[5], 7, 22, 18, 1);
      g.fillStyle = B5_STEEL[6]; g.beginPath(); g.arc(16, 12, 9, 0, Math.PI * 2); g.fill(); px(g, B5_STEEL[6], 11, 16, 10, 6);
      px(g, "#000", 11, 10, 4, 3); px(g, "#000", 17, 10, 4, 3); px(g, B5_RED[3], 12, 11, 2, 1); px(g, B5_RED[3], 18, 11, 2, 1);
      for (let x = 12; x < 21; x += 2) px(g, "#000", x, 19, 1, 3);
    }, 32, 32),
    /* the biodome: a glass dome over trees */
    dome: mk(g => {
      px(g, "rgba(0,0,0,0.35)", 3, 28, 26, 3);
      g.fillStyle = B5_JUNGLE[3]; for (const [x, y, rr] of [[10, 22, 6], [18, 19, 7], [24, 23, 5]]) { g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = "rgba(140, 200, 220, 0.25)"; g.beginPath(); g.arc(16, 28, 14, Math.PI, 0); g.fill();
      g.strokeStyle = B5_STEEL[6]; g.beginPath(); g.arc(16, 28, 14, Math.PI, 0); g.stroke();
      px(g, B5_STEEL[4], 2, 27, 28, 2);
    }, 32, 32),
    /* the hive: a mound of black resin, an egg at its mouth */
    nest: mk(g => {
      px(g, "rgba(0,0,0,0.35)", 2, 28, 28, 3);
      g.fillStyle = B5_RESIN[3]; g.beginPath(); g.moveTo(1, 30); g.quadraticCurveTo(6, 6, 16, 4); g.quadraticCurveTo(26, 6, 31, 30); g.closePath(); g.fill();
      for (let x = 6; x < 28; x += 4) px(g, B5_RESIN[5], x, 10 + Math.abs(16 - x) / 2, 1, 16);
      g.fillStyle = "#000"; g.beginPath(); g.ellipse(16, 26, 6, 5, 0, Math.PI, 0); g.fill();
      g.fillStyle = "#4a5a3a"; g.beginPath(); g.ellipse(16, 27, 3, 3, 0, 0, Math.PI * 2); g.fill();
      px(g, B5_ACID[3], 9, 22, 1, 2);
    }, 32, 32),
  };
  return { ...classic, ground, rockAt, rock: rockAt(0), water, field, flag, tele, ship, markerFor: marker, teleName: "Lift pad" };
};

/* ------------------------------------------------------------------ */
/* The title backdrop: TERMINUS in orbit, a dark ring with a red eye at
 * its hub, over the night side of a planet; the black Catamaran's glow
 * docked at one spoke; a gantry in front where Poom stands. Stars, the
 * eye's pulse, a tracker's sweep and Poom are drawn over it by game.js. */
function paintTerminusTitle(shipBare, W_ = 320, H_ = 200) {
  const c = makeCanvas(W_, H_), g = c.getContext("2d"), r = rng(55);
  const px = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  px("#04050a", 0, 0, W_, H_);
  /* the planet's night side, a thin dawn line at its rim */
  g.fillStyle = "#0a0e18"; g.beginPath(); g.ellipse(W_ / 2, H_ + 120, W_ * 0.9, 190, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "rgba(255, 120, 60, 0.6)"; g.lineWidth = 2; g.beginPath(); g.ellipse(W_ / 2, H_ + 120, W_ * 0.9, 190, 0, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  for (let i = 0; i < 30; i++) px("#e8c870", r() * W_ | 0, 165 + (r() * 30 | 0));
  /* the station: a ring, spokes, a hub with the eye */
  /* the station, in the top right corner, clear of the logo and the menu */
  const cx = 268, cy = 46, RX = 46, RY = 15;
  g.strokeStyle = "#232933"; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy, RX, RY, -0.12, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = "#323a46"; g.lineWidth = 1; g.beginPath(); g.ellipse(cx, cy - 1, RX, RY, -0.12, Math.PI, Math.PI * 2); g.stroke();
  for (let a = 0; a < 6; a++) { const an = a * Math.PI / 3; g.strokeStyle = "#1c2129"; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(an) * (RX - 2), cy + Math.sin(an) * (RY - 1)); g.stroke(); }
  g.fillStyle = "#1c2129"; g.beginPath(); g.arc(cx, cy, 10, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#3a0604"; g.beginPath(); g.arc(cx, cy, 5, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 30; i++) { const an = r() * Math.PI * 2; px(r() < .7 ? "#ffd36a" : "#ff2a1a", Math.round(cx + Math.cos(an) * RX), Math.round(cy + Math.sin(an) * RY)); }
  /* the black Catamaran, docked below the ring, glowing pink */
  g.save(); g.imageSmoothingEnabled = false; g.globalAlpha = 0.9; g.filter = "brightness(0.25)"; g.drawImage(shipBare, 0, 0, 32, 32, 290, 58, 16, 16); g.restore();
  g.fillStyle = "rgba(255, 106, 154, 0.4)"; g.beginPath(); g.arc(298, 70, 5, 0, Math.PI * 2); g.fill();
  /* something of the Swarm, lurking on the gantry behind Poom: a tall
     shadow with a long head and a tail */
  g.fillStyle = "#0c0f16";
  g.beginPath(); g.ellipse(22, 132, 13, 5, -0.35, 0, Math.PI * 2); g.fill();
  g.fillRect(16, 134, 9, 26); g.fillRect(12, 158, 5, 18); g.fillRect(24, 158, 5, 18);
  g.fillRect(8, 140, 4, 16); g.fillRect(25, 140, 4, 14);
  g.strokeStyle = "#0c0f16"; g.lineWidth = 2; g.beginPath(); g.moveTo(24, 160); g.quadraticCurveTo(46, 166, 40, 150); g.stroke();
  px("#2a3a4e", 11, 129, 10, 1); px("#2a3a4e", 17, 136, 1, 20);
  /* the gantry in front */
  px("#1a1e26", 0, 176, 150, 6); px("#323a46", 0, 176, 150, 1);
  for (let x = 4; x < 150; x += 12) { px("#14171c", x, 182, 2, 18); g.strokeStyle = "#14171c"; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 182); g.lineTo(x + 12, 200); g.stroke(); }
  px("#e0b21c", 0, 175, 150, 1);
  return c;
}
