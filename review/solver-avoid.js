/* review/solver-avoid.js: a copy of .claude/solver.js with one extra option,
 * avoid: true, which treats touching a ship part or heartstone as death,
 * so a success means the level's exit can be reached WITHOUT it (a
 * softlock check: a finished level cannot be re-entered). Otherwise
 * unchanged.
 *
 * A level solver (local only). Drives the game's own player physics
 * (updatePlayer, updatePlats) with real inputs, six frames at a time, in a
 * breadth-first search over Poom's state, to see whether a real player can
 * reach the level's way out. Creatures are left out (they can be shot or
 * dodged; their keycards are given); hazards, doors, keycards, sockets,
 * bridges, switches, poles, platforms, warp doors and the pogo are all the
 * game's own. Trap switches are never pulled.
 *
 *   await import("/.claude/solver.js?" + Date.now()); await solve("D05")
 */
const ACTIONS = [[], ["left"], ["right"], ["jump"], ["left", "jump"], ["right", "jump"], ["up"], ["down"], ["down", "jump"], ["pogo"], ["left", "pogo"], ["right", "pogo"]];
/* under water: every direction, and strokes */
const SWIM_ACTIONS = [[], ["left"], ["right"], ["up"], ["down"], ["up", "left"], ["up", "right"], ["down", "left"], ["down", "right"], ["jump"], ["left", "jump"], ["right", "jump"]];
const MACRO = 6;

export async function solve(id, { maxStates = 500000, maxMs = 60000, items = false, W8 = 2, fine = false, trace = false, from = null, to = null, guide = null, ev = [], oldKey = false, commit = false, roomy = true, graph = true, avoid = false } = {}) {
  /* a quiet copy of the level */
  G.run = newRun(); G.run.book = MAPS[id].book; G.run.swim = true;
  startLevel(id); UI.clear();
  const lv = G.lv, p = lv.p;
  const carried = lv.ents.filter(e => e.carries !== undefined).map(e => e.carries);
  lv.ents = [];
  /* the world's state: what has been opened, collected, flipped */
  const orig = { tiles: lv.tiles.map(r => r.slice()), keys: lv.keys.slice(), pmark: new Map(lv.pmark),
    bridges: lv.bridges.map(b => b.on), pswitch: Object.values(lv.pswitchAt).map(s => s.on), sockets: lv.sockets.map(s => s.filled) };
  carried.forEach(g => { orig.keys[g] = true; });
  const gems = lv.items.filter(i => i.kind === "gem");
  const objs = lv.items.filter(i => i.kind === "objective" || i.kind === "heart" || i.kind === "swim" || i.kind === "part");
  const ends = objs.filter(i => i.ends), feeders = objs.filter(i => i.kind === "objective" && !i.ends);
  const fedCore = ends.length && feeders.length;   /* D17: the cores feed a sealed heart */
  let events = new Set(ev), trap = false;
  const sw = {};
  const keep = ["message", "toast", "popup", "seen", "collect", "springTrap", "readSign", "centerCamera", "openDoor", "fillSocket", "flipBridge", "flipPlatSwitch"];
  for (const k of keep) sw[k] = window[k];
  const playOrig = audio.play;
  audio.play = () => {};
  window.message = () => {}; window.toast = () => {}; window.popup = () => {}; window.seen = () => true; window.centerCamera = () => {}; window.readSign = () => {};
  window.springTrap = () => { trap = true; };
  window.openDoor = (l, tx, ty) => { events.add("o" + tx + "," + ty); sw.openDoor(l, tx, ty); };
  window.fillSocket = (l, s) => { events.add("s" + lv.sockets.indexOf(s)); sw.fillSocket(l, s); };
  window.flipBridge = (l, b) => { const k = "b" + lv.bridges.indexOf(b); if (events.has(k)) events.delete(k); else events.add(k); sw.flipBridge(l, b); };
  window.flipPlatSwitch = (l, s) => { const k = "p" + Object.values(lv.pswitchAt).indexOf(s); if (events.has(k)) events.delete(k); else events.add(k); sw.flipPlatSwitch(l, s); };
  let touched = new Set();
  window.collect = (l, it) => {
    if (it.kind === "gem") { if (!events.has("g" + gems.indexOf(it))) { events.add("g" + gems.indexOf(it)); l.keys[it.gem] = true; } return; }
    if (objs.includes(it)) { if (avoid && (it.kind === "part" || it.kind === "heart")) { l.p.state = "dead"; return; } touched.add(objs.indexOf(it)); if (it.ends && !fedCore && ends.length === 1) finishBy(l, "objective"); }
  };
  /* build the world for a set of events, from the original */
  const cache = new Map();
  const sigOf = ev => [...ev].sort().join("|");
  const build = sig => {
    const ev = sig ? sig.split("|") : [];
    lv.tiles = orig.tiles.map(r => r.slice()); lv.keys = orig.keys.slice(); lv.pmark = new Map(orig.pmark);
    lv.bridges.forEach((b, i) => { b.on = orig.bridges[i]; }); lv.sockets.forEach((s, i) => { s.filled = orig.sockets[i]; });
    Object.values(lv.pswitchAt).forEach((s, i) => { s.on = orig.pswitch[i]; });
    for (const e of ev) if (e[0] === "g") lv.keys[gems[+e.slice(1)].gem] = true;
    for (const e of ev) if (e[0] === "s") sw.fillSocket(lv, lv.sockets[+e.slice(1)]);
    for (const e of ev) if (e[0] === "o") { const [x, y] = e.slice(1).split(",").map(Number); sw.openDoor(lv, x, y); }
    for (const e of ev) if (e[0] === "b") sw.flipBridge(lv, lv.bridges[+e.slice(1)]);
    for (const e of ev) if (e[0] === "p") sw.flipPlatSwitch(lv, Object.values(lv.pswitchAt)[+e.slice(1)]);
    lv.fx = [];
    return { tiles: lv.tiles, keys: lv.keys, pmark: lv.pmark, bridges: lv.bridges.map(b => b.on), sockets: lv.sockets.map(s => s.filled), pswitch: Object.values(lv.pswitchAt).map(s => s.on) };
  };
  const use = sig => {
    let w = cache.get(sig);
    if (!w) { w = build(sig); cache.set(sig, w); return; }
    lv.tiles = w.tiles; lv.keys = w.keys; lv.pmark = w.pmark;
    lv.bridges.forEach((b, i) => { b.on = w.bridges[i]; }); lv.sockets.forEach((s, i) => { s.filled = w.sockets[i]; });
    Object.values(lv.pswitchAt).forEach((s, i) => { s.on = w.pswitch[i]; });
  };
  /* objectives a shot can reach from here: level with it, nothing solid between */
  const shotRange = KP.shotSpeed * 118;
  const canShoot = it => {
    const sy = p.y + 13, row = Math.floor(sy / T);
    if (sy < it.y + 1 || sy > it.y + 15) return false;
    const fromX = it.x > p.x ? p.x + p.w : p.x, toX = it.x + 8;
    if (Math.abs(toX - fromX) > shotRange) return false;
    const a = Math.floor(Math.min(fromX, toX) / T), b = Math.floor(Math.max(fromX, toX) / T);
    for (let tx = a; tx <= b; tx++) if (isSolid(tileAt(lv, tx, row))) return false;
    return true;
  };
  /* the search. A state is Poom's numbers, the few platforms that react
     to him (dropping, sneaky) and the time; the rest of the platforms run on
     a timetable of their own, worked out once and shared */
  const PF = ["x", "y", "vx", "vy", "h", "face", "buffer", "coyote", "fireCool", "shootT", "dropT", "poleCool", "land", "pushT", "pushV", "crouch", "crouchHeld", "compress", "t", "anim"];
  const PB = ["onGround", "pogo", "climbing", "pogoBigAsk"];
  const det = lv.plats.filter(pl => pl.kind === "line" || pl.kind === "arrow"), dyn = lv.plats.filter(pl => pl.kind === "drop" || pl.kind === "sneaky");
  const t00 = lv.t, timetable = new Map();
  const detAt = (sig, t) => {
    const psig = sig.split("|").filter(e => e[0] === "p").join("|");
    let tt = timetable.get(psig);
    if (!tt) {
      const pm = new Map(orig.pmark);
      for (const e of psig ? psig.split("|") : []) { const sw_ = Object.values(lv.pswitchAt)[+e.slice(1)], k = sw_.tx + "," + sw_.ty; if (pm.has(k)) pm.delete(k); else pm.set(k, sw_.mark); }
      const simPlats = det.map(pl => ({ ...pl, dir: pl.dir.slice() }));
      tt = { at: [], sim: { plats: simPlats, p: { x: -1e6, y: -1e6, w: 1, h: 1, riding: null, onGround: false, state: "play" }, pmark: pm, tiles: orig.tiles, w: lv.w, h: lv.h, t: t00 } };
      tt.at[0] = simPlats.map(pl => [pl.x, pl.y, pl.dir[0], pl.dir[1], +pl.wait, pl.dx, pl.dy]);
      timetable.set(psig, tt);
    }
    const i = (t - t00) / MACRO;
    while (tt.at.length <= i) { for (let f = 0; f < MACRO; f++) updatePlats(tt.sim); tt.at.push(tt.sim.plats.map(pl => [pl.x, pl.y, pl.dir[0], pl.dir[1], +pl.wait, pl.dx, pl.dy])); }
    return tt.at[i];
  };
  window.__dbg = { detAt, det, lv, t00 };
  const snap = () => {
    const v = new Float64Array(PF.length + PB.length + 1 + dyn.length * 6);
    PF.forEach((k, i) => { v[i] = p[k] || 0; }); PB.forEach((k, i) => { v[PF.length + i] = p[k] ? 1 : 0; });
    v[PF.length + PB.length] = p.riding ? lv.plats.indexOf(p.riding) : -1;
    dyn.forEach((pl, j) => { const o = PF.length + PB.length + 1 + j * 6; v[o] = pl.x; v[o + 1] = pl.y; v[o + 2] = pl.vy; v[o + 3] = pl.flee || 0; v[o + 4] = pl.dx; v[o + 5] = pl.dy; });
    return { v, t: lv.t, sig: sigOf(events) };
  };
  const restore = s => {
    use(s.sig); events = new Set(s.sig ? s.sig.split("|") : []);
    const d = detAt(s.sig, s.t);
    det.forEach((pl, i) => { const a = d[i]; pl.x = a[0]; pl.y = a[1]; pl.dir = [a[2], a[3]]; pl.wait = !!a[4]; pl.dx = a[5]; pl.dy = a[6]; });
    const v = s.v;
    dyn.forEach((pl, j) => { const o = PF.length + PB.length + 1 + j * 6; pl.x = v[o]; pl.y = v[o + 1]; pl.vy = v[o + 2]; pl.flee = v[o + 3]; pl.dx = v[o + 4]; pl.dy = v[o + 5]; });
    PF.forEach((k, i) => { p[k] = v[i]; }); PB.forEach((k, i) => { p[k] = !!v[PF.length + i]; });
    const r = v[PF.length + PB.length]; p.riding = r >= 0 ? lv.plats[r] : null;
    p.state = "play"; p.w = p.w; lv.t = s.t;
  };
  const nearPlat = () => lv.plats.some(pl => Math.abs(pl.x - p.x) < 80 && Math.abs(pl.y - p.y) < 80);
  /* the platforms near Poom, where they are and which way they're going */
  /* a pulsing column within a few tiles: then the time in its cycle matters */
  const nearPulse = () => { const tx = Math.floor((p.x + p.w / 2) / T), ty = Math.floor((p.y + p.h / 2) / T);
    for (let y = ty - 2; y <= ty + 2; y++) for (let x = tx - 5; x <= tx + 5; x++) if (tileAt(lv, x, y) === "z") return true; return false; };
  const platKey = () => oldKey ? (lv.plats.length && lv.plats.some(pl => Math.abs(pl.x - p.x) < 80 && Math.abs(pl.y - p.y) < 80) ? (lv.t >> 4) & 15 : 0) + "" : (lv.plats.some(pl => Math.abs(pl.x - p.x) < 200 && Math.abs(pl.y - p.y) < 200) ? ((lv.t >> 4) & 15) + "" : "") + lv.plats.filter(pl => Math.abs(pl.x - p.x) < 64 && pl.y - p.y < 128 && p.y - pl.y < 48).map(pl => ";" + (pl.x >> 3) + ":" + (pl.y >> 3) + ":" + pl.dir[0] + pl.dir[1]).join("") + (lv.hasPulse && nearPulse() ? "|" + Math.floor(lv.t % PULSE.period / MACRO) : "");
  const keyOf = () => [p.x >> (fine ? 1 : 2), p.y >> (fine ? 2 : 3), Math.round(p.vy / 1.5), Math.sign(Math.round(p.vx * 2)), +p.onGround, +p.pogo, +p.climbing, 
    p.riding ? lv.plats.indexOf(p.riding) : -1, platKey(), sigOf(events)].join(",");
  /* best first: toward the nearest goal (an exit, an edge, someone to
     rescue, an objective still wanted), a little weight on steps taken */
  const goals = [];
  for (const k of Object.keys(lv.exitAt)) { const [x, y] = k.split(",").map(Number); goals.push([x * T + 8, y * T + 8]); }
  for (const k of lv.edge) { const [x, y] = k.split(",").map(Number); goals.push([x * T + 8, y * T + 8]); }
  for (const k of lv.secretAt) { const [x, y] = k.split(",").map(Number); goals.push([x * T + 8, y * T + 8]); }
  for (const n of lv.npcs) goals.push([n.x + 7, n.y + 8]);
  for (const it of objs) if (!(avoid && (it.kind === "part" || it.kind === "heart"))) goals.push([it.x + 8, it.y + 8]);
  /* items mode: the level's parts or heartstones are the goal, each one */
  const wanted = items ? objs.filter(it => it.kind === "part" || it.kind === "heart") : [];
  if (items) { goals.length = 0; for (const it of wanted) goals.push([it.x + 8, it.y + 8]); }
  /* the guide: distance in tiles through open space (doors, one-way walls
     and warp doors open), from each goal, flooded once; a maze is walked
     round, not through */
  const W_ = lv.w, H_ = lv.h, open = (x, y) => { const c = orig.tiles[y] && orig.tiles[y][x]; return c !== undefined && !(isSolid(c) && DOOR_CH[c] === undefined && SOCKET_DOOR[c] === undefined) && c !== "^"; };
  const flood = pts => {
    const d = new Int32Array(W_ * H_).fill(-1), q = [];
    for (const [px_, py_] of pts) { const x = Math.floor(px_ / T), y = Math.floor(py_ / T); if (x >= 0 && y >= 0 && x < W_ && y < H_ && d[y * W_ + x] < 0) { d[y * W_ + x] = 0; q.push(x, y); } }
    const warps = {}; for (const [k, [tx, ty]] of Object.entries(lv.warp)) { const [x, y] = k.split(",").map(Number); (warps[tx + "," + ty] = warps[tx + "," + ty] || []).push([x, y]); }  /* one way: from where a door lands back to the door */
    for (let i = 0; i < q.length; i += 2) {
      const x = q[i], y = q[i + 1], dv = d[y * W_ + x];
      const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1], ...(warps[x + "," + y] || [])];
      for (const [nx, ny] of nb) { if (nx < 0 || ny < 0 || nx >= W_ || ny >= H_ || d[ny * W_ + nx] >= 0 || !open(nx, ny) || (roomy && !open(nx, ny - 1))) continue;   /* room for him: the tile and the one above */ d[ny * W_ + nx] = dv + 1; q.push(nx, ny); }
    }
    return d;
  };
  /* the gravity-aware guide: a graph of the places Poom can stand, joined
     by walks, falls, jumps (pogo height), poles and warp doors, with dear
     steps through the air for what it can't see (platforms). Distances run
     backwards from the goals */
  const JUMP = lv.def.engine === "E1" ? 9 : 6, AIR = 6;
  const tc = (x, y) => orig.tiles[y] && orig.tiles[y][x];
  const floorC = c => c !== undefined && (isSolid(c) || c === "-" || c === "/" || c === "\\");
  let gOpen = open;
  const bodyOk = (x, y) => x >= 0 && y >= 1 && x < W_ && y < H_ && gOpen(x, y) && gOpen(x, y - 1);
  const standOk = (x, y) => bodyOk(x, y) && (floorC(tc(x, y + 1)) || tc(x, y) === "|");
  let gEdges = null;
  const buildGraph = openFn => {
    gOpen = openFn;
    const fr = [], tt = [], co = [], E = (a, b, c) => { fr.push(a); tt.push(b); co.push(c); };
    const id = (x, y) => y * W_ + x;
    for (let y = 1; y < H_; y++) for (let x = 0; x < W_; x++) {
      if (!bodyOk(x, y)) continue;
      const me = id(x, y);
      /* through the air: falling is cheap, the rest dear */
      if (bodyOk(x, y + 1)) E(me, id(x, y + 1), 1);
      for (const [nx, ny, c] of [[x + 1, y, 3], [x - 1, y, 3], [x, y - 1, AIR]]) if (bodyOk(nx, ny)) E(me, id(nx, ny), c);
      if (tc(x, y) === "|" || tc(x, y - 1) === "|") { if (bodyOk(x, y - 1)) E(me, id(x, y - 1), 1); }
      const wk = lv.warp[x + "," + y] || lv.warp[x + "," + (y - 1)];
      if (wk) { for (let k = 0; k < 4; k++) if (standOk(wk[0], wk[1] + k)) { E(me, id(wk[0], wk[1] + k), 2); break; } }
      if (!standOk(x, y)) continue;
      for (const d of [-1, 1]) if (bodyOk(x + d, y)) E(me, id(x + d, y), 1);
      /* up and across */
      for (let dy = 1; dy <= JUMP; dy++) {
        if (!bodyOk(x, y - dy)) break;
        for (let dx = -5; dx <= 5; dx++) {
          const nx = x + dx, ny = y - dy;
          if (!standOk(nx, ny)) continue;
          let ok = true; for (let i = Math.min(0, dx); i <= Math.max(0, dx) && ok; i++) ok = bodyOk(x + i, ny);
          if (ok) E(me, id(nx, ny), dy + Math.abs(dx) + 1);
        }
      }
      /* across gaps, landing level or lower */
      for (let dx = -6; dx <= 6; dx++) {
        if (Math.abs(dx) < 2) continue;
        let ok = true; for (let i = Math.min(0, dx); i <= Math.max(0, dx) && ok; i++) ok = bodyOk(x + i, y - 1) && bodyOk(x + i, y);
        if (!ok) continue;
        for (let k = 0; k <= 8; k++) if (standOk(x + dx, y + k)) { E(me, id(x + dx, y + k), Math.abs(dx) + k + 1); break; } else if (!bodyOk(x + dx, y + k)) break;
      }
    }
    /* reversed, by target */
    const n = W_ * H_, cnt = new Int32Array(n + 1);
    for (const b of tt) cnt[b + 1]++;
    for (let i = 0; i < n; i++) cnt[i + 1] += cnt[i];
    const src = new Int32Array(fr.length), cost = new Float32Array(fr.length), pos = cnt.slice();
    for (let e = 0; e < fr.length; e++) { const k = pos[tt[e]]++; src[k] = fr[e]; cost[k] = co[e]; }
    gOpen = open;
    return { start: cnt, src, cost };
  };
  /* locked doors are shut in the guide until their keycard is held, so it
     sends him for the card first: one graph for each set of cards */
  const graphs = new Map();
  const maskOf = () => { const held = new Set(orig.keys.map((k, i) => k ? i : -1).filter(i => i >= 0)); const filled = new Set();
    for (const e of events) { if (e[0] === "g") held.add(gems[+e.slice(1)].gem); if (e[0] === "s") filled.add(lv.sockets[+e.slice(1)].gem); }
    return [...held].sort().join("") + "|" + [...filled].sort().join(""); };
  const graphFor = m => {
    let g = graphs.get(m); if (g) return g;
    const [hs, fs] = m.split("|"), held = new Set([...hs].map(Number)), filled = new Set([...fs].map(Number));
    const openK = (x, y) => { const c = orig.tiles[y] && orig.tiles[y][x]; if (c === undefined || c === "^") return false;
      if (DOOR_CH[c] !== undefined) return DOOR_CH[c] === 4 ? held.size > 0 : held.has(DOOR_CH[c]);
      if (SOCKET_DOOR[c] !== undefined) return held.has(SOCKET_DOOR[c]) || filled.has(SOCKET_DOOR[c]);
      return !isSolid(c); };
    g = buildGraph(openK); graphs.set(m, g); return g;
  };
  const gflood = (pts, edges) => {
    const { start, src, cost } = edges, d = new Float32Array(W_ * H_).fill(-1), hp = [];
    const hpush = (v, c) => { hp.push([c, v]); let i = hp.length - 1; while (i) { const j = (i - 1) >> 1; if (hp[j][0] <= hp[i][0]) break; [hp[i], hp[j]] = [hp[j], hp[i]]; i = j; } };
    const hpop = () => { const t = hp[0], l = hp.pop(); if (hp.length) { hp[0] = l; let i = 0; for (;;) { const a = 2 * i + 1, b = a + 1; let m = i; if (a < hp.length && hp[a][0] < hp[m][0]) m = a; if (b < hp.length && hp[b][0] < hp[m][0]) m = b; if (m === i) break; [hp[i], hp[m]] = [hp[m], hp[i]]; i = m; } } return t; };
    const best = new Float32Array(W_ * H_).fill(1e9);
    for (const [px_, py_] of pts) { const x = Math.floor(px_ / T), y = Math.floor(py_ / T); for (const [ox, oy] of [[0, 0], [0, 1], [-1, 0], [1, 0], [0, -1], [-1, 1], [1, 1]]) { const xx = x + ox, yy = y + oy; if (xx >= 0 && yy >= 0 && xx < W_ && yy < H_) { best[yy * W_ + xx] = 0; hpush(yy * W_ + xx, 0); } } }
    while (hp.length) {
      const [c, v] = hpop(); if (d[v] >= 0) continue; d[v] = c;
      for (let e = start[v]; e < start[v + 1]; e++) { const u = src[e], nc = c + cost[e]; if (d[u] < 0 && nc < best[u]) { best[u] = nc; hpush(u, nc); } }
    }
    return d;
  };
  if (to || guide) { const g = to || guide; goals.length = 0; goals.push([g[0] * T + 8, g[1] * T + 8]); }
  const useG = graph && !lv.swim;
  const goalDist = useG ? null : flood(goals), gemDist = useG ? null : gems.map(it => flood([[it.x + 8, it.y + 8]]));
  const gCache = new Map();
  const gFor = () => { const m = maskOf(); let c = gCache.get(m); if (!c) { const e = graphFor(m);
    c = { goal: gflood(goals, e), gems: gems.map(it => gflood([[it.x + 8, it.y + 8]], e)), br: lv.bridges.map(b => gflood([[b.x * T + 8, b.y * T + 8]], e)) }; gCache.set(m, c); } return c; };
  /* bridge switches not yet thrown pull too: a gap may need its bridge */
  const brDist = useG ? null : lv.bridges.map(b => flood([[b.x * T + 8, b.y * T + 8]]));
  /* switches can share a deck (E13 has one each side of its gap): what
     counts is how many times that deck has been flipped */
  lv.bridges.forEach(b => { b.deckKey = JSON.stringify(b.deck); });
  const flips = b => lv.bridges.reduce((n, o, j) => n + (o.deckKey === b.deckKey && events.has("b" + j) ? 1 : 0), 0);
  const distAt = (d, x, y) => { const tx = Math.floor(x / T), ty = Math.floor(y / T); for (const [ox, oy] of [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]]) { const v = d[(ty + oy) * W_ + tx + ox]; if (v >= 0) return v; } return 9999; };
  const distAt0 = distAt;
  const distAtG = (d, x, y) => { const tx = Math.floor(x / T), fy = Math.floor((y + 10) / T); for (const ox of [0, -1, 1]) for (let k = 0; k <= 8; k++) { const yy = fy + k; if (yy >= H_) break; const v = d[yy * W_ + tx + ox]; if (v >= 0) return v; } return distAt0(d, x, y); };
  /* keycards not yet held pull too: a locked way out needs them first */
  const dA = useG ? distAtG : distAt;
  const h = () => { const cx = p.x + p.w / 2, cy = p.y + p.h / 2; const G_ = useG ? gFor() : { goal: goalDist, gems: gemDist, br: brDist }; let d = dA(G_.goal, cx, cy) * 16;
    gems.forEach((it, i) => { if (!events.has("g" + i)) d = Math.min(d, 200 + dA(G_.gems[i], cx, cy) * 16); });
    lv.bridges.forEach((b, i) => { if (!(flips(b) & 1)) d = Math.min(d, 300 + dA(G_.br[i], cx, cy) * 16); });
    return d - [...events].filter(e => e[0] === "g").length * 400 - new Set(lv.bridges.filter(b => flips(b) & 1).map(b => b.deckKey)).size * 400; };
  const heap = [], push = (f, v) => { heap.push([f, v]); let i = heap.length - 1; while (i) { const j = (i - 1) >> 1; if (heap[j][0] <= heap[i][0]) break; [heap[i], heap[j]] = [heap[j], heap[i]]; i = j; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; } } return top[1]; };
  if (from) { p.x = from[0] * T + 2; p.y = from[1] * T + T - p.h - 0.01; p.vx = p.vy = 0; }
  let maxEv = events.size;
  const seenK = new Set([keyOf()]);
  const first = snap(); first.g = 0;
  push(h(), first);
  let head = 0, states = 0, result = null, reachedObjs = new Set(), bestH = 1e9, bestAt = null; const everEv = new Set(), visited = new Set();
  const t0 = performance.now();
  while (heap.length && !result) {
    const s = pop(); head++;
    for (const act of lv.swim ? SWIM_ACTIONS : ACTIONS) {
      restore(s);
      touched = new Set();
      G.lv = lv; G.mode = "level";
      for (let f = 0; f < MACRO; f++) {
        held.clear(); pressed.clear();
        for (const a of act) { held.add(a); if (f === 0) pressed.add(a); }
        lv.t++; updatePlats(lv); updatePlayer(lv);
        if (p.state !== "play" || trap || G.lv !== lv) break;
      }
      held.clear(); pressed.clear();
      /* the world changed under this step: the cached copy it started from
         is spoiled; what's in hand now is the new one */
      const nsig = sigOf(events);
      if (nsig !== s.sig) {
        cache.delete(s.sig);
        cache.set(nsig, { tiles: lv.tiles, keys: lv.keys, pmark: lv.pmark, bridges: lv.bridges.map(b => b.on), sockets: lv.sockets.map(x => x.filled), pswitch: Object.values(lv.pswitchAt).map(x => x.on) });
      }
      for (const i of touched) reachedObjs.add(i);
      objs.forEach((it, i) => { if (!reachedObjs.has(i) && canShoot(it)) reachedObjs.add(i); });
      if (trap) { trap = false; continue; }
      if (items) {
        if (wanted.every(it => reachedObjs.has(objs.indexOf(it)))) { result = { how: "items " + wanted.length, states, ms: Math.round(performance.now() - t0) }; break; }
        if (p.state !== "play" || G.lv !== lv) { G.lv = lv; G.mode = "level"; continue; }
        const k2 = keyOf(); if (seenK.has(k2)) continue; seenK.add(k2); const n2 = snap(); n2.g = s.g + 1;
        /* toward the nearest one not yet reached */
        goals.length = 0; for (const it of wanted) if (!reachedObjs.has(objs.indexOf(it))) goals.push([it.x + 8, it.y + 8]);
        push(h() + n2.g * W8, n2); states++; continue;
      }
      if (to && p.state === "play" && Math.abs(Math.floor((p.x + p.w / 2) / T) - to[0]) <= 1 && Math.abs(Math.floor((p.y + p.h / 2) / T) - to[1]) <= 1) { result = { how: "reached " + to, states, ms: Math.round(performance.now() - t0), events: [...events].join(" ") }; break; }
      if (p.state === "exit") { result = { how: lv.exitUsed && lv.exitUsed.kind ? "rescue" : typeof lv.exitUsed === "string" ? lv.exitUsed : lv.exitUsed && lv.exitUsed.tx0 !== undefined ? "door" : "other", states, ms: Math.round(performance.now() - t0) }; break; }
      if (p.state !== "play" || G.lv !== lv) { G.lv = lv; G.mode = "level"; continue; }
      /* every objective the level needs, reached (touched or shot) */
      if (ends.length && !result) {
        const need = fedCore ? feeders : ends.length > 1 ? ends : [];
        if (need.length && need.every(it => reachedObjs.has(objs.indexOf(it)))) { result = { how: fedCore ? "cores" : "objectives", states, ms: Math.round(performance.now() - t0) }; break; }
        if (!fedCore && ends.length === 1 && reachedObjs.has(objs.indexOf(ends[0]))) { result = { how: "objective (shot)", states, ms: Math.round(performance.now() - t0) }; break; }
      }
      if (window.__hook) window.__hook(p, act, s);
      if (p.riding) (window.__dbg.rides = window.__dbg.rides || new Set()).add(Math.round(p.x / T) + "," + Math.round(p.y / T) + "@" + lv.plats.indexOf(p.riding));
      if (trace) visited.add(Math.floor((p.x + p.w / 2) / T) + "," + Math.floor((p.y + p.h / 2) / T));
      const k = keyOf();
      if (seenK.has(k)) continue;
      seenK.add(k); const ns = snap(); ns.g = s.g + 1; const hh = h(); if (hh < bestH) { bestH = hh; bestAt = [Math.round(p.x / T), Math.round(p.y / T)]; } for (const e of events) everEv.add(e); push(hh + ns.g * W8, ns);
      /* commit: the first step that gains a keycard, socket, door or switch
         becomes the new start; everything else is dropped */
      if (commit && events.size > maxEv) { maxEv = events.size; heap.length = 0; seenK.clear(); seenK.add(k); push(hh + ns.g * W8, ns); break; } states++;
    }
    if (states > maxStates || performance.now() - t0 > maxMs) break;
    if ((head & 1023) === 0) { G.mode = "solving"; await new Promise(r => setTimeout(r, 0)); G.mode = "level"; G.lv = lv; }
  }
  /* put the game back */
  for (const k of keep) window[k] = sw[k];
  audio.play = playOrig;
  held.clear(); pressed.clear();
  const map = trace ? orig.tiles.map((r, y) => r.map((c, x) => visited.has(x + "," + y) ? (c === "." ? "o" : "O") : c).join("")).join("\n") : undefined;
  return result ? { id, ok: true, ...result, map } : { id, ok: false, states, ms: Math.round(performance.now() - t0), objs: `${reachedObjs.size}/${objs.length}`, events: [...everEv].join(" "), bestAt, map, gave: heap.length ? "budget" : "exhausted" };
}
window.solve = solve;
/* solve a list in the background: window.solved fills as it goes */
export function solveAll(ids, opts) {
  window.solved = []; window.solving = true;
  (async () => { for (const id of ids) { try { window.solved.push(await solve(id, opts));
    const def = MAPS[id], needs = def.rows.some(r => r.includes("!")) && (BOOK_GOAL[def.book] === "hearts" || WORLDS[def.book].ship);
    if (needs) window.solved.push({ ...(await solve(id, { ...opts, items: true })), id: id + " (items)" }); } catch (e) { window.solved.push({ id, err: e.message + " " + (e.stack || "").split("\n")[1] }); } } window.solving = false; G.mode = "map"; })();
}
window.solveAll = solveAll;

/* when the plain search runs out of time: again, steered toward each warp
 * door, switch, socket and keycard in turn (a real finish still needed),
 * and once on the finer grid */
export async function solveHard(id, opts = {}) {
  const c = await solve(id, { ...opts, maxMs: opts.commitMs || 20000, commit: true });
  if (c.ok) return { ...c, how: c.how + " (commit)" };
  const first = await solve(id, opts);
  if (first.ok) return first;
  const d = MAPS[id], pts = [], add = (x, y, why) => { if (!pts.some(q => Math.abs(q[0] - x) <= 1 && Math.abs(q[1] - y) <= 1)) pts.push([x, y, why]); };
  for (const [x, y, , , kind] of d.links || []) add(x, y, kind);
  for (const b of d.bridges || []) add(b.x, b.y, "bridge");
  for (const s of d.pswitches || []) add(s.x, s.y, "pswitch");
  for (const s of d.sockets || []) add(s.x, s.y, "socket");
  d.rows.forEach((r, y) => [...r].forEach((c, x) => { if ("rygbq".includes(c)) add(x, y, "key"); }));
  const each = opts.eachMs || 15000, tries = [];
  if (opts.maxPts && pts.length > opts.maxPts) pts.splice(opts.maxPts);
  for (const [x, y, why] of pts) {
    const r = await solve(id, { ...opts, maxMs: each, guide: [x, y], commit: true });
    tries.push(why + "@" + x + "," + y + ":" + (r.ok ? "ok" : r.gave));
    if (r.ok) return { ...r, how: r.how + " (steered to " + why + " " + x + "," + y + ")", tries };
  }
  const f = await solve(id, { ...opts, fine: true });
  if (f.ok) return { ...f, how: f.how + " (fine)", tries };
  return { ...first, tries };
}
export function solveAllHard(ids, opts) {
  window.solved = []; window.solving = true;
  (async () => { for (const id of ids) { try { window.solved.push(await solveHard(id, opts)); } catch (e) { window.solved.push({ id, err: e.message }); } } window.solving = false; })();
}
window.solveHard = solveHard; window.solveAllHard = solveAllHard;
