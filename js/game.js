/* Commander Poom -- the game.
 *
 * A 320x200 canvas, scaled up nearest-neighbour, and a DOM layer of the same
 * size over it for every screen with words on it. Fixed 60 Hz simulation.
 * Modes: title, story, map, level, ending; anything modal (messages, menus,
 * the status window) is an overlay, and the world stands still under it. */
"use strict";

const W = 320, H = 200;
const NS = "commanderpoom";
const KEYS = { save: NS + "_save_v2", scores: NS + "_scores_v1", muted: NS + "_muted_v1", seen: NS + "_seen_v1", speed: NS + "_speed_v1", lastBook: NS + "_book_v1" };

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const stage = document.getElementById("stage");
const uiRoot = document.getElementById("ui");

/* ------------------------------------------------------------------ */
/* storage                                                               */

const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private window */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* no storage */ } },
};

/* Game speed: how many simulation steps a second. Every distance is in steps,
 * so a slower clock leaves every jump height and gap exactly as the levels
 * were laid out -- only time stretches. Classic is Keen's own 60 a second. */
const SPEEDS = { classic: { label: "Classic", hz: 60 }, relaxed: { label: "Relaxed", hz: 48 } };
let speed = SPEEDS[store.get(KEYS.speed, "classic")] ? store.get(KEYS.speed, "classic") : "classic";
let STEP = 1000 / SPEEDS[speed].hz;
function cycleSpeed() {
  const names = Object.keys(SPEEDS);
  speed = names[(names.indexOf(speed) + 1) % names.length];
  STEP = 1000 / SPEEDS[speed].hz;
  store.set(KEYS.speed, speed);
}

function forgetEverything() {
  for (const area of ["localStorage", "sessionStorage"]) {
    try {
      const s = window[area];
      for (let i = s.length - 1; i >= 0; i--) {
        const k = s.key(i);
        if (k && k.startsWith(NS)) s.removeItem(k);
      }
    } catch (e) { /* no storage */ }
  }
  location.reload();
}

/* ------------------------------------------------------------------ */
/* sound: a PC speaker, more or less                                     */

const SFX = {
  jump: [[330, 720, 70]],
  pogo: [[180, 520, 60], [520, 900, 50]],
  bigpogo: [[160, 520, 60], [520, 1100, 90]],
  shoot: [[1400, 260, 90]],
  click: [[110, 110, 25]],
  bump: [[150, 120, 35]],
  item: [[880, 880, 35], [1320, 1320, 45]],
  bigitem: [[660, 660, 40], [880, 880, 40], [1320, 1320, 40], [1760, 1760, 70]],
  gem: [[1047, 1047, 50], [1319, 1319, 50], [1568, 1568, 50], [2093, 2093, 90]],
  door: [[220, 90, 160], [90, 180, 80]],
  push: [[320, 240, 50]],
  stun: [[1100, 500, 110]],
  hit: [[700, 160, 90]],
  kill: [[1200, 80, 220]],
  ricochet: [[2400, 1800, 40]],
  tank: [[260, 120, 110]],
  die: [[900, 700, 120], [700, 500, 120], [500, 300, 150], [300, 60, 400]],
  done: [[523, 523, 90], [659, 659, 90], [784, 784, 90], [1047, 1047, 220]],
  life: [[660, 660, 70], [880, 880, 70], [990, 990, 70], [1320, 1320, 160]],
  enter: [[400, 800, 140]],
  nope: [[200, 200, 60], [150, 150, 90]],
  menu: [[900, 900, 18]],
  pick: [[1200, 1200, 30], [1600, 1600, 40]],
};

/* The wasteland's sounds: a Sound Blaster rather than a PC speaker. Each is
 * { wave, steps (as above), vib: [Hz, cents] wobble, noise: { ms, f (band
 * centre), q, g (gain) } a burst of filtered static, g: the tone's gain }.
 * Tin and springs, static and hiss, 50s jingles. */
const WASTE_SFX = {
  jump: { wave: "triangle", steps: [[300, 640, 80]] },
  pogo: { wave: "triangle", steps: [[200, 560, 60], [560, 820, 60]], vib: [28, 40] },
  bigpogo: { wave: "triangle", steps: [[180, 560, 60], [560, 1100, 100]], vib: [28, 50] },
  shoot: { wave: "sawtooth", steps: [[1800, 300, 110]], g: 0.035, noise: { ms: 60, f: 3200, q: 1, g: 0.05 } },
  click: { noise: { ms: 22, f: 1800, q: 4, g: 0.12 } },
  bump: { wave: "triangle", steps: [[140, 100, 40]], noise: { ms: 30, f: 300, q: 1, g: 0.1 } },
  item: { wave: "triangle", steps: [[2637, 2637, 30], [3520, 3520, 70]], g: 0.07 },
  bigitem: { wave: "triangle", steps: [[523, 523, 80], [659, 659, 80], [784, 784, 80], [880, 880, 170]] },
  gem: { wave: "square", steps: [[1200, 1200, 60], [1600, 1600, 100]], g: 0.035 },
  door: { wave: "sawtooth", steps: [[90, 60, 260]], g: 0.04, noise: { ms: 260, f: 900, q: 0.7, g: 0.1 } },
  push: { wave: "sawtooth", steps: [[200, 150, 60]], g: 0.04 },
  stun: { wave: "triangle", steps: [[1500, 2200, 40], [2200, 900, 80]] },
  hit: { wave: "square", steps: [[500, 200, 70]], g: 0.035, noise: { ms: 70, f: 1200, q: 1, g: 0.08 } },
  kill: { wave: "sawtooth", steps: [[600, 60, 200]], g: 0.04, noise: { ms: 200, f: 600, q: 0.8, g: 0.12 } },
  ricochet: { wave: "triangle", steps: [[3000, 2200, 60]], noise: { ms: 40, f: 4000, q: 2, g: 0.06 } },
  tank: { wave: "sawtooth", steps: [[220, 90, 120]], g: 0.04, noise: { ms: 90, f: 500, q: 1, g: 0.08 } },
  die: { wave: "sawtooth", steps: [[700, 500, 150], [500, 330, 150], [330, 220, 180], [220, 55, 450]], vib: [6, 60], g: 0.045 },
  done: { wave: "triangle", steps: [[392, 392, 90], [523, 523, 90], [659, 659, 90], [784, 784, 130], [659, 659, 80], [784, 784, 280]] },
  life: { wave: "triangle", steps: [[523, 523, 70], [784, 784, 70], [1047, 1047, 220]], vib: [12, 40] },
  enter: { wave: "sawtooth", steps: [[200, 500, 160]], g: 0.035, noise: { ms: 180, f: 700, q: 0.8, g: 0.08 } },
  nope: { wave: "square", steps: [[180, 180, 70], [120, 120, 110]], g: 0.04 },
  menu: { wave: "triangle", steps: [[900, 900, 15]], noise: { ms: 12, f: 2500, q: 3, g: 0.06 } },
  pick: { wave: "triangle", steps: [[1300, 1300, 30], [1750, 1750, 40]] },
  /* the geiger counter, ticking away in the background */
  geiger: { noise: { ms: 5, f: 3500, q: 2, g: 0.05 } },
};
/* Thrum's sounds (Book 2): sine and triangle for the hunter's gear, an echo
 * on the bigger ones so the caves sound hollow (echo: [ms, gain]), wet
 * crunches for the Hum's creatures, the station's hiss and beeps, eerie
 * minor jingles; and instead of a geiger counter, the Hum itself, a low
 * throb now and then (hum). */
const THRUM_SFX = {
  jump: { wave: "sine", steps: [[280, 560, 80]], g: 0.07 },
  pogo: { wave: "sine", steps: [[200, 520, 60], [520, 760, 60]], vib: [24, 30], g: 0.07 },
  bigpogo: { wave: "sine", steps: [[180, 520, 60], [520, 1040, 100]], vib: [24, 40], g: 0.07, echo: [110, 0.35] },
  shoot: { wave: "sine", steps: [[1700, 380, 120]], g: 0.06, noise: { ms: 40, f: 5200, q: 2, g: 0.04 }, echo: [90, 0.3] },
  click: { noise: { ms: 18, f: 2400, q: 5, g: 0.1 } },
  bump: { wave: "sine", steps: [[150, 100, 45]], g: 0.08, noise: { ms: 30, f: 260, q: 1, g: 0.08 } },
  item: { wave: "sine", steps: [[1760, 1760, 35], [2349, 2349, 70]], g: 0.05, echo: [120, 0.4] },
  bigitem: { wave: "triangle", steps: [[659, 659, 90], [784, 784, 90], [988, 988, 90], [1319, 1319, 200]], g: 0.06, echo: [160, 0.4] },
  gem: { wave: "square", steps: [[880, 880, 60], [1320, 1320, 110]], g: 0.03 },
  door: { wave: "sawtooth", steps: [[110, 70, 240]], g: 0.035, noise: { ms: 300, f: 1400, q: 0.6, g: 0.09 } },
  push: { wave: "sawtooth", steps: [[180, 130, 70]], g: 0.035 },
  stun: { wave: "sine", steps: [[1300, 300, 160]], vib: [18, 60], g: 0.06 },
  hit: { wave: "sine", steps: [[480, 180, 80]], g: 0.06, noise: { ms: 60, f: 900, q: 1, g: 0.07 } },
  kill: { wave: "sine", steps: [[420, 50, 220]], g: 0.06, noise: { ms: 220, f: 420, q: 0.7, g: 0.13 }, echo: [140, 0.3] },
  ricochet: { wave: "sine", steps: [[3200, 2400, 60]], g: 0.04, echo: [80, 0.3] },
  tank: { wave: "sine", steps: [[300, 110, 110]], g: 0.05, noise: { ms: 110, f: 700, q: 1, g: 0.08 } },
  die: { wave: "sine", steps: [[740, 520, 170], [520, 350, 170], [350, 220, 200], [220, 60, 480]], vib: [5, 80], g: 0.06, echo: [220, 0.4] },
  done: { wave: "triangle", steps: [[440, 440, 110], [523, 523, 110], [659, 659, 110], [880, 880, 160], [784, 784, 100], [880, 880, 320]], g: 0.06, echo: [180, 0.35] },
  life: { wave: "sine", steps: [[523, 523, 80], [659, 659, 80], [784, 784, 80], [1047, 1047, 220]], vib: [10, 30], g: 0.06, echo: [140, 0.35] },
  enter: { wave: "sine", steps: [[160, 560, 200]], g: 0.05, noise: { ms: 220, f: 900, q: 0.7, g: 0.07 } },
  nope: { wave: "square", steps: [[160, 160, 80], [110, 110, 120]], g: 0.035 },
  menu: { wave: "sine", steps: [[1100, 1100, 18]], g: 0.05 },
  pick: { wave: "sine", steps: [[1320, 1320, 30], [1760, 1760, 45]], g: 0.05 },
  /* the Hum: a low throb, slowly wavering */
  hum: { wave: "sine", steps: [[55, 52, 500], [52, 55, 500]], vib: [3, 40], g: 0.07, noise: { ms: 700, f: 120, q: 3, g: 0.025 } },
};
/* Isla Garra's sounds (Book 3): a suppressed raygun's thup, clipped square
 * beeps for the base's gear, heavy blast doors, a radio squelch, and the
 * alert, the sting a guard gives when it sees Poom. For ambience, the surf:
 * a wash of waves now and then. */
const CLAW_SFX = {
  jump: { wave: "triangle", steps: [[300, 520, 70]], g: 0.06 },
  pogo: { wave: "triangle", steps: [[220, 480, 60], [480, 700, 60]], g: 0.06 },
  bigpogo: { wave: "triangle", steps: [[200, 480, 60], [480, 960, 100]], g: 0.06 },
  shoot: { wave: "sine", steps: [[520, 140, 70]], g: 0.07, noise: { ms: 60, f: 1800, q: 0.9, g: 0.12 } },
  click: { noise: { ms: 14, f: 3000, q: 6, g: 0.1 } },
  bump: { wave: "square", steps: [[140, 90, 40]], g: 0.035 },
  item: { wave: "square", steps: [[1568, 1568, 30], [2093, 2093, 50]], g: 0.03 },
  bigitem: { wave: "square", steps: [[784, 784, 70], [988, 988, 70], [1175, 1175, 70], [1568, 1568, 160]], g: 0.03 },
  gem: { wave: "square", steps: [[1320, 1320, 50], [1760, 1760, 50], [1320, 1320, 80]], g: 0.03 },
  door: { wave: "sawtooth", steps: [[90, 60, 260]], g: 0.035, noise: { ms: 320, f: 900, q: 0.5, g: 0.1 } },
  push: { wave: "square", steps: [[200, 140, 60]], g: 0.03 },
  stun: { wave: "square", steps: [[900, 300, 140]], g: 0.03 },
  hit: { wave: "square", steps: [[420, 200, 60]], g: 0.035, noise: { ms: 50, f: 1400, q: 1, g: 0.06 } },
  kill: { wave: "sawtooth", steps: [[500, 70, 200]], g: 0.04, noise: { ms: 200, f: 700, q: 0.8, g: 0.1 } },
  ricochet: { wave: "triangle", steps: [[2800, 2000, 60]], noise: { ms: 40, f: 4000, q: 2, g: 0.05 } },
  tank: { wave: "square", steps: [[180, 120, 50], [180, 120, 50]], g: 0.035, noise: { ms: 110, f: 1200, q: 1, g: 0.09 } },
  die: { wave: "square", steps: [[660, 440, 160], [440, 330, 160], [330, 220, 200], [220, 110, 420]], g: 0.035 },
  done: { wave: "square", steps: [[523, 523, 90], [659, 659, 90], [784, 784, 90], [1047, 1047, 260]], g: 0.03 },
  life: { wave: "square", steps: [[784, 784, 70], [1047, 1047, 70], [1568, 1568, 200]], g: 0.03 },
  enter: { wave: "sawtooth", steps: [[160, 420, 160]], g: 0.03, noise: { ms: 180, f: 600, q: 0.8, g: 0.08 } },
  nope: { wave: "square", steps: [[200, 200, 60], [150, 150, 100]], g: 0.035 },
  menu: { wave: "square", steps: [[1400, 1400, 14]], g: 0.025 },
  pick: { wave: "square", steps: [[1760, 1760, 25], [2349, 2349, 35]], g: 0.025 },
  /* the alert: a sharp rising sting, two notes, the second held */
  alert: { wave: "square", steps: [[1047, 1047, 70], [2093, 2093, 260]], vib: [7, 20], g: 0.045, noise: { ms: 60, f: 5000, q: 1, g: 0.06 } },
  /* the surf, washing in */
  surf: { noise: { ms: 1400, f: 500, q: 0.4, g: 0.035 } },
};
/* Raptura's sounds (Book 4): warm sines with a long echo, as if through
 * water and brass; a raygun's pink zap; bell-like pickups; a splicer's
 * laugh for an alert; and for ambience, bubbles rising now and then, and
 * the city groaning under the weight of the sea. */
const DEEP_SFX = {
  jump: { wave: "sine", steps: [[240, 480, 80]], g: 0.07, echo: [120, 0.3] },
  pogo: { wave: "sine", steps: [[200, 460, 60], [460, 700, 60]], g: 0.07, echo: [120, 0.3] },
  bigpogo: { wave: "sine", steps: [[180, 460, 60], [460, 920, 100]], g: 0.07, echo: [140, 0.35] },
  shoot: { wave: "sine", steps: [[1500, 520, 110]], vib: [30, 40], g: 0.06, echo: [100, 0.35] },
  click: { noise: { ms: 16, f: 2600, q: 5, g: 0.09 } },
  bump: { wave: "sine", steps: [[130, 90, 50]], g: 0.08 },
  item: { wave: "sine", steps: [[1319, 1319, 40], [1760, 1760, 80]], g: 0.05, echo: [160, 0.4] },
  bigitem: { wave: "triangle", steps: [[523, 523, 90], [659, 659, 90], [784, 784, 90], [1047, 1047, 240]], g: 0.06, echo: [200, 0.4] },
  gem: { wave: "sine", steps: [[988, 988, 60], [1319, 1319, 120]], g: 0.05, echo: [140, 0.35] },
  door: { wave: "sawtooth", steps: [[80, 55, 320]], g: 0.03, noise: { ms: 380, f: 700, q: 0.5, g: 0.08 }, echo: [220, 0.3] },
  push: { wave: "sine", steps: [[200, 140, 70]], g: 0.06 },
  stun: { wave: "sine", steps: [[1200, 300, 160]], vib: [16, 60], g: 0.05 },
  hit: { wave: "sine", steps: [[460, 200, 80]], g: 0.06, noise: { ms: 50, f: 900, q: 1, g: 0.06 } },
  kill: { wave: "sine", steps: [[400, 60, 240]], g: 0.06, noise: { ms: 200, f: 500, q: 0.7, g: 0.1 }, echo: [160, 0.3] },
  ricochet: { wave: "sine", steps: [[2800, 2100, 60]], g: 0.04, echo: [90, 0.3] },
  tank: { wave: "sine", steps: [[260, 120, 120]], g: 0.05, noise: { ms: 100, f: 800, q: 1, g: 0.07 } },
  die: { wave: "sine", steps: [[600, 450, 180], [450, 300, 180], [300, 200, 220], [200, 70, 500]], vib: [4, 70], g: 0.06, echo: [260, 0.4] },
  done: { wave: "triangle", steps: [[392, 392, 110], [494, 494, 110], [587, 587, 110], [784, 784, 300]], g: 0.06, echo: [220, 0.35] },
  life: { wave: "sine", steps: [[659, 659, 80], [784, 784, 80], [988, 988, 80], [1319, 1319, 220]], g: 0.06, echo: [160, 0.35] },
  enter: { wave: "sine", steps: [[140, 520, 220]], g: 0.05, noise: { ms: 260, f: 800, q: 0.6, g: 0.06 } },
  nope: { wave: "square", steps: [[170, 170, 80], [120, 120, 120]], g: 0.03 },
  menu: { wave: "sine", steps: [[1000, 1000, 18]], g: 0.05 },
  pick: { wave: "sine", steps: [[1175, 1175, 30], [1568, 1568, 45]], g: 0.05 },
  /* a splicer who has seen Poom: a cackle, three falling notes */
  alert: { wave: "square", steps: [[880, 840, 60], [740, 700, 60], [620, 560, 90]], g: 0.03, vib: [9, 30] },
  /* the ambience: a bubble rising, and the city groaning */
  bubble: { wave: "sine", steps: [[500, 1300, 70]], g: 0.035, echo: [110, 0.4] },
  groan: { wave: "sawtooth", steps: [[70, 52, 1100]], vib: [2, 30], g: 0.018 },
};
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
const SOUND_SETS = { classic: SFX, wasteland: WASTE_SFX, thrum: THRUM_SFX, claw: CLAW_SFX, deep: DEEP_SFX, terminus: TERMINUS_SFX };

const audio = {
  ctx: null, muted: store.get(KEYS.muted, "0") === "1", set: SFX, noiseBuf: null,
  unlock() {
    if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
  },
  play(name) {
    const snd = this.set[name] || SFX[name];
    if (this.muted || !this.ctx || !snd) return;
    if (!Array.isArray(snd)) return this.voice(snd);
    const a = this.ctx, o = a.createOscillator(), g = a.createGain();
    o.type = "square";
    let t = a.currentTime + 0.005;
    o.frequency.setValueAtTime(SFX[name][0][0], t);
    g.gain.setValueAtTime(0.0, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.004);
    for (const [f0, f1, ms] of SFX[name]) {
      o.frequency.setValueAtTime(f0, t);
      o.frequency.linearRampToValueAtTime(f1, t + ms / 1000);
      t += ms / 1000;
    }
    g.gain.setValueAtTime(0.06, t - 0.01);
    g.gain.linearRampToValueAtTime(0, t + 0.01);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(t + 0.02);
  },
  /* a themed sound: a tone of any wave, wobbled, and/or a burst of static */
  voice(spec, at = 0, mul = 1) {
    const { wave = "square", steps = null, vib = null, noise = null, echo = null } = spec, vol = (spec.g || 0.06) * mul;
    const a = this.ctx, t0 = a.currentTime + 0.005 + at;
    /* an echo: the same sound again, later and quieter */
    if (echo && mul > 0.2) this.voice({ ...spec, echo: null }, at + echo[0] / 1000, mul * echo[1]);
    if (steps) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = wave;
      let t = t0;
      o.frequency.setValueAtTime(steps[0][0], t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.004);
      for (const [f0, f1, ms] of steps) {
        o.frequency.setValueAtTime(f0, t);
        o.frequency.linearRampToValueAtTime(f1, t + ms / 1000);
        t += ms / 1000;
      }
      g.gain.setValueAtTime(vol, t - 0.01);
      g.gain.linearRampToValueAtTime(0, t + 0.01);
      if (vib) {
        const lfo = a.createOscillator(), depth = a.createGain();
        lfo.frequency.value = vib[0]; depth.gain.value = vib[1];
        lfo.connect(depth); depth.connect(o.detune);
        lfo.start(t0); lfo.stop(t + 0.02);
      }
      o.connect(g); g.connect(a.destination);
      o.start(t0); o.stop(t + 0.02);
    }
    if (noise) {
      if (!this.noiseBuf) {
        this.noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
        const d = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      const src = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(), end = t0 + noise.ms / 1000;
      src.buffer = this.noiseBuf;
      bp.type = "bandpass"; bp.frequency.value = noise.f; bp.Q.value = noise.q;
      g.gain.setValueAtTime(noise.g * mul, t0);
      g.gain.exponentialRampToValueAtTime(0.0005, end);
      src.connect(bp); bp.connect(g); g.connect(a.destination);
      src.start(t0, Math.random() * 0.5); src.stop(end + 0.01);
    }
  },
  setMuted(m) { this.muted = m; store.set(KEYS.muted, m ? "1" : "0"); },
};
function useSound(name) { audio.set = SOUND_SETS[name] || SFX; }
/* the geiger counter: a click now and then, in bursts, on a theme that has
 * one, while Poom is out in the Glow (the map or a level) */
let geigerNext = 0;
function geigerTick() {
  if ((!audio.set.geiger && !audio.set.hum && !audio.set.surf && !audio.set.bubble && !audio.set.ping) || (G.mode !== "map" && G.mode !== "level") || UI.top()) return;
  if (G.t < geigerNext) return;
  /* the wasteland's geiger counter clicks in bursts; Thrum's Hum throbs,
     slow and low, every few seconds */
  if (audio.set.geiger) { sfx("geiger"); geigerNext = G.t + (Math.random() < 0.3 ? 3 + Math.random() * 6 : 40 + Math.random() * 160); }
  else if (audio.set.hum) { sfx("hum"); geigerNext = G.t + 180 + Math.random() * 240; }
  /* Raptura: bubbles in twos and threes, and now and then the city groans */
  /* TERMINUS: the motion tracker, pinging faster and higher as something nears */
  else if (audio.set.ping) { const d = nearestFoe(); sfx(d < 120 ? "pingNear" : "ping"); geigerNext = G.t + (d < 60 ? 22 : d < 120 ? 36 : d < 200 ? 60 : 120); }
  else if (audio.set.bubble) { if (Math.random() < 0.12) sfx("groan"); else { sfx("bubble"); setTimeout(() => sfx("bubble"), 140); } geigerNext = G.t + 150 + Math.random() * 260; }
  /* Isla Garra's surf, out on the map and the shore */
  else if (G.mode === "map" || (G.lv && G.lv.theme === "shore")) { sfx("surf"); geigerNext = G.t + 240 + Math.random() * 300; }
}
const sfx = n => audio.play(n);
/* how far the nearest creature is from Poom, in pixels (far off the map) */
function nearestFoe() {
  let d = 9999;
  if (G.mode === "level" && G.lv) for (const e of G.lv.ents) if (e.alive && e.type !== "G") d = Math.min(d, Math.hypot(e.x + e.w / 2 - G.lv.p.x - G.lv.p.w / 2, e.y + e.h / 2 - G.lv.p.y - G.lv.p.h / 2));
  return d;
}

/* ------------------------------------------------------------------ */
/* input                                                                 */

const BIND = {
  ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
  ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
  ControlLeft: "jump", ControlRight: "jump", KeyZ: "jump",
  AltLeft: "pogo", AltRight: "pogo", KeyX: "pogo",
  Space: "fire", KeyC: "fire",
  Enter: "status", Escape: "pause", KeyM: "mute",
};
const held = new Set(), pressed = new Set();
const touchHeld = new Set();
let padHeld = new Set();
const isDown = a => held.has(a) || touchHeld.has(a) || padHeld.has(a);
const wasPressed = a => pressed.has(a);

addEventListener("keydown", ev => {
  audio.unlock();
  if (!ev.repeat) konami(ev.code);
  if (UI.top()) { UI.key(ev); return; }
  const a = BIND[ev.code];
  if (!a) return;
  ev.preventDefault();
  if (!ev.repeat) pressed.add(a);
  held.add(a);
});
addEventListener("keyup", ev => { const a = BIND[ev.code]; if (a) held.delete(a); });
addEventListener("blur", () => { held.clear(); touchHeld.clear(); if (canPause()) openPause(); });
/* not while Poom is dying or walking out of a level: Leave level would
   otherwise take back a death, or throw away a level already finished */
function canPause() { return G.mode === "map" || (G.mode === "level" && G.lv && G.lv.p.state === "play"); }
addEventListener("pointerdown", () => audio.unlock());

let padPrev = new Set();
function pollPad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const now = new Set();
  for (const p of pads) {
    if (!p) continue;
    const b = i => p.buttons[i] && p.buttons[i].pressed;
    if (p.axes[0] < -0.4 || b(14)) now.add("left");
    if (p.axes[0] > 0.4 || b(15)) now.add("right");
    if (p.axes[1] < -0.5 || b(12)) now.add("up");
    if (p.axes[1] > 0.5 || b(13)) now.add("down");
    if (b(0)) now.add("jump");
    if (b(1)) now.add("pogo");
    if (b(2)) now.add("fire");
    if (b(3)) now.add("status");
    if (b(9)) now.add("pause");
  }
  for (const a of now) if (!padPrev.has(a)) {
    if (UI.top()) UI.padPress(a); else pressed.add(a);
  }
  padPrev = now;
  padHeld = UI.top() ? new Set() : now;
}

/* ------------------------------------------------------------------ */
/* game state                                                            */

const G = {
  mode: "boot", t: 0,
  run: null,      /* the game in progress: score, lives, parts, map position... */
  lv: null,       /* the level being played */
  map: null,      /* the world map */
  cam: { x: 0, y: 0 },
};

function newRun() {
  return { score: 0, nextLife: 20000, lives: 4, ammo: 0, pogo: true, parts: [false, false, false, false], aboard: [false, false, false, false],
    book: BOOK_IDS[0], done: {}, mx: null, my: null, swim: false };
}

/* ------------------------------------------------------------------ */
/* the books: js/books/<A-I>.js, each a world map and its levels.         */
/* Levels are addressed by map id (A02), never by number.                */

/* The order the books are played in; Book 1 is the first. Map sets keep
 * their letters (H01, H02...), the player sees numbers. */
const BOOK_ORDER = ["H", "C", "D", "E", "A", "B", "F", "G", "I"];
const BOOK_IDS = BOOK_ORDER.filter(b => BOOKS[b]);
const bookNumber = b => BOOK_IDS.indexOf(b) + 1;
/* Themes. A book's theme is everything about how the game looks and reads
 * while that book is played: Poom's look, the items, the creatures and the
 * world map (js/art.js), the title screen and logo, the subtitle, and its
 * words (BOOK_TEXT). The whole game wears the theme of the book being
 * played, or of the last one played: the title screen too. A new book
 * with its own theme adds an entry to BOOK_THEMES and one to THEME_OF_BOOK.
 * Books not listed wear Book 1's (classic, the original game's, is kept for a Book that names it). Level tilesets are
 * per level (LEVEL_THEME). */
const BOOK_THEMES = {
  classic: { name: "classic", look: "classic", items: "classic", creatures: "classic", map: "classic", title: "classic", subtitle: "Episode One: Lost on Planet Hiss" },
  wasteland: { name: "wasteland", look: "ranger", items: "wasteland", creatures: "wasteland", map: "wasteland", title: "wasteland", subtitle: "Book One: Wastelandia", hud: "wrist", sound: "wasteland" },
  /* Book 2, set C: Thrum, the hollow moon (docs/story/book-2-story.md).
     Pieces not yet its own borrow Book 1's for now */
  thrum: { name: "thrum", look: "hunter", items: "thrum", creatures: "hum", map: "thrum", title: "thrum", subtitle: "Book Two: Heavens to Mergatroid", hud: "visor", sound: "thrum" },
  /* Book 3, set D: Isla Garra, Dr Cal's island (docs/story/book-3-story.md);
     its art is in js/art-book3.js */
  claw: { name: "claw", look: "sneak", items: "claw", creatures: "claw", map: "claw", title: "claw", subtitle: "Book Three: The Island of Dr Cal", hud: "codec", sound: "claw" },
  /* Book 4, set E: Raptura, the city under the sea (docs/story/book-4-story.md);
     its art is in js/art-book4.js */
  deep: { name: "deep", look: "diver", items: "deep", creatures: "deep", map: "deep", title: "deep", subtitle: "Book Four: Descent into Raptura", hud: "deco", sound: "deep" },
  /* Book 5, set A: TERMINUS, the machine's station (docs/story/book-5-story.md);
     its art is in js/art-book5.js */
  terminus: { name: "terminus", look: "marine", items: "terminus", creatures: "terminus", map: "terminus", title: "terminus", subtitle: "Book Five: Termination Day", hud: "tracker", sound: "terminus" },
};
const THEME_OF_BOOK = { H: "wasteland", C: "thrum", D: "claw", E: "deep", A: "terminus" };
/* a book with no theme of its own wears Book 1's */
const themeOf = book => BOOK_THEMES[THEME_OF_BOOK[book] || THEME_OF_BOOK[BOOK_IDS[0]]] || BOOK_THEMES.classic;
/* the book a theme's words come from: the first that has that theme and words */
const themeHome = () => BOOK_IDS.find(b => THEME_OF_BOOK[b] === theme.name && BOOK_TEXT[b]);
let theme = BOOK_THEMES.classic;
/* the book the game is themed for: the one being played, else the last
 * one played, else Book 1 */
function themeBook() {
  if (G.run && G.run.book) return G.run.book;
  const last = store.get(KEYS.lastBook, null);
  return BOOKS[last] ? last : BOOK_IDS[0];
}
/* dress the whole game for a book, and remember it as the last played */
function dressFor(book) {
  theme = themeOf(book);
  useLook(theme.look); useItems(theme.items); useCreatures(theme.creatures); useSound(theme.sound);
  mapArt = mapArtSets[theme.map] || mapArtSets.classic;
  logoEl().dataset.look = theme.name; document.getElementById("ui").dataset.look = theme.name;
  document.title = "Commander Poom \u2014 " + theme.subtitle;
  if (BOOKS[book]) store.set(KEYS.lastBook, book);
}
const THEME_OF = { A: "hiss", B: "garden", C: "fort", D: "ice", E: "hiss", F: "garden", G: "fort", H: "ice", I: "hiss" };
/* A level's own tileset, by its type (docs/story/book-1-story.md). Vault 9,
 * the frozen one, is H09, H11 and H17; the raider camps are H04, H08 (Fort
 * Scrap), H13 and H15 (the Nest); the rest are the ruins of Old Litterburg.
 * Levels not listed use their book's. */
const LEVEL_THEME = { H09: "vaultCold", H11: "vaultCold", H17: "vaultCold", H10: "vault", H14: "vault",
  H04: "raiders", H08: "raiders", H13: "raiders", H15: "raiders",
  H02: "ruins", H03: "ruins", H05: "ruins", H06: "ruins", H07: "ruins", H12: "ruins", H16: "ruins",
  /* Book 2 (set C), docs/story/book-2-story.md: the Crags first */
  C02: "crags", C03: "crags", C04: "crags", C05: "crags", C06: "crags", C07: "crags",
  C08: "delve", C10: "delve", C11: "delve", C12: "delve", C14: "delve", C15: "delve",
  C09: "hive", C13: "hive", C16: "hive", C17: "hive",
  /* Book 3 (set D), docs/story/book-3-story.md: the Shore, the Base and the Crater */
  D02: "shore", D03: "shore", D04: "shore", D05: "shore", D06: "shore", D07: "shore",
  D08: "base", D10: "base", D11: "base", D12: "base", D13: "base", D14: "base", D15: "base",
  D09: "crater", D16: "crater", D17: "crater",
  /* Book 4 (set E), docs/story/book-4-story.md: the Kelp Gardens, the Promenade and the Works */
  E02: "gardens", E04: "gardens", E06: "gardens", E08: "gardens", E10: "gardens", E16: "gardens", E18: "gardens",
  E03: "promenade", E05: "promenade", E07: "promenade", E11: "promenade", E17: "promenade",
  E09: "works", E12: "works", E13: "works", E14: "works", E15: "works",
  /* Book 5 (set A), docs/story/book-5-story.md: the Machine Decks, the Biodome and the Hive */
  A02: "machine", A04: "machine", A08: "machine", A12: "machine", A13: "machine", A14: "machine", A15: "machine",
  A03: "biodome", A05: "biodome", A06: "biodome", A07: "biodome",
  A09: "hive5", A10: "hive5", A11: "hive5", A16: "hive5" };
const MAPS = {};
for (const b of BOOK_IDS) BOOKS[b].chapters.forEach(ch => ch.levels.forEach(lv => { MAPS[lv.id] = lv; lv.book = b; }));
/* a level's name: its place in a book that names its places, or its number */
const levelName = id => {
  const B = BOOK_TEXT[MAPS[id].book], place = B && B.places && B.places[id];
  return place ? `Level ${+id.slice(1) - 1}: ${place}` : `Book ${bookNumber(MAPS[id].book)}, level ${+id.slice(1) - 1}`;
};

/* Each Book's name (the player sees "Book Two: Heavens to Mergatroid"),
 * and which can be played yet; the rest show greyed out on New game. */
const BOOK_NAMES = { H: "Wastelandia", C: "Heavens to Mergatroid", D: "The Island of Dr Cal", E: "Descent into Raptura", A: "Termination Day" };
/* Book Five (A) is held back until its levels are proven winnable: the
 * game ends at Book Four for now */
const BOOK_PLAYABLE = new Set(["H", "C", "D", "E"]);

/* What finishes a book, beyond its levels: Book 2 (set C) ends when its
 * heartstones are all broken (docs/story/book-2-story.md); Book 3 (set D)
 * when its last level, Dr Cal's own, is done, whatever is left
 * (docs/story/book-3-story.md); a book with a ship ends at the ship; any
 * other when its levels are done. */
const BOOK_GOAL = { C: "hearts", D: { last: "D17" }, E: "rescues", A: { last: "A16" } };
/* the levels of a book that end by rescuing someone, and how many are saved */
const rescueLevels = b => Object.values(MAPS).filter(lv => lv.book === b && (lv.ends || []).some(e => e[4] === "rescue")).map(lv => lv.id);
const rescuedIn = (r, b) => rescueLevels(b).filter(id => (r.rescued || {})[id]).length;
const heartsIn = b => Object.values(MAPS).filter(lv => lv.book === b).reduce((n, lv) => n + lv.rows.join("").split("!").length - 1, 0);
const heartsBroken = (r, b) => Object.keys(r.hearts || {}).filter(id => MAPS[id] && MAPS[id].book === b).length;

/* what a world map's markers mean, worked out once per book */
const WORLDS = {};
for (const b of BOOK_IDS) {
  const w = BOOKS[b].world, at = (x, y) => x + "," + y;
  const W_ = { rows: w.rows, w: w.w, h: w.h, entrance: {}, barrier: {}, flag: {}, first: {}, need: [], tele: {} };
  /* teleporters: a Q tile with a link goes to the link's target */
  for (const [x, y, tx, ty, kind] of w.links || []) if (kind === "door" && (w.rows[y] || "")[x] === "Q") W_.tele[at(x, y)] = [tx, ty];
  for (const [x, y, g, name] of w.things) {
    const m = /^entrance to ([A-I]\d\d)/.exec(name);
    if (g === "l" && m && MAPS[m[1]]) { W_.entrance[at(x, y)] = m[1]; if (!W_.first[m[1]]) W_.first[m[1]] = [x, y]; }
  }
  for (const [x, y, name] of w.marks) {
    let m;
    if ((m = /^removed when ([A-I]\d\d) is done/.exec(name))) W_.barrier[at(x, y)] = m[1];
    else if ((m = /^done-flag spot for ([A-I]\d\d)/.exec(name))) W_.flag[m[1]] = [x, y];
  }
  const starts = w.things.filter(t => t[2] === "P");
  const start = starts.find(t => /player start/.test(t[3])) || starts[0];
  W_.start = start ? [start[0], start[1]] : [1, 1];
  /* a secret level is a bonus: the book is done without it */
  const secret = new Set([...BOOKS[b].chapters.flatMap(c => c.levels).map(l => l.secret).filter(Boolean), ...(w.secrets || [])]);
  W_.need = [...new Set(Object.values(W_.entrance))].filter(id => !secret.has(id)).sort();
  /* E1 maps (the older engine) number their objects instead of linking them:
   * 1-16 are levels, the rest the map's own things. An unfinished level
   * there is a wall: Poom walks up to it to go in. */
  W_.e1 = w.engine === "E1";
  /* each entrance's bounding box, in tiles: a marker is drawn once over it */
  W_.box = {};
  for (const [k, id] of Object.entries(W_.entrance)) {
    const [x, y] = k.split(",").map(Number), b = W_.box[id] || (W_.box[id] = { x0: x, y0: y, x1: x, y1: y });
    b.x0 = Math.min(b.x0, x); b.y0 = Math.min(b.y0, y); b.x1 = Math.max(b.x1, x); b.y1 = Math.max(b.y1, y);
  }
  W_.ship = w.ship || null;
  /* a Book whose map has no ship but whose story lands one (Book 2): park
     the Catamaran, as scenery, on the nearest open 2x2 of ground beside the
     start, keeping a tile clear round the start itself */
  if (!W_.ship && BOOK_GOAL[b] === "hearts") {
    const open = (x, y) => (w.rows[y] || "")[x] === "." && !W_.entrance[x + "," + y] && !W_.barrier[x + "," + y];
    const [sx, sy] = W_.start;
    let best = null;
    for (let y = sy - 4; y <= sy + 4; y++) for (let x = sx - 5; x <= sx + 5; x++) {
      if (![[x, y], [x + 1, y], [x, y - 1], [x + 1, y - 1]].every(([a, c]) => open(a, c))) continue;
      if (Math.abs(x - sx) <= 1 && Math.abs(y - sy) <= 2 || Math.abs(x + 1 - sx) <= 1 && Math.abs(y - sy) <= 2) continue;
      const d = Math.hypot(x + 0.5 - sx, y - 0.5 - sy);
      if (!best || d < best.d) best = { x, y, d };
    }
    if (best) W_.parked = [best.x, best.y];
  }
  /* a ferry (set D's map): a route over the water and its landings, in
     groups of touching tiles; standing on a landing, jump or fire rides it
     to the other one (rideFerry) */
  if (w.ferry) {
    const groups = [];
    for (const [x, y] of w.ferry.landings) {
      const g = groups.find(g => g.some(([a, c]) => Math.abs(a - x) + Math.abs(c - y) === 1));
      if (g) g.push([x, y]); else groups.push([[x, y]]);
    }
    W_.ferry = { path: new Set(w.ferry.path.map(([x, y]) => x + "," + y)), docks: groups, at: {} };
    groups.forEach((g, i) => g.forEach(([x, y]) => { W_.ferry.at[x + "," + y] = i; }));
  }
  WORLDS[b] = W_;
}
const world = () => WORLDS[G.run.book];

function saveRun() { if (G.run) store.set(KEYS.save, G.run); }
function seen(id) { const s = store.get(KEYS.seen, {}); if (s[id]) return true; s[id] = 1; store.set(KEYS.seen, s); return false; }

function addScore(n) {
  const r = G.run;
  r.score += n;
  /* an extra life at 20,000, then each time the score doubles: 40,000,
     80,000 and on, so a Book full of pickups doesn't hand out dozens */
  while (r.score >= r.nextLife) { r.nextLife *= 2; r.lives++; sfx("life"); popup(G.lv && G.lv.p, "1UP"); }
}

/* ------------------------------------------------------------------ */
/* the level                                                             */

const SOLID = new Set(["#", "=", "1", "2", "3", "4", "5", "6", "7", "8", "d", "i", "<", ">"]);
/* doors a key socket opens: 5 6 7 8, red yellow green blue */
const SOCKET_DOOR = { 5: 0, 6: 1, 7: 2, 8: 3 };
const ITEM_CH = { f: "fish", m: "milk", n: "yarn", c: "catnip", u: "medal", t: "trophy", a: "ammo", L: "life", O: "pogo" };
const POINTS = { fish: 100, milk: 200, yarn: 500, catnip: 1000, medal: 2000, trophy: 5000 };
/* q is a keycard whose colour the map doesn't give; d is a locked door
 * whose colour it doesn't give, and any keycard opens one */
const GEM_CH = { r: 0, y: 1, g: 2, b: 3, q: 4 };
const DOOR_CH = { 1: 0, 2: 1, 3: 2, 4: 3, d: 4 };
const GEM_NAMES = ["red", "yellow", "green", "blue", "silver"];
const BELT = { "<": -1, ">": 1 };

function loadLevel(n) {
  const def = MAPS[n], theme = LEVEL_THEME[n] || THEME_OF[def.book];
  const rows = def.rows.map(r => [...r]);
  const h = rows.length, w = rows[0].length;
  const lv = { n, def, w, h, tiles: rows, back: [], ents: [], items: [], shots: [], fx: [], keys: [false, false, false, false, false],
    theme, ice: false, swim: !!def.swim, t: 0, p: null, exits: [], exitAt: {}, edge: new Set(), npcs: [], endsLeft: 0, warp: {}, warpDoors: [], sockets: [], socketAt: {}, bridges: [], switchAt: {}, deckAt: new Set(), plats: [], pmark: new Map(), pswitchAt: {}, secretAt: new Set(), signDrop: {}, signs: [], over: null, slope: slopesOf(rows) };
  /* Under a slope the maps leave the odd non-solid tile where the ground's
   * edge was drawn. Boxed in on both sides, it is ground. */
  const isSl = (x, y) => !!(lv.slope[y] && lv.slope[y][x]);
  const firm = (x, y) => SOLID.has((rows[y] || [])[x]) || isSl(x, y);
  for (let y = 1; y < h; y++) for (let x = 1; x < w - 1; x++)
    if (rows[y][x] === "." && firm(x - 1, y) && firm(x + 1, y) && (isSl(x - 1, y - 1) || isSl(x, y - 1) || isSl(x + 1, y - 1))) rows[y][x] = "#";
  lv.art = paintTiles(theme);
  lv.far = paintFar(theme);
  /* a tile that held a thing becomes the air around it */
  const airOf = (x, y) => [[1, 0], [-1, 0], [0, -1], [0, 1]].some(([dx, dy]) => (rows[y + dy] || [])[x + dx] === "+") ? "+" : ".";
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = rows[y][x], px = x * T, py = y * T;
    /* the first start in the map wins (D10 has two) */
    if (c === "P") { if (!lv.p) { lv.p = makePlayer(px + 2, py + T - 22); lv.p0 = [lv.p.x, lv.p.y]; } rows[y][x] = airOf(x, y); }
    else if (c === "E") { lv.exitAt[x + "," + y] = true; rows[y][x] = "."; }
    else if (c === "X") { lv.edge.add(x + "," + y); rows[y][x] = "."; }
    else if (c === "!" || c === "w") {
      /* in a book with a ship, objective types 01-04 are its four parts */
      const th = (def.things || []).find(t => t[0] === x && t[1] === y && t[2] === "!"), type = th && +(/objective type (\d+)/.exec(th[3]) || [])[1];
      if (c === "!" && WORLDS[def.book].ship && type >= 1 && type <= 4) lv.items.push({ kind: "part", part: type - 1, x: px, y: py, t: 0 });
      /* a heartstone, unless this run has already broken it */
      else if (c === "!" && BOOK_GOAL[def.book] === "hearts") { if (!(G.run && G.run.hearts && G.run.hearts[n])) lv.items.push({ kind: "heart", x: px, y: py, t: 0 }); }
      else lv.items.push({ kind: c === "!" ? "objective" : "swim", part: lv.items.length % 4, x: px, y: py, t: 0 });
      rows[y][x] = airOf(x, y);
    }
    else if (ITEM_CH[c]) { lv.items.push({ kind: ITEM_CH[c], x: px, y: py, t: Math.random() * 60 | 0 }); rows[y][x] = airOf(x, y); }
    else if (GEM_CH[c] !== undefined) { lv.items.push({ kind: "gem", gem: GEM_CH[c], x: px, y: py, t: 0 }); rows[y][x] = airOf(x, y); }
    else if (c === "*") { lv.items.push({ kind: "part", part: def.part, x: px, y: py, t: 0 }); rows[y][x] = airOf(x, y); }
    else if ("xBVTKW".includes(c)) { lv.ents.push(makeEnemy(c, px, py + T)); rows[y][x] = airOf(x, y); }
  }
  /* the books' creatures and turrets, from the map's things. A creature
     may slide along an axis (0 across, 1 up and down) or keep bouncing, and
     one that "carries key" drops a keycard the level is missing */
  const kinds = ENEMY_OF[def.book] || {}, carriers = [];
  for (const [x, y, g, name] of def.things || []) {
    if (g === "e") {
      const spec = kinds[(/enemy type (\d+)/.exec(name) || [])[1]];
      if (!spec) continue;
      const t = typeof spec === "string" ? spec : spec.kind;
      const e = makeEnemy(t, x * T, y * T + T, typeof spec === "string" ? null : (({ kind, ...rest }) => rest)(spec)), axis = /sliding, axis (\d)/.exec(name);
      if (axis) { e.slide = +axis[1]; if (e.slide === 1) { e.vx = 0; e.vy = e.speed; } }
      if (/bouncing/.test(name)) e.bounce = true;
      if (/carries key/.test(name)) carriers.push(e);
      lv.ents.push(e);
    }
    if (g === "G") {
      const dir = (/turret \(([\w-]+)\)/.exec(name) || [])[1], d = TURRET_DIR[dir] || [1, 0];
      const e = makeEnemy("G", x * T, y * T + T);
      e.aim = d.slice(); e.face = d[0] < 0 ? -1 : 1; e.vx = 0; e.alternate = dir === "horizontal" || dir === "vertical";
      lv.ents.push(e);
    }
  }
  if (carriers.length) {
    const want = new Set();
    for (const sk of def.sockets || []) want.add(sk.gem);
    rows.forEach(r => r.forEach(c => { if (DOOR_CH[c] !== undefined) want.add(DOOR_CH[c]); }));
    for (const it of lv.items) if (it.kind === "gem") want.delete(it.gem);
    const missing = [...want];
    carriers.forEach((e, i) => { if (i < missing.length) e.carries = missing[i]; });
  }
  /* a locked door whose keycard isn't in the level at all (set D's D05 and
     D10 have one each; the map maker can say why) takes any keycard the
     level does have, like a door of no stated colour; with none, it stands
     open, so no level can't be finished for want of a card */
  {
    const have = new Set(lv.items.filter(i => i.kind === "gem").map(i => i.gem));
    lv.ents.forEach(e => { if (e.carries !== undefined) have.add(e.carries); });
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = rows[y][x], d = DOOR_CH[c];
      if (d === undefined || d === 4 || have.has(d)) continue;
      rows[y][x] = have.size ? "d" : airOf(x, y);
    }
  }
  /* Exit doors: each connected group of exit tiles is one door. Walking
   * into any of its tiles finishes the level; it is drawn standing on the
   * floor up to three tiles below the group, or at the group's foot. */
  for (const k of Object.keys(lv.exitAt)) {
    if (lv.exitAt[k] !== true) continue;
    const g = { tx0: Infinity, tx1: -1, ty0: Infinity, ty1: -1 }, todo = [k];
    while (todo.length) {
      const c = todo.pop();
      if (lv.exitAt[c] !== true) continue;
      lv.exitAt[c] = g;
      const [x, y] = c.split(",").map(Number);
      g.tx0 = Math.min(g.tx0, x); g.tx1 = Math.max(g.tx1, x); g.ty0 = Math.min(g.ty0, y); g.ty1 = Math.max(g.ty1, y);
      todo.push((x + 1) + "," + y, (x - 1) + "," + y, x + "," + (y + 1), x + "," + (y - 1));
    }
    const cx = Math.floor((g.tx0 + g.tx1) / 2);
    let fy = g.ty1 + 1;
    while (fy <= g.ty1 + 3 && fy < h && !isSolid(rows[fy][cx]) && rows[fy][cx] !== "-") fy++;
    const foot = fy <= g.ty1 + 3 && fy < h ? fy : g.ty1 + 1;
    g.x = (g.tx0 + g.tx1) * T / 2; g.y = foot * T - T * 2;
    lv.exits.push(g);
  }

  /* Warp doors. Each D tile has its own target (the left half of a door
   * leads to the left half of the arrival); a link on anything but a D is
   * not a door and is ignored. A door is two tiles wide; drawn two columns
   * at a time, over its D rows and, when it is one row tall, the row below. */
  for (const [x, y, tx, ty, kind] of def.links || []) if (kind === "door" && rows[y] && rows[y][x] === "D") lv.warp[x + "," + y] = [tx, ty];
  const doneD = new Set();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (rows[y][x] !== "D" || doneD.has(x + "," + y)) continue;
    let x1 = x; while (x1 + 1 < w && rows[y][x1 + 1] === "D" && x1 - x < 1) x1++;
    let y1 = y; while (y1 + 1 < h && rows[y1 + 1][x] === "D") y1++;
    for (let yy = y; yy <= y1; yy++) for (let xx = x; xx <= x1; xx++) doneD.add(xx + "," + yy);
    lv.warpDoors.push({ x: x * T, y: y * T, w: (x1 - x + 1) * T, h: Math.max(2, y1 - y + 1) * T });
  }

  /* key sockets, and the doors they open; bridge switches, and their decks */
  for (const s of def.sockets || []) {
    const k = { ...s, filled: false };
    lv.sockets.push(k); lv.socketAt[s.x + "," + s.y] = k;
    if (rows[s.y][s.x] === "j") rows[s.y][s.x] = ".";
  }
  for (const b of def.bridges || []) {
    const k = { ...b };
    lv.bridges.push(k); lv.switchAt[b.x + "," + b.y] = k;
    for (const [x, y] of b.deck) lv.deckAt.add(x + "," + y);
  }

  /* moving platforms, the markers that steer them, and their switches */
  for (const [x, y, name] of def.marks || []) {
    if (/^Platform blocker/.test(name)) lv.pmark.set(x + "," + y, "B");
    const m = /^Platform path arrow (\w+)$/.exec(name);
    if (m && DIRS[m[1]]) lv.pmark.set(x + "," + y, m[1]);
  }
  for (const [x, y, g, name] of def.things || []) if (g === "M") {
    const pl = makePlat(name, x * T, y * T);
    /* on the newer engine a platform's deck is half a tile down its cell:
       G11 and E15 send one under a ceiling two tiles up, and a rider only
       fits if he stands that low */
    if (def.engine === "E2") pl.sink = 8;
    lv.plats.push(pl); rows[y][x] = ".";
    /* the map holds one object a cell, so an arrow-guided platform's own cell
       has no arrow: its starting direction is that cell's arrow */
    if (pl.kind === "arrow" && !lv.pmark.has(x + "," + y)) lv.pmark.set(x + "," + y, pl.dirName);
  }
  for (const s of def.pswitches || []) {
    const k = { ...s, on: false, mark: lv.pmark.get(s.tx + "," + s.ty) || "B" };
    lv.pswitchAt[s.x + "," + s.y] = k;
  }

  /* a hint sign stands on the floor below it, up to three tiles down: the
     maps put the sign where its message is, not always on the ground */
  /* an NPC who isn't there to be rescued (set E's type 02, Keen 4's hint
     giver) is something to read, like a sign: Book 4's audio diaries */
  const rescuers = new Set((def.ends || []).filter(e => e[4] === "rescue").map(e => e[0] + "," + e[1]));
  for (const [x, y, g] of def.things || []) if (g === "N" && !rescuers.has(x + "," + y) && rows[y] && rows[y][x] === "N") rows[y][x] = "H";
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (rows[y][x] === "H") {
    let d = 0;
    while (d < 3 && y + d + 1 < h && !isSolid(rows[y + d + 1][x]) && rows[y + d + 1][x] !== "-") d++;
    if (d < 3) lv.signDrop[x + "," + y] = d;
    lv.signs.push({ x: x * T, y: (y + (d < 3 ? d : 0)) * T, n: lv.signs.length });
  }

  /* a secret exit: the level's teleporter */
  if (def.secret) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (rows[y][x] === "Q") { lv.secretAt.add(x + "," + y); rows[y][x] = "."; }

  /* what else finishes the level: the source's rescue NPCs and objectives */
  for (const [x, y, g, , how] of def.ends || []) {
    if (how === "rescue") { lv.npcs.push({ x: x * T, y: y * T + T - 16, w: 14, h: 16, t: 0 }); continue; }
    let it = lv.items.find(i => (i.kind === "objective" || i.kind === "swim") && i.x === x * T && i.y === y * T);
    if (!it) lv.items.push(it = { kind: g === "w" ? "swim" : "objective", part: lv.items.length % 4, x: x * T, y: y * T, t: 0 });
    if (!it.ends) { it.ends = true; lv.endsLeft++; }
  }

  /* back wall behind anything that stands in a walled room */
  for (let y = 0; y < h; y++) { lv.back[y] = []; for (let x = 0; x < w; x++) lv.back[y][x] = rows[y][x] === "+"; }
  for (let pass = 0; pass < 2; pass++) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (lv.back[y][x] || SOLID.has(rows[y][x])) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((lv.back[y + dy] || [])[x + dx]) lv.back[y][x] = true;
  }
  /* a switch on an older-engine (E1) map that isn't a bridge switch (the
     transcriber reads those, and the harmless ones, as bridges) is a trap:
     the game-over switch next to a goal, as in Commander Keen 2. Only set C
     has any: the levers by its heartstones. (Set G's unwired E2 switches
     are something else, not yet built.) */
  lv.trapAt = new Set();
  lv.hasPulse = def.rows.some(r => r.includes("z"));
  /* a hazard hanging from rock, with open space below, points down: drawn
     upside down, and it's the lower half that hurts */
  lv.hang = new Set();
  for (let y = 1; y < h; y++) for (let x = 0; x < w; x++)
    if (rows[y][x] === "^" && SOLID.has(rows[y - 1][x]) && !(rows[y + 1] && SOLID.has(rows[y + 1][x]))) lv.hang.add(x + "," + y);
  /* steam: the Works' vents blow him away from the nozzle (up, or down from
     a ceiling) and the pulsing columns shove him out sideways while they're
     on. Neither hurts */
  lv.steam = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (rows[y][x] === "z") lv.steam.push([x, y, 0]);
    else if (rows[y][x] === "^" && theme === "works") lv.steam.push([x, y, lv.hang.has(x + "," + y) ? 1 : -1]);
  }
  if (def.engine === "E1") for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (rows[y][x] === "S" && !lv.switchAt[x + "," + y] && !lv.pswitchAt[x + "," + y]) lv.trapAt.add(x + "," + y);

  /* Book 2: the Hum has grown into every heartstone's chamber, whatever the
     level's biome, so a ragged oval round each one wears the Hive's tiles */
  if (BOOK_GOAL[def.book] === "hearts" && theme !== "hive") {
    lv.hiveAt = new Set();
    def.rows.forEach((row, hy) => [...row].forEach((c, hx) => {
      if (c !== "!") return;
      for (let dy = -9; dy <= 9; dy++) for (let dx = -11; dx <= 11; dx++) {
        const x = hx + dx, y = hy + dy, ragged = (((x * 73856093) ^ (y * 19349663)) >>> 0) % 7 / 7 * 0.4;
        if ((dx / 11) ** 2 + (dy / 9) ** 2 <= 1 - ragged) lv.hiveAt.add(x + "," + y);
      }
    }));
    if (lv.hiveAt.size) lv.hiveArt = paintTiles("hive");
  }
  /* a turret is placed by its top tile; stand it on the floor below (one
     that fires downward hangs where it is) */
  for (const e of lv.ents) if (e.type === "G" && !(e.aim && e.aim[1] > 0)) {
    const tx = Math.floor((e.x + e.w / 2) / T);
    for (let k = 0; k < 3 && !isSolid(tileAt(lv, tx, Math.floor((e.y + e.h) / T))); k++) e.y += T;
  }
  /* Poom stands with his feet at the bottom of the start tile, but he is
     taller than a tile: under a low ceiling that puts his head in the rock.
     Ease him down (or up) to the nearest spot clear of solid tiles. */
  if (lv.p && !rectClear(lv, lv.p.x, lv.p.y, lv.p.w, lv.p.h)) {
    const y0 = lv.p.y;
    for (let d = 1; d <= T * 2; d++) {
      if (rectClear(lv, lv.p.x, y0 + d, lv.p.w, lv.p.h)) { lv.p.y = y0 + d; break; }
      if (rectClear(lv, lv.p.x, y0 - d, lv.p.w, lv.p.h)) { lv.p.y = y0 - d; break; }
    }
  }
  return lv;
}

/* Slopes. A row's run of n like slope tiles climbs one tile height, so a
 * lone / is 45 degrees and a pair is half that. Each slope tile gets its
 * surface heights at its left and right edges, in pixels from its bottom. */
function slopesOf(rows) {
  const out = [];
  rows.forEach((r, y) => {
    out[y] = {};
    for (let x = 0; x < r.length;) {
      const c = r[x];
      if (c !== "/" && c !== "\\") { x++; continue; }
      let n = 0; while (r[x + n] === c) n++;
      for (let k = 0; k < n; k++) out[y][x + k] = c === "/" ? [Math.round(T * k / n), Math.round(T * (k + 1) / n)] : [Math.round(T * (n - k) / n), Math.round(T * (n - k - 1) / n)];
      x += n;
    }
  });
  return out;
}

/* the y of a slope's surface at pixel column px, or null if tx,ty is no slope */
function slopeTop(lv, tx, ty, px) {
  const s = lv.slope[ty] && lv.slope[ty][tx];
  if (!s) return null;
  const f = Math.max(0, Math.min(1, (px - tx * T) / T));
  return ty * T + T - (s[0] + (s[1] - s[0]) * f);
}

const tileAt = (lv, tx, ty) => (tx < 0 || tx >= lv.w) ? "#" : (ty < 0 || ty >= lv.h) ? "." : lv.tiles[ty][tx];
const isSolid = c => SOLID.has(c);

/* a pulsing column (z) runs on a cycle: deadly, then gone, then a warning
 * flicker before it comes back. Ticks */
const PULSE = { period: 150, on: 60, warn: 30 };
/* the Works' vents blow in bursts, all together: on, then off long enough
 * to walk past, with a wisp just before the next burst. Ticks */
const VENT = { period: 150, on: 70, warn: 20 };
const ventPhase = lv => { const t = lv.t % VENT.period; return t < VENT.on ? "on" : t < VENT.period - VENT.warn ? "off" : "warn"; };
const pulsePhase = lv => { const t = lv.t % PULSE.period; return t < PULSE.on ? "on" : t < PULSE.period - PULSE.warn ? "off" : "warn"; };

/* the hazard part of a tile, in tile-local pixels, or null */
function hazardRect(c, lv) {
  if (c === "z") return lv && pulsePhase(lv) === "on" ? [3, 0, 10, 16] : null;
  if (c === "^") return [1, 8, 14, 8];
  if (c === "~") return [0, 6, 16, 10];
  return null;
}

/* move a body sideways through the tiles. On a slope, a body walking into
 * the ground at its top steps up onto it. */
function moveX(lv, b, dx, hit) {
  if (!dx) return;
  let nx = b.x + dx;
  const ty0 = Math.floor(b.y / T), ty1 = Math.floor((b.y + b.h - 1) / T);
  const tx = dx > 0 ? Math.floor((nx + b.w - 1) / T) : Math.floor(nx / T);
  /* a one-way wall blocks one way only: ( going left, ) going right */
  const wall = c => isSolid(c) || (dx > 0 ? c === ")" : c === "(");
  for (let ty = ty0; ty <= ty1; ty++) if (wall(tileAt(lv, tx, ty))) {
    if (b.onSlope) for (let up = 1; up <= 10; up++) if (rectClear(lv, nx, b.y - up, b.w, b.h)) { b.y -= up; b.x = nx; return; }
    nx = dx > 0 ? tx * T - b.w : (tx + 1) * T;
    if (dx > 0) hit.right = true; else hit.left = true;
    break;
  }
  b.x = nx;
}

/* move a body through the tiles: x, then y. Returns what it hit. */
function moveBody(lv, b, oneway = true) {
  const hit = { left: false, right: false, top: false, bottom: false };
  moveX(lv, b, b.vx, hit);
  const wasGround = b.onGround, falling = b.vy >= 0, prevBottom = b.y + b.h;
  b.onGround = false;
  let ny = b.y + b.vy;
  const tx0 = Math.floor(b.x / T), tx1 = Math.floor((b.x + b.w - 1) / T);
  if (b.vy >= 0) {
    const ty = Math.floor((ny + b.h) / T), top = ty * T;
    for (let tx = tx0; tx <= tx1; tx++) {
      const c = tileAt(lv, tx, ty);
      if (isSolid(c) || (oneway && c === "-" && !b.dropT && b.y + b.h <= top + 0.01)) {
        if (ny + b.h >= top) { ny = top - b.h; hit.bottom = true; b.onGround = true; }
        break;
      }
    }
  } else {
    const ty = Math.floor(ny / T);
    for (let tx = tx0; tx <= tx1; tx++) if (isSolid(tileAt(lv, tx, ty))) { ny = (ty + 1) * T; hit.top = true; break; }
  }
  b.y = ny;
  /* slopes: stand on the surface; walking down one, stay on it */
  b.onSlope = false;
  if (falling) {
    const fx = b.x + b.w / 2, ftx = Math.floor(fx / T), fty = Math.floor((b.y + b.h - 1) / T);
    for (const ty of [fty, fty + 1]) {
      const top = slopeTop(lv, ftx, ty, fx);
      if (top === null) continue;
      if (b.y + b.h >= top || (wasGround && top - (b.y + b.h) <= 8)) { b.y = top - b.h; hit.bottom = true; b.onGround = true; b.onSlope = true; }
      break;
    }
  }
  /* a moving platform, for Poom: land on it, or keep standing on it */
  if (b === lv.p) {
    b.riding = null;
    if (falling && !hit.bottom && !b.dropT) {
      const pl = landOnPlat(lv, b, prevBottom);
      if (pl) { b.y = pl.y + pl.sink - b.h; hit.bottom = true; b.onGround = true; b.riding = pl; }
    }
  }
  if (hit.bottom || hit.top) b.vy = 0;
  return hit;
}

/* is there floor just ahead of a walker's leading foot? */
function floorAhead(lv, b) {
  const fx = b.vx > 0 ? b.x + b.w + 1 : b.x - 2, fy = b.y + b.h + 2;
  const tx = Math.floor(fx / T), ty = Math.floor(fy / T), c = tileAt(lv, tx, ty);
  return isSolid(c) || c === "-" || slopeTop(lv, tx, ty, fx) !== null || slopeTop(lv, tx, ty - 1, fx) !== null;
}

/* is a rectangle clear of solid tiles? */
function rectClear(lv, x, y, w, h) {
  for (let ty = Math.floor(y / T); ty <= Math.floor((y + h - 1) / T); ty++)
    for (let tx = Math.floor(x / T); tx <= Math.floor((x + w - 1) / T); tx++) if (isSolid(tileAt(lv, tx, ty))) return false;
  return true;
}

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/* ------------------------------------------------------------------ */
/* Poom                                                                  */

const PH = 22, POGO_H = 8;

/* Movement, in pixels and 60 Hz ticks, after Commander Keen 1's engine (the
 * Vorticon engine as Commander Genius reproduces it: 32 sub-units to the
 * pixel). Keen walks briskly but floats: gravity is a third of a modern
 * platformer's, a jump starts with a short crouch that decides its height
 * and stops him dead, air control is weak, and the pogo compresses on every
 * landing before it fires him upward. */
const KP = {
  walkMax: 68 / 32, walkAccel: 3.6 / 32, groundFriction: 14 / 32, airFriction: 2 / 32,
  gravity: 4 / 32, maxFall: 104 / 32,
  jumpSpeed: 120 / 32, jumpCrouch: 5, jumpCarry: 64 / 32, airAccel: 3 / 32,
  /* a held bounce clears about ten tiles: the maps are built for it (C05's
     start shaft, E04's ledges nine tiles over the hump) */
  pogoBig: 6.4, pogoSmall: 2.76, pogoCompress: 10, pogoAirAccel: 2 / 32,
  shotSpeed: 124 / 32, refire: 7, fireStance: 14,
};

function makePlayer(x, y) {
  return { x, y, w: 12, h: PH, vx: 0, vy: 0, face: 1, onGround: false, pogo: false, climbing: false,
    crouch: 0, crouchHeld: 0, compress: 0, pogoBigAsk: false, coyote: 0, buffer: 0, shootT: 0, fireCool: 0, anim: 0,
    pushV: 0, pushT: 0, dropT: 0, poleCool: 0, land: 0, state: "play", t: 0 };
}

function updatePlayer(lv) {
  const p = lv.p, run = G.run;
  p.t++;
  if (p.state === "dead") {
    p.y += p.vy; p.x += p.vx;
    if (run.arcade && p.t > 50) { respawn(lv); return; }
    if (p.t > 100) loseLife();
    return;
  }
  if (p.safeT > 0) p.safeT--;
  /* arcade: where he has lately stood on firm ground, to come back to */
  /* never a spot in a hazard tile (E16's floor spikes: standing on the
     rock under them looks like firm ground) */
  if (run.arcade && p.onGround && !p.riding && !p.climbing && !p.pogo && !p.safeT && !tilesUnder(p).some(k => { const [x, y] = k.split(",").map(Number), c = tileAt(lv, x, y); return c === "^" || c === "z"; })) {
    const ring = lv.safeRing || (lv.safeRing = []);
    ring.push([lv.t, p.x, p.y]); if (ring.length > 300) ring.shift();
  }
  if (p.state === "exit") {
    if (p.t > 50) finishLevel();
    return;
  }

  const L = isDown("left"), R = isDown("right"), U = isDown("up"), D = isDown("down");
  const ax = (R ? 1 : 0) - (L ? 1 : 0);
  if (wasPressed("jump")) p.buffer = 7;
  if (p.buffer > 0) p.buffer--;
  if (p.fireCool > 0) p.fireCool--;
  if (p.shootT > 0) p.shootT--;
  if (p.dropT > 0) p.dropT--;
  if (p.poleCool > 0) p.poleCool--;
  if (p.land > 0) p.land--;
  if (ax) p.face = ax;
  const underfoot = tileAt(lv, Math.floor((p.x + p.w / 2) / T), Math.floor((p.y + p.h + 1) / T));
  const ice = lv.ice || (p.onGround && underfoot === "i");

  /* under water: no pogo, no poles, no raygun; he swims */
  if (lv.swim) swimMove(lv, p, ax, U, D);

  /* pogo on and off */
  if (wasPressed("pogo") && !p.climbing && !lv.swim) {
    if (!run.pogo) { if (!seen("nopogo")) toast(say("noPogo", "You don't have a pogo stick yet.")); sfx("click"); }
    else if (!p.pogo) {
      if (rectClear(lv, p.x, p.y - POGO_H, p.w, POGO_H)) {
        p.pogo = true; p.y -= POGO_H; p.h = PH + POGO_H;
        if (p.onGround) { p.compress = KP.pogoCompress; p.pogoBigAsk = false; }
      } else sfx("bump");
    } else { p.pogo = false; p.y += POGO_H; p.h = PH; p.compress = 0; }
  }

  /* through a warp door: up, standing in front of one */
  const door = !p.climbing && warpAt(lv, p);
  if (door && !seen("warpdoor")) toast(say("warpDoor", "A door. Press \u2191 to go through."));
  if (door && wasPressed("up")) { warpTo(lv, p, door); return; }

  /* a trap switch, and ample warning of it. Coming near one says so (once
     a lever); up at it asks first; only up again, soon after, pulls it,
     and that's the game */
  if (lv.trapAt.size && !door) {
    const pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
    for (const k of lv.trapAt) {
      const [tx, ty] = k.split(",").map(Number);
      if ((lv.trapWarned || (lv.trapWarned = new Set())).has(k) || Math.abs(tx * T + 8 - pcx) > 44 || Math.abs(ty * T + 8 - pcy) > 36) continue;
      lv.trapWarned.add(k);
      toast(say("trapNear", "A lever. Something about it doesn't feel right. Leave it alone."));
    }
  }
  if (!lv.pulseWarned && lv.hasPulse) {
    const ptx = Math.floor((p.x + p.w / 2) / T), pty = Math.floor((p.y + p.h / 2) / T);
    for (let dy = -2; dy <= 2 && !lv.pulseWarned; dy++) for (let dx = -3; dx <= 3; dx++) if (tileAt(lv, ptx + dx, pty + dy) === "z") {
      lv.pulseWarned = true;
      toast(say("pulseNear", "Those spikes come and go. When they flicker, they're coming back: wait for them to drop, then run."));
      break;
    }
  }
  const trap = !door && !p.climbing && wasPressed("up") && tilesUnder(p).find(k => lv.trapAt.has(k));
  if (trap) {
    if (lv.trapArmed === trap && lv.t - lv.trapArmedT < 240) { springTrap(lv, trap); return; }
    lv.trapArmed = trap; lv.trapArmedT = lv.t; sfx("nope");
    message(say("trapAsk", "<b>Careful.</b><br><br>This lever is a trap. Press ↑ again to pull it anyway."));
    return;
  }

  /* a hint sign: up, standing at it, reads it */
  const sign = !door && !p.climbing && signAt(lv, p);
  if (sign && lv.signNear !== sign) { lv.signNear = sign; toast(say("signNear", "A sign. Press \u2191 to read it.", lv.theme)); }
  if (!sign) lv.signNear = null;
  if (sign && wasPressed("up")) { readSign(lv, sign); return; }

  /* a key socket: stand at it with its keycard */
  for (const k of tilesUnder(p)) {
    const s = lv.socketAt[k];
    if (!s || s.filled) continue;
    if (lv.keys[s.gem]) fillSocket(lv, s);
    else if (lv.socketWarned !== s) { lv.socketWarned = s; toast(say("socket", c => `A ${c} keycard goes here.`, GEM_NAMES[s.gem])); }
  }

  /* a bridge switch: up, standing at it */
  if (wasPressed("up") && !p.climbing) {
    const b = tilesUnder(p).map(k => lv.switchAt[k]).find(Boolean);
    if (b) { flipBridge(lv, b); return; }
    const ps = tilesUnder(p).map(k => lv.pswitchAt[k]).find(Boolean);
    if (ps) { flipPlatSwitch(lv, ps); return; }
  }

  /* grab a pole */
  const cx = p.x + p.w / 2;
  const poleAt = y => tileAt(lv, Math.floor(cx / T), Math.floor(y / T)) === "|";
  if (!p.climbing && !p.pogo && !p.poleCool && (U || (D && !p.onGround)) && poleAt(p.y + 6) ||
      !p.climbing && !p.pogo && !p.poleCool && D && p.onGround && poleAt(p.y + p.h + 4)) {
    const ptx = Math.floor(cx / T);
    p.climbing = true; p.x = ptx * T + T / 2 - p.w / 2; p.vx = 0; p.vy = 0; p.onGround = false; p.coyote = 0; p.crouch = 0;
    if (D && p.onGround && !poleAt(p.y + 6)) p.y += 4;
  }

  if (p.climbing) {
    p.vx = 0;
    if (U && poleAt(p.y + 4)) { p.y -= 1.3; p.anim++; }
    else if (D) {
      p.y += 2;
      p.anim++;
      const under = tileAt(lv, Math.floor(cx / T), Math.floor((p.y + p.h) / T));
      if (isSolid(under) || under === "-") { p.y = Math.floor((p.y + p.h) / T) * T - p.h; p.climbing = false; p.onGround = true; }
    }
    if (p.climbing && !poleAt(p.y + 6)) { p.climbing = false; }
    /* step sideways off the pole, but only onto floor */
    if (p.climbing && ax) {
      const nx = p.x + ax * 10, fy0 = Math.floor((p.y + p.h - 4) / T);
      const floorAt = fy => [Math.floor(nx / T), Math.floor((nx + p.w - 1) / T)].some(tx => { const c = tileAt(lv, tx, fy); return isSolid(c) || c === "-"; });
      const fy = [fy0, fy0 + 1, fy0 + 2].find(floorAt) ?? -1, feet = fy * T;
      if (fy >= 0 && Math.abs(feet - (p.y + p.h)) <= 20 && rectClear(lv, nx, feet - p.h, p.w, p.h)) {
        p.climbing = false; p.y = feet - p.h; p.x = nx; p.vx = ax; p.vy = 0; p.poleCool = 10;
      }
    }
    if (p.climbing && p.buffer > 0) {
      p.climbing = false; p.buffer = 0; p.poleCool = 12;
      p.vy = -2.6; p.vx = ax * KP.jumpCarry; sfx("jump");
    }
  }

  if (!p.climbing && !lv.swim) {
    const busy = p.crouch > 0 || p.compress > 0;
    const stance = p.shootT > 0 && p.onGround && !p.pogo;

    /* walk: a quick build to top speed, an instant stop on reversing, and
       friction when nothing is held */
    if (p.pushT > 0) { p.pushT--; p.vx = p.pushV; }
    else if (busy || stance) { /* crouching, compressing or firing: feet planted */ }
    else if (p.onGround && !p.pogo) {
      if (ax) {
        if (Math.sign(p.vx) === -ax) p.vx = 0;
        p.vx += ax * (ice ? KP.walkAccel / 3 : KP.walkAccel);
      } else p.vx -= Math.sign(p.vx) * Math.min(Math.abs(p.vx), ice ? KP.airFriction : KP.groundFriction);
    } else {
      if (ax) p.vx += ax * (p.pogo ? KP.pogoAirAccel : KP.airAccel);
      else if (!p.pogo) p.vx -= Math.sign(p.vx) * Math.min(Math.abs(p.vx), KP.airFriction);
    }
    if (Math.abs(p.vx) > KP.walkMax) p.vx = Math.sign(p.vx) * KP.walkMax;

    /* jump: a crouch first. Holding jump through the crouch is a full jump;
       letting go early is a shorter one. Then he leaves the ground carrying
       whatever direction is held. Down + jump drops through a ledge. */
    if (p.onGround) p.coyote = 4; else if (p.coyote > 0) p.coyote--;
    if (!p.pogo && !busy && p.buffer > 0 && p.coyote > 0) {
      const under = tileAt(lv, Math.floor(cx / T), Math.floor((p.y + p.h + 1) / T));
      if (D && (under === "-" || p.riding)) { p.dropT = 10; p.y += 2; p.riding = null; }
      else { p.crouch = KP.jumpCrouch; p.crouchHeld = 0; p.vx = ice ? p.vx : 0; }
      p.buffer = 0; p.coyote = 0;
    }
    if (p.crouch > 0) {
      if (isDown("jump")) p.crouchHeld++;
      if (--p.crouch === 0) {
        p.vy = -KP.jumpSpeed * Math.max(1, p.crouchHeld) / KP.jumpCrouch;
        p.vx = ax ? ax * KP.jumpCarry : 0;
        p.onGround = false;
        sfx("jump");
      }
    }

    /* the pogo: it compresses on landing, then fires him up -- high if jump
       is held as it goes, low if not. Horizontal speed is kept. */
    if (p.compress > 0) {
      if (isDown("jump")) p.pogoBigAsk = true;
      if (--p.compress === 0) {
        const big = p.pogoBigAsk || isDown("jump");
        p.vy = -(big ? KP.pogoBig : KP.pogoSmall);
        p.onGround = false; p.land = 4;
        sfx(big ? "bigpogo" : "pogo");
      }
    }

    if (!busy) {
      p.vy = Math.min(p.vy + KP.gravity, KP.maxFall);
      const wasGround = p.onGround, prevVy = p.vy, vx = p.vx;
      const hit = moveBody(lv, p);
      if (hit.top && prevVy < 0) sfx("bump");
      if (p.onGround && !wasGround) p.land = 6;
      if (p.pogo && p.onGround) { p.compress = KP.pogoCompress; p.pogoBigAsk = isDown("jump"); p.vx = vx; }
    }
    /* a conveyor carries whatever stands on it */
    if (p.onGround && BELT[underfoot]) moveX(lv, p, BELT[underfoot], {});
  }

  /* fire: one shot per press, at most one every seven ticks. On the ground
     he plants his feet to fire; in the air he keeps his momentum. Firing
     takes him off the pogo. */
  if (wasPressed("fire") && p.fireCool === 0 && !lv.swim) {
    p.fireCool = KP.refire; p.shootT = KP.fireStance;
    if (p.pogo && !p.climbing) { p.pogo = false; p.y += POGO_H; p.h = PH; p.compress = 0; }
    if (p.onGround) p.vx = 0;
    if (run.ammo > 0 || run.cheat) {
      if (!run.cheat) run.ammo--;
      const sy = p.y + (p.climbing ? 8 : 12);
      lv.shots.push({ kind: "zap", x: p.face > 0 ? p.x + p.w : p.x - 5, y: sy, w: 5, h: 2, vx: KP.shotSpeed * p.face, t: 0, mine: true });
      sfx("shoot");
    } else { sfx("click"); if (!seen("noammo")) toast(say("noAmmo", "Click. The raygun is empty. Look for charges.")); }
  }

  if (!p.onGround && !p.climbing) p.anim = 0; else if (Math.abs(p.vx) > 0.3) p.anim += Math.abs(p.vx) * 0.09; else p.anim = 0;

  /* falling out of the world */
  if (p.y > lv.h * T + 8) return die(lv);

  /* hazards. The hurt box starts below his ears: E15's warp door has
     spikes either side at head height, and walking out of it must not kill */
  const hx0 = Math.floor((p.x + 2) / T), hx1 = Math.floor((p.x + p.w - 3) / T);
  const hy0 = Math.floor((p.y + 2) / T), hy1 = Math.floor((p.y + p.h - 1) / T);
  const pcx = p.x + p.w / 2;
  for (const [sx, sy, dir] of lv.steam) {
    if (Math.abs(sx * T + 8 - pcx) > 24 || Math.abs(sy * T + 8 - (p.y + p.h / 2)) > 64) continue;
    if (dir === 0) {
      /* a pulsing column, on: out sideways, the way he came */
      if (pulsePhase(lv) === "on" && overlap(p, { x: sx * T + 2, y: sy * T, w: T - 4, h: T })) { p.pushT = 6; p.pushV = (pcx < sx * T + 8 ? -1 : 1) * 2.5; }
    } else if (ventPhase(lv) === "on" && !p.riding && overlap(p, { x: sx * T + 1, y: dir < 0 ? (sy - 1) * T : sy * T, w: T - 2, h: 2 * T })) {
      /* a vent: a blast away from the nozzle, two tiles long. A platform
         between him and it takes the blast (E15's chute drops onto one
         running just over a floor of vents) */
      const shield = lv.plats.some(pl => pl.x < sx * T + T && pl.x + pl.w > sx * T && (dir < 0 ? pl.y + pl.sink >= p.y + p.h - 2 && pl.y < (sy + 1) * T : pl.y + pl.sink <= p.y && pl.y + pl.sink >= sy * T));
      if (!shield) { if (dir < 0) { p.vy = Math.min(p.vy, -3.4); p.onGround = false; } else p.vy = Math.max(p.vy, 2.6); }
    }
  }
  const steamy = c => c === "z" || (c === "^" && lv.theme === "works");
  for (let ty = hy0; ty <= hy1; ty++) for (let tx = hx0; tx <= hx1; tx++) {
    if (steamy(tileAt(lv, tx, ty))) continue;
    const r = lv.hang.has(tx + "," + ty) ? [1, 0, 14, 8] : hazardRect(tileAt(lv, tx, ty), lv);
    if (r && overlap({ x: p.x + 2, y: p.y + 8, w: p.w - 4, h: p.h - 8 }, { x: tx * T + r[0], y: ty * T + r[1], w: r[2], h: r[3] })) return die(lv);
  }

  /* doors: walk into one holding its gem */
  for (const dx of [-1, p.w]) {
    const tx = Math.floor((p.x + dx) / T);
    for (let ty = hy0; ty <= hy1; ty++) {
      const d = DOOR_CH[tileAt(lv, tx, ty)];
      /* a silver door's colour isn't in the maps: any keycard opens it */
      if (d !== undefined && (lv.keys[d] || d === 4 && lv.keys.some(Boolean))) openDoor(lv, tx, ty);
      else if (d !== undefined && !(lv.warned || (lv.warned = new Set())).has(d)) { lv.warned.add(d); toast(say("lockedDoor", c => c ? `A ${c} door. It needs a ${c} keycard.` : "A locked door. It needs a keycard.", d === 4 ? null : GEM_NAMES[d])); }
    }
  }

  /* things to pick up */
  const pb = { x: p.x, y: p.y, w: p.w, h: p.h };
  for (const it of lv.items) {
    if (it.gone || !overlap(pb, { x: it.x + 3, y: it.y + 3, w: 10, h: 12 })) continue;
    collect(lv, it);
  }

  if (p.state !== "play") return;

  /* the ways out: an exit door, or the map's edge where the map says so */
  for (let ty = hy0; ty <= hy1; ty++) for (let tx = Math.floor(p.x / T); tx <= Math.floor((p.x + p.w - 1) / T); tx++) {
    const k = tx + "," + ty;
    if (lv.edge.has(k)) return finishBy(lv, "edge");
    if (lv.secretAt.has(k)) return finishBy(lv, "secret");
    const door = lv.exitAt[k];
    if (door) { p.x = door.x + T / 2 - p.w / 2; return finishBy(lv, door); }
  }

  /* someone to rescue */
  for (const n of lv.npcs) if (!n.saved && overlap(pb, n)) { n.saved = true; popup(n, "SAVED"); G.run.rescued = G.run.rescued || {}; G.run.rescued[lv.n] = true; return finishBy(lv, n); }
}

/* Swimming: the arrows push him every way, he drifts and slowly sinks,
 * and jump is a stroke upward. */
const SWIM = { accel: 0.07, max: 1.4, drag: 0.96, sink: 0.012, stroke: 1.3 };
function swimMove(lv, p, ax, U, D) {
  p.climbing = false; p.pogo = false; p.h = PH; p.poleCool = 2; p.crouch = p.compress = 0;
  const ay = (D ? 1 : 0) - (U ? 1 : 0);
  p.vx = (p.vx + ax * SWIM.accel) * SWIM.drag;
  p.vy = (p.vy + ay * SWIM.accel + SWIM.sink) * SWIM.drag;
  if (p.buffer > 0) { p.buffer = 0; p.vy -= SWIM.stroke; sfx("jump"); }
  p.vx = Math.max(-SWIM.max, Math.min(SWIM.max, p.vx));
  p.vy = Math.max(-SWIM.max * 1.5, Math.min(SWIM.max, p.vy));
  moveBody(lv, p);
  p.anim += 0.08;
  if (lv.t % 40 === 0) lv.fx.push({ kind: "bubble", x: p.x + (p.face > 0 ? p.w : 0), y: p.y + 4, t: 0 });
}

/* the "x,y" keys of the tiles a body overlaps */
function tilesUnder(b) {
  const out = [];
  for (let ty = Math.floor(b.y / T); ty <= Math.floor((b.y + b.h - 1) / T); ty++)
    for (let tx = Math.floor(b.x / T); tx <= Math.floor((b.x + b.w - 1) / T); tx++) out.push(tx + "," + ty);
  return out;
}

/* the keycard goes in, and its door opens, top to bottom */
function fillSocket(lv, s) {
  s.filled = true; lv.keys[s.gem] = false;
  s.door.forEach(([x, y], i) => {
    if (SOCKET_DOOR[lv.tiles[y][x]] === undefined) return;
    lv.tiles[y][x] = ".";
    lv.fx.push({ kind: "poof", x: x * T + 3, y: y * T + 5, t: -i * 4 });
  });
  sfx("door");
}

/* a bridge switch: the deck goes solid, or goes away. Not out from under
 * someone standing in its row: it waits until they are clear. */
function flipBridge(lv, b) {
  /* on or off is what the deck is now, not a flag: some decks start the
     other way from their data, and two switches can share one */
  b.on = !(b.deck.filter(([x, y]) => isSolid(lv.tiles[y][x])).length * 2 > b.deck.length);
  for (const [x, y] of b.deck) lv.tiles[y][x] = b.on ? "#" : ".";
  if (b.on && !rectClear(lv, lv.p.x, lv.p.y, lv.p.w, lv.p.h)) { b.on = false; for (const [x, y] of b.deck) lv.tiles[y][x] = "."; sfx("nope"); return; }
  sfx("click");
}

/* ------------------------------------------------------------------ */
/* moving platforms. Two tiles wide; stood on from above, jumped through
 * from below, and they carry whoever stands on them.                     */

const DIRS = { N: [0, -1], NE: [1, -1], E: [1, 0], SE: [1, 1], S: [0, 1], SW: [-1, 1], W: [-1, 0], NW: [-1, -1],
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0], horizontal: [1, 0], vertical: [0, 1] };

function makePlat(name, x, y) {
  let m, kind = "static", dir = [0, 0];
  let dirName = null;
  if ((m = /\(start (\w+)\)/.exec(name))) { kind = "arrow"; dir = DIRS[m[1]]; dirName = m[1]; }
  else if ((m = /\((moving \w+|horizontal|vertical)\)/.exec(name))) { kind = "line"; dir = DIRS[m[1].replace("moving ", "")]; }
  else if (/Dropping/.test(name)) kind = "drop";
  else if (/Sneaky/.test(name)) kind = "sneaky";
  return { kind, x, y, x0: x, y0: y, w: T * 2, h: 8, sink: 0, dx: 0, dy: 0, dir: dir.slice(), dirName, vy: 0, wait: false };
}

/* a platform switch: its marker comes and goes */
function flipPlatSwitch(lv, s) {
  s.on = !s.on;
  const k = s.tx + "," + s.ty;
  if (lv.pmark.has(k)) lv.pmark.delete(k); else lv.pmark.set(k, s.mark);
  sfx("click");
}

/* is a platform's leading edge going into a wall? */
function platWalled(lv, pl, dir) {
  const [ux, uy] = dir;
  const xs = ux > 0 ? [Math.floor((pl.x + pl.w) / T)] : ux < 0 ? [Math.floor((pl.x - 1) / T)] : [Math.floor(pl.x / T), Math.floor((pl.x + pl.w - 1) / T)];
  const ys = uy > 0 ? [Math.floor((pl.y + T) / T)] : uy < 0 ? [Math.floor((pl.y - 1) / T)] : [Math.floor(pl.y / T)];
  for (const tx of xs) for (const ty of ys) if (isSolid(tileAt(lv, tx, ty))) return true;
  return false;
}

function updatePlats(lv) {
  const p = lv.p;
  for (const pl of lv.plats) {
    const ox = pl.x, oy = pl.y, ridden = p.riding === pl;
    if (pl.kind === "line") {
      /* to and fro: turns back once its own tile (its top-left) reaches a
         blocker, or when its leading edge meets a wall */
      if (pl.x % T === 0 && pl.y % T === 0) {
        const atBlock = (pl.x !== pl.x0 || pl.y !== pl.y0) && lv.pmark.get(pl.x / T + "," + pl.y / T) === "B";
        if (atBlock || platWalled(lv, pl, pl.dir)) { pl.dir = [-pl.dir[0], -pl.dir[1]]; if (platWalled(lv, pl, pl.dir)) pl.dir = [0, 0]; }
      }
      pl.x += pl.dir[0]; pl.y += pl.dir[1];
    } else if (pl.kind === "arrow") {
      /* on each tile it takes the direction of the arrow there; it waits at a blocker */
      if (pl.x % T === 0 && pl.y % T === 0) {
        const mk = lv.pmark.get(pl.x / T + "," + pl.y / T);
        pl.wait = mk === "B";
        if (mk && mk !== "B") pl.dir = DIRS[mk].slice();
      }
      if (!pl.wait) { pl.x += pl.dir[0]; pl.y += pl.dir[1]; }
    } else if (pl.kind === "drop") {
      /* sinks under a rider, faster and faster; comes back up when left */
      if (ridden) { pl.vy = Math.min(pl.vy + 0.08, 3); if (!isSolid(tileAt(lv, Math.floor((pl.x + T) / T), Math.floor((pl.y + pl.vy + T) / T)))) pl.y += pl.vy; }
      else { pl.vy = 0; if (pl.y > pl.y0) pl.y = Math.max(pl.y0, pl.y - 1); }
    } else if (pl.kind === "sneaky") {
      /* jump at it and it slides out of reach; then drifts back */
      const pc = p.x + p.w / 2, mid = pl.x0 + T;
      if (!p.onGround && p.state === "play" && Math.abs(pc - mid) < T * 3 && p.y + p.h < pl.y + pl.sink) pl.flee = pc < mid ? 1 : -1;
      else if (p.onGround && !ridden) pl.flee = 0;
      const want = pl.x0 + (pl.flee || 0) * T * 2;
      pl.x += Math.sign(want - pl.x) * Math.min(Math.abs(want - pl.x), pl.flee ? 4 : 1);
    }
    /* never off the map: back the way it came */
    if (pl.x < 0 || pl.x + pl.w > lv.w * T || pl.y < 0 || pl.y + T > lv.h * T) { pl.x = ox; pl.y = oy; pl.dir = [-pl.dir[0], -pl.dir[1]]; }
    pl.dx = pl.x - ox; pl.dy = pl.y - oy;
  }
  /* carry the rider */
  const r = p.riding;
  if (r && p.state === "play" && !p.climbing) {
    if (r.dx) moveX(lv, p, r.dx, {});
    if (r.dy) { p.y += r.dy; if (r.dy < 0 && !rectClear(lv, p.x, p.y, p.w, p.h)) { p.y -= r.dy; p.riding = null; } }
  }
}

/* land on a platform: a body falling through a platform's top this tick */
function landOnPlat(lv, b, prevBottom) {
  for (const pl of lv.plats) {
    if (b.x + b.w <= pl.x || b.x >= pl.x + pl.w) continue;
    const top = pl.y + pl.sink;
    /* and only if standing on it leaves him clear of the rock (a platform
       rising into a ceiling must not carry him into it) */
    if (prevBottom <= Math.max(top, top - pl.dy) + 1 && b.y + b.h >= top && rectClear(lv, b.x, top - b.h, b.w, b.h)) return pl;
  }
  return null;
}

function drawPlats(lv, cx, cy) {
  for (const pl of lv.plats) {
    const x = Math.round(pl.x) - cx, y = Math.round(pl.y + pl.sink) - cy;
    if (x < -pl.w || x > W || y < -16 || y > H) continue;
    ctx.drawImage(lv.art.platform[pl.kind === "drop" ? 1 : pl.kind === "static" ? 2 : 0][(lv.t >> 3) % 2], x, y);
  }
}

/* the warp door Poom is standing in, as its target, or null. The tile
 * under his middle wins, so each half of a door goes to its own place. */
/* Pulling a trap switch: game over, said in the Book's words. With cheat
 * mode on it costs a life instead, like any other death. */
function springTrap(lv, key) {
  lv.pulled = key;
  sfx("die");
  if (G.run.cheat) { message(say("trap", "<b>The switch!</b><br><br>That was a trap."), { onClose: () => loseLife() }); return; }
  message(say("trap", "<b>The switch!</b><br><br>That was a trap."), { onClose: () => { G.lv = null; G.run.lives = 0; gameOver(true); } });
}

/* the hint sign Poom is standing at, if any */
function signAt(lv, p) {
  return lv.signs.find(s => p.x < s.x + T && p.x + p.w > s.x && p.y < s.y + T && p.y + p.h > s.y) || null;
}
/* a sign's words: its book's signs[level], a string or a list (one per
 * sign in the level, in reading order); else a placeholder */
function readSign(lv, s) {
  const B = BOOK_TEXT[lv.def.book], said = B && B.signs && B.signs[lv.n];
  const text = Array.isArray(said) ? said[s.n] || said[said.length - 1] : said;
  sfx("click");
  message(text || say("signBlank", "The sign is too faded to read."));
}

function warpAt(lv, p) {
  const mid = Math.floor((p.x + p.w / 2) / T);
  let found = null;
  for (let ty = Math.floor(p.y / T); ty <= Math.floor((p.y + p.h - 1) / T); ty++)
    for (let tx = Math.floor(p.x / T); tx <= Math.floor((p.x + p.w - 1) / T); tx++) {
      const t = lv.warp[tx + "," + ty];
      if (t && (tx === mid || !found)) found = t;
    }
  return found;
}

/* arrive with his feet in the target tile; if that's no room, a little higher */
function warpTo(lv, p, [tx, ty]) {
  lv.fx.push({ kind: "poof", x: p.x, y: p.y + 6, t: 0 });
  if (p.pogo) { p.pogo = false; p.h = PH; }
  p.x = tx * T + (T - p.w) / 2; p.y = (ty + 1) * T - p.h;
  for (let up = 0; up < 3 && !rectClear(lv, p.x, p.y, p.w, p.h); up++) p.y -= T;
  p.vx = p.vy = 0; p.crouch = p.compress = 0; p.poleCool = 12;
  lv.fx.push({ kind: "poof", x: p.x, y: p.y + 6, t: 0 });
  sfx("door");
  centerCamera(true);
}

/* the level is over: Poom heads out, then finishLevel */
function finishBy(lv, how) {
  const p = lv.p;
  if (p.state !== "play") return;
  if (p.pogo) { p.pogo = false; p.y += POGO_H; p.h = PH; }
  p.state = "exit"; p.t = 0; p.vx = 0; lv.exitUsed = how;
  sfx("done");
}

function openDoor(lv, tx, ty) {
  const c = lv.tiles[ty][tx];
  let y0 = ty, y1 = ty;
  while (lv.tiles[y0 - 1] && lv.tiles[y0 - 1][tx] === c) y0--;
  while (lv.tiles[y1 + 1] && lv.tiles[y1 + 1][tx] === c) y1++;
  for (let y = y0; y <= y1; y++) { lv.tiles[y][tx] = lv.back[y][tx] ? "+" : "."; lv.fx.push({ kind: "poof", x: tx * T + 3, y: y * T + 5, t: 0 }); }
  sfx("door");
}

function collect(lv, it) {
  const r = G.run;
  it.gone = true;
  if (POINTS[it.kind]) { addScore(POINTS[it.kind]); popup(it, String(POINTS[it.kind])); sfx(POINTS[it.kind] >= 1000 ? "bigitem" : "item"); }
  else if (it.kind === "ammo") { r.ammo += 5; popup(it, "+5"); sfx("pick"); if (!seen("ammo")) message(say("ammo", "<b>Raygun charge!</b> Five shots. Fire with <kbd>Space</kbd> or <kbd>C</kbd>.")); }
  else if (it.kind === "life") { r.lives++; popup(it, "1UP"); sfx("life"); }
  else if (it.kind === "gem") { lv.keys[it.gem] = true; sfx("gem"); popup(it, GEM_NAMES[it.gem].toUpperCase()); }
  else if (it.kind === "pogo") {
    r.pogo = true; sfx("bigitem");
    message(say("pogo", "<b>You found a pogo stick!</b><br><br>Press <kbd>Alt</kbd> or <kbd>X</kbd> to hop on and off. Hold <kbd>Ctrl</kbd> or <kbd>Z</kbd> as you land for a big bounce."));
  }
  else if (it.kind === "swim") {
    r.swim = true; addScore(1000); popup(it, "1000"); sfx("bigitem");
    message(say("swim", "<b>You can swim!</b><br><br>On the map, Poom can wade in where the shore meets the water."));
    if (it.ends && --lv.endsLeft === 0) finishBy(lv, "objective");
  }
  else if (it.kind === "heart") {
    /* broken, not carried: the Hum loses one of its eight */
    r.hearts = r.hearts || {}; r.hearts[lv.n] = true;
    addScore(5000); popup(it, "5000"); sfx("kill"); sfx("done");
    for (let i = 0; i < 8; i++) lv.fx.push({ kind: "poof", x: it.x + 3 + (Math.random() - .5) * 18, y: it.y + 3 + (Math.random() - .5) * 18, t: -i * 3 });
    const book = lv.def.book, n = heartsBroken(r, book), of = heartsIn(book);
    message(say("heart", (n, of) => `<b>The heartstone shatters!</b><br><br>${n === of ? "That's the last one. The Hum lets go." : `${n} of ${of} broken.`}`, n, of));
  }
  else if (it.kind === "objective") {
    addScore(1000); popup(it, "1000"); sfx("bigitem");
    if (it.ends && --lv.endsLeft === 0) finishBy(lv, "objective");
    /* objectives that don't end the level, beside one that does (set D's
       last level, D17): they power it. Each one broken says how many are
       left; with the last, the one they powered blows by itself */
    const core = !it.ends && lv.items.find(i => i.kind === "objective" && i.ends && !i.gone);
    if (core) {
      const left = lv.items.filter(i => i.kind === "objective" && !i.ends && !i.gone).length;
      if (left) toast(say("cell", n => `${n} to go.`, left));
      else {
        for (let i = 0; i < 12; i++) lv.fx.push({ kind: "poof", x: core.x + 3 + (Math.random() - .5) * 40, y: core.y + 3 + (Math.random() - .5) * 40, t: -i * 4 });
        sfx("kill");
        message(say("core", "<b>The last one goes!</b><br><br>The machine overloads."), { onClose: () => collect(lv, core) });
      }
    }
  }
  else if (it.kind === "part") {
    r.parts[it.part] = true; sfx("bigitem"); addScore(1000);
    const have = r.parts.filter(Boolean).length;
    message(say("part", (name, n) => `<b>You found ${name}!</b><br><br>${n === 4 ? "That's all four. Back to the Catamaran!" : `${n} of 4 ship parts. Get it back to the Catamaran.`}`, PART_NAMES[it.part], have), { icon: ART.parts[it.part] });
  }
}

function popup(at, text) { if (at && G.lv) G.lv.fx.push({ kind: "text", x: at.x + 8, y: at.y, t: 0, text }); }

function die(lv) {
  const p = lv.p;
  if (p.state !== "play") return;
  /* just picked himself up (arcade): a moment's grace, but not from a fall */
  if (p.safeT > 0 && p.y <= lv.h * T) return;
  if (p.pogo) { p.pogo = false; p.h = PH; }
  p.state = "dead"; p.t = 0; p.vy = -3; p.vx = (Math.random() - 0.5) * 2; p.climbing = false; p.crouch = p.compress = 0;
  sfx("die");
}

/* Arcade: no life lost. Poom picks himself up where he last stood firm, a
 * second or more before he fell, with all he has picked up in the level,
 * and a moment's grace */
function respawn(lv) {
  const p = lv.p, ring = lv.safeRing || [];
  /* dying again soon after getting up goes further back each time, so no
     spot can catch him in a loop */
  lv.streak = lv.t - (lv.lastRespawn || -1e9) < 300 ? (lv.streak || 0) + 1 : 0;
  lv.lastRespawn = lv.t;
  let s = null;
  for (let i = ring.length - 1; i >= 0; i--) if (lv.t - ring[i][0] >= 60 * (1 + lv.streak * 2)) { s = ring[i]; break; }
  s = s || ring[0] || [0, lv.p0[0], lv.p0[1]];
  lv.safeRing = ring.filter(e => e[0] <= s[0]);
  Object.assign(p, { x: s[1], y: s[2], vx: 0, vy: 0, h: PH, state: "play", t: 0, pogo: false, climbing: false, crouch: 0, compress: 0, riding: null, onGround: false, safeT: 90 });
  sfx("life");
}

/* ------------------------------------------------------------------ */
/* creatures                                                             */

const ENEMY = {
  /* speeds after Keen 1's yorp, garg, vorticon, butler robot and tank robot */
  x: { w: 12, h: 11, hp: 1, art: "mousel", points: 0, speed: 19 / 32 },
  B: { w: 14, h: 12, hp: 1, art: "barker", points: 200, speed: 19 / 32 },
  V: { w: 14, h: 28, hp: 4, art: "vac", points: 500, speed: 28 / 32 },
  T: { w: 13, h: 8, hp: Infinity, art: "roombot", points: 0, speed: 28 / 32 },
  K: { w: 13, h: 10, hp: Infinity, art: "tank", points: 0, speed: 28 / 32 },
  W: { w: 28, h: 56, hp: 10, art: "boss", points: 5000, speed: 0.9, scale: 2 },
  /* the books': a lieutenant walks and jumps like a vacuumoid but takes five
     shots; a turret is fixed, can't be hurt, and fires along its barrel */
  L: { w: 14, h: 28, hp: 5, art: "lieut", points: 1000, speed: 28 / 32 },
  G: { w: 12, h: 10, hp: Infinity, art: "turret", points: 0, speed: 0 },
};

/* Which engine creature each book's numbered enemy types are
 * (docs/story/book-1-story.md): Book 1's Glowmice (01) push like mousels,
 * scrap hounds (02) charge like barkers, Scrappers (04) are vacuumoids,
 * Sentrybots (05) shove like roombots, the lieutenants (03) are L. Turrets
 * are G in every book. Books not listed have no enemies yet. */
const ENEMY_OF = { H: { "01": "x", "02": "B", "03": "L", "04": "V", "05": "T" },
  /* Book 2: Mergatroids (01) hop like mousels, Husks (02) walk like
     vacuumoids, Skitters (05) charge like barkers, Shellbacks (04) shove like
     roombots, Spitters (03) shoot like clawtanks. Type 01 crowds the early
     levels (four in C02, the first) and 02 the deep ones (17 in the Nursery),
     so the gentle one is 01 and the deadly one 02 */
  C: { "01": "x", "02": "V", "05": "B", "04": "T", "03": "K" },
  /* Book 3 (docs/story/book-3-story.md): each type its own art. Claw guards
     (04) charge like barkers, at a stoat's height, and shout "!" first;
     Heavies (02) walk like vacuumoids; Boxers (01) push like mousels;
     Clawbots (06, and 09 by the Copycat) shove; Gunners (05) and Dr Cal
     (10) shoot along the floor; guard dogs (03) charge; Ocelots (08) are
     the lieutenants; ninjas (07) charge harder and take three shots; Mr
     Squeaks (11) is a pusher */
  D: { "04": { kind: "B", art: "guard", w: 12, h: 20, alert: true }, "02": { kind: "V", art: "heavy" }, "01": { kind: "x", art: "boxer" },
    "06": { kind: "T", art: "clawbot" }, "09": { kind: "T", art: "clawbot" }, "05": { kind: "K", art: "gunner" }, "03": { kind: "B", art: "dog" },
    "08": { kind: "L", art: "ocelot", points: 1000 }, "07": { kind: "B", art: "ninja", w: 12, h: 20, hp: 3, rush: 1.4, alert: true, points: 500 },
    "10": { kind: "K", art: "drcal", w: 14, h: 20 }, "11": { kind: "x", art: "whitemouse" } },
  /* Book 4 (docs/story/book-4-story.md): SPARK slugs (01) and hermit crabs
     (03) push; Thugs (02) walk; masked splicers (04), spider splicers (05)
     and houdinis (08) charge, shouting first; the Big Brass (06) and iron
     crabs (13) shove; Leadheads (07) shoot; Brutes (09) and Rosie (10) are
     the lieutenants; drones (11) fly at Poom; the gatekeepers (12) walk.
     The deep's (14-17, all in E18, under water) swim: the gulper hunts,
     the jellyfish drift, the school fish bump, the mines bob in place */
  E: { "01": { kind: "x", art: "slug" }, "02": { kind: "V", art: "thug" }, "03": { kind: "x", art: "crab" },
    "04": { kind: "B", art: "splicer", w: 12, h: 19, alert: true }, "05": { kind: "B", art: "spider", w: 12, h: 19, alert: true, rush: 1.4, hp: 2, points: 500 },
    "06": { kind: "T", art: "bigbrass", w: 16, h: 17 }, "07": { kind: "K", art: "leadhead" }, "08": { kind: "B", art: "houdini", w: 12, h: 19, alert: true, hp: 2, points: 500 },
    "09": { kind: "L", art: "brute", points: 1000 }, "10": { kind: "L", art: "rosie", w: 16, h: 17, hp: 8, points: 2000 },
    "11": { kind: "B", art: "drone", w: 12, h: 8, swim: true, hunt: true, hp: 2 }, "12": { kind: "V", art: "gatekeeper", w: 16, h: 17, hp: 6, points: 1000 },
    "13": { kind: "T", art: "ironcrab" },
    "14": { kind: "V", art: "gulper", w: 21, h: 11, swim: true, hunt: true, hp: Infinity, speed: 0.6 }, "15": { kind: "V", art: "jelly", w: 8, h: 7, swim: true, hp: Infinity, speed: 0.2 },
    "16": { kind: "x", art: "schoolfish", w: 8, h: 5, swim: true }, "17": { kind: "V", art: "mine", w: 8, h: 7, swim: true, hp: Infinity, speed: 0 } },
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
    "14": { kind: "L", art: "brood", w: 24, h: 44, scale: 2, hp: 12, points: 5000 } } };
/* A Book without a hand-made list gets one from its own maps (type numbers
 * mean something different in every set, maps2/README.md): a rare type
 * that only ever stands near the level's objectives guards them (L); the
 * rest, most common first, are pushers (x), walkers (V), chargers (B),
 * shovers (T) and shooters (K), and any beyond that walk. A guess from the
 * data, to be replaced when a Book gets its own creatures. */
for (const b of BOOK_IDS) {
  if (ENEMY_OF[b]) continue;
  const seen = {}, nearGoal = {};
  for (const id in MAPS) {
    const lv = MAPS[id];
    if (lv.book !== b) continue;
    const goals = (lv.ends || []).map(([x, y]) => [x, y]);
    lv.rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === "*") goals.push([x, y]); }));
    for (const [x, y, g, name] of lv.things || []) {
      const n = g === "e" && (/enemy type (\d+)/.exec(name) || [])[1];
      if (!n) continue;
      seen[n] = (seen[n] || 0) + 1;
      const near = goals.some(([gx, gy]) => Math.abs(gx - x) <= 8 && Math.abs(gy - y) <= 4);
      nearGoal[n] = (nearGoal[n] === undefined ? true : nearGoal[n]) && near;
    }
  }
  const map = {}, rest = [];
  for (const n of Object.keys(seen)) (nearGoal[n] && seen[n] <= 6 ? (map[n] = "L") : rest.push(n));
  rest.sort((a, c) => seen[c] - seen[a]).forEach((n, i) => { map[n] = ["x", "V", "B", "T", "K"][i] || "V"; });
  ENEMY_OF[b] = map;
}
/* a turret's barrel; "horizontal" and "vertical" ones fire both ways, in turn */
const TURRET_DIR = { "up-left": [-1, -1], "up-right": [1, -1], up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0], horizontal: [1, 0], vertical: [0, -1] };

/* a creature of engine kind c; a Book's own type may change its art, size,
 * hit points, speed, charge (rush) or give it an alert (ENEMY_OF) */
function makeEnemy(c, x, bottom, over = null) {
  const d = over ? { ...ENEMY[c], ...over } : ENEMY[c];
  return { type: c, ...d, x: x + (T - d.w) / 2, y: bottom - d.h, vx: d.speed * (Math.random() < 0.5 ? -1 : 1), vy: 0, face: 1,
    onGround: false, state: "walk", t: (Math.random() * 120) | 0, flash: 0, alive: true };
}

function updateEnemy(lv, e) {
  const p = lv.p;
  e.t++;
  if (e.flash > 0) e.flash--;
  const dxp = (p.x + p.w / 2) - (e.x + e.w / 2), dyp = (p.y + p.h) - (e.y + e.h);
  const sees = Math.abs(dxp) < 150 && Math.abs(dyp) < 24 && p.state === "play";

  switch (e.type) {
    case "x": {
      /* a yorp: stunned about two seconds, looks about a second, hops low */
      if (e.state === "stunned") { e.vx = 0; if (e.t > 120) { e.state = "walk"; e.t = 0; e.vx = e.speed * (dxp > 0 ? 1 : -1); } break; }
      if (e.state === "look") { e.vx = 0; e.face = dxp > 0 ? 1 : -1; if (e.t > 64) { e.state = "walk"; e.t = 0; e.vx = e.speed * e.face; } break; }
      if (e.onGround && Math.random() < 0.008) e.vy = -40 / 32 * 1.6;
      if (e.onGround && Math.random() < 0.006) { e.state = "look"; e.t = 0; }
      break;
    }
    case "B": {
      if (e.state === "walk") {
        if (e.onGround && !floorAhead(lv, e)) e.vx = -e.vx;
        if (sees && Math.sign(dxp) === Math.sign(e.vx) && Math.abs(dxp) < 130) { e.state = "growl"; e.t = 0; if (e.alert) sfx("alert"); }
      } else if (e.state === "growl") {
        e.vx = 0; e.face = dxp > 0 ? 1 : -1;
        if (e.t > 22) { e.state = "charge"; e.t = 0; e.vx = 68 / 32 * e.face * (e.rush || 1); sfx("push"); }
      } else if (e.state === "charge") {
        if (e.onGround && !floorAhead(lv, e) || e.t > 140) { e.state = "walk"; e.t = 0; e.vx = -e.speed * Math.sign(e.vx || 1); }
      }
      break;
    }
    case "G": {
      /* a turret: every so often, when Poom is near, a shot along the barrel */
      if (e.t % 100 === 0 && Math.abs(dxp) < 220 && Math.abs(dyp) < 160 && p.state === "play") {
        const [ax, ay] = e.aim, n = Math.hypot(ax, ay) || 1;
        lv.shots.push({ kind: "hairball", x: e.x + e.w / 2 + ax * 7 - 3, y: e.y + ay * 7, w: 6, h: 6, vx: 2.4 * ax / n, vy: 2.4 * ay / n, t: 0 });
        sfx("tank");
        if (e.alternate) { e.aim = [-ax, -ay]; e.face = e.aim[0] < 0 ? -1 : 1; }
      }
      return;
    }
    case "V": case "W": case "L": {
      const sp = e.speed;
      if (sees || e.type === "W" && Math.abs(dxp) < 200) e.vx = sp * Math.sign(dxp || 1) * (e.type === "W" ? 1.2 : 1);
      /* a vorticon's jump: 90 to 150 sub-units a tick, at random */
      if (e.onGround && e.t > (e.type === "W" ? 70 : 90) && Math.random() < 0.04) { e.vy = -(90 + Math.random() * 60) / 32 * (e.type === "W" ? 1.15 : 1); e.t = 0; }
      if (e.type === "W" && e.onGround && e.t % 100 === 50 && Math.abs(dxp) < 220) {
        lv.shots.push({ kind: "hairball", x: e.x + (e.face > 0 ? e.w : -6), y: e.y + 20, w: 6, h: 6, vx: 2.4 * Math.sign(dxp || 1), t: 0 });
        sfx("tank");
      }
      break;
    }
    case "T": {
      if (e.onGround && !floorAhead(lv, e)) e.vx = -e.vx;
      break;
    }
    case "K": {
      if (e.state === "walk") {
        if (e.onGround && !floorAhead(lv, e)) e.vx = -e.vx;
        if (e.t > 130 && sees && Math.sign(dxp) === Math.sign(e.vx)) { e.state = "aim"; e.t = 0; e.keep = e.vx; e.vx = 0; }
      } else if (e.state === "aim") {
        if (e.t === 30) {
          lv.shots.push({ kind: "hairball", x: e.face > 0 ? e.x + e.w : e.x - 6, y: e.y + 3, w: 6, h: 6, vx: KP.shotSpeed * e.face, t: 0 });
          sfx("tank");
        }
        if (e.t > 56) { e.state = "walk"; e.t = 0; e.vx = e.keep; }
      }
      break;
    }
  }

  if (e.slide === 1) e.vx = 0;
  if (e.swim && e.hunt && p.state === "play" && Math.abs(dxp) < 140 && Math.abs(dyp) < 90) e.vx = Math.sign(dxp) * e.speed;
  if (e.vx) e.face = Math.sign(e.vx);
  /* a slider floats along its axis; a swimmer drifts, bobbing, and a
     hunter among them closes in on Poom; everything else falls */
  if (e.swim) e.vy = e.hunt && p.state === "play" && Math.abs(dxp) < 140 && Math.abs(dyp) < 90 ? Math.sign(dyp) * 0.45 : Math.sin((e.t + (e.x | 0)) / 26) * 0.35;
  else if (e.slide === 0) e.vy = 0;
  else if (e.slide === 1) { if (!e.vy) e.vy = e.speed; }
  else e.vy = Math.min(e.vy + KP.gravity, e.type === "V" || e.type === "W" || e.type === "L" ? 6 : KP.maxFall);
  if (e.bounce && e.onGround) e.vy = -3.2;
  const vy0 = e.vy;
  const hit = moveBody(lv, e, true);
  if (e.slide === 1 && (hit.top || hit.bottom)) e.vy = hit.top ? Math.abs(vy0) : -Math.abs(vy0);
  if (hit.left || hit.right) {
    if (e.type === "B" && e.state === "charge") { e.state = "walk"; e.t = 0; }
    e.vx = hit.left ? Math.abs(e.speed) : -Math.abs(e.speed);
  }
  if (e.y > lv.h * T + 40) e.alive = false;

  /* touching Poom */
  if (p.state !== "play" || !overlap(e, p)) return;
  const fromAbove = p.vy > 0 && p.y + p.h - p.vy <= e.y + 5;
  if (e.type === "x") {
    if (e.state === "stunned") return;
    if (fromAbove) { e.state = "stunned"; e.t = 0; p.vy = p.pogo ? -KP.pogoSmall : -2; sfx("stun"); dropKey(lv, e); return; }
    p.pushV = dxp > 0 ? 1.4 : -1.4; p.pushT = 8; if (!(e.t % 8)) sfx("push");
  } else if (e.type === "T" || e.type === "K") {
    if (fromAbove && e.type === "K") { p.vy = -3; return; }
    /* the butler robot's shove is 60 sub-units, the tank's 16 */
    p.pushV = (dxp > 0 ? 1 : -1) * (e.type === "T" ? 60 / 32 : 1); p.pushT = e.type === "T" ? 14 : 8;
    if (!(e.t % 10)) sfx("push");
  } else die(lv);
}

/* a creature that carries a keycard lets it go when stunned or beaten */
function dropKey(lv, e) {
  if (e.carries === undefined || e.carries === null) return;
  const tx = Math.floor((e.x + e.w / 2) / T), ty = Math.floor((e.y + e.h - 1) / T);
  lv.items.push({ kind: "gem", gem: e.carries, x: tx * T, y: ty * T, t: 0 });
  e.carries = null;
  sfx("gem");
}

function hurtEnemy(lv, e, shot) {
  if (e.hp === Infinity) { sfx("ricochet"); return; }
  e.hp--; e.flash = 6;
  if (e.hp <= 0) {
    e.alive = false; sfx("kill"); dropKey(lv, e);
    const big = e.type === "W";
    for (let i = 0; i < (big ? 6 : 1); i++) lv.fx.push({ kind: "poof", x: e.x + e.w / 2 - 5 + (big ? (Math.random() - .5) * 30 : 0), y: e.y + e.h / 2 - 3 + (big ? (Math.random() - .5) * 40 : 0), t: -i * 5 });
    if (e.points) { addScore(e.points); popup({ x: e.x + e.w / 2 - 8, y: e.y }, String(e.points)); }
    /* a Book whose bossDown is null has no word for it: its L kind is a rank, not a boss */
    const down = (big || e.type === "L") && say("bossDown", "<b>The Grand Vacuumoid has been unplugged!</b><br><br>Grab the Laser Pointer and get out of here.", e.art);
    if (down) message(down);
  } else sfx("hit");
}

function updateShots(lv) {
  for (const s of lv.shots) {
    s.t++;
    s.x += s.vx; s.y += s.vy || 0;
    const c = tileAt(lv, Math.floor((s.x + s.w / 2) / T), Math.floor((s.y + s.h / 2) / T));
    if (isSolid(c) || s.t > 120) { s.gone = true; lv.fx.push({ kind: "poof", x: s.x - 2, y: s.y - 2, t: 0 }); continue; }
    if (s.mine) {
      for (const e of lv.ents) if (e.alive && overlap(s, e.h >= 12 ? e : { x: e.x, y: e.y + e.h - 12, w: e.w, h: 12 })) { s.gone = true; lv.fx.push({ kind: "poof", x: s.x - 2, y: s.y - 2, t: 0 }); hurtEnemy(lv, e, s); break; }
      /* an objective can be shot as well as picked up: the maps' boss weak points */
      if (!s.gone) for (const it of lv.items) if (!it.gone && (it.kind === "objective" || it.kind === "heart") && overlap(s, { x: it.x + 2, y: it.y + 2, w: 12, h: 12 })) { s.gone = true; lv.fx.push({ kind: "poof", x: it.x + 3, y: it.y + 3, t: 0 }); collect(lv, it); break; }
    } else if (lv.p.state === "play" && overlap(s, { x: lv.p.x + 2, y: lv.p.y + 2, w: lv.p.w - 4, h: lv.p.h - 4 })) { s.gone = true; die(lv); }
  }
  lv.shots = lv.shots.filter(s => !s.gone);
}

/* ------------------------------------------------------------------ */
/* playing a level                                                       */

function startLevel(n) {
  dressFor(MAPS[n].book);
  G.lv = loadLevel(n);
  G.lv.snapshot = JSON.parse(JSON.stringify(G.run));
  G.mode = "level";
  centerCamera(true);
  sfx("enter");
  mapLabel("");   /* the map's place name is the map's: not over a level */
  levelTitle(levelName(n));
  keyStrip();
}
/* the keys, along the bottom for the first seconds of the first level this
 * browser plays, and never again; not on a touch screen, which has buttons */
let keyStripTimer = null;
function keyStrip() {
  const el = document.getElementById("keystrip");
  if (!document.getElementById("touch").hidden || seen("keystrip")) return;
  el.classList.remove("fading"); el.hidden = false;
  clearTimeout(keyStripTimer);
  keyStripTimer = setTimeout(() => { el.classList.add("fading"); keyStripTimer = setTimeout(() => { el.hidden = true; }, 1000); }, 9000);
}

function updateLevel() {
  const lv = G.lv;
  lv.t++;
  updatePlats(lv);
  updatePlayer(lv);
  if (G.mode !== "level" || G.lv !== lv) return;
  for (const e of lv.ents) if (e.alive && Math.abs(e.x - lv.p.x) < 400) updateEnemy(lv, e);
  lv.ents = lv.ents.filter(e => e.alive);
  updateShots(lv);
  for (const f of lv.fx) { f.t++; if (f.kind === "text") f.y -= 0.5; if (f.kind === "bubble") { f.y -= 0.6; f.x += Math.sin(f.t / 6) * 0.3; } }
  lv.fx = lv.fx.filter(f => f.t < (f.kind === "text" ? 50 : f.kind === "bubble" ? 90 : 12));
  centerCamera(false);
}

function centerCamera(snap) {
  const lv = G.lv, p = lv.p, c = G.cam;
  const px = p.x + p.w / 2, py = p.y + p.h / 2;
  let tx = c.x, ty = c.y;
  if (px - c.x > W / 2 + 20) tx = px - W / 2 - 20;
  if (px - c.x < W / 2 - 20) tx = px - W / 2 + 20;
  if (py - c.y > 120) ty = py - 120;
  if (py - c.y < 70) ty = py - 70;
  if (snap) { tx = px - W / 2; ty = py - H / 2; }
  tx = Math.max(0, Math.min(lv.w * T - W, tx));
  ty = Math.max(0, Math.min(lv.h * T - H, ty));
  if (lv.h * T < H) ty = (lv.h * T - H) / 2;
  c.x = snap ? tx : c.x + (tx - c.x) * 0.5;
  c.y = snap ? ty : c.y + (ty - c.y) * 0.25;
}

function finishLevel() {
  const n = G.lv.n, r = G.run, secret = G.lv.exitUsed === "secret" && G.lv.def.secret;
  r.done[n] = true;
  G.lv = null;
  /* a secret exit: straight into the secret level, with Poom left on its
     part of the map for after */
  if (secret) {
    const spot = nearestOpen(...world().first[secret]);
    if (spot) { r.mx = spot[0] * T + 4; r.my = spot[1] * T + 5; }
    enterMap();
    saveRun();
    startLevel(secret);
    return;
  }
  /* the whole book done: on to the next, or the end. A book with a ship
     ends at the ship instead */
  const goal = BOOK_GOAL[r.book];
  if (goal === "hearts" ? heartsBroken(r, r.book) >= heartsIn(r.book) : goal === "rescues" ? rescuedIn(r, r.book) >= rescueLevels(r.book).length : goal && goal.last ? r.done[goal.last] : !world().ship && world().need.every(id => r.done[id])) { bookDone(); return; }
  /* a rescue: say so, and how many are left */
  if (goal === "rescues" && (r.rescued || {})[n] && !(r.told || {})[n]) { r.told = r.told || {}; r.told[n] = true; const k = rescuedIn(r, r.book), of = rescueLevels(r.book).length; setTimeout(() => message(say("rescued", (k, of) => `<b>Rescued!</b> ${k} of ${of}.`, k, of)), 300); }
  enterMap();
  saveRun();
  if (Object.values(world().barrier).includes(n)) setTimeout(() => toast(say("wayOpens", "Somewhere on the map, the way opens.")), 300);
}

function bookDone() {
  const r = G.run, next = BOOK_IDS[BOOK_IDS.indexOf(r.book) + 1];
  /* the last Book that can be played yet ends the game */
  if (!next || !BOOK_PLAYABLE.has(next)) { ending(); return; }
  const was = r.book, pages = BOOK_TEXT[was] && BOOK_TEXT[was].ending;
  /* a book with its own ending plays it, then the score goes on the table
     (the run keeps its line there for later Books), then on to the next */
  const onward = () => recordScore(r.score, k => moveOn(k));
  if (pages) playPages(pages(r.score, bookNumber(next)), onward);
  else onward();
  function moveOn(k = -1) {
    r.book = next; r.mx = r.my = null; r.swim = false;
    r.parts = [false, false, false, false]; r.aboard = [false, false, false, false];
    enterMap();
    saveRun();
    /* then the new book's story and first word, if it has its own words */
    const B = BOOK_TEXT[next], intro = () => { if (B && B.story) bookIntro(B, () => {}); };
    const table = () => { if (k >= 0) openScores(k, intro); else intro(); };
    if (!pages) message(`<b>Book ${bookNumber(was)} is done!</b><br><br>On to Book ${bookNumber(next)}.`, { onClose: table });
    else table();
  }
}
/* a run of message pages, then done */
function playPages(pages, done) {
  let i = 0;
  const next = () => { if (i >= pages.length) { done(); return; } message(pages[i++], { onClose: next }); };
  next();
}

/* the ship: Poom brings back what he's found; with all four parts aboard,
 * the book is done */
function boardShip() {
  const r = G.run;
  if (!r.aboard) r.aboard = [false, false, false, false];
  const brought = r.parts.map((h, i) => h && !r.aboard[i] ? i : -1).filter(i => i >= 0);
  brought.forEach(i => { r.aboard[i] = true; });
  if (r.aboard.every(Boolean)) {
    sfx("done");
    saveRun();
    message(say("shipWhole", last => `<b>The Catamaran is whole again!</b>${last ? `<br><br>Poom bolts in ${last}.` : ""}`, brought.length ? PART_NAMES[brought[brought.length - 1]] : null), { iconRow: r.aboard, onClose: bookDone });
    return;
  }
  const missing = r.aboard.map((h, i) => h ? null : PART_NAMES[i]).filter(Boolean);
  const list = missing.join(", ").replace(/, ([^,]*)$/, " and $1");
  if (brought.length) { sfx("bigitem"); saveRun(); }
  else sfx("nope");
  message(say("shipMissing", (fits, still) => `<b>The Catamaran</b><br><br>${fits ? `Poom fits ${fits}. ` : ""}It still won't fly without ${still}.`, brought.map(i => PART_NAMES[i]).join(" and "), list), { iconRow: r.aboard });
}
/* standing on the parked Catamaran's two lower tiles */
function onParked(p) {
  const s = world().parked;
  if (!s) return false;
  const tx = Math.floor((p.x + p.w / 2) / T), ty = Math.floor((p.y + p.h / 2) / T);
  return (ty === s[1] || ty === s[1] - 1) && (tx === s[0] || tx === s[0] + 1);
}
function onShip(p) {
  const s = world().ship;
  if (!s) return false;
  const tx = Math.floor((p.x + p.w / 2) / T), ty = Math.floor((p.y + p.h / 2) / T);
  return ty === s[1] && (tx === s[0] || tx === s[0] + 1);
}

/* The Konami code, anywhere in a game (on the map, in a level, paused):
 * up up down down left right left right B A. It switches cheat mode, which
 * the run keeps: no lives lost, no energy spent. A run that has cheated
 * goes on no high-score table. */
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];
let konamiAt = 0;
function konami(code) {
  konamiAt = code === KONAMI[konamiAt] ? konamiAt + 1 : code === KONAMI[0] ? 1 : 0;
  if (konamiAt < KONAMI.length) return;
  konamiAt = 0;
  if (!G.run || (G.mode !== "map" && G.mode !== "level")) return;
  G.run.cheat = !G.run.cheat;
  if (G.run.cheat) G.run.cheated = true;
  if (G.lv) { G.lv.snapshot.cheat = G.run.cheat; G.lv.snapshot.cheated = G.run.cheated; }
  sfx(G.run.cheat ? "life" : "nope");
  if (G.mode === "map") saveRun();   /* in a level, the snapshot carries it */
  toast(G.run.cheat ? say("cheatOn", "Cheat mode: infinite lives and raygun charges. No high scores this game.") : say("cheatOff", "Cheat mode off."));
}

/* Walking out of a level, from the pause menu: back to the map as Poom went
 * in, with no life lost; what he picked up in the level stays behind */
function leaveLevel(toTitle = false) {
  const snap = G.lv.snapshot;
  const lost = G.run.parts.map((h, i) => h && !snap.parts[i] ? PART_NAMES[i] : null).filter(Boolean);
  const regrown = Object.keys(G.run.hearts || {}).some(id => !(snap.hearts || {})[id]);
  G.run = snap;
  G.lv = null;
  if (toTitle) { saveRun(); return; }
  enterMap();
  saveRun();
  const one = lost.length === 1;
  const said = (lost.length ? `Poom left ${lost.join(" and ")} behind. ${one ? "It's" : "They're"} back where he found ${one ? "it" : "them"}.` : "")
    + (regrown ? `${lost.length ? "<br><br>" : ""}The heartstone he broke there has grown back: a stone only stays broken once he gets out.` : "");
  if (said) message(said);
}

function loseLife() {
  const snap = G.lv.snapshot;
  /* the parts picked up in this level go back where they were */
  const lost = G.run.parts.map((h, i) => h && !snap.parts[i] ? PART_NAMES[i] : null).filter(Boolean);
  const regrown = Object.keys(G.run.hearts || {}).some(id => !(snap.hearts || {})[id]);
  G.run = snap;
  if (!G.run.cheat) G.run.lives--;
  G.lv = null;
  if (G.run.lives < 0) { G.run.lives = 0; gameOver(); return; }
  enterMap();
  saveRun();
  const one = lost.length === 1;
  const dropped = (lost.length ? `<br><br>Poom dropped ${lost.join(" and ")}. ${one ? "It's" : "They're"} back where he found ${one ? "it" : "them"}.` : "")
    + (regrown ? "<br><br>The heartstone he broke there has grown back." : "");
  message(say("lostLife", n => n === 0 ? "Poom shakes it off.<br><br><b>This is your last life.</b>" : `Poom shakes it off.<br><br>${n} ${n === 1 ? "life" : "lives"} left.`, G.run.lives) + dropped);
}

/* ------------------------------------------------------------------ */
/* the world map                                                         */

function enterMap() {
  G.mode = "map";
  /* the one-time map warnings are once per Book, not once per page load */
  if (G.map.book !== G.run.book) { G.map.book = G.run.book; G.map.waterWarned = G.map.fieldWarned = false; }
  document.getElementById("keystrip").hidden = true;
  dressFor(G.run.book);
  const m = G.map;
  if (G.run.mx === null) {
    const [sx, sy] = world().start;
    G.run.mx = sx * T + 4; G.run.my = sy * T + 5;
  }
  /* a small box: the maps' diagonal passages are narrow */
  m.p = { x: G.run.mx, y: G.run.my, w: 8, h: 6, dir: "down", anim: 0 };
  mapCamera(true);
}

/* A world map's tile. A barrier is whatever the map has there until its
 * level is done, and open ground after. */
function mapTile(tx, ty) {
  const w = world(), need = w.barrier[tx + "," + ty];
  if (need && G.run.done[need]) return ".";
  return (w.rows[ty] || "")[tx] || "#";
}
function barrierOn(tx, ty) { const need = world().barrier[tx + "," + ty]; return !!need && !G.run.done[need]; }
function mapSolid(ch) { return ch === "#" || (ch === "~" && !G.run.swim); }
/* Is a pixel on the world map wall? On a world map / and \\ are diagonal
 * walls (maps2/README.md): wall below the diagonal, open above it, which is
 * what the tiles' own collision says (a top edge only, like a floor).
 * Walls both ways: Book A's order of play depends on it. */
function mapPointSolid(px, py) {
  const tx = Math.floor(px / T), ty = Math.floor(py / T), ch = mapTile(tx, ty);
  if (world().e1) { const lv = entranceAt(tx, ty); if (lv && !G.run.done[lv]) return true; }
  if (ch !== "/" && ch !== "\\") return mapSolid(ch);
  const u = (px - tx * T + 0.5) / T, v = (py - ty * T + 0.5) / T;
  return ch === "/" ? u + v > 1 : v > u;
}
/* the corners and edge midpoints of a box: a diagonal can poke between corners */
function boxPoints(x, y, w, h) {
  const xs = [x, x + w / 2, x + w - 1], ys = [y, y + h / 2, y + h - 1], out = [];
  for (const a of xs) for (const b of ys) if (a !== xs[1] || b !== ys[1]) out.push([a, b]);
  return out;
}
function entranceAt(tx, ty) { return world().entrance[tx + "," + ty] || null; }
/* the level Poom is at: the one underfoot, or on an E1 map, where levels
 * are walls until done, one he is right up against */
function mapHere(p) {
  const at = entranceAt(Math.floor((p.x + p.w / 2) / T), Math.floor((p.y + p.h / 2) / T));
  if (at || !world().e1) return at;
  /* within five pixels: enough to reach a level from the middle of the next tile */
  for (const [cx, cy] of boxPoints(p.x - 5, p.y - 5, p.w + 10, p.h + 10)) { const e = entranceAt(Math.floor(cx / T), Math.floor(cy / T)); if (e) return e; }
  return null;
}

function updateMap() {
  const m = G.map, p = m.p;
  if (m.ride) { rideFerry(m); mapCamera(false); m.t++; return; }
  const dx = (isDown("right") ? 1 : 0) - (isDown("left") ? 1 : 0), dy = (isDown("down") ? 1 : 0) - (isDown("up") ? 1 : 0);
  const sp = 1.4;
  const blocked = (x, y) => {
    for (const [cx, cy] of boxPoints(x, y, p.w, p.h)) {
      const ch = mapTile(Math.floor(cx / T), Math.floor(cy / T));
      if (ch === "~" && mapSolid(ch) && !m.waterWarned) { m.waterWarned = true; toast(say("water", "Water. Poom can't swim. Not yet.")); }
      if (mapPointSolid(cx, cy)) { if (barrierOn(Math.floor(cx / T), Math.floor(cy / T)) && !m.fieldWarned) { m.fieldWarned = true; toast(say("blocked", "Something blocks the way. Finish the levels nearby.")); } return true; }
    }
    return false;
  };
  if (dx && !blocked(p.x + dx * sp, p.y)) p.x += dx * sp;
  if (dy && !blocked(p.x, p.y + dy * sp)) p.y += dy * sp;
  if (dx || dy) { p.anim += 0.12; p.dir = dy < 0 ? "up" : dy > 0 ? "down" : dx < 0 ? "left" : "right"; }
  G.run.mx = p.x; G.run.my = p.y;
  m.t++;

  const ctx_ = Math.floor((p.x + p.w / 2) / T), cty = Math.floor((p.y + p.h / 2) / T);
  const here = mapHere(p);
  if (here && (wasPressed("jump") || wasPressed("fire"))) {
    const pending = BOOK_GOAL[G.run.book] === "rescues" && rescueLevels(G.run.book).includes(here) && !(G.run.rescued || {})[here];
    if (G.run.done[here] && !pending) { toast(say("levelDone", name => `${name}: done.`, levelName(here))); sfx("nope"); }
    else { saveRun(); startLevel(here); return; }
  }
  if (!here && onShip(p) && (wasPressed("jump") || wasPressed("fire"))) boardShip();
  if (!here && onParked(p) && (wasPressed("jump") || wasPressed("fire"))) { sfx("nope"); message(say("parked", "<b>The Catamaran</b><br><br>It won't fly.")); }
  const tele = world().tele[ctx_ + "," + cty];
  if (tele && !here && (wasPressed("jump") || wasPressed("fire"))) teleport(tele);
  const dock = !here && world().ferry && world().ferry.at[ctx_ + "," + cty];
  if (dock !== undefined && dock !== false && (wasPressed("jump") || wasPressed("fire"))) boardFerry(dock);
  mapCamera(false);
}

/* The ferry: from the dock Poom stands at to the other, along its route
 * over the water, the shortest way (a route tile touches the next, corners
 * too). Poom rides it; nothing else moves him till it lands. */
function boardFerry(from) {
  const f = world().ferry, to = f.docks.findIndex((g, i) => i !== from);
  if (to < 0) return;
  const near = dock => {
    let best = null;
    for (const k of f.path) { const [x, y] = k.split(",").map(Number); for (const [a, c] of f.docks[dock]) { const d = Math.abs(a - x) + Math.abs(c - y); if (!best || d < best.d) best = { k, d }; } }
    return best && best.k;
  };
  const start = near(from), goal = near(to), back = { [start]: null }, q = [start];
  while (q.length && !(goal in back)) {
    const k = q.shift(), [x, y] = k.split(",").map(Number);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const n = (x + dx) + "," + (y + dy); if (f.path.has(n) && !(n in back)) { back[n] = k; q.push(n); } }
  }
  if (!(goal in back)) { sfx("nope"); return; }
  const route = [];
  for (let k = goal; k; k = back[k]) route.unshift(k.split(",").map(Number));
  const p = G.map.p, here = [Math.floor((p.x + p.w / 2) / T), Math.floor((p.y + p.h / 2) / T)];
  const land = f.docks[to].reduce((a, c) => Math.hypot(c[0] - route[route.length - 1][0], c[1] - route[route.length - 1][1]) < Math.hypot(a[0] - route[route.length - 1][0], a[1] - route[route.length - 1][1]) ? c : a);
  G.map.ride = { route: [here, ...route, land], i: 0, to };
  sfx("enter");
  toast(say("ferry", "All aboard."));
}
function rideFerry(m) {
  const r = m.ride, p = m.p, [tx, ty] = r.route[r.i + 1];
  const gx = tx * T + (T - p.w) / 2, gy = ty * T + (T - p.h) / 2, dx = gx - p.x, dy = gy - p.y, d = Math.hypot(dx, dy), sp = 4;
  if (d <= sp) { p.x = gx; p.y = gy; r.i++; } else { p.x += dx / d * sp; p.y += dy / d * sp; }
  if (Math.abs(dx) > Math.abs(dy)) p.dir = dx < 0 ? "left" : "right"; else p.dir = dy < 0 ? "up" : "down";
  if (r.i >= r.route.length - 1) { G.run.ferry = r.to; m.ride = null; G.run.mx = p.x; G.run.my = p.y; sfx("bump"); }
}

/* the open map tile nearest a tile, within three: open for Poom's box */
function nearestOpen(tx, ty) {
  const open = (x, y) => !boxPoints(x * T + 4, y * T + 5, 8, 6).some(([a, b]) => mapPointSolid(a, b));
  for (let r = 0; r <= 3; r++)
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++)
      if (Math.max(Math.abs(dx), Math.abs(dy)) === r && open(tx + dx, ty + dy)) return [tx + dx, ty + dy];
  return null;
}

/* a teleporter: to its target tile, or the open tile nearest it */
function teleport([tx, ty]) {
  const p = G.map.p, spot = nearestOpen(tx, ty);
  if (!spot) { sfx("nope"); return; }
  p.x = spot[0] * T + (T - p.w) / 2; p.y = spot[1] * T + (T - p.h) / 2;
  G.run.mx = p.x; G.run.my = p.y;
  sfx("enter");
  mapCamera(true);
}

/* The places Poom can walk to now and hasn't done: a flood from where he
 * stands over open ground (riding the map's teleporters), stopping at
 * walls, barriers and, on an E1 map, the levels themselves. Worked out again
 * only when what's done changes or Poom crosses a teleporter. */
let openCache = { key: null, ids: [] };
function openPlaces() {
  const w = world(), p = G.map.p;
  const sx = Math.floor((p.x + p.w / 2) / T), sy = Math.floor((p.y + p.h / 2) / T);
  const key = G.run.book + "|" + Object.keys(G.run.done).sort().join() + "|" + !!G.run.swim;
  if (openCache.key === key && openCache.seen && openCache.seen.has(sx + "," + sy)) return openCache.ids;
  const seen = new Set(), q = [[sx, sy]], ids = new Set();
  const walk = (tx, ty) => {
    if (tx < 0 || ty < 0 || tx >= w.w || ty >= w.h || barrierOn(tx, ty)) return false;
    const e = entranceAt(tx, ty);
    if (e && !G.run.done[e]) { ids.add(e); if (w.e1) return false; }
    const ch = mapTile(tx, ty);
    return ch === "/" || ch === "\\" || !mapSolid(ch);
  };
  seen.add(sx + "," + sy);
  /* a diagonal wall is open on two sides only, those of its open half:
     / on its top and left, \\ on its top and right (mapPointSolid) */
  const SIDES = { "/": "ul", "\\": "ur" };
  const opens = (x, y, side) => { const sides = SIDES[mapTile(x, y)]; return !sides || sides.includes(side); };
  while (q.length) {
    const [x, y] = q.pop();
    const next = [[x + 1, y, "r", "l"], [x - 1, y, "l", "r"], [x, y + 1, "d", "u"], [x, y - 1, "u", "d"]].filter(([nx, ny, out, inn]) => opens(x, y, out) && opens(nx, ny, inn));
    const tele = w.tele[x + "," + y]; if (tele) next.push(tele);
    const dock = w.ferry && w.ferry.at[x + "," + y];
    if (dock !== undefined) w.ferry.docks.forEach((g, i) => { if (i !== dock) next.push(...g); });
    for (const [nx, ny] of next) { const k = nx + "," + ny; if (seen.has(k)) continue; if (walk(nx, ny)) { seen.add(k); q.push([nx, ny]); } }
  }
  openCache = { key, seen, ids: [...ids] };
  return openCache.ids;
}

function mapCamera(snap) {
  const p = G.map.p, c = G.cam, mw = world().w * T, mh = world().h * T;
  /* before anything is done, lean the view toward the nearest open place,
     so the way out of the crash site is on screen */
  let fx = p.x + p.w / 2, fy = p.y + p.h / 2;
  if (!Object.keys(G.run.done).some(id => MAPS[id] && MAPS[id].book === G.run.book)) {
    let best = null;
    for (const id of openPlaces()) { const b = world().box[id]; if (!b) continue; const bx = (b.x0 + b.x1 + 1) * T / 2, by = (b.y0 + b.y1 + 1) * T / 2, d = Math.hypot(bx - fx, by - fy); if (!best || d < best.d) best = { bx, by, d }; }
    if (best && best.d < 260) { fx = (fx + best.bx) / 2; fy = (fy + best.by) / 2; }
  }
  let tx = Math.max(0, Math.min(mw - W, fx - W / 2)), ty = Math.max(0, Math.min(mh - H, fy - H / 2));
  c.x = snap ? tx : c.x + (tx - c.x) * 0.2; c.y = snap ? ty : c.y + (ty - c.y) * 0.2;
}

/* ------------------------------------------------------------------ */
/* drawing                                                               */

function drawLevel() {
  const lv = G.lv, c = G.cam, art = lv.art;
  const cx = Math.round(c.x), cy = Math.round(c.y);
  /* far background, parallax */
  const fx = -Math.round(cx * 0.25) % W;
  ctx.drawImage(lv.far, fx, 0); ctx.drawImage(lv.far, fx + W, 0);
  const tx0 = Math.floor(cx / T), ty0 = Math.floor(cy / T);
  const solidLike = ch => ch === "#" || ch === "=" || ch === "%" || ch === "i" || ch === "<" || ch === ">" || ch === "/" || ch === "\\";
  for (let ty = ty0; ty <= ty0 + Math.ceil(H / T); ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(W / T); tx++) {
    if (ty < 0 || ty >= lv.h || tx < 0 || tx >= lv.w) continue;
    const ch = lv.tiles[ty][tx], x = tx * T - cx, y = ty * T - cy;
    /* this tile's art: the level's, or the Hive's in a heartstone chamber */
    const art = lv.hiveAt && lv.hiveAt.has(tx + "," + ty) ? lv.hiveArt : lv.art;
    if (lv.back[ty][tx] && !solidLike(ch)) ctx.drawImage(art.bgwall, x, y);
    const v = tx * 7 + ty * 13;
    if (ch === "#" && lv.deckAt.has(tx + "," + ty)) ctx.drawImage(art.bridge, x, y);
    else if (ch === "#" || ch === "%") { const set = solidLike((lv.tiles[ty - 1] || [])[tx]) ? art.ground : art.groundTop; ctx.drawImage(set[v % set.length], x, y); }
    else if (ch === "=") ctx.drawImage(art.brick, x, y);
    /* a one-way wall looks like the rock, with a faint arrow the way through */
    else if (ch === "(" || ch === ")") {
      ctx.drawImage(art.ground[v % art.ground.length], x, y);
      ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
      const d = ch === "(" ? 1 : -1;
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 8 + d * (i - 1) * 2 - 1, y + 7 - i, 2, 1 + i * 2);
    }
    else if (ch === "-") ctx.drawImage(art.plat, x, y);
    else if (ch === "^") {
      /* hanging from rock, it points down; an animated one (the Works'
         steam vents) runs its own effect in the same frame */
      const hang = lv.hang.has(tx + "," + ty);
      ctx.save(); ctx.translate(x, hang ? y + T : y); if (hang) ctx.scale(1, -1);
      ctx.drawImage(art.spikes, 0, 0); if (art.spikeFx && lv.theme === "works") { const vp = ventPhase(lv); if (vp !== "off") art.spikeFx(ctx, lv.t, tx * 3 + ty, vp === "warn"); }
      ctx.restore();
    }
    else if (ch === "z") drawPulse(art, x, y, pulsePhase(lv), lv.t);
    else if (ch === "~") ctx.drawImage(art.liquid[(lv.t >> 3) % 4], x, y);
    else if (ch === "|") ctx.drawImage(art.pole, x, y);
    else if (DOOR_CH[ch] !== undefined) ctx.drawImage((lv.tiles[ty - 1] || [])[tx] === ch && art.doorsBelow ? art.doorsBelow[DOOR_CH[ch]] : art.doors[DOOR_CH[ch]], x, y);
    else if (SOCKET_DOOR[ch] !== undefined) ctx.drawImage((lv.tiles[ty - 1] || [])[tx] === ch && art.doorsBelow ? art.doorsBelow[SOCKET_DOOR[ch]] : art.doors[SOCKET_DOOR[ch]], x, y);
    else if (ch === "i") ctx.drawImage(art.ice, x, y);
    else if (ch === "H") ctx.drawImage(art.sign, x, y + (lv.signDrop[tx + "," + ty] || 0) * T);
    else if (BELT[ch]) ctx.drawImage(art.conveyor[ch === ">" ? 1 : 0][(lv.t >> 2) % 4], x, y);
    else if (ch === "/" || ch === "\\") { const sl = lv.slope[ty][tx]; ctx.drawImage(art.slope(sl[0], sl[1]), x, y); }
  }
  for (const s of lv.sockets) { ctx.drawImage(art.socket, s.x * T - cx, s.y * T - cy); if (s.filled) ctx.drawImage(ART.gems[s.gem], s.x * T + 4 - cx, s.y * T + 4 - cy); }
  for (const b of lv.bridges) ctx.drawImage(art.switch[b.on ? 1 : 0], b.x * T - cx, b.y * T - cy);
  for (const k of lv.trapAt) {
    const [x, y] = k.split(",").map(Number), a = lv.hiveAt && lv.hiveAt.has(k) ? lv.hiveArt : art;
    ctx.drawImage(a.switch[lv.pulled === k ? 1 : 0], x * T - cx, y * T - cy);
    /* a trap lever wears a warning: a red triangle with an !, blinking */
    if (lv.pulled !== k && (lv.t >> 4) % 3) drawWarning(x * T + 8 - cx, y * T - 11 - cy);
  }
  for (const k of Object.keys(lv.pswitchAt)) { const s = lv.pswitchAt[k]; ctx.drawImage(art.switch[s.on ? 1 : 0], s.x * T - cx, s.y * T - cy); }
  drawPlats(lv, cx, cy);
  /* the secret teleporter: a warp arch, a tile wide, drawn from its top tile */
  for (const k of lv.secretAt) { const [x, y] = k.split(",").map(Number); if (!lv.secretAt.has(x + "," + (y - 1))) ctx.drawImage(art.warp[(lv.t >> 2) % 4], x * T - cx, y * T - cy, T, T * 2); }
  for (const d of lv.warpDoors) if (d.x - cx > -d.w && d.x - cx < W && d.y - cy > -d.h && d.y - cy < H) ctx.drawImage(art.warp[(lv.t >> 3) % 4], d.x - cx, d.y - cy, d.w, d.h);
  /* walking off the map's edge ends some levels: marked, not hidden */
  if (lv.edge.size) drawEdgeExits(lv, cx, cy);
  for (const e of lv.exits) { const a = lv.hiveAt && lv.hiveAt.has(Math.floor(e.x / T) + "," + Math.floor(e.y / T)) ? lv.hiveArt : art; ctx.drawImage(a.exit[lv.exitUsed === e ? 1 : 0], e.x - cx, e.y - cy); }

  for (const it of lv.items) {
    if (it.gone) continue;
    it.t++;
    const big = it.kind === "part" || it.kind === "objective" || it.kind === "swim";
    const s = it.kind === "heart" ? ART.heartstone[(it.t >> 4) % 2] : it.kind === "gem" ? ART.gems[it.gem] : it.kind === "objective" && ART.objectives ? ART.objectives[it.ends ? 1 : 0][(it.t >> 3) % 2] : big ? ART.parts[it.part] : ART.items[it.kind];
    const bob = big || it.kind === "gem" ? Math.round(Math.sin(it.t / 10) * 1.5) : 0;
    ctx.drawImage(s, it.x + ((T - s.width) >> 1) - cx, it.y + T - s.height - cy + bob);
    if (big && (it.t >> 3) % 4 === 0) ctx.drawImage(ART.star, it.x + 2 - cx, it.y - 2 - cy);
  }

  /* rescue targets: a plush Poom for now, waving */
  for (const n of lv.npcs) if (!n.saved) {
    n.t++;
    /* a set's own one to rescue, waving (ART.npc: two frames), else a plush Poom */
    if (ART.npc) { const s = ART.npc[(n.t >> 4) % 2]; ctx.drawImage(s, Math.round(n.x + n.w / 2 - s.width / 2) - cx, Math.round(n.y + n.h) - s.height - cy + 1); }
    else ctx.drawImage(ART.items.life, Math.round(n.x + 2) - cx, Math.round(n.y + 6) - cy - ((n.t >> 4) % 2));
  }
  for (const e of lv.ents) drawEnemy(e, cx, cy);
  drawPlayer(lv.p, cx, cy);

  for (const s of lv.shots) {
    const a = s.kind === "zap" ? ART.zap[(s.t >> 1) % 2] : ART.hairball[(s.t >> 2) % 2];
    ctx.drawImage(a, Math.round(s.x) - cx, Math.round(s.y) - cy);
  }
  for (const f of lv.fx) {
    if (f.t < 0) continue;
    if (f.kind === "poof") ctx.drawImage(ART.poof[f.t < 6 ? 0 : 1], Math.round(f.x) - cx, Math.round(f.y) - cy);
    if (f.kind === "bubble") { ctx.strokeStyle = EGA[11]; ctx.beginPath(); ctx.arc(Math.round(f.x) - cx, Math.round(f.y) - cy, 1.5 + (f.t > 40 ? 0.5 : 0), 0, Math.PI * 2); ctx.stroke(); }
    if (f.kind === "text") drawSmallText(f.text, Math.round(f.x) - cx, Math.round(f.y) - cy, f.t % 8 < 4 ? 15 : 14, true);
  }
  if (lv.swim) { ctx.fillStyle = (THEMES[lv.theme] && THEMES[lv.theme].swimTint) || "rgba(0, 0, 170, 0.28)"; ctx.fillRect(0, 0, W, H); }
  drawHud(lv);
}

function drawPlayer(p, cx, cy) {
  if (p.safeT > 0 && (p.safeT >> 2) % 2) return;
  if (p.state === "exit") {
    if (p.t > 36) return;
    ctx.globalAlpha = 1 - p.t / 40;
  }
  const a = ART.poom, run = G.run;
  let pose;
  if (p.state === "dead") pose = "dead";
  else if (p.state === "exit") pose = "back";
  else if (p.climbing) pose = (Math.floor(p.anim / 8) % 2) ? "climb1" : "climb0";
  else if (p.pogo) pose = p.shootT ? "shootAir" : "pogo";
  else if (p.crouch > 0) pose = "pogo";
  else if (p.shootT) pose = p.onGround ? "shoot" : "shootAir";
  else if (!p.onGround) pose = p.vy < 0 ? "jump" : "fall";
  else if (Math.abs(p.vx) > 0.3) pose = ["walk0", "walk1", "walk2", "walk1"][Math.floor(p.anim) % 4];
  else pose = "stand";
  const dir = p.face > 0 ? "r" : "l", spr = a[pose][dir];
  const bx = Math.round(p.x + p.w / 2 - spr.width / 2) - cx;
  if (p.pogo) {
    const short = p.compress > 0 || p.land > 0;
    const stick = (short ? ART.pogoShort : ART.pogoLong)[dir];
    const feet = Math.round(p.y + PH) - cy + (short ? 3 : 0);
    ctx.drawImage(stick, Math.round(p.x + p.w / 2 - stick.width / 2) - cx, feet - 2);
    ctx.drawImage(spr, bx, feet - spr.height + 1);
  } else {
    ctx.drawImage(spr, bx, Math.round(p.y + p.h) - spr.height + 1 - cy);
  }
  ctx.globalAlpha = 1;
}

function drawEnemy(e, cx, cy) {
  /* mousels and vacuumoids are drawn facing left, the rest facing right */
  const drawnLeft = e.type === "x" || e.type === "V" || e.type === "W" || e.type === "L";
  const set = ART[e.art || ENEMY[e.type].art], dir = (e.face > 0) !== drawnLeft ? "r" : "l", f = (e.t >> 3) % 2;
  let k;
  switch (e.type) {
    case "x": k = e.state === "stunned" ? "stunned" : e.state === "look" ? "look" : f ? "walk1" : "walk0"; break;
    case "B": k = e.state === "charge" || e.state === "growl" ? "charge" : f ? "walk1" : "walk0"; break;
    case "V": case "W": case "L": k = !e.onGround ? "jump" : (e.t >> 4) % 2 ? "walk1" : "walk0"; break;
    default: k = f ? "b" : "a";
  }
  const spr = set[k][dir], sc = e.scale || 1;
  const x = Math.round(e.x + e.w / 2 - spr.width * sc / 2) - cx, y = Math.round(e.y + e.h) + sc - spr.height * sc - cy;
  if (e.flash && e.flash % 2) ctx.globalAlpha = 0.4;
  if (e.type === "G" && e.aim) {
    /* the turret's art points up and to the right: mirror it to the barrel's
       side, and hang it upside down when it fires downward */
    const fx = e.aim[0] < 0 ? -1 : 1, fy = e.aim[1] > 0 ? -1 : 1;
    ctx.save(); ctx.translate(x + (fx < 0 ? spr.width : 0), y + (fy < 0 ? spr.height : 0)); ctx.scale(fx, fy);
    ctx.drawImage(set[k].r, 0, 0); ctx.restore();
  } else ctx.drawImage(spr, x, y, spr.width * sc, spr.height * sc);
  ctx.globalAlpha = 1;
  if (e.type === "x" && e.state === "stunned" && (e.t >> 3) % 2) ctx.drawImage(ART.star, x + 6, y - 2);
  /* a guard that has seen Poom: a red ! over its head */
  if (e.alert && (e.state === "growl" || (e.state === "charge" && e.t < 30)) && ART.alert) ctx.drawImage(ART.alert, Math.round(e.x + e.w / 2) - 3 - cx, y - 12);
}

function drawDigits(n, x, y, len, set = "red") {
  const s = String(n).padStart(len, " ");
  [...s].forEach((ch, i) => {
    if (ch === " ") ctx.drawImage((ART.digits[set + "Dim"] || ART.digits.dim)[8], x + i * 6, y);
    else ctx.drawImage(ART.digits[set][+ch], x + i * 6, y);
  });
}

/* the scorebox, top left: score; lives; raygun charges; keycards. A theme
 * may have its own (theme.hud) */
function drawHud(lv) {
  if (theme.hud === "wrist") return drawWristHud(lv);
  if (theme.hud === "visor") return drawVisorHud(lv);
  if (theme.hud === "codec") return drawCodecHud(lv);
  if (theme.hud === "deco") return drawDecoHud(lv);
  if (theme.hud === "tracker") return drawTrackerHud(lv);
  const r = G.run;
  ctx.fillStyle = "#000"; ctx.fillRect(3, 3, 59, 22);
  ctx.fillStyle = EGA[8]; ctx.fillRect(3, 3, 59, 1); ctx.fillRect(3, 24, 59, 1); ctx.fillRect(3, 3, 1, 22); ctx.fillRect(61, 3, 1, 22);
  drawDigits(r.score, 6, 6, 9);
  ctx.drawImage(ART.items.life, 5, 14, 9, 10);
  drawDigits(r.cheat || r.arcade ? 99 : Math.min(r.lives, 99), 15, 16, 2);
  ctx.drawImage(ART.items.ammo, 32, 15, 6, 9);
  drawDigits(r.cheat ? 99 : Math.min(r.ammo, 99), 40, 16, 2);
  if (lv) lv.keys.forEach((k, i) => { if (k) ctx.drawImage(ART.gems[i], 64 + i * 10, 4, 8, 7); });
}

/* the wasteland's scorebox: a chunky wrist computer, olive casing, a dial,
 * and a green phosphor screen with the icons in green too */
const phosphor = new WeakMap();
function inPhosphor(img) {
  let c = phosphor.get(img);
  if (c) return c;
  c = makeCanvas(img.width, img.height);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    if (!px[i + 3]) continue;
    const l = (px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11) / 255, k = 0.25 + l * 0.85;
    px[i] = 40 * k; px[i + 1] = Math.min(255, 255 * k); px[i + 2] = 70 * k;
  }
  g.putImageData(d, 0, 0);
  phosphor.set(img, c);
  return c;
}
function drawWristHud(lv) {
  const r = G.run, f = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  /* the casing */
  f("#000", 2, 3, 88, 29); f("#000", 3, 2, 86, 31);
  f("#4e4628", 3, 3, 86, 29);
  f("#7c6e44", 4, 3, 84, 1); f("#7c6e44", 3, 4, 1, 27);
  f("#2c2614", 4, 31, 84, 1); f("#2c2614", 88, 4, 1, 27);
  f("#3a3420", 70, 5, 1, 25);
  for (const [sx, sy] of [[5, 5], [5, 28], [85, 5], [85, 28]]) { f("#a8966a", sx, sy, 2, 2); f("#3a3420", sx + 1, sy + 1, 1, 1); }
  /* the screen: dark glass, phosphor glow, scanlines */
  f("#1a1a10", 7, 5, 62, 25);
  f("#04170b", 8, 6, 60, 23);
  ctx.fillStyle = "rgba(110, 255, 140, 0.07)"; ctx.fillRect(8, 6, 60, 11);
  drawDigits(r.score, 10, 8, 9, "green");
  f("#1c5a2a", 10, 16, 56, 1);
  ctx.drawImage(inPhosphor(ART.items.life), 9, 18, 9, 10);
  drawDigits(r.cheat || r.arcade ? 99 : Math.min(r.lives, 99), 19, 20, 2, "green");
  ctx.drawImage(inPhosphor(ART.items.ammo), 36, 19, 6, 9);
  drawDigits(r.cheat ? 99 : Math.min(r.ammo, 99), 44, 20, 2, "green");
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)"; for (let y = 6; y < 29; y += 2) ctx.fillRect(8, y, 60, 1);
  /* the dial, and a power light that breathes */
  ctx.fillStyle = "#1e1a0e"; ctx.beginPath(); ctx.arc(79.5, 14.5, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a7a4c"; ctx.beginPath(); ctx.arc(79.5, 14.5, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#62562f"; ctx.beginPath(); ctx.arc(80, 15, 3.5, 0, Math.PI * 2); ctx.fill();
  f("#d8c890", 79, 10, 1, 4);
  const glow = 0.55 + 0.45 * Math.sin(G.t / 30);
  f("#1e1a0e", 76, 24, 7, 4); ctx.fillStyle = `rgba(120, 255, 140, ${glow})`; ctx.fillRect(77, 25, 5, 2);
  if (lv) lv.keys.forEach((k, i) => { if (k) ctx.drawImage(ART.gems[i], 93 + i * 10, 4, 8, 7); });
}

/* Book 2's scorebox: the hunter's visor readout, dark violet glass in a
 * teal frame with bracket corners, the numbers in the visor's amber, a
 * scan line drifting down it */
function drawVisorHud(lv) {
  const r = G.run, f = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  f("rgba(10, 6, 18, 0.82)", 3, 3, 66, 26);
  f("#1e5c58", 3, 3, 66, 1); f("#1e5c58", 3, 28, 66, 1); f("#1e5c58", 3, 3, 1, 26); f("#1e5c58", 68, 3, 1, 26);
  /* bracket corners */
  f("#6fe0c8", 2, 2, 5, 1); f("#6fe0c8", 2, 2, 1, 5); f("#6fe0c8", 65, 2, 5, 1); f("#6fe0c8", 69, 2, 1, 5);
  f("#6fe0c8", 2, 29, 5, 1); f("#6fe0c8", 2, 25, 1, 5); f("#6fe0c8", 65, 29, 5, 1); f("#6fe0c8", 69, 25, 1, 5);
  drawDigits(r.score, 9, 7, 9, "amber");
  f("#2f6e6a", 8, 16, 56, 1);
  ctx.drawImage(ART.items.life, 7, 18, 9, 10);
  drawDigits(r.cheat || r.arcade ? 99 : Math.min(r.lives, 99), 17, 20, 2, "amber");
  ctx.drawImage(ART.items.ammo, 38, 19, 4, 8);
  drawDigits(r.cheat ? 99 : Math.min(r.ammo, 99), 45, 20, 2, "amber");
  /* the scan line */
  const sy = 4 + ((G.t >> 1) % 24);
  ctx.fillStyle = "rgba(111, 224, 200, 0.10)"; ctx.fillRect(4, sy, 64, 1);
  if (lv) lv.keys.forEach((k, i) => { if (k) ctx.drawImage(ART.gems[i], 73 + i * 10, 4, 8, 7); });
}

/* Book 3's scorebox: the radio's screen, green on black glass in a slate
 * frame, a signal bar that flickers, the frequency for a label */
function drawCodecHud(lv) {
  const r = G.run, f = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  f("#000", 2, 2, 72, 28); f("#2c343e", 3, 3, 70, 26); f("#4a5664", 3, 3, 70, 1); f("#16181e", 3, 28, 70, 1);
  f("#04170b", 6, 5, 64, 22);
  ctx.fillStyle = "rgba(90, 255, 138, 0.06)"; ctx.fillRect(6, 5, 64, 11);
  drawDigits(r.score, 9, 7, 9, "green");
  f("#1c5a2a", 8, 15, 60, 1);
  ctx.drawImage(inPhosphor(ART.items.life), 8, 17, 9, 10);
  drawDigits(r.cheat || r.arcade ? 99 : Math.min(r.lives, 99), 18, 19, 2, "green");
  ctx.drawImage(inPhosphor(ART.items.ammo), 34, 18, 6, 9);
  drawDigits(r.cheat ? 99 : Math.min(r.ammo, 99), 42, 19, 2, "green");
  /* the signal bar */
  for (let i = 0; i < 4; i++) f(i < 3 + ((G.t >> 4) % 2) ? "#5aff8a" : "#1c5a2a", 58 + i * 3, 25 - i * 2, 2, 2 + i * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)"; for (let y = 5; y < 27; y += 2) ctx.fillRect(6, y, 64, 1);
  if (lv) lv.keys.forEach((k, i) => { if (k) ctx.drawImage(ART.gems[i], 77 + i * 10, 4, 8, 7); });
}

/* Book 4's scorebox: an art-deco plaque, dark teal glass in a gold frame
 * with a fan at each top corner, the numbers in gold */
function drawDecoHud(lv) {
  const r = G.run, f = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  f("#000", 2, 2, 70, 28); f("#a8781c", 3, 3, 68, 26); f("#f8d860", 3, 3, 68, 1); f("#6a4a12", 3, 28, 68, 1);
  f("#081a22", 5, 5, 64, 22);
  for (const x0 of [5, 63]) for (let i = 0; i < 4; i++) f("#a8781c", x0 + (x0 > 30 ? -i : i), 5, 1, 4 - i);
  drawDigits(r.score, 9, 7, 9, "amber");
  f("#6a4a12", 8, 15, 58, 1);
  ctx.drawImage(ART.items.life, 7, 17, 9, 10);
  drawDigits(r.cheat || r.arcade ? 99 : Math.min(r.lives, 99), 17, 19, 2, "amber");
  ctx.drawImage(ART.items.ammo, 36, 17, 4, 9);
  drawDigits(r.cheat ? 99 : Math.min(r.ammo, 99), 43, 19, 2, "amber");
  if (lv) lv.keys.forEach((k, i) => { if (k) ctx.drawImage(ART.gems[i], 75 + i * 10, 4, 8, 7); });
}

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

/* a trap lever under its warning sign, for the help's list */
let trapIconC = null;
function trapIcon() {
  if (trapIconC) return trapIconC;
  const c = makeCanvas(T, T + 12), g = c.getContext("2d"), lever = paintTiles("crags").switch[0];
  g.drawImage(lever, 0, 12);
  drawWarning(8, 1, g);
  return (trapIconC = c);
}
/* a pulsing column: the level's spikes, points up and down, filling the
 * tile. Faint while it's gone, flickering as it comes back */
function drawPulse(art, x, y, phase, t) {
  const a = phase === "on" ? 1 : phase === "warn" ? ((t >> 2) & 1 ? 0.85 : 0.3) : 0.14;
  ctx.save(); ctx.globalAlpha = a;
  ctx.drawImage(art.spikes, x, y);
  ctx.translate(x, y + T); ctx.scale(1, -1); ctx.drawImage(art.spikes, 0, 0);
  ctx.restore();
  if (phase === "warn" && (t >> 2) & 1) { ctx.fillStyle = "rgba(255, 70, 50, 0.35)"; ctx.fillRect(x + 6, y, 4, T); }
}

/* an edge exit: chevrons drifting outward through each of its tiles, and
 * EXIT over the top one */
function drawEdgeExits(lv, cx, cy) {
  const tops = {};
  for (const k of lv.edge) {
    const [tx, ty] = k.split(",").map(Number), x = tx * T - cx, y = ty * T - cy;
    if (x < -T || x > W || y < -T || y > H) continue;
    const out = tx < lv.w / 2 ? -1 : 1, ph = (lv.t >> 2) % 8;
    ctx.fillStyle = "rgba(90, 255, 120, 0.18)"; ctx.fillRect(x, y, T, T);
    for (let i = 0; i < 2; i++) {
      const cxp = x + 8 + out * (((ph + i * 4) % 8) - 4);
      ctx.fillStyle = i ? "#9dff7a" : "#e8ffb0";
      for (let d = 0; d < 4; d++) { ctx.fillRect(cxp + out * d, y + 4 + d, 1, 1); ctx.fillRect(cxp + out * d, y + 11 - d, 1, 1); }
    }
    const col = tx + "";
    if (tops[col] === undefined || ty < tops[col][1]) tops[col] = [x, ty, out];
  }
  for (const [x, ty, out] of Object.values(tops)) drawSmallText("EXIT", x + (out > 0 ? -14 : 0), ty * T - cy - 8, (lv.t >> 3) % 2 ? 10 : 15);
}

/* a warning sign: a red triangle with a white !, its point at (x, y) */
function drawWarning(x, y, g = ctx) {
  g.fillStyle = "#000"; g.beginPath(); g.moveTo(x, y - 1); g.lineTo(x + 7, y + 10); g.lineTo(x - 7, y + 10); g.closePath(); g.fill();
  g.fillStyle = "#e0302a"; g.beginPath(); g.moveTo(x, y + 1); g.lineTo(x + 5, y + 9); g.lineTo(x - 5, y + 9); g.closePath(); g.fill();
  g.fillStyle = "#fff"; g.fillRect(x, y + 3, 1, 3); g.fillRect(x, y + 7, 1, 1);
}

/* a tiny pixel font for floating score text: digits from the LED set,
 * and the few letters we need drawn plainly */
function drawSmallText(text, x, y, col, center) {
  const w = text.length * 6;
  if (center) x -= w / 2;
  ctx.fillStyle = "#000";
  ctx.font = "8px 'Press Start 2P', monospace";
  ctx.textBaseline = "top";
  [...text].forEach((ch, i) => {
    if (/[0-9]/.test(ch)) ctx.drawImage(ART.digits[col === 15 ? "white" : "yellow"][+ch], Math.round(x + i * 6), Math.round(y));
    else { ctx.fillStyle = EGA[col]; ctx.fillText(ch, Math.round(x + i * 6), Math.round(y)); }
  });
}

let mapArt = null, mapArtSets = null;
/* places on a world map that shimmer like a mirage: set E's E10, which
   Keen 4 faded in and out (docs/story/book-4-story.md) */
const MIRAGE = { E10: true };
const MARKER_KINDS = ["dome", "cave", "igloo", "gate", "fort", "castle"];
function drawMap() {
  const m = G.map, c = G.cam, cx = Math.round(c.x), cy = Math.round(c.y);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  const tx0 = Math.floor(cx / T), ty0 = Math.floor(cy / T);
  for (let ty = ty0; ty <= ty0 + Math.ceil(H / T); ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(W / T); tx++) {
    const ch = mapTile(tx, ty), x = tx * T - cx, y = ty * T - cy;
    if (ch === "~") { ctx.drawImage(mapArt.water[((m.t >> 5) + tx + ty) % 2], x, y); continue; }
    ctx.drawImage(Array.isArray(mapArt.ground) ? mapArt.ground[(tx * 7 + ty * 13) & 3] : mapArt.ground, x, y);
    const ent = entranceAt(tx, ty);
    if (barrierOn(tx, ty)) ctx.drawImage(mapArt.field[(m.t >> 2) % 3], x, y);
    else if (ch === "#") {
      /* rock, lit and shaded where it meets open ground, if the set can */
      const open = (dx, dy) => mapTile(tx + dx, ty + dy) !== "#";
      ctx.drawImage(mapArt.rockAt ? mapArt.rockAt((open(0, -1) ? 1 : 0) | (open(1, 0) ? 2 : 0) | (open(0, 1) ? 4 : 0) | (open(-1, 0) ? 8 : 0)) : mapArt.rock, x, y);
    }
    else if (ch === "/" || ch === "\\") drawDiagonal(ch === "/" ? "LR" : "LL", x, y);
    else if (ent && !mapArt.markerFor) ctx.drawImage(mapArt.marker[MARKER_KINDS[+ent.slice(1) % MARKER_KINDS.length]], x, y);
    else if (ch === "Q") ctx.drawImage(mapArt.tele[(m.t >> 3) % 2], x, y);
  }
  /* a set with its own markers draws one per entrance, by the level's type */
  if (mapArt.markerFor) for (const [id, b] of Object.entries(world().box)) {
    const kind = { vault: "vault", vaultCold: "vault", raiders: "camp", ruins: "ruin", crags: "cave", delve: "station", hive: "pod", shore: "tower", base: "bunker", crater: "vent", gardens: "dome", promenade: "tower", works: "works", machine: "skull", biodome: "dome", hive5: "nest" }[LEVEL_THEME[id]] || Object.keys(mapArt.markerFor)[0];
    const mx = (b.x0 + b.x1 + 1) * T / 2 - 16 - cx, my = (b.y1 + 1) * T - 32 - cy;
    /* a mirage (Book 4's Phantom Pavilion) fades in and out of the murk */
    if (MIRAGE[id]) ctx.globalAlpha = 0.35 + 0.35 * (1 + Math.sin(m.t / 24));
    if (mx > -32 && mx < W && my > -32 && my < H) ctx.drawImage(mapArt.markerFor[kind], mx, my);
    ctx.globalAlpha = 1;
  }
  /* a bobbing arrow over each place Poom can reach and hasn't done */
  const bob = Math.round(Math.sin(m.t / 12) * 2);
  for (const id of openPlaces()) {
    const b = world().box[id]; if (!b) continue;
    const ax = Math.round((b.x0 + b.x1 + 1) * T / 2) - cx, ay = (mapArt.markerFor ? (b.y1 + 1) * T - 32 - 10 : b.y0 * T - 9) - cy + bob;
    if (ax < -8 || ax > W + 8 || ay < -8 || ay > H + 8) continue;
    ctx.fillStyle = "#000"; ctx.beginPath(); ctx.moveTo(ax - 7, ay - 1); ctx.lineTo(ax + 7, ay - 1); ctx.lineTo(ax, ay + 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = mapArt.markerFor ? "#ffd23f" : EGA[14]; ctx.beginPath(); ctx.moveTo(ax - 5, ay); ctx.lineTo(ax + 5, ay); ctx.lineTo(ax, ay + 6); ctx.closePath(); ctx.fill();
  }
  /* a parked Catamaran (scenery), drawn like the ship */
  if (world().parked) { const [sx, sy] = world().parked; ctx.drawImage(mapArt.ship, sx * T - cx, (sy - 1) * T - cy); }
  /* the ferry: under Poom while he rides, else at its dock */
  const fy = world().ferry;
  if (fy && mapArt.ferry) {
    const bob2 = Math.round(Math.sin(m.t / 10));
    if (m.ride) ctx.drawImage(mapArt.ferry[m.p.dir === "left" ? "l" : "r"], Math.round(m.p.x + m.p.w / 2 - 16) - cx, Math.round(m.p.y + m.p.h) - 12 - cy + bob2);
    else {
      const g = fy.docks[G.run.ferry || 0], x0 = Math.min(...g.map(c => c[0])), x1 = Math.max(...g.map(c => c[0])), y1 = Math.max(...g.map(c => c[1]));
      /* moored on the water beside the dock: the nearest route tile */
      let best = null;
      for (const k of fy.path) { const [x, y] = k.split(",").map(Number), d = Math.hypot(x - (x0 + x1) / 2, y - y1); if (!best || d < best.d) best = { x, y, d }; }
      if (best) ctx.drawImage(mapArt.ferry.r, best.x * T + 8 - 16 - cx, best.y * T + 12 - 12 - cy + bob2);
    }
  }
  /* the ship, on its two tiles and the two above */
  if (world().ship) { const [sx, sy] = world().ship; ctx.drawImage(mapArt.ship, sx * T - cx, (sy - 1) * T - cy); }
  /* done flags: on the map's own flag spot, or the level's first entrance tile */
  const w = world();
  for (const id of w.need) if (G.run.done[id]) {
    const [fx, fy] = w.flag[id] || w.first[id];
    ctx.drawImage(mapArt.flag, fx * T - cx, fy * T - cy - 4);
  }
  const p = m.p, f = Math.floor(p.anim) % 2;
  const set = ART.map, spr = p.dir === "up" ? set["up" + f].r : p.dir === "down" ? set["down" + f].r : set["side" + f][p.dir === "left" ? "l" : "r"];
  ctx.drawImage(spr, Math.round(p.x + p.w / 2 - spr.width / 2) - cx, Math.round(p.y + p.h) - spr.height - cy + 1);

  /* the name of the place underfoot */
  const here = mapHere(p);
  const onTele = !here && world().tele[Math.floor((p.x + p.w / 2) / T) + "," + Math.floor((p.y + p.h / 2) / T)];
  const onDock = !here && fy && fy.at[Math.floor((p.x + p.w / 2) / T) + "," + Math.floor((p.y + p.h / 2) / T)] !== undefined;
  const label = here ? levelName(here) + (G.run.done[here] ? " (done)" : "") : onShip(p) || onParked(p) ? "The Catamaran" : onTele ? mapArt.teleName || "Teleporter" : onDock || m.ride ? mapArt.ferryName || "The ferry" : "";
  mapLabel(label);
  drawHud(null);
}

/* a diagonal wall: rock in its half of the tile */
function drawDiagonal(half, x, y) {
  const c = { UL: [[0, 0], [T, 0], [0, T]], LR: [[T, 0], [T, T], [0, T]], UR: [[0, 0], [T, 0], [T, T]], LL: [[0, 0], [T, T], [0, T]] }[half];
  ctx.save(); ctx.beginPath(); ctx.moveTo(x + c[0][0], y + c[0][1]); ctx.lineTo(x + c[1][0], y + c[1][1]); ctx.lineTo(x + c[2][0], y + c[2][1]); ctx.closePath(); ctx.clip();
  ctx.fillStyle = EGA[8]; ctx.fillRect(x, y, T, T); ctx.drawImage(mapArt.rock, x, y);
  ctx.restore();
}

let lastLabel = null;
function mapLabel(text) {
  if (text === lastLabel) return;
  lastLabel = text;
  const el = document.getElementById("maplabel");
  el.textContent = text;
  el.hidden = !text;
}

/* the title's backdrop: stars over the red edge of Planet Hiss */
const titleStars = Array.from({ length: 90 }, (_, i) => ({ x: (i * 97) % 320, y: (i * 61) % 150, c: [15, 7, 14, 11][i % 4], s: i % 7 }));
/* the title screen's backdrop, by theme */
let wasteTitleBg = null;
function drawTitleScene(t) {
  if (theme.title === "wasteland") return drawWasteTitle(t);
  if (theme.title === "thrum") return drawThrumTitle(t);
  if (theme.title === "claw") return drawClawTitle(t);
  if (theme.title === "deep") return drawDeepTitle(t);
  if (theme.title === "terminus") return drawTerminusTitle(t);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  for (const s of titleStars) if ((t >> 4) % 7 !== s.s) { ctx.fillStyle = EGA[s.c]; ctx.fillRect(s.x, s.y, 1, 1); }
  /* the planet */
  ctx.fillStyle = EGA[4]; ctx.beginPath(); ctx.ellipse(160, 330, 300, 170, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = EGA[6]; ctx.beginPath(); ctx.ellipse(160, 336, 300, 168, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = EGA[12]; for (let i = 0; i < 40; i++) ctx.fillRect((i * 53) % 320, 172 + (i * 7) % 26, 2, 1);
  /* a ringed moon */
  ctx.fillStyle = EGA[5]; ctx.beginPath(); ctx.arc(268, 46, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = EGA[13]; ctx.beginPath(); ctx.arc(263, 42, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = EGA[14]; ctx.beginPath(); ctx.ellipse(268, 46, 28, 5, -0.3, 0, Math.PI * 2); ctx.stroke();
  /* the Catamaran, and Poom beside it */
  ctx.drawImage(mapArt.shipBare, 0, 0, 32, 32, 30, 140, 64, 64);
  const pose = (t >> 5) % 8 === 0 ? "shoot" : "stand";
  ctx.drawImage(ART.poom[pose].r, 96, 179);
}

/* Thrum's title (Book 2): the hollow moon at night under its gas giant,
 * the Hum pulsing in the cracks, the Catamaran landed with its lights
 * blinking, Poom beside it in his hardsuit, the station's mast lamp. */
let thrumTitleBg = null;
function drawThrumTitle(t) {
  if (!thrumTitleBg) thrumTitleBg = paintThrumTitle(mapArtSets.classic.shipBare);
  ctx.drawImage(thrumTitleBg, 0, 0);
  for (const s of titleStars) if (s.y < 120 && (t >> 4) % 7 !== s.s && (s.x > 160 || s.y < 66)) { ctx.fillStyle = s.c === 14 ? "#ffe9c8" : "#c8c0e8"; ctx.fillRect(s.x, s.y, 1, 1); }
  /* the Hum breathing in the cracks */
  const a = 0.10 + 0.08 * Math.sin(t / 40);
  ctx.fillStyle = `rgba(111, 224, 200, ${a})`; ctx.fillRect(0, 172, W, 28);
  /* the mast lamp, and the ship's landing lights in turn */
  if ((t >> 5) % 2) { ctx.fillStyle = "rgba(255, 176, 46, 0.35)"; ctx.beginPath(); ctx.arc(291, 106, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#ffb02e"; ctx.fillRect(290, 105, 2, 2); }
  const on = (t >> 4) % 3;
  for (const [i, x] of [[0, 21], [1, 48], [2, 75]]) { ctx.fillStyle = i === on ? "#6fe0c8" : "#10504e"; ctx.fillRect(x - 1, 178, 3, 2); }
  const pose = (t >> 5) % 8 === 0 ? "shoot" : "stand", spr = ART.poom[pose].r;
  ctx.drawImage(spr, 84, 182 - spr.height);
}

/* Isla Garra's title (Book 3): the volcano island at night from the jetty,
 * two searchlights sweeping, the lair's windows flickering, the magnet
 * crane's lamp, and Poom on the jetty in his sneaking suit. */
let clawTitleBg = null;
function drawClawTitle(t) {
  if (!clawTitleBg) clawTitleBg = paintClawTitle(mapArtSets.classic.shipBare);
  ctx.drawImage(clawTitleBg, 0, 0);
  for (const s of titleStars) if (s.y < 100 && (t >> 4) % 7 !== s.s && Math.hypot(s.x - 266, s.y - 42) > 18 && !(s.x < 150 && s.y > 64)) { ctx.fillStyle = s.c === 14 ? "#fff2c4" : "#9ab0d0"; ctx.fillRect(s.x, s.y, 1, 1); }
  /* the searchlights, sweeping from the lair */
  for (const [x0, ph] of [[40, 0], [88, 2]]) {
    const a = Math.sin(t / 90 + ph) * 0.6 + 0.25;
    ctx.fillStyle = "rgba(220, 230, 200, 0.10)"; ctx.beginPath(); ctx.moveTo(x0, 106); ctx.lineTo(x0 + Math.sin(a) * 240 - 16, 106 - Math.cos(a) * 240); ctx.lineTo(x0 + Math.sin(a) * 240 + 16, 106 - Math.cos(a) * 240); ctx.closePath(); ctx.fill();
  }
  if ((t >> 4) % 2) { ctx.fillStyle = "#ff3b2f"; ctx.fillRect(75, 38, 2, 2); }
  if ((t >> 3) % 9 === 0) { ctx.fillStyle = "#1c242e"; ctx.fillRect(32 + ((t >> 6) % 10) * 7, 110, 4, 8); }
  const pose = (t >> 5) % 8 === 0 ? "shoot" : "stand", spr = ART.poom[pose].r;
  ctx.drawImage(spr, 62, 181 - spr.height);
}

/* Raptura's title (Book 4): the city from the seabed, bubbles rising, a
 * fish or two crossing, the neon flickering, Poom on a rock in his brass
 * helmet. */
let deepTitleBg = null;
function drawDeepTitle(t) {
  if (!deepTitleBg) deepTitleBg = paintDeepTitle(mapArtSets.classic.shipBare);
  ctx.drawImage(deepTitleBg, 0, 0);
  for (let i = 0; i < 14; i++) {
    const k = ((t * (0.5 + (i % 3) * 0.2)) + i * 37) % 220, x = (i * 53) % 320 + Math.sin((t + i * 30) / 20) * 2;
    ctx.strokeStyle = "rgba(200, 240, 245, 0.55)"; ctx.beginPath(); ctx.arc(x, 200 - k, 1 + (i % 2), 0, Math.PI * 2); ctx.stroke();
  }
  for (let i = 0; i < 3; i++) { const x = ((t * (0.3 + i * 0.1)) + i * 140) % 380 - 30, y = 50 + i * 30; ctx.fillStyle = "#14465e"; ctx.fillRect(x, y, 7, 3); ctx.fillRect(x - 2, y - 1, 2, 5); }
  if ((t >> 3) % 23 === 0) { ctx.fillStyle = "#0a2430"; ctx.fillRect(169, 54, 28, 2); }
  const pose = (t >> 5) % 8 === 0 ? "shoot" : "stand", spr = ART.poom[pose].r;
  ctx.drawImage(spr, 76, 181 - spr.height);
}

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

/* The wasteland's title: the Glow at dusk over a ruined skyline, the
 * Catamaran crash-landed and smoking, Poom beside it in his ranger gear,
 * Auntie Static's mast blinking far off. */
function drawWasteTitle(t) {
  if (!wasteTitleBg) wasteTitleBg = paintWasteTitle(mapArtSets.classic.shipBare);
  ctx.drawImage(wasteTitleBg, 0, 0);
  /* stars, a few twinkling */
  for (const s of titleStars) if (s.y < 70 && (t >> 4) % 7 !== s.s) { ctx.fillStyle = s.c === 14 ? "#ffe9a8" : "#c8c0d8"; ctx.fillRect(s.x, s.y, 1, 1); }
  /* the mast's light */
  if ((t >> 5) % 2) { ctx.fillStyle = "rgba(255, 59, 47, 0.35)"; ctx.beginPath(); ctx.arc(15, 103, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#ff3b2f"; ctx.fillRect(14, 102, 2, 2); }
  /* smoke off the wreck */
  for (let i = 0; i < 6; i++) {
    const k = ((t * 0.4) + i * 17) % 100;
    ctx.fillStyle = `rgba(70, 64, 60, ${0.6 * (1 - k / 100)})`;
    /* drifting right on the wind, clear of the sun behind the wreck */
    ctx.beginPath(); ctx.arc(70 + k * 0.9 + Math.sin((t + i * 40) / 25) * 2, 150 - k * 0.6, 2 + k * 0.07, 0, Math.PI * 2); ctx.fill();
  }
  const pose = (t >> 5) % 8 === 0 ? "shoot" : "stand", spr = ART.poom[pose].r;
  ctx.drawImage(spr, 76, 192 - spr.height);
}

/* ------------------------------------------------------------------ */
/* overlays: messages, menus, the status window                          */

const UI = {
  stack: [],
  top() { return this.stack[this.stack.length - 1] || null; },
  push(o) {
    held.clear(); pressed.clear();
    /* nothing under an overlay keeps focus: Space would click it again */
    if (document.activeElement && document.activeElement !== document.body && document.activeElement.blur) document.activeElement.blur();
    this.stack.push(o);
    uiRoot.appendChild(o.el);
    if (o.focus) o.focus();
  },
  pop() {
    const o = this.stack.pop();
    if (o) { o.el.remove(); if (o.onClose) o.onClose(); }
    held.clear(); pressed.clear();
    const t = this.top(); if (t && t.focus) t.focus();
  },
  clear() { while (this.stack.length) { const o = this.stack.pop(); o.el.remove(); } },
  key(ev) {
    const o = this.top();
    if (ev.code === "KeyM" && !(ev.target.closest && ev.target.closest("input"))) {
      /* a menu with a Sound item takes M itself, so it shows the new setting */
      const item = o && [...o.el.querySelectorAll("button")].find(b => { const k = b.querySelector("kbd"); return k && k.textContent === "M"; });
      if (item) item.click(); else toggleMute();
      ev.preventDefault(); return;
    }
    if (o && o.key) o.key(ev);
  },
  padPress(a) {
    const o = this.top(); if (!o || !o.key) return;
    const code = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", jump: "Enter", fire: "Enter", pogo: "Escape", pause: "Escape", status: "Escape" }[a];
    if (code) o.key({ code, key: code, preventDefault() {}, synthetic: true });
  },
};

function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
function imgOf(c, scale = 1) { const i = new Image(); i.src = c.toDataURL(); i.width = c.width * scale; i.height = c.height * scale; i.className = "px"; i.alt = ""; return i; }

/* a Keen-style message box; any key closes it */
function message(html, { icon = null, iconRow = null, onClose = null, hint = "press a key", onSkip = null } = {}) {
  const box = el("div", "box msg");
  if (icon) box.appendChild(imgOf(icon, 2));
  if (iconRow) { const row = el("div", "iconrow"); iconRow.forEach((h, i) => { const im = imgOf(ART.parts[i], 1); if (!h) im.classList.add("missing"); row.appendChild(im); }); box.appendChild(row); }
  box.appendChild(el("p", null, html));
  box.appendChild(el("p", "hint", hint));
  const wrap = el("div", "overlay"); wrap.appendChild(box);
  let armed = false; setTimeout(() => { armed = true; }, 250);
  /* onSkip: Esc leaves a run of pages altogether, instead of turning one */
  const o = { el: wrap, onClose, key(ev) {
    if (ev.repeat || (!armed && !ev.synthetic)) return;   /* a held key doesn't close it unread */
    if (ev.preventDefault) ev.preventDefault();
    if (onSkip && ev.code === "Escape") { o.onClose = null; UI.pop(); onSkip(); return; }
    UI.pop();
  } };
  wrap.addEventListener("pointerdown", () => { if (armed) UI.pop(); });
  UI.push(o);
}

/* a level-name card, gone by itself */
function card(text, then) {
  const wrap = el("div", "overlay"), box = el("div", "box card", `<p class="small">Now entering</p><p>${text}</p>`);
  wrap.appendChild(box);
  const o = { el: wrap, onClose: then, key(ev) { ev.preventDefault && ev.preventDefault(); UI.pop(); } };
  UI.push(o);
  setTimeout(() => { if (UI.top() === o) UI.pop(); }, 1300);
}

let toastT = null;
function toast(text) {
  const t = document.getElementById("toast");
  t.textContent = text; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600);
}

/* a menu: items { label, key, act, meta?, disabled? } or "gap" */
function menu(title, items, { cls = "", onBack = null, footer = "" } = {}) {
  const wrap = el("div", "overlay " + cls), box = el("div", "box menu");
  if (title) box.appendChild(el("h2", null, title));
  const list = el("div", "items");
  const buttons = [];
  for (const it of items) {
    if (it === "gap") { list.appendChild(el("div", "gap")); continue; }
    const b = el("button", null, `<span class="cur">&#9658;</span><span class="lbl">${it.label}</span>${it.meta ? `<span class="meta">${it.meta}</span>` : ""}${it.key ? `<kbd>${it.key}</kbd>` : ""}`);
    if (it.disabled) b.disabled = true;
    b.addEventListener("click", () => { sfx("pick"); it.act(); });
    b.addEventListener("mouseenter", () => b.focus());
    b.addEventListener("focus", () => { if (!b.classList.contains("sel")) sfx("menu"); buttons.forEach(o => o.classList.toggle("sel", o === b)); });
    b._item = it;
    buttons.push(b); list.appendChild(b);
  }
  box.appendChild(list);
  if (footer) box.appendChild(el("div", "foot", footer));
  wrap.appendChild(box);
  const live = () => buttons.filter(b => !b.disabled);
  const o = {
    el: wrap,
    focus() { const f = live().find(b => b.classList.contains("sel")) || live()[0]; if (f) { f.focus({ preventScroll: true }); buttons.forEach(o => o.classList.toggle("sel", o === f)); } },
    key(ev) {
      const bs = live(), i = bs.findIndex(b => b.classList.contains("sel"));
      if (ev.code === "ArrowDown" || ev.code === "ArrowUp") { ev.preventDefault(); bs[(i + (ev.code === "ArrowDown" ? 1 : -1) + bs.length) % bs.length].focus(); return; }
      if (ev.code === "Enter" || ev.code === "Space") { ev.preventDefault(); const b = bs[i] || bs[0]; if (b) b.click(); return; }
      if (ev.code === "Escape" && onBack) { ev.preventDefault(); onBack(); return; }
      const k = ev.key && ev.key.length === 1 ? ev.key.toUpperCase() : null;
      const hit = k && bs.find(b => b._item.key && b._item.key.toUpperCase() === k || (k === "H" || k === "/") && b._item.key === "?");
      if (hit) { ev.preventDefault(); hit.click(); }
    },
  };
  UI.push(o);
  return o;
}

/* a page of text with an optional tab bar; Esc goes back */
function page(title, tabs, { onBack = () => UI.pop() } = {}) {
  const wrap = el("div", "overlay"), box = el("div", "box page");
  const head = el("div", "phead"); head.appendChild(el("h2", null, title));
  const x = el("button", "x", "&times;"); x.setAttribute("aria-label", "Close"); x.addEventListener("click", () => onBack()); head.appendChild(x);
  box.appendChild(head);
  const bar = el("div", "tabs"), body = el("div", "pbody");
  let cur = 0;
  const show = i => {
    cur = i; body.innerHTML = ""; const c = tabs[i][1]; if (typeof c === "string") body.innerHTML = c; else body.appendChild(c());
    [...bar.children].forEach((b, j) => b.setAttribute("aria-selected", String(j === i)));
    body.scrollTop = 0;
  };
  if (tabs.length > 1) { tabs.forEach(([name], i) => { const b = el("button", null, name); b.addEventListener("click", () => { sfx("menu"); show(i); }); bar.appendChild(b); }); box.appendChild(bar); }
  box.appendChild(body);
  box.appendChild(el("div", "foot", tabs.length > 1 ? "&larr; &rarr; pages &middot; &uarr; &darr; scroll &middot; Esc back" : "&uarr; &darr; scroll &middot; Esc back"));
  wrap.appendChild(box);
  show(0);
  UI.push({
    el: wrap,
    key(ev) {
      if (ev.code === "Escape" || ev.code === "Enter") { ev.preventDefault(); onBack(); }
      else if (ev.code === "ArrowRight" || ev.code === "ArrowLeft") { ev.preventDefault(); if (tabs.length > 1) { sfx("menu"); show((cur + (ev.code === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length); } }
      else if (ev.code === "ArrowDown" || ev.code === "ArrowUp") { ev.preventDefault(); body.scrollTop += ev.code === "ArrowDown" ? 24 : -24; }
    },
  });
}

/* yes or no, in the game's own box */
function ask(question, yes, then) {
  menu(question, [{ label: yes, key: "Y", act: () => { UI.pop(); then(); } }, { label: "Cancel", key: "N", act: () => UI.pop() }], { onBack: () => UI.pop(), cls: "ask" });
}

function toggleMute() { audio.setMuted(!audio.muted); syncSoundButton(); if (!audio.muted) sfx("pick"); toast(audio.muted ? "Sound off" : "Sound on"); }
function syncSoundButton() { const b = document.getElementById("snd"); if (b) { b.setAttribute("aria-pressed", String(!audio.muted)); b.textContent = audio.muted ? "♪̸" : "♪"; } }

function statusWindow() {
  const r = G.run, wrap = el("div", "overlay"), box = el("div", "box status");
  box.appendChild(el("h2", null, "Status"));
  const grid = el("div", "sgrid");
  const row = (k, v) => { grid.appendChild(el("span", "k", k)); const s = el("span", "v"); if (typeof v === "string") s.textContent = v; else s.appendChild(v); grid.appendChild(s); };
  row("Score", String(r.score));
  row("Extra life at", String(r.nextLife));
  row("Lives", r.cheat ? "infinite (cheat)" : String(r.lives));
  row("Raygun", say("raygun", n => n ? `${n} charge${n === 1 ? "" : "s"}` : "empty", r.ammo));
  /* the four colours, and the fifth only once it's held */
  const held = G.lv ? G.lv.keys : [false, false, false, false];
  const keys = el("span"); held.forEach((k, i) => { if (i > 3 && !k) return; const im = imgOf(ART.gems[i]); if (!k) im.classList.add("missing"); keys.appendChild(im); });
  row("Keycards", keys);
  const parts = el("span"); r.parts.forEach((h, i) => { const im = imgOf(ART.parts[i]); im.title = PART_NAMES[i]; if (!h) im.classList.add("missing"); parts.appendChild(im); });
  /* what the Book is after: Book 1's ship parts, Book 2's heartstones,
     Book 4's Little Ones; Books 3 and 5 end at a last level, named here */
  const goal = BOOK_GOAL[r.book];
  if (goal === "hearts") row("Heartstones", `${heartsBroken(r, r.book)} of ${heartsIn(r.book)} broken`);
  else if (goal === "rescues") row(say("rescueName", "Rescued"), `${rescuedIn(r, r.book)} of ${rescueLevels(r.book).length}`);
  else if (goal && goal.last) row("Last of all", levelName(goal.last).replace(/^Level \d+: /, "") + (r.done[goal.last] ? " (done)" : ""));
  else if (world().ship) row("Ship parts", parts);
  if (world().ship) row("Aboard", `${(r.aboard || []).filter(Boolean).length} of 4`);
  row("Book", String(bookNumber(r.book)));
  if (r.swim) row("Swimming", "yes");
  row("Levels done", `${world().need.filter(id => r.done[id]).length} of ${world().need.length}`);
  box.appendChild(grid);
  box.appendChild(el("p", "hint", "press a key"));
  wrap.appendChild(box);
  wrap.addEventListener("pointerdown", () => UI.pop());
  UI.push({ el: wrap, key(ev) { ev.preventDefault && ev.preventDefault(); if (!ev.repeat) UI.pop(); } });
}

function openPause() {
  if (UI.top()) return;
  const inLevel = G.mode === "level";
  menu("Paused", [
    { label: "Resume", key: "R", act: () => UI.pop() },
    { label: "Status", key: "T", act: () => { UI.pop(); statusWindow(); } },
    { label: "Sound", key: "M", meta: audio.muted ? "off" : "on", act: () => { toggleMute(); UI.pop(); openPause(); } },
    { label: "Game speed", key: "G", meta: SPEEDS[speed].label, act: () => { cycleSpeed(); UI.pop(); openPause(); } },
    { label: "Help", key: "?", act: () => openHelp() },
    "gap",
    inLevel ? { label: "Leave level", key: "L", act: () => ask("Leave this level? What you picked up in it stays behind.", "Leave", () => { UI.pop(); leaveLevel(); }) } : null,
    { label: "Quit to title", key: "Q", meta: "game saved", act: () => ask(inLevel ? "Quit to the title? The game is saved, but what you picked up in this level stays behind." : "Quit to the title? The game is saved.", "Quit", () => {
      UI.clear();
      if (inLevel) leaveLevel(true); else saveRun();
      openTitle();
    }) },
  ].filter(Boolean), { onBack: () => UI.pop() });
}

/* ------------------------------------------------------------------ */
/* help, about, settings, scores                                         */

function spriteRow(entries) {
  return () => {
    const d = el("div", "entries");
    for (const [c, name, text] of entries) {
      const r = el("div", "entry"), pic = el("div", "pic");
      pic.appendChild(imgOf(c, 2)); r.appendChild(pic);
      r.appendChild(el("div", null, `<b>${name}</b><br>${text}`)); d.appendChild(r);
    }
    return d;
  };
}

const STORY = `<p>Poom Purrington is eight years old, has an IQ of 314, and has built a working starship out of a laundry basket, the cat carrier, a hair dryer and three hundred feet of yarn. He calls it the <b>Catamaran</b>.</p>
<p>One evening, while his parents are out, Poom puts on his big brother's football helmet, becomes <b>Commander Poom</b>, and points the Catamaran at the stars.</p>
<p>He lands on <b>Planet Hiss</b> for a quick look around. When he gets back, the ship has been picked clean. The <b>Vacuumoids</b> &mdash; tall, one-eyed, endlessly sucking machines &mdash; have hauled off four parts: the <b>Yarn Drive</b>, the <b>Catnip Battery</b>, the <b>Whisker Antenna</b> and the <b>Laser Pointer</b>.</p>
<p>Find all four, bring them back to the Catamaran, and get home before your parents do. And whatever you do, stay away from the hose.</p>`;

const CONTROLS = `<table>
<tr><td><kbd>&larr;</kbd> <kbd>&rarr;</kbd> / <kbd>A</kbd> <kbd>D</kbd></td><td>walk</td></tr>
<tr><td><kbd>Ctrl</kbd> / <kbd>Z</kbd></td><td>jump &mdash; hold it to jump higher</td></tr>
<tr><td><kbd>Alt</kbd> / <kbd>X</kbd></td><td>pogo stick on and off</td></tr>
<tr><td><kbd>Space</kbd> / <kbd>C</kbd></td><td>fire the raygun</td></tr>
<tr><td><kbd>&uarr;</kbd> <kbd>&darr;</kbd></td><td>climb a pole</td></tr>
<tr><td><kbd>&uarr;</kbd></td><td>read a sign; go through a door</td></tr>
<tr><td><kbd>&darr;</kbd> + jump</td><td>drop through a ledge</td></tr>
<tr><td><kbd>Enter</kbd></td><td>status: score, lives, parts</td></tr>
<tr><td><kbd>Esc</kbd></td><td>pause</td></tr>
<tr><td><kbd>M</kbd></td><td>sound on and off</td></tr>
</table>
<p>On the map, walk onto a level and press jump or fire to go in. Flags mark the levels you've done. Walk to the Catamaran with all four parts to fly home.</p>
<p>On the pogo, hold jump as you land for a big bounce. A gamepad works too: A jumps, B pogos, X fires.</p>
<p>Too fast, or too slow? Settings &rarr; <b>Game speed</b>: Classic, Keen&rsquo;s own pace, or Relaxed. The levels are the same at every speed.</p>
<p>The game saves itself whenever you are on the map. Dying sends you back to the map, and you lose whatever you picked up in that level.</p>`;

/* The words of a book: its story, its first word on the map, and its help
 * pages. Book 1's, the wasteland, from docs/story/book-1-story.md; other
 * books have the original game's until they have their own. */
const BOOK_TEXT = {
  H: {
    story: `<p>Commander Poom points the <b>Catamaran</b> at the stars. A meteor shower knocks out the Yarn Drive, and he comes down hard in <b>the Glow</b>: the wasteland left behind by a war the cats and dogs should never have fought.</p>
<p>Before the engines have stopped ticking, the <b>Scrappers</b>, a raider gang who strip anything that falls from the sky, have hauled off four of the ship's parts.</p>
<p>Their boss, <b>Junk Baron Cal</b>, gave one to each of his four lieutenants, and each locked it away on their own turf: two in the old underground <b>Vaults</b>, one in <b>Fort Scrap</b>, one in the ruins of <b>Old Litterburg</b>.</p>
<p>Cross the Glow, get past the locks, take the parts back and bolt them into the Catamaran before the Scrappers come back for the rest. And keep an ear on the radio: <b>Auntie Static</b> seems to know things.</p>`,
    arrive: "This is the Glow. The road out of the crash valley starts at <b>The Valley Road</b>, just east of the ship.<br><br>An arrow marks each place you can reach. Walk up to one and press <kbd>Ctrl</kbd>, <kbd>Z</kbd> or <kbd>Space</kbd> to go in.",
    map: `<p>On the map, walk up to a place and press jump or fire to go in. An arrow marks each place you can reach; a place you haven't cleared blocks the road; a banner marks the ones you have. Jump or fire at a <b>Tube station</b> to ride to the other end. Take the ship's parts back to the <b>Catamaran</b>, where you came down.</p>`,
    creatures: () => { const C = ART.creatureSets.wasteland; return [
      [C.mousel.walk0.r, "Glowmouse", "A mutant mouse: harmless, nosy and pushy. Jump on one to stun it for a while."],
      [C.barker.walk0.r, "Scrap hound", "The Scrappers' dogs. They charge the moment they see you. One shot."],
      [C.vac.walk0.r, "Scrapper", "The raiders, in scrap armour. Deadly to touch, and it takes four shots."],
      [C.lieut.walk0.r, "Lieutenant", "Cal's lieutenants, one guarding each stolen part. Deadly, and it takes five shots."],
      [C.roombot.a.r, "Sentrybot", "Vault security, rewired by the Scrappers. Can't be hurt. It shoves."],
      [C.turret.a.r, "Auto-turret", "Fixed in place, firing along its barrel when you come near. Can't be hurt."],
    ]; },
    items: () => { const I = ART.itemSets.wasteland; return [
      [I.items.fish, "Caps, tuna, clean water, Sunny Snax, a medal, a trophy", "100, 200, 500, 1000, 2000 and 5000 points. An extra life at 20,000, then 40,000, 80,000 and so on."],
      [I.items.ammo, "Energy cell", "Five shots for the raygun."],
      [I.items.life, "Poom bobblehead", "An extra life. Nobody knows why the Glow is full of them."],
      [I.gems[0], "Vault keycards", "Open the door of the same colour, in this level."],
      [ART.parts[0], "Ship parts", "Four, each in a lieutenant's strongroom. Take them to the Catamaran."],
    ]; },
    /* its places: a level's name on the map and its title card */
    places: {
      H02: "The Valley Road", H03: "Auntie's Tower", H04: "Griz's Camp", H05: "Old Litterburg",
      H06: "The Overpass", H07: "The Far Tower", H08: "Fort Scrap", H09: "Vault 9",
      H10: "Vault 6", H11: "Vault 9, Cold Storage", H12: "Scrapper Turf", H13: "The Lookout",
      H14: "Vault 6, the Lab", H15: "The Nest", H16: "Litterburg Main Street", H17: "Vault 9, the Deep Freeze",
    },
    /* the hint signs, by level: who's talking, then what they say. The
       ruins' signs are loudspeakers, the camps' graffiti, the Vaults'
       terminals */
    signs: {
      H03: `<b>Auntie Static, on the loudspeaker</b><br><br><i>"Well, look at you, sugar. Fell out of the sky and landed in the Glow. Four of your bits went north with the Scrappers. I'd get them back if I were you."</i>`,
      H07: `<b>Auntie Static, on the loudspeaker</b><br><br><i>"The Scrappers lock their loot behind Vault doors. Doors want cards, cards come in colours. Match 'em up. And sugar? Fort Scrap sits on the last Tube station that still runs. Clear it, and the Tube'll take you north."</i>`,
      H10: `<b>A Vault terminal</b><br><br>VAULT 6 SECURITY NOTICE: Doors open only to a keycard of matching colour. Report lost cards to your Overseer.<br><br>REMINDER: The transit pad in the Lab is EXPERIMENTAL. Do not step on the transit pad.`,
      H11: `<b>A Vault terminal</b><br><br>VAULT 9 COLD-SLEEP STATUS: COOLANT BREACH. Floors may be slippery. Have a nice day.`,
      H12: `<b>A loudspeaker, in a Scrapper's voice</b><br><br>"THIS IS SCRAPPER TURF. EVERYTHING HERE IS OURS. INCLUDING YOU."<br><br>Then, faintly, Auntie Static: <i>"Don't mind him, sugar."</i>`,
      H13: `<b>Scrapper graffiti</b><br><br>LT. GRIZ HAS THE SHINY THING. DON'T TOUCH THE SHINY THING.<br><br>Under it, smaller: GRIZ'S CAMP IS SOUTH. DON'T GO THERE EITHER.`,
      H16: `<b>Auntie Static, on the loudspeaker</b><br><br><i>"Two ways out of Litterburg, sugar. Either'll do."</i>`,
    },
    /* the game's own talk, in the Glow's words (see say()) */
    say: {
      /* named for what a sign is in its level's tileset (art.js) */
      signNear: tiles => ({ ruins: "A loudspeaker. Press \u2191 to listen.", vault: "A terminal. Press \u2191 to read it.", vaultCold: "A terminal. Press \u2191 to read it.", raiders: "Scrapper graffiti. Press \u2191 to read it." })[tiles] || "A sign. Press \u2191 to read it.",
      noPogo: "No pogo stick. Not yet.",
      warpDoor: "A hatch. Press \u2191 to go through.",
      socket: c => `A ${c} card reader. A ${c} keycard goes here.`,
      noAmmo: "Click. The raygun is empty. Look for energy cells.",
      lockedDoor: c => c ? `A ${c} security door. It wants a ${c} keycard.` : "A locked security door. It wants a keycard.",
      ammo: "<b>Energy cell!</b> Five shots for the raygun. Fire with <kbd>Space</kbd> or <kbd>C</kbd>.",
      pogo: "<b>You found a pogo stick!</b><br><br>Pre-war, rusty, and still springy. Press <kbd>Alt</kbd> or <kbd>X</kbd> to hop on and off. Hold <kbd>Ctrl</kbd> or <kbd>Z</kbd> as you land for a big bounce.",
      swim: "<b>You can swim!</b><br><br>Hold your breath and don't drink it. On the map, Poom can wade in where the shore meets the water.",
      part: (name, n) => `<b>You took back ${name}!</b><br><br>${n === 4 ? "That's all four. Back to the Catamaran, before the Scrappers notice!" : `${n} of 4 ship parts. Get it back to the Catamaran.`}`,
      bossDown: "<b>The lieutenant is down!</b><br><br>Grab the part and get out of here.",
      wayOpens: "Somewhere in the Glow, the road opens.",
      shipWhole: last => `<b>The Catamaran is whole again!</b>${last ? `<br><br>Poom bolts in ${last} and wipes off the Scrapper paint.` : ""}`,
      shipMissing: (fits, still) => `<b>The Catamaran</b><br><br>${fits ? `Poom bolts in ${fits}. ` : ""}It still won't fly without ${still}. The Scrappers have the rest.`,
      lostLife: n => n === 0 ? "Poom dusts himself off.<br><br><b>This is your last life.</b>" : `Poom dusts himself off.<br><br>${n} ${n === 1 ? "life" : "lives"} left.`,
      water: "Glowing water. Poom isn't going in that. Not yet.",
      blocked: "The road's shut. Clear the places nearby.",
      levelDone: name => `${name}: cleared.`,
      cheatOn: "Auntie Static: \"I didn't see nothin', sugar.\" Infinite lives and energy. No high scores this game.",
      cheatOff: "Auntie Static: \"Back on the level, then.\" Cheat mode off.",
      raygun: n => `${n} shot${n === 1 ? "" : "s"}`,
      gameOver: n => `<b>Game over.</b><br><br>The Glow wins this one. Commander Poom is out of lives. Final score: ${n}.`,
      highScore: n => `<b>A high score!</b><br><br>${n} caps' worth. Auntie Static wants your name for the broadcast.`,
    },
    /* the high-score table before anyone's on it */
    scores: [["Junk Baron Cal", 20000], ["Auntie Static", 15000], ["Lt. Griz", 10000], ["Sentrybot", 7500], ["Glowmouse #7", 5000], ["Scrap Hound", 2500], ["The Overseer", 1000]],
    /* the boot screen's lines */
    boot: ["256 colours: ok", "geiger counter: clicking"],
    /* the pages played when the book is done, after the ship's own message;
       the last says what comes next (next: the next book's number, or
       null when this was the last) */
    ending: (score, next) => [
      "The Yarn Drive coughs, catches and hums. Green dust lifts off the hull in a cloud, and the Catamaran rises out of the crash valley.",
      "Below, the Glow spreads out in the last of the light: the Vault hatches, the smoke over Fort Scrap, the broken towers of Old Litterburg. From up here it almost looks pretty.",
      "The radio crackles. <i>\"Nice flying, sugar. Cal is going to be sore about this. Keep your dial right where it is: I'll be in touch.\"</i><br><br>Then static. Poom never told Auntie Static his frequency.",
      "Far below, on a throne of hubcaps, <b>Junk Baron Cal</b>, a grey-black panther, watches a little light climb into the sky.<br><br>\"Find out where it's going,\" he growls.",
      `<b>The End</b> of Book One: Wastelandia.<br><br>${next ? `Score so far: ${score}.<br><br>On to Book ${next}.` : `Final score: ${score}.<br><br>Commander Poom will return.`}`,
    ],
  },
  /* Book 2, set C: Thrum, the hollow moon (docs/story/book-2-story.md) */
  C: {
    story: `<p>Two days out of the Glow, the Catamaran catches a mayday from <b>Thrum</b>, a hollow moon that hums. Poom answers it. He always does.</p>
<p>A crew of moles dug a mining station into Thrum's crust: <b>Station Delve</b>. It is empty now. The <b>Hum</b> has grown through it, a hive of glowing, drifting things that feed on energy, down through the <b>Crags</b> and into its own deep <b>Hive</b>.</p>
<p>The Hum has hold of the Catamaran too: every engine Poom fires drains away into the moon. It draws its strength from eight <b>heartstones</b>, buried in the caves, the station and the hive.</p>
<p>Break all eight and the Hum lets go. Watch out for the <b>Mergatroids</b>, and whatever you do, don't pull the crew's levers by the heartstones. And keep an ear on the radio: somehow, even down here, Auntie Static is broadcasting.</p>`,
    arrive: "This is Thrum. The Catamaran is down on its pad and the Hum has hold of it. The way in is <b>The Landing Shaft</b>, by the pad.<br><br>An arrow marks each place you can reach. Walk up to one and press <kbd>Ctrl</kbd>, <kbd>Z</kbd> or <kbd>Space</kbd> to go in.",
    map: `<p>On the map, walk up to a place and press jump or fire to go in. An arrow marks each place you can reach; a place you haven't cleared blocks the way; a crew beacon marks the ones you have. Break all eight <b>heartstones</b> to free the Catamaran.</p>`,
    creatures: () => { const C = ART.creatureSets.hum; return [
      [C.mousel.walk0.r, "Mergatroid", "A drifting jelly of the Hum: harmless, nosy and pushy. Jump on one to dim it for a while."],
      [C.vac.walk0.r, "Husk", "An armoured crawler the Hum grows out of the rock. Deadly to touch, and it takes four shots."],
      [C.barker.walk0.r, "Skitter", "Six legs and no patience: it rushes you the moment it sees you. One shot."],
      [C.roombot.a.r, "Shellback", "Slow, armoured, can't be hurt. It shoves."],
      [C.tank.a.r, "Spitter", "Sits tight and spits along the floor. Can't be hurt either."],
    ]; },
    items: () => { const I = ART.itemSets.thrum; return [
      [I.items.fish, "Ore chips, ration packs, data slugs, lanterns, a drill bit, a geode", "100, 200, 500, 1000, 2000 and 5000 points. An extra life at 20,000, then 40,000, 80,000 and so on."],
      [I.items.ammo, "Power cell", "The station's. Five shots for the raygun."],
      [I.items.life, "Poom bobblehead", "An extra life. They're here too. Nobody knows."],
      [I.gems[0], "Security cards", "Open the station's door of the same colour, in this level."],
      [ART.heartstone[1], "Heartstones", "Eight, each in its own chamber. Touch one, or shoot it, to break it."],
      [trapIcon(), "Crew levers", "Beside the heartstones, under a red warning sign. <b>Traps</b>: pulling one ends the game. Poom asks before he pulls."],
    ]; },
    places: {
      C02: "The Landing Shaft", C03: "Fungus Hollow", C04: "Lantern Caves", C05: "The Spine Garden", C06: "The Main Lift", C07: "Crystal Drop",
      C08: "The Ore Line", C10: "The Long Gallery", C11: "The Security Wing", C12: "The Assay Labs", C14: "The Drill Hall", C15: "The Records Room",
      C09: "The Hive Mouth", C13: "The Mergatroid Nursery", C16: "The Heart Chambers", C17: "The Hum's Core",
    },
    signs: {
      C09: `<b>A crew terminal, half grown over</b><br><br>LOG, DAY 412: The Hum is in the lower galleries. All crew to the lifts. FOREMAN DIGBY<br><br>Under the static: <i>"Heavens to Mergatroid, sugar, what are you doing down there?"</i>`,
      C11: `<b>A security terminal</b><br><br>STATION EVACUATED. ALL CREW SAFE. Distress beacon SWITCHED OFF by order of Foreman Digby.<br><br>The log is six years old. Poom reads it twice. Then who sent the mayday?`,
    },
    say: {
      signNear: tiles => ({ crags: "A crew terminal. Press ↑ to read it.", delve: "A station terminal. Press ↑ to read it.", hive: "A terminal, half grown over. Press ↑ to read it." })[tiles] || "A terminal. Press ↑ to read it.",
      noPogo: "No pogo stick. Not yet.",
      warpDoor: "A hatch. Press ↑ to go through.",
      socket: c => `A ${c} card slot. A ${c} security card goes here.`,
      noAmmo: "Click. The raygun's dry. Look for power cells.",
      lockedDoor: c => c ? `A ${c} bulkhead. It wants a ${c} security card.` : "A locked bulkhead. It wants a security card.",
      ammo: "<b>Power cell!</b> The station's: five shots for the raygun. Fire with <kbd>Space</kbd> or <kbd>C</kbd>.",
      pogo: "<b>You found a pogo stick!</b><br><br>Press <kbd>Alt</kbd> or <kbd>X</kbd> to hop on and off. Hold <kbd>Ctrl</kbd> or <kbd>Z</kbd> as you land for a big bounce.",
      swim: "<b>You can swim!</b><br><br>On the map, Poom can wade in where the shore meets the water.",
      trapNear: "A crew lever, wired straight into the heartstone. The warning sign means it: don't pull it.",
      trapAsk: "<b>Careful, sugar.</b><br><br>That lever pours the station's power into the heartstone, and the Hum will swallow the Catamaran whole. <b>It ends the game.</b><br><br>Press ↑ again if you really mean to pull it.",
      trap: "<b>Poom pulls the lever.</b><br><br>The station's power floods into the heartstone. The Hum roars, the whole moon shakes, and Thrum swallows the Catamaran whole.",
      parked: "<b>The Catamaran</b><br><br>Poom fires the engines. Nothing happens: every bit of power drains down into the moon. The Hum has hold of her until its heartstones are broken.",
      heart: (n, of) => `<b>The heartstone shatters!</b><br><br>${n === of ? "That's the last one. The whole moon shudders. Get back to the lift!" : `${n} of ${of} broken. Somewhere below, the Hum stutters.`}`,
      wayOpens: "Somewhere on Thrum, a way opens.",
      lostLife: n => n === 0 ? "Poom's suit reboots.<br><br><b>This is your last life.</b>" : `Poom's suit reboots.<br><br>${n} ${n === 1 ? "life" : "lives"} left.`,
      water: "Acid. Poom isn't going in that. Not yet.",
      blocked: "The Hum has grown across the way. Clear the places nearby.",
      levelDone: name => `${name}: cleared.`,
      cheatOn: "Auntie Static: \"Heavens to Mergatroid, sugar. I didn't see a thing.\" Infinite lives and energy. No high scores this game.",
      cheatOff: "Auntie Static: \"On the level again, then.\" Cheat mode off.",
      raygun: n => `${n} shot${n === 1 ? "" : "s"}`,
      gameOver: n => `<b>Game over.</b><br><br>Thrum keeps this one. Commander Poom is out of lives. Final score: ${n}.`,
      highScore: n => `<b>A high score!</b><br><br>${n} points. The station log wants your name.`,
    },
    scores: [["Junk Baron Cal", 20000], ["Auntie Static", 15000], ["Foreman Digby", 10000], ["Mergatroid #8", 7500], ["Shellback", 5000], ["Skitter", 2500], ["Husk", 1000]],
    boot: ["256 colours: ok", "hum detected: 41 hz"],
    /* the pages played when the eighth heartstone has broken and Poom is out */
    ending: (score, next) => [
      "The last heartstone goes dark. All through Thrum the Hum falls silent, and the hold on the Catamaran lets go.",
      "Poom fires the engines. Nothing drains away. The Catamaran lifts off its pad and climbs out of the hollow moon into open space.",
      "Halfway to the gas giant, a salvage barge goes by the other way, too late, crusted in Scrapper paint. Through its window, for a moment, a grey-black panther watches the Catamaran go.",
      "The radio crackles. <i>\"That was Cal's barge, sugar. He set that mayday for you, and he'll be wanting a word. I'd keep moving.\"</i>",
      `<b>The End</b> of Book Two: Heavens to Mergatroid.<br><br>${next ? `Score so far: ${score}.<br><br>On to Book ${next}.` : `Final score: ${score}.<br><br>Commander Poom will return.`}`,
    ],
  },
  /* Book 3, set D: Isla Garra, Dr Cal's island (docs/story/book-3-story.md) */
  D: {
    story: `<p>Out past Thrum, over a warm sea at night, something on an island below reaches up and <b>grabs the Catamaran</b>: a magnet crane the size of a church, which hauls the ship down into a volcano.</p>
<p>This is <b>Isla Garra</b>, home of <b>Dr Cal</b>: a grey-black panther in a white lab coat and a monocle, with a doctorate nobody has ever seen. He builds doomsday machines, and in the labs under the volcano he breeds his own staff. He has always wanted a Catamaran of his own. Deep in the volcano, his <b>Copycat</b> is taking Poom's ship apart to build a black copy.</p>
<p>Poom bailed out over the lagoon and washed up on the beach with a radio and not much else. The islets are linked by <b>transit tubes</b> under the water, and a robot shark called <b>Bruce</b> patrols the lagoon.</p>
<p>Get into the volcano and break the Copycat. Stay out of sight: the <b>Claw guards</b> shout when they see you. And keep the radio on. Auntie Static is on a frequency she shouldn't know.</p>`,
    arrive: "Isla Garra, by night. Poom is on the beach, dripping. The way in is <b>The Beach</b>, right here.<br><br>An arrow marks each place you can reach. Walk up to one and press <kbd>Ctrl</kbd>, <kbd>Z</kbd> or <kbd>Space</kbd> to go in.",
    map: `<p>On the map, walk up to a place and press jump or fire to go in. An arrow marks each place you can reach; a place you haven't cleared blocks the way; Poom's flag marks the ones you have. Stand on a <b>transit tube</b> hatch and press jump or fire to ride it to another islet. Bruce, the robot shark, takes riders from his landings. Break the <b>Copycat</b>, deep in the volcano, to win back the Catamaran.</p>`,
    creatures: () => { const C = ART.creatureSets.claw; return [
      [C.guard.walk0.r, "Claw guard", "A stoat in fatigues, on patrol. When one sees you, it shouts and charges. One shot."],
      [C.heavy.walk0.r, "Heavy", "A stoat in body armour. Deadly to touch, and it takes four shots."],
      [C.boxer.walk0.r, "Boxer", "A guard hiding under a cardboard box. It isn't fooling anyone. Harmless; jump on one to flatten its box."],
      [C.dog.walk0.r, "Guard dog", "Fast, loud, and all teeth. One shot."],
      [C.clawbot.a.r, "Clawbot", "Dr Cal's robot crab. Armoured, can't be hurt. It shoves."],
      [C.gunner.a.r, "Gunner", "A guard behind sandbags with a machine gun. Can't be hurt either: keep your head down."],
      [C.ocelot.walk0.r, "Ocelot", "Dr Cal's elite, in a beret, twirling a pistol. Five shots."],
      [C.ninja.walk0.r, "Ninja", "Bred in Dr Cal's labs, and nobody wants to know how. Quick, and three shots."],
    ]; },
    items: () => { const I = ART.itemSets.claw; return [
      [I.items.fish, "Dog tags, rations, floppy disks, tapes, gold bars, a diamond", "100, 200, 500, 1000, 2000 and 5000 points. An extra life at 20,000, then 40,000, 80,000 and so on."],
      [I.items.ammo, "Battery pack", "Five shots for the raygun."],
      [I.items.life, "Poom bobblehead", "An extra life. Dr Cal keeps one in a glass case, with the eyes scratched out."],
      [I.gems[0], "Security cards", "Open the base's door of the same colour, in this level."],
      [I.objectives[0][0], "Power cores", "Six of them feed the Copycat. Shoot or touch one to break it."],
    ]; },
    places: {
      D02: "The Beach", D03: "The Docks", D04: "The Jungle Trail", D05: "The Perimeter Fence", D06: "The Kennels", D07: "The Searchlights",
      D08: "The Barracks", D10: "The Comms Tower", D11: "The Security Office", D12: "The Brig", D13: "The Armoury", D14: "The Box Depot", D15: "The Clawbot Line",
      D09: "The Magma Works", D16: "The Hangar", D17: "The Copycat",
    },
    signs: {},
    say: {
      signNear: () => "A sign. Press ↑ to read it.",
      noPogo: "No pogo stick. Not yet.",
      warpDoor: "A hatch. Press ↑ to go through.",
      socket: c => `A ${c} card reader. A ${c} security card goes here.`,
      noAmmo: "Click. The raygun's flat. Look for battery packs.",
      lockedDoor: c => c ? `A ${c} blast door. It wants a ${c} security card.` : "A blast door. It wants a security card.",
      ammo: "<b>Battery pack!</b> Five shots for the raygun. Fire with <kbd>Space</kbd> or <kbd>C</kbd>.",
      pogo: "<b>You found a pogo stick!</b><br><br>Press <kbd>Alt</kbd> or <kbd>X</kbd> to hop on and off. Hold <kbd>Ctrl</kbd> or <kbd>Z</kbd> as you land for a big bounce.",
      swim: "<b>You can swim!</b>",
      bossDown: null,
      cell: n => `A power core goes dark. ${n} to go.`,
      core: "<b>The last core goes!</b><br><br>The Copycat shudders, whines, and overloads. Somewhere above, Dr Cal is shouting.",
      ferry: "Bruce, the robot shark, takes Poom aboard. He doesn't seem to mind.",
      wayOpens: "Somewhere on Isla Garra, a gate rolls open.",
      lostLife: n => n === 0 ? "The radio crackles: <i>\"Poom? Poom! POOOOM!\"</i><br><br>He's all right. <b>This is your last life.</b>" : `The radio crackles: <i>\"Poom? Poom! POOOOM!\"</i><br><br>He's all right. ${n} ${n === 1 ? "life" : "lives"} left.`,
      water: "The lagoon. Bruce patrols it. Poom isn't going in.",
      blocked: "A locked compound. Clear the places nearby.",
      levelDone: name => `${name}: cleared.`,
      cheatOn: "Auntie Static: <i>\"Sugar, I've hacked the island's mainframe. You're invincible. Don't tell anybody.\"</i> Infinite lives and energy. No high scores this game.",
      cheatOff: "Auntie Static: <i>\"Back to sneaking, then.\"</i> Cheat mode off.",
      raygun: n => `${n} shot${n === 1 ? "" : "s"}`,
      gameOver: n => `<b>Game over.</b><br><br><i>"Poom? Poom! POOOOOOOM!"</i><br><br>Dr Cal keeps the Catamaran. Final score: ${n}.`,
      highScore: n => `<b>A high score!</b><br><br>${n} points. Dr Cal would like your name, for his files.`,
    },
    scores: [["Dr Cal", 20000], ["Junk Baron Cal", 17500], ["Auntie Static", 15000], ["Ocelot", 10000], ["Mr Squeaks", 7500], ["Bruce", 5000], ["Claw guard", 2500]],
    boot: ["256 colours: ok", "radio: 140.85"],
    /* the pages played when the Copycat blows */
    ending: (score, next) => [
      "The Copycat goes up with a bang that rattles the whole volcano. Red lights, klaxons, guards running every way at once.",
      "Out of the Hangar roars the one copy the Copycat finished: <b>a black Catamaran</b>. At its helm, monocle glinting, lab coat flapping, Dr Cal: <i>\"This isn't over, puma!\"</i>",
      "Poom finds his own Catamaran in the Hangar, nearly whole, and blasts it out of the crater into the night.",
      "Over the sea, the black Catamaran keeps pace with him in the dark for a while. Its pilot gives Poom a little salute, and peels away.",
      "The radio crackles. <i>\"Well, sugar. Now there are two of you.\"</i>",
      `<b>The End</b> of Book Three: The Island of Dr Cal.<br><br>${next ? `Score so far: ${score}.<br><br>On to Book ${next}.` : `Final score: ${score}.<br><br>Commander Poom will return.`}`,
    ],
  },  /* Book 4, set E: Raptura, the city under the sea (docs/story/book-4-story.md) */
  E: {
    story: `<p>Poom follows the black Catamaran out over the sea. Far from anywhere, it <b>dives</b>, and is gone. Where it went down stands a lighthouse, alone on a rock, and inside it a bathysphere is waiting, its hatch open, going down.</p>
<p>At the bottom of the sea is <b>Raptura</b>, a city of otters, built by <b>Sir Augustus Fathom</b>, a walrus who wanted a city with no landlords, no lifeguards and no limits. It ran on <b>SPARK</b>, a glow squeezed from sea slugs, which made its otters strong, and then strange: the <b>Splicers</b>. Now the glass weeps, the lights flicker, and the <b>Big Brass</b>, great walking diving suits, stomp the halls.</p>
<p>Somewhere down here are the <b>Little Ones</b>, the city's last pups, sent out with jars to gather SPARK. <b>Find all eight</b> and send them up in the bathysphere.</p>
<p>And Cal? Cal is down here buying SPARK by the barrel. Auntie Static, faint through the water: <i>"Would you kindly be careful, sugar?"</i></p>`,
    arrive: "The bathysphere settles with a clunk at the bottom of the sea. This is Raptura's seabed. The way in is <b>The Kelp Steps</b>, close by.<br><br>An arrow marks each place you can reach. Walk up to one and press <kbd>Ctrl</kbd>, <kbd>Z</kbd> or <kbd>Space</kbd> to go in.",
    map: `<p>On the map, walk up to a place and press jump or fire to go in. An arrow marks each place you can reach; a fallen bulkhead blocks the way until the places near it are cleared; Poom's flag marks the ones he has. The deep water needs a <b>diving suit</b>. Rescue all eight <b>Little Ones</b> to finish the Book. A place you've left with a Little One still in it can be gone back into.</p>`,
    creatures: () => { const C = ART.creatureSets.deep; return [
      [C.slug.walk0.r, "SPARK slug", "A fat, glowing sea slug, where SPARK comes from. Harmless; it bumps you. Jump on one to squash it flat for a while."],
      [C.splicer.walk0.r, "Masked splicer", "An otter in a party mask who drank too much SPARK. Cackles when it sees you, then charges. One shot."],
      [C.thug.walk0.r, "Thug", "A big splicer with a lead pipe. Deadly to touch, and it takes four shots."],
      [C.bigbrass.a.r, "Big Brass", "A walking diving suit, guarding the Little Ones. Can't be hurt. It shoves."],
      [C.leadhead.a.r, "Leadhead", "A splicer in a fedora behind a bar, firing along the floor. Can't be hurt either."],
      [C.crab.walk0.r, "Hermit crab", "Minds its own business. Harmless."],
      [C.drone.walk0.r, "Security drone", "A little brass ball with a propeller. It flies straight at you. Two shots."],
      [C.gulper.walk0.r, "The gulper", "Down in the deep. Don't."],
    ]; },
    items: () => { const I = ART.itemSets.deep; return [
      [I.items.fish, "Silver dollars, sardines, pearls, records, pocket watches, a jewelled egg", "100, 200, 500, 1000, 2000 and 5000 points. An extra life at 20,000, then 40,000, 80,000 and so on."],
      [I.items.ammo, "SPARK hypo", "Five shots for the raygun, glowing pink."],
      [I.items.life, "Poom bobblehead", "An extra life. Even down here. Especially down here."],
      [I.gems[0], "Keycards", "Open the city's door of the same colour, in this level."],
      [I.npc[0], "Little Ones", "Eight of them, lost in the city. Reach one to send her home."],
    ]; },
    places: {
      E02: "The Kelp Steps", E04: "The Coral Maze", E06: "The Sunken Arboretum", E08: "The Oyster Beds", E10: "The Phantom Pavilion", E16: "The Trench", E18: "The Deep",
      E03: "The Grand Promenade", E05: "The Neptune Theatre", E07: "The Hotel Fathom", E11: "The Market Arcade", E17: "The Drowned Ballroom",
      E09: "The Slug Farm", E12: "The Pumping Station", E13: "The Foundry", E14: "The Pressure Labs", E15: "Fathom's Vault",
    },
    signs: {
      E06: `<b>An audio diary</b><br><br><i>"Augustus Fathom. They told me a city at the bottom of the sea was impossible. I said: no landlords, no lifeguards, no limits. Now the glass weeps, the SPARK has gone to everyone's heads, and somebody has painted a moustache on my statue. Lock the gates."</i>`,
      E07: "A leap of faith...",
      E08: `<b>An audio diary</b><br><br><i>"This is Raptura Radio, signing off. The pressure's getting to the transmitter, and to me. I'm taking my dial somewhere higher up, where a signal carries. Keep listening, sugar."</i><br><br>The voice sounds awfully familiar.`,
      E15: `<b>An audio diary, in a gold case</b><br><br><i>"Fathom again. A gentleman came today, grey and black and terribly polite, and bought every drop of SPARK in the vault. Paid in gold. Asked after a puma. I did not care for his smile."</i>`,
    },
    say: {
      signNear: () => "An audio diary. Press ↑ to play it.",
      noPogo: "No pogo stick. Not yet.",
      warpDoor: "A porthole hatch. Press ↑ to go through.",
      socket: c => `A ${c} brass lock. A ${c} keycard goes here.`,
      noAmmo: "Click. The raygun's dry. Look for SPARK hypos.",
      lockedDoor: c => c ? `A ${c} bulkhead. It wants a ${c} keycard.` : "A locked bulkhead. It wants a keycard.",
      pulseNear: "Steam, sugar. It comes and goes, and when it's on it'll shove you right back out. When it flickers it's coming back: wait for it to drop, then run.",
      ammo: "<b>SPARK hypo!</b> Five shots for the raygun, glowing pink. Fire with <kbd>Space</kbd> or <kbd>C</kbd>.",
      pogo: "<b>You found a pogo stick!</b><br><br>Press <kbd>Alt</kbd> or <kbd>X</kbd> to hop on and off. Hold <kbd>Ctrl</kbd> or <kbd>Z</kbd> as you land for a big bounce.",
      swim: "<b>A diving suit!</b><br><br>Brass, watertight, and only a little bit haunted. On the map, Poom can swim the deep water now.",
      bossDown: null,
      rescueName: "Little Ones",
      rescued: (k, of) => k === of ? "<b>That's the last of the Little Ones!</b><br><br>She climbs into the bathysphere with the other seven, clutching her jar." : `<b>A Little One, safe!</b><br><br>She climbs into the bathysphere with her jar and waves. ${k} of ${of} rescued.`,
      wayOpens: "Somewhere in Raptura, a bulkhead grinds open.",
      lostLife: n => n === 0 ? "Poom comes to in a Revival Booth, coughing up seawater.<br><br><b>This is your last life.</b>" : `Poom comes to in a Revival Booth, coughing up seawater.<br><br>${n} ${n === 1 ? "life" : "lives"} left.`,
      water: "Deep water. Poom needs a diving suit.",
      blocked: "A fallen bulkhead blocks the way. Clear the places nearby.",
      levelDone: name => `${name}: cleared.`,
      cheatOn: "Auntie Static: <i>\"Would you kindly be invincible? Thank you, sugar.\"</i> Infinite lives and energy. No high scores this game.",
      cheatOff: "Auntie Static: <i>\"Back to being careful, then.\"</i> Cheat mode off.",
      raygun: n => `${n} shot${n === 1 ? "" : "s"}`,
      gameOver: n => `<b>Game over.</b><br><br>Raptura keeps another one. Commander Poom is out of lives. Final score: ${n}.`,
      highScore: n => `<b>A high score!</b><br><br>${n} points. Sir Augustus would like your name, for the city register.`,
    },
    scores: [["Junk Baron Cal", 20000], ["Sir Augustus", 17500], ["Auntie Static", 15000], ["Big Brass", 10000], ["Little One #8", 7500], ["Leadhead", 5000], ["SPARK slug", 2500]],
    boot: ["256 colours: ok", "depth gauge: 2,400 ft"],
    /* the pages played when the eighth Little One is safe */
    ending: (score, next) => [
      "The bathysphere rises, eight Little Ones pressed to its portholes, out of the dark and up into the green and then the blue.",
      "At the lighthouse they blink at the sun. Poom finds the Catamaran where he left it, bobbing at the jetty.",
      "Far out, the sea boils. The black Catamaran breaks the surface, glowing pink to its rivets with SPARK, and goes straight up into the sky. A grey-black panther at the helm doesn't even look back.",
      "The radio crackles. <i>\"He's got power to burn now, sugar. Best keep up.\"</i>",
      `<b>The End</b> of Book Four: Descent into Raptura.<br><br>${next ? `Score so far: ${score}.<br><br>On to Book ${next}.` : `Final score: ${score}.<br><br>Commander Poom will return.`}`,
    ],
  },  /* Book 5, set A: TERMINUS, the machine's station (docs/story/book-5-story.md) */
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
};
/* the words the help and the game's talk use: the book being played's, or,
 * if it has none yet, those of the book whose theme it wears. A book's
 * places, signs and ending are its own and never borrowed */
const textBook = () => BOOK_TEXT[themeBook()] || BOOK_TEXT[themeHome()];
/* a line of the game's own talk, in the current book's words: its say[key]
 * (text, or a function of args) if it has one, else the original's */
function say(key, original, ...args) {
  const B = textBook(), v = B && B.say && B.say[key];
  return v === undefined ? (typeof original === "function" ? original(...args) : original) : typeof v === "function" ? v(...args) : v;
}

const MODES = "<p>A new game asks how you want to play.</p><p><b>Classic</b> is the game as it was made: four lives, more for points and plush Pooms, and when they're gone it's game over.</p><p><b>Arcade</b> never runs out. Lose a life and Poom picks himself up near where he fell, still holding the keycards and everything else he found in the level, and blinks for a moment while nothing can hurt him. Arcade games don't go on the high-score table.</p>";
function openHelp() {
  const B = textBook();
  if (B) return page("Help", [
    ["Story", B.story],
    ["Controls", CONTROLS.replace(/<p>On the map[\s\S]*?<\/p>/, B.map)],
    ["Classic and Arcade", MODES],
    ["Creatures", spriteRow(B.creatures())],
    ["Items", spriteRow(B.items())],
    ["About", aboutText()],
  ]);
  page("Help", [
    ["Story", STORY],
    ["Controls", CONTROLS],
    ["Classic and Arcade", MODES],
    ["Creatures", spriteRow([
      [ART.mousel.walk0.r, "Mousel", "Harmless, nosy, and pushy. Jump on one to bop it for a while."],
      [ART.barker.walk0.r, "Barker", "Charges the moment it sees you. Don't be there. One shot."],
      [ART.roombot.a.r, "Roombot", "Can't be hurt. It shoves you, preferably off something."],
      [ART.tank.a.r, "Clawtank", "Can't be hurt either. Fires hairballs straight ahead."],
      [ART.vac.walk0.r, "Vacuumoid", "The thieves. Deadly to touch, and it takes three shots."],
    ])],
    ["Items", spriteRow([
      [ART.items.fish, "Fish, milk, yarn, catnip, trophy", "100, 200, 500, 1000 and 5000 points. An extra life at 20,000, then 40,000, 80,000 and so on."],
      [ART.items.ammo, "Raygun charge", "Five shots."],
      [ART.items.life, "Plush Poom", "An extra life."],
      [ART.gems[0], "Keycards", "Open the door of the same colour, for this level."],
      [ART.parts[0], "Ship parts", "Four of them. The whole point."],
    ])],
    ["About", aboutText()],
  ]);
}

const aboutText = () => `<p>A love letter to Commander Keen and a growing list of mashups.</p>
<p class="credit gk-credit">Built by <a href="https://greykit.com/" target="_blank" rel="noopener">greykit.com</a></p>`;

function openSettings() {
  menu("Settings", [
    { label: "Sound", key: "M", meta: audio.muted ? "off" : "on", act: () => { toggleMute(); UI.pop(); openSettings(); } },
    { label: "Game speed", key: "G", meta: SPEEDS[speed].label, act: () => { cycleSpeed(); UI.pop(); openSettings(); } },
    "gap",
    { label: "Forget everything", key: "F", act: () => ask("Forget your saved game, high scores and settings? This cannot be undone.", "Forget everything", forgetEverything) },
  ], { onBack: () => UI.pop(), footer: "Forget everything clears only what Commander Poom keeps in this browser." });
}

const DEFAULT_SCORES = [
  ["Grandma Puma", 20000], ["Mousel #7", 15000], ["Mr. Whiskers", 10000], ["Roombot", 7500], ["The Hose", 5000], ["Barky", 2500], ["Poom's Mom", 1000],
];
/* until there are real scores, the table is the current book's cast */
function scores() { const B = textBook(); return store.get(KEYS.scores, null) || ((B && B.scores) || DEFAULT_SCORES).slice(); }
function openScores(highlight = -1, then = null) {
  const list = scores();
  const rows = list.map(([n, s], i) => `<tr${i === highlight ? ' class="me"' : ""}><td>${i + 1}.</td><td>${escapeHTML(n)}</td><td class="num">${s}</td></tr>`).join("");
  page("High scores", [["", `<table class="scores">${rows}</table>`]], then ? { onBack: () => { UI.pop(); then(); } } : {});
}
const escapeHTML = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function enterName(score, then) {
  const wrap = el("div", "overlay"), box = el("div", "box msg");
  box.appendChild(el("p", null, say("highScore", n => `<b>A high score!</b><br><br>${n} points. Your name?`, score)));
  const input = el("input"); input.maxLength = 14; input.value = store.get(NS + "_name_v1", "") || "";
  input.setAttribute("aria-label", "Your name");
  box.appendChild(input);
  box.appendChild(el("p", "hint", "Enter to save"));
  wrap.appendChild(box);
  UI.push({ el: wrap, focus() { input.focus(); input.select(); }, key(ev) {
    if (ev.code === "Enter" && !ev.repeat) { ev.preventDefault(); const n = input.value.trim() || "Poom"; store.set(NS + "_name_v1", n); UI.pop(); then(n); }
  } });
}

/* A score onto the table. A run is recorded at the end of each Book as well
 * as at the end of the game, so it keeps its place: an entry carries the
 * run's id, and the run's next score replaces it rather than adding a
 * second line for the same game. */
function recordScore(score, done) {
  const run = G.run;
  if (run && (run.cheated || run.arcade)) { done(-1); return; }
  const list = scores(), sort = () => list.sort((a, b) => b[1] - a[1]);
  const mine = run && run.scoreId ? list.findIndex(e => e[2] === run.scoreId) : -1;
  if (mine >= 0) {
    list[mine][1] = Math.max(list[mine][1], score); sort();
    store.set(KEYS.scores, list);
    done(list.findIndex(e => e[2] === run.scoreId));
    return;
  }
  if (score <= list[list.length - 1][1]) { done(-1); return; }
  enterName(score, name => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    list.push([name, score, id]); sort(); list.length = 7;
    store.set(KEYS.scores, list);
    if (run) run.scoreId = id;
    done(list.findIndex(e => e[2] === id));
  });
}

/* ------------------------------------------------------------------ */
/* title, story, game over, the end                                       */

function openTitle() {
  UI.clear();
  dressFor(themeBook());
  G.mode = "title"; G.lv = null; mapLabel(""); document.getElementById("keystrip").hidden = true;
  const saved = store.get(KEYS.save, null);
  showLogo();
  const items = [
    saved ? { label: "Continue game", key: "R", meta: `score ${saved.score}`, act: () => { UI.clear(); hideLogo(); G.run = saved; enterMap(); } } : null,
    { label: "New game", key: "N", act: () => {
      const go = () => chooseBook();
      if (saved) ask("Start a new game? Your saved game will be lost.", "New game", go); else go();
    } },
    { label: "High scores", key: "O", act: () => openScores() },
    "gap",
    { label: "Settings", key: "S", act: () => openSettings() },
    { label: "Help", key: "?", act: () => openHelp() },
    { label: "About", key: "A", act: () => page("About", [["", aboutText()]]) },
  ].filter(Boolean);
  menu("", items, { cls: "title", footer: '<span class="gk-credit">Built by <a href="https://greykit.com/" target="_blank" rel="noopener">greykit.com</a></span>' });
}
/* New game: which Book? The first five, by name; the ones not built yet
 * greyed out. Choosing one starts a fresh game there, dressed as that Book,
 * with its story. */
function chooseBook() {
  const items = BOOK_IDS.slice(0, 5).map((b, i) => ({
    label: `${i + 1}. ${BOOK_NAMES[b] || "Book " + (i + 1)}`, key: String(i + 1),
    disabled: !BOOK_PLAYABLE.has(b),
    act: () => chooseMode(b),
  }));
  menu("Choose a book", items, { onBack: () => UI.pop(), cls: "books" });
}
/* Classic, the game as it was made: four lives, and game over. Arcade:
 * lives without end, picking himself up near where he fell; no high
 * scores */
function chooseMode(b) {
  menu("How do you want to play?", [
    { label: "Classic", key: "C", meta: "4 lives", act: () => startBook(b, false) },
    { label: "Arcade", key: "A", meta: "endless lives", act: () => startBook(b, true) },
  ], { onBack: () => UI.pop(), cls: "books", footer: "<b>Classic</b>: four lives; lose them all and it's game over.<br><b>Arcade</b>: lose a life and Poom gets up again nearby, keeping what he's found. No high scores." });
}
function startBook(b, arcade = false) {
  UI.clear(); hideLogo();
  G.run = newRun(); G.run.book = b; G.run.arcade = arcade; G.map = { t: 0, p: null }; mapLabel("");
  store.del(KEYS.save);
  dressFor(b);
  story();
}

/* The logo: the title screen's, with its episode line, and a level's title
 * card, with the level's name, which fades after a moment. Nothing keeps
 * it up over play: frame() fades it if it's left showing. */
const logoEl = () => document.getElementById("logo");
let logoTimer = null;
function showLogo(line = theme.subtitle) {
  clearTimeout(logoTimer); logoTimer = null;
  const el = logoEl();
  el.querySelector(".ep").textContent = line;
  el.classList.remove("fading", "level");
  el.hidden = false;
}
function hideLogo() { clearTimeout(logoTimer); logoTimer = null; logoEl().hidden = true; logoEl().classList.remove("fading"); }
function fadeLogo(after = 0) {
  clearTimeout(logoTimer);
  logoTimer = setTimeout(() => {
    logoEl().classList.add("fading");
    logoTimer = setTimeout(hideLogo, 1000);
  }, after);
}
function levelTitle(name) { showLogo(name); logoEl().classList.add("level"); fadeLogo(2000); }

function story() {
  G.mode = "story";
  bookIntro(textBook(), () => { enterMap(); saveRun(); });
}
/* A book's story pages, then its first word on the map: at a new game, and
 * when the run moves on to the next book. A page count, and Esc skips to
 * the map: the Help keeps the story. */
function bookIntro(B, toMap) {
  const pages = (B ? B.story : STORY).split("</p>").map(s => s.replace("<p>", "").trim()).filter(Boolean);
  let i = 0;
  const arrive = () => { toMap(); message(B ? B.arrive : "This is Planet Hiss. Walk to a level and press <kbd>Ctrl</kbd>, <kbd>Z</kbd> or <kbd>Space</kbd> to go in.<br><br><kbd>Esc</kbd> pauses; <kbd>Enter</kbd> shows your status."); };
  const next = () => {
    if (i >= pages.length) { arrive(); return; }
    message(pages[i++], { onClose: next, onSkip: arrive, hint: `${i} of ${pages.length} &middot; any key &middot; <kbd>Esc</kbd> skips` });
  };
  next();
}

function gameOver(trapped = false) {
  G.mode = "title";
  const score = G.run.score;
  store.del(KEYS.save);
  sfx("die");
  message(trapped ? `<b>Game over.</b><br><br>Final score: ${score}.` : say("gameOver", n => `<b>Game over.</b><br><br>Commander Poom is out of lives. Final score: ${n}.`, score), { onClose: () => recordScore(score, i => { openTitle(); if (i >= 0) openScores(i); }) });
}

function ending() {
  G.mode = "ending";
  sfx("done");
  const r = G.run;
  addScore(10000);
  /* the last book played ends the game in its own words, bonus included */
  const own = BOOK_TEXT[r.book] && BOOK_TEXT[r.book].ending;
  /* the last Book's own ending if it has one; if not, a plain one: the
     original game's pages (Planet Hiss, the Laser Pointer) only make sense
     for a game still wearing its classic look */
  const pages = own ? own(r.score, null) : theme.name !== "classic" ? [
    `<b>Book ${bookNumber(r.book)} is done, and that's the last of them.</b><br><br>Commander Poom points the Catamaran home at last. Bonus: 10,000 points.`,
    `<b>The End.</b><br><br>Final score: ${r.score}.<br><br>Commander Poom will return.`,
  ] : [
    "<b>The Catamaran is whole again.</b><br><br>Poom bolts in the Laser Pointer, spins up the Yarn Drive, and Planet Hiss falls away beneath him. Bonus: 10,000 points.",
    "He lands in the back yard with a soft <i>thump</i>, hides the ship behind the shed, and is in bed, eyes shut, when the front door opens.",
    "\"Was he good?\" his mom asks the babysitter. \"Purrfect,\" says the babysitter.<br><br>From the hall closet comes a faint, hungry whirr...",
    `<b>The End</b> of Episode One.<br><br>Final score: ${r.score}.<br><br>Commander Poom will return.`,
  ];
  playPages(pages, () => { store.del(KEYS.save); recordScore(r.score, k => { openTitle(); if (k >= 0) openScores(k); }); });
}

/* ------------------------------------------------------------------ */
/* touch controls                                                        */

function setupTouch() {
  const pad = document.getElementById("touch");
  if (!("ontouchstart" in window) && !navigator.maxTouchPoints) return;
  pad.hidden = false;
  for (const b of pad.querySelectorAll("[data-a]")) {
    const a = b.dataset.a;
    const on = ev => { ev.preventDefault(); audio.unlock();
      if (UI.top()) { UI.padPress(a); return; }
      if (a === "pause") { openPause(); return; }
      if (a === "status") { statusWindow(); return; }
      touchHeld.add(a); pressed.add(a); b.classList.add("on"); };
    const off = ev => { ev.preventDefault(); touchHeld.delete(a); b.classList.remove("on"); };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("pointerleave", off);
  }
}

/* ------------------------------------------------------------------ */
/* the loop                                                              */

function fit() {
  const pad = document.getElementById("touch").hidden ? 0 : 0;
  const s0 = Math.min(innerWidth / W, (innerHeight - pad) / H);
  const si = Math.floor(s0);
  const s = si >= 2 && si / s0 > 0.8 ? si : s0;
  stage.style.width = W * s + "px"; stage.style.height = H * s + "px";
  uiRoot.style.transform = `scale(${s})`;
}
addEventListener("resize", fit);

let acc = 0, last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  acc += Math.min(100, now - last); last = now;
  pollPad();
  while (acc >= STEP) {
    acc -= STEP;
    G.t++;
    geigerTick();
    if (!UI.top()) {
      if (wasPressed("mute")) toggleMute();
      if (G.mode === "level" || G.mode === "map") {
        if (wasPressed("pause") && canPause()) openPause();
        else if (wasPressed("status")) statusWindow();
      }
      if (!UI.top()) {
        if (G.mode === "level") updateLevel();
        else if (G.mode === "map") updateMap();
      }
    }
    pressed.clear();
  }
  if ((G.mode === "level" || G.mode === "map") && !logoEl().hidden && !logoEl().classList.contains("fading") && !logoTimer) fadeLogo(0);
  if (G.mode === "level" && G.lv) drawLevel();
  else if (G.mode === "map" || (G.mode === "story" && G.map.p) || G.mode === "ending") { if (G.map.p) drawMap(); else drawTitleScene(G.t); }
  else drawTitleScene(G.t);
}

function boot() {
  buildArt();
  const classicMap = paintMapTiles();
  mapArtSets = { classic: classicMap, wasteland: paintWasteMap(classicMap), thrum: paintThrumMap(classicMap) };
  for (const [name, paint] of Object.entries(MAP_PAINTERS)) mapArtSets[name] = paint(classicMap);
  mapArt = classicMap;
  G.map = { t: 0, p: null };
  injectTitleCSS();
  const B = BOOK_TEXT[themeBook()];
  const run = runBoot({ lines: [bootReloadLine(), ...((B && B.boot) || ["sixteen colours: ok", "pc speaker: ok"])] });
  fit();
  setupTouch();
  syncSoundButton();
  document.getElementById("snd").addEventListener("click", () => { audio.unlock(); toggleMute(); });

  /* debug: ?level=A02 drops straight into a level with everything; ?book=B
   * onto that book's map */
  const q = new URLSearchParams(location.search);
  const lvq = (q.get("level") || "").toUpperCase(), bq = (q.get("book") || "").toUpperCase();
  if (MAPS[lvq] || WORLDS[bq]) {
    run.cancel();
    hideLogo();
    G.run = newRun(); G.run.ammo = 50;
    G.run.book = MAPS[lvq] ? MAPS[lvq].book : bq;
    G.map.p = null;
    enterMap();
    if (MAPS[lvq]) startLevel(lvq);
  } else {
    openTitle();
    const saved = store.get(KEYS.save, null);
    run.finish([saved ? `game in progress: score ${saved.score}` : "no game in progress"]);
  }
  requestAnimationFrame(frame);
}

boot();
