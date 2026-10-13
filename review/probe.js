/* review/probe.js: measures Poom's movement with the game's own code.
 * Load in the page (served from the repo root, e.g. localhost:8765):
 *   const P = await import("/review/probe.js?" + Date.now()); P.all()
 * It builds a flat test level (MAPS.ZZ1), drives updatePlayer with held
 * keys, and reports heights and distances in pixels and tiles (T = 16).
 * Nothing it does is saved: it never touches localStorage. */
const FLAT = (() => {
  const w = 200, h = 40, rows = [];
  for (let y = 0; y < h; y++) rows.push((y >= h - 2 ? "#" : ".").repeat(w));
  rows[h - 3] = "P" + ".".repeat(w - 1);
  return { id: "ZZ1", kind: "level", engine: "E1", w, h, completion: ["exit_tile"], notes: [], rows, things: [], marks: [], links: [], ends: [], sockets: [], bridges: [], pswitches: [], book: "H" };
})();
function setup() {
  if (!MAPS.ZZ1) { MAPS.ZZ1 = FLAT; }
  G.run = newRun(); G.run.book = "H"; G.run.ammo = 99;
  const say_ = window.message, toast_ = window.toast, play_ = audio.play;
  window.message = () => {}; window.toast = () => {}; audio.play = () => {};
  startLevel("ZZ1"); UI.clear();
  const lv = G.lv;
  lv.ents = [];
  return { lv, restore() { window.message = say_; window.toast = toast_; audio.play = play_; } };
}
/* run n ticks with a per-tick input function: inputs(t) -> [held actions]; pressed on the first tick an action appears */
function run(lv, n, inputs, each) {
  let prev = new Set();
  for (let t = 0; t < n; t++) {
    const now = new Set(inputs(t) || []);
    held.clear(); pressed.clear();
    for (const a of now) { held.add(a); if (!prev.has(a)) pressed.add(a); }
    prev = now;
    lv.t++; updatePlats(lv); updatePlayer(lv);
    if (each) each(t);
  }
  held.clear(); pressed.clear();
}
function settle(lv) { const p = lv.p; p.x = 100; p.y = (lv.h - 2) * T - p.h; p.vx = p.vy = 0; p.pogo = false; p.h = PH; p.onGround = false; p.crouch = p.compress = 0; run(lv, 5, () => []); }
const tiles = px => (px / T).toFixed(2);

export function jumps() {
  const { lv, restore } = setup(), p = lv.p, out = [];
  try {
    for (let hold = 1; hold <= 8; hold++) {
      settle(lv);
      const ground = p.y + p.h; let top = ground, x0 = p.x, landedAt = null, air = 0;
      run(lv, 240, t => t < hold ? ["jump"] : [], t => { top = Math.min(top, p.y + p.h); if (landedAt === null && t > hold + 6 && p.onGround) landedAt = t; if (!p.onGround) air++; });
      out.push({ holdTicks: hold, heightPx: ground - top, heightTiles: tiles(ground - top), airTicks: air });
    }
    /* a full running jump: how far across flat ground */
    settle(lv);
    run(lv, 60, () => ["right"]);
    const x0 = p.x, ground = p.y + p.h; let land = null;
    run(lv, 240, t => t < 10 ? ["right", "jump"] : ["right"], t => { if (land === null && t > 12 && p.onGround) land = p.x; });
    out.push({ runningJumpPx: land - x0, runningJumpTiles: tiles(land - x0) });
    /* a standing jump straight up, then how far he can drift with air control */
    settle(lv);
    const sx = p.x; let far = 0;
    run(lv, 240, t => t < 10 ? ["jump", "right"] : ["right"], () => { far = Math.max(far, p.x - sx); });
    out.push({ jumpThenHoldRightPx: far, tiles: tiles(far) });
  } finally { restore(); }
  return out;
}
export function pogo() {
  const { lv, restore } = setup(), p = lv.p, out = [];
  try {
    for (const big of [false, true]) {
      settle(lv);
      run(lv, 1, () => ["pogo"]); run(lv, 30, () => []);   /* on the stick, settled */
      /* the feet's lowest point over the run is the ground: the stick may be mid-bounce when the run starts */
      let ground = p.y + p.h, top = ground, air = 0, bounces = 0, wasG = true;
      run(lv, 400, () => big ? ["jump"] : [], t => { ground = Math.max(ground, p.y + p.h); top = Math.min(top, p.y + p.h); if (!p.onGround) air++; if (p.onGround && !wasG) bounces++; wasG = p.onGround; });
      out.push({ bounce: big ? "big (jump held)" : "small", heightPx: ground - top, heightTiles: tiles(ground - top), bouncesIn400Ticks: bounces });
    }
    /* horizontal range of one big bounce with right held throughout */
    settle(lv);
    run(lv, 1, () => ["pogo"]); run(lv, 30, () => []);
    let x0 = null, best = 0;
    run(lv, 600, () => ["jump", "right"], () => { if (p.onGround) { if (x0 !== null) best = Math.max(best, p.x - x0); x0 = p.x; } });
    out.push({ bigBounceRangeRightHeldPx: best, tiles: tiles(best), note: "distance between consecutive landings at top pogo speed" });
    /* top pogo horizontal speed */
    out.push({ pogoTopSpeedPxPerTick: KP.walkMax, note: "capped at walkMax" });
  } finally { restore(); }
  return out;
}
export function walk() {
  const { lv, restore } = setup(), p = lv.p, out = [];
  try {
    settle(lv);
    let toMax = null;
    run(lv, 120, () => ["right"], t => { if (toMax === null && Math.abs(p.vx - KP.walkMax) < 1e-9) toMax = t + 1; });
    out.push({ walkMaxPxPerTick: p.vx, ticksToTopSpeed: toMax, tilesPerSecond: tiles(p.vx * 60) });
    const x0 = p.x; let stop = null;
    run(lv, 120, () => [], t => { if (stop === null && p.vx === 0) stop = t + 1; });
    out.push({ stopDistancePx: p.x - x0, stopTicks: stop });
    /* reversing: an instant stop then build */
    settle(lv); run(lv, 60, () => ["right"]);
    const xr = p.x; let turned = null;
    run(lv, 60, () => ["left"], t => { if (turned === null && p.vx < 0) turned = t + 1; });
    out.push({ reverseTicksUntilMovingLeft: turned, overshootPx: Math.max(0, p.x - xr) });
    /* falling: terminal speed and time to fall ten tiles */
    settle(lv); p.y -= T * 10; p.onGround = false;
    let ticks = 0; run(lv, 240, () => [], t => { if (!p.onGround) ticks = t + 1; });
    out.push({ fallTenTilesTicks: ticks, maxFallPxPerTick: KP.maxFall, gravity: KP.gravity });
  } finally { restore(); }
  return out;
}
export function shots() {
  const { lv, restore } = setup(), p = lv.p, out = [];
  try {
    settle(lv);
    run(lv, 1, () => ["fire"]);
    const s = lv.shots[0], x0 = s.x; let t = 0;
    while (!s.gone && t < 400) { lv.t++; updateShots(lv); t++; }
    out.push({ shotSpeedPxPerTick: KP.shotSpeed, rangePx: s.x - x0, rangeTiles: tiles(s.x - x0), lifeTicks: t, refireTicks: KP.refire, stanceTicks: KP.fireStance });
  } finally { restore(); }
  return out;
}
export function all() { return { jumps: jumps(), pogo: pogo(), walk: walk(), shots: shots() }; }
window.PROBE = { jumps, pogo, walk, shots, all };
