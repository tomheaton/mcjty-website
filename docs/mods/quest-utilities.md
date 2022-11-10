# Quest Utilities

This mod adds blocks that can help with custom maps.
It has blocks that can help compare items and screens to display quest objectives.

==Introduction==

All blocks in this mod have native Open Computers support.
Also, all blocks have an identifier that can be used to save and load state.
In the documentation below we refer to this state as the 'saveable state'.
More on this later.

==Blocks and Items==

Here is an overview of all items blocks in this mod.

===Control Key===

You need this item to open the GUI any of the blocks in this mod!
Players should not have this key.
It is meant for game operators only.

===Item Comparator===

The item comparator is a block with two internal inventories.
The left inventory contains 16 items and counts as a filter.
The right inventory also contains 16 items that can be piped in and out using automation.
When the right inventory (called the buffer) matches the filter (or has more items than the filter) this block will emit a redstone signal at the back (the side with the red arrow).

If you give this block a redstone signal it will dump all items in its inventory to another inventory above it.

The saveable state for this block is the filter.
The buffer will not be saved.

===Reward Chest===

This is like a chest that the user can interact with.
However, it also has an ID (only visible in the user interface if the UI was opened while holding a control key).
The contents of this chest can be saved and restored using the 'qu' commands (see below).

===Screen===

The Objective Screen is a multiblock screen that works roughly the same was as the RFTools screen.
Using the GUI you can toggle the screen between transparent or not and also increase the size from 1x1 upto 5x5.
It is also possible to set the background color of the screen in that GUI.

The screen features three areas:

* The title. This is a scaled up text
* The objective (up to 9 items or else a single png image)
* The status. Up to three lines of text

The text can be configured with color as well as left, center, or right alignment.
You can also control the color of the border put around the objective.

If you don't use items for the objective then you can also use an image.
To do this you need to use a resource location for the image (something like 'minecraft:water') for example, or you can use a PNG image in which case you also have to use a filename (input field under the resource location). If that filename starts with a '$' it is a relative location inside the config directory. Otherwise it is a path from the operating system.

The saveable state for this block is all the color information, the objectives and the text.

===Pedestal===

The pedestal is a simple block that can show an item floating above it.
It also supports the saveable state system and can be controlled with Open Computers.
It has 4 different modes (controllable from the GUI):

* Display: the player cannot interact with the pedestal
* Interact: the player can take and place items by right clicking the pedestal
* Place: the player can only place items
* Take: the player can only take items

The pedestal sends out a redstone signal if there is an item in it.

==Saving state==

Every block of this mod that has an identifier (which you can set in the GUI) can be saved to json.
It is good practice (but not required) to use scopes in the identifier.
For example, say you have different parts in your map then you could name your blocks with identifiers like: 'part1.reward1', 'part1.screenX', 'part2.collector' and so on.
By doing this it is easy to use wildcards in all the Quest Utils commands.
This allows you to (for example) save the state from all blocks for part1 in a single json and all blocks for part2 in another json.

Here are some examples:

* `/qu save part1.json part1.*`
* `/qu save part2.json part2.*`
* `/qu save everything.json`
* `/qu load part1.json`
* `/qu load part2.json`
* `/qu load everything.json part1.*`

All commands accept an optional radius parameter which can have any of the following three forms:

* `<radius>`
* `<x>,<y>,<z>@<radius>`
* `<x>,<y>,<z>,<dimension>@<radius>`

The first version is all matching blocks around the player that is performing the command.
The second version is all matching blocks around the given coordinate.
The last version is all matching blocks around the given coordinate in the given dimension.

Example:

* `/qu save file.json * 0,65,0@100`

Even if you saved everything in one single json you can still load part of it because the load command also supports the wildcard notation.
It will only load state for all blocks for which the identifier matches the input.

:::info Note
Files are saved in the config directory.
:::

You can also use `/qu list` (optionally with a matching regex or positional matcher) to find all blocks for this mod that have an identifier.

:::info Note
The `qu help` command can be used to get more info about these commands in-game.
:::
