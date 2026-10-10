# Book 2: the story (first draft)

Book 2 is map set C, in the spirit of *Metroid*: a lone hunter, a dead
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

### Switches: new engine work

There are 19 switch tiles of two kinds. The engine doesn't support either yet:
it only wires up switches for the newer engine's maps.

- **Behaviour 25, 12 of them.** One sits beside the spike shaft in every
  device room. Two more are in C06 and C17, beside spike pits. My reading is
  a bridge switch: it extends a walkway over the pit or shaft.
- **Behaviour 23, 7 of them.** These sit in open areas: near the start of
  C05, and four in C17. My reading is a light switch, which darkens or lights
  the level. Keen 2 had both.

Both readings need the map maker to confirm, and both need building. Lights
going out would suit Metroid very well.

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
radio is playing. She knows the mayday was Cal's before Poom does.

## Why the game works the way it does

| Game element | In the story |
|---|---|
| **The world map** | Thrum's crust, seen from the Catamaran's landing site. |
| **Levels are walls on the map** | The Hum's growth blocks the tunnels: you go through each place or you don't go on. |
| **C02, the first level** | The shaft down from the landing site, the only way in. |
| **C06, the gate** | The station's main lift. Getting it working opens the rest of the moon. |
| **The eight device rooms** | Each holds a **heartstone** on a cradle, guarded by spikes the Hum has grown. Touching one, or shooting it, breaks it. The switch beside its shaft is a station gantry the crew left behind. |
| **Keycards and doors** | The station's security levels: red, yellow, green and blue cards for bulkhead hatches. The Hum grows over the station, but it can't open a hatch. |
| **Switches** | Gantry switches extend a walkway over a pit (behaviour 25). Power switches bring the lights up, or put them out (behaviour 23). |
| **Moving platforms** | The station's cargo lifts and ore sleds, still running on their tracks. |
| **Hazards** | Acid and crystal spines in the crags; live conduits in the station; barbs in the hive. |
| **The two signs** | The crew's last logs, on terminals by the exits (C09 and C11), and possibly Auntie Static cutting in on one of them. |
| **Exits** | Airlock hatches and lift doors. |
| **The ending (C18, stars)** | The last heartstone breaks, the Hum goes quiet and lets go, and the Catamaran climbs off Thrum into open space, past Cal's salvage barge arriving to find nothing to salvage. |
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

The engine's automatic assignment gave set C: 02 pusher, 01 walker, 05
charger, 04 shover, 03 shooter. Book 2 can set its own (`ENEMY_OF.C`).
Proposed:

| Type | Count | Engine kind | Proposal |
|---|---|---|---|
| 02 | 73 | pusher (x) | **Glimmers**: drifting, glowing jelly-things of the Hum; harmless, they bump you away. Jump on one to dim it for a while. |
| 01 | 59 | walker (V) | **Husks**: armoured crawlers the Hum grows from the rock; deadly to touch, they take a few shots. |
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

## Settled

- **Heartstones are destroyed.** Touching one, or shooting it, breaks it. It
  stays broken, unless Poom dies before leaving the level, in which case it
  is whole again.
- **The Book ends when the eighth heartstone breaks:** the Hum lets go of the
  Catamaran at once. The levels without one still have to be crossed, because
  on this map an unfinished level is a wall.
- **The mayday was Cal's**, a trap (above).

## Questions to settle

1. **The switches:** confirm bridge (25) and lights (23) with the map maker,
   then build them in the engine.
2. **Is the mole crew alive?** Book 2 has no rescues, so the crew left or are
   lost. The two logs can say which, gently. They could also be where Poom
   learns the mayday was fake.
