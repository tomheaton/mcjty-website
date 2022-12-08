---
sidebar_position: 4
---
# Experience Crafter

## Introduction

![Experience Crafter](../../assets/fancytrinkets/experience_crafter.png)

The Experience Crafter is a 5x5 crafting device that can also use XP in order to
determine the bonus effects on crafted trinkets.

![Experience Crafter](../../assets/fancytrinkets/experience_crafter_gui.png)

## Essence items

You can use the following essence items in your recipes if you want:

* ![icon](../../assets/fancytrinkets/essences/blaze_essence.png) Blaze Essence
* ![icon](../../assets/fancytrinkets/essences/chicken_essence.png) Chicken Essence
* ![icon](../../assets/fancytrinkets/essences/dragon_essence.png) Dragon Essence
* ![icon](../../assets/fancytrinkets/essences/enderman_essence.png) Enderman Essence
* ![icon](../../assets/fancytrinkets/essences/ghast_essence.png) Ghast Essence
* ![icon](../../assets/fancytrinkets/essences/iron_golem_essence.png) Iron Golem Essence
* ![icon](../../assets/fancytrinkets/essences/skeleton_essence.png) Skeleton Essence
* ![icon](../../assets/fancytrinkets/essences/spider_essence.png) Spider Essence
* ![icon](../../assets/fancytrinkets/essences/wither_essence.png) Wither Essence
* ![icon](../../assets/fancytrinkets/essences/wither_skeleton_essence.png) Wither Skeleton Essence
* ![icon](../../assets/fancytrinkets/essences/zombie_essence.png) Zombie Essence


## Defining recipes

**Location**: `data/<modid>/recipes/`

To specify a recipe for the Experience Crafter you have to use the `fancytrinkets:xprecipe` recipe
type.

Example recipe:

```json
{
  "type": "fancytrinkets:xprecipe",
  "key": {
    "S": {
      "type": "forge:partial_nbt",
      "item": "fancytrinkets:gold_ring",
      "nbt": "{id:\"fancytrinkets:base_gold_ring\"}"
    },
    "f": {
      "item": "fancytrinkets:iron_golem_essence"
    },
    "g": {
      "item": "fancytrinkets:blaze_essence"
    },
    "t": {
      "item": "minecraft:ghast_tear"
    }
  },
  "pattern": [
    "gfgfg",
    "ftgtf",
    "ggSgg",
    "ftgtf",
    "gfgfg"
  ],
  "result": {
    "item": "fancytrinkets:gold_ring",
    "nbt": {
      "id": "fancytrinkets:fireresist_ring"
    }
  }
}
```