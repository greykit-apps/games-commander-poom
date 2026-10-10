# Book 2 (map set C): story map

Generated from the map data by `tools/story-map.js C`. It says where in Book C the story has to say something, so the script can lead up to it. Positions are tiles, (x, y) from the top left.

"Early", "middle" and "late" say how far along a level something is, by a rough path from the start (walking, pogo jumps, poles, warp doors, platforms' routes, with key doors and bridges open). Where that path doesn't get, it is a guess from the straight-line distance to the start, marked "≈": check those by playing.

## The book

- **16 levels**, C02–C17. Not levels: C18 (cutscene), C19 (title).
- **Chapters**: chapters are split at cutscenes between levels. Book C has none, so it is **one chapter**; C18 comes after the last level, so it is the ending. Its theme is still to choose.
- **Story elements**: 0 objectives that end levels, 8 objective items that don't, 0 rescues, 210 hint signs, 5 enemy types, no turrets.

## The world map

Poom starts at (31, 60). On this map an unfinished level is a wall: Poom can't walk past one until it is done. Some paths are shut until a level is done; this is the order the map lets levels be played, if each one is done as soon as it can be:

1. **Open from the start**:
   - C02 (level 1)
2. **Then**:
   - C03 (level 2) — needs C02 (level 1) done
   - C04 (level 3) — needs C02 (level 1) done
   - C05 (level 4) — needs C02 (level 1) done
   - C06 (level 5) — needs C02 (level 1) done
   - C07 (level 6) — needs C02 (level 1) done
3. **Then**:
   - C08 (level 7) — needs C02 (level 1) and C06 (level 5) done
   - C09 (level 8) — needs C02 (level 1) and C06 (level 5) done
   - C10 (level 9) — needs C02 (level 1) and C06 (level 5) done
   - C11 (level 10) — needs C02 (level 1) and C06 (level 5) done
   - C12 (level 11) — needs C02 (level 1) and C06 (level 5) done
   - C13 (level 12) — needs C02 (level 1) and C06 (level 5) done
   - C14 (level 13) — needs C02 (level 1) and C06 (level 5) done
   - C15 (level 14) — needs C02 (level 1) and C06 (level 5) done
   - C16 (level 15) — needs C02 (level 1) and C06 (level 5) done
4. **Then**:
   - C17 (level 16) — needs C02 (level 1) and C06 (level 5) done

Levels in the same step can be played in any order, so the story can't assume one of them comes before another.

## Summary

| Level | Ends by | Objectives | Items | Rescues | Hints | Creatures |
|---|---|---|---|---|---|---|
| C02 (level 1) | through an exit door | – | – | – | – | 01 |
| C03 (level 2) | through an exit door | – | – | – | 8 | 01, 02, 03 |
| C04 (level 3) | through an exit door | – | – | – | – | 01, 02, 03 |
| C05 (level 4) | through an exit door | – | 1 | – | – | 01, 03, 04, 05 |
| C06 (level 5) | through an exit door | – | – | – | – | 01, 02 |
| C07 (level 6) | through an exit door | – | 1 | – | – | 02, 03, 04, 05 |
| C08 (level 7) | through an exit door | – | 1 | – | 50 | 01, 02, 03, 05 |
| C09 (level 8) | through an exit door | – | – | – | 17 | 02, 03, 04, 05 |
| C10 (level 9) | through an exit door | – | 1 | – | 44 | 01, 02, 03, 05 |
| C11 (level 10) | through an exit door | – | – | – | 91 | 01, 02 |
| C12 (level 11) | through an exit door | – | 1 | – | – | 01, 02, 03, 05 |
| C13 (level 12) | through an exit door | – | – | – | – | 02, 03, 05 |
| C14 (level 13) | through an exit door | – | 1 | – | – | 01, 03, 05 |
| C15 (level 14) | through an exit door | – | – | – | – | 01, 02, 04, 05 |
| C16 (level 15) | through 2 exit doors | – | 1 | – | – | 02, 04, 05 |
| C17 (level 16) | through 2 exit doors | – | 1 | – | – | 01, 02, 03, 05 |

## Creatures across the book

Creature types are numbered per book; the same number is the same creature only within Book C. Each needs a name, a look and a part in the story.

| Type | Where (count) |
|---|---|
| type 01 | C02 ×4, C03 ×7, C04 ×4, C05 ×4, C06 ×8, C08 ×2, C10 ×10, C11 ×3, C12 ×1, C14 ×8, C15 ×5, C17 ×3 |
| type 02 | C03 ×1, C04 ×5, C06 ×2, C07 ×2, C08 ×2, C09 ×10, C10 ×3, C11 ×10, C12 ×7, C13 ×17, C15 ×3, C16 ×4, C17 ×7 |
| type 03 | C03 ×1, C04 ×1, C05 ×1, C07 ×1, C08 ×2, C09 ×3, C10 ×3, C12 ×1, C13 ×1, C14 ×1, C17 ×1 |
| type 04 | C05 ×1, C07 ×3, C09 ×16, C15 ×6, C16 ×3 |
| type 05 | C05 ×1, C07 ×1, C08 ×1, C09 ×3, C10 ×4, C12 ×1, C13 ×3, C14 ×5, C15 ×1, C16 ×6, C17 ×7 |

## Levels

In the order the map opens them.

### C02 (level 1)

64 × 26 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Exit door** — (57, 7), top right, late

**Creatures**: type 01 ×4, from the early part.

### C03 (level 2)

74 × 30 tiles. Ends through an exit door.

Terrain: 1 moving platform, hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (50, 25), bottom right, late
- **Exit door** — (12, 7), top left, late
- **Hint sign** — needs its text — (65, 18), middle right, late
- **Hint sign** — needs its text — (55, 24), bottom right, late
- **Hint sign** — needs its text — (66, 18), middle right, late
- **Hint sign** — needs its text — (55, 25), bottom right, late
- **Hint sign** — needs its text — (67, 18), middle right, late
- **Hint sign** — needs its text — (68, 18), middle right, late
- **Hint sign** — needs its text — (68, 24), bottom right, late
- **Hint sign** — needs its text — (68, 25), bottom right, late

**Creatures**: type 01 ×7, from the early part; type 02 ×1, from the late part; type 03 ×1, from the late part.

### C04 (level 3)

64 × 41 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- Keycard, green — (50, 17), middle right, middle
- **Exit door** — (58, 12), top right, late

**Creatures**: type 01 ×4, from the early part; type 02 ×5, from the early part; type 03 ×1, from the early part.

### C05 (level 4)

84 × 41 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (66, 14), middle right, ≈late
- **Exit door** — (77, 24), middle right, ≈late

**Creatures**: type 01 ×4, from the early part; type 03 ×1, from the ≈middle part; type 04 ×1, from the ≈middle part; type 05 ×1, from the ≈late part.

### C06 (level 5)

44 × 53 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Exit door** — (37, 6), top right, late

**Creatures**: type 01 ×8, from the middle part; type 02 ×2, from the early part.

### C07 (level 6)

84 × 37 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (66, 14), middle right, late
- **Exit door** — (77, 24), middle right, late

**Creatures**: type 02 ×2, from the middle part; type 03 ×1, from the early part; type 04 ×3, from the early part; type 05 ×1, from the late part.

### C08 (level 7)

84 × 29 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Hint sign** — needs its text — (5, 10), middle left, ≈early
- **Hint sign** — needs its text — (6, 10), middle left, ≈early
- **Hint sign** — needs its text — (7, 10), middle left, ≈early
- Keycard, red — (6, 9), top left, ≈early
- **Hint sign** — needs its text — (27, 21), bottom left, early
- **Hint sign** — needs its text — (23, 18), middle left, early
- **Hint sign** — needs its text — (28, 21), bottom centre, early
- **Hint sign** — needs its text — (24, 18), middle left, early
- **Hint sign** — needs its text — (29, 21), bottom centre, early
- **Hint sign** — needs its text — (25, 18), middle left, early
- **Hint sign** — needs its text — (22, 15), middle left, early
- **Hint sign** — needs its text — (21, 15), middle left, early
- **Hint sign** — needs its text — (20, 15), middle left, early
- **Hint sign** — needs its text — (32, 19), centre, early
- **Hint sign** — needs its text — (19, 15), middle left, early
- **Hint sign** — needs its text — (33, 19), centre, early
- **Hint sign** — needs its text — (18, 15), middle left, early
- **Hint sign** — needs its text — (34, 19), centre, early
- **Hint sign** — needs its text — (17, 15), middle left, early
- **Hint sign** — needs its text — (15, 17), middle left, early
- **Hint sign** — needs its text — (14, 17), middle left, early
- **Hint sign** — needs its text — (44, 17), centre, middle
- **Hint sign** — needs its text — (45, 17), centre, middle
- **Hint sign** — needs its text — (46, 17), centre, middle
- **Hint sign** — needs its text — (39, 9), top centre, ≈middle
- **Hint sign** — needs its text — (40, 9), top centre, ≈middle
- **Hint sign** — needs its text — (39, 5), top centre, ≈middle
- Keycard, blue — (39, 4), top centre, ≈middle
- **Hint sign** — needs its text — (40, 5), top centre, ≈middle
- **Hint sign** — needs its text — (46, 6), top centre, ≈middle
- **Hint sign** — needs its text — (47, 6), top centre, ≈middle
- **Hint sign** — needs its text — (48, 6), top centre, ≈middle
- **Hint sign** — needs its text — (49, 6), top centre, ≈middle
- **Hint sign** — needs its text — (50, 6), top centre, ≈middle
- **Hint sign** — needs its text — (53, 13), centre, middle
- **Hint sign** — needs its text — (52, 13), centre, middle
- **Hint sign** — needs its text — (55, 9), top centre, middle
- **Hint sign** — needs its text — (51, 13), centre, middle
- **Hint sign** — needs its text — (54, 9), top centre, middle
- **Hint sign** — needs its text — (50, 13), centre, middle
- **Hint sign** — needs its text — (53, 9), top centre, middle
- **Hint sign** — needs its text — (49, 13), centre, middle
- **Hint sign** — needs its text — (52, 9), top centre, middle
- **Hint sign** — needs its text — (48, 13), centre, middle
- **Hint sign** — needs its text — (51, 9), top centre, middle
- **Hint sign** — needs its text — (47, 13), centre, late
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (66, 14), middle right, late
- **Hint sign** — needs its text — (47, 9), top centre, late
- **Hint sign** — needs its text — (45, 9), top centre, late
- **Hint sign** — needs its text — (48, 9), top centre, late
- **Hint sign** — needs its text — (46, 13), centre, late
- **Hint sign** — needs its text — (46, 9), top centre, late
- **Hint sign** — needs its text — (44, 9), top centre, late
- **Exit door** — (77, 24), bottom right, late

**Creatures**: type 01 ×2, from the early part; type 02 ×2, from the middle part; type 03 ×2, from the late part; type 05 ×1, from the middle part.

### C09 (level 8)

64 × 57 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Hint sign** — needs its text — (29, 38), bottom centre, middle
- **Hint sign** — needs its text — (32, 38), bottom centre, middle
- **Hint sign** — needs its text — (33, 38), bottom centre, middle
- **Hint sign** — needs its text — (36, 38), bottom centre, middle
- **Hint sign** — needs its text — (37, 38), bottom centre, middle
- **Hint sign** — needs its text — (28, 38), bottom centre, middle
- **Hint sign** — needs its text — (40, 38), bottom centre, middle
- **Hint sign** — needs its text — (41, 38), bottom centre, middle
- **Hint sign** — needs its text — (25, 38), bottom centre, middle
- **Hint sign** — needs its text — (24, 38), bottom centre, middle
- **Hint sign** — needs its text — (44, 38), bottom right, middle
- **Exit door** — (57, 6), top right, middle
- **Hint sign** — needs its text — (45, 38), bottom right, middle
- **Hint sign** — needs its text — (48, 38), bottom right, middle
- **Hint sign** — needs its text — (49, 38), bottom right, middle
- **Hint sign** — needs its text — (52, 38), bottom right, middle
- **Hint sign** — needs its text — (53, 38), bottom right, middle
- **Hint sign** — needs its text — (58, 52), bottom right, late

**Creatures**: type 02 ×10, from the early part; type 03 ×3, from the middle part; type 04 ×16, from the early part; type 05 ×3, from the middle part.

### C10 (level 9)

144 × 29 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Hint sign** — needs its text — (9, 22), bottom left, early
- **Hint sign** — needs its text — (10, 22), bottom left, early
- **Hint sign** — needs its text — (11, 22), bottom left, early
- **Hint sign** — needs its text — (12, 22), bottom left, early
- **Hint sign** — needs its text — (13, 22), bottom left, early
- **Hint sign** — needs its text — (14, 22), bottom left, early
- **Hint sign** — needs its text — (15, 22), bottom left, early
- **Hint sign** — needs its text — (16, 22), bottom left, early
- **Hint sign** — needs its text — (17, 22), bottom left, early
- **Hint sign** — needs its text — (19, 17), middle left, ≈early
- **Hint sign** — needs its text — (19, 22), bottom left, early
- **Hint sign** — needs its text — (20, 17), middle left, ≈early
- **Hint sign** — needs its text — (18, 22), bottom left, early
- **Hint sign** — needs its text — (21, 17), middle left, ≈early
- **Hint sign** — needs its text — (22, 17), middle left, ≈early
- **Hint sign** — needs its text — (23, 17), middle left, ≈early
- **Hint sign** — needs its text — (24, 17), middle left, ≈early
- **Hint sign** — needs its text — (25, 22), bottom left, ≈early
- **Hint sign** — needs its text — (25, 17), middle left, ≈early
- **Hint sign** — needs its text — (26, 22), bottom left, ≈early
- **Hint sign** — needs its text — (27, 22), bottom left, ≈early
- **Hint sign** — needs its text — (26, 14), middle left, ≈early
- **Hint sign** — needs its text — (27, 14), middle left, ≈early
- **Hint sign** — needs its text — (28, 14), middle left, ≈early
- **Hint sign** — needs its text — (29, 14), middle left, ≈early
- **Hint sign** — needs its text — (30, 14), middle left, ≈early
- **Hint sign** — needs its text — (31, 14), middle left, ≈early
- **Hint sign** — needs its text — (32, 14), middle left, ≈early
- **Hint sign** — needs its text — (51, 21), bottom centre, ≈early
- **Hint sign** — needs its text — (52, 21), bottom centre, ≈middle
- **Hint sign** — needs its text — (54, 17), centre, ≈middle
- **Hint sign** — needs its text — (55, 17), centre, ≈middle
- **Hint sign** — needs its text — (57, 21), bottom centre, ≈middle
- **Hint sign** — needs its text — (58, 21), bottom centre, ≈middle
- **Hint sign** — needs its text — (60, 17), centre, ≈middle
- **Hint sign** — needs its text — (61, 17), centre, ≈middle
- **Hint sign** — needs its text — (63, 21), bottom centre, ≈middle
- **Hint sign** — needs its text — (64, 21), bottom centre, ≈middle
- **Hint sign** — needs its text — (66, 17), centre, ≈middle
- **Hint sign** — needs its text — (67, 17), centre, ≈middle
- **Hint sign** — needs its text — (69, 21), bottom centre, ≈middle
- **Hint sign** — needs its text — (70, 21), bottom centre, ≈middle
- **Hint sign** — needs its text — (72, 17), centre, ≈middle
- **Hint sign** — needs its text — (73, 17), centre, ≈middle
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (126, 14), middle right, ≈late
- **Exit door** — (137, 24), bottom right, ≈late

**Creatures**: type 01 ×10, from the early part; type 02 ×3, from the ≈early part; type 03 ×3, from the ≈middle part; type 05 ×4, from the ≈late part.

### C11 (level 10)

64 × 60 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (30, 17), top centre, early
- Keycard, blue — (35, 22), centre, middle
- **Hint sign** — needs its text — (29, 26), centre, middle
- **Hint sign** — needs its text — (29, 27), centre, middle
- **Hint sign** — needs its text — (29, 28), centre, middle
- **Hint sign** — needs its text — (30, 26), centre, middle
- **Hint sign** — needs its text — (29, 29), centre, middle
- **Hint sign** — needs its text — (29, 30), centre, middle
- **Hint sign** — needs its text — (32, 28), centre, middle
- **Hint sign** — needs its text — (33, 28), centre, middle
- **Hint sign** — needs its text — (36, 28), centre, middle
- **Hint sign** — needs its text — (37, 28), centre, middle
- **Hint sign** — needs its text — (29, 31), centre, middle
- **Hint sign** — needs its text — (30, 31), centre, middle
- **Hint sign** — needs its text — (31, 31), centre, middle
- **Hint sign** — needs its text — (32, 31), centre, middle
- **Hint sign** — needs its text — (40, 28), centre, middle
- **Hint sign** — needs its text — (33, 31), centre, middle
- **Hint sign** — needs its text — (33, 32), centre, middle
- Keycard, green — (41, 11), top centre, middle
- **Hint sign** — needs its text — (41, 28), centre, middle
- **Hint sign** — needs its text — (33, 33), centre, middle
- Keycard, red — (43, 24), middle right, middle
- **Hint sign** — needs its text — (38, 31), centre, middle
- **Hint sign** — needs its text — (39, 31), centre, middle
- **Hint sign** — needs its text — (33, 34), centre, middle
- **Hint sign** — needs its text — (36, 34), centre, middle
- **Hint sign** — needs its text — (33, 35), centre, middle
- **Hint sign** — needs its text — (37, 34), centre, middle
- **Hint sign** — needs its text — (33, 36), centre, middle
- **Hint sign** — needs its text — (40, 34), centre, middle
- **Hint sign** — needs its text — (41, 34), centre, middle
- **Hint sign** — needs its text — (33, 37), centre, middle
- **Hint sign** — needs its text — (38, 37), centre, middle
- **Hint sign** — needs its text — (39, 37), centre, middle
- **Hint sign** — needs its text — (33, 38), centre, middle
- **Hint sign** — needs its text — (33, 39), centre, middle
- **Hint sign** — needs its text — (33, 40), bottom centre, middle
- **Hint sign** — needs its text — (36, 40), bottom centre, middle
- **Hint sign** — needs its text — (37, 40), bottom centre, middle
- **Hint sign** — needs its text — (40, 40), bottom centre, middle
- **Hint sign** — needs its text — (41, 40), bottom centre, middle
- **Hint sign** — needs its text — (33, 41), bottom centre, middle
- **Hint sign** — needs its text — (48, 40), bottom right, middle
- **Hint sign** — needs its text — (4, 48), bottom left, middle
- **Hint sign** — needs its text — (5, 48), bottom left, middle
- **Hint sign** — needs its text — (6, 48), bottom left, middle
- **Hint sign** — needs its text — (7, 48), bottom left, middle
- **Hint sign** — needs its text — (8, 48), bottom left, middle
- **Hint sign** — needs its text — (9, 48), bottom left, middle
- **Hint sign** — needs its text — (10, 48), bottom left, middle
- **Hint sign** — needs its text — (11, 48), bottom left, middle
- **Hint sign** — needs its text — (12, 48), bottom left, middle
- **Hint sign** — needs its text — (13, 48), bottom left, middle
- **Hint sign** — needs its text — (14, 48), bottom left, middle
- **Hint sign** — needs its text — (15, 48), bottom left, middle
- **Hint sign** — needs its text — (16, 48), bottom left, middle
- **Hint sign** — needs its text — (17, 48), bottom left, middle
- **Hint sign** — needs its text — (18, 48), bottom left, middle
- **Hint sign** — needs its text — (19, 48), bottom left, middle
- **Hint sign** — needs its text — (20, 48), bottom left, middle
- **Hint sign** — needs its text — (21, 48), bottom left, middle
- **Hint sign** — needs its text — (22, 48), bottom centre, middle
- **Hint sign** — needs its text — (23, 48), bottom centre, middle
- **Hint sign** — needs its text — (24, 48), bottom centre, middle
- **Hint sign** — needs its text — (25, 48), bottom centre, middle
- **Hint sign** — needs its text — (28, 48), bottom centre, middle
- **Hint sign** — needs its text — (29, 48), bottom centre, middle
- **Hint sign** — needs its text — (33, 48), bottom centre, middle
- **Hint sign** — needs its text — (34, 48), bottom centre, middle
- **Hint sign** — needs its text — (38, 48), bottom centre, middle
- **Hint sign** — needs its text — (39, 48), bottom centre, middle
- **Hint sign** — needs its text — (43, 48), bottom right, middle
- **Hint sign** — needs its text — (44, 48), bottom right, middle
- **Hint sign** — needs its text — (48, 48), bottom right, middle
- **Hint sign** — needs its text — (49, 48), bottom right, middle
- **Hint sign** — needs its text — (30, 50), bottom centre, middle
- **Hint sign** — needs its text — (32, 50), bottom centre, middle
- **Hint sign** — needs its text — (30, 51), bottom centre, late
- **Hint sign** — needs its text — (32, 51), bottom centre, late
- **Exit door** — (55, 48), bottom right, late
- **Hint sign** — needs its text — (30, 52), bottom centre, late
- **Hint sign** — needs its text — (32, 52), bottom centre, late
- **Hint sign** — needs its text — (27, 55), bottom centre, late
- **Hint sign** — needs its text — (28, 55), bottom centre, late
- **Hint sign** — needs its text — (34, 55), bottom centre, late
- **Hint sign** — needs its text — (35, 55), bottom centre, late
- **Hint sign** — needs its text — (42, 55), bottom centre, late
- **Hint sign** — needs its text — (43, 55), bottom right, late
- **Hint sign** — needs its text — (18, 55), bottom left, late
- **Hint sign** — needs its text — (17, 55), bottom left, late
- **Hint sign** — needs its text — (50, 55), bottom right, late
- **Hint sign** — needs its text — (51, 55), bottom right, late
- **Hint sign** — needs its text — (8, 55), bottom left, late
- **Hint sign** — needs its text — (7, 55), bottom left, late
- **Hint sign** — needs its text — (57, 55), bottom right, late

**Creatures**: type 01 ×3, from the early part; type 02 ×10, from the middle part.

### C12 (level 11)

89 × 29 tiles. Ends through an exit door.

Terrain: 1 moving platform, hazards.

**Along the way** (rough order, start first):

- **Exit door** — (70, 11), middle right, ≈early
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (66, 14), middle right, ≈early

**Creatures**: type 01 ×1, from the middle part; type 02 ×7, from the middle part; type 03 ×1, from the middle part; type 05 ×1, from the late part.

### C13 (level 12)

84 × 53 tiles. Ends through an exit door.

Terrain: 6 moving platforms, hazards.

**Along the way** (rough order, start first):

- **Exit door** — (77, 45), bottom right, late

**Creatures**: type 02 ×17, from the early part; type 03 ×1, from the middle part; type 05 ×3, from the middle part.

### C14 (level 13)

84 × 29 tiles. Ends through an exit door.

Terrain: 1 moving platform, hazards.

**Along the way** (rough order, start first):

- **Exit door** — (34, 10), centre, middle
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (46, 14), centre, middle

**Creatures**: type 01 ×8, from the early part; type 03 ×1, from the early part; type 05 ×5, from the early part.

### C15 (level 14)

54 × 41 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (3, 27), middle left, early
- Keycard, red — (11, 11), top left, early
- **Exit door** — (45, 25), middle right, middle
- Keycard, green — (43, 13), top right, middle
- Keycard, blue — (10, 8), top left, late

**Creatures**: type 01 ×5, from the early part; type 02 ×3, from the middle part; type 04 ×6, from the middle part; type 05 ×1, from the middle part.

### C16 (level 15)

84 × 44 tiles. Ends through 2 exit doors.

Terrain: 2 moving platforms, hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (9, 12), top left, middle
- Keycard, red — (9, 14), top left, middle
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (66, 14), top right, middle
- **Exit door** — (77, 24), middle right, late
- **Exit door** — (77, 39), bottom right, late

**Creatures**: type 02 ×4, from the middle part; type 04 ×3, from the late part; type 05 ×6, from the early part.

### C17 (level 16)

84 × 49 tiles. Ends through 2 exit doors.

Terrain: 2 moving platforms, hazards.

**Along the way** (rough order, start first):

- Keycard, green — (6, 23), middle left, ≈early
- Keycard, red — (43, 36), bottom centre, middle
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (66, 14), top right, ≈late
- **Exit door** — (72, 44), bottom right, ≈late
- **Exit door** — (77, 24), middle right, ≈late
- Keycard, blue — (32, 7), top centre, late

**Creatures**: type 01 ×3, from the ≈early part; type 02 ×7, from the ≈middle part; type 03 ×1, from the late part; type 05 ×7, from the early part.
