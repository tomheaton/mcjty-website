---
sidebar_position: 1
---

# Episode 1

Back: [Index](./1.14-1.15-1.16.md)

=== IDEA Setup ===

Download the MDK from: https://files.minecraftforge.net/maven/net/minecraftforge/forge/index_1.14.2.html
Extract it somewhere and open 'build.gradle' as a project in IDEA (or Eclipse).
IDEA will now import the project.
After a moment it is ready, and then you can open the gradle task bar and run 'genIntellijRuns':

![Gradle window](https://i.imgur.com/TsjX2yA.png)

If all went well that should be it.

If you want to use this MDK as a base for a new mod you can make a new directory and copy the following files from the MDK to this new directory: gradle directory, src directory, gradlew, gradlew.bat, build.gradle, and gradle.properties.
Modify `build.gradle` to change the name of the mod.
Modify `src/main/resources/META-INF/mods.toml` likewise.

=== Basic Mod Class ===

There are many ways to structure your mod.
In this tutorial I'll explain how I choose to do it.

```
<syntaxhighlight lang="java">
// The value here should match an entry in the META-INF/mods.toml file
@Mod("mytutorial")
public class MyTutorial {

    public static final String MODID = "mytutorial";

    public static IProxy proxy = DistExecutor.runForDist(() -> () -> new ClientProxy(), () -> () -> new ServerProxy());

    public static ModSetup setup = new ModSetup();

    private static final Logger LOGGER = LogManager.getLogger();

    public MyTutorial() {
        // Register the setup method for modloading
        FMLJavaModLoadingContext.get().getModEventBus().addListener(this::setup);
    }

    private void setup(final FMLCommonSetupEvent event) {
        setup.init();
        proxy.init();
    }

    // You can use EventBusSubscriber to automatically subscribe events on the contained class (this is subscribing to the MOD
    // Event bus for receiving Registry Events)
    @Mod.EventBusSubscriber(bus = Mod.EventBusSubscriber.Bus.MOD)
    public static class RegistryEvents {
        @SubscribeEvent
        public static void onBlocksRegistry(final RegistryEvent.Register<Block> event) {
        }

        @SubscribeEvent
        public static void onItemsRegistry(final RegistryEvent.Register<Item> event) {
        }
    }
}
</syntaxhighlight>
```

A few important things in this.
The IProxy is something that is used to easily have code that can be run safely on client vs server.
On the server a lot of client classes (like for example Minecraft) are not available so if you have code using it be careful that it doesn't accidentally get used/needed on the server.
The IProxy can help with that.
You don't strictly need it as DistExecutor can do that for you too though.
It's a matter of taste mostly.

The listener we set up in the constructor will be fired after all blocks, items, biomes, potions, ... for all mods have been registered.
So when 'setup' is called we are sure that we can interface with all our blocks (and blocks from other mods if needed).

The RegistryEvents class is responsible for registering everything we need in our mod.
It can also be put in a separate class but in this tutorial we just do it like is shown in the MDK.

=== Our First Block ===

We create a new package called 'blocks' inside our project.
In that package make a new class called FirstBlock like this:

```
<syntaxhighlight lang="java">
public class FirstBlock extends Block {

    public FirstBlock() {
        super(Properties.create(Material.IRON)
                .sound(SoundType.METAL)
                .hardnessAndResistance(2.0f)
                .lightValue(14)
        );
        setRegistryName("firstblock");
    }
}
</syntaxhighlight>
```

The constructor sets up the block properties and also sets a registry name.
It may not always be the best spot to do this here.
Many people prefer setting the registry name in the registration call but for simple cases like this I prefer to do it here.
Again, a matter of taste mostly.

Then we need to add an entry to our main mod class inside the block register:

```
<syntaxhighlight lang="java">
    @Mod.EventBusSubscriber(bus = Mod.EventBusSubscriber.Bus.MOD)
    public static class RegistryEvents {
        @SubscribeEvent
        public static void onBlocksRegistry(final RegistryEvent.Register<Block> event) {
            event.getRegistry().register(new FirstBlock());
        }

        @SubscribeEvent
        public static void onItemsRegistry(final RegistryEvent.Register<Item> event) {
            Item.Properties properties = new Item.Properties()
                    .group(setup.itemGroup);
            event.getRegistry().register(new BlockItem(ModBlocks.FIRSTBLOCK, properties).setRegistryName("firstblock"));
        }
    }
</syntaxhighlight>
```

So we have to register both the block and a BlockItem.
The BlockItem is what will be used when the block is present in your inventory (because an inventory can only hold items, not blocks).
If you don't register such an item then the block can only exist in the world.

We also need to add a class where we store all references to our blocks.
Add a class called ModBlocks:

```
<syntaxhighlight lang="java">
public class ModBlocks {

    @ObjectHolder("mytutorial:firstblock")
    public static FirstBlock FIRSTBLOCK;
}
</syntaxhighlight>
```
The ObjectHolder annotation will be automatically recognized by Forge.
As soon as a block with the given name is registered this variable will get populated.
This can also be used to refer to `blocks/items/...` from other mods.
Note: I don't use the class scoped ObjectHolder annotation as I don't like the requirement that the fields have to be marked final then.
Just a personal preference.


At this point our block works, but it doesn't have a very nice look.
To fix that you need a blockstate json, a model, and a texture.
These files should all go in the assets folder (check the GitHub for exact location):

```json
{
  "variants": {
    "": { "model": "mytutorial:block/firstblock" }
  }
}
```

This is the blockstate.
It is very simple and will just refer to our model.

```json
{
  "parent": "block/cube_all",
  "textures": {
    "all": "mytutorial:block/firstblock"
  }
}
```

We also need a model for the item (as used in the inventory):

```json
{
  "parent": "mytutorial:block/firstblock"
}
```
