# Book 3 (map set D): story map

Generated from the map data by `tools/story-map.js D`. It says where in Book D the story has to say something, so the script can lead up to it. Positions are tiles, (x, y) from the top left.

"Early", "middle" and "late" say how far along a level something is, by a rough path from the start (walking, pogo jumps, poles, warp doors, platforms' routes, with key doors and bridges open). Where that path doesn't get, it is a guess from the straight-line distance to the start, marked "≈": check those by playing.

## The book

- **16 levels**, D02–D17. Not levels: D18 (cutscene), D19 (title).
- **Chapters**: chapters are split at cutscenes between levels. Book D has none, so it is **one chapter**; D18 comes after the last level, so it is the ending. Its theme is still to choose.
- **Story elements**: 1 objective that end levels, 6 objective items that don't, 0 rescues, 0 hint signs, 11 enemy types, turrets.

## The world map

Poom starts at (44, 47). The map has 16 linked teleporters. A ferry crosses the water between its landings. On this map an unfinished level is a wall: Poom can't walk past one until it is done. Some paths are shut until a level is done; this is the order the map lets levels be played, if each one is done as soon as it can be:

1. **Open from the start**:
   - D02 (level 1)
   - D03 (level 2)
2. **Then**:
   - D04 (level 3) — needs D02 (level 1) done
   - D05 (level 4) — needs D02 (level 1) done
   - D06 (level 5) — needs D03 (level 2) done
3. **Then**:
   - D07 (level 6) — opens once the step before is done (more than one way in)
   - D08 (level 7) — opens once the step before is done (more than one way in)
   - D09 (level 8) — opens once the step before is done (more than one way in)
   - D10 (level 9) — needs D03 (level 2) and D06 (level 5) done
   - D11 (level 10) — needs D03 (level 2) and D06 (level 5) done
   - D12 (level 11) — needs D03 (level 2) and D06 (level 5) done
   - D13 (level 12) — needs D03 (level 2) and D06 (level 5) done
   - D15 (level 14) — needs D03 (level 2) and D06 (level 5) done
   - D16 (level 15) — needs D03 (level 2) and D06 (level 5) done
4. **Then**:
   - D14 (level 13) — needs D16 (level 15) done
   - D17 (level 16) — needs D16 (level 15) done

Levels in the same step can be played in any order, so the story can't assume one of them comes before another.

## Summary

| Level | Ends by | Objectives | Items | Rescues | Hints | Creatures |
|---|---|---|---|---|---|---|
| D02 (level 1) | through an exit door | – | – | – | – | 01, 02, 03, 04 |
| D03 (level 2) | through an exit door | – | – | – | – | 01, 04 |
| D04 (level 3) | through an exit door | – | – | – | – | 01, 03, 04, 05, 06 |
| D05 (level 4) | through an exit door | – | – | – | – | turret, 01, 02, 03, 04, 06, 07, 08 |
| D06 (level 5) | through an exit door | – | – | – | – | 02, 03, 04 |
| D07 (level 6) | through an exit door | – | – | – | – | 02, 04, 05 |
| D08 (level 7) | through an exit door | – | – | – | – | 02, 03, 04, 06 |
| D09 (level 8) | through an exit door | – | – | – | – | 02, 04, 05, 06 |
| D10 (level 9) | through an exit door | – | – | – | – | turret, 02, 04, 05, 07 |
| D11 (level 10) | through an exit door | – | – | – | – | turret, 02, 04, 06 |
| D12 (level 11) | through an exit door | – | – | – | – | turret, 02, 04 |
| D13 (level 12) | through 2 exit doors | – | – | – | – | turret, 01, 04, 06, 08 |
| D15 (level 14) | through an exit door | – | – | – | – | turret, 01, 04, 06, 08 |
| D16 (level 15) | through 2 exit doors | – | – | – | – | 01, 04, 05, 06, 07 |
| D14 (level 13) | through 2 exit doors | – | – | – | – | 01, 02, 03 |
| D17 (level 16) | by taking the objective | 1 | 6 | – | – | turret, 08, 09, 10, 11 |

## Creatures across the book

Creature types are numbered per book; the same number is the same creature only within Book D. Each needs a name, a look and a part in the story.

| Type | Where (count) |
|---|---|
| turret | D05 ×1, D10 ×11, D11 ×4, D12 ×4, D13 ×11, D15 ×2, D17 ×2 |
| type 01 | D02 ×3, D03 ×2, D04 ×3, D05 ×6, D13 ×1, D14 ×18, D15 ×1, D16 ×8 |
| type 02 | D02 ×4, D05 ×5, D06 ×7, D07 ×5, D08 ×5, D09 ×2, D10 ×4, D11 ×2, D12 ×5, D14 ×7 |
| type 03 | D02 ×1, D04 ×1, D05 ×3, D06 ×14, D08 ×2, D14 ×1 |
| type 04 | D02 ×2, D03 ×13, D04 ×11, D05 ×7, D06 ×21, D07 ×3, D08 ×12, D09 ×7, D10 ×14, D11 ×5, D12 ×2, D13 ×5, D15 ×4, D16 ×9 |
| type 05 | D04 ×1, D07 ×3, D09 ×2, D10 ×6, D16 ×13 |
| type 06 | D04 ×1, D05 ×4, D08 ×1, D09 ×1, D11 ×4, D13 ×2, D15 ×21, D16 ×9 |
| type 07 | D05 ×1, D10 ×1, D16 ×2 |
| type 08 | D05 ×1, D13 ×6, D15 ×3, D17 ×2 |
| type 09 | D17 ×2 |
| type 10 | D17 ×1 |
| type 11 | D17 ×1 |

## Levels

In the order the map opens them.

### D02 (level 1)

84 × 26 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Exit door** — (78, 10), middle right, late

**Creatures**: type 01 ×3, from the early part; type 02 ×4, from the middle part; type 03 ×1, from the middle part; type 04 ×2, from the middle part.

### D03 (level 2)

100 × 24 tiles. Ends through an exit door.

Terrain: 2 moving platforms.

**Along the way** (rough order, start first):

- **Exit door** — (94, 5), top right, late

**Creatures**: type 01 ×2, from the early part; type 04 ×13, from the early part.

### D04 (level 3)

69 × 47 tiles. Ends through an exit door.

**Along the way** (rough order, start first):

- Keycard, green — (13, 29), middle left, middle
- **Exit door** — (60, 32), bottom right, late

**Creatures**: type 01 ×3, from the early part; type 03 ×1, from the middle part; type 04 ×11, from the early part; type 05 ×1, from the late part; type 06 ×1, from the late part.

### D05 (level 4)

200 × 46 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (77, 12), top centre, middle
- **Exit door** — (190, 39), bottom right, middle
- Keycard, red — (196, 35), bottom right, middle

**Creatures**: turret ×1, from the middle part; type 01 ×6, from the early part; type 02 ×5, from the middle part; type 03 ×3, from the early part; type 04 ×7, from the early part; type 06 ×4, from the late part; type 07 ×1, from the middle part; type 08 ×1, from the middle part.

### D06 (level 5)

154 × 40 tiles. Ends through an exit door.

Terrain: 3 moving platforms, hazards.

**Along the way** (rough order, start first):

- **Exit door** — (147, 24), middle right, late

**Creatures**: type 02 ×7, from the early part; type 03 ×14, from the middle part; type 04 ×21, from the early part.

### D07 (level 6)

74 × 17 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Exit door** — (67, 5), top right, late

**Creatures**: type 02 ×5, from the middle part; type 04 ×3, from the early part; type 05 ×3, from the middle part.

### D08 (level 7)

124 × 37 tiles. Ends through an exit door.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Exit door** — (34, 31), bottom left, late

**Creatures**: type 02 ×5, from the early part; type 03 ×2, from the early part; type 04 ×12, from the early part; type 06 ×1, from the late part.

### D09 (level 8)

104 × 57 tiles. Ends through an exit door.

Terrain: 4 moving platforms, hazards.

**Along the way** (rough order, start first):

- **Exit door** — (98, 52), bottom right, middle

**Creatures**: type 02 ×2, from the ≈late part; type 04 ×7, from the early part; type 05 ×2, from the middle part; type 06 ×1, from the ≈late part.

### D10 (level 9)

67 × 117 tiles. Ends through an exit door.

Terrain: 7 moving platforms, hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (54, 47), middle right, middle
- Keycard, blue — (23, 69), centre, middle
- Keycard, red — (26, 97), bottom centre, middle
- Keycard, green — (60, 90), bottom right, late
- **Exit door** — (27, 112), bottom centre, late

**Creatures**: turret ×11, from the middle part; type 02 ×4, from the middle part; type 04 ×14, from the early part; type 05 ×6, from the middle part; type 07 ×1, from the middle part.

### D11 (level 10)

64 × 37 tiles. Ends through an exit door.

Terrain: 4 moving platforms, hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (11, 14), middle left, early
- Keycard, blue — (34, 20), centre, middle
- **Exit door** — (57, 33), bottom right, late

**Creatures**: turret ×4, from the early part; type 02 ×2, from the middle part; type 04 ×5, from the early part; type 06 ×4, from the middle part.

### D12 (level 11)

44 × 37 tiles. Ends through an exit door.

Terrain: 1 moving platform, hazards.

**Along the way** (rough order, start first):

- Keycard, blue — (4, 28), bottom left, middle
- **Exit door** — (38, 7), top right, late

**Creatures**: turret ×4, from the early part; type 02 ×5, from the early part; type 04 ×2, from the early part.

### D13 (level 12)

54 × 47 tiles. Ends through 2 exit doors.

Terrain: 3 moving platforms, hazards.

**Along the way** (rough order, start first):

- Keycard, red — (12, 10), top left, early
- **Exit door** — (47, 5), top right, middle
- Keycard, yellow — (50, 20), middle right, middle
- **Exit door** — (5, 41), bottom left, middle

**Creatures**: turret ×11, from the early part; type 01 ×1, from the middle part; type 04 ×5, from the early part; type 06 ×2, from the middle part; type 08 ×6, from the middle part.

### D15 (level 14)

184 × 25 tiles. Ends through an exit door.

Terrain: 1 moving platform, hazards.

**Along the way** (rough order, start first):

- Keycard, yellow — (26, 9), middle left, early
- **Exit door** — (178, 18), bottom right, late

**Creatures**: turret ×2, from the early part; type 01 ×1, from the late part; type 04 ×4, from the late part; type 06 ×21, from the early part; type 08 ×3, from the late part.

### D16 (level 15)

128 × 120 tiles. Ends through 2 exit doors.

Terrain: hazards.

**Along the way** (rough order, start first):

- Keycard, red — (70, 78), centre, middle
- Keycard, green — (122, 57), middle right, middle
- **Exit door** — (122, 115), bottom right, middle
- **Exit door** — (122, 43), middle right, middle
- Keycard, blue — (56, 101), bottom centre, late
- Keycard, yellow — (22, 92), bottom left, late

**Creatures**: type 01 ×8, from the middle part; type 04 ×9, from the early part; type 05 ×13, from the early part; type 06 ×9, from the middle part; type 07 ×2, from the late part.

### D14 (level 13)

84 × 107 tiles. Ends through 2 exit doors.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Exit door** — (74, 102), bottom right, middle
- **Exit door** — (74, 24), top right, ≈middle

**Creatures**: type 01 ×18, from the early part; type 02 ×7, from the early part; type 03 ×1, from the middle part.

### D17 (level 16)

25 × 24 tiles. Ends by taking the objective.

Terrain: hazards.

**Along the way** (rough order, start first):

- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (9, 13), centre, early
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (9, 6), top centre, early
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (11, 4), top centre, early
- **Objective** (objective type 02) — taking it ends the level — (12, 8), centre, ≈middle
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (15, 13), centre, ≈middle
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (15, 6), top centre, middle
- **Objective item** (objective type 01) — doesn't end the level; what it is and why Poom wants it is the story's — (13, 4), top centre, late

**Creatures**: turret ×2, from the early part; type 08 ×2, from the ≈middle part; type 09 ×2, from the early part; type 10 ×1, from the early part; type 11 ×1, from the ≈middle part.
