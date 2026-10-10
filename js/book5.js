/* Book Five: Termination Day (set A, TERMINUS). Kept out of the game for
 * now, until its levels are proven winnable, and kept here for later.
 *
 * To put it back, in index.html: load js/art-book5.js and js/books/A.js
 * before js/game.js (beside the other Books' art and maps), then this file
 * after js/game.js, and add "A" to BOOK_PLAYABLE in js/game.js. This file
 * fills in what game.js leaves out for it: sounds, theme, level tilesets,
 * goal, creatures, words, scorebox and title scene. The story is in
 * docs/story/book-5-story.md. */
"use strict";

/* TERMINUS's sounds (Book 5): a pulse rifle's hard burst, mechanical
 * stomps and servo whines, a hiss from the swarm for an alert, cold
 * synth jingles; and for ambience, the motion tracker's ping, quick and
 * high when something is close. */
const TERMINUS_SFX = {
  jump: { wave: "square", steps: [[220, 440, 70]], g: 0.035 },
  pogo: { wave: "square", steps: [[180, 420, 60], [420, 640, 60]], g: 0.035 },
  bigpogo: { wave: "square", steps: [[160, 420, 60], [420, 880, 100]], g: 0.035 },
  shoot: { wave: "sawtooth", steps: [[260, 140, 40], [260, 140, 40], [260, 120, 50]], g: 0.035, noise: { ms: 140, f: 1600, q: 0.8, g: 0.11 } },
  click: { noise: { ms: 14, f: 3200, q: 6, g: 0.1 } },
  bump: { wave: "square", steps: [[120, 80, 40]], g: 0.035 },
  item: { wave: "square", steps: [[1047, 1047, 30], [1568, 1568, 50]], g: 0.03 },
  bigitem: { wave: "sawtooth", steps: [[392, 392, 80], [523, 523, 80], [784, 784, 80], [1047, 1047, 220]], g: 0.03 },
  gem: { wave: "square", steps: [[1175, 1175, 50], [1568, 1568, 90]], g: 0.03 },
  door: { wave: "sawtooth", steps: [[110, 70, 220]], g: 0.035, noise: { ms: 260, f: 2400, q: 0.6, g: 0.08 } },
  push: { wave: "sawtooth", steps: [[160, 110, 70]], g: 0.035 },
  stun: { wave: "square", steps: [[1000, 260, 140]], g: 0.03 },
  hit: { wave: "square", steps: [[600, 260, 60]], g: 0.035, noise: { ms: 50, f: 2200, q: 1, g: 0.07 } },
  kill: { wave: "sawtooth", steps: [[440, 50, 220]], g: 0.04, noise: { ms: 240, f: 900, q: 0.7, g: 0.12 } },
  ricochet: { wave: "triangle", steps: [[3000, 2200, 60]], noise: { ms: 40, f: 4400, q: 2, g: 0.05 } },
  tank: { wave: "sawtooth", steps: [[200, 100, 90]], g: 0.04, noise: { ms: 90, f: 1400, q: 1, g: 0.08 } },
  die: { wave: "sawtooth", steps: [[523, 392, 160], [392, 311, 160], [311, 233, 200], [233, 110, 480]], g: 0.035 },
  done: { wave: "sawtooth", steps: [[262, 262, 100], [392, 392, 100], [523, 523, 100], [784, 784, 280]], g: 0.03 },
  life: { wave: "square", steps: [[523, 523, 70], [784, 784, 70], [1047, 1047, 200]], g: 0.03 },
  enter: { wave: "sawtooth", steps: [[120, 360, 180]], g: 0.03, noise: { ms: 200, f: 1200, q: 0.7, g: 0.07 } },
  nope: { wave: "square", steps: [[180, 180, 70], [120, 120, 110]], g: 0.035 },
  menu: { wave: "square", steps: [[1200, 1200, 14]], g: 0.025 },
  pick: { wave: "square", steps: [[1568, 1568, 25], [2093, 2093, 35]], g: 0.025 },
  /* the swarm, seeing Poom: a hiss */
  alert: { noise: { ms: 260, f: 5200, q: 1.2, g: 0.09 } },
  /* the motion tracker */
  ping: { wave: "sine", steps: [[1760, 1760, 60]], g: 0.022 },
  pingNear: { wave: "sine", steps: [[2349, 2349, 50]], g: 0.03 },
};
SOUND_SETS.terminus = TERMINUS_SFX;

/* the theme */
Object.assign(BOOK_THEMES, {
  /* Book 5, set A: TERMINUS, the machine's station (docs/story/book-5-story.md);
     its art is in js/art-book5.js */
  terminus: { name: "terminus", look: "marine", items: "terminus", creatures: "terminus", map: "terminus", title: "terminus", subtitle: "Book Five: Termination Day", hud: "tracker", sound: "terminus" },
});
THEME_OF_BOOK.A = "terminus";

Object.assign(LEVEL_THEME, {
  /* Book 5 (set A), docs/story/book-5-story.md: the Machine Decks, the Biodome and the Hive */
  A02: "machine", A04: "machine", A08: "machine", A12: "machine", A13: "machine", A14: "machine", A15: "machine",
  A03: "biodome", A05: "biodome", A06: "biodome", A07: "biodome",
  A09: "hive5", A10: "hive5", A11: "hive5", A16: "hive5"
});

/* the Book ends when A16, the Termination Core, is done */
BOOK_GOAL.A = { last: "A16" };

Object.assign(ENEMY_OF, {
  /* Book 5 (docs/story/book-5-story.md): station cats (01) push; skulkers
     (03), clingers (05), bursters (04) and hounds (10) charge, the swarm's
     with a hiss first; endos (02) and the swarm's drones (11) walk;
     quicksilver (06) shoves; sentry guns (07) shoot; hunter-killer drones
     (08) fly at Poom; the Hunter (09) and Shades (13) are lieutenants; acid
     globs (12) slide or bounce and can't be hurt; the Brood Mother (14),
     in A16, is the last of them: drawn twice the size, in her seven-tile
     hall, but her body a little shorter than her crest, 44 pixels, so a full
     jump (54) still clears her; the same twelve hits as before */
  A: { "01": { kind: "x", art: "cat" }, "02": { kind: "V", art: "endo", hp: 5, points: 800 }, "03": { kind: "B", art: "skulker", w: 14, h: 8, alert: true },
    "04": { kind: "B", art: "burster", w: 8, h: 4, rush: 1.6 }, "05": { kind: "B", art: "clinger", w: 10, h: 5, alert: true, rush: 1.5 },
    "06": { kind: "T", art: "quick" }, "07": { kind: "K", art: "sentry" }, "08": { kind: "B", art: "hk", w: 14, h: 6, swim: true, hunt: true, hp: 2 },
    "09": { kind: "L", art: "hunter", hp: 6, points: 2000 }, "10": { kind: "B", art: "hound", alert: true }, "11": { kind: "V", art: "xdrone", hp: 3 },
    "12": { kind: "V", art: "glob", w: 8, h: 6, hp: Infinity, points: 0 }, "13": { kind: "L", art: "shades", points: 1500 },
    "14": { kind: "L", art: "brood", w: 24, h: 44, scale: 2, hp: 12, points: 5000 } } ,
});

Object.assign(BOOK_TEXT, {
  /* Book 5, set A: TERMINUS, the machine's station (docs/story/book-5-story.md) */
  A: {
    story: `<p>The black Catamaran, glowing pink with SPARK, climbs up out of the sky and into orbit. Poom follows it to <b>TERMINUS</b>: a station like a great dark wheel, run by a machine mind of the same name, which has been counting down to <b>Termination Day</b>, the day it switches everything off. For good.</p>
<p>The station isn't quiet. Its crew of chrome <b>endos</b> is losing a war to the <b>Swarm</b>, a brood of black alien things nesting in the lower decks. And something else is aboard: a <b>Hunter</b> from the stars, tall and cloaked, that collects the skulls of anything worth hunting.</p>
<p>Every deck has a <b>termination core</b> feeding the countdown. Break them all, and the last of them, the Termination Core itself, where the Swarm's <b>Brood Mother</b> has made her nest.</p>
<p>Cal's black Catamaran is docked here too. Auntie Static: <i>"Whatever he's after this time, sugar, it's something that hunts."</i></p>`,
    arrive: "The Catamaran is docked at TERMINUS's outer ring. The countdown is running. The way in is <b>The Docking Ring</b>, right here.<br><br>An arrow marks each place you can reach. Walk up to one and press <kbd>Ctrl</kbd>, <kbd>Z</kbd> or <kbd>Space</kbd> to go in.",
    map: `<p>On the map, walk up to a place and press jump or fire to go in. An arrow marks each place you can reach; a laser gate blocks the way until the places near it are cleared; Poom's flag marks the ones he has. Stand on a lift pad and press jump or fire to ride it. Break the termination core on each deck, and last of all the <b>Termination Core</b>, to stop the countdown.</p>`,
    creatures: () => { const C = ART.creatureSets.terminus; return [
      [C.cat.walk0.r, "Station cat", "Ginger, unbothered, survives everything. Harmless; it bumps you. Jump on one and it sits down for a while."],
      [C.skulker.walk0.r, "Skulker", "A black thing of the Swarm, low and fast. It hisses when it sees you, then rushes. One shot."],
      [C.endo.walk0.r, "Endo", "A chrome skeleton with red eyes. Deadly to touch, and it takes five shots."],
      [C.clinger.walk0.r, "Clinger", "Pale, leggy, and it leaps at faces. One shot."],
      [C.quick.a.r, "Quicksilver", "Liquid metal in the shape of a soldier. Can't be hurt. It shoves."],
      [C.sentry.a.r, "Sentry gun", "A gun on a tripod, firing along the floor. Can't be hurt either."],
      [C.hk.walk0.r, "Hunter-killer", "A black drone with a red searchlight. It flies straight at you. Two shots."],
      [C.hunter.walk0.r, "The Hunter", "Tall, cloaked, three red dots. Six shots, if you can see it."],
    ]; },
    items: () => { const I = ART.itemSets.terminus; return [
      [I.items.fish, "Ration bars, chips, shoulder lamps, motion trackers, hunter's masks, chrome skulls", "100, 200, 500, 1000, 2000 and 5000 points. An extra life at 20,000, then 40,000, 80,000 and so on."],
      [I.items.ammo, "Pulse cell", "Five shots for the raygun."],
      [I.items.life, "Poom bobblehead", "An extra life. Even in orbit."],
      [I.gems[0], "Keycards", "Open the station's door of the same colour, in this level."],
      [I.objectives[0][0], "Termination cores", "One on every deck. Shoot or touch one to break it."],
    ]; },
    places: {
      A02: "The Docking Ring", A04: "The Assembly Line", A08: "The Reactor", A12: "The Server Farm", A13: "The Skull Press", A14: "The Proving Ground", A15: "The Core Shaft",
      A03: "The Biodome", A05: "The Rain Deck", A06: "The Hunter's Trail", A07: "The Trophy Room",
      A09: "The Nest", A10: "The Egg Chamber", A11: "The Resin Halls", A16: "The Termination Core",
    },
    signs: {},
    say: {
      signNear: () => "A terminal. Press ↑ to read it.",
      noPogo: "No pogo stick. Not yet.",
      warpDoor: "An airlock. Press ↑ to go through.",
      socket: c => `A ${c} card reader. A ${c} keycard goes here.`,
      noAmmo: "Click. The raygun's empty. Look for pulse cells.",
      lockedDoor: c => c ? `A ${c} blast door. It wants a ${c} keycard.` : "A blast door. It wants a keycard.",
      ammo: "<b>Pulse cell!</b> Five shots for the raygun. Fire with <kbd>Space</kbd> or <kbd>C</kbd>.",
      pogo: "<b>You found a pogo stick!</b><br><br>Press <kbd>Alt</kbd> or <kbd>X</kbd> to hop on and off. Hold <kbd>Ctrl</kbd> or <kbd>Z</kbd> as you land for a big bounce.",
      swim: "<b>You can swim!</b>",
      bossDown: art => art === "brood" ? "<b>The Brood Mother is down!</b><br><br>The Swarm screams all through the station. Break the last core." : null,
      wayOpens: "Somewhere on TERMINUS, a laser gate powers down.",
      lostLife: n => n === 0 ? "Poom comes to in the medbay, still in one piece. Just.<br><br><b>This is your last life.</b>" : `Poom comes to in the medbay, still in one piece. Just.<br><br>${n} ${n === 1 ? "life" : "lives"} left.`,
      water: "Acid. Poom isn't going in that.",
      blocked: "A laser gate. Clear the places nearby.",
      levelDone: name => `${name}: cleared.`,
      cheatOn: "Auntie Static: <i>\"I've told the machine you're one of its own, sugar. It believes me.\"</i> Infinite lives and energy. No high scores this game.",
      cheatOff: "Auntie Static: <i>\"It's on to me. You're on your own again.\"</i> Cheat mode off.",
      raygun: n => `${n} shot${n === 1 ? "" : "s"}`,
      gameOver: n => `<b>Game over, sugar! Game over!</b><br><br>TERMINUS counts down without you. Final score: ${n}.`,
      highScore: n => `<b>A high score!</b><br><br>${n} points. TERMINUS would like your name, for its records. It keeps very good records.`,
    },
    scores: [["Junk Baron Cal", 20000], ["TERMINUS", 17500], ["Auntie Static", 15000], ["The Hunter", 10000], ["Brood Mother", 7500], ["Shades", 5000], ["Ginger the cat", 2500]],
    boot: ["256 colours: ok", "motion tracker: online"],
    /* the pages played when the Termination Core breaks */
    ending: (score, next) => [
      "The last core cracks. TERMINUS's great red eye flickers, and the countdown stops at one second to go.",
      "The station starts to shake itself apart. Poom runs for the docking ring with the Swarm screaming behind him and Auntie Static in his ear: <i>\"Get to the Catamaran, sugar! Now!\"</i>",
      "Deep in the station, in a room full of skulls, the Hunter roars over an empty rack. Its cloak is gone.",
      "As the Catamaran pulls away into the dark, the stars ripple. Something slides past, invisible but for its outline: the shape of a grey-black panther. Then it isn't there at all.",
      "The radio crackles. <i>\"A ship, a power source, and now a cloak. He's been building himself into you, sugar, one piece at a time. Next time, you might not see him coming.\"</i>",
      `<b>The End</b> of Book Five: Termination Day.<br><br>${next ? `Score so far: ${score}.<br><br>On to Book ${next}.` : `Final score: ${score}.<br><br>Commander Poom will return.`}`,
    ],
  },
});

/* Book 5's scorebox: a marine's readout, red numbers on black in a
 * gunmetal frame, and a motion tracker beside it: a green fan that
 * sweeps, with a blip for each creature within range ahead or behind */
function drawTrackerHud(lv) {
  const r = G.run, f = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  f("#000", 2, 2, 96, 28); f("#323a46", 3, 3, 94, 26); f("#646f7d", 3, 3, 94, 1); f("#151920", 3, 28, 94, 1);
  f("#05070a", 5, 5, 60, 22);
  drawDigits(r.score, 8, 7, 9);
  f("#3a0604", 7, 15, 56, 1);
  ctx.drawImage(ART.items.life, 7, 17, 9, 10);
  drawDigits(r.cheat || r.arcade ? 99 : Math.min(r.lives, 99), 17, 19, 2);
  ctx.drawImage(ART.items.ammo, 35, 18, 4, 8);
  drawDigits(r.cheat ? 99 : Math.min(r.ammo, 99), 42, 19, 2);
  /* the tracker */
  const cx = 81, cy = 26, R = 20;
  ctx.save(); ctx.beginPath(); ctx.rect(67, 5, 28, 22); ctx.clip();
  ctx.fillStyle = "#04170b"; ctx.fillRect(67, 5, 28, 22);
  ctx.strokeStyle = "#1c5a2a"; ctx.lineWidth = 1;
  for (const rr of [7, 14, 20]) { ctx.beginPath(); ctx.arc(cx, cy, rr, Math.PI, 0); ctx.stroke(); }
  const sweep = Math.PI + ((G.t % 90) / 90) * Math.PI;
  ctx.strokeStyle = "rgba(90, 255, 138, 0.7)"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R); ctx.stroke();
  if (lv) for (const e of lv.ents) {
    if (!e.alive || e.type === "G") continue;
    const dx = (e.x - lv.p.x) / 10, dy = Math.abs(e.y - lv.p.y) / 10, d = Math.hypot(dx, dy);
    if (d > R) continue;
    ctx.fillStyle = (G.t >> 3) % 2 ? "#5aff8a" : "#c8ffd2"; ctx.fillRect(Math.round(cx + dx) - 1, Math.round(cy - dy) - 1, 2, 2);
  }
  ctx.restore();
  if (lv) lv.keys.forEach((k, i) => { if (k) ctx.drawImage(ART.gems[i], 101 + i * 10, 4, 8, 7); });
}
EXTRA_HUDS.tracker = drawTrackerHud;

/* TERMINUS's title (Book 5): the station over the night side of a
 * planet, its red eye pulsing, stars, three red dots that wander over the
 * gantry now and then, Poom on the gantry in his marine armour. */
let terminusTitleBg = null;
function drawTerminusTitle(t) {
  if (!terminusTitleBg) terminusTitleBg = paintTerminusTitle(mapArtSets.classic.shipBare);
  ctx.drawImage(terminusTitleBg, 0, 0);
  for (const s of titleStars) if (s.y < 140 && (t >> 4) % 7 !== s.s && Math.hypot(s.x - 268, (s.y - 46) * 3) > 50) { ctx.fillStyle = s.c === 14 ? "#ffe9c8" : "#c8d0e0"; ctx.fillRect(s.x, s.y, 1, 1); }
  const a = 0.5 + 0.5 * Math.sin(t / 30);
  ctx.fillStyle = `rgba(255, 42, 26, ${0.25 + 0.3 * a})`; ctx.beginPath(); ctx.arc(268, 46, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ff2a1a"; ctx.fillRect(267, 45, 3, 3);
  /* the Hunter's three dots, drifting over the gantry */
  if ((t >> 7) % 3 === 1) { const x = 60 + Math.sin(t / 40) * 30, y = 150 + Math.cos(t / 33) * 8; ctx.fillStyle = "#ff2020"; for (const [dx, dy] of [[0, 0], [4, 3], [8, 0]]) ctx.fillRect(Math.round(x + dx), Math.round(y + dy), 2, 2); }
  const pose = (t >> 5) % 8 === 0 ? "shoot" : "stand", spr = ART.poom[pose].r;
  ctx.drawImage(spr, 70, 176 - spr.height);
}
EXTRA_TITLES.terminus = drawTerminusTitle;
