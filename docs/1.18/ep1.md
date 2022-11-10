---
sidebar_position: 1
---

# Episode 1

## Links

* Video: [Basic Project Setup, first mod, first blocks, datageneration](https://www.youtube.com/watch?v=BGzAbutqlyY&ab_channel=JorritTyberghein)
* [Back to 1.18 Tutorial Index](./1.18.md)
* [Tutorial GitHub](https://github.com/McJty/TutorialV3)

## Introduction

This tutorial covers the basic project setup, the mod class as well as the first blocks.
If some code in here is not clear or not complete you can always refer to the GitHub as well.

### Basic Project Setup

To start your own mod the easiest way is to download the latest Forge MDK from [the Forge download site](https://files.minecraftforge.net/net/minecraftforge/forge/) and extract it to some temporary folder.
Then make a new directory for your own mod and copy over the following files from the MDK:

* The `gradle` folder
* The `src` folder
* `gradlew.bat` and `gradlew`
* `build.gradle` and `gradle.properties`
* `.gitignore`

Then open `build.gradle` in your IDE (IntelliJ for example) as a project(!). Make sure to set the Java to JDK 17!

You probably want to change your modid.
This should be a lowercase identifier containing only characters, digits and possibly an underscore.
These are the places where you have to change the modid:

* `build.gradle`
* `src/main/resources/META-INF/mods.toml`
* The main mod file. In the MDK that's called 'ExampleMod' but you can rename it to a better name. Also, probably rename the package

## JEI and TOP dependencies

For development, it's nice to have JEI and TOP available.
To do that you can change the following in your `build.gradle`.
First change the `repositories` like this:

```gradle
repositories {
    // Put repositories for dependencies here
    // ForgeGradle automatically adds the Forge maven and Maven Central for you

    maven { // JEI
        url "https://dvs1.progwml6.com/files/maven"
    }
    maven { // TOP
        url "https://cursemaven.com"
    }
}
```

Then change `dependencies` to this:

```gradle
dependencies {
    // Specify the version of Minecraft to use. If this is any group other than 'net.minecraft', it is assumed
    // that the dep is a ForgeGradle 'patcher' dependency, and its patches will be applied.
    // The userdev artifact is a special name and will get all sorts of transformations applied to it.
    minecraft 'net.minecraftforge:forge:1.18.1-39.0.5'

    compileOnly fg.deobf("mezz.jei:jei-${jei_version}:api")
    implementation fg.deobf("mezz.jei:jei-${jei_version}")

    implementation fg.deobf("curse.maven:the-one-probe-245211:3550084")
}
```

After making all these changes you need to refresh gradle ('gradle' tab on the top right)

### Generating the runs

To be able to run Minecraft from within IntelliJ you can also need to run the 'genIntellijRuns' task (also in the gradle tab).
This will generate 'runClient', 'runServer', and 'runData' targets. For now, we'll use 'runClient' mostly.
Try it out and if all went well you should see Minecraft If this was successful you should see something like this:

:::danger Warning
Make sure that you're using Java 17!
:::

![image](https://i.imgur.com/ktUCq7P.png)

### The Basic Mod Class

There are many ways to structure your mod.
In this tutorial we will try to keep our main mod class small and do all needed setup in helper classes.
So here is our main mod class:

```java
@Mod(TutorialV3.MODID)
public class TutorialV3 {

    private static final Logger LOGGER = LogManager.getLogger();
    public static final String MODID = "tutorialv3";

    public TutorialV3() {

        // Register the deferred registry
        Registration.init();

        // Register the setup method for modloading
        IEventBus modbus = FMLJavaModLoadingContext.get().getModEventBus();
        // Register 'ModSetup::init' to be called at mod setup time (server and client)
        modbus.addListener(ModSetup::init);
        // Register 'ClientSetup::init' to be called at mod setup time (client only)
        DistExecutor.unsafeRunWhenOn(Dist.CLIENT, () -> () -> modbus.addListener(ClientSetup::init));
    }
}
```

In addition, we also add a new 'setup' package with the following three java classes in it (put every class in its own java file with the same name as the class):

```java
public class Registration {
}

public class ModSetup {
    public static void init(final FMLCommonSetupEvent event) {
    }
}

@Mod.EventBusSubscriber(modid = TutorialV3.MODID, value = Dist.CLIENT, bus = Mod.EventBusSubscriber.Bus.MOD)
public class ClientSetup {
    public static void init(final FMLClientSetupEvent event) {
    }
}
```

### Minecraft Concepts

In the following image there are three columns:

* `Definitions`: these are objects of which there is only one instance in the game. There is (for example) only one diamond sword. If you have two diamond swords in your inventory they are two different '''ItemStack''' instances referring to the same diamond sword item instance. This is important!
* `Inventory`: all objects in an inventory (player or other containers) are represented with ItemStacks. An ItemStack is an actual in-game instance of an item. Note: in order to be able to hold blocks in your inventory the block needs a corresponding item
* `World`: when blocks are placed in the world they are placed as a `BlockState`. A BlockState is a specific configuration of a block. For example, a furnace can have six orientations. Those are six different blockstates. In addition, a furnace can also be powered or not. So that means in total 12 different blockstates. '''Block Entities''' are objects that help extend blocks in the world to be able to hold more information (like inventory) as well as do things (tick).

![image](https://i.imgur.com/S1EQwrm.png)

### First Simple Blocks

In this section we will add four new blocks. These blocks represent four different variants of an ore that we will be adding in this mod.

![image](https://i.imgur.com/bzbNZac.png)

Add this code to the Registration class:

```java
public class Registration {

    private static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(ForgeRegistries.BLOCKS, MODID);
    private static final DeferredRegister<Item> ITEMS = DeferredRegister.create(ForgeRegistries.ITEMS, MODID);

    public static void init() {
        IEventBus bus = FMLJavaModLoadingContext.get().getModEventBus();
        BLOCKS.register(bus);
        ITEMS.register(bus);
    }

    // Some common properties for our blocks and items
    public static final BlockBehaviour.Properties BLOCK_PROPERTIES = BlockBehaviour.Properties.of(Material.STONE).strength(2f).requiresCorrectToolForDrops();
    public static final Item.Properties ITEM_PROPERTIES = new Item.Properties().tab(ModSetup.ITEM_GROUP);


    public static final RegistryObject<Block> MYSTERIOUS_ORE_OVERWORLD = BLOCKS.register("mysterious_ore_overworld", () -> new Block(BLOCK_PROPERTIES));
    public static final RegistryObject<Item> MYSTERIOUS_ORE_OVERWORLD_ITEM = fromBlock(MYSTERIOUS_ORE_OVERWORLD);
    public static final RegistryObject<Block> MYSTERIOUS_ORE_NETHER = BLOCKS.register("mysterious_ore_nether", () -> new Block(BLOCK_PROPERTIES));
    public static final RegistryObject<Item> MYSTERIOUS_ORE_NETHER_ITEM = fromBlock(MYSTERIOUS_ORE_NETHER);
    public static final RegistryObject<Block> MYSTERIOUS_ORE_END = BLOCKS.register("mysterious_ore_end", () -> new Block(BLOCK_PROPERTIES));
    public static final RegistryObject<Item> MYSTERIOUS_ORE_END_ITEM = fromBlock(MYSTERIOUS_ORE_END);
    public static final RegistryObject<Block> MYSTERIOUS_ORE_DEEPSLATE = BLOCKS.register("mysterious_ore_deepslate", () -> new Block(BLOCK_PROPERTIES));
    public static final RegistryObject<Item> MYSTERIOUS_ORE_DEEPSLATE_ITEM = fromBlock(MYSTERIOUS_ORE_DEEPSLATE);

    // Conveniance function: Take a RegistryObject<Block> and make a corresponding RegistryObject<Item> from it
    public static <B extends Block> RegistryObject<Item> fromBlock(RegistryObject<B> block) {
        return ITEMS.register(block.getId().getPath(), () -> new BlockItem(block.get(), ITEM_PROPERTIES));
    }
}
```

The DeferredRegister is a very easy way to handle registration of various objects in the Minecraft game (blocks, items, containers, dimensions, entities, ...). It's important to note that in this register we will always register singletons. i.e. the objects in the 'Definition' column of our previous image. For every object that we want to add to our mod we declare a RegistryObject and then register it on the appropriate deferred register. In that registration we also give a supplier (lambda) to actually generate the instance of our registry object at the appropriate time.

Note: objects are registered pretty early. That means that at the time the FMLCommonSetupEvent is fired all objects from all mods will be registered and ready.

Note how we make a corresponding item (using BlockItem) for every block. That's because we need to be able to hold these blocks in our inventory (in case someone does silk touch on them).

In this specific example we use the standard vanilla Block and Item classes. Later we will show you how you can make your own custom blocks and items using subclasses.

We also need to add a new creative tab to ModSetup like this:

```java
public static final String TAB_NAME = "tutorialv3";

public static final CreativeModeTab ITEM_GROUP = new CreativeModeTab(TAB_NAME) {
    @Override
    public ItemStack makeIcon() {
        return new ItemStack(Registration.MYSTERIOUS_INGOT.get());
    }
};
```

### Data Generation

If we run our mod now you will see that the blocks and items are not correctly textured and that the blocks don't have a good name. To fix that we need to make models and a bunch of other jsons. We will be using data generation to generate those as that's the most flexible way to do things. With only a small mod it may not seem very beneficial to do this but in the end it's a very nice technique and will help you avoid many errors caused by hand-written jsons.

First make a datagen package and create the following class in it:

![image](https://i.imgur.com/pLm4syY.png)

```java
@Mod.EventBusSubscriber(modid = TutorialV3.MODID, bus = Mod.EventBusSubscriber.Bus.MOD)
public class DataGenerators {

    @SubscribeEvent
    public static void gatherData(GatherDataEvent event) {
        DataGenerator generator = event.getGenerator();
        if (event.includeServer()) {
            generator.addProvider(new TutRecipes(generator));
            generator.addProvider(new TutLootTables(generator));
            TutBlockTags blockTags = new TutBlockTags(generator, event.getExistingFileHelper());
            generator.addProvider(blockTags);
            generator.addProvider(new TutItemTags(generator, blockTags, event.getExistingFileHelper()));
        }
        if (event.includeClient()) {
            generator.addProvider(new TutBlockStates(generator, event.getExistingFileHelper()));
            generator.addProvider(new TutItemModels(generator, event.getExistingFileHelper()));
            generator.addProvider(new TutLanguageProvider(generator, "en_us"));
        }
    }
}
```

![image](https://i.imgur.com/o7hgFpp.png)

```java
@Mod.EventBusSubscriber(modid = TutorialV3.MODID, bus = Mod.EventBusSubscriber.Bus.MOD)
public class DataGenerators {

    @SubscribeEvent
    public static void gatherData(GatherDataEvent event) {
        DataGenerator generator = event.getGenerator();
        generator.addProvider(event.includeServer(), new TutRecipes(generator));
        generator.addProvider(event.includeServer(), new TutLootTables(generator));
        TutBlockTags blockTags = new TutBlockTags(generator, event.getExistingFileHelper());
        generator.addProvider(event.includeServer(), blockTags);
        generator.addProvider(event.includeServer(), new TutItemTags(generator, blockTags, event.getExistingFileHelper()));
        generator.addProvider(event.includeClient(), new TutBlockStates(generator, event.getExistingFileHelper()));
        generator.addProvider(event.includeClient(), new TutItemModels(generator, event.getExistingFileHelper()));
        generator.addProvider(event.includeClient(), new TutLanguageProvider(generator, "en_us"));
    }
}
```

This class uses the `@Mod.EventBusSubscriber` annotation to ensure that it will be registered on the correct bus for receiving `GatherDataEvent` events. This event is fired when your mod is started using the 'runData' profile. This is a special mode where there will be no normal Minecraft screen but objects are registered as usual and then GatherDataEvent is fired giving this event a chance to generate jsons. These jsons will be generated in the 'generated' folder in your project. Don't make manual changes inside that folder because they will be overwritten whenever you do this generation again!

:::danger Warning
Whenever you use an annotation like `@Mod.EventBusSubscriber` on a class all 'event' methods (methods that use `@SubscribeEvent`) need to be static!
Otherwise, they will not do anything.
:::

:::danger Warning
In a class annotated with `@Mod.EventBusSubscriber` all methods that are annotated with `@SubscribeEvent` need to be static and public!
:::

We need various other classes in this package. Make all of these:

```java
public class TutBlockStates extends BlockStateProvider {

    public TutBlockStates(DataGenerator gen, ExistingFileHelper helper) {
        super(gen, TutorialV3.MODID, helper);
    }

    @Override
    protected void registerStatesAndModels() {
        simpleBlock(Registration.MYSTERIOUS_ORE_OVERWORLD.get());
        simpleBlock(Registration.MYSTERIOUS_ORE_NETHER.get());
        simpleBlock(Registration.MYSTERIOUS_ORE_END.get());
        simpleBlock(Registration.MYSTERIOUS_ORE_DEEPSLATE.get());
    }
}


public class TutItemModels extends ItemModelProvider {

    public TutItemModels(DataGenerator generator, ExistingFileHelper existingFileHelper) {
        super(generator, TutorialV3.MODID, existingFileHelper);
    }

    @Override
    protected void registerModels() {
        withExistingParent(Registration.MYSTERIOUS_ORE_OVERWORLD_ITEM.getId().getPath(), modLoc("block/mysterious_ore_overworld"));
        withExistingParent(Registration.MYSTERIOUS_ORE_NETHER_ITEM.getId().getPath(), modLoc("block/mysterious_ore_nether"));
        withExistingParent(Registration.MYSTERIOUS_ORE_END_ITEM.getId().getPath(), modLoc("block/mysterious_ore_end"));
        withExistingParent(Registration.MYSTERIOUS_ORE_DEEPSLATE_ITEM.getId().getPath(), modLoc("block/mysterious_ore_deepslate"));
    }
}

public class TutBlockTags extends BlockTagsProvider {

    public TutBlockTags(DataGenerator generator, ExistingFileHelper helper) {
        super(generator, TutorialV3.MODID, helper);
    }

    @Override
    protected void addTags() {
        tag(BlockTags.MINEABLE_WITH_PICKAXE)
                .add(Registration.MYSTERIOUS_ORE_OVERWORLD.get())
                .add(Registration.MYSTERIOUS_ORE_NETHER.get())
                .add(Registration.MYSTERIOUS_ORE_END.get())
                .add(Registration.MYSTERIOUS_ORE_DEEPSLATE.get());
        tag(BlockTags.NEEDS_IRON_TOOL)
                .add(Registration.MYSTERIOUS_ORE_OVERWORLD.get())
                .add(Registration.MYSTERIOUS_ORE_NETHER.get())
                .add(Registration.MYSTERIOUS_ORE_END.get())
                .add(Registration.MYSTERIOUS_ORE_DEEPSLATE.get());
        tag(Tags.Blocks.ORES)
                .add(Registration.MYSTERIOUS_ORE_OVERWORLD.get())
                .add(Registration.MYSTERIOUS_ORE_NETHER.get())
                .add(Registration.MYSTERIOUS_ORE_END.get())
                .add(Registration.MYSTERIOUS_ORE_DEEPSLATE.get());
    }

    @Override
    public String getName() {
        return "Tutorial Tags";
    }
}

public class TutItemTags extends ItemTagsProvider {

    public TutItemTags(DataGenerator generator, BlockTagsProvider blockTags, ExistingFileHelper helper) {
        super(generator, blockTags, TutorialV3.MODID, helper);
    }

    @Override
    protected void addTags() {
        tag(Tags.Items.ORES)
                .add(Registration.MYSTERIOUS_ORE_OVERWORLD_ITEM.get())
                .add(Registration.MYSTERIOUS_ORE_NETHER_ITEM.get())
                .add(Registration.MYSTERIOUS_ORE_END_ITEM.get())
                .add(Registration.MYSTERIOUS_ORE_DEEPSLATE_ITEM.get());
    }

    @Override
    public String getName() {
        return "Tutorial Tags";
    }
}

public class TutLanguageProvider extends LanguageProvider {

    public TutLanguageProvider(DataGenerator gen, String locale) {
        super(gen, TutorialV3.MODID, locale);
    }

    @Override
    protected void addTranslations() {
        add("itemGroup." + TAB_NAME, "Tutorial");
        add(Registration.MYSTERIOUS_ORE_OVERWORLD.get(), "Mysterious ore");
        add(Registration.MYSTERIOUS_ORE_NETHER.get(), "Mysterious ore");
        add(Registration.MYSTERIOUS_ORE_END.get(), "Mysterious ore");
        add(Registration.MYSTERIOUS_ORE_DEEPSLATE.get(), "Mysterious ore");
    }
}

public class TutRecipes extends RecipeProvider {

    public TutRecipes(DataGenerator generatorIn) {
        super(generatorIn);
    }

    @Override
    protected void buildCraftingRecipes(Consumer<FinishedRecipe> consumer) {
    }
}

public class TutLootTables extends BaseLootTableProvider {

    public TutLootTables(DataGenerator dataGeneratorIn) {
        super(dataGeneratorIn);
    }

    @Override
    protected void addTables() {
    }
}

```

For `BaseLootTableProvider` I recommend you check the [GitHub](https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/datagen/BaseLootTableProvider.java).
This is a large class that is not really useful to paste here.

For now the only datagen that we're doing is for the block models, item models, tags and language keys.
If you run 'runData' from your IDE and if all is well these files should now be generated.

A special note about the tags.
In order for a block to be harvestable with an iron pickaxe you need to add your block to the vanilla tags `MINEABLE_WITH_PICKAXE` and `NEEDS_IRON_TOOL`.
In addition, Forge also added a tag for ores, so we add our blocks and items to that as well.
