---
sidebar_position: 5
---
# Various

## Loot modifiers

**Location**: `data/<modid>/loot_modifiers/`

Using loot modifiers you can add essence loot or trinket loot to chests, entities, or other things that
have loot.

### The Essence Loot modifier

The essence loot modifier (type `fancytrinkets:essence_loot`) can be used to add essence.
In fact it is general enough that you could also use it for other items. Here is an
example on how to use it:

```json
{
  "type": "fancytrinkets:essence_loot",
  "chance": 0.3,
  "conditions": [
    {
      "condition": "forge:loot_table_id",
      "loot_table_id": "minecraft:entities/blaze"
    },
    {
      "condition": "minecraft:killed_by_player"
    }
  ],
  "item": "fancytrinkets:blaze_essence",
  "looting": 0.3,
  "max": 2,
  "min": 1
}
```

### The Trinket Loot Modifier

With the trinket loot modifier (type `fancytrinkets:trinket_loot`) you can generate random
trinkets of a certain quality. Here is an example. In this example we have a very small
chance to generate a random trinket (any trinket) with maximum quality of 10 (which is very
bad).

```json
{
  "type": "fancytrinkets:trinket_loot",
  "chance": 0.02,
  "conditions": [
    {
      "condition": "forge:loot_table_id",
      "loot_table_id": "minecraft:chests/bastion_bridge"
    }
  ],
  "looting": 0.0,
  "max": 1,
  "maxquality": 10.0,
  "min": 1,
  "minquality": 5.0,
  "trinkets": []
}
```

You can specify a specific list of trinkets inside the `trinkets` tag.

## Curios Tags

Curios also has some tags that you can use to control in what slots every trinket fits.

**Location**: `data/curios/tags/items/`

This is organized by type of the curios slot. The following slots are supported:

* `belt`
* `body`
* `bracelet`
* `charm`
* `head`
* `necklace`
* `ring`

Here is an example:

```json
{
  "values": [
    "fancytrinkets:heart",
    "fancytrinkets:star"
  ]
}
```
