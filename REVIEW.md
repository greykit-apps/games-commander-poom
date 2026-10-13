# Commander Poom: review (2026-10-12)

Reviewed on branch `review/2026-10-12`. Books 1 to 4 (map sets H, C, D, E).
Book 5 and sets B, F, G, I are out of scope by the author's instruction.

Every finding is marked **VERIFIED** (reproduced, measured or simulated
with the game's own code) or **SUSPECTED** (from reading the code).

The review is complete; the last pass re-verified every Critical and High
finding (the solver runs and the in-page checks named under each).

## Summary: the five things to fix or decide first

1. **Two Books can be lost without a word (F01, F02, Critical, VERIFIED).** Leave a Book 2 heartstone level by its door with the stone standing, or Book 1's last level (H17) by the right-hand side of its exit without the ship part, and the level is "cleared" for good: Book 2 can never end, the Catamaran can never fly. Proven with the game's own physics by the solver on C05, C12, C14 and H17. **Fixed on this branch** (`e12f758`): a done level that still holds a heartstone, a ship part or a Little One stays open, keeps its arrow, and reads "(not finished)". Merge this one even if nothing else.
2. **The documented keys are hazards outside DOS (F03, F04, High, SUSPECTED).** Ctrl is jump and W is up: Ctrl+W closes the tab on Windows and Linux, and no browser lets a page stop it. On macOS Ctrl+Left/Right is "move a Space" by default, so a running jump with the first-listed keys can switch desktops. A `beforeunload` guard is on this branch (`927c06f`); listing Z/X before Ctrl/Alt is a one-line choice for the author.
3. **Lives and raygun charges are not balanced across the Books (F05, F07, High and Medium, VERIFIED from the maps).** Extra-life items: 0, 0, 0, 32 (seven of them in a row in Book 4's first level). Raygun charges against what needs shooting: 22%, 94%, 349%, 105%. A Classic player who starts at Book 1 is starved of both for three Books and then drowned in Book 4. Decide what Book 4's `L` rows are worth (Keen 4 made them drops, a hundred to a life) and what a charge gives per Book.
4. **A tapped jump is a twitch (F06, Medium, VERIFIED).** Jump height is set by how many of the five crouch ticks the key stays down: a 17 ms tap rises 2 px, 50 ms 1.2 tiles, 83 ms the full 3.4 tiles. One number (`Math.max(3, p.crouchHeld)`) gives every tap a real hop. Not applied, because it changes the feel; it is the author's call.
5. **Decide whether a trap lever should end an Arcade game (F10).** Arcade says it never runs out; the Book 2 lever ends it. The cheat mode already turns the trap into a lost life, which is the obvious Arcade rule too.

## Decisions from the author (2026-10-13), and what was done

After the first pass the author answered the five summary items:

1. **Heartstones are keys**: a Book 2 level's exit stays shut until its heartstone is broken. Done (`36cf06b`): `exitSealed(lv)` in `updatePlayer`; Poom is nudged back off the door and told once a visit ("The way out is shut. It opens when this level's heartstone is broken.", a `say("exitSealed")` line the Book can reword). The re-entry rule from `e12f758` stays, since it still covers ship parts (H17) and Little Ones; for heartstones it can no longer trigger.
2. **No WASD**: the arrows move, the left hand has Z and X. Done (`373d51a`): `BIND` loses A, D, W, S; the Controls page and the README follow. Ctrl, Alt and Space stay as Keen's keys. This also removes the Ctrl+W hazard (F03); the leave-page guard stays. The macOS Ctrl+arrow note (F04) still applies to anyone who reaches for Ctrl.
3. **Lives are by design** (extra lives come from score items). F05 stands as a note, not a finding.
4. **The tapped jump stays** as it is. F06 stands as a note.
5. **The trap lever kills, and Arcade gets up again.** Done (`963e82f`): in Arcade the lever is a death (the usual respawn follows); cheat mode keeps its lost life; Classic keeps its game over, as before. A pulled lever stays pulled (a second ↑ only clicks). *Assumption:* the author's sentence was about Arcade, so Classic was left alone; if Classic should also be a lost life rather than a game over, it is one line in `springTrap`. The Book 2 texts still say "It ends the game" (the ask) and "Thrum swallows the Catamaran whole" (the pull), which read oddly when Poom then gets up: the author's words, left for the author.
   Checked in the page (build `87f79e5f`): C05's exit refuses Poom and shows the line, then ends the level once the heart is broken; `BIND` is arrows, Z, X, C, Ctrl, Alt, Space, Enter, Esc, M; at C05's lever in Arcade the two boxes play, Poom dies, gets up at the lever with four lives still, and a third ↑ only clicks; `safeSpot` rejects a spot beside the heart's spikes, one in the air and one in rock. One consequence for the author's local solver: a plain `solve("C05")` can no longer reach the exit, since the heart is now required; `solveAll` already runs the `items: true` pass for heart levels.
   **Respawn only on safe ground.** Done (`7e60fe9`): `safeSpot(lv, x, y)` is checked at the moment he gets up, not when the spot was noted: room for his body, rock, a ledge or a slope under his feet (a bridge deck that has gone since fails), and no spikes, fire or pulsing column in the tiles he stands in or the ones either side. The newest old-enough safe spot wins, then the newest safe spot at all, then the level's start.

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

| ID | Severity | Category | Status | Location | Description |
|---|---|---|---|---|---|
| F01 | Critical | softlock | VERIFIED, fixed | `js/game.js:2043` (`updateMap`), `js/game.js:1839` (`finishLevel`) | A Book 2 heartstone level finished without breaking its heartstone can never be re-entered, and Book 2 can never end. |
| F02 | Critical | softlock | VERIFIED (H17), fixed | same | A Book 1 ship-part level finished without the part: same, Book 1 can never end. |
| F03 | High | input | SUSPECTED; resolved (no WASD) | `js/game.js:319` (`BIND`) | W is "up" and Ctrl is "jump": Ctrl+W closes the tab on Windows and Linux, and the browser cannot block it. A `beforeunload` guard is on this branch. |
| F04 | High | input | SUSPECTED | `js/game.js:319` (`BIND`), README | On macOS, Ctrl+Left/Right is "move a Space" by default. A running jump with the documented keys switches desktops. |
| F05 | note | balance | VERIFIED; by design | `js/books/E.js` (maps), `js/game.js:1461` (`collect`) | Book 4 holds 32 extra-life items (E02 has 7 in a row, E13 8, E11 5); Books 1 to 3 hold 0. Each is a full life. |
| F06 | note | feel | VERIFIED; by design | `js/game.js:1101` (jump crouch) | Jump height is set by how many of the 5 crouch ticks the key is held: a 1-tick tap rises 1.9 px, 3 ticks 1.2 tiles, 5 ticks 3.4 tiles. Short taps do almost nothing. |
| F07 | Medium | balance | VERIFIED | maps | Raygun charges: Book 1 has 65 shots for 296 hp of deadly creatures (22%); Book 3 has 1,370 for 393 (349%). |
| F08 | Low | deploy | VERIFIED, fixed | `.gitlab-ci.yml:72` | The rsync publishes everything the exclude list doesn't name (README.md and LICENSE go live today). Fixed for `review/` and `REVIEW.md` on this branch. |
| F09 | Low | dead code | VERIFIED, `fit()` fixed | `js/game.js:3490`, `:3266`, `:574` | `fit()` has a `pad` that is always 0; the classic help says a Vacuumoid "takes three shots" but hp is 4 (unreachable text); the `O` pogo item and `noPogo` text are dead, `newRun().pogo` is always true. |
| F10 | Medium | rules vs text | fixed (Arcade) | `js/game.js:1396` (`springTrap`), `:3249` (`MODES`) | Arcade "never runs out", but a Book 2 trap lever ends an Arcade game too. |
| F11 | Low | UI | VERIFIED, fixed | `js/game.js:2861` (`statusWindow`) | In Arcade the status window shows "Lives 4" while the HUD shows 99. |
| F12 | Low | text vs code | VERIFIED, fixed | `js/game.js:2941` (`CONTROLS`) | "The game saves itself whenever you are on the map": it saves on entering or leaving a level and on quit, not while walking. |
| F13 | Low | integrity | SUSPECTED, fixed | `js/game.js:968` (`updatePlayer`, dead state) | Reloading the page during the 100-tick death animation keeps the life: the save was taken before the level. |
| F14 | (none) | levels | VERIFIED fine | `review/warps.js` | 12 warp-door arrivals (E05, E06, E15) have no floor within 6 tiles: they are the levels' exits, and the level ends on arrival. Not a bug. |
| F15 | Low | UI | VERIFIED, fixed | `index.html:200` (`.page .tabs`), `js/game.js:3251` | The Help's sixth tab, About, is clipped to "Abou" at 286 px. |
| F16 | Low | UI | VERIFIED, fixed | `js/game.js:2848`, `:2941` | The ← → keys in the Controls page and every Help footer draw in a fallback font at a third of the size of ↑ ↓: the pixel font has no left or right arrow. |
| F17 | Low | UI | VERIFIED, fixed | `js/game.js:3437` (`gameOver`) | The game-over box opens over the still-fading level-name plate. |

## Detailed findings

### F01, Critical: a heartstone level finished without its heartstone can never be finished (Book 2 cannot end)

**Status: VERIFIED** with `review/solver-avoid.js` (`solve(id, { avoid: true })`, which kills any path that touches the heartstone, so a success is an exit reached without it):

| Level | Without the heartstone | Solver |
|---|---|---|
| C05 *The Spine Garden* | **exit reachable** | door, 7.1 s, 61,877 states |
| C07 | heart is on the only route | plain solve 1.0 s; avoid: exhausted 107,240 states (every path dies on the heart) |
| C08 | not settled | budget (35 s) |
| C10 | not settled | budget (35 s; the level is 144 wide) |
| C12 | **exit reachable** | door, 32.6 s, 5,416 states |
| C14 | **exit reachable** | door, 0.1 s, 1,538 states |
| C16 | not settled | budget (35 s) |
| C17 | not settled | budget (53 s) |

Three of the eight are proven open; one needs more search time to tell; C07 is the only one whose heart stands in the way. One is enough: a run that leaves C05, C12 or C14 by the door with the stone standing is already lost.

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

**Status: VERIFIED.** H04, H05 and H09 force the part; **H17 does not**: `solve("H17", { avoid: true, to: [105, 10] })` reached the open ledge to the right of the exit in 22.9 s and 193,289 states without touching the part, and from there walking left into the exit tile finishes the level (re-run by hand in the page: Poom placed at (106,10), left held, the level ended by its door with the part still on the floor and `G.run.parts` all false).

Same mechanism as F01 (`updateMap` only re-opens rescue levels; the ship needs all four parts, `boardShip` at `js/game.js:1879`). Whether it can happen depends on the maps:

- **H04** (*Fort Scrap*): the part at (70,11) sits one tile past the red door at (69,10-11), in a chamber x 70-77, rows 9-11 whose only way in is that two-tile-high door. Poom is 22 px tall; under the door's lintel his feet cannot rise above y=182 and the part's pickup box spans y 179-191, and he cannot clear the lintel horizontally without already overlapping the part's box (x 1123-1133). The part is unavoidable. Confirmed by the solver running out of states (`solve("H04", { avoid: true, from: [67,11], ev: ["o69,10"] })`, 30 s budget, never reached the exit).
- **H05** (*Old Litterburg*) and **H09** (*Vault 9*): the part is in a corridor two tiles high (ceiling at row 5 over (112,7); ice at row 14 over (69,16)), which Poom fills. Unavoidable.
- **H17** (*Vault 9, the Deep Freeze*): the part at (103,10) sits in a corridor three tiles high next to the exit at (104,9-10), **and the exit chamber is open to the right (x 105-109) and above (rows 0-8 at x 104-109), which connects along the map's open top rows 0-1 to the shaft at x 80-87.** The solver found that route: up to the sky, along the top, down the right side, and into the exit from the right, never touching the part. The player then has Level 16 "cleared", three parts, and no way to the fourth.

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

### F15 to F17, Low (VERIFIED by screenshot): Help tab clipping, arrow glyphs, the plate under Game over

- The Help page is 286 px wide and its six tabs (Story, Controls, Classic and Arcade, Creatures, Items, About) need more: About shows as "Abou". Shorter tab names ("Modes"), or a two-row tab bar.
- `&larr;` and `&rarr;` are not in Press Start 2P; the browser draws them from a fallback font at the page's 6 px, a third of the size of `&uarr;` `&darr;`, which the font has. Seen on the Controls page's first row and in the "← → pages" footer. Either the words "left" and "right", or a two-character ASCII arrow (`<-`, `->`) in the font.
- `gameOver` does not call `hideLogo()`, so the level-name plate (`levelTitle`, fading over two seconds) is still readable behind the box.

### Checked and found fine

- Clicking the ♪ sound button leaves it focused; a following Space fires the raygun and does not toggle the sound again (the keydown's `preventDefault` stops the button's activation), and Enter opens the status window rather than clicking it.
- Death in Classic: the fall, the dead pose, the box ("Poom dusts himself off. 3 lives left."), lives 3 in the HUD, the status and the save, all agree.
- Game over at 0 lives: the box, then the name entry (14 characters, HTML-escaped), the table with the new row highlighted, the save deleted, the title. Arcade and cheat runs are refused by `recordScore` as the text says.
- Every playable level loads with Poom clear of rock; every sign has a text; every entrance on the four world maps names a level that exists; no Book 1-4 level has a key-carrying creature (the dropped-key-into-the-void case cannot happen).
- Save and load: a run saved on the map comes back field for field (`score, nextLife, lives, ammo, pogo, parts, aboard, book, done, mx, my, swim`) at the same spot; Quit to title from inside a level restores the pre-level snapshot (ammo 12 and score 1734 in the level, 7 and 1234 saved), as the pause menu says.
- Arcade respawn: after walking 335 px into *The Valley Road*, four quick falls put Poom back at x 320, 223, 119 and 63 (the streak backs off 60 × (1 + 2 × streak) ticks each time), with 81 ticks of grace each, and no life lost. No respawn loop.
- The top of a pole (E02, column 76): with up held, Poom stops 5 px above the top tile and stays on the pole; no flicker between climbing and falling.
- The console stayed empty through every flow above.

### F14, not a bug: twelve warp-door arrivals have no floor beneath

`review/warps.js` flagged E05 (51-52,71-72) → (51,20); E06 (51-52,65) → (4,83) and three doors → (6,39); E15 (40-41,79) → (53,73). Walked through each in the page: Poom arrives inside the level's exit door and the level ends at once (`p.state === "exit"` on the next tick). They are the way out, as in Keen 4. Nothing to fix.


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

### Per level

`review/economy.out.txt` has the per-level table (points, charges, lives, deadly killable creatures and their hit points, harmless ones, unkillable deadly ones, turrets, points from kills). The standouts: H15 (the secret level) holds 157,400 points on its floor, a third of Book 1; D14 172,500 and D16 145,000 in Book 3; E06 has 102 hit points of deadly creatures to shoot and 30 charges; E12 has 30 turrets and 5 charges; E17 and E18 have 56 unkillable deadly creatures between them and nothing worth shooting.

### Creature encounters (`review/encounters.js`)

Every number here is fixed by the constants in `updateEnemy` and `KP`; the only randomness (a creature's start phase and first direction, a mousel's hops, a walker's jump timing) does not change who wins a touch, so these are computed rather than sampled.

| Encounter | Numbers |
|---|---|
| A charger (scrap hound, skitter, claw guard, dog, splicer, drone) | sees Poom within 150 px, growls 22 ticks, charges at 2.125 px/tick: on Poom **1.39 s** after spotting him from 130 px, 0.60 s from 30 px. Poom's walk is the same speed: on the flat he cannot outrun one, only jump it (60 ticks in the air) or shoot it (1 hp; ninja 3, spider and houdini 2). A ninja or spider charges at 2.97 px/tick: 1.09 s from 130 px. |
| A walker (scrapper, husk, heavy, thug; lieutenant, ocelot, brute, rosie) | 0.875 px/tick toward Poom within 150 px, random jumps; deadly to touch. Four shots (28 ticks of firing, 0.35 s) for the rank and file, during which it closes 18 px; five for a lieutenant; eight for Rosie (0.82 s, 43 px). |
| A shooter (spitter, gunner, Dr Cal, leadhead) | stops, aims 30 ticks, fires one shot at 3.875 px/tick: it arrives **1.15 s** after the stop from 150 px, 0.72 s from 50 px. The shot flies 3 px below the creature's top and is 6 px tall: a hop clears it. Cannot be hurt. |
| A turret | one shot every 100 ticks (1.67 s) while Poom is within 220 px across and 160 up or down; 2.4 px/tick, 18 tiles of range; 1.53 s of flight from the edge of its reach, 0.56 s from 80 px. Rows of them fire at random moments (random start phase). |
| Pushers and shovers | never kill: a mousel moves Poom 11 px, a roombot 26 px. |

What this says about Classic: a charger seen late (inside 60 px) gives 0.84 s to react, and the only answers are a jump or a shot. With the raygun starved in Book 1 (F07), the jump is the answer, which is Keen 1. The Book 3 ninja at 2.97 px/tick is the fastest thing in the game and takes three shots: it is the one creature a careful player cannot handle at walking pace without a shot or a ledge.

## Player experience

Walked through with real key presses in the app's browser: title, New game, Book and mode menus, the four story pages, the arrival box, the map, *The Valley Road*, pause, status, every Help page, a death, a game over, the name entry and the table. Nothing crashed; the console stayed empty throughout.

**Onboarding is good.** Four story pages with a counter and an Esc skip; an arrival box that names the first place and the keys; an arrow that bobs over every place you can reach; a key strip along the bottom of the first level ever played in that browser; a one-line toast the first time Poom meets a hatch, a sign, a card reader, an empty raygun, water, a shut road. The toasts are gated by `seen()` so they never nag. The level name plate fades after two seconds. The "Now entering" card is Keen's.

**Feedback is good.** Points pop where they are earned, 1UPs say "1UP", the heart count and the rescue count are said each time, the ship says which parts it still wants, the map says when a road opens. The lost-life box says how many lives are left, and the HUD matches.

**Where it is unclear or frustrating.**

1. **Nothing tells you a level you left is unfinished** (F01, F02). The map said "cleared", the status counted "0 of 8 broken", and the two never met. Fixed on this branch: "(not finished)" and the arrow stays. Book 4's own map help was already honest about this; Books 1 and 2's were not.
2. **The tapped jump** (F06): the one thing a new player does most, and it is the least predictable input in the game.
3. **Raygun starvation in Book 1** (F07): with 65 shots in sixteen levels and Scrappers that take four, the raygun is a thing you save for lieutenants. That may be the Fallout mood, but the first "Click. The raygun is empty" comes very early, and the help page sells the gun.
4. **The Help's sixth tab ("About") is clipped** to "Abou" at the right edge, and the **← → keys** on the Controls page and in every page's footer draw in a fallback font at a third of the size of ↑ ↓ (the pixel font has no left or right arrow). Both VERIFIED by screenshot.
5. **"?" as the Help key.** The menus accept H and / for it as well (`menu()`'s key handler), which is good, because "?" needs Shift and the hint only shows "?".
6. **The game-over box opens over the fading level-name plate** ("Level 1: The Valley Road" is still readable behind "Game over" for a second). Cosmetic; `gameOver` could call `hideLogo()`.
7. **Status in Arcade** says "Lives 4" (F11).
8. **The pause menu's "Quit to title" says "game saved"**, which is true on the map and in a level (the pre-level save), but a player who reads it mid-level expects the level to be kept.

**Pacing.** Book 1's sixteen levels run 120×21 (H02) to 128×77 (H14), with two one-screen "vault doors" (H03, H07: no creatures, a terminal to read). The order is forced by the map's walls (H02, then H03-H08, then H09-H17), which is Keen 1's shape and suits a first Book. Books 2 and 3 are the open ones.

**Accessibility.** Not a priority by the author's answer, so only what fell out of the pass: controls are not remappable (`BIND` is a constant); pause works, and losing window focus pauses (`blur`); colour is never the only signal (keycards have shapes and the door says its colour in words; the trap lever has a blinking red triangle); the text is a 6 px pixel font at 1x, legible at 2x and up, and `fit()` prefers integer scales. `prefers-reduced-motion` is read by the family boot screen (`gk-title.js:136`) but not by the game (the title scenes animate regardless).

**Replayability.** Four Books with different rules (ship parts, heartstones, a last level, rescues), a high-score table per browser, a secret level (H15), Arcade for a second run. There is no per-Book best or death count, and no reason to replay a level once done; see the bolder ideas.


## Code health

Secondary, as asked. The game is 9,769 lines of hand-written JavaScript with no build step and no tests; `js/game.js` is 3,577 lines, `js/art.js` 3,245.

**What is good.** One fixed-step loop (`frame`, `js/game.js:3514`) with every distance in pixels per tick, so nothing depends on frame rate; the one exception is cosmetic (item and NPC animation counters tick in `drawLevel`). State is one object (`G.run`) that is also the save, so save and load cannot drift apart. Per-Book words live in one table (`BOOK_TEXT`) behind one accessor (`say`, 37 call sites), so the engine never hard-codes a Book's voice. The transcriber keeps every hand edit to a map in short named lists (`OPEN_TILES`, `CLOSE_TILES`, `CLEAR_HAZARDS`, `ADD_SIGNS`), so a rebuild keeps them. The CI refuses to pass vacuously (`stamp-assets.js --check`).

**What will hurt.**

1. **`updatePlayer` is 280 lines and does everything** (`js/game.js:968-1247`): pogo, doors, traps, signs, sockets, bridges, poles, walking, jumping, steam, hazards, locked doors, pickups, exits, rescues. Each new Book has added a block to it (the steam vents, the pulse columns, the trap levers). The next Book's gimmick goes in the same place. Splitting it into `interact()`, `move()`, `collide()` would cost an afternoon and make the next one a ten-line change.
2. **Rules that must agree are written twice.** The four themed HUDs each re-draw "99 for Arcade" (`drawHud`, `drawWristHud`, `drawVisorHud`, `drawCodecHud`, `drawDecoHud`), the status window draws the real count (F11). `levelName`'s number (`+id.slice(1) - 1`) is repeated in `statusWindow`. The sound sets repeat 25 keys five times with only the timbre changing. A `hudFrame(lv, style)` helper and a `SFX_BASE` with per-Book overrides would halve both.
3. **Magic numbers in the creature and hazard code.** `updateEnemy` has 150, 24, 130, 22, 140, 100, 220, 160, 90, 0.04, 130, 30, 56 inline; `PULSE` and `VENT` are tables, which is the pattern to follow (an `AI = { seeX: 150, seeY: 24, growl: 22, ... }` table). 123 lines of `game.js` carry a bare three-digit tick or pixel count.
4. **Timeouts in gameplay.** Nine `setTimeout`s: the 250 ms message arming, the 300 ms "rescued" box, the 1.3 s level card, the key strip. They run on the wall clock while the game runs on ticks, so a paused game (or a tab in the background) can fire them at the wrong moment; the rescue box after `finishLevel` is one `enterMap` away from opening over the next level.
5. **`Math.random` in simulation** (17 uses): creature start phase and direction, mousel hops and looks, death spin, hive edges. Fine for play, but it is why the solver has to leave creatures out and why no two runs of a level are the same; a seeded `rng` (art.js already has one) would make bugs reproducible from a seed.
6. **No tests for the rules.** Nothing checks that a Book ends when it should, that a save round-trips, that `levelPending` agrees with `finishLevel`'s goal check, or that every entrance on a world map names a level that exists. `review/lib/books.js` is a Node loader for the map data; the checks in `review/*.js` are a start, and `BOOK_GOAL`'s three branches (`finishLevel`, `statusWindow`, `levelPending`) are the first thing worth a test.
7. **`loadLevel` is 230 lines** and the transcriber's `ENGINE-SUPPORT.md` is the only description of the glyph set. A `GLYPHS` table (glyph, solid, hazard, item kind, drawn as) would replace `SOLID`, `ITEM_CH`, `GEM_CH`, `DOOR_CH`, `SOCKET_DOOR`, `BELT`, `solidLike` in `drawLevel`, and the eight `if (c === ...)` ladders.
8. **Dead code** listed under F09.


## Improvements, ranked by impact vs effort

Impact is to a Classic player who starts at Book 1; effort is the author's time. The first three are findings above; the rest are suggestions.

| # | Change | Impact | Effort | Notes |
|---|---|---|---|---|
| 1 | Keep a level open while its heartstone or ship part is still in it | Very high (two Books can be lost silently) | Done on this branch | F01, F02 |
| 2 | A `beforeunload` guard while a level is in play, and Z/X shown before Ctrl/Alt | High (lost levels on Windows and macOS) | Small | F03, F04 |
| 3 | Even out lives and ammo across the Books | High | Small to medium | F05, F07: a per-Book value for a charge's shots, and a decision on set E's 32 lives |
| 4 | Give a tapped jump a floor (`Math.max(3, crouchHeld)`) | Medium (feel) | One number | F06; test it, it is a feel change |
| 5 | Make a done level say what is still in it | Medium (clarity) | Small | "(not finished)" on this branch; a heart or part icon in the label and in the status window would be clearer than words |
| 6 | Save the lost life at the moment of death, not after the animation | Low | Small | F13 |
| 7 | Save on a timer while on the map | Low | Small | F12 |
| 8 | Arcade and the trap lever: one rule, said once | Low | Small | F10 |
| 9 | Status "Lives" in Arcade: "endless" | Low | One line | F11 |
| 10 | The Help's About tab is clipped; the ← → keys draw in a fallback font a third the size of ↑ ↓ | Low | Small | Six tabs do not fit 286 px; use a real arrow glyph the font has, or the words "left" and "right" |
| 11 | Score-threshold 1UPs: cap the doubling at 320k or reset per Book | Low to medium | One line | By Book 4 the next life costs 1.28M points; floor points stop meaning anything |
| 12 | A `GLYPHS` table and an `AI` constants table | Code health | Medium | Code health 3 and 7 |

### Bolder ideas (optional)

- **Keen 4-style lifewater.** Make set E's `L` items a counter (100 drops to a life, or 10 here) shown as a small bar in the Deco HUD. It keeps the rows the maps were drawn for, removes the 32-life flood, and gives Book 4 the one collectible the others lack.
- **One world, one road.** With the pogo at ten tiles and the maps' edge exits, most of a level's geometry is optional. A "ranger route" per level (two or three mandatory keycards on the way to the exit) would give Classic some bite without touching physics. The transcriber's `CLOSE_TILES` is already the tool for this (E16 used it).
- **A ghost of your last run.** Record inputs per tick (the loop is deterministic apart from creature randomness; seed it) and draw a faint Poom replaying the last attempt at the level. It costs almost nothing in a fixed-step engine and makes Classic deaths teach instead of punish.
- **Let Arcade keep a death count** and show it at the Book's end instead of a score. Arcade runs go on no table today; "finished Book One in 23 deaths" is a score people will chase.
- **A "Keen" speed toggle in the first level.** Relaxed (48 Hz) exists but is three menus deep in Settings; offering it once, in the key strip, after the second death in a level would reach the players it is for.


## What changed, and what was not done

Branch: `review/2026-10-12`, from `main` at `146805c`. Nothing was pushed. Each fix is its own commit, with `index.html` restamped (`node tools/stamp-assets.js`) in the same commit; `node tools/check-assets.js` and `stamp-assets.js --check` pass at the head.

Game fixes (cherry-pick any). From the author's decisions of 2026-10-13:
- `36cf06b` Book 2: the way out stays shut until the level's heartstone is broken
- `373d51a` No WASD: the arrows move, the left hand has Z and X
- `963e82f` Arcade: a trap lever kills Poom, and he gets up again
- `7e60fe9` Arcade: Poom only ever gets up on safe ground

From the first pass:
- `e12f758` A done level with its heartstone or ship part still in it can be gone back into (F01, F02; also gives Book 4's unrescued levels their arrow back)
- `927c06f` Ask before leaving the page with a level in play (F03)
- `89ee4cc` Game over: drop the level's name plate first (F17)
- `2ea3108` Status: an Arcade game's lives are endless, as the scorebox says (F11)
- `7005af2` Help: the modes tab is Modes, so the About tab fits on the bar (F15)
- `5765bbe` Help: draw the left and right arrows as big as the up and down ones (F16)
- `47f05bf` Classic: a death is saved when it happens, not when the box opens (F13)
- `56d7284` Save where Poom stands on the map every few seconds (F12)
- `24119a2` fit: drop a padding that was always zero (F09, part)

Repo and review:
- `82cee02` Deploy: don't publish the review folder or REVIEW.md (F08)
- `d15f455`, `0faa04d`, `c9bdc87`, `268e3e7`, `dd6164b` and the two after: this report and the scripts under `review/`

Each fix was re-checked in the page against the restamped build (`game.js?v=959e317d`): the Arcade status row reads "endless (arcade)"; the save holds 2 lives the tick Poom dies with 3 and the box later agrees; the map save follows Poom (saved `mx` 232.4 after 181 ticks of walking); the Help bar now reads Story, Controls, Modes, Creatures, Items, About, with About's right border on the frame; the ← → keys draw at the size of ↑ ↓; a level in play prompts before the page is left.

Not changed, on purpose (the author's call): the jump floor (F06), lives and charges per Book (F05, F07), the Arcade trap rule and its text (F10), the key order in the key strip and help (F03, F04), the classic help text and the pogo item code (F09), and every map.

Not done:
- C08, C10, C16 and C17 were not settled either way by the solver within 35 to 53 s each; a longer run (`solve(id, { avoid: true, maxMs: 300000 })`) would. It does not change the finding.
- Windows, Linux and macOS keyboard behaviour (F03, F04) and gamepad input were not exercised.
- Touch controls were not tested beyond reading the code (the author asked for little effort there).
- No Monte Carlo of creature fights: every creature number is deterministic from the constants (`review/encounters.js`), and the only randomness (start phase, mousel hops, walker jumps) does not change who wins a touch.

Scripts: `review/` (run `node review/economy.js`, `node review/warps.js`
from the repo root; load `review/probe.js` and `review/solver-avoid.js`
in the page).
