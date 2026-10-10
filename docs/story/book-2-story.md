# Book 2: the story (first draft)

Book 2 is map set C, in the spirit of *Metroid* (hence its **Mergatroids**,
and Auntie Static's "Heavens to Mergatroid"): a lone hunter, a dead
research station, something alive growing through it, and a lot of quiet.
Like Book 1, it keeps the feeling and invents its own names: no Samus, Zebes,
Metroids, Chozo, Mother Brain or Varia. It keeps Book 1's rules: animals, not
humans; Poom and the Catamaran.

This document has two parts. First, what the maps make the player do, read
off the data. Second, a plot that gives each of those actions a reason, and the
three tileset biomes that follow from it. The level-by-level detail is in
[book-C.md](book-C.md), which `node tools/story-map.js C` regenerates.

## What the maps ask of the player

Set C is built on the older engine (E1), like Book 1. That means no slopes,
poles or conveyors, and an unfinished level is a wall on the world map.

### The shape of the Book

- **16 levels, one chapter.**
  - C18, after the last level, is the ending cutscene: a field of stars,
    which suits an ending in space.
  - C19 is a title screen.
- **The world map opens in three steps.**
  1. C02 is the only level open at the start.
  2. Finishing C02 opens C03–C07.
  3. Finishing C06 opens the other ten, C08–C17, all at once and in any order.

  So the story can count on C02 coming first and C06 being the gate. After
  that, it can't count on any order.
- **No ship on the map, no rescues.** The Book ends when its levels are done.

### Eight device rooms

Eight levels end in the same room: C05, C07, C08, C10, C12, C14, C16, C17.

- **The objective's pedestal.** It stands on a small block with a spike tile
  either side, at (66, 14) in most of them (C10's room sits further right,
  C14's further left).
- **The approach.** The level's exit is just below and to the right. Beside
  a spike-filled shaft next to the pedestal is a switch (behaviour 25).
- **What's left to decide.**
  - **Destroy or collect?** The objective doesn't end the level. It's the
    same object in all eight rooms, so these are eight copies of one thing,
    not eight different parts.
  - **What ends the Book?** Finishing every level now does it, as with the
    automatic end of Books 2–9. Whether it should instead be "all eight
    destroyed" is for the story to decide.

This is the structure of Commander Keen 2, whose eight cities each held a
giant weapon to switch off.

### Keycards and security doors

All four colours appear:
- 17 keycards, in C03, C04, C08, C11, C15, C16 and C17.
- 16 doors, two tiles tall.
- C11 and C15 use all four colours in one level, and are puzzle levels.

### Switches: traps

There are 19 switch tiles. The map maker confirms that **they are game-over
switches**: traps set next to a goal, as in Commander Keen 2. One sits beside
the spike shaft in every heartstone chamber, and there are more in C05, C06,
C14 and C17 (C17 has seven).

In the game (`springTrap` in `js/game.js`):
- **Pulling one** takes ↑ while standing at it, as a Keen switch does, so
  walking past is safe. Nothing prompts the player; it's a trap.
- **The result:** "Poom pulls the lever. The station's power floods into the
  heartstone. The Hum roars, the whole moon shakes, and Thrum swallows the
  Catamaran whole." Then it's **game over**. With cheat mode on, it is an
  ordinary death instead.
- **The warning:** the story pages say "whatever you do, don't pull the crew's
  levers by the heartstones."
- **The look:** a lever on a hazard-striped plate, its handle up with a teal
  lamp; pulled, the handle is down and the lamp is red.

Only E1 maps get this rule, and only set C has switches there. Set G's 49
unwired switches are on the newer engine and are something else, not built
yet.

### The rest

- **Hazards everywhere.** There are 1,039 spike tiles; this is the
  spikiest set.
- **13 moving platforms**, in C03, C12, C13, C14, C16 and C17.
- **Only two signs**, both near the exit late in the level: C09 at (58, 52)
  and C11 at (57, 55).
  - The story map first counted 210. The other 208 were solid tiles carrying
    the sign behaviour, building walls and steps; the transcriber now makes
    them walls.
- **Five creature types.**
  - 01 and 02 are common (59 and 73).
  - 04 is clustered (29 in all, 16 of them in C09).
  - 05 is steady, one to seven a level (33).
  - 03 is rare, one to three a level (16).
- **Exits are all doors.** C16 and C17 have two each.
- **Score items** come in five tiers (745 tiles), plus 61 energy cells and
  extra lives.

## The plot, in a paragraph

The Catamaran limps out of the Glow and, two days out, catches a mayday from
**Thrum**, a hollow moon that hums. The mayday is a fake. **Junk Baron Cal**
had the Scrappers follow the Catamaran's trail out of the Glow and broadcast
it on the moles' old frequency, because Cal knows what's on Thrum. A ship that
lands there doesn't leave, and he can strip it at his leisure. A mining and
research station was dug into Thrum's crust by a crew of moles, and the
**Hum** has grown through it: a hive of glowing, drifting things that feed on
energy. The Hum is fed by eight **heartstones** buried in the station and the
caves, and it has hold of the Catamaran too. Every engine Poom fires drains
into the moon. To leave, he has to go down through the crags, the station and
the hive itself, and break all eight heartstones before Cal's salvage barge
arrives. And somewhere under the crust, faint and impossible, Auntie Static's
radio is playing. "Heavens to Mergatroid, sugar, what are you doing *down
there*?" She knows the mayday was Cal's before Poom does.

## Why the game works the way it does

| Game element | In the story |
|---|---|
| **The world map** | Thrum's crust, seen from the Catamaran's landing site. |
| **Levels are walls on the map** | The Hum's growth blocks the tunnels: you go through each place or you don't go on. |
| **C02, the first level** | The shaft down from the landing site, the only way in. |
| **C06, the gate** | The station's main lift. Getting it working opens the rest of the moon. |
| **The eight device rooms** | Each holds a **heartstone** on a cradle, guarded by spikes the Hum has grown. Touching one, or shooting it, breaks it. The switch beside its shaft is a station gantry the crew left behind. |
| **Keycards and doors** | The station's security levels: red, yellow, green and blue cards for bulkhead hatches. The Hum grows over the station, but it can't open a hatch. |
| **Switches** | The crew's levers by the heartstones, and traps: pulling one pours the station's power into the stone, and the Hum swallows the Catamaran. Game over. |
| **Moving platforms** | The station's cargo lifts and ore sleds, still running on their tracks. |
| **Hazards** | Acid and crystal spines in the crags; live conduits in the station; barbs in the hive. |
| **The two signs** | The crew's last logs, on terminals by the exits (C09 and C11), and possibly Auntie Static cutting in on one of them. |
| **Exits** | Airlock hatches and lift doors. |
| **The ending (C18, stars)** | The last heartstone breaks, the Hum goes quiet and lets go, and the Catamaran climbs off Thrum into open space, past Cal's salvage barge arriving to find nothing to salvage. Through the barge's window, for the first time, a grey-black panther's silhouette: the Shadow Poom arc begins. |
| **Score items** | The crew's things and Thrum's ore. The extra life is still a Poom bobblehead: "They're here too." |

## Three biomes

The levels split by shape and by what's in them. The tall levels are caves,
the long 29-high levels are station corridors, and the levels crowded with
creatures are the hive. The heartstone rooms appear in all three, because the
Hum has grown into every part of Thrum. Each room should look like the hive,
whatever biome its level is.

| Biome | Levels | What it's like |
|---|---|---|
| **The Crags** | C02, C03, C04, C05, C06, C07 | Thrum's outer caves, which you reach first: dark violet rock, glowing fungus, acid pools, crystal spines. The first wave, from the landing site down to the main lift (C06). Two heartstones (C05, C07). |
| **Station Delve** | C08, C10, C11, C12, C14, C15 | The mole crew's mining and research station: riveted steel, hatches, lifts, terminals, flickering lights. The long corridor levels and the two keycard puzzles (C11, C15). Four heartstones. |
| **The Hive** | C09, C13, C16, C17 | The Hum's own body, deepest down: ribbed, glowing walls and barbed membranes, crowded with creatures (C09 has 32, C13 21). C17, the last, has the final heartstone and both kinds of switch. Two heartstones. |

## The creatures

Set in `ENEMY_OF.C`. Type 01 crowds the early levels (four in C02, the
first) and 02 the deep ones (17 in the Mergatroid Nursery), so 01 is the
gentle Mergatroid and 02 the deadly Husk. The playtests found the other way
round put four Husks in the first level.

| Type | Count | Engine kind | Proposal |
|---|---|---|---|
| 01 | 59 | pusher (x) | **Mergatroids**: drifting, glowing jelly-things of the Hum, the Book's nod to its namesake; harmless, they bump you away. Jump on one to dim it for a while. |
| 02 | 73 | walker (V) | **Husks**: armoured crawlers the Hum grows from the rock; deadly to touch, they take a few shots. |
| 05 | 33 | charger (B) | **Skitters**: fast six-legged things that rush you on sight. |
| 04 | 29 | shover (T) | **Shellbacks**: slow, armoured, can't be hurt; they shove. |
| 03 | 16 | shooter (K) | **Spitters**: rare and stationary; they spit along the floor. |

## Items

| Book 1 | Book 2 proposal |
|---|---|
| bottle caps and the rest (score) | ore chips, crew ration packs, data slugs, mole lanterns, a gold drill bit, a crystal geode |
| energy cell | power cell (the station's) |
| Poom bobblehead (extra life) | still a Poom bobblehead. Nobody knows. |
| Vault keycards | station security cards, the same four colours |
| ship parts | **heartstones** (broken, not carried) |

## In the game

All in `BOOK_TEXT.C` in `js/game.js`.

- **Place names** (level titles and map labels):

  | Biome | Levels |
  |---|---|
  | The Crags | C02 The Landing Shaft, C03 Fungus Hollow, C04 Lantern Caves, C05 The Spine Garden, C06 The Main Lift, C07 Crystal Drop |
  | Station Delve | C08 The Ore Line, C10 The Long Gallery, C11 The Security Wing, C12 The Assay Labs, C14 The Drill Hall, C15 The Records Room |
  | The Hive | C09 The Hive Mouth, C13 The Mergatroid Nursery, C16 The Heart Chambers, C17 The Hum's Core |

- **The two logs.**
  - **C09, the Hive Mouth:** Foreman Digby's last log ("All crew to the lifts"), then Auntie Static under the static: "Heavens to Mergatroid, sugar, what are you doing down there?"
  - **C11, the Security Wing:** the station was evacuated with all the crew safe, and its beacon was switched off six years ago. "Then who sent the mayday?"

  Either can be read first.
- **The crew.** The moles got out safely, under **Foreman Digby**.
- **The ending.**
  1. The Hum falls silent.
  2. The Catamaran climbs out.
  3. Cal's salvage barge passes the other way, with a grey-black panther in its window.
  4. Auntie: "That was Cal's barge, sugar. He set that mayday for you."
  5. The End of Book Two.

## Settled

- **Heartstones are destroyed.** Touching one, or shooting it, breaks it. It
  stays broken, unless Poom dies before leaving the level, in which case it
  is whole again.
- **The Book ends when the eighth heartstone breaks:** the Hum lets go of the
  Catamaran at once. The levels without one still have to be crossed, because
  on this map an unfinished level is a wall.
- **The mayday was Cal's**, a trap (above).

## Questions to settle

1. ~~The switches~~ Settled: game-over traps (above).
2. ~~Is the mole crew alive?~~ Yes, evacuated safely (the C11 log), and that
   log is where Poom learns the mayday was fake.
