# Control Mods New (1.20+)

## Introduction

:::info Note
FxControl no longer exists on 1.20. It's functionality has been merged into InControl
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

* Q: Why can't I seem to control mobs from mod 'X' using `spawn.json`?
    * A: Occasionally modded mobs don't follow the rules completely. It may help in such situations to use `'when': 'onjoin'` in your rule

* Q: I added a rule to spawn.json to allow a mod but nothing is happening. Why is that?
    * A: 'Allow' is standard. With `spawn.json` you can only restrict spawns that were already happening. If you want to add more spawns you'll have to add rules to `spawner.json` (possibly refined with rules in `spawn.json`)
    * A: Having only 'allow' rules in `spawn.json` is (usually) pretty useless as those mobs will spawn anyway (exceptions are if you want to boost mobs). Typically, you want to have 'deny' rules

* Q: I'm trying /summon and spawn eggs but my rules don't seem to work?
    * A: In Control only affects natural spawns and spawns done by mob spawners. Eggs and /summon is not affected

* Q: How can I get zombies to spawn more often?
    * A: This question is asked so much that it really is considered a FAQ. As I already told you above you can't add spawns using spawn.json alone. You need to add a rule to `spawner.json` and possibly set conditions in `spawn.json`. See the examples at the bottom of this wiki. 

## Differences between the 1.20 version and older

In 1.20 InControl was changed heavily due to some new spawning events in Forge. In addition FxControl has been removed and
has been merged into InControl.

The following changes were made:

* There is a new keyword for 'spawn.json' called 'when'. This flag determines when the spawn check will occur. See the documentation later in this wiki.
* 'special.json' has been removed. It's functionality has been merged into 'spawn.json' by using the new 'when' field with the 'finalize' value
* The 'onjoin' keyword has been removed. It's functionality has been merged into 'spawn.json' by using the new 'when' field with the 'onjoin' value


## Changelogs

Here is a list of all (recent and important) changes to InControl and Fx Control:

* **9 Jul 2023:**
  * In Control for 1.20 works differently then previous versions. "onjoin" is gone. Instead there is now "when" with four possible values 'position', 'onjoin', 'finalize', and 'despawn'
  * The 'special.json' file is gone. Instead you can now use 'spawn.json' for all your needs. Using 'when' at finalize you can now control the equipment and stats of mobs
  * Merged all FxControl functionality into InControl
* **1 Jul 2023:**
  * Added 'minlight_full' and 'maxlight_full' keywords. These are similar to 'minlight' and 'maxlight' but they will test the full light level (including the sky light level). 'minlight' and 'maxlight' only test block light level
* **10 May 2023:**
  * New 'addscoreboardtags' keyword for spawner.json and spawn.json. With this you can add scoreboard tags on each entity spawned by this rule
  * New 'scoreboardtags_all' and 'scoreboardtags_any' conditions for spawn, experience, loot, special, and summonaid. These will test if all or any of the given tags are present on the entity
  * New 'nodespawn' action for spawn, special, and summonaid. This will prevent the mob from despawning
  * New 'time', 'height', and 'light' keywords which are supported wherever the corresponding min/max versions are supported. Using these keywords you can do more precise testing on the specific values. The wiki will contain more documentation on this
  * The 'daycount' keyword now also supports this new expression syntax. Using this you can now do things like: 'spawn zombies for two days every 10 days and spawn creepers for one day in the same cycle'
  * Added new 'minverticaldist' and 'maxverticaldist' keywords to the spawner system. These will allow you to specify a vertical distance between the spawner and the spawn position
  * The spawner system will now fail if no dimensions are specified (as it should, it's not optional)
* **30 April 2023:**
  * Added new 'building' keyword that you can use to test as a condition. This will allow testing if (for example) a spawn is in a certain list of buildings
* **28 April 2023:**
  * Added support for the 'tag' keyword in a block description (in favor of the old and non functional 'ore' keyword)
* **7 Feb 2023:**
  * Added new 'validspawn' and 'sturdy' conditions to the spawner system. This avoids spawning mobs on slabs for example


## Commands

These mods have various commands that allow you to debug and tweak what is going on:

* `incontrol reload (In Control)`: after editing the rule files you can use this command to reload it and reapply the new rules
* `incontrol debug (In Control)`: dumps debug info about spawning in the log. Warning! This can produce a lot of output
* `incontrol show (In Control)`: show all entities and their names that can be used in spawn.json for mob names
* `incontrol kill (In Control)`: kill all entities of a given type. Possible types are: 'all', 'hostile', 'passive', or 'entity'. It is also possible to give the name of an entity instead of a type (like 'minecraft:enderman'). There is also an optional extra parameter for a dimension ID
* `incontrol list (In Control)`: list all current mobs present in the current dimension (and how many there are of each type)
* `incontrol days (In Control)`: without parameters it shows the current day. You can also change the current day using this command
* `incontrol phases (In Control)`: this shows all currently active phases

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

### spawn.json

With this rule file you can control various aspects of when a mob should spawn (or despawn). Note that
you cannot use this file to add new mobs to the game. For that you need to use `spawner.json` too.

Rules in this file are essentially split into four different categories:
* `position`: this is used to check if a mob is allowed to spawn in general. It's called by vanilla whenever a mob is about to spawn
* `onjoin`: rules in this category are checked whenever a mob joins the world. This is a stronger check because it's also fired for spawn eggs and when a mob enters another dimension
* `finalize`: this is the final step in spawning a mob. Rules in this category can change stats or equipment of the mob. You can also still cancel the spawn here
* `despawn`: this is called whenever a mob is about to despawn. You can use this to prevent despawning

The category of a spawn rule is set with the new `when` keyword. This keyword is optional and defaults to `position`.

Some additional notes about spawn.json. Each rule has a result which can be `allow`, `default`, or `deny`.
In case of `deny` the spawn will simply be canceled. The difference between `allow` and `default` is that with `default`
some simple vanilla spawn restrictions (like not spawn inside a block) are still tested. When `when`
is equal to `finalize` then the difference between `default` and `allow` is that `default` will still let
the vanilla finalize operation do its job (for example, skeletons will still get their bow). If you
use `allow` then only your own actions will be executed.

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

## Expressions

In some of the conditions it is possible to use expressions.
An expression is basically a string specifying some test to do on an integer value.

Here are a few examples:
* `>10`: evaluate to true if the number we are testing on is greater than 10
* `!=10`: evaluate to true if it is different from 10
* `4-50`: evaluate to true if the number is between 4 and 50 (inclusive)
* `10`: evaluate to true if the number is equal to 10

The following comparators are supported: `>`, `>=`, `<`, `<=`, `=`, and `!=`.

## Numeric Expressions

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

## Item filters

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

## Block Filters

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

## Mob Counter

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

### Mob Counter Examples

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

## Conditions

In this section all possible conditions are explained.
Some conditions are not usable in all rules.
This will be mentioned here.
Whenever a position is tested in a rule the given position depends on the rule.
For mob spawns this will be the position where the mob will spawn.
For block break events this will be the position of the broken block.
For player effects this is the position of the block on which the player is standing.

Possible types:
* `S`: a string
* `B`: a boolean (true/false)
* `I`: an integer
* `F`: floating point number
* `E`: is a string describing a numeric expression (see above for information on those)
* `[<type>]`: a list of type (for example, `[S]` is a list of strings)
* `JSON`: a JSON in a specific format explained elsewhere

:::info
The table below is very wide.
Please scroll horizontally to see all fields.
:::

| Name                                                                  | Type         | spawner | spawn | summon | loot | exp | harvest | leftclick | rightclick | place | effect | Description                                                                                                                                                                                                                                                                                                                                                                                           |
|-----------------------------------------------------------------------|--------------|---------|-------|--------|------|-----|---------|-----------|------------|-------|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| phase                                                                 | `S/[S]`      | V       | V     | V      |      |     |         |           |            |       |        | all phases that must be active for this rule to work. Phases are defined in `phases.json`. Putting conditions in a phase is more efficient and cleaner                                                                                                                                                                                                                                                |
| when                                                                  | `S`          |         | V     |        |      |     |         |           |            |       |        | can be equal to 'position', 'finalize', 'onjoin', or 'despawn'. Default is 'position'                                                                                                                                                                                                                                                                                                                 |
| mindaycount / maxdaycount                                             | `I`          | V       | V     | V      |      |     |         |           |            |       |        | indicate the minimum (inclusive) or maximum day count. The day counter starts at `0` (see the `days` command)                                                                                                                                                                                                                                                                                         |
| daycount                                                              | `I/E`        | V       | V     | V      |      |     |         |           |            |       |        | this is true if the day counter is a multiple of the given parameter. It also supports an expression in which case the expression is evaluated (see more on numeric expressions above in this wiki)                                                                                                                                                                                                   |
| baby                                                                  | `B`          |         | V     |        | V    | V   |         |           |            |       |        | true if this is a baby                                                                                                                                                                                                                                                                                                                                                                                |
| spawner                                                               | `B`          |         | V     |        |      |     |         |           |            |       |        | true if spawned by a spawner                                                                                                                                                                                                                                                                                                                                                                          |
| incontrol                                                             | `B`          |         | V     |        |      |     |         |           |            |       |        | true if spawned by the new In Control spawner system (`spawner.json`)                                                                                                                                                                                                                                                                                                                                 |
| minheight / maxheight                                                 | `I`          | V       | V     | V      | V    | V   | V       | V         | V          | V     | V      | indicates the minimum (inclusive) or maximum height at which this rule will fire                                                                                                                                                                                                                                                                                                                      |
| height                                                                | `E`          | V       | V     | V      | V    | V   | V       | V         | V          | V     | V      | uses a numeric expression to test the height at which the mob will spawn                                                                                                                                                                                                                                                                                                                              |
| minlight / maxlight                                                   | `I`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | value between `0` and `15` indicating the minimum and maximum block light level on the given block                                                                                                                                                                                                                                                                                                    |
| minlight_full / maxlight_full                                         | `I`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | value between `0` and `15` indicating the minimum and maximum full (combined block and sky) light level on the given block                                                                                                                                                                                                                                                                            |
| light                                                                 | `E`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | uses a numeric expression to test the light level on the given block                                                                                                                                                                                                                                                                                                                                  |
| mincount / maxcount                                                   | `S/I/JSON`   |         | V     | V      |      |     |         |           |            |       |        | string value that is either a number in which case it will count how many mobs of the given class are already in the world or else of the form `<amount>,<mob>` to count the number of mobs of that type. That way you can have a rule file based on the number of mobs already present. Note that instead of this syntax you can also use the JSON mob counter syntax as explained above             |
| maxthis / maxtotal / maxpeaceful / maxhostile / maxneutral / maxlocal | `I`          | V       |       |        |      |     |         |           |            |       |        | the maximum amount of mobs of this type, in total, passive, hostile, neutral or local (spawn box around the player, as this is more expensive use this with care)                                                                                                                                                                                                                                     |
| minspawndist / maxspawndist                                           | `F`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | the minimum or maximum distance (in minecraft units) to the spawn point in the world                                                                                                                                                                                                                                                                                                                  |
| mintime / maxtime                                                     | `I`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | the time of the day (a number between `0` and `23999`)                                                                                                                                                                                                                                                                                                                                                |
| time                                                                  | `E`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | uses a numeric expression to test the time of the day (see the numeric expression section higher up in this wiki)                                                                                                                                                                                                                                                                                     |
| mindifficulty / maxdifficulty                                         | `F`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | the local difficulty of the place where the mob will spawn. This is a number between `0` and `4`                                                                                                                                                                                                                                                                                                      |
| mindist / maxdist                                                     | `I`          | V       |       |        |      |     |         |           |            |       | V?     | the minimum/maximum distance to the player for controlling the spawn. By default this is equal to `24/120`                                                                                                                                                                                                                                                                                            |
| minverticaldist / maxverticaldist                                     | `I`          | V       |       |        |      |     |         |           |            |       |        | if specified you can use this to test for the vertical distance between the player and the position where the mob will spawn                                                                                                                                                                                                                                                                          |
| canspawnhere                                                          | `B`          |         | V     |        |      |     |         |           |            |       |        | a check that is specific to the entity implementation. This is called by Minecraft automatically if you return `default` as the result of this rule. For many mobs this check will do the standard light level check                                                                                                                                                                                  |
| norestrictions                                                        | `B`          | V       |       |        |      |     |         |           |            |       |        | remove the mob specific (usually light related) restrictions on spawning                                                                                                                                                                                                                                                                                                                              |
| inliquid / inwater / inlava / inair                                   | `B`          | V       |       |        |      |     |         |           |            |       |        | allow spawning in any liquid, water, lava, or in air. This will ignore the mob specific restrictions it might have on spawning                                                                                                                                                                                                                                                                        |
| isnotcolliding                                                        | `B`          |         | V     |        |      |     |         |           |            |       |        | a check that is specific to the entity implementation. This is called by Minecraft automatically if you return `default` as the result of this rule. For many mobs this check will do a test if the mob would collide with blocks after spawning                                                                                                                                                      |
| difficulty                                                            | `S`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | one of the following values: easy, normal, hard, peaceful                                                                                                                                                                                                                                                                                                                                             |
| weather                                                               | `S`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | rain or thunder                                                                                                                                                                                                                                                                                                                                                                                       |
| category                                                              | `S/[S]`      |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | NOT for 1.19! One of the following values: none, taiga, extreme_hills, jungle, mesa, plains, savanna, icy, the_end, beach, forest, ocean, desert, river, swamp, mushroom, nether. This represents the category of the current biome                                                                                                                                                                   |
| biometags                                                             | `S/[S]`      |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | ONLY for 1.19! This is a biome tag (or list of tags) which will be used to match with the biome. Example tags are: `minecraft:is_ocean`, `minecraft:is_hill`, `minecraft:has_structure/igloo`, `minecraft:allows_surface_slime_spawns`, `forge:is_hot`, `forge:is_cold`, `forge:is_wet`, ... and a LOT more                                                                                           |
| hostile / passive                                                     | `B`          |         | V     | V      | V    | V   |         |           |            |       |        | matching only hostile or passive mobs                                                                                                                                                                                                                                                                                                                                                                 |
| seesky                                                                | `B`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | true if the block can see the sky (not in a cave)                                                                                                                                                                                                                                                                                                                                                     |
| slime                                                                 | `B`          |         | V     | V      |      |     |         |           |            |       |        | true if this is a slime chunk (only for 1.18 or higher)                                                                                                                                                                                                                                                                                                                                               |
| structure                                                             | `S`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | the name of the structure to test for. This way you can make sure a rule only fires in a village for example. Some examples are `minecraft:mineshaft`, `minecraft:village`, and so on. Modded structures should also work                                                                                                                                                                             |
| mob                                                                   | `S/[S]`      |         | V     | V      | V    | V   |         |           |            |       |        | an ID for a mob like `minecraft:creeper` and so on. Modded mobs should also work                                                                                                                                                                                                                                                                                                                      |
| mod                                                                   | `S/[S]`      |         | V     | V      | V    | V   |         | V         | V          |       |        | a mod id. By using this you can block spawns of mobs that belong to some mod. Use `minecraft` for vanilla mobs                                                                                                                                                                                                                                                                                        |
| block                                                                 | `S/[S]/JSON` |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | a block filter as explained above                                                                                                                                                                                                                                                                                                                                                                     |
| blockoffset                                                           | `JSON`       |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | modify the position of the block that is being used by the block test (or the setblock action). This JSON can contain tags like `x`, `y`, or `z` which will be added (as offset) to the original block position or else the boolean tag look in which case the position will be the position the player is looking at (only in case there is a player involved which isn't the case for `spawn.json`) |
| biome                                                                 | `S/[S]`      |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | the biome of the current block (like `minecraft:plains` for example)                                                                                                                                                                                                                                                                                                                                  |
| biometype                                                             | `S/[S]`      |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | the biome type (from the biome dictionary). Examples are `WARN`, `COLD`, `ICY`, `DESERT`, and `DESERT_LEGACY`                                                                                                                                                                                                                                                                                         |
| dimension                                                             | `S/[S]`      | V       | V     | V      | V    | V   | V       | V         | V          | V     | V      | the dimension of the current block or player (for example `minecraft:overworld`)                                                                                                                                                                                                                                                                                                                      |
| dimensionmod                                                          | `S/[S]`      |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | the mod of the dimension. You can use this to have a rule work in all dimensions from a given mod                                                                                                                                                                                                                                                                                                     |
| random                                                                | `F`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | this will succeed rule if a random number is less then this number. So if you want to have a rule that fires with `10%`chance then use `0.1` here                                                                                                                                                                                                                                                     |
| player / fakeplayer / realplayer                                      | `B`          |         |       |        | V    | V   |         |           |            |       |        | indicating if the mob was killed by a player (fake or real), a fake player (automation that behaves like a player) and a real player                                                                                                                                                                                                                                                                  |
| projectile / explosion / magic / fire                                 | `B`          |         |       |        | V    | V   |         |           |            |       |        | indicating if the mob was killed by a projectile, explosion, magic or fire                                                                                                                                                                                                                                                                                                                            |
| source                                                                | `S/[S]`      |         |       |        | V    | V   |         |           |            |       |        | the damage source. Some sources are `minecraft:lightning_bolt`, `minecraft:lava`, `minecraft:cactus`, `minecraft:wither`, `minecraft:hot_floor`, ...                                                                                                                                                                                                                   |
| playerhelditem / offhanditem / bothhandsitem                          | `S/[S]/JSON` |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | a representation of the item(s) that the player is holding in their main hand (or offhand). Use a correct item filter (or list of item filters)                                                                                                                                                                                                                                                       |
| lackhelditem / lackoffhanditem                                        | `S/[S]/JSON` |         |       |        |      |     | V       | V         | V          | V     | V      | a representation of the item(s) that the player is not holding in their main hand (or offhand). Use a correct item filter (or list of item filters)                                                                                                                                                                                                                                                   |
| helmet / chestplate / leggings / boots                                | `S/[S]/JSON` |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | a representation of the item(s) that the player is having as armor. Use a correct item filter (or list of item filters)                                                                                                                                                                                                                                                                               |
| lackhelmet / lackchestplate / lackleggings / lackboots                | `S/[S]/JSON` |         |       |        |      |     | V       | V         | V          | V     | V      | a representation of the item(s) that the player is not having as armor. Use a correct item filter (or list of item filters)                                                                                                                                                                                                                                                                           |
| addscoreboardtags                                                     | `S/[S]`      | V       | V     |        |      |     |         |           |            |       |        | add scoreboard tags to the spawned entity                                                                                                                                                                                                                                                                                                                                                             |
| scoreboardtags_all / scoreboardtags_any                               | `S/[S]`      |         | V     | V      | V    | V   |         |           |            |       |        | test for scoreboard tags on the entity (all must be there or any must be there)                                                                                                                                                                                                                                                                                                                       |
| nodespawn                                                             | `B`          |         | V     | V      |      |     |         |           |            |       |        | if this is given the mob will not despawn. Be careful with this!                                                                                                                                                                                                                                                                                                                                      |
| incity / instreet / inbuilding / insphere **(Lost Cities)**           | `B`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | check if the current position is in a city, street, building or city sphere                                                                                                                                                                                                                                                                                                                           |
| building **(Lost Cities)**                                            | `S/[S]`      |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | check if the current position is in a specific building                                                                                                                                                                                                                                                                                                                                               |
| gamestage **(Gamestages)**                                            | `S`          |         | V     |        | V    | V   | V       | V         | V          | V     | V      | the current game stage. When a player is not really present (like with spawn.json) the closest player is used                                                                                                                                                                                                                                                                                         |
| winter / summer / spring / autumn **(Serene Seasons)**                | `B`          |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | check the current season (NOT IMPLEMENTED IN 1.16)                                                                                                                                                                                                                                                                                                                                                    |
| amulet / ring / belt / trinket / charm / body / head **(Baubles)**    | `S/[S]/JSON` |         | V     | V      | V    | V   | V       | V         | V          | V     | V      | check if an item is in a bauble slot (NOT IMPLEMENTED YET IN 1.16)                                                                                                                                                                                                                                                                                                                                    |
| state / pstate **(EnigmaScript)**                                     | `S`          |         |       |        | V    | V   |         |           |            |       |        | this can be used to test the value of a (player) state with a string like this `state=value` (NOT IMPLEMENTED YET IN 1.16)                                                                                                                                                                                                                                                                            |

## Actions

In this section all the actions per rule type are listed.

### Spawn and SummonAid

For `spawn.json` the following actions are supported:

* `result`: this is either 'deny', 'allow', 'default', or not specified. If you don't specify a result then whatever other mob control mods have decided is preserved. If you specify a result then In Control will take over (since the In Control rule will fire last). Use 'deny' to block the spawn. If 'allow' is used then the spawn will be allowed even if vanilla would normally disallow it (i.e. too much light). If 'default' is used then it is possible the spawn can still be denied if there is not enough light for example. Unless 'deny' is used then you can use any of the following actions:
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
* `helditem`: this is either a single string or a list of strings. Every string represents a possible item that the spawned mob will carry in its hand. This works only with mobs that allow this like skeletons and zombies. You can also specify a weight with this by adding `<number>=` in front of the string. Like this: "1=minecraft:diamond_sword", "2=minecraft:iron_sword"
* `armorboots`: this is either a single string or a list of strings representing random armor that the spawned mob will wear
* `armorhelmet`: is either a single string or a list of strings representing random armor that the spawned mob will wear
* `armorlegs`: is either a single string or a list of strings representing random armor that the spawned mob will wear
* `armorchest`: is either a single string or a list of strings representing random armor that the spawned mob will wear

In addition, `gamestage`, `playerhelditem`, and related tags (which are tied to a player) are also supported.
In that case the nearest player will be used as the basis for deciding the rule.

### Loot Control

In contrast with most other rule files every rule is evaluated every time. i.e. a successful loot rule doesn't prevent the other loot rules from firing.
Loot supports the following actions:

* `item`: this is a string or a list of strings representing new loot that will be dropped
* `itemcount`: this is a string representing how many items should drop (optionally depending on looting level). For example: `5/7-10/20-30` will drop `5` items at looting `0`, `7-10` items at looting `1` and `20-30` items at looting `2` or beyond
* `nbt`: this is a JSON specifying the NBT that will be used for the loot items
* `remove`: this is a string or a list of strings representing items to remove from the loot
* `removeall`: if this is present then all items will be removed from the loot (before new items are added by this rule)

### Experience

This is similar to loot control except that it controls how much experience you get from killing a mob.
All keywords from loot control can be used here except the ones that are about damage type (magic, explosion, ...) as that information is not present in this event.
There are four outputs that work for these rules:

* `result`: set this to 'deny' to not give any experience at all
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
* `give`: this is either a single string or a list of strings. Every string represents a possible item that the player will get. You can also specify a weight with this by adding `<number>=` in front of the string. Like this: `1=minecraft:diamond_sword`, `2=minecraft:iron_sword`
* `drop`: this is either a single string or a list of strings. Every string represents a possible item that will be dropped. You can also specify a weight with this by adding `<number>=` in front of the string. Like this: `1=minecraft:diamond_sword`, `2=minecraft:iron_sword`
* `potion`: this is either a single string or a list of strings. Every string represents a potion effect which is indicated like this: `<potion>,<duration>,<amplifier>`. For example `minecraft:invisibility,10,1`
* `fire`: this is an integer representing the number of seconds that the player should be put on fire
* `clear`: clear all potion effects
* `message`: give a message to the player
* `damage`: this is a string with a damage source name followed by an amount of damage. For example `fall=1.0` which would give `1.0` fall damage. All vanilla damage sources are supported (like 'inFire', 'lightningBolt', 'lava', 'cramming', outOfWorld', 'magic', ...)
* `setstate`: if EnigmaScript is present this can be used to set a state with a string like this `state=value`
* `setpstate`: if EnigmaScript is present this can be used to set a player state with a string like this `state=value`
* `command`: this is a string representing a command that will be executed. The @p will be replaced with the player name. For example `give @p minecraft:diamond_sword`
* `addstage`: this is a string representing a game stage that will be added to the player
* `removestage`: this is a string representing a game stage that will be removed from the player

### Break and Place

There is no `timeout` keyword here.
In addition to the actions that you can do for effects this also has a `result` output which can be `allow` or `deny`.
Note that (in contrast with `spawn.json`) the other actions are still executed even if the rule says `deny`!

### Left click and Right click

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

## Examples

Sometimes it is best to explain things with examples.
In this section we will present many examples that you can use as a basis to make your own rules:

### Phases

Define a phase that is true if we are after day 10.
You can then use this phase in all In Control rules:

```json
[
  {
    "name": "after_day10",
    "conditions": {
        "mindaycount": 10
    }
  }
]
```

Define phases depending on a 10 day cycle and where in the cycle we are. These phases can then be used by spawner.json (for example) to spawn the correct creatures:

```json
[
  {
    "name": "zombietime",
    "conditions": {
      "daycount": "repeat(10,0,1)"
    }
  },
  {
    "name": "creepertime",
    "conditions": {
      "daycount": "repeat(10,2,3)"
    }
  },
  {
    "name": "skeletontime",
    "conditions": {
      "daycount": "repeat(10,4,5)"
    }
  }
]
```

### Spawn

Here are some examples for `spawn.json`.

This example allows only spawns in plains biomes.
All other spawns are prevented:

```json title="spawn.json"
[
  {
    "biome": "minecraft:plains",
    "result": "allow"
  },
  {
    "result": "deny"
  }
]
```

Simple script to disable spawns of a particular type of mob if there are too many (not more then 10):

```json title="spawn.json"
[
  {
    "mob": "minecraft:zombie",
    "mincount": 10,
    "result": "deny"
  }
]
```

Just prevent all zombies. Nothing else is changed:

```json title="spawn.json"
[
  {
    "mob": "minecraft:zombie",
    "result": "deny"
  }
]
```

Just prevent all zombies, even from spawners. This is a much stronger test. Nothing else is changed:

```json title="spawn.json"
[
  {
    "mob": "minecraft:zombie",
    "when": "onjoin",
    "result": "deny"
  }
]
```

This example prevents ALL passive mob spawns in a certain dimension:

```json title="spawn.json"
[
  {
    "passive": true,
    "dimension": "dimensionmod:funkydim",
    "when": "onjoin",
    "result": "deny"
  }
]
```

Only allow creepers, skeletons and passive mobs:

```json title="spawn.json"
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

```json title="spawn.json"
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

```json title="spawn.json"
[
  {
    "mob": ["minecraft:skeleton","minecraft:zombie"],
    "seesky": true,
    "when": "finalize",
    "result": "allow",
    "healthmultiply": 2,
    "damagemultiply": 2,
    "speedmultiply": 2,
    "armorhelmet": ["minecraft:iron_helmet", "minecraft:golden_helmet"]
  },
  {
    "seesky": true,
    "hostile": true,
    "when": "finalize",
    "result": "allow",
    "healthmultiply": 2,
    "damagemultiply": 2,
    "speedmultiply": 2
  },
  {
    "seesky": false,
    "random": 0.1,
    "when": "finalize",
    "mob": "minecraft:zombie",
    "result": "allow",
    "healthmultiply": 0.5,
    "potion": "minecraft:invisibility,10000,1"
  }
]
```

Make all zombies slower but have more health:

```json title="spawn.json"
[
  {
    "mob": "minecraft:zombie",
    "result": "default",
    "when": "finalize",
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

### Loot

Here are some examples for `loot.json`.

Make blazes only spawn blaze rods if they are killed by a player in a nether fortress.
The amount of blazerods will be higher if the looting level is higher:

```json title="loot.json"
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

```json title="loot.json"
[
  {
    "mob": "minecraft:wither",
    "remove": "minecraft:nether_star"
  },
  {
    "mob": "minecraft:wither",
    "player": true,
    "helditem": "minecraft:stick",
    "item": "minecraft:nether_star"
  }
]
```

In this example zombies will drop an enchanted diamond sword:

```json title="loot.json"
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
They will be put on fire if they goe to the nether, and they will get the slowness effect if they are holding a stone tool:

```json title="effects.json"
[
  {
    "timeout": 20,
    "dimension": "minecraft:overworld",
    "seesky": true,
    "potion": "minecraft:poison,21,1"
  },
  {
    "timeout": 20,
    "dimension": "minecraft:nether",
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

```json title="effects.json"
[
  {
    "timeout": 10,
    "block": {
      "block": "rftoolspower:dimensionalcell_simple",
      "energy": ">10000"
    },
    "damage": "minecraft:hot_floor=3"
  }
]
```

With this example the player will be put on fire if they even look at lava:

```json title="effects.json"
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

```json title="breakevents.json"
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

```json title="breakevents.json"
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

```json title="breakevents.json"
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

```json title="breakevents.json"
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

```json title="rightclicks.json"
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

```json title="rightclicks.json"
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

## Custom Spawner System

Starting with 1.16 In Control supports a new spawning system that replaces the potentialspawn system.
Rules of this type are put in `spawner.json`.
Every rule in this file represents an option for one of more mobs to spawn under certain circumstances.
The spawning system works per dimension and only attempts to spawn mobs every second.

:::danger Warning
Warning! `spawner.json` only supports the keywords mentioned here.
Don't use ANY other keyword here.
Other conditions (like biome) have to be specified in `spawn.json`.
:::

Every spawner rule has two parts:

* A part describing what will be spawned and how often the rule will fire
* A part describing conditions for spawning

The following JSON keys are possible in the root of every rule:

* `phase`: a string or list of strings representing all phases that must be active for this rule to work
* `mob`: a single mob or list of mobs (like 'minecraft:zombie'). The entire rule will be evalulated for every mob specified in this list. This is a required setting
* `weights`: an optional list of weights which will be used in combination with the mobs specified by 'mob'. By using weights you can give some spawns more importance
* `mobsfrombiome`: this is a string that can be equal to 'monster', 'creature', 'ambient', 'water_creature', 'water_ambient', or 'misc'. Use this instead of specifying 'mob' manually. This will let the spawn take a random mob (given weight) that is valid for the current biome
* `addscoreboardtags`: this is string or list of strings that can be used to add scoreboard tags to the spawned entity.
* `attempts`: the number of times In Control will attempt to find a good position to spawn the mob. By default, this is 1
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
* `norestrictions`: remove the mob specific (usually light related) restrictions on spawning
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

### Basic Example

Spawns random villagers near the player in water.
Using `groupdistance` these villager groups will spawn near each other (only for 1.18 and higher):

```json
[
  {
    "mob": "minecraft:villager",
    "persecond": 0.5,
    "attempts": 20,
    "amount": {
      "minimum": 2,
      "maximum": 5,
      "groupdistance": 3
    },
    "conditions": {
      "dimension": "minecraft:overworld",
      "inwater": true,
      "mindist": 5,
      "maxdist": 20,
      "minheight": 45,
      "maxheight": 175,
      "maxthis": 20
    }
  }
]
```

### Example using Phases

In the following example we globally increase hostile mob spawns after day 20 (using phases).

First `phases.json`:

```json title="phases.json"
[
  {
    "name": "after_day20",
    "conditions": {
        "mindaycount": 20
    }
  }
]
```

Then `spawner.json`:

```json title="spawner.json"
[
  {
    "phase": "after_day20",
    "mobsfrombiome": "monster",
    "persecond": 0.5,
    "attempts": 20,
    "amount": {
      "minimum": 2,
      "maximum": 5
    },
    "conditions": {
      "dimension": "minecraft:overworld",
      "maxhostile": 200
    }
  }
]
```

### Advanced Example

Here is a more advanced example where `spawn.json` and `spawner.json` are used together to get full control.
Let's say you want to spawn some extra mobs in deserts but otherwise keep vanilla spawn rates the same.
So first add a rule to `spawner.json` to add new spawns.
Basically we add skeletons and zombies with a maximum of 100 per mob (so maximum 100 skeletons and maximum 100 zombies):

```json
[
  {
    "mob": ["minecraft:skeleton", "minecraft:zombie"],
    "persecond": 0.5,
    "attempts": 20,
    "amount": {
      "minimum": 2,
      "maximum": 5
    },
    "conditions": {
      "dimension": "minecraft:overworld",
      "mindist": 25,
      "maxdist": 100,
      "minheight": 15,
      "maxheight": 200,
      "maxthis": 100
    }
  }
]
```

But we only want these extra mobs in deserts.
So you could do this in `spawn.json`:


```json title="spawn.json"
[
  {
    "mob": ["minecraft:skeleton", "minecraft:zombie"],
    "dimension": "minecraft:overworld",
    "biome": "minecraft:desert",
    "result": "default"
  },
  {
    "mob": ["minecraft:skeleton", "minecraft:zombie"],
    "dimension": "minecraft:overworld",
    "result": "deny"
  }
]
```

But that's not good.
These two rules will allow the zombies and skeletons to spawn in the desert, but they will get denies everywhere else.
We don't want to touch spawns of zombies and skeletons outside deserts.
So let's modify the rules in `spawn.json`:

```json title="spawn.json"
[
  {
    "mob": ["minecraft:skeleton", "minecraft:zombie"],
    "dimension": "minecraft:overworld",
    "biome": "minecraft:desert",
    "result": "default"
  },
  {
    "mob": ["minecraft:skeleton", "minecraft:zombie"],
    "dimension": "minecraft:overworld",
    "incontrol": true,
    "result": "deny"
  }
]
```

Basically by adding `"incontrol": true` to the second rule we will only deny spawns outside deserts if they were spawned by In Control.
All normal mob spawns will stay normal.

### Getting Zombies to spawn more

This is commonly requested so I decided to add an example here. First you need to add a rule to `spawner.json`
to make them spawn more. This can be done with the following rule. This will make zombies spawn up to a maximum of 200.
Using 'norestrictions' should also make them spawn during daylight:

```json
[
  {
    "mob": "minecraft:zombie",
    "persecond": 0.5,
    "attempts": 20,
    "amount": {
      "minimum": 2,
      "maximum": 5
    },
    "conditions": {
      "dimension": "minecraft:overworld",
      "norestrictions": true,
      "mindist": 25,
      "maxdist": 100,
      "minheight": 15,
      "maxheight": 200,
      "maxthis": 200
    }
  }
]
```

If needed you can then use rules in `spawn.json` to control when and how they spawn. For example,
let's make them spawn more on the surface and less in caves (but they can still spawn there). Let's
also say that we don't want to spawn any zombies in the first 5 days after starting the world:

```json
[
  {
    "mob": "minecraft:zombie",
    "daycount": "lt(5)",
    "result": "deny"
  },
  {
    "mob": "minecraft:zombie",
    "seesky": true,
    "result": "default"
  },
  {
    "mob": "minecraft:zombie",
    "random": 0.8,
    "result": "deny"
  }
]
```