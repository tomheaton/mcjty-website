# Control Mods New (1.20 and 1.21)

## Introduction

:::info Note
FxControl no longer exists on 1.20. It's functionality has been merged into InControl
:::

:::danger Warning
The 1.21 version is still in testing! There are some limitations and bugs as well as upcoming changes. See below
for more details.
:::


**YouTube Tutorial for 1.16 and higher:** [YouTube Link](https://youtu.be/JTwi89j4c_w?si=Pc85q2Vz4HED8CYR)

[In Control](https://minecraft.curseforge.com/projects/in-control) is a mod that supports a rule based system that allows you to control various aspects about mobs.
There are rule files to control spawning, loot, experience and so on.

Both mods have support for:
- [Game Stages](https://minecraft.curseforge.com/projects/game-stages)
- [Serene Seasons](https://minecraft.curseforge.com/projects/serene-seasons)
- [Baubles](https://minecraft.curseforge.com/projects/baubles)
- [Lost Cities](../lost-cities/lost-cities.md)
- [EnigmaScript](../enigma/enigma.md)

Because both mods have a very similar structure the documentation for them is merged.

## Common Questions (FAQ)

* Q: How can I add spawns using spawn.json?
    * A: You can't. `spawn.json` can only RESTRICT spawns. To add spawns you use the new `spawner.json`
    * A: `spawner.json` is used to ADD spawns. `spawn.json` is used to RESTRICT spawns
    * A: Even removing restrictions from spawning is considered ADDING spawns and can't be done with `spawn.json` alone. Add rules to `spawner.json` and then use `spawn.json` to refine the conditions

* Q: Why can't I seem to control mobs from mod 'X' using `spawn.json`?
    * A: Occasionally modded mobs don't follow the rules completely. It may help in such situations to use `'when': 'onjoin'` in your rule

* Q: I added a rule to spawn.json to allow a mod but nothing is happening. Why is that?
    * A: 'Allow' is standard. With `spawn.json` you can only restrict spawns that were already happening. If you want to add more spawns you'll have to add rules to `spawner.json` (possibly refined with rules in `spawn.json`)
    * A: Having only 'allow' rules in `spawn.json` is (usually) pretty useless as those mobs will spawn anyway (exceptions are if you want to boost mobs). Typically, you want to have 'deny' rules

* Q: I'm trying to deny mobs under certain conditions and allow them under other conditions but it doesn't appear to be working.
    * A: Keep in mind that order of rules is important. Whenever a mob spawns all rules are evaluated from top to bottom. First rule that matches is executed. For that reason 'allow' rules typically have to be placed BEFORE 'deny' rules 

* Q: I'm trying /summon and spawn eggs but my rules don't seem to work?
    * A: In Control only affects natural spawns and spawns done by mob spawners. Eggs and /summon is not affected
    * A: Note that if you use "when": "onjoin" then spawn eggs are affected

* Q: I added a `spawner.json` rule using 'norestrictions'. Now my `spawn.json` rules are not working
    * A: Using 'norestrictions' prevents position type rules in `spawn.json`. You can either get rid of `norestrictions` or else use "when": "onjoin" in `spawn.json`
    * A: Note that in `spawn.json` you can also bypass mob specific spawn rules and obstruction checks by using result "allow" instead of "default"

* Q: How can I get zombies to spawn more often?
    * A: This question is asked so much that it really is considered a FAQ. As I already told you above you can't add spawns using spawn.json alone. You need to add a rule to `spawner.json` and possibly set conditions in `spawn.json`. See the examples at the bottom of this wiki.

* Q: How can I get zombies to spawn during the day?
    * A: This is asked a lot but technically this is the wrong question because zombies already spawn during the day. The only restriction is light based and not time based. See the example section for an example on how to spawn zombies unrestricted when it's light

* Q: I set the Minecraft time to a certain day but In Control rules don't seem to notice?
    * A: In Control uses an internal day counter which is not the same as the Minecraft day. You can use the `/incontrol days` command to see the current day and also to set it 

## Remarks on the 1.21 version

There are currently some limitations and bugs in the 1.21 version. Here are some of the things that are not working or are limited:

* `biometype` no longer exists. This is not going to change. Use `biometags` instead
* Gamestage support is not enabled yet
* Looting has changed considerably in 1.21. In Control tries to adapt as much as possible

## Differences between the 1.20 version and older

In 1.20 InControl was changed heavily due to some new spawning events in Forge. In addition FxControl has been removed and
has been merged into InControl.

The following changes were made:

* There is a new keyword for 'spawn.json' called 'when'. This flag determines when the spawn check will occur. See the documentation later in this wiki.
* 'special.json' has been removed. It's functionality has been merged into 'spawn.json' by using the new 'when' field with the 'finalize' value
* The 'onjoin' keyword has been removed. It's functionality has been merged into 'spawn.json' by using the new 'when' field with the 'onjoin' value

An important consequence of this change is how the 'norestrictions' tag works in 'spawner.json'. If you use that flag it will also bypass the
'position' check (using 'when': 'position') in 'spawn.json'. This is in contrast with 1.19 or older where 'norestrictions' only made sure
the mob specific restrictions were not tested. If you want the old behaviour (i.e. allowing a spawn and not calling the mob specific restrictions)
then don't use 'norestrictions' in 'spawner.json' but use 'result': 'allow' in 'spawn.json' instead. Alternatively you can also use 'when': 'onjoin'
which is still called even with 'norestrictions'.

## Commands

These mods have various commands that allow you to debug and tweak what is going on:

* `incontrol reload`: after editing the rule files you can use this command to reload it and reapply the new rules
* `incontrol debug`: dumps debug info about spawning in the log. Warning! This can produce a lot of output
* `incontrol show`: show all entities and their names that can be used in spawn.json for mob names
* `incontrol kill`: kill all entities of a given type. Possible types are: 'all', 'hostile', 'passive', or 'entity'. It is also possible to give the name of an entity instead of a type (like 'minecraft:enderman'). There is also an optional extra parameter for a dimension ID
* `incontrol list`: list all current mobs present in the current dimension (and how many there are of each type)
* `incontrol days`: without parameters it shows the current day. You can also change the current day using this command
* `incontrol phases`: this shows all currently active phases
* `incontrol setphase <phase>`: set a phase
* `incontrol clearphase <phase>`: clear a phase
* `incontrol numbers`: show all currently active numbers
* `incontrol setnumber <name> <value>`: set a number to a specific value
* `incontrol area`: show the current area

## Rule Files

All rule files can be found in the `config/incontrol` directory.

The following rule files are currently supported:
* `phases.json`: with this file you can define sets of globally active common conditions (called phases). These phases can then be used in all following rules as a more efficient and clean way to select rules
* `spawn.json`: with this file you can block spawning of certain creatures under certain conditions. In addition, when a spawn is allowed you can also alter some of the properties of the mob like maximum health and others. Note that the rules in this file only alter already existing spawns. You cannot (for example) with this file alone add blazes to spawn in the overworld. For that you need to look at `spawner.json` too
* `summonaid.json`: this is a file that is structured the same as spawn.json but is only used when zombies are summoned for aid
* `spawner.json`: this is a new spawning system (from 1.16.5 onwards) that you can use instead of the currently broken potentialspawn
* `loot.json`: with this file you can control the loot that mobs drop when they are killed based on various criteria
* `experience.json`: this file controls how much experience you get from killing mobs. It has a similar structure to `loot.json` except that you cannot control experience based on the type of damage (like magic, fire, explosion, ...)
* `effects.json`: with this file you can add effects to the player based on various conditions
* `breakevents.json`: with this file you can add effects to the player or world when a block is broken (and also prevent the block from breaking)
* `placeevents.json`: with this file you can add effects to the player or world when a block is placed (and also prevent the block from being placed)
* `rightclicks.json`: with this file you can add effects to the player or world when the player right-clicks a block (and also prevent interaction)
* `leftclicks.json`: with this file you can add effects to the player or world when the player left-clicks a block (and also prevent interaction)
* `areas.json`: with this file you can define named areas that can be used by the rules
* `events.json`: with this file you can define events that allow you to spawn mobs whenever something happens. Currently implemented 'mob_killed', 'block_broken', 'command', and 'custom' events

#### spawn.json

With this rule file you can control various aspects of when a mob should spawn (or despawn). Note that
you cannot use this file to add new mobs to the game. For that you need to use `spawner.json` too.

Rules in this file are essentially split into four different categories:
* `position`: this is used to check if a mob is allowed to spawn in general. It's called by vanilla whenever a mob is about to spawn
* `onjoin`: rules in this category are checked whenever a mob joins the world. This is a stronger check because it's also fired for spawn eggs and when a mob enters another dimension
* `finalize`: this is the final step in spawning a mob. Rules in this category can change stats or equipment of the mob. You can also still cancel the spawn here
* `despawn`: this is called whenever a mob is about to despawn. You can use this to prevent despawning

The category of a spawn rule is set with the new `when` keyword. This keyword is optional and defaults to `position`.

Some additional notes about spawn.json. Each rule has a result which can be `allow`, `default`, `deny`, or `deny_with_actions`.
In case of `deny` the spawn will simply be canceled. The difference between `allow` and `default` is that with `default`
some simple vanilla spawn restrictions (like not spawn inside a block) are still tested. When `when`
is equal to `finalize` then the difference between `default` and `allow` is that `default` will still let
the vanilla finalize operation do its job (for example, skeletons will still get their bow). If you
use `allow` then only your own actions will be executed.

The difference between `deny` and `deny_with_actions` is that with `deny` no actions will be executed.

In addition, each rule can have a `continue` keyword. This will cause a matching rule to work but then continue
processing potential different rules (remember! Rules are executed in order)

:::danger Warning
Rules are executed in order PER category! For every spawn that happens every rule is evalulated from top to bottom.
The first rule that matches ALL the conditions will be executed and the rest is ignored (unless
you use the `continue` keyword).
:::

:::danger Warning
This does also mean that a rule of one category that is executed will not stop the execution of rules in other categories.
:::

:::danger Warning
Some modded mobs don't do the proper events in all cases so it is possible you have
to do use the `onjoin` category to get the desired effect (set `when` to `onjoin`).
:::

## Rule Structure

Every rule has three parts:

* `Conditions`: This represents tests that have to be true before the rule can be considered for execution. All conditions in a rule have to be true before the rule will be executed
* `Actions`: This represents things that will be done when the rule is executed
* `Extra`: Some rules need extra things to work and some conditions/actions have extra modifiers that can alter how they work

Whenever something happens the corresponding rules are evaluated from top to bottom.
In most cases the first rule that matches will be executed and further rules are ignored (the rules in `spawner.json` and `loot.json` are an exception to that.
For these all matching rules are executed)

### Expressions

In some of the conditions it is possible to use expressions.
An expression is basically a string specifying some test to do on an integer value.

Here are a few examples:
* `>10`: evaluate to true if the number we are testing on is greater than 10
* `!=10`: evaluate to true if it is different from 10
* `4-50`: evaluate to true if the number is between 4 and 50 (inclusive)
* `10`: evaluate to true if the number is equal to 10

The following comparators are supported: `>`, `>=`, `<`, `<=`, `=`, and `!=`.

### Numeric Expressions

A few keywords support numeric expressions. These are special expressions that are used to specify integer ranges. For example the `daycount` and `time` tests can use this. The following numeric expressions are supported:
* `greater` or `gt`: evaluate to true if the number is greater than the specified value
* `greaterOrEqual` or `ge`: evaluate to true if the number is greater than or equal to the specified value
* `smaller` or `lt`: evaluate to true if the number is smaller than the specified value
* `smallerOrEqual` or `le`: evaluate to true if the number is smaller than or equal to the specified value
* `equal` or `eq`: evaluate to true if the number is equal to the specified value
* `notEqual` or `ne`: evaluate to true if the number is not equal to the specified value
* `range`: evaluate to true if the number is in the specified range
* `outsideRange`: evaluate to true if the number is outside the specified range
* `repeat`: evaluate to true if the number is in the specified cycle

To clarify this. Here are a few examples:

#### Day number between day 10 and 20 inclusive (both sides)
```json
"daycount": "range(10,20)"
```
#### Time above 1000
```json
"time": "gt(1000)"
```

#### Evalulate to true on the 3rd and 4th day every 10 days:
```json
"daycount": "repeat(10,3,4)"
```

### Item filters

Many conditions are very simple but when testing for items things can be a bit more complicated. That's why there is a specific syntax that can be used when testing on items. In this section we will go over all the possibilities and also present a few examples. In most cases when testing for an item (like test if the player holds a specific item in their hand) you can either use a single item filter or else a list of item filters. Let's talk about the case of an individual item filter. The following possibilities are supported:

* `minecraft:sand` (just normal minecraft sand)
* With NBT (same format as for `/give` command): `minecraft:stained_hardened_clay{display:{Lore:[\"My Clay\"]}}`
* A JSON descriptor which supports the following tags:
  * `item`: an item ID (like `minecraft:sand` or `rftools:powercell`)
  * `empty`: a boolean (true or false) indicating if the item is empty or not. If this is present no other tags will be considered
  * `damage`: an expression (see above) which will be evaluated on the damage from the item
  * `count`: an expression which will be evaluated on the number of items in the stack
  * `tag`: a string indicating a block tag (for example `minecraft:stone`, `forge:bookshelves`, ...)
  * `mod`: a string indicating the modid for the item
  * `energy`: an expression which will be evaluated to the amount of Forge Energy present in the item
  * `nbt`: a JSON array. Every object in this array supports the following tags:
    * `tag`: the name of the NBT tag to test on (don't confuse this with the 'tag' above)
    * `value`: the stringified value of the NBT tag to test on
    * `contains`: use this instead of `value` in case the tag represents a list. The value after contains should be a JSON array which in turn contains nbt matching tags like what we're describing now (see example later to make this more clear)

#### Item Filter Examples

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

The same block with some NBT data:

```json
{
  "playerhelditem": "minecraft:stained_hardened_clay{display:{Lore:[\"My Clay\"]}}"
}
```

The same example specified with JSON:

```json
{
  "playerhelditem": {
    "item": "minecraft:stained_hardened_clay",
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

### Block Filters

Similarly to item filters there is also the `block` condition that can test on the existence of a specific block.
Like with items it is possible to specify a list or a single block filter.
Here are the possibilities on an individual block filter:

* `minecraft:sand`: a block matching this id. Metadata and/or properties are ignored
* `tag:forge:barrels/wooden`: a block matching the specified tag
* A JSON descriptor which supports the following tags:
  * `block`: a block ID (like `minecraft:sand` or `rftools:powercell`)
  * `properties`: (only if `block` is used). This is a JSON array with properties to match against. As soon as this is present a blockstate will be constructed made out of the block and the properties specified here and the match has to be exact. So properties that are not specified here will be put to their default value
  * `tag`: a string indicating a tag (for example `forge:barrels/wooden`, `minecraft:planks`, ...)
  * `mod`: a string indicating the modid for the block
  * `energy`: an expression which will be evaluated to the amount of Forge Energy present in the block
  * `contains`: either a single JSON object or else an array of JSON objects representing item filters as explained in the item filter section. The contains test will succeed if it finds any matching item in the inventory (if the block to test actually represents an inventory)
  * `side`: this is a modifier for both `energy` and `contains`. If present it will indicate the side from which we want to examine the energy or inventory contents. If not present the 'null' side is used. This should be a string like `east`, `west`, `south`, `north`, `up`, or `down`.

From 1.20 and later there is also a new 'blocktest' command that supports the above keywords but in addition also supports these. Preferably use this instead of 'block' as it is more flexible:

* 'distbelow': an integer indicating how far below to check for this block (default 1)
* 'distabove': an integer indicating how far above to check for this block (default 0)
* 'onlyair': a boolean indicating if only air blocks are valid in between (default false)

#### Block Filter Examples

Using 'blocktest' we test if the spawn location is under leaves and if so we don't allow a hostile mob to spawn there:

```json
{
  "blocktest": {
    "tag": "minecraft:leaves",
    "distabove": 8,
    "onlyair": true
  },
  "hostile": true,
  "result": "deny"
}
```

A diamond block:

```json
{
  "block": "minecraft:diamond_block"
}
```

A block of planks:

```json
{
  "block": "tag:minecraft:planks"
}
```

Or in JSON syntax:

```json
{
  "block": { "tag": "minecraft:planks" }
}
```


An RFTools powercell containing more than 1000000 energy:

```json
{
  "block": {
    "block": "rftoolspower:powercell",
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

### Mob Counter

The `maxcount` and `mincount` tags to control mob spawning can be either a simple number or string containing a number and a mob, but it can also be a more complex JSON with various conditions.
The following tags are supported:

* `amount`: the amount to compare with (can be scaled!)
* `perplayer`: if this is true the amount will be scaled with the amount of players present
* `perchunk`: if this is true the amount will be scaled with the amount of loaded chunks divided by 289 (this is how vanilla mobcap works)
* `mod`: if this is set all mobs of a given mod are counted (can be used in combination with hostile, passive, or all)
* `hostile`: if this is set all hostile mobs are counted
* `passive`: if this is set all passive mobs are counted
* `all`: if this is set all mobs are counted
* `mob`: this is a single mob or a list of mobs. If this is present only those mobs are counted

It's important to note that what is being counted depends on what you specify
in the `mincount` or `maxcount` json. If you don't specify`mod`, `hostile`, `passive`,
`all`, or `mob` then it will count the number of mobs of the same type as the mob
that is being spawned. 

However, as soon as you specify any of those keywords it will count what you
specify. For example if you specify a skeleton mob inside the `mincount` block then
it will count skeletons even if the counter is being used in a rule that spawns zombies.

#### Mob Counter Examples

In `spawn.json`: deny skeletons if there are already more then 50 hostile mobs present per player:

```json title="spawn.json"
  {
    "dimension": "minecraft:overworld",
    "mob": "minecraft:skeleton",
    "mincount": {
      "amount": 50,
      "hostile": true,
      "perplayer": true
    },
    "result": "deny"
  }
```

In `spawn.json`: deny all mobs of a given mod if there are already more than 50 mods of that mod present, scaled based on vanilla mob cap rules:

```json title="spawn.json"
  {
    "dimension": "minecraft:overworld",
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
    "dimension": "minecraft:overworld",
    "mod": "horriblecreatures",
    "mincount": 50,
    "result": "deny"
  }
```

### Conditions

* Table with all possible conditions [this page](./control-mods-20-table.md)

### Actions

In this section all the actions per rule type are listed.

The following actions are possible in all rules:

* `setphase`: this is a string representing a phase that will be set
* `clearphase`: this is a string representing a phase that will be cleared
* `togglephase`: this is a string representing a phase that will be toggled
* `changenumber`: this is a string representing a change for a number. See the number system section for more information
* `customevent`: this is a string representing a custom event that will be fired. See the event system section for more information

#### Spawn and SummonAid

For `spawn.json` the following actions are supported:

* `result`: this is either 'deny', 'allow', 'default', or not specified. If you don't specify a result then whatever other mob control mods have decided is preserved. If you specify a result then In Control will take over (since the In Control rule will fire last). Use 'deny' to block the spawn. If 'allow' is used then the spawn will be allowed even if vanilla would normally disallow it (i.e. too much light). If 'default' is used then it is possible the spawn can still be denied if there is not enough light for example. Unless 'deny' is used then you can use any of the following actions:
* `nbt`: allows you to add NBT to a spawned mob
* `customname`: allows you to set a custom name for the spawned mob
* `healthmultiply`: this is a floating point number representing a multiplier for the maximum health of the mob that is spawned. Using 2 here for example would make the spawned mob twice as strong.
* `healthadd`: this is a floating point number that is added to the maximum health
* `healthset`: this is a floating point number that is used as the maximum health
* `speedmultiply`: this is a floating point number representing a multiplier for the speed of the mob
* `speedadd`: this is a floating point number that is added to the speed
* `speedset`: this is a floating point number that is used as the speed
* `damagemultiply`: this is a floating point number representing a multiplier for the damage that the mob does
* `damageadd`: this is a floating point number that is added to the damage
* `damageset`: this is a floating point number that is used as the damage
* `armormultiply`: this is a floating point number representing a multiplier for the armor of the mob
* `armoradd`: this is a floating point number that is added to the armor
* `armorset`: this is a floating point number that is used as the armor
* `armortoughnessmultiply`: this is a floating point number representing a multiplier for the armor toughness of the mob
* `armortoughnessadd`: this is a floating point number that is added to the armor toughness
* `armortoughnessset`: this is a floating point number that is used as the armor toughness
* `attackspeedmultiply`: this is a floating point number representing a multiplier for the speed of the mob
* `attackspeedadd`: this is a floating point number that is added to the speed
* `attackspeedset`: this is a floating point number that is used as the speed
* `followrangemultiply`: this is a floating point number representing a multiplier for the follow range of the mob
* `followrangeadd`: this is a floating point number that is added to the follow range
* `followrangeset`: this is a floating point number that is used as the follow range
* `knockbackmultiply`: this is a floating point number representing a multiplier for the knockback resistance of the mob
* `knockbackadd`: this is a floating point number that is added to the knockback resistance
* `knockbackset`: this is a floating point number that is used as the knockback resistance
* `knockbackresistancemultiply`: this is a floating point number representing a multiplier for the knockback resistance of the mob
* `knockbackresistanceadd`: this is a floating point number that is added to the knockback resistance
* `knockbackresistanceset`: this is a floating point number that is used as the knockback resistance
* `angry`: this is a boolean that indicates if the mob will be angry at and/or target the nearest player. For zombie pigman this will make them angry at the player immediatelly. Same for enderman and wolves
* `potion`: this is either a single string or a list of strings. Every string represents a potion effect which is indicated like this: `<potion>,<duration>,<amplifier>`. For example "minecraft:invisibility,10,1"
* `potionnoparticles`: same as 'potion' but without particles
* `helditem`: this is either a single string or a list of strings. Every string represents a possible item that the spawned mob will carry in its hand. This works only with mobs that allow this like skeletons and zombies. You can also specify a weight with this by adding `<number>=` in front of the string. Like this: "1=minecraft:diamond_sword", "2=minecraft:iron_sword"
* `armorboots`: this is either a single string or a list of strings representing random armor that the spawned mob will wear
* `armorhelmet`: is either a single string or a list of strings representing random armor that the spawned mob will wear
* `armorlegs`: is either a single string or a list of strings representing random armor that the spawned mob will wear
* `armorchest`: is either a single string or a list of strings representing random armor that the spawned mob will wear
* `ai`: this is a json describing how the ai of the mob should be modified when it spawns. See below for more information on the AI system

In addition, `gamestage`, `playerhelditem`, and related tags (which are tied to a player) are also supported.
In that case the nearest player will be used as the basis for deciding the rule.

#### Loot Control

In contrast with most other rule files every rule is evaluated every time. i.e. a successful loot rule doesn't prevent the other loot rules from firing.
Loot supports the following actions:

* `item`: this is a string or a list of strings representing new loot that will be dropped
* `itemcount`: this is a string representing how many items should drop (optionally depending on looting level). For example: `5/7-10/20-30` will drop `5` items at looting `0`, `7-10` items at looting `1` and `20-30` items at looting `2` or beyond
* `nbt`: this is a JSON specifying the NBT that will be used for the loot items
* `remove`: this is a string or a list of strings representing items to remove from the loot
* `removeall`: if this is present then all items will be removed from the loot (before new items are added by this rule)

#### Experience

This is similar to loot control except that it controls how much experience you get from killing a mob.
All keywords from loot control can be used here except the ones that are about damage type (magic, explosion, ...) as that information is not present in this event.
There are four outputs that work for these rules:

* `result`: set this to 'deny' to not give any experience at all
* `setxp`: set a fixed XP instead of the default one
* `multxp`: multiply the normal XP with this number
* `addxp`: after multiplying the normal XP add this amount to the final XP

#### Effects

With effects, you can specify an additional `timeout` keyword in the rule.
This represents the number of ticks that will be waited before testing the rule again.
Keep in mind that some of these rules can be expensive so using a higher timeout will make the rule fire less frequently.

Then there are a number of actions:

* `explosion`: this is a string as follows: `<strength>,<flaming>,<smoking>`. For example `10,true,true` and it will cause an explosion with the given strength
* `setblock`: this is a JSON with a block description to place: `{ 'block': 'minecraft:chest', 'properties': { 'name': 'facing', 'value': 'west' } }`
* `give`: this is either a single string or a list of strings. Every string represents a possible item that the player will get. You can also specify a weight with this by adding `<number>=` in front of the string. Like this: `1=minecraft:diamond_sword`, `2=minecraft:iron_sword`
* `drop`: this is either a single string or a list of strings. Every string represents a possible item that will be dropped. You can also specify a weight with this by adding `<number>=` in front of the string. Like this: `1=minecraft:diamond_sword`, `2=minecraft:iron_sword`
* `potion`: this is either a single string or a list of strings. Every string represents a potion effect which is indicated like this: `<potion>,<duration>,<amplifier>`. For example `minecraft:invisibility,10,1`
* `potionnoparticles`: same as 'potion' but without particles
* `fire`: this is an integer representing the number of seconds that the player should be put on fire
* `clear`: clear all potion effects
* `message`: give a message to the player
* `damage`: this is a string with a damage source name followed by an amount of damage. For example `fall=1.0` which would give `1.0` fall damage. All vanilla damage sources are supported (like 'inFire', 'lightningBolt', 'lava', 'cramming', outOfWorld', 'magic', ...)
* `setstate`: if EnigmaScript is present this can be used to set a state with a string like this `state=value`
* `setpstate`: if EnigmaScript is present this can be used to set a player state with a string like this `state=value`
* `command`: this is a string representing a command that will be executed. The @p will be replaced with the player name. For example `give @p minecraft:diamond_sword`
* `addstage`: this is a string representing a game stage that will be added to the player
* `removestage`: this is a string representing a game stage that will be removed from the player

#### Break and Place

There is no `timeout` keyword here.
In addition to the actions that you can do for effects this also has a `result` output which can be `allow` or `deny`.
Note that (in contrast with `spawn.json`) the other actions are still executed even if the rule says `deny`!

#### Left click and Right click

There is no `timeout` keyword here.
In addition to the actions that you can do for effects this also has a `result` output which can be `allow` or `deny`.
Note that (in contrast with `spawn.json`) the other actions are still executed even if the rule says `deny`!

## Phase System

The phase system allows you to define global conditions and give them a name.
In Control rules can then use these phases so that they are only active if one or more phases are active.
This is much more efficient as the global conditions are evaluated once every 10 ticks as opposed to every time a mob tries to spawn.
In addition, it is much cleaner. Phases only work with a limited set of conditions (only conditions that are globally true):

* `time`, `mintime` and `maxtime`
* `daycount`, `mindaycount` and `maxdaycount`
* `weather`
* `winter`, `summer`, `spring`, and `autumn`
* `state`

Since 1.20.1 it is now also possible to set phases from `spawn.json` or some other rule files. Note that these phases should be separate
from the phases defined in `phases.json` because otherwise setting them will have no effect.

## AI System

Using 'spawn.json' it is now possible to modify the ai of mobs using the 'ai' keyword. This keywords needs a json with two possible values:

* 'targets': list of targets
* 'goals': list of goals

Goals and targets have the same structure. It's a json with the following possible attributes:

* 'removeall': if this is present (value doesn't matter) then the targets or goals are first cleared. This will remove all existing targets or goals from a spawned mob
* 'priority': except if 'removeall' is given, this is required and indicates the priority of the goal or target
* 'goal': except if 'removeall' is given, this is required and indicates the name of the goal or target. The following are currently supported:
  * 'look_at_player': attributes: 'lookdistance', 'probability', 'onlyhorizontal'
  * 'hurt_by_target': attributes: none
  * 'nearest_attackable_target': attributes: 'mustsee', 'mustreach', 'randominterval'
  * 'melee_attack': attributes: 'speed', 'followingtarget'
  * 'random_look_around': attributes: none
  * 'avoid_entity_goal': attributes: 'entity', 'maxdistance', 'walkspeedmodifier', 'sprintspeedmodifier', 'onlyWhenTargeting'

## Number System

The number system is similar to the phase system in that it is also state that is remembered by In Control and
that can be used in various places (rules, spawner, event system) to conditionally allow or disallow the
execution of a rule. Numbers are basically integers with a name and a value. The value can be changed by
various systems (like the 'changenumber' action in a rule or the 'number' action in an event).

When a number is used as a condition (either in a rule or in a condition for an event) then it is a JSON
object with the following keys:

* `name`: the name of the number
* `expression`: an expression in which the number will be used. See the numeric expression section higher up in this wiki for more information

For example. Here is a condition that tests if a number is larger then 10:

```json
{
  "name": "counter",
  "expression": "gt(10)"
}
```

When a number is set to a value (either in a rule or in an action for an event) then it is a string
which basically represents a series of operators and operands. Examples are the best way to explain this.

In case of a rule (like `spawn.json`):

Add 1 to a number called `counter`:

```json
{
  ...
  "changenumber": "counter=+1"
}
```

Or from events. Here we set a specific number to a constant value:

```json
{
  "name": "counter",
  "value": "10"
}
```

Increase the number with 1:

```json
{
  "name": "counter",
  "value": "+1"
}
```

Multiply the number with 2 and subtract 1:

```json
{
  "name": "counter",
  "value": "*2-1"
}
```




## Areas

Areas are defined in `areas.json` and can be used in various rules like `spawn.json`. There are two types of areas: `box` and `sphere`.
Check the example below to see how you can define an area. You can also use the `incontrol area` command to see if you are in an area in game.

Areas support the following keywords. All of these are required:

* 'dimension': the dimension defining the area
* 'name': the name of the area
* 'type': the type of the area. Can be 'box', 'sphere', or 'cylinder'
* 'x', 'y', 'z': the center of the area
* 'dimx', 'dimy', 'dimz': the size of the area

## Events

Events are a new powerful system that allows you to spawn mobs when something happens. Currently the `block_broken`, `mob_killed`, `command`, and `custom` events are supported.

Events are defined in `events.json` and have the following structure:

* `on`: this is a string representing the event that will trigger this event. Currently the following events are supported:
  * `block_broken`: this event is triggered when a block is broken
  * `mob_killed`: this event is triggered when a mob is killed
  * `custom`: this is a custom event as fired from any rule where `customevent` is used
* `parameters`: this is a JSON object with parameters that are specific to the event. See below for more information.
* `conditions`: this is a JSON object with generic conditions. The following keys are supported:
  * `dimension`: this is a string or a list of strings representing the dimension(s) in which the event will trigger
  * `random`: this is a floating point number between `0` and `1` representing the chance that the event will trigger
  * `phase`: this is a string or a list of strings representing the phase(s) that must be active for the event to trigger
  * `number`: this is a json object (or a list) with two keys:
      * `name`: the name of the number to test
      * `expression`: an expression in which the number will be used. See the numeric expression section higher up in this wiki for more information
* `spawn`: this is an optional JSON object with the following structure:
  * `mob`: this is a string or a list of strings representing the mob(s) that will be spawned
  * `mincount`/`maxcount`: the minimum/maximum amount of mobs to spawn. Default is 1 for both
  * `mindistance`/`maxdistance`: the minimum/maximum distance from the event to spawn the mob
  * `attempts`: the number of attempts to spawn the mob. Default is 10
  * `norestrictions`: if this is true then the mob specific restrictions on spawning are ignored
* `phase`: this is an optional JSON object with the following structure:
  * `set`: this is a boolean indicating if the phase(s) will be set. If this is not specified then it is assumed to be true
  * `names`: this is a string or a list of strings representing the phase(s) that will be set or cleared
* `number`: this is an optional JSON object with the following structure:
  * `name`: the name of the number to change
  * `value`: this is a value in a special format. See below for more information
* `command`: this is an optional JSON array of strings representing commands that will be executed when the event is triggered. The @p will be replaced with the player name if applicable

The value as used in the number action is a string which basically represents a series of operators
and operands. This is explained in the section about numbers above.


Mobs spawned through this system will still go through `spawn.json` and can be distinguished with the `eventspawn` tag.

The `mob_killed` event supports the following parameters:

* `mob`: this is a string or a list of strings for the mob to detect
* `player`: this is a boolean indicating if the player should be the one that kills the mob

The `block_broken` event supports the following parameters:

* `block`: this is a json object for the block that has to be broken

See the examples below on how to use this.

The `custom` event supports the following parameters:

* `name`: this is a string representing the name of the custom event

## Custom Spawner System (spawner.json)

Starting with 1.16 In Control supports a new spawning system that replaces the potentialspawn system.
Rules of this type are put in `spawner.json`.
Every rule in this file represents an option for one of more mobs to spawn under certain circumstances.
The spawning system works per dimension and only attempts to spawn mobs every second.

:::danger Warning
Warning! `spawner.json` only supports the keywords mentioned here.
Don't use ANY other keyword here.
Some conditions (like biome) are supported through the new 'and' and 'not' keywords (see below)
:::

Every spawner rule has two parts:

* A part describing what will be spawned and how often the rule will fire
* A part describing conditions for spawning

The following JSON keys are possible in the root of every rule:

* `phase`: a string or list of strings representing all phases that must be active for this rule to work
* `number`: a JSON object or a list of JSON objects containing a 'name' and 'expression' key. This is a numeric expression that will be evaluated and if it is true then the rule will work. See the numeric expression section higher up in this wiki for more information
* `mob`: a single mob or list of mobs (like 'minecraft:zombie'). The entire rule will be evalulated for every mob specified in this list. This is a required setting. A mob can also be specified with a json containing the following keys:
  * 'mob': the name of the mob. If this is 'customnpcs:customnpc' then the mob will be a CustomNPC and the following two keywords are also used:
  * 'cloneTab'
  * 'cloneName'
* `weights`: an optional list of weights which will be used in combination with the mobs specified by 'mob'. By using weights you can give some spawns more importance
* `mobsfrombiome`: this is a string that can be equal to 'monster', 'creature', 'ambient', 'water_creature', 'water_ambient', or 'misc'. Use this instead of specifying 'mob' manually. This will let the spawn take a random mob (given weight) that is valid for the current biome
* `addscoreboardtags`: this is string or list of strings that can be used to add scoreboard tags to the spawned entity
* `attempts`: the number of times In Control will attempt to find a good position to spawn the mob. By default, this is 1. Note, for good results you typically want at least 20 for this value
* `persecond`: a floating point number indicating the chance of this rule firing. If this is 0.5 then there is 50% chance that this rule will spawn a mob (meaning that on average it will fire every 2 seconds). The default of this value is 1 (which means the rules fire onces per second). The maximum is also 1
* `amount`: a JSON object containing a 'minimum', 'maximum' and an optional 'groupdistance'. This is the number of mobs that the spawnwer will attempt to spawn at once. The default is 1 for both. If 'groupdistance' is set then these mobs will spawn in groups (near each other). Note that 'groupdistance' is only for 1.18 and higher
* `conditions`: a JSON object containing a set of conditions (see below)

The following JSON keys are possible in the conditions block (and ONLY those, for other conditions combine with regular spawn rules):

:::danger Warning
Warning! Don't depend on the defaults here! Best is to specify all the conditions so you're sure things are allright.
Especially 'dimension' since that is mandatory!
:::

* `dimension`: a single dimension or list of dimensions (like 'minecraft:overworld'). This is required. If you don't specify any dimensions then nothing will happen
* `mindaycount` and `maxdaycount`: the minimum/maximum daycount to allow this rule to work
* `mindist` and `maxdist`: the minimum/maximum distance to the player for controlling the spawn. By default, this is equal to 24/120.
* `minverticaldist` and `maxverticaldist`: the minimum/maximum vertical distance to the player for controlling the spawn.
* `minheight` and `maxheight`: the minimum/maximum height of the spawn. By default, this is 1/256
* `norestrictions`: remove the mob specific (usually light related) restrictions on spawning and also prevent 'position' spawn events from firing
* `inliquid`: if true then allow spawning in any liquid (this will ignore the mob specific restrictions it might have on spawning in liquids)
* `inwater`: if true then allow spawning in water (this will ignore the mob specific restrictions it might have on spawning in liquids)
* `inlava`: if true then allow spawning in lava (this will ignore the mob specific restrictions it might have on spawning in liquids)
* `inair`: if true then allow spawning in the air
* `maxthis`: the maximum amount of mobs of the given type
* `maxtotal`: the maximum amount of mobs total
* `maxpeaceful`: the maximum amount of passive mobs
* `maxhostile`: the maximum amount of hostile mobs
* `maxneutral`: the maximum amount of neutral mobs
* `maxlocal`: this will cause counting in the spawn box around the player. This is somewhat more expensive so use with care
* `validspawn`: this will add a stronger check to the possible spawn positions to make sure the block is solid as well as correct light and other mob/block specific conditions.
* `sturdy`: this will add a stronger check to the possible spawn positions to make sure the block is sturdy (not a slab for example)
* `and`: an additional set of positive conditions that all have to be valid before the spawn can happen. See below for a list of conditions
* `not`: an additional set of negative conditions. If one of those is true the spawn will not happen. See below for a list of conditions

Using conditions in `and` and `not` is a preferred as opposed to doing this in `spawn.json` because it's more optimized. 
Supported conditions in 'and' and 'not':

* `mintime` and  `maxtime`: time constraints. The time is in ticks (0-24000). The default is 0/24000
* `minlight` and `maxlight`: the minimum/maximum block light level for the spawn. The default is 0/15
* `minlight_sky` and `maxlight_sky`: the minimum/maximum sky level for the spawn. The default is 0/15
* `minlight_full` and `maxlight_full`: the minimum/maximum light level for the spawn (including sky level). The default is 0/15
* `biome`: a single biome or list of biomes (like 'minecraft:plains')
* `biometags`: a single biome tag or list of biome tags (like 'minecraft:is_hill')
* `seesky`: if true then the spawn position must be able to see the sky
* `cave`: if true then the spawn position must be in a cave
* `structure`: a single structure or list of structures (like 'minecraft:stronghold')
* `structuretags`: a single structure tag or list of structure tags (like 'minecraft:is_village')
* `hasstructure`: if true then the spawn position must be in a structure
* `incity`: if true then the spawn position must be in a city
* `inbuilding`: if true then the spawn position must be in a building
* `inmultibuilding`: if true then the spawn position must be in a multibuilding
* `building`: a single building or list of buildings (like 'lostcities:building1')
* `multibuilding`: a single multibuilding or list of multibuildings (like 'lostcities:multibuilding1')
* `instreet`: if true then the spawn position must be in a street
* `insphere`: if true then the spawn position must be in a sphere
* `gamestage`: a gamestage condition
* `summer`: if true then it must be summer
* `winter`: if true then it must be winter
* `spring`: if true then it must be spring
* `autumn`: if true then it must be autumn

## Examples

* An extensive list of examples can be found at [this page](./control-mods-20-examples.md)
