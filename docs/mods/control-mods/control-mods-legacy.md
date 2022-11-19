# Control Mods Legacy

## Introduction

:::danger Warning
This page is for versions of Minecraft 1.15 or older!
If you want documentation for the latest 1.16 version please go to [this page](./control-mods-16.md) instead!
:::

[In Control](https://minecraft.curseforge.com/projects/in-control) is a mod that supports a rule based system that allows you to control various aspects about mobs.
There are rule files to control spawning, loot, experience and so on.

[Fx Control](https://minecraft.curseforge.com/projects/fx-control) is a mod that supports a rule based system that allows you to control things that happen around the player.
There are rule files to give the player potion effects, set them on fire, prevent them from interacting with objects and other things related to that.

Both mods have support for:
- [Game Stages](https://minecraft.curseforge.com/projects/game-stages)
- [Serene Seasons](https://minecraft.curseforge.com/projects/serene-seasons)
- [Baubles](https://minecraft.curseforge.com/projects/baubles)
- [Lost Cities](../lost-cities/lost-cities.md)
- [EnigmaScript](../enigma/enigma.md)

Because both mods have a very similar structure the documentation for them is merged.

## Differences between 1.16.3 and older

The 1.16.3 version of InControl and FxControl have some important differences which will require you to change rules when you move over from an older version to 1.16.3:

* It's recommended to use the biome registry name for biomes instead of the actual readable name. i.e. `minecraft:plains` instead of Plains. This is also possible with recent versions of InControl and FxControl in 1.15.2
* `tempcategory` is removed and replaced with a more generic `category` for biomes. It is now a list and supports the following categories: taiga, extreme_hills, jungle, mesa, plains, savanna, icy, the_end, beach, forest, ocean, desert, river, swamp, mushroom and nether
* `biometype` now supports the following values: desert, desert_legacy, warm, cool, and icy
* Numerical dimension IDs no longer work (like 0 for the overworld. Use `minecraft:overworld` instead). This is also possible in the 1.15.2 versions of InControl and FxControl (and recommended). But in 1.16.3 and later the numerical ID's are gone.
* The `/incontrol reload` command will no longer be able to reload the potentialrule file (at least in regard to adding new spawns)
* In 1.15.2 and 1.16.3 there is a new `continue` boolean flag that you can use in spawn rules. If this is set to true then if the rule succeeds it will not prevent execution of further rules (which it normally does by default)

## Commands

These mods have various commands that allow you to debug and tweak what is going on:

* `ctrlreload (In Control)`: after editing the rule files you can use this command to reload it and reapply the new rules
* `ctrldebug (In Control)`: dumps debug info about spawning in the log. Warning! This can produce a lot of output
* `ctrlshowmobs (In Control)`: show all entities and their names that can be used in spawn.json for mob names
* `ctrlkill (In Control)`: kill all entities of a given type. Possible types are: `all`, `hostile`, `passive`, or `entity`. It is also possible to give the name of an entity instead of a type. On 1.11 this would be `minecraft:enderman` for example. On 1.10 'Enderman'. There is also an optional extra parameter for a dimension ID
* `fctrlreload (Fx Control)`: after editing the rule files you can use this command to reload it and reapply the new rules
* `fctrldebug (Fx Control)`: dumps debug info about spawning in the log. Warning! This can produce a lot of output
* `fctrldumpitem (Fx Control)`: dump NBT info about the item the player is currently holding
* `fctrldumpblock (Fx Control)`: dump property info about the block the player is currently looking at

## Rule Files

All rule files can be found in the `config/incontrol` and `config/fxcontrol` directories. The following rule files are currently supported:

* `spawn.json (In Control)`: with this file you can block spawning of certain creatures under certain conditions. In addition, when a spawn is allowed you can also alter some of the properties of the mob like maximum health and others. Note that the rules in this file only alter already existing spawns. You cannot (for example) with this file alone add blazes to spawn in the overworld. For that you need to look at `potentialspawn.json` too
* `summonaid.json (In Control)`: this is a file that is structured the same as spawn.json but is only used when zombies are summoned for aid
* `potentialspawn.json (In Control)`: with this file you can remove and add spawn rules under certain conditions. The rules in this file are used before the rules in spawn.json are fired so make sure that when you add a rule for new mobs here, the new mobs are allowed in spawn.json
* `loot.json (In Control)`: with this file you can control the loot that mobs drop when they are killed based on various criteria
* `experience.json (In Control)`: this file controls how much experience you get from killing mobs. It has a similar structure to `loot.json` except that you cannot control experience based on the type of damage (like magic, fire, explosion, ...)
* `effects.json (Fx Control)`: with this file you can add effects to the player based on various conditions
* `breakevents.json (Fx Control)`: with this file you can add effects to the player or world when a block is broken (and also prevent the block from breaking)
* `placeevents.json (Fx Control)`: with this file you can add effects to the player or world when a block is placed (and also prevent the block from being placed)
* `rightclicks.json (Fx Control)`: with this file you can add effects to the player or world when the player right-clicks a block (and also prevent interaction)
* `leftclicks.json (Fx Control)`: with this file you can add effects to the player or world when the player left-clicks a block (and also prevent interaction)

## Rule Structure

Every rule has three parts:

* `Conditions`: This represents tests that have to be true before the rule can be considered for execution. All conditions in a rule have to be true before the rule will be executed
* `Actions`: This represents things that will be done when the rule is executed
* `Extra`: Some rules need extra things to work and some conditions/actions have extra modifiers that can alter how they work

Whenever something happens the corresponding rules are evaluated from top to bottom. In most cases the first rule that matches will be executed and further rules are ignored (the rules in `potentialspawn.json` and `loot.json` are an exception to that. For these all matching rules are executed)

## Expressions

In some of the conditions it is possible to use expressions.
An expression is basically a string specifying some test to do on an integer value.

Here are a few examples:
* `>10`: evaluate to true if the number we are testing on is greater than 10
* `!=10`: evaluate to true if it is different from 10
* `4-50`: evaluate to true if the number is between 4 and 50 (inclusive)
* `10`: evaluate to true if the number is equal to 10

The following comparators are supported: `>`, `>=`, `<`, `<=`, `=`, and `!=`.

## Item filters

Many conditions are very simple but when testing for items things can be a bit more complicated. That's why there is a specific syntax that can be used when testing on items. In this section we will go over all the possibilities and also present a few examples. In most cases when testing for an item (like test if the player holds a specific item in their hand) you can either use a single item filter or else a list of item filters. Let's talk about the case of an individual item filter. The following possibilities are supported:

* `minecraft:sand` (just normal minecraft sand)
* `minecraft:stained_hardened_clay@13` (adds metadata 13)
* With NBT (same format as for /give command): ``minecraft:stained_hardened_clay@13/{display:{Lore:[\"My Clay\"]}}``
* A JSON descriptor which supports the following tags:
  ** `item`: an item ID (like `minecraft:sand` or `rftools:powercell`)
  ** `empty`: a boolean (true or false) indicating if the item is empty or not. If this is present no other tags will be considered
  ** `damage`: an expression (see above) which will be evaluated on the damage from the item
  ** `count`: an expression which will be evaluated on the number of items in the stack
  ** `ore`: a string indicating an ore dictionary value (for example `ingotCopper`, `dyeBlue`, `plankWood`, ...)
  ** `mod`: a string indicating the modid for the item
  ** `energy`: an expression which will be evaluated to the amount of Forge Energy present in the item
  ** `nbt`: a JSON array. Every object in this array supports the following tags:
  *** `tag`: the name of the NBT tag to test on
  *** `value`: the stringified value of the NBT tag to test on
  *** `contains`: use this instead of `value` in case the tag represents a list. The value after contains should be a JSON array which in turn contains nbt matching tags like what we're describing now (see example later to make this more clear)

### Item Filter Examples

The following examples are all applied on `playerhelditem` but it is of course possible to use them for any kind of condition that supports items.

The simplest case.
A simple stick:

```json
{
  "playerhelditem": "minecraft:stick"
}
```

A list of different items:

```json
{
  "playerhelditem": [ "minecraft:stone_pickaxe", "minecraft:stone_axe", "minecraft:stone_shovel", "minecraft:stone_sword" ]
}
```

A specific block with a specific metadata:

```json
{
  "playerhelditem": "minecraft:stained_hardened_clay@13"
}
```

The same example specified with JSON:

```json
{
  "playerhelditem": {
    "item": "minecraft:stained_hardened_clay",
    "damage": 13
  }
}
```

The same block with some NBT data:

```json
{
  "playerhelditem": "minecraft:stained_hardened_clay@13/{display:{Lore:[\"My Clay\"]}}"
}
```

The same example specified with JSON:

```json
{
  "playerhelditem": {
    "item": "minecraft:stained_hardened_clay",
    "damage": 13,
    "nbt": [
      {
        "tag": "display",
        "value": "My Clay"
      }
    ]
  }
}
```

An empty hand:

```json
{
  "playerhelditem": { "empty": true }
}
```

In this example we need a damage pickaxe:

```json
{
  "playerhelditem": {
    "item": "minecraft:iron_pickaxe",
    "damage": ">0"
  }
}
```

In this final example we test if a pickaxe has a specific enchantment (unbreaking in this case):

```json
{
  "playerhelditem": {
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
  }
}
```

## Block Filters

Similarly to item filters there is also the `block` condition that can test on the existence of a specific block.
Like with items it is possible to specify a list or a single block filter.

Here are the possibilities on an individual block filter:

* `minecraft:sand`: a block matching this id. Metadata and/or properties are ignored
* `ore:dyeBlue`: a block matching the specified ore dictionary value
* A JSON descriptor which supports the following tags:
  * `block`: a block ID (like `minecraft:sand` or `rftools:powercell`)
  * `properties`: (only if `block` is used). This is a JSON array with properties to match against. As soon as this is present a blockstate will be constructed made out of the block and the properties specified here and the match has to be exact. So properties that are not specified here will be put to their default value
  * `ore`: a string indicating an ore dictionary value (for example `ingotCopper`, `dyeBlue`, `plankWood`, ...)
  * `mod`: a string indicating the modid for the block
  * `energy`: an expression which will be evaluated to the amount of Forge Energy present in the block
  * `contains`: either a single JSON object or else an array of JSON objects representing item filters as explained in the item filter section. The contains test will succeed if it finds any matching item in the inventory (if the block to test actually represents an inventory)
  * `side`: this is a modifier for both `energy` and `contains`. If present it will indicate the side from which we want to examine the energy or inventory contents. If not present the `null` side is used. This should be a string like `east`, `west`, `south`, `north`, `up`, or `down`.

### Block Filter Examples

A diamond block:

```json
{
  "block": "minecraft:diamond_block"
}
```

A block of planks:

```json
{
  "block": "ore:plankWood"
}
```

Or in JSON syntax:

```json
{
  "block": { "ore": "plankWood" }
}
```


An RFTools powercell containing more than 1000000 energy:

```json
{
  "block": {
    "block": "rftools:powercell",
    "energy": ">1000000"
  }
}
```

A chest containing more than 10 sticks:

```json
{
  "block": {
    "block": "minecraft:chest",
    "contains": {
      "item": "minecraft:stick",
      "count": ">10"
    }
  }
}
```

A powered button:

```json
{
  "block": {
    "block": "minecraft:stone_button",
    "properties": [
      {
        "name": "powered",
        "value": "true"
      }
    ]
  }
}
```

## Mob Counter

The `maxcount` and `mincount` tags to control mob spawning can be either a simple number or string containing a number and a mob, but it can also be a more complex JSON with various conditions.

The following tags are supported:
* `amount`: the amount to compare with (can be scaled!)
* `perplayer`: if this is true the amount will be scaled with the amount of players present
* `perchunk`: if this is true the amount will be scaled with the amount of loaded chunks divided by 289 (this is how vanilla mobcap works)
* `mod`: if this is set all mobs of a given mod are counted (can be used in combination with hostile or passive)
* `hostile`: if this is set all hostile mobs are counted
* `passive`: if this is set all passive mobs are counted
* `mob`: this is a single mob or a list of mobs. If this is present only those mobs are counted

### Mob Counter Examples

In `spawn.json`: deny skeletons if there are already more then 50 hostile vanilla mobs present per player:

```json
  {
    "dimension": 0,
    "mob": "minecraft:skeleton",
    "mincount": {
      "amount": 50,
      "hostile": true,
      "perplayer": true
    },
    "result": "deny"
  }
```

In spawn.json: deny all mobs of a given mod if there are already more then 50 mods of that mod present, scaled based on vanilla mob cap rules:

```json
  {
    "dimension": 0,
    "mod": "horriblecreatures",
    "mincount": {
      "amount": 50,
      "mod": "horriblecreatures",
      "perchunk": true
    },
    "result": "deny"
  }
```

Contrast above example with the old syntax where it would compare the amount of each individual mob of the given mod:

```json
  {
    "dimension": 0,
    "mod": "horriblecreatures",
    "mincount": 50,
    "result": "deny"
  }
```

## Conditions

In this section all possible conditions are explained. Some conditions are not usable in all rules. This will be mentioned here. Whenever a position is tested in a rule the given position depends on the rule. For mob spawns this will be the position where the mob will spawn. For block break events this will be the position of the broken block. For player effects this is the position of the block on which the player is standing.

* `onjoin` (only for `spawn.json`): if this is set to true then this spawn rule will also be fired when entities join the world. This is a much stronger test and will allow you to disable spawns from mob spawners as well as prevent passive mob spawns that don't always go through the regular 'checkspawn' event. Use this with care!
* `minheight`: this rule accepts an integer and indicates the minimum height (inclusive) at which this rule will fire
* `maxheight`: same as minheight but this represents the maximum y level
* `minlight`: integer value (between 0 and 15) indicating the minimum light level on the given block
* `maxlight`: maximum light level
* `mincount` (only for `spawn.json`, `summonaid.json`, or `potentialspawn.json`): string value that is either a number in which case it will count how many mobs of the given class are already in the world or else of the form `<amount>,<mob>` to count the number of mobs of that type. That way you can have a rule file based on the number of mobs already present. Note that instead of this syntax you can also use the JSON mob counter syntax as explained above
* `maxcount` (only for `spawn.json` `summonaid.json`, or `potentialspawn.json`): similar to mincount
* `minspawndist`: floating point number indicating the minimum distance (in minecraft units) to the spawn point in the world
* `maxspawndist`: maximum distance to spawn
* `mintime`: integer value representing the time of the day (a number between 0 and 23999)
* `maxtime`: maximum time of the day
* `mindifficulty`: floating point value representing the local difficulty of the place where the mob will spawn. This is a number between 0 and 4
* `maxdifficulty`: maximum local difficulty
* `canspawnhere` (only for `spawn.json`): a check that is specific to the entity implementation. This is called by Minecraft automatically if you return `default` as the result of this rule. For many mobs this check will do the standard light level check
* `isnotcolliding` (only for `spawn.json`): a check that is specific to the entity implementation. This is called by Minecraft automatically if you return `default` as the result of this rule. For many mobs this check will do a test if the mob would collide with blocks after spawning
* `difficulty`: a string with one of the following values: easy, normal, hard, peaceful
* `weather`: a string with one of the following values: rain or thunder
* `tempcategory`: a string with one of the following values: cold, medium, warm, or ocean. This represents the temperature category of the current biome
* `hostile` (only for In Control rule files): a boolean that matches hostile mobs
* `passive` (only for In Control rule files): a boolean that matches passive mobs
* `seesky`: a boolean that is true if the block can see the sky (not in a cave)
* `structure`: this is a string representing the name of the structure to test for. This way you can make sure a rule only fires in a village for example. For vanilla the following structures can occur: `Village`, `Fortress`, `EndCity`, `Mineshaft`, `Stronghold`, `Temple`, `Monument` and `Mansion` (for 1.11 only). `Temple` is also used for witch huts. Modded structures should also work
* `mob` (only for In Control rule files): this is either a single string or a list of strings. Every string is an ID for a mob. On 1.10.2 this has to be a name like `Creeper`, `Skeleton`, ... On 1.11.2 you can also use names like `minecraft:creeper` and so on
* `mod` (only for In Control rule files): this is either a single string or a list of strings. Every string represents a mod id. By using this you can block spawns of certain mods
* `block`: this is a block filter as explained above
* `blockoffset`: a JSON that can modify the position of the block that is being used by the `block` test (or the `setblock` action). This JSON can contain tags like `x`, `y`, or `z` which will be added (as offset) to the original block position or else the boolean tag `look` in which case the position will be the position the player is looking at (only in case there is a player involved which isn't the case for `spawn.json`)
* `biome`: this is either a single string or a list of strings. This represents the biome of the current block
* `biometype`: this is either a single string or a list of strings. This represents the biome type (from the biome dictionary). Examples are WARN, COLD, ...
* `dimension`: this is either a single integer or a list of integers. This represents the dimension of the current block or player
* `random`: this accepts a floating point number, and it will fire the rule if a random number is less than this number. So if you want to have a rule that fires with 10% chance then use 0.1 here
* `spawner` (only for `spawn.json`): true if spawned by a spawner
* `player` (only for `loot.json` and `experience.json`): boolean value indicating if the mob was killed by a player
* `fakeplayer` (only for `loot.json` and `experience.json`): boolean value indicating if the mob was killed by a fake player (automation behaving as if it is a player)
* `realplayer` (only for `loot.json` and `experience.json`): boolean value indicating if the mob was killed by a real player (no automation)
* `projectile` (only for `loot.json` and `experience.json`): boolean value indicating if the mob was killed by a projectile
* `explosion` (only for `loot.json` and `experience.json`): boolean value indicating if the mob was killed by an explosion
* `magic` (only for `loot.json` and `experience.json`): boolean value indicating if the mob was killed by magic
* `fire` (only for `loot.json` and `experience.json`): boolean value indicating if the mob was killed by fire
* `source` (only for `loot.json` and `experience.json`): a string or a list of strings representing the damage source. Some sources are `lightningBolt`, `lava`, `cactus`, `wither`, `anvil`, ...
* `playerhelditem`: a string or a list of strings representing the item that the player is holding in their main hand. Use a correct item filter (or list of item filters) (this used to be `helditem` which is still supported but no longer recommended)
* `offhanditem`: a string or a list of strings representing the item that the player is holding in their offhand. Use a correct item filter (or list of item filters)
* `bothhandsitem`: a string or a list of strings representing the item that the player is holding in their main or offhand. Use a correct item filter (or list of item filters)

Conditions that are present with Lost Cities:

* `incity`: check if the position is in a city
* `instreet`: check if the position is in a street
* `inbuilding`: check if the position is in a building
* `insphere`: check if the position is in a city sphere

Conditions that are present with Serene Seasons:

* `winter`:
* `summer`:
* `spring`:
* `autumn`:

Conditions that are present with Baubles:

* `amulet`: an item filter or a list of item filters representing the item that the player has in the specific Bauble slot
* `ring`: an item filter or a list of item filters representing the item that the player has in the specific Bauble slot
* `belt`: an item filter or a list of item filters representing the item that the player has in the specific Bauble slot
* `trinket`: an item filter or a list of item filters representing the item that the player has in the specific Bauble slot
* `charm`: an item filter or a list of item filters representing the item that the player has in the specific Bauble slot
* `body`: an item filter or a list of item filters representing the item that the player has in the specific Bauble slot
* `head`: an item filter or a list of item filters representing the item that the player has in the specific Bauble slot

Conditions that are present with Game Stages:

* `gamestage`: a string indicating the current game stage. This requires that the rule has a player (not the case for `spawn.json` for example).

Conditions that are present with EnigmaScript:

* `state`: if EnigmaScript is present this can be used to test the value of a state with a string like this "state=value"
* `pstate`: if EnigmaScript is present this can be used to test the value of a player state with a string like this "state=value"

## Actions

In this section all the actions per rule type are listed.

### Spawn and SummonAid

For `spawn.json` the following actions are supported:

* `result`: this is either `deny`, `allow`, `default`, or not specified. If you don't specify a result then whatever other mob control mods have decided is preserved. If you specify a result then In Control will take over (since the In Control rule will fire last). Use `deny` to block the spawn. If 'allow' is used then the spawn will be allowed even if vanilla would normally disallow it (i.e. too much light). If 'default' is used then it is possible the spawn can still be denied if there is not enough light for example. Unless 'deny' is used then you can use any of the following actions:
* `nbt`: allows you to add NBT to a spawned mob
* `customname`: allows you to set a custom name for the spawned mob
* `healthmultiply`: this is a floating point number representing a multiplier for the maximum health of the mob that is spawned. Using 2 here for example would make the spawned mob twice as strong.
* `healthadd`: this is a floating point number that is added to the maximum health
* `speedmultiply`: this is a floating point number representing a multiplier for the speed of the mob
* `speedadd`: this is a floating point number that is added to the speed
* `damagemultiply`: this is a floating point number representing a multiplier for the damage that the mob does
* `damageadd`: this is a floating point number that is added to the damage
* `angry`: this is a boolean that indicates if the mob will be angry at and/or target the nearest player. For zombie pigman this will make them angry at the player immediatelly. Same for enderman and wolves
* `potion`: this is either a single string or a list of strings. Every string represents a potion effect which is indicated like this: `<potion>,<duration>,<amplifier>`. For example "minecraft:invisibility,10,1"
* `helditem`: this is either a single string or a list of strings. Every string represents a possible item that the spawned mob will carry in its hand. This works only with mobs that allow this like skeletons and zombies. You can also specify a weight with this by adding `<number>=` in front of the string. Like this: `"1=minecraft:diamond_sword", "2=minecraft:iron_sword"`
* `armorboots`: this is either a single string or a list of strings representing random armor that the spawned mob will wear
* `armorhelmet`: is either a single string or a list of strings representing random armor that the spawned mob will wear
* `armorlegs`: is either a single string or a list of strings representing random armor that the spawned mob will wear
* `armorchest`: is either a single string or a list of strings representing random armor that the spawned mob will wear

In addition, 'gamestage', `playerhelditem`, and related tags (which are tied to a player) are also supported. In that case the nearest player will be used as the basis for deciding the rule.

### Additional Spawns

The same conditions as with `spawn.json` are supported. However, with `mincount` and `maxcount` you have to use the format `<amount>,<mob>`. Instead of actions this rule file supports mob entries that have the following structure:


* `mob`: an entity name in the form Creeper, Skeleton, ... for (1.10.2) and optionally the notation modid:name for 1.11.2
* `weight`: an integer indicating the weight of this spawn. i.e. how important it is compared to other spawns
* `groupcountmin`: the minimum amount of mobs to spawn at once
* `groupcountmax`: the minimum amount of mobs to spawn at once

You can also remove mob spawn entries with the remove keyword. This is either a string or a list of strings representing mobs that have to be removed from the possible spawns.

### Loot Control

In contrast with most other rule files every rule is evaluated every time. i.e. a succesful loot rule doesn't prevent the other loot rules from firing. Loot supports the following actions:

* `item`: this is a string or a list of strings representing new loot that will be dropped
* `itemcount`: this is a string representing how many items should drop (optionally depending on looting level). For example: "5/7-10/20-30" will drop 5 items at looting 0, 7-10 items at looting 1 and 20-30 items at looting 2 or beyond
* `nbt`: this is a JSON specifying the NBT that will be used for the loot items
* `remove`: this is a string or a list of strings representing items to remove from the loot
* `removeall`: if this is present then all items will be removed from the loot (before new items are added by this rule)

### Experience

This is similar to loot control except that it controls how much experience you get from killing a mob. All keywords from loot control can be used here except the ones that are about damage type (magic, explosion, ...) as that information is not present in this event. There are four outputs that work for these rules:

* `result`: set this to `deny` to not give any experience at all
* `setxp`: set a fixed XP instead of the default one
* `multxp`: multiply the normal XP with this number
* `addxp`: after multiplying the normal XP add this amount to the final XP

### Effects

With effects, you can specify an additional `timeout` keyword in the rule.
This represents the number of ticks that will be waited before testing the rule again.
Keep in mind that some of these rules can be expensive so using a higher timeout will make the rule fire less frequently.

Then there are a number of actions:

* `explosion`: this is a string as follows: `<strength>,<flaming>,<smoking>`. For example `10,true,true` and it will cause an explosion with the given strength
* `setblock`: this is a JSON with a block description to place: `{ 'block': 'minecraft:chest', 'properties': { 'name': 'facing', 'value': 'west' } }`
* `give`: this is either a single string or a list of strings. Every string represents a possible item that the player will get. You can also specify a weight with this by adding `<number>=` in front of the string. Like this: "1=minecraft:diamond_sword", "2=minecraft:iron_sword"
* `drop`: this is either a single string or a list of strings. Every string represents a possible item that will be dropped. You can also specify a weight with this by adding `<number>=` in front of the string. Like this: "1=minecraft:diamond_sword", "2=minecraft:iron_sword"
* `potion`: this is either a single string or a list of strings. Every string represents a potion effect which is indicated like this: `<potion>,<duration>,<amplifier>`. For example "minecraft:invisibility,10,1"
* `fire`: this is an integer representing the number of seconds that the player should be put on fire
* `clear`: clear all potion effects
* `message`: give a message to the player
* `damage`: this is a string with a damage source name followed by an amount of damage. For example "fall=1.0" which would give 1.0 fall damage. All vanilla damage sources are supported (like 'inFire', 'lightningBolt', 'lava', 'cramming', outOfWorld', 'magic', ...)
* `setstate`: if EnigmaScript is present this can be used to set a state with a string like this "state=value"
* `setpstate`: if EnigmaScript is present this can be used to set a player state with a string like this "state=value"

### Break and Place

There is no `timeout` keyword here.
In addition to the actions that you can do for effects this also has a `result` output which can be `allow` or `deny`.
Note that (in contrast with `spawn.json`) the other actions are still executed even if the rule says `deny`!

### Left click and Right click

There is no `timeout` keyword here.
In addition to the actions that you can do for effects this also has a `result` output which can be `allow` or `deny`.
Note that (in contrast with `spawn.json`) the other actions are still executed even if the rule says `deny`!

## Examples

Sometimes it is best to explain things with examples.
In this section we will present many examples that you can use as a basis to make your own rules:

### Spawn

The first example allows only spawns in plains biomes.
All other spawns are prevented:

```json
[
  {
    "biome": "Plains",
    "result": "allow"
  },
  {
    "result": "deny"
  }
]
```

Simple script to disable spawns of a particular type of mob if there are too many (not more than 10):

```json
[
  {
    "mob": "minecraft:zombie",
    "mincount": 10,
    "result": "deny"
  }
]
```

This example prevents ALL passive mob spawns in a certain dimension:

```json
[
  {
    "passive": true,
    "dimension": 111,
    "onjoin": true,
    "result": "deny"
  }
]
```

Only allow creepers, skeletons and passive mobs:


```json
[
  {
    "mob": ["minecraft:creeper", "minecraft:skeleton"],
    "result": "default"
  },
  {
    "passive": true,
    "result": "default"
  },
  {
    "result": "deny"
  }
]
```

Disallow hostile mob spawns above 50.
Below 50 only allow spawns on stone and cobblestone:

```json
[
  {
    "minheight": 50,
    "hostile": true,
    "result": "deny"
  },
  {
    "maxheight": 50,
    "block": ["minecraft:stone", "minecraft:cobblestone"],
    "result": "allow"
  },
  {
    "result": "deny"
  }
]
```

Make all mobs on the surface very dangerous.
Underground there is a small chance of spawning invisible but weak zombies.
In addition, zombies and skeleton on the surface spawn with helmets, so they don't burn:


```json
[
  {
    "mob": ["minecraft:skeleton","minecraft:zombie"],
    "seesky": true,
    "result": "allow",
    "healthmultiply": 2,
    "damagemultiply": 2,
    "speedmultiply": 2,
    "armorhelmet": ["minecraft:iron_helmet", "minecraft:golden_helmet"]
  },
  {
    "seesky": true,
    "hostile": true,
    "result": "allow",
    "healthmultiply": 2,
    "damagemultiply": 2,
    "speedmultiply": 2
  },
  {
    "seesky": false,
    "random": 0.1,
    "mob": "Zombie",
    "result": "allow",
    "healthmultiply": 0.5,
    "potion": "minecraft:invisibility,10000,1"
  }
]
```

Make all zombies slower but have more health:

```json
[
  {
    "mob": "minecraft:zombie",
    "result": "default",
    "healthmultiply": 2,
    "nbt": {
      "Attributes": [
        {
          "Base": 0.23,
          "Modifiers": [
            {
              "Operation": 2,
              "Amount": -0.5,
              "Name": "effect.moveSlowdown 0"
            }
          ],
          "Name": "generic.movementSpeed"
        }
      ]
    }
  }
]
```

### Potential Spawn

Here are some examples for `potentialspawn.json`:

This example makes blazes spawn in the overworld but only on netherack (needs additional support in `spawn.json`):

```json
[
  {
    "dimension": 0,
    "mobs": [
      {
        "mob": "minecraft:blaze",
        "weight": 5,
        "groupcountmin": 1,
        "groupcountmax": 2
      }
    ]
  }
]
```

```json title="spawn.json"
[
  {
    "dimension": 0,
    "mob": "minecraft:blaze",
    "block": "minecraft:netherack",
    "result": "allow"
  },
  {
    "dimension": 0,
    "mob": "minecraft:blaze",
    "result": "deny"
  }
]
```

This examples removes all squid spawns everywhere and also adds extra iron golems in villages with a maximum of three:

```json
[
  {
    "remove": "Squid"
  },
  {
    "structure": "Village",
    "mincount": "3,VillagerGolem",
    "mobs": [
      {
        "mob": "VillagerGolem",
        "weight": 5,
        "groupcountmin": 1,
        "groupcountmax": 2
      }
    ]
  }
]
```

### Loot

Here are some examples for `loot.json`:

Make blazes only spawn blaze rods if they are killed by a player in a nether fortress.
The amount of blazerods will be higher if the looting level is higher:

```json
[
  {
    "mob": "minecraft:blaze",
    "remove": "minecraft:blaze_rod"
  },
  {
    "mob": "minecraft:blaze",
    "structure": "Fortress",
    "player": true,
    "item": "minecraft:blaze_rod",
    "itemcount": "2-3/3-4/4-6"
  }
]
```

Let the wither only drop a netherstar if it is killed with a stick:

```json
[
  {
    "mob": "WitherBoss",
    "remove": "minecraft:nether_star"
  },
  {
    "mob": "WitherBoss",
    "player": true,
    "helditem": "minecraft:stick",
    "item": "minecraft:nether_star"
  }
]
```

In this example zombies will drop an enchanted diamond sword:

```json
  {
    "mob": "minecraft:zombie",
    "player": true,
    "item": "minecraft:diamond_sword",
    "nbt": {
      "ench": [
        {
          "lvl": 3,
          "id": 22
        }
      ]
    }
  }
```

### Effects

Here are a few examples for `effects.json`:

This example makes the player get poison effect if they are outside in the overworld.
They will be put on fire if they go to the nether, and they will get the slowness effect if they is holding a stone tool:

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

In the following example the player will get hurt if they stand on an RFTools powercell that has a lot of energy in it:

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

With this example the player will be put on fire if they even look at lava:

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

### Break Events

Here are a few examples for `breakevents.json`:


This example prevents the player from breaking diamond ore with an iron pickaxe:

```json
[
 {
   "playerhelditem": "minecraft:iron_pickaxe",
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
    "playerhelditem": {
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
    "playerhelditem": {
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
    "playerhelditem": {
      "item": "minecraft:diamond_pickaxe"
    },
    "block": "minecraft:diamond_ore",
    "random": 0.5,
    "give": "minecraft:diamond",
    "result": "allow"
  }
]
```


### Examples for Right Clicks

Here are a few examples for `rightclicks.json`:


In this example the player can only open chests with a stick in his or her hand:

```json
[
  {
    "playerhelditem": "minecraft:stick",
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
    "playerhelditem": "minecraft:stick",
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
