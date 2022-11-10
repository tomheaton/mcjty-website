# RFTools Dimensions

==Introduction==

In this wiki a few things are clarified that are not made clear in the in-game manual. Note that this wiki is for the 1.10.2 version of Minecraft. For the 1.7.10 version you should look at the original wiki: [https://github.com/McJty/RFTools/wiki/RFTools-Blocks Original RFTools Wiki].

===The Dimlet Config file===

The dimlet system in RFTools Dimensions has been completely changed compared to the 1.7.10 version. In 1.10.2 all configuration happens within the ''dimlets.json'' config file. This config file has two parts which are seperated by this line:

> "Everything below this line will be regenerated from defaults every time. Remove this line if you do not want that",

The rules below that line are the defaults from RFTools Dimensions itself. You cannot make changes to that part. Every change you make will be reset when the mod starts. So if you want to add new rules or override existing rules you have to place your own rules above that line.

===Rules===

Rules are evaluated from top to bottom and the first rule that matches will be taken. If a rule matches no other rules that would possibly match are considered.

Every rule has a filter and a settings section:

====Filter====

When RFTools Dimensions constructs dimlets it will scan all blocks, fluids, mobs, and biomes in the game and tries to see if there is a rule for that specific thing. The filter is what is used to match all these Minecraft concepts. You can use the following tags in a filter:

* ''mod'': match on modid
* ''name'': match on a name. The name depends on what the object is you're matching against. For mobs this is (on 1.10.2) a string ID and on 1.11.2 it is something in the form `<modid>:<name>`. For materials and liquids this will be the registry name. And for biomes the name of the biome. For all other dimlets this name will be a name chosen by RFTools Dimensions itself.
* ''type'': the type of the dimlet ('material', 'liquid', 'sky', ...)
* ''feature'': this allows you to filter based on some features blocks have. The current supported features are: ''oredict'', ''falling'', ''tileentity'', ''plantable'', and ''nofullblock''.
* ''meta'': the metadata for this block
* ''property'': if this block has a certain property. The value of this tag will be another map containing property names and their values

====Settings====

The settings section decides what to do if the rule matches. The two most important tags here are:

* ''worldgen'': if this is enabled then this feature can be generated randomly in dimensions
* ''dimlet'': if this is enabled then there will be a dimlet that the player can find/create

Then there are a few tags for setting some of the dimlet attributes:

* ''rarity'': how rare is this dimlet. This decides the type of dimlet parts you need
* ''create'': creation cost in RF/t
* ''maintain'': maintenance cost in RF/t
* ''ticks'': the amount of ticks to add to the total dimension creation time
