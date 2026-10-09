# Commander Poom

**Book One: Down in the Glow.** A platformer in the spirit of the Commander
Keen games of 1990 and 1991. Commander Poom crash-lands the Catamaran in the
Glow, a wasteland of raider camps, ruined towns and old underground Vaults,
and the Scrappers have already hauled off four of his ship's parts. Run, jump,
pogo and zap your way across the Glow, take them back, and bolt them in.

A love letter to Commander Keen and a growing list of mashups: each Book is its
own world with its own look, creatures, story and sound, and the whole game,
title screen included, dresses as the last Book played. Book One is in the
spirit of *Fallout*; its names, art and text are all original.

## Play

<https://greykit.com/games/commanderpoom/>

![The title screen: the amber Commander Poom logo and "Book One: Down in the Glow" over a dusk sky, the Catamaran crash-landed and smoking on the left with ranger Poom beside it, Auntie Static's radio mast and a ruined skyline behind, and the menu in a rusted-steel panel](screenshots/title.png)

No build step, no dependencies, no network at play time. Saves stay in your
browser's `localStorage`. Every sound is synthesized in the page with Web
Audio; `M`, or the note in the corner, turns it off.

| Keys | |
|---|---|
| `←` `→` or `A` `D` | walk |
| `Ctrl` or `Z` | jump; hold it to jump higher |
| `Alt` or `X` | pogo stick on and off |
| `Space` or `C` | fire the raygun |
| `↑` `↓` | climb a pole |
| `↑` | read a sign; go through a door |
| `Enter` | status |
| `Esc` | pause |

A gamepad works too, and on a touch screen the controls appear on screen.

### The Glow

![The world map: Poom on a dusty road between rock ridges, a Scrapper camp flying the banner of a place already cleared, and ruined towers further off; the wrist-computer scorebox reads 6850 in green](screenshots/map.png)

![Old Litterburg: ranger Poom on a broken concrete street under a hazy sun, a Glowmouse beside him, a faded billboard and rusted girders above, tins of tuna to collect along the top](screenshots/ruins.png)

![Vault 9, frozen: icicles along the ceiling, a round blast door marked 9, two auto-turrets firing as Poom passes, and a Sentrybot rolling along the icy walkway](screenshots/vault.png)

![A Vault terminal, read in Vault 9: "VAULT 9 COLD-SLEEP STATUS: COOLANT BREACH. Floors may be slippery. Have a nice day."](screenshots/sign.png)

## The repo

| | |
|---|---|
| `index.html` | the page |
| `js/game.js` | the engine, the Books' words and themes, the UI |
| `js/art.js` | every sprite, tileset, backdrop and world map, drawn in code |
| `js/books/A.js`–`I.js` | the levels, transcribed from `maps2/` |
| `js/gk-title.js` | the family's boot and title block, from `games-meta/canon` |
| `maps2/` | the level designs from the map builder, and their README |
| `docs/story/` | Book One's story, and what the maps need from it |
| `docs/art/` | sheets of the tilesets, Poom, the items and the creatures |
| `ENGINE-SUPPORT.md` | what each Book's maps ask of the engine |
| `tools/` | the map transcriber, the story map, the icon and share-card makers, the asset check |

After editing anything in `js/`, run `node tools/stamp-assets.js` to refresh
the script hashes in `index.html`. The icons come from
`node tools/make-icons.js` (rsvg-convert and Pillow); `og.png` from
`tools/og.html`, opened over http from the repo root.

Debug: `?level=H05` drops straight into a level, `?book=H` onto a Book's map.

## Deploy

`main` deploys to DreamHost by rsync (`.gitlab-ci.yml`), after
`tools/check-assets.js` confirms every file the page names is in the repo.
`maps2/`, `docs/`, `tools/` and `ENGINE-SUPPORT.md` are not published.

## License

MIT; see [LICENSE](LICENSE).
