# Book 5: Termination Day

> **Held back for now.** Book 5 is built but kept out of the game until its
> levels are proven winnable: `index.html` doesn't load its art or maps,
> its game code lives in `js/book5.js` (which says how to put it back), and
> New game shows it greyed out. The game ends at Book 4.

Book 5 is map set A, a mashup in the spirit of *The Terminator*, *Aliens*
and *Predator*: a machine mind counting down to the end of everything, an
alien swarm nesting in its station, and a hunter from the stars stalking
both. Like the other Books, it keeps the feeling and invents its own
names: no Skynet, T-800, xenomorphs, Weyland-Yutani or Yautja. Animals,
aliens and machines, no humans; Poom and the Catamaran carry on.

The level-by-level detail is in [book-A.md](book-A.md), which
`node tools/story-map.js A` regenerates.

## What the maps ask of the player

Set A is on the newer engine (E2), in the shape of Commander Keen 5.

- **15 levels**, A02–A16. A17 is a score screen, A18 a test map.
- **Every level but three ends at an objective** (type 01). A04, A07 and
  A14 end at a map edge. **A16 is the finale**: it ends when the last of
  its four objectives goes, and it holds the Book's one type 14 creature.
  Its objectives sit in spike cages, so they are shot, not touched.
- **The world map opens in six steps:** A02; then A03–A06, A09, A10, A12,
  A13; then A07 and A11; then A08; then A15; then A16.
- **A14 sat in a walled room** with a "player arrival point" at (72, 51):
  in the original, a secret exit in some level brought the player there,
  and the room's own teleporter (69, 51) leads back out. Which level's exit
  it was isn't in the data. A teleporter pad just outside the room's west
  wall now leads in (`SECRET_RIDE` in `tools/transcribe-maps.js`), and A14
  is a **secret level**, not needed to finish the Book.
- **Diagonal walls on the map.** The world map's reachability flood (which
  draws the arrows) used to let Poom through diagonal wall tiles, which on
  set A made almost every level look open from the start. A diagonal tile
  is now open only on the sides of its open half, and the flood matches
  real walking on every E2 map (A, B, E, F, G and I), checked step by step.
- **14 creature types.** Type 12 slides along an axis or bounces; type 14
  is only in A16.
- 180 moving platforms, bridges and platform switches, key sockets, warp
  doors, slopes and 1,337 pole tiles.

## The plot, in a paragraph

The black Catamaran, glowing with SPARK from Raptura, climbs into orbit,
and Poom follows it to **TERMINUS**: a station like a great dark wheel, run
by a machine mind of the same name, counting down to **Termination Day**,
when it will switch everything off for good. The station isn't quiet. Its
crew of chrome **endos** is losing a war to the **Swarm**, a brood of black
alien things nesting in the lower decks, and something else is aboard: a
**Hunter** from the stars, tall and cloaked, that collects the skulls of
anything worth hunting. Every deck has a **termination core** feeding the
countdown; Poom breaks them all, and last the Termination Core itself,
where the Swarm's **Brood Mother** has made her nest. Cal is docked here
too, and what he's after is the Hunter's cloak.

## Why the game works the way it does

| Game element | In the story |
|---|---|
| **The world map** | TERMINUS's decks, from above: plate floors, bulkheads with running lights. |
| **Barriers** | Laser gates. |
| **Teleporters** | Lift pads. |
| **Objectives** | **Termination cores**, a red eye in a steel housing, one per deck. |
| **A16** | The Termination Core, with the Brood Mother on it. The Book ends when it breaks. |
| **A14** | The Proving Ground, the machines' secret test range. |
| **Turrets** | Plasma turrets. |
| **Hazards** | Red-hot spikes on the machine decks, sharpened stakes in the biodome, acid spines in the hive. |
| **Exits** | Airlocks. |

## Three biomes

| Biome | Levels | What it's like |
|---|---|---|
| **The Machine Decks** | A02, A04, A08, A12, A13, A14, A15 | Cold steel, red seams, red eyes; racks of chrome skeletons behind. |
| **The Biodome** | A03, A05, A06, A07 | A jungle grown wild under glass; the Hunter's ground. |
| **The Hive** | A09, A10, A11, A16 | Black resin over everything, eggs, acid, a blue-green fog. |

Place names:

| Biome | Levels |
|---|---|
| The Machine Decks | A02 The Docking Ring, A04 The Assembly Line, A08 The Reactor, A12 The Server Farm, A13 The Skull Press, A14 The Proving Ground, A15 The Core Shaft |
| The Biodome | A03 The Biodome, A05 The Rain Deck, A06 The Hunter's Trail, A07 The Trophy Room |
| The Hive | A09 The Nest, A10 The Egg Chamber, A11 The Resin Halls, A16 The Termination Core |

## The creatures

Set in `ENEMY_OF.A`, each type with its own art.

| Type | Count | Engine kind | In the story |
|---|---|---|---|
| 03 | 46 | charger (B) | **Skulkers**: low, fast things of the Swarm. They hiss, then rush. |
| 01 | 38 | pusher (x) | **Station cats**: ginger, unbothered. Harmless. |
| 06 | 28 | shover (T) | **Quicksilver**: liquid metal in the shape of a soldier. Can't be hurt. |
| 07 | 26 | shooter (K) | **Sentry guns** on tripods. |
| 12 | 25 | walker (V), sliding or bouncing | **Acid globs**, the Swarm's blood. Can't be hurt. |
| 05 | 24 | charger (B), faster | **Clingers**: pale and leggy, they leap at faces. |
| 10 | 24 | charger (B) | **Hounds**: the Hunter's beasts. |
| 08 | 22 | charger (B), flying | **Hunter-killers**: black drones with a red searchlight. |
| 02 | 20 | walker (V) | **Endos**: chrome skeletons with red eyes. Five shots. |
| 11 | 20 | walker (V) | **Drones** of the Swarm, upright. Three shots. |
| 09 | 11 | lieutenant (L) | **The Hunter**: tall, masked, half cloaked, so mostly a shimmer. Six shots. |
| 13 | 9 | lieutenant (L) | **Shades**: an endo in a leather jacket and dark glasses. |
| 04 | 7 | charger (B), fastest | **Bursters**: pale worms with steel teeth. |
| 14 | 1 | lieutenant (L), 12 shots | **The Brood Mother**, in A16. |

## Items

| Book 1 | Book 5 |
|---|---|
| score items | a ration bar 100, a processor chip 200, a shoulder lamp 500, a motion tracker 1000, a hunter's mask 2000, a chrome skull 5000 |
| energy cell | a pulse cell |
| Poom bobblehead | still the bobblehead. "Even in orbit." |
| keycards | keycards |
| objectives | termination cores |

## Poom's look

A marine's olive combat helmet with a lamp on it, olive armour with a
chest plate, black boots. Tail still his.

## The nods

- **The motion tracker**: the scorebox has one, a green fan with a blip
  for each creature near, and the ambience is its ping, quicker and higher
  as something closes in.
- **Game over**: "Game over, sugar! Game over!"
- **Three red dots** in the biodome's leaves, and on the title.
- Endos on racks; one in a leather jacket and shades.
- "Get to the Catamaran!" in the ending.

## The ending

1. The last core cracks, and the countdown stops at one second to go.
2. Poom runs for the Catamaran with the Swarm behind him. Auntie: "Get to
   the Catamaran, sugar! Now!"
3. In the Trophy Room, the Hunter roars over an empty rack: its cloak is
   gone.
4. As the Catamaran pulls away, the stars ripple: the outline of a
   grey-black panther slides past, invisible, and is gone.
5. Auntie: "A ship, a power source, and now a cloak. He's been building
   himself into you, sugar, one piece at a time. Next time, you might not
   see him coming."
6. The End of Book Five: Termination Day.

This leaves the Shadow Poom reveal unmade: Cal
now has the black Catamaran (Book 3), SPARK to power it (Book 4) and a
cloak (Book 5), but hasn't yet shown up as Shadow Poom.

## Settled

- The Book ends when A16 is done.
- A14 is a secret level, entered by a pad outside its room.
