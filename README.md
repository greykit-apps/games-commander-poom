# Commander Poom

**Book One: Wastelandia.** A platformer in the spirit of the Commander
Keen games of 1990 and 1991. Commander Poom crash-lands the Catamaran in the
Glow, a wasteland of raider camps, ruined towns and old underground Vaults,
and the Scrappers have already hauled off four of his ship's parts. Run, jump,
pogo and zap your way across the Glow, take them back, and bolt them in.

A love letter to Commander Keen and a growing list of mashups: each Book is its
own world with its own look, creatures, story and sound, and the whole game,
title screen included, dresses as the last Book played. New game asks which
Book to start with; finishing one goes on to the next. Each Book borrows the
feeling of a famous game or film, and its names, art and text are all
original.

| Book | | In the spirit of |
|---|---|---|
| 1 | **Wastelandia**: the Glow, a wasteland of raiders and old Vaults | *Fallout* |
| 2 | **Heavens to Mergatroid**: Thrum, a hollow moon with something alive inside | *Metroid* |
| 3 | **The Island of Dr Cal**: a villain's volcano lair, by night, on the quiet | *Metal Gear Solid* |
| 4 | **Descent into Rapture**: Raptura, a drowned art-deco city of otters | *BioShock* |
| 5 | **Termination Day**: TERMINUS, a machine's station overrun by an alien swarm | *The Terminator*, *Aliens*, *Predator* |

## Play

<https://greykit.com/games/commanderpoom/>

![The title screen: the amber Commander Poom logo and "Book One: Wastelandia" over a dusk sky, the Catamaran crash-landed and smoking on the left with ranger Poom beside it, Auntie Static's radio mast and a ruined skyline behind, and the menu in a rusted-steel panel](screenshots/title.png)

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

![The world map: Poom on a dusty road between rock ridges, a cleared Scrapper camp and a cleared ruin flying their banners, and a bobbing amber arrow over the ruined towers of Old Litterburg, the next place he can reach; the wrist-computer scorebox reads 6850 in green](screenshots/map.png)

![Old Litterburg: ranger Poom on a broken concrete street under a hazy sun, a Glowmouse beside him, a faded billboard and rusted girders above, tins of tuna to collect along the top](screenshots/ruins.png)

![Vault 9, frozen: icicles along the ceiling, a round blast door marked 9, two auto-turrets firing as Poom passes, and a Sentrybot rolling along the icy walkway](screenshots/vault.png)

![A Vault terminal, read in Vault 9: "VAULT 9 COLD-SLEEP STATUS: COOLANT BREACH. Floors may be slippery. Have a nice day."](screenshots/sign.png)

### The other Books

![Book Two, Heavens to Mergatroid: Poom in his white hardsuit and amber visor in the violet crags of Thrum, teal fungus on the rock, a Mergatroid drifting by and a station hatch set into the cave wall](screenshots/book2.png)

![Book Three, The Island of Dr Cal: Poom in a sneaking suit and red bandana on Isla Garra's docks at night, under a full moon and a searchlight, three stoat guards with red exclamation marks over their heads as they spot him; the radio scorebox reads 12750 in green](screenshots/book3.png)

![Book Four, Descent into Rapture: Poom in a brass diving helmet in Raptura's marble promenade, a great round window on the sea behind him with a fish going by, a Big Brass diving suit on a gilded balcony, pink and teal neon glowing](screenshots/book4.png)

![Book Five, Termination Day: Poom in olive marine armour on TERMINUS's steel decks, a chrome skeleton with red eyes walking at him, racks of more skeletons behind, the motion tracker in the scorebox showing its blip](screenshots/book5.png)

## The repo

| | |
|---|---|
| `index.html` | the page |
| `js/game.js` | the engine, the Books' words and themes, the UI |
| `js/art.js` | every sprite, tileset, backdrop and world map, drawn in code, for Books 1 and 2 |
| `js/art-book3.js`–`art-book5.js` | the same for Books 3, 4 and 5, each registering with `art.js` |
| `js/books/A.js`–`I.js` | the levels, transcribed from `maps2/` |
| `js/gk-title.js` | the family's boot and title block, from `games-meta/canon` |
| `maps2/` | the level designs from the map builder, and their README |
| `docs/story/` | each Book's story (`book-<n>-story.md`), what its maps need from it (`book-<set>.md`), and ideas for the Books to come |
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
