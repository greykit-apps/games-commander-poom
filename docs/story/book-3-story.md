# Book 3: The Island of Dr Cal

Book 3 is map set D, an island lair in the spirit of *Metal Gear Solid* and
*Evil Genius*: a sneaking mission into a villain's volcano. It leans toward
1998's *Metal Gear Solid*, which is close in age to the game's look: night
operations, searchlights, a radio voice in your ear, guards who shout "!"
when they see you, and a giant walking machine in a hangar. Like the other
Books, it keeps the feeling and invents its own names: no Snake, Shadow
Moses, Metal Gear, FOXHOUND, codec or Otacon. Animals, not humans; Poom and
the Catamaran carry on.

The villain is **Dr Cal**: Junk Baron Cal himself, in his island persona.
He is built on Dr Claw, who is in turn built on Dr No, with a bit of Dr
Moreau stuck in. This is the first Book where Cal appears in person.

The level-by-level detail is in [book-D.md](book-D.md), which
`node tools/story-map.js D` regenerates.

## What the maps ask of the player

Set D is on the older engine (E1), like Books 1 and 2.

- **16 levels, one chapter.** D18 is the ending cutscene, D19 a title.
- **The world map is an archipelago.** The source map draws a round
  lagoon, with land only in pockets: islets. Walking alone reaches D02 and
  D03 and nothing else. What joins the islets is wiring in the map's
  sprite plane, in the Keen engine's codes (read by
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
  itself**, which ends the level. They can be shot through the spikes, or
  touched.
- **Eleven creature types and turrets.** Types 09, 10 and 11 only appear in
  D17. Turrets fire along a line, both ways in turn (22 horizontal, 13
  vertical), and cluster in D10 and D13 (11 each).
- **Keycards** in D04, D05, D10, D11, D12, D13, D15 and D16 (all four
  colours in D10 and D16). On this engine a pickup is a tile, so a
  creature standing on one hides it in the source grid. That hid one key
  in D05 and one in D10; the transcriber now puts such pickups back, and
  every door has its key.
- **One-way walls.** 60 wall tiles are solid on one side only: Poom can
  walk through them one way and not back (`(` and `)`, read by the
  transcriber from the tiles' side flags). D13's start room has no other way
  out. They're drawn as rock with a faint arrow the way through.
- **25 moving platforms**, horizontal and vertical.
- **D16, the Hangar**, changed by hand after it was played through: two
  tunnels a tile too low for Poom are opened, under (38-39, 86) and
  (32-33, 113) (`OPEN_TILES`), and the two fires beside its lower exit, at
  (120, 113) and (120, 115), are gone (`CLEAR_HAZARDS`).
- **No signs, no rescues, no ship.**

## The plot, in a paragraph

Out past Thrum the Catamaran flies over a warm sea at night, and something
on an island below reaches up and **grabs it**: a magnet crane the size of
a church, which pulls the ship down into a volcano. This is **Isla Garra**,
home of **Dr Cal**: a grey-black panther in a white lab coat and a
monocle, with a doctorate nobody has ever seen. He builds doomsday
machines, and in the labs under the volcano he breeds his own staff. He has
always wanted a Catamaran of his own, and deep in the volcano his
**Copycat** is taking Poom's apart to build a black copy, plank by plank.
Poom bails out over the lagoon, washes up on the beach with a radio and not
much else, and goes in quietly. Auntie Static talks him through it, on a
frequency she shouldn't know.

## Dr Cal

- **Who he is.** Junk Baron Cal, the grey-black panther who has been
  offstage since Book 1, now on his own island and calling himself a
  doctor. The players who know Cal know it's him; the game never makes a
  fuss of it.
- **Dr No and Dr Claw.** The volcano lair, the magnet crane, the monocle,
  the doomsday machine, an evil genius with a pet (a white mouse, Mr
  Squeaks, rather than a cat on his lap) and a robot shark in the lagoon.
- **Dr Moreau.** He breeds his own staff in the labs: the stoat guards, the
  Heavies, the guard dogs and the ninjas ("bred in Dr Cal's labs, and
  nobody wants to know how").
- **Tone.** Affectionate, as always with Cal: a schemer and a show-off, never
  cruel. He keeps a Poom bobblehead in a glass case with the eyes
  scratched out, and his name is top of the high-score table, above Junk
  Baron Cal's.
- **The arc.** Book 3 is where Cal gets his own ship: the black Catamaran,
  the one copy the Copycat finished. Shadow Poom is still to come.

## Why the game works the way it does

| Game element | In the story |
|---|---|
| **The world map** | Isla Garra by night: islets in the volcano's flooded crater. |
| **Teleporters** | The base's **transit tubes**: pneumatic pods under the lagoon between islets. |
| **The ferry** | **Bruce**, Dr Cal's robot shark, which patrols the lagoon on a fixed route. Ride it from the Hangar islet to the Box Depot. |
| **Levels are walls on the map** | Locked compounds: you get through them or you don't get past. |
| **D17** | The **Copycat**'s chamber. Its six power cores are the type 01 objectives; break all six and it overloads. Dr Cal is at its console. |
| **The Book ends at D17** | When the Copycat blows, the Catamaran is free and Poom flies it out. Levels not yet done are skipped. |
| **Keycards and doors** | Security cards for the base's blast doors, in four colours. |
| **Turrets** | **Gun cameras**: security cameras with a gun under them, sweeping both ways. |
| **Moving platforms** | Cargo lifts and catwalk trolleys. |
| **Hazards** | Barbed wire outside; electrified floor plates inside; vents of fire in the crater. |
| **Exits** | Blast doors with a green light. |

## Three biomes

| Biome | Levels | What it's like |
|---|---|---|
| **The Shore** | D02, D03, D04, D05, D06, D07 | Outdoors at night: sand, jungle, sandbags, watchtowers, searchlights sweeping a navy sky. |
| **The Base** | D08, D10, D11, D12, D13, D14, D15 | Inside: grey-green concrete bunkers, steel plate, hazard stripes, vents, red alert lamps. |
| **The Crater** | D09, D16, D17 | Dr Cal's lair inside the volcano: black rock lit by lava, villain chrome and red, monitor walls. |

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
| 04 | 115 | charger (B) | **Claw guards**: stoats in olive fatigues and caps, bred in the labs. They patrol; when one sees Poom, a red **!** pops over its head and it runs at him. One shot. |
| 02 | 46 | walker (V) | **Heavies**: stoats in body armour and helmets. Deadly to touch, four shots. |
| 01 | 42 | pusher (x) | **Boxers**: guards hiding under cardboard boxes, shuffling about. Harmless; they bump you. Jump on one to flatten its box for a while. |
| 06 | 43 | shover (T) | **Clawbots**: Dr Cal's robot crabs. Armoured, can't be hurt; they shove. |
| 05 | 25 | shooter (K) | **Gunners**: a guard behind sandbags with a machine gun, firing along the floor. Can't be hurt. |
| 03 | 22 | charger (B) | **Guard dogs**: Dobermans. Fast, one shot. |
| 08 | 12 | lieutenant (L) | **Ocelots**: Dr Cal's elite, an ocelot in a beret and long coat who twirls his pistol. Five shots. |
| 07 | 4 | charger (B), faster, three shots | **Ninjas**: stealth-suited, a glowing red eye. |
| 09 | 2 | shover (T) | Clawbots, guarding the Copycat. |
| 10 | 1 | shooter (K) | **Dr Cal himself**, at the Copycat's console: grey-black, yellow-eyed, lab coat and monocle, firing a laser pistol along the floor. |
| 11 | 1 | pusher (x) | **Mr Squeaks**, Dr Cal's white mouse. |

## Items

| Book 1 | Book 3 |
|---|---|
| score items | dog tags 100, a ration pack 200, a floppy disk 500, a cassette tape 1000, a gold bar 2000, Dr Cal's diamond 5000 |
| energy cell | a battery pack |
| Poom bobblehead (extra life) | still the bobblehead. Dr Cal keeps one in a glass case, with the eyes scratched out. |
| keycards | security cards |
| objectives (D17) | the Copycat's six power cores, and its red heart |

## Poom's look: the sneaking suit

A dark slate bodysuit with lighter armour on the chest, an olive belt,
black boots, and a red bandana (like his old helmet) tied over his ears,
its knot and tails behind. Paws and tail still his.

## The nods

- **"!"**: a guard who spots Poom shouts it, with the alert sting.
- **The radio**: Auntie Static's lines are radio calls, and losing a life
  is her shouting his name: "Poom? Poom! POOOOM!"
- **Cardboard boxes**: the Boxers, and the Box Depot full of them.
- **The walking machine**: the Hangar's backdrop is **Metal Claw**, a
  two-legged tank with a claw for a hand.
- **Ocelots** who twirl pistols; **ninjas** with a glowing eye.
- **Bond**: the magnet crane, the volcano, the monocle, the robot shark, the
  pet in the villain's lab.

## The ending

1. The Copycat goes up with a bang that rattles the whole volcano: red
   lights, klaxons, guards running every way at once.
2. Out of the Hangar roars the one copy the Copycat finished, **a black
   Catamaran**. At its helm, monocle glinting, lab coat flapping, Dr Cal:
   "This isn't over, puma!"
3. Poom finds his own Catamaran in the Hangar, nearly whole, and blasts it
   out of the crater into the night.
4. Over the sea, the black Catamaran keeps pace with him in the dark for a
   while. Its pilot gives Poom a little salute, and peels away.
5. Auntie: "Well, sugar. Now there are two of you."
6. The End of Book Three: The Island of Dr Cal.

## Settled

- **Every level is winnable** (2026-10-10). D16 was played through by hand.
- The villain is Dr Cal, Cal's island persona (Dr Claw, Dr No, a bit of Dr
  Moreau), and this is Cal's first appearance in person.
- The Book ends when D17 is done.
- The ferry and the teleporters come from the map's own data, not guesses.
