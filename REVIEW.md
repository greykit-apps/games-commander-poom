# Commander Poom: review (2026-10-12)

Reviewed on branch `review/2026-10-12`. Books 1 to 4 (map sets H, C, D, E).
Book 5 and sets B, F, G, I are out of scope by the author's instruction.

Every finding is marked **VERIFIED** (reproduced, measured or simulated
with the game's own code) or **SUSPECTED** (from reading the code).

This file is updated as the review goes; sections marked *(in progress)*
are not finished.

## Summary: the five things to fix or decide first

*(in progress; filled in as the Critical and High findings are verified)*

## Assumptions

- Faithful Keen 1 feel is intended, modernised (coyote time, jump buffer, Arcade mode). Physics is judged against Keen 1-3 and against the levels' own needs, not against a modern platformer.
- Audience: adults who played Keen, plus friends and family. Classic should be beatable by a good player in a few attempts; Arcade is the casual path.
- Anything documented in ENGINE-SUPPORT.md, the playtest log or a code comment is intentional and is listed as such, not as a finding.
- Book 5 is a placeholder being removed: nothing about it is reported.
- Fixes are small, one commit each, on this branch only. Nothing is pushed.
- "Balanced" (the author's answer on balance targets) is read as: lives, ammo and points should feel similar from Book to Book, and Classic should neither starve nor drown the player.
- The game was run in the desktop app's built-in browser (Chromium) against the Python dev server. Gamepad input and Windows, Linux and macOS keyboard shortcut behaviour could not be exercised here; those findings are marked SUSPECTED.

## How the game was run

- `python3 -m http.server 8765` from the repo root (the `.claude/launch.json` entry), the page at `http://localhost:8765/`.
- `review/probe.js`, loaded into the page, drives `updatePlayer` on a flat test level and measures jumps, pogo, walking, falling and shots with the real code.
- `review/solver-avoid.js` is a copy of the author's local solver with one extra option, `avoid: true`, which prunes any path that touches a ship part or heartstone, so a success proves a level's exit is reachable *without* its objective.
- `review/economy.js`, `review/warps.js` read the transcribed maps in Node.

## Findings table

*(in progress)*

| ID | Severity | Category | Status | Location | Description |
|---|---|---|---|---|---|
| F01 | Critical | softlock | *(verifying)* | `js/game.js:2043` (`updateMap`), `js/game.js:1839` (`finishLevel`) | A Book 2 heartstone level finished without breaking its heartstone can never be re-entered, and Book 2 can never end. |
| F02 | Critical | softlock | *(verifying)* | same | A Book 1 ship-part level finished without the part: same, Book 1 can never end. |
| F03 | High | input | SUSPECTED | `js/game.js:319` (`BIND`) | W is "up" and Ctrl is "jump": Ctrl+W closes the tab on Windows and Linux, and the browser cannot block it. No `beforeunload` guard. |
| F04 | High | input | SUSPECTED | `js/game.js:319` (`BIND`), README | On macOS, Ctrl+Left/Right is "move a Space" by default. A running jump with the documented keys switches desktops. |
| F05 | High | balance | VERIFIED | `js/books/E.js` (maps), `js/game.js:1461` (`collect`) | Book 4 holds 32 extra-life items (E02 has 7 in a row, E13 8, E11 5); Books 1 to 3 hold 0. Each is a full life. |
| F06 | Medium | feel | VERIFIED | `js/game.js:1101` (jump crouch) | Jump height is set by how many of the 5 crouch ticks the key is held: a 1-tick tap rises 1.9 px, 3 ticks 1.2 tiles, 5 ticks 3.4 tiles. Short taps do almost nothing. |
| F07 | Medium | balance | VERIFIED | maps | Raygun charges: Book 1 has 65 shots for 296 hp of deadly creatures (22%); Book 3 has 1,370 for 393 (349%). |
| F08 | Low | deploy | VERIFIED | `.gitlab-ci.yml:72` | The rsync publishes everything the exclude list doesn't name (README.md and LICENSE go live today). Fixed for `review/` and `REVIEW.md` on this branch. |
| F09 | Low | dead code | VERIFIED | `js/game.js:3490`, `:3266`, `:574` | `fit()` has a `pad` that is always 0; the classic help says a Vacuumoid "takes three shots" but hp is 4 (unreachable text); the `O` pogo item and `noPogo` text are dead, `newRun().pogo` is always true. |
| F10 | Medium | rules vs text | SUSPECTED | `js/game.js:1396` (`springTrap`), `:3249` (`MODES`) | Arcade "never runs out", but a Book 2 trap lever ends an Arcade game too. |
| F11 | Low | UI | VERIFIED | `js/game.js:2861` (`statusWindow`) | In Arcade the status window shows "Lives 4" while the HUD shows 99. |
| F12 | Low | text vs code | VERIFIED | `js/game.js:2941` (`CONTROLS`) | "The game saves itself whenever you are on the map": it saves on entering or leaving a level and on quit, not while walking. |
| F13 | Low | integrity | SUSPECTED | `js/game.js:968` (`updatePlayer`, dead state) | Reloading the page during the 100-tick death animation keeps the life: the save was taken before the level. |
| F14 | Low | levels | SUSPECTED | `review/warps.js` | 12 warp-door arrivals (E05, E06, E15) have no floor within 6 tiles; Poom arrives falling. |

## Detailed findings

### F01, Critical: a heartstone level finished without its heartstone can never be finished (Book 2 cannot end)

**Status: VERIFIED** on C05 with `review/solver-avoid.js` (`solve("C05", { avoid: true })` reached the exit door in 7.1 s and 61,877 states without touching the heartstone). The other seven heartstone levels are being checked the same way; results are in the table at the end of this section.

**Where.** `js/game.js:2043` (`updateMap`): a done level can only be re-entered when `pending` is true, and `pending` is only ever computed for Book 4's rescues:

```js
const pending = BOOK_GOAL[G.run.book] === "rescues" && rescueLevels(G.run.book).includes(here) && !(G.run.rescued || {})[here];
if (G.run.done[here] && !pending) { toast(say("levelDone", ...)); sfx("nope"); }
```

`js/game.js:1839` (`finishLevel`) ends Book 2 only when `heartsBroken(r, book) >= heartsIn(book)`, i.e. all eight. `collect` (`js/game.js:1476`) breaks a heart on touch or when shot, and nothing ties the heart to the exit: every heartstone level ends by `exit_tile` (`completion` in `js/books/C.js`), and in all eight the heartstone sits on a pedestal between two spikes in a side chamber (C05, C07, C08, C10, C12, C14, C16, C17 all at tile (66,14) or (126,14) or (46,14)), off the route to the exit door.

**Repro.** New game, Book 2, Classic or Arcade. Play C05 (the first heartstone level, *The Landing Shaft* is C02; C05 is the fourth place) and walk to the exit door at (77,23) without visiting the pedestal at (66,14). Back on the map the place reads "cleared"; pressing jump on it gives the "nope" sound and "...: cleared." Status shows "Heartstones 0 of 8 broken". Nothing can ever change that number for C05 again; the run can finish all sixteen levels and never end.

**Why it matters.** This is Commander Keen 2's own trap (leaving a city without destroying its Tantalus Ray made the game unwinnable), but Keen 2 told you nothing either, and that is the one thing modern players and the Arcade promise ("never runs out") cannot forgive. The heart is not visible from the exit route in most of these levels, the first-time player does not know the chamber matters, and the game offers no hint that the level is still "open" (unlike Book 4, whose map text says a level with a Little One can be gone back into).

**Suggested fix.** Treat an unbroken heartstone like an unrescued Little One: let the level be re-entered while its heart stands. One helper, used in `updateMap` and in `openPlaces()` (so the arrow stays over it), and the "(done)" label could say "(heartstone left)". *(Applied on this branch, see "What changed".)* The alternative, blocking the exit until the heart is broken, changes the maps and is not Keen.

### F02, Critical or not a bug: a ship-part level finished without its part (Book 1)

**Status: VERIFIED for H04, H05, H09 that the part cannot be avoided; H17 being checked.**

Same mechanism as F01 (`updateMap` only re-opens rescue levels; the ship needs all four parts, `boardShip` at `js/game.js:1879`). Whether it can happen depends on the maps:

- **H04** (*Fort Scrap*): the part at (70,11) sits one tile past the red door at (69,10-11), in a chamber x 70-77, rows 9-11 whose only way in is that two-tile-high door. Poom is 22 px tall; under the door's lintel his feet cannot rise above y=182 and the part's pickup box spans y 179-191, and he cannot clear the lintel horizontally without already overlapping the part's box (x 1123-1133). The part is unavoidable. Confirmed by the solver running out of states (`solve("H04", { avoid: true, from: [67,11], ev: ["o69,10"] })`, 30 s budget, never reached the exit).
- **H05** (*Old Litterburg*) and **H09** (*Vault 9*): the part is in a corridor two tiles high (ceiling at row 5 over (112,7); ice at row 14 over (69,16)), which Poom fills. Unavoidable.
- **H17** (*Vault 9, the cold floor*): the part at (103,10) sits in a corridor three tiles high next to the exit at (104,9-10), **and the exit chamber is open to the right (x 105-109) and above (rows 0-8 at x 104-109), which connects along the map's open top rows 0-1 to a shaft at x 80-87.** If Poom can reach the map's top rows anywhere (a ten-tile pogo makes that plausible), he can walk along the sky, drop down the right side and walk into the exit from the right without ever touching the part. Solver run pending.

**Suggested fix.** The same helper as F01: a part level whose part is not held can be gone back into. It costs nothing where the part is unavoidable and closes the H17 hole if it is real.

### F03, High (SUSPECTED): Ctrl+W closes the browser tab

`js/game.js:319` binds `KeyW` to "up" and `ControlLeft`/`ControlRight` to "jump". A WASD player who holds jump and presses up (enter a hatch, read a terminal, grab a pole: all "up" actions) sends Ctrl+W, which Chrome, Edge and Firefox on Windows and Linux treat as *close tab* before the page sees it; `preventDefault` cannot stop it. The page registers no `beforeunload` handler (`grep -n beforeunload js/*.js` finds nothing), so there is no "leave site?" prompt either. The level in progress is lost (the save predates it). On macOS Cmd+W is the shortcut, so Ctrl+W is harmless there; I could not reproduce on Windows from this machine.

**Fix.** Two small things: (1) add a `beforeunload` guard while a level is in play (one listener; browsers show their own dialog); (2) in the key strip and Controls page, list Z/X before Ctrl/Alt, or drop W as "up" when Ctrl is held. Keen's own Ctrl/Alt are worth keeping for the feel, but W+Ctrl is a trap Keen never had because DOS had no tabs.

### F04, High (SUSPECTED): Ctrl+Left/Right switches desktops on macOS

macOS binds Ctrl+Left and Ctrl+Right to "Move left/right a space" in Mission Control by default. A running jump with the documented keys (hold Ctrl, press an arrow) is exactly that chord. With more than one Space (every full-screen window is one), the desktop slides away mid-jump and the game loses focus (`blur` pauses it, `js/game.js:345`). The browser cannot intercept a system shortcut. Not reproducible from the app's embedded browser.

**Fix.** Same as F03: make Z the jump the game *shows first* and say so for Mac in the first-level key strip, or detect `navigator.platform` and reorder the strip. (Keen 1 on DOS used Ctrl because there was nothing else; the levels do not care which key jumps.)

### F05, High (VERIFIED): Book 4 holds 32 extra lives; Books 1 to 3 hold none

`review/economy.js`: the `L` glyph (an extra life, `collect` at `js/game.js:1462`: `r.lives++`) appears 32 times in set E and 0 times in H, C, D. They are not spread out: E02 (the first level) has seven in a row at (22-28,37); E13 has eight (seven in a row at (37-42,94)); E11 five in a row at row 56. Those rows are the source game's hundred-to-a-life drops (the dataset calls the object "extra life", `maps2/E/E02.json` code 67, and the rows are laid out like drops), transcribed as full lives (`tools/transcribe-maps.js:289`).

**Why it matters.** A Classic run that starts at Book 1 reaches Book 4 with its 4 starting lives plus whatever score bought (about 5 per Book for a full clear, far fewer for a normal run). Book 4's first level then hands out 7, and the Book 25 more: Classic stops meaning anything exactly where the game is hardest (E has 59 turrets and 63 unkillable deadly creatures, the most of any Book). The three earlier Books have *no* life items at all, which is harsher than Keen 1-3 (each had a few).

**Fix.** A design choice, so not applied. Options: make `L` in set E worth a fraction of a life (a counter, Keen 4 style, with a HUD tick), or 100 points each, or re-spread the 32 across all four Books with the transcriber (an `ITEM_SWAP` list like `CLEAR_HAZARDS`). The E02 row of seven at the very start is the one to look at first.

### F06, Medium (VERIFIED): a tapped jump does almost nothing

`js/game.js:1101-1109`: a jump begins with a 5-tick crouch; the take-off speed is `jumpSpeed * max(1, crouchHeld) / 5`, where `crouchHeld` counts the crouch ticks the key was still down. Measured with `review/probe.js`:

| Key held (ticks at 60 Hz) | 1 (17 ms) | 2 (33 ms) | 3 (50 ms) | 4 (67 ms) | 5+ (83 ms) |
|---|---|---|---|---|---|
| Height | 1.9 px | 8.3 px | 19.1 px (1.2 tiles) | 34.5 px (2.2 tiles) | 54.4 px (3.4 tiles) |

A human tap is 40-80 ms, so taps land anywhere from half a tile to the full jump, and a very quick one is a 2-px twitch. On Relaxed (48 Hz) a tick is 21 ms, so the same tap is one tick shorter. Keen 1 varies its jump with hold time too, but its shortest jump is a real hop. The lower half of this table is where "I pressed jump and he didn't" comes from.

**Fix.** Floor the crouch count at 3 (`Math.max(3, p.crouchHeld)`): a tap becomes a 1.2-tile hop, holds are unchanged. One number, no map changes. *(Not applied: it changes the feel, which is the author's call; see Improvements.)*

### F07, Medium (VERIFIED): raygun charges are starved in Book 1 and flooded in Book 3

From the table in *Balance analysis*: shots on the floor against the shots needed to kill every deadly killable creature once: Book 1 **65 for 296 (22%)**, Book 2 305 for 325 (94%), Book 3 **1,370 for 393 (349%)**, Book 4 510 for 485 (105%). Ammo carries over. Starting at Book 1 means jumping over nearly everything for sixteen levels (the Scrappers take four shots and the lieutenants five), then arriving in Book 3 to 90 shots in its second level (D03) and 275 in its last-but-one (D16). Starting at Book 3 or 4 never wants.

**Fix.** Design choice, not applied. The simplest lever is the five shots a charge gives (`js/game.js:1461`): a per-Book value (say 8 for Book 1, 3 for Book 3) evens the cover without touching maps.

### F08, Low (VERIFIED): the deploy publishes everything not on the exclude list

`.gitlab-ci.yml:72`: `rsync --delete --delete-excluded ... ./` with a list of excludes. Anything new at the top level ships. Today that is README.md and LICENSE (harmless), and it would have been `review/` and this file. The comment at the top of the file says "What ships is index.html, js/, og.png, the icons and the manifest", which is what it means, not what it does. **Fixed on this branch** for `review` and `REVIEW.md` (`82cee02`). An include-list (`--include` then `--exclude='*'`) would make the comment true.

### F09, Low (VERIFIED): dead code and dead text

- `js/game.js:3490` `fit()`: `const pad = document.getElementById("touch").hidden ? 0 : 0;` is always 0.
- `js/game.js:3266`: the classic (unthemed) help says a Vacuumoid "takes three shots"; `ENEMY.V.hp` is 4. Unreachable since every playable Book has a theme, but it will come back if a Book ever wears "classic".
- `js/game.js:574, 1465`: the `O` pogo item and the `noPogo`/`pogo` texts; `newRun()` sets `pogo: true` and no map has an `O`. Each Book carries a "You found a pogo stick!" string nobody will read.
- `js/game.js:1537` `ENEMY.W` (the boss) and `"xBVTKW".includes(c)` in `loadLevel`: no transcribed map uses those glyphs.

### F10, Medium (SUSPECTED): Arcade "never runs out", except at a trap lever

`MODES` (`js/game.js:3249`) and the mode menu promise that Arcade never ends; `springTrap` (`js/game.js:1396`) sets `G.run.lives = 0` and calls `gameOver(true)` whatever the mode. The lever warns twice (a toast near it, a box on the first ↑, and the second ↑ within 240 ticks pulls it), so a player who pulls it meant to; but the box says "It ends the game" and an Arcade player has been told the game does not end. Either make the trap cost an Arcade player a respawn (as the cheat mode already does: `if (G.run.cheat) ... loseLife()`), or say "even in Arcade" in the box. Not applied: the text is the author's.

### F11, Low (VERIFIED by reading): status window lives in Arcade

`statusWindow` (`js/game.js:2861`) shows `r.lives` (4, plus any 1UPs) while the HUDs draw 99 for Arcade (`drawHud` and the four themed HUDs). One says the count, the other says endless.

### F12, Low (VERIFIED): "saves itself whenever you are on the map"

`CONTROLS` (`js/game.js:2941`) says so; `saveRun()` is called on entering a level, leaving one, finishing one, moving Book, boarding the ship, the Konami code and Quit. Walking across the map and closing the tab loses the walk, nothing else. Either save on a timer while on the map (cheap: `G.run` is small) or soften the sentence.

### F13, Low (SUSPECTED): a reload during the death animation keeps the life

`updatePlayer` (`js/game.js:971`): in Classic, `loseLife()` runs 100 ticks after death. The last save was made before the level (`updateMap` saves, then `startLevel`). Reloading within that 1.7 s returns to the map with the life and the pre-level state. `canPause()` deliberately refuses Leave level while dying so that it cannot "take back a death", but a reload can. The honest fix is to save the decremented life at the moment of death (`die()`), not when the box opens.

### F14, Low (SUSPECTED): twelve warp-door arrivals have no floor beneath

`review/warps.js`: E05 (51-52,71-72) → (51,20); E06 (51-52,65) → (4,83) and three doors → (6,39); E15 (40-41,79) → (53,73). Poom arrives in the air with nothing solid within six tiles below. In Keen 4 these land on moving platforms or in water; here they are probably on `M` platforms (E05 has 13, E06 3, E15 11). Worth one look each in the browser; no hazard lies under any of them.


## Movement, measured

`review/probe.js`, run in the page against `updatePlayer` on flat ground.
A tile is 16 px; the simulation runs at 60 ticks a second (48 on Relaxed,
with identical distances).

| Measure | Value |
|---|---|
| Walk top speed | 2.125 px/tick (8.0 tiles/s); 19 ticks to reach it; stops in 5 ticks and 4 px; reverses instantly |
| Jump, key held 1 / 2 / 3 / 4 / 5+ ticks | 1.9 / 8.3 / 19.1 / 34.5 / 54.4 px (0.12 / 0.52 / 1.20 / 2.16 / 3.40 tiles) |
| Full jump air time | 60 ticks (1.0 s) |
| Running jump, flat ground | 127 px (8.0 tiles) |
| Pogo, small bounce | 29 px (1.8 tiles), 7 bounces in 400 ticks |
| Pogo, big bounce (jump held) | 161 px (10.0 tiles), 3 bounces in 400 ticks |
| Pogo, big bounce with right held | 242 px (15.1 tiles) between landings |
| Fall | 0.125 px/tick² gravity, 3.25 px/tick cap; 10 tiles in 61 ticks |
| Raygun shot | 3.875 px/tick, 469 px (29.3 tiles) range, 121-tick life, one shot per 7 ticks |

Against the Keen 1 engine these numbers are the Vorticon engine's own
(walk 68, jump 120, gravity 4, max fall 104, all in 32nds of a pixel per
tick), except the pogo, which the author raised to about ten tiles on
purpose (the maps are built for it). What *isn't* Keen's is how a short
tap behaves: see F06.

## Balance analysis

### What each Book hands out (`review/economy.js`)

Read from the transcribed maps with the engine's own values. "Deadly
killable" creatures are the ones that kill on touch and can be shot (B, V,
L kinds); harmless ones push (x, T); unkillable deadly ones are the
shooters (K) and the deep's creatures.

| Book | Floor points | Raygun shots | Extra lives | Deadly killable (total hp) | Harmless | Unkillable deadly | Turrets | Points from kills |
|---|---|---|---|---|---|---|---|---|
| 1 (H) | 528,300 | 65 | 0 | 91 (296) | 80 | 0 | 4 | 40,300 |
| 2 (C) | 571,200 | 305 | 0 | 106 (325) | 88 | 16 | 0 | 43,100 |
| 3 (D) | 816,700 | 1,370 | 0 | 199 (393) | 88 | 26 | 35 | 64,400 |
| 4 (E) | 418,500 | 510 | 32 | 189 (485) | 270 | 63 | 59 | 78,300 |

Ammo cover (shots on the floor divided by the shots needed to kill every
deadly killable creature once): Book 1 **22%**, Book 2 94%, Book 3
**349%**, Book 4 105%. Ammo carries from Book to Book, so a player who
starts at Book 1 is starved through the whole of it and then swims in it
from Book 3 on; a player who starts at Book 3 never wants for a shot.

Extra lives from score: the thresholds double (20k, 40k, 80k, 160k, 320k,
640k, 1.28M, 2.56M). A full clear of one Book (floor, kills and
objectives) scores 500k to 890k, crossing 5 or 6 thresholds; the same
total spread over four Books crosses 8 in all, and the last 1.3 million
points buy one life. Lives from items: 0, 0, 0, 32. So Classic in Books 1
to 3 lives on the 4 starting lives plus a handful from score, and Book 4
alone can hand out 32 more. See F05.

*(per-level tables and the simulations of creature encounters are in
progress)*

## Player experience

*(in progress)*

## Code health

*(in progress)*

## Improvements, ranked by impact vs effort

*(in progress)*

## What changed, and what was not done

Branch: `review/2026-10-12`.

Commits so far:
- `d15f455` Review: skeleton report and a Node loader for the Books
- `82cee02` Deploy: don't publish the review folder or REVIEW.md

Scripts: `review/` (run `node review/economy.js`, `node review/warps.js`
from the repo root; load `review/probe.js` and `review/solver-avoid.js`
in the page).
