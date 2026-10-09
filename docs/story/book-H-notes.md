# Book 1 (map set H): what the maps say about the story

Notes for writing Book 1's script, read off the maps. The detail (every
item, sign, key and exit, level by level) is in [book-H.md](book-H.md), which
`node tools/story-map.js H` regenerates; this file is hand-written and isn't
touched by it.

Book H's maps come from the older engine (E1). On its world map an
unfinished level is a wall: Poom can't walk past one until it is done.

## The shape of the book

- **One chapter.** Its only cutscene, H18, comes after the last level, so it
  is the ending. H19 is a title screen. The chapter's theme is still to
  choose.
- **H02 opens the book.** It is the only level open at the start, and it
  stands between Poom and everything else.
- **Then six at once.** Finishing H02 opens H03–H08, in any order.
- **H08 is the gate.** Past it is a teleporter to the rest of the map. Once
  through, H09–H14, H16 and H17 are all open, in any order. So the story
  can count on H02 and H08 being done before the second half, and on
  nothing else.
- **No finale level: the ship is the finale.** Every level ends through an
  exit door; none ends on an objective or a rescue. The book ends when the
  four items below are back aboard the ship, whichever levels are done.

## What the story has to supply

- **Four objective items, one each in H05, H04, H09 and H17** (objective
  types 01–04, in that order). Each sits behind a coloured key door, and
  none of them ends its level. Four of something, scattered across the book
  and needed for the end, is exactly the shape of the original game's story:
  the four stolen parts of Poom's ship, and that is how the game now plays
  them: each is a ship part, Poom carries what he finds (and loses it if he
  dies before finishing that level), and the book is done when he has taken
  all four back to the ship. For now they use the original game's names and
  pictures: the Yarn Drive, Catnip Battery, Whisker Antenna and Laser
  Pointer, and the ship is the Catamaran. The script decides what they
  really are.
- **The ship.** Right beside Poom's start on the map is the object the map
  numbers 20; the game draws the ship there. Poom can visit it any time: it
  takes the parts he has and says what's still missing.
- **Seven hint signs, and the levels built around them.** H03 and H07 are
  story rooms: a short climb with no enemies and no pickups, ending at a sign
  right beside the exit. H10, H11, H12 and H13 are small levels with the sign
  at the top, again by the exit. H16 has one too. These are the places for
  dialogue: someone or something telling Poom what's going on.
- **No rescues, no NPCs.** The signs are the only voices in the levels.
- **Each objective item has a guard.** Creature type 03 appears exactly
  four times in the book, once in each of H04, H05, H09 and H17, and each
  one stands 4–6 tiles from that level's objective item. Whatever type 03
  is, it is keeping the items: the story's antagonists, or their agents.
- **Four more creature types and a few turrets.** Each needs a name, a look
  and a part in the story; book-H.md lists where each turns up. Types 01 and
  04 are everywhere.

## A secret level

**H15 is the secret level.** It can't be reached by walking the map: it is
on an island with a teleporter and nothing else. **H14 has a teleporter
inside the level**, at (124, 71), and in the game it is the way in: touching
it ends H14 and starts H15. Afterwards Poom is on H15's island, and the
island's teleporter takes him back to H14. H15 is a bonus: Book 1 can be
finished without it. The data doesn't give these links, so the map maker
can confirm them; the story needs to say what H15 is, and why H14 has a
teleporter to it.

## Other things to know

- **H16 has two exit doors.** Either ends the level.
- **H06 has a pogo stick** to pick up, but Poom has had one from the start
  since the pogo decision. If the story wants a moment where Poom gets it,
  this is the level.
- **Key and door colours are a guess.** The maps pair each key with its door
  but don't say the colours; the pairing is right, the colours (yellow, red,
  green, blue) are placeholders.
