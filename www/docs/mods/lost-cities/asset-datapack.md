# Asset DataPack System

## The Asset System

### Introduction

Starting with 1.18.2 the asset system in Lost Cities is a datapack.
That means you can replace or add assets like you would with any other datapack.
The following assets are supported:

* Condition: a condition is basically a randomized string value which can be selected based on various criteria. Currently used for controlling what type of mob a mob spawner has and the loot tables for chests.
* Worldstyle: from the world style the city style is selected based on biomes. In addition, the worldstyle can also change the chance of cities depending on biomes and control the appearence of scattered features.
* Citystyle: a city style represents how a city is generated. It controls the buildings, fountains, parks, stairs, as well as the width of the street, restrictions on building height and depth, and various blocks used by the world generator. The city style also controls the palette style.
* Style: this is a palette style. It basically combines various palettes and also has the ability to randomize palettes so that different chunks (sharing the same style) may look different anyway.
* Variants: a variant is a conveniant name for a block with some variations. These can be used by palettes.
* Palette: a palette is a mapping between characters used in parts (structures) and actual blocks in the world. Using styles it is possible to combine different palettes. For example, the standard assets which are distributed with The Lost Cities have a palette for the bricks of the buildings (which is randomized) as well as an independent palette for the glass of the buildings.
* Part: every structure in the world is made out of one or more parts. For buildings every part represents a floor of a building (6 high) but parts are also used for fountains, subway structures, stairs and so on. Parts are defined using characters from the palette so the actual building blocks that are used during generation depend on the combined palette from the style that is valid for that chunk.
* Building: a building is generated from a selection of parts. Which parts are chosen depends on a set of conditions. For example, some parts may only be suitable to place on top of the building (roof parts) so they are restricted to generate at the top only. You can also have parts that are used underground or for the first floor and so on.
* Multibuilding: a multi building is a building that spans multiple chunks. In the current implementation multi buildings are restricted to 2x2 chunks. Every section of a multi building is seen as a building on its own but by using the multi building you can ensure that these building parts are always generated together.
* Scattered: a scattered structure refers to a (multi) building that can be randomly placed outside cities.
* Stuff: stuff refers to single block (or small 1x1 tower of blocks) that can be scattered through the city. This is useful for small random features. 
* Predefined cities: predefined cities (and buildings) are useful for pack makers who want to have specific cities and buildings at specific locations in the world. If you combine this with disabling cities everywhere you can ensure that your world has only the cities that you want and no more.
* Predefined spheres: predefined spheres allow you to place a city sphere on the landscape if the landscape type supports it

### Basic Structure

This page is mostly about the internal structure and configuration about the mod.
In this first section the basic operation of the mod is explained.

The buildings, bridges, subway system, fountains and other structures you find in the world are actually not structures but real worldgen.
This makes generation very efficient and also allows it to fit much better when the surrounding world.

It is important to note that this mod cannot depend on any specific order of chunk generation.
When generating a chunk it cannot depend on neighbouring chunks already being generated, so it has to be able to calculate things on its own.
Nevertheless, this mod maintains several world-wide data structures and is able to query information about nearby chunks without actually having to generate the chunk.

Read about it here: [Basic Structure](./structure.md)

### Tutorial Video

This tutorial explains how the asset system works and how you can modify or add your own:

* YouTube: [Asset Tutorial](https://www.youtube.com/watch?v=Ck9_yknPx4c&ab_channel=JorritTyberghein)

There is also a GitHub which contains the example as used in the tutorial (expanded a bit to also contain a loot table example):

* GitHub: [Lost City Assets Example GitHub](https://github.com/McJty/LostCityAssets)

### Assets

The standard Lost Cities assets can be found [here](https://github.com/McJtyMods/LostCities/tree/1.18/src/main/resources/data/lostcities/lostcities).

## Asset names

All assets have a unique name.
The assets that are part of the standard Lost Cities datapack are named `lostcities:<whatever>`.
However, `lostcities` is default, so you can also refer to them using the normal non-full name.
If you make your own custom assets they will have a name like `<modid>:<whatever>`.
For example, `mysupermod:dangerous_building` can be the name of a building asset in your mod.

## Using a 'lowcode' mod to change/add assets

Using the new 'lowcode' system from Forge it's possible to make mods without any Java code. This is ideal for making a Lost City datapack. To do this you need to make a folder like this:

* `<FolderName>`
  * `data`
    * `lostcities/lostcities` - put assets here to override Lost City assets
    * `<modid>/lostcities` - put new custom assets here
  * `META-INF`
    * `mods.toml`
  * `pack.mcmeta`

Your `<modid>` should be a lowercase name like for example `testassets`, `fancyassets`, `ruins_ng` or whatever you like.

The `mods.toml` file should be something like this. Make sure to use the correct `modId`!:

```toml title="mods.toml"
modLoader="lowcodefml"
loaderVersion="[40,)"
license="None"

[[mods]]
modId="testassets"
version="1.0"
displayName="Test Assets"
description='''
Test Assets for Lost Cities
'''

[[dependencies.testassets]]
modId="lostcities"
mandatory=true
versionRange="[1.18-5.3.6,)"
ordering="AFTER"
side="BOTH"
```

`pack.mcmeta` should contain something like this:

```json title="pack.mcmeta"
{
    "pack": {
        "description": "Test Asset resources",
        "pack_format": 9
    }
}
```

After creating this folder you can make a zip file and then rename that zip to jar and put it in the mods folder

## Overriding Standard Assets

You can override any of the standard assets by making a new datapack with the following location: `data/lostcities/lostcities/<subpackage>/<name>`.
For example, to replace the standard `easymobs.json` you would have to make a new `easymobs.json` and place it in your datapack at `data/lostcities/lostcities/conditions/easymobs.json`

## Adding Custom Assets

Custom assets are similar except that you place them in your own datapack at: `data/<modid>/lostcities/<subpackage>/<name>`.
Usually when you make custom assets you need to also modify one of the standard assets to that Lost Cities knows about it.
For example, if you make a new building you will probably have to override `citystyle_common.json` so that your new building is used.
Or maybe you have also made a custom city style in which case you might want to change the standard worldstyle.

### Conditions

Conditions are currently used for mob selection for spawners and for loot table selection for chests.
In addition, the evaluation system used by conditions (but not the conditions themselves) are used by buildings for selecting what parts can be used for what floors.
Here is an example of a condition to specify loot tables:

```json
[
  {
    "type": "condition",
    "name": "chestloot",
    "values": [
      {
        "factor": 8,
        "value": "lostcities:chests/lostcitychest",
        "range": "4,100"
      },
      {
        "factor": 8,
        "value": "lostcities:chests/lostcitychest",
        "range": "-100,-3"
      },
      {
        "factor": 20,
        "value": "lostcities:chests/raildungeonchest",
        "inpart": "rail_dungeon1"
      },
      {
        "factor": 20,
        "value": "lostcities:chests/raildungeonchest",
        "inpart": "rail_dungeon2"
      },
      {
        "factor": 2,
        "value": "minecraft:chests/nether_bridge"
      },
      {
        "factor": 2,
        "value": "minecraft:chests/abandoned_mineshaft"
      },
      {
        "factor": 2,
        "value": "minecraft:chests/village_blacksmith"
      },
      {
        "factor": 2,
        "value": "minecraft:chests/desert_pyramid"
      },
      {
        "factor": 2,
        "value": "minecraft:chests/jungle_temple"
      },
      {
        "factor": 20,
        "value": "minecraft:chests/simple_dungeon"
      }
    ]
  }
]
```

To use this condition you would assign it to a chest in a palette.
When the generator encounters such a condition in a palette it will evalulate it and use what is returned.
To evaluate such a condition a context object is given that contains information about the chunk/building that is being generated.
In this example the first entry in the `chestloot` condition tells the system that the `lostcitychest` loot table can be generated at floors between 4 and 100 and the second entry also allows generating it below level -3 (in the low cellars).

The third and fourth entries are used to generate `raildungeonchest` loot in the `rail_dungeon1` and `rail_dungeon2` parts which represent the rail dungeons.

The remainder of the entries are the default loot tables.

When deciding what loot table to use the system will find all entries in the condition that are valid and then pick a random one based on the given 'factor'.
Higher factors mean that this particular entry has a higher chance of being chosen (if the conditions are true).

A similar example exists for controlling mob spawners:

```json
[
  {
    "type": "condition",
    "name": "easymobs",
    "values": [
      {
        "factor": 1,
        "value": "Zombie"
      },
      {
        "factor": 1,
        "value": "Skeleton"
      },
      {
        "factor": 1,
        "value": "Spider"
      }
    ]
  }
]
```

#### Supported conditions

* top (boolean): true at the top of a building (the top represents the part right above the highest floor)
* ground (boolean): true at the ground level of a building. This is relative to the city level of the top-left chunk of a building (relevant in case this is a multi building where some chunks can be in parts of the city where the city level is different)
* range (string): notation: `from,to`. This condition is true if the current floor is between those two numbers (inclusive at both ends). Note that the ground floor is numbered 0.
* cellar (boolean): true if the floor is underground
* floor (integer): true on the specified floor
* chunkx (integer): true at a specific chunk x location. This can be useful if you have predefined buildings at specific spots, and you want very specific mob spawners or loot chests there
* chunkz (integer): true at a specific chunk z location
* inpart (string): true if the spawner/chest was part of the given 'part'
* isbuilding (boolean): true if the spawner/chest is in a building
* inbuilding (string): true if the spawner/chest is in a specific building
* issphere (boolean): true if the spawner/chest is in a city sphere
* inbiome (string): true if the spawner/chest is in a biome

### Citystyle

The city style represents various attributes of a city.
Citystyles are selected by the worldstyle which decides it based on biomes.

:::info Note
Starting with 1.19.2 the streetblocks are only used in a few situations because streets are now
parts like most of the rest
:::

Supported city style keywords:
* ``explosionchance``: an additional chance factor to possibly reduce explosions for some city styles
* ``style``: this represents the standard style for buildings in this city. The style (as we will see later) controls the palette, in other worlds what blocks are used for buildings
* ``inherit``: with this a city style can inherit all attributes from another city style
* ``stuff_tags``: this is a list of tags (tags specific to the 'stuff' system) that can be used to control what 'stuff' should be applied in this city (more on 'stuff' later)
* ``generalblocks``: in this json object you can control what block (from the palette) to use for 'ironbars', 'glowstone', 'leaves', or 'rubbledirt'
* ``buildingsettings``: json object for various building related settings ('minfloors', 'mincellars', 'maxfloors', 'maxcellars', and 'buildingchance'). When present these will alter the settings from the profile
* ``corridorblocks``: is a json object that can contain 'roof' and 'glass' to control what blocks to use for the roof and glass of corridors
* ``parkblocks``: is a json object that can contain 'elevation' to control what block to use for the elevation of parks as well as 'grass' for the grass block to use in parks
* ``railblocks``: is a json object that can contain 'railmain' to control what block to use for the main rail block
* ``sphereblocks``: contains 'inner', 'border', and 'glass' to control the spheres. Currently unused
* ``streetblocks``: is a json object that can contain 'border', 'wall', 'street', 'streetbase', and 'streetvariant' to control the blocks used for streets. Note that some of these are no longer used in 1.19.2 and later
* ``streetblocks/parts``: the streetblocks object can now contain an optional 'parts' json object which contains the following fields:
  * ``full``: the part (or list of parts) to use for a full street (default 'street_full')
  * ``straight``: the part (or list of parts) to use for a straight street (default 'street_straight')
  * ``end``: the part (or list of parts) to use for the end of a street (default 'street_end')
  * ``bend``: the part (or list of parts) to use for a bend street (default 'street_bend')
  * ``t``: the part (or list of parts) to use for a T shape street (default 'street_t')
  * ``none``: the part (or list of parts) to use for a street with no connections (default 'street_none')
  * ``all``: the part (or list of parts) to use for a street with connections in all directions (default `street_all`)
* ``selectors``: a json object containing various lists of objects that will be used in the city. All these lists have associated factors which controls the rarity of the object relative to the others:
  * ``buildings``: a list of buildings
  * ``multibuildings``: a list of multibuildings
  * ``bridges``: a list of bridges
  * ``parks``: a list of parks
  * ``fountains``: a list of fountains
  * ``stairs``: a list of stairs
  * ``fronts``: a list of fronts (parts placed in front of some buildings)
  * ``raildungeons``: a list of dungeons in the rail system

Here is an example city style:

```json
  {
  "inherit": "citystyle_config",
  "style": "standard",
  "streetblocks": {
    "border": "y",
    "wall": "w",
    "street": "S",
    "streetbase": "b",
    "streetvariant": "B"
  },
  "parkblocks": {
    "elevation": "x"
  },
  "corridorblocks": {
    "roof": "x",
    "glass": "+"
  },
  "railblocks": {
    "railmain": "y"
  },
  "selectors": {
    "buildings": [
      {
        "factor": 0.4,
        "building": "building1"
      },
      {
        "factor": 0.4,
        "building": "building2"
      },
      {
        "factor": 0.2,
        "building": "building3"
      },
      {
        "factor": 0.2,
        "building": "building4"
      },
      {
        "factor": 0.3,
        "building": "building5"
      }
    ]
  }
}
```

Note the `citystyle_config`. City styles can inherit from other city styles.
In this case there is a very simple `citystyle_config` where the road width is configured (note:
road width is no longer a thing in 1.19.2 and later as streets are defined as parts):

```json
{
  "streetblocks": {
    "width": 8
  }
}
```

When you want to change the road width you only have to modify this asset and all other city styles will automatically use it.

### Worldstyle

The world style controls everything related to how cities generate in the entire world. It has the
following supported keywords:
* ``outsidestyle``: this is the city style used for the outside of cities
* ``multisettings``: (new in 1.19.2 and later). This controls how multibuildings are generated. It has the following keywords:
  * ``areasize``: the world is divided into multichunks of areasize*areasize. For each of these multichunks the system will calculate the multibuildings that can spawn here
  * ``minimum``: it will try to spawn at least this many multibuildings in each multichunk
  * ``maximum``: it will try to spawn at most this many multibuildings in each multichunk
  * ``correctstylefactor``: this is a factor that is used to correct the chance of multibuildings based on the city style. This is used to ensure that the chance of multibuildings is the same for all city styles. A value of 1 makes sure that a multibuilding needs the correct style for each chunk
  * ``attempts``: how many times the system will try to find room for a multibuilding in a multichunk
* ``cityspheres``: current unused
* ``scattered``: this controls scattered buildings in the world. These are buildings that are not part of cities but can spawn outside cities. It has the following keywords:
  * ``areasize``: the world is divided into multichunks of areasize*areasize. For each of these multichunks the system will calculate the scattered buildings that can spawn here
  * ``chance``: the chance that a scattered building will spawn in a multichunk (relative to the chances of each individual scattered building, see later)
  * ``weightnone``: this weight is added to the weights of all scattered buildings so that there is a chance none spawn
  * ``list``: a list of scattered buildings. Each entry in this list has the following keywords:
    * ``name``: the name of the scattered building
    * ``weight``: the weight of this scattered building. The higher the weight the more likely this building will spawn
    * ``allowvoid``: this is a boolean that controls if this scattered building can spawn in the void
    * ``biomes``: a biome matcher (more on this later)
    * ``maxheightdiff``: the maximum height difference between all four corners of the chunk
* ``parts``: with this object you can control the blocks used for three systems: 
  * ``monorails``: the blocks used for monorails ('both', 'vertical', and 'station')
  * ``highways``: the blocks used for highways (these can be a single part or a list of parts) ('tunnel', 'open', 'bridge', 'tunnel_bi', 'open_bi', and 'bridge_bi')
  * ``railways``: the blocks used for railways (these can be a single part or a list of parts) ('stationunderground', 'stationopen', 'stationopenroof', 'stationundergroundstairs', 'stationstaircase', 'stationstaircasesurface', 'railshorizontal', 'railshorizontalend', 'railshorizontalwater', 'railsvertical', 'railsverticalwater', 'rails3split', 'railsbend', 'railsflat', 'railsdown1', and 'railsdown2')
* ``citystyles``: a list of citystyles. Each entry in this list has the following keywords:
  * ``factor``: the factor that is used to calculate the chance of this city style
  * ``biomes``: a biome matcher (more on this later)
  * ``citystyle``: the name of the city style
* ``citybiomemultipliers``: a list of biome multipliers. Each entry in this list has the following keywords:
  * ``multiplier``: the multiplier to apply to the city chance
  * ``biomes``: a biome matcher (more on this later)

Here is an example worldstyle where a different citystyle is selected based on some biomes.
This is done with the 'citystyles' tag.
You can also influence the chance of cities using the 'citybiomemultipliers' tag.
With this tag you can lower or raise city chance in certain biomes.
In addition, you can specify what part has to be used in the center of a city sphere as well as the placement and offset.
It's also possible tp specify scattered buildings (buildings outside the buildings):

```json
{
  "outsidestyle": "outside",
  "cityspheres": {
    "centerpart": "cabin",
    "centertype": "street",
    "centerpartorigin": "top"
  },
  "citybiomemultipliers": [
    {
      "multiplier": 0.1,
      "biomes": {
        "if_any": [
          "#minecraft:is_ocean"
        ]
      }
    },
    {
      "multiplier": 0.3,
      "biomes": {
        "if_any": [
          "#minecraft:is_river"
        ]
      }
    }
  ],
  "citystyles": [
    {
      "factor": 0.5,
      "citystyle": "citystyle_standard"
    },
    {
      "factor": 9.0,
      "biomes": {
        "if_any": [
          "minecraft:desert",
          "minecraft:badlands"
        ]
      },
      "citystyle": "citystyle_desert"
    }
  ]
}
```

### Predefined Cities

Here is an example of a predefined city with a multibuilding in the center:

```json
  {
    "dimension": 0,
    "chunkx": 100,
    "chunkz": 100,
    "radius": 200,
    "buildings": [
      {
        "multibuilding": "center",
        "chunkx": 0,
        "chunkz": 0
      }
    ]
  }
```

Having this as an asset will ensure that there is a city at chunk position 100,100 (multiply with 16 to get real coordinates) with radius 200.
It also places a multi building (the 'center') at the 0,0 location (relative to the center of the city).
You can also place individual buildings using the 'building' keyword instead of 'multibuilding'.
