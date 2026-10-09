# Book A: what the maps say about the story

Notes for writing Book A's script, read off the maps. The detail (every
objective, key, switch and exit, level by level) is in
[book-A.md](book-A.md), which `node tools/story-map.js A` regenerates; this
file is hand-written and isn't touched by it.

## The shape of the book

- **One chapter.** Chapters split at cutscenes, and Book A has none. Its
  theme is still to choose.
- **A02 opens the book.** It is the only level open at the start.
- **Then eight at once.** Finishing A02 opens A03, A04, A05, A06, A09, A10,
  A12 and A13, in any order. The story can't assume one of them comes
  before another.
- **Two short chains.** A06 → A07 → A08, and A10 → A11.
- **The run-in.** A15 needs A05, A08, A11 and A13 done. A16 needs A15.
- **A16 is the finale.** It ends by collecting four objectives, and it has
  the book's only type-14 creature: probably the boss.

## What the story has to supply

- **One objective, all book long.** Eleven levels before A16 each end on a
  single objective, and they are all the same kind (objective type 01).
  Whatever it is, Poom collects one in most levels and four in the last.
- **No rescues, no NPCs, no hint signs.** Nobody to talk to in the levels,
  and no signs to read. Book A's words have to come from the objectives,
  the world map, and each level's opening and ending.
- **14 creature types and turrets.** Each needs a name, a look and a part in
  the story; book-A.md lists where each turns up. Type 14 appears once, in
  A16.

## A secret level

**A14 can't be reached by walking the world map.** Its entrance is in a
walled-off room with a teleporter that only leads out and a "player arrival
point" at (72, 51). Something outside the map, most likely a secret exit in
one of the levels, has to bring Poom there. The story needs to say what, and
the engine doesn't do it yet.

## Diagonal walls on the world map

`maps2/README.md` says `/` and `\` are diagonal walls on world maps. The
order above depends on them: if they don't block, 12 of the 15 levels are open
from the start. The game has them as walls, both ways, in the lower half of
each tile.
