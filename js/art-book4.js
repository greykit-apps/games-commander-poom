/* Commander Poom -- Book 4's art: Descent into Rapture (map set E).
 *
 * Raptura, a drowned art-deco city of otters at the bottom of the sea,
 * in the spirit of BioShock (docs/story/book-4-story.md): three tilesets
 * (the Kelp Gardens, the Promenade, the Works), the city's creatures and
 * the Little Ones, the items, Poom's brass diving helmet, the world map
 * and the title backdrop. Registers with art.js; loads after it. */
"use strict";

const B4_MARBLE = ["#141c22", "#22303a", "#34464f", "#4c6470", "#6c8a94", "#94b0b8", "#c4d8dc"];
const B4_GOLD = ["#3a2a0a", "#6a4a12", "#a8781c", "#d8a830", "#f8d860", "#fff4b0"];
const B4_SEA = ["#03101a", "#06202e", "#0c3044", "#14465e", "#1e627e", "#3486a0", "#6ab8cc"];
const B4_KELP = ["#0c2612", "#143c1c", "#1e5426", "#2e7034", "#469042", "#6cb456"];
const B4_SAND = ["#2a2618", "#46402c", "#6a6042", "#90845c", "#b4a87c", "#d8cca0"];
const B4_CORAL = ["#4a1424", "#7a2434", "#b04048", "#e06a5e", "#ffa08c"];
const B4_BRASS = ["#241806", "#4a300e", "#765016", "#a47824", "#d0a444", "#f4d684"];
const B4_IRON = ["#141010", "#241c1a", "#3a2e2a", "#54443c", "#705c50", "#8c7664"];
const B4_SPARK = ["#5a0a2a", "#a01848", "#e0306a", "#ff6a9a", "#ffc0d4"];
const B4_NEON = { pink: "#ff4fa8", teal: "#3ff0e0" };

const b4px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

Object.assign(THEMES, {
  /* the Kelp Gardens: the city's glass-domed gardens on the seabed */
  gardens: { sky: 0, far: [1, 0], ground: [6, 0, 8], crust: ["#469042", "#6cb456"], alt: [8, 6], plat: [6, 14], bg: [0, 1], liquid: ["#1e627e", "#6ab8cc", "#06202e"], liquidName: "the open sea", style: "gardens", swimTint: "rgba(10, 70, 90, 0.32)" },
  /* the Promenade: marble, gold and neon, leaking */
  promenade: { sky: 0, far: [3, 0], ground: [3, 8, 0], crust: ["#d8a830", "#f8d860"], alt: [3, 8], plat: [6, 14], bg: [0, 3], liquid: ["#1e627e", "#6ab8cc", "#06202e"], liquidName: "sea water", style: "promenade", swimTint: "rgba(10, 70, 90, 0.32)" },
  /* the Works: iron, brass pipes, steam, SPARK vats */
  works: { sky: 0, far: [8, 0], ground: [8, 6, 0], crust: ["#d0a444", "#f4d684"], alt: [8, 6], plat: [6, 14], bg: [0, 8], liquid: ["#e0306a", "#ffc0d4", "#5a0a2a"], liquidName: "raw SPARK", style: "works", swimTint: "rgba(10, 70, 90, 0.32)" },
});

/* pieces every Raptura tileset shares: brass doors, a deco exit, a porthole
 * warp, brass levers and sockets, a grating bridge, lift platforms, a
 * kelp-rope pole and an audio diary on its stand */
function b4Common(tiles, mk, E, frame) {
  const px = b4px;
  const door = (a, b, top) => mk(g => {
    px(g, frame, 0, 0, T, T);
    px(g, B4_BRASS[3], 1, 0, T - 2, T); px(g, B4_BRASS[5], 1, 0, 1, T); px(g, B4_BRASS[1], T - 2, 0, 1, T);
    for (let y = top ? 6 : 1; y < T; y += 5) { px(g, B4_BRASS[2], 3, y, T - 6, 2); px(g, B4_BRASS[4], 3, y, T - 6, 1); }
    if (top) { px(g, B4_BRASS[1], 4, 1, 8, 4); px(g, E(b), 5, 2, 6, 2); px(g, E(a), 6, 2, 4, 1); }
    else { px(g, E(b), 3, 13, T - 6, 2); px(g, E(a), 3, 13, T - 6, 1); }
  });
  const COLOURS = [[12, 4], [14, 6], [10, 2], [9, 1], [7, 8]];
  tiles.doors = COLOURS.map(([a, b]) => door(a, b, true));
  tiles.doorsBelow = COLOURS.map(([a, b]) => door(a, b, false));
  /* the exit: brass doors under a deco sunburst, a green lamp */
  tiles.exit = [false, true].map(open => { const c = makeCanvas(T, T * 2), g = c.getContext("2d");
    px(g, frame, 0, 2, T, 30); px(g, B4_GOLD[3], 0, 4, T, 2); px(g, B4_GOLD[2], 0, 6, 2, 26); px(g, B4_GOLD[2], T - 2, 6, 2, 26);
    for (let i = 0; i < 5; i++) px(g, B4_GOLD[4], 3 + i * 2, 2 + Math.abs(2 - i), 1, 2);
    if (open) { px(g, "#04080a", 2, 8, 12, 24); g.fillStyle = "rgba(63, 240, 224, 0.18)"; g.fillRect(2, 24, 12, 8); }
    else { px(g, B4_BRASS[3], 2, 8, 12, 24); px(g, B4_BRASS[5], 2, 8, 12, 1); px(g, B4_BRASS[1], 7, 8, 2, 24); for (const y of [14, 22]) { px(g, B4_BRASS[4], 3, y, 4, 1); px(g, B4_BRASS[4], 9, y, 4, 1); } }
    g.fillStyle = "rgba(90, 255, 138, 0.4)"; g.fillRect(5, 0, 6, 3); px(g, "#1f7a33", 6, 0, 4, 2); px(g, "#c8ffd2", 7, 0, 2, 1);
    return c; });
  /* a warp door: a round porthole hatch, the sea swirling behind its glass */
  tiles.warp = [0, 1, 2, 3].map(f => { const c = makeCanvas(T * 2, T * 2), g = c.getContext("2d");
    g.fillStyle = B4_BRASS[2]; g.beginPath(); g.arc(16, 17, 14, 0, Math.PI * 2); g.fill();
    g.strokeStyle = B4_BRASS[4]; g.lineWidth = 2; g.beginPath(); g.arc(16, 17, 13, 0, Math.PI * 2); g.stroke();
    g.fillStyle = B4_SEA[2]; g.beginPath(); g.arc(16, 17, 10, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(16, 17, 10, 0, Math.PI * 2); g.clip();
    for (let k = 0; k < 3; k++) { g.strokeStyle = B4_SEA[4 + (k & 1)]; g.beginPath(); g.arc(16, 17, 3 + k * 3, f * 0.8 + k, f * 0.8 + k + 2.4); g.stroke(); }
    g.restore();
    for (let a = 0; a < 8; a++) px(g, B4_BRASS[5], Math.round(16 + Math.cos(a * Math.PI / 4) * 13), Math.round(17 + Math.sin(a * Math.PI / 4) * 13));
    return c; });
  tiles.switch = [0, 1].map(on => mk(g => {
    px(g, B4_BRASS[2], 3, 9, 10, 7); px(g, B4_BRASS[4], 3, 9, 10, 1);
    px(g, on ? "#3ff0e0" : B4_SPARK[2], 6, 12, 4, 2);
    g.strokeStyle = B4_BRASS[5]; g.lineWidth = 2; g.beginPath(); g.moveTo(8, 11); g.lineTo(on ? 13 : 3, 3); g.stroke();
    px(g, B4_GOLD[5], on ? 12 : 2, 2, 2, 2);
  }));
  tiles.socket = mk(g => { px(g, B4_BRASS[2], 2, 2, 12, 12); px(g, B4_BRASS[4], 2, 2, 12, 1); px(g, "#000", 4, 4, 8, 8); px(g, B4_GOLD[3], 7, 5, 2, 3); px(g, B4_GOLD[3], 6, 8, 4, 2); });
  tiles.bridge = mk(g => { px(g, B4_BRASS[3], 0, 0, T, 5); px(g, B4_BRASS[5], 0, 0, T, 1); for (let x = 1; x < T; x += 3) px(g, B4_BRASS[1], x, 1, 2, 4); px(g, B4_BRASS[0], 0, 5, T, 2); });
  tiles.platform = [[B4_NEON.teal, "#c8fff8"], [B4_SPARK[2], B4_SPARK[4]], [B4_BRASS[1], B4_BRASS[2]]].map(([l0, l1]) => [0, 1].map(f => {
    const c = makeCanvas(T * 2, 8), g = c.getContext("2d");
    px(g, B4_BRASS[3], 0, 0, 32, 6); px(g, B4_BRASS[5], 0, 0, 32, 1); px(g, B4_BRASS[1], 0, 5, 32, 1); px(g, "#000", 1, 6, 30, 2);
    for (let x = 3; x < 32; x += 8) px(g, (x >> 3) % 2 === f ? l1 : l0, x, 2, 3, 2);
    return c;
  }));
  /* a pole: a brass pole with deco collars */
  tiles.pole = mk(g => { px(g, B4_BRASS[1], 6, 0, 4, T); px(g, B4_BRASS[4], 7, 0, 2, T); px(g, B4_BRASS[5], 7, 0, 1, T); px(g, B4_GOLD[3], 5, 6, 6, 2); });
  /* an audio diary: a little reel-to-reel on a stand, its reels turning */
  tiles.sign = mk(g => {
    px(g, B4_BRASS[2], 7, 10, 2, 6); px(g, B4_BRASS[1], 4, 15, 8, 1);
    px(g, "#3a2a1e", 1, 3, 14, 8); px(g, "#5a4230", 1, 3, 14, 1);
    for (const x of [5, 11]) { g.fillStyle = "#c8c0b0"; g.beginPath(); g.arc(x, 7, 2.5, 0, Math.PI * 2); g.fill(); px(g, "#3a2a1e", x, 7); }
    px(g, "#e03040", 7, 9, 2, 1);
  });
  tiles.liquid = [0, 1, 2, 3].map(f => mk(g => {
    px(g, B4_SEA[2], 0, 4, T, 12);
    for (let x = 0; x < T; x++) { const h = 3 + Math.round(1.5 * Math.sin((x + f * 4) * Math.PI / 8)); px(g, B4_SEA[4], x, 6 - h + 2, 1, h + 2); }
    for (let x = 0; x < T; x += 4) px(g, B4_SEA[6], (x + f * 2) % T, 9 + (x % 8 ? 2 : 0), 2, 1);
  }));
  tiles.ice = tiles.ground[0];
}

/* The Kelp Gardens: sandy seabed rock with coral in it, sea grass and
 * coral on top; a ledge a planked garden walk, the hazard a bed of spiny
 * sea urchins. */
TILE_STYLES.gardens = (tiles, th, mk, E) => {
  const px = b4px;
  const block = (top, kind, seed) => mk(g => {
    const r = rng(seed);
    px(g, B4_SAND[2], 0, 0, T, T);
    for (let i = 0; i < 26; i++) px(g, B4_SAND[1 + (r() * 3 | 0)], r() * T | 0, r() * T | 0, 1 + (r() * 2 | 0), 1);
    if (kind === 1) { const x = 3 + (r() * 8 | 0), y = 5 + (r() * 6 | 0); px(g, B4_CORAL[2], x, y, 3, 2); px(g, B4_CORAL[3], x, y, 2, 1); px(g, B4_CORAL[1], x + 1, y + 2, 2, 1); }
    if (kind === 2) { px(g, "#b8ae98", 6, 8, 4, 3); px(g, "#8a8270", 6, 10, 4, 1); px(g, "#d8d0bc", 7, 8, 1, 1); }
    if (top) {
      px(g, B4_SAND[4], 0, 0, T, 2); px(g, B4_SAND[5], 0, 0, T, 1);
      for (let x = 0; x < T; x++) if (r() < .5) { const h = 1 + (r() * 3 | 0); px(g, B4_KELP[r() < .5 ? 3 : 4], x, 0, 1, h); }
      if (r() < .4) { const x = 2 + (r() * 10 | 0); px(g, B4_CORAL[3], x, 0, 2, 2); px(g, B4_CORAL[4], x, 0, 1, 1); }
    }
  });
  tiles.ground = [block(false, 0, 3), block(false, 1, 13), block(false, 0, 23), block(false, 0, 53), block(false, 2, 33), block(false, 0, 43), block(false, 0, 63), block(false, 1, 73)];
  tiles.groundTop = [block(true, 0, 5), block(true, 0, 15), block(true, 0, 35), block(true, 1, 25)];
  tiles.plat = mk(g => { px(g, "#5a4026", 0, 0, T, 4); px(g, "#7a5a36", 0, 0, T, 1); for (let x = 3; x < T; x += 5) px(g, "#2c1e10", x, 0, 1, 4); px(g, B4_KELP[3], 2, 4, 1, 3); px(g, B4_KELP[3], 11, 4, 1, 2); });
  tiles.spikes = mk(g => {
    px(g, B4_SAND[2], 0, 13, T, 3);
    for (const [cx, cy] of [[4, 11], [11, 12]]) {
      g.strokeStyle = "#3a1a4a"; g.lineWidth = 1;
      for (let a = 0; a < 12; a++) { const an = Math.PI + a * Math.PI / 11; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(an) * 5, cy + Math.sin(an) * 6); g.stroke(); }
      g.fillStyle = "#5a2a6a"; g.beginPath(); g.arc(cx, cy, 2.5, 0, Math.PI * 2); g.fill();
      px(g, "#c8a0d8", cx - 1, cy - 1);
    }
  });
  b4Common(tiles, mk, E, B4_SAND[1]);
  /* a pole here is a thick kelp rope */
  tiles.pole = mk(g => { px(g, B4_KELP[2], 6, 0, 4, T); px(g, B4_KELP[4], 7, 0, 2, T); for (let y = 2; y < T; y += 6) { px(g, B4_KELP[3], 4, y, 3, 2); px(g, B4_KELP[3], 9, y + 3, 3, 2); } });
};

/* the gardens' far view: the glass of the dome, the sea beyond it, light
 * coming down in shafts, kelp rising, fish, and the city's towers with
 * their neon far off in the blue */
FAR_STYLES.gardens = () => {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(41);
  for (let y = 0; y < 200; y += 4) { const k = y / 200; b4px(g, `rgb(${Math.round(8 + 6 * k)},${Math.round(50 - 30 * k)},${Math.round(70 - 30 * k)})`, 0, y, 320, 4); }
  for (const [x, w] of [[40, 30], [140, 20], [230, 36]]) { g.fillStyle = "rgba(160, 230, 230, 0.06)"; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w, 0); g.lineTo(x + w + 50, 200); g.lineTo(x + 30, 200); g.closePath(); g.fill(); }
  /* the towers */
  for (const [x, w, h] of [[30, 18, 90], [60, 12, 70], [180, 22, 110], [210, 14, 80], [270, 20, 95]]) {
    b4px(g, "#0a2632", x, 200 - h, w, h); b4px(g, "#0a2632", x + w / 2 - 2, 200 - h - 10, 4, 10);
    for (let y = 200 - h + 6; y < 196; y += 7) for (let wx = x + 2; wx < x + w - 2; wx += 4) if (r() < .25) b4px(g, "#e8c870", wx, y, 2, 3);
    if (r() < .7) b4px(g, r() < .5 ? B4_NEON.pink : B4_NEON.teal, x + 2, 200 - h + 2, w - 4, 1);
  }
  /* kelp */
  for (let i = 0; i < 9; i++) { const x = r() * 320, h = 60 + r() * 100; g.strokeStyle = "#0c3418"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 200); for (let y = 200; y > 200 - h; y -= 10) g.lineTo(x + Math.sin(y / 14 + i) * 5, y); g.stroke(); }
  /* fish, and the dome's ribs */
  for (let i = 0; i < 14; i++) { const x = r() * 320 | 0, y = 20 + (r() * 120 | 0); b4px(g, "#3a6e7e", x, y, 4, 2); b4px(g, "#3a6e7e", x - 1, y, 1, 1); }
  g.strokeStyle = "rgba(200, 160, 60, 0.35)"; g.lineWidth = 2;
  for (const x of [0, 106, 213, 320]) { g.beginPath(); g.moveTo(x, 200); g.quadraticCurveTo(x + 10, 60, 160, -20); g.stroke(); }
  return c;
};

/* The Promenade: teal marble blocks with gold seams, a gilt edge on top; a
 * ledge a gilded balcony rail, the hazard broken glass, a pole of brass. */
TILE_STYLES.promenade = (tiles, th, mk, E) => {
  const px = b4px;
  const block = (top, kind, seed) => mk(g => {
    const r = rng(seed);
    px(g, B4_MARBLE[3], 0, 0, T, T);
    /* veins */
    let x = r() * T, y = 0;
    for (let i = 0; i < 18; i++) { px(g, B4_MARBLE[r() < .5 ? 4 : 5], x | 0, y | 0); x += r() * 2 - 0.6; y += 1; }
    for (let i = 0; i < 10; i++) px(g, B4_MARBLE[2], r() * T | 0, r() * T | 0);
    px(g, B4_GOLD[2], 0, T - 1, T, 1); px(g, B4_GOLD[2], T - 1, 0, 1, T); px(g, B4_MARBLE[5], 0, 0, T, 1);
    if (kind === 1) { px(g, B4_GOLD[3], 5, 5, 6, 6); px(g, B4_MARBLE[2], 6, 6, 4, 4); px(g, B4_GOLD[4], 7, 7, 2, 2); }
    if (kind === 2) { px(g, B4_SEA[3], 4, 0, 1, T); px(g, B4_SEA[5], 4, 2, 1, 3); }
    if (top) { px(g, B4_GOLD[3], 0, 0, T, 3); px(g, B4_GOLD[5], 0, 0, T, 1); px(g, B4_GOLD[1], 0, 3, T, 1); for (let x2 = 2; x2 < T; x2 += 4) px(g, B4_GOLD[4], x2, 1, 2, 1); }
  });
  tiles.ground = [block(false, 0, 7), block(false, 0, 17), block(false, 1, 27), block(false, 0, 37), block(false, 2, 47), block(false, 0, 57), block(false, 0, 67), block(false, 0, 77)];
  tiles.groundTop = [block(true, 0, 9), block(true, 0, 19), block(true, 1, 29)];
  tiles.plat = mk(g => { px(g, B4_GOLD[3], 0, 0, T, 2); px(g, B4_GOLD[5], 0, 0, T, 1); for (let x = 1; x < T; x += 4) px(g, B4_GOLD[2], x, 2, 2, 4); px(g, B4_GOLD[1], 0, 6, T, 1); });
  tiles.spikes = mk(g => {
    px(g, B4_MARBLE[2], 0, 14, T, 2);
    for (const [x, h, w] of [[1, 8, 4], [5, 11, 3], [9, 7, 4], [12, 10, 3]]) {
      g.fillStyle = "rgba(170, 230, 240, 0.75)"; g.beginPath(); g.moveTo(x, 14); g.lineTo(x + w * 0.3, 14 - h); g.lineTo(x + w, 14); g.closePath(); g.fill();
      px(g, "#ffffff", Math.round(x + w * 0.3), 14 - h + 1, 1, 2);
    }
  });
  b4Common(tiles, mk, E, B4_MARBLE[1]);
};

/* the Promenade's far wall: a deco hall, pilasters and a sunburst, a great
 * round window on the sea with a fish going by, neon signs */
FAR_STYLES.promenade = () => {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(51);
  b4px(g, "#0c1a20", 0, 0, 320, 200);
  for (let x = 0; x < 320; x += 64) {
    b4px(g, "#16262e", x + 4, 0, 14, 200); b4px(g, "#22363e", x + 6, 0, 2, 200); b4px(g, "#3a2a0a", x + 4, 30, 14, 3); b4px(g, "#6a4a12", x + 4, 30, 14, 1);
  }
  /* the window */
  g.fillStyle = "#3a2a0a"; g.beginPath(); g.arc(160, 92, 54, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#0a3a50"; g.beginPath(); g.arc(160, 92, 48, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(160, 92, 48, 0, Math.PI * 2); g.clip();
  for (let i = 0; i < 6; i++) { g.fillStyle = "rgba(160, 230, 230, 0.07)"; g.fillRect(120 + i * 14, 40, 6, 110); }
  g.fillStyle = "#1a5a6e"; g.beginPath(); g.ellipse(150, 100, 22, 8, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(170, 100); g.lineTo(184, 92); g.lineTo(184, 108); g.closePath(); g.fill();
  b4px(g, "#0a2a36", 134, 98, 2, 2);
  g.restore();
  g.strokeStyle = "#6a4a12"; g.lineWidth = 2; g.beginPath(); g.moveTo(112, 92); g.lineTo(208, 92); g.moveTo(160, 44); g.lineTo(160, 140); g.stroke();
  /* sunbursts over the bays */
  for (const x of [48, 272]) for (let i = 0; i < 7; i++) { const a = Math.PI + (i + 0.5) * Math.PI / 7; g.strokeStyle = "#5a4010"; g.beginPath(); g.moveTo(x, 70); g.lineTo(x + Math.cos(a) * 26, 70 + Math.sin(a) * 26); g.stroke(); }
  /* neon */
  g.fillStyle = B4_NEON.pink; g.fillRect(28, 120, 40, 2); g.fillRect(28, 128, 30, 2);
  g.fillStyle = B4_NEON.teal; g.fillRect(252, 118, 44, 2); g.fillRect(260, 126, 30, 2);
  for (const [x, col] of [[48, "rgba(255, 79, 168, 0.12)"], [274, "rgba(63, 240, 224, 0.12)"]]) { g.fillStyle = col; g.beginPath(); g.arc(x, 124, 26, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < 30; i++) b4px(g, "#14222a", r() * 320 | 0, 150 + (r() * 50 | 0), 3, 1);
  return c;
};

/* The Works: riveted iron plate, rusted, a brass cap on top; a ledge an
 * iron grating, the hazard a broken pipe venting steam, the pole an iron
 * pipe. */
TILE_STYLES.works = (tiles, th, mk, E) => {
  const px = b4px;
  const plate = (top, kind, seed) => mk(g => {
    const r = rng(seed);
    px(g, B4_IRON[3], 0, 0, T, T);
    for (let i = 0; i < 16; i++) px(g, B4_IRON[r() < .5 ? 2 : 4], r() * T | 0, r() * T | 0, 1 + (r() * 2 | 0), 1);
    px(g, B4_IRON[1], 0, T - 1, T, 1); px(g, B4_IRON[1], T - 1, 0, 1, T); px(g, B4_IRON[5], 0, 0, T, 1); px(g, B4_IRON[5], 0, 0, 1, T);
    for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) { px(g, B4_BRASS[4], x, y); px(g, B4_IRON[1], x + 1, y + 1); }
    if (kind === 1) { px(g, "#7a3a1c", 5, 4, 1, 9); px(g, "#9a4b22", 6, 6, 1, 5); }
    if (kind === 2) { g.fillStyle = B4_BRASS[2]; g.beginPath(); g.arc(8, 8, 3.5, 0, Math.PI * 2); g.fill(); g.fillStyle = "#8a8270"; g.beginPath(); g.arc(8, 8, 2.5, 0, Math.PI * 2); g.fill(); px(g, "#a01848", 8, 6, 1, 2); }
    if (top) { px(g, B4_BRASS[3], 0, 0, T, 3); px(g, B4_BRASS[5], 0, 0, T, 1); px(g, B4_BRASS[1], 0, 3, T, 1); }
  });
  tiles.ground = [plate(false, 0, 9), plate(false, 1, 19), plate(false, 0, 29), plate(false, 0, 59), plate(false, 2, 39), plate(false, 0, 49), plate(false, 0, 69), plate(false, 0, 79)];
  tiles.groundTop = [plate(true, 0, 11), plate(true, 1, 21), plate(true, 0, 31)];
  tiles.plat = mk(g => { px(g, B4_IRON[4], 0, 0, T, 4); px(g, B4_IRON[5], 0, 0, T, 1); for (let x = 1; x < T; x += 3) px(g, B4_IRON[1], x, 1, 2, 3); px(g, B4_IRON[2], 0, 4, T, 1); });
  tiles.spikes = mk(g => {
    px(g, B4_IRON[2], 0, 12, T, 4); px(g, B4_BRASS[3], 2, 10, 12, 3); px(g, B4_BRASS[5], 2, 10, 12, 1); px(g, "#000", 7, 10, 2, 1);
    for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(230, 240, 240, ${0.5 - i * 0.07})`; g.beginPath(); g.arc(8 + Math.sin(i * 1.7) * 2, 9 - i * 1.6, 1.5 + i * 0.5, 0, Math.PI * 2); g.fill(); }
  });
  b4Common(tiles, mk, E, B4_IRON[1]);
  tiles.pole = mk(g => { px(g, B4_IRON[1], 6, 0, 4, T); px(g, B4_IRON[4], 7, 0, 2, T); px(g, B4_IRON[5], 7, 0, 1, T); px(g, B4_BRASS[3], 5, 10, 6, 2); });
};

/* the Works' far wall: pipes in every direction, a boiler, gauges, and a
 * row of SPARK vats glowing pink */
FAR_STYLES.works = () => {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(61);
  b4px(g, "#0e0c0c", 0, 0, 320, 200);
  for (let i = 0; i < 12; i++) { const y = r() * 200 | 0; b4px(g, "#241c18", 0, y, 320, 5); b4px(g, "#3a2e2a", 0, y, 320, 1); }
  for (let i = 0; i < 10; i++) { const x = r() * 320 | 0; b4px(g, "#241c18", x, 0, 5, 200); b4px(g, "#3a2e2a", x, 0, 1, 200); }
  for (let x = 20; x < 320; x += 70) {
    b4px(g, "#2a2224", x, 110, 34, 70); b4px(g, "#4a3010", x, 110, 34, 3);
    b4px(g, "#5a0a2a", x + 4, 120, 26, 54); g.fillStyle = "rgba(255, 106, 154, 0.35)"; g.fillRect(x + 4, 140, 26, 34);
    for (let k = 0; k < 4; k++) b4px(g, "#ffc0d4", x + 8 + k * 6, 150 + ((k * 13) % 20), 2, 2);
    g.fillStyle = "rgba(224, 48, 106, 0.10)"; g.beginPath(); g.arc(x + 17, 150, 30, 0, Math.PI * 2); g.fill();
  }
  for (const [x, y] of [[60, 50], [180, 40], [260, 60]]) { g.fillStyle = "#4a3010"; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = "#c8c0a8"; g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill(); b4px(g, "#a01848", x, y - 5, 1, 5); }
  return c;
};

/* ------------------------------------------------------------------ */
/* Poom's look: a brass diving helmet, his face in its round porthole, a
 * cable-knit sweater and brown trousers. Tail still his.                */

const B4_DIVER_PAL = { B: "#765016", b: "#4a300e", y: "#d0a444", Y: "#f4d684", R: "#3a2808", W: "#c8f0f8",
  S: "#2e5a3a", s: "#1e3e28", U: "#4a3020", V: "#2a1a10", Z: "#6a4a2e" };
const B4_DIVER_HEAD = [
  "...BBBBBB.....",
  ".BByyyyyBB....",
  "BByyyYyyyBB...",
  "BbyyyRRRRRbB..",
  "BbyyRWggggRB..",
  "BbyyRgg0giRB..",
  "BbyyRggiiDRB..",
  "BbyyyRRRRRbB..",
  ".BbbbbbbbbB...",
  "..BBBBBBBB....",
];
const B4_DIVER_HEAD_BACK = [
  "...BBBBBB.....",
  ".BByyyyyBB....",
  "BByyyYyyyBB...",
  "BbyyyyyyyybB..",
  "BbyyyRRyyybB..",
  "BbyyRYYRyybB..",
  "BbyyyRRyyybB..",
  "BbyyyyyyyybB..",
  ".BbbbbbbbbB...",
  "..BBBBBBBB....",
];
const B4_DIVER_HEAD_OUT = [
  "...BBBBBB.....",
  ".BByyyyyBB....",
  "BByyyYyyyBB...",
  "BbyyyRRRRRbB..",
  "BbyyRgFgFgRB..",
  "BbyyRggFggRB..",
  "BbyyRgFgFgRB..",
  "BbyyyRRRRRbB..",
  ".BbbbbbbbbB...",
  "..BBBBBBBB....",
];
LOOKS.diver = {
  pal: B4_DIVER_PAL,
  head: rows => rows === P_HEAD ? B4_DIVER_HEAD : rows === P_HEAD_BACK ? B4_DIVER_HEAD_BACK : B4_DIVER_HEAD_OUT,
  body: rows => rows.map((r, y) => {
    if (y === 0) return r.replace(/h/g, "b");
    const first = r.indexOf("9");
    return [...r].map((c, x) => c === "9" ? (x === first ? "s" : (x + y) % 3 === 0 ? "s" : "S") : c === "5" ? "U" : c === "F" ? "Z" : c === "C" ? "V" : c).join("");
  }),
  map: rows => {
    const b = rows.findIndex(r => r.includes("9"));
    return rows.map((r, y) => {
      if (y >= b) return recolour([r], { 9: "S", 5: "U", C: "V" })[0];
      if (y < 2) return recolour([r], { g: "B", i: "y" })[0];
      return recolour([r], { C: "y", F: "Y", 4: "b", g: "y", i: "W", 0: "R", D: "R" })[0];
    });
  },
};

/* ------------------------------------------------------------------ */
/* Raptura's creatures (docs/story/book-4-story.md)                      */

const B4_PAL = {
  k: "#141414", e: "#000000", o: "#6a4228", O: "#8a5a36", w: "#e8dcc8", n: "#1a1010",
  m: "#e8e0d0", M: "#b8a890", r: "#c8203a", R: "#ff6a7a",
  s: "#3a2a4a", S: "#5a4a6a", j: "#2a3a5a", J: "#4a5a7a", t: "#6a5a3a",
  b: "#765016", B: "#d0a444", y: "#f4d684", g: "#3a4048", G: "#5a646e", L: "#3ff0e0", l: "#9ff8f0",
  p: "#ff6a9a", P: "#ffc0d4", q: "#a01848",
  c: "#b04048", C: "#e06a5e", d: "#7a2434",
  f: "#5a8a9a", F: "#9ac8d4", h: "#2a5a6a",
  v: "#7a4a8a", V: "#b07ac0", z: "#e8f0f0",
  a: "#a8c8d0", A: "#d8eef2", u: "#3a3020", U: "#5a4a30", x: "#e03040",
};
const b4mirror = rows => { const w = Math.max(...rows.map(r => r.length)); return rows.map(r => [...r.padEnd(w, ".")].reverse().join("")); };

/* a SPARK slug: a fat glowing sea slug (a pusher, facing left) */
const B4_SLUG = {
  walk0: ["...pP.......", "..ppppp.....", ".pPpppppp...", "pPpPppppppp.", "pppqpppqpppp", ".qqqqqqqqqq."],
  walk1: ["....pP......", "..ppppp.....", ".pPpppppppp.", "pPpPpppppppp", "pppqpppqppp.", ".qqqqqqqqq.."],
  look: [".P.pP.......", "..ppppp.....", ".pPpppppp...", "pPpPppppppp.", "pppqpppqpppp", ".qqqqqqqqqq."],
  stunned: [".pPpppppppp.", "pppqpqpqpqpp", ".qqqqqqqqqq."],
};

/* a masked splicer: an otter in a ragged suit and a party mask (charger,
   facing right); a spider splicer and a houdini are the same in other
   colours */
const B4_SPLICER_TOP = [
  "...oooo.....",
  "..oOOOOo....",
  "..oOzzzzz...",
  "..oOzezzz...",
  "..ooOOwwwn..",
  "...ooOwww...",
  "....jjjj....",
  "...jjJJjj...",
  "..jjjJJjjj..",
  "..jjjJJjjoo.",
  "..jjjjjjj...",
  "..jjjjjjj...",
  "..ttttttt...",
];
const B4_SPLICER = {
  walk0: B4_SPLICER_TOP.concat(["oOjjjjjjj...", ".oOjj..jj...", "..jjj..jjj..", ".jjj....jjj.", ".kk......kk.", "kkk......kkk"]),
  walk1: B4_SPLICER_TOP.concat(["oOjjjjjjj...", ".oOjjjjjj...", "....jjjj....", "....jjjj....", "....kkkk....", "...kkkkkk..."]),
  charge: [
    "....oooo....",
    "...oOOOOo...",
    "...oOzzzzz..",
    "...oOzezzz..",
    "...ooOOwrrn.",
    "....ooOwww..",
    ".....jjjj...",
    "....jjJJjjoo",
    "...jjjJJjjjo",
    "..jjjjJJjjj.",
    "..jjjjjjj...",
    "..ttttttt...",
    "oOjjjjjjj...",
    ".oOjj..jjj..",
    "..jjj...jjj.",
    ".jjj.....jj.",
    ".kk......kkk",
    "kkk.......kk",
  ],
};
const B4_SPIDER_PAL = { ...B4_PAL, j: "#3a3a2a", J: "#5a5a3a", z: "#c8303a", t: "#2a2a1a" };
const B4_HOUDINI_PAL = { ...B4_PAL, j: "#4a1a5a", J: "#7a3a8a", z: "#ffd23f", t: "#2a0a3a" };

/* a thug: a big otter in shirtsleeves with a lead pipe (walker, facing left) */
const B4_THUG_TOP = [
  "....oooooo....",
  "...oOOOOOOo...",
  "..oOOOOOOOOo..",
  "..oOOOOOeOOw..",
  "..ooOOOOwwwwn.",
  "...ooOOwwwww..",
  "....ooowww....",
  "...mmmmmmmm...",
  "..mmMmmmmMmm..",
  ".mmmMmmmmMmmm.",
  ".oommmmmmmmGG.",
  ".oommmmmmmmgG.",
  "..mmmmmmmmm.g.",
  "..mmmmmmmmm.g.",
  "..uuuuuuuuu.g.",
  "..UUUUUUUUU...",
];
const B4_THUG = {
  walk0: B4_THUG_TOP.concat(["...UUUU.UUUU..", "...UUUU.UUUU..", "..UUUU...UUUU.", "..UUU.....UUU.", ".UUU.......UUU", ".kkkk.....kkkk", ".kkkk.....kkkk"]),
  walk1: B4_THUG_TOP.concat(["...UUUU.UUUU..", "....UUUUUUU...", "....UUU.UUU...", "....UUU.UUU...", "....UUU.UUU...", "...kkkk.kkkk..", "...kkkk.kkkk.."]),
  jump: B4_THUG_TOP.concat(["...UUUUUUUUU..", "..UUUU...UUUU.", ".kkkk.....kkkk", ".kkkk.....kkkk"]),
};
const B4_BRUTE_PAL = { ...B4_PAL, m: "#c8203a", M: "#8a1020", O: "#5a3a20", o: "#3a2414" };

/* a Big Brass: a huge diving suit, a drill for a hand, a porthole glowing
   (shover, facing right); Rosie and the gatekeeper in other metal */
const B4_DIVER = {
  a: [
    "....bbbbbb......",
    "...bBBBBBBb.....",
    "..bBBlllllBb....",
    "..bBlLLLLLlb....",
    "..bBlLLLLLlb....",
    "..bBBlllllBb....",
    "...bbBBBBbb.....",
    "..ggggggggggG...",
    ".gGGGGGGGGGgGGG.",
    ".gGgggggggGgGyGG",
    ".gGgggggggGg.GyG",
    ".gGgggggggGg..GG",
    ".gGGGGGGGGGg....",
    "..ggggggggg.....",
    "..bbbb..bbbb....",
    "..gggg..gggg....",
    ".bbbbb..bbbbb...",
  ],
  b: [
    "....bbbbbb......",
    "...bBBBBBBb.....",
    "..bBBlllllBb....",
    "..bBlLlLlLlb....",
    "..bBlLLLLLlb....",
    "..bBBlllllBb....",
    "...bbBBBBbb.....",
    "..ggggggggggG...",
    ".gGGGGGGGGGgGG..",
    ".gGgggggggGgGGyG",
    ".gGgggggggGg.GGy",
    ".gGgggggggGg..GG",
    ".gGGGGGGGGGg....",
    "..ggggggggg.....",
    "...bbbb.bbbb....",
    "...gggg.gggg....",
    "..bbbbb.bbbbb...",
  ],
};
const B4_ROSIE_PAL = { ...B4_PAL, g: "#6a3a20", G: "#9a5a30", b: "#3a2414", B: "#7a5a3a", L: "#ffb02e", l: "#ffe0a0" };
const B4_GATE_PAL = { ...B4_PAL, g: "#8a6a14", G: "#d0a444", b: "#4a300e", B: "#f4d684", L: "#ff6a9a", l: "#ffc0d4" };

/* a leadhead: an otter in a fedora behind a bar counter with a drum-fed gun
   (shooter, facing right) */
const B4_LEADHEAD = {
  a: ["...kkkkk.....", "..kkkkkkkk...", "...oOOeOw....", "...ooOwwwn...", "...jjjjGGGGG.", "..bbbbbbbbbb.", "..bBBBBBBBBb.", "..bdddddddbb.", "..bBBBBBBBBb.", "..bbbbbbbbbb."],
  b: ["...kkkkk.....", "..kkkkkkkk...", "...oOOeOw....", "...ooOwwwn...", "...jjjjGGGGGx", "..bbbbbbbbbb.", "..bBBBBBBBBb.", "..bdddddddbb.", "..bBBBBBBBBb.", "..bbbbbbbbbb."],
};

/* a hermit crab in a shell (pusher, facing left); an iron crab (shover) */
const B4_CRAB = {
  walk0: ["....MMMm....", "...MmMMMm...", "..MmMmMMMm..", ".cMMMmMMMm..", "cCcmmmmmmm..", "C.c.c.c.c..."],
  walk1: ["....MMMm....", "...MmMMMm...", "..MmMmMMMm..", ".cMMMmMMMm..", "cCcmmmmmmm..", ".c.c.c.c.c.."],
  look: ["....MMMm....", "...MmMMMm...", "e.MmMmMMMm..", "ccMMMmMMMm..", "cCcmmmmmmm..", "C.c.c.c.c..."],
  stunned: ["...MMMMm....", "..MmMMMMMm..", ".MmmmmmmmmM.", "c.c.c.c.c.c."],
};
const B4_IRONCRAB = {
  a: ["...e..e......", "...g..g...GG.", "..ggggggg.G.G", ".gGGGGGGggGG.", ".ggggggggg...", "..g.g.g.g....", ".g.g.g.g.g...", "g.g.g.g.g...."],
  b: ["...e..e......", "...g..g..GGG.", "..ggggggg...G", ".gGGGGGGggGGG", ".ggggggggg...", "..g.g.g.g....", "g.g.g.g.g....", ".g.g.g.g.g..."],
};

/* a security drone: a brass ball with a lamp and a little propeller */
const B4_DRONE = {
  walk0: ["....GGG.....", ".GGG.g.GGG..", "....bbb.....", "..bBBBBBb...", ".bBBxRBBBb..", ".bBBRxBBBb..", "..bBBBBBb...", "....bbb....."],
  walk1: [".GGG...GGG..", "....GgG.....", "....bbb.....", "..bBBBBBb...", ".bBBxRBBBb..", ".bBBRRBBBb..", "..bBBBBBb...", "....bbb....."],
  charge: [".G.G.G.G....", "....GgG.....", "....bbb.....", "..bBBBBBb...", ".bBBxxBBBb..", ".bBBxxBBBb..", "..bBBBBBb...", "....bbb....."],
};

/* the deep's fish: a school fish (pusher), a gulper (a big hunter, a
   walker), a jellyfish and a sea mine (walkers that drift) */
const B4_SCHOOLFISH = {
  walk0: ["..fff...", ".fFFFff.", "fFeFFFFf", ".fFFFff.", "..fff..f"],
  walk1: ["..fff...", ".fFFFff.", "fFeFFFFff", ".fFFFff.", "..fff..."],
  look: ["..fff...", ".fFFFff.", "fFeFFFFf", ".fFFFff.", "..fff..f"],
  stunned: [".fFFFff.", "fFFFFFFf", ".fFFFff."],
};
const B4_GULPER = {
  walk0: [
    "......hhhhhhhh.......",
    "....hhffffffffhh.....",
    "..hhfffffffffffffhh..",
    ".hffeffffffffffffffhh",
    "hffffffffffffffffffhh",
    "hwwwwwwfffffffffffhhh",
    "hw.w.w.wfffffffffhh.h",
    "hwwwwwwfffffffffhh..h",
    ".hffffffffffffffhh...",
    "..hhffffffffffhh.....",
    "....hhhhhhhhhh.......",
  ],
  walk1: [
    "......hhhhhhhh.......",
    "....hhffffffffhh.....",
    "..hhfffffffffffffhh..",
    ".hffeffffffffffffffh.",
    "hffffffffffffffffffhh",
    "hffffffffffffffffffhh",
    "hwwwwwwwffffffffffhhh",
    ".hwwwwwwfffffffffhh.h",
    ".hffffffffffffffhh...",
    "..hhffffffffffhh.....",
    "....hhhhhhhhhh.......",
  ],
  jump: [
    "......hhhhhhhh.......",
    "....hhffffffffhh.....",
    "..hhfffffffffffffhh..",
    ".hffeffffffffffffffhh",
    "hffffffffffffffffffhh",
    "hwwwwwwfffffffffffhhh",
    "hw.w.w.wfffffffffhh.h",
    "hwwwwwwfffffffffhh..h",
    ".hffffffffffffffhh...",
    "..hhffffffffffhh.....",
    "....hhhhhhhhhh.......",
  ],
};
const B4_JELLY = {
  walk0: ["..VVVV..", ".VzVVVV.", "VVVVVVVV", "vvvvvvvv", "v.v.v.v.", ".v.v.v.v", "v.v.v.v."],
  walk1: ["..VVVV..", ".VzVVVV.", "VVVVVVVV", "vvvvvvvv", ".v.v.v.v", "v.v.v.v.", ".v.v.v.v"],
  jump: ["..VVVV..", ".VzVVVV.", "VVVVVVVV", "vvvvvvvv", "v.v.v.v.", ".v.v.v.v", "v.v.v.v."],
};
const B4_MINE = {
  walk0: ["...g....", ".g.g.g..", "..ggg...", "gggGgggg", "..ggg...", ".g.x.g..", "...g...."],
  walk1: ["...g....", ".g.g.g..", "..ggg...", "gggGgggg", "..ggg...", ".g.R.g..", "...g...."],
  jump: ["...g....", ".g.g.g..", "..ggg...", "gggGgggg", "..ggg...", ".g.x.g..", "...g...."],
};

/* a security turret: brass, a lens over its barrel (points up and right) */
const B4_TURRET = {
  a: ["..........BB", "........bBB.", "......bBBb..", "....bBBb....", "...bbbb.....", "..bBBBBb....", ".bBxBBBBb...", ".bbbbbbbb...", "bBbbbbbbBb..", "bbbbbbbbbb.."],
  b: ["..........BB", "........bBB.", "......bBBb..", "....bBBb....", "...bbbb.....", "..bBBBBb....", ".bBRBBBBb...", ".bbbbbbbb...", "bBbbbbbbBb..", "bbbbbbbbbb.."],
};

/* a Little One: an otter pup in a pinafore, holding a jar of SPARK; two
   frames, waving */
const B4_LITTLE = [
  ["...oo..oo..", "...oOOOOo..", "..oOeOOeO..", "..oOOwwOO..", "...oOwnwo..", "..aaaAAaap.", ".aAAaAAapPp", ".aaAAAAaapp", "..aaAAaa...", "..aaaaaa...", "...oo.oo...", "...kk.kk..."],
  ["...oo..oo.o", "...oOOOOoO.", "..oOeOOeO..", "..oOOwwOO..", "...oOwnwo..", "..aaaAAaap.", ".aAAaAAapPp", ".aaAAAAaapp", "..aaAAaa...", "..aaaaaa...", "...oo.oo...", "...kk.kk..."],
];

/* ------------------------------------------------------------------ */
/* Things to pick up                                                     */

const B4_ITEMS = {
  /* a silver dollar */
  fish: ["..aaaa..", ".aAAAAa.", "aAAaaAAa", "aAaAAaAa", "aAAaaAAa", ".aAAAAa.", "..aaaa.."],
  /* a tin of sardines, the key on top */
  milk: ["......GG.", "gGGGGGGGg", "gfFFFFFfg", "gFwwwwwFg", "gfFFFFFfg", "ggggggggg"],
  /* a pearl in its oyster */
  yarn: ["..MMMMM..", ".MmmmmmM.", "MmmzzmmmM", "Mmmzzmmm.", ".MMMMMMM."],
  /* a gramophone record */
  catnip: ["..kkkk..", ".kkggkk.", "kkgxxgkk", "kgxkkxgk", "kgxkkxgk", "kkgxxgkk", ".kkggkk.", "..kkkk.."],
  /* a gold pocket watch on its chain */
  medal: ["..b......", ".bBb.....", "..b......", ".bBBBb...", "bByyyBb..", "bByryBb..", "bByyyBb..", ".bBBBb..."],
  /* a jewelled egg */
  trophy: ["...bBb...", "..bLpLb..", ".bBLLLBb.", ".bLpLpLb.", "bBBBBBBBb", ".bLLpLLb.", "..bBBBb..", "...bbb..."],
  /* a SPARK hypo: a syringe of glowing pink */
  ammo: [".g..", "gGg.", ".b..", "bpb.", "bPb.", "bpb.", "bpb.", ".G..", ".g.."],
};

ART_BOOKS.push(() => {
  const each = (src, pal, f = g => g) => Object.fromEntries(Object.entries(src).map(([k, g]) => [k, both(sprite(f(g), { pal }))]));
  ART.creatureSets.deep = {
    ...ART.creatureSets.wasteland,
    slug: each(B4_SLUG, B4_PAL),
    splicer: each(B4_SPLICER, B4_PAL),
    spider: each(B4_SPLICER, B4_SPIDER_PAL),
    houdini: each(B4_SPLICER, B4_HOUDINI_PAL),
    thug: each(B4_THUG, B4_PAL, b4mirror),
    brute: each(B4_THUG, B4_BRUTE_PAL, b4mirror),
    bigbrass: each(B4_DIVER, B4_PAL),
    rosie: each({ walk0: B4_DIVER.a, walk1: B4_DIVER.b, jump: B4_DIVER.a }, B4_ROSIE_PAL, b4mirror),
    gatekeeper: each({ walk0: B4_DIVER.a, walk1: B4_DIVER.b, jump: B4_DIVER.a }, B4_GATE_PAL, b4mirror),
    leadhead: each(B4_LEADHEAD, B4_PAL),
    crab: each(B4_CRAB, B4_PAL),
    ironcrab: each(B4_IRONCRAB, B4_PAL),
    drone: each(B4_DRONE, B4_PAL),
    schoolfish: each(B4_SCHOOLFISH, B4_PAL),
    gulper: each(B4_GULPER, B4_PAL),
    jelly: each(B4_JELLY, B4_PAL),
    mine: each(B4_MINE, B4_PAL),
    turret: each(B4_TURRET, B4_PAL),
  };
  const items = { ...ART.itemSets.wasteland.items };
  for (const [k, g] of Object.entries(B4_ITEMS)) items[k] = sprite(g, { pal: B4_PAL });
  ART.itemSets.deep = { items, gems: ART.itemSets.wasteland.gems, npc: B4_LITTLE.map(g => sprite(g, { pal: B4_PAL })) };
});

/* ------------------------------------------------------------------ */
/* The world map: the seabed round Raptura, sand and kelp, reef walls, the
 * deep trenches that need a diving suit, the city's buildings for markers */

MAP_PAINTERS.deep = classic => {
  const mk = (fn, w = T, h = T) => { const c = makeCanvas(w, h); fn(c.getContext("2d")); return c; };
  const px = b4px;
  const ground = [0, 1, 2, 3].map(v => mk(g => {
    const r = rng(411 + v * 9);
    px(g, B4_SAND[2], 0, 0, T, T);
    for (let i = 0; i < 20; i++) px(g, B4_SAND[1 + (r() * 3 | 0)], r() * T | 0, r() * T | 0, 1 + (r() * 2 | 0), 1);
    if (v === 1) { px(g, B4_KELP[3], 4, 3, 1, 6); px(g, B4_KELP[4], 6, 5, 1, 5); }
    if (v === 2) { px(g, B4_CORAL[3], 9, 9, 3, 2); px(g, B4_CORAL[4], 9, 9, 1, 1); }
    if (v === 3) { px(g, "#e8e0d0", 3, 11, 2, 1); }
  }));
  const cache = {};
  const rockAt = mask => cache[mask] || (cache[mask] = mk(g => {
    const r = rng(31 + mask);
    px(g, "#2a3438", 0, 0, T, T);
    for (let i = 0; i < 22; i++) px(g, ["#1e262a", "#36444a", "#465a60"][r() * 3 | 0], r() * T | 0, r() * T | 0, 1 + (r() * 3 | 0), 1);
    if (r() < .4) { const x = r() * 12 | 0, y = r() * 12 | 0; px(g, B4_CORAL[2], x, y, 3, 2); px(g, B4_CORAL[3], x, y, 2, 1); }
    if (mask & 1) { px(g, "#5a7078", 0, 0, T, 1); for (let x = 0; x < T; x++) if (r() < .3) px(g, B4_KELP[4], x, 0, 1, 2); }
    if (mask & 8) px(g, "#465a60", 0, 0, 1, T);
    if (mask & 2) px(g, "#141a1c", T - 1, 0, 1, T);
    if (mask & 4) px(g, "#101416", 0, T - 2, T, 2);
  }));
  const water = [0, 1].map(f => mk(g => { px(g, B4_SEA[1], 0, 0, T, T); for (let y = 2; y < T; y += 5) px(g, B4_SEA[3], (y + f * 3) % 10, y, 4, 1); if (f) px(g, B4_SEA[5], 6, 7, 1, 1); }));
  /* a barrier: a fallen bulkhead across the way, rusted, its rivets lit */
  const field = [0, 1, 2].map(f => mk(g => {
    g.drawImage(ground[0], 0, 0);
    px(g, B4_IRON[3], 0, 3, T, 11); px(g, B4_IRON[5], 0, 3, T, 1); px(g, B4_IRON[1], 0, 13, T, 1);
    for (let x = 2; x < T; x += 4) px(g, f === 1 ? B4_SPARK[3] : B4_BRASS[4], x, 7, 1, 1);
  }));
  const flag = mk(g => { px(g, B4_BRASS[4], 4, 2, 1, 13); px(g, "#2e5a3a", 5, 2, 8, 6); px(g, "#1e3e28", 5, 7, 8, 1); px(g, "#dba363", 8, 4, 2, 2); });
  /* a bathysphere: a brass ball with portholes, on its cradle */
  const tele = [0, 1].map(f => mk(g => {
    g.drawImage(ground[0], 0, 0);
    g.fillStyle = B4_BRASS[3]; g.beginPath(); g.arc(8, 8, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = B4_BRASS[5]; g.beginPath(); g.arc(6, 6, 2, 0, Math.PI * 2); g.fill();
    px(g, f ? "#3ff0e0" : "#14465e", 8, 7, 3, 3);
    px(g, B4_IRON[3], 3, 14, 10, 2);
  }));
  const ship = mk(g => { g.drawImage(classic.shipBare, 0, 0); }, 32, 32);
  const marker = {
    /* a garden dome: glass ribs over kelp */
    dome: mk(g => {
      px(g, "rgba(0,0,0,0.35)", 3, 28, 26, 3);
      g.fillStyle = "rgba(120, 200, 210, 0.35)"; g.beginPath(); g.arc(16, 28, 14, Math.PI, 0); g.fill();
      for (const x of [6, 11, 16, 21, 26]) { px(g, B4_KELP[3], x, 18, 1, 10); px(g, B4_KELP[4], x, 18, 1, 3); }
      g.strokeStyle = B4_BRASS[4]; g.lineWidth = 1; g.beginPath(); g.arc(16, 28, 14, Math.PI, 0); g.stroke();
      for (const a of [1.2, 1.6, 1.95]) { g.beginPath(); g.moveTo(16, 28); g.lineTo(16 + Math.cos(Math.PI * a) * 14, 28 + Math.sin(Math.PI * a) * 14); g.stroke(); }
    }, 32, 32),
    /* a deco tower, its neon lit */
    tower: mk(g => {
      px(g, "rgba(0,0,0,0.35)", 4, 28, 24, 3);
      px(g, B4_MARBLE[3], 9, 6, 14, 23); px(g, B4_MARBLE[5], 9, 6, 1, 23); px(g, B4_GOLD[3], 9, 6, 14, 2);
      px(g, B4_MARBLE[3], 13, 1, 6, 6); px(g, B4_GOLD[4], 15, 0, 2, 2);
      for (let y = 10; y < 26; y += 4) for (const x of [11, 15, 19]) px(g, "#e8c870", x, y, 2, 2);
      px(g, B4_NEON.pink, 6, 14, 3, 8); px(g, B4_NEON.teal, 23, 12, 3, 8);
    }, 32, 32),
    /* a works stack, venting, a pink vat glow */
    works: mk(g => {
      px(g, "rgba(0,0,0,0.35)", 2, 28, 28, 3);
      px(g, B4_IRON[3], 4, 14, 24, 15); px(g, B4_IRON[5], 4, 14, 24, 1);
      px(g, B4_IRON[2], 20, 2, 5, 12); px(g, B4_BRASS[3], 19, 2, 7, 2);
      for (let i = 0; i < 3; i++) { g.fillStyle = `rgba(220, 230, 230, ${0.4 - i * 0.1})`; g.beginPath(); g.arc(22 + i, 0 - i * 2 + 2, 2 + i, 0, Math.PI * 2); g.fill(); }
      px(g, B4_SPARK[1], 8, 18, 8, 9); px(g, B4_SPARK[3], 9, 22, 6, 4);
    }, 32, 32),
  };
  return { ...classic, ground, rockAt, rock: rockAt(0), water, field, flag, tele, ship, markerFor: marker, teleName: "Bathysphere" };
};

/* ------------------------------------------------------------------ */
/* The title backdrop: Raptura from the seabed. Light shafts from far
 * above, the city's deco towers lit and their neon, kelp, a lighthouse's
 * beam at the very top where the surface is, the Catamaran moored on a
 * buoy up there. Bubbles, fish and Poom are drawn over it by game.js.   */
function paintDeepTitle(shipBare, W_ = 320, H_ = 200) {
  const c = makeCanvas(W_, H_), g = c.getContext("2d"), r = rng(77);
  const px = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  for (let y = 0; y < H_; y += 4) { const k = y / H_; px(`rgb(${Math.round(20 - 14 * k)},${Math.round(90 - 70 * k)},${Math.round(110 - 80 * k)})`, 0, y, W_, 4); }
  /* the surface, and the light coming down */
  px("#6ab8cc", 0, 0, W_, 2); px("#3486a0", 0, 2, W_, 2);
  for (let x = 0; x < W_; x += 12) px("#a8e0ea", x + (r() * 6 | 0), 1, 4, 1);
  for (const [x, w] of [[30, 30], [120, 18], [200, 34], [280, 20]]) { g.fillStyle = "rgba(170, 230, 235, 0.08)"; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w, 0); g.lineTo(x + w + 40, H_); g.lineTo(x + 20, H_); g.closePath(); g.fill(); }
  /* the Catamaran's hull, floating on the surface, its ladder down */
  g.save(); g.imageSmoothingEnabled = false; g.globalAlpha = 0.9; g.drawImage(shipBare, 0, 0, 32, 32, 40, -16, 32, 32); g.restore();
  /* the city */
  /* the city: tall towers to the left and the top right, clear of the
     logo and the menu, low ones between them under the menu */
  const towers = [[2, 22, 150], [28, 16, 118], [48, 26, 168], [150, 22, 70], [190, 26, 80], [238, 22, 164], [264, 30, 186], [298, 20, 150]];
  for (const [x, w, h] of towers) {
    px("#0a2430", x, H_ - h, w, h); px("#0e3040", x, H_ - h, 2, h);
    px("#0a2430", x + w / 2 - 3, H_ - h - 14, 6, 14); px("#0a2430", x + w / 2 - 1, H_ - h - 22, 2, 8);
    for (let i = 0; i < 4; i++) px("#0e3040", x + i * 2, H_ - h + i * 3, w - i * 4, 1);
    for (let y = H_ - h + 10; y < H_ - 4; y += 8) for (let wx = x + 3; wx < x + w - 3; wx += 5) if (r() < .35) px(r() < .8 ? "#f0d080" : "#ff9a6a", wx, y, 2, 4);
    if (r() < .8) { const col = r() < .5 ? B4_NEON.pink : B4_NEON.teal; px(col, x + 3, H_ - h + 4, w - 6, 2); g.fillStyle = col === B4_NEON.pink ? "rgba(255, 79, 168, 0.15)" : "rgba(63, 240, 224, 0.15)"; g.fillRect(x - 2, H_ - h, w + 4, 10); }
  }
  /* a glass tunnel between two towers */
  g.strokeStyle = "rgba(160, 220, 230, 0.4)"; g.lineWidth = 6; g.beginPath(); g.moveTo(260, 70); g.quadraticCurveTo(280, 60, 300, 66); g.stroke();
  g.beginPath(); g.moveTo(38, 100); g.quadraticCurveTo(46, 92, 52, 98); g.stroke();
  /* kelp in front, and the seabed */
  for (let i = 0; i < 6; i++) { const x = 80 + r() * 40, h = 40 + r() * 70; g.strokeStyle = "#0c3418"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, H_); for (let y = H_; y > H_ - h; y -= 8) g.lineTo(x + Math.sin(y / 12 + i) * 4, y); g.stroke(); }
  for (let y = 184; y < H_; y++) px(y < 186 ? "#6a6042" : "#46402c", 0, y, W_, 1);
  for (let i = 0; i < 40 * W_ / 320; i++) px(r() < .5 ? "#2a2618" : "#90845c", r() * W_ | 0, 186 + (r() * 14 | 0), 1 + (r() * 3 | 0), 1);
  /* a rock for Poom to stand on */
  g.fillStyle = "#2a3438"; g.beginPath(); g.moveTo(60, 200); g.lineTo(66, 182); g.lineTo(100, 180); g.lineTo(108, 200); g.closePath(); g.fill();
  px("#465a60", 66, 181, 34, 1);
  return c;
}
