# The next Books: ideas

A working document for choosing each Book's theme. Nothing here is settled
unless it says so; change it freely.

Books 1 to 5 are built: a wasteland in the spirit of *Fallout* (set H), a
hollow moon in the spirit of *Metroid* (C), an island lair in the spirit of
*Metal Gear Solid* (D), a drowned city in the spirit of *BioShock* (E) and
an orbital station in the spirit of *The Terminator*, *Aliens* and
*Predator* (A). Books 1 to 4 are in the game; Book 5 is held back until its
levels are proven winnable. Every later Book follows the same rules:

- **Animals, not humans.** Poom and the Catamaran carry on.
- **A mashup with its own names.** The Book borrows the feeling of a famous
  game or film, and none of its names, marks or characters.
- **Everything themes together.** That means the story, place names, signs
  and ending; three or four tilesets and a creature set; Poom's look; the
  title scene, menus and scorebox; and a sound set.
  (`BOOK_THEMES`, `THEME_OF_BOOK` and `BOOK_TEXT` in `js/game.js`; from
  Book 3 on, each Book's art is in its own `js/art-book<n>.js`.)

## Settled

- **The order of the first four Books.** `BOOK_ORDER` in `js/game.js` is now
  H, C, D, E, then A, B, F, G and I.

  | Book | Map set | Name | Theme |
  |---|---|---|---|
  | 1 | H | Wastelandia | the wasteland, in the spirit of *Fallout* (done) |
  | 2 | C | Heavens to Mergatroid | Thrum, in the spirit of *Metroid* (done) |
  | 3 | D | The Island of Dr Cal | an island lair, *Metal Gear Solid* (done: [book-3-story.md](book-3-story.md)) |
  | 4 | E | Descent into Raptura | a drowned city, *BioShock* (done: [book-4-story.md](book-4-story.md)) |
  | 5 | A | Termination Day | an orbital station, *The Terminator* / *Aliens* / *Predator* (built, held back: [book-5-story.md](book-5-story.md)) |

  New game asks which Book to play. Books 1 to 4 are playable
  (`BOOK_PLAYABLE` in `js/game.js`), and the last playable Book ends the
  game, so for now Book 4's ending is the game's. Book 5 shows greyed out:
  its art and maps aren't loaded, and its game code is kept in
  `js/book5.js`, which says how to put it back.

  Each one's story map is in `docs/story/book-<set>.md`.
- **Every level in the game is winnable by a real player.** Proven on
  2026-10-10, level by level: by a solver that plays the game's own physics,
  and, where it couldn't, by hand. The play-through set some rules that
  every Book now shares:
  - **Classic or Arcade.** New game asks. Classic is four lives and game
    over. Arcade never runs out: Poom gets up near where he fell, keeping the
    level's keycards, and blinks for a moment's grace. Arcade games go on no
    high-score table.
  - **One pogo for the whole game.** A held bounce clears about ten tiles,
    in every Book: physics never changes from one Book to the next.
  - **Exits are marked.** A walk-off exit at the map's edge glows green,
    with chevrons pointing out and EXIT over it, instead of looking like
    the wall behind it.
  - **Hazards hanging from rock hang**: drawn point down, hurting nearest
    the rock.
  - **Trap switches warn**, then ask before they're pulled (Book 2).
  - **The maps aren't sacrosanct.** Where a level needed it, it was changed
    by hand, in short per-map lists in `tools/transcribe-maps.js`
    (`OPEN_TILES`, `CLOSE_TILES`, `CLEAR_HAZARDS`, `ADD_SIGNS`), so a
    rebuild keeps them. One rule there: never add a hazard a player of the
    original couldn't meet. A spike hidden under a creature in the source
    stays out.

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

Books 2 to 5 are sets C, D, E and A. The order of sets B, F, G and I after
them is not settled.

- **Set C (Book 2): an alien hive, in the spirit of *Metroid* / *Alien*.**
  It is simple and hazard-heavy like Book 1, which suits a tense, quiet,
  derelict world: spores, acid pools, organic tunnels. *Settled as Book 2.*
- **Sky islands, in the spirit of *Laputa* / *Skyward Sword*** (once set A's idea; free for another set). The
  platforms and bridges become airship decks and rope bridges between floating
  islands. Each level's objective is a "sky-shard" that keeps an island
  aloft. Alternative: a clockwork city of gears and lifts.
- **Set B: a robot factory, in the spirit of *Mega Man*.** The conveyors and
  hazards are ready-made assembly lines, crushers and sparking wire; the
  key carriers become worker robots holding security passes. Alternative:
  a candy factory, lighter in tone.
- **Set D (Book 3): a secret island base, in the spirit of *Metal Gear*.**
  *Settled as Book 3*: [book-3-story.md](book-3-story.md).
- **Set E (Book 4): a sunken art-deco city, in the spirit of *BioShock*.**
  *Settled as Book 4*: [book-4-story.md](book-4-story.md).
- **Set A (Book 5): *The Terminator*, *Aliens* and *Predator*.** *Settled as
  Book 5*: [book-5-story.md](book-5-story.md). (The sky-islands idea below is
  no longer set A's.)
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
- **Book 2 (done).** His trap: the fake mayday from Thrum. His salvage barge
  arrives too late, and through its window, for the first time, the player
  glimpses a grey-black silhouette.
- **Book 3 (done).** Cal's first appearance in person, as **Dr Cal** (after
  Dr Claw, after Dr No, with a bit of Dr Moreau): his island lair copies the
  Catamaran, and he escapes in the one copy finished, **the black
  Catamaran**.
- **Book 4 (done).** Cal buys every drop of SPARK in Raptura to power it.
  An audio diary from Raptura Radio's operator ("Keep listening, sugar")
  hints at who Auntie Static is, without saying.
- **Book 5 (done).** Cal steals the Hunter's **cloak** from TERMINUS. Auntie:
  "He's been building himself into you, sugar, one piece at a time." The
  Shadow Poom reveal is still to come.
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

- After Book 5, which order for sets B, F, G and I?
- When does Cal become Shadow Poom? (He first appears in person in Book 3,
  as Dr Cal.)
- Does Poom's ship take damage in each Book (more parts to find), or does each
  Book find him a different reason to land?
