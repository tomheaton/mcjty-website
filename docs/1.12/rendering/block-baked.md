---
sidebar_position: 8
---

# Render Block Baked Model

In this tutorial we're going to explain how you can statically render a conduit like system.
This needs a baked model since we have to be able to calculate geometry dynamically.
However, this example does not use tile entities or TESR (TileEntitySpecialRenderer) which means the result will be static and only change when new blocks are added or removed.
Here is how it looks like:

![image](https://i.imgur.com/ekIH6Mc.png)

There are a few things we need to do before this can work.
First a baked model cannot access the world in any way because it can possibly be called in a thread.
So you need a way to transfer all the rendering of the needed information from the block to the baked model.
This works by using ExtendedBlockState and unlisted properties.
These are properties that are not translated to metadata, so you are not limited to the 4 bits of metadata that is reserved for blocks.
It is also not directly stored with the block, so you have to calculate it when the chunk renderer needs it.
In this example we need six booleans to indicate if there is another block of this type on a given side.
First we define a property so that we can store booleans. Note that you can make properties of any possible type.
We could also have chosen to make a single property that contains six booleans (instead of six properties with each containing a boolean).

```java
public class UnlistedPropertyBlockAvailable implements IUnlistedProperty<Boolean> {

    private final String name;

    public UnlistedPropertyBlockAvailable(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public boolean isValid(Boolean value) {
        return true;
    }

    @Override
    public Class<Boolean> getType() {
        return Boolean.class;
    }

    @Override
    public String valueToString(Boolean value) {
        return value.toString();
    }
}
```

Then we use this in our block.
Note that initItemModel() has to be called from within ClientProxy.init() (as opposed to the initModel() which is called from preInit() as usual).
The methods createBlockState() and getExtendedState() are used to communicate the unlisted properties to our baked model.
We override createBlockState() so that we can make an ExtendedBlockState instead of the normal blockstate.
The getExtendedState() method is where we actually calculate the properties based on the presence of adjacent blocks.
This will be used by our baked model at the time static geometry is rendered in the chunk.

```java
public class BakedModelBlock extends Block {

    // Properties that indicate if there is the same block in a certain direction.
    public static final UnlistedPropertyBlockAvailable NORTH = new UnlistedPropertyBlockAvailable("north");
    public static final UnlistedPropertyBlockAvailable SOUTH = new UnlistedPropertyBlockAvailable("south");
    public static final UnlistedPropertyBlockAvailable WEST = new UnlistedPropertyBlockAvailable("west");
    public static final UnlistedPropertyBlockAvailable EAST = new UnlistedPropertyBlockAvailable("east");
    public static final UnlistedPropertyBlockAvailable UP = new UnlistedPropertyBlockAvailable("up");
    public static final UnlistedPropertyBlockAvailable DOWN = new UnlistedPropertyBlockAvailable("down");

    public BakedModelBlock() {
        super(Material.ROCK);
        setUnlocalizedName(ModTut.MODID + ".bakedmodelblock");
        setRegistryName("bakedmodelblock");
    }

    @SideOnly(Side.CLIENT)
    public void initModel() {
        // To make sure that our baked model model is chosen for all states we use this custom state mapper:
        StateMapperBase ignoreState = new StateMapperBase() {
            @Override
            protected ModelResourceLocation getModelResourceLocation(IBlockState iBlockState) {
                return ExampleBakedModel.BAKED_MODEL;
            }
        };
        ModelLoader.setCustomStateMapper(this, ignoreState);
    }

    @SideOnly(Side.CLIENT)
    public void initItemModel() {
        // For our item model we want to use a normal JSON model. This has to be called in
        // ClientProxy.postInit (not preInit) so that's why it is a separate method.
        Item itemBlock = Item.REGISTRY.getObject(new ResourceLocation(ModTut.MODID, "bakedmodelblock"));
        ModelResourceLocation itemModelResourceLocation = new ModelResourceLocation(getRegistryName(), "inventory");
        final int DEFAULT_ITEM_SUBTYPE = 0;
        Minecraft.getMinecraft().getRenderItem().getItemModelMesher().register(itemBlock, DEFAULT_ITEM_SUBTYPE, itemModelResourceLocation);
    }

    @Override
    public boolean isBlockNormalCube(IBlockState blockState) {
        return false;
    }

    @Override
    public boolean isOpaqueCube(IBlockState blockState) {
        return false;
    }

    @Override
    protected BlockState createBlockState() {
        IProperty[] listedProperties = new IProperty[0]; // no listed properties
        IUnlistedProperty[] unlistedProperties = new IUnlistedProperty[] { NORTH, SOUTH, WEST, EAST, UP, DOWN };
        return new ExtendedBlockState(this, listedProperties, unlistedProperties);
    }

    @Override
    public IBlockState getExtendedState(IBlockState state, IBlockAccess world, BlockPos pos) {
        IExtendedBlockState extendedBlockState = (IExtendedBlockState) state;

        boolean north = isSameBlock(world, pos.north());
        boolean south = isSameBlock(world, pos.south());
        boolean west = isSameBlock(world, pos.west());
        boolean east = isSameBlock(world, pos.east());
        boolean up = isSameBlock(world, pos.up());
        boolean down = isSameBlock(world, pos.down());

        return extendedBlockState
                .withProperty(NORTH, north)
                .withProperty(SOUTH, south)
                .withProperty(WEST, west)
                .withProperty(EAST, east)
                .withProperty(UP, up)
                .withProperty(DOWN, down);
    }

    private boolean isSameBlock(IBlockAccess world, BlockPos pos) {
        return world.getBlockState(pos).getBlock() == ModBlocks.bakedModelBlock;
    }
}
```

To get our baked model working we need three things.
First we need a model (implementation of IModel).
That doesn't do much more than act as a way to create our baked model (IBakedModel implementation) which does the actual work.
And finally we need a custom model loader (implementation of ICustomModelLoader) so that we can load our new model from within json.

First we make our model. This is the class that is responsible for making our baked model:

```java
public class ExampleModel implements IModel {
    @Override
    public IBakedModel bake(IModelState state, VertexFormat format, Function<ResourceLocation, TextureAtlasSprite> bakedTextureGetter) {
        return new ExampleBakedModel(state, format, bakedTextureGetter);
    }

    @Override
    public Collection<ResourceLocation> getDependencies() {
        return Collections.emptySet();
    }

    @Override
    public Collection<ResourceLocation> getTextures() {
        return ImmutableSet.of(new ResourceLocation(ModTut.MODID, "blocks/isbmtexture"));
    }

    @Override
    public IModelState getDefaultState() {
        return TRSRTransformation.identity();
    }
}
```

We also need our custom model loader.
This loader only supports our single model, but you can easily extend this to support more models:

```java
public class BakedModelLoader implements ICustomModelLoader {

    public static final ExampleModel EXAMPLE_MODEL = new ExampleModel();

    @Override
    public boolean accepts(ResourceLocation modelLocation) {
        return modelLocation.getResourceDomain().equals(ModTut.MODID) && "bakedmodelblock".equals(modelLocation.getResourcePath());
    }

    @Override
    public IModel loadModel(ResourceLocation modelLocation) throws Exception {
        return EXAMPLE_MODEL;
    }

    @Override
    public void onResourceManagerReload(IResourceManager resourceManager) {
    }
}
```

We also have to register the loader:

```java
public class ClientProxy extends CommonProxy {
    @Override
    public void preInit(FMLPreInitializationEvent e) {
        ...
        ModelLoaderRegistry.registerLoader(new BakedModelLoader());
        ...
    }

    @Override
    public void postInit(FMLPostInitializationEvent e) {
        super.postInit(e);
        ModBlocks.initItemModels();
    }

    ...

}
```

Now we have to define our baked model.
This is a bit more complex but the important thing here is that this baked model calculates the quads (faces of our model) based on the input state which is coming from our block.
To be able to support multiple formats with this (since we don't know how our model will be baked) we use a general putVertex() here that can convert a vertex to the appropriate format automatically:

```java
public class ExampleBakedModel implements IBakedModel {

    public static final ModelResourceLocation BAKED_MODEL = new ModelResourceLocation(ModTut.MODID + ":bakedmodelblock");

    private TextureAtlasSprite sprite;
    private VertexFormat format;

    public ExampleBakedModel(IModelState state, VertexFormat format, Function<ResourceLocation, TextureAtlasSprite> bakedTextureGetter) {
        this.format = format;
        sprite = bakedTextureGetter.apply(new ResourceLocation(ModTut.MODID, "blocks/isbmtexture"));
    }

    private void putVertex(UnpackedBakedQuad.Builder builder, Vec3d normal, double x, double y, double z, float u, float v) {
        for (int e = 0; e < format.getElementCount(); e++) {
            switch (format.getElement(e).getUsage()) {
                case POSITION:
                    builder.put(e, (float)x, (float)y, (float)z, 1.0f);
                    break;
                case COLOR:
                    builder.put(e, 1.0f, 1.0f, 1.0f, 1.0f);
                    break;
                case UV:
                    if (format.getElement(e).getIndex() == 0) {
                        u = sprite.getInterpolatedU(u);
                        v = sprite.getInterpolatedV(v);
                        builder.put(e, u, v, 0f, 1f);
                        break;
                    }
                case NORMAL:
                    builder.put(e, (float) normal.x, (float) normal.y, (float) normal.z, 0f);
                    break;
                default:
                    builder.put(e);
                    break;
            }
        }
    }

    private BakedQuad createQuad(Vec3d v1, Vec3d v2, Vec3d v3, Vec3d v4, TextureAtlasSprite sprite) {
        Vec3d normal = v3.subtract(v2).crossProduct(v1.subtract(v2)).normalize();

        UnpackedBakedQuad.Builder builder = new UnpackedBakedQuad.Builder(format);
        builder.setTexture(sprite);
        putVertex(builder, normal, v1.x, v1.y, v1.z, 0, 0);
        putVertex(builder, normal, v2.x, v2.y, v2.z, 0, 16);
        putVertex(builder, normal, v3.x, v3.y, v3.z, 16, 16);
        putVertex(builder, normal, v4.x, v4.y, v4.z, 16, 0);
        return builder.build();
    }

    @Override
    public List<BakedQuad> getQuads(IBlockState state, EnumFacing side, long rand) {

        if (side != null) {
            return Collections.emptyList();
        }

        IExtendedBlockState extendedBlockState = (IExtendedBlockState) state;
        Boolean north = extendedBlockState.getValue(BakedModelBlock.NORTH);
        Boolean south = extendedBlockState.getValue(BakedModelBlock.SOUTH);
        Boolean west = extendedBlockState.getValue(BakedModelBlock.WEST);
        Boolean east = extendedBlockState.getValue(BakedModelBlock.EAST);
        Boolean up = extendedBlockState.getValue(BakedModelBlock.UP);
        Boolean down = extendedBlockState.getValue(BakedModelBlock.DOWN);
        List<BakedQuad> quads = new ArrayList<>();
        double o = .4;

        // For each side we either cap it off if there is no similar block adjacent on that side
        // or else we extend so that we touch the adjacent block:

        if (up) {
            quads.add(createQuad(new Vec3d(1 - o, 1 - o, o), new Vec3d(1 - o, 1, o), new Vec3d(1 - o, 1, 1 - o), new Vec3d(1 - o, 1 - o, 1 - o), sprite));
            quads.add(createQuad(new Vec3d(o, 1 - o, 1 - o), new Vec3d(o, 1, 1 - o), new Vec3d(o, 1, o), new Vec3d(o, 1 - o, o), sprite));
            quads.add(createQuad(new Vec3d(o, 1, o), new Vec3d(1 - o, 1, o), new Vec3d(1 - o, 1 - o, o), new Vec3d(o, 1 - o, o), sprite));
            quads.add(createQuad(new Vec3d(o, 1 - o, 1 - o), new Vec3d(1 - o, 1 - o, 1 - o), new Vec3d(1 - o, 1, 1 - o), new Vec3d(o, 1, 1 - o), sprite));
        } else {
            quads.add(createQuad(new Vec3d(o, 1 - o, 1 - o), new Vec3d(1 - o, 1 - o, 1 - o), new Vec3d(1 - o, 1 - o, o), new Vec3d(o, 1 - o, o), sprite));
        }

        if (down) {
            quads.add(createQuad(new Vec3d(1 - o, 0, o), new Vec3d(1 - o, o, o), new Vec3d(1 - o, o, 1 - o), new Vec3d(1 - o, 0, 1 - o), sprite));
            quads.add(createQuad(new Vec3d(o, 0, 1 - o), new Vec3d(o, o, 1 - o), new Vec3d(o, o, o), new Vec3d(o, 0, o), sprite));
            quads.add(createQuad(new Vec3d(o, o, o), new Vec3d(1 - o, o, o), new Vec3d(1 - o, 0, o), new Vec3d(o, 0, o), sprite));
            quads.add(createQuad(new Vec3d(o, 0, 1 - o), new Vec3d(1 - o, 0, 1 - o), new Vec3d(1 - o, o, 1 - o), new Vec3d(o, o, 1 - o), sprite));
        } else {
            quads.add(createQuad(new Vec3d(o, o, o), new Vec3d(1 - o, o, o), new Vec3d(1 - o, o, 1 - o), new Vec3d(o, o, 1 - o), sprite));
        }

        if (east) {
            quads.add(createQuad(new Vec3d(1 - o, 1 - o, 1 - o), new Vec3d(1, 1 - o, 1 - o), new Vec3d(1, 1 - o, o), new Vec3d(1 - o, 1 - o, o), sprite));
            quads.add(createQuad(new Vec3d(1 - o, o, o), new Vec3d(1, o, o), new Vec3d(1, o, 1 - o), new Vec3d(1 - o, o, 1 - o), sprite));
            quads.add(createQuad(new Vec3d(1 - o, 1 - o, o), new Vec3d(1, 1 - o, o), new Vec3d(1, o, o), new Vec3d(1 - o, o, o), sprite));
            quads.add(createQuad(new Vec3d(1 - o, o, 1 - o), new Vec3d(1, o, 1 - o), new Vec3d(1, 1 - o, 1 - o), new Vec3d(1 - o, 1 - o, 1 - o), sprite));
        } else {
            quads.add(createQuad(new Vec3d(1 - o, o, o), new Vec3d(1 - o, 1 - o, o), new Vec3d(1 - o, 1 - o, 1 - o), new Vec3d(1 - o, o, 1 - o), sprite));
        }

        if (west) {
            quads.add(createQuad(new Vec3d(0, 1 - o, 1 - o), new Vec3d(o, 1 - o, 1 - o), new Vec3d(o, 1 - o, o), new Vec3d(0, 1 - o, o), sprite));
            quads.add(createQuad(new Vec3d(0, o, o), new Vec3d(o, o, o), new Vec3d(o, o, 1 - o), new Vec3d(0, o, 1 - o), sprite));
            quads.add(createQuad(new Vec3d(0, 1 - o, o), new Vec3d(o, 1 - o, o), new Vec3d(o, o, o), new Vec3d(0, o, o), sprite));
            quads.add(createQuad(new Vec3d(0, o, 1 - o), new Vec3d(o, o, 1 - o), new Vec3d(o, 1 - o, 1 - o), new Vec3d(0, 1 - o, 1 - o), sprite));
        } else {
            quads.add(createQuad(new Vec3d(o, o, 1 - o), new Vec3d(o, 1 - o, 1 - o), new Vec3d(o, 1 - o, o), new Vec3d(o, o, o), sprite));
        }

        if (north) {
            quads.add(createQuad(new Vec3d(o, 1 - o, o), new Vec3d(1 - o, 1 - o, o), new Vec3d(1 - o, 1 - o, 0), new Vec3d(o, 1 - o, 0), sprite));
            quads.add(createQuad(new Vec3d(o, o, 0), new Vec3d(1 - o, o, 0), new Vec3d(1 - o, o, o), new Vec3d(o, o, o), sprite));
            quads.add(createQuad(new Vec3d(1 - o, o, 0), new Vec3d(1 - o, 1 - o, 0), new Vec3d(1 - o, 1 - o, o), new Vec3d(1 - o, o, o), sprite));
            quads.add(createQuad(new Vec3d(o, o, o), new Vec3d(o, 1 - o, o), new Vec3d(o, 1 - o, 0), new Vec3d(o, o, 0), sprite));
        } else {
            quads.add(createQuad(new Vec3d(o, 1 - o, o), new Vec3d(1 - o, 1 - o, o), new Vec3d(1 - o, o, o), new Vec3d(o, o, o), sprite));
        }
        if (south) {
            quads.add(createQuad(new Vec3d(o, 1 - o, 1), new Vec3d(1 - o, 1 - o, 1), new Vec3d(1 - o, 1 - o, 1 - o), new Vec3d(o, 1 - o, 1 - o), sprite));
            quads.add(createQuad(new Vec3d(o, o, 1 - o), new Vec3d(1 - o, o, 1 - o), new Vec3d(1 - o, o, 1), new Vec3d(o, o, 1), sprite));
            quads.add(createQuad(new Vec3d(1 - o, o, 1 - o), new Vec3d(1 - o, 1 - o, 1 - o), new Vec3d(1 - o, 1 - o, 1), new Vec3d(1 - o, o, 1), sprite));
            quads.add(createQuad(new Vec3d(o, o, 1), new Vec3d(o, 1 - o, 1), new Vec3d(o, 1 - o, 1 - o), new Vec3d(o, o, 1 - o), sprite));
        } else {
            quads.add(createQuad(new Vec3d(o, o, 1 - o), new Vec3d(1 - o, o, 1 - o), new Vec3d(1 - o, 1 - o, 1 - o), new Vec3d(o, 1 - o, 1 - o), sprite));
        }

        return quads;
    }

    @Override
    public ItemOverrideList getOverrides() {
        return null;
    }

    @Override
    public boolean isAmbientOcclusion() {
        return false;
    }

    @Override
    public boolean isGui3d() {
        return false;
    }

    @Override
    public boolean isBuiltInRenderer() {
        return false;
    }

    @Override
    public TextureAtlasSprite getParticleTexture() {
        return sprite;
    }

    @Override
    public ItemCameraTransforms getItemCameraTransforms() {
        return ItemCameraTransforms.DEFAULT;
    }
}
```

In our ModBlocks class we need to define a new entry to initialize the item model for our baked model block.
`initItemModels()` has to be called from `ClientProxy.init()`:

```java
public class ModBlocks {

    ...

    @GameRegistry.ObjectHolder("modtut:bakedmodelblock")
    public static BakedModelBlock bakedModelBlock;

    @SideOnly(Side.CLIENT)
    public static void initModels() {
        ...
        bakedModelBlock.initModel();
    }

    @SideOnly(Side.CLIENT)
    public static void initItemModels() {
        bakedModelBlock.initItemModel();
    }
}
```

Finally, even though we use a baked model we still need to define json's for the block states and models.
For example, for our inventory model (what is shown in the inventory itself) and also a dummy block model that will get replaced with the baked model.
First here is the blockstate (`blockstates/bakedmodelblock.json`):

```json title="blockstates/bakedmodelblock.json"
{
  "variants": {
    "normal": { "model": "modtut:bakedmodelblock" }
  }
}
```

Then the block model (`models/block/bakedmodelblock.json`):

```json title="models/block/bakedmodelblock.json"
{
  "parent": "block/cube_all",
  "textures": {
    "all": "modtut:blocks/bakedmodeltexture"
  }
}
```

And finally the item model (`models/item/bakedmodelblock.json`):

```json title="models/item/bakedmodelblock.json"
{
  "parent": "modtut:block/bakedmodelblock",
  "display": {
    "thirdperson": {
      "rotation": [ 10, -45, 170 ],
      "translation": [ 0, 1.5, -2.75 ],
      "scale": [ 0.375, 0.375, 0.375 ]
    }
  }
}
```
