# Functions

## Introduction

Here is a list of all supported functions:

## Formatting Functions

All these functions return a string and can be used inside other strings to control the appearance when used (for example) as a message on screen:

* `fmt_black()`: A string formatter. Include this in a string to get the desired result.
* `fmt_darkblue()`: A string formatter. Include this in a string to get the desired result.
* `fmt_darkgreen()`: A string formatter. Include this in a string to get the desired result.
* `fmt_darkaqua()`: A string formatter. Include this in a string to get the desired result.
* `fmt_darkred()`: A string formatter. Include this in a string to get the desired result.
* `fmt_darkpurple()`: A string formatter. Include this in a string to get the desired result.
* `fmt_gold()`: A string formatter. Include this in a string to get the desired result.
* `fmt_gray()`: A string formatter. Include this in a string to get the desired result.
* `fmt_darkgray()`: A string formatter. Include this in a string to get the desired result.
* `fmt_blue()`: A string formatter. Include this in a string to get the desired result.
* `fmt_green()`: A string formatter. Include this in a string to get the desired result.
* `fmt_aqua()`: A string formatter. Include this in a string to get the desired result.
* `fmt_red()`: A string formatter. Include this in a string to get the desired result.
* `fmt_lightpurple()`: A string formatter. Include this in a string to get the desired result.
* `fmt_yellow()`: A string formatter. Include this in a string to get the desired result.
* `fmt_white()`: A string formatter. Include this in a string to get the desired result.
* `fmt_bold()`: A string formatter. Include this in a string to get the desired result.
* `fmt_strikethrough()`: A string formatter. Include this in a string to get the desired result.
* `fmt_underline()`: A string formatter. Include this in a string to get the desired result.
* `fmt_italic()`: A string formatter. Include this in a string to get the desired result.
* `fmt_reset()`: A string formatter. Include this in a string to get the desired result.

## General functions

* `istr(v)`: Convert a possibly interned string to a real string. For efficiency purposes some internal strings (like state names) are interned to a hashed integer.
* `intern(v)`: Convert a string to an interned string (integer).
* `max(v,...)`: Return the maximum (the largest value) of the given values. Works for numbers and strings.
* `min(v,...)`: Return the minimum (the smallest value) of the given values. Works for numbers and strings.
* `str(v)`: Convert the value to a string.
* `int(v)`: Convert the value to an integer.
* `double(v)`: Convert the value to a double.
* `boolean(v)`: Convert the value to a boolean.
* `random()`: Return a random double between 0 and 1.
* `state(v)`: Return the value of the given state.
* `pstate(v)`: Return the value of the given player state.
* `substring(s,idx1[,idx2])`: Return a substring of the given string starting at idx1 and ending at the optional idx2 (exclusive).

## Block and item functions

* `isblock(position,block)`: Return true if the block at the given position is equal to the specific named blockstate (see the 'blockstate' command).
* `blockname(position)`: Return the name of the block at the given position if it is a defined blockname. If not then this returns the empty string.
* `blockid(position)`: Return the id of the block at the given position.
* `hasitem(item)`: Return true if the current player has the given named item in their inventory (see the 'itemstack' command).
* `hasitemmain(item)`: Return true if the current player has the given named item in their main hand (see the 'itemstack' command).
* `hasitemoff(item)`: Return true if the current player has the given named item in their offhand (see the 'itemstack' command).
* `itemstack(name[,amount[,meta]])`: Return an itemstack with the given item or block. This item or block should follow the standard `<modid>:<name>` convention (for example, 'minecraft:diamond'). You can use this function everywhere that you can otherwise use a named stack.
* `itemstack(namedstack)`: Directly get the itemstack from a named itemstack.

## Position based functions

Note that most of these functions also accept areas.
For example if you do `up(area,1)` you get a new area that is one higher.

* `distance(pos1[,pos2])`: Calculate the distance between the two positions. If 'pos2' is not given then this will calculate the distance between the given position and the current player.
* `pos(x,y,z[,dimension])`: Define a position for an optional dimension. If the dimension is not given then the dimension will depend on the presence of a current player. Without such a player the dimension will be 0 (overworld). Otherwise it will be the dimension where the current player is.
* `pos(namedpos)`: Directly get the named position and return it as a position for further manipulation. Note that most functions and commands that expect a position don't usually need this as they can work with named positions directly.
* `pos(mob)`: Get the position of an entity that is spawned from a named mob.
* `property(pos,name)`: Get the value of the given property at the given position. This can be used to get the value of a blockstate property.
* `playerpos()`: Return the position of the current player.
* `playername()`: Return the name of the current player.
* `getx(pos)`: Get the x component of the given position.
* `gety(pos)`: Get the y component of the given position.
* `getz(pos)`: Get the z component of the given position.
* `getdim(pos)`: Get the dimension of the given position.
* `down(pos,amount)`: Get a new position which is 'amount' blocks down.
* `up(pos,amount)`: Get a new position which is 'amount' blocks up.
* `north(pos,amount)`: Get a new position which is 'amount' blocks north.
* `south(pos,amount)`: Get a new position which is 'amount' blocks south.
* `west(pos,amount)`: Get a new position which is 'amount' blocks west.
* `east(pos,amount)`: Get a new position which is 'amount' blocks east.
* `mincorner(area)`: Return the minimum corner of an area.
* `maxcorner(area)`: Return the maximum corner of an area.
* `lookat(maxdist)`: See where the current player is looking at and return the position of the first block that it sees (within maximum distance).
* `posat(dist)`: See where the current player is looking at and return the position exactly 'dist' units away from the player.
* `yaw([<position>])`: With no parameter this returns the current 'yaw' rotation angle for the player. With a given position this will return that value as if the player was looking at the given position. This function is very useful for the 'fxanim rotate' animation command.
* `pitch([<position>])`: With no parameter this returns the current 'pitch' rotation angle for the player. With a given position this will return that value as if the player was looking at the given position. This function is very useful for the 'fxanim rotate' animation command.
* `inv_get(position,slot)`: Get the itemstack in the given slot of the inventory at the given position. This can be used to get the itemstack in a chest for example.
* `inv_getcount(position,slot)`: Get the count of the itemstack in the given slot of the inventory at the given position.
* `inv_count(position[,<item>])`: Get the number of items in the inventory at the given position. If the optional item parameter is given then this will only count the number of items that match the given item.


## Lost City Functions

Enigma has support for Lost Cities with the following functions:

* `lc_valid()`: Returns true if the player is in a Lost City world.
* `lc_floor0(pos)`: Returns the height of the first floor of a building at the given position.
