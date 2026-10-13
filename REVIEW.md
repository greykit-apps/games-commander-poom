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

*(in progress)*

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
