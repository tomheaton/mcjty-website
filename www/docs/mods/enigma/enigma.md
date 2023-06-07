# Enigma

Enigma is a mod that is all about stories and adventures in Minecraft.
It gives you a simple programming language (called EnigmaScript) with which you can listen to various events and take control of various things in Minecraft.
Using this mod you can do various things but the most important purpose of this mod is to enable people to write scripts for stories and adventures.

## Introduction

To give a good idea of what is possible here is a list of some of the more important features:

* `Block interaction`: intercept interaction with blocks (right click/left click) and perform alternative actions when the player does this
* `Item interaction`: same for items
* `Playing sounds`: play sounds at specific times
* `Particle systems`: show particle systems
* `Player control`: move and rotate the player
* `Multiplayer support`: supports adventures for multiple players
* `Flexible language`: EnigmaScript is simple but still pretty flexible
* `World interaction`: break and set blocks in the world
* `Minecraft commands`: perform Minecraft console commands
* `Animation`: do various kinds of client side animations
* `Spawn mobs`: spawn mobs and give them armor and weapons

And much more.

## EnigmaScript

The core of Enigma is the EnigmaScript programming language.
This language is where you program all the rules that form your adventure.
As a language it resembles Python in some ways (but not all).

### Basic Principles

* `Syntax`: the basic syntax of EnigmaScript is like Python. That means that indentation is important to distinguish blocks of code. It is important to note that (just like Python) an actual tab character will go to the next multiple of 8. In general, it is recommended to use spaces as that is less confusing since a space is a space on any editor but tabs may be visualized differently.
* `Scopes`: the main control structure of EnigmaScript is a scope. In the next section we will explain scopes in more detail.
* `Events`: whenever something happens in Minecraft this can cause an event. In EnigmaScript you can listen to those events and perform some action based on those.
* `Types`: objects and variables are typed but EnigmaScript will almost always try to automatically convert types to the desired end result, so you usually don't have to bother about them.
* `States`: it is often handy to structure an adventure with 'states'. For example, each room of your world can be represented by a state. Or for each progress event in your adventure you can have a different state. There are global states that are valid for all players and there are states (called 'pstates') that are local to a player.
* `Persistent Objects`: there are various objects that are persistently stored with the world. That means that when you set them they will keep that value even if you quit and restart Minecraft. These objects are: states, positions, itemstacks, blocks, variables, and particle systems. For every player there are also player states and player variables.
* `Variables`: variables are one of the persistent objects. That means they are global and kept with the world. Variables can currently have five different types: integer, double, boolean, string, or position.
* `Player Variables`: player variables are like variables, but they are local to a player.
* `Local Variables`: there are also local variables that are only relevant in a single block of code. When that block stops executing those variables are lost.
* `Current Player`: various functions and commands need a player to work on. If there is no player they will fail. A player is only available in an event or scope if the event or scope is related to a player. For example, the event to right-click a block has a player since it will be a player that is doing that interaction. Therefor you can use player based functions and commands in the event handler for that. However, an activation event for a non-player scope typically has no player since those scopes are activated globally.

### Expressions

The expression parser in EnigmaScript is pretty general.
Here are a few example expressions to clarify what it can do:

* Basic expressions: `(3.14 * 2) / 10`
* Using global and local variables: `100 + $var`. Note that when evaluating a variable local variables will be checked first, then player variables and finally global variables. Keep that in mind when choosing variable names.
* Using functions: `sqrt(16) + max(1,10)`
* String expressions: `"testing" + fmt_green() + " (hello)"`
* Supported operators: `<`, `>`, `<=`, `>=`, `==`, `!=`, `+`, `-`, `*`, `/`, `%`, `^`, '!'

### Scopes

Scopes are the most important concept in EnigmaScript.
There are global scopes and player scopes.
Every scope has a unique identifier (just a name) and a condition.
So first a few rules:

* A scope is active if and only if all its parents are active and its condition is true.
* There is always a root scope, and it is always active.
* Player scopes are active if and only if all its parents are active and for every player where the given condition is true.
* Only when a scope (player or not) is active are the events and other scopes in that scope active.
* A player scope can be active multiple times for different players. A normal scope can only be active once.

So scopes are a way to control when some parts of your script should run and when not.
As said above the root scope is always active so in the root scope you would put events that you want to be active all the time.
Say you have a score variable in your game that you want to increase whenever the player right-clicks a flag.
If you put an event handler in the root scope for that then you can (in the code for that event handler) increase the score by one and remove the flag.

However, if you have a door that you only want to open when the player is ready for it then you can put the event handling for right-clicking that door in a scope that is only active when a certain state is set to a certain value.

### Scope Activation

Whenever a scope becomes active there are three possible initialization events that can occur.
Note that this is also valid for player scopes but there these events are considered per player/scope combination:

* `init`: this is called every time the scope is activated but only once per session. So if the player exits MC and starts playing again the 'init' events for active scopes will be called again. For the root scope this is called every time the game is loaded.
* `setup`: this is called the very first time a scope is activated. So for every scope (or every player/scope combination) this will be executed exactly once. For the root scope this will be called the very first time the game is loaded but not anymore after that.
* `activate`: this is called every time a scope is activated. For the root scope that is actually the same as 'setup' since the root scope is only activated once. Scopes that were active when the game is closed will remain active when the game is loaded again but the activate event will not be called again!

So what does that mean in practice?
Use 'setup' when you want to set up things that start at a given value but may end up changing during the game.
Since setup is not called again they will keep whatever value they are set at (states are a good example of this).
Use 'init' for things that you want to initialize in every session and use 'activate' for things that you want to happen every time the scope becomes active.
An example of this is a message that you want to tell to the player.

### References

Here are a few references for EnigmaScript:

* [Commands](./commands.md): A list of all commands and what they do
* [Functions](./functions.md): A list of all functions and what they do

## Console commands

Enigma has a number of console commands to help you debug and develop your stories:

* `e_states`: show all current states and player states in the console.
* `e_reset`: reset the current loaded script to its beginning situation. The 'init'/'setup'/'activate' events will fire again where appropriate.
* `e_reload`: reload the current loaded script from disk. This does not automatically do a reset!
* `e_load <script>`: load a new script from the 'enigma' directory (see below). From that point on this is the current script.
* `e_snapshot <file>`: remember the contents (blocks and tile entities) of all chunks around all named positions in your current script. That means that for every named position it will take the 3x3 chunks around that position and remember them in the given file. This file is stored in the 'enigma' directory.
* `e_restore <file>`: restore the snapshot. This is done in a smart way. Only the blocks that actually changed will be restored.
* `e_eval <expression>`: evaluate an EnigmaScript expression. This way you can expect variables, states and so on
* `e_action <action> <parameters...>`: execute an EnigmaScript action. Only state, pstate, var, pvar, give, setting, setblock, teleport, and kill are supported here.

## The `enigma` directory

You can keep story specific information in your world folder in the `enigma` directory.
For example an `autostart.esc` script which is loaded and executed when your world loads, and you can also store snapshots there.

## Built-in items and sounds

Todo!

## Examples

The following example is very simple game.
When you click a start block you get teleported to a maze where you have to collect as many diamond blocks as possible before the time runs out.
This example only supports a single player as it keeps the score global. See the next example where this is expanded for multiple players:

```python
on setup:
    position startblock 0 64 0 0
    position startmaze 100 64 0 0

    blockstate diamondblock:
        name "minecraft:diamond_block"
        meta 0

    blockstate air:
        name "minecraft:air"

    var score 0
    state main waiting

scope "waiting" state(main) == waiting:
    on rightclickposition startblock:
        state main game
        teleport startmaze
        cancel

scope "gamescope" state(main) == game:
    on delay 1000:
        state main theend

    on rightclickblock diamondblock:
        setblock $event_pos air
        var score $score+1
        sound $event_pos "entity.experience_orb.pickup"

scope "theend" state(main) == theend:
    on activate:
        message fmt_green() + "You got a score of: " + fmt_blue() + $score + "!" 300
```

Here is a version that supports multiple players.
A special trick is used here with a nested player scope.
As soon as one of the active players on the server right-clicks the start block the game will start for everyone.
This is because when the main state goes to `game` state the game scope will activate.
The nested `player_start` scope will also activate because it has a `true` condition that is always true (obviously).
So that means that upon activation of the game scope the `player_start` scope will also activate for every online player.
So this is a way to loop over all players.
The same happens at the end when all players will get a message with their final score:

```python
on setup:
    position startblock 0 64 0 0
    position startmaze 100 64 0 0

    blockstate diamondblock:
        name "minecraft:diamond_block"
        meta 0

    blockstate air:
        name "minecraft:air"

    state main waiting

scope "waiting" state(main) == waiting:

    on rightclickposition startblock:
        state main game
        cancel

scope "gamescope" state(main) == game:

    pscope "players_start" true:
        on activate:
            teleport startmaze
            pvar score 0

    on delay 1000:
        state main theend

    on rightclickblock diamondblock:
        setblock $event_pos air
        pvar score $score+1
        sound $event_pos "entity.experience_orb.pickup"

scope "theend" state(main) == theend:

    pscope "players_score" true:
        on activate:
            message fmt_green() + "You got a score of: " + fmt_blue() + $score + "!" 300
```

With a simple change it is also possible to only give the final score message to players that were actually present when the game started:

```python
scope "theend" state(main) == theend:

    pscope "players_score" $score > 0:
        on activate:
            message fmt_green() + "You got a score of: " + fmt_blue() + $score + "!" 300
```
