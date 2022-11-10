# Control Mods 16

==Introduction==

[https://minecraft.curseforge.com/projects/in-control In Control] is a mod that supports a rule based system that allows you to control various aspects about mobs. There are rule files to control spawning, loot, experience and so on.

[https://minecraft.curseforge.com/projects/fx-control Fx Control] is a mod that supports a rule based system that allows you to control things that happen around the player. There are rule files to give the player potion effects, set him/her on fire, prevent him from interacting with objects and other things related to that.

Both mods have support for [https://minecraft.curseforge.com/projects/game-stages Game Stages], [https://minecraft.curseforge.com/projects/serene-seasons Serene Seasons], [https://minecraft.curseforge.com/projects/baubles Baubles], [https://wiki.mcjty.eu/mods/index.php?title=Lost_Cities Lost Cities], and [https://wiki.mcjty.eu/mods/index.php?title=Enigma EnigmaScript].

Because both mods have a very similar structure the documentation for them is merged.

==Common Questions (FAQ)==

* Q: How can I add spawns using spawn.json?
    * A: You can't. ''spawn.json'' can only RESTRICT spawns. To add spawns you use the new ''spawner.json''
    * A: ''potentialspawn.json'' or ''spawner.json'' are used to ADD spawns. ''spawn.json'' is used to RESTRICT spawns

* Q: Why can't I seem to control mobs from mod 'X' using ''spawn.json''?
    * A: Occasionally modded mobs don't follow the rules completely. It may help in such situations to use 'onjoin' : true in your rule

* Q: I added a rule to spawn.json to allow a mod but nothing is happening. Why is that?
    * A: 'Allow' (is standard). With spawn.json you can only restrict spawns that were already happening. If you want to add more spawns you'll have to add rules to spawner.json (possibly refined with rules in spawn.json)
    * A: Having only 'allow' rules in spawn.json is (usually) pretty useless as those mobs will spawn anyway (exceptions are if you want to boost mobs). Typically you want to have 'deny' rules

==Differences between 1.16.5, 1.18.2, 1.19 and older==

The 1.16.5 version of InControl and FxControl have some important differences which will require you to change rules when you move over from an older version to 1.16.5:

* It's recommended to use the biome registry name for biomes instead of the actual readable name. i.e. "minecraft:plains" instead of Plains. This is also possible with recent versions of InControl and FxControl in 1.15.2
* 'tempcategory' is removed and replaced with a more generic 'category' for biomes. It is now a list and supports the following categories: taiga, extreme_hills, jungle, mesa, plains, savanna, icy, the_end, beach, forest, ocean, desert, river, swamp, mushroom and nether
* 'biometype' now supports the following values: desert, desert_legacy, warm, cool, and icy
* Numerical dimension ID's no longer work (like 0 for the overworld. Use 'minecraft:overworld' instead). This is also possible in the 1.15.2 versions of InControl and FxControl (and recommended). But in 1.16.3 and later the numerical ID's are gone.
* The '/incontrol reload' command will no longer be able to reload the potentialspawns file (at least with regards to adding new spawns). Reloading the new 'spawner.json' file works fine though
* In 1.15.2 or higher there is a new 'continue' boolean flag that you can use in spawn rules. If this is set to true then if the rule succeeds it will not prevent execution of further rules (which it normally does by default)
* In 1.19 the 'category' check for biomes is gone. Instead there is the much more flexible 'biometags' test that can check for biome tags

==Commands==

These mods have various commands that allow you to debug and tweak what is going on:

* '''incontrol reload (In Control)''': after editing the rule files you can use this command to reload it and reapply the new rules
* '''incontrol debug (In Control)''': dumps debug info about spawning in the log. Warning! This can produce a lot of output
* '''incontrol show (In Control)''': show all entities and their names that can be used in spawn.json for mob names
* '''incontrol kill (In Control)''': kill all entities of a given type. Possible types are: 'all', 'hostile', 'passive', or 'entity'. It is also possible to give the name of an entity instead of a type (like 'minecraft:enderman'). There is also an optional extra parameter for a dimension ID
* '''incontrol list (In Control)''': list all current mobs present in the current dimension (and how many there are of each type)
* '''incontrol days (In Control)''': without parameters it shows the current day. You can also change the current day using this command
* '''incontrol phases (In Control)''': this shows all currently active phases
* '''fxcontrol reload (Fx Control)''': after editing the rule files you can use this command to reload it and reapply the new rules
* '''fxcontrol debug (Fx Control)''': dumps debug info about spawning in the log. Warning! This can produce a lot of output

==Rule Files==

All rule files can be found in the ''config/incontrol'' and ''config/fxcontrol'' directories. The following rule files are currently supported:

* '''phases.json (In Control)''': with this file you can define sets of globally active common conditions (called phases). These phases can then be used in all following rules as a more efficient and clean way to select rules
* '''spawn.json (In Control)''': with this file you can block spawning of certain creatures under certain conditions. In addition, when a spawn is allowed you can also alter some of the properties of the mob like maximum health and others. Note that the rules in this file only alter already existing spawns. You cannot (for example) with this file alone add blazes to spawn in the overworld. For that you need to look at ''potentialspawn.json'' too
* '''summonaid.json (In Control)''': this is a file that is structured the same as spawn.json but is only used when zombies are summoned for aid
* '''potentialspawn.json (In Control)''': with this file you can remove and add spawn rules under certain conditions. The rules in this file are used before the rules in spawn.json are fired so make sure that when you add a rule for new mobs here, the new mobs are allowed in spawn.json. <pre style="color: red">Warning! In 1.16 the potentialspawn system is not working properly. It is recommended that you use the new custom spawner system!</pre>
* '''spawner.json (In Control)''': this is a new spawning system (from 1.16.4 onwards) that you can use instead of the currently broken potentialspawn
* '''loot.json (In Control)''': with this file you can control the loot that mobs drop when they are killed based on various criteria
* '''experience.json (In Control)''': this file controls how much experience you get from killing mobs. It has a similar structure to ''loot.json'' except that you cannot control experience based on the type of damage (like magic, fire, explosion, ...)
* '''effects.json (Fx Control)''': with this file you can add effects to the player based on various conditions
* '''breakevents.json (Fx Control)''': with this file you can add effects to the player or world when a block is broken (and also prevent the block from breaking)
* '''placeevents.json (Fx Control)''': with this file you can add effects to the player or world when a block is placed (and also prevent the block from being placed)
* '''rightclicks.json (Fx Control)''': with this file you can add effects to the player or world when the player right clicks a block (and also prevent interaction)
* '''leftclicks.json (Fx Control)''': with this file you can add effects to the player or world when the player left clicks a block (and also prevent interaction)

==Rule Structure==

Every rule has three parts:

* '''Conditions''': These represents tests that have to be true before the rule can be considered for execution. All conditions in a rule have to be true before the rule will be executed
* '''Actions''': These represents things that will be done when the rule is executed
* '''Extra''': Some rules need extra things to work and some conditions/actions have extra modifiers that can alter how they work

Whenever something happens the corresponding rules are evaluated from top to bottom. In most cases the first rule that matches will be executed and further rules are ignored (the rules in ''potentialspawn.json'' and ''loot.json'' are an exception to that. For these all matching rules are executed)

==Expressions==

In some of the conditions it is possible to use expressions. An expression is basically a string specifying some test to do on an integer value. Here are a few examples:

* `''>10''`: evaluate to true if the number we are testing on is greater than 10
* `''!=10''`: evaluate to true if it is different from 10
* `''4-50''`: evaluate to true if the number is between 4 and 50 (inclusive)
* `''10''`: evaluate to true if the number is equal to 10

The following comparators are supported: `''>'', ''>='', ''<'', ''<='', ''='', and ''!=''.`

==Item filters==

Many conditions are very simple but when testing for items things can be a bit more complicated. That's why there is a specific syntax that can be used when testing on items. In this section we will go over all the possibilities and also present a few examples. In most cases when testing for an item (like test if the player holds a specific item in his/her hand) you can either use a single item filter or else a list of item filters. Let's talk about the case of an individual item filter. The following possibilities are supported:

* ''minecraft:sand'' (just normal minecraft sand)
* With NBT (same format as for /give command): `''minecraft:stained_hardened_clay/{display:{Lore:[\"My Clay\"]}}''`
* A Json descriptor which supports the following tags:
  ** ''item'': an item ID (like ''minecraft:sand'' or ''rftools:powercell'')
  ** ''empty'': a boolean (true or false) indicating if the item is empty or not. If this is present no other tags will be considered
  ** ''damage'': an expression (see above) which will be evaluated on the damage from the item
  ** ''count'': an expression which will be evaluated on the number of items in the stack
  ** ''ore'': a string indicating an ore dictionary value (for example ''ingotCopper'', ''dyeBlue'', ''plankWood'', ...)
  ** ''mod'': a string indicating the modid for the item
  ** ''energy'': an expression which will be evaluated to the amount of Forge Energy present in the item
  ** ''nbt'': a JSon array. Every object in this array supports the following tags:
  *** ''tag'': the name of the NBT tag to test on
  *** ''value'': the stringified value of the NBT tag to test on
  *** ''contains'': use this instead of ''value'' in case the tag represents a list. The value after contains should be a JSon array which in turn contains nbt matching tags like what we're describing now (see example later to make this more clear)

===Item Filter Examples===

The following examples are all applied on ''playerhelditem'' but it is of course possible to use them for any kind of condition that supports items.

The simplest case. A simple stick:

```json
    "playerhelditem": "minecraft:stick",
```

A list of different items:

```json
    "playerhelditem": [ "minecraft:stone_pickaxe", "minecraft:stone_axe", "minecraft:stone_shovel", "minecraft:stone_sword" ],
```

The same block with some NBT data:

```json
    "playerhelditem": "minecraft:stained_hardened_clay/{display:{Lore:[\"My Clay\"]}}",
```

The same example specified with JSon:

```json
    "playerhelditem": {
        "item": "minecraft:stained_hardened_clay",
        "nbt": [
            {
                "tag": "display",
                "value": "My Clay"
            }
        ]
     },
```

An empty hand:

```json
    "playerhelditem": { "empty": true },
```

In this example we need a damage pickaxe:

```json
    "playerhelditem": {
      "item": "minecraft:iron_pickaxe",
      "damage": ">0"
    },
```

In this final example we test if a pickaxe has a specific enchantment (unbreaking in this case):

```json
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
```

==Block Filters==

Similarly to item filters there is also the ''block'' condition that can test on the existance of a specific block. Like with items it is possible to specify a list or a single block filter. Here are the possibilities on an individual block filter:

* ''minecraft:sand'': a block matching this id. Metadata and/or properties are ignored
* ''ore:dyeBlue'': a block matching the specified ore dictionary value
* A Json descriptor which supports the following tags:
  ** ''block'': a block ID (like ''minecraft:sand'' or ''rftools:powercell'')
  ** ''properties'': (only if ''block'' is used). This is a JSon array with properties to match against. As soon as this is present a blockstate will be constructed made out of the block and the properties specified here and the match has to be exact. So properties that are not specified here will be put to their default value
  ** ''ore'': a string indicating an ore dictionary value (for example ''ingotCopper'', ''dyeBlue'', ''plankWood'', ...)
  ** ''mod'': a string indicating the modid for the block
  ** ''energy'': an expression which will be evaluated to the amount of Forge Energy present in the block
  ** ''contains'': either a single JSon object or else an array of JSon objects representing item filters as explained in the item filter section. The contains test will succeed if it finds any matching item in the inventory (if the block to test actually represents an inventory)
  ** ''side'': this is a modifier for both ''energy'' and ''contains''. If present it will indicate the side from which we want to examine the energy or inventory contents. If not present the 'null' side is used. This should be a string like ''east'', ''west'', ''south'', ''north'', ''up'', or ''down''.

===Block Filter Examples===

A diamond block:

```json
    "block": "minecraft:diamond_block",
```

A block of planks:

```json
    "block": "ore:plankWood",
```

Or in JSon syntax:

```json
    "block": { "ore": "plankWood" },
```


An RFTools powercell containing more then 1000000 energy:

```json
    "block": {
      "block": "rftools:powercell",
      "energy": ">1000000"
    },
```

A chest containing more then 10 sticks:

```json
    "block": {
      "block": "minecraft:chest",
      "contains": {
        "item": "minecraft:stick",
        "count": ">10"
      }
    },
```

A powered button:

```json
    "block": {
      "block": "minecraft:stone_button",
      "properties": [
            {
                "name": "powered",
                "value": "true"
            }
      ]
    },
```

==Mob Counter==

The 'maxcount' and 'mincount' tags to control mob spawning can be either a simple number or string containing a number and a mob but it can also be a more complex json with various conditions. The following tags are supported:

* ''amount'': the amount to compare with (can be scaled!)
* ''perplayer'': if this is true the amount will be scaled with the amount of players present
* ''perchunk'': if this is true the amount will be scaled with the amount of loaded chunks divided by 289 (this is how vanilla mobcap works)
* ''mod'': if this is set all mobs of a given mod are counted (can be used in combination with hostile, passive, or all)
* ''hostile'': if this is set all hostile mobs are counted
* ''passive'': if this is set all passive mobs are counted
* ''all'': if this is set all mobs are counted
* ''mob'': this is a single mob or a list of mobs. If this is present only those mobs are counted

===Mob Counter Examples===

In spawn.json: deny skeletons if there are already more then 50 hostile vanilla mobs present per player:

```json
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

In spawn.json: deny all mobs of a given mod if there are already more then 50 mods of that mod present, scaled based on vanilla mob cap rules:

```json
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

==Conditions==

In this section all possible conditions are explained. Some conditions are not usable in all rules. This will be mentioned here. Whenever a position is tested in a rule the given position depends on the rule. For mob spawns this will be the position where the mob will spawn. For block break events this will be the position of the broken block. For player effects this is the position of the block on which the player is standing.

Possible types:
* S: a string
* B: a boolean (true/false)
* I: an integer
* F: floating point number
* [`<type>`]: a list of type (for example, [S] is a list of strings)
* JSON: a json in a specific format explained elsewhere

```
{| class="wikitable"
|+Conditions
|-
| style="background-color:#3399ff;" |<small>'''Name'''
| style="background-color:#3399ff;" |<small>'''Type'''
| style="background-color:#3399ff;" |<small>'''Requirements'''
| style="background-color:#3399ff;" |<small>'''potential'''
| style="background-color:#3399ff;" |<small>'''spawner'''
| style="background-color:#3399ff;" |<small>'''spawn'''
| style="background-color:#3399ff;" |<small>'''summon'''
| style="background-color:#3399ff;" |<small>'''loot'''
| style="background-color:#3399ff;" |<small>'''experience'''
| style="background-color:#3399ff;" |<small>'''harvest'''
| style="background-color:#3399ff;" |<small>'''leftclick'''
| style="background-color:#3399ff;" |<small>'''rightclick'''
| style="background-color:#3399ff;" |<small>'''place'''
| style="background-color:#3399ff;" |<small>'''effect'''
| style="background-color:#3399ff;" |<small>'''Description'''
|-
| style="background-color:#3399ff;" |phase
| style="background-color:#22eeff;" |S/[S]
| style="background-color:#22eeff;" |
|
|V
|V
|V
|
|
|
|
|
|
|
|all phases that must be active for this rule to work. Phases are defined in ''phases.json''. Putting conditions in a phase is more efficient and cleaner
|-
| style="background-color:#3399ff;" |onjoin
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|
|
|V
|
|
|
|
|
|
|
|
|if true then this spawn rule will also be fired when entities join the world. This is a much stronger test and will allow you to disable spawns from mob spawners as well as prevent passive mob spawns that don't always go through the regular 'checkspawn' event. Use this with care!
|-
| style="background-color:#3399ff;" |mindaycount / maxdaycount
| style="background-color:#22eeff;" |I
| style="background-color:#22eeff;" |
|V
|V
|V
|V
|
|
|
|
|
|
|
|indicate the minimum (inclusive) or maximum day count. The day counter starts at 0 (see the 'days' command)
|-
| style="background-color:#3399ff;" |daycount
| style="background-color:#22eeff;" |I
| style="background-color:#22eeff;" |
|V
|V
|V
|V
|
|
|
|
|
|
|
|this is true if the day counter is a multiple of the given parameter
|-
| style="background-color:#3399ff;" |baby
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|
|
|V
|
|V
|V
|
|
|
|
|
|true if this is a baby
|-
| style="background-color:#3399ff;" |spawner
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|
|
|V
|
|
|
|
|
|
|
|
|true if spawned by a spawner
|-
| style="background-color:#3399ff;" |incontrol
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|
|
|V
|
|
|
|
|
|
|
|
|true if spawned by the new In Control spawner system (''spawner.json'')
|-
| style="background-color:#3399ff;" |minheight / maxheight
| style="background-color:#22eeff;" |I
| style="background-color:#22eeff;" |
|V
|V
|V
|V
|V
|V
|V
|V
|V
|V
|V
|indicates the minimum (inclusive) or maximum height at which this rule will fire
|-
| style="background-color:#3399ff;" |minlight / maxlight
| style="background-color:#22eeff;" |I
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|value between 0 and 15 indicating the minimum and maximum light level on the given block
|-
| style="background-color:#3399ff;" |mincount / maxcount
| style="background-color:#22eeff;" |S/I/JSON
| style="background-color:#22eeff;" |
|V
|
|V
|V
|
|
|
|
|
|
|
|string value that is either a number in which case it will count how many mobs of the given class are already in the world or else of the form "<amount>,<mob>" to count the number of mobs of that type. That way you can have a rule file based on the number of mobs already present. Note that instead of this syntax you can also use the JSON mob counter syntax as explained above
|-
| style="background-color:#3399ff;" |maxthis / maxtotal / maxpeaceful / maxhostile / maxneutral / maxlocal
| style="background-color:#22eeff;" |I
| style="background-color:#22eeff;" |
|
|V
|
|
|
|
|
|
|
|
|
|the maximum amount of mobs of this type, in total, passive, hostile, neutral or local (spawn box around the player, as this is more expensive use this with care)
|-
| style="background-color:#3399ff;" |minspawndist / maxspawndist
| style="background-color:#22eeff;" |F
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|the minimum or maximum distance (in minecraft units) to the spawn point in the world
|-
| style="background-color:#3399ff;" |mintime / maxtime
| style="background-color:#22eeff;" |I
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|the time of the day (a number between 0 and 23999)
|-
| style="background-color:#3399ff;" |mindifficulty / maxdifficulty
| style="background-color:#22eeff;" |F
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|the local difficulty of the place where the mob will spawn. This is a number between 0 and 4
|-
| style="background-color:#3399ff;" |mindist / maxdist
| style="background-color:#22eeff;" |I
| style="background-color:#22eeff;" |
|
|V
|
|
|
|
|
|
|
|
|the minimum/maximum distance to the player for controlling the spawn. By default this is equal to 24/120
|the local difficulty of the place where the mob will spawn. This is a number between 0 and 4
|-
| style="background-color:#3399ff;" |canspawnhere
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|
|
|V
|
|
|
|
|
|
|
|
|a check that is specific to the entity implementation. This is called by Minecraft automatically if you return 'default' as the result of this rule. For many mobs this check will do the standard light level check
|-
| style="background-color:#3399ff;" |norestrictions
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|
|V
|
|
|
|
|
|
|
|
|
|remove the mob specific (usually light related) restrictions on spawning
|-
| style="background-color:#3399ff;" |inliquid / inwater / inlava / inair
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|
|V
|
|
|
|
|
|
|
|
|
|allow spawning in any liquid, water, lava, or in air. This will ignore the mob specific restrictions it might have on spawning
|-
| style="background-color:#3399ff;" |isnotcolliding
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|
|
|V
|
|
|
|
|
|
|
|
|a check that is specific to the entity implementation. This is called by Minecraft automatically if you return 'default' as the result of this rule. For many mobs this check will do a test if the mob would collide with blocks after spawning
|-
| style="background-color:#3399ff;" |difficulty
| style="background-color:#22eeff;" |S
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|one of the following values: easy, normal, hard, peaceful
|-
| style="background-color:#3399ff;" |weather
| style="background-color:#22eeff;" |S
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|rain or thunder
|-
| style="background-color:#3399ff;" |category
| style="background-color:#22eeff;" |S/[S]
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|NOT for 1.19! One of the following values: none, taiga, extreme_hills, jungle, mesa, plains, savanna, icy, the_end, beach, forest, ocean, desert, river, swamp, mushroom, nether. This represents the category of the current biome
|-
| style="background-color:#3399ff;" |biometags
| style="background-color:#22eeff;" |S/[S]
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|ONLY for 1.19! This is a biome tag (or list of tags) which will be used to match with the biome. Example tags are: 'minecraft:is_ocean', 'minecraft:is_hill', 'minecraft:has_structure/igloo', 'minecraft:allows_surface_slime_spawns', 'forge:is_hot', 'forge:is_cold', 'forge:is_wet', ... and a LOT more
|-
| style="background-color:#3399ff;" |hostile / passive
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|
|
|V
|V
|V
|V
|
|
|
|
|
|matching only hostile or passive mobs
|-
| style="background-color:#3399ff;" |seesky
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|true if the block can see the sky (not in a cave)
|-
| style="background-color:#3399ff;" |slime
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|
|
|V
|V
|
|
|
|
|
|
|
|true if this is a slime chunk (only for 1.18 or higher)
|-
| style="background-color:#3399ff;" |structure
| style="background-color:#22eeff;" |S
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|the name of the structure to test for. This way you can make sure a rule only fires in a village for example. Some examples are "minecraft:mineshaft", "minecraft:village", and so on. Modded structures should also work
|-
| style="background-color:#3399ff;" |mob
| style="background-color:#22eeff;" |S/[S]
| style="background-color:#22eeff;" |
|
|
|V
|V
|V
|V
|
|
|
|
|
|an ID for a mob like 'minecraft:creeper' and so on. Modded mobs should also work
|-
| style="background-color:#3399ff;" |mod
| style="background-color:#22eeff;" |S/[S]
| style="background-color:#22eeff;" |
|
|
|V
|V
|V
|V
|
|V
|V
|
|
|a mod id. By using this you can block spawns of mobs that belong to some mod. Use "minecraft" for vanilla mobs
|-
| style="background-color:#3399ff;" |block
| style="background-color:#22eeff;" |S/[S]/JSON
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|a block filter as explained above
|-
| style="background-color:#3399ff;" |blockoffset
| style="background-color:#22eeff;" |JSON
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|modify the position of the block that is being used by the ''block'' test (or the ''setblock'' action). This json can contain tags like ''x'', ''y'', or ''z'' which will be added (as offset) to the original block position or else the boolean tag ''look'' in which case the position will be the position the player is looking at (only in case there is a player involved which isn't the case for ''spawn.json'')
|-
| style="background-color:#3399ff;" |biome
| style="background-color:#22eeff;" |S/[S]
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|the biome of the current block (like "minecraft:plains" for example)
|-
| style="background-color:#3399ff;" |biometype
| style="background-color:#22eeff;" |S/[S]
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|the biome type (from the biome dictionary). Examples are WARN, COLD, ICY, DESERT, and DESERT_LEGACY
|-
| style="background-color:#3399ff;" |dimension
| style="background-color:#22eeff;" |S/[S]
| style="background-color:#22eeff;" |
|V
|V
|V
|V
|V
|V
|V
|V
|V
|V
|V
|the dimension of the current block or player (for example "minecraft:overworld")
|-
| style="background-color:#3399ff;" |dimensionmod
| style="background-color:#22eeff;" |S/[S]
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|the mod of the dimension. You can use this to have a rule work in all dimensions from a given mod
|-
| style="background-color:#3399ff;" |random
| style="background-color:#22eeff;" |F
| style="background-color:#22eeff;" |
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|this will succeed rule if a random number is less then this number. So if you want to have a rule that fires with 10% chance then use 0.1 here
|-
| style="background-color:#3399ff;" |player / fakeplayer / realplayer
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|
|
|
|
|V
|V
|
|
|
|
|
|indicating if the mob was killed by a player (fake or real), a fake player (automation that behaves like a player) and a real player
|-
| style="background-color:#3399ff;" |projectile / explosion / magic / fire
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |
|
|
|
|
|V
|V
|
|
|
|
|
|indicating if the mob was killed by a projectile, explosion, magic or fire
|-
| style="background-color:#3399ff;" |source
| style="background-color:#22eeff;" |S/[S]
| style="background-color:#22eeff;" |
|
|
|
|
|V
|V
|
|
|
|
|
|the damage source. Some sources are 'lightningBolt', 'lava', 'cactus', 'wither', 'anvil', 'hotFloor', 'inWall', 'cramming', ...
|-
| style="background-color:#3399ff;" |playerhelditem / offhanditem / bothhandsitem
| style="background-color:#22eeff;" |S/[S]/JSON
| style="background-color:#22eeff;" |
|
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|a representation of the item(s) that the player is holding in his/her main hand (or offhand). Use a correct item filter (or list of item filters)
|-
| style="background-color:#3399ff;" |incity / instreet / inbuilding / insphere
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |Lost Cities
|
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|check if the current position is in a city, stree, building or city sphere
|-
| style="background-color:#3399ff;" |gamestage
| style="background-color:#22eeff;" |S
| style="background-color:#22eeff;" |Game Stages
|
|
|V
|
|V
|V
|V
|V
|V
|V
|V
|the current game stage. When a player is not really present (like with spawn.json) the closest player is used
|-
| style="background-color:#3399ff;" |winter / summer / spring / autumn
| style="background-color:#22eeff;" |B
| style="background-color:#22eeff;" |Serene Seasons
|V
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|check the current season (NOT IMPLEMENTED IN 1.16)
|-
| style="background-color:#3399ff;" |amulet / ring / belt / trinket / charm / body / head
| style="background-color:#22eeff;" |S/[S]/JSON
| style="background-color:#22eeff;" |Baubles
|
|
|V
|V
|V
|V
|V
|V
|V
|V
|V
|check if an item is in a bauble slot (NOT IMPLEMENTED YET IN 1.16)
|-
| style="background-color:#3399ff;" |state / pstate
| style="background-color:#22eeff;" |S
| style="background-color:#22eeff;" |EnigmaScript
|
|
|
|
|V
|V
|
|
|
|
|
|this can be used to test the value of a (player) state with a string like this "state=value" (NOT IMPLEMENTED YET IN 1.16)
|}
```

==Actions==

In this section all the actions per rule type are listed.

===Spawn and SummonAid===

For ''spawn.json'' the following actions are supported:

* '''result''': this is either 'deny', 'allow', 'default', or not specified. If you don't specify a result then whatever other mob control mods have decided is preserved. If you specify a result then In Control will take over (since the In Control rule will fire last). Use 'deny' to block the spawn. If 'allow' is used then the spawn will be allowed even if vanilla would normally disallow it (i.e. too much light). If 'default' is used then it is possible the spawn can still be denied if there is not enough light for example. Unless 'deny' is used then you can use any of the following actions:
* '''nbt''': allows you to add NBT to a spawned mob
* '''customname''': allows you to set a custom name for the spawned mob
* '''healthmultiply''': this is a floating point number representing a multiplier for the maximum health of the mob that is spawned. Using 2 here for example would make the spawned mob twice as strong.
* '''healthadd''': this is a floating point number that is added to the maximum health
* '''speedmultiply''': this is a floating point number representing a multiplier for the speed of the mob
* '''speedadd''': this is a floating point number that is added to the speed
* '''damagemultiply''': this is a floating point number representing a multiplier for the damage that the mob does
* '''damageadd''': this is a floating point number that is added to the damage
* '''angry''': this is a boolean that indicates if the mob will be angry at and/or target the nearest player. For zombie pigman this will make them angry at the player immediatelly. Same for enderman and wolves
* '''potion''': this is either a single string or a list of strings. Every string represents a potion effect which is indicated like this: `<potion>,<duration>,<amplifier>`. For example "minecraft:invisibility,10,1"
* '''helditem''': this is either a single string or a list of strings. Every string represents a possible item that the spawned mob will carry in its hand. This works only with mobs that allow this like skeletons and zombies. You can also specify a weight with this by adding `<number>=` in front of the string. Like this: "1=minecraft:diamond_sword", "2=minecraft:iron_sword"
* '''armorboots''': this is either a single string or a list of strings representing random armor that the spawned mob will wear
* '''armorhelmet''': is either a single string or a list of strings representing random armor that the spawned mob will wear
* '''armorlegs''': is either a single string or a list of strings representing random armor that the spawned mob will wear
* '''armorchest''': is either a single string or a list of strings representing random armor that the spawned mob will wear

In addition 'gamestage', 'playerhelditem', and related tags (which are tied to a player) are also supported. In that case the nearest player will be used as the basis for deciding the rule.

===Additional Spawns===

The same conditions as with ''spawn.json'' are supported. However with ''mincount'' and ''maxcount'' you have to use the format `<amount>,<mob>`. Instead of actions this rule file supports mob entries that have the following structure:


* '''mob''': an entity name in the form Creeper, Skeleton, ... for (1.10.2) and optionally the notation modid:name for 1.11.2
* '''weight''': an integer indicating the weight of this spawn. i.e. how important it is compared to other spawns
* '''groupcountmin''': the minimum amount of mobs to spawn at once
* '''groupcountmax''': the minimum amount of mobs to spawn at once

You can also remove mob spawn entries with the remove keyword. This is either a string or a list of strings representing mobs that have to be removed from the possible spawns.

===Loot Control===

In contrast with most other rule files every rule is evaluated every time. i.e. a succesful loot rule doesn't prevent the other loot rules from firing. Loot supports the following actions:

* '''item''': this is a string or a list of strings representing new loot that will be dropped
* '''itemcount''': this is a string representing how many items should drop (optionally depending on looting level). For example: "5/7-10/20-30" will drop 5 items at looting 0, 7-10 items at looting 1 and 20-30 items at looting 2 or beyond
* '''nbt''': this is a JSon specifying the NBT that will be used for the loot items
* '''remove''': this is a string or a list of strings representing items to remove from the loot
* '''removeall''': if this is present then all items will be removed from the loot (before new items are added by this rule)

===Experience===

This is similar to loot control except that it controls how much experience you get from killing a mob. All keywords from loot control can be used here except the ones that are about damage type (magic, explosion, ...) as that information is not present in this event. There are four outputs that work for these rules:

* '''result''': set this to 'deny' to not give any experience at all
* '''setxp''': set a fixed XP instead of the default one
* '''multxp''': multiple the normal XP with this number
* '''addxp''': after multiplying the normal XP add this amount to the final XP

===Effects===

With effects you can specify an additional ''timeout'' keyword in the rule. This represents the number of ticks that will be waited before testing the rule again. Keep in mind that some of these rules can be expensive so using a higher timeout will make the rule fire less frequently.

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

===Break and Place===

There is no ''timeout'' keyword here. In addition to the actions that you can do for effects this also has a ''result'' output which can be ''allow'' or ''deny''. Note that (in contrast with ''spawn.json'') the other actions are still executed even if the rule says ''deny''!


===Left click and Right click===

There is no ''timeout'' keyword here. In addition to the actions that you can do for effects this also has a ''result'' output which can be ''allow'' or ''deny''. Note that (in contrast with ''spawn.json'') the other actions are still executed even if the rule says ''deny''!

==Phase System==

The phase system allows you to define global conditions and give them a name. In Control rules can then use these phases so that they are only active if one or more phases are active. This is much more efficient as the global conditions are evalulated once every 10 ticks as opposed to every time a mob tries to spawn. In addition it is much cleaner. Phases only work with a limited set of conditions (only conditions that are globally true):

* '''mintime''' and '''maxtime'''
* '''daycount''', '''mindaycount''' and '''maxdaycount'''
* '''weather'''
* '''winter''', '''summer''', '''spring''', and '''autumn'''
* '''state'''

==Examples==

Sometimes it is best to explain things with examples. In this section we will present many examples that you can use as a basis to make your own rules:

===Phases===

Define a phase that is true if we are after day 10. You can then use this phase in all In Control rules:

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


===Spawn===

This example allows only spawns in plains biomes. All other spawns are prevented:

```json
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

```json
[
  {
    "mob": "minecraft:zombie",
    "mincount": 10,
    "result": "deny"
  }
]
```


Just prevent all zombies. Nothing else is changed:

```json
[
  {
    "mob": "minecraft:zombie",
    "result": "deny"
  }
]
```

Just prevent all zombies, even from spawners. This is a much stronger test. Nothing else is changed:

```json
[
  {
    "mob": "minecraft:zombie",
    "onjoin": true,
    "result": "deny"
  }
]
```

This example prevents ALL passive mob spawns in a certain dimension:

```json
[
  {
    "passive": true,
    "dimension": "dimensionmod:funkydim",
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

Disallow hostile mob spawns above 50. Below 50 only allow spawns on stone and cobblestone:

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

Make all mobs on the surface very dangerous. Underground there is a small chance of spawning invisible but weak zombies. In addition zombies and skeleton on the surface spawn with helmets so they don't burn:


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
    "mob": "minecraft:zombie",
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

===Loot===

Here are some examples for ''loot.json'':



Make blazes only spawn blaze rods if they are killed by a player in a nether fortress. The amount of blazerods will be higher if the looting level is higher:

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

===Effects===

Here are a few examples for ''effects.json'':


This example makes the player get poison effect if he is outside in the overworld. He will be put on fire if he goes to the nether and he will get the slowness effect if he is holding a stone tool:

```json
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

===Break Events===

Here are a few examples for ''breakevents.json'':


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


===Examples for Right Clicks===

Here are a few examples for ''rightclicks.json'':


In this example the player can only opens chests with a stick in his or her hand:

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

==Custom Spawner System==

Starting with 1.16 In Control supports a new spawning system that replaces the potentialspawn system. Rules of this type are put in '''spawner.json'''. Every rule in this file represents an option for one of more mobs to spawn under certain circumstances. The spawning system works per dimension and only attempts to spawn mobs every second.

'''<pre style="color: red">Warning! spawner.json only supports the keywords mentioned here. Don't use ANY other keyword here. Other conditions (like biome) have to be specified in spawn.json</pre>'''

Every spawner rule has two parts:

* A part describing what will be spawned and how often the rule will fire
* A part describing conditions for spawning

The following json keys are possible in the root of every rule:

* '''phase''': a string or list of strings representing all phases that must be active for this rule to work
* '''mob''': a single mob or list of mobs (like 'minecraft:zombie'). The entire rule will be evalulated for every mob specified in this list. This is a required setting
* '''weights''': an optional list of weights which will be used in combination with the mobs specified by 'mob'. By using weights you can give some spawns more importance
* '''mobsfrombiome''': this is a string that can be equal to 'monster', 'creature', 'ambient', 'water_creature', 'water_ambient', or 'misc'. Use this instead of specifying 'mob' manually. This will let the spawn take a random mob (given weight) that is valid for the current biome
* '''attempts''': the number of times In Control will attempt to find a good position to spawn the mob. By default this is 1
* '''persecond''': a floating point number indicating the chance of this rule firing. If this is 0.5 then there is 50% chance that this rule will spawn a mob (meaning that on average it will fire every 2 seconds). The default of this value is 1 (which means the rules fire onces per second). The maximum is also 1
* '''amount''': a json object containing a 'minimum', 'maximum' and an optional 'groupdistance'. This is the number of mobs that the spawnwer will attempt to spawn at once. The default is 1 for both. If 'groupdistance' is set then these mobs will spawn in groups (near each other). Note that 'groupdistance' is only for 1.18 and higher
* '''conditions''': a json object containing a set of conditions (see below)

The following json keys are possible in the conditions block (and ONLY those, for other conditions combine with regular spawn rules):

* '''dimension''': a single dimension or list of dimensions (like 'minecraft:overworld'). This is required. If you don't specify any dimensions then nothing will happen
* '''mindaycount''' and '''maxdaycount''': the minimum/maximum daycount to allow this rule to work
* '''mindist''' and '''maxdist''': the minimum/maximum distance to the player for controlling the spawn. By default this is equal to 24/120.
* '''minheight''' and '''maxheight''': the minimum/maximum height of the spawn. By default this is 1/256
* '''norestrictions''': remove the mob specific (usually light related) restrictions on spawning
* '''inliquid''': if true then allow spawning in any liquid (this will ignore the mob specific restrictions it might have on spawning in liquids)
* '''inwater''': if true then allow spawning in water (this will ignore the mob specific restrictions it might have on spawning in liquids)
* '''inlava''': if true then allow spawning in lava (this will ignore the mob specific restrictions it might have on spawning in liquids)
* '''inair''': if true then allow spawning in the air
* '''maxthis''': the maximum amount of mobs of the given type
* '''maxtotal''': the maximum amount of mobs total
* '''maxpeaceful''': the maximum amount of passive mobs
* '''maxhostile''': the maximum amount of hostile mobs
* '''maxneutral''': the maximum amount of neutral mobs
* '''maxlocal''': this will cause counting in the spawn box around the player. This is somewhat more expensive so use with care

===Basic Example===

Spawns random villagers near the player in water. Using 'groupdistance' these villager groups will spawn near each other (only for 1.18 and higher):

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

===Example using Phases===

In the following example we globally increase hostile mob spawns after day 20 (using phases).

First ''phases.json'':

```json
[
  {
    "name": "after_day20",
    "conditions": {
        "mindaycount": 20
    }
  }
]
```

Then ''spawner.json'':

```json
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

===Advanced Example===

Here is a more advanced example where spawn.json and spawner.json are used together to get full control. Let's say you want to spawn some extra mobs in deserts but otherwise keep vanilla spawn rates the same. So first add a rule to spawner.json to add new spawns. Basically we add skeletons and zombies with a maximum of 100 per mob (so maximum 100 skeletons and maximum 100 zombies):

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

But we only want these extra mobs in deserts. So you could do this in spawn.json:


```json
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

But that's not good. These two rules will allow the zombies and skeletons to spawn in the desert but they will get denies everywhere else. We don't want to touch spawns of zombies and skeletons outside deserts. So lets modify the rules in spawn.json:

```json
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

Basically by adding "incontrol": true to the second rule we will only deny spawns outside deserts if they were spawned by In Control. All normal mob spawns will stay normal.