# Book 1 (map set H): story map

Generated from the map data by `tools/story-map.js H`. It says where in Book H the story has to say something, so the script can lead up to it. Positions are tiles, (x, y) from the top left.

"Early", "middle" and "late" say how far along a level something is, by a rough path from the start (walking, pogo jumps, poles, warp doors, platforms' routes, with key doors and bridges open). Where that path doesn't get, it is a guess from the straight-line distance to the start, marked "≈": check those by playing.

## The book

- **16 levels**, H02–H17. Not levels: H18 (cutscene), H19 (title).
- **Chapters**: chapters are split at cutscenes between levels. Book H has none, so it is **one chapter**; H18 comes after the last level, so it is the ending. Its theme is still to choose.
- **Story elements**: 0 objectives that end levels, 4 objective items that don't, 0 rescues, 7 hint signs, 5 enemy types, turrets.

## The world map

Poom starts at (12, 37). The map has 3 linked teleporters. On this map an unfinished level is a wall: Poom can't walk past one until it is done. Some paths are shut until a level is done; this is the order the map lets levels be played, if each one is done as soon as it can be:

1. **Open from the start**:
   - H02 (level 1)
2. **Then**:
   - H03 (level 2) — needs H02 (level 1) done
   - H04 (level 3) — needs H02 (level 1) done
   - H05 (level 4) — needs H02 (level 1) done
   - H06 (level 5) — needs H02 (level 1) done
   - H07 (level 6) — needs H02 (level 1) done
   - H08 (level 7) — needs H02 (level 1) done
3. **Then**:
   - H09 (level 8) — needs H02 (level 1) and H08 (level 7) done
   - H10 (level 9) — needs H02 (level 1) and H08 (level 7) done
   - H11 (level 10) — needs H02 (level 1) and H08 (level 7) done
   - H12 (level 11) — needs H02 (level 1) and H08 (level 7) done
   - H13 (level 12) — needs H02 (level 1) and H08 (level 7) done
   - H14 (level 13) — needs H02 (level 1) and H08 (level 7) done
   - H16 (level 15) — needs H02 (level 1) and H08 (level 7) done
   - H17 (level 16) — needs H02 (level 1) and H08 (level 7) done

**H15 (level 14) is a secret level.** The map can't walk to it; H14 (level 13) has a teleporter that leads there, and Poom is left on its part of the map afterwards. It isn't needed to finish the book.

Levels in the same step can be played in any order, so the story can't assume one of them comes before another.

## Summary

| Level | Ends by | Objectives | Items | Rescues | Hints | Creatures |
|---|---|---|---|---|---|---|
| H02 (level 1) | through an exit door | – | – | – | – | 01 |
| H03 (level 2) | through an exit door | – | – | – | 1 | – |
| H04 (level 3) | through an exit door | – | 1 | – | – | 01, 02, 03, 04 |
| H05 (level 4) | through an exit door | – | 1 | – | – | 01, 03, 04 |
| H06 (level 5) | through an exit door | – | – | – | – | 04 |
| H07 (level 6) | through an exit door | – | – | – | 1 | – |
| H08 (level 7) | through an exit door | – | – | – | – | 01, 02, 04, 05 |
| H09 (level 8) | through an exit door | – | 1 | – | – | turret, 02, 03, 04, 05 |
| H10 (level 9) | through an exit door | – | – | – | 1 | 04 |
| H11 (level 10) | through an exit door | – | – | – | 1 | 02, 04, 05 |
| H12 (level 11) | through an exit door | – | – | – | 1 | 04 |
| H13 (level 12) | through an exit door | – | – | – | 1 | 01, 02, 04 |
| H14 (level 13) | through an exit door | – | – | – | – | turret, 01, 04, 05 |
| H16 (level 15) | through 2 exit doors | – | – | – | 1 | 01, 02, 04, 05 |
| H17 (level 16) | through an exit door | – | 1 | – | – | 02, 03, 04, 05 |
| H15 (level 14) | through an exit door | – | – | – | – | 01, 04 |

## Creatures across the book

Creature types are numbered per book; the same number is the same creature only within Book H. Each needs a name, a look and a part in the story.

| Type | Where (count) |
|---|---|
| turret | H09 ×3, H14 ×1 |
| type 01 | H02 ×8, H04 ×9, H05 ×8, H08 ×8, H13 ×10, H14 ×1, H15 ×23, H16 ×3 |
| type 02 | H04 ×1, H08 ×3, H09 ×7, H11 ×1, H13 ×7, H16 ×2, H17 ×3 |
| type 03 | H04 ×1, H05 ×1, H09 ×1, H17 ×1 |
| type 04 | H04 ×2, H05 ×1, H06 ×1, H08 ×10, H09 ×2, H10 ×1, H11 ×2, H12 ×1, H13 ×1, H14 ×20, H15 ×7, H16 ×6, H17 ×9 |
| type 05 | H08 ×1, H09 ×4, H11 ×1, H14 ×1, H16 ×1, H17 ×2 |

## Levels

In the order the map opens them.

### H02 (level 1)

120 × 21 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Exit door** — (113, 9), middle right, middle

**Creatures**: type 01 ×8, from the early part.

### H03 (level 2)

24 × 30 tiles. Ends through an exit door.

**Along the way** (rough order, start first):

- **Exit door** — (17, 6), top right, late
- **Hint sign** — needs its text — (7, 5), top left, late

### H04 (level 3)

81 × 53 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (3, 9), top left, early
- Keycard, red — (70, 46), bottom right, middle
- **Objective item** (objective type 02) — doesn't end the level; what it is and why Poom wants it is the story's — (70, 11), top right, middle
- **Exit door** — (73, 11), top right, middle

**Creatures**: type 01 ×9, from the early part; type 02 ×1, from the early part; type 03 ×1, from the middle part; type 04 ×2, from the middle part.

### H05 (level 4)

120 × 24 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (55, 8), centre, early
- Keycard, red — (100, 13), middle right, middle
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (112, 7), top right, middle
- **Exit door** — (114, 7), top right, middle

**Creatures**: type 01 ×8, from the early part; type 03 ×1, from the middle part; type 04 ×1, from the early part.

### H06 (level 5)

24 × 37 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Exit door** — (18, 32), bottom right, early

**Creatures**: type 04 ×1, from the late part.

### H07 (level 6)

24 × 40 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Hint sign** — needs its text — (7, 5), top left, late
- **Exit door** — (17, 6), top right, late

### H08 (level 7)

128 × 64 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Exit door** — (119, 13), top right, middle

**Creatures**: type 01 ×8, from the early part; type 02 ×3, from the middle part; type 04 ×10, from the early part; type 05 ×1, from the middle part.

### H09 (level 8)

80 × 60 tiles. Ends through an exit door.

Terrain: ice, hazards.

**Along the way** (rough order, start first):

- Keycard, red — (20, 7), top left, middle
- **Objective item** (objective type 03) — doesn't end the level; what it is and why Poom wants it is the story's — (69, 16), top right, late
- **Exit door** — (72, 16), top right, late

**Creatures**: turret ×3, from the early part; type 02 ×7, from the early part; type 03 ×1, from the late part; type 04 ×2, from the early part; type 05 ×4, from the early part.

### H10 (level 9)

44 × 40 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (24, 23), centre, middle
- **Exit door** — (17, 6), top centre, late
- **Hint sign** — needs its text — (11, 5), top left, late

**Creatures**: type 04 ×1, from the late part.

### H11 (level 10)

54 × 40 tiles. Ends through an exit door.

Terrain: ice, hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (27, 6), top centre, middle
- **Hint sign** — needs its text — (37, 5), top right, middle
- **Exit door** — (47, 6), top right, middle

**Creatures**: type 02 ×1, from the early part; type 04 ×2, from the early part; type 05 ×1, from the middle part.

### H12 (level 11)

44 × 40 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Hint sign** — needs its text — (8, 5), top left, middle
- **Exit door** — (17, 6), top centre, late

**Creatures**: type 04 ×1, from the early part.

### H13 (level 12)

44 × 40 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Hint sign** — needs its text — (27, 5), top centre, late
- **Exit door** — (37, 6), top right, late

**Creatures**: type 01 ×10, from the early part; type 02 ×7, from the early part; type 04 ×1, from the early part.

### H14 (level 13)

128 × 77 tiles. Ends through an exit door.

Terrain: ice, hazards.

**Along the way** (rough order, start first):

- **Secret exit: a teleporter to H15 (level 14)** — touching it ends this level and starts that one — (124, 71), bottom right, middle
- Keycard, blue — (54, 37), centre, middle
- Keycard, yellow — (123, 58), bottom right, late
- Keycard, green — (121, 5), top right, late
- Keycard, red — (122, 54), bottom right, late
- **Exit door** — (120, 51), middle right, late

**Creatures**: turret ×1, from the middle part; type 01 ×1, from the early part; type 04 ×20, from the early part; type 05 ×1, from the ≈late part.

### H16 (level 15)

142 × 24 tiles. Ends through 2 exit doors.

Terrain: ice, hazards.

**Along the way** (rough order, start first):

- Keycard, blue — (3, 18), bottom left, ≈early
- Keycard, yellow — (29, 12), middle left, ≈early
- Keycard, red — (71, 13), centre, ≈middle
- Keycard, green — (114, 11), middle right, ≈late
- **Exit door** — (21, 8), middle left, late
- **Hint sign** — needs its text — (126, 4), top right, ≈late
- **Exit door** — (135, 5), top right, ≈late

**Creatures**: type 01 ×3, from the ≈middle part; type 02 ×2, from the ≈middle part; type 04 ×6, from the ≈early part; type 05 ×1, from the ≈early part.

### H17 (level 16)

110 × 72 tiles. Ends through an exit door.

Terrain: ice, hazards.

**Along the way** (rough order, start first):

- Keycard, blue — (68, 27), centre, middle
- Special object (special type 01) — (96, 9), top right, late
- **Objective item** (objective type 04) — doesn't end the level; what it is and why Poom wants it is the story's — (103, 10), top right, late
- **Exit door** — (104, 10), top right, late

**Creatures**: type 02 ×3, from the middle part; type 03 ×1, from the late part; type 04 ×9, from the middle part; type 05 ×2, from the middle part.

### H15 (level 14)

80 × 80 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Exit door** — (9, 50), middle left, middle

**Creatures**: type 01 ×23, from the early part; type 04 ×7, from the early part.
