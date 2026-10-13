/* review/economy.js: what each level and Book hands out, read from the map
 * data (js/books/*.js) with the engine's own values (POINTS, ENEMY hp and
 * points, ENEMY_OF). Run: node review/economy.js [H|C|D|E ...]
 *
 * Reports per level: points on the floor, raygun charges, extra lives,
 * killable creatures (and the shots to kill them all), unkillable ones,
 * turrets; per Book: totals, the 1UP thresholds a full clear crosses,
 * and ammo in vs ammo needed. Levels are listed in map order; the player
 * may take them in another order. */
const BOOKS = require("./lib/books.js");
const POINTS = { f: 100, m: 200, n: 500, c: 1000, u: 2000, t: 5000 };
const ENEMY = { x: { hp: 1, pts: 0 }, B: { hp: 1, pts: 200 }, V: { hp: 4, pts: 500 }, T: { hp: Infinity, pts: 0 }, K: { hp: Infinity, pts: 0 }, L: { hp: 5, pts: 1000 }, G: { hp: Infinity, pts: 0 } };
/* copied from game.js ENEMY_OF (Books 1-4) */
const ENEMY_OF = {
  H: { "01": "x", "02": "B", "03": "L", "04": "V", "05": "T" },
  C: { "01": "x", "02": "V", "05": "B", "04": "T", "03": "K" },
  D: { "04": { kind: "B" }, "02": { kind: "V" }, "01": { kind: "x" }, "06": { kind: "T" }, "09": { kind: "T" }, "05": { kind: "K" }, "03": { kind: "B" },
    "08": { kind: "L", points: 1000 }, "07": { kind: "B", hp: 3, points: 500 }, "10": { kind: "K" }, "11": { kind: "x" } },
  E: { "01": { kind: "x" }, "02": { kind: "V" }, "03": { kind: "x" }, "04": { kind: "B" }, "05": { kind: "B", hp: 2, points: 500 }, "06": { kind: "T" }, "07": { kind: "K" },
    "08": { kind: "B", hp: 2, points: 500 }, "09": { kind: "L", points: 1000 }, "10": { kind: "L", hp: 8, points: 2000 }, "11": { kind: "B", hp: 2 }, "12": { kind: "V", hp: 6, points: 1000 },
    "13": { kind: "T" }, "14": { kind: "V", hp: Infinity }, "15": { kind: "V", hp: Infinity }, "16": { kind: "x" }, "17": { kind: "V", hp: Infinity } },
};
const spec = (b, n) => { const s = ENEMY_OF[b][n]; if (!s) return null; const k = typeof s === "string" ? s : s.kind; return { kind: k, hp: (s.hp !== undefined ? s.hp : ENEMY[k].hp), pts: (s.points !== undefined ? s.points : ENEMY[k].pts) }; };
const BIG = { H: 1000 * 4, C: 5000 * 8, D: 1000 * 7, E: 1000 };   /* objectives: parts, hearts, cores, the swim suit */
const books = process.argv.slice(2).length ? process.argv.slice(2) : ["H", "C", "D", "E"];
const lifeAt = score => { let n = 0, next = 20000; while (score >= next) { next *= 2; n++; } return n; };
for (const b of books) {
  const levels = BOOKS[b].chapters.flatMap(c => c.levels);
  console.log(`\nBook ${b}: ${levels.length} levels`);
  console.log("level   points  ammo  lives  deadly-killable(hp)  harmless  unkillable-deadly  turrets  points-from-kills");
  let tot = { pts: 0, ammo: 0, lives: 0, kill: 0, hp: 0, unk: 0, tur: 0, kpts: 0, harm: 0 };
  for (const lv of levels) {
    const s = lv.rows.join(""), cnt = ch => s.split(ch).length - 1;
    let pts = 0; for (const [ch, v] of Object.entries(POINTS)) pts += cnt(ch) * v;
    const ammo = cnt("a") * 5, lives = cnt("L");
    let kill = 0, hp = 0, unk = 0, tur = 0, kpts = 0, harm = 0;
    /* harmless: pushers (x) and shovers (T) only push; deadly: B, V, L kill on touch, K shoots */
    for (const [, , g, name] of lv.things || []) {
      if (g === "G") { tur++; continue; }
      if (g !== "e") continue;
      const sp = spec(b, (/enemy type (\d+)/.exec(name) || [])[1]); if (!sp) continue;
      if (sp.kind === "x" || sp.kind === "T") { harm++; continue; }
      if (sp.hp === Infinity) unk++; else { kill++; hp += sp.hp; kpts += sp.pts; }
    }
    console.log(`${lv.id.padEnd(7)} ${String(pts).padStart(6)}  ${String(ammo).padStart(4)}  ${String(lives).padStart(5)}  ${String(kill).padStart(3)} (${String(hp).padStart(3)})          ${String(harm).padStart(5)}     ${String(unk).padStart(8)}          ${String(tur).padStart(3)}     ${String(kpts).padStart(8)}`);
    tot.pts += pts; tot.ammo += ammo; tot.lives += lives; tot.kill += kill; tot.hp += hp; tot.unk += unk; tot.tur += tur; tot.kpts += kpts; tot.harm += harm;
  }
  const big = BIG[b] || 0;
  console.log(`TOTAL   ${String(tot.pts).padStart(6)}  ${String(tot.ammo).padStart(4)}  ${String(tot.lives).padStart(5)}  ${String(tot.kill).padStart(3)} (${String(tot.hp).padStart(3)})          ${String(tot.harm).padStart(5)}     ${String(tot.unk).padStart(8)}          ${String(tot.tur).padStart(3)}     ${String(tot.kpts).padStart(8)}`);
  console.log(`  objectives worth ${big}; a full clear (floor + kills + objectives) scores ${tot.pts + tot.kpts + big}, crossing ${lifeAt(tot.pts + tot.kpts + big)} 1UP thresholds (20k, 40k, 80k...); plus ${tot.lives} plush lives`);
  console.log(`  ammo on the floor: ${tot.ammo} shots; shots to kill every deadly killable creature once: ${tot.hp} (${(tot.ammo / Math.max(1, tot.hp) * 100).toFixed(0)}% cover)`);
}
