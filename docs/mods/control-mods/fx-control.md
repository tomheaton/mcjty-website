# FX Control

:::danger Outdated
THIS IS OBSOLETE: Use [The New Documentation](./control-mods.md) instead!
:::

This is a simple mod that gives you full control on player effects depending on various conditions. It is based on a rule system. The rule file is located in config/fxcontrol.

## Introduction

There are currently five rule files (as of 0.1.0):

* '''effects.json''': with this file you can add effects to the player based on various conditions
* '''breakevents.json''': with this file you can add effects to the player when a block is broken (and also prevent the block from breaking)
* '''placeevents.json''': with this file you can add effects to the player when a block is placed (and also prevent the block from being placed)
* '''rightclicks.json''': with this file you can add effects to the player when the player right clicks a block (and also prevent interaction)
* '''leftclicks.json''': with this file you can add effects to the player when the player left clicks a block (and also prevent interaction)

Note, everywhere in the rules below that you can specify items you can use the following notations:
* ''minecraft:sand'' (just normal minecraft sand)
* ''minecraft:stained_hardened_clay@13'' (adds metadata 13)
* With NBT (same format as for /give command): ''`minecraft:stained_hardened_clay@13/{display:{Lore:[\"My Clay\"]}}`''

When checking for items you can also use a json like this:

```json
[
  {
    "helditem": {
        "item": "minecraft:diamond_pickaxe",
        "damage": ">0",
        "nbt": { ... }
    },
    ...
  }
]
```

### Keywords

In this section the rules in effects.json are explained. Every rule is basically a set of 'criteria' and a set of 'actions'. The following criteria are currently supported:

* '''minheight''': this rule accepts an integer and indicates the minimum height (inclusive) at which this rule will fire. This height is the y level at which the player would get an effect
* '''maxheight''': same as minheight but this represents the maximum y level
* '''minlight''': integer value (between 0 and 15) indicating the minimum light level on the block that the player is standing on
* '''maxlight''': maximum light level
* '''minspawndist''': floating point number indicating the minimum distance (in minecraft units) to the spawn point in the world
* '''maxspawndist''': maximum distance to spawn
* '''mintime''': integer value representing the time of the day (a number between 0 and 23999)
* '''maxtime''': maximum time of the day
* '''mindifficulty''': floating point value representing the local difficulty of the place where the player is located. This is a number between 0 and 4
* '''maxdifficulty''': maximum local difficulty
* '''difficulty''': a string with one of the following values: easy, normal, hard, peaceful
* '''weather''': a string with one of the following values: rain or thunder
* '''tempcategory''': a string with one of the following values: cold, medium, warm, or ocean. This represents the temperature category of the current biome
* '''seesky''': a boolean that is true if the block on which player is standing can see the sky (not in a cave)
* '''structure''': this is a string representing the name of the structure to test for. This way you can make sure a rule only fires in a village for example. For vanilla the following structures can occur: 'Village', 'Fortress', 'EndCity', 'Mineshaft', 'Stronghold', 'Temple', 'Monument' and 'Mansion' (for 1.11 only). 'Temple' is also used for witch huts. Modded structures should also work
* '''block''': this is either a single string or a list of strings. Every string is in the form: modid:registryname. For example: minecraft:stone or minecraft:cobblestone. This represents the block on which the player is standing. You can also use an ore dictionary name like this: 'ore:plankWood' which will match based on ore dictionary
* '''blockoffset''': this is an nbt with an offset that is used by the 'block' test above: { 'x': ..., 'y': ..., 'z': ... }
* '''biome''': this is either a single string or a list of strings. This represents the biome in which the player is standing
* '''biometype''': this is either a single string or a list of strings. This represents the biome type (from the biome dictionary). Examples are WARN, COLD, ...
* '''dimension''': this is either a single integer or a list of integers. This represents the dimension in which the player is standing
* '''random''': this accepts a floating point number and it will fire the rule if a random number is less then this number. So if you want to have a rule that fires with 10% chance then use 0.1 here
* '''incity''': only if Lost Cities mod is present: check if the position is in a city
* '''instreet''': only if Lost Cities mod is present: check if the position is in a street
* '''inbuilding''': only if Lost Cities mod is present: check if the position is in a building
* '''insphere''': only if Lost Cities mod is present: check if the position is in a city sphere
* '''helment''': a string or a list of strings representing the item that the player is wearing. The rule will match if the player has any of these items
* '''chestplate''': a string or a list of strings representing the item that the player is wearing. The rule will match if the player has any of these items
* '''leggings''': a string or a list of strings representing the item that the player is wearing. The rule will match if the player has any of these items
* '''boots''': a string or a list of strings representing the item that the player is wearing. The rule will match if the player has any of these items
* '''helditem''': a string or a list of strings representing the item that the player is holding in his/her main hand. The rule will match if the player has any of these items
* '''offhanditem''': a string or a list of strings representing the item that the player is holding in his/her off hand. The rule will match if the player has any of these items
* '''bothhandsitem''': a string or a list of strings representing the item that the player is holding in his/her main or off hand. The rule will match if the player has any of these items
* '''gamestage''': a string indicating the current game stage. This only works if the 'gamestages' mod is present
* '''winter''': true if Serene Seasons is installed and it is winter
* '''summer''': true if Serene Seasons is installed and it is summer
* '''spring''': true if Serene Seasons is installed and it is spring
* '''autumn''': true if Serene Seasons is installed and it is autumn
* '''amulet''': a string or a list of strings represent the item that the player has in the specific Bauble slot
* '''ring''': a string or a list of strings represent the item that the player has in the specific Bauble slot
* '''belt''': a string or a list of strings represent the item that the player has in the specific Bauble slot
* '''trinket''': a string or a list of strings represent the item that the player has in the specific Bauble slot
* '''charm''': a string or a list of strings represent the item that the player has in the specific Bauble slot
* '''body''': a string or a list of strings represent the item that the player has in the specific Bauble slot
* '''head''': a string or a list of strings represent the item that the player has in the specific Bauble slot
* '''state''': if EnigmaScript is present this can be used to test the value of a state with a string like this "state=value"
* '''pstate''': if EnigmaScript is present this can be used to test the value of a player state with a string like this "state=value"

Then there are a number of actions:

* '''explosion''': this is a string as follows: `<strength>,<flaming>,<smoking>`. For example '10,true,true' and it will cause an explosion with the given strength
* '''setblock''': this is a json with a block description to place: { 'block': 'minecraft:chest', 'properties': { 'name': 'facing', 'value': 'west' } }
* '''give''': this is either a single string or a list of strings. Every string represents a possible item that the player will get. You can also specify a weight with this by adding `<number>=` in front of the string. Like this: "1=minecraft:diamond_sword", "2=minecraft:iron_sword"
* '''drop''': this is either a single string or a list of strings. Every string represents a possible item that will be dropped. You can also specify a weight with this by adding `<number>=` in front of the string. Like this: "1=minecraft:diamond_sword", "2=minecraft:iron_sword"
* '''potion''': this is either a single string or a list of strings. Every string represents a potion effect which is indicated like this: `<potion>,<duration>,<amplifier>`. For example "minecraft:invisibility,10,1"
* '''fire''': this is an integer representing the number of seconds that the player should be put on fire
* '''clear''': clear all potion effects
* '''message''': give a message to the player
* '''damage''': this is a string with a damage source name followed by an amount of damage. For example "fall=1.0" which would give 1.0 fall damage. All vanilla damage sources are supported (like 'inFire', 'lightningBolt', 'lava', 'cramming', outOfWorld', 'magic', ...)
* '''setstate''': if EnigmaScript is present this can be used to set a state with a string like this "state=value"
* '''setpstate''': if EnigmaScript is present this can be used to set a player state with a string like this "state=value"

### Commands

This mod has the following commands:

* '''fctrlreload''': after editing the rule files you can use this command to reload it and reapply the new rules
* '''fctrldebug''': dumps debug info about spawning in the log. Warning! This can produce a lot of output
* '''fctrldumpitem''': dump NBT info about the item the player is currently holding
* '''fctrldumpblock''': dump property info about the block the player is currently looking at

### Examples for effects.json

Here are a few examples for effects.json:


This example makes the player get poison effect if he is outside in the overworld. He will be put on fire if he goes to the nether and he will get the slowness effect if he is holding a stone tool:

```json
[
  {
    "timeout": 20,
    "dimension": 0,
    "seesky": true,
    "potion": "minecraft:poison,21,1"
  },
  {
    "timeout": 20,
    "dimension": -1,
    "fire": 20
  },
  {
    "timeout": 20,
    "helditem": [ "minecraft:stone_pickaxe", "minecraft:stone_axe", "minecraft:stone_shovel", "minecraft:stone_sword" ],
    "potion": "minecraft:slowness,21,3"
  }
]
```

In the following example the player will get hurt if he stands on an RFTools powercell that has a lot of energy in it:

```json
[
  {
    "timeout": 10,
    "block": {
      "block": "rftools:powercell",
      "energy": ">1000000"
    },
    "damage": "hotFloor=3"
  }
]
```

With this example the player will be put on fire if he even looks at lava:

```json
[
  {
    "timeout": 10,
    "blockoffset": {
      "look": true
    },
    "block": "minecraft:lava",
    "fire": 20
  }
]
```

### Examples for breakevents.json

Here are a few examples for breakevents.json:


This example prevents the player from breaking diamond ore with an iron pickaxe:

```json
[
 {
   "helditem": "minecraft:iron_pickaxe",
   "block": "minecraft:diamond_ore",
   "message": "You cannot mine this!",
   "result": "deny"
 }
]

```

In the next example diamond ore can only be broken with an undamaged pickaxe:

```json
[
  {
    "helditem": {
      "item": "minecraft:iron_pickaxe",
      "damage": ">=1"
    },
    "block": "minecraft:diamond_ore",
    "message": "You cannot mine this!",
    "result": "deny"
  }
]
```

And in this example the pickaxe has to be enchanted with a specific enchantment:

```json
[
  {
    "helditem": {
      "item": "minecraft:iron_pickaxe",
      "nbt": [
        {
          "tag": "ench",
          "contains": [
            {
              "tag": "id",
              "value": 34
            }
          ]
        }
      ]
    },
    "block": "minecraft:diamond_ore",
    "result": "allow"
  },
  {
    "block": "minecraft:diamond_ore",
    "message": "You cannot mine this!",
    "result": "deny"
  }
]

```

With 50% chance give an extra diamond when the player mines a diamond ore block:

```json
[
  {
    "helditem": {
      "item": "minecraft:diamond_pickaxe"
    },
    "block": "minecraft:diamond_ore",
    "random": 0.5,
    "give": "minecraft:diamond",
    "result": "allow"
  }
]
```


### Examples for rightclicks.json

Here are a few examples for rightclicks.json:


In this example the player can only opens chests with a stick in his or her hand:

```json
[
 {
   "helditem": "minecraft:stick",
   "block": "minecraft:chest",
   "result": "allow"
 },
 {
   "block": "minecraft:chest",
   "message": "The chest is locked!",
   "result": "deny"
 }
]

```

If we extend this example with another rule then we can also make sure that the chest can be opened without sticks provided the chest itself contains sufficient sticks:

```json
[
  {
    "helditem": "minecraft:stick",
    "block": "minecraft:chest",
    "result": "allow"
  },
  {
    "block": {
      "block": "minecraft:chest",
      "contains": {
        "item": "minecraft:stick",
        "count": ">10"
      }
    },
    "result": "allow"
  },
  {
    "block": "minecraft:chest",
    "message": "The chest is locked!",
    "result": "deny"
  }
]
```
