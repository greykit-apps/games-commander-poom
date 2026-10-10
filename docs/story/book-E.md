# Book 4 (map set E): story map

Generated from the map data by `tools/story-map.js E`. It says where in Book E the story has to say something, so the script can lead up to it. Positions are tiles, (x, y) from the top left.

"Early", "middle" and "late" say how far along a level something is, by a rough path from the start (walking, pogo jumps, poles, warp doors, platforms' routes, with key doors and bridges open). Where that path doesn't get, it is a guess from the straight-line distance to the start, marked "≈": check those by playing.

## The book

- **17 levels**, E02–E18. Not levels: E19 (cutscene), E20 (highscores).
- **Chapters**: chapters are split at cutscenes between levels. Book E has none, so it is **one chapter**; E19 comes after the last level, so it is the ending. Its theme is still to choose.
- **Story elements**: 1 objective that end levels, 0 objective items that don't, 8 rescues, 0 hint signs, 17 enemy types, turrets.

## The world map

Poom starts at (56, 37). The map has 2 linked teleporters. Some paths are shut until a level is done; this is the order the map lets levels be played, if each one is done as soon as it can be:

1. **Open from the start**:
   - E02 (level 1); finishing it clears 2 barrier tiles
2. **Then**:
   - E03 (level 2) — needs E02 (level 1) done; finishing it clears 2 barrier tiles
   - E04 (level 3) — needs E02 (level 1) done
3. **Then**:
   - E05 (level 4) — needs E02 (level 1) and E03 (level 2) done
   - E06 (level 5) — needs E02 (level 1) and E03 (level 2) done
   - E07 (level 6) — needs E02 (level 1) and E03 (level 2) done
   - E08 (level 7) — needs E02 (level 1) and E03 (level 2) done
   - E09 (level 8) — needs E02 (level 1) and E03 (level 2) done
   - E10 (level 9) — needs E02 (level 1) and E03 (level 2) done
   - E11 (level 10) — needs E02 (level 1) and E03 (level 2) done
   - E12 (level 11) — needs E02 (level 1) and E03 (level 2) done
   - E13 (level 12) — needs E02 (level 1) and E03 (level 2) done
   - E14 (level 13) — needs E02 (level 1) and E03 (level 2) done
   - E15 (level 14) — needs E02 (level 1) and E03 (level 2) done

**Not reachable by walking the map: E16 (level 15), E17 (level 16), E18 (level 17).**

Levels in the same step can be played in any order, so the story can't assume one of them comes before another.

## Summary

| Level | Ends by | Objectives | Items | Rescues | Hints | Creatures |
|---|---|---|---|---|---|---|
| E02 (level 1) | by walking off the left edge of the map | – | – | – | – | 01, 02, 03 |
| E03 (level 2) | by walking off the left edge of the map | – | – | – | – | 01, 02, 03, 04, 05, 06 |
| E04 (level 3) | by reaching the one to rescue | – | – | 1 | – | 01, 02, 03, 04, 06 |
| E05 (level 4) | through an exit door; by reaching the one to rescue | – | – | 1 | – | 01, 02, 04, 06, 07 |
| E06 (level 5) | through 2 exit doors; by walking off the right edge of the map | – | – | – | – | 01, 02, 06, 07, 08, 09, 10 |
| E07 (level 6) | by reaching the one to rescue | – | – | 1 | – | 01, 02, 04, 06, 09, 10 |
| E08 (level 7) | by walking off the right edge of the map | – | – | – | – | 01, 03, 04, 06, 07 |
| E09 (level 8) | by walking off the right edge of the map | – | – | – | – | 01, 04, 05, 06, 07, 11 |
| E10 (level 9) | by taking the objective | 1 | – | – | – | 01, 04, 05, 06 |
| E11 (level 10) | by reaching the one to rescue | – | – | 1 | – | 01, 02, 04, 05, 07, 08 |
| E12 (level 11) | by walking off the right edge of the map | – | – | – | – | turret, 01, 02, 11 |
| E13 (level 12) | by reaching the one to rescue | – | – | 1 | – | turret, 01, 02, 04 |
| E14 (level 13) | by reaching the one to rescue | – | – | 1 | – | turret, 01, 02, 04, 12 |
| E15 (level 14) | through an exit door | – | – | – | – | turret, 01, 02, 04, 06 |
| E16 (level 15) | by walking off the right edge of the map | – | – | – | – | 01, 04, 05, 06 |
| E17 (level 16) | by reaching the one to rescue | – | – | 1 | – | 01, 07, 13 |
| E18 (level 17) | by reaching the one to rescue | – | – | 1 | – | 14, 15, 16, 17 |

## Creatures across the book

Creature types are numbered per book; the same number is the same creature only within Book E. Each needs a name, a look and a part in the story.

| Type | Where (count) |
|---|---|
| turret | E12 ×30, E13 ×16, E14 ×7, E15 ×6 |
| type 01 | E02 ×3, E03 ×10, E04 ×4, E05 ×5, E06 ×14, E07 ×20, E08 ×10, E09 ×19, E10 ×18, E11 ×6, E12 ×4, E13 ×19, E14 ×24, E15 ×22, E16 ×7, E17 ×13 |
| type 02 | E02 ×2, E03 ×5, E04 ×5, E05 ×4, E06 ×12, E07 ×4, E11 ×1, E12 ×10, E13 ×5, E14 ×6, E15 ×11 |
| type 03 | E02 ×2, E03 ×4, E04 ×1, E08 ×1 |
| type 04 | E03 ×2, E04 ×1, E05 ×8, E07 ×7, E08 ×6, E09 ×11, E10 ×5, E11 ×1, E13 ×8, E14 ×7, E15 ×13, E16 ×3 |
| type 05 | E03 ×5, E09 ×2, E10 ×5, E11 ×3, E16 ×5 |
| type 06 | E03 ×1, E04 ×3, E05 ×7, E06 ×3, E07 ×5, E08 ×2, E09 ×1, E10 ×5, E15 ×1, E16 ×1 |
| type 07 | E05 ×3, E06 ×3, E08 ×3, E09 ×7, E11 ×2, E17 ×6 |
| type 08 | E06 ×7, E11 ×1 |
| type 09 | E06 ×2, E07 ×3 |
| type 10 | E06 ×2, E07 ×1 |
| type 11 | E09 ×10, E12 ×2 |
| type 12 | E14 ×4 |
| type 13 | E17 ×11 |
| type 14 | E18 ×9 |
| type 15 | E18 ×17 |
| type 16 | E18 ×24 |
| type 17 | E18 ×13 |

## Levels

In the order the map opens them.

### E02 (level 1)

112 × 63 tiles. Ends by walking off the left edge of the map.

Terrain: 9 warp doors, 1 moving platform, slopes, hazards, poles.

**Along the way** (rough order, start first):

- **Way out: the left edge** — (1, 15), top left, late

**Creatures**: type 01 ×3, from the middle part; type 02 ×2, from the middle part; type 03 ×2, from the early part.

### E03 (level 2)

146 × 44 tiles. Ends by walking off the left edge of the map.

Terrain: 1 moving platform, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Platform switch — changes a moving platform's path at (26, 30) — (34, 29), middle left, middle
- **Way out: the left edge** — (1, 14), top left, late

**Creatures**: type 01 ×10, from the early part; type 02 ×5, from the early part; type 03 ×4, from the early part; type 04 ×2, from the middle part; type 05 ×5, from the early part; type 06 ×1, from the middle part.

### E04 (level 3)

60 × 84 tiles. Ends by reaching the one to rescue.

Terrain: 4 warp doors, 3 moving platforms, slopes, poles.

**Along the way** (rough order, start first):

- Key socket, red — opens a door 5 tiles tall at (23, 50) — (21, 53), centre, late
- Platform switch — changes a moving platform's path at (22, 39) — (8, 52), middle left, late
- Keycard, blue — (10, 29), middle left, late
- **Rescue** (npc type 01) — touching them ends the level; the dialogue happens here — (19, 78), bottom left, ≈late
- Key socket, blue — opens a door 5 tiles tall at (16, 75) — (14, 78), bottom left, ≈late
- Keycard, red — (33, 53), centre, late

**Creatures**: type 01 ×4, from the middle part; type 02 ×5, from the early part; type 03 ×1, from the late part; type 04 ×1, from the ≈early part; type 06 ×3, from the ≈middle part.

### E05 (level 4)

165 × 80 tiles. Ends through an exit door, or by reaching the one to rescue.

Terrain: 3 warp doors, 13 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Key socket, red — opens a door 10 tiles tall at (157, 16) — (155, 19), top right, middle
- Keycard, yellow — (159, 17), top right, middle
- Platform switch — changes a moving platform's path at (59, 57) — (56, 59), bottom centre, middle
- Keycard, red — (41, 61), bottom left, middle
- **Exit door** — (52, 18), top left, middle
- Platform switch — changes a moving platform's path at (59, 68) — (48, 72), bottom left, middle
- Key socket, yellow — opens a door 5 tiles tall at (9, 4) — (11, 7), top left, late
- **Rescue** (npc type 01) — touching them ends the level; the dialogue happens here — (4, 7), top left, late

**Creatures**: type 01 ×5, from the middle part; type 02 ×4, from the early part; type 04 ×8, from the early part; type 06 ×7, from the middle part; type 07 ×3, from the early part.

### E06 (level 5)

120 × 102 tiles. Ends through 2 exit doors, or by walking off the right edge of the map.

Terrain: 5 warp doors, 3 moving platforms, slopes, pulsing spikes, poles.

**Along the way** (rough order, start first):

- **Exit door** — (7, 37), middle left, early
- **Exit door** — (5, 81), bottom left, early
- **Way out: the right edge** — (118, 30), top right, middle
- NPC (npc type 02), not a rescue — (86, 7), top right, ≈late

**Creatures**: type 01 ×14, from the early part; type 02 ×12, from the ≈early part; type 06 ×3, from the early part; type 07 ×3, from the early part; type 08 ×7, from the ≈early part; type 09 ×2, from the middle part; type 10 ×2, from the middle part.

### E07 (level 6)

80 × 124 tiles. Ends by reaching the one to rescue.

Terrain: 2 warp doors, 13 moving platforms, slopes, poles.

**Along the way** (rough order, start first):

- Platform switch — changes a moving platform's path at (33, 75) — (34, 77), centre, ≈early
- Key socket, blue — opens a door 5 tiles tall at (67, 102) — (65, 105), bottom right, middle
- Keycard, green — (39, 45), centre, ≈middle
- Keycard, yellow — (46, 42), centre, ≈middle
- Key socket, yellow — opens a door 5 tiles tall at (6, 24) — (7, 27), top left, ≈middle
- Keycard, red — (4, 25), top left, ≈middle
- Key socket, red — opens a door 5 tiles tall at (63, 43) — (64, 46), middle right, ≈late
- Keycard, blue — (74, 21), top right, ≈late
- Key socket, green — opens a door 5 tiles tall at (65, 4) — (66, 7), top right, ≈late
- **Rescue** (npc type 01) — touching them ends the level; the dialogue happens here — (72, 116), bottom right, late

**Creatures**: type 01 ×20, from the early part; type 02 ×4, from the early part; type 04 ×7, from the ≈early part; type 06 ×5, from the ≈early part; type 09 ×3, from the middle part; type 10 ×1, from the late part.

### E08 (level 7)

150 × 44 tiles. Ends by walking off the right edge of the map.

Terrain: 5 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Special object (special type 02) — (8, 37), bottom left, early
- Special object (special type 02) — (68, 37), bottom centre, middle
- NPC (npc type 02), not a rescue — (90, 24), centre, middle
- Platform switch — changes a moving platform's path at (99, 34) — (91, 38), bottom centre, middle
- **Way out: the right edge** — (148, 35), bottom right, late

**Creatures**: type 01 ×10, from the early part; type 03 ×1, from the late part; type 04 ×6, from the early part; type 06 ×2, from the early part; type 07 ×3, from the late part.

### E09 (level 8)

88 × 89 tiles. Ends by walking off the right edge of the map.

Terrain: 2 warp doors, 5 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Keycard, green — (70, 52), middle right, middle
- Key socket, green — opens a door 5 tiles tall at (14, 22) — (16, 25), top left, late
- Bridge switch — removes a 9-tile bridge at (37, 39) — (36, 37), centre, late
- **Way out: the right edge** — (86, 25), top right, ≈late
- Platform switch — changes a moving platform's path at (24, 37) — (43, 40), centre, late
- Platform switch — changes a moving platform's path at (68, 31) — (45, 40), centre, late

**Creatures**: type 01 ×19, from the early part; type 04 ×11, from the early part; type 05 ×2, from the late part; type 06 ×1, from the late part; type 07 ×7, from the early part; type 11 ×10, from the early part.

### E10 (level 9)

84 × 75 tiles. Ends by taking the objective.

Terrain: 5 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Platform switch — changes a moving platform's path at (78, 69) — (76, 63), bottom right, ≈late
- Platform switch — changes a moving platform's path at (56, 13) — (8, 30), middle left, late
- Platform switch — changes a moving platform's path at (10, 41) — (9, 42), middle left, late
- **Objective** (swim ability) — taking it ends the level — (68, 25), middle right, late
- **Swim ability** — (68, 25), middle right, late

**Creatures**: type 01 ×18, from the early part; type 04 ×5, from the early part; type 05 ×5, from the early part; type 06 ×5, from the late part.

### E11 (level 10)

58 × 93 tiles. Ends by reaching the one to rescue.

Terrain: 2 warp doors, 12 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Platform switch — changes a moving platform's path at (52, 22) — (34, 30), top centre, early
- Key socket, green — opens a door 5 tiles tall at (34, 70) — (32, 73), bottom centre, ≈late
- Keycard, green — (22, 81), bottom centre, ≈late
- Platform switch — changes a moving platform's path at (26, 85) — (21, 83), bottom centre, ≈late
- **Rescue** (npc type 01) — touching them ends the level; the dialogue happens here — (50, 73), bottom right, ≈late
- Platform switch — changes a moving platform's path at (51, 49) — (47, 52), middle right, late

**Creatures**: type 01 ×6, from the early part; type 02 ×1, from the middle part; type 04 ×1, from the ≈middle part; type 05 ×3, from the middle part; type 07 ×2, from the ≈middle part; type 08 ×1, from the ≈middle part.

### E12 (level 11)

100 × 100 tiles. Ends by walking off the right edge of the map.

Terrain: 8 warp doors, 2 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Special object (special type 02) — (42, 94), bottom centre, early
- Special object (special type 02) — (45, 94), bottom centre, middle
- Special object (special type 02) — (31, 94), bottom left, middle
- Special object (special type 02) — (58, 89), bottom centre, middle
- Special object (special type 02) — (9, 93), bottom left, middle
- Special object (special type 02) — (7, 93), bottom left, middle
- Special object (special type 02) — (5, 93), bottom left, middle
- Special object (special type 02) — (74, 94), bottom right, middle
- Key socket, yellow — opens a door 5 tiles tall at (81, 91) — (79, 94), bottom right, middle
- Special object (special type 02) — (84, 94), bottom right, middle
- Special object (special type 02) — (88, 94), bottom right, middle
- Keycard, yellow — (70, 33), top right, middle
- Special object (special type 02) — (91, 94), bottom right, middle
- Special object (special type 02) — (93, 94), bottom right, middle
- Bridge switch — removes a 4-tile bridge at (17, 94) — (93, 93), bottom right, middle
- Key socket, yellow — opens a door 5 tiles tall at (96, 46) — (94, 49), middle right, late
- **Way out: the right edge** — (98, 48), middle right, late
- **Way out: the right edge** — (98, 36), middle right, late

**Creatures**: turret ×30, from the early part; type 01 ×4, from the middle part; type 02 ×10, from the middle part; type 11 ×2, from the middle part.

### E13 (level 12)

100 × 99 tiles. Ends by reaching the one to rescue.

Terrain: 9 warp doors, 9 moving platforms, slopes, hazards, pulsing spikes, poles.

**Along the way** (rough order, start first):

- Bridge switch — removes a 13-tile bridge at (48, 53) — (9, 63), middle left, middle
- Bridge switch — removes a 13-tile bridge at (48, 53) — (64, 40), centre, middle
- Platform switch — changes a moving platform's path at (6, 93) — (10, 88), bottom left, late
- Keycard, blue — (70, 94), bottom right, ≈late
- Key socket, blue — opens a door 5 tiles tall at (87, 85) — (85, 88), bottom right, ≈late
- **Rescue** (npc type 01) — touching them ends the level; the dialogue happens here — (92, 90), bottom right, ≈late

**Creatures**: turret ×16, from the early part; type 01 ×19, from the early part; type 02 ×5, from the early part; type 04 ×8, from the early part.

### E14 (level 13)

100 × 112 tiles. Ends by reaching the one to rescue.

Terrain: 2 warp doors, 6 moving platforms, slopes, hazards, pulsing spikes, poles.

**Along the way** (rough order, start first):

- Platform switch — changes a moving platform's path at (35, 73) — (41, 68), centre, early
- Platform switch — changes a moving platform's path at (14, 45) — (14, 41), middle left, ≈early
- Key socket, red — opens a door 5 tiles tall at (12, 65) — (14, 68), middle left, early
- Platform switch — changes a moving platform's path at (31, 51) — (36, 48), centre, middle
- Bridge switch — removes a 6-tile bridge at (63, 25) — (47, 34), top centre, ≈middle
- Platform switch — changes a moving platform's path at (74, 108) — (86, 104), bottom right, middle
- Bridge switch — removes a 5-tile bridge at (6, 69) — (95, 74), middle right, middle
- Keycard, green — (86, 100), bottom right, middle
- Keycard, red — (48, 77), bottom centre, middle
- Bridge switch — removes a 8-tile bridge at (33, 70) — (83, 47), middle right, middle
- Bridge switch — removes a 5-tile bridge at (83, 53) — (70, 41), middle right, ≈middle
- Key socket, green — opens a door 5 tiles tall at (8, 103) — (10, 106), bottom left, late
- **Rescue** (npc type 01) — touching them ends the level; the dialogue happens here — (6, 106), bottom left, late

**Creatures**: turret ×7, from the ≈early part; type 01 ×24, from the early part; type 02 ×6, from the early part; type 04 ×7, from the middle part; type 12 ×4, from the early part.

### E15 (level 14)

100 × 90 tiles. Ends through an exit door.

Terrain: 11 warp doors, 11 moving platforms, slopes, hazards, pulsing spikes.

**Along the way** (rough order, start first):

- Keycard, red — (3, 70), bottom left, ≈early
- Key socket, green — opens a door 6 tiles tall at (6, 70) — (7, 73), bottom left, ≈early
- Keycard, red — (45, 24), top centre, early
- Key socket, red — opens a door 5 tiles tall at (41, 24) — (42, 27), top centre, early
- Key socket, blue — opens a door 5 tiles tall at (41, 67) — (32, 72), bottom left, ≈middle
- Key socket, yellow — opens a door 5 tiles tall at (36, 37) — (23, 40), middle left, middle
- Keycard, yellow — (27, 36), middle left, middle
- Bridge switch — removes a 4-tile bridge at (31, 33) — (13, 39), middle left, middle
- Bridge switch — removes a 4-tile bridge at (63, 55) — (54, 53), centre, ≈middle
- Bridge switch — removes a 4-tile bridge at (57, 55) — (57, 60), bottom centre, ≈middle
- **Exit door** — (54, 71), bottom centre, ≈middle
- Special object (special type 03 (world map)) — (60, 21), top centre, ≈middle
- Keycard, blue — (46, 83), bottom centre, ≈middle
- Bridge switch — removes a 4-tile bridge at (71, 56) — (68, 46), middle right, ≈middle
- Platform switch — changes a moving platform's path at (27, 56) — (23, 60), bottom left, middle
- Bridge switch — removes a 4-tile bridge at (53, 49) — (71, 58), middle right, ≈late
- Bridge switch — removes a 4-tile bridge at (69, 48) — (77, 52), middle right, ≈late
- Bridge switch — removes a 4-tile bridge at (84, 59) — (79, 46), middle right, ≈late
- NPC (npc type 01), not a rescue — (80, 35), middle right, ≈late
- Bridge switch — removes a 4-tile bridge at (81, 48) — (86, 62), bottom right, ≈late
- Key socket, red — opens a door 8 tiles tall at (33, 76) — (25, 70), bottom left, late
- Platform switch — changes a moving platform's path at (28, 85) — (26, 69), bottom left, late
- Keycard, green — (4, 77), bottom left, late

**Creatures**: turret ×6, from the early part; type 01 ×22, from the early part; type 02 ×11, from the early part; type 04 ×13, from the ≈early part; type 06 ×1, from the late part.

### E16 (level 15)

112 × 92 tiles. Ends by walking off the right edge of the map.

Terrain: 8 warp doors, 18 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Keycard, red — (17, 20), top left, ≈early
- Platform switch — changes a moving platform's path at (5, 36) — (50, 29), top centre, ≈middle
- Bridge switch — removes a 4-tile bridge at (57, 39) — (56, 37), centre, middle
- Key socket, blue — opens a door 5 tiles tall at (99, 35) — (97, 38), middle right, middle
- Key socket, yellow — opens a door 5 tiles tall at (13, 44) — (16, 47), middle left, middle
- Platform switch — changes a moving platform's path at (64, 58) — (70, 72), bottom centre, late
- Bridge switch — removes a 4-tile bridge at (19, 60) — (10, 70), bottom left, late
- Key socket, red — opens a door 5 tiles tall at (71, 46) — (69, 49), centre, late
- Keycard, blue — (43, 70), bottom centre, late
- Keycard, yellow — (74, 46), centre, late
- **Way out: the right edge** — (110, 5), top right, ≈late

**Creatures**: type 01 ×7, from the early part; type 04 ×3, from the ≈early part; type 05 ×5, from the middle part; type 06 ×1, from the late part.

### E17 (level 16)

140 × 46 tiles. Ends by reaching the one to rescue.

Terrain: 10 moving platforms, slopes, hazards, poles.

**Along the way** (rough order, start first):

- Key socket, yellow — opens a door 5 tiles tall at (55, 31) — (53, 34), bottom centre, middle
- Platform switch — changes a moving platform's path at (47, 11) — (8, 38), bottom left, middle
- Keycard, yellow — (6, 37), bottom left, late
- Keycard, blue — (108, 40), bottom right, late
- Key socket, blue — opens a door 5 tiles tall at (129, 37) — (127, 40), bottom right, late
- **Rescue** (npc type 01) — touching them ends the level; the dialogue happens here — (133, 40), bottom right, late

**Creatures**: type 01 ×13, from the middle part; type 07 ×6, from the middle part; type 13 ×11, from the early part.

### E18 (level 17)

100 × 100 tiles. Ends by reaching the one to rescue.

Terrain: under water throughout.

**Along the way** (rough order, start first):

- **Rescue** (npc type 01) — touching them ends the level; the dialogue happens here — (50, 12), top centre, ≈early

**Creatures**: type 14 ×9, from the ≈early part; type 15 ×17, from the early part; type 16 ×24, from the early part; type 17 ×13, from the early part.
