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
  "#dba363", "#a8743c", "#f6e3bd", "#3a2412"];
/* grid letters for the extra colours, indexed from 16 */
const EXTRA = "ghik";

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

/* A grid into a canvas. Rows are padded to the widest; outline adds a
 * black pixel beside every painted one that has a clear neighbour. */
function sprite(rows, { outline = true, swap = null } = {}) {
  const w = Math.max(...rows.map(r => r.length)), h = rows.length, pad = outline ? 1 : 0;
  const W = w + pad * 2, H = h + pad * 2;
  const grid = Array.from({ length: H }, () => new Array(W).fill(-1));
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch === "." || ch === " ") return;
    let v = EXTRA.includes(ch) ? 16 + EXTRA.indexOf(ch) : parseInt(ch, 16);
    if (Number.isNaN(v)) return;
    if (swap && swap[v] !== undefined) v = swap[v];
    grid[y + pad][x + pad] = v;
  }));
  if (outline) {
    const src = grid.map(r => r.slice());
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (src[y][x] !== -1) continue;
      const n = (yy, xx) => yy >= 0 && yy < H && xx >= 0 && xx < W && src[yy][xx] > 0;
      if (n(y - 1, x) || n(y + 1, x) || n(y, x - 1) || n(y, x + 1)) grid[y][x] = 0;
    }
  }
  const c = makeCanvas(W, H), g = c.getContext("2d");
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (grid[y][x] < 0) continue;
    g.fillStyle = EGA[grid[y][x]];
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

const ART = { poom: {}, map: {}, mousel: {}, barker: {}, vac: {}, boss: {}, roombot: {}, tank: {}, items: {}, gems: [], parts: [] };

function both(c) { return { r: c, l: flipped(c) }; }

function buildArt() {
  const pad = r => "...." + r + "....";
  const overlay = (rows, tail) => rows.map((r, y) => {
    const t = tail[y] || "";
    return [...r].map((c, x) => c === "." && t[x] && t[x] !== "." ? t[x] : c).join("");
  });
  for (const [k, body] of Object.entries(P_BODY)) {
    const backView = k === "back" || k === "climb0" || k === "climb1";
    const head = backView ? P_HEAD_BACK : k === "dead" ? P_HEAD_DIZZY : P_HEAD;
    const tail = backView ? TAIL_BACK : k === "walk1" ? TAIL_SWING : TAIL_SIDE;
    ART.poom[k] = both(sprite(head.map(pad).concat(overlay(body.map(pad), tail))));
  }
  ART.pogoLong = both(sprite(POGO_LONG));
  ART.pogoShort = both(sprite(POGO_SHORT));
  for (const [k, g] of Object.entries(MAP_POOM)) ART.map[k] = both(sprite(g));
  for (const [k, g] of Object.entries(MOUSEL)) ART.mousel[k] = both(sprite(g));
  for (const [k, g] of Object.entries(BARKER)) ART.barker[k] = both(sprite(g));
  for (const [k, g] of Object.entries(VACUUMOID)) ART.vac[k] = both(sprite(g));
  /* the Grand Vacuumoid: the same machine in red and gold */
  for (const [k, g] of Object.entries(VACUUMOID)) ART.boss[k] = both(sprite(g, { swap: { 5: 4, 13: 14, 7: 12, 8: 6 } }));
  for (const [k, g] of Object.entries(ROOMBOT)) ART.roombot[k] = both(sprite(g));
  for (const [k, g] of Object.entries(CLAWTANK)) ART.tank[k] = both(sprite(g));
  for (const [k, g] of Object.entries(ITEMS)) ART.items[k] = sprite(g);
  ART.gems = GEM_SWAPS.map(s => sprite(GEM, { swap: s }));
  /* the keycard whose colour the map doesn't say: silver */
  ART.gems.push(sprite(GEM, { swap: { 15: 15, 12: 7, 4: 8 } }));
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
};

function paintTiles(themeName) {
  const th = THEMES[themeName], E = i => EGA[i];
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

  /* fake wall: looks like ground, walks like air (secret) */
  tiles.fake = tiles.ground[0];
  return tiles;
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
