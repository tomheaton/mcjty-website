---
sidebar_position: 14
---

# Dimensions

This more advanced tutorial shows how you can make your own custom dimension.
Note that this tutorial depends on the tutorial to add a custom command (to be able to teleport to your dimension) and also the tutorial on the configuration section.

![image](https://i.imgur.com/KyF7Lhk.png)

Implementing your own dimension is fun and there really is a lot you can do to tweak your dimension.
In this tutorial we will only show you the very basic dimension.
There is a lot more that you can do.
A good reference for doing more with dimensions is the vanilla 'ChunkProviderOverworld' class.
Our dimension only implements a subset of the vanilla overworld.

The first thing you need is a WorldProvider implementation.
In many cases every dimension has its own WorldProvider, but it is actually possible to reuse the same world provider for multiple dimensions (RFTools Dimensions does that).
Also note that there are lot more functions in WorldProvider that you can override to provide all kinds of interesting results.
You can affect the time of the dimension, the sky, the weather, and much, much more here.

```java
public class TestWorldProvider extends WorldProvider {

    @Override
    public DimensionType getDimensionType() {
        return ModDimensions.testDimensionType;
    }

    @Override
    public String getSaveFolder() {
        return "TEST";
    }

    @Override
    public IChunkGenerator createChunkGenerator() {
        return new TestChunkGenerator(world);
    }
}
```

Now we need the actual code that generates our landscape.
This is a modified copy of ChunkProviderOverworld except that we separated the actual terrain generator in a separate class for clarity.
The terrain we generate here is basically only doing terrain and caves.
There are no structures, no ravines and so on.
Feel free to check the vanilla code to see how to implement those.
We also make our custom mob spawn here as the only creature.
You can of course also change that:

```java
public class TestChunkGenerator implements IChunkGenerator {

    private final World worldObj;
    private Random random;
    private Biome[] biomesForGeneration;

    private List<Biome.SpawnListEntry> mobs = Lists.newArrayList(new Biome.SpawnListEntry(EntityWeirdZombie.class, 100, 2, 2));

    private MapGenBase caveGenerator = new MapGenCaves();
    private NormalTerrainGenerator terraingen = new NormalTerrainGenerator();

    public TestChunkGenerator(World worldObj) {
        this.worldObj = worldObj;
        long seed = worldObj.getSeed();
        this.random = new Random((seed + 516) * 314);
        terraingen.setup(worldObj, random);
        caveGenerator = TerrainGen.getModdedMapGen(caveGenerator, CAVE);
    }

    @Override
    public Chunk generateChunk(int x, int z) {
        ChunkPrimer chunkprimer = new ChunkPrimer();

        // Setup biomes for terraingen
        this.biomesForGeneration = this.worldObj.getBiomeProvider().getBiomesForGeneration(this.biomesForGeneration, x * 4 - 2, z * 4 - 2, 10, 10);
        terraingen.setBiomesForGeneration(biomesForGeneration);
        terraingen.generate(x, z, chunkprimer);

        // Setup biomes again for actual biome decoration
        this.biomesForGeneration = this.worldObj.getBiomeProvider().getBiomes(this.biomesForGeneration, x * 16, z * 16, 16, 16);
        // This will replace stone with the biome specific stones
        terraingen.replaceBiomeBlocks(x, z, chunkprimer, this, biomesForGeneration);

        // Generate caves
        this.caveGenerator.generate(this.worldObj, x, z, chunkprimer);

        Chunk chunk = new Chunk(this.worldObj, chunkprimer, x, z);

        byte[] biomeArray = chunk.getBiomeArray();
        for (int i = 0; i < biomeArray.length; ++i) {
            biomeArray[i] = (byte)Biome.getIdForBiome(this.biomesForGeneration[i]);
        }

        chunk.generateSkylightMap();
        return chunk;
    }

    @Override
    public void populate(int x, int z) {
        int i = x * 16;
        int j = z * 16;
        BlockPos blockpos = new BlockPos(i, 0, j);
        Biome biome = this.worldObj.getBiome(blockpos.add(16, 0, 16));

        // Add biome decorations (like flowers, grass, trees, ...)
        biome.decorate(this.worldObj, this.random, blockpos);

        // Make sure animals appropriate to the biome spawn here when the chunk is generated
        WorldEntitySpawner.performWorldGenSpawning(this.worldObj, biome, i + 8, j + 8, 16, 16, this.random);
    }

    @Override
    public boolean generateStructures(Chunk chunkIn, int x, int z) {
        return false;
    }

    @Override
    public List<Biome.SpawnListEntry> getPossibleCreatures(EnumCreatureType creatureType, BlockPos pos) {
        // If you want normal creatures appropriate for this biome then uncomment the
        // following two lines:
//        Biome biome = this.worldObj.getBiome(pos);
//        return biome.getSpawnableList(creatureType);

        if (creatureType == EnumCreatureType.MONSTER){
            return mobs;
        }
        return ImmutableList.of();
    }

    @Nullable
    @Override
    public BlockPos getNearestStructurePos(World worldIn, String structureName, BlockPos position, boolean findUnexplored) {
        return null;
    }

    @Override
    public boolean isInsideStructure(World worldIn, String structureName, BlockPos pos) {
        return false;
    }

    @Override
    public void recreateStructures(Chunk chunkIn, int x, int z) {
    }
}
```

Now we need the actual terrain generator.
This is pretty complicated code that involves a lot of math (perlin noise functions and so on).
We will not explain those in detail.
I suggest you try to tweak the values here and see what effects that all gives.
The basic purpose of this code is to fill a heightmap and then generate a chunk based on that.
Chunks are generated in the ChunkPrimer class.
If you just want to create a flat terrain then that would be really easy to do with the primer:

```java
public class NormalTerrainGenerator {
    private World world;
    private Random random;

    private final double[] heightMap;
    private double[] mainNoiseRegion;
    private double[] minLimitRegion;
    private double[] maxLimitRegion;
    private double[] depthRegion;

    private NoiseGeneratorOctaves minLimitPerlinNoise;
    private NoiseGeneratorOctaves maxLimitPerlinNoise;
    private NoiseGeneratorOctaves mainPerlinNoise;
    private NoiseGeneratorPerlin surfaceNoise;

    // A NoiseGeneratorOctaves used in generating terrain
    private NoiseGeneratorOctaves depthNoise;

    private final float[] biomeWeights;
    private double[] depthBuffer = new double[256];

    private Biome[] biomesForGeneration;

    public NormalTerrainGenerator() {
        this.heightMap = new double[825];

        this.biomeWeights = new float[25];
        for (int j = -2; j <= 2; ++j) {
            for (int k = -2; k <= 2; ++k) {
                float f = 10.0F / MathHelper.sqrt_float((j * j + k * k) + 0.2F);
                this.biomeWeights[j + 2 + (k + 2) * 5] = f;
            }
        }
    }

    public void setBiomesForGeneration(Biome[] biomesForGeneration) {
        this.biomesForGeneration = biomesForGeneration;
    }

    public void setup(World world, Random rand) {
        this.world = world;
        this.random = rand;

        this.minLimitPerlinNoise = new NoiseGeneratorOctaves(rand, 16);
        this.maxLimitPerlinNoise = new NoiseGeneratorOctaves(rand, 16);
        this.mainPerlinNoise = new NoiseGeneratorOctaves(rand, 8);
        this.surfaceNoise = new NoiseGeneratorPerlin(rand, 4);
        NoiseGeneratorOctaves noiseGen5 = new NoiseGeneratorOctaves(rand, 10);
        this.depthNoise = new NoiseGeneratorOctaves(rand, 16);
        NoiseGeneratorOctaves mobSpawnerNoise = new NoiseGeneratorOctaves(rand, 8);

        net.minecraftforge.event.terraingen.InitNoiseGensEvent.ContextOverworld ctx =
                new net.minecraftforge.event.terraingen.InitNoiseGensEvent.ContextOverworld(minLimitPerlinNoise,
                    maxLimitPerlinNoise, mainPerlinNoise, surfaceNoise, noiseGen5, depthNoise, mobSpawnerNoise);
        ctx = net.minecraftforge.event.terraingen.TerrainGen.getModdedNoiseGenerators(world, rand, ctx);
        this.minLimitPerlinNoise = ctx.getLPerlin1();
        this.maxLimitPerlinNoise = ctx.getLPerlin2();
        this.mainPerlinNoise = ctx.getPerlin();
        this.surfaceNoise = ctx.getHeight();
        this.depthNoise = ctx.getDepth();
    }

    private void generateHeightmap(int chunkX4, int chunkY4, int chunkZ4) {
        this.depthRegion = this.depthNoise.generateNoiseOctaves(this.depthRegion, chunkX4, chunkZ4, 5, 5, 200.0D, 200.0D, 0.5D);
        this.mainNoiseRegion = this.mainPerlinNoise.generateNoiseOctaves(this.mainNoiseRegion, chunkX4, chunkY4, chunkZ4, 5, 33, 5, 8.55515D, 4.277575D, 8.55515D);
        this.minLimitRegion = this.minLimitPerlinNoise.generateNoiseOctaves(this.minLimitRegion, chunkX4, chunkY4, chunkZ4, 5, 33, 5, 684.412D, 684.412D, 684.412D);
        this.maxLimitRegion = this.maxLimitPerlinNoise.generateNoiseOctaves(this.maxLimitRegion, chunkX4, chunkY4, chunkZ4, 5, 33, 5, 684.412D, 684.412D, 684.412D);
        int l = 0;
        int i1 = 0;

        for (int j1 = 0; j1 < 5; ++j1) {
            for (int k1 = 0; k1 < 5; ++k1) {
                float f = 0.0F;
                float f1 = 0.0F;
                float f2 = 0.0F;
                byte b0 = 2;

                for (int l1 = -b0; l1 <= b0; ++l1) {
                    for (int i2 = -b0; i2 <= b0; ++i2) {
                        Biome biome = this.biomesForGeneration[j1 + 2 + (k1 + 2) * 10];
                        float baseHeight = biome.getBaseHeight();
                        float variation = biome.getHeightVariation();

                        float f5 = biomeWeights[l1 + 2 + (i2 + 2) * 5] / (baseHeight + 2.0F);
                        f += variation * f5;
                        f1 += baseHeight * f5;
                        f2 += f5;
                    }
                }

                f /= f2;
                f1 /= f2;
                f = f * 0.9F + 0.1F;
                f1 = (f1 * 4.0F - 1.0F) / 8.0F;
                double d12 = this.depthRegion[i1] / 8000.0D;

                if (d12 < 0.0D) {
                    d12 = -d12 * 0.3D;
                }

                d12 = d12 * 3.0D - 2.0D;

                if (d12 < 0.0D) {
                    d12 /= 2.0D;

                    if (d12 < -1.0D) {
                        d12 = -1.0D;
                    }

                    d12 /= 1.4D;
                    d12 /= 2.0D;
                } else {
                    if (d12 > 1.0D) {
                        d12 = 1.0D;
                    }

                    d12 /= 8.0D;
                }

                ++i1;
                double d13 = f1;
                double d14 = f;
                d13 += d12 * 0.2D;
                d13 = d13 * 8.5D / 8.0D;
                double d5 = 8.5D + d13 * 4.0D;

                for (int j2 = 0; j2 < 33; ++j2) {
                    double d6 = (j2 - d5) * 12.0D * 128.0D / 256.0D / d14;

                    if (d6 < 0.0D) {
                        d6 *= 4.0D;
                    }

                    double d7 = this.minLimitRegion[l] / 512.0D;
                    double d8 = this.maxLimitRegion[l] / 512.0D;
                    double d9 = (this.mainNoiseRegion[l] / 10.0D + 1.0D) / 2.0D;
                    double d10 = MathHelper.denormalizeClamp(d7, d8, d9) - d6;

                    if (j2 > 29) {
                        double d11 = ((j2 - 29) / 3.0F);
                        d10 = d10 * (1.0D - d11) + -10.0D * d11;
                    }

                    this.heightMap[l] = d10;
                    ++l;
                }
            }
        }
    }

    public void generate(int chunkX, int chunkZ, ChunkPrimer primer) {
        generateHeightmap(chunkX * 4, 0, chunkZ * 4);

        byte waterLevel = 63;
        for (int x4 = 0; x4 < 4; ++x4) {
            int l = x4 * 5;
            int i1 = (x4 + 1) * 5;

            for (int z4 = 0; z4 < 4; ++z4) {
                int k1 = (l + z4) * 33;
                int l1 = (l + z4 + 1) * 33;
                int i2 = (i1 + z4) * 33;
                int j2 = (i1 + z4 + 1) * 33;

                for (int height32 = 0; height32 < 32; ++height32) {
                    double d0 = 0.125D;
                    double d1 = heightMap[k1 + height32];
                    double d2 = heightMap[l1 + height32];
                    double d3 = heightMap[i2 + height32];
                    double d4 = heightMap[j2 + height32];
                    double d5 = (heightMap[k1 + height32 + 1] - d1) * d0;
                    double d6 = (heightMap[l1 + height32 + 1] - d2) * d0;
                    double d7 = (heightMap[i2 + height32 + 1] - d3) * d0;
                    double d8 = (heightMap[j2 + height32 + 1] - d4) * d0;

                    for (int h = 0; h < 8; ++h) {
                        double d9 = 0.25D;
                        double d10 = d1;
                        double d11 = d2;
                        double d12 = (d3 - d1) * d9;
                        double d13 = (d4 - d2) * d9;
                        int height = (height32 * 8) + h;

                        for (int x = 0; x < 4; ++x) {
                            double d14 = 0.25D;
                            double d16 = (d11 - d10) * d14;
                            double d15 = d10 - d16;

                            for (int z = 0; z < 4; ++z) {
                                if (height < 2) {
                                    primer.setBlockState(x4 * 4 + x, height32 * 8 + h, z4 * 4 + z, Blocks.BEDROCK.getDefaultState());
                                } else if ((d15 += d16) > 0.0D) {
                                    primer.setBlockState(x4 * 4 + x, height32 * 8 + h, z4 * 4 + z, Blocks.STONE.getDefaultState());
                                }
                            }

                            d10 += d12;
                            d11 += d13;
                        }

                        d1 += d5;
                        d2 += d6;
                        d3 += d7;
                        d4 += d8;
                    }
                }
            }
        }
    }

    public void replaceBiomeBlocks(int x, int z, ChunkPrimer primer, IChunkGenerator generator, Biome[] biomes) {
        if (!net.minecraftforge.event.ForgeEventFactory.onReplaceBiomeBlocks(generator, x, z, primer, this.world)) return;
        this.depthBuffer = this.surfaceNoise.getRegion(this.depthBuffer, (x * 16), (z * 16), 16, 16, 0.0625D, 0.0625D, 1.0D);

        for (int i = 0; i < 16; ++i) {
            for (int j = 0; j < 16; ++j) {
                Biome biome = biomes[j + i * 16];
                biome.genTerrainBlocks(this.world, this.random, primer, x * 16 + i, z * 16 + j, this.depthBuffer[j + i * 16]);
            }
        }
    }
}
```

Now finally we need to set this all up so that our dimension actually works in game. To do that we add a new ModDimensions class. There are two distinct things we need to register here. First there is the dimension type. This is actually an enum that you can extend at runtime (Forge magic) using DimensionType.register(). The dimension type maps a dimension type ID to your world provider. In this example the ID for the dimension type and the dimension are the same but that's not actually required.

Then we also need to register the dimension itself and map it to the dimension type.

Finally, we call our new init() method from our CommonProxy class:

```java
public class ModDimensions {

    public static DimensionType testDimensionType;

    public static void init() {
        registerDimensionTypes();
        registerDimensions();
    }

    private static void registerDimensionTypes() {
        testDimensionType = DimensionType.register(ModTut.MODID, "_test", Config.dimensionId, TestWorldProvider.class, false);
    }

    private static void registerDimensions() {
        DimensionManager.registerDimension(Config.dimensionId, testDimensionType);
    }
}

public class CommonProxy {

    ...

    public void preInit(FMLPreInitializationEvent e) {

        ...

        ModDimensions.init();

        ...

    }
}
```

To test our dimension you can use: `/tp 100` in game
