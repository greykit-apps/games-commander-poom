# The next Books: ideas

A working document for choosing each Book's theme. Nothing here is settled
unless it says so; change it freely.

Book 1 (map set H) is done: a wasteland in the spirit of *Fallout*. Every
later Book follows the same rules:

- **Animals, not humans.** Poom and the Catamaran carry on.
- **A mashup with its own names.** The Book borrows the feeling of a famous
  game or film, and none of its names, marks or characters.
- **Everything themes together.** That means the story, place names, signs
  and ending; three or four tilesets and a creature set; Poom's look; the
  title scene, menus and scorebox; and a sound set.
  (`BOOK_THEMES`, `THEME_OF_BOOK` and `BOOK_TEXT` in `js/game.js`.)

## Settled

- **The order of the first four Books.** `BOOK_ORDER` in `js/game.js` is now
  H, C, D, E, then A, B, F, G and I.

  | Book | Map set | Theme |
  |---|---|---|
  | 1 | H | the wasteland, in the spirit of *Fallout* (done) |
  | 2 | C | in the spirit of *Metroid* |
  | 3 | D | to choose |
  | 4 | E | to choose |

  Each one's story map is in `docs/story/book-<set>.md`.

## What each map set is like

Read off the transcribed maps. These features are what suit each set to a
theme.

| Set | Engine | What its maps are like |
|---|---|---|
| A | E2 | 15 levels, each ending at an objective. The most moving platforms by far (180), 21 bridges, many slopes and key sockets. |
| B | E2 | The most hazards (1,099) and conveyor belts (53); the key-carrying creatures are here. |
| C | E1 | Like Book 1's engine: simple, exits only, lots of hazards (1,039), only 5 creature types. |
| D | E1 | 11 creature types; the side-to-side and up-and-down turrets. |
| E | E2 | 8 rescues, 11 characters, a swimming level, water on the world map. |
| F | E2 | The widest world (120 tiles across), the most slopes (1,529), conveyor belts, levels that end at the map's edge. |
| G | E2 | A very tall, thin world (52 × 114), 12 objectives; one level already has battlements under a night sky. |
| I | E2 | Built like E: 7 rescues, two swimming levels, an island-dotted world map. |

## Proposals

Books 2, 3 and 4 are sets C, D and E. The order of sets A, B, F, G and I after
them is not settled.

- **Set C (Book 2): an alien hive, in the spirit of *Metroid* / *Alien*.**
  It is simple and hazard-heavy like Book 1, which suits a tense, quiet,
  derelict world: spores, acid pools, organic tunnels. *Settled as Book 2.*
- **Set A: sky islands, in the spirit of *Laputa* / *Skyward Sword*.** The
  platforms and bridges become airship decks and rope bridges between floating
  islands. Each level's objective is a "sky-shard" that keeps an island
  aloft. Alternative: a clockwork city of gears and lifts.
- **Set B: a robot factory, in the spirit of *Mega Man*.** The conveyors and
  hazards are ready-made assembly lines, crushers and sparking wire; the
  key carriers become worker robots holding security passes. Alternative:
  a candy factory, lighter in tone.
- **Set D (Book 3): a secret island base, in the spirit of *Metal Gear* and 1960s spy
  films.** Turrets become security cameras and guns, the many creature types
  become guards, dogs and drones, and the one objective is stolen plans.
- **Set E (Book 4): a sunken art-deco city, in the spirit of *BioShock*.** Rescues and
  swimming fit it best: an underwater city of otters, with eight trapped
  citizens to free.
- **Set F: a desert planet, in the spirit of *Dune* / *Tatooine*.** The wide
  world and its slopes turn into dunes. The conveyors become mining
  crawlers, and creatures burst up from the sand.
- **Set G: a gothic castle, in the spirit of *Castlevania*.** A tall world is
  a climb, and the battlements are already in the map art. Bats and armour,
  and 12 relics to recover.
- **Set I: pirate islands, in the spirit of *Monkey Island*.** This could close
  the series: rescuing a scattered crew, swimming between islands, a wry
  voice. It mirrors set E's structure.

## A thread across the Books

Book 1 ends with Junk Baron Cal watching the Catamaran climb: "Find out where
it's going." He could chase Poom through every Book, while Auntie Static's
radio somehow reaches him wherever he lands. The last Book would be the place
to say who she is, which answers the open question in
[book-1-story.md](book-1-story.md) without settling it now.

## Open questions

- After Book 4, which order for sets A, B, F, G and I?
- Does Cal appear in person in a later Book, or stay offstage until the end?
- Does Poom's ship take damage in each Book (more parts to find), or does each
  Book find him a different reason to land?
