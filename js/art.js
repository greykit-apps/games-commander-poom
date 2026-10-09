/* Commander Poom -- art.
 *
 * Everything is drawn here, at load, into small canvases: no image files.
 * Sprites are text grids in the 16-colour EGA palette, one hex digit per
 * pixel and "." for clear; most get a one-pixel black outline added
 * automatically, so a grid paints only the colour masses. Tiles are painted
 * by code, per level theme. */
"use strict";

const EGA = ["#000000", "#0000aa", "#00aa00", "#00aaaa", "#aa0000", "#aa00aa", "#aa5500", "#aaaaaa",
  "#555555", "#5555ff", "#55ff55", "#55ffff", "#ff5555", "#ff55ff", "#ffff55", "#ffffff",
  /* past the sixteen, VGA-style, for Poom: EGA has no tawny. g tawny, h its
   * shade, i cream (muzzle, inner ears), k the dark tip of the tail */
  "#dba363", "#a8743c", "#f6e3bd", "#3a2412",
  /* the ranger look (Book 1): l m n a duster, dark to light; o p q a combat
   * helmet, dark to light; r s the goggles' red and their glow; t the tan
   * strap; u boots */
  "#2e2016", "#4e3826", "#70533a", "#26272a", "#43464a", "#6c7076", "#c8261c", "#ff8a6a", "#b88a54", "#1c130c"];
/* grid letters for the extra colours, indexed from 16 */
const EXTRA = "ghiklmnopqrstu";

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

/* A grid into a canvas. Rows are padded to the widest; outline adds a
 * black pixel beside every painted one that has a clear neighbour. */
function sprite(rows, { outline = true, swap = null, pal = null } = {}) {
  const w = Math.max(...rows.map(r => r.length)), h = rows.length, pad = outline ? 1 : 0;
  const W = w + pad * 2, H = h + pad * 2;
  const grid = Array.from({ length: H }, () => new Array(W).fill(-1));
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch === "." || ch === " ") return;
    /* a sprite's own palette first (full colour), then EGA and the extras */
    if (pal && pal[ch]) { grid[y + pad][x + pad] = pal[ch]; return; }
    let v = EXTRA.includes(ch) ? 16 + EXTRA.indexOf(ch) : parseInt(ch, 16);
    if (Number.isNaN(v)) return;
    if (swap && swap[v] !== undefined) v = swap[v];   /* an index, or any CSS colour */
    grid[y + pad][x + pad] = v;
  }));
  if (outline) {
    const src = grid.map(r => r.slice());
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (src[y][x] !== -1) continue;
      const n = (yy, xx) => yy >= 0 && yy < H && xx >= 0 && xx < W && src[yy][xx] !== -1 && src[yy][xx] !== 0;
      if (n(y - 1, x) || n(y + 1, x) || n(y, x - 1) || n(y, x + 1)) grid[y][x] = 0;
    }
  }
  const c = makeCanvas(W, H), g = c.getContext("2d");
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (grid[y][x] === -1) continue;
    g.fillStyle = typeof grid[y][x] === "string" ? grid[y][x] : EGA[grid[y][x]];
    g.fillRect(x, y, 1, 1);
  }
  return c;
}

function flipped(c) {
  const f = makeCanvas(c.width, c.height), g = f.getContext("2d");
  g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0);
  return f;
}

/* ------------------------------------------------------------------ */
/* Poom: a puma cub in a red football helmet. 14 wide; 16x24 outlined.  */
/* Head is shared; bodies vary. Faces right; left is the mirror.        */

const P_HEAD = [
  "..g.....g.....",
  ".gig...gig....",
  ".CCCCCCCCCC...",
  "CCCCCFCCCCCC..",
  "CCCCCFCCCCCCC.",
  "44444F4444444.",
  ".ggggFFgFFgg..",
  ".ggggF0gF0iii.",
  ".ggggggggiiiD.",
  "..ggggggiii0..",
];
const P_HEAD_BACK = [
  "..g.....g.....",
  ".ggg...ggg....",
  ".CCCCCCCCCC...",
  "CCCCCFCCCCCC..",
  "CCCCCFCCCCCC..",
  "CCCCCFCCCCCC..",
  "44444F444444..",
  ".gggggggggg...",
  ".gggggggggg...",
  "..gggggggg....",
];
const P_HEAD_DIZZY = [
  "..g.....g.....",
  ".gig...gig....",
  ".CCCCCCCCCC...",
  "CCCCCFCCCCCC..",
  "CCCCCFCCCCCCC.",
  "44444F4444444.",
  ".gggFgFgFgFg..",
  ".ggggFgggFgii.",
  ".gggFgFgFgFiiD",
  "..ggggggi000..",
];

const P_BODY = {
  stand: [
    "...hhhhhh.....",
    "..99999999....",
    ".9999999999...",
    ".9999999999g..",
    "..99999999....",
    "..99999999....",
    "...5555555....",
    "...5555555....",
    "...555.555....",
    "...555.555....",
    "..FFFF.FFFF...",
    "..CCCC.CCCC...",
  ],
  walk0: [
    "...hhhhhh.....",
    "..99999999....",
    ".9999999999...",
    ".9999999999g..",
    "..99999999....",
    "...9999999....",
    "...5555555....",
    "...55555555...",
    "..555...555...",
    ".555.....555..",
    "FFFF.....FFFF.",
    "CCC.......CCCC",
  ],
  walk1: [
    "...hhhhhh.....",
    "..99999999....",
    ".99999999999..",
    ".9999999999...",
    "..99999999....",
    "..99999999....",
    "...5555555....",
    "...5555555....",
    "....5555......",
    "....5555......",
    "...FFFFF......",
    "...CCCCC......",
  ],
  walk2: [
    "...hhhhhh.....",
    "..99999999....",
    ".9999999999...",
    ".9999999999...",
    "..99999999....",
    "...9999999....",
    "...5555555....",
    "...55555555...",
    "..555...555...",
    ".555.....555..",
    "FFFF.....FFFF.",
    "CCC.......CCCC",
  ],
  jump: [
    "...hhhhhh..h..",
    "..999999999...",
    ".9999999999...",
    ".99999999.....",
    ".99999999.....",
    "..99999999....",
    "...5555555....",
    "...55555555...",
    "...555..5555..",
    "..FFFF...FFFF.",
    "..CCCC...CCCC.",
    "..............",
  ],
  fall: [
    "...hhhhhh..h..",
    ".9999999999...",
    "99999999999...",
    "..99999999....",
    "..99999999....",
    "...9999999....",
    "...5555555....",
    "...5555555....",
    "..555...555...",
    "..555...555...",
    ".FFFF...FFFF..",
    ".CCCC...CCCC..",
  ],
  shoot: [
    "...hhhhhh.....",
    "..99999999....",
    ".999999999gg7 ",
    ".9999999987777",
    "..99999998....",
    "..99999999....",
    "...5555555....",
    "...5555555....",
    "...555.555....",
    "...555.555....",
    "..FFFF.FFFF...",
    "..CCCC.CCCC...",
  ],
  shootAir: [
    "...hhhhhh.....",
    "..99999999....",
    ".999999999gg7 ",
    ".9999999987777",
    ".99999999.....",
    "..99999999....",
    "...5555555....",
    "...55555555...",
    "...555..5555..",
    "..FFFF...FFFF.",
    "..CCCC...CCCC.",
    "..............",
  ],
  /* on the pogo: knees bent, paws on the handlebar */
  pogo: [
    "...hhhhhh.....",
    "..99999999....",
    ".999999999gg..",
    ".9999999997...",
    "..99999999....",
    "..99999999....",
    "...5555555....",
    "...55555555...",
    "...555..555...",
    "..FFFF.FFFF...",
    "..CCCC.CCCC...",
    "..............",
  ],
  climb0: [
    ".h.hhhhhh.h...",
    ".99999999999..",
    "..99999999....",
    "..99999999....",
    "..99999999....",
    "..99999999....",
    "..55555555....",
    "..55555555....",
    "..555..555....",
    "..555...555...",
    ".CCCC...CCCC..",
    "..............",
  ],
  climb1: [
    "...hhhhhhh....",
    "..999999999...",
    ".g99999999g...",
    "..99999999....",
    "..99999999....",
    "..99999999....",
    "..55555555....",
    "..55555555....",
    "...555.555....",
    "..555..555....",
    ".CCCC..CCCC...",
    "..............",
  ],
  back: [
    "...hhhhhhh....",
    "..999999999...",
    ".99999999999..",
    ".99999999999..",
    ".g999999999...",
    "..999999999...",
    "..555555555...",
    "..555555555...",
    "..5555.5555...",
    "..555...555...",
    "..CCC...CCC...",
    "..............",
  ],
  dead: [
    "h..hhhhhh..h..",
    "g9999999999g..",
    ".9999999999...",
    "..99999999....",
    "..99999999....",
    "g.99999999....",
    "gg.5555555....",
    ".g.5555555....",
    "..555...555...",
    ".555.....555..",
    "CCC.......CCC.",
    "..............",
  ],
};

/* A cougar's tail: long, thick, dark-tipped. Laid over the body frames
 * (which are padded four columns either side to make room), on the body's
 * rows, in the padded frame's columns; it only fills clear pixels. */
const TAIL_SIDE = [
  "kk......",
  "kgg.....",
  "gggh....",
  "gggh....",
  ".gggh...",
  "..ggggh.",
  "...ggggg",
  "....hgg.",
];
/* the same tail mid-stride, swung low */
const TAIL_SWING = [
  "........",
  "kk......",
  "kggh....",
  "gggh....",
  "ggggh...",
  ".gggggh.",
  "..gggggg",
  "....hgg.",
];
/* seen from behind, on a pole or at a door: hanging off to one side */
const TAIL_BACK = [
  "",
  "",
  "",
  "",
  "",
  "",
  "..............gg",
  "..............ggg",
  "...............ggg",
  "...............ggh",
  "...............kkk",
  "..............kkk",
];

/* Poom's looks, one per book (game.js picks). Each recolours the same
 * grids, so every pose and frame lines up: the head's helmet (C, its
 * stripe F, its rim 4) and eyes (F, pupils 0); the body's jersey 9,
 * shorts 5, socks F, shoes C. Classic is Poom as he was first drawn. */
const recolour = (rows, map) => rows.map(r => [...r].map(c => map[c] || c).join(""));
const LOOKS = {
  classic: { head: r => r, body: r => r, map: r => r },
  /* the ranger (Book 1, the wasteland): a combat helmet over a gas mask
     with red-glowing eyepieces (RANGER_HEAD); a long brown duster with a
     tan strap across it, flaring over the knees; slate trousers, boots. */
  ranger: {
    head: rows => rows === P_HEAD ? RANGER_HEAD : rows === P_HEAD_BACK ? RANGER_HEAD_BACK : RANGER_HEAD_OUT,
    body: rows => rows.map((r, y) => {
      if (y === 0) return r.replace(/h/g, "l");
      if (y <= 5) {
        const first = r.indexOf("9");
        return [...r].map((c, x) => c !== "9" ? c : x === first ? "l" : x === first + y ? "t" : "m").join("");
      }
      if (y <= 8) {
        /* the duster's skirt: mid brown, a dark hem, flaring a pixel past the legs */
        const cells = [...r], first = r.indexOf("5"), last = r.lastIndexOf("5");
        if (first < 0) return recolour([r], { F: "u", C: "u" })[0];
        const out = cells.map((c, x) => c !== "5" ? c : y === 8 || x === first ? "l" : "m");
        if (y >= 7) { if (first > 0 && out[first - 1] === ".") out[first - 1] = "l"; if (last + 1 < out.length && out[last + 1] === ".") out[last + 1] = "l"; }
        if (y === 8) for (let x = first; x <= last; x++) if (out[x] === ".") out[x] = "l";
        return out.join("");
      }
      return recolour([r], { 5: "p", F: "u", C: "u" })[0];
    }),
    map: rows => {
      const b = rows.findIndex(r => r.includes("9"));
      return rows.map((r, y) => {
        /* the head from above: helmet, and the mask over the face */
        if (y < b) return /[C4]/.test(r) ? recolour([r], { C: "p", F: "q", 4: "o" })[0] : y < 2 ? r : recolour([r.replace(/F0/g, "sr")], { F: "s", i: "p", D: "q", g: "o" })[0];
        if (r.includes("9")) { const first = r.indexOf("9"); return [...r].map((c, x) => c !== "9" ? c : x === first ? "l" : x === first + (y - b) + 3 ? "t" : "m").join(""); }
        return recolour([r], { 5: y === b + 2 ? "m" : "p", C: "u" })[0];
      });
    },
  },
};
/* the ranger's head: a rounded combat helmet with a brim, over a gas mask
 * with round eyepieces glowing red and a respirator snout; his ears poke up
 * through the top. Front, back, and knocked out (the eyepieces dark). */
const RANGER_HEAD = [
  "..g.....g.....",
  ".gig...gig....",
  "..oppppppp....",
  ".oppppqqpppp..",
  "opppppppppppo.",
  "oooooooooooooo",
  ".ooopppppppp..",
  ".ooopsrppsrp..",
  ".oooppppppqqo.",
  "..ooppppppoqqo",
];
const RANGER_HEAD_BACK = [
  "..g.....g.....",
  ".ggg...ggg....",
  ".ooppppppppo..",
  "oppppqpppppp..",
  "oppppppppppp..",
  "oooooooooooo..",
  ".opppppppppo..",
  ".opppqpppppo..",
  ".opppppppppo..",
  "..oooooooooo..",
];
const RANGER_HEAD_OUT = [
  "..g.....g.....",
  ".gig...gig....",
  "..oppppppp....",
  ".oppppqqpppp..",
  "opppppppppppo.",
  "oooooooooooooo",
  ".ooopppppppp..",
  ".ooopoopppoop.",
  ".oooppppppqqo.",
  "..ooppppppoqqo",
];

/* the creatures the game draws come from the set in use */
function useCreatures(name) { Object.assign(ART, ART.creatureSets[name] || ART.creatureSets.classic); }

/* the items the game draws come from the set in use */
function useItems(name) {
  const S = ART.itemSets[name] || ART.itemSets.classic;
  ART.items = S.items; ART.gems = S.gems;
}

/* dress Poom: the sprites the game draws come from the look in use */
function useLook(name) {
  const L = ART.looks[name] || ART.looks.classic;
  ART.poom = L.poom; ART.map = L.map;
}

/* the pogo stick, under Poom's feet: extended and compressed */
const POGO_LONG = [
  "77777777",
  "...88...",
  "...77...",
  "...88...",
  "...77...",
  "...88...",
  "..7777..",
  "...44...",
];
const POGO_SHORT = [
  "77777777",
  "...88...",
  "..7777..",
  "..7777..",
  "...44...",
];

/* top-down Poom on the world map, 12x14 */
const MAP_POOM = {
  down0: [
    ".g........g.",
    "gig......gig",
    ".CCCCCCCCCC.",
    "CCCCCFFCCCCC",
    "C44444444444",
    ".gFFggggFFg.",
    ".gF0iiiiF0g.",
    "..ggiDDigg..",
    ".9999999999.",
    "g9999999999gg",
    "..55555555..",
    "..555..555..",
    "..CCC..CCC..",
  ],
  down1: [
    ".g........g.",
    "gig......gig",
    ".CCCCCCCCCC.",
    "CCCCCFFCCCCC",
    "C44444444444",
    ".gFFggggFFg.",
    ".gF0iiiiF0g.",
    "..ggiDDigg..",
    ".9999999999.",
    "g9999999999gg",
    "..55555555..",
    "..555..555..",
    "...CC..CCC..",
  ],
  up0: [
    ".g........g.",
    "ggg......ggg",
    ".CCCCCCCCCC.",
    "CCCCCFFCCCCC",
    "CCCCCFFCCCCC",
    "C44444444444",
    ".gggggggggg.",
    "..gggggggg..",
    ".9999999999.",
    "g9999999999g",
    "..55555555.g",
    "..555..555.g",
    "..CCC..CCC..",
  ],
  up1: [
    ".g........g.",
    "ggg......ggg",
    ".CCCCCCCCCC.",
    "CCCCCFFCCCCC",
    "CCCCCFFCCCCC",
    "C44444444444",
    ".gggggggggg.",
    "..gggggggg..",
    ".9999999999.",
    "g9999999999g",
    "..55555555.g",
    "..555..555..g",
    "..CCC...CC..",
  ],
  side0: [
    "..g....g....",
    ".gig..gig...",
    ".CCCCCCCCC..",
    "CCCCFCCCCCC.",
    "44444444444.",
    ".gggFFgFFg..",
    ".ggggF0F0ii.",
    "..gggggiiiD.",
    "..99999999..",
    "g.99999999g.",
    "gg.5555555..",
    "...55..55...",
    "..CCC.CCC...",
  ],
  side1: [
    "..g....g....",
    ".gig..gig...",
    ".CCCCCCCCC..",
    "CCCCFCCCCCC.",
    "44444444444.",
    ".gggFFgFFg..",
    ".ggggF0F0ii.",
    "..gggggiiiD.",
    "..99999999..",
    "g.99999999g.",
    "gg.5555555..",
    "..55....55..",
    ".CCC....CCC.",
  ],
};

/* ------------------------------------------------------------------ */
/* Creatures                                                            */

/* Mousel: a little one-eyed grey moon-mouse. Harmless; it shoves. */
const MOUSEL = {
  walk0: [
    "...7.....7....",
    "..7D7...7D7...",
    "..7777777777..",
    ".777FFFF77777.",
    ".77FF00F77777.",
    "77777FF777777D",
    "7777777777777.",
    ".77777777777..",
    "..777777777...",
    "..A.......A...",
    ".AA.......AA..",
  ],
  walk1: [
    "...7.....7....",
    "..7D7...7D7...",
    "..7777777777..",
    ".777FFFF77777.",
    ".77FF00F77777.",
    "77777FF777777D",
    "7777777777777.",
    ".77777777777..",
    "..777777777...",
    "...A.....A....",
    "...AA....AA...",
  ],
  look: [
    "...7.....7....",
    "..7D7...7D7...",
    "..7777777777..",
    ".7777FFFF7777.",
    ".7777F00F7777.",
    "77777FFFF7777D",
    "7777777777777.",
    ".77777777777..",
    "..777777777...",
    "..A.......A...",
    ".AA.......AA..",
  ],
  stunned: [
    "..............",
    "..E.....E.....",
    "...E...E......",
    "..............",
    "..AA.....AA...",
    "...A.....A....",
    "..777777777...",
    ".77777777777..",
    "777F0F0777777D",
    "7777777777777.",
    ".77777777777..",
  ],
};

/* Barker: a red alien hound, all teeth. Charges when it sees you. */
const BARKER = {
  walk0: [
    "..........44....",
    ".........4CC4...",
    "........CCCCCC..",
    "........CFF0CCC.",
    ".......CCCCCCCCC",
    "C......CCCF.F.F.",
    "CC....CCCCCCCCC.",
    ".CCCCCCCCCCCC...",
    "..CCCCCCCCCCC...",
    "..CCCCCCCCCC....",
    "..CC.CC..CC.CC..",
    ".CC...CC.CC..CC.",
    ".44...44.44..44.",
  ],
  walk1: [
    "..........44....",
    ".........4CC4...",
    "........CCCCCC..",
    "........CFF0CCC.",
    ".......CCCCCCCCC",
    "C......CCCF.F.F.",
    "CC....CCCCCCCCC.",
    ".CCCCCCCCCCCC...",
    "..CCCCCCCCCCC...",
    "..CCCCCCCCCC....",
    "...CCCC..CCCC...",
    "...CC.CC.CC.CC..",
    "...44.44.44.44..",
  ],
  charge: [
    "...........44...",
    "..........4CC4..",
    "C........CCCCCC.",
    "CC.......CFF0CCC",
    ".CC.....CCCCCCCC",
    "..CC....CCCF.F.F",
    "...CCCCCCCCCCCCC",
    "..CCCCCCCCCCCCF.",
    ".CCCCCCCCCCCC...",
    "CCC.CC....CCCC..",
    "CC...........CC.",
    "44............44",
    "................",
  ],
};

/* Vacuumoid: the enemy. An upright vacuum cleaner with a hose arm and a
 * single red eye. 20 wide, 30 tall. */
const VACUUMOID = {
  walk0: [
    "......8888888.......",
    ".....877777778......",
    "....87777777778.....",
    "....87CC777777788...",
    "....874C77777777888.",
    "....87777777777...88",
    "....877777777778...8",
    ".....8777777778....8",
    "......88888888.....8",
    ".....5555555555....8",
    "....555555555555...8",
    "...55555D555555558.8",
    "...5555555555555588.",
    "...555555555555558..",
    "...5555555555555....",
    "...555EEEEEEEE555...",
    "...555E000000E555...",
    "...555EEEEEEEE555...",
    "...5555555555555....",
    "...5555555555555....",
    "....55555555555.....",
    ".....888888888......",
    "....88........88....",
    "....88........88....",
    "....88........88....",
    "....88........88....",
    "...888........888...",
    "..8888........8888..",
    "..0000........0000..",
  ],
  walk1: [
    "......8888888.......",
    ".....877777778......",
    "....87777777778.....",
    "....87CC777777788...",
    "....874C77777777888.",
    "....87777777777...88",
    "....877777777778...8",
    ".....8777777778....8",
    "......88888888.....8",
    ".....5555555555....8",
    "....555555555555...8",
    "...55555D555555558.8",
    "...5555555555555588.",
    "...555555555555558..",
    "...5555555555555....",
    "...555EEEEEEEE555...",
    "...555E000000E555...",
    "...555EEEEEEEE555...",
    "...5555555555555....",
    "...5555555555555....",
    "....55555555555.....",
    ".....888888888......",
    "......88....88......",
    "......88....88......",
    ".....88......88.....",
    ".....88......88.....",
    "....888......888....",
    "...8888......8888...",
    "...0000......0000...",
  ],
  jump: [
    "......8888888.......",
    ".....877777778......",
    "....87777777778.....",
    "....87CC777777788...",
    "....874C77777777888.",
    "....87777777777...88",
    "....877777777778...8",
    ".....8777777778....8",
    "......88888888.....8",
    ".....5555555555...88",
    "....555555555555.88.",
    "...55555D55555555...",
    "...5555555555555....",
    "...555555555555555..",
    "...5555555555555....",
    "...555EEEEEEEE555...",
    "...555E000000E555...",
    "...555EEEEEEEE555...",
    "...5555555555555....",
    "...5555555555555....",
    "....55555555555.....",
    ".....888888888......",
    "...888........888...",
    "..88............88..",
    ".88..............88.",
    ".00..............00.",
    "....................",
    "....................",
    "....................",
  ],
};

/* Roombot: a disc robot. It cannot be hurt, and it shoves hard. 16x10 */
const ROOMBOT = {
  a: [
    ".....7777......",
    "...77BBBB77....",
    "..7777777777...",
    ".777777777777..",
    "8888888888888..",
    "8E8E8E8E8E8E8..",
    ".88888888888...",
    "..0.......0....",
  ],
  b: [
    ".....7777......",
    "...77B33B77....",
    "..7777777777...",
    ".777777777777..",
    "8888888888888..",
    "88E8E8E8E8E88..",
    ".88888888888...",
    "...0.....0.....",
  ],
};

/* Clawtank: a little treaded turret that fires hairballs. Shots bounce off. */
const CLAWTANK = {
  a: [
    "....33333......",
    "...3BBBB3......",
    "...3B00B3......",
    "...333333......",
    "..3333333388888",
    ".33333333388888",
    ".333333333.....",
    "88888888888....",
    "80800808008....",
    ".888888888.....",
  ],
  b: [
    "....33333......",
    "...3BBBB3......",
    "...3B00B3......",
    "...333333......",
    "..3333333388888",
    ".33333333388888",
    ".333333333.....",
    "88888888888....",
    "08008080080....",
    ".888888888.....",
  ],
};

/* The wasteland's creatures (Book 1), after docs/story/book-1-story.md.
 * Glowmice and scrap hounds are the mousel and barker recoloured; the
 * Sentrybot is the roombot gone to rust; the Scrapper, a raider dog in
 * scrap armour, is drawn new, facing left like the vacuumoid it stands in
 * for; a lieutenant is a Scrapper in red with a gold crest; the auto-turret
 * is new. Full colour. */
const GLOWMOUSE_SWAP = { 7: "#7e9a6c", 13: "#ff9ac0", 15: "#d8ff9a", 0: "#2a5a1a", 10: "#5ed27a", 14: "#d8ff9a" };
const HOUND_SWAP = { 12: "#8c5a34", 4: "#4a2a18", 15: "#f0ead8", 0: "#ff3b2f" };
const SENTRY_SWAP = { 7: "#6c7076", 11: "#ff3b2f", 3: "#c8261c", 8: "#3e444b", 14: "#ffb020", 0: "#1c130c" };
const SCRAPPER_PAL = {
  f: "#8a6a48", F: "#b08a62", d: "#5a4430", n: "#1a1a1a", e: "#ff3b2f", t: "#f0ead8",
  a: "#5c636b", A: "#8a929b", k: "#2b2f34", r: "#9a4b22", s: "#c4ccd5",
  c: "#4a4d40", C: "#6a6e5c", b: "#2a1a0e", m: "#c8302a", p: "#7a3a1c", P: "#b8622b",
};
/* a lieutenant: the same, armour red, crest gold */
const LIEUT_PAL = { ...SCRAPPER_PAL, a: "#8a1e18", A: "#d0402c", k: "#4a0e0a", m: "#f2cf3e", c: "#2e2016", C: "#4e3826" };
const SCRAPPER_TOP = [
  "........mm..........",
  ".......mmmm.........",
  ".....dFffffdd.......",
  "....dFffffffddd.....",
  "...nFfeFffffffddd...",
  "..nnFffffffffd.dd...",
  "..nttffffffffd.dd...",
  "...ddffffffffd..d...",
  ".....dffffffd.......",
  "...sAAAAAAAAAAs.....",
  "..sAaaaaaaaaaaAs....",
  "...AakkaaaaaraA.....",
  "..fAaaaaaaaaaaAf....",
  "..fAaarraaaaaaAfP...",
  "..fAaaaaaaaaaaAfp...",
  "..dkkkkkkkkkkkkdp...",
  "....cccccccccc..p...",
  "....cCcccccccc..p...",
  "....cccccccccc......",
];
const SCRAPPER_LEGS = {
  walk0: [
    "....ccc....ccc......",
    "...ccc......ccc.....",
    "...cc........cc.....",
    "..ccc........ccc....",
    "..cc..........cc....",
    ".bbbb........bbbb...",
    ".bbbb........bbbb...",
    "....................",
    "....................",
    "....................",
  ],
  walk1: [
    ".....ccc..ccc.......",
    ".....ccc..ccc.......",
    "......cc..cc........",
    "......cc..cc........",
    "......cc..cc........",
    ".....bbbb.bbbb......",
    ".....bbbb.bbbb......",
    "....................",
    "....................",
    "....................",
  ],
  jump: [
    "...ccc......ccc.....",
    "..ccc........ccc....",
    ".ccc..........ccc...",
    "bbbb..........bbbb..",
    "bbb............bbb..",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
  ],
};
const SCRAPPER = Object.fromEntries(Object.entries(SCRAPPER_LEGS).map(([k, legs]) => [k, SCRAPPER_TOP.concat(legs)]));
/* an auto-turret: a riveted mount and a barrel pointing up and right, a
   red lamp; flipped for left */
const TURRET_PAL = { a: "#535f6c", A: "#95a1ae", k: "#1c222a", s: "#c4ccd5", r: "#ff3b2f", R: "#ffc0b8" };
const TURRET = {
  a: [
    "..........ss",
    "........sAs.",
    "......sAAs..",
    "....sAAAs...",
    "...aAAAa....",
    "..aaaaaaa...",
    ".aaarRaaaa..",
    ".akkkkkkka..",
    "akAkkkkkAka.",
    "aaaaaaaaaaa.",
  ],
  b: [
    "..........ss",
    "........sAs.",
    "......sAAs..",
    "....sAAAs...",
    "...aAAAa....",
    "..aaaaaaa...",
    ".aaakkaaaa..",
    ".akkkkkkka..",
    "akAkkkkkAka.",
    "aaaaaaaaaaa.",
  ],
};

/* ------------------------------------------------------------------ */
/* Things to pick up                                                     */

const ITEMS = {
  fish: [
    "...........",
    "......99...",
    "9...99999..",
    "99.999999F.",
    "9999999990.",
    "99.9999999.",
    "9...99999..",
    "......9....",
  ],
  milk: [
    "...FFF...",
    "..FFFFF..",
    ".FFFFFFF.",
    ".F99999F.",
    ".F9FFF9F.",
    ".F9F9F9F.",
    ".F99999F.",
    ".FFFFFFF.",
    ".FFFFFFF.",
  ],
  yarn: [
    "...DDDD...",
    "..DD5DDD..",
    ".D5DDD5DD.",
    ".DDD5DDD5.",
    ".D5DDDD5D.",
    ".DD5D5DDD.",
    "..DDD5DD..",
    "...DDDD.55",
    "........5.",
  ],
  catnip: [
    "....A.....",
    "...AAA..A.",
    "..AA2AAAA.",
    ".AA2A2AA..",
    "..AAA2AA..",
    "...A2AA...",
    "....2.....",
    "....2.....",
    "...222....",
  ],
  trophy: [
    ".EEEEEEEE.",
    "EEE6EEEEEE",
    "E.E6EEEE.E",
    "E.EEEEEE.E",
    ".EEEEEEEE.",
    "...EEEE...",
    "....EE....",
    "...EEEE...",
    "..666666..",
  ],
  medal: [
    ".44..44.",
    "..4..4..",
    "...44...",
    "..EEEE..",
    ".EE66EE.",
    ".E6EE6E.",
    ".E6EE6E.",
    ".EE66EE.",
    "..EEEE..",
  ],
  ammo: [
    "..88..",
    ".EEEE.",
    ".E44E.",
    ".E44E.",
    ".EEEE.",
    ".E00E.",
    ".E00E.",
    ".EEEE.",
  ],
  life: [
    ".g....g..",
    "gig..gig.",
    "ggggggg..",
    "gF0gF0gg.",
    "ggiiiigg.",
    ".giDDig..",
    "..gggg...",
    ".gggggg..",
    "gggggggg.",
    ".gg..gg..",
  ],
  pogo: [
    "7777777",
    "...8...",
    "...7...",
    "...8...",
    "...7...",
    "...8...",
    "..777..",
    "..777..",
    "...4...",
  ],
};

/* Item sets, one per book (game.js picks), like Poom's looks. classic is
 * the set above; a set replaces what it lists. The wasteland (Book 1),
 * after docs/story/book-1-story.md: bottle caps, tuna, clean water and
 * Sunny Snax for points (the pre-war medal and gold trophy stay), an
 * energy cell for the raygun, a Poom bobblehead for an extra life, and
 * Vault keycards. Full colour: each grid has its own palette. */
const WASTE_PAL = {
  s: "#7c8088", w: "#dfe3e8", r: "#c8302a", R: "#ff7a62", d: "#7e1a14", b: "#2f5f9e", B: "#6a9ee0",
  y: "#f2cf3e", Y: "#fff3a8", f: "#f08a3c", c: "#9fd8ee", l: "#4aa6d8", h: "#e8fbff", k: "#2a4f8a",
  g: "#5cff7a", G: "#d8ffe0", e: "#2c9a46", t: "#dba363", u: "#a8743c",
  o: "#26272a", p: "#43464a", q: "#6c7076", m: "#4e3826", n: "#2e2016", S: "#ff4a3a",
};
const WASTE_ITEMS = {
  /* a bottle cap: crimped silver rim, a red top */
  fish: [
    ".swswsw.",
    "swrrrrws",
    "wrRRrrrw",
    "srRrrrrs",
    "wrrrrrdw",
    "srrrrdds",
    "wsrrddsw",
    ".wswsws.",
  ],
  /* a tin of tuna: a blue label with a fish on it */
  milk: [
    ".wwwwwwww.",
    "wsssssssssw",
    "bbbbbbbbbbb",
    "bbyffffbBbb",
    "bbbbfffbbbb",
    "bBbbbbbbbbb",
    "ddddddddddd",
  ],
  /* a bottle of clean water */
  yarn: [
    "..kk..",
    "..cc..",
    ".cccc.",
    "cllllc",
    "clhllc",
    "wwwwww",
    "wbbbbw",
    "wwwwww",
    "cllllc",
    "clllhc",
    ".cccc.",
  ],
  /* a box of Sunny Snax: a sun on red */
  catnip: [
    "rrrrrrrr",
    "rrYyyrrr",
    "ryYYyyrr",
    "ryyyyyrr",
    "rryyyrrr",
    "wwwwwwww",
    "wbbwbbbw",
    "wwwwwwww",
    "rrrrrrrr",
    "dddddddd",
  ],
  /* an energy cell, glowing */
  ammo: [
    "..ww..",
    ".swws.",
    "sgGggs",
    "sggggs",
    "sgGgee",
    "sggggs",
    "sgGggs",
    ".ssss.",
  ],
  /* a Poom bobblehead: his ranger helmet, a tiny duster, a base */
  life: [
    ".t.....t.",
    "tut...tut",
    "ooooooooo",
    "oppppppqo",
    "opSrppSro",
    "opppppppo",
    ".opppppo.",
    "...sss...",
    "..mmmmm..",
    "..mnmmm..",
    ".rrrrrrr.",
  ],
};
/* a Vault keycard: a stripe in its colour, a gold chip */
const KEYCARD = [
  "wwwwwwwwww",
  "wccccccccw",
  "wddddddddw",
  "wwwwwwwwww",
  "wyywwwwssw",
  "wyywwwwwww",
  "ssssssssss",
];
const KEYCARD_COLOURS = [["#e0352e", "#8a1e18"], ["#f2cf3e", "#9a7a12"], ["#52e06a", "#1f7a33"], ["#4a86e8", "#1c3f8a"], ["#c4ccd5", "#6c7076"]];

/* keycard gems: one shape, four colours (red, yellow, green, blue) */
const GEM = [
  "...FF...",
  "..FCCC..",
  ".FCCCCC.",
  "CCCCCCC4",
  ".4CCCC4.",
  "..4CC4..",
  "...44...",
];
const GEM_SWAPS = [null, { 15: 15, 12: 14, 4: 6 }, { 12: 10, 4: 2 }, { 12: 9, 4: 1 }];

/* the four ship parts of the Catamaran */
const PARTS = [
  /* 0: the Yarn Drive */
  [
    ".88888888.",
    "8DDDDDDDD8",
    "8D5D5D5DD8",
    "8DD5D5D5D8",
    "8D5D5D5DD8",
    "8DDDDDDDD8",
    ".88888888.",
    "..B....B..",
    ".BBB..BBB.",
  ],
  /* 1: the Catnip Battery */
  [
    "...7777...",
    ".AAAAAAAA.",
    ".A2AAAA2A.",
    ".AAA22AAA.",
    ".AA2222AA.",
    ".AAA22AAA.",
    ".A2AAAA2A.",
    ".AAAAAAAA.",
    ".88888888.",
  ],
  /* 2: the Whisker Antenna */
  [
    "C........C",
    ".7......7.",
    "..7....7..",
    "...7..7...",
    "....77....",
    "...7777...",
    "..888888..",
    "..8BBBB8..",
    ".88888888.",
  ],
  /* 3: the Laser Pointer */
  [
    "C.........",
    ".C........",
    "..C.......",
    "...777....",
    "...7E77...",
    "....7777..",
    ".....7777.",
    "......777.",
    ".......77.",
  ],
];
const PART_NAMES = ["the Yarn Drive", "the Catnip Battery", "the Whisker Antenna", "the Laser Pointer"];

/* shots */
const ZAP = [["CEFEC", ".CEC."], [".CEC.", "CEFEC"]];
const HAIRBALL = [[".66.", "6886", "6886", ".66."], [".66.", "6866", "6686", ".66."]];
const POOF = [
  [
    "..F...F..",
    "...F.F...",
    "FF..E..FF",
    "...F.F...",
    "..F...F..",
  ],
  [
    "F.......F",
    "..E...E..",
    "....F....",
    "..E...E..",
    "F.......F",
  ],
];
const STAR = ["E", ".", "E"];

/* ------------------------------------------------------------------ */
/* Build                                                                 */

const ART = { looks: {}, poom: {}, map: {}, mousel: {}, barker: {}, vac: {}, boss: {}, roombot: {}, tank: {}, lieut: {}, turret: {}, items: {}, gems: [], parts: [] };

function both(c) { return { r: c, l: flipped(c) }; }

function buildArt() {
  const pad = r => "...." + r + "....";
  const overlay = (rows, tail) => rows.map((r, y) => {
    const t = tail[y] || "";
    return [...r].map((c, x) => c === "." && t[x] && t[x] !== "." ? t[x] : c).join("");
  });
  /* Poom in every look: the same grids, recoloured (see LOOKS) */
  for (const [look, dress] of Object.entries(LOOKS)) {
    const L = ART.looks[look] = { poom: {}, map: {} };
    for (const [k, body] of Object.entries(P_BODY)) {
      const backView = k === "back" || k === "climb0" || k === "climb1";
      const head = backView ? P_HEAD_BACK : k === "dead" ? P_HEAD_DIZZY : P_HEAD;
      const tail = backView ? TAIL_BACK : k === "walk1" ? TAIL_SWING : TAIL_SIDE;
      L.poom[k] = both(sprite(dress.head(head).map(pad).concat(overlay(dress.body(body).map(pad), tail))));
    }
    for (const [k, g] of Object.entries(MAP_POOM)) L.map[k] = both(sprite(dress.map(g)));
  }
  useLook("classic");
  ART.pogoLong = both(sprite(POGO_LONG));
  ART.pogoShort = both(sprite(POGO_SHORT));
  for (const [k, g] of Object.entries(MOUSEL)) ART.mousel[k] = both(sprite(g));
  for (const [k, g] of Object.entries(BARKER)) ART.barker[k] = both(sprite(g));
  for (const [k, g] of Object.entries(VACUUMOID)) ART.vac[k] = both(sprite(g));
  /* the Grand Vacuumoid: the same machine in red and gold */
  for (const [k, g] of Object.entries(VACUUMOID)) ART.boss[k] = both(sprite(g, { swap: { 5: 4, 13: 14, 7: 12, 8: 6 } }));
  for (const [k, g] of Object.entries(ROOMBOT)) ART.roombot[k] = both(sprite(g));
  for (const [k, g] of Object.entries(CLAWTANK)) ART.tank[k] = both(sprite(g));
  /* creature sets: classic, and the wasteland */
  const classicCreatures = { mousel: ART.mousel, barker: ART.barker, vac: ART.vac, boss: ART.boss, roombot: ART.roombot, tank: ART.tank, lieut: ART.boss, turret: ART.tank };
  const each = (src, f) => Object.fromEntries(Object.entries(src).map(([k, g]) => [k, both(f(g))]));
  const wasteCreatures = {
    mousel: each(MOUSEL, g => sprite(g, { swap: GLOWMOUSE_SWAP })),
    barker: each(BARKER, g => sprite(g, { swap: HOUND_SWAP })),
    vac: each(SCRAPPER, g => sprite(g, { pal: SCRAPPER_PAL })),
    lieut: each(SCRAPPER, g => sprite(g, { pal: LIEUT_PAL })),
    roombot: each(ROOMBOT, g => sprite(g, { swap: SENTRY_SWAP })),
    tank: ART.tank, boss: ART.boss,
    turret: each(TURRET, g => sprite(g, { pal: TURRET_PAL })),
  };
  ART.creatureSets = { classic: classicCreatures, wasteland: wasteCreatures };
  /* item sets: classic, and the wasteland over it */
  const classic = { items: {}, gems: GEM_SWAPS.map(s => sprite(GEM, { swap: s })) };
  for (const [k, g] of Object.entries(ITEMS)) classic.items[k] = sprite(g);
  /* the keycard whose colour the map doesn't say: silver */
  classic.gems.push(sprite(GEM, { swap: { 15: 15, 12: 7, 4: 8 } }));
  const waste = { items: { ...classic.items }, gems: KEYCARD_COLOURS.map(([c, d]) => sprite(KEYCARD, { pal: { ...WASTE_PAL, c, d } })) };
  for (const [k, g] of Object.entries(WASTE_ITEMS)) waste.items[k] = sprite(g, { pal: WASTE_PAL });
  ART.itemSets = { classic, wasteland: waste };
  useItems("classic");
  ART.parts = PARTS.map(g => sprite(g));
  ART.zap = ZAP.map(g => sprite(g, { outline: false }));
  ART.hairball = HAIRBALL.map(g => sprite(g));
  ART.poof = POOF.map(g => sprite(g, { outline: false }));
  ART.star = sprite(STAR, { outline: false });
  ART.digits = buildDigits();
}

/* LED digits for the scorebox, 5x7 */
const DIGITS = [
  ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
];
function buildDigits() {
  const make = col => DIGITS.map(d => {
    const c = makeCanvas(5, 7), g = c.getContext("2d");
    d.forEach((row, y) => [...row].forEach((b, x) => {
      g.fillStyle = b === "1" ? col : "rgba(0,0,0,0)";
      if (b === "1") g.fillRect(x, y, 1, 1);
    }));
    return c;
  });
  return { red: make(EGA[12]), dim: make("#3a0000"), white: make(EGA[15]), yellow: make(EGA[14]) };
}

/* ------------------------------------------------------------------ */
/* Tiles, painted per theme. 16x16.                                       */

const T = 16;

/* a small seeded noise so every brick is not the same brick */
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; };
}

const THEMES = {
  /* the red dust of Planet Hiss */
  hiss: { sky: 0, far: [4, 6], ground: [6, 4, 12], crust: [12, 14], alt: [8, 7], plat: [7, 8], bg: [0, 4], bgRock: true, liquid: [12, 14, 4], liquidName: "fire" },
  /* the frozen hills */
  ice: { sky: 1, far: [9, 3], ground: [3, 11, 9], crust: [15, 11], alt: [9, 1], plat: [11, 3], bg: [1, 0], liquid: [9, 11, 1], liquidName: "freezing slush" },
  /* inside a Vacuumoid fort */
  fort: { sky: 0, far: [8, 1], ground: [8, 7, 0], crust: [7, 15], alt: [8, 7], plat: [6, 14], bg: [1, 0], liquid: [10, 2, 14], liquidName: "toxic dust" },
  /* the catnip gardens */
  garden: { sky: 1, far: [2, 3], ground: [6, 2, 10], crust: [10, 2], alt: [2, 6], plat: [6, 14], bg: [0, 2], bgRock: true, liquid: [9, 3, 15], liquidName: "deep water" },
  /* Book 1 (docs/story/book-1-story.md): a Vault, an underground shelter of
   * riveted steel; and Vault 9, the cold-sleep shelter whose coolant burst */
  vault: { sky: 0, far: [8, 7], ground: [8, 7, 0], alt: [8, 7], plat: [7, 8], bg: [0, 8], liquid: [11, 15, 3], liquidName: "coolant", style: "vault", no: 6, crust: ["#97a3b0", "#c3ccd6"] },
  /* Book 1's raider camps: Fort Scrap and the Scrappers' turf, rusted scrap
   * and plank scaffolding under the Glow's dusk */
  raiders: { sky: 0, far: [6, 4], ground: [6, 4, 8], crust: ["#d07a36", "#f0a050"], alt: [8, 6], plat: [6, 14], bg: [0, 6], liquid: [10, 2, 14], liquidName: "sludge", style: "raiders" },
  /* Book 1's ruins: Old Litterburg and the roads round it, broken concrete
   * and rusted girders under the Glow's sickly daylight */
  ruins: { sky: 0, far: [8, 7], ground: [8, 7, 0], crust: ["#c0b8ac", "#ddd6ca"], alt: [8, 7], plat: [7, 8], bg: [0, 8], liquid: [10, 2, 14], liquidName: "sludge", style: "ruins" },
  vaultCold: { sky: 1, far: [9, 3], ground: [8, 7, 0], crust: ["#b4e6f6", "#e8fbff"], alt: [8, 7], plat: [7, 8], bg: [1, 0], liquid: [11, 15, 3], liquidName: "coolant", style: "vault", cold: true, no: 9 },
};

function paintTiles(themeName) {
  /* a colour is an EGA index or, for the VGA tilesets, any CSS colour */
  const th = THEMES[themeName], E = i => typeof i === "string" ? i : EGA[i];
  const tiles = {};
  const mk = fn => { const c = makeCanvas(T, T); fn(c.getContext("2d")); return c; };

  /* solid ground: speckled body; a crust when open to the sky */
  const ground = (top, seed) => mk(g => {
    const r = rng(seed);
    g.fillStyle = E(th.ground[0]); g.fillRect(0, 0, T, T);
    for (let i = 0; i < 22; i++) { g.fillStyle = E(th.ground[r() < .6 ? 1 : 2]); g.fillRect(r() * T | 0, r() * T | 0, r() < .5 ? 1 : 2, 1); }
    if (top) {
      g.fillStyle = E(th.crust[0]); g.fillRect(0, 0, T, 3);
      g.fillStyle = E(th.crust[1]); g.fillRect(0, 0, T, 1);
      for (let x = 0; x < T; x += 2) if (r() < .5) { g.fillStyle = E(th.crust[0]); g.fillRect(x, 3, 2, 1); }
    }
  });
  tiles.ground = [ground(false, 7), ground(false, 19), ground(false, 31)];
  tiles.groundTop = [ground(true, 11), ground(true, 23), ground(true, 37)];

  /* the alternate solid: bricks */
  tiles.brick = mk(g => {
    g.fillStyle = E(th.alt[0]); g.fillRect(0, 0, T, T);
    g.fillStyle = E(th.alt[1]);
    for (const y of [0, 8]) { g.fillRect(0, y, T, 1); }
    g.fillRect(4, 1, 1, 7); g.fillRect(12, 9, 1, 7);
    g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(0, 7, T, 1); g.fillRect(0, 15, T, 1);
  });

  /* one-way platform: a girder */
  tiles.plat = mk(g => {
    g.fillStyle = E(th.plat[0]); g.fillRect(0, 0, T, 5);
    g.fillStyle = E(th.plat[1]); g.fillRect(0, 4, T, 1);
    for (let x = 1; x < T; x += 4) g.fillRect(x, 1, 2, 2);
    g.fillStyle = E(15); g.fillRect(0, 0, T, 1);
  });

  /* background wall: dark, recessed */
  /* background wall: dark and recessed; rough rock outdoors, masonry indoors */
  tiles.bgwall = mk(g => {
    g.fillStyle = E(th.bg[0]); g.fillRect(0, 0, T, T);
    g.fillStyle = E(th.bg[1]);
    if (th.bgRock) {
      const r = rng(77);
      for (let i = 0; i < 30; i++) g.fillRect(r() * T | 0, r() * T | 0, r() < .5 ? 2 : 1, 1);
    } else { g.fillRect(0, 0, T, 1); g.fillRect(0, 8, T, 1); g.fillRect(8, 1, 1, 7); g.fillRect(0, 9, 1, 7); }
  });

  /* spikes */
  tiles.spikes = mk(g => {
    for (let i = 0; i < 4; i++) {
      const x = i * 4;
      g.fillStyle = E(7);
      g.beginPath(); g.moveTo(x, 16); g.lineTo(x + 2, 7); g.lineTo(x + 4, 16); g.fill();
      g.fillStyle = E(15); g.fillRect(x + 2, 7, 1, 3);
      g.fillStyle = E(8); g.fillRect(x + 3, 12, 1, 4);
    }
  });

  /* liquid hazard, four frames of a rolling surface */
  tiles.liquid = [0, 1, 2, 3].map(f => mk(g => {
    g.fillStyle = E(th.liquid[2]); g.fillRect(0, 4, T, 12);
    g.fillStyle = E(th.liquid[0]);
    for (let x = 0; x < T; x++) {
      const h = 3 + Math.round(1.5 * Math.sin((x + f * 4) * Math.PI / 8));
      g.fillRect(x, 6 - h + 2, 1, h + 2);
    }
    g.fillStyle = E(th.liquid[1]);
    for (let x = 0; x < T; x += 4) g.fillRect((x + f * 2) % T, 9 + (x % 8 ? 2 : 0), 2, 1);
  }));

  /* pole */
  tiles.pole = mk(g => {
    g.fillStyle = E(8); g.fillRect(6, 0, 4, T);
    g.fillStyle = E(7); g.fillRect(7, 0, 2, T);
    g.fillStyle = E(15); g.fillRect(7, 0, 1, T);
  });

  /* locked doors: red, yellow, green, blue */
  /* a door tile: a coloured slab in a dark frame, rivets and a key slot */
  tiles.doors = [[12, 4], [14, 6], [10, 2], [9, 1], [7, 8]].map(([a, b]) => mk(g => {
    g.fillStyle = E(b); g.fillRect(0, 0, T, T);
    g.fillStyle = E(a); g.fillRect(2, 0, T - 4, T);
    g.fillStyle = E(15); g.fillRect(3, 0, 1, T);
    g.fillStyle = E(b); g.fillRect(T / 2, 0, 1, T);
    g.fillStyle = E(0); g.fillRect(5, 1, 1, 1); g.fillRect(11, 1, 1, 1); g.fillRect(5, 14, 1, 1); g.fillRect(11, 14, 1, 1);
    g.fillRect(10, 6, 2, 4); g.fillStyle = E(15); g.fillRect(10, 6, 1, 1);
  }));

  /* the exit door, 16x32, shut and open */
  const exitDoor = open => { const c = makeCanvas(T, T * 2), g = c.getContext("2d");
    g.fillStyle = E(8); g.fillRect(0, 2, T, 30);
    g.fillStyle = E(7); g.fillRect(0, 0, T, 3); g.fillRect(0, 2, 2, 30); g.fillRect(14, 2, 2, 30);
    if (open) { g.fillStyle = E(0); g.fillRect(2, 3, 12, 29); }
    else {
      g.fillStyle = E(6); g.fillRect(2, 3, 12, 29);
      g.fillStyle = E(4); for (let y = 6; y < 32; y += 6) g.fillRect(2, y, 12, 1);
      g.fillStyle = E(14); g.fillRect(10, 17, 2, 2);
    }
    /* a green lamp over the lintel: the way out */
    g.fillStyle = E(2); g.fillRect(5, 0, 6, 3); g.fillStyle = E(10); g.fillRect(6, 0, 4, 2);
    return c; };
  tiles.exit = [exitDoor(false), exitDoor(true)];

  /* a bridge switch: a lever on a plate, thrown left (0) or right (1) */
  tiles.switch = [0, 1].map(on => mk(g => {
    g.fillStyle = E(8); g.fillRect(3, 9, 10, 7);
    g.fillStyle = E(7); g.fillRect(3, 9, 10, 1); g.fillRect(3, 9, 1, 7);
    g.fillStyle = E(on ? 10 : 12); g.fillRect(6, 12, 4, 2);
    g.strokeStyle = E(15); g.lineWidth = 2; g.beginPath(); g.moveTo(8, 11); g.lineTo(on ? 13 : 3, 3); g.stroke();
    g.fillStyle = E(14); g.beginPath(); g.arc(on ? 13 : 3, 3, 2, 0, Math.PI * 2); g.fill();
  }));

  /* a key socket: a dark holder the size of a keycard */
  tiles.socket = mk(g => {
    g.fillStyle = E(8); g.fillRect(2, 2, 12, 12);
    g.fillStyle = E(7); g.fillRect(2, 2, 12, 1); g.fillRect(2, 2, 1, 12);
    g.fillStyle = E(0); g.fillRect(4, 4, 8, 8);
  });

  /* a moving platform, 32x8, two frames of its running lights; a dropping
   * one in warning orange, a static one dark */
  tiles.platform = [[7, 9, 11], [6, 12, 14], [8, 7, 8]].map(([body, lamp0, lamp1]) => [0, 1].map(f => {
    const c = makeCanvas(T * 2, 8), g = c.getContext("2d");
    g.fillStyle = E(body); g.fillRect(0, 0, 32, 6);
    g.fillStyle = E(15); g.fillRect(0, 0, 32, 1);
    g.fillStyle = E(0); g.fillRect(0, 6, 32, 2); g.fillRect(1, 5, 30, 1);
    for (let x = 3; x < 32; x += 8) { g.fillStyle = E((x >> 3) % 2 === f ? lamp1 : lamp0); g.fillRect(x, 2, 3, 2); }
    return c;
  }));

  /* a bridge's deck: planks on a beam */
  tiles.bridge = mk(g => {
    g.fillStyle = E(6); g.fillRect(0, 0, T, 6);
    g.fillStyle = E(14); g.fillRect(0, 0, T, 1);
    g.fillStyle = E(4); for (let x = 3; x < T; x += 4) g.fillRect(x, 1, 1, 5);
    g.fillStyle = E(8); g.fillRect(0, 6, T, 2);
  });

  /* a warp door, 32x32: a dark arch with a shimmer that moves, four frames */
  tiles.warp = [0, 1, 2, 3].map(f => { const c = makeCanvas(T * 2, T * 2), g = c.getContext("2d");
    g.fillStyle = E(8); g.fillRect(2, 2, 28, 30);
    g.fillStyle = E(7); g.fillRect(2, 2, 28, 2); g.fillRect(2, 2, 2, 30); g.fillRect(28, 2, 2, 30);
    g.fillStyle = E(15); g.fillRect(2, 2, 28, 1);
    g.fillStyle = E(1); g.fillRect(5, 5, 22, 27);
    g.fillStyle = E(5); for (let y = 5 + f * 2; y < 32; y += 8) g.fillRect(5, y, 22, 2);
    g.fillStyle = E(13); for (let y = 6 + f * 2; y < 32; y += 8) g.fillRect(9 + (y % 3) * 3, y, 6, 1);
    /* a violet lamp over the arch: not the way out, the way through */
    g.fillStyle = E(5); g.fillRect(12, 0, 8, 3); g.fillStyle = E(13); g.fillRect(13, 0, 6, 2);
    return c; });

  /* ice: ground under a pale, glassy crust */
  tiles.ice = mk(g => {
    g.drawImage(tiles.ground[0], 0, 0);
    g.fillStyle = E(11); g.fillRect(0, 0, T, 4);
    g.fillStyle = E(15); g.fillRect(0, 0, T, 1); g.fillRect(2, 1, 3, 1); g.fillRect(10, 2, 2, 1);
    g.fillStyle = E(3); g.fillRect(0, 4, T, 1);
  });

  /* conveyors, four frames each way: a belt over rollers */
  tiles.conveyor = [-1, 1].map(dir => [0, 1, 2, 3].map(f => mk(g => {
    g.fillStyle = E(8); g.fillRect(0, 0, T, T);
    g.fillStyle = E(0); g.fillRect(0, 5, T, 1);
    g.fillStyle = E(7); g.fillRect(0, 0, T, 5);
    g.fillStyle = E(14);
    for (let x = 0; x < T + 4; x += 4) g.fillRect(((x + dir * f) % T + T) % T, 1, 2, 3);
    g.fillStyle = E(7); for (const x of [3, 11]) { g.beginPath(); g.arc(x, 10, 3, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = E(15); for (const x of [3, 11]) g.fillRect(x - 1, 8, 1, 1);
  })));

  /* slopes: the ground tile cut along its surface. Painted on demand, one
   * per pair of heights (left edge, right edge, in pixels from the bottom) */
  const slopeCache = {};
  tiles.slope = (hl, hr) => slopeCache[hl + "," + hr] || (slopeCache[hl + "," + hr] = mk(g => {
    g.beginPath(); g.moveTo(0, T); g.lineTo(0, T - hl); g.lineTo(T, T - hr); g.lineTo(T, T); g.closePath();
    g.save(); g.clip(); g.drawImage(tiles.ground[1], 0, 0); g.restore();
    g.strokeStyle = E(th.crust[0]); g.lineWidth = 3; g.beginPath(); g.moveTo(0, T - hl + 1); g.lineTo(T, T - hr + 1); g.stroke();
    g.strokeStyle = E(th.crust[1]); g.lineWidth = 1; g.beginPath(); g.moveTo(0, T - hl + 0.5); g.lineTo(T, T - hr + 0.5); g.stroke();
  }));

  /* a hint sign: a board on a post */
  tiles.sign = mk(g => {
    g.fillStyle = E(6); g.fillRect(7, 8, 2, 8);
    g.fillStyle = E(6); g.fillRect(1, 1, 14, 8);
    g.fillStyle = E(14); g.fillRect(2, 2, 12, 6);
    g.fillStyle = E(6); for (const y of [3, 5]) g.fillRect(3, y, 10, 1);
  });

  if (th.style === "vault") vaultTiles(tiles, th, mk, E);
  if (th.style === "raiders") raiderTiles(tiles, th, mk, E);
  if (th.style === "ruins") ruinTiles(tiles, th, mk, E);

  /* fake wall: looks like ground, walks like air (secret) */
  tiles.fake = tiles.ground[0];
  return tiles;
}

/* VGA ramps for the raider camps, dark to light */
const RUST = ["#1e0f0a", "#3b1d12", "#5c2c17", "#7a3a1c", "#9a4b22", "#b8622b", "#d07a36"];
const STEEL = ["#121417", "#262a2f", "#3e444b", "#5c636b", "#828a93", "#aeb6be", "#dde2e6"];
const WOOD = ["#24160c", "#432a16", "#634020", "#82552a", "#a06c36", "#c08a4c"];
const PAINT = { red: "#e0352e", yellow: "#f2cf3e", lamp: "#ffd36a", lampHot: "#fff1b0" };

/* The raiders' own tiles: rusted corrugated scrap, plates bolted over the
 * holes, plank scaffolding, scrap spikes under barbed wire, looted security
 * doors with padlocks, a corrugated gate for the exit, graffiti for signs.
 * Full colour: the ramps above. */
function raiderTiles(tiles, th, mk, E) {
  const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  /* corrugated sheet: each four-pixel ridge shaded across, dark to light */
  const ridge = [RUST[2], RUST[3], RUST[4], RUST[3]];
  const sheet = (g, r, x0 = 0, y0 = 0, w = T, h = T) => {
    for (let x = 0; x < w; x++) px(g, ridge[(x0 + x) % 4], x0 + x, y0, 1, h);
    /* rust: dark blooms and bright flakes, and a run or two down the ridges */
    for (let i = 0; i < 10; i++) px(g, r() < .6 ? RUST[1] : RUST[5], x0 + (r() * w | 0), y0 + (r() * h | 0), 1 + (r() * 2 | 0), 1);
    for (let i = 0; i < 2; i++) { const x = x0 + (r() * w | 0); px(g, RUST[1], x, y0 + (r() * 6 | 0), 1, 3 + (r() * 6 | 0)); }
  };
  const plate = (g, x, y, w, h) => {
    px(g, STEEL[2], x, y, w, h);
    px(g, STEEL[4], x, y, w, 1); px(g, STEEL[4], x, y, 1, h);
    px(g, STEEL[0], x, y + h, w + 1, 1); px(g, STEEL[0], x + w, y, 1, h);
    px(g, STEEL[5], x + 1, y + 1); px(g, STEEL[5], x + w - 2, y + 1); px(g, STEEL[5], x + 1, y + h - 2); px(g, STEEL[5], x + w - 2, y + h - 2);
    px(g, RUST[3], x + 2, y + h - 1, w - 4, 1);
  };

  /* a scrap wall: plain sheet, a plate bolted over a hole, or a sheet gone
     to rust; three kinds so a wall looks thrown together */
  const scrap = (top, kind, seed) => mk(g => {
    const r = rng(seed);
    sheet(g, r);
    if (kind === 1) plate(g, 2 + (r() * 5 | 0), 3 + (r() * 5 | 0), 8, 6);
    if (kind === 2) for (let i = 0; i < 14; i++) px(g, r() < .5 ? RUST[1] : RUST[2], r() * T | 0, r() * T | 0, 2, 1);
    px(g, RUST[0], 0, T - 1, T, 1);
    if (top) {
      /* the torn top edge of the sheet, catching the light */
      px(g, RUST[6], 0, 0, T, 1); px(g, RUST[5], 0, 1, T, 1);
      for (let x = 0; x < T; x++) if (r() < .3) px(g, RUST[0], x, 0, 1, 1 + (r() * 2 | 0));
      px(g, RUST[1], 0, 2, T, 1);
    }
  });
  tiles.ground = [scrap(false, 0, 5), scrap(false, 1, 17), scrap(false, 2, 29)];
  tiles.groundTop = [scrap(true, 0, 9), scrap(true, 2, 21), scrap(true, 1, 33)];

  /* scaffolding: a nailed plank on two posts, lashed */
  tiles.plat = mk(g => {
    px(g, WOOD[3], 0, 0, T, 5);
    px(g, WOOD[5], 0, 0, T, 1); px(g, WOOD[4], 0, 1, T, 1);
    px(g, WOOD[2], 1, 2, 5, 1); px(g, WOOD[2], 9, 3, 5, 1); px(g, WOOD[2], 4, 4, 3, 1);
    px(g, WOOD[0], 0, 5, T, 1); px(g, WOOD[1], 7, 0, 1, 5);
    px(g, STEEL[5], 2, 1); px(g, STEEL[5], 13, 1);
    for (const x of [2, 12]) { px(g, WOOD[2], x, 6, 2, 5); px(g, WOOD[1], x + 1, 6, 1, 5); px(g, WOOD[4], x, 6, 2, 1); }
  });

  /* the hazard: jagged scrap spikes, barbed wire strung across them */
  tiles.spikes = mk(g => {
    for (const [x, h, w] of [[0, 9, 4], [3, 6, 5], [7, 11, 4], [10, 7, 6]]) {
      g.fillStyle = STEEL[2]; g.beginPath(); g.moveTo(x, 16); g.lineTo(x + w / 2, 16 - h); g.lineTo(x + w, 16); g.fill();
      g.fillStyle = STEEL[4]; g.beginPath(); g.moveTo(x + w / 2, 16 - h); g.lineTo(x + w / 2 - 1, 16); g.lineTo(x + w / 2, 16); g.fill();
      px(g, STEEL[6], x + (w >> 1), 16 - h); px(g, RUST[4], x + (w >> 1), 13, 1, 3);
    }
    px(g, STEEL[3], 0, 10, T, 1);
    for (let x = 2; x < T; x += 5) { px(g, STEEL[5], x, 9, 1, 3); px(g, STEEL[5], x - 1, 10, 3, 1); px(g, STEEL[6], x, 10); }
  });

  /* looted security doors: rusted steel, the colour band still on, a brass
     padlock on the top tile; the tiles below are slab with a painted X */
  const COLOURS = [[12, 4], [14, 6], [10, 2], [9, 1], [7, 8]];
  const door = (a, b, top) => mk(g => {
    const r = rng(a * 7 + b);
    px(g, STEEL[1], 0, 0, T, T);
    px(g, STEEL[3], 2, 0, T - 4, T); px(g, STEEL[4], 2, 0, 1, T);
    for (let i = 0; i < 6; i++) px(g, r() < .5 ? RUST[3] : RUST[2], 3 + (r() * 10 | 0), r() * T | 0, 2, 1 + (r() * 2 | 0));
    px(g, STEEL[0], T / 2, 0, 1, T);
    if (top) {
      px(g, E(b), 2, 9, T - 4, 5); px(g, E(a), 2, 10, T - 4, 3);
      px(g, STEEL[5], 6, 1, 4, 1); px(g, STEEL[5], 6, 1, 1, 3); px(g, STEEL[5], 9, 1, 1, 3);
      px(g, "#b8902c", 5, 4, 6, 4); px(g, "#e8c050", 5, 4, 6, 1); px(g, "#5a4410", 7, 5, 2, 2);
      px(g, STEEL[5], 0, 0, T, 1);
    } else {
      px(g, E(b), 2, 13, T - 4, 2);
      for (let i = 0; i < 6; i++) { px(g, PAINT.red, 4 + i, 3 + i); px(g, PAINT.red, 9 - i, 3 + i); }
    }
  });
  tiles.doors = COLOURS.map(([a, b]) => door(a, b, true));
  tiles.doorsBelow = COLOURS.map(([a, b]) => door(a, b, false));

  /* the exit: the camp's back gate, corrugated sheet on a steel frame;
     open, the dusk beyond. The green lamp marks every way out */
  const gate = open => { const c = makeCanvas(T, T * 2), g = c.getContext("2d");
    px(g, STEEL[2], 0, 2, T, 30); px(g, STEEL[4], 0, 2, 2, 30); px(g, STEEL[4], 14, 2, 2, 30); px(g, STEEL[5], 0, 2, T, 1);
    if (open) {
      const sky = ["#2a1440", "#6a1f45", "#b03a2e", "#e0702c", "#f6b54a"];
      sky.forEach((col, i) => px(g, col, 2, 4 + i * 4, 12, 4));
      px(g, RUST[1], 2, 24, 12, 8);
    } else {
      sheet(g, rng(3), 2, 4, 12, 28);
      g.strokeStyle = STEEL[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(3, 30); g.lineTo(13, 7); g.stroke();
      px(g, STEEL[5], 11, 17, 2, 2);
    }
    px(g, E(2), 5, 0, 6, 3); px(g, E(10), 6, 0, 4, 2);
    return c; };
  tiles.exit = [gate(false), gate(true)];

  /* a hint sign is Scrapper graffiti on a board */
  tiles.sign = mk(g => {
    px(g, WOOD[2], 7, 9, 2, 7); px(g, WOOD[1], 8, 9, 1, 7);
    px(g, WOOD[3], 0, 1, 16, 9); px(g, WOOD[5], 0, 1, 16, 1); px(g, WOOD[1], 0, 10, 16, 1);
    px(g, WOOD[2], 0, 5, 16, 1);
    px(g, PAINT.red, 2, 3, 1, 5); px(g, PAINT.red, 3, 3, 2, 1); px(g, PAINT.red, 3, 5, 2, 1); px(g, PAINT.red, 6, 3, 1, 5); px(g, PAINT.red, 6, 7, 3, 1);
    for (const [x, y] of [[10, 3], [11, 4], [12, 5], [13, 4], [14, 3], [12, 7]]) px(g, PAINT.yellow, x, y);
  });
}

/* VGA ramps for the ruins, dark to light: weathered concrete, old brick */
const CONCRETE = ["#1d1b19", "#34302c", "#4d4842", "#67615a", "#827b72", "#a0988d", "#c0b8ac", "#ddd6ca"];
const BRICK = ["#2e130f", "#4f1f17", "#70301f", "#8c3f27", "#a85434", "#c06c46"];
const WEED = ["#4a4420", "#6e6430", "#948646"];

/* The ruins' own tiles: cracked concrete, some with rebar showing, some
 * broken brick; rusted I-beams for ledges; bent rebar and broken glass for
 * the hazard; roll-down shutters for the doors; a stairwell door for the
 * exit; a loudspeaker on a pole for the signs. Full colour. */
function ruinTiles(tiles, th, mk, E) {
  const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  /* concrete: mottled, with a crack or two */
  const concrete = (g, r) => {
    px(g, CONCRETE[4], 0, 0, T, T);
    for (let i = 0; i < 40; i++) px(g, CONCRETE[3 + (r() * 3 | 0)], r() * T | 0, r() * T | 0, 1 + (r() * 2 | 0), 1);
    for (let k = 0; k < 2; k++) {
      let x = r() * T | 0, y = r() * 6 | 0;
      for (let i = 0; i < 7; i++) { px(g, CONCRETE[1], x, y); px(g, CONCRETE[6], x + 1, y); x += (r() * 3 | 0) - 1; y++; if (x < 0 || x >= T) break; }
    }
  };
  const block = (top, kind, seed) => mk(g => {
    const r = rng(seed);
    if (kind === 2) {
      /* broken brick: courses, half-bricks offset, a chunk knocked out */
      px(g, CONCRETE[2], 0, 0, T, T);
      for (let y = 0; y < T; y += 4) for (let x = (y & 4) ? -4 : 0; x < T; x += 8) {
        px(g, BRICK[2 + (r() * 3 | 0)], x + 1, y + 1, 7, 3); px(g, BRICK[5], x + 1, y + 1, 7, 1); px(g, BRICK[1], x + 1, y + 3, 7, 1);
      }
      px(g, CONCRETE[1], 9, 9, 5, 4); px(g, CONCRETE[0], 10, 10, 3, 2);
    } else concrete(g, r);
    if (kind === 1) {
      /* a ragged spall where the concrete has come away, a bar showing */
      const sx = 3 + (r() * 6 | 0), sy = 5 + (r() * 5 | 0);
      for (const [dx, dy, w] of [[1, 0, 4], [0, 1, 6], [0, 2, 7], [1, 3, 5], [2, 4, 3]]) px(g, CONCRETE[2], sx + dx, sy + dy, w, 1);
      px(g, CONCRETE[1], sx + 1, sy + 4, 4, 1); px(g, CONCRETE[6], sx + 1, sy - 1, 4, 1);
      for (let k = 0; k < 6; k++) px(g, k ? RUST[4] : RUST[6], sx + k, sy + 2);
      px(g, RUST[2], sx + 1, sy + 3, 5, 1);
    }
    px(g, CONCRETE[1], 0, T - 1, T, 1); px(g, CONCRETE[2], T - 1, 0, 1, T);
    if (top) {
      /* a crumbled top edge: chunks out of it, rubble, a tuft of dead grass */
      px(g, CONCRETE[7], 0, 0, T, 1); px(g, CONCRETE[6], 0, 1, T, 1);
      for (let x = 0; x < T; x++) if (r() < .25) px(g, "rgba(0,0,0,0)", x, 0);
      for (let x = 0; x < T; x += 1) if (r() < .2) { g.clearRect(x, 0, 1, 1 + (r() * 2 | 0)); }
      px(g, CONCRETE[2], 0, 2, T, 1);
      for (let i = 0; i < 3; i++) px(g, CONCRETE[5 + (r() * 3 | 0)], r() * T | 0, 2 + (r() * 2 | 0));
      if (r() < .6) { const x = 2 + (r() * 11 | 0); px(g, WEED[1], x, 0, 1, 2); px(g, WEED[2], x + 1, 0, 1, 1); px(g, WEED[0], x - 1, 1, 1, 1); }
    }
  });
  tiles.ground = [block(false, 0, 5), block(false, 1, 17), block(false, 2, 29)];
  tiles.groundTop = [block(true, 0, 9), block(true, 0, 21), block(true, 1, 33)];

  /* a ledge is a rusted I-beam: flanges top and bottom, a riveted web */
  tiles.plat = mk(g => {
    const r = rng(11);
    px(g, RUST[4], 0, 0, T, 2); px(g, RUST[6], 0, 0, T, 1);
    px(g, RUST[2], 2, 2, T - 4, 3); px(g, RUST[3], 2, 2, T - 4, 1);
    px(g, RUST[3], 0, 5, T, 2); px(g, RUST[1], 0, 6, T, 1);
    for (const x of [3, 8, 13]) px(g, RUST[5], x, 3);
    for (let i = 0; i < 5; i++) px(g, RUST[1], r() * T | 0, r() * 7 | 0);
  });

  /* the hazard: bent rebar up out of the rubble, and broken glass */
  tiles.spikes = mk(g => {
    px(g, CONCRETE[3], 0, 13, T, 3); px(g, CONCRETE[5], 0, 13, T, 1);
    for (const [x, h, lean] of [[2, 10, 1], [6, 13, -1], [11, 9, 2], [14, 11, 0]]) {
      for (let k = 0; k < h; k++) { const xx = x + Math.round(lean * k / h); px(g, k < 2 ? RUST[6] : RUST[4], xx, 13 - k); px(g, RUST[2], xx + 1, 13 - k); }
    }
    /* glass: pale shards with a glint */
    g.fillStyle = "rgba(190, 230, 225, 0.85)";
    for (const [x, h] of [[4, 5], [9, 6]]) { g.beginPath(); g.moveTo(x, 13); g.lineTo(x + 1, 13 - h); g.lineTo(x + 3, 13); g.fill(); }
    px(g, "#ffffff", 5, 9); px(g, "#ffffff", 10, 8);
  });

  /* doors: roll-down storefront shutters painted in the door's colour; a
     keypad on the top tile, slats below */
  const COLOURS = [[12, 4], [14, 6], [10, 2], [9, 1], [7, 8]];
  const door = (a, b, top) => mk(g => {
    px(g, CONCRETE[5], 0, 0, T, T); px(g, CONCRETE[6], 0, 0, 1, T); px(g, CONCRETE[2], T - 1, 0, 1, T);
    for (let y = top ? 4 : 0; y < T; y += 3) { px(g, VSTEEL[4], 1, y, T - 2, 2); px(g, VSTEEL[6], 1, y, T - 2, 1); px(g, VSTEEL[1], 1, y + 2, T - 2, 1); }
    if (top) {
      px(g, CONCRETE[3], 1, 0, T - 2, 4); px(g, CONCRETE[6], 1, 0, T - 2, 1);
      px(g, E(b), 1, 8, T - 2, 5); px(g, E(a), 1, 9, T - 2, 3);
      g.fillStyle = "rgba(255, 255, 255, 0.3)"; g.fillRect(1, 9, T - 2, 1);
      px(g, VSTEEL[0], 11, 1, 4, 4); px(g, E(a), 12, 2, 2, 1); px(g, VSTEEL[6], 12, 3, 1, 1); px(g, VSTEEL[6], 13, 3, 1, 1);
    } else {
      px(g, E(b), 1, 13, T - 2, 2);
      px(g, RUST[3], 3, 4, 2, 1); px(g, RUST[3], 10, 9, 3, 1);
    }
  });
  tiles.doors = COLOURS.map(([a, b]) => door(a, b, true));
  tiles.doorsBelow = COLOURS.map(([a, b]) => door(a, b, false));

  /* the exit: a stairwell door in a concrete frame, a green EXIT lamp over
     it; open, stairs going up into the light */
  const stair = open => { const c = makeCanvas(T, T * 2), g = c.getContext("2d");
    px(g, CONCRETE[5], 0, 2, T, 30); px(g, CONCRETE[7], 0, 2, T, 1); px(g, CONCRETE[6], 0, 2, 1, 30); px(g, CONCRETE[2], T - 1, 2, 1, 30);
    if (open) {
      px(g, "#141210", 2, 5, 12, 27);
      for (let k = 0; k < 6; k++) { const y = 30 - k * 4, x = 2 + k * 2; px(g, CONCRETE[3 + (k >> 1)], x, y, 14 - x, 2); px(g, CONCRETE[6], x, y, 14 - x, 1); }
      g.fillStyle = "rgba(255, 236, 170, 0.45)"; g.fillRect(8, 5, 6, 10);
    } else {
      px(g, "#5a6a4a", 2, 5, 12, 27); px(g, "#76885e", 2, 5, 12, 1); px(g, "#3a4630", 13, 5, 1, 27);
      px(g, "#76885e", 4, 8, 8, 9); px(g, "#4a5a3c", 4, 16, 8, 1);
      px(g, VSTEEL[6], 3, 19, 10, 1); px(g, VSTEEL[3], 3, 20, 10, 1);
      px(g, RUST[4], 5, 24, 3, 2); px(g, RUST[3], 10, 12, 2, 3);
    }
    g.fillStyle = "rgba(82, 224, 106, 0.30)"; g.fillRect(3, 0, 10, 5);
    px(g, "#1f7a33", 5, 0, 6, 3); px(g, "#52e06a", 6, 0, 4, 2); px(g, "#c8ffd2", 7, 0, 2, 1);
    return c; };
  tiles.exit = [stair(false), stair(true)];

  /* ice: frost on concrete */
  tiles.ice = mk(g => {
    const r = rng(43);
    g.drawImage(tiles.ground[0], 0, 0);
    for (let y = 0; y < 4; y++) px(g, ["#e9fbff", "#b2e4f6", "#78c2e4", "#4a92c0"][y], 0, y, T, 1);
    for (let i = 0; i < 10; i++) px(g, r() < .5 ? "#b2e4f6" : "#e9fbff", r() * T | 0, 4 + (r() * 12 | 0));
  });

  /* a hint sign is a loudspeaker on a pole, a little plate under it */
  tiles.sign = mk(g => {
    px(g, VSTEEL[3], 7, 6, 2, 10); px(g, VSTEEL[5], 7, 6, 1, 10);
    g.fillStyle = VSTEEL[5]; g.beginPath(); g.moveTo(8, 3); g.lineTo(14, 0); g.lineTo(14, 7); g.closePath(); g.fill();
    g.fillStyle = VSTEEL[2]; g.beginPath(); g.moveTo(13, 1); g.lineTo(15, 0); g.lineTo(15, 7); g.lineTo(13, 6); g.closePath(); g.fill();
    px(g, VSTEEL[7], 9, 3, 4, 1);
    px(g, "#2d5a8a", 2, 9, 12, 5); px(g, "#4a86c0", 2, 9, 12, 1); px(g, "#e8eef4", 4, 11, 8, 1);
    px(g, RUST[4], 3, 13, 2, 1);
  });
}

/* VGA ramps for the Vaults, dark to light: a cool steel, and frost */
const VSTEEL = ["#0f1217", "#1c222a", "#2b333d", "#3d4752", "#535f6c", "#6f7c8a", "#95a1ae", "#c4ccd5"];
const FROST = ["#173450", "#2a5f8a", "#4a92c0", "#78c2e4", "#b2e4f6", "#e9fbff"];
const VLIGHT = { green: "#52e06a", greenHot: "#c8ffd2", greenDim: "#1f7a33", spark: "#fff3a0", sparkHot: "#ffffff", sparkGlow: "rgba(127, 216, 255, 0.35)", screen: "#05200e", text: "#3cff7a", textDim: "#1d9a46", lamp: "#ff3b2f", lampHot: "#ffc0b8", gold: "#ffd23f" };

/* The Vault's own tiles, over the shared ones. Steel panels, catwalks,
 * security doors, a lift for the exit, terminals for the signs; cold, it is
 * all frosted, and the hazards are ice instead of live wires. Full colour:
 * the ramps above. */
function vaultTiles(tiles, th, mk, E) {
  const cold = !!th.cold;
  const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const rivet = (g, x, y) => { px(g, VSTEEL[6], x, y, 2, 2); px(g, VSTEEL[7], x, y); px(g, VSTEEL[1], x + 1, y + 1); px(g, VSTEEL[2], x + 2, y + 1, 1, 2); };
  /* frost creeps in from the edges: specks, thickest near them */
  const frost = (g, r, n) => {
    for (let i = 0; i < n; i++) {
      const edge = r() < .6, x = edge ? (r() < .5 ? r() * 4 : T - 1 - r() * 4) | 0 : r() * T | 0, y = edge ? r() * T | 0 : (r() < .5 ? r() * 4 : T - 1 - r() * 4) | 0;
      px(g, FROST[3 + (r() * 3 | 0)], x, y);
    }
    g.fillStyle = "rgba(120, 190, 235, 0.10)"; g.fillRect(0, 0, T, T);
  };
  const icicles = (g, r, y, every = 3) => {
    for (let x = 1; x < T; x += every) if (r() < .75) {
      const len = 2 + (r() * 4 | 0);
      for (let k = 0; k < len; k++) px(g, FROST[Math.max(2, 5 - k)], x, y + k);
      px(g, FROST[5], x - 1 >= 0 ? x : x, y);
    }
  };

  /* a steel panel: bevelled, shaded top to bottom, riveted; three kinds so
     a wall isn't one panel repeated: plain, a vent, a seam */
  const panel = (top, kind, seed) => mk(g => {
    const r = rng(seed);
    for (let y = 0; y < T; y++) px(g, y < 5 ? VSTEEL[4] : y < 11 ? VSTEEL[3] : VSTEEL[3], 0, y, T, 1);
    for (let y = 1; y < 5; y++) for (let x = 1; x < T - 1; x++) if (((x + y) & 3) === 0) px(g, VSTEEL[3], x, y);
    /* brushed streaks */
    for (let i = 0; i < 4; i++) px(g, VSTEEL[5], 2 + (r() * 10 | 0), 2 + (r() * 12 | 0), 3 + (r() * 4 | 0), 1);
    px(g, VSTEEL[6], 0, 0, T, 1); px(g, VSTEEL[5], 0, 0, 1, T); px(g, VSTEEL[7], 0, 0);
    px(g, VSTEEL[1], 0, T - 1, T, 1); px(g, VSTEEL[1], T - 1, 0, 1, T); px(g, VSTEEL[2], 1, T - 2, T - 2, 1);
    rivet(g, 2, 2); rivet(g, 11, 2); rivet(g, 2, 11); rivet(g, 11, 11);
    if (kind === 1) for (const y of [5, 7, 9]) { px(g, VSTEEL[0], 5, y, 6, 1); px(g, VSTEEL[5], 5, y + 1, 6, 1); }
    if (kind === 2) { px(g, VSTEEL[1], 1, 7, T - 2, 1); px(g, VSTEEL[5], 1, 8, T - 2, 1); }
    if (cold) frost(g, r, 16);
    if (top) {
      /* a floor plate on top; cold, a lip of frost with icicles under it */
      px(g, VSTEEL[7], 0, 0, T, 1); px(g, VSTEEL[6], 0, 1, T, 1); px(g, VSTEEL[5], 0, 2, T, 1); px(g, VSTEEL[0], 0, 3, T, 1);
      for (let x = 1; x < T; x += 4) px(g, VSTEEL[4], x, 1, 2, 1);
      if (cold) { px(g, FROST[5], 0, 0, T, 1); px(g, FROST[4], 0, 1, T, 1); px(g, FROST[3], 0, 2, T, 1); icicles(g, r, 3); }
    }
  });
  tiles.ground = [panel(false, 0, 7), panel(false, 1, 19), panel(false, 2, 31)];
  tiles.groundTop = [panel(true, 0, 11), panel(true, 0, 23), panel(true, 1, 37)];

  /* a catwalk: grating in a frame, on brackets */
  tiles.plat = mk(g => {
    px(g, VSTEEL[5], 0, 0, T, 5); px(g, VSTEEL[7], 0, 0, T, 1); px(g, VSTEEL[6], 0, 1, T, 1);
    for (let x = 1; x < T; x += 3) { px(g, VSTEEL[0], x, 2, 2, 2); px(g, VSTEEL[2], x, 2, 2, 1); }
    px(g, VSTEEL[1], 0, 4, T, 1);
    for (const x of [2, 12]) { px(g, VSTEEL[3], x, 5, 2, 3); px(g, VSTEEL[5], x, 5, 1, 3); px(g, VSTEEL[1], x + 1, 7, 1, 1); }
    if (cold) { px(g, FROST[5], 0, 0, T, 1); px(g, FROST[4], 3, 1, 4, 1); px(g, FROST[4], 10, 1, 3, 1); icicles(g, rng(5), 5, 4); }
  });

  /* the hazard: a sparking cable on a floor grate, a blue glow round the
     arcs; or, cold, shards of ice shaded light to dark */
  tiles.spikes = mk(g => {
    if (cold) {
      for (const [x, h, w] of [[0, 9, 4], [3, 12, 5], [7, 8, 4], [10, 11, 6]]) {
        const tip = x + w / 2;
        g.fillStyle = FROST[2]; g.beginPath(); g.moveTo(x, 16); g.lineTo(tip, 16 - h); g.lineTo(x + w, 16); g.fill();
        g.fillStyle = FROST[4]; g.beginPath(); g.moveTo(x, 16); g.lineTo(tip, 16 - h); g.lineTo(tip, 16); g.fill();
        px(g, FROST[5], Math.floor(tip), 16 - h, 1, 3); px(g, FROST[1], x + w - 1, 14, 1, 2);
      }
      return;
    }
    px(g, VSTEEL[2], 0, 12, T, 4); px(g, VSTEEL[4], 0, 12, T, 1);
    for (let x = 1; x < T; x += 3) px(g, VSTEEL[0], x, 13, 2, 2);
    const arc = [[1, 12], [4, 7], [6, 10], [9, 5], [11, 9], [14, 6]];
    g.strokeStyle = VLIGHT.sparkGlow; g.lineWidth = 3; g.beginPath(); arc.forEach(([x, y], i) => i ? g.lineTo(x + .5, y + .5) : g.moveTo(x + .5, y + .5)); g.stroke();
    g.strokeStyle = VLIGHT.spark; g.lineWidth = 1; g.beginPath(); arc.forEach(([x, y], i) => i ? g.lineTo(x + .5, y + .5) : g.moveTo(x + .5, y + .5)); g.stroke();
    for (const [x, y] of [[4, 7], [9, 5], [14, 6]]) px(g, VLIGHT.sparkHot, x, y);
  });

  /* security doors: a steel slab with the door's colour in a band and a
     card reader on the top tile; the tiles below are slab. Red, yellow,
     green, blue, and silver */
  const COLOURS = [[12, 4], [14, 6], [10, 2], [9, 1], [7, 8]];
  const door = (a, b, top) => mk(g => {
    px(g, VSTEEL[5], 0, 0, T, T); px(g, VSTEEL[6], 0, 0, 1, T); px(g, VSTEEL[2], T - 1, 0, 1, T);
    for (let x = 2; x < T - 2; x++) px(g, x < 6 ? VSTEEL[4] : x < 10 ? VSTEEL[3] : VSTEEL[3], x, 0, 1, T);
    px(g, VSTEEL[0], T / 2, 0, 1, T); px(g, VSTEEL[5], T / 2 + 1, 0, 1, T);
    if (top) {
      px(g, E(b), 2, 8, T - 4, 6); px(g, E(a), 2, 9, T - 4, 4);
      g.fillStyle = "rgba(255, 255, 255, 0.35)"; g.fillRect(2, 9, T - 4, 1);
      px(g, VSTEEL[0], T / 2, 8, 1, 6);
      px(g, VSTEEL[0], 10, 1, 4, 5); px(g, VSTEEL[2], 10, 1, 4, 1);
      g.fillStyle = E(a); g.globalAlpha = 0.35; g.fillRect(10, 2, 4, 3); g.globalAlpha = 1; px(g, E(a), 11, 3, 2, 1);
      px(g, VSTEEL[7], 0, 0, T, 1);
    } else {
      px(g, E(b), 2, 13, T - 4, 2);
      for (const y of [4, 9]) { px(g, VSTEEL[6], 3, y, 4, 1); px(g, VSTEEL[6], 9, y, 4, 1); px(g, VSTEEL[2], 3, y + 1, 4, 1); px(g, VSTEEL[2], 9, y + 1, 4, 1); }
    }
    if (cold) { const r = rng(a * 3 + b + (top ? 1 : 0)); if (top) { px(g, FROST[5], 2, 0, T - 4, 1); px(g, FROST[4], 2, 1, T - 4, 1); } frost(g, r, 8); }
  });
  tiles.doors = COLOURS.map(([a, b]) => door(a, b, true));
  tiles.doorsBelow = COLOURS.map(([a, b]) => door(a, b, false));

  /* the exit: a lift, 16x32. Shut, two shaded steel leaves with green up
     arrows and a green lamp, glowing; open, a warm lit car */
  const lift = open => { const c = makeCanvas(T, T * 2), g = c.getContext("2d");
    px(g, VSTEEL[5], 0, 2, T, 30); px(g, VSTEEL[7], 0, 2, T, 1); px(g, VSTEEL[6], 0, 2, 1, 30); px(g, VSTEEL[2], T - 1, 2, 1, 30);
    if (open) {
      for (let y = 5; y < 32; y++) px(g, y < 8 ? "#ffe3a0" : y < 12 ? "#7a6440" : "#14110c", 2, y, 12, 1);
      px(g, VSTEEL[3], 2, 29, 12, 3); px(g, VSTEEL[5], 2, 29, 12, 1);
    } else {
      for (let x = 2; x < 14; x++) px(g, x < 5 || (x > 8 && x < 11) ? VSTEEL[4] : VSTEEL[3], x, 5, 1, 27);
      px(g, VSTEEL[0], 7, 5, 2, 27); px(g, VSTEEL[6], 9, 5, 1, 27);
      for (let y = 9; y < 30; y += 6) { px(g, VSTEEL[6], 3, y, 3, 1); px(g, VSTEEL[6], 10, y, 3, 1); }
      for (const ax of [4, 11]) { px(g, VLIGHT.green, ax, 14, 1, 1); px(g, VLIGHT.green, ax - 1, 15, 3, 1); px(g, VLIGHT.greenDim, ax - 1, 16, 3, 1); }
    }
    g.fillStyle = "rgba(82, 224, 106, 0.30)"; g.fillRect(3, 0, 10, 5);
    px(g, VLIGHT.greenDim, 5, 0, 6, 3); px(g, VLIGHT.green, 6, 0, 4, 2); px(g, VLIGHT.greenHot, 7, 0, 2, 1);
    if (cold) { const r = rng(open ? 2 : 3); px(g, FROST[5], 0, 2, T, 1); px(g, FROST[4], 0, 3, T, 1); for (let x = 1; x < T; x += 4) for (let k = 0; k < 2 + (r() * 3 | 0); k++) px(g, FROST[Math.max(2, 4 - k)], x, 4 + k); }
    return c; };
  tiles.exit = [lift(false), lift(true)];

  /* ice: a steel floor under thick frost, glassy on top */
  tiles.ice = mk(g => {
    const r = rng(41);
    g.drawImage(tiles.ground[0], 0, 0);
    for (let y = 0; y < 6; y++) px(g, FROST[Math.max(1, 5 - y)], 0, y, T, 1);
    px(g, "#ffffff", 2, 1, 4, 1); px(g, "#ffffff", 10, 2, 2, 1);
    for (let i = 0; i < 12; i++) px(g, FROST[3 + (r() * 3 | 0)], r() * T | 0, 6 + (r() * 10 | 0));
    px(g, FROST[0], 0, 6, T, 1);
  });

  /* a hint sign is a terminal: a glowing green screen in a steel bezel */
  tiles.sign = mk(g => {
    px(g, VSTEEL[3], 6, 11, 4, 3); px(g, VSTEEL[5], 6, 11, 1, 3); px(g, VSTEEL[2], 3, 14, 10, 2); px(g, VSTEEL[5], 3, 14, 10, 1);
    px(g, VSTEEL[5], 1, 1, 14, 10); px(g, VSTEEL[7], 1, 1, 14, 1); px(g, VSTEEL[2], 1, 10, 14, 1);
    px(g, VLIGHT.screen, 2, 2, 12, 8);
    g.fillStyle = "rgba(60, 255, 122, 0.12)"; g.fillRect(2, 2, 12, 8);
    for (const [y, w] of [[3, 8], [5, 10], [7, 6]]) px(g, VLIGHT.text, 3, y, w, 1);
    for (const [y, w] of [[4, 5], [6, 7], [8, 3]]) px(g, VLIGHT.textDim, 3, y, w, 1);
    px(g, VLIGHT.text, 10, 7, 1, 1);
  });
}

/* far background: a strip of silhouettes per theme, repeated, scrolled at
 * a fraction of the camera */
function paintFar(themeName) {
  const th = THEMES[themeName], c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(99);
  g.fillStyle = EGA[th.sky]; g.fillRect(0, 0, 320, 200);
  /* stars */
  for (let i = 0; i < 70; i++) { g.fillStyle = EGA[r() < .2 ? 14 : r() < .5 ? 7 : 15]; g.fillRect(r() * 320 | 0, r() * 140 | 0, 1, 1); }
  if (themeName === "hiss" || themeName === "garden") {
    /* a ringed moon */
    g.fillStyle = EGA[themeName === "hiss" ? 6 : 3]; g.beginPath(); g.arc(250, 40, 18, 0, Math.PI * 2); g.fill();
    g.fillStyle = EGA[themeName === "hiss" ? 12 : 11]; g.beginPath(); g.arc(245, 35, 14, 0, Math.PI * 2); g.fill();
    g.strokeStyle = EGA[14]; g.lineWidth = 1; g.beginPath(); g.ellipse(250, 40, 30, 6, -0.3, 0, Math.PI * 2); g.stroke();
  }
  /* hills */
  for (const [layer, base, amp, col] of [[0, 150, 22, th.far[1]], [1, 170, 14, th.far[0]]]) {
    g.fillStyle = EGA[col];
    g.beginPath(); g.moveTo(0, 200);
    for (let x = 0; x <= 320; x += 4) g.lineTo(x, base - amp * (0.5 + 0.5 * Math.sin(x / (layer ? 23 : 41) + layer * 2)) - (layer ? 0 : 8 * Math.sin(x / 13)));
    g.lineTo(320, 200); g.fill();
  }
  if (themeName === "fort") {
    g.fillStyle = EGA[8];
    for (let x = 10; x < 320; x += 60) { g.fillRect(x, 90, 26, 110); for (let k = 0; k < 26; k += 8) g.fillRect(x + k, 84, 5, 6); g.fillStyle = EGA[14]; g.fillRect(x + 10, 110, 4, 6); g.fillStyle = EGA[8]; }
  }
  if (th.style === "vault") return paintVaultFar(th);
  if (th.style === "raiders") return paintRaiderFar();
  if (th.style === "ruins") return paintRuinFar();
  return c;
}

/* The raider camp behind: the Glow's dusk in bands from night to a hot
 * horizon, a swollen sun, mesas, and Fort Scrap low against it: shacks, a
 * watchtower with a lit window, scaffolds and flags. Full colour. */
function paintRaiderFar() {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(13);
  const px = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  /* the sky: eighteen bands, blended, stepped for the old look */
  const stops = [[0, [11, 10, 30]], [70, [34, 18, 60]], [105, [106, 31, 69]], [128, [176, 58, 46]], [146, [224, 112, 44]], [160, [246, 181, 74]]];
  const at = y => { for (let i = 1; i < stops.length; i++) if (y <= stops[i][0]) { const [y0, a] = stops[i - 1], [y1, b] = stops[i], f = (y - y0) / (y1 - y0); return a.map((v, k) => Math.round(v + (b[k] - v) * f)); } return stops[stops.length - 1][1]; };
  for (let y = 0; y < 200; y += 6) { const [R, G, B] = at(y); px(`rgb(${R},${G},${B})`, 0, y, 320, 6); }
  for (let i = 0; i < 50; i++) { const y = r() * 70 | 0; px(r() < .3 ? "#ffe9a8" : "#c8c0d8", r() * 320 | 0, y); }
  /* a swollen sun on the horizon */
  g.fillStyle = "#ffe08a"; g.beginPath(); g.arc(70, 158, 18, Math.PI, 0); g.fill();
  g.fillStyle = "#fff4cc"; g.beginPath(); g.arc(70, 158, 12, Math.PI, 0); g.fill();
  /* mesas, far then near */
  const ridge = (col, pts) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, 200); for (const [x, y] of pts) g.lineTo(x, y); g.lineTo(320, 200); g.fill(); };
  ridge("#5a2a2c", [[0, 156], [30, 156], [38, 136], [90, 136], [98, 152], [160, 152], [168, 130], [230, 130], [236, 148], [320, 148]]);
  ridge("#3a1c20", [[0, 168], [60, 168], [70, 160], [120, 160], [128, 170], [210, 170], [216, 162], [270, 162], [276, 170], [320, 170]]);
  /* Fort Scrap, low along the bottom: shacks of mismatched heights */
  const dark = "#1c1014";
  let x = 0;
  while (x < 320) {
    const w = 12 + (r() * 20 | 0), h = 8 + (r() * 16 | 0);
    px(dark, x, 176 - h, w, h + 24);
    if (r() < .5) { px(PAINT.lamp, x + 4, 180 - h, 2, 2); px(PAINT.lampHot, x + 4, 180 - h); }
    x += w + (r() < .3 ? 3 : 0);
  }
  /* a watchtower and its flag */
  px(dark, 250, 120, 3, 56); px(dark, 263, 120, 3, 56); px(dark, 245, 110, 26, 12);
  px(PAINT.lamp, 252, 114, 5, 3); px(dark, 257, 92, 2, 18); px("#a0201c", 259, 92, 10, 5);
  /* scaffold poles and flags along the roofline */
  for (const fx of [40, 120, 190]) { px(dark, fx, 146, 2, 30); px("#a0201c", fx + 2, 146, 7, 4); }
  return c;
}

/* The ruins behind: the Glow's hazy daylight, sickly yellow-green, and
 * Old Litterburg's broken skyline in three layers, the far ones paler in
 * the haze: towers with their tops sheared off, empty windows, a billboard,
 * a water tower, and a radio mast with a red light (Auntie's). */
function paintRuinFar() {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(17);
  const px = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const stops = [[0, [92, 106, 88]], [60, [140, 150, 104]], [120, [196, 192, 128]], [170, [232, 220, 160]]];
  const at = y => { for (let i = 1; i < stops.length; i++) if (y <= stops[i][0]) { const [y0, a] = stops[i - 1], [y1, b] = stops[i], f = (y - y0) / (y1 - y0); return a.map((v, k) => Math.round(v + (b[k] - v) * f)); } return stops[stops.length - 1][1]; };
  for (let y = 0; y < 200; y += 5) { const [R, G, B] = at(y); px(`rgb(${R},${G},${B})`, 0, y, 320, 5); }
  /* a pale sun behind the haze */
  g.fillStyle = "rgba(255, 250, 210, 0.55)"; g.beginPath(); g.arc(250, 46, 14, 0, Math.PI * 2); g.fill();
  g.fillStyle = "rgba(255, 250, 220, 0.18)"; g.beginPath(); g.arc(250, 46, 26, 0, Math.PI * 2); g.fill();
  /* the radio mast, far off, with its red light */
  const mast = "#8c9278";
  px(mast, 58, 70, 2, 70); for (let y = 74; y < 140; y += 6) { px(mast, 55, y, 8, 1); }
  px("#ff3b2f", 58, 67, 2, 2); g.fillStyle = "rgba(255, 59, 47, 0.25)"; g.beginPath(); g.arc(59, 68, 5, 0, Math.PI * 2); g.fill();
  /* three layers of towers, nearer is darker; tops sheared at an angle */
  const layer = (col, win, y0, hmin, hmax, wmin, wmax, seed) => {
    const rr = rng(seed); let x = -10;
    while (x < 330) {
      const w = wmin + (rr() * (wmax - wmin) | 0), h = hmin + (rr() * (hmax - hmin) | 0), top = y0 - h, cut = rr() < .6 ? (rr() * 12 | 0) : 0;
      g.fillStyle = col; g.beginPath(); g.moveTo(x, 200); g.lineTo(x, top + (rr() < .5 ? cut : 0)); g.lineTo(x + w, top + (rr() < .5 ? 0 : cut)); g.lineTo(x + w, 200); g.fill();
      if (win) for (let wy = top + 8; wy < 196; wy += 6) for (let wx = x + 3; wx < x + w - 3; wx += 5) if (rr() < .7) px(win, wx, wy, 2, 3);
      x += w + (rr() * 6 | 0);
    }
  };
  layer("#9ea08a", null, 150, 30, 70, 14, 30, 3);
  layer("#787c66", "#9a9c84", 166, 20, 60, 16, 34, 5);
  /* a billboard on stilts, and a water tower */
  px("#4a4d40", 196, 112, 2, 40); px("#4a4d40", 224, 112, 2, 40);
  px("#5a5e4c", 186, 92, 50, 22); px("#c8b47a", 188, 94, 46, 18); px("#a04a36", 190, 97, 20, 12); px("#e8dcb0", 214, 98, 18, 3); px("#e8dcb0", 214, 103, 14, 3);
  px("#55594c", 116, 120, 2, 40); px("#55594c", 132, 120, 2, 40); px("#55594c", 113, 100, 24, 22); px("#6a6e5c", 113, 100, 24, 3);
  layer("#4a4d40", "#33352c", 184, 8, 34, 18, 40, 9);
  /* rubble along the bottom */
  for (let i = 0; i < 60; i++) { const x = r() * 320 | 0, w = 2 + (r() * 6 | 0); px(r() < .5 ? "#3a3d33" : "#55594c", x, 192 + (r() * 4 | 0), w, 8); }
  return c;
}

/* The Vault behind: no sky, no hills; a wall of panels, pipes and conduits,
 * warning lamps, and the great round door the shelter was sealed with.
 * Cold, it is blue and hung with icicles. Full colour. */
function paintVaultFar(th) {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(7), cold = !!th.cold;
  const px = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const base = cold ? "#0b1d30" : "#0c0f13", grid = cold ? "#173451" : "#1a2028", gridHi = cold ? "#244c70" : "#262e38";
  const pipe = cold ? ["#173450", "#2c5c86", "#4a8ab8", "#86c4e6"] : [VSTEEL[1], VSTEEL[3], VSTEEL[4], VSTEEL[6]];
  px(base, 0, 0, 320, 200);
  /* the panel grid, with a lit edge and corner bolts */
  for (let x = 0; x < 320; x += 40) { px(grid, x, 0, 1, 200); px(gridHi, x + 1, 0, 1, 200); }
  for (let y = 0; y < 200; y += 32) { px(grid, 0, y, 320, 1); px(gridHi, 0, y + 1, 320, 1); }
  for (let x = 0; x < 320; x += 40) for (let y = 0; y < 200; y += 32) { px(gridHi, x + 4, y + 4, 2, 2); px(gridHi, x + 34, y + 4, 2, 2); }
  /* the sealed door: a toothed ring, a shaded wheel, bolts, its number */
  const dx = 236, dy = 92;
  const ring = g.createRadialGradient(dx - 12, dy - 14, 6, dx, dy, 50);
  ring.addColorStop(0, pipe[3]); ring.addColorStop(0.6, pipe[2]); ring.addColorStop(1, pipe[0]);
  g.fillStyle = ring;
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.save(); g.translate(dx + Math.cos(a) * 44, dy + Math.sin(a) * 44); g.rotate(a); g.fillRect(-5, -6, 10, 12); g.restore(); }
  g.beginPath(); g.arc(dx, dy, 44, 0, Math.PI * 2); g.fill();
  g.fillStyle = base; g.beginPath(); g.arc(dx, dy, 34, 0, Math.PI * 2); g.fill();
  const wheel = g.createRadialGradient(dx - 10, dy - 10, 4, dx, dy, 32);
  wheel.addColorStop(0, pipe[2]); wheel.addColorStop(1, pipe[0]);
  g.fillStyle = wheel; g.beginPath(); g.arc(dx, dy, 30, 0, Math.PI * 2); g.fill();
  g.strokeStyle = pipe[3]; g.lineWidth = 1; g.beginPath(); g.arc(dx, dy, 30, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, bx = dx + Math.cos(a) * 22 - 2, by = dy + Math.sin(a) * 22 - 2; px(base, bx, by, 4, 4); px(pipe[2], bx, by, 3, 3); px(pipe[3], bx, by); }
  g.font = "bold 18px monospace"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "#000"; g.fillText(String(th.no), dx + 1, dy + 2); g.fillStyle = VLIGHT.gold; g.fillText(String(th.no), dx, dy + 1);
  /* pipes, shaded round, with collars; and a conduit along the top */
  for (const x of [22, 66, 150]) {
    [pipe[1], pipe[2], pipe[3], pipe[2], pipe[1], pipe[0]].forEach((col, k) => px(col, x + k, 0, 1, 200));
    for (let y = 18 + (x % 30); y < 200; y += 46) { px(pipe[1], x - 2, y, 10, 4); px(pipe[3], x - 2, y, 10, 1); px(pipe[0], x - 2, y + 3, 10, 1); }
  }
  [pipe[1], pipe[3], pipe[2], pipe[1], pipe[0]].forEach((col, k) => px(col, 0, 14 + k, 320, 1));
  /* warning lamps, on the pipes, glowing */
  for (const [x, y] of [[22, 60], [66, 130], [150, 44], [150, 170]]) {
    g.fillStyle = "rgba(255, 59, 47, 0.18)"; g.beginPath(); g.arc(x + 3, y + 2, 9, 0, Math.PI * 2); g.fill();
    px("#000", x - 2, y - 1, 10, 6); px(VLIGHT.lamp, x - 1, y, 8, 4); px(VLIGHT.lampHot, x, y, 6, 1);
  }
  /* cold: frost in the air, and icicles off the conduit */
  if (cold) {
    for (let i = 0; i < 140; i++) px(FROST[2 + (r() * 3 | 0)], r() * 320 | 0, r() * 200 | 0);
    for (let x = 2; x < 320; x += 5) { const len = 2 + (r() * 8 | 0); for (let k = 0; k < len; k++) px(FROST[Math.max(2, 5 - (k >> 1))], x, 19 + k); }
  }
  return c;
}

/* The wasteland's world map (Book 1): the Glow from above. Cracked dusty
 * earth in four variants; rock drawn as continuous outcrop, lit on its top
 * edge and shaded on its bottom wherever it meets open ground; a glowing
 * irradiated pool for water; a striped barricade for barriers; a banner
 * with a star for a done level; a Tube station hatch for a teleporter;
 * the Catamaran crash-landed, scorched and smoking. Level markers (32x32,
 * drawn once over each entrance) show the level's type: a vault door set
 * in rock, a Scrapper camp, a broken building. Full colour. */
function paintWasteMap(classic) {
  const mk = (fn, w = T, h = T) => { const c = makeCanvas(w, h); fn(c.getContext("2d")); return c; };
  const px = (g, col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const EARTH = ["#6e5a3a", "#86704a", "#9c8456", "#b29a68", "#c8b07c"];
  const ROCK = ["#2c1e18", "#4a3226", "#664634", "#82583e", "#a0704c", "#c08c60"];
  const ground = [0, 1, 2, 3].map(v => mk(g => {
    const r = rng(101 + v * 17);
    px(g, EARTH[2], 0, 0, T, T);
    for (let i = 0; i < 26; i++) px(g, EARTH[1 + (r() * 4 | 0)], r() * T | 0, r() * T | 0, 1 + (r() * 2 | 0), 1);
    /* a crack */
    if (v !== 3) { let x = r() * T | 0, y = 0; for (let i = 0; i < 9 && y < T; i++) { px(g, EARTH[0], x, y); x += (r() * 3 | 0) - 1; y += 1 + (r() < .3 ? 1 : 0); } }
    /* dead grass, a pebble */
    if (v === 1) { px(g, "#8a8446", 4, 9, 1, 2); px(g, "#a8a258", 5, 8, 1, 3); px(g, "#8a8446", 6, 10, 1, 1); }
    if (v === 2) { px(g, ROCK[2], 11, 5, 2, 2); px(g, ROCK[4], 11, 5); }
  }));
  /* rock, by which sides are open: 1 above, 2 right, 4 below, 8 left */
  const rockCache = {};
  const rockAt = mask => rockCache[mask] || (rockCache[mask] = mk(g => {
    const r = rng(7 + mask);
    px(g, ROCK[2], 0, 0, T, T);
    for (let i = 0; i < 30; i++) px(g, ROCK[1 + (r() * 4 | 0)], r() * T | 0, r() * T | 0, 1 + (r() * 3 | 0), 1);
    for (let i = 0; i < 3; i++) { const x = r() * 12 | 0, y = r() * 12 | 0; px(g, ROCK[4], x, y, 3, 1); px(g, ROCK[1], x, y + 1, 3, 1); }
    if (mask & 1) { px(g, ROCK[5], 0, 0, T, 1); px(g, ROCK[4], 0, 1, T, 2); for (let x = 0; x < T; x++) if (r() < .3) px(g, EARTH[2], x, 0); }
    if (mask & 8) { px(g, ROCK[4], 0, 0, 1, T); }
    if (mask & 2) { px(g, ROCK[1], T - 1, 0, 1, T); }
    if (mask & 4) { px(g, ROCK[0], 0, T - 2, T, 2); px(g, "rgba(0,0,0,0.35)", 0, T - 4, T, 2); }
  }));
  /* an irradiated pool, glowing, two frames */
  const water = [0, 1].map(f => mk(g => {
    px(g, "#1f4a34", 0, 0, T, T);
    for (let y = 2; y < T; y += 5) for (let x = (y + f * 3) % 6; x < T; x += 6) { px(g, "#5ed27a", x, y, 3, 1); px(g, "#b8ffc4", x + 1, y, 1, 1); }
  }));
  /* a barricade: a striped bar on trestles */
  const field = [0, 1, 2].map(f => mk(g => {
    g.drawImage(ground[0], 0, 0);
    px(g, "#3a2a1d", 2, 8, 2, 7); px(g, "#3a2a1d", 12, 8, 2, 7);
    for (let x = 0; x < T; x++) px(g, ((x + f * 2) >> 2) & 1 ? "#d8d4c8" : "#c8302a", x, 5, 1, 4);
    px(g, "#000", 0, 9, T, 1);
  }));
  /* a done level's banner: a pole, a brown banner, a gold star */
  const flag = mk(g => {
    px(g, "#c8b07c", 3, 1, 1, 14); px(g, "#6e5a3a", 4, 1, 1, 14);
    px(g, "#7e2a1a", 4, 1, 9, 6); px(g, "#a83a24", 4, 1, 9, 1);
    px(g, "#f2cf3e", 7, 3, 3, 1); px(g, "#f2cf3e", 8, 2, 1, 3); px(g, "#fff3a8", 8, 3);
  });
  /* a Tube station: a round hatch in a concrete pad, a blue sign blinking */
  const tele = [0, 1].map(f => mk(g => {
    g.drawImage(ground[2], 0, 0);
    px(g, "#827b72", 1, 3, 14, 12); px(g, "#a0988d", 1, 3, 14, 1); px(g, "#4d4842", 1, 14, 14, 1);
    g.fillStyle = "#2b2f34"; g.beginPath(); g.arc(8, 9, 5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#5c636b"; g.lineWidth = 1; g.beginPath(); g.arc(8, 9, 4.5, 0, Math.PI * 2); g.stroke();
    px(g, "#5c636b", 4, 9, 9, 1); px(g, "#5c636b", 8, 5, 1, 9);
    px(g, "#3a3d33", 13, 0, 1, 4); px(g, f ? "#6a9ee0" : "#2f5f9e", 11, 0, 5, 3); px(g, "#e8eef4", 12, 1, 3, 1);
  }));
  /* the Catamaran crash-landed: a scorch, the ship, smoke */
  const ship = mk(g => {
    for (const [x, y] of [[0, 0], [16, 0], [0, 16], [16, 16]]) g.drawImage(ground[(x + y) >> 4 & 3], x, y);
    g.fillStyle = "rgba(20, 12, 8, 0.6)"; g.beginPath(); g.ellipse(16, 27, 15, 5, 0, 0, Math.PI * 2); g.fill();
    g.save(); g.translate(16, 16); g.rotate(-0.18); g.drawImage(classic.shipBare, -16, -16); g.restore();
    g.fillStyle = "rgba(90, 90, 90, 0.75)"; for (const [x, y, r] of [[22, 8, 3], [25, 4, 2.5], [27, 1, 2]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  }, 32, 32);
  /* the level markers, 32x32, by level type */
  const marker = {
    vault: mk(g => {
      g.fillStyle = ROCK[2]; g.beginPath(); g.moveTo(1, 31); g.lineTo(4, 10); g.lineTo(12, 3); g.lineTo(22, 4); g.lineTo(29, 12); g.lineTo(31, 31); g.closePath(); g.fill();
      g.fillStyle = ROCK[4]; g.beginPath(); g.moveTo(4, 10); g.lineTo(12, 3); g.lineTo(22, 4); g.lineTo(18, 7); g.lineTo(9, 9); g.closePath(); g.fill();
      const ring = g.createRadialGradient(13, 16, 2, 16, 19, 11); ring.addColorStop(0, "#c4ccd5"); ring.addColorStop(1, "#3d4752");
      g.fillStyle = "#1c222a"; g.beginPath(); g.arc(16, 19, 10, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; g.fillStyle = "#535f6c"; g.fillRect(16 + Math.cos(a) * 9 - 1.5, 19 + Math.sin(a) * 9 - 1.5, 3, 3); }
      g.fillStyle = ring; g.beginPath(); g.arc(16, 19, 7.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#ffd23f"; g.fillRect(15, 17, 2, 5); g.fillRect(14, 18, 4, 1);
      px(g, "rgba(0,0,0,0.35)", 3, 29, 26, 2);
    }, 32, 32),
    camp: mk(g => {
      px(g, "rgba(0,0,0,0.3)", 3, 28, 27, 3);
      /* a scrap shack: corrugated walls, a lean-to roof, a door */
      for (let x = 6; x < 26; x++) px(g, ["#5c2c17", "#7a3a1c", "#9a4b22", "#7a3a1c"][x % 4], x, 14, 1, 15);
      g.fillStyle = "#3e444b"; g.beginPath(); g.moveTo(4, 15); g.lineTo(27, 10); g.lineTo(28, 13); g.lineTo(5, 18); g.closePath(); g.fill();
      px(g, "#828a93", 5, 15, 22, 1);
      px(g, "#1e0f0a", 13, 20, 6, 9); px(g, "#ffd36a", 22, 18, 3, 3);
      /* fence posts and a red flag */
      for (const x of [1, 28]) { px(g, "#432a16", x, 20, 2, 10); px(g, "#82552a", x, 20, 2, 1); }
      px(g, "#2a1a0e", 25, 1, 1, 12); px(g, "#c8302a", 26, 1, 6, 4); px(g, "#e0503a", 26, 1, 6, 1);
    }, 32, 32),
    ruin: mk(g => {
      px(g, "rgba(0,0,0,0.3)", 3, 28, 27, 3);
      /* a broken building: concrete, a sheared top, empty windows, rubble */
      g.fillStyle = "#827b72"; g.beginPath(); g.moveTo(5, 30); g.lineTo(5, 9); g.lineTo(11, 4); g.lineTo(15, 8); g.lineTo(20, 2); g.lineTo(26, 7); g.lineTo(26, 30); g.closePath(); g.fill();
      g.fillStyle = "#a0988d"; g.beginPath(); g.moveTo(5, 9); g.lineTo(11, 4); g.lineTo(15, 8); g.lineTo(20, 2); g.lineTo(21, 4); g.lineTo(15, 10); g.lineTo(11, 6); g.lineTo(6, 11); g.closePath(); g.fill();
      px(g, "#4d4842", 25, 8, 1, 22);
      for (let y = 11; y < 27; y += 5) for (let x = 8; x < 24; x += 5) if ((x * 3 + y) % 7) { px(g, "#1d1b19", x, y, 3, 3); px(g, "#34302c", x, y + 2, 3, 1); }
      px(g, "#67615a", 2, 27, 7, 3); px(g, "#a0988d", 3, 27, 3, 1); px(g, "#67615a", 22, 28, 8, 2);
      px(g, "#b8622b", 12, 2, 1, 4); px(g, "#b8622b", 16, 5, 1, 3);
    }, 32, 32),
  };
  return { ...classic, ground, rockAt, rock: rockAt(0), water, field, flag, tele, ship, markerFor: marker, teleName: "Tube station" };
}

/* The wasteland's title backdrop, 320x200, painted once: a dusk sky in
 * bands, a swollen sun low on the right, a ruined skyline and Auntie's
 * mast against it, mesas, cracked ground, and the Catamaran crash-landed
 * on the left with its scorch. The animated parts (stars, smoke, the
 * mast's light, Poom) are drawn over it by game.js. */
function paintWasteTitle(shipBare) {
  const c = makeCanvas(320, 200), g = c.getContext("2d"), r = rng(23);
  const px = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const stops = [[0, [10, 8, 26]], [80, [36, 18, 58]], [118, [110, 32, 66]], [142, [178, 60, 46]], [162, [228, 118, 48]], [176, [246, 184, 80]]];
  const at = y => { for (let i = 1; i < stops.length; i++) if (y <= stops[i][0]) { const [y0, a] = stops[i - 1], [y1, b] = stops[i], f = (y - y0) / (y1 - y0); return a.map((v, k) => Math.round(v + (b[k] - v) * f)); } return stops[stops.length - 1][1]; };
  for (let y = 0; y < 200; y += 4) { const [R, G, B] = at(y); px(`rgb(${R},${G},${B})`, 0, y, 320, 4); }
  /* the sun, swollen, setting behind the mesas on the left (the right is
     the menu's) */
  g.fillStyle = "rgba(255, 220, 140, 0.25)"; g.beginPath(); g.arc(66, 128, 32, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#ffd88a"; g.beginPath(); g.arc(66, 128, 20, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#fff0c4"; g.beginPath(); g.arc(66, 128, 13, 0, Math.PI * 2); g.fill();
  /* the ruined skyline: towers with their tops sheared off, a few windows lit */
  let x = 96;
  while (x < 320) {
    const w = 10 + (r() * 16 | 0), h = 20 + (r() * 34 | 0), top = 168 - h, cut = r() * 10 | 0;
    g.fillStyle = "#3a1c2a"; g.beginPath(); g.moveTo(x, 200); g.lineTo(x, top + (r() < .5 ? cut : 0)); g.lineTo(x + w, top + (r() < .5 ? 0 : cut)); g.lineTo(x + w, 200); g.fill();
    for (let wy = top + 6; wy < 166; wy += 6) for (let wx = x + 2; wx < x + w - 2; wx += 4) if (r() < .08) px("#ffd36a", wx, wy, 1, 2);
    x += w + (r() * 4 | 0);
  }
  /* mesas on the left, low enough that the sun sinks behind them */
  g.fillStyle = "#4a2230"; g.beginPath(); g.moveTo(0, 200); g.lineTo(0, 146); g.lineTo(30, 146); g.lineTo(38, 134); g.lineTo(104, 134); g.lineTo(112, 154); g.lineTo(150, 154); g.lineTo(150, 200); g.fill();
  g.fillStyle = "#6a3238"; g.beginPath(); g.moveTo(38, 134); g.lineTo(104, 134); g.lineTo(102, 138); g.lineTo(40, 138); g.closePath(); g.fill();
  /* Auntie's mast, at the left edge */
  px("#2a1420", 14, 104, 2, 70); for (let y = 108; y < 172; y += 6) px("#2a1420", 11, y, 8, 1);
  /* the ground: cracked earth catching the last light */
  for (let y = 172; y < 200; y++) px(y < 175 ? "#a07850" : y < 184 ? "#7a5a3a" : "#5a422c", 0, y, 320, 1);
  for (let i = 0; i < 60; i++) px(r() < .5 ? "#4a3424" : "#b8905e", r() * 320 | 0, 174 + (r() * 26 | 0), 1 + (r() * 3 | 0), 1);
  for (let k = 0; k < 6; k++) { let cx = r() * 320 | 0, cy = 176; for (let i = 0; i < 10; i++) { px("#3a2818", cx, cy); cx += (r() * 3 | 0) - 1; cy++; } }
  /* the Catamaran, crash-landed: a scorch, the ship tilted and doubled */
  g.fillStyle = "rgba(24, 12, 8, 0.7)"; g.beginPath(); g.ellipse(46, 182, 34, 7, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.imageSmoothingEnabled = false; g.translate(46, 160); g.rotate(-0.22); g.drawImage(shipBare, 0, 0, 32, 32, -32, -30, 64, 64); g.restore();
  px("#3a2818", 14, 180, 8, 2); px("#3a2818", 68, 182, 10, 2);
  return c;
}

/* world-map tiles, painted once */
function paintMapTiles() {
  const mk = fn => { const c = makeCanvas(T, T); fn(c.getContext("2d")); return c; }, E = i => EGA[i];
  const r = rng(5);
  const ground = mk(g => { g.fillStyle = E(6); g.fillRect(0, 0, T, T); for (let i = 0; i < 14; i++) { g.fillStyle = E(r() < .5 ? 4 : 12); g.fillRect(r() * T | 0, r() * T | 0, 1, 1); } });
  const path = mk(g => { g.fillStyle = E(6); g.fillRect(0, 0, T, T); g.fillStyle = E(14); for (let y = 0; y < T; y++) for (let x = (y & 1); x < T; x += 2) g.fillRect(x, y, 1, 1); for (let i = 0; i < 8; i++) { g.fillStyle = E(12); g.fillRect(r() * T | 0, r() * T | 0, 1, 1); } });
  const rock = mk(g => { g.fillStyle = E(6); g.fillRect(0, 0, T, T); g.fillStyle = E(8); g.beginPath(); g.moveTo(1, 15); g.lineTo(5, 3); g.lineTo(9, 6); g.lineTo(12, 2); g.lineTo(15, 15); g.fill();
    g.fillStyle = E(7); g.beginPath(); g.moveTo(5, 3); g.lineTo(7, 8); g.lineTo(9, 6); g.fill(); g.fillStyle = E(15); g.fillRect(12, 2, 1, 2); });
  const water = [0, 1].map(f => mk(g => { g.fillStyle = E(4); g.fillRect(0, 0, T, T); g.fillStyle = E(12); for (let y = 2; y < T; y += 5) for (let x = (y + f * 3) % 6; x < T; x += 6) g.fillRect(x, y, 3, 1); }));
  const tree = mk(g => { g.fillStyle = E(6); g.fillRect(0, 0, T, T); g.fillStyle = E(5); g.beginPath(); g.arc(8, 6, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = E(13); g.beginPath(); g.arc(6, 4, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = E(0); g.fillRect(7, 11, 2, 5); });
  const field = [0, 1, 2].map(f => mk(g => { g.fillStyle = E(6); g.fillRect(0, 0, T, T); g.fillStyle = E([11, 9, 15][f]);
    for (let y = 0; y < T; y += 2) g.fillRect(((y * 3 + f * 5) % T), y, 4, 1); g.fillStyle = E(3); g.fillRect(0, 0, 1, T); g.fillRect(15, 0, 1, T); }));
  /* level markers: a dome, a cave, a fort, a garden gate */
  const marker = kind => mk(g => {
    g.drawImage(ground, 0, 0);
    if (kind === "dome") { g.fillStyle = E(7); g.beginPath(); g.arc(8, 13, 7, Math.PI, 0); g.fill(); g.fillStyle = E(11); g.fillRect(6, 9, 2, 2); g.fillStyle = E(0); g.fillRect(7, 10, 3, 4); g.fillStyle = E(8); g.fillRect(1, 13, 14, 2); }
    if (kind === "cave") { g.fillStyle = E(8); g.beginPath(); g.moveTo(0, 15); g.lineTo(4, 3); g.lineTo(12, 3); g.lineTo(16, 15); g.fill(); g.fillStyle = E(0); g.beginPath(); g.arc(8, 15, 5, Math.PI, 0); g.fill(); g.fillStyle = E(11); g.fillRect(4, 5, 2, 1); }
    if (kind === "fort") { g.fillStyle = E(7); g.fillRect(2, 5, 12, 10); for (let x = 2; x < 14; x += 4) g.fillRect(x, 3, 2, 2); g.fillStyle = E(0); g.fillRect(6, 9, 4, 6); g.fillStyle = E(5); g.fillRect(7, 0, 1, 5); g.fillRect(8, 0, 3, 2); }
    if (kind === "castle") { g.fillStyle = E(8); g.fillRect(0, 4, 16, 12); g.fillRect(1, 0, 4, 4); g.fillRect(11, 0, 4, 4); g.fillStyle = E(12); g.fillRect(2, 1, 2, 2); g.fillRect(12, 1, 2, 2); g.fillStyle = E(0); g.fillRect(5, 8, 6, 8); g.fillStyle = E(14); g.fillRect(7, 6, 2, 1); }
    if (kind === "gate") { g.fillStyle = E(2); g.fillRect(2, 4, 3, 12); g.fillRect(11, 4, 3, 12); g.fillStyle = E(10); g.beginPath(); g.arc(8, 6, 6, Math.PI, 0); g.lineWidth = 2; g.strokeStyle = E(10); g.stroke(); g.fillStyle = E(13); g.fillRect(7, 1, 2, 2); }
    if (kind === "igloo") { g.fillStyle = E(15); g.beginPath(); g.arc(8, 14, 7, Math.PI, 0); g.fill(); g.fillStyle = E(11); g.fillRect(2, 10, 12, 1); g.fillRect(4, 7, 8, 1); g.fillStyle = E(1); g.fillRect(6, 10, 4, 5); }
  });
  /* a teleporter pad: a ring on the ground, its light pulsing */
  const tele = [0, 1].map(f => mk(g => {
    g.drawImage(ground, 0, 0);
    g.fillStyle = E(8); g.beginPath(); g.ellipse(8, 10, 7, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = E(f ? 13 : 5); g.beginPath(); g.ellipse(8, 10, 5, 2.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = E(f ? 15 : 13); for (const [x, y] of [[4, 3], [8, 1], [12, 4]]) g.fillRect(x, y + f, 1, 2);
  }));
  /* the done flag, over a marker */
  const flag = mk(g => { g.fillStyle = E(15); g.fillRect(3, 1, 1, 14); g.fillStyle = E(10); g.fillRect(4, 1, 8, 5); g.fillStyle = E(2); g.fillRect(4, 4, 8, 2); g.fillStyle = E(0); g.font = "bold 5px monospace"; });
  /* the Catamaran, the ship: 32x32 */
  const shipBare = makeCanvas(32, 32); { const g = shipBare.getContext("2d");
    g.fillStyle = E(0); g.beginPath(); g.ellipse(16, 27, 14, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = E(7); g.beginPath(); g.moveTo(2, 24); g.lineTo(16, 4); g.lineTo(30, 24); g.closePath(); g.fill();
    g.fillStyle = E(15); g.beginPath(); g.moveTo(16, 4); g.lineTo(9, 14); g.lineTo(16, 12); g.fill();
    g.fillStyle = E(12); g.fillRect(4, 22, 24, 4);
    g.fillStyle = E(11); g.beginPath(); g.arc(16, 15, 3, 0, Math.PI * 2); g.fill();
    /* cat ears on the hull */
    g.fillStyle = E(7); g.beginPath(); g.moveTo(10, 10); g.lineTo(9, 4); g.lineTo(13, 8); g.fill(); g.beginPath(); g.moveTo(22, 10); g.lineTo(23, 4); g.lineTo(19, 8); g.fill();
    g.fillStyle = E(8); g.fillRect(6, 26, 3, 4); g.fillRect(23, 26, 3, 4); }
  const ship = makeCanvas(32, 32); { const g = ship.getContext("2d");
    for (const [x, y] of [[0, 0], [16, 0], [0, 16], [16, 16]]) g.drawImage(ground, x, y);
    g.drawImage(shipBare, 0, 0); }
  return { shipBare, ground, path, rock, water, tree, field, flag, ship, tele, marker: { dome: marker("dome"), cave: marker("cave"), fort: marker("fort"), castle: marker("castle"), gate: marker("gate"), igloo: marker("igloo") } };
}
