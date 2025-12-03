# Examples (1.20 and 1.21)

Sometimes it is best to explain things with examples.
In this section we will present many examples that you can use as a basis to make your own rules:

### Using areas for safe spawn

Using this in `areas.json` you can define a safe zone around spawn:

```json
[
  {
    "dimension": "minecraft:overworld",
    "name": "spawn",
    "type": "box",
    "x": 0,
    "y": 60,
    "z": 0,
    "dimx": 50,
    "dimy": 50,
    "dimz": 50
  }
]
```

And then in `spawn.json`:

```json
[
  {
    "hostile": true,
    "area": "spawn",
    "when": "onjoin",
    "result": "deny"
  }
]
```


### Phases for time control

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

### Spawns: allow only in plains biome

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

### Spawn: prevent all hostile mob spawns but allow spawn eggs and summon

This example prevents all hostile mob spawns. We use 'onjoin' here which is a much stronger test that normally
also prevents spawn eggs and summon from working. In this example we specifically allow those first:

```json title="spawn.json"
[
  {
    "hostile": true,
    "when": "onjoin",
    "spawntype": ["mob_summoned", "spawn_egg"],
    "result": "default"
  },
  {
    "hostile": true,
    "when": "onjoin",
    "result": "deny"
  }
]
```

### Spawn: prevent too many zombies

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

Prevent all zombies based on the total number of hostile mobs. i.e. no zombies spawn if there are
already more then 50 hostile mobs:

```json title="spawn.json"
[
  {
    "mob": "minecraft:zombie",
    "mincount": {
      "amount": 50,
      "hostile": true
    },
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

### Spawn: prevent all passive mobs in a dimension

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

### Spawn: allow some specific mobs only

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

### Spawn: allow based on height

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

### Spawn: beefed up mobs

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

### Loot examples

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

### Effect examples

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
    "dimension": "minecraft:the_nether",
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


### Right Click examples

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

### Events: spawn chickens when a cow is killed

In this example we spawn a random amount of chickens when a cow is killed:

```json
[
  {
    "on": "mob_killed",
    "parameters": {
      "mob": "minecraft:cow",
      "player": true
    },
    "conditions": {
      "dimension": "minecraft:overworld",
      "random": 0.3
    },
    "spawn": {
      "mob": "minecraft:chicken",
      "mindistance": 3,
      "maxdistance": 5,
      "mincount": 2,
      "maxcount": 3,
      "attempts": 20
    }
  }
]
```

### Events: spawn wither skeleton when diamond ore is broken 

In this example we possibly spawn a wither skeleton when we break a diamond ore block:

```json
[
  {
    "on": "block_broken",
    "parameters": {
      "block": {
        "block": "minecraft:diamond_ore"
      }
    },
    "conditions": {
      "dimension": "minecraft:overworld",
      "random": 0.3
    },
    "spawn": {
      "mob": "minecraft:wither_skeleton",
      "mindistance": 0,
      "maxdistance": 2,
      "attempts": 20,
      "norestrictions": true
    }
  }
]
```

### Spawner: spawn villagers in water

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

### Spawner: increase hostile mob spawns after day 20

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

### Spawner: advanced example, extra mobs in deserts

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

### Spawner: extra mobs in deserts on the surface but not in villages 

This example is similar to the previous one, but we demonstrate the usage of the new 'and' and 'not' format. This is more optimized and
means we no longer need rules in `spawn.json`:

```json title="spawner.json"
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
      "maxthis": 100,
      "and": {
        "biome": "minecraft:desert",
        "seesky": true
      },
      "not": {
        "structuretags": "minecraft:village"
      }
    }
  }
]
```


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
also say that we don't want to spawn any zombies in the first 5 days after starting the world. We have
to use "when": "onjoin" in these rules because `norestrictions` in `spawner.json`:

```json
[
  {
    "mob": "minecraft:zombie",
    "daycount": "lt(5)",
    "when": "onjoin",
    "result": "deny"
  },
  {
    "mob": "minecraft:zombie",
    "seesky": true,
    "when": "onjoin",
    "result": "default"
  },
  {
    "mob": "minecraft:zombie",
    "random": 0.8,
    "when": "onjoin",
    "result": "deny"
  }
]
```

Note. If you remove `norestrictions` then you can also use the default `position` check for `when` but in that
case you should probably use the result `allow` instead of `default` to bypass mob specific restrictions.

### Making a dangerous world after spawning a wither

As soon as a wither is spawned in the world we want to make the world more dangerous and start spawning wither skeletons.
First in `spawn.json` we detect if a wither is spawned and then we set the `wither` phase:

```json
[
  {
    "mob": "minecraft:wither",
    "when": "onjoin",
    "setphase": "wither",
    "result": "default"
  }
]
```

Then in `spawner.json` we start spawning wither skeletons as soon as the `wither` phase is set:

```json
[
  {
    "mob": "minecraft:wither_skeleton",
    "persecond": 5,
    "attempts": 20,
    "phase": "wither",
    "amount": {
      "minimum": 1,
      "maximum": 1
    },
    "conditions": {
      "dimension": "minecraft:overworld",
      "mindist": 20,
      "maxdist": 90,
      "minheight": -64,
      "maxheight": 256,
      "maxthis": 10
    }
  }
]
```

### Changing what a spawner spawns

In this example we change zombie spawners so that they spawn chickens instead:

In `spawn.json` we add a rule for spawns from zombies and send out a custom event called `chicken_instead`.
We use `deny_with_actions` as a result because we want to deny the spawn but still call the custom event action.

```json
  {
    "mob": "minecraft:zombie",
    "spawner": true,
    "customevent": "chicken_instead",
    "when": "onjoin",
    "result": "deny_with_actions"
  }
```

In `events.json` we add a rule for the custom event `chicken_instead` and we spawn a chicken instead of a zombie:

```json
  {
    "on": "custom",
    "parameters": {
      "name": "chicken_instead"
    },
    "conditions": {
      "dimension": "minecraft:overworld"
    },
    "spawn": {
      "mob": "minecraft:chicken",
      "mindistance": 0,
      "maxdistance": 2,
      "mincount": 1,
      "maxcount": 1,
      "attempts": 20,
      "norestrictions": true
    }
  }
```

### Spawning wither skeletons as soon as too many diamond ore blocks are mined

First we define an event to count whenever a diamond ore block is broken. Add this to
`events.json`:

```json
[
  {
    "on": "block_broken",
    "parameters": {
      "block": {
        "block": "minecraft:diamond_ore"
      }
    },
    "conditions": {
      "dimension": "minecraft:overworld"
    },
    "number": {
      "name": "diamonds",
      "value": "+1"
    }
  }
]
```

Instead of this we could also have added a rule to `breakevents.json` to count the number of diamonds:

```json
[
  {
    "block": "minecraft:diamond_ore",
    "changenumber": "diamonds=+1"
  }
]
```

Then in `spawner.json` we add spawning of wither skeletons as soon as the number is high enough:

```json
[
  {
    "mob": "minecraft:wither_skeleton",
    "number": {
      "name": "diamonds",
      "expression": "gt(100)"
    },
    "persecond": 1,
    "attempts": 20,
    "amount": {
      "minimum": 1,
      "maximum": 1
    },
    "conditions": {
      "dimension": "minecraft:overworld",
      "mindist": 20,
      "maxdist": 90,
      "minheight": -64,
      "maxheight": 256,
      "maxthis": 10
    }
  }
]
```