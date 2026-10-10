/* Commander Poom -- Book 3's art: The Island of Dr Claw (map set D).
 *
 * Isla Garra by night, in the spirit of 1998's sneaking games
 * (docs/story/book-3-story.md): three tilesets (the Shore, the Base, the
 * Crater), Dr Claw's creatures, the items, Poom's sneaking suit, the world
 * map and the title backdrop. Registers with art.js (TILE_STYLES,
 * FAR_STYLES, MAP_PAINTERS, ART_BOOKS); loads after it. */
"use strict";

/* ---- ramps ---- */
const B3_SAND = ["#2a2418", "#4a3e28", "#6e5c3a", "#8e7a50", "#b09a6a", "#cdb98a"];
const B3_EARTH = ["#120e0a", "#1e1812", "#2c2219", "#3a2e22", "#4a3a2b", "#5e4a36"];
const B3_LEAF = ["#0a160e", "#10241a", "#1a3824", "#285030", "#3a6c3e", "#58904e"];
const B3_CONC = ["#141816", "#202623", "#2e3631", "#3e4842", "#525e56", "#6a786e", "#8a978c"];
const B3_BASALT = ["#0a0606", "#160d0c", "#241412", "#341c18", "#46261f", "#5a3428"];
const B3_LAVA = ["#4a0a04", "#8e1a0a", "#d03a10", "#ff6a1a", "#ffaa3a", "#ffe890"];
const B3_CHROME = ["#22262e", "#3c424e", "#646c7a", "#9aa2b0", "#cfd6e0", "#f0f4f8"];
const B3_RED = ["#4a0810", "#7a1020", "#b01828", "#e03040", "#ff7080"];
const B3_HAZ = ["#e0b21c", "#1a1608"];
const B3_CODEC = { dark: "#04170b", mid: "#1c5a2a", hi: "#5aff8a", glow: "rgba(90, 255, 138, 0.3)" };

const b3px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

/* ------------------------------------------------------------------ */
/* Tile themes                                                           */

Object.assign(THEMES, {
  /* outdoors at night: jungle earth, sand, barbed wire, sandbags */
  shore: { sky: 0, far: [1, 0], ground: [6, 0, 8], crust: ["#3a6c3e", "#58904e"], alt: [8, 6], plat: [6, 14], bg: [0, 1], liquid: ["#1a4a6a", "#5aa0c8", "#0c2a40"], liquidName: "the lagoon", style: "shore" },
  /* inside the base: grey-green concrete, steel, hazard stripes */
  base: { sky: 0, far: [8, 0], ground: [8, 7, 0], crust: ["#e0b21c", "#ffd16a"], alt: [8, 7], plat: [7, 8], bg: [0, 8], liquid: ["#2a6a8a", "#8ad8ff", "#0c2a3a"], liquidName: "coolant", style: "base" },
  /* inside the volcano: basalt, lava light, villain chrome */
  crater: { sky: 0, far: [4, 0], ground: [4, 0, 8], crust: ["#ff6a1a", "#ffaa3a"], alt: [4, 8], plat: [7, 8], bg: [0, 4], liquid: ["#ff6a1a", "#ffe890", "#8e1a0a"], liquidName: "lava", style: "crater" },
});

/* a steel blast door tile, in a frame of the biome's own colour; the top
 * tile carries a lamp in the door's colour, the rest ribs and a stripe */
function b3Door(mk, E, frame, a, b, top, steel = B3_CHROME) {
  return mk(g => {
    b3px(g, frame, 0, 0, T, T);
    b3px(g, steel[2], 1, 0, T - 2, T); b3px(g, steel[3], 1, 0, 1, T); b3px(g, steel[0], T - 2, 0, 1, T);
    for (let y = top ? 6 : 1; y < T; y += 5) { b3px(g, steel[1], 3, y, T - 6, 2); b3px(g, steel[3], 3, y, T - 6, 1); }
    if (top) {
      b3px(g, steel[0], 4, 1, 8, 4); b3px(g, E(b), 5, 2, 6, 2); b3px(g, E(a), 6, 2, 4, 1);
      g.fillStyle = "rgba(255, 255, 255, 0.35)"; g.fillRect(6, 2, 2, 1);
    } else { b3px(g, E(b), 3, 13, T - 6, 2); b3px(g, E(a), 3, 13, T - 6, 1); }
  });
}
/* a blast door exit, 16x32: shut, a slab with a stripe; open, dark, a lit
 * floor; a green lamp over it either way: the way out */
function b3Exit(frame, slab, slabHi, edge) {
  return [false, true].map(open => { const c = makeCanvas(T, T * 2), g = c.getContext("2d");
    b3px(g, frame, 0, 2, T, 30); b3px(g, edge, 0, 2, T, 2); b3px(g, edge, 0, 4, 2, 28); b3px(g, edge, T - 2, 4, 2, 28);
    if (open) { b3px(g, "#05080a", 2, 4, 12, 28); g.fillStyle = "rgba(90, 255, 138, 0.18)"; g.fillRect(2, 22, 12, 10); }
    else {
      b3px(g, slab, 2, 4, 12, 28); b3px(g, slabHi, 2, 4, 12, 1);
      for (let x = 2; x < 14; x += 4) { b3px(g, B3_HAZ[0], x, 16, 2, 3); b3px(g, B3_HAZ[1], x + 2, 16, 2, 3); }
      b3px(g, "#000", 7, 4, 1, 28);
    }
    g.fillStyle = "rgba(90, 255, 138, 0.4)"; g.fillRect(4, 0, 8, 3);
    b3px(g, "#1f7a33", 6, 0, 4, 2); b3px(g, "#c8ffd2", 7, 0, 2, 1);
    return c; });
}
/* a moving platform, 32x8: a body and a row of lamps, two frames; dropping
   ones amber, static ones dark */
function b3Platform(body, hi, lo, lamps) {
  return lamps.map(([l0, l1]) => [0, 1].map(f => {
    const c = makeCanvas(T * 2, 8), g = c.getContext("2d");
    b3px(g, body, 0, 0, 32, 6); b3px(g, hi, 0, 0, 32, 1); b3px(g, lo, 0, 5, 32, 1);
    b3px(g, "#000", 1, 6, 30, 2);
    for (let x = 3; x < 32; x += 8) b3px(g, (x >> 3) % 2 === f ? l1 : l0, x, 2, 3, 2);
    return c;
  }));
}

/* The Shore: packed jungle earth with roots and stones, a fringe of grass
 * and sand on top; a ledge is a plank boardwalk, the hazard a coil of
 * barbed wire on stakes, the doors steel gates, the exit a bunker door. */
TILE_STYLES.shore = (tiles, th, mk, E) => {
  const px = b3px;
  const earth = (g, r) => {
    px(g, B3_EARTH[2], 0, 0, T, T);
    for (let i = 0; i < 28; i++) px(g, B3_EARTH[r() < .5 ? 1 : 3], r() * T | 0, r() * T | 0, 1 + (r() * 2 | 0), 1);
    for (let k = 0; k < 2; k++) { const x = r() * 12 | 0, y = 3 + (r() * 10 | 0); px(g, B3_EARTH[4], x, y, 3, 2); px(g, B3_EARTH[5], x, y, 2, 1); px(g, B3_EARTH[0], x, y + 2, 3, 1); }
  };
  const block = (top, kind, seed) => mk(g => {
    const r = rng(seed);
    earth(g, r);
    if (kind === 1) { /* a root, wandering */
      let x = 0, y = 6 + (r() * 6 | 0);
      for (; x < T; x++) { px(g, B3_EARTH[0], x, y + 1); px(g, B3_EARTH[4], x, y); if (r() < .3) y += r() < .5 ? -1 : 1; }
    }
    if (kind === 2) { /* a buried shell casing, a glint */ px(g, "#a8803a", 6, 9, 4, 2); px(g, "#e0c070", 6, 9, 3, 1); }
    if (top) {
      px(g, B3_SAND[3], 0, 0, T, 4); px(g, B3_SAND[4], 0, 0, T, 1);
      for (let x = 0; x < T; x++) { if (r() < .6) px(g, B3_LEAF[r() < .5 ? 3 : 4], x, 0, 1, 1 + (r() * 3 | 0)); }
      if (r() < .5) { const x = 2 + (r() * 10 | 0); px(g, B3_LEAF[5], x, 0, 1, 1); px(g, B3_LEAF[4], x - 1, 1, 3, 1); }
      for (let x = 0; x < T; x += 2) if (r() < .5) px(g, B3_SAND[2], x, 4, 2, 1);
    }
  });
  tiles.ground = [block(false, 0, 3), block(false, 1, 41), block(false, 0, 17), block(false, 2, 53), block(false, 0, 29)];
  tiles.groundTop = [block(true, 0, 9), block(true, 0, 21), block(true, 1, 45), block(true, 0, 33)];

  /* a ledge: planks on a beam, the nail heads catching the moon */
  tiles.plat = mk(g => {
    px(g, "#5a4026", 0, 0, T, 4); px(g, "#7a5a36", 0, 0, T, 1);
    for (let x = 3; x < T; x += 5) px(g, "#2c1e10", x, 0, 1, 4);
    px(g, "#2c1e10", 0, 4, T, 2);
    px(g, "#c8c8b0", 1, 1); px(g, "#c8c8b0", 9, 1);
  });

  /* the hazard: barbed wire coiled over stakes */
  tiles.spikes = mk(g => {
    px(g, B3_EARTH[2], 0, 14, T, 2);
    for (const x of [2, 13]) { px(g, "#4a3a22", x, 6, 2, 9); px(g, "#6e5a36", x, 6, 1, 9); }
    g.strokeStyle = "#8a929a"; g.lineWidth = 1;
    for (let k = 0; k < 2; k++) { g.beginPath(); for (let a = 0; a <= Math.PI * 6; a += 0.3) { const x = a / (Math.PI * 6) * T, y = 10 + Math.sin(a) * 3.5 - k; if (a === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
    for (const [x, y] of [[3, 8], [7, 12], [10, 7], [14, 11], [5, 13]]) { px(g, "#d8dee4", x, y); px(g, "#d8dee4", x - 1, y - 1); px(g, "#d8dee4", x + 1, y - 1); }
  });

  const COLOURS = [[12, 4], [14, 6], [10, 2], [9, 1], [7, 8]];
  tiles.doors = COLOURS.map(([a, b]) => b3Door(mk, E, B3_EARTH[1], a, b, true));
  tiles.doorsBelow = COLOURS.map(([a, b]) => b3Door(mk, E, B3_EARTH[1], a, b, false));
  tiles.exit = b3Exit(B3_EARTH[1], "#4a5236", "#6a744c", "#2c3020");
  tiles.platform = b3Platform("#5a4026", "#7a5a36", "#2c1e10", [["#ffb02e", "#fff0b0"], ["#e0352e", "#ffc0b8"], ["#2c1e10", "#4a3a22"]]);
  tiles.sign = mk(g => { /* a wooden warning board: a skull and an ! */
    px(g, "#4a3a22", 7, 9, 2, 7); px(g, "#5a4026", 1, 1, 14, 8); px(g, "#7a5a36", 1, 1, 14, 1);
    px(g, "#e0352e", 3, 3, 2, 4); px(g, "#d8d0b8", 9, 3, 4, 3); px(g, "#1a1608", 10, 4); px(g, "#1a1608", 12, 4);
  });
  tiles.ice = tiles.ground[0];
};

/* The shore's sky: a navy night with a moon, the lagoon below, the black
 * cone of the volcano with a red glow at its lip, palm silhouettes and two
 * searchlight beams. */
FAR_STYLES.shore = () => {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(61);
  for (let y = 0; y < 200; y += 4) { const k = y / 200; b3px(g, `rgb(${Math.round(6 + 14 * k)},${Math.round(10 + 22 * k)},${Math.round(28 + 34 * k)})`, 0, y, 320, 4); }
  for (let i = 0; i < 80; i++) b3px(g, r() < .2 ? "#fff2c4" : "#9ab0d0", r() * 320 | 0, r() * 110 | 0);
  g.fillStyle = "rgba(240, 240, 210, 0.12)"; g.beginPath(); g.arc(60, 40, 22, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#e8e4c8"; g.beginPath(); g.arc(60, 40, 12, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#c8c4a8"; g.beginPath(); g.arc(56, 37, 3, 0, Math.PI * 2); g.arc(64, 44, 2, 0, Math.PI * 2); g.fill();
  /* searchlights */
  for (const [x, a] of [[120, -0.45], [250, 0.35]]) {
    g.fillStyle = "rgba(220, 230, 200, 0.07)"; g.beginPath(); g.moveTo(x, 150); g.lineTo(x + Math.sin(a) * 260 - 18, 150 - Math.cos(a) * 260); g.lineTo(x + Math.sin(a) * 260 + 18, 150 - Math.cos(a) * 260); g.closePath(); g.fill();
  }
  /* the volcano */
  g.fillStyle = "#121a22"; g.beginPath(); g.moveTo(130, 160); g.lineTo(196, 70); g.lineTo(224, 70); g.lineTo(300, 160); g.closePath(); g.fill();
  g.fillStyle = "rgba(255, 106, 26, 0.35)"; g.fillRect(198, 66, 24, 5);
  b3px(g, "#ff6a1a", 202, 69, 16, 1);
  /* the lagoon */
  for (let y = 150; y < 200; y++) b3px(g, `rgb(${10 + (y - 150) / 3 | 0},${22 + (y - 150) / 2 | 0},${40 + (y - 150) / 2 | 0})`, 0, y, 320, 1);
  for (let i = 0; i < 60; i++) b3px(g, "#3a5a7a", r() * 320 | 0, 152 + (r() * 46 | 0), 2 + (r() * 4 | 0), 1);
  b3px(g, "#d8d4b0", 52, 156, 16, 1); b3px(g, "#a8a488", 56, 160, 8, 1);
  /* palms */
  for (const x of [20, 96, 280]) {
    g.strokeStyle = "#080e0a"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 200); g.quadraticCurveTo(x + 6, 160, x + 2, 128); g.stroke();
    g.fillStyle = "#080e0a";
    for (const a of [-2.6, -2.0, -1.3, -0.6, 0.1]) { g.beginPath(); g.moveTo(x + 2, 128); g.quadraticCurveTo(x + 2 + Math.cos(a) * 14, 128 + Math.sin(a) * 14 - 6, x + 2 + Math.cos(a) * 26, 128 + Math.sin(a) * 10 + 8); g.lineTo(x + 2 + Math.cos(a) * 22, 128 + Math.sin(a) * 10 + 10); g.closePath(); g.fill(); }
  }
  return c;
};

/* The Base: grey-green concrete panels with seams and bolts, the top edge
 * a steel plate; a ledge a steel grating catwalk, the hazard an electrified
 * floor plate, sparking. */
TILE_STYLES.base = (tiles, th, mk, E) => {
  const px = b3px;
  const panel = (top, kind, seed) => mk(g => {
    const r = rng(seed);
    px(g, B3_CONC[3], 0, 0, T, T);
    for (let i = 0; i < 18; i++) px(g, B3_CONC[r() < .5 ? 2 : 4], r() * T | 0, r() * T | 0, 1, 1);
    px(g, B3_CONC[1], 0, T - 1, T, 1); px(g, B3_CONC[1], T - 1, 0, 1, T); px(g, B3_CONC[5], 0, 0, T, 1); px(g, B3_CONC[5], 0, 0, 1, T);
    for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) { px(g, B3_CONC[6], x, y); px(g, B3_CONC[1], x + 1, y + 1); }
    if (kind === 1) { px(g, B3_CONC[1], 4, 5, 8, 6); for (let y = 6; y < 11; y += 2) px(g, B3_CONC[0], 5, y, 6, 1); }
    if (kind === 2) { px(g, "#6a2a1a", 5, 4, 1, 8); px(g, "#4a1a10", 6, 6, 1, 5); }
    if (top) {
      px(g, B3_CHROME[2], 0, 0, T, 3); px(g, B3_CHROME[3], 0, 0, T, 1); px(g, B3_CHROME[0], 0, 3, T, 1);
      for (let x = 1; x < T; x += 5) px(g, B3_CHROME[4], x, 1);
    }
  });
  tiles.ground = [panel(false, 0, 5), panel(false, 0, 15), panel(false, 1, 25), panel(false, 0, 35), panel(false, 2, 45)];
  tiles.groundTop = [panel(true, 0, 7), panel(true, 0, 19), panel(true, 1, 31)];
  tiles.plat = mk(g => {
    px(g, B3_CHROME[2], 0, 0, T, 4); px(g, B3_CHROME[4], 0, 0, T, 1);
    for (let x = 1; x < T; x += 3) px(g, B3_CHROME[0], x, 1, 2, 3);
    px(g, B3_CHROME[1], 0, 4, T, 1);
  });
  tiles.spikes = mk(g => {
    px(g, B3_CONC[1], 0, 11, T, 5); px(g, B3_HAZ[0], 0, 11, T, 1);
    for (let x = 0; x < T; x += 4) { px(g, B3_HAZ[0], x, 12, 2, 1); px(g, B3_HAZ[1], x + 2, 12, 2, 1); }
    px(g, "#3a4a5a", 1, 13, T - 2, 3); px(g, "#6a8aa8", 1, 13, T - 2, 1);
    g.strokeStyle = "#bfe8ff"; g.lineWidth = 1; g.beginPath(); g.moveTo(2, 11); g.lineTo(4, 6); g.lineTo(3, 8); g.lineTo(6, 3); g.moveTo(10, 11); g.lineTo(12, 7); g.lineTo(11, 8); g.lineTo(13, 4); g.stroke();
    px(g, "#ffffff", 6, 3); px(g, "#ffffff", 13, 4);
    g.fillStyle = "rgba(160, 220, 255, 0.25)"; g.fillRect(0, 4, T, 8);
  });
  const COLOURS = [[12, 4], [14, 6], [10, 2], [9, 1], [7, 8]];
  tiles.doors = COLOURS.map(([a, b]) => b3Door(mk, E, B3_CONC[1], a, b, true));
  tiles.doorsBelow = COLOURS.map(([a, b]) => b3Door(mk, E, B3_CONC[1], a, b, false));
  tiles.exit = b3Exit(B3_CONC[1], B3_CONC[4], B3_CONC[6], B3_CHROME[1]);
  tiles.platform = b3Platform(B3_CHROME[2], B3_CHROME[4], B3_CHROME[0], [["#ffb02e", "#fff0b0"], ["#e0352e", "#ffc0b8"], [B3_CHROME[1], B3_CHROME[2]]]);
  tiles.sign = mk(g => { /* a wall terminal, its screen green */
    px(g, B3_CHROME[1], 2, 1, 12, 10); px(g, B3_CHROME[3], 2, 1, 12, 1); px(g, B3_CODEC.dark, 3, 2, 10, 7);
    for (const y of [3, 5, 7]) px(g, B3_CODEC.hi, 4, y, 4 + (y & 2), 1);
    px(g, B3_CHROME[2], 7, 11, 2, 5);
  });
  tiles.ice = tiles.ground[0];
};

/* The base's far wall: concrete bays in the dark, pipes along them, a red
 * alert lamp in each bay, a stencilled claw on the middle one. */
FAR_STYLES.base = () => {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(71);
  b3px(g, "#0e1210", 0, 0, 320, 200);
  for (let x = 0; x < 320; x += 80) {
    b3px(g, "#161c19", x + 4, 20, 72, 170); b3px(g, "#1e2622", x + 4, 20, 72, 2); b3px(g, "#0a0d0b", x + 4, 188, 72, 2);
    for (let y = 40; y < 180; y += 30) b3px(g, "#121815", x + 6, y, 68, 1);
    b3px(g, "#5a1010", x + 38, 28, 6, 4); b3px(g, "#e03040", x + 39, 29, 4, 2);
    g.fillStyle = "rgba(224, 48, 64, 0.10)"; g.beginPath(); g.arc(x + 41, 30, 14, 0, Math.PI * 2); g.fill();
  }
  for (const y of [12, 16, 194]) { b3px(g, "#2a322e", 0, y, 320, 3); b3px(g, "#3a4640", 0, y, 320, 1); }
  for (let x = 30; x < 320; x += 80) { b3px(g, "#2a322e", x, 0, 3, 200); b3px(g, "#3a4640", x, 0, 1, 200); }
  /* the claw, stencilled */
  g.fillStyle = "#222b26";
  for (const dx of [-10, 0, 10]) { g.beginPath(); g.moveTo(160 + dx - 3, 120); g.quadraticCurveTo(160 + dx, 80, 160 + dx + 8, 76); g.lineTo(160 + dx + 3, 120); g.closePath(); g.fill(); }
  g.beginPath(); g.ellipse(160, 126, 18, 10, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 30; i++) b3px(g, "#1a201d", r() * 320 | 0, r() * 200 | 0, 2, 1);
  return c;
};

/* The Crater: basalt split by glowing lava cracks, the top edge lit by
 * embers; a ledge a red-and-chrome catwalk, the hazard a vent of fire. */
TILE_STYLES.crater = (tiles, th, mk, E) => {
  const px = b3px;
  const rock = (top, kind, seed) => mk(g => {
    const r = rng(seed);
    px(g, B3_BASALT[2], 0, 0, T, T);
    for (let i = 0; i < 26; i++) px(g, B3_BASALT[1 + (r() * 4 | 0)], r() * T | 0, r() * T | 0, 1 + (r() * 2 | 0), 1);
    if (kind === 1 || kind === 2) {
      let x = 2 + (r() * 6 | 0), y = 4 + (r() * 8 | 0);
      for (let i = 0; i < 6; i++) { px(g, B3_LAVA[1], x, y + 1); px(g, B3_LAVA[kind === 2 ? 4 : 3], x, y); x++; if (r() < .4) y += r() < .5 ? -1 : 1; }
    }
    if (top) {
      px(g, B3_BASALT[4], 0, 0, T, 2); px(g, B3_BASALT[5], 0, 0, T, 1);
      for (let x = 0; x < T; x++) if (r() < .2) px(g, B3_LAVA[3], x, 0);
      g.fillStyle = "rgba(255, 106, 26, 0.12)"; g.fillRect(0, 0, T, 4);
    }
  });
  tiles.ground = [rock(false, 0, 2), rock(false, 1, 12), rock(false, 0, 22), rock(false, 0, 32), rock(false, 0, 52), rock(false, 2, 42), rock(false, 0, 62), rock(false, 0, 72)];
  tiles.groundTop = [rock(true, 0, 4), rock(true, 0, 14), rock(true, 0, 34), rock(true, 1, 24)];
  tiles.plat = mk(g => {
    px(g, B3_RED[2], 0, 0, T, 3); px(g, B3_RED[4], 0, 0, T, 1);
    px(g, B3_CHROME[3], 0, 3, T, 2); px(g, B3_CHROME[1], 0, 5, T, 1);
    for (let x = 2; x < T; x += 6) px(g, B3_CHROME[5], x, 3);
  });
  tiles.spikes = mk(g => {
    px(g, B3_BASALT[1], 0, 12, T, 4); px(g, B3_BASALT[3], 3, 11, 10, 2);
    for (const [x, h, c] of [[4, 9, 3], [7, 12, 4], [10, 8, 3]]) {
      g.fillStyle = B3_LAVA[c]; g.beginPath(); g.moveTo(x - 2, 12); g.quadraticCurveTo(x, 12 - h, x + 1, 12 - h - 1); g.quadraticCurveTo(x + 2, 12 - h / 2, x + 3, 12); g.closePath(); g.fill();
    }
    px(g, B3_LAVA[5], 7, 3); px(g, B3_LAVA[5], 7, 5, 1, 2);
    g.fillStyle = "rgba(255, 170, 58, 0.22)"; g.fillRect(0, 2, T, 10);
  });
  const COLOURS = [[12, 4], [14, 6], [10, 2], [9, 1], [7, 8]];
  tiles.doors = COLOURS.map(([a, b]) => b3Door(mk, E, B3_BASALT[1], a, b, true));
  tiles.doorsBelow = COLOURS.map(([a, b]) => b3Door(mk, E, B3_BASALT[1], a, b, false));
  tiles.exit = b3Exit(B3_BASALT[1], B3_RED[1], B3_RED[3], B3_CHROME[2]);
  tiles.platform = b3Platform(B3_CHROME[2], B3_CHROME[4], B3_RED[1], [[B3_RED[3], "#ffc0c8"], ["#ffb02e", "#fff0b0"], [B3_CHROME[1], B3_CHROME[2]]]);
  tiles.sign = mk(g => { /* a monitor on a chrome stand, Dr Claw's claw on it */
    px(g, B3_CHROME[2], 7, 10, 2, 6); px(g, B3_CHROME[1], 1, 1, 14, 10); px(g, B3_CHROME[3], 1, 1, 14, 1); px(g, B3_RED[0], 2, 2, 12, 8);
    for (const x of [5, 8, 11]) px(g, B3_RED[3], x, 3, 1, 4);
    px(g, B3_RED[3], 5, 7, 7, 2);
  });
  tiles.ice = tiles.ground[0];
};

/* Inside the volcano: rock walls rising into the dark, a lava lake's glow
 * below, a wall of monitors and Metal Claw, the walking machine, in the
 * middle distance. */
FAR_STYLES.crater = () => {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(81);
  for (let y = 0; y < 200; y += 4) { const k = y / 200; b3px(g, `rgb(${Math.round(8 + 60 * k * k)},${Math.round(4 + 14 * k * k)},${Math.round(6 + 6 * k)})`, 0, y, 320, 4); }
  for (const [col, seed, base] of [["#1a0c0a", 3, 0], ["#241210", 5, 0]]) {
    const rr = rng(seed); g.fillStyle = col;
    for (let i = 0; i < 8; i++) { const x = rr() * 320, w = 20 + rr() * 30, h = 40 + rr() * 70; g.beginPath(); g.moveTo(x - w / 2, base); g.lineTo(x, base + h); g.lineTo(x + w / 2, base); g.closePath(); g.fill(); }
  }
  /* the monitor wall */
  b3px(g, "#141418", 24, 70, 70, 46);
  for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) { b3px(g, "#22262e", 27 + x * 17, 73 + y * 14, 15, 12); b3px(g, r() < .5 ? "#3a0a10" : "#0a2a14", 28 + x * 17, 74 + y * 14, 13, 10); b3px(g, r() < .5 ? "#e03040" : "#5aff8a", 30 + x * 17, 77 + y * 14, 5, 1); }
  /* Metal Claw: two legs, a hull, a claw for a hand */
  g.fillStyle = "#2a2a30";
  g.fillRect(208, 130, 8, 40); g.fillRect(244, 130, 8, 40); g.fillRect(202, 166, 18, 6); g.fillRect(240, 166, 18, 6);
  g.beginPath(); g.moveTo(196, 132); g.lineTo(204, 96); g.lineTo(256, 92); g.lineTo(268, 128); g.closePath(); g.fill();
  g.fillRect(262, 104, 30, 6);
  for (const a of [-0.5, 0.5]) { g.beginPath(); g.moveTo(292, 107); g.lineTo(304 + Math.cos(a) * 6, 107 + Math.sin(a) * 14); g.lineTo(298, 107); g.closePath(); g.fill(); }
  b3px(g, "#e03040", 238, 102, 6, 2);
  g.fillStyle = "rgba(224, 48, 64, 0.25)"; g.beginPath(); g.arc(241, 103, 6, 0, Math.PI * 2); g.fill();
  /* the lava's glow, and embers rising */
  const glow = g.createLinearGradient(0, 150, 0, 200); glow.addColorStop(0, "rgba(255, 106, 26, 0)"); glow.addColorStop(1, "rgba(255, 106, 26, 0.45)");
  g.fillStyle = glow; g.fillRect(0, 150, 320, 50);
  for (let i = 0; i < 40; i++) b3px(g, r() < .6 ? "#ff6a1a" : "#ffe890", r() * 320 | 0, 100 + (r() * 100 | 0));
  return c;
};

/* ------------------------------------------------------------------ */
/* Poom's sneaking suit: a slate bodysuit, lighter armour on the chest, an
 * olive belt, black boots, and a bandana tied over his ears, its knot and
 * tails behind: red, like his old helmet, so it reads at this size.
 * Paws and tail still his.                                              */

const B3_SNEAK_PAL = { K: "#b0201a", L: "#6a1210", M: "#4a5664", N: "#2c343e", O: "#36404c", P: "#2a2e34", Q: "#121418", R: "#7a8898", S: "#6a6a3a" };
const B3_SNEAK_HEAD = [
  "..g.....g.....",
  ".gig...gig....",
  ".gggggggggg...",
  "gggggggggggg..",
  "KKKKKKKKKKKKK.",
  "KLLLLLLLLLLLL.",
  "KggggFFgFFgg..",
  "LggggF0gF0iii.",
  ".ggggggggiiiD.",
  "..ggggggiii0..",
];
const B3_SNEAK_HEAD_BACK = [
  "..g.....g.....",
  ".ggg...ggg....",
  ".gggggggggg...",
  "gggggggggggg..",
  "KKKKKKKKKKKK..",
  "LLLLLKKLLLLL..",
  ".ggggKKgggg...",
  ".gggKggKggg...",
  ".ggKggggKgg...",
  "..gggggggg....",
];
const B3_SNEAK_HEAD_OUT = [
  "..g.....g.....",
  ".gig...gig....",
  ".gggggggggg...",
  "gggggggggggg..",
  "KKKKKKKKKKKKK.",
  "KLLLLLLLLLLLL.",
  "KgggFgFgFgFg..",
  "LggggFgggFgii.",
  ".gggFgFgFgFiiD",
  "..ggggggi000..",
];
LOOKS.sneak = {
  pal: B3_SNEAK_PAL,
  head: rows => rows === P_HEAD ? B3_SNEAK_HEAD : rows === P_HEAD_BACK ? B3_SNEAK_HEAD_BACK : B3_SNEAK_HEAD_OUT,
  body: rows => rows.map((r, y) => {
    if (y === 0) return r.replace(/h/g, "N");
    const first = r.indexOf("9");
    if (y === 5) return recolour([r], { 9: "S" })[0];
    return [...r].map((c, x) => c === "9" ? (x === first ? "N" : (y === 2 || y === 3) && x > first + 1 && x < first + 6 ? "R" : "M") : c === "5" ? "O" : c === "F" ? "P" : c === "C" ? "Q" : c).join("");
  }),
  map: rows => {
    const b = rows.findIndex(r => r.includes("9"));
    return rows.map((r, y) => {
      if (y < 2 || y >= b) return y >= b ? recolour([r], { 9: "M", 5: "O", C: "Q" })[0] : r;
      if (r.includes("4")) return recolour([r], { C: "K", F: "K", 4: "K" })[0];
      return /[C]/.test(r) ? recolour([r], { C: "g", F: "g" })[0] : r;
    });
  },
};

/* ------------------------------------------------------------------ */
/* Dr Claw's creatures (docs/story/book-3-story.md). Each is drawn in the
 * direction its engine kind expects: pushers, walkers and lieutenants
 * face left, the rest right.                                            */

const B3_PAL = {
  k: "#141414", e: "#000000", f: "#8a5a2e", F: "#b07a44", w: "#f2ead8", n: "#1a1010",
  c: "#4a5a2a", C: "#6a7a3a", O: "#55663a", o: "#3a4626", b: "#2a2a1a",
  r: "#d02a20", R: "#ff6a50", s: "#9aa4ae", S: "#d8dee4", g: "#4e565e", G: "#2c3238",
  h: "#56603a", H: "#7a8650", v: "#3e4636", V: "#5a6450",
  d: "#a87a44", D: "#c89a5c", q: "#7a5428", t: "#d8c8a0",
  K: "#1c1a1a", T: "#b8743a", E: "#e8d870",
  y: "#a8986a", Y: "#c8b88a", u: "#6e6244",
  a: "#d8a050", A: "#f0c878", x: "#7a5a3a", X: "#9a7a52",
  W: "#f4f2f8", m: "#e0b21c", M: "#a0d8ff", j: "#5a2a6a", J: "#7a3a8a", p: "#f0a0b0", L: "#5aff8a",
};
const b3mirror = rows => { const w = Math.max(...rows.map(r => r.length)); return rows.map(r => [...r.padEnd(w, ".")].reverse().join("")); };

/* a Claw guard: a stoat in olive fatigues and a cap */
const B3_GUARD_TOP = [
  "....cccc....",
  "...cCCCcc...",
  "...ccccccCC.",
  "..ffFFFFff..",
  "..fFFFFeFFw.",
  "..ffFFwwwwn.",
  "...ffwwww...",
  "....OwwO....",
  "...OOOOOO...",
  "..OOOoOOOO..",
  "..OOOOOOOff.",
  "..OOOOOOO...",
  "..bbbbbbb...",
];
const B3_GUARD = {
  walk0: B3_GUARD_TOP.concat([
    "kfoooooooo..",
    ".ffooooooo..",
    "..ooo..ooo..",
    ".ooo....ooo.",
    ".oo......oo.",
    "kkkk....kkkk",
  ]),
  walk1: B3_GUARD_TOP.concat([
    "kfoooooooo..",
    ".ffoooooo...",
    "....oooo....",
    "....oooo....",
    "....oooo....",
    "...kkkkkk...",
  ]),
  charge: [
    ".....cccc...",
    "....cCCCcc..",
    "....ccccccCC",
    "...ffFFFFff.",
    "...fFFFFeFFw",
    "...ffFFwwrrn",
    "....ffwwww..",
    "....OwwO....",
    "...OOOOOOff.",
    "..OOOoOOOOff",
    "..OOOOOOO...",
    "..OOOOOOO...",
    "..bbbbbbb...",
    "kfoooooooo..",
    ".ffooo.ooo..",
    "..ooo...ooo.",
    ".ooo.....oo.",
    ".oo......ooo",
    "kkk.......kk",
  ],
};
/* a ninja: the same frame in a stealth suit, its eye a red glow */
const B3_NINJA_PAL = { ...B3_PAL, c: "#22262c", C: "#4a5260", f: "#2a2e34", F: "#3c424a", w: "#3c424a", n: "#2a2e34", e: "#ff2a2a", O: "#2a2e34", o: "#1c2026", b: "#7a8494", k: "#0e1014", r: "#ff2a2a" };

/* a heavy: a bigger stoat in body armour and a helmet (facing left) */
const B3_HEAVY_TOP = [
  ".....hhhh.....",
  "...hhHHHHhh...",
  "..hhHHHHHHhh..",
  "..hhhhhhhhhhh.",
  "...ffFFFFfff..",
  "...fFFFFFeFw..",
  "...ffFFFwwwwn.",
  "....fFwwwww...",
  ".....wwwww....",
  "...vvvvvvvv...",
  "..vVVvvvvVVv..",
  ".vvVVvvvvVVvv.",
  ".fvvvvvvvvvvf.",
  ".fvvvvvvvvvvf.",
  ".fvvvsssvvvvf.",
  "..vvvvvvvvvv..",
  "..bbbbbbbbbb..",
  "kfoooooooooo..",
  ".ffoooooooo...",
];
const B3_HEAVY = {
  walk0: B3_HEAVY_TOP.concat([
    "...oooo.oooo..",
    "...oooo.oooo..",
    "..oooo...oooo.",
    "..vvv.....vvv.",
    "..ooo.....ooo.",
    ".ooo.......ooo",
    ".kkkkk...kkkkk",
    ".kkkkk...kkkkk",
  ]),
  walk1: B3_HEAVY_TOP.concat([
    "...oooo.oooo..",
    "...oooo.oooo..",
    "....oooooo....",
    "....vvvvvv....",
    "....ooo.ooo...",
    "....ooo.ooo...",
    "...kkkkkkkkk..",
    "...kkkkkkkkk..",
  ]),
  jump: B3_HEAVY_TOP.concat([
    "...ooooooooo..",
    "..oooo..oooo..",
    "..vvv....vvv..",
    ".kkkkk..kkkkk.",
    ".kkkkk..kkkkk.",
  ]),
};

/* a Boxer: a guard under a cardboard box (pusher: a box has no front) */
const B3_BOX = [
  "DDDDDDDDDDDD",
  "qddddddddDdq",
  "qddttttttddq",
  "qddddddddDdq",
  "qdqqqddqqqdq",
  "qddddddddddq",
  "qddddddddddq",
  "qqqqqqqqqqqq",
];
const B3_BOXER = {
  walk0: B3_BOX.concat(["..kk....kk.."]),
  walk1: B3_BOX.concat(["...kk..kk..."]),
  look: B3_BOX.slice(0, 6).concat(["qqqqqqqqqqqq", "..FeFFFeF...", "..ffffffff..", "..kk....kk.."]),
  stunned: ["DDDDDDDDDDDD", "qddttttttddq", "qqqqqqqqqqqq", "kk........kk"],
};

/* a guard dog: a Doberman, black and tan (facing right) */
const B3_DOG_BODY = [
  "..........kk..",
  ".........kKK..",
  "........KKKKK.",
  "........KKEKKT",
  "KK......KKTTTn",
  ".KKKKKKKKKrTT.",
  "..KKKKKKKKKT..",
  "..KKKKKKKKK...",
];
const B3_DOG = {
  walk0: B3_DOG_BODY.concat(["..TKK...TKK...", "..KK.....KK...", ".KK.......KK..", ".TT.......TT.."]),
  walk1: B3_DOG_BODY.concat(["...KK...KK....", "...KK...KK....", "...KK...KK....", "...TT...TT...."]),
  charge: [
    "..............",
    ".........kk...",
    "........KKKKK.",
    "........KKEKKT",
    "KK......KKTTrr",
    ".KKKKKKKKKrTTw",
    "..KKKKKKKKK...",
    ".KKKKKKKKKK...",
    "TKK.......KKT.",
    "KK.........KK.",
    "T...........T.",
  ],
};

/* a Clawbot: Dr Claw's robot crab, its big claw forward (facing right) */
const B3_CLAWBOT = {
  a: [
    "...L...L.....",
    "...s...s..SS.",
    "..rrrrrrr.S.S",
    ".rRRRRRRrrSS.",
    ".rrrrrrrrr...",
    "..sssssss....",
    ".s.s.s.s.s...",
    "s.s.s.s.s....",
  ],
  b: [
    "...L...L.....",
    "...s...s.SSS.",
    "..rrrrrrr...S",
    ".rRRRRRRrrSSS",
    ".rrrrrrrrr...",
    "..sssssss....",
    "s.s.s.s.s....",
    ".s.s.s.s.s...",
  ],
};

/* a gunner: a guard behind sandbags with a machine gun (facing right) */
const B3_GUNNER_BAGS = [
  "..YyyYyyyYy..",
  ".YyuyyYyuyyY.",
  ".yyyyuyyyyuy.",
  "YyuyyYyyuyyyY",
  "uuuuuuuuuuuuu",
];
const B3_GUNNER = {
  a: ["....cccc.....", "...cCCCcc....", "....fFeFw....", "...ggggggggg."].concat(B3_GUNNER_BAGS),
  b: ["....cccc.....", "...cCCCcc....", "....fFeFw....", "...gggggggggR"].concat(B3_GUNNER_BAGS),
};

/* an Ocelot: Dr Claw's elite, in a red beret and a long coat, a pistol out
   (facing left) */
const B3_OCELOT_TOP = [
  "....rrrr......",
  "...rrRRrrr....",
  "..arrrrrrr....",
  "..aAaAaaaa....",
  "..akaAAAeAw...",
  "..aAkaAAwwwn..",
  "...aaAAwww....",
  "....rrrrr.....",
  "...xxXXXxx....",
  "..xxXXXXXxx...",
  "..xxXXXXXxxAs.",
  "..xxXXXXXxx.ss",
  "..xxXXXXXxx...",
  "..xxbbbbbxx...",
  "..xxXXXXXxx...",
  "ka.xxXXXXxx...",
  "aka.xXXXXx....",
];
const B3_OCELOT = {
  walk0: B3_OCELOT_TOP.concat([".akxxx.xxx....", "..xxx...xxx...", "..ooo...ooo...", ".ooo.....ooo..", ".ooo.....ooo..", "kkkk.....kkkk."]),
  walk1: B3_OCELOT_TOP.concat([".akxxx.xxx....", "...xxx.xxx....", "...ooo.ooo....", "...ooo.ooo....", "...ooo.ooo....", "..kkkk.kkkk..."]),
  jump: B3_OCELOT_TOP.concat([".akxxxxxxx....", "..xxx...xxx...", "..ooo...ooo...", ".kkkk...kkkk.."]),
};

/* Dr Claw: a white Persian, flat-faced and enormously fluffy, a monocle,
 * a purple smoking jacket, a laser pistol (facing right) */
const B3_DRCLAW_TOP = [
  "..W......W....",
  ".WpW....WpW...",
  ".WWWWWWWWWWW..",
  "WWwwwwwwwwwWW.",
  "WwwmmmwwwwwwW.",
  "WwwmMmwwewwwW.",
  "WwwmmmwwwnwwW.",
  "WWwwwwwkkkwWW.",
  ".WWwwwwwwwWW..",
  "..WWWWWWWWW...",
  "...jjjjjjj....",
  "..jjJJWJJjj...",
];
const B3_DRCLAW = {
  a: B3_DRCLAW_TOP.concat([".jjjJJWJJjjWs.", ".jjjJJJJJjj.ss", ".jjjJJJJJjj...", "..jjJJJJJjj...", "..jjjjjjjjj...", "..jjj...jjj...", "..jjj...jjj...", ".kkkk...kkkk.."]),
  b: B3_DRCLAW_TOP.concat([".jjjJJWJJjjWs.", ".jjjJJJJJjj.sR", ".jjjJJJJJjj...", "..jjJJJJJjj...", "..jjjjjjjjj...", "..jjj...jjj...", "..jjj...jjj...", ".kkkk...kkkk.."]),
};

/* Mr Squeaks: Dr Claw's white mouse (a pusher: facing left) */
const B3_MOUSE = {
  walk0: ["......pp....", ".....WWpW...", "....WWWWWWe.", "...WWWWWWWWn", "pWWWWWWWWW..", ".WWWWWWWWW..", "..p..p..p..."],
  walk1: ["......pp....", ".....WWpW...", "....WWWWWWe.", "...WWWWWWWWn", "pWWWWWWWWW..", ".WWWWWWWWW..", "...p..p..p.."],
  look: [".......pp...", "......WWpW..", ".....WWWWWe.", ".....WWWWWWn", "....WWWWWW..", "p..WWWWWWW..", ".pWWWWWWWW..", "..p..p..p..."],
  stunned: ["....WWWWWWe.", "pWWWWWWWWWWn", "pp.p..p..p.."],
};

/* a gun camera: a security camera, a gun under it (points up and right,
   like every turret's art) */
const B3_CAMERA = {
  a: [
    "........ssMs",
    "......sgggs.",
    "....sggGgs..",
    "..sgggGgs...",
    "...gggg.....",
    "..rGGGG.....",
    "..GGGGs.....",
    "...GG.......",
    "..GGGG......",
    ".GGGGGG.....",
  ],
  b: [
    "........ssMs",
    "......sgggs.",
    "....sggGgs..",
    "..sgggGgs...",
    "...gggg.....",
    "..RGGGG.....",
    "..GGGGs.....",
    "...GG.......",
    "..GGGG......",
    ".GGGGGG.....",
  ],
};

/* the ! over a guard who has seen Poom */
const B3_ALERT = [".rr.", "rRRr", "rRRr", "rRRr", ".RR.", ".rr.", "....", ".rr.", "rRRr", ".rr."];

/* ------------------------------------------------------------------ */
/* Things to pick up                                                     */

const B3_ITEM_PAL = { ...B3_PAL, c: "#5ab8e8", C: "#a8e8ff", M: "#e8faff", y: "#c8961c", Y: "#ffe070", z: "#fff8c8", O: "#55663a", o: "#3a4626" };
const B3_ITEMS = {
  /* dog tags on a chain */
  fish: [".g...g..", "g.ssss.g", ".sSSSSs.", ".sSkkSs.", ".sSSSSs.", "..ssss.."],
  /* a ration pack: an olive pouch, a red label */
  milk: [".ooooooo.", "oOOOOOOOo", "oOwwwwwOo", "oOwrrrwOo", "oOwwwwwOo", "oOOOOOOOo", ".ooooooo."],
  /* a floppy disk */
  yarn: ["kkkkkkkk", "kgsssSgk", "kgsssSgk", "kggggggk", "kgwwwwgk", "kgwrrwgk", "kgwwwwgk", "kkkkkkkk"],
  /* a cassette tape */
  catnip: ["kkkkkkkkkk", "kwwwwwwwwk", "kwkkwwkkwk", "kwkskkskwk", "kwwwwwwwwk", "kggggggggk", ".kkkkkkkk."],
  /* a gold bar, stamped */
  medal: ["...yyyyyy..", "..yYYzYYYy.", ".yYYYYYYYyy", "yyyyyyyyyyy", "yYyyyyyyyYy", "yyyyyyyyyyy"],
  /* Dr Claw's diamond */
  trophy: ["..cCCCc...", ".cCMMMCc..", "cCMMMMMCcc", ".cMMMMMcc.", "..cMMMc...", "...cMc....", "....c....."],
  /* a battery pack */
  ammo: [".kk.", "gssg", "gGGg", "gyYg", "gyYg", "gGGg", "gssg", "gggg"],
};
/* D17's power cores (two frames, pulsing) and the Copycat's heart */
const B3_CORE = [
  ["..ssss..", ".sGGGGs.", "sGLLLLGs", "sGLMMLGs", "sGLMMLGs", "sGLLLLGs", ".sGGGGs.", "..ssss.."],
  ["..ssss..", ".sGGGGs.", "sGLLLLGs", "sGLLLLGs", "sGLLLLGs", "sGLLLLGs", ".sGGGGs.", "..ssss.."],
];
const B3_HEART = [
  ["...rrrr...", "..rRRRRr..", ".rRwRRRRr.", "rRRRRRRRRr", "rRRRRRRRRr", ".rRRRRRRr.", "..rRRRRr..", "...rrrr..."],
  ["...rrrr...", "..rrRRrr..", ".rrRRRRrr.", "rrRRwRRRrr", "rrRRRRRRrr", ".rrRRRRrr.", "..rrRRrr..", "...rrrr..."],
];

/* built once, at the end of buildArt */
ART_BOOKS.push(() => {
  const each = (src, pal, f = g => g) => Object.fromEntries(Object.entries(src).map(([k, g]) => [k, both(sprite(f(g), { pal }))]));
  const set = {
    ...ART.creatureSets.wasteland,
    guard: each(B3_GUARD, B3_PAL),
    ninja: each(B3_GUARD, B3_NINJA_PAL),
    heavy: each(B3_HEAVY, B3_PAL, b3mirror),
    boxer: each(B3_BOXER, B3_PAL),
    dog: each(B3_DOG, B3_PAL),
    clawbot: each(B3_CLAWBOT, B3_PAL),
    gunner: each(B3_GUNNER, B3_PAL),
    ocelot: each(B3_OCELOT, B3_PAL, b3mirror),
    drclaw: each(B3_DRCLAW, B3_PAL),
    whitemouse: each(B3_MOUSE, B3_PAL, b3mirror),
    turret: each(B3_CAMERA, B3_PAL),
  };
  ART.creatureSets.claw = set;
  ART.alert = sprite(B3_ALERT, { pal: B3_PAL });
  const items = { ...ART.itemSets.wasteland.items };
  for (const [k, g] of Object.entries(B3_ITEMS)) items[k] = sprite(g, { pal: B3_ITEM_PAL });
  ART.itemSets.claw = { items, gems: ART.itemSets.wasteland.gems,
    objectives: [B3_CORE.map(g => sprite(g, { pal: B3_PAL })), B3_HEART.map(g => sprite(g, { pal: B3_PAL }))] };
});

/* ------------------------------------------------------------------ */
/* The world map: Isla Garra's islets in the night lagoon                */

MAP_PAINTERS.claw = classic => {
  const mk = (fn, w = T, h = T) => { const c = makeCanvas(w, h); fn(c.getContext("2d")); return c; };
  const px = b3px;
  const ground = [0, 1, 2, 3].map(v => mk(g => {
    const r = rng(311 + v * 7);
    px(g, B3_SAND[2], 0, 0, T, T);
    for (let i = 0; i < 20; i++) px(g, B3_SAND[1 + (r() * 3 | 0)], r() * T | 0, r() * T | 0, 1 + (r() * 2 | 0), 1);
    if (v === 1) { px(g, B3_LEAF[3], 3, 4, 5, 3); px(g, B3_LEAF[4], 4, 4, 3, 1); }
    if (v === 3) { px(g, B3_LEAF[2], 9, 9, 4, 3); px(g, B3_LEAF[4], 10, 9, 2, 1); }
  }));
  /* the lagoon: dark water, a fleck of moonlight, foam where it meets land */
  const cache = {};
  const rockAt = mask => cache[mask] || (cache[mask] = mk(g => {
    const r = rng(23 + mask);
    px(g, "#0e2234", 0, 0, T, T);
    for (let i = 0; i < 6; i++) px(g, "#1a3a54", r() * T | 0, r() * T | 0, 2 + (r() * 3 | 0), 1);
    if (r() < .3) px(g, "#6a8aa0", r() * 12 | 0, r() * T | 0, 2, 1);
    const foam = "#9ac0d0", sand = B3_SAND[3];
    if (mask & 1) { px(g, sand, 0, 0, T, 1); px(g, foam, 0, 1, T, 1); }
    if (mask & 4) { px(g, foam, 0, T - 2, T, 1); px(g, sand, 0, T - 1, T, 1); }
    if (mask & 8) { px(g, sand, 0, 0, 1, T); px(g, foam, 1, 0, 1, T); }
    if (mask & 2) { px(g, foam, T - 2, 0, 1, T); px(g, sand, T - 1, 0, 1, T); }
  }));
  const water = [0, 1].map(f => mk(g => { px(g, "#0e2234", 0, 0, T, T); for (let y = 2; y < T; y += 5) px(g, "#2a5a7a", (y + f * 3) % 10, y, 4, 1); }));
  const field = [0, 1, 2].map(() => ground[0]);
  /* a done place: Poom's paw-print flag */
  const flag = mk(g => {
    px(g, "#c8c8b0", 4, 2, 1, 13); px(g, "#3a3e4a", 5, 2, 8, 6); px(g, "#16181e", 5, 7, 8, 1);
    px(g, "#dba363", 8, 4, 2, 2); px(g, "#dba363", 7, 3); px(g, "#dba363", 10, 3);
  });
  /* a transit tube hatch: a round lid in a steel ring, its light blinking */
  const tele = [0, 1].map(f => mk(g => {
    g.drawImage(ground[0], 0, 0);
    g.fillStyle = B3_CHROME[1]; g.beginPath(); g.arc(8, 9, 6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = B3_CHROME[3]; g.beginPath(); g.arc(8, 9, 5.5, 0, Math.PI * 2); g.stroke();
    px(g, B3_CHROME[0], 4, 8, 9, 2);
    px(g, f ? B3_CODEC.hi : "#1c5a2a", 7, 2, 3, 2);
  }));
  /* Bruce, the robot shark: a grey fin and back over the water, a red eye */
  const shark = mk(g => {
    g.fillStyle = "#4a5260"; g.beginPath(); g.moveTo(2, 12); g.quadraticCurveTo(16, 6, 30, 11); g.lineTo(30, 14); g.lineTo(2, 14); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(12, 9); g.lineTo(17, 0); g.lineTo(20, 8); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(2, 12); g.lineTo(0, 7); g.lineTo(4, 12); g.closePath(); g.fill();
    px(g, "#8a929e", 6, 10, 20, 1); px(g, "#e03040", 26, 11, 2, 1);
    px(g, "#9ac0d0", 0, 14, 32, 1); px(g, "#6a8aa0", 4, 15, 24, 1);
  }, 32, 16);
  const ferry = { r: shark, l: flipped(shark) };
  const ship = mk(g => { g.drawImage(classic.shipBare, 0, 0); }, 32, 32);
  /* level markers, by biome: a watchtower, a bunker, a crater vent */
  const marker = {
    tower: mk(g => {
      px(g, "rgba(0,0,0,0.35)", 4, 28, 24, 3);
      for (const x of [9, 22]) { px(g, "#4a3a22", x, 10, 2, 20); }
      g.strokeStyle = "#4a3a22"; g.beginPath(); g.moveTo(10, 28); g.lineTo(22, 14); g.moveTo(22, 28); g.lineTo(10, 14); g.stroke();
      px(g, "#5a4026", 6, 4, 20, 7); px(g, "#7a5a36", 6, 4, 20, 1); px(g, "#1a1206", 9, 6, 14, 3);
      g.fillStyle = "#3a2a16"; g.beginPath(); g.moveTo(4, 4); g.lineTo(16, 0); g.lineTo(28, 4); g.closePath(); g.fill();
      px(g, "#fff0b0", 14, 7, 4, 1);
    }, 32, 32),
    bunker: mk(g => {
      px(g, "rgba(0,0,0,0.35)", 2, 27, 28, 4);
      g.fillStyle = B3_CONC[4]; g.beginPath(); g.moveTo(2, 28); g.lineTo(6, 12); g.lineTo(26, 12); g.lineTo(30, 28); g.closePath(); g.fill();
      px(g, B3_CONC[5], 6, 12, 20, 1); px(g, B3_CONC[1], 10, 16, 12, 2);
      px(g, B3_CONC[2], 11, 20, 10, 8); for (let x = 11; x < 21; x += 4) { px(g, B3_HAZ[0], x, 20, 2, 1); px(g, B3_HAZ[1], x + 2, 20, 2, 1); }
      px(g, B3_CHROME[2], 24, 2, 1, 10); px(g, "#e03040", 23, 1, 3, 2);
    }, 32, 32),
    vent: mk(g => {
      px(g, "rgba(0,0,0,0.35)", 2, 27, 28, 4);
      g.fillStyle = B3_BASALT[3]; g.beginPath(); g.moveTo(1, 29); g.lineTo(10, 10); g.lineTo(22, 10); g.lineTo(31, 29); g.closePath(); g.fill();
      g.fillStyle = B3_BASALT[5]; g.beginPath(); g.moveTo(10, 10); g.lineTo(22, 10); g.lineTo(20, 13); g.lineTo(12, 13); g.closePath(); g.fill();
      px(g, B3_LAVA[3], 12, 9, 8, 2); px(g, B3_LAVA[5], 14, 9, 4, 1);
      g.fillStyle = "rgba(255, 106, 26, 0.3)"; g.fillRect(9, 2, 14, 8);
      px(g, B3_LAVA[2], 13, 15, 2, 8); px(g, B3_LAVA[3], 13, 15, 1, 5);
    }, 32, 32),
  };
  return { ...classic, ground, rockAt, rock: rockAt(0), water, field, flag, tele, ship, ferry, markerFor: marker, teleName: "Transit tube", ferryName: "Bruce, the robot shark" };
};

/* ------------------------------------------------------------------ */
/* The title backdrop: Isla Garra at night from the sea. A moon, the
 * volcano with Dr Claw's lair cut into it and its red-lit windows, the
 * magnet crane on the cone, the lagoon, a jetty with the Catamaran
 * tied up. Searchlights and Poom are drawn over it by game.js.          */
function paintClawTitle(shipBare, W_ = 320, H_ = 200) {
  const c = makeCanvas(W_, H_), g = c.getContext("2d"), r = rng(91);
  const px = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  for (let y = 0; y < H_; y += 4) { const k = Math.min(1, y / 160); px(`rgb(${Math.round(4 + 16 * k)},${Math.round(8 + 22 * k)},${Math.round(22 + 40 * k)})`, 0, y, W_, 4); }
  /* the moon, top right, clear of the logo and the menu */
  g.fillStyle = "rgba(240, 240, 210, 0.10)"; g.beginPath(); g.arc(266, 42, 26, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#ece8cc"; g.beginPath(); g.arc(266, 42, 14, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#cfcab0"; g.beginPath(); g.arc(261, 38, 4, 0, Math.PI * 2); g.arc(271, 47, 3, 0, Math.PI * 2); g.fill();
  /* the volcano, on the left (the menu has the right) */
  g.fillStyle = "#0e151c"; g.beginPath(); g.moveTo(-30, 168); g.lineTo(34, 74); g.lineTo(74, 70); g.lineTo(150, 168); g.closePath(); g.fill();
  g.fillStyle = "#16202a"; g.beginPath(); g.moveTo(34, 74); g.lineTo(74, 70); g.lineTo(90, 100); g.lineTo(44, 98); g.closePath(); g.fill();
  g.fillStyle = "rgba(255, 106, 26, 0.4)"; g.fillRect(36, 66, 36, 6);
  px("#ff6a1a", 40, 70, 28, 1);
  /* the lair: a slanted glass face, red-lit, cut into the cone */
  g.fillStyle = "#1c242e"; g.beginPath(); g.moveTo(22, 124); g.lineTo(36, 104); g.lineTo(92, 104); g.lineTo(106, 124); g.closePath(); g.fill();
  for (let x = 32; x < 100; x += 7) px(r() < .7 ? "#e03040" : "#ffb02e", x, 110, 4, 8);
  px("#2a3440", 22, 124, 84, 2);
  /* the magnet crane, on the rim, its arm out over the lagoon */
  px("#2a2e34", 74, 40, 3, 30); px("#2a2e34", 74, 40, 44, 3); px("#2a2e34", 114, 43, 1, 20);
  g.fillStyle = "#3a3e48"; g.beginPath(); g.moveTo(106, 63); g.lineTo(122, 63); g.lineTo(118, 70); g.lineTo(110, 70); g.closePath(); g.fill();
  px("#e03040", 75, 38, 2, 2);
  /* the lagoon */
  for (let y = 160; y < H_; y++) px(`rgb(${8 + (y - 160) / 4 | 0},${18 + (y - 160) / 3 | 0},${34 + (y - 160) / 2 | 0})`, 0, y, W_, 1);
  for (let i = 0; i < 70 * W_ / 320; i++) px("#2a4a66", r() * W_ | 0, 162 + (r() * (H_ - 162) | 0), 2 + (r() * 5 | 0), 1);
  for (let y = 164; y < H_; y += 5) px("#c8c4a8", 260 + (r() * 6 | 0), y, 10 - ((y - 160) >> 3), 1);
  for (let x = 32; x < 100; x += 7) px("rgba(224, 48, 64, 0.35)", x, 168 + (x % 3), 4, 1);
  /* the jetty, and the Catamaran tied up at it */
  px("#3a2a16", 0, 180, 110, 4); px("#5a4026", 0, 180, 110, 1);
  for (let x = 6; x < 110; x += 18) px("#2a1e10", x, 184, 3, 16);
  g.imageSmoothingEnabled = false; g.drawImage(shipBare, 0, 0, 32, 32, 2, 128, 54, 54);
  return c;
}
