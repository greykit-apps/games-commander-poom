# Book 2 (map set C): story map

Generated from the map data by `tools/story-map.js C`. It says where in Book C the story has to say something, so the script can lead up to it. Positions are tiles, (x, y) from the top left.

"Early", "middle" and "late" say how far along a level something is, by a rough path from the start (walking, pogo jumps, poles, warp doors, platforms' routes, with key doors and bridges open). Where that path doesn't get, it is a guess from the straight-line distance to the start, marked "≈": check those by playing.

## The book

- **16 levels**, C02–C17. Not levels: C18 (cutscene), C19 (title).
- **Chapters**: chapters are split at cutscenes between levels. Book C has none, so it is **one chapter**; C18 comes after the last level, so it is the ending. Its theme is still to choose.
- **Story elements**: 0 objectives that end levels, 8 objective items that don't, 0 rescues, 2 hint signs, 5 enemy types, no turrets.

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
| C03 (level 2) | through an exit door | – | – | – | – | 01, 02, 03 |
| C04 (level 3) | through an exit door | – | – | – | – | 01, 02, 03 |
| C05 (level 4) | through an exit door | – | 1 | – | – | 01, 03, 04, 05 |
| C06 (level 5) | through an exit door | – | – | – | – | 01, 02 |
| C07 (level 6) | through an exit door | – | 1 | – | – | 02, 03, 04, 05 |
| C08 (level 7) | through an exit door | – | 1 | – | – | 01, 02, 03, 05 |
| C09 (level 8) | through an exit door | – | – | – | 1 | 02, 03, 04, 05 |
| C10 (level 9) | through an exit door | – | 1 | – | – | 01, 02, 03, 05 |
| C11 (level 10) | through an exit door | – | – | – | 1 | 01, 02 |
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

- Keycard, blue — (39, 4), top centre, middle
- Keycard, red — (6, 9), top left, middle
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (66, 14), middle right, middle
- **Exit door** — (77, 24), bottom right, late

**Creatures**: type 01 ×2, from the early part; type 02 ×2, from the middle part; type 03 ×2, from the middle part; type 05 ×1, from the middle part.

### C09 (level 8)

64 × 57 tiles. Ends through an exit door.

**Along the way** (rough order, start first):

- **Exit door** — (57, 6), top right, middle
- **Hint sign** — needs its text — (58, 52), bottom right, late

**Creatures**: type 02 ×10, from the early part; type 03 ×3, from the middle part; type 04 ×16, from the early part; type 05 ×3, from the middle part.

### C10 (level 9)

144 × 29 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (126, 14), middle right, late
- **Exit door** — (137, 24), bottom right, late

**Creatures**: type 01 ×10, from the early part; type 02 ×3, from the late part; type 03 ×3, from the middle part; type 05 ×4, from the middle part.

### C11 (level 10)

64 × 60 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (30, 17), top centre, early
- Keycard, blue — (35, 22), centre, middle
- Keycard, green — (41, 11), top centre, middle
- Keycard, red — (43, 24), middle right, middle
- **Exit door** — (55, 48), bottom right, late
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
