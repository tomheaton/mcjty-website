---
sidebar_position: 0
---
# Effects

## Introduction

Effects are what trinkets use. They can be things like a potion effect, a damage modification,
or some other examples. There are both positive and negative (harmful) effects.

## Details

**Location**: `data/<modid>/fancytrinkets/effects`

Effects form the most important resource of this mod. At the time of writing there
are currently 7 possible types of effects:

* `mobeffect`: one of the Minecraft (or modded) mob effects like regeneration, weakness, ...
* `potionresistance`: with this type the player will resist a negative potion effect (like weakness or blindness)
* `damagereduction`: using this type you can resist a percentage of damage for a give damage type
* `attribute`: buff or debuff on a specific attribute (like reach, attack damage, movements speed, ...)
* `flight`: gives creative flight
* `warp`: allows the player to warp (teleport) somewhere
* `cure`: removes all negative potion effects on the player
* `growtick`: do random ticks around the player. Increases growticks
* `trinketloot`: effect that can modify the loot given by chests or mobs

Effects can also have an associated `toggle` which allows them to be turned on or off
and effects can also have an associated `hotkey`. A hotkey doesn't imply that the
effect needs a toggle as well as a hotkey can also be a one-time usage (like with the
`warp` effect)

### General syntax

The general syntax for an effect is as follows:

```json
{
  "toggle": "<some name>",      // Optional
  "hotkey": <some number>,      // Optional
  "harmful": true,              // Optional
  "params": {
    "type": "<type>",           // Required: One of the types described above
    ...                         // Type specific parameters
  }
}
```

The name after the `toggle` represents the name of a boolean value that is kept with the player.
Usually when you specify this you also need a hotkey so that you can enable or disable
this.

The hotkey is a number between 1 and 8 (there are 8 possible hotkeys).

### `mobeffect`

Mobeffects correspond to potion effects. Here is an example:

```json
{
  "params": {
    "type": "mobeffect",
    "effectId": "minecraft:regeneration",
    "strength": 1
  }
}
```

The important type specific parameters are `effectId` and `strength`. The
`effectId` can be any vanilla or modded potion effect.

Here is another example for a nightvision effect that can be toggled with a hotkey:

```json
{
  "toggle": "night_vision",
  "hotkey": 1,
  "params": {
    "type": "mobeffect",
    "effectId": "minecraft:night_vision",
    "strength": 1
  }
}
```

### `potionresistance`

With the potion resistance effect you can resist negative potion effects. Here is
an example:

```json
{
  "params": {
    "type": "potionresistance",
    "effectId": "minecraft:poison"
  }
}
```

### `damagereduction`

With the damage reduction effect you can reduce damage from a specific damage source. The following
vanilla damage sources are supported:

* `inFire`
* `lightningBolt`
* `onFire`
* `lava`
* `hotFloor`
* `inWall`
* `cramming`
* `drown`
* `starve`
* `cactus`
* `fall`
* `flyIntoWall`
* `outOfWorld`
* `generic`
* `magic`
* `wither`
* `anvil`
* `fallingBlock`
* `dragonBreath`
* `dryout`
* `sweetBerryBush`
* `freeze`
* `fallingStalactite`
* `stalagmite`

Here is an example where wither damage is reduced 75%:

```json
{
  "params": {
    "type": "damagereduction",
    "damage": "wither",
    "factor": 0.25
  }
}
```

It's also possible to make a harmful version of this effect like this:

```json
{
  "harmful": true,
  "params": {
    "type": "damagereduction",
    "damage": "onFire",
    "factor": 1.25
  }
}
```

### `attribute`

With this effect you can buff or debuff various player attributes temporarily. The
following attributes are supported:

* `step_assist`
* `swim_speed`
* `attack_range`
* `reach_distance`
* `max_health`
* `knockback_resistance`
* `movement_speed`
* `attack_speed`
* `attack_damage`
* `luck`

The attribute effect has `amount` and `operation` parameters. With these you can control
what happens with the actual value of the attribute. The following operations are
supported:

* `addition`: add the given `amount` to the attribute value
* `multiply_base`: multiply base value with the given `amount`
* `multiply_total`: multiply the total value with the given `amount`

Here is an example of a health boost effect:

```json
{
  "params": {
    "type": "attribute",
    "amount": 8.0,
    "effectId": "max_health",
    "operation": "addition"
  }
}
```

And here is a harmful movement speed effect:

```json
{
  "harmful": true,
  "params": {
    "type": "attribute",
    "amount": 0.9,
    "effectId": "movement_speed",
    "operation": "multiply_total"
  }
}
```

### `flight`

The flight effect is very simple. It gives creative flight. It has no special parameters:

```json
{
  "params": {
    "type": "flight"
  }
}
```

### `warp`

The warp effect allows the player to teleport forward a configurable amount. It
needs a hotkey to properly function:

```json
{
  "hotkey": 2,
  "params": {
    "type": "warp",
    "maxdist": 40
  }
}
```

### `cure`

With the cure effect all negative potion effects will be canceled:

```json
{
  "params": {
    "type": "cure"
  }
}
```

### `growtick`

With the growtick effect you can increase random ticks around the player. This will
increase the speed at which crops grow.

```json
{
  "params": {
    "type": "growtick",
    "blocks": 15,
    "maxdist": 6
  }
}
```

`blocks` is the number of blocks that will be ticked and `maxdist` is how far it will do
this horizontally. Vertically it always goes from -3 to 3 around the player.

### `trinketloot`

With this effect a trinket can modify the loot that is given by chests or mobs. Here is an
example:

```json
{
  "params": {
    "type": "trinketloot",
    "tags": [
      "shiny"
    ],
    "loot": [
      {
        "stack": {
          "id": "minecraft:diamond"
        },
        "chance": 0.3,
        "min": 1,
        "max": 2
      },
      {
        "stack": {
          "id": "minecraft:diamond_block"
        },
        "chance": 0.1,
        "min": 1,
        "max": 1
      }
    ]
  }
}
```

For this to work loottables need to be modified with a datapack. This is not part of this mod but basically you
have to add something like this to the loot table json:

```json
{
  "type": "minecraft:chest",
  "pools": [
    {
      "bonus_rolls": 0.0,
      "entries": [
        {
          "type": "fancytrinkets:trinket_loot",
          "functions": [
            {
              "add": false,
              "count": {
                "type": "minecraft:uniform",
                "max": 2.0,
                "min": 0.0
              },
              "function": "minecraft:set_count"
            }
          ],
          "tags": [
            "shiny"
          ],
          "weight": 14
        },
        ...
      ]
    }
  ]
}
```

At least one tag from `tags` in the effect should match one of the tags in the loot table.

## Default effects

There are lot of default effects already included with the mod. You can find all of them
here (https://github.com/McJtyMods/FancyTrinkets/tree/1.19/src/generated/resources/data/fancytrinkets/fancytrinkets/effects).
Here is a short summary.

### Negative effects

* Potion effects like `weakness`, `blindness`, `slowness`, `mining_fatigue`, ...
* +25% damage increase effects like `dmg_infire_debuff`, `dmg_generic_debuff`, ...
* Negative attribute effects like `attack_range_debuff`, `max_health_debuff`, ...

### Positive effects

* Potion effects like `regeneration`, `strength`, `leviation`, ...
* Special effects like `warp`, `flight`, and `cure`
* Potion resist effects like `posion_resist`, `wither_resist`, ...
* Damage reduction effects like `dmg_infire_100`, `dmg_generic_75`, ...
* Positive attribute effects like `step_assist`, `minor_max_health`, `attack_damage`, ...

