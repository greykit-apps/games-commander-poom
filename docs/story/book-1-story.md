# Book 1: the story (first draft)

A loose plot for Book 1 (map set H), in a post-nuclear wasteland in the
spirit of Fallout: shelters dug before the bombs, raiders in the rubble,
ruined towns, retro-futurist atomic kitsch. It exists to explain the game's
mechanics (why keys, why exits, why the ship, why the signs) and to choose
the tilesets. Everything here is a proposal to argue with.

**On the theme and the law.** Fallout's names and marks belong to Bethesda,
and this game is public. So this keeps the feeling and invents its own
names: no Vault-Tec, Pip-Boy, Nuka-Cola, Brotherhood, radroaches or
deathclaws. "Vault", "raider", "wasteland", "bottle caps" and "bobblehead"
are ordinary words and fine to use.

What the maps say about Book 1 is in [book-H-notes.md](book-H-notes.md);
level-by-level detail is in [book-H.md](book-H.md).

## The plot, in a paragraph

Commander Poom points the Catamaran at the stars, a meteor shower knocks
out the Yarn Drive, and he comes down hard in **the Glow**: the wasteland
left behind by a war fought by cats and dogs who should have known better.
Before the engines have stopped ticking, the **Scrappers**, a raider gang
who strip anything that falls from the sky, have hauled off four of the
ship's parts. Their boss, **Junk Baron Rex**, gave one to each of his four
lieutenants as a trophy, and each lieutenant locked it away in their own
turf: two in the old underground shelters (the **Vaults**), one in the
Scrappers' fortress, one in the ruins of the town of **Old Litterburg**.
Poom has to cross the Glow, get past the locks, take the parts back, and
bolt them into the Catamaran before the Scrappers come back for the rest.

Along the way a voice on the radio, **Auntie Static**, broadcasting from a
tower nobody can find, keeps telling him things she shouldn't know.

## Why the game works the way it does

| Game element | In the story |
|---|---|
| **The world map** | The Glow. Poom's crash site is in a valley; everything else is up the road. |
| **Levels are walls on the map** (E1) | Every place on the road is dangerous enough that you can't go round it: a raider camp, a collapsed shelter, a street the Scrappers hold. You go through, or you don't go on. |
| **H02, the first level** | The road out of the crash valley. It's the only way anywhere. |
| **H08, the gate to the second half** | **Fort Scrap**, the Scrappers' fortress, sits on the only working station of the old **Tube**, a pneumatic subway under the mountains. Clear the fort and the Tube carries Poom north (the map's teleporter pair, 38 and 41). |
| **Keycards and coloured doors** | The Vaults were built with four security levels, red, yellow, green and blue, and their doors still answer to the cards. The Scrappers loot the cards and reuse the doors to lock up their own stashes, which is why even a raider camp has a blue door. |
| **The four parts are always behind a locked door** | Each lieutenant keeps their trophy in their strongroom and carries the card that opens it, or drops it nearby. |
| **The four lieutenants** (creature type 03, one beside each part) | Rex's lieutenants. Each guards one part, and each is the hardest thing in their level. |
| **Exit doors** | Every place has one way out the far side: a Vault's lift, the fort's back gate, a stairwell up from the ruins. |
| **Hint signs** | Terminals in the Vaults, graffiti and warning boards in the ruins and the camps, and Auntie Static's radio wherever there's an aerial. |
| **H03 and H07, the story rooms** | Two of Auntie Static's relay towers: a short climb to the top, a radio, a message. |
| **The ship** | The Catamaran at the crash site, by the start. Poom brings the parts back as he finds them. |
| **H14's teleporter to H15, the secret level** | Vault 9's experimental matter-transit pad, still humming. It goes to **the Nest**, where the Glowmice breed (H15 is mostly type-01 creatures), and a second pad leads back. |
| **Ice** (H09, H17, H11) | Vault 9 was a cold-sleep shelter, and its coolant burst. Everything froze. |
| **Spikes and hazards** | Rubble and rebar in the ruins, barbed wire and spike traps in the camps, live wires and leaking coolant in the Vaults. |
| **Ammo** | Energy cells for Poom's raygun, salvaged from Vault equipment. |
| **Extra lives** | A Poom bobblehead. (He has no idea why the wasteland is full of them.) |
| **Points** | Bottle caps, the Glow's money, and other salvage; see the item list below. |

## Level types

Three kinds of place, each with its own tileset and its own creatures. The
split comes from the maps themselves: the ice-heavy levels with turrets are
Vaults, the enemy-dense levels full of scaffolding are raider camps, and the
long open ones are streets.

| Type | Levels | What it's like |
|---|---|---|
| **Vault** | H09, H10, H11, H14, H17 | Underground shelters: concrete and steel, blast doors, terminals, auto-turrets. Vault 9 (H09, H11, H17) is the frozen cold-sleep shelter; H10 and H14 are Vault 6. **Tileset made** (`vault` and `vaultCold` in js/art.js). Two of the four parts are here (H09, H17). |
| **Raiders** | H04, H08, H13, H15 | Scrapper camps and Fort Scrap: scrap-metal walls, scaffolding (lots of ledges), spikes, barrels. One part (H04). H15, the Nest, is a raider-type level overrun by Glowmice. **Tileset made** (`raiders` in js/art.js), in full VGA colour. |
| **Ruins** | H02, H03, H05, H06, H07, H12, H16 | Old Litterburg and the roads round it: broken concrete, rebar, collapsed floors, billboards. One part (H05). H03 and H07 are Auntie Static's towers. **Tileset made** (`ruins` in js/art.js), in full VGA colour. |

## The creatures

Each needs a name, a look and a behaviour. The original game's creatures
map onto them neatly, which would let the engine reuse what it has.

| Type | Where | Proposal | Like the original's |
|---|---|---|---|
| 01 | 70, everywhere; 23 in the Nest | **Glowmice**: mutated mice, harmless but pushy; jump on one to stun it | Mousel |
| 02 | 24, camps and Vaults | **Scrap hounds**: the Scrappers' dogs; charge when they see you | Barker |
| 04 | 63, everywhere | **Scrappers**: the rank and file, with salvaged armour; deadly to touch | Vacuumoid |
| 05 | 10, Vaults and the fort | **Sentrybots**: old Vault security robots the Scrappers rewired; can't be hurt, they shove | Roombot |
| 03 | 4, one by each part | **The lieutenants**: big, tough, a few shots each | Grand Vacuumoid |
| turret | 4, in Vaults | **Auto-turrets**: fire along a line | Clawtank's shot |

Junk Baron Rex himself never appears in Book 1: he's for later.

## The tilesets to make

Tilesets may use the full VGA palette, not just the original game's sixteen colours: all three level sets do. Sheets of every tile are in docs/art/.

From what each type's levels actually use (counts across their levels):

**Every level tileset needs:** solid ground/wall, one-way ledge, hazard,
exit door, hint sign, and the four coloured doors. Plus a far background.

| Tileset | Also needs | Notes |
|---|---|---|
| **Vault** | ice (1,802 tiles), turret mounts, teleporter pad (H14) | Most-used walls of all (5,822). Two looks: frozen (Vault 9) and plain. Ice is cold-sleep frost on steel. |
| **Raiders** | lots of ledges (839): scaffolding and planks | Scrap-metal walls, barbed-wire hazard. |
| **Ruins** | a little ice (23) | Broken concrete, rebar hazard, sky and skyline behind. Most exit doors (16) and signs (4). |
| **Wasteland map** | ground, rock, level markers per type, teleporter (Tube station), the ship, done flags | The current map has only ground, rock and markers. Each level's marker should show its type: a Vault door, a camp, a ruined building. |

**Items, shared by all three** (made: the `wasteland` item set in js/art.js; sheet in docs/art/wasteland-items.png):

| Now | Proposal |
|---|---|
| fish 100, milk 200, yarn 500, catnip 1000, medal 2000, trophy 5000 | bottle cap, tin of tuna, clean water, Sunny Snax, pre-war medal, gold trophy |
| raygun charge | energy cell |
| plush Poom (extra life) | Poom bobblehead |
| keycards (4 colours) | Vault keycards, same four colours |
| ship parts (4) | keep: they're Poom's |

## The seven signs

Where they are, and a first line for each to show the voice. Auntie Static
is warm, nosy and too well informed; the terminals are officious; the
graffiti is Scrapper.

| Sign | Where | Who | First line |
|---|---|---|---|
| H03 | top of the tower, by the exit | Auntie Static | "Well, look at you, sugar. Fell out of the sky and landed in the Glow. Four of your bits went north with the Scrappers. I'd get them back if I were you." |
| H07 | top of the second tower | Auntie Static | "The Scrappers lock their loot behind Vault doors. Doors want cards, cards come in colours. Match 'em up." |
| H10 | a Vault, top, by the exit | Terminal | "SECURITY NOTICE: Doors open only to a keycard of matching colour. Report lost cards to your Overseer." |
| H11 | Vault 9 | Terminal | "COLD-SLEEP STATUS: COOLANT BREACH. Floors may be slippery. Have a nice day." |
| H12 | ruins | Graffiti | "SCRAPPER TURF. EVERYTHING HERE IS OURS. INCLUDING YOU." |
| H13 | Scrapper camp | Graffiti | "LT. GRIZ HAS THE SHINY THING. DON'T TOUCH THE SHINY THING." |
| H16 | ruins, the long street | Auntie Static | "Two ways out of Litterburg, sugar. Either'll do." (H16 has two exit doors.) |

## Settled

- **Poom and the Catamaran.** Poom is the hero, the Catamaran is his ship,
  and its four parts are what Book 1 is about.
- **Animals, not humans.** The Glow is a world of animals: cats, dogs, mice
  and the rest. The original game's cat jokes and art style carry over.

## Questions to settle

1. **Earth or another planet?** "The Glow" could be Earth after the bombs,
   or another world's. Earth gives the retro-atomic look more to bite on.
2. **How dark?** Fallout is darkly funny. The original Poom is gentle. This
   draft sits closer to Poom: nobody dies on screen, raiders are bullies.
3. **Auntie Static:** who is she? Book 1 never needs to say, which makes her
   a good thread for later books.
