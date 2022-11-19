# Asset System

## The Asset System

### Introduction

The following assets are supported:

* Condition: a condition is basically a randomized string value which can be selected based on various criteria. Currently used for controlling what type of mob a mob spawner has and the loot tables for chests.
* Worldstyle: from the world style the city style is selected based on biomes.
* Citystyle: a city style represents how a city is generated. It controls the buildings, fountains, parks, stairs, as well as the width of the street, restrictions on building height and depth, and various blocks used by the world generator. The city style also controls the palette style.
* Style: this is a palette style. It basically combines various palettes and also has the ability to randomize palettes so that different chunks (sharing the same style) may look different anyway.
* Palette: a palette is a mapping between characters used in parts (structures) and actual blocks in the world. Using styles it is possible to combine different palettes. For example, the standard assets which are distributed with The Lost Cities have a palette for the bricks of the buildings (which is randomized) as well as an independent palette for the glass of the buildings.
* Part: every structure in the world is made out of one or more parts. For buildings every part represents a floor of a building (6 high) but parts are also used for fountains, subway structures, stairs and so on. Parts are defined using characters from the palette so the actual building blocks that are used during generation depend on the combined palette from the style that is valid for that chunk.
* Building: a building is generated from a selection of parts. Which parts are chosen depends on a set of conditions. For example, some parts may only be suitable to place on top of the building (roof parts) so they are restricted to generate at the top only. You can also have parts that are used underground or for the first floor and so on.
* Multibuilding: a multi building is a building that spans multiple chunks. In the current implementation multi buildings are restricted to 2x2 chunks. Every section of a multi building is seen as a building on its own but by using the multi building you can ensure that these building parts are always generated together.
* Predefined cities: predefined cities (and buildings) are useful for pack makers who want to have specific cities and buildings at specific locations in the world. If you combine this with disabling cities everywhere you can ensure that your world has only the cities that you want and no more.

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
When the generator encounters such a condition in a palette it will evaluate it and use what is returned.
To evaluate such a condition a context object is given that contains information about the chunk/building that is being generated.
In this example the first entry in the 'chestloot' condition tells the system that the 'lostcitychest' loot table can be generated at floors between 4 and 100 and the second entry also allows generating it below level -3 (in the low cellars).

The third and fourth entries are used to generate 'raildungeonchest' loot in the 'rail_dungeon1' and 'rail_dungeon2' parts which represent the rail dungeons.

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
* ground (boolean): true at the ground level of a building. This is relative to the city level of the top-left chunk of a building (relevant in case this is a multi building where some of the chunks can be in parts of the city where the city level is different)
* range (string): notation: 'from,to'. This condition is true if the current floor is between those two numbers (inclusive at both ends). Note that the ground floor is numbered 0.
* cellar (boolean): true if the floor is underground
* floor (integer): true on the specified floor
* chunkx (integer): true at a specific chunk x location. This can be useful if you have predefined buildings at specific spots and you want very specific mob spawners or loot chests there
* chunkz (integer): true at a specific chunk z location
* inpart (string): true if the spawner/chest was part of the given 'part'
* isbuilding (boolean): true if the spawner/chest is in a building
* inbuilding (string): true if the spawner/chest is in a specific building
* issphere (boolean): true if the spawner/chest is in a city sphere
* inbiome (string): true if the spawner/chest is in a biome

### Citystyle

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

Note the 'citystyle_config'. City styles can inherit from other city styles.
In this case there is a very simple citystyle_config where the road width is configured:

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

Here is an example worldstyle where a different citystyle is selected based on some biomes:

```json
  {
    "type": "worldstyle",
    "name": "standard",
    "outsidestyle": "outside",
    "citystyles": [
      {
        "factor": 0.5,
        "citystyle": "citystyle_standard"
      },
      {
        "factor": 9.0,
        "biomes": [
          "desert",
          "desert_hills",
          "mesa",
          "mesa_rock",
          "mesa_clear_rock"
        ],
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

## Asset loading

If you look at the 'general.cfg' (1.12) or 'common.toml' (1.16+) config file you can see the following entry there:

```text
# List of asset libraries loaded in the specified order. If the path starts with '/' it is going to be loaded directly from the classpath. If the path starts with '$' it is loaded from the config directory [default: [/assets/lostcities/citydata/conditions.json], [/assets/lostcities/citydata/palette.json], [/assets/lostcities/citydata/palette_desert.json], [/assets/lostcities/citydata/palette_chisel.json], [/assets/lostcities/citydata/palette_chisel_desert.json], [/assets/lostcities/citydata/highwayparts.json], [/assets/lostcities/citydata/railparts.json], [/assets/lostcities/citydata/buildingparts.json], [/assets/lostcities/citydata/library.json], [$lostcities/userassets.json]]
S:assets <
    /assets/lostcities/citydata/conditions.json
    /assets/lostcities/citydata/palette.json
    /assets/lostcities/citydata/palette_desert.json
    /assets/lostcities/citydata/palette_chisel.json
    /assets/lostcities/citydata/palette_chisel_desert.json
    /assets/lostcities/citydata/highwayparts.json
    /assets/lostcities/citydata/railparts.json
    /assets/lostcities/citydata/buildingparts.json
    /assets/lostcities/citydata/library.json
    $lostcities/userassets.json
 >
```

Assets are loaded in the order specified in this config.
There are two important rules that will help you to override built-in assets:

* If an asset has the same type and name as another asset previously loaded then the last loaded asset will be used. i.e. if you were to put aa building called 'building1' in 'userassets.json' then (because userassets is loaded last) it will replace the building1 that was defined earlier (in 'buildingparts.json').
* This is true even if assets loaded earlier use that asset! For example, if you replace building1 in userassets but building1 is used in the citystyle that is defined earlier than your replacement will still be used. That's because the citystyle doesn't actually refer to the building but just the name of the building. So when you later replace building1 with another building it will be used by that citystyle too.

This trick makes it easy to (for example) change the rules for chest loot because you can make a new 'chestloot' condition in userassets.json, and it will replace the already existing 'chestloot'.
