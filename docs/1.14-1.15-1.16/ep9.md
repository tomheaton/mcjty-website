---
sidebar_position: 9
---

# Episode 9

Back: [Index](./1.14-1.15-1.16.md)

===Introduction===

In this tutorial we make a new block that has a baked model that allows us to mimic the appearance of other blocks.

===Creating a new fancy block===

First we create a new block. In this block we use a smaller default voxel shape (see getShape). We also implement onBlockActivated() which makes sure of changing the block that we are mimicing by setting that on the tile entity.
```
<syntaxhighlight lang="java">
public class FancyBlock extends Block {

    private final VoxelShape shape = VoxelShapes.create(.2, .2, .2, .8, .8, .8);

    public FancyBlock() {
        super(Properties.create(Material.IRON)
                .sound(SoundType.METAL)
                .hardnessAndResistance(2.0f)
        );
        setRegistryName("fancyblock");
    }

    @Override
    public VoxelShape getShape(BlockState state, IBlockReader reader, BlockPos pos, ISelectionContext context) {
        return shape;
    }

    @Override
    public boolean hasTileEntity(BlockState state) {
        return true;
    }

    @Nullable
    @Override
    public TileEntity createTileEntity(BlockState state, IBlockReader world) {
        return new FancyBlockTile();
    }

    @Override
    public boolean onBlockActivated(BlockState state, World world, BlockPos pos, PlayerEntity player, Hand hand, BlockRayTraceResult result) {
        ItemStack item = player.getHeldItem(hand);
        if (!item.isEmpty() && item.getItem() instanceof BlockItem) {
            if (!world.isRemote) {
                TileEntity te = world.getTileEntity(pos);
                if (te instanceof FancyBlockTile) {
                    BlockState mimicState = ((BlockItem) item.getItem()).getBlock().getDefaultState();
                    ((FancyBlockTile) te).setMimic(mimicState);
                }
            }
            return true;
        }
        return super.onBlockActivated(state, world, pos, player, hand, result);
    }
}
</syntaxhighlight>
```
Because we are going to use baked models we don't need a lot of jsons here. We can suffice with this blockstate json:
```
<syntaxhighlight lang="json">
{
  "variants": {
    "": { "model": "mytutorial:block/fancyblock" }
  }
}
</syntaxhighlight>
```
We add the usual ObjectHolder in ModBlocks and the proper registration lines in MyTutorial.

===The tile entity===

The tile entity is responsible for actually remembering what block we are mimicing and also for notifying the client / baked model whenever a change is needed. To communicate the mimic state we use a ModelProperty and implement getModelData() to communicate the value of that property to the baked model (see later on that one). Keep in mind that getModelData() can be run in the rendering thread so it should avoid accessing things like World and so on.

In our TileEntity we use getUpdatePacket() (called server-side) to construct the data needed for the client and onDataPacket() (called client-side) to actually retrieve that data and notify the renderer.
```
<syntaxhighlight lang="java">
public class FancyBlockTile extends TileEntity {

    public static final ModelProperty<BlockState> MIMIC = new ModelProperty<>();

    private BlockState mimic;

    public FancyBlockTile() {
        super(FANCYBLOCK_TILE);
    }

    public void setMimic(BlockState mimic) {
        this.mimic = mimic;
        markDirty();
        world.notifyBlockUpdate(pos, getBlockState(), getBlockState(), Constants.BlockFlags.BLOCK_UPDATE + Constants.BlockFlags.NOTIFY_NEIGHBORS);
    }

    @Nullable
    @Override
    public SUpdateTileEntityPacket getUpdatePacket() {
        CompoundNBT tag = new CompoundNBT();
        if (mimic != null) {
            tag.put("mimic", NBTUtil.writeBlockState(mimic));
        }
        return new SUpdateTileEntityPacket(pos, 1, tag);
    }

    @Override
    public void onDataPacket(NetworkManager net, SUpdateTileEntityPacket pkt) {
        BlockState oldMimic = mimic;
        CompoundNBT tag = pkt.getNbtCompound();
        if (tag.contains("mimic")) {
            mimic = NBTUtil.readBlockState(tag.getCompound("mimic"));
            if (!Objects.equals(oldMimic, mimic)) {
                ModelDataManager.requestModelDataRefresh(this);
                world.notifyBlockUpdate(pos, getBlockState(), getBlockState(), Constants.BlockFlags.BLOCK_UPDATE + Constants.BlockFlags.NOTIFY_NEIGHBORS);
            }
        }
    }

    @Nonnull
    @Override
    public IModelData getModelData() {
        return new ModelDataMap.Builder()
                .withInitial(MIMIC, mimic)
                .build();
    }

    @Override
    public void read(CompoundNBT tag) {
        super.read(tag);
        if (tag.contains("mimic")) {
            mimic = NBTUtil.readBlockState(tag.getCompound("mimic"));
        }
    }

    @Override
    public CompoundNBT write(CompoundNBT tag) {
        if (mimic != null) {
            tag.put("mimic", NBTUtil.writeBlockState(mimic));
        }
        return super.write(tag);
    }
}
</syntaxhighlight>
```
===The baked model===

The baked model is what is actually going to do the rendering of our model. If we are not mimicing anything we just show a small green block. As soon as the player right-clicks with something it will attempt to mimic that block and get the quads (rectangles) from that. This baked model has a VertexFormat parameter in its constructor so that we can use it both for the in-world block as well as the inventory model (these are baked with a different format). putVertex() makes sure to correctly distribute the vertex data based on the desired format.

The 'extraData' parameter that is given to getQuads() will contain our MIMIC property that we can use to find the right model to mimic.
```
<syntaxhighlight lang="java">
public class FancyBakedModel implements IDynamicBakedModel {

    private final VertexFormat format;
    private final ItemCameraTransforms transforms = getAllTransforms();

    public FancyBakedModel(VertexFormat format) {
        this.format = format;
    }

    private TextureAtlasSprite getTexture() {
        String name = MyTutorial.MODID + ":block/fancyblock";
        return Minecraft.getInstance().getTextureMap().getAtlasSprite(name);
    }

    private void putVertex(UnpackedBakedQuad.Builder builder, Vec3d normal,
                           double x, double y, double z, float u, float v, TextureAtlasSprite sprite, float r, float g, float b) {
        for (int e = 0; e < format.getElementCount(); e++) {
            switch (format.getElement(e).getUsage()) {
                case POSITION:
                    builder.put(e, (float) x, (float) y, (float) z, 1.0f);
                    break;
                case COLOR:
                    builder.put(e, r, g, b, 1.0f);
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
        putVertex(builder, normal, v1.x, v1.y, v1.z, 0, 0, sprite, 1.0f, 1.0f, 1.0f);
        putVertex(builder, normal, v2.x, v2.y, v2.z, 0, 16, sprite, 1.0f, 1.0f, 1.0f);
        putVertex(builder, normal, v3.x, v3.y, v3.z, 16, 16, sprite, 1.0f, 1.0f, 1.0f);
        putVertex(builder, normal, v4.x, v4.y, v4.z, 16, 0, sprite, 1.0f, 1.0f, 1.0f);
        return builder.build();
    }

    private static Vec3d v(double x, double y, double z) {
        return new Vec3d(x, y, z);
    }


    @Nonnull
    @Override
    public List<BakedQuad> getQuads(@Nullable BlockState state, @Nullable Direction side, @Nonnull Random rand, @Nonnull IModelData extraData) {

        BlockState mimic = extraData.getData(FancyBlockTile.MIMIC);
        if (mimic != null) {
            ModelResourceLocation location = BlockModelShapes.getModelLocation(mimic);
            if (location != null) {
                IBakedModel model = Minecraft.getInstance().getModelManager().getModel(location);
                if (model != null) {
                    return model.getQuads(mimic, side, rand, extraData);
                }
            }
        }

        if (side != null) {
            return Collections.emptyList();
        }

        TextureAtlasSprite texture = getTexture();
        List<BakedQuad> quads = new ArrayList<>();
        double l = .2;
        double r = 1-.2;
        quads.add(createQuad(v(l, r, l), v(l, r, r), v(r, r, r), v(r, r, l), texture));
        quads.add(createQuad(v(l, l, l), v(r, l, l), v(r, l, r), v(l, l, r), texture));
        quads.add(createQuad(v(r, r, r), v(r, l, r), v(r, l, l), v(r, r, l), texture));
        quads.add(createQuad(v(l, r, l), v(l, l, l), v(l, l, r), v(l, r, r), texture));
        quads.add(createQuad(v(r, r, l), v(r, l, l), v(l, l, l), v(l, r, l), texture));
        quads.add(createQuad(v(l, r, r), v(l, l, r), v(r, l, r), v(r, r, r), texture));

        return quads;
    }

    @Override
    public boolean isAmbientOcclusion() {
        return true;
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
        return getTexture();
    }

    @Override
    public ItemOverrideList getOverrides() {
        return ItemOverrideList.EMPTY;
    }

    @Override
    public ItemCameraTransforms getItemCameraTransforms() {
        return transforms;
    }

    public ItemCameraTransforms getAllTransforms() {
        ItemTransformVec3f tpLeft = this.getTransform(ItemCameraTransforms.TransformType.THIRD_PERSON_LEFT_HAND);
        ItemTransformVec3f tpRight = this.getTransform(ItemCameraTransforms.TransformType.THIRD_PERSON_RIGHT_HAND);
        ItemTransformVec3f fpLeft = this.getTransform(ItemCameraTransforms.TransformType.FIRST_PERSON_LEFT_HAND);
        ItemTransformVec3f fpRight = this.getTransform(ItemCameraTransforms.TransformType.FIRST_PERSON_RIGHT_HAND);
        ItemTransformVec3f head = this.getTransform(ItemCameraTransforms.TransformType.HEAD);
        ItemTransformVec3f gui = this.getTransform(ItemCameraTransforms.TransformType.GUI);
        ItemTransformVec3f ground = this.getTransform(ItemCameraTransforms.TransformType.GROUND);
        ItemTransformVec3f fixed = this.getTransform(ItemCameraTransforms.TransformType.FIXED);
        return new ItemCameraTransforms(tpLeft, tpRight, fpLeft, fpRight, head, gui, ground, fixed);
    }

    private ItemTransformVec3f getTransform(ItemCameraTransforms.TransformType type) {
        if (type.equals(ItemCameraTransforms.TransformType.GUI)) {
            return new ItemTransformVec3f(new Vector3f(200, 50, 100), new Vector3f(), new Vector3f(1.0F, 1.0F, 1.0F));
        }
        return ItemTransformVec3f.DEFAULT;
    }

}
</syntaxhighlight>
```
===Stitching and baking===

To make sure that Minecraft knows about both the texture as well as the model we need to add some code to ClientRegistration. Minecraft stores all block textures on a big 'atlas'. This is a large texture that is filled with all the smaller (usually) 16x16 textures. This helps greatly with rendering speed as texture switching on 3D hardware is rather expensive. To put our texture on this atlas we need to subscribe to the TextureStitchEvent.Pre event because we don't have it as a texture in a JSON (these are stitched automatically).

Similarly we also need to subscribe tot the ModelBakeEvent event to make sure our model is known. We register two variations. One for the in-world model ("") and one for the inventory ("inventory").
```
<syntaxhighlight lang="java">
    @SubscribeEvent
    public static void onTextureStitch(TextureStitchEvent.Pre event) {
        if (!event.getMap().getBasePath().equals("textures")) {
            return;
        }
        event.addSprite(new ResourceLocation(MyTutorial.MODID, "block/fancyblock"));
    }

    @SubscribeEvent
    public static void onModelBake(ModelBakeEvent event) {
        event.getModelRegistry().put(new ModelResourceLocation(ModBlocks.FANCYBLOCK.getRegistryName(), ""),
                new FancyBakedModel(DefaultVertexFormats.BLOCK));
        event.getModelRegistry().put(new ModelResourceLocation(ModBlocks.FANCYBLOCK.getRegistryName(), "inventory"),
                new FancyBakedModel(DefaultVertexFormats.ITEM));
    }
</syntaxhighlight>
```
===Conclusion===

If all is done well thisi should work. Note that there are still some issues with this code. For example, it doesn't work properly for models that use transparent textures (like torches, flowers, ...). This is also solvable but requires tinkering with render layers.
