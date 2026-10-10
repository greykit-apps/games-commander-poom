# Book 3: The Island of Dr Claw

Book 3 is map set D, an island lair in the spirit of *Metal Gear Solid* and
*Evil Genius*: a sneaking mission into a villain's volcano. It leans toward
1998's *Metal Gear Solid*, which is close in age to the game's look: night
operations, searchlights, a radio voice in your ear, guards who shout "!"
when they see you, and a giant walking machine in a hangar. Like the other
Books, it keeps the feeling and invents its own names: no Snake, Shadow
Moses, Metal Gear, FOXHOUND, codec or Otacon. Animals, not humans; Poom and
the Catamaran carry on.

The level-by-level detail is in [book-D.md](book-D.md), which
`node tools/story-map.js D` regenerates.

## What the maps ask of the player

Set D is on the older engine (E1), like Books 1 and 2.

- **16 levels, one chapter.** D18 is the ending cutscene, D19 a title.
- **The world map is an archipelago.** The source map draws a round
  lagoon, with land only in pockets: islets. Walking alone reaches D02 and
  D03 and nothing else. What joins the islets is wiring in the map's
  sprite plane, in the Keen engine's codes (now read by
  `tools/transcribe-maps.js`):
  - **16 teleporters** (code `0x0Fab`: teleporter *a* sends you to
    teleporter *b*). They link every islet to the next.
  - **A ferry route** over the water (`0x2000`, stops `0x2100`) between two
    landings (`0x2200`), in the spirit of Keen 3's Messie. It is the only
    way to D14's islet; it leaves from the islet of D16 and D17.
- **The order the map opens:**
  1. D02 and D03, on the beach where Poom washes up.
  2. D04, D05 and D06 (D04 and D05 across a teleporter).
  3. Everything else except the last two: D07–D13, D15, D16.
  4. D17, behind D16, and D14, over the water by ferry.
- **D17 is a finale.** A 25 × 24 room: a machine ringed with spikes, six
  objective items round it (type 01, which don't end the level) and one in
  its sealed heart (type 02, which does). Nothing can reach the heart, so
  the six must be what gets to it: **breaking all six blows the heart by
  itself**, which ends the level. They can be shot or touched.
- **Eleven creature types and turrets.** Types 09, 10 and 11 only appear in
  D17. Turrets fire along a line, both ways in turn (22 horizontal, 13
  vertical), and cluster in D10 and D13 (11 each).
- **Keycards** in D04, D05, D10, D11, D12, D13, D15 and D16 (all four
  colours in D10 and D16). Two levels have a door whose keycard isn't in
  the level: D05's yellow door and D10's red one. The engine lets such a
  door take any keycard the level has (as a door of no stated colour), so
  neither level can be stuck; the map maker can say whether they were
  meant to be optional.
- **25 moving platforms**, horizontal and vertical.
- **No signs, no rescues, no ship.**

## The plot, in a paragraph

Out past Thrum the Catamaran flies over a warm sea at night, and something
on an island below reaches up and **grabs it**: a magnet crane the size of a
church, which pulls the ship down into a volcano. This is **Isla Garra**,
the private island of **Dr Claw**, a white Persian of enormous fluff and no
conscience, who builds doomsday machines for anyone who can pay. His latest
client is a grey-black panther who'd very much like a Catamaran of his own.
Dr Claw's **Copycat**, a copying machine deep in the volcano, is taking the
Catamaran apart to make a black copy of it, plank by plank. Poom bails out
over the lagoon, washes up on the beach with a radio and nothing else, and
goes in quietly. Auntie Static talks him through it, on a frequency she
shouldn't know.

## Why the game works the way it does

| Game element | In the story |
|---|---|
| **The world map** | Isla Garra by night: islets in the volcano's flooded crater. |
| **Teleporters** | The base's **transit tubes**: pneumatic pods under the lagoon between islets. |
| **The ferry** | **Bruce**, Dr Claw's robot shark, which patrols the lagoon on a fixed route. Ride it from the Hangar islet to the Box Depot. |
| **Levels are walls on the map** | Locked compounds: you get through them or you don't get past. |
| **D17** | The **Copycat**'s chamber. Its six power cores are the type 01 objectives; break all six and it overloads. |
| **The Book ends at D17** | When the Copycat blows, the Catamaran is free and Poom flies it out. Levels not yet done are skipped. |
| **Keycards and doors** | Security cards for the base's blast doors, in four colours. |
| **Turrets** | **Gun cameras**: security cameras with a gun under them, sweeping both ways. |
| **Moving platforms** | Cargo lifts and catwalk trolleys. |
| **Hazards** | Barbed wire and tripwire mines outside; electrified floor plates inside; lava in the crater. |
| **Exits** | Blast doors with a green light. |

## Three biomes

| Biome | Levels | What it's like |
|---|---|---|
| **The Shore** | D02, D03, D04, D05, D06, D07 | Outdoors at night: sand, jungle, sandbags, chain-link fence, watchtowers, searchlights sweeping a navy sky. |
| **The Base** | D08, D10, D11, D12, D13, D14, D15 | Inside: grey-green concrete bunkers, steel plate, hazard stripes, crates, vents, red alert lamps. |
| **The Crater** | D09, D16, D17 | Dr Claw's lair inside the volcano: black rock lit by lava, polished villain chrome and red, monitor walls. |

Place names:

| Biome | Levels |
|---|---|
| The Shore | D02 The Beach, D03 The Docks, D04 The Jungle Trail, D05 The Perimeter Fence, D06 The Kennels, D07 The Searchlights |
| The Base | D08 The Barracks, D10 The Comms Tower, D11 The Security Office, D12 The Brig, D13 The Armoury, D14 The Box Depot, D15 The Clawbot Line |
| The Crater | D09 The Magma Works, D16 The Hangar, D17 The Copycat |

## The creatures

Set in `ENEMY_OF.D`. Each type has its own art (an `art` name on top of
the engine kind), so two types can share a behaviour and still look
different.

| Type | Count | Engine kind | In the story |
|---|---|---|---|
| 04 | 115 | charger (B) | **Claw guards**: stoats in olive fatigues and caps. They patrol; when one sees Poom, a red **!** pops over its head and it runs at him. One shot. |
| 02 | 46 | walker (V) | **Heavies**: stoats in body armour and helmets. Deadly to touch, four shots. |
| 01 | 42 | pusher (x) | **Boxers**: guards hiding under cardboard boxes, shuffling about. Harmless; they bump you. Jump on one to flatten its box for a while. |
| 06 | 43 | shover (T) | **Clawbots**: Dr Claw's robot crabs. Armoured, can't be hurt; they shove. |
| 05 | 25 | shooter (K) | **Gunners**: a guard behind sandbags with a machine gun, firing along the floor. Can't be hurt. |
| 03 | 22 | charger (B) | **Guard dogs**: Dobermans. Fast, one shot. |
| 08 | 12 | lieutenant (L) | **Ocelots**: Dr Claw's elite, an ocelot in a beret and long coat who twirls his pistols. Five shots. |
| 07 | 4 | charger (B), faster, three shots | **Ninjas**: a stealth-suited stoat with a glowing visor. |
| 09 | 2 | shover (T) | Clawbots, guarding the Copycat. |
| 10 | 1 | shooter (K) | **Dr Claw himself**, at the Copycat's console, firing its laser along the floor. |
| 11 | 1 | pusher (x) | **Mr Squeaks**, Dr Claw's white mouse. |

## Items

| Book 1 | Book 3 |
|---|---|
| score items | dog tags 100, a ration pack 200, a floppy disk 500, a cassette tape 1000, a gold bar 2000, Dr Claw's diamond 5000 |
| energy cell | a battery pack |
| Poom bobblehead (extra life) | still the bobblehead. Dr Claw keeps one in a glass case. |
| keycards | security cards |

## Poom's look: the sneaking suit

A dark slate bodysuit with lighter armour panels, a red bandana (like his old helmet) tied over
his ears with its tails flying, and a radio earpiece. Paws and tail still
his.

## The nods

- **"!"**: a guard who spots Poom shouts it, with the alert sting.
- **The radio**: Auntie Static's lines are radio calls, and the game over is
  her shouting his name: "Poom? Poom! POOOOM!"
- **Cardboard boxes**: the Boxers, and the Box Depot full of them.
- **The walking machine**: the Hangar's backdrop is **Metal Claw**, a
  two-legged tank with a claw for a hand.
- **Ocelots** who twirl pistols; a **ninja** with a glowing eye.

## The ending

1. The Copycat overloads and the volcano rumbles.
2. Dr Claw escapes in a pod shaped like a fish, shaking a paw: "This isn't
   over, puma!"
3. The Catamaran blasts out of the crater.
4. Over the sea, something keeps pace with it: **a black Catamaran**, the
   one copy the Copycat finished. At its helm is a grey-black panther. It
   peels off into the dark.
5. Auntie: "Well, sugar. Now there are two of you."
6. The End of Book Three: The Island of Dr Claw.

## Settled

- The Book ends when D17 is done.
- The ferry and the teleporters come from the map's own data, not guesses.
