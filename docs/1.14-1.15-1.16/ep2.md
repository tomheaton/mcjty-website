---
sidebar_position: 2
---

# Episode 2

Back: [Index](/1.14-1.15-1.16/1.14-1.15-1.16.md)

=== Loot tables ===

In 1.14 blocks have no drops by default. You have to add a loot table entry to make sure that when the player harvests a block it will get loot. This can be done like this:
```
<syntaxhighlight lang="json">
{
  "type": "minecraft:block",
  "pools": [
    {
      "name": "pool1",
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "mytutorial:firstblock"
        }
      ],
      "conditions": [
        {
          "condition": "minecraft:survives_explosion"
        }
      ]
    }
  ]
}
</syntaxhighlight>
```
A few notes. In contrast with vanilla, modded loot table pools require a name. That's why there is 'pool1' there. This json also doesn't go to the assets folder like the blockstates and models. Instead it goes to the data folder. In this case in data/mytutorial/loot_tables/blocks

Loot tables are very powerful. You can customize this in many ways and in the future we will explain some more features related to this.

=== Recipe ===

We also want to make our block craftable. Again this requires a new json in the data folder:
```
<syntaxhighlight lang="json">
{
  "type": "minecraft:crafting_shaped",
  "pattern": [
    "xxx",
    "x#x",
    "xxx"
  ],
  "key": {
    "x": {
      "item": "minecraft:cobblestone"
    },
    "#": {
      "tag": "forge:dyes/red"
    }
  },
  "result": {
    "item": "mytutorial:firstblock"
  }
}
</syntaxhighlight>
```
If you have modded in 1.12 you probably remember the ore dictionary. This is now gone since vanilla has its own system (tags) for that.

=== Localisation ===

If you want to have proper names for your blocks and items you should add a language file. This goes in assets:
```
<syntaxhighlight lang="json">
{
    "block.mytutorial.firstblock": "First Block"
}
</syntaxhighlight>
```
=== Our first item ===

So now lets add our first simple item. Make a new package called 'items' and add a class called FirstItem there:
```
<syntaxhighlight lang="java">
public class FirstItem extends Item {

    public FirstItem() {
        super(new Item.Properties()
                .maxStackSize(1)
                .group(MyTutorial.setup.itemGroup));
        setRegistryName("firstitem");
    }
}
</syntaxhighlight>
```
Again, same principle as with blocks. Now lets register this in our main mod class:
```
<syntaxhighlight lang="java">
    @Mod.EventBusSubscriber(bus = Mod.EventBusSubscriber.Bus.MOD)
    public static class RegistryEvents {
        ...

        @SubscribeEvent
        public static void onItemsRegistry(final RegistryEvent.Register<Item> event) {
            ...
            event.getRegistry().register(new FirstItem());
        }

</syntaxhighlight>
```
Similar to blocks we also add a ModItems class where we keep all object holders:
```
<syntaxhighlight lang="java">
public class ModItems {

    @ObjectHolder("mytutorial:firstitem")
    public static FirstItem FIRSTITEM;
}
</syntaxhighlight>
```
Again to make it look nice we need a model and a texture:
```
<syntaxhighlight lang="json">
{
  "parent": "item/handheld",
  "textures": {
    "layer0": "mytutorial:item/firstitem"
  }
}
</syntaxhighlight>
```
And let us add a recipe as well:
```
<syntaxhighlight lang="json">
{
  "type": "minecraft:crafting_shaped",
  "pattern": [
    "XXX",
    " # ",
    " # "
  ],
  "key": {
    "#": {
      "item": "minecraft:stick"
    },
    "X": {
      "item": "mytutorial:firstblock"
    }
  },
  "result": {
    "item": "mytutorial:firstitem"
  }
}
</syntaxhighlight>
```