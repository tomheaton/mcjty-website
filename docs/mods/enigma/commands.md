# Commands

## Introduction

An overview of all commands that you can use in EnigmaScript:

## Scope Commands

There are only four commands that are allowed in a scope:

* `scope <id> <expression>`: This command starts a new scope for the given unique ID. The scope is active when the given expression returns true.
* `pscope <id> <expression>`: This command starts a new player scope for every active player and with the given unique ID.
* `on <event> [<parameters>]`: Define a bit of code that will be executed when a certain event happens provided the parent scope is active.
* `block <name>`: Use this to define a block of code that you can call (using the 'call' command) from different places. A block of code has to be defined in the current scope or one of the parent scopes. It will start looking in the current scope first and then go through all parents until it comes to the root. Blocks that are defined in the root scope are available everywhere.

## Supported Events

The following events are supported (used for the 'on' command):

* `setup`: Fired the very first time a scope is activated. If it is a player scope then this will be fired for every player for that scope. But only once (even accross sessions).
* `init`: Fired the very first time a scope is activated for a session. If it is a player scope then this will be fired for every player for that scope.
* `activate`: Fired every time a scope is activated. If it is a player scope then this will be fired for every player for that scope.
* `deactivate`: Fired every time a scope is deactivated. If it is a player scope then this will be fired for every player for that scope.
* `login`: Fired when a player logs into the game.
* `death`: Fired when a player dies. You can cancel this event and the player will not die, but it is probably best to restore some live ('hp') first.
* `rightclickblock <blockname>`: Fired when the player rightclicks the given named block. The local var `$event_pos` will be set to the position of the clicked block.
* `leftclickblock <blockname>`: Fired when the player leftclicks the given named block. The local var `$event_pos` will be set to the position of the clicked block.
* `rightclickposition <position>`: Fired when the player rightclicks the given position. This position can be given directly using the `pos()` function or else using a named position (see the 'position' command).
* `leftclickposition <position>`: Fired when the player leftclicks the given position. This position can be given directly using the `pos()` function or else using a named position (see the 'position' command).
* `rightclickitem <item>`: Fired when the player rightclicks with an item in their hand. The item is given using a named item (see the 'itemstack' command).
* `delay <ticks>`: Fired after `<ticks>` ticks after a scope activates. Note that when the scope deactivates before that time has passed then this will not be fired.
* `repeat <ticks>`: Like delay but fires every `<ticks>` ticks after a scope activates for as long as the scope remains active.

## Action Commands

The following commands are supported in action blocks (in an event for example).

General commands:

* `state <name> <value>`: Set the given state to the given value.
* `pstate <name> <value>`: Set the given player state to the given value. This needs an active player.
* `var <name> <value>`: Set the variable to a certain value (integer, double, boolean, string, position, area). This is a persisted value and rembered in the world save.
* `pvar <name> <value>`: Set the player variable to a certain value (integer, double, boolean, string, position, area). This is a persisted value and rembered in the world save for the current player.
* `local <name> <value>`: Set a local variable to a certain value. this is only present in the current code block.
* `restore <snapshot>`: Restore a previously saved snapshot (with the 'e_snapshot' console command). This can be used to initialize the game with a given known setup.
* `command <command`: Execute a console command. The given command must be a single string containing the command and its parameters. This can be used (for example) to force survival gamemode for a player or control the time of the day and the weather.
* `cancel`: Cancel the current event (if supported by that event). For example, in the 'rightclickblock' event this will cancel further placing of the block or interacting with the block.
* `log <string>`: Useful for debugging. Log a message on the console.
* `message <string> [<timeout>]`: Send a message to the player (on screen).
* `hp <value>`: Set the hit points of the current player.

----

Setting commands:

* ``setting <setting> [<parameter>...]``:  Control a setting.

Supported settings:

* `setting chat <true/false>`: Enable/disable chat messages. If you set this to false then chat messages will disappear for the current player. Keep in mind that this prevents ALL chat messages so if you are debugging on a story you may want to enable this again (using 'e_action setting chat true' for example).

----

Control commands:

* `if <expression>`: Execute the action block that follows after this command if the expression is true.
* `else`: Use this in combination with 'if'.
* `delay <ticks>`: Execute the action block following this statement after the specified amount of ticks. Note that (if possible) this action block is called from within the current scope. That means that if the scope deactivates before the delay then this will not execute.
* `call <name>`: Call a previously defined block of code (using 'block') in the current scope or any of the parent scopes. When that code has finished executing resume execution here.

----

Item, block, particle and sound commands:

* `itemstack <name>`: Define a new itemstack. A definition block should directly follow after this statement with the following possible values: 'name' (a name like minecraft:diamond), 'meta', 'amount', and 'description'.
* `blockstate <name>`: Define a new blockstate. A definition block should directly follow after this statement with the following possible values: 'name' and 'meta'.
* `createparticles <name>`: Define a new particle system. A definition block should directly follow after this statement with the following possible values: 'name', 'speed', 'amount', and 'offset'.
* `mob <name>`: Define a new mob config. A definition block should directly follow after this statement with the following possible values: 'name', 'tag, 'aggressive', 'damage', 'hp', 'item', 'helmet', 'chestplate', 'leggings', and 'boots'. The optional 'tag' can be used to identify the mob (for example to use with the 'kill' command).
* `kill <name>`: Kill all mobs from the given mob name or all mobs that have the specified tag.
* `give <item>`: Give the defined itemstack to the current player.
* `drop <item> <position>`: Drop the defined itemstack at the specific position.
* `take <item>`: Take one defined itemstack from the player.
* `takeall <item>`: Take all items of the given itemstack type from the player.
* `setblock <position/area> <block>`: Set a specific defined block (with blockstate) at the given position. The position can also be an area in which case the entire area will be filled.
* `setmimic <position/area> <block>`: Set a 'mimic' block at the given position that mimics the defined block. A mimic block is a special block that (by default) just looks the same as the block it mimics but you can do some special things with it (like moving it at any position (i.e. between block positions) using the fxanim moveblock command). The position can also be an area in which case the entire area will be set to the mimic.
* `mimicarea <position/area> <destination>`: Mimic an area at another position. This will create mimic blocks at the destination. These blocks can be cleared by replacing them with air for example.
* `copyblocks <area> <destination>`: Copy all blocks from the area to the destination. The bottom-left corner of the input area will be positioned exactly at the destination.
* `moveblocks <area> <destination>`: Move all blocks from the area to the destination. The bottom-left corner of the input area will be positioned exactly at the destination. The blocks will be removed from the source.
* `particle <position> <name>`: Create the named particle system at the position.
* `sound <position> <sound>`: Create a sound at the given position. The sound name should be a sound name as defined in minecraft or in your assets. For example 'minecraft:entity.endermen.teleport'
* `spawn <position> <mob>`: Spawn a named mob at the given position (see 'mob' on how to define mobs)

----

Position based commands:

* `position <name> <x> <y> <z> <dim>`: Define a named position.
* `area <name> <x1> <y1> <z1> <x2> <y2> <z2> <dim>`: Define a named area. This is a rectangular area given with a bottom-left corner and a top-right corner.
* `area <name> <position1> <position2>`: Define a named area based on two named positions.
* `lookat <position>`: Let the current player look at a position. The position can be a named position or a direct position (from the pos() function or related).
* `teleport <position>`: Teleport the current player to the given position.

----

Client side animation. With the 'fxanim' command one can do client side animation for various special effects. These animations only run on the client so if you move a player using this make sure to also do this on the server:

* `fxanim <animation> [<parameters>]`: Perform a client side animation for a given time.

Supported animations:

* `fxanim move <ticks> <start> <end>`: Move the player from the 'start' position to the 'end' position for the duration of the specified amount of ticks. This is only a client-side effect!
* `fxanim rotate <ticks> <startyaw> <startpitch> <endyaw> <endpitch>`:  Rotate the player using the given start and end yaw and pitch.
* `fxanim color <ticks> <a1> <r1> <g1> <b1> <a2> <r2> <g2> <b2>`: Animate a full screen overlay with the given color. A color is given with an alpha value (0 means totally transparent and thus invisible and 1 means totally opaque) and an r,g,b value (in the range from 0 to 1). Note that after this animation sequence finishes the overlay will be kept on the last set value. If you don't want that you must make sure you use another fxanim command (with a single tick) to set the color back to disabled (0,0,0,0 value).
* `fxanim colorandback <ticks> <a1> <r1> <g1> <b1> <a2> <r2> <g2> <b2>`: Similar to color but this will repeat the cycle in reverse order so the end result is equal to the start again. The entire cycle still takes only the specified amount of ticks.
* `fxanim movemimic <ticks> <start> <dx> <dy> <dz>`: The start position should point to a position or area that contains a mimic block. This animation will (client-side only) change where that mimic block will render giving it the appearance of moving smoothly. Note that the block doesn't actually move so you may want to actually move the block when the client side animation has finished.
* `fxanim colormimic <ticks> <mimicpos> <r1> <g1> <b1> <r2> <g2> <b2>`: Animate the color of a block or area. Fully opaque is 1,1,1. To make it fully transparent use 0,0,0.
* `fxanim resetmimic <pos>`: Reset a mimic at the given position or area to default settings (color/alpha/position)
