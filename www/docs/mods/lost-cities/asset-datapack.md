# Asset DataPack System

## The Asset System

### Introduction

Starting with 1.18.2 the asset system in Lost Cities is a datapack.
That means you can replace or add assets like you would with any other datapack.
The following assets are supported:

* Condition: a condition is basically a randomized string value which can be selected based on various criteria. Currently used for controlling what type of mob a mob spawner has and the loot tables for chests.
* Worldstyle: from the world style the city style is selected based on biomes. In addition, the worldstyle can also change the chance of cities depending on biomes.
* Citystyle: a city style represents how a city is generated. It controls the buildings, fountains, parks, stairs, as well as the width of the street, restrictions on building height and depth, and various blocks used by the world generator. The city style also controls the palette style.
* Style: this is a palette style. It basically combines various palettes and also has the ability to randomize palettes so that different chunks (sharing the same style) may look different anyway.
* Variants: a variant is a conveniant name for a block with some variations. These can be used by palettes.
* Palette: a palette is a mapping between characters used in parts (structures) and actual blocks in the world. Using styles it is possible to combine different palettes. For example, the standard assets which are distributed with The Lost Cities have a palette for the bricks of the buildings (which is randomized) as well as an independent palette for the glass of the buildings.
* Part: every structure in the world is made out of one or more parts. For buildings every part represents a floor of a building (6 high) but parts are also used for fountains, subway structures, stairs and so on. Parts are defined using characters from the palette so the actual building blocks that are used during generation depend on the combined palette from the style that is valid for that chunk.
* Building: a building is generated from a selection of parts. Which parts are chosen depends on a set of conditions. For example, some parts may only be suitable to place on top of the building (roof parts) so they are restricted to generate at the top only. You can also have parts that are used underground or for the first floor and so on.
* Multibuilding: a multi building is a building that spans multiple chunks. In the current implementation multi buildings are restricted to 2x2 chunks. Every section of a multi building is seen as a building on its own but by using the multi building you can ensure that these building parts are always generated together.
* Scattered: a scattered structure refers to a (multi) building that can be randomly placed outside cities.
* Predefined cities: predefined cities (and buildings) are useful for pack makers who want to have specific cities and buildings at specific locations in the world. If you combine this with disabling cities everywhere you can ensure that your world has only the cities that you want and no more.
* Predefined spheres: predefined spheres allow you to place a city sphere on the landscape if the landscape type supports it

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
Here is an example city style:

```json
  {
  "type": "citystyle",
  "name": "citystyle_common",
  "inherit": "citystyle_config",
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
```

Note the `citystyle_config`. City styles can inherit from other city styles.
In this case there is a very simple `citystyle_config` where the road width is configured:

```json
{
  "type": "citystyle",
  "name": "citystyle_config",
  "streetblocks": {
    "width": 8
  }
}
```

When you want to change the road width you only have to modify this asset and all other city styles will automatically use it.

### Worldstyle

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

### Predefined Cities or Spheres

Here is an example of a predefined city with a multibuilding in the center:

```json
  {
    "type": "city",
    "name": "Big City",
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

In landscape types that support city spheres you can also define predefined city spheres (and optionally disable random sphere generation).
Do this as follows:

```json
{
  "type": "sphere",
  "name": "Big Spheres",
  "dimension": 0,
  "chunkx": 100,
  "chunkz": 100,
  "centerx": 1608,
  "centerz": 1608,
  "radius": 200,
  "biome": "jungle"
}
```
