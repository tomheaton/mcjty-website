# spawn.json

## Introduction

With this rule file you can control various aspects of when a mob should spawn (or despawn). Note that
you cannot use this file to add new mobs to the game. For that you need to use `spawner.json` too.

:::danger Warning
Remember that you can not use `spawn.json` to add new mobs to the game or to increase spawn rates of mobs!
:::

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

## Supported Conditions

This is a list of all supported conditions for `spawn.json`. When you use several conditions in a rule
then ALL conditions have to be true before the rule will be executed.

* `phase`: 'S/[S]' - all phases that must be active for this rule to work. Phases are defined in `phases.json`. Putting conditions in a phase is more efficient and cleaner
* `number`: `JSON` - A json describing a numeric condition that must be valid before this rule can work. See the section on the numeric system for more information
* `when`: `S` - can be equal to 'position', 'finalize', 'onjoin', or 'despawn'. Default is 'position'
* `mindaycount / maxdaycount`: `I` - indicate the minimum (inclusive) or maximum day count. The day counter starts at `0` (see the `days` command)
* `daycount`: `I/E` - this is true if the day counter is a multiple of the given parameter. It also supports an expression in which case the expression is evaluated (see more on numeric expressions above in this wiki)
* `baby`: `B` - true if this is a baby
* `spawner`: `B` - true if spawned by a spawner
* `spawntype`: `S/[S]` - check the reason for the spawn. This can be a value like natural, chunk_generation, spawner, structure, breeding, mob_summoned, jockey, event, conversion, reinforcement, triggered, bucket, spawn_egg, command, dispenser, patrol
* `incontrol`: `B` - true if spawned by the In Control spawner system (`spawner.json`)
* `eventspawn`: `B` - true if spawned by the In Control event system (`events.json`)
* `area`: 'S' - test if the position is in a certain area (see `areas.json`)
* `minheight / maxheight`: `I` - indicates the minimum (inclusive) or maximum height at which this rule will fire
* `height`: `E` - uses a numeric expression to test the height at which the mob will spawn
* `minlight / maxlight`: `I` - value between `0` and `15` indicating the minimum and maximum block light level on the given block
* `minlight_full / maxlight_full`: `I` - value between `0` and `15` indicating the minimum and maximum full (combined block and sky) light level on the given block
* `minlight_sky / maxlight_sky`: `I` - value between `0` and `15` indicating the minimum and maximum sky light level on the given block
* `light`: `E` - uses a numeric expression to test the light level on the given block
* `mincount / maxcount`: `S/I/JSON` - string value that is either a number in which case it will count how many mobs of the given class are already in the world or else of the form `<amount>,<mob>` to count the number of mobs of that type. That way you can have a rule file based on the number of mobs already present. Note that instead of this syntax you can also use the JSON mob counter syntax as explained above
* `minspawndist / maxspawndist`: `F` - the minimum or maximum distance (in minecraft units) to the spawn point in the world
* `mintime / maxtime`: `I` - the time of the day (a number between `0` and `23999`)
* `time`: `E` - uses a numeric expression to test the time of the day (see the numeric expression section higher up in this wiki)
* `mindifficulty / maxdifficulty`: `F` - the local difficulty of the place where the mob will spawn. This is a number between `0` and `4`
* `canspawnhere`: `B` - a check that is specific to the entity implementation. This is called by Minecraft automatically if you return `default` as the result of this rule. For many mobs this check will do the standard light level check
* `notcolliding`: `B` - a check that is specific to the entity implementation. This is called by Minecraft automatically if you return `default` as the result of this rule. For many mobs this check will do a test if the mob would collide with blocks after spawning
* `difficulty`: `S` - one of the following values: easy, normal, hard, peaceful
* `weather`: `S` - rain or thunder
* `category`: `S/[S]` - NOT for 1.19! One of the following values: none, taiga, extreme_hills, jungle, mesa, plains, savanna, icy, the_end, beach, forest, ocean, desert, river, swamp, mushroom, nether. This represents the category of the current biome
* `biometags`: `S/[S]` - ONLY for 1.19! This is a biome tag (or list of tags) which will be used to match with the biome. Example tags are: `minecraft:is_ocean`, `minecraft:is_hill`, `minecraft:has_structure/igloo`, `minecraft:allows_surface_slime_spawns`, `forge:is_hot`, `forge:is_cold`, `forge:is_wet`, ... and a LOT more
* `hostile / passive`: `B` - matching only hostile or passive mobs
* `seesky`: `B` - true if the block can see the sky (not in a cave)
* `cave`: `B` - true if we are in a cave. This is a more expensive test that tries to test if we are in a cave by checking if the block in all six directions is one that can occur in a cave
* `slime`: `B` - true if this is a slime chunk (only for 1.18 or higher)
* `structure`: `S/[S]` - the name of the structure to test for. This way you can make sure a rule only fires in a village for example. Some examples are `minecraft:mineshaft`, `minecraft:village`, and so on. Modded structures should also work
* `structuretags`: `S/[S]` - the name of the structure tag to test for. This way you can make sure a rule only fires in a village for example. Some examples are `minecraft:mineshaft`, `minecraft:village`, and so on. Modded structures should also work
* `hasstructure`: `B` - test if we are in any structure
* `mob`: `S/[S]` - an ID for a mob like `minecraft:creeper` and so on. Modded mobs should also work
* `mod`: `S/[S]` - a mod id. By using this you can block spawns of mobs that belong to some mod. Use `minecraft` for vanilla mobs
* `block`: `S/[S]/JSON` - (**deprecated, use blocktest**) a block filter as explained above
* `blockoffset`: `JSON` - (**deprecated, use blocktest**) modify the position of the block that is being used by the block test (or the setblock action). This JSON can contain tags like `x`, `y`, or `z` which will be added (as offset) to the original block position or else the boolean tag look in which case the position will be the position the player is looking at (only in case there is a player involved which isn't the case for `spawn.json`)
* `blocktest`: `JSON` - a more advanced block test. This JSON can contain the following tags:
  * `pos`: `JSON` - this is a position object that indicates the position of the block to test. This can be a position relative to the spawn position (like `{x:0,y:-1,z:0}` for the block below the spawn position) or it can be an absolute position (like `{x:100,y:64,z:-300}`) or it can be a position relative to the closest player (like `{x:0,y:1,z:0,relativeTo:"player"}` for the block above the closest player)
  * `filter`: `S/[S]/JSON` - this is a block filter as explained above
  * `condition`: `S` - this is either 'any' or 'all'. If 'any' is used then the rule will match if ANY of the blocks in the filter match. If 'all' is used then ALL blocks in the filter must match
  * `replacewith`: `S/[S]/JSON` - this is optional and if given then the block(s) that matched will be replaced with this block (or one of these blocks if a list is given). This works like the setblock action explained below
* `biome`: `S/[S]` - the biome of the current block (like `minecraft:plains` for example)
* `biometype`: `S/[S]` - the biome type (from the biome dictionary). Examples are `WARN`, `COLD`, `ICY`, `DESERT`, and `DESERT_LEGACY`
* `dimension`: `S/[S]` - the dimension of the current block or player (for example `minecraft:overworld`)
* `dimensionmod`: `S/[S]` - the mod of the dimension. You can use this to have a rule work in all dimensions from a given mod
* `random`: `F` - this will succeed rule if a random number is less then this number. So if you want to have a rule that fires with `10%`chance then use `0.1` here
* `playerhelditem / offhanditem / bothhandsitem`: `S/[S]/JSON` - a representation of the item(s) that the player is holding in their main hand (or offhand). Use a correct item filter (or list of item filters)
* `helmet / chestplate / leggings / boots`: `S/[S]/JSON` - a representation of the item(s) that the player is having as armor. Use a correct item filter (or list of item filters)
* `scoreboardtags_all / scoreboardtags_any`: `S/[S]` - test for scoreboard tags on the entity (all must be there or any must be there)
* `incity / instreet / insphere (Lost Cities)`: `B` - check if the current position is in a city, street, or city sphere
* `inbuilding / inmultibuilding (Lost Cities)`: `B` - check if the current position is in a building or multibuilding
* `building / multibuilding (Lost Cities)`: `S/[S]` - check if the current position is in a specific building or multibuilding
* `gamestage (Gamestages)`: `S` - the current game stage. When a player is not really present (like with spawn.json) the closest player is used
* `npc (CustomNPCs)`: `JSON` - this is a filter for NPCs. This is a JSON that should contain a 'cloneTab' and a 'cloneName' to test for an NPC from CustomNPCs
* `winter / summer / spring / autumn (Serene Seasons)`: `B` - check the current season (NOT IMPLEMENTED IN 1.16)
* `amulet / ring / belt / trinket / charm / body / head (Baubles)`: `S/[S]/JSON` - check if an item is in a bauble slot (NOT IMPLEMENTED YET IN 1.16)
* `state (EnigmaScript)`: `S` - this can be used to test the value of a (player) state with a string like this `state=value` (NOT IMPLEMENTED YET IN 1.16)

## Supported Actions

The following actions are supported in `spawn.json`:

* `ai`: `JSON` - new experimental AI system. See the section on the AI system for more information (todo!)
* `addscoreboardtags`: `S/[S]` - add scoreboard tags to the spawned entity
* `nodespawn`: `B` - if this is given the mob will not despawn. Be careful with this!
* `setphase`: this is a string representing a phase that will be set
* `clearphase`: this is a string representing a phase that will be cleared
* `togglephase`: this is a string representing a phase that will be toggled
* `changenumber`: this is a string representing a change for a number. See the number system section for more information
* `customevent`: this is a string representing a custom event that will be fired. See the event system section for more information
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
