# RFTools Dimensions

## Introduction

RFTools Dimensions lets players create dimensions from dimlets. The current
dimlet configuration system uses **dimlet packages**: JSON files containing the
available dimlets and their costs.

This page describes the system used by the Minecraft 1.20.1 version. The old
`dimlets.json` rule system from Minecraft 1.10.2 and earlier is no longer used.

## Dimlet packages

RFTools Dimensions includes packages for its base dimlets, vanilla content,
and several other mods. A server owner can add another package to introduce
new dimlets or override settings from an earlier package.

Packages are loaded only when the server starts. The order is significant: if
two packages contain the same `type` and `key`, the entry in the package listed
later wins.

### Adding a custom package

Adding a JSON file to the config directory is not enough. Its filename **must
also be added to the `dimletPackages` server config list**.

1. Stop the server.
2. Create the package directory if it does not exist, then place the package at
   `config/rftoolsdim/<filename>.json`. This is the instance's global `config`
   directory, not the world's `serverconfig` directory.
3. Open the active world's `serverconfig/rftoolsdim-server.toml` file. On a
   dedicated server this is normally
   `<world>/serverconfig/rftoolsdim-server.toml`; in single-player it is
   `saves/<world>/serverconfig/rftoolsdim-server.toml`.
4. Under `[dimlets]`, append the filename to `dimletPackages`. Keep the existing
   entries unless you intentionally want to stop loading them. For example, the
   default Minecraft 1.20.1 list with `my_dimlets.json` appended is:

   ```toml
   [dimlets]
   dimletPackages = [
     "base.json",
     "vanilla_blocks.json",
     "vanilla_tags.json",
     "vanilla_fluids.json",
     "vanilla_biomes.json",
     "vanilla_structures.json",
     "rftools.json",
     "appliedenergistics2.json",
     "biggerreactors.json",
     "bigreactors.json",
     "botania.json",
     "immersiveengineering.json",
     "mekanism.json",
     "powah.json",
     "quark.json",
     "tconstruct.json",
     "thermal.json",
     "biomesoplenty.json",
     "emendatusenigmatica.json",
     "my_dimlets.json"
   ]
   ```
5. Start the server. The log reports each package and the number of valid
   dimlets read from it.

For modpacks, put a prepared `rftoolsdim-server.toml` in `defaultconfigs` to
apply its `dimletPackages` list to newly created worlds. Existing worlds retain
their own file in `serverconfig`.

Package names are resolved in this order:

1. `config/rftoolsdim/<filename>`
2. the package bundled inside RFTools Dimensions with that filename

Consequently, a config file with the same name as a built-in package replaces
that entire built-in file. Usually it is safer to use a unique filename and
place it at the end of `dimletPackages`, which lets it override only the entries
it contains.

### Package format

A package is a JSON array. Each object in the array describes one dimlet. This
example adds a block dimlet and changes the settings of the vanilla water fluid
dimlet:

```json
[
  {
    "type": "block",
    "key": "examplemod:polished_example",
    "rarity": "uncommon",
    "create": 250,
    "maintain": 100,
    "ticks": 80,
    "worldgen": true,
    "dimlet": true
  },
  {
    "type": "fluid",
    "key": "minecraft:water",
    "rarity": "rare",
    "create": 500,
    "maintain": 300,
    "ticks": 150,
    "worldgen": true,
    "dimlet": true,
    "essence": {
      "item": "minecraft:water_bucket"
    }
  }
]
```

Use valid JSON: comments and trailing commas are not allowed. Except for
`essence`, all fields shown above should be present on every entry.

### Entry fields

| Field | Meaning |
| --- | --- |
| `type` | Dimlet type. See the supported names below. |
| `key` | The content identifier. Blocks, fluids, biomes, structures, and tags normally use a namespaced ID such as `minecraft:stone`. |
| `rarity` | `common`, `uncommon`, `rare`, or `legendary`. Rarity determines the tier of dimlet parts needed. |
| `create` | RF/t added while the Dimension Builder creates the dimension. |
| `maintain` | RF/t added while the dimension is maintained. |
| `ticks` | Ticks added to the dimension's creation time. |
| `worldgen` | Whether this entry may be selected for randomly generated dimension descriptors and random dimlet loot. |
| `dimlet` | Whether the content is enabled for dimlet creation. In particular, block and fluid absorbers reject entries for which this is `false`. |
| `essence` | Optional item stack used as the crafting essence instead of the normal absorber or type default. |

The supported full type names are:

- `admin`
- `attribute`
- `biome`
- `biome_category`
- `biome_controller`
- `block`
- `digit`
- `feature`
- `fluid`
- `sky`
- `structure`
- `tag`
- `terrain`
- `time`

The mod also understands internal abbreviated type names, but package authors
should use the full names above. For registry-backed content, use the registry
ID, not a translated display name. A block or fluid must exist and be usable as
a placed block, and a biome must exist in the active registry; invalid entries
are skipped. Values for system types such as `terrain`, `feature`, `attribute`,
and `biome_controller` must be values understood by RFTools Dimensions. Refer
to the built-in `base.json` package for those keys rather than inventing new
ones.

The optional `essence` object has this form:

```json
"essence": {
  "item": "minecraft:diamond",
  "amount": 2,
  "nbt": "{CustomModelData:1}"
}
```

`item` is required when `essence` is present. `amount` defaults to `1`, and
`nbt` is optional.

### Overriding an existing dimlet

An entry is identified by the combination of `type` and `key`. To change an
existing dimlet, repeat that pair in a custom package and specify all of its
settings. Put the custom filename after the package that originally defines the
entry in `dimletPackages`.

For example, a final package containing this entry makes the stone block dimlet
legendary and more expensive:

```json
[
  {
    "type": "block",
    "key": "minecraft:stone",
    "rarity": "legendary",
    "create": 2000,
    "maintain": 1500,
    "ticks": 400,
    "worldgen": true,
    "dimlet": true
  }
]
```

Package entries replace complete settings objects; fields are not merged with
the earlier entry.

### Generating a starting package for a mod

The server command below writes a package into `config/rftoolsdim` containing
the mod's structures, blocks, fluids, and biomes that are not already present
in the loaded dimlet dictionary:

```text
/rftoolsdim config <filename> <modid>
```

For example:

```text
/rftoolsdim config examplemod.json examplemod
```

The `/dim` alias can be used instead of `/rftoolsdim`. Generated entries use
generic defaults, so review their rarity, costs, flags, and optional essence
before using the file. The command only creates the JSON file; you must still
add its filename to `dimletPackages` and restart the server.

### Troubleshooting

- If the package is ignored, check that its exact filename is present under
  `[dimlets].dimletPackages` in the active world's server config.
- If startup reports `Can't find dimlet package`, check the spelling and make
  sure the file is under `config/rftoolsdim`, not `serverconfig`.
- If the log says that fewer valid dimlets were found than expected, verify the
  registry IDs and make sure the corresponding mods are installed.
- If the server fails while reading the package, validate that the root is a
  JSON array and that every entry has all required fields with the correct
  value types.
- Restart the server after changing either a package or `dimletPackages`; there
  is no live reload for this dictionary.
