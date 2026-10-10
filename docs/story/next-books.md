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

  | Book | Map set | Name | Theme |
  |---|---|---|---|
  | 1 | H | Wastelandia | the wasteland, in the spirit of *Fallout* (done) |
  | 2 | C | Heavens to Mergatroid | Thrum, in the spirit of *Metroid* (done) |
  | 3 | D | The Island of Dr Claw | to make |
  | 4 | E | Descent into Rapture | to make (a sunken city, *BioShock*) |
  | 5 | A | Termination Day | to make |

  New game asks which Book to play. Books not built yet are greyed out
  (`BOOK_PLAYABLE` in `js/game.js`), and the last playable Book ends the game.

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

## A thread across the Books: Commander Poom and Shadow Poom

**Junk Baron Cal** is named for the author's friend Cal, who is in on it and
loves it. In the canon he is a **grey-black puma, a Florida panther**: a
shadow-cougar to Poom's tawny one. So the series' villain arc is **Commander
Poom and Shadow Poom**, Cal as Poom's dark mirror. Write him affectionately:
he's a schemer, a scavenger and a show-off, never cruel. The series stays
darkly funny and never grim.

A proposal for how the arc could build:

- **Book 1 (done).** Cal is offstage. His Scrappers strip the Catamaran, and
  he watches it climb away from his throne of hubcaps: "Find out where it's
  going."
- **Book 2.** His trap: the fake mayday from Thrum. His salvage barge arrives
  too late, and through its window, for the first time, the player glimpses a
  grey-black silhouette.
- **The middle Books.** Cal copies Poom, a piece per Book. He builds his own
  ship from the parts his gang has studied, a black Catamaran, and gets his
  paws on the gear Poom used last time (the station's hardsuit tech from
  Thrum, say). Auntie Static keeps her ear on him.
- **The reveal.** Cal turns up as **Shadow Poom**: Poom's outfit in black and
  grey, his own ship, his own catchphrase. The Scrappers have been calling him
  that all along.
- **The end.** A showdown worthy of the two of them, and an ending that leaves
  them rivals, not enemies. That is also the natural place to say who Auntie
  Static is.

How literal "Shadow Poom" gets (a title, a costume, a whole Book of his own)
is the author's to choose.

## Open questions

- After Book 4, which order for sets A, B, F, G and I?
- Which Book does Cal first appear in person, and when does he become Shadow
  Poom?
- Does Poom's ship take damage in each Book (more parts to find), or does each
  Book find him a different reason to land?
