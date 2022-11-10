---
sidebar_position: 3
---

# Episode 3

## Links

* Video: [Baked Model, Block Entity Renderer](https://www.youtube.com/watch?v=FOELvN6rGPQ&ab_channel=JorritTyberghein)
* [Back to 1.18 Tutorial Index](./1.18.md)
* [Tutorial GitHub](https://github.com/McJty/TutorialV3)

## Introduction

This tutorial explains two new concepts related to rendering of blocks: BakedModels and Block Entity Renderers. We do this by implementing a new advanced block that can generate ores out of ingots.

===The Generator===

The generator is the block in the middle. It is a block without a gui and all interaction happens in the world itself. It has two buttons that you can press, an area where you can insert an ore and also a status area:

https://i.imgur.com/rNHnnjH.png

Add the following things to Registration. This time there is no container since the generator does not have a gui:
```
 <syntaxhighlight lang="java">
    public static final RegistryObject<GeneratorBlock> GENERATOR = BLOCKS.register("generator", GeneratorBlock::new);
    public static final RegistryObject<Item> GENERATOR_ITEM = fromBlock(GENERATOR);
    public static final RegistryObject<BlockEntityType<GeneratorBE>> GENERATOR_BE = BLOCK_ENTITIES.register("generator", () -> BlockEntityType.Builder.of(GeneratorBE::new, GENERATOR.get()).build(null));
</syntaxhighlight>
```
===The Generator Block===

This is the actual code of the generator block. It is similar to the code for the power generator block but there are a few differences.

* Instead of using the POWERED property, this block uses the FACING property. The FACING property has six values (NORTH, SOUTH, WEST, EAST, UP, and DOWN) and represents the direction our block is facing.
* Because our block doesn't take the space of a full block we override getShape() to return a slightly smaller shape depending on the FACING property. You can see this shape in game by looking at the dark overlay lines when you hover over the block in the world.
* The implementation of 'use' is different. We don't open a gui this time but instead we have to calculate the quadrant of the face that we hit.
```
 <syntaxhighlight lang="java">
public class GeneratorBlock extends Block implements EntityBlock {

    public static final String MESSAGE_GENERATOR = "message.generator";

    private static final VoxelShape SHAPE_DOWN = Shapes.box(0, .2, 0, 1, 1, 1);
    private static final VoxelShape SHAPE_UP = Shapes.box(0, 0, 0, 1, .8, 1);
    private static final VoxelShape SHAPE_NORTH = Shapes.box(0, 0, .2, 1, 1, 1);
    private static final VoxelShape SHAPE_SOUTH = Shapes.box(0, 0, 0, 1, 1, .8);
    private static final VoxelShape SHAPE_WEST = Shapes.box(.2, 0, 0, 1, 1, 1);
    private static final VoxelShape SHAPE_EAST = Shapes.box(0, 0, 0, .8, 1, 1);

    public GeneratorBlock() {
        super(Properties.of(Material.METAL)
                .sound(SoundType.METAL)
                .strength(2.0f)
                .noOcclusion()
                .requiresCorrectToolForDrops()
            );
    }

    @Override
    public void appendHoverText(ItemStack stack, @javax.annotation.Nullable BlockGetter reader, List<Component> list, TooltipFlag flags) {
        list.add(new TranslatableComponent(MESSAGE_GENERATOR).withStyle(ChatFormatting.BLUE));
    }

    @Override
    public VoxelShape getShape(BlockState state, BlockGetter getter, BlockPos pos, CollisionContext context) {
        return switch (state.getValue(BlockStateProperties.FACING)) {
            case DOWN -> SHAPE_DOWN;
            case UP -> SHAPE_UP;
            case NORTH -> SHAPE_NORTH;
            case SOUTH -> SHAPE_SOUTH;
            case WEST -> SHAPE_WEST;
            case EAST -> SHAPE_EAST;
        };
    }

    @Nullable
    @Override
    public BlockEntity newBlockEntity(BlockPos pos, BlockState state) {
        return new GeneratorBE(pos, state);
    }

    @Nullable
    @Override
    public <T extends BlockEntity> BlockEntityTicker<T> getTicker(Level level, BlockState state, BlockEntityType<T> type) {
        if (!level.isClientSide()) {
            return (lvl, pos, stt, te) -> {
                if (te instanceof GeneratorBE generator) generator.tickServer();
            };
        }
        return null;
    }

    @Override
    public InteractionResult use(BlockState state, Level level, BlockPos pos, Player player, InteractionHand hand, BlockHitResult result) {
        if (!level.isClientSide()) {
            BlockEntity be = level.getBlockEntity(pos);
            if (be instanceof GeneratorBE generator) {
                Direction direction = result.getDirection();
                Direction facing = state.getValue(BlockStateProperties.FACING);
                // If the face that we hit is the same as the direction that our block is facing we know that we hit the front of the block
                if (direction == facing) {
                    // Subtract the position of our block from the location that we hit to get the relative location in 3D
                    Vec3 hit = result.getLocation().subtract(pos.getX(), pos.getY(), pos.getZ());
                    // We want to transform this 3D location to 2D so that we can more easily check which quadrant is hit
                    double x = getXFromHit(facing, hit);
                    double y = getYFromHit(facing, hit);

                    if (x < .5 && y > .5) {
                        generator.setCollecting(!generator.isCollecting());
                    } else if (x > .5 && y > .5) {
                        generator.setGenerating(!generator.isGenerating());
                    } else if (x > .5 && y < .5) {
                        ItemStack item = player.getItemInHand(hand);
                        // If the item that the player is holding is a BlockItem then we get the blockstate from it
                        // and give that to our block entity
                        if (item.getItem() instanceof BlockItem blockItem) {
                            var blockState = blockItem.getBlock().defaultBlockState();
                            generator.setGeneratingBlock(blockState);
                        }
                    }
                }
            }
        }
        return InteractionResult.SUCCESS;
    }

    private double getYFromHit(Direction facing, Vec3 hit) {
        return switch (facing) {
            case UP -> 1 - hit.x;
            case DOWN -> 1 - hit.x;
            case NORTH -> 1 - hit.x;
            case SOUTH -> hit.x;
            case WEST -> hit.z;
            case EAST -> 1 - hit.z;
        };
    }

    private double getXFromHit(Direction facing, Vec3 hit) {
        return switch (facing) {
            case UP -> hit.z;
            case DOWN -> 1 - hit.z;
            case NORTH -> hit.y;
            case SOUTH -> hit.y;
            case WEST -> hit.y;
            case EAST -> hit.y;
        };
    }


    @Override
    public BlockState getStateForPlacement(BlockPlaceContext context) {
        return this.defaultBlockState().setValue(BlockStateProperties.FACING, context.getNearestLookingDirection().getOpposite());
    }

    @Override
    protected void createBlockStateDefinition(StateDefinition.Builder<Block, BlockState> builder) {
        builder.add(BlockStateProperties.FACING);
    }
}
</syntaxhighlight>
```
===The Generator Block Entity===

The block entity is a bit more complicated this time (compared to the power generator). That's because we need to implement everything required to communicate data to the baked model. Baked models are potentially rendered in threads and should not access block entity (or any other world related data) directly. For that purpose we need ModelProperties to communicate what the baked model needs from the block entity to the baked model.

* In this block entity we use three different item handler capabilities. One for five input slots, one for a single output slot (coupled to the bottom of this block) and one combined read-only item handler that is returned when getCapability() is called with no given side. It's good practice to support this because mods like The One Probe depend on features like that.
* Depending on where our block is right clicked (see GeneratorBlock) the setGenerating, setCollecting, or setGeneratingBlock functions will be called. They are called server-side but need to communicate the model property to the client. For that reason they use level.sendBlockUpdated().
* tickServer() does two things: every 10 ticks (2 times per second) we will collect all ingots in a 3x3x3 area around the generator and (if possible) insert them in the input buffer. In addition we see if we have enough power to convert some of the ingots in our input buffer to ores. If so we make sure our front panel is updated (''actuallyGenerating'') and we insert the ores in the output buffer (or spawn it in the world in case the output buffer is full)
* getUpdateTag()/handleUpdateTag() are responsible for syncing data to the client version of the block entity whenever the client receives a new chunk.
* getUpdatePacket()/onDataPacket() do the same but whenever a block update happens or the blockstate changes.
* We implement our own saveClientData() and loadClientData() and call it from saveAdditional() and load(). The client data versions contain the part of the data that we want to save with our block that we also want to sync to the client. getUpdateTag(), handleUpdateTag(), getUpdatePacket() and onDataPacket() will use these.
* The ModelProperties as well as getModelData() are used to communicate information to the baked model (more on this in the next section). We need to refresh this data whenever something changes that would need the model to render itself again.
```
 <syntaxhighlight lang="java">
public class GeneratorBE extends BlockEntity {

    public static final int COLLECTING_DELAY = 10;
    public static final int INGOTS_PER_ORE = 10;
    public static final int INPUT_SLOTS = 5;
    public static final int OUTPUT_SLOTS = 1;
    public static final int ENERGY_CAPACITY = 100000;
    public static final int ENERGY_RECEIVE = 1000;
    public static final int ENERGY_GENERATE = 500;

    // The properties that are used to communicate data to the baked model (GeneratorBakedModel)
    public static final ModelProperty<BlockState> GENERATING_BLOCK = new ModelProperty<>();
    public static final ModelProperty<Boolean> GENERATING = new ModelProperty<>();
    public static final ModelProperty<Boolean> COLLECTING = new ModelProperty<>();
    public static final ModelProperty<Boolean> ACTUALLY_GENERATING = new ModelProperty<>();

    // The actual values for these properties
    private boolean generating = false;
    private boolean collecting = false;
    private BlockState generatingBlock;
    private boolean actuallyGenerating = false;

    // For collecting
    private int collectingTicker = 0;
    private AABB collectingBox = null;

    // For generating our ores
    private int generatingCounter = 0;

    // A direct reference to our items and energy for easy access inside our block entity
    // LazyOptionals to return with getCapability()
    private final ItemStackHandler inputItems = createInputItemHandler();
    private final LazyOptional<IItemHandler> inputItemHandler = LazyOptional.of(() -> inputItems);
    private final ItemStackHandler outputItems = createOutputItemHandler();
    private final LazyOptional<IItemHandler> outputItemHandler = LazyOptional.of(() -> outputItems);
    private final LazyOptional<IItemHandler> combinedItemHandler = LazyOptional.of(this::createCombinedItemHandler);

    private final CustomEnergyStorage energy = createEnergyStorage();
    private final LazyOptional<IEnergyStorage> energyHandler = LazyOptional.of(() -> energy);

    public GeneratorBE(BlockPos pos, BlockState state) {
        super(Registration.GENERATOR_BE.get(), pos, state);
    }

    public boolean isGenerating() {
        return generating;
    }

    public void setGenerating(boolean generating) {
        this.generating = generating;
        setChanged();
        level.sendBlockUpdated(worldPosition, getBlockState(), getBlockState(), Block.UPDATE_ALL);
    }

    public boolean isCollecting() {
        return collecting;
    }

    public void setCollecting(boolean collecting) {
        this.collecting = collecting;
        setChanged();
        level.sendBlockUpdated(worldPosition, getBlockState(), getBlockState(), Block.UPDATE_ALL);
    }

    public void setGeneratingBlock(BlockState generatingBlock) {
        // Only accept ores by checking the tag
        if (generatingBlock.is(Tags.Blocks.ORES)) {
            this.generatingBlock = generatingBlock;
            setChanged();
            level.sendBlockUpdated(worldPosition, getBlockState(), getBlockState(), Block.UPDATE_ALL);
        }
    }

    // Called by the block ticker
    public void tickServer() {
        if (collecting) {
            collectingTicker--;
            if (collectingTicker <= 0) {
                collectingTicker = COLLECTING_DELAY;
                collectItems();
            }
        }

        boolean areWeGenerating = false;
        if (generating) {
            areWeGenerating = generateOres();
        }
        if (areWeGenerating != actuallyGenerating) {
            actuallyGenerating = areWeGenerating;
            setChanged();
            level.sendBlockUpdated(worldPosition, getBlockState(), getBlockState(), Block.UPDATE_ALL);
        }
    }

    private void collectItems() {
        // We calculate and cache a 3x3x3 box around our position
        if (collectingBox == null) {
            collectingBox = new AABB(getBlockPos()).inflate(1);
        }
        // Find all entities of type ItemEntity (representing items on the ground) and check if they are
        // ingots by testing with the INGOTS item tag
        List<ItemEntity> entities = level.getEntitiesOfClass(ItemEntity.class, collectingBox,
                itemEntity -> {
                    ItemStack item = itemEntity.getItem();
                    return item.is(Tags.Items.INGOTS);
                });
        // For each of these items we try to insert it in the input buffer and kill or shrink the item on the ground
        for (ItemEntity itemEntity : entities) {
            ItemStack item = itemEntity.getItem();
            ItemStack remainder = ItemHandlerHelper.insertItem(inputItems, item, false);
            if (remainder.isEmpty()) {
                itemEntity.kill();
            } else {
                itemEntity.setItem(remainder);
            }
        }
    }

    private boolean generateOres() {
        // The player didn't select anything to generate
        if (generatingBlock == null) {
            return false;
        }
        // Not enough energy, don't even try
        if (energy.getEnergyStored() < ENERGY_GENERATE) {
            return false;
        }
        boolean areWeGenerating = false;
        for (int i = 0; i < inputItems.getSlots() ; i++) {
            ItemStack item = inputItems.getStackInSlot(i);
            if (!item.isEmpty()) {
                energy.consumeEnergy(ENERGY_GENERATE);
                // The API documentation from getStackInSlot says you are not allowed to modify the itemstacks returned
                // by getStackInSlot. That's why we make a copy here
                item = item.copy();
                item.shrink(1);
                // Put back the item with one less (can be empty)
                inputItems.setStackInSlot(i, item);
                generatingCounter++;
                areWeGenerating = true;
                setChanged();
                if (generatingCounter >= INGOTS_PER_ORE) {
                    generatingCounter = 0;
                    // For each of these ores we try to insert it in the output buffer or else throw it on the ground
                    ItemStack remaining = ItemHandlerHelper.insertItem(outputItems, new ItemStack(generatingBlock.getBlock().asItem()), false);
                    spawnInWorld(remaining);
                }
            }
        }
        return areWeGenerating;
    }

    private void spawnInWorld(ItemStack remaining) {
        if (!remaining.isEmpty()) {
            ItemEntity entityitem = new ItemEntity(level, worldPosition.getX(), worldPosition.getY() + 0.5, worldPosition.getZ(), remaining);
            entityitem.setPickUpDelay(40);
            entityitem.setDeltaMovement(entityitem.getDeltaMovement().multiply(0, 1, 0));
            level.addFreshEntity(entityitem);
        }
    }

    @Nonnull
    private ItemStackHandler createInputItemHandler() {
        return new ItemStackHandler(INPUT_SLOTS) {
            @Override
            protected void onContentsChanged(int slot) {
                setChanged();
            }

            @NotNull
            @Override
            public ItemStack extractItem(int slot, int amount, boolean simulate) {
                return ItemStack.EMPTY;
            }
        };
    }

    @Nonnull
    private ItemStackHandler createOutputItemHandler() {
        return new ItemStackHandler(OUTPUT_SLOTS) {
            @Override
            protected void onContentsChanged(int slot) {
                setChanged();
            }
        };
    }

    @Nonnull
    private IItemHandler createCombinedItemHandler() {
        return new CombinedInvWrapper(inputItems, outputItems) {
            @NotNull
            @Override
            public ItemStack extractItem(int slot, int amount, boolean simulate) {
                return ItemStack.EMPTY;
            }

            @NotNull
            @Override
            public ItemStack insertItem(int slot, @NotNull ItemStack stack, boolean simulate) {
                return stack;
            }
        };
    }

    private CustomEnergyStorage createEnergyStorage() {
        return new CustomEnergyStorage(ENERGY_CAPACITY, ENERGY_RECEIVE) {
            @Override
            protected void onEnergyChanged() {
                setChanged();
            }
        };
    }

    // The getUpdateTag()/handleUpdateTag() pair is called whenever the client receives a new chunk
    // it hasn't seen before. i.e. the chunk is loaded

    @Override
    public CompoundTag getUpdateTag() {
        CompoundTag tag = super.getUpdateTag();
        saveClientData(tag);
        return tag;
    }

    @Override
    public void handleUpdateTag(CompoundTag tag) {
        if (tag != null) {
            loadClientData(tag);
        }
    }

    // The getUpdatePacket()/onDataPacket() pair is used when a block update happens on the client
    // (a blockstate change or an explicit notificiation of a block update from the server). It's
    // easiest to implement them based on getUpdateTag()/handleUpdateTag()

    @Nullable
    @Override
    public ClientboundBlockEntityDataPacket getUpdatePacket() {
        return ClientboundBlockEntityDataPacket.create(this);
    }

    @Override
    public void onDataPacket(Connection net, ClientboundBlockEntityDataPacket pkt) {
        // This is called client side: remember the current state of the values that we're interested in
        boolean oldGenerating = generating;
        boolean oldCollecting = collecting;
        boolean oldActuallyGenerating = actuallyGenerating;
        BlockState oldGeneratingBlock = generatingBlock;
        
        CompoundTag tag = pkt.getTag();
        // This will call loadClientData()
        handleUpdateTag(tag);
        
        // If any of the values was changed we request a refresh of our model data and send a block update (this will cause
        // the baked model to be recreated)
        if (oldGenerating != generating || oldCollecting != collecting ||
                oldActuallyGenerating != actuallyGenerating ||
                !Objects.equals(generatingBlock, oldGeneratingBlock)) {
            ModelDataManager.requestModelDataRefresh(this);
            level.sendBlockUpdated(worldPosition, getBlockState(), getBlockState(), Block.UPDATE_ALL);
        }
    }

    @Override
    public void setRemoved() {
        super.setRemoved();
        inputItemHandler.invalidate();
        outputItemHandler.invalidate();
        combinedItemHandler.invalidate();
        energyHandler.invalidate();
    }

    @Nonnull
    @Override
    public IModelData getModelData() {
        return new ModelDataMap.Builder()
                .withInitial(GENERATING_BLOCK, generatingBlock)
                .withInitial(GENERATING, generating)
                .withInitial(ACTUALLY_GENERATING, actuallyGenerating)
                .withInitial(COLLECTING, collecting)
                .build();
    }

    @Override
    protected void saveAdditional(CompoundTag tag) {
        saveClientData(tag);
        tag.put("Inventory", inputItems.serializeNBT());
        tag.put("Energy", energy.serializeNBT());
        CompoundTag infoTag = tag.getCompound("Info");
        infoTag.putInt("Generating", generatingCounter);
    }

    private void saveClientData(CompoundTag tag) {
        CompoundTag infoTag = new CompoundTag();
        tag.put("Info", infoTag);
        infoTag.putBoolean("generating", generating);
        infoTag.putBoolean("collecting", collecting);
        tag.putBoolean("actuallyGenerating", actuallyGenerating);
        if (generatingBlock != null) {
            infoTag.put("block", NbtUtils.writeBlockState(generatingBlock));
        }
    }

    @Override
    public void load(CompoundTag tag) {
        super.load(tag);
        loadClientData(tag);
        if (tag.contains("Inventory")) {
            inputItems.deserializeNBT(tag.getCompound("Inventory"));
        }
        if (tag.contains("Energy")) {
            energy.deserializeNBT(tag.get("Energy"));
        }
        if (tag.contains("Info")) {
            generatingCounter = tag.getCompound("Info").getInt("Generating");
        }
    }

    private void loadClientData(CompoundTag tag) {
        if (tag.contains("Info")) {
            CompoundTag infoTag = tag.getCompound("Info");
            generating = infoTag.getBoolean("generating");
            collecting = infoTag.getBoolean("collecting");
            if (infoTag.contains("block")) {
                generatingBlock = NbtUtils.readBlockState(infoTag.getCompound("block"));
            }
        }
        actuallyGenerating = tag.getBoolean("actuallyGenerating");
    }

    @NotNull
    @Override
    public <T> LazyOptional<T> getCapability(@NotNull Capability<T> cap, @Nullable Direction side) {
        if (cap == CapabilityItemHandler.ITEM_HANDLER_CAPABILITY) {
            if (side == null) {
                return combinedItemHandler.cast();
            } else if (side == Direction.DOWN) {
                return outputItemHandler.cast();
            } else {
                return inputItemHandler.cast();
            }
        } else if (cap == CapabilityEnergy.ENERGY) {
            return energyHandler.cast();
        } else {
            return super.getCapability(cap, side);
        }
    }
}
</syntaxhighlight>
```
https://i.imgur.com/o7hgFpp.png
```
 <syntaxhighlight lang="java">
    @Nonnull
    @Override
    public ModelData getModelData() {
        return ModelData.builder()
                .with(GENERATING_BLOCK, generatingBlock)
                .with(GENERATING, generating)
                .with(ACTUALLY_GENERATING, actuallyGenerating)
                .with(COLLECTING, collecting)
                .build();
    }
</syntaxhighlight>
```
Use requestModelDataUpdate() instead of ModelDataManager.requestModelDataRefresh(this)

===The Baked Model===

When you make '''json models''' you are making '''static geometry'''. Even if the model can change depending on properties it's still static which means that the geometry will be 'baked' into the chunk data as soon as something in the chunk needs refreshing. That's the most efficient way to render blocks as usually blocks don't need to change appearance every tick and thus the baked chunk can usually be reused for several frames. If you have something that looks different every tick then you probably want to use a block entity renderer. We will cover that later.

You can do a lot of things with regular json models since can be driven by properties and allow for flexible modifications to the static model depending on those properties. We saw an example of that in the powergenerator model which used the POWERED blockstate property to change the model. However, sometimes you want a static model with even more flexibility. Perhaps the number of possible configurations are too large for expressing with properties and json models, or perhaps you need to bake the geometry from another block into your geometry. In that case you need to make a '''baked model'''.

Baked models are still static. They just allow for more flexibility.

Here is the baked model class that we are going to use for our generator. A few notes about this:

* When possible it is a good idea to cache your quads (a quad is a polygon or face of your model). Generating quads can be somewhat expensive and if you can cache them you save some processing time whenever the chunk this baked model is in is rerendered. In this tutorial we cache the generated quads based on a specific configuration which is uniquely identified using the ModelKey (our own custom class to express a configuration of our model)
* The baked model also has to be used for our item model. In order to properly support that we need to use the given item overrides and item transforms (these come from the model loader which we will see later).
* Note that a baked model cannot access the world because it's possible that this is called in a render thread. For that reason the only data that you can use in this baked model is the block state and IModelData that you can get from the block entity (more on this soon).
* Because of this multi-threading it is not a good idea to generate the quad cache on the fly inside getQuads(). It's recommended to generate the cache in the constructor. If you modify this cache in getQuads() it's possible you get concurrent modification exceptions (unless you use a synchronized map but that's usually less performant).

{{warning|1=Baked models can't access the world! Don't try to do this}}

{{warning|1=Try to cache your quads if possible. For efficiency reasons}}

```
 <syntaxhighlight lang="java">
public class GeneratorBakedModel implements IDynamicBakedModel {

    private final ModelState modelState;
    private final Function<Material, TextureAtlasSprite> spriteGetter;
    private final Map<ModelKey, List<BakedQuad>> quadCache = new HashMap<>();
    private final ItemOverrides overrides;
    private final ItemTransforms itemTransforms;

    /**
     * @param modelState represents the transformation (orientation) of our model. This is generated from the FACING property that our blockstate uses
     * @param spriteGetter gives a way to convert materials to actual sprites on the main atlas
     * @param overrides this is used for using this baked model when it is rendered in an inventory (as an item)
     * @param itemTransforms these represent the transforms to use for the item model
     */
    public GeneratorBakedModel(ModelState modelState, Function<Material, TextureAtlasSprite> spriteGetter,
                               ItemOverrides overrides, ItemTransforms itemTransforms) {
        this.modelState = modelState;
        this.spriteGetter = spriteGetter;
        this.overrides = overrides;
        this.itemTransforms = itemTransforms;
        generateQuadCache();
    }

    @Override
    public boolean usesBlockLight() {
        return false;
    }

    /**
     * Whenever a chunk where our block is in needs to be rerendered this method is called to return the quads (polygons)
     * for our model. Typically this will be called seven times: one time for every direction and one time in general.
     * If you have a block that is solid at one of the six sides it can be a good idea to render that face only for that
     * direction. That way Minecraft knows that it can get rid of that face when another solid block is adjacent to that.
     * All faces or quads that are generated for side == null are not going to be culled away like that
     * @param state the blockstate for our block
     * @param side the six directions or null for quads that are not at a specific direction
     * @param rand random generator that you can use to add variations to your model (usually for textures)
     * @param extraData this represents the data that is given to use from our block entity
     * @return a list of quads
     */
    @Nonnull
    @Override
    public List<BakedQuad> getQuads(@Nullable BlockState state, @Nullable Direction side, @Nonnull Random rand, @Nonnull IModelData extraData) {

        // Are we on the solid render type and are we rendering for side == null
        RenderType layer = MinecraftForgeClient.getRenderType();
        if (side != null || (layer != null && !layer.equals(RenderType.solid()))) {
            return Collections.emptyList();
        }

        // Get the data from our block entity
        boolean generating = TRUE == extraData.getData(GeneratorBE.GENERATING);
        boolean collecting = TRUE == extraData.getData(GeneratorBE.COLLECTING);
        boolean actuallyGenerating = TRUE == extraData.getData(GeneratorBE.ACTUALLY_GENERATING);

        // Generate the quads from the block (ore) that we are generating
        var quads = getQuadsForGeneratingBlock(state, rand, extraData, layer);

        // ModelKey represents a unique configuration. We can use this to get our cached quads
        ModelKey key = new ModelKey(generating, collecting, actuallyGenerating, modelState);
        quads.addAll(quadCache.get(key));

        return quads;
    }

    private void generateQuadCache() {
        quadCache.put(new ModelKey(true, false, false, modelState), generateQuads(true, false, false));
        quadCache.put(new ModelKey(true, true, false, modelState), generateQuads(true, true, false));
        quadCache.put(new ModelKey(true, false, true, modelState), generateQuads(true, false, true));
        quadCache.put(new ModelKey(true, true, true, modelState), generateQuads(true, true, true));
        quadCache.put(new ModelKey(false, false, false, modelState), generateQuads(false, false, false));
        quadCache.put(new ModelKey(false, true, false, modelState), generateQuads(false, true, false));
        quadCache.put(new ModelKey(false, false, true, modelState), generateQuads(false, false, true));
        quadCache.put(new ModelKey(false, true, true, modelState), generateQuads(false, true, true));
    }

    /**
     * Generate the quads for a given configuration. This is done in the constructor in order to populate
     * our quad cache.
     */
    @NotNull
    private List<BakedQuad> generateQuads(boolean generating, boolean collecting, boolean actuallyGenerating) {
        var quads = new ArrayList<BakedQuad>();
        float l = 0;
        float r = 1;
        float p = 13f / 16f; // Relative position of panel

        float bl = 1f/16f;   // Left side of button
        float br = 7f/16f;   // Right side of button

        float h = .5f;       // Half

        Transformation rotation = modelState.getRotation();

        TextureAtlasSprite textureSide = spriteGetter.apply(GeneratorModelLoader.MATERIAL_SIDE);
        TextureAtlasSprite textureFrontPowered = spriteGetter.apply(GeneratorModelLoader.MATERIAL_FRONT_POWERED);
        TextureAtlasSprite textureFront = spriteGetter.apply(GeneratorModelLoader.MATERIAL_FRONT);
        TextureAtlasSprite textureOn = spriteGetter.apply(GeneratorModelLoader.MATERIAL_ON);
        TextureAtlasSprite textureOff = spriteGetter.apply(GeneratorModelLoader.MATERIAL_OFF);

        // The base
        quads.add(ClientTools.createQuad(v(r, p, r), v(r, p, l), v(l, p, l), v(l, p, r), rotation, actuallyGenerating ? textureFrontPowered : textureFront));      // Top side
        quads.add(ClientTools.createQuad(v(l, l, l), v(r, l, l), v(r, l, r), v(l, l, r), rotation, textureSide));
        quads.add(ClientTools.createQuad(v(r, p, r), v(r, l, r), v(r, l, l), v(r, p, l), rotation, textureSide));
        quads.add(ClientTools.createQuad(v(l, p, l), v(l, l, l), v(l, l, r), v(l, p, r), rotation, textureSide));
        quads.add(ClientTools.createQuad(v(r, p, l), v(r, l, l), v(l, l, l), v(l, p, l), rotation, textureSide));
        quads.add(ClientTools.createQuad(v(l, p, r), v(l, l, r), v(r, l, r), v(r, p, r), rotation, textureSide));

        // The collecting button
        float s = collecting ? 14f/16f : r;
        float offset = 0;
        quads.add(ClientTools.createQuad(v(br, s, br+offset), v(br, s, bl+offset), v(bl, s, bl+offset), v(bl, s, br+offset), rotation, collecting ? textureOn : textureOff));
        quads.add(ClientTools.createQuad(v(br, s, br+offset), v(br, p, br+offset), v(br, p, bl+offset), v(br, s, bl+offset), rotation, textureSide));
        quads.add(ClientTools.createQuad(v(bl, s, bl+offset), v(bl, p, bl+offset), v(bl, p, br+offset), v(bl, s, br+offset), rotation, textureSide));
        quads.add(ClientTools.createQuad(v(br, s, bl+offset), v(br, p, bl+offset), v(bl, p, bl+offset), v(bl, s, bl+offset), rotation, textureSide));
        quads.add(ClientTools.createQuad(v(bl, s, br+offset), v(bl, p, br+offset), v(br, p, br+offset), v(br, s, br+offset), rotation, textureSide));

        // The generating button
        s = generating ? 14f/16f : r;
        offset = h;
        quads.add(ClientTools.createQuad(v(br, s, br+offset), v(br, s, bl+offset), v(bl, s, bl+offset), v(bl, s, br+offset), rotation, generating ? textureOn : textureOff));
        quads.add(ClientTools.createQuad(v(br, s, br+offset), v(br, p, br+offset), v(br, p, bl+offset), v(br, s, bl+offset), rotation, textureSide));
        quads.add(ClientTools.createQuad(v(bl, s, bl+offset), v(bl, p, bl+offset), v(bl, p, br+offset), v(bl, s, br+offset), rotation, textureSide));
        quads.add(ClientTools.createQuad(v(br, s, bl+offset), v(br, p, bl+offset), v(bl, p, bl+offset), v(bl, s, bl+offset), rotation, textureSide));
        quads.add(ClientTools.createQuad(v(bl, s, br+offset), v(bl, p, br+offset), v(br, p, br+offset), v(br, s, br+offset), rotation, textureSide));
        return quads;
    }

    /**
     * Get the quads from the block we are generating.
     */
    private List<BakedQuad> getQuadsForGeneratingBlock(@Nullable BlockState state, @NotNull Random rand, @NotNull IModelData extraData, RenderType layer) {
        var quads = new ArrayList<BakedQuad>();
        BlockState generatingBlock = extraData.getData(GeneratorBE.GENERATING_BLOCK);
        if (generatingBlock != null && !(generatingBlock.getBlock() instanceof GeneratorBlock)) {
            if (layer == null || ItemBlockRenderTypes.canRenderInLayer(generatingBlock, layer)) {
                BakedModel model = Minecraft.getInstance().getBlockRenderer().getBlockModelShaper().getBlockModel(generatingBlock);
                try {
                    Direction facing = state == null ? Direction.SOUTH : state.getValue(BlockStateProperties.FACING);
                    Transformation rotation = modelState.getRotation();
                    Transformation translate = transformGeneratingBlock(facing, rotation);
                    QuadTransformer transformer = new QuadTransformer(translate);

                    // Get the quads for every side, transform it and add it to the list of quads
                    for (Direction s : Direction.values()) {
                        List<BakedQuad> modelQuads = model.getQuads(generatingBlock, s, rand, EmptyModelData.INSTANCE);
                        for (BakedQuad quad : modelQuads) {
                            quads.add(transformer.processOne(quad));
                        }
                    }
                } catch (Exception e) {
                    // In case a certain mod has a bug we don't want to cause everything to crash. Instead we log the problem
                    TutorialV3.LOGGER.log(Level.ERROR, "A block '" + generatingBlock.getBlock().getRegistryName().toString() + "' caused a crash!");
                }
            }
        }
        return quads;
    }

    /**
     * Generate a transform that will transform the ore block that we're generating to a smaller version
     * that fits nicely into our front panel.
     */
    @NotNull
    private Transformation transformGeneratingBlock(Direction facing, Transformation rotation) {
        // Note: when composing a transformation like this you have to imagine these transformations in reverse order.
        // So this routine makes most sense if you read it from end to beginning

        // Facing refers to the front face of our block. So dX, dY, dZ are the offsets pointing
        // in that direction. We want to move our model slightly to the front and top-left corner
        float dX = facing.getStepX();
        float dY = facing.getStepY();
        float dZ = facing.getStepZ();
        // Correct depending on face. After this dX, dY, dZ will be the offset perpendicular to the direction of our face
        switch (facing) {
            case DOWN ->  { dX = 1; dY = 0; dZ = -1; }
            case UP ->    { dX = 1; dY = 0; dZ = 1; }
            case NORTH -> { dX = 1; dY = 1; dZ = 0; }
            case SOUTH -> { dX = -1; dY = 1; dZ = 0; }
            case WEST ->  { dX = 0; dY = 1; dZ = -1; }
            case EAST ->  { dX = 0; dY = 1; dZ = 1; }
        }
        // Calculate the first translation (before scaling/rotating). Basically we move in three steps:
        //   - Move in the direction that our front face is facing (divided by 4)
        //   - Move perpendicular to that direction (also divided by 4)
        //   - Move half a block so that rotation and scaling will happen relative to the center
        float stepX = facing.getStepX() / 4f + dX / 4f + .5f;
        float stepY = facing.getStepY() / 4f + dY / 4f + .5f;
        float stepZ = facing.getStepZ() / 4f + dZ / 4f + .5f;

        // As the final step (remember, read from end to start) we position our correctly rotated and scaled
        // block to the top-left corner of our main block
        Transformation translate = new Transformation(Matrix4f.createTranslateMatrix(stepX, stepY, stepZ));

        // Now our block is correctly positioned where we want to rotate and scale it
        translate = translate.compose(new Transformation(Matrix4f.createScaleMatrix(.2f, .2f, .2f)));
        translate = translate.compose(rotation);    // The rotation from our main model

        // This will happen first: translate our subblock so it's center is at 0,0,0. That way scaling and rotating will be correct and
        // not change the position
        translate = translate.compose(new Transformation(Matrix4f.createTranslateMatrix(-.5f, -.5f, -.5f)));
        return translate;
    }

    @Override
    public boolean useAmbientOcclusion() {
        return true;
    }

    @Override
    public boolean isGui3d() {
        return false;
    }

    @Override
    public boolean isCustomRenderer() {
        return false;
    }

    @Override
    public TextureAtlasSprite getParticleIcon() {
        return spriteGetter.apply(GeneratorModelLoader.MATERIAL_SIDE);
    }

    @Override
    public ItemOverrides getOverrides() {
        return overrides;
    }

    @Override
    public ItemTransforms getTransforms() {
        return itemTransforms;
    }
}
</syntaxhighlight>
```
Here is the ModelKey class. It's a simple class containing all the fields that are relevant to identify a specific visual configuration of our model. To be able to use it as a key it needs a hashCode and equals. We use the new java 'record' feature to make this class:
```
 <syntaxhighlight lang="java">
public record ModelKey(boolean generating, boolean collecting, boolean actuallyGenerating, @Nullable ModelState modelState) { }
</syntaxhighlight>
```
https://i.imgur.com/o7hgFpp.png

For 1.19.2 replace the first part of getQuads() with this:
```
 <syntaxhighlight lang="java">
    @Nonnull
    @Override
    public List<BakedQuad> getQuads(@Nullable BlockState state, @Nullable Direction side, @Nonnull RandomSource rand, @Nonnull ModelData extraData, @Nullable RenderType layer) {

        // Are we on the solid render type and are we rendering for side == null
        if (side != null || (layer != null && !layer.equals(RenderType.solid()))) {
            return Collections.emptyList();
        }
</syntaxhighlight>
```
===The Model Loader===

To be able to use our baked model we need to define a model loader. The model loader enables support for json files that we can use for models that want to use this baked model.

Some notes:
* The model loader has a unique identifier (represented by a ResourceLocation) so that you can refer to that from the model json file.
* The model system uses materials. A material is basically a combined key representing a texture on a given atlas. Using ForgeHooksClient.getBlockMaterial() you can create such a material for the default block atlas.
* It's important to return all materials that you want to use in your baked model in the geometry. That way Minecraft knows that it has to bake those onto the main block atlas.
* In the 'bake' method you can give all the data that you need to the baked model as it is responsible for actually creating a new baked model.
```
 <syntaxhighlight lang="java">
public class GeneratorModelLoader implements IModelLoader<GeneratorModelLoader.GeneratorModelGeometry> {

    public static final ResourceLocation GENERATOR_LOADER = new ResourceLocation(TutorialV3.MODID, "generatorloader");

    public static final ResourceLocation GENERATOR_FRONT_POWERED = new ResourceLocation(TutorialV3.MODID, "block/generator_front_powered");
    public static final ResourceLocation GENERATOR_FRONT = new ResourceLocation(TutorialV3.MODID, "block/generator_front");
    public static final ResourceLocation GENERATOR_SIDE = new ResourceLocation(TutorialV3.MODID, "block/generator_side");
    public static final ResourceLocation GENERATOR_ON = new ResourceLocation(TutorialV3.MODID, "block/generator_on");
    public static final ResourceLocation GENERATOR_OFF = new ResourceLocation(TutorialV3.MODID, "block/generator_off");

    public static final Material MATERIAL_FRONT_POWERED = ForgeHooksClient.getBlockMaterial(GENERATOR_FRONT_POWERED);
    public static final Material MATERIAL_FRONT = ForgeHooksClient.getBlockMaterial(GENERATOR_FRONT);
    public static final Material MATERIAL_SIDE = ForgeHooksClient.getBlockMaterial(GENERATOR_SIDE);
    public static final Material MATERIAL_ON = ForgeHooksClient.getBlockMaterial(GENERATOR_ON);
    public static final Material MATERIAL_OFF = ForgeHooksClient.getBlockMaterial(GENERATOR_OFF);

    @Override
    public void onResourceManagerReload(ResourceManager resourceManager) {
    }

    @Override
    public GeneratorModelGeometry read(JsonDeserializationContext deserializationContext, JsonObject modelContents) {
        return new GeneratorModelGeometry();
    }

    
    public static class GeneratorModelGeometry implements IModelGeometry<GeneratorModelGeometry> {

        @Override
        public BakedModel bake(IModelConfiguration owner, ModelBakery bakery, Function<Material, TextureAtlasSprite> spriteGetter, ModelState modelTransform, ItemOverrides overrides, ResourceLocation modelLocation) {
            return new GeneratorBakedModel(modelTransform, spriteGetter, overrides, owner.getCameraTransforms());
        }

        @Override
        public Collection<Material> getTextures(IModelConfiguration owner, Function<ResourceLocation, UnbakedModel> modelGetter, Set<Pair<String, String>> missingTextureErrors) {
            return List.of(MATERIAL_FRONT, MATERIAL_FRONT_POWERED, MATERIAL_SIDE, MATERIAL_ON, MATERIAL_OFF);
        }
    }
}
</syntaxhighlight>
```
We also need to register our model loader. To do this add the following to ClientSetup:

https://i.imgur.com/pLm4syY.png
```
 <syntaxhighlight lang="java">
    @SubscribeEvent
    public static void onModelRegistryEvent(ModelRegistryEvent event) {
        ModelLoaderRegistry.registerLoader(GeneratorModelLoader.GENERATOR_LOADER, new GeneratorModelLoader());
    }
</syntaxhighlight>
```
https://i.imgur.com/o7hgFpp.png
```
 <syntaxhighlight lang="java">
    @SubscribeEvent
    public static void onModelRegistryEvent(ModelEvent.RegisterGeometryLoaders event) {
        event.register(GeneratorModelLoader.GENERATOR_LOADER.getPath(), new GeneratorModelLoader());
    }
</syntaxhighlight>
```
Also replace IModelLoader with IGeometryLoader.

===Datagen===

We now have everything that we need in order to make the data generation for our new generator block. Modify the following datagen classes:
```
 <syntaxhighlight lang="java">
public class TutBlockStates extends BlockStateProvider {

    public TutBlockStates(DataGenerator gen, ExistingFileHelper helper) {
        super(gen, TutorialV3.MODID, helper);
    }

    @Override
    protected void registerStatesAndModels() {
        registerGenerator();
        ...
    }

    private void registerGenerator() {
        // Using CustomLoaderBuilder we can define a json file for our model that will use our baked model
        BlockModelBuilder generatorModel = models().getBuilder(Registration.GENERATOR.getId().getPath())
                .parent(models().getExistingFile(mcLoc("cube")))
                .customLoader((blockModelBuilder, helper) -> new CustomLoaderBuilder<BlockModelBuilder>(GENERATOR_LOADER, blockModelBuilder, helper) { })
                .end();
        directionalBlock(Registration.GENERATOR.get(), generatorModel);
    }
</syntaxhighlight>
```
We also need to add tags, recipe, item model, language keys, and loot table. Check the GitHub for details but this is basically the same as what we did for the power generator.

===Block Entity Renderer===

Block Entity Renderers are dynamic geometry. You use them whenever you need to render something that changes every frame. As an example we're going to add a block entity renderer for the power generator from the previous tutorial.

Some notes:
* In contrast with baked models we can safely use the world as well as block entity information (if we would need to do that)
* Block entity renderers don't use direct OpenGL. Instead you use the rendering api as given by MultiBufferSource and PoseStack.
* Rendering correctly with transparency is always hard because polygons have to be rendered in the correct order (from back to front). There are situations where this renderer will not look correct. In future rendering tutorials we will see ways you can around this problem.
```
 <syntaxhighlight lang="java">
public class PowergenRenderer implements BlockEntityRenderer<PowergenBE> {

    public static final ResourceLocation HALO = new ResourceLocation(TutorialV3.MODID, "effect/halo");

    public PowergenRenderer(BlockEntityRendererProvider.Context context) {
    }

    @Override
    public void render(PowergenBE powergen, float partialTicks, PoseStack poseStack, MultiBufferSource bufferSource, int combinedLight, int combinedOverlay) {

        Boolean powered = powergen.getBlockState().getValue(BlockStateProperties.POWERED);
        if (TRUE != powered) {
            return;
        }

        int brightness = LightTexture.FULL_BRIGHT;
        // To achieve a pulsating effect we use the current time
        float s = (System.currentTimeMillis() % 1000) / 1000.0f;
        if (s > 0.5f) {
            s = 1.0f - s;
        }
        float scale = 0.1f + s * .3f;

        // Get our texture from the atlas
        TextureAtlasSprite sprite = Minecraft.getInstance().getTextureAtlas(TextureAtlas.LOCATION_BLOCKS).apply(HALO);
        
        // Always remember to push the current transformation so that you can restore it later
        poseStack.pushPose();
        
        // Translate to the middle of the block and 1 unit higher
        poseStack.translate(0.5, 1.5, 0.5);
        
        // Use the orientation of the main camera to make sure the single quad that we are going to render always faces the camera
        Quaternion rotation = Minecraft.getInstance().gameRenderer.getMainCamera().rotation();
        poseStack.mulPose(rotation);
        
        // Actually render the quad in our own custom render type
        VertexConsumer buffer = bufferSource.getBuffer(CustomRenderType.ADD);
        Matrix4f matrix = poseStack.last().pose();
        // Vertex data has to appear in a specific order:
        buffer.vertex(matrix, -scale, -scale, 0.0f).color(1.0f, 1.0f, 1.0f, 0.3f).uv(sprite.getU0(), sprite.getV0()).uv2(brightness).normal(1,0,0).endVertex();
        buffer.vertex(matrix, -scale, scale, 0.0f).color(1.0f, 1.0f, 1.0f, 0.3f).uv(sprite.getU0(), sprite.getV1()).uv2(brightness).normal(1,0,0).endVertex();
        buffer.vertex(matrix, scale, scale, 0.0f).color(1.0f, 1.0f, 1.0f, 0.3f).uv(sprite.getU1(), sprite.getV1()).uv2(brightness).normal(1,0,0).endVertex();
        buffer.vertex(matrix, scale, -scale, 0.0f).color(1.0f, 1.0f, 1.0f, 0.3f).uv(sprite.getU1(), sprite.getV0()).uv2(brightness).normal(1,0,0).endVertex();
        poseStack.popPose();
    }

    public static void register() {
        BlockEntityRenderers.register(Registration.POWERGEN_BE.get(), PowergenRenderer::new);
    }
}
</syntaxhighlight>
```
We need to register this renderer. For that we call 'register()' from ClientSetup:
```
 <syntaxhighlight lang="java">
    public static void init(FMLClientSetupEvent event) {
        event.enqueueWork(() -> {
            MenuScreens.register(Registration.POWERGEN_CONTAINER.get(), PowergenScreen::new);
            ItemBlockRenderTypes.setRenderLayer(Registration.POWERGEN.get(), RenderType.translucent());
            PowergenRenderer.register();
        });
    }
</syntaxhighlight>
```
We also need to stitch our HALO texture on the main atlas. For the baked model that wasn't needed because our model/geometry had a way to communicate the materials that were needed. For block entity renderers you have to manually stitch the textures you want to use on the main atlas. Do this by adding the following to ClientSetup:
```
 <syntaxhighlight lang="java">
    @SubscribeEvent
    public static void onTextureStitch(TextureStitchEvent.Pre event) {
        if (!event.getAtlas().location().equals(TextureAtlas.LOCATION_BLOCKS)) {
            return;
        }
        event.addSprite(PowergenRenderer.HALO);
    }
</syntaxhighlight>
```
https://i.imgur.com/o7hgFpp.png
In the init() method remove the line for setRenderLayer() on 1.19.2. That's done in the model now.

===Custom RenderType===

Later we will have a more advanced rendering tutorial. In that tutorial we will clarify this better. But the point of this custom render type is so that our transparent effect can render with additive blending mode (i.e. the colors of the texture are added to what is already there).
```
 <syntaxhighlight lang="java">
public class CustomRenderType extends RenderType {

    // Dummy
    public CustomRenderType(String name, VertexFormat vertexFormat, VertexFormat.Mode mode, int bufferSize, boolean affectsCrumbling, boolean sortOnUpload, Runnable setup, Runnable clear) {
        super(name, vertexFormat, mode, bufferSize, affectsCrumbling, sortOnUpload, setup, clear);
    }

    private static CompositeState addState(ShaderStateShard shard) {
        return CompositeState.builder()
                .setLightmapState(LIGHTMAP)
                .setShaderState(shard)
                .setTextureState(BLOCK_SHEET_MIPPED)
                .setTransparencyState(ADDITIVE_TRANSPARENCY)
                .setOutputState(TRANSLUCENT_TARGET)
                .createCompositeState(true);
    }

    public static final RenderType ADD = create("translucent",
            DefaultVertexFormat.BLOCK, VertexFormat.Mode.QUADS,
            2097152, true, true,
            addState(RENDERTYPE_TRANSLUCENT_SHADER));

}
</syntaxhighlight>
```