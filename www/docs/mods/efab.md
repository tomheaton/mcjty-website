# EFab

EFab is a steampunk styled crafting system meant for pack makers who want to gate based on recipes.

## Introduction

Using EFab you can define recipes (with a JSON system) that use various mechanics like the 3x3 crafting grid, liquids, steam, mana, RF and so on.
In a way it extends the usual 3x3 crafting system with additional requirements. The recipes show up in JEI.

## Commands

A useful command to get started is the `/efab_savedefaults` command.
With this command you get a dump of the standard built-in recipes in the config folder.
You can then start modifying that to your wishes.
The recipe format is JSON.

## Configuration

EFab is very configurable.
For example, by default vanilla recipes are allowed in the EFab, but you can disable that in the config.

## Usage

The EFab is essentially a free-form multiblock.
That means that you can arrange all EFab blocks as you wish as long as they touch.
Adding blocks to this multi-block acts as a way to extend or speed up the functionality.

## Examples

```json
  {
    "type": "shaped",
    "output": {
      "item": "efab:tank"
    },
    "input": [
      "iii",
      "i i",
      "iii"
    ],
    "inputmap": {
      "i": "ingotIron"
    },
    "time": 10,
    "tiers": [
      "GEARBOX"
    ]
  }
```

This is an example of the efab tank.
It is a simple recipe using only iron ingots.
Crafting requires 10 seconds, and it needs a gearbox to be present on the crafting system.
Note that up to 4 gearboxes can be used to speed up this recipe.

```json
  {
    "type": "shaped",
    "output": {
      "item": "minecraft:obsidian"
    },
    "input": [
      "ccc",
      "ccc",
      "ccc"
    ],
    "inputmap": {
      "c": "cobblestone"
    },
    "time": 60,
    "tiers": [
      "STEAM",
      "RF",
      "LIQUID"
    ],
    "rfpertick": 10,
    "fluids": [
      {
        "fluid": "water",
        "amount": 1000
      },
      {
        "fluid": "lava",
        "amount": 1000
      }
    ]
  }
```

This is the default recipe to make obsidian.
It is a recipe that requires both water and lava.

```json
  {
    "type": "shaped",
    "output": {
      "item": "efab:monitor"
    },
    "input": [
      "dqd",
      "qbq",
      "dqd"
    ],
    "inputmap": {
      "q": {
        "item": "minecraft:quartz"
      },
      "b": {
        "item": "efab:base"
      },
      "d": "dyeBlack"
    },
    "time": 100,
    "tiers": [
      "RF",
      "COMPUTING"
    ],
    "rfpertick": 10
  }
```

And here is an example of using RF based crafting.
