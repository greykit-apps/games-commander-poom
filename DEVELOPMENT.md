# Developing Commander Poom

Plain HTML and JavaScript: no build step, no dependencies, no framework. `index.html` runs straight from disk. The share-card maker in `tools/` needs it served over http; any static server from the repo root does:

```sh
python3 -m http.server 8765
```

and open <http://localhost:8765/>. Saves are per browser and per address, so the copy opened from disk and the one on localhost keep separate saves.

The tools need Node (CI uses Node 20); the icons also need `rsvg-convert`, and Python with Pillow.

## The repo

| | |
|---|---|
| `index.html` | the page: markup, styles, and the script tags |
| `js/game.js` | the engine, the Books' words and themes, the UI |
| `js/art.js` | every sprite, tileset, backdrop and world map, drawn in code, for Books 1 and 2 |
| `js/art-book3.js`–`art-book5.js` | the same for Books 3, 4 and 5, each registering with `art.js` |
| `js/book5.js` | Book 5, held back: not loaded by `index.html`; its header says how to put it back |
| `js/books/A.js`–`I.js` | the levels, one file per map set, transcribed from `maps2/` |
| `js/gk-title.js` | the family's boot and title block, from `games-meta/canon` |
| `maps2/` | the level designs from the map builder, and their README |
| `docs/story/` | each Book's story (`book-<n>-story.md`) and what its maps need from it (`book-<set>.md`) |
| `docs/art/` | sheets of the tilesets, Poom, the items and the creatures |
| `ENGINE-SUPPORT.md` | what each Book's maps ask of the engine |
| `REVIEW.md`, `review/` | the 2026-10-12 review, and the scripts that measured what it reports with the game's own code |
| `screenshots/` | the pictures in the README |
| `tools/` | the scripts below, plus the map transcriber and the story map |

Levels are addressed by map set and number: `H05` is set H, level 5. The four Books in the game are sets **H, C, D and E**, in that order. Set A is Book 5, *Termination Day*, held back with `js/book5.js`: built, but kept out of the game until its levels are proven winnable, and shown greyed out under New game. B, F, G and I are levels no Book plays. All nine sets are in the repo; `index.html` loads B, F, G and I, and leaves A out altogether.

## Tools

| | |
|---|---|
| `node tools/stamp-assets.js` | After editing anything in `js/`: refreshes the content hashes on the script tags in `index.html` (`game.js?v=1a2b3c4d`), so a deploy isn't hidden behind a cached copy. `--check` only reports. |
| `node tools/check-assets.js` | Fails if anything `index.html` or the manifest names is missing from the repo. CI runs it before every deploy. |
| `node tools/make-icons.js` | Draws `icon.svg`, Poom's head in Book 1's ranger helmet, and renders the favicons, app icons and touch icon from it (needs `rsvg-convert`, and Python with Pillow for `favicon.ico`). The outputs are committed. |
| `tools/og.html` | Draws the share card, `og.png`, by running the game in a hidden frame. Open it over http from the repo root, wait for its title to read *ready*, and save the canvas. |

## Debug

`?level=H05` drops straight into a level, with everything; `?book=H` onto that Book's world map.

## Deploy

`main` deploys to DreamHost by rsync (`.gitlab-ci.yml`). Before it does, CI runs `tools/check-assets.js` and `node --check` on every script, and stops the deploy if either fails. What ships is `index.html`, `js/`, `og.png`, the icons and the manifest; `maps2/`, `docs/`, `tools/`, `review/` and the Markdown files stay in the repo.
