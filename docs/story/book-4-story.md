# Book 4: Descent into Raptura

Book 4 is map set E, a drowned city in the spirit of *BioShock*: an
art-deco metropolis of otters at the bottom of the sea, built by a man who
wanted no rules, ruined by the miracle substance that powered it, haunted
by its own citizens and guarded by giants in diving suits. Like the other
Books, it keeps the feeling and invents its own names: no Andrew Ryan,
ADAM, EVE, Big Daddies, Little Sisters, plasmids or Vita-Chambers. The
city, and the Book's title, say **Raptura**. Animals, not humans;
Poom and the Catamaran carry on.

The level-by-level detail is in [book-E.md](book-E.md), which
`node tools/story-map.js E` regenerates.

## What the maps ask of the player

Set E is on the newer engine (E2), in the shape of Commander Keen 4.

- **17 levels**, E02–E18. E19 is the ending cutscene, E20 a score screen.
- **Eight rescues**: E04, E05, E07, E11, E13, E14, E17 and E18 end when
  Poom reaches the one to rescue. E05 can also be left by an exit door.
- **Swimming.** E10's objective is a swim power-up; with it, Poom can
  cross the map's water, which is what keeps E16, E17 and E18 shut till
  then. E18 is under water throughout.
- **The world map had two levels nobody could reach**, now fixed in
  `tools/transcribe-maps.js`:
  - **E10** sat in a strip of tiles below the camera's limit (row 59).
    That strip is where Keen 4 keeps the frames of a level that fades in
    and out on the map. Its entrance now stands where the mirage shows,
    beside its done-flag at (19, 22), and the strip is cropped off.
  - **E15** sat in a sealed pocket. The map's one special object, at (13,
    19), is what carries the player there (Keen 4's giant foot). It is now
    a pair of teleporters, there and back, and E15 is a **secret level**,
    not needed to finish the Book.
- **Two non-rescue NPCs** (type 02, in E06 and E08: Keen 4's hint giver)
  and one in E15 become things to read, like signs: Book 4's **audio
  diaries**.
- **17 creature types**, four of them (14–17) only in E18, under water.
- Turrets cluster in E12 (30), E13 (16), E14 and E15.
- Warp doors, key sockets, bridge and platform switches, slopes and poles
  throughout.

## The plot, in a paragraph

Poom follows the black Catamaran out over the sea. Far from anywhere, it
dives and is gone. Where it went down stands a lighthouse, and inside it a
bathysphere waits, going down. At the bottom of the sea is **Raptura**, a
city of otters built by **Sir Augustus Fathom**, a walrus who wanted a city
with no landlords, no lifeguards and no limits. It ran on **SPARK**, a glow
squeezed from sea slugs, which made its otters strong and then strange:
the **Splicers**. Now the glass weeps, the lights flicker, and the **Big
Brass**, great walking diving suits, stomp the halls. Somewhere down there
are the **Little Ones**, the city's last pups, sent out with jars to gather
SPARK; Poom has to find all eight and send them up. And Cal is down there
too, buying SPARK by the barrel for his black Catamaran.

## Why the game works the way it does

| Game element | In the story |
|---|---|
| **The world map** | The seabed round Raptura: sand and kelp, reef walls, deep trenches. |
| **Barriers** | Fallen bulkheads across the way. |
| **The water on the map** | Deep trenches. E10's swim power-up is **a diving suit**. |
| **Teleporters** (the secret ride) | A **bathysphere**, to Fathom's Vault and back. |
| **E10** | The **Phantom Pavilion**, which flickers in and out of the murk. |
| **Rescues** | The **Little Ones**. The Book ends when all eight are safe. |
| **Audio diaries** | Sir Augustus, the city's radio operator, and Fathom again in his vault. |
| **Turrets** | Brass security turrets. |
| **Hazards** | Sea urchins in the gardens, broken glass on the Promenade, steam vents in the Works. |
| **Exits** | Brass doors under a deco sunburst. |

## Three biomes

| Biome | Levels | What it's like |
|---|---|---|
| **The Kelp Gardens** | E02, E04, E06, E08, E10, E16, E18 | The city's glass-domed gardens on the seabed: sand, coral, sea grass, kelp ropes to climb. |
| **The Promenade** | E03, E05, E07, E11, E17 | The city proper: teal marble, gold trim, neon, great round windows on the sea. |
| **The Works** | E09, E12, E13, E14, E15 | Its industry: riveted iron, brass pipes, gauges, SPARK vats glowing pink. |

Place names:

| Biome | Levels |
|---|---|
| The Kelp Gardens | E02 The Kelp Steps, E04 The Coral Maze, E06 The Sunken Arboretum, E08 The Oyster Beds, E10 The Phantom Pavilion, E16 The Trench, E18 The Deep |
| The Promenade | E03 The Grand Promenade, E05 The Neptune Theatre, E07 The Hotel Fathom, E11 The Market Arcade, E17 The Drowned Ballroom |
| The Works | E09 The Slug Farm, E12 The Pumping Station, E13 The Foundry, E14 The Pressure Labs, E15 Fathom's Vault |

## The creatures

Set in `ENEMY_OF.E`, each type with its own art.

| Type | Count | Engine kind | In the story |
|---|---|---|---|
| 01 | 198 | pusher (x) | **SPARK slugs**: fat glowing sea slugs. Harmless; jump on one to squash it. |
| 02 | 65 | walker (V) | **Thugs**: big splicers with lead pipes. Four shots. |
| 04 | 72 | charger (B) | **Masked splicers**: otters in party masks. They cackle, then charge. |
| 06 | 29 | shover (T) | **Big Brass**: walking diving suits. Can't be hurt; they shove. |
| 07 | 24 | shooter (K) | **Leadheads**: a splicer in a fedora behind a bar, firing along the floor. |
| 05 | 20 | charger (B), faster | **Spider splicers**. Two shots. |
| 11 | 12 | charger (B), flying | **Security drones**: brass balls with propellers that fly straight at Poom. |
| 13 | 11 | shover (T) | **Iron crabs**. |
| 03 | 8 | pusher (x) | **Hermit crabs**. |
| 08 | 8 | charger (B) | **Houdini splicers**. Two shots. |
| 09 | 5 | lieutenant (L) | **Brutes**: Thugs in red. Five shots. |
| 10 | 3 | lieutenant (L) | **Rosie**: a rusted Big Brass that fights back. Eight shots. |
| 12 | 4 | walker (V) | **Gatekeepers**: gilded Big Brass. Six shots. |
| 14 | 9 | walker (V), swimming | **The gulper**: a huge fish that hunts. |
| 15 | 17 | walker (V), swimming | **Jellyfish**, drifting. |
| 16 | 24 | pusher (x), swimming | **School fish**. Harmless. |
| 17 | 13 | walker (V), swimming | **Sea mines**, bobbing in place. |

## Items

| Book 1 | Book 4 |
|---|---|
| score items | a silver dollar 100, a tin of sardines 200, a pearl 500, a gramophone record 1000, a gold pocket watch 2000, a jewelled egg 5000 |
| energy cell | a SPARK hypo |
| Poom bobblehead | still the bobblehead. "Even down here. Especially down here." |
| keycards | keycards |

## Poom's look

A brass diving helmet with his face in its round porthole, a green
cable-knit sweater, brown trousers. Tail still his.

## The nods

- "Would you kindly…": Auntie Static's line, twice.
- The audio diaries, and the city's founder who wanted no limits.
- Revival Booths for a lost life.
- The second diary is the city's radio operator, signing off to go
  "somewhere higher up, where a signal carries. Keep listening, sugar." The
  voice sounds awfully familiar: a hint at who Auntie Static is, not an
  answer.
- In Fathom's Vault, a polite grey-black gentleman has bought all the SPARK.

## The ending

1. The bathysphere rises with eight Little Ones at its portholes.
2. At the lighthouse, Poom finds the Catamaran waiting.
3. The black Catamaran breaks the surface, glowing with SPARK, and shoots
   into the sky with a grey-black panther at the helm.
4. Auntie: "He's got power to burn now, sugar. Best keep up."
5. The End of Book Four: Descent into Raptura.

## Settled

- The Book ends when all eight Little Ones are rescued. A level left by
  its exit door with its Little One still inside can be gone back into.
- E15 is a secret level.
