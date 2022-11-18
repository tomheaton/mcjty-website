---
sidebar_position: 5
---

# Episode 5

## Links

* Video: [Oregen, Structures, Custom Dimension](https://www.youtube.com/watch?v=rilsGp8dFJA&ab_channel=JorritTyberghein )
* [Back to 1.18 Tutorial Index](./1.18.md)
* [Tutorial GitHub](https://github.com/McJty/TutorialV3)
* [Structure Tutorial by TelepathicGrunt](https://github.com/TelepathicGrunt/StructureTutorialMod)
* [Minecraft Wiki with information on custom dimensions](https://minecraft.fandom.com/wiki/Custom_dimension)

## Introduction

:::danger Warning
Structures and oregeneration have changed heavily in 1.18.2!
This explanation is only useful for 1.18.1. See episode 8 for porting to 1.18.2
:::

:::danger Warning
For the 1.19.2 version of this code I recommend you look at the 1.19 GitHub as this has also changed considerably
:::

This is a more advanced tutorial explaining various worldgen related subjects. You can safely skip this tutorial if you don't want to bother with worldgen right now or don't need it for your mod. This tutorial is based on the structure tutorial by TelepathicGrunt (link above). His tutorial goes a little bit more in-depth so feel free to check that out if you want to go further with this.

### Ore Generation

In the Ores class we setup oregen for our four different variants. Oregeneration is done using a feature. We use the standard Feature.ORE which is provided by vanilla but we still have to configure it. Objects like Feature.ORE are forge registry objects (similar to blocks, items, entities, ...) but configured features are not. They still have to be registered though but then on the vanilla registry. Some notes:

* Registering things on the vanilla registries can happen at any time before loading the world. The most common place to do this is in FMLCommonSetupEvent.
* Every type of feature has its own configuration object. Check the vanilla Feature class to find out what configuration object the feature needs. In our case it is OreConfiguration. We configure the blockstate of the ore there as well as the maximum size of ore veins
* We use different placements to control where our ore can generate:
    * CountPlacement to control how many times our vein will generate in a chunk
    * InSquarePlacement to spread the ore in our chunk
    * BiomeFilter.biome() to ensure that biomes that support our ore will actually generate it
    * HeightRangePlacement.uniform to control the height of our oregen
* In BiomeLoadingEvent we actually couple the desired features to the biomes. We use the biome category to find out what type of oregen we want to add

:::danger Warning
Don't forget to manually register things that need to be registered to a vanilla registry.
Best place to do that is `FMLCommonSetupEvent`
:::

```java title="Ores.java"
public class Ores {

    public static final int OVERWORLD_VEINSIZE = 5;
    public static final int OVERWORLD_AMOUNT = 3;
    public static final int DEEPSLATE_VEINSIZE = 5;
    public static final int DEEPSLATE_AMOUNT = 3;
    public static final int NETHER_VEINSIZE = 5;
    public static final int NETHER_AMOUNT = 3;
    public static final int END_VEINSIZE = 10;
    public static final int END_AMOUNT = 6;

    public static final RuleTest IN_ENDSTONE = new TagMatchTest(Tags.Blocks.END_STONES);

    public static PlacedFeature OVERWORLD_OREGEN;
    public static PlacedFeature DEEPSLATE_OREGEN;
    public static PlacedFeature NETHER_OREGEN;
    public static PlacedFeature END_OREGEN;

    public static void registerConfiguredFeatures() {
        OreConfiguration overworldConfig = new OreConfiguration(OreFeatures.STONE_ORE_REPLACEABLES,
                Registration.MYSTERIOUS_ORE_OVERWORLD.get().defaultBlockState(), OVERWORLD_VEINSIZE);
        OVERWORLD_OREGEN = registerPlacedFeature("overworld_mysterious_ore", Feature.ORE.configured(overworldConfig),
                CountPlacement.of(OVERWORLD_AMOUNT),
                InSquarePlacement.spread(),
                BiomeFilter.biome(),
                HeightRangePlacement.uniform(VerticalAnchor.absolute(0), VerticalAnchor.absolute(90)));

        OreConfiguration deepslateConfig = new OreConfiguration(OreFeatures.DEEPSLATE_ORE_REPLACEABLES,
                Registration.MYSTERIOUS_ORE_DEEPSLATE.get().defaultBlockState(), DEEPSLATE_VEINSIZE);
        DEEPSLATE_OREGEN = registerPlacedFeature("deepslate_mysterious_ore", Feature.ORE.configured(deepslateConfig),
                CountPlacement.of(DEEPSLATE_AMOUNT),
                InSquarePlacement.spread(),
                BiomeFilter.biome(),
                HeightRangePlacement.uniform(VerticalAnchor.bottom(), VerticalAnchor.aboveBottom(64)));

        OreConfiguration netherConfig = new OreConfiguration(OreFeatures.NETHER_ORE_REPLACEABLES,
                Registration.MYSTERIOUS_ORE_NETHER.get().defaultBlockState(), NETHER_VEINSIZE);
        NETHER_OREGEN = registerPlacedFeature("nether_mysterious_ore", Feature.ORE.configured(netherConfig),
                CountPlacement.of(NETHER_AMOUNT),
                InSquarePlacement.spread(),
                BiomeFilter.biome(),
                HeightRangePlacement.uniform(VerticalAnchor.absolute(0), VerticalAnchor.absolute(90)));

        OreConfiguration endConfig = new OreConfiguration(IN_ENDSTONE,
                Registration.MYSTERIOUS_ORE_END.get().defaultBlockState(), END_VEINSIZE);
        END_OREGEN = registerPlacedFeature("end_mysterious_ore", Feature.ORE.configured(endConfig),
                CountPlacement.of(END_AMOUNT),
                InSquarePlacement.spread(),
                BiomeFilter.biome(),
                HeightRangePlacement.uniform(VerticalAnchor.absolute(0), VerticalAnchor.absolute(100)));
    }

    private static <C extends FeatureConfiguration, F extends Feature<C>> PlacedFeature registerPlacedFeature(String registryName,
               ConfiguredFeature<C, F> feature, PlacementModifier... placementModifiers) {
        PlacedFeature placed = BuiltinRegistries.register(BuiltinRegistries.CONFIGURED_FEATURE, new ResourceLocation(registryName), feature)
               .placed(placementModifiers);
        return PlacementUtils.register(registryName, placed);
    }

    public static void onBiomeLoadingEvent(BiomeLoadingEvent event) {
        if (event.getCategory() == Biome.BiomeCategory.NETHER) {
            event.getGeneration().addFeature(GenerationStep.Decoration.UNDERGROUND_ORES, NETHER_OREGEN);
        } else if (event.getCategory() == Biome.BiomeCategory.THEEND) {
            event.getGeneration().addFeature(GenerationStep.Decoration.UNDERGROUND_ORES, END_OREGEN);
        } else {
            event.getGeneration().addFeature(GenerationStep.Decoration.UNDERGROUND_ORES, OVERWORLD_OREGEN);
            event.getGeneration().addFeature(GenerationStep.Decoration.UNDERGROUND_ORES, DEEPSLATE_OREGEN);
        }
    }
}
```

We have to modify ModSetup as follows:

```java title="ModSetup.java"
public static void setup() {
    IEventBus bus = MinecraftForge.EVENT_BUS;
    bus.addListener(Ores::onBiomeLoadingEvent);
}

public static void init(FMLCommonSetupEvent event) {
    event.enqueueWork(() -> {
        Ores.registerConfiguredFeatures();
    });
}
```

And from our main mod class we call setup() in the constructor:

```java title="TutorialV3.java"
public TutorialV3() {
    // Register the deferred registry
    ModSetup.setup();
    Registration.init();
}
```

![image](https://i.imgur.com/o7hgFpp.png)

BiomeLoadingEvent is gone in 1.19. Check the [GitHub for the 1.19 version of the mod](https://github.com/McJty/TutorialV3/tree/1.19) for more information.

### Jigsaw Structures

Jigsaw structures are used for bigger structures like villages and strongholds.
However, in this tutorial we're going to keep it simple and have a structure that has only one part.

#### Making a Structure In Game

The easiest way to make structures is to actually build them in Minecraft and then use structure blocks to actually define and save the structure.
Check the tutorial video on how to do this.

#### Setting up the Structure Data

After making and saving the structure, the nbt file will be saved to `<world folder>/generated`.
Copy it inside `resources/data/<modid>/structures/`

In addition, make a new folder called `resources/data/<modid>/worldgen/template_pool/portal` and put the `start_pool.json` file in there:

```json
{
  "name": "tutorialv3:portal/start_pool",
  "fallback": "minecraft:empty",

  "elements": [
    {
      "weight": 1,
      "element": {
        "location": "tutorialv3:portal",
        "processors": "minecraft:empty",
        "projection": "rigid",
        "element_type": "minecraft:single_pool_element"
      }
    }
  ]
}
```

Do the same for the `thiefden` structure.
This json represents the start of our jigsaw structure.
Since we only have one part that's also all we need.

#### Main Structures class

Here we define the main Structures class which will properly setup and register our structures.
Because Minecraft itself doesn't fully have proper json support for structures and Forge doesn't have the proper hooks yet, we still need to do a lot of things manually.
In this tutorial we present a way to do this relatively safe.

Some notes:

* There are a lot of comments in the source code. They should clarify a few things
* We need to access and modify final and private Minecraft fields. To be able to do that we're going to use access transformers. More on that later
* Just like with features and configured features we also have the structure and the configured structure. The structures are Forge registry objects (will be put in Registration) while the configured structures have to be registered on a vanilla registry
* We have to be careful when modifying some internal maps because they can be immutable. If that's the case we actually have to make a new map and put that in place

```java title="Structures.java"
public class Structures {
    /**
     * Static instances of our structures so we can reference it and add it to biomes easily.
     * We cannot get our own pool here at mod init so we use PlainVillagePools.START.
     * We will modify this pool at runtime later in createPiecesGenerator
     */
    public static ConfiguredStructureFeature<?, ?> CONFIGURED_THIEFDEN = Registration.THIEFDEN.get()
            .configured(new JigsawConfiguration(() -> PlainVillagePools.START, 0));
    public static ConfiguredStructureFeature<?, ?> CONFIGURED_PORTAL_OVERWORLD = Registration.PORTAL_OVERWORLD.get()
            .configured(new JigsawConfiguration(() -> PlainVillagePools.START, 0));
    public static ConfiguredStructureFeature<?, ?> CONFIGURED_PORTAL_MYSTERIOUS = Registration.PORTAL_MYSTERIOUS.get()
            .configured(new JigsawConfiguration(() -> PlainVillagePools.START, 0));

    /**
     * Registers the configured structure which is what gets added to the biomes.
     * Noticed we are not using a forge registry because there is none for configured structures.
     *
     * We can register configured structures at any time before a world is clicked on and made.
     * But the best time to register configured features by code is honestly to do it in FMLCommonSetupEvent.
     */
    public static void registerConfiguredStructures() {
        Registry.register(BuiltinRegistries.CONFIGURED_STRUCTURE_FEATURE, new ResourceLocation(TutorialV3.MODID, "thiefden"),
            CONFIGURED_THIEFDEN);
        Registry.register(BuiltinRegistries.CONFIGURED_STRUCTURE_FEATURE, new ResourceLocation(TutorialV3.MODID, "portal_overworld"),
            CONFIGURED_PORTAL_OVERWORLD);
        Registry.register(BuiltinRegistries.CONFIGURED_STRUCTURE_FEATURE, new ResourceLocation(TutorialV3.MODID, "portal_mysterious"),
            CONFIGURED_PORTAL_MYSTERIOUS);
    }

    /**
     * This is where we set the rarity of your structures and determine if land conforms to it.
     * See the comments in below for more details. This is also called from FMLCommonSetupEvent.
     */
    public static void setupStructures() {
        setupMapSpacingAndLand(
                Registration.THIEFDEN.get(),
                new StructureFeatureConfiguration(10, // average distance apart in chunks between spawn attempts
                        5,            // minimum distance apart in chunks between spawn attempts. MUST BE LESS THAN ABOVE VALUE
                        1234567890),  // the seed of the structure so no two structures always spawn over each-other. Make this large and unique
                true);

        setupMapSpacingAndLand(
                Registration.PORTAL_OVERWORLD.get(),
                new StructureFeatureConfiguration(10,5,1294567890),
                false);

        setupMapSpacingAndLand(
                Registration.PORTAL_MYSTERIOUS.get(),
                new StructureFeatureConfiguration(10,5,1294567890), // The same seed so our portals in overworld and other dimension will be at the same spot
                true);
    }

    /**
     * Adds the provided structure to the registry, and adds the separation settings.
     * The rarity of the structure is determined based on the values passed into
     * this method in the StructureFeatureConfiguration argument.
     * This method is called by setupStructures above.
     */
    private static <F extends StructureFeature<?>> void setupMapSpacingAndLand(
            F structure,
            StructureFeatureConfiguration structureFeatureConfiguration,
            boolean transformSurroundingLand)
    {
        // Add our own structure into the structure feature map. Otherwise you get errors
        StructureFeature.STRUCTURES_REGISTRY.put(structure.getRegistryName().toString(), structure);

        // Adapt the surrounding land to the bottom of our structure
        if (transformSurroundingLand) {
            StructureFeature.NOISE_AFFECTING_FEATURES =
                    ImmutableList.<StructureFeature<?>>builder()
                            .addAll(StructureFeature.NOISE_AFFECTING_FEATURES)
                            .add(structure)
                            .build();
        }

        // This is the map that holds the default spacing of all structures. This is normally
        // private and final. That's why we need an access transformer.
        // Always add your structure to here so that other mods can utilize it if needed
        StructureSettings.DEFAULTS =
                ImmutableMap.<StructureFeature<?>, StructureFeatureConfiguration>builder()
                        .putAll(StructureSettings.DEFAULTS)
                        .put(structure, structureFeatureConfiguration)
                        .build();


        // Add our structure to all the noise generator settings.
        // structureConfig requires AccessTransformer
        BuiltinRegistries.NOISE_GENERATOR_SETTINGS.entrySet().forEach(settings -> {
            Map<StructureFeature<?>, StructureFeatureConfiguration> structureMap = settings.getValue().structureSettings().structureConfig();

            // Be careful with mods that make the structure map immutable (like datapacks do)
            if (structureMap instanceof ImmutableMap) {
                Map<StructureFeature<?>, StructureFeatureConfiguration> tempMap = new HashMap<>(structureMap);
                tempMap.put(structure, structureFeatureConfiguration);
                settings.getValue().structureSettings().structureConfig = tempMap;
            } else {
                structureMap.put(structure, structureFeatureConfiguration);
            }
        });
    }

    /**
     * Tells the chunkgenerator which biomes our structure can spawn in.
     * Will go into the world's chunkgenerator where we manually add our structure spacing.
     * If the spacing is not added, the structure doesn't spawn.
     *
     * Use this for dimension blacklists for your structure.
     * (Don't forget to attempt to remove your structure too from the map if you are blacklisting that dimension!)
     * (It might have your structure in it already.)
     *
     * Basically use this to make absolutely sure the chunkgenerator can or cannot spawn your structure.
     */
    public static void addDimensionalSpacing(final WorldEvent.Load event) {
        if (event.getWorld() instanceof ServerLevel serverLevel) {
            ChunkGenerator chunkGenerator = serverLevel.getChunkSource().getGenerator();
            // Skip superflat to prevent issues with it. Plus, users don't want structures clogging up their superflat worlds.
            if (chunkGenerator instanceof FlatLevelSource && serverLevel.dimension().equals(Level.OVERWORLD)) {
                return;
            }

            ConfiguredStructureFeature<?, ?> portalFeature = null;
            if (serverLevel.dimension().equals(Level.OVERWORLD)) {
                portalFeature = CONFIGURED_PORTAL_OVERWORLD;
            } else if (serverLevel.dimension().equals(Dimensions.MYSTERIOUS)) {
                portalFeature = CONFIGURED_PORTAL_MYSTERIOUS;
            }

            StructureSettings worldStructureConfig = chunkGenerator.getSettings();

            /*
             * NOTE: BiomeLoadingEvent from Forge API does not work with structures anymore.
             * Instead, we will use the below to add our structure to overworld biomes.
             * Remember, this is temporary until Forge API finds a better solution for adding structures to biomes.
             */

            // Create a mutable map we will use for easier adding to biomes
            var structureToMultimap = new HashMap<StructureFeature<?>, HashMultimap<ConfiguredStructureFeature<?, ?>, ResourceKey<Biome>>>();

            // Add the resourcekey of all biomes that this Configured Structure can spawn in.
            for (var biomeEntry : serverLevel.registryAccess().ownedRegistryOrThrow(Registry.BIOME_REGISTRY).entrySet()) {
                // Skip all ocean, end, nether, and none category biomes.
                // You can do checks for other traits that the biome has.
                BiomeCategory category = biomeEntry.getValue().getBiomeCategory();
                if (category != BiomeCategory.OCEAN && category != BiomeCategory.THEEND && category != BiomeCategory.NETHER && category != BiomeCategory.NONE) {
                    associateBiomeToConfiguredStructure(structureToMultimap, CONFIGURED_THIEFDEN, biomeEntry.getKey());
                }
                if (portalFeature != null) {
                    if (category != BiomeCategory.THEEND && category != BiomeCategory.NETHER && category != BiomeCategory.NONE) {
                        associateBiomeToConfiguredStructure(structureToMultimap, portalFeature, biomeEntry.getKey());
                    }
                }
            }

            // Grab the map that holds what ConfigureStructures a structure has and what biomes it can spawn in.
            // Requires AccessTransformer  (see resources/META-INF/accesstransformer.cfg)
            ImmutableMap.Builder<StructureFeature<?>, ImmutableMultimap<ConfiguredStructureFeature<?, ?>, ResourceKey<Biome>>> tempStructureToMultiMap =
                    ImmutableMap.builder();
            worldStructureConfig.configuredStructures.entrySet()
                    .stream()
                    .filter(entry -> !structureToMultimap.containsKey(entry.getKey()))
                    .forEach(tempStructureToMultiMap::put);

            // Add our structures to the structure map/multimap and set the world to use this combined map/multimap.
            structureToMultimap.forEach((key, value) -> tempStructureToMultiMap.put(key, ImmutableMultimap.copyOf(value)));

            // Requires AccessTransformer (see resources/META-INF/accesstransformer.cfg)
            worldStructureConfig.configuredStructures = tempStructureToMultiMap.build();
        }
    }

    /**
     * Helper method that handles setting up the map to multimap relationship to help prevent issues.
     */
    private static void associateBiomeToConfiguredStructure(Map<StructureFeature<?>, HashMultimap<ConfiguredStructureFeature<?, ?>, ResourceKey<Biome>>> structureToMultimap, ConfiguredStructureFeature<?, ?> configuredStructureFeature, ResourceKey<Biome> biomeRegistryKey) {
        structureToMultimap.putIfAbsent(configuredStructureFeature.feature, HashMultimap.create());
        var configuredStructureToBiomeMultiMap = structureToMultimap.get(configuredStructureFeature.feature);
        if (configuredStructureToBiomeMultiMap.containsValue(biomeRegistryKey)) {
            TutorialV3.LOGGER.error("""
                    Detected 2 ConfiguredStructureFeatures that share the same base StructureFeature trying to be added to same biome. One will be prevented from spawning.
                    This issue happens with vanilla too and is why a Snowy Village and Plains Village cannot spawn in the same biome because they both use the Village base structure.
                    The two conflicting ConfiguredStructures are: {}, {}
                    The biome that is attempting to be shared: {}
                """,
                    BuiltinRegistries.CONFIGURED_STRUCTURE_FEATURE.getId(configuredStructureFeature),
                    BuiltinRegistries.CONFIGURED_STRUCTURE_FEATURE.getId(configuredStructureToBiomeMultiMap.entries()
                           .stream()
                           .filter(e -> e.getValue() == biomeRegistryKey)
                           .findFirst()
                           .get().getKey()),
                    biomeRegistryKey
            );
        } else {
            configuredStructureToBiomeMultiMap.put(configuredStructureFeature, biomeRegistryKey);
        }
    }

    /**
     * Create a copy of a piece generator context with another config. This is used by the structures
     */
    @NotNull
    static PieceGeneratorSupplier.Context<JigsawConfiguration> createContextWithConfig(PieceGeneratorSupplier.Context<JigsawConfiguration> context, JigsawConfiguration newConfig) {
        return new PieceGeneratorSupplier.Context<>(
                context.chunkGenerator(),
                context.biomeSource(),
                context.seed(),
                context.chunkPos(),
                newConfig,
                context.heightAccessor(),
                context.validBiome(),
                context.structureManager(),
                context.registryAccess()
        );
    }

    private static final Lazy<List<MobSpawnSettings.SpawnerData>> STRUCTURE_MONSTERS = Lazy.of(() -> ImmutableList.of(
            new MobSpawnSettings.SpawnerData(EntityType.ILLUSIONER, 200, 4, 9),
            new MobSpawnSettings.SpawnerData(EntityType.VINDICATOR, 200, 4, 9)
    ));

    public static void setupStructureSpawns(final StructureSpawnListGatherEvent event) {
        if (event.getStructure() == Registration.PORTAL_OVERWORLD.get() || event.getStructure() == Registration.PORTAL_MYSTERIOUS.get()) {
            event.addEntitySpawns(MobCategory.MONSTER, STRUCTURE_MONSTERS.get());
        }
    }
}
```

We also have to modify `ModSetup`.

:::danger Warning
Note that Forge provides various events for setting up various things.
Always use the event when something is available!
:::

```java title="ModSetup.java"
public static void setup() {
    IEventBus bus = MinecraftForge.EVENT_BUS;
    bus.addListener(Ores::onBiomeLoadingEvent);
    bus.addListener(EventPriority.NORMAL, Structures::addDimensionalSpacing);
    bus.addListener(EventPriority.NORMAL, Structures::setupStructureSpawns);
}

public static void init(FMLCommonSetupEvent event) {
    event.enqueueWork(() -> {
        Ores.registerConfiguredFeatures();
        Structures.setupStructures();
        Structures.registerConfiguredStructures();
    });
}
```

![image](https://i.imgur.com/o7hgFpp.png)

Structures have changed considerably in 1.19.2.
Check [the 1.19 GitHub](https://github.com/McJty/TutorialV3/tree/1.19) for more information.

#### Access Transformers

In order to be able to change private and/or final values in Minecraft you can either use Reflection or else use access transformers.
An access transformer is a system added by Forge that allows you to change the 'private' or 'final' status of an internal Minecraft field or method.
It should be used ONLY when no other solution is available! Most of the time there is a reason that something is private or final, and you shouldn't change it.
However, in this particular case there is no other reasonable solution.

:::danger Warning
Only use access transformers if there is no other solution!
:::

To do this, add the following `accesstransformer.cfg` file to the META-INF directory:

```cfg title="accesstransformer.cfg"
public-f net.minecraft.world.level.levelgen.feature.StructureFeature f_67031_ # NOISE_AFFECTING_FEATURES
public-f net.minecraft.world.level.levelgen.StructureSettings f_64580_ # DEFAULTS
public-f net.minecraft.world.level.levelgen.StructureSettings f_64582_ # structureConfig
public-f net.minecraft.world.level.levelgen.StructureSettings f_189361_ #configuredStructures
```

You can use the Forge-bot on discord (using !mcp SomeName) to find the right AT to use. In the tutorial video this usage is demonstrated.

Then modify `build.gradle` as follows:

```gradle title="build.gradle"
mappings channel: 'parchment', version: "2021.12.19-1.18.1"
accessTransformer = file('src/main/resources/META-INF/accesstransformer.cfg')
```

Then refresh gradle and do genIntellijRuns again and the fields should now be public.

#### The ThiefDenStructure

![image](https://i.imgur.com/DdhliV8.png)

The ThiefDenStructure is our actual structure object in the game. It's a registry object which means we have to register it in our Registration class. Some notes:
* We want this structure to generate on the surface. That's the easiest situation because then we can simply pass 'true' as the last parameter of addPieces() and don't worry about the 'y' coordinate of our structure start
* In isFeatureChunk() we test if the top block is actually solid (and not a liquid)
* createPiecesGenerator() is the place where we actually replace the dummy pool start with our own. We do that by subtituting a new JigsawConfiguration object into the context

:::danger Warning
We cannot access the world inside this so everything we do has to be done through the chunk that is being generated
:::

```java title="ThiefDenStructure"
public class ThiefDenStructure extends StructureFeature<JigsawConfiguration> {

    public ThiefDenStructure() {
        super(JigsawConfiguration.CODEC, context -> {
            if (!isFeatureChunk(context)) {
                return Optional.empty();
            } else {
                return createPiecesGenerator(context);
            }
        }, PostPlacementProcessor.NONE);
    }

    @Override
    public GenerationStep.Decoration step() {
        return GenerationStep.Decoration.SURFACE_STRUCTURES;
    }

    // Test if the current chunk (from context) has a valid location for our structure
    private static boolean isFeatureChunk(PieceGeneratorSupplier.Context<JigsawConfiguration> context) {
        BlockPos pos = context.chunkPos().getWorldPosition();

        // Get height of land (stops at first non-air block)
        int landHeight = context.chunkGenerator().getFirstOccupiedHeight(pos.getX(), pos.getZ(), Heightmap.Types.WORLD_SURFACE_WG, context.heightAccessor());

        // Grabs column of blocks at given position. In overworld, this column will be made of stone, water, and air.
        // In nether, it will be netherrack, lava, and air. End will only be endstone and air. It depends on what block
        // the chunk generator will place for that dimension.
        NoiseColumn columnOfBlocks = context.chunkGenerator().getBaseColumn(pos.getX(), pos.getZ(), context.heightAccessor());

        // Combine the column of blocks with land height and you get the top block itself which you can test.
        BlockState topBlock = columnOfBlocks.getBlock(landHeight);

        // Now we test to make sure our structure is not spawning on water or other fluids.
        // You can do height check instead too to make it spawn at high elevations.
        return topBlock.getFluidState().isEmpty(); //landHeight > 100;
    }

    private static Optional<PieceGenerator<JigsawConfiguration>> createPiecesGenerator(PieceGeneratorSupplier.Context<JigsawConfiguration> context) {
        // Turns the chunk coordinates into actual coordinates we can use. (center of that chunk)
        BlockPos blockpos = context.chunkPos().getMiddleBlockPosition(0);

        var newConfig = new JigsawConfiguration(
                () -> context.registryAccess().ownedRegistryOrThrow(Registry.TEMPLATE_POOL_REGISTRY)
                        .get(new ResourceLocation(TutorialV3.MODID, "thiefden/start_pool")),
                5       // In our case our structure is 1 chunk only but by using 5 here it can be replaced with something larger in datapacks
        );

        // Create a new context with the new config that has our json pool. We will pass this into JigsawPlacement.addPieces
        var newContext = Structures.createContextWithConfig(context, newConfig);
        // Last 'true' parameter means the structure will automatically be placed at ground level
        var generator = JigsawPlacement.addPieces(newContext,
                        PoolElementStructurePiece::new, blockpos, false, true);

        if (generator.isPresent()) {
            // Debugging help to quickly find our structures
            TutorialV3.LOGGER.log(Level.INFO, "Thiefden at " + blockpos);
        }

        // Return the pieces generator that is now set up so that the game runs it when it needs to create the layout of structure pieces.
        return generator;
    }
}
```

#### The PortalStructure

![image](https://i.imgur.com/cOvncxh.png)

PortalStructure is very similar to ThiefDenStructure. The big difference is that in the overworld we want to generate our structure underground. Preferably in a cave or connected to a cave. Some notes:
* In this structure we don't have a test for a suitable structure. We simply always find a spot to spawn it
* findSuitableSpot() will try to find a good location for this dungeon. Preferably in an open area underground. If it can't find such an area then it will generate it underground embedded in stone
* This structure will also generate in our custom dimension (more on that later). In that case we simply generate on the surface since our custom dimension doesn't have caves

```java title="PortalStructure.java"
public class PortalStructure extends StructureFeature<JigsawConfiguration> {

    public PortalStructure(boolean overworld) {
        super(JigsawConfiguration.CODEC, context -> createPiecesGenerator(context, overworld), PostPlacementProcessor.NONE);
    }

    @Override
    public GenerationStep.Decoration step() {
        return GenerationStep.Decoration.UNDERGROUND_STRUCTURES;
    }

    // Test if the current chunk (from context) has a valid location for our structure

    private static Optional<PieceGenerator<JigsawConfiguration>> createPiecesGenerator(PieceGeneratorSupplier.Context<JigsawConfiguration> context,
                                                                                       boolean overworld) {
        // Turns the chunk coordinates into actual coordinates we can use. (center of that chunk)
        BlockPos blockpos = context.chunkPos().getMiddleBlockPosition(0);

        if (overworld) {
            // If we are generating for the overworld we want our portal to spawn underground. Preferably in an open area
            blockpos = findSuitableSpot(context, blockpos);
        }

        var newConfig = new JigsawConfiguration(
                () -> context.registryAccess().ownedRegistryOrThrow(Registry.TEMPLATE_POOL_REGISTRY)
                        .get(new ResourceLocation(TutorialV3.MODID, "portal/start_pool")),
                5       // In our case our structure is 1 chunk only but by using 5 here it can be replaced with something larger in datapacks
        );

        // Create a new context with the new config that has our json pool. We will pass this into JigsawPlacement.addPieces
        var newContext = Structures.createContextWithConfig(context, newConfig);
        var generator = JigsawPlacement.addPieces(newContext,
                        PoolElementStructurePiece::new, blockpos, false, !overworld);

        if (generator.isPresent()) {
            // Debugging help to quickly find our structures
            TutorialV3.LOGGER.log(Level.INFO, "Portal at " + blockpos);
        }

        // Return the pieces generator that is now set up so that the game runs it when it needs to create the layout of structure pieces.
        return generator;
    }

    @NotNull
    private static BlockPos findSuitableSpot(PieceGeneratorSupplier.Context<JigsawConfiguration> context, BlockPos blockpos) {
        LevelHeightAccessor heightAccessor = context.heightAccessor();

        // Get the top y location that is solid
        int y = context.chunkGenerator().getBaseHeight(blockpos.getX(), blockpos.getZ(), Heightmap.Types.WORLD_SURFACE_WG, heightAccessor);

        // Create a randomgenerator that depends on the current chunk location. That way if the world is recreated
        // with the same seed the feature will end up at the same spot
        WorldgenRandom worldgenrandom = new WorldgenRandom(new LegacyRandomSource(context.seed()));
        worldgenrandom.setLargeFeatureSeed(context.seed(), context.chunkPos().x, context.chunkPos().z);

        // Pick a random y location between a low and a high point
        y = worldgenrandom.nextIntBetweenInclusive(heightAccessor.getMinBuildHeight()+20, y - 10);

        // Go down until we find a spot that has air. Then go down until we find a spot that is solid again
        NoiseColumn baseColumn = context.chunkGenerator().getBaseColumn(blockpos.getX(), blockpos.getZ(), heightAccessor);
        int yy = y; // Remember 'y' because we will just use this if we can't find an air bubble
        int lower = heightAccessor.getMinBuildHeight() + 3; // Lower limit, don't go below this
        while (yy > lower && !baseColumn.getBlock(yy).isAir()) {
            yy--;
        }
        // If we found air we go down until we find a non-air block
        if (yy > lower) {
            while (yy > lower && baseColumn.getBlock(yy).isAir()) {
                yy--;
            }
            if (yy > lower) {
                // We found a possible spawn spot
                y = yy + 1;
            }
        }

        return blockpos.atY(y);
    }

}
```

#### Registration

Since features are registry objects we need to register them in Registration. Make the following changes:

```java title="Registration.java"
public class Registration {
    ...
    private static final DeferredRegister<StructureFeature<?>> STRUCTURES = DeferredRegister.create(ForgeRegistries.STRUCTURE_FEATURES, MODID);

    public static void init() {
        ...
        STRUCTURES.register(bus);
    }

    ...

    public static final RegistryObject<StructureFeature<JigsawConfiguration>> THIEFDEN = STRUCTURES.register("thiefden", ThiefDenStructure::new);
    public static final RegistryObject<StructureFeature<JigsawConfiguration>> PORTAL_OVERWORLD = STRUCTURES.register("portal_overworld",
        () -> new PortalStructure(true));
    public static final RegistryObject<StructureFeature<JigsawConfiguration>> PORTAL_MYSTERIOUS = STRUCTURES.register("portal_mysterious",
        () -> new PortalStructure(false));
```

### Custom Dimension

In contrast with structures, dimensions are much better defined using JSON. In fact it's possible to completely define a custom dimension without a single line of Java code. You don't even need to register it. However, in this tutorial we are going to use some code in order to show you the kind of thing that is possible.

![image](https://i.imgur.com/uwAE1YO.png)

#### Dimension Type and Dimension

Let's first define the dimension type and the actual dimension. A dimension type is the base for creating dimensions from. In many cases every dimension type will have one dimension but it is perfectly possible to have multiple dimensions sharing the same dimension type.

Here is the dimension type:

```json
{
  "name": "Mysterious Dimension",
  "ultrawarm": false,
  "natural": true,
  "coordinate_scale": 0.125,
  "height": 256,
  "min_y": 0,
  "shrunk": false,
  "has_skylight": true,
  "has_ceiling": false,
  "ambient_light": 0,
  "fixed_time": 1000,
  "piglin_safe": false,
  "bed_works": true,
  "respawn_anchor_works": true,
  "has_raids": false,
  "logical_height": 256,
  "infiniburn": "minecraft:infiniburn_overworld",
  "effects": "minecraft:overworld"
}
```

And here is the dimension.
Some notes:

* We refer to our custom chunkgenerator that we will define in a moment
* The 'settings' json block is something that we have defined for ourselves
* Look at the minecraft wiki (see link at the top of this tutorial) to see what other configuration options are available for dimensions

```json
{
  "type": "tutorialv3:mysterious",
  "generator": {
    "type": "tutorialv3:mysterious_chunkgen",
    "settings": {
      "base": 65,
      "verticalvariance": 10,
      "horizontalvariance": 8
    }
  }
}
```

#### Custom Chunk Generator

In most cases, when making your own custom dimension you actually want to use the standard vanilla NoiseBasedChunkGenerator. It is very configurable and for most situations you will be able to completely change it for your custom dimension needs. However sometimes it is good to be able to do something special and that's what we will show in this tutorial. Note that if you would use NoiseBasedChunkGenerator then you actually would have been able to define this dimension without any code.

Worldgen very often uses codecs. A codec is a definition that knows how to serialize data to and from either NBT or JSON. The big advantage of codecs is that you can express how your custom worldgen data needs to be persisted without having to worry about the actual medium that will be used for persistance. Using a codec, Minecraft will be able to read your custom object from json and then save it to the world in NBT format later. Codecs seem a bit confusing at first but they are actually not very hard to use. In our custom chunk generator we have two codecs: one is to be able to save our custom Settings object (SETTINGS_CODEC) and the other for the total chunk generator configuration.

If you look at (for example) SETTINGS_CODEC you can see that it is based on a RecordCodecBuilder which has three fields: 'base', 'verticalvariance', and 'horizontalvariance'. Because the fields are defined in this order the 'apply()' method also expects a consumer that takes these three parameters. Every field itself also has an associated getter ('forGetter()'). With this consumer and the getters the codec is able to create and inspect our custom Settings object.

The codec for our chunk generator itself is again a RecordCodecBuilder which expects a RegistryLookupCodec first. That's used to be able to give the biome registry to our constructor. The second field is the SETTINGS_CODEC.

```java title="MysteriousChunkGenerator.java"
public class MysteriousChunkGenerator extends ChunkGenerator {

    private static final Codec<Settings> SETTINGS_CODEC = RecordCodecBuilder.create(instance ->
            instance.group(
                    Codec.INT.fieldOf("base").forGetter(Settings::baseHeight),
                    Codec.FLOAT.fieldOf("verticalvariance").forGetter(Settings::verticalVariance),
                    Codec.FLOAT.fieldOf("horizontalvariance").forGetter(Settings::horizontalVariance)
            ).apply(instance, Settings::new));

    public static final Codec<MysteriousChunkGenerator> CODEC = RecordCodecBuilder.create(instance ->
            instance.group(
                    RegistryLookupCodec.create(Registry.BIOME_REGISTRY).forGetter(MysteriousChunkGenerator::getBiomeRegistry),
                    SETTINGS_CODEC.fieldOf("settings").forGetter(MysteriousChunkGenerator::getTutorialSettings)
            ).apply(instance, MysteriousChunkGenerator::new));

    private final Settings settings;

    public MysteriousChunkGenerator(Registry<Biome> registry, Settings settings) {
        super(new MysteriousBiomeProvider(registry), new StructureSettings(false));
        this.settings = settings;
        TutorialV3.LOGGER.info("Chunk generator settings: " + settings.baseHeight() + ", " + settings.horizontalVariance() + ", " + settings.verticalVariance());
    }

    public Settings getTutorialSettings() {
        return settings;
    }

    public Registry<Biome> getBiomeRegistry() {
        return ((MysteriousBiomeProvider)biomeSource).getBiomeRegistry();
    }

    @Override
    public void buildSurface(WorldGenRegion region, StructureFeatureManager featureManager, ChunkAccess chunk) {
        BlockState bedrock = Blocks.BEDROCK.defaultBlockState();
        BlockState stone = Blocks.STONE.defaultBlockState();
        ChunkPos chunkpos = chunk.getPos();

        BlockPos.MutableBlockPos pos = new BlockPos.MutableBlockPos();

        int x;
        int z;

        for (x = 0; x < 16; x++) {
            for (z = 0; z < 16; z++) {
                chunk.setBlockState(pos.set(x, 0, z), bedrock, false);
            }
        }

        int baseHeight = settings.baseHeight();
        float verticalVariance = settings.verticalVariance();
        float horizontalVariance = settings.horizontalVariance();
        for (x = 0; x < 16; x++) {
            for (z = 0; z < 16; z++) {
                int realx = chunkpos.x * 16 + x;
                int realz = chunkpos.z * 16 + z;
                int height = getHeightAt(baseHeight, verticalVariance, horizontalVariance, realx, realz);
                for (int y = 1 ; y < height ; y++) {
                    chunk.setBlockState(pos.set(x, y, z), stone, false);
                }
            }
        }
    }

    private int getHeightAt(int baseHeight, float verticalVariance, float horizontalVariance, int x, int z) {
        return (int) (baseHeight + Math.sin(x / horizontalVariance) * verticalVariance + Math.cos(z / horizontalVariance) * verticalVariance);
    }

    @Override
    protected Codec<? extends ChunkGenerator> codec() {
        return CODEC;
    }

    @Override
    public ChunkGenerator withSeed(long seed) {
        return new MysteriousChunkGenerator(getBiomeRegistry(), settings);
    }

    @Override
    public CompletableFuture<ChunkAccess> fillFromNoise(Executor executor, Blender blender, StructureFeatureManager featureManager, ChunkAccess chunkAccess) {
        return CompletableFuture.completedFuture(chunkAccess);
    }

    // Make sure this is correctly implemented so that structures and features can use this
    @Override
    public int getBaseHeight(int x, int z, Heightmap.Types types, LevelHeightAccessor levelHeightAccessor) {
        int baseHeight = settings.baseHeight();
        float verticalVariance = settings.verticalVariance();
        float horizontalVariance = settings.horizontalVariance();
        return getHeightAt(baseHeight, verticalVariance, horizontalVariance, x, z);
    }

    // Make sure this is correctly implemented so that structures and features can use this
    @Override
    public NoiseColumn getBaseColumn(int x, int z, LevelHeightAccessor levelHeightAccessor) {
        int y = getBaseHeight(x, z, Heightmap.Types.WORLD_SURFACE_WG, levelHeightAccessor);
        BlockState stone = Blocks.STONE.defaultBlockState();
        BlockState[] states = new BlockState[y];
        states[0] = Blocks.BEDROCK.defaultBlockState();
        for (int i = 1 ; i < y ; i++) {
            states[i] = stone;
        }
        return new NoiseColumn(levelHeightAccessor.getMinBuildHeight(), states);
    }

    // Carvers only work correctly in combination with NoiseBasedChunkGenerator so we keep this empty here
    @Override
    public void applyCarvers(WorldGenRegion level, long seed, BiomeManager biomeManager,
                             StructureFeatureManager featureManager, ChunkAccess chunkAccess, GenerationStep.Carving carving) {
    }

    @Override
    public Climate.Sampler climateSampler() {
        return (x, y, z) -> Climate.target(0.0F, 0.0F, 0.0F, 0.0F, 0.0F, 0.0F);
    }

    // This makes sure passive mob spawning works for generated chunks. i.e. mobs that spawn during the creation of chunks themselves
    @Override
    public void spawnOriginalMobs(WorldGenRegion level) {
        ChunkPos chunkpos = level.getCenter();
        Biome biome = level.getBiome(chunkpos.getWorldPosition().atY(level.getMaxBuildHeight() - 1));
        WorldgenRandom worldgenrandom = new WorldgenRandom(new LegacyRandomSource(RandomSupport.seedUniquifier()));
        worldgenrandom.setDecorationSeed(level.getSeed(), chunkpos.getMinBlockX(), chunkpos.getMinBlockZ());
        NaturalSpawner.spawnMobsForChunkGeneration(level, biome, chunkpos, worldgenrandom);
    }

    @Override
    public int getMinY() {
        return 0;
    }

    @Override
    public int getGenDepth() {
        return 256;
    }

    @Override
    public int getSeaLevel() {
        return 63;
    }

    private record Settings(int baseHeight, float verticalVariance, float horizontalVariance) { }
}
```

#### Custom Biome Provider

Our custom dimension will have only one biome. Strictly speaking we could have used the vanilla FixedBiomeSource but we wanted to give an example so that's why we define our own biome source:

```java title="MysteriousBiomeProvider.java"
public class MysteriousBiomeProvider extends BiomeSource {

    public static final Codec<MysteriousBiomeProvider> CODEC = RegistryLookupCodec.create(Registry.BIOME_REGISTRY)
            .xmap(MysteriousBiomeProvider::new, MysteriousBiomeProvider::getBiomeRegistry).codec();

    private final Biome biome;
    private final Registry<Biome> biomeRegistry;
    private static final List<ResourceKey<Biome>> SPAWN = Collections.singletonList(Biomes.PLAINS);

    public MysteriousBiomeProvider(Registry<Biome> biomeRegistry) {
        super(getStartBiomes(biomeRegistry));
        this.biomeRegistry = biomeRegistry;
        biome = biomeRegistry.get(Biomes.PLAINS.location());
    }

    private static List<Biome> getStartBiomes(Registry<Biome> registry) {
        return SPAWN.stream().map(s -> registry.get(s.location())).collect(Collectors.toList());
    }

    public Registry<Biome> getBiomeRegistry() {
        return biomeRegistry;
    }

    @Override
    protected Codec<? extends BiomeSource> codec() {
        return CODEC;
    }

    @Override
    public BiomeSource withSeed(long seed) {
        return this;
    }

    @Override
    public Biome getNoiseBiome(int x, int y, int z, Climate.Sampler sampler) {
        return biome;
    }
}
```

#### Changing Oregen

We want to increase oregen for our Mysterious ore in this custom dimension.
To do that add a DimensionBiomeFilter class. This class will replace the BiomeFilter.biome() placement that we currently use.
In addition to testing for the right biome it will also test for the right dimension.
That way we can make sure that the oregen for our custom dimension uses another configuration:

```java title="DimensionBiomeFilter.java"
public class DimensionBiomeFilter extends PlacementFilter {

    private final Predicate<ResourceKey<Level>> levelTest;

    public DimensionBiomeFilter(Predicate<ResourceKey<Level>> levelTest) {
        this.levelTest = levelTest;
    }

    @Override
    protected boolean shouldPlace(PlacementContext context, Random random, BlockPos pos) {
        if (levelTest.test(context.getLevel().getLevel().dimension())) {
            PlacedFeature placedfeature = context.topFeature().orElseThrow(() -> new IllegalStateException("Tried to biome check an unregistered feature"));
            Biome biome = context.getLevel().getBiome(pos);
            return biome.getGenerationSettings().hasFeature(placedfeature);
        } else {
            return false;
        }
    }

    @Override
    public PlacementModifierType<?> type() {
        return PlacementModifierType.BIOME_FILTER;
    }
}
```

Modify the Ores class as follows:

```java title="Ores.java"
    ...
    public static final int MYSTERIOUS_VEINSIZE = 25;
    public static final int MYSTERIOUS_AMOUNT = 10;
    ...

    public static PlacedFeature MYSTERIOUS_OREGEN;

    ...

    public static void registerConfiguredFeatures() {
        OreConfiguration mysteriousConfig = new OreConfiguration(OreFeatures.STONE_ORE_REPLACEABLES,
                Registration.MYSTERIOUS_ORE_OVERWORLD.get().defaultBlockState(), MYSTERIOUS_VEINSIZE);
        MYSTERIOUS_OREGEN = registerPlacedFeature("mysterious_mysterious_ore", Feature.ORE.configured(mysteriousConfig),
                CountPlacement.of(MYSTERIOUS_AMOUNT),
                InSquarePlacement.spread(),
                new DimensionBiomeFilter(key -> key.equals(Dimensions.MYSTERIOUS)),
                HeightRangePlacement.uniform(VerticalAnchor.absolute(0), VerticalAnchor.absolute(90)));

        OreConfiguration overworldConfig = new OreConfiguration(OreFeatures.STONE_ORE_REPLACEABLES,
                Registration.MYSTERIOUS_ORE_OVERWORLD.get().defaultBlockState(), OVERWORLD_VEINSIZE);
        OVERWORLD_OREGEN = registerPlacedFeature("overworld_mysterious_ore", Feature.ORE.configured(overworldConfig),
                CountPlacement.of(OVERWORLD_AMOUNT),
                InSquarePlacement.spread(),
                new DimensionBiomeFilter(key -> !Dimensions.MYSTERIOUS.equals(key)),
                HeightRangePlacement.uniform(VerticalAnchor.absolute(0), VerticalAnchor.absolute(90)));

    ...

    public static void onBiomeLoadingEvent(BiomeLoadingEvent event) {
        if (event.getCategory() == Biome.BiomeCategory.NETHER) {
            event.getGeneration().addFeature(GenerationStep.Decoration.UNDERGROUND_ORES, NETHER_OREGEN);
        } else if (event.getCategory() == Biome.BiomeCategory.THEEND) {
            event.getGeneration().addFeature(GenerationStep.Decoration.UNDERGROUND_ORES, END_OREGEN);
        } else {
            event.getGeneration().addFeature(GenerationStep.Decoration.UNDERGROUND_ORES, MYSTERIOUS_OREGEN);
            event.getGeneration().addFeature(GenerationStep.Decoration.UNDERGROUND_ORES, OVERWORLD_OREGEN);
            event.getGeneration().addFeature(GenerationStep.Decoration.UNDERGROUND_ORES, DEEPSLATE_OREGEN);
        }
    }
```

#### Registration

Both the chunk generator and the biome source are objects that need to be manually registered on a vanilla registry. Add the following class for that. The MYSTERIOUS ResourceKey is the unique identifier for our dimension. We don't need to register that as the dimension is fully defined in json.

```java title="Dimensions.java"
public class Dimensions {

    public static final ResourceKey<Level> MYSTERIOUS = ResourceKey.create(Registry.DIMENSION_REGISTRY, new ResourceLocation(TutorialV3.MODID, "mysterious"));

    public static void register() {
        Registry.register(Registry.CHUNK_GENERATOR, new ResourceLocation(TutorialV3.MODID, "mysterious_chunkgen"),
                MysteriousChunkGenerator.CODEC);
        Registry.register(Registry.BIOME_SOURCE, new ResourceLocation(TutorialV3.MODID, "biomes"),
                MysteriousBiomeProvider.CODEC);
    }
}
```

Modify `ModSetup` as follows:

```java title="ModSetup.java"
public static void init(FMLCommonSetupEvent event) {
    event.enqueueWork(() -> {
        ...
        Dimensions.register();
    });
}
```

### Portal Block

Before we can run all this we also need to define our portal block. We're not going to deep into this as by now you should know how to make blocks. Read the comments with SHAPE and entityInside():

```java
public class PortalBlock extends Block {

    // Our block is lower then a normal block. That causes the player to sink in it when he stands on the block
    // And that in turn causes our 'entityInside' test to detect the player
    private static final VoxelShape SHAPE = Shapes.box(0, 0, 0, 1, .8, 1);

    public PortalBlock() {
        super(Properties.of(Material.METAL)
                .sound(SoundType.METAL)
                .strength(-1.0F, 3600000.0F)
                .noDrops());
    }

    @Override
    public VoxelShape getShape(BlockState state, BlockGetter level, BlockPos pos, CollisionContext context) {
        return SHAPE;
    }

    // This works because our block isn't a full block
    @Override
    public void entityInside(BlockState state, Level level, BlockPos pos, Entity entity) {
        if (entity instanceof ServerPlayer player) {
            if (level.dimension().equals(Dimensions.MYSTERIOUS)) {
                teleportTo(player, pos.north(), Level.OVERWORLD);
            } else {
                teleportTo(player, pos.north(), Dimensions.MYSTERIOUS);
            }
        }
    }

    private void teleportTo(ServerPlayer player, BlockPos pos, ResourceKey<Level> id) {
        ServerLevel world = player.getServer().getLevel(id);
        Tools.teleport(player, world, new BlockPos(pos.getX(), pos.getY(), pos.getZ()), true);
    }
}
```

We also add a new teleport method to our Tools class. We want to teleport to the topmost solid block (if findTop is true). We can't do that before teleportation since the other dimension might not be ready yet. That's why we pass an instance of ITeleporter. The placeEntity() method will be called as soon as our player arrives in the other dimension and there we can fix the y location:

```java
public static void teleport(ServerPlayer entity, ServerLevel destination, BlockPos pos, boolean findTop) {
    entity.changeDimension(destination, new ITeleporter() {
        @Override
        public Entity placeEntity(Entity entity, ServerLevel currentWorld, ServerLevel destWorld, float yaw, Function<Boolean, Entity> repositionEntity) {
            entity = repositionEntity.apply(false);
            int y = pos.getY();
            if (findTop) {
                y = destination.getHeight(Heightmap.Types.WORLD_SURFACE_WG, pos.getX(), pos.getZ());
            }
            entity.teleportTo(pos.getX(), y, pos.getZ());
            return entity;
        }
    });
}
```
