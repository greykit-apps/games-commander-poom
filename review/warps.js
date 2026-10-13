/* review/warps.js: every warp door's target, checked for room. The engine
 * (warpTo) puts Poom's feet at the bottom of the target tile and nudges him
 * up to three tiles if that is inside rock. Reports targets that are still
 * inside rock after that, and targets with no floor under them within four
 * tiles (Poom arrives falling). Run: node review/warps.js */
const BOOKS = require("./lib/books.js");
const SOLID = new Set(["#", "=", "1", "2", "3", "4", "5", "6", "7", "8", "d", "i", "<", ">"]);
const T = 16;
let bad = 0, total = 0;
for (const b of ["H", "C", "D", "E"]) for (const lv of BOOKS[b].chapters.flatMap(c => c.levels)) {
  const rows = lv.rows, at = (x, y) => (x < 0 || x >= lv.w) ? "#" : (y < 0 || y >= lv.h) ? "." : rows[y][x];
  const clear = (px, py, w, h) => { for (let ty = Math.floor(py / T); ty <= Math.floor((py + h - 1) / T); ty++) for (let tx = Math.floor(px / T); tx <= Math.floor((px + w - 1) / T); tx++) if (SOLID.has(at(tx, ty))) return false; return true; };
  for (const [x, y, tx, ty, kind] of lv.links || []) {
    if (kind !== "door" || rows[y][x] !== "D") continue;
    total++;
    let px = tx * T + 2, py = (ty + 1) * T - 22, up = 0;
    for (; up < 3 && !clear(px, py, 12, 22); up++) py -= T;
    const stuck = !clear(px, py, 12, 22);
    let floor = null; for (let k = 0; k < 6; k++) { const c = at(tx, Math.floor((py + 22) / T) + k); if (SOLID.has(c) || c === "-" || c === "/" || c === "\\") { floor = k; break; } }
    const hazardBelow = (() => { for (let k = 0; k < 6; k++) { const c = at(tx, Math.floor((py + 22) / T) + k); if (c === "^" || c === "~") return k; if (SOLID.has(c) || c === "-") return null; } return null; })();
    if (stuck || floor === null || hazardBelow !== null || up > 0) { bad++; console.log(`${lv.id} door (${x},${y}) -> (${tx},${ty}): ${stuck ? "STUCK IN ROCK" : ""}${up ? ` nudged up ${up}` : ""}${floor === null ? " NO FLOOR within 6 tiles" : floor > 1 ? ` floor ${floor} tiles down` : ""}${hazardBelow !== null ? ` HAZARD ${hazardBelow} tiles down` : ""} target tile='${at(tx, ty)}'`); }
  }
}
console.log(`${total} warp doors checked, ${bad} worth a look`);
