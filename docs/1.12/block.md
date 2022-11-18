---
sidebar_position: 5
---

# Basic Block

In this document you learn how to do your first basic block. i.e. the simplest kind of block you can have: just a block that looks the same on all sides and does not have any other information.

More in-depth information on blocks can be found at the official forge documentation: https://mcforge.readthedocs.io/en/latest/blocks/blocks/
```
<syntaxhighlight lang="java">
public class FirstBlock extends Block {
    public FirstBlock() {
        super(Material.ROCK);
        setUnlocalizedName(ModTut.MODID + ".firstblock");     // Used for localization (en_US.lang)
        setRegistryName("firstblock");        // The unique name (within your mod) that identifies this block
    }
}
</syntaxhighlight>
```
Then it is recommended you have some centralized place where you place all your blocks. It is common to call this ModBlocks. In this tutorial we use the @GameRegistry.ObjectHolder to store references to your objects but this is not required. It just makes things easier:
```
<syntaxhighlight lang="java">
public class ModBlocks {

    @GameRegistry.ObjectHolder("modtut:firstblock")
    public static FirstBlock firstBlock;
}
</syntaxhighlight>
```

You will also need to register this block. This is done in CommonProxy. Registering our block will cause our 'firstBlock' variable to be initialized automatically through the ObjectHolder. In addition to the block we also need to register an ItemBlock so that it is possible to hold this block in your inventory. This is almost always needed:
```
<syntaxhighlight lang="java">
@Mod.EventBusSubscriber
public class CommonProxy {

    ...

    @SubscribeEvent
    public static void registerBlocks(RegistryEvent.Register<Block> event) {
        event.getRegistry().register(new FirstBlock());
    }

    @SubscribeEvent
    public static void registerItems(RegistryEvent.Register<Item> event) {
        event.getRegistry().register(new ItemBlock(ModBlocks.firstBlock).setRegistryName(ModBlocks.firstBlock.getRegistryName()));
    }

}
</syntaxhighlight>
```


This block will look very ugly (default checkerboard model) and do nothing but it is the minimal example.
