# Book 5 (map set A): story map

Generated from the map data by `tools/story-map.js A`. It says where in Book A the story has to say something, so the script can lead up to it. Positions are tiles, (x, y) from the top left.

"Early", "middle" and "late" say how far along a level something is, by a rough path from the start (walking, pogo jumps, poles, warp doors, platforms' routes, with key doors and bridges open). Where that path doesn't get, it is a guess from the straight-line distance to the start, marked "≈": check those by playing.

## The book

- **15 levels**, A02–A16. Not levels: A17 (highscores), A18 (test).
- **Chapters**: chapters are split at cutscenes between levels. Book A has none, so it is **one chapter**. Its theme is still to choose.
- **Story elements**: 15 objectives that end levels, 0 objective items that don't, 0 rescues, 0 hint signs, 14 enemy types, turrets.

## The world map

Poom starts at (26, 36). The map has 15 linked teleporters. Some paths are shut until a level is done; this is the order the map lets levels be played, if each one is done as soon as it can be:

1. **Open from the start**:
   - A02 (level 1); finishing it clears 1 barrier tile
2. **Then**:
   - A03 (level 2) — needs A02 (level 1) done; finishing it clears 1 barrier tile
   - A04 (level 3) — needs A02 (level 1) done
   - A05 (level 4) — needs A02 (level 1) done; finishing it clears 1 barrier tile
   - A06 (level 5) — needs A02 (level 1) done; finishing it clears 2 barrier tiles
   - A09 (level 8) — needs A02 (level 1) done
   - A10 (level 9) — needs A02 (level 1) done; finishing it clears 1 barrier tile
   - A12 (level 11) — needs A02 (level 1) done; finishing it clears 2 barrier tiles
   - A13 (level 12) — needs A02 (level 1) done; finishing it clears 1 barrier tile
   - A14 (level 13) — needs A02 (level 1) done
3. **Then**:
   - A07 (level 6) — needs A02 (level 1) and A06 (level 5) done; finishing it clears 2 barrier tiles
   - A11 (level 10) — needs A02 (level 1) and A10 (level 9) done; finishing it clears 1 barrier tile
4. **Then**:
   - A08 (level 7) — needs A02 (level 1) and A06 (level 5) and A07 (level 6) done; finishing it clears 1 barrier tile
5. **Then**:
   - A15 (level 14) — needs A02 (level 1) and A05 (level 4) and A13 (level 12) and A11 (level 10) and A08 (level 7) done; finishing it clears 2 barrier tiles
6. **Then**:
   - A16 (level 15) — needs A02 (level 1) and A05 (level 4) and A13 (level 12) and A11 (level 10) and A08 (level 7) and A15 (level 14) done

Levels in the same step can be played in any order, so the story can't assume one of them comes before another.

## Summary

| Level | Ends by | Objectives | Items | Rescues | Hints | Creatures |
|---|---|---|---|---|---|---|
| A02 (level 1) | by walking off the left edge of the map; by taking the objective | 1 | – | – | – | 01, 02, 03 |
| A03 (level 2) | by walking off the left or right edge of the map; by taking the objective | 1 | – | – | – | turret, 01, 04, 05, 06, 07 |
| A04 (level 3) | by walking off the left edge of the map | – | – | – | – | turret, 01, 02, 03, 04, 05, 06, 08 |
| A05 (level 4) | through an exit door; by walking off the left or right edge of the map; by taking the objective | 1 | – | – | – | turret, 01, 02, 03, 04, 05, 06, 07, 08 |
| A06 (level 5) | by walking off the right or left edge of the map; by taking the objective | 1 | – | – | – | 04, 07, 08, 09, 10 |
| A09 (level 8) | by walking off the left edge of the map; by taking the objective | 1 | – | – | – | turret, 01, 03, 07, 08, 11, 12 |
| A10 (level 9) | through an exit door; by walking off the right edge of the map; by taking the objective | 1 | – | – | – | 01, 04, 07, 08, 11, 12 |
| A12 (level 11) | by walking off the left edge of the map; by taking the objective | 1 | – | – | – | turret, 02, 03, 07, 13 |
| A13 (level 12) | through an exit door; by taking the objective | 1 | – | – | – | turret, 01, 03, 07, 13 |
| A14 (level 13) | by walking off the right edge of the map | – | – | – | – | turret, 01, 02, 03 |
| A07 (level 6) | by walking off the right edge of the map | – | – | – | – | 09, 10 |
| A11 (level 10) | through an exit door; by taking the objective | 1 | – | – | – | turret, 01, 02, 03, 07, 11, 12 |
| A08 (level 7) | through an exit door; by walking off the left edge of the map; by taking the objective | 1 | – | – | – | turret, 01, 03, 07, 08 |
| A15 (level 14) | by walking off the left edge of the map; by taking the objective | 1 | – | – | – | turret, 01, 02, 06, 07, 13 |
| A16 (level 15) | by walking off the left or right edge of the map; by taking the last of 4 objectives | 4 | – | – | – | turret, 02, 14 |

## Creatures across the book

Creature types are numbered per book; the same number is the same creature only within Book A. Each needs a name, a look and a part in the story.

| Type | Where (count) |
|---|---|
| turret | A03 ×4, A04 ×2, A05 ×7, A08 ×4, A09 ×4, A11 ×2, A12 ×5, A13 ×2, A14 ×23, A15 ×3, A16 ×10 |
| type 01 | A02 ×6, A03 ×4, A04 ×2, A05 ×3, A08 ×2, A09 ×3, A10 ×5, A11 ×3, A13 ×2, A14 ×4, A15 ×4 |
| type 02 | A02 ×1, A04 ×2, A05 ×3, A11 ×2, A12 ×1, A14 ×5, A15 ×5, A16 ×1 |
| type 03 | A02 ×6, A04 ×3, A05 ×3, A08 ×8, A09 ×4, A11 ×6, A12 ×4, A13 ×5, A14 ×7 |
| type 04 | A03 ×1, A04 ×1, A05 ×1, A06 ×1, A10 ×3 |
| type 05 | A03 ×9, A04 ×10, A05 ×5 |
| type 06 | A03 ×7, A04 ×7, A05 ×9, A15 ×5 |
| type 07 | A03 ×1, A05 ×1, A06 ×1, A08 ×1, A09 ×5, A10 ×11, A11 ×3, A12 ×1, A13 ×1, A15 ×1 |
| type 08 | A04 ×2, A05 ×8, A06 ×3, A08 ×5, A09 ×1, A10 ×3 |
| type 09 | A06 ×4, A07 ×7 |
| type 10 | A06 ×15, A07 ×9 |
| type 11 | A09 ×6, A10 ×8, A11 ×6 |
| type 12 | A09 ×4, A10 ×15, A11 ×6 |
| type 13 | A12 ×4, A13 ×3, A15 ×2 |
| type 14 | A16 ×1 |

## Levels

In the order the map opens them.

### A02 (level 1)

111 × 68 tiles. Ends by walking off the left edge of the map, or by taking the objective.

Terrain: 1 warp door, 10 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- **Way out: the left edge** — (1, 17), top left, middle
- **Way out: the left edge** — (1, 60), bottom left, middle
- **Objective** (objective type 01) — taking it ends the level — (17, 1), top left, ≈late

**Creatures**: type 01 ×6, from the early part; type 02 ×1, from the middle part; type 03 ×6, from the early part.

### A03 (level 2)

128 × 49 tiles. Ends by walking off the left or right edge of the map, or by taking the objective. *The source also lists an exit door, but its only door tiles are the feet of key-socket doors, which the engine treats as door.*

Terrain: 5 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- **Way out: the right edge** — (127, 1), top right, ≈early
- Keycard, green — (98, 14), top right, early
- Key socket, green — opens a door 4 tiles tall at (74, 27) — (76, 29), centre, early
- Platform switch — changes a moving platform's path at (77, 6) — (67, 12), top centre, middle
- **Objective** (objective type 01) — taking it ends the level — (117, 42), bottom right, middle
- Key socket, blue — opens a door 4 tiles tall at (45, 25) — (49, 30), centre, middle
- Keycard, blue — (54, 41), bottom centre, ≈middle
- Bridge switch — removes a 5-tile bridge at (58, 37) — (41, 10), top left, late
- **Way out: the left edge** — (1, 27), middle left, late
- **Way out: the left edge** — (1, 47), bottom left, ≈late
- **Way out: the left edge** — (1, 1), top left, ≈late

**Creatures**: turret ×4, from the late part; type 01 ×4, from the early part; type 04 ×1, from the middle part; type 05 ×9, from the early part; type 06 ×7, from the early part; type 07 ×1, from the ≈late part.

### A04 (level 3)

76 × 104 tiles. Ends by walking off the left edge of the map. *The source also lists an exit door, but its only door tiles are the feet of key-socket doors, which the engine treats as door.*

Terrain: 3 warp doors, 5 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Key socket, red — opens a door 7 tiles tall at (48, 38) — (37, 43), centre, middle
- **Way out: the left edge** — (1, 51), middle left, late
- Bridge switch — removes a 9-tile bridge at (35, 29) — (29, 17), top centre, late
- Platform switch — changes a moving platform's path at (50, 18) — (65, 5), top right, late
- Keycard, red — (62, 72), bottom right, late
- Platform switch — changes a moving platform's path at (58, 84) — (66, 81), bottom right, late
- Platform switch — changes a moving platform's path at (61, 89) — (68, 90), bottom right, late

**Creatures**: turret ×2, from the early part; type 01 ×2, from the early part; type 02 ×2, from the late part; type 03 ×3, from the early part; type 04 ×1, from the late part; type 05 ×10, from the middle part; type 06 ×7, from the early part; type 08 ×2, from the middle part.

### A05 (level 4)

94 × 73 tiles. Ends through an exit door, or by walking off the left or right edge of the map, or by taking the objective.

Terrain: 8 warp doors, 7 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Key socket, yellow — opens a door 4 tiles tall at (67, 62) — (69, 64), bottom right, early
- **Way out: the right edge** — (93, 72), bottom right, early
- Key socket, blue — opens a door 6 tiles tall at (65, 41) — (67, 45), middle right, early
- Bridge switch — removes a 5-tile bridge at (28, 28) — (30, 42), middle left, early
- Platform switch — changes a moving platform's path at (57, 34) — (76, 27), middle right, early
- Key socket, green — opens a door 5 tiles tall at (34, 49) — (36, 52), bottom centre, middle
- Keycard, green — (52, 27), centre, middle
- Keycard, blue — (35, 42), centre, ≈middle
- Keycard, yellow — (44, 65), bottom centre, middle
- **Way out: the right edge** — (93, 0), top right, ≈middle
- Keycard, uncoloured — (70, 9), top right, middle
- **Exit door** — (21, 19), top left, late
- Bridge switch — removes a 8-tile bridge at (13, 28) — (22, 26), middle left, ≈late
- **Way out: the left edge** — (1, 70), bottom left, ≈late
- **Way out: the left edge** — (1, 72), bottom left, ≈late
- **Objective** (objective type 01) — taking it ends the level — (1, 5), top left, ≈late
- **Way out: the left edge** — (1, 0), top left, ≈late

**Creatures**: turret ×7, from the early part; type 01 ×3, from the early part; type 02 ×3, from the middle part; type 03 ×3, from the early part; type 04 ×1, from the early part; type 05 ×5, from the early part; type 06 ×9, from the early part; type 07 ×1, from the ≈late part; type 08 ×8, from the early part.

### A06 (level 5)

117 × 81 tiles. Ends by walking off the right or left edge of the map, or by taking the objective. *The source also lists an exit door, but its only door tiles are the feet of key-socket doors, which the engine treats as door.*

Terrain: 6 warp doors, 2 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- **Objective** (objective type 01) — taking it ends the level — (22, 9), top left, ≈early
- **Way out: the left edge** — (1, 80), bottom left, ≈middle
- Keycard, yellow — (71, 10), top centre, ≈middle
- Key socket, yellow — opens a door 5 tiles tall at (26, 66) — (24, 69), bottom left, middle
- Platform switch — changes a moving platform's path at (14, 66) — (34, 68), bottom left, middle
- Platform switch — changes a moving platform's path at (38, 22) — (108, 33), middle right, late
- **Way out: the right edge** — (116, 25), top right, late
- **Way out: the right edge** — (116, 80), bottom right, ≈late

**Creatures**: type 04 ×1, from the ≈middle part; type 07 ×1, from the ≈middle part; type 08 ×3, from the ≈early part; type 09 ×4, from the ≈early part; type 10 ×15, from the early part.

### A09 (level 8)

90 × 74 tiles. Ends by walking off the left edge of the map, or by taking the objective. *The source also lists an exit door, but its only door tiles are the feet of key-socket doors, which the engine treats as door.*

Terrain: 2 warp doors, 13 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Key socket, green — opens a door 6 tiles tall at (52, 11) — (54, 15), top centre, early
- Keycard, green — (70, 35), middle right, middle
- Key socket, red — opens a door 5 tiles tall at (34, 33) — (36, 36), centre, middle
- **Objective** (objective type 01) — taking it ends the level — (14, 7), top left, middle
- **Way out: the left edge** — (1, 12), top left, late
- Bridge switch — removes a 3-tile bridge at (23, 15) — (24, 64), bottom left, late
- Keycard, red — (7, 47), middle left, late
- Platform switch — changes a moving platform's path at (34, 27) — (84, 65), bottom right, late

**Creatures**: turret ×4, from the late part; type 01 ×3, from the early part; type 03 ×4, from the early part; type 07 ×5, from the middle part; type 08 ×1, from the ≈middle part; type 11 ×6, from the middle part; type 12 ×4 ((sliding, axis 1), (sliding, axis 0), (bouncing)), from the middle part.

### A10 (level 9)

90 × 150 tiles. Ends through an exit door, or by walking off the right edge of the map, or by taking the objective.

Terrain: 21 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Key socket, yellow — opens a door 7 tiles tall at (61, 86) — (59, 91), centre, middle
- **Way out: the right edge** — (88, 61), middle right, middle
- Bridge switch — removes a 10-tile bridge at (75, 64) — (84, 82), middle right, middle
- Key socket, blue — opens a door 6 tiles tall at (82, 79) — (77, 83), middle right, middle
- Bridge switch — removes a 4-tile bridge at (81, 100) — (80, 108), bottom right, middle
- Keycard, blue — (83, 123), bottom right, middle
- **Objective** (objective type 01) — taking it ends the level — (0, 148), bottom left, ≈late
- **Exit door** — (83, 144), bottom right, late
- Keycard, yellow — (73, 9), top right, late

**Creatures**: type 01 ×5, from the early part; type 04 ×3, from the middle part; type 07 ×11, from the early part; type 08 ×3, from the middle part; type 11 ×8, from the early part; type 12 ×15 ((sliding, axis 1), (sliding, axis 0)), from the early part.

### A12 (level 11)

66 × 93 tiles. Ends by walking off the left edge of the map, or by taking the objective. *The source also lists an exit door, but its only door tiles are the feet of key-socket doors, which the engine treats as door.*

Terrain: 23 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- **Way out: the left edge** — (1, 92), bottom left, ≈early
- **Objective** (objective type 01) — taking it ends the level — (17, 80), bottom left, early
- Keycard, green — (5, 63), bottom left, early
- Bridge switch — removes a 1-tile bridge at (49, 73) — (23, 53), centre, ≈middle
- Platform switch — changes a moving platform's path at (7, 42) — (5, 46), middle left, ≈middle
- Key socket, red — opens a door 5 tiles tall at (27, 51) — (29, 54), centre, ≈middle
- Bridge switch — extends a 1-tile bridge at (32, 55) — (47, 71), bottom right, ≈middle
- Keycard, yellow — (50, 83), bottom right, ≈middle
- Key socket, yellow — opens a door 4 tiles tall at (10, 50) — (5, 59), middle left, middle
- Platform switch — changes a moving platform's path at (54, 46) — (51, 57), middle right, ≈middle
- Platform switch — changes a moving platform's path at (5, 72) — (44, 77), bottom right, middle
- **Way out: the left edge** — (1, 18), top left, ≈late
- Keycard, red — (58, 38), middle right, ≈late
- Key socket, green — opens a door 4 tiles tall at (30, 62) — (28, 64), bottom centre, late
- Key socket, blue — opens a door 5 tiles tall at (29, 10) — (38, 19), top centre, ≈late
- Keycard, blue — (58, 5), top right, ≈late

**Creatures**: turret ×5, from the ≈middle part; type 02 ×1, from the ≈late part; type 03 ×4, from the ≈middle part; type 07 ×1, from the ≈late part; type 13 ×4, from the middle part.

### A13 (level 12)

90 × 86 tiles. Ends through an exit door, or by taking the objective.

Terrain: 31 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Keycard, uncoloured — (41, 75), bottom centre, early
- **Objective** (objective type 01) — taking it ends the level — (3, 84), bottom left, middle
- Key socket, red — opens a door 7 tiles tall at (22, 14) — (24, 19), top left, middle
- Bridge switch — extends a 1-tile bridge at (65, 79) — (5, 61), bottom left, middle
- Keycard, red — (83, 75), bottom right, middle
- **Exit door** — (64, 45), middle right, late
- Platform switch — changes a moving platform's path at (63, 29) — (81, 22), top right, late
- Platform switch — changes a moving platform's path at (32, 29) — (37, 7), top centre, late

**Creatures**: turret ×2, from the late part; type 01 ×2, from the middle part; type 03 ×5, from the middle part; type 07 ×1, from the ≈late part; type 13 ×3, from the early part.

### A14 (level 13)

68 × 90 tiles. Ends by walking off the right edge of the map. *The source also lists an exit door, but its only door tiles are the feet of key-socket doors, which the engine treats as door.*

Terrain: 3 warp doors, 12 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Bridge switch — removes a 5-tile bridge at (20, 10) — (22, 8), top left, early
- Bridge switch — removes a 8-tile bridge at (48, 50) — (25, 47), centre, middle
- Keycard, red — (38, 57), centre, middle
- Bridge switch — removes a 4-tile bridge at (50, 53) — (58, 40), middle right, middle
- Key socket, red — opens a door 4 tiles tall at (60, 46) — (59, 48), middle right, middle
- Keycard, blue — (32, 28), top centre, middle
- Key socket, blue — opens a door 4 tiles tall at (57, 27) — (55, 29), top right, middle
- Bridge switch — extends a 4-tile bridge at (16, 49) — (11, 29), top left, late
- **Way out: the right edge** — (66, 7), top right, late

**Creatures**: turret ×23, from the middle part; type 01 ×4, from the middle part; type 02 ×5, from the middle part; type 03 ×7, from the middle part.

### A07 (level 6)

142 × 68 tiles. Ends by walking off the right edge of the map. *The source also lists an exit door, but its only door tiles are the feet of key-socket doors, which the engine treats as door.*

Terrain: 7 warp doors, 3 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Key socket, red — opens a door 7 tiles tall at (66, 54) — (64, 59), bottom centre, early
- Keycard, yellow — (48, 10), top centre, ≈middle
- Keycard, red — (30, 19), top left, middle
- Key socket, yellow — opens a door 5 tiles tall at (107, 45) — (109, 48), bottom right, late
- Platform switch — changes a moving platform's path at (117, 48) — (100, 49), bottom right, late
- **Way out: the right edge** — (140, 45), middle right, late

**Creatures**: type 09 ×7, from the early part; type 10 ×9, from the early part.

### A11 (level 10)

130 × 67 tiles. Ends through an exit door, or by taking the objective.

Terrain: 14 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- **Objective** (objective type 01) — taking it ends the level — (4, 65), bottom left, ≈middle
- Key socket, blue — opens a door 4 tiles tall at (100, 35) — (98, 37), middle right, middle
- Keycard, uncoloured — (55, 48), bottom centre, middle
- Keycard, yellow — (90, 27), middle right, middle
- Key socket, green — opens a door 4 tiles tall at (100, 29) — (98, 31), middle right, middle
- Key socket, yellow — opens a door 5 tiles tall at (23, 29) — (25, 32), middle left, late
- Platform switch — changes a moving platform's path at (109, 26) — (108, 30), middle right, late
- Platform switch — changes a moving platform's path at (123, 48) — (123, 44), middle right, late
- Platform switch — changes a moving platform's path at (106, 61) — (122, 59), bottom right, late
- Keycard, blue — (104, 59), bottom right, late
- Keycard, green — (37, 53), bottom left, late
- **Exit door** — (93, 56), bottom right, late

**Creatures**: turret ×2, from the late part; type 01 ×3, from the middle part; type 02 ×2, from the middle part; type 03 ×6, from the middle part; type 07 ×3, from the late part; type 11 ×6, from the late part; type 12 ×6 ((bouncing), (sliding, axis 1), (sliding, axis 0)), from the ≈early part.

### A08 (level 7)

61 × 141 tiles. Ends through an exit door, or by walking off the left edge of the map, or by taking the objective.

Terrain: 5 warp doors, 19 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Bridge switch — removes a 11-tile bridge at (6, 57) — (19, 55), middle left, ≈early
- Bridge switch — removes a 11-tile bridge at (6, 104) — (11, 59), middle left, ≈early
- **Exit door** — (11, 65), middle left, ≈early
- Bridge switch — removes a 6-tile bridge at (8, 109) — (5, 102), bottom left, ≈middle
- Key socket, yellow — opens a door 4 tiles tall at (47, 92) — (45, 94), bottom right, middle
- Bridge switch — removes a 6-tile bridge at (8, 61) — (10, 111), bottom left, ≈late
- Keycard, red — (55, 92), middle right, late
- Key socket, red — opens a door 5 tiles tall at (10, 133) — (12, 136), bottom left, late
- **Way out: the left edge** — (1, 97), bottom left, late
- Keycard, uncoloured — (6, 133), bottom left, late
- **Way out: the left edge** — (1, 138), bottom left, ≈late
- **Objective** (objective type 01) — taking it ends the level — (2, 139), bottom left, ≈late
- **Way out: the left edge** — (1, 140), bottom left, ≈late
- Keycard, yellow — (5, 117), bottom left, late

**Creatures**: turret ×4, from the ≈early part; type 01 ×2, from the early part; type 03 ×8, from the early part; type 07 ×1, from the ≈late part; type 08 ×5, from the early part.

### A15 (level 14)

202 × 31 tiles. Ends by walking off the left edge of the map, or by taking the objective. *The source also lists an exit door, but its only door tiles are the feet of key-socket doors, which the engine treats as door.*

Terrain: 3 warp doors, 14 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Key socket, green — opens a door 5 tiles tall at (99, 4) — (101, 7), top centre, ≈middle
- Keycard, green — (79, 24), bottom centre, ≈middle
- Keycard, yellow — (66, 7), top left, ≈middle
- Key socket, yellow — opens a door 4 tiles tall at (38, 16) — (40, 18), middle left, ≈late
- Keycard, blue — (13, 17), middle left, ≈late
- Key socket, blue — opens a door 4 tiles tall at (10, 3) — (12, 5), top left, ≈late
- **Way out: the left edge** — (1, 23), bottom left, ≈late
- **Objective** (objective type 01) — taking it ends the level — (1, 27), bottom left, ≈late

**Creatures**: turret ×3, from the late part; type 01 ×4, from the early part; type 02 ×5, from the ≈middle part; type 06 ×5, from the early part; type 07 ×1, from the late part; type 13 ×2, from the middle part.

### A16 (level 15)

160 × 65 tiles. Ends by walking off the left or right edge of the map, or by taking the last of 4 objectives. *The source also lists an exit door, but its only door tiles are the feet of key-socket doors, which the engine treats as door.*

Terrain: 1 moving platform, slopes, hazards, poles.

**Along the way** (rough order, start first):

- **Way out: the left edge** — (1, 19), top left, ≈early
- Key socket, red — opens a door 6 tiles tall at (38, 33) — (36, 37), middle left, early
- Bridge switch — removes a 1-tile bridge at (29, 30) — (16, 30), middle left, early
- **Objective** (objective type 01) — taking the last of these ends the level — (17, 38), middle left, early
- Keycard, red — (15, 38), middle left, ≈early
- Bridge switch — removes a 1-tile bridge at (29, 15) — (64, 8), top centre, early
- **Objective** (objective type 01) — taking the last of these ends the level — (22, 51), bottom left, ≈early
- Bridge switch — removes a 1-tile bridge at (5, 53) — (7, 51), bottom left, ≈early
- **Way out: the left edge** — (1, 58), bottom left, ≈early
- Keycard, yellow — (72, 18), top centre, ≈middle
- Key socket, yellow — opens a door 5 tiles tall at (98, 28) — (96, 31), centre, middle
- **Objective** (objective type 01) — taking the last of these ends the level — (118, 36), middle right, middle
- Key socket, blue — opens a door 5 tiles tall at (138, 31) — (136, 34), middle right, middle
- Platform switch — changes a moving platform's path at (134, 21) — (116, 36), middle right, ≈late
- Keycard, blue — (155, 15), top right, ≈late
- **Way out: the right edge** — (159, 8), top right, ≈late
- **Objective** (objective type 01) — taking the last of these ends the level — (85, 55), bottom centre, late

**Creatures**: turret ×10, from the early part; type 02 ×1, from the early part; type 14 ×1, from the early part.
