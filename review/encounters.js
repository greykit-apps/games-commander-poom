/* review/encounters.js: creature timings from the engine's constants
 * (js/game.js: KP, ENEMY, updateEnemy). No randomness is involved in these,
 * so they are computed, not sampled. Run: node review/encounters.js */
const T = 16, HZ = 60;
const KP = { walkMax: 68 / 32, jumpSpeed: 120 / 32, gravity: 4 / 32, shotSpeed: 124 / 32, refire: 7, pogoBig: 6.4 };
const s = t => (t / HZ).toFixed(2) + " s";
const jumpAir = 2 * KP.jumpSpeed / KP.gravity;   /* ticks up and down, flat ground */
console.log("Poom: walk", KP.walkMax, "px/tick; full jump air time", jumpAir, "ticks (" + s(jumpAir) + "), clears 3.4 tiles; one shot per", KP.refire, "ticks");
console.log();
console.log("Chargers (B kind: scrap hound, skitter, claw guard, dog, ninja, splicer, spider, houdini, drone)");
console.log("  sees Poom within 150 px (9.4 tiles) and 24 px of height, facing him and within 130 px; growls 22 ticks (" + s(22) + "), then charges at", 68 / 32, "px/tick (ninja, spider x1.4 =", (68 / 32 * 1.4).toFixed(2) + ") for up to 140 ticks or a ledge");
for (const d of [130, 100, 60, 30]) console.log(`  from ${d} px: reaches Poom ${22 + Math.ceil(d / (68 / 32))} ticks after spotting him (${s(22 + d / (68 / 32))}); a ninja in ${22 + Math.ceil(d / (68 / 32 * 1.4))} (${s(22 + d / (68 / 32 * 1.4))})`);
console.log("  Poom's walk equals a charge: he cannot outrun one on the flat, only jump it or shoot it. A charger is 1 hp (ninja 3, spider and houdini 2): one to three shots, 7 ticks apart.");
console.log();
console.log("Walkers (V and L kinds: scrapper, husk, heavy, thug, gatekeeper; lieutenant, ocelot, brute, rosie)");
console.log("  walk at", 28 / 32, "px/tick toward Poom when within 150 px; jump 90-150 sub-units (2.8-4.7 px/tick) at random, about 4% of ticks after 90 ticks on the ground; deadly to touch");
for (const [name, hp] of [["scrapper/husk/heavy/thug", 4], ["lieutenant/ocelot/brute", 5], ["gatekeeper", 6], ["rosie", 8]]) console.log(`  ${name}: ${hp} shots = ${(hp - 1) * KP.refire} ticks of firing (${s((hp - 1) * KP.refire)}) standing still; it closes ${((hp - 1) * KP.refire * 28 / 32).toFixed(0)} px meanwhile`);
console.log();
console.log("Shooters (K kind: spitter, gunner, Dr Cal, leadhead)");
console.log("  after 130 ticks walking, seeing Poom ahead: aims 30 ticks, fires one shot at", KP.shotSpeed, "px/tick, walks on after 56");
for (const d of [150, 100, 50]) console.log(`  from ${d} px: the shot arrives ${30 + Math.ceil(d / KP.shotSpeed)} ticks after it stops (${s(30 + d / KP.shotSpeed)}); the shot flies at the creature's height + 3 px, 6 px tall: a small hop clears it`);
console.log("  cannot be hurt (hp Infinity); a shot from Poom ricochets");
console.log();
console.log("Turrets (G)");
console.log("  fire every 100 ticks (" + s(100) + ") while Poom is within 220 px across and 160 px up or down; hairball 2.4 px/tick, 6x6 px, dies on rock or after 120 ticks (" + (2.4 * 120) + " px, " + (2.4 * 120 / T).toFixed(0) + " tiles)");
for (const d of [220, 150, 80]) console.log(`  from ${d} px: ${Math.ceil(d / 2.4)} ticks of flight (${s(d / 2.4)})`);
console.log("  E12 has 30 turrets (26 firing down), E13 16, D10 and D13 11 each; each starts at a random phase, so a row of them fires at random moments");
console.log();
console.log("Pushers (x kind) and shovers (T kind) never kill: a mousel pushes 1.4 px/tick for 8 ticks (11 px), a roombot 1.875 px/tick for 14 ticks (26 px). The danger is where the push ends.");
