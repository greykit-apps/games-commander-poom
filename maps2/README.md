# Tile maps: format and semantics guide (`tile-ascii-map/1`)

This dataset contains 168 maps of 2D side-scrolling platform levels, plus their overworld and auxiliary screens. The maps are grouped into 9 sets, `A`–`I`. A set is a collection of maps that were made together.

**Each map is identified only by its filename**, such as `C04`. The letter is the set; the number is the map's position within the set. Maps are ordered with the overworld first, then levels in their original sequence, then any auxiliary screens.

## Files

```
index.csv          one row per map: set, engine, kind, size, completion methods, per-glyph counts, per-kind entity counts
legend.json        the glyph table below, in machine-readable form
<set>/<id>.txt       the ASCII map: a header, then the grid      <- read / diff / edit this
<set>/<id>.json      the same grid, a terrain-only grid, the entity list and metadata
<set>/<id>.raw.json  the underlying numeric tile planes and the properties of each tile used
```

## Map metadata

| field | values | meaning |
|---|---|---|
| `set` | `A`–`I` | which collection the map belongs to |
| `engine` | `E1`, `E2` | which ruleset the map runs under (see below) |
| `kind` | `world`, `level`, `cutscene`, `title`, `highscores`, `test` | the role of the map |

- **`world`**: the overworld, where the player walks between level entrances.
- **`level`**: a normal playable level.
- **`cutscene`**, **`title`**, **`highscores`**: non-gameplay screens built from tiles.
- **`test`**: a leftover test map.

There are two engines with different rules:

| | E1 | E2 |
|---|---|---|
| tile layers | one tile layer + one object layer | background (no collision) + foreground (collision) + object layer |
| slopes | no | yes (`/`, `\`) |
| climbable poles | no | yes (`\|`) |
| conveyors | no | yes (`<`, `>`) |
| ice / slippery surfaces | yes (`%`) | no |
| pickups | mostly tiles in the terrain | mostly objects in the object layer |
| difficulty-dependent objects | no | yes |

## `.txt` layout

```
; tile-ascii-map/1
; map:    C04  set: C  engine: E2  kind: level
; size:   112 x 63  (width x height; 1 char = one tile; origin top-left)
; legend: ...only the glyphs present in this map...
; entities: enemy=7, platform=1, ...
; completion: map_edge + rescue
;==========...
<height lines, each exactly width characters>
```

Lines starting with `;` are the header. Every other line is a grid row, read top to bottom. One character is one square tile (16×16 pixels in the original; the player is about 1 tile wide and 2 tiles tall).

Coordinates are `(x, y)` = (column, row), counted from the top left. The `x`/`y` fields in the JSON use the same convention. Trailing spaces are significant because every row has the same width.

## Glyphs

The grid is drawn in two passes. Terrain comes first, and objects from the object layer are then drawn on top.

### Terrain

| glyph | meaning |
|---|---|
| ` ` | empty / passable |
| `#` | solid block |
| `-` | one-way platform: you can stand on it from above and jump up through it |
| `/` `\` | slope rising / falling to the right. On world maps these are diagonal walls |
| `%` | slippery / ice surface |
| `<` `>` | conveyor floor moving left / right |
| `^` | hazard: kills on contact (deadly floors kill on landing) |
| `\|` | climbable pole |
| `~` | shoreline / water edge on world maps |
| `D` | door: a locked door, a keycard door, or a warp door that moves the player elsewhere in the map |
| `O` | key socket: placing a key here opens something |
| `S` | switch |
| `T` | teleporter / elevator |
| `X` | level exit: an exit door, or a map-edge cell where walking out ends the level (see *Level completion*) |
| `?` | message / hint trigger |

### Items

These can be terrain tiles or objects.

| glyph | meaning |
|---|---|
| `$` | points pickup, including small pickups that give an extra life per 100 collected |
| `+` | power-up / resource: ammo, extra life, weapon, movement ability, shield |
| `k` | key / keycard |
| `!` | objective item: quest items that must be collected, and boss weak points |

### Actors

| glyph | meaning |
|---|---|
| `@` | player start |
| `e` | enemy / hostile creature |
| `g` | stationary turret / projectile emitter |
| `n` | NPC / rescue target |
| `p` | moving platform |
| `L` | world-map level entrance; the glyph fills the whole trigger area |
| `*` | other special object |

## Entities (`.json` → `entities`)

Each non-zero cell of the object layer appears as one entity:

```json
{"x": 12, "y": 40, "code": 7, "kind": "enemy", "name": "enemy type 03", "difficulty": "", "glyph": "e"}
```

- **`code`**: the raw object value. Its meaning depends on the engine and set.
- **`kind`**: the semantic category. The drawn kinds are `player`, `enemy`, `turret`, `npc`, `platform`, `points`, `powerup`, `key`, `objective`, `level_entrance`, `special` and `exit`. The kinds that are listed but not drawn (`glyph: null`) are `marker`, `door_link`, `switch_link` and `unknown`.
- **`name`**: a generic label.
  - Creature, NPC, objective and special-object types are numbered per set (`enemy type 03`, `npc type 01`). The same number means the same type within one set only; numbers are not comparable across sets.
  - Qualifiers give direction or variant, e.g. `turret (left)`, `platform (moving up)`, `player start (facing left)`.
  - Level entrances name the destination map: `entrance to C07`.
- **`difficulty`**: `""` means the object appears on all difficulties. Otherwise it is `normal+`, `hard` or `easy only`; such objects only spawn at that difficulty or above.
- **`door_link`** entities sit in a warp door and carry `target: [x, y]`, the tile the player arrives at.
- **`switch_link`** entities sit on a switch or key socket and carry `target: [x, y]`, the tile that the switch or socket toggles (for example a bridge or barrier).
- **`ends_level`** is present (`"rescue"` or `"objective"`) on objects whose contact, collection or destruction completes the level.

Marker entities include:
- **camera limits**: invisible edges of the scrollable area.
- **platform path arrows / platform blockers**: steer moving platforms.
- **`removed when <map> is done`**: world-map tiles that disappear after that level is completed, e.g. a barrier that opens.
- **`done-flag spot for <map>`**: where a completion marker appears on the world map.
- **transport stops**: endpoints of a world-map transport.

## Other JSON fields

- **`grid`**: the same rows as the `.txt` file.
- **`terrain`**: the grid without the object layer.
- **`legend`** and **`glyph_counts`**: only the glyphs present in this map.
- **`notes`**: conversion notes. These explain how door tiles were classified (see below).
- **`<id>.raw.json`**:
  - `planes` is the numeric tile layers: `tiles` + `sprites` for E1; `background` + `foreground` + `info` for E2.
  - `tile_properties` holds the per-tile collision and behavior values for every tile used. Each entry includes the `glyph` that tile was mapped to.

## Level completion

Every `level` and `test` map has a `completion` list, also shown in the `.txt` header and in `index.csv`. It names each way the level can be finished:

| method | meaning | where it is in the grid |
|---|---|---|
| `exit_tile` | an exit door or exit tile | `X` cells away from the map edge |
| `map_edge` | walking past the left or right edge of the playable area (the outer 2 columns) ends the level | `X` cells in the outer 2 columns, wherever they are reachable through non-solid tiles |
| `rescue` | touching a rescue NPC ends the level | the `n` entities with `ends_level: "rescue"` |
| `objective` | collecting or destroying an objective ends the level (for several targets, the last one destroyed) | the entities with `ends_level: "objective"` |

- A level can have several methods.
- A level whose only methods are `rescue`/`objective` has no `X` at all, which is expected.
- Non-gameplay maps (`world`, `cutscene`, `title`, `highscores`) have an empty list. A world map's "exits" are its `L` level entrances.

Each map's JSON also gives two counts:
- `exit_tiles`: all `X` cells.
- `edge_exit_cells`: the subset of those that are map-edge exits.

## Conventions and caveats

**Door tiles (E2)** are grouped by connectivity:
- a group containing a warp target is a door (`D`);
- a small group with no target is an exit (`X`), because the engine treats an untargeted door as leaving the level;
- a large group with no target is a background fill that reuses the door tile, and is shown as empty.

**Map-edge exits** follow the engine rule literally. Any non-solid, connected cell in the outer 2 columns counts as an exit, even where the designers probably did not intend one, such as an open-sky edge.

**Overlapping objects.** When several objects share one tile, the grid shows one of them; the JSON lists all of them.

**`unknown` entities** are stray values in the object layer that the game ignores.
