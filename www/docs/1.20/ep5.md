---
sidebar_position: 5
---

# Episode 5

## Links

* Video: todo
* [Back to 1.20 Tutorial Index](./1.20.md)
* [Tutorial GitHub](https://github.com/McJty/Tut4_3Power)
* Tag for this episode: todo

## Introduction

This tutorial continues on episode 4. In that episode we added a power generator and also a block
that will consume power. You can already let the generator give power to the charger if you place
them next to each other. However, we don't have a way to transport power over a distance yet.
In this tutorial we will add a simple cable system that can transport power from any generator
or battery to any machine that needs power. This is not a perfect cable system. It is just a
simple system that will work for our purposes. We want to be able to place the cables in water
(waterlogging).

* Baked models
* Custom model loader
* Complex block shape
* Waterlogging

## Baked models

It would be possible to make a cable system with a simple json based block model. However, this is
going to generate a lot of combinations and we also want to mimic other blocks
which is something you can't do with json models. So we are going to use baked models. This is a
system where we can generate models in code. This is a bit more work but it is also more flexible.

### Cable

![cables](../assets/tutorials/cables.png)

#### The ConnectorType Enum

This is an enum that is used to indicate the type of connection in a certain direction.
It has three possible values: ``CABLE``, ``BLOCK`` and ``NONE``:

* ``CABLE`` means that there is a cable in this direction
* ``BLOCK`` means that there is a block in this direction
* ``NONE`` means that there is nothing in this direction

```java
public enum ConnectorType implements StringRepresentable {
    NONE,
    CABLE,
    BLOCK;

    public static final ConnectorType[] VALUES = values();

    @Override
    @Nonnull
    public String getSerializedName() {
        return name().toLowerCase();
    }
}
```

#### Cable Block

A cable is also a block so we need to add a new block class for it. We will call it `CableBlock`.
There is a lot going on in this code so we will split it in a few parts.

First there are the properties that indicate if there is a cable or a block in a certain direction.
The six EnumProperties are used for the orientaiton. The `FACADEID` is a special type of
model property that will be used by our baked model to indicate that this we are mimicing another
block (facade).

```java
public class CableBlock extends Block implements SimpleWaterloggedBlock, EntityBlock {

    // Properties that indicate if there is the same block in a certain direction.
    public static final EnumProperty<ConnectorType> NORTH = EnumProperty.<ConnectorType>create("north", ConnectorType.class);
    public static final EnumProperty<ConnectorType> SOUTH = EnumProperty.<ConnectorType>create("south", ConnectorType.class);
    public static final EnumProperty<ConnectorType> WEST = EnumProperty.<ConnectorType>create("west", ConnectorType.class);
    public static final EnumProperty<ConnectorType> EAST = EnumProperty.<ConnectorType>create("east", ConnectorType.class);
    public static final EnumProperty<ConnectorType> UP = EnumProperty.<ConnectorType>create("up", ConnectorType.class);
    public static final EnumProperty<ConnectorType> DOWN = EnumProperty.<ConnectorType>create("down", ConnectorType.class);

    public static final ModelProperty<BlockState> FACADEID = new ModelProperty<>();
```

The next part is for the shape of our block. We want the shape of the block to closely
correspond with the actual shape of the cable. That's why we have six shapes for when the
shape on a specific direction is a cable and six shapes for when the shape is a block.
Because ``getShape()`` must be very efficient we calculate a ``shapeCache`` where we store
all possible shapes.

The ``makeShapes()`` function is responsible for creating the cache. It is called from the
constructor. The ``calculateShapeIndex()`` function calculates an index in the cache based
on the type of connection at the six directions. The ``makeShape()`` function creates a shape
based on the six directions. The ``combineShape()`` function combines a shape with a cable
of a certain type. If the cable is a simple cable then we just add the cable shape to the
existing shape. If the cable is a block then we add the cable shape and the block shape.

``updateShape()`` is called when a neighbor block changes. We need to recalculate the shape
in that case.

```java
    private static VoxelShape[] shapeCache = null;

    private static final VoxelShape SHAPE_CABLE_NORTH = Shapes.box(.4, .4, 0, .6, .6, .4);
    private static final VoxelShape SHAPE_CABLE_SOUTH = Shapes.box(.4, .4, .6, .6, .6, 1);
    private static final VoxelShape SHAPE_CABLE_WEST = Shapes.box(0, .4, .4, .4, .6, .6);
    private static final VoxelShape SHAPE_CABLE_EAST = Shapes.box(.6, .4, .4, 1, .6, .6);
    private static final VoxelShape SHAPE_CABLE_UP = Shapes.box(.4, .6, .4, .6, 1, .6);
    private static final VoxelShape SHAPE_CABLE_DOWN = Shapes.box(.4, 0, .4, .6, .4, .6);

    private static final VoxelShape SHAPE_BLOCK_NORTH = Shapes.box(.2, .2, 0, .8, .8, .1);
    private static final VoxelShape SHAPE_BLOCK_SOUTH = Shapes.box(.2, .2, .9, .8, .8, 1);
    private static final VoxelShape SHAPE_BLOCK_WEST = Shapes.box(0, .2, .2, .1, .8, .8);
    private static final VoxelShape SHAPE_BLOCK_EAST = Shapes.box(.9, .2, .2, 1, .8, .8);
    private static final VoxelShape SHAPE_BLOCK_UP = Shapes.box(.2, .9, .2, .8, 1, .8);
    private static final VoxelShape SHAPE_BLOCK_DOWN = Shapes.box(.2, 0, .2, .8, .1, .8);

    private int calculateShapeIndex(ConnectorType north, ConnectorType south, ConnectorType west, ConnectorType east, ConnectorType up, ConnectorType down) {
        int l = ConnectorType.values().length;
        return ((((south.ordinal() * l + north.ordinal()) * l + west.ordinal()) * l + east.ordinal()) * l + up.ordinal()) * l + down.ordinal();
    }

    private void makeShapes() {
        if (shapeCache == null) {
            int length = ConnectorType.values().length;
            shapeCache = new VoxelShape[length * length * length * length * length * length];

            for (ConnectorType up : ConnectorType.VALUES) {
                for (ConnectorType down : ConnectorType.VALUES) {
                    for (ConnectorType north : ConnectorType.VALUES) {
                        for (ConnectorType south : ConnectorType.VALUES) {
                            for (ConnectorType east : ConnectorType.VALUES) {
                                for (ConnectorType west : ConnectorType.VALUES) {
                                    int idx = calculateShapeIndex(north, south, west, east, up, down);
                                    shapeCache[idx] = makeShape(north, south, west, east, up, down);
                                }
                            }
                        }
                    }
                }
            }

        }
    }

    private VoxelShape makeShape(ConnectorType north, ConnectorType south, ConnectorType west, ConnectorType east, ConnectorType up, ConnectorType down) {
        VoxelShape shape = Shapes.box(.4, .4, .4, .6, .6, .6);
        shape = combineShape(shape, north, SHAPE_CABLE_NORTH, SHAPE_BLOCK_NORTH);
        shape = combineShape(shape, south, SHAPE_CABLE_SOUTH, SHAPE_BLOCK_SOUTH);
        shape = combineShape(shape, west, SHAPE_CABLE_WEST, SHAPE_BLOCK_WEST);
        shape = combineShape(shape, east, SHAPE_CABLE_EAST, SHAPE_BLOCK_EAST);
        shape = combineShape(shape, up, SHAPE_CABLE_UP, SHAPE_BLOCK_UP);
        shape = combineShape(shape, down, SHAPE_CABLE_DOWN, SHAPE_BLOCK_DOWN);
        return shape;
    }
    
    private VoxelShape combineShape(VoxelShape shape, ConnectorType connectorType, VoxelShape cableShape, VoxelShape blockShape) {
        if (connectorType == ConnectorType.CABLE) {
            return Shapes.join(shape, cableShape, BooleanOp.OR);
        } else if (connectorType == ConnectorType.BLOCK) {
            return Shapes.join(shape, Shapes.join(blockShape, cableShape, BooleanOp.OR), BooleanOp.OR);
        } else {
            return shape;
        }
    }
    
    @Nonnull
    @Override
    public VoxelShape getShape(@Nonnull BlockState state, @Nonnull BlockGetter world, @Nonnull BlockPos pos, @Nonnull CollisionContext context) {
        ConnectorType north = getConnectorType(world, pos, Direction.NORTH);
        ConnectorType south = getConnectorType(world, pos, Direction.SOUTH);
        ConnectorType west = getConnectorType(world, pos, Direction.WEST);
        ConnectorType east = getConnectorType(world, pos, Direction.EAST);
        ConnectorType up = getConnectorType(world, pos, Direction.UP);
        ConnectorType down = getConnectorType(world, pos, Direction.DOWN);
        int index = calculateShapeIndex(north, south, west, east, up, down);
        return shapeCache[index];
    }

    @Nonnull
    @Override
    public BlockState updateShape(BlockState state, @Nonnull Direction direction, @Nonnull BlockState neighbourState, @Nonnull LevelAccessor world, @Nonnull BlockPos current, @Nonnull BlockPos offset) {
        if (state.getValue(WATERLOGGED)) {
            world.getFluidTicks().schedule(new ScheduledTick<>(Fluids.WATER, current, Fluids.WATER.getTickDelay(world), 0L));   // @todo 1.18 what is this last parameter exactly?
        }
        return calculateState(world, current, state);
    }
```

Now we have the constructor (where we call ``makeShapes()``) and we set waterlogging to false.
We also do the functions for the block entity and the block entity ticker.

```java
    public CableBlock() {
        super(Properties.of()
                .strength(1.0f)
                .sound(SoundType.METAL)
                .noOcclusion()
        );
        makeShapes();
        registerDefaultState(defaultBlockState().setValue(WATERLOGGED, false));
    }

    @Nullable
    @Override
    public BlockEntity newBlockEntity(BlockPos blockPos, BlockState blockState) {
        return new CableBlockEntity(blockPos, blockState);
    }

    @Nullable
    @Override
    public <T extends BlockEntity> BlockEntityTicker<T> getTicker(Level level, BlockState state, BlockEntityType<T> type) {
        if (level.isClientSide) {
            return null;
        } else {
            return (lvl, pos, st, be) -> {
                if (be instanceof CableBlockEntity cable) {
                    cable.tickServer();
                }
            };
        }
    }
```

``neighborChanged()`` and ``setPlacedBy()`` are used to mark the block entity dirty when
something changes. This is so our block entity can update the cable network (more on that later).

```java
    @Override
    public void neighborChanged(BlockState state, Level level, BlockPos pos, Block block, BlockPos fromPos, boolean isMoving) {
        super.neighborChanged(state, level, pos, block, fromPos, isMoving);
        if (!level.isClientSide && level.getBlockEntity(pos) instanceof CableBlockEntity cable) {
            cable.markDirty();
        }
    }

    @Override
    public void setPlacedBy(@Nonnull Level level, @Nonnull BlockPos pos, @Nonnull BlockState state, @Nullable LivingEntity placer, @Nonnull ItemStack stack) {
        super.setPlacedBy(level, pos, state, placer, stack);
        if (!level.isClientSide && level.getBlockEntity(pos) instanceof CableBlockEntity cable) {
            cable.markDirty();
        }
        BlockState blockState = calculateState(level, pos, state);
        if (state != blockState) {
            level.setBlockAndUpdate(pos, blockState);
        }
    }
```

``getConnectorType()`` and ``isConnectable()`` are used to determine the type of connection
in a certain direction. This is used to calculate the shape of the cable.

```java
    // Return the connector type for the given position and facing direction
    private ConnectorType getConnectorType(BlockGetter world, BlockPos connectorPos, Direction facing) {
        BlockPos pos = connectorPos.relative(facing);
        BlockState state = world.getBlockState(pos);
        Block block = state.getBlock();
        if (block instanceof CableBlock) {
            return ConnectorType.CABLE;
        } else if (isConnectable(world, connectorPos, facing)) {
            return ConnectorType.BLOCK;
        } else {
            return ConnectorType.NONE;
        }
    }

    // Return true if the block at the given position is connectable to a cable. This is the
    // case if the block supports forge energy
    public static boolean isConnectable(BlockGetter world, BlockPos connectorPos, Direction facing) {
        BlockPos pos = connectorPos.relative(facing);
        BlockState state = world.getBlockState(pos);
        if (state.isAir()) {
            return false;
        }
        BlockEntity te = world.getBlockEntity(pos);
        if (te == null) {
            return false;
        }
        return te.getCapability(ForgeCapabilities.ENERGY).isPresent();
    }
```

The remaining functions are needed for defining and setting the possible states
on this block. Having support for waterlogging is as easy as adding the ``WATERLOGGED``
property and overriding ``getFluidState()``.
   
```java 
    @Override
    protected void createBlockStateDefinition(@Nonnull StateDefinition.Builder<Block, BlockState> builder) {
        super.createBlockStateDefinition(builder);
        builder.add(WATERLOGGED, NORTH, SOUTH, EAST, WEST, UP, DOWN);
    }

    @Nullable
    @Override
    public BlockState getStateForPlacement(BlockPlaceContext context) {
        Level world = context.getLevel();
        BlockPos pos = context.getClickedPos();
        return calculateState(world, pos, defaultBlockState())
                .setValue(WATERLOGGED, world.getFluidState(pos).getType() == Fluids.WATER);
    }

    @Nonnull
    private BlockState calculateState(LevelAccessor world, BlockPos pos, BlockState state) {
        ConnectorType north = getConnectorType(world, pos, Direction.NORTH);
        ConnectorType south = getConnectorType(world, pos, Direction.SOUTH);
        ConnectorType west = getConnectorType(world, pos, Direction.WEST);
        ConnectorType east = getConnectorType(world, pos, Direction.EAST);
        ConnectorType up = getConnectorType(world, pos, Direction.UP);
        ConnectorType down = getConnectorType(world, pos, Direction.DOWN);

        return state
                .setValue(NORTH, north)
                .setValue(SOUTH, south)
                .setValue(WEST, west)
                .setValue(EAST, east)
                .setValue(UP, up)
                .setValue(DOWN, down);
    }

    @Nonnull
    @Override
    public FluidState getFluidState(BlockState state) {
        return state.getValue(WATERLOGGED) ? Fluids.WATER.getSource(false) : super.getFluidState(state);
    }
}
```

![waterlogged cables](../assets/tutorials/cables_waterlogged.png)

#### Cable Block Entity

The block entity of the cable is responsible for keeping track of the cable network. It will
also keep track of the power that is flowing through the cable. The cable network is simply
represented by a set of positions that have a energy receiver. The cable network is recalculated
whenever a neighbor block changes. The cable network is also recalculated when the block is
placed or removed.

:::danger Warning
The cable network implementation that is given here works but it is not perfect. It is just
a simple implementation that works for our purposes. More advanced mods (like for example
``XNet``) have much more advanced cable networks and cache their network data in a ``SavedData``
structure.
:::


The first part of this block entity is as usual. A cable section is also an energy handler so we
need the capability for that.

```java
public class CableBlockEntity extends BlockEntity {

    public static final String ENERGY_TAG = "Energy";

    public static final int MAXTRANSFER = 100;
    public static final int CAPACITY = 1000;

    private final EnergyStorage energy = createEnergyStorage();
    private final LazyOptional<IEnergyStorage> energyHandler = LazyOptional.of(() -> new AdaptedEnergyStorage(energy) {
        @Override
        public int extractEnergy(int maxExtract, boolean simulate) {
            return 0;
        }

        @Override
        public int receiveEnergy(int maxReceive, boolean simulate) {
            setChanged();
            return super.receiveEnergy(maxReceive, simulate);
        }

        @Override
        public boolean canExtract() {
            return false;
        }

        @Override
        public boolean canReceive() {
            return true;
        }
    });

    protected CableBlockEntity(BlockEntityType<?> type, BlockPos pos, BlockState state) {
        super(type, pos, state);
    }

    public CableBlockEntity(BlockPos pos, BlockState state) {
        super(Registration.CABLE_BLOCK_ENTITY.get(), pos, state);
    }
```

The following block is responsible for the cached outputs. The ``outputs`` variable is a lazy
calculated set of all energy receivers that are connected to this cable network. The ``checkOutputs()``
function will calculate this set. It will do this by traversing all cables connected to this cable
and then check for all energy receivers around those cables. The ``markDirty()`` function will
invalidate the cached outputs for this cable and all connected cables. This is needed when the
cable network changes.

The ``traverse()`` function is a generic function that will traverse all cables connected to this cable
and call the given consumer for each cable.

```java
    // Cached outputs
    private Set<BlockPos> outputs = null;

    // This function will cache all outputs for this cable network. It will do this
    // by traversing all cables connected to this cable and then check for all energy
    // receivers around those cables.
    private void checkOutputs() {
        if (outputs == null) {
            outputs = new HashSet<>();
            traverse(worldPosition, cable -> {
                // Check for all energy receivers around this position (ignore cables)
                for (Direction direction : Direction.values()) {
                    BlockPos p = cable.getBlockPos().relative(direction);
                    BlockEntity te = level.getBlockEntity(p);
                    if (te != null && !(te instanceof CableBlockEntity)) {
                        te.getCapability(ForgeCapabilities.ENERGY).ifPresent(handler -> {
                            if (handler.canReceive()) {
                                outputs.add(p);
                            }
                        });
                    }
                }
            });
        }
    }

    public void markDirty() {
        traverse(worldPosition, cable -> cable.outputs = null);
    }

    // This is a generic function that will traverse all cables connected to this cable
    // and call the given consumer for each cable.
    private void traverse(BlockPos pos, Consumer<CableBlockEntity> consumer) {
        Set<BlockPos> traversed = new HashSet<>();
        traversed.add(pos);
        consumer.accept(this);
        traverse(pos, traversed, consumer);
    }

    private void traverse(BlockPos pos, Set<BlockPos> traversed, Consumer<CableBlockEntity> consumer) {
        for (Direction direction : Direction.values()) {
            BlockPos p = pos.relative(direction);
            if (!traversed.contains(p)) {
                traversed.add(p);
                if (level.getBlockEntity(p) instanceof CableBlockEntity cable) {
                    consumer.accept(cable);
                    cable.traverse(p, traversed, consumer);
                }
            }
        }
    }
```

The ``tickServer()`` function is called every tick on the server. It will distribute the energy
over all outputs. It will do this by first checking if there is any energy in the cable. If there
is no energy then we don't need to do anything. If there is energy then we check if there are
any outputs. If there are no outputs then we don't need to do anything. If there are outputs
then we distribute the energy over all outputs. We do this by dividing the energy over all outputs
and then for each output we check if it can receive energy. If it can then we send the energy
to that output. We do this by getting the energy capability of the output and then we call
``receiveEnergy()`` on that capability. This will return the amount of energy that was actually
received. We then subtract that amount from the energy in the cable.

:::danger Warning
Again, this is not a perfect algorithm. The way it is implemented it is possible that some receivers
will get less energy than others. This is because we divide the energy over all outputs and then
we send the energy to the outputs one by one. If the first output can't receive energy then we
will send the energy to the second output. If the second output can receive energy then it will
get all the energy. If the second output can't receive energy then we will send the energy to
the third output. And so on. This means that the first output will get less energy than the
second output. This is not a problem for our purposes but it is something to keep in mind.
:::


```java
    public void tickServer() {
        if (energy.getEnergyStored() > 0) {
            // Only do something if we have energy
            checkOutputs();
            if (!outputs.isEmpty()) {
                // Distribute energy over all outputs
                int amount = energy.getEnergyStored() / outputs.size();
                for (BlockPos p : outputs) {
                    BlockEntity te = level.getBlockEntity(p);
                    if (te != null) {
                        te.getCapability(ForgeCapabilities.ENERGY).ifPresent(handler -> {
                            if (handler.canReceive()) {
                                int received = handler.receiveEnergy(amount, false);
                                energy.extractEnergy(received, false);
                            }
                        });
                    }
                }
            }
        }
    }

    @Override
    protected void saveAdditional(CompoundTag tag) {
        super.saveAdditional(tag);
        tag.put(ENERGY_TAG, energy.serializeNBT());
    }

    @Override
    public void load(CompoundTag tag) {
        super.load(tag);
        if (tag.contains(ENERGY_TAG)) {
            energy.deserializeNBT(tag.get(ENERGY_TAG));
        }
    }

    @Nonnull
    private EnergyStorage createEnergyStorage() {
        return new EnergyStorage(CAPACITY, MAXTRANSFER, MAXTRANSFER);
    }

    @NotNull
    @Override
    public <T> LazyOptional<T> getCapability(@NotNull Capability<T> cap, @Nullable Direction side) {
        if (cap == ForgeCapabilities.ENERGY) {
            return energyHandler.cast();
        } else {
            return super.getCapability(cap, side);
        }
    }
}
```

### The Facade

The facade is a block that can be used to mimic another block. A facade is actually a
special type of cable. That means that ``FacadeBlock`` extends ``CableBlock`` and that
``FacadeBlockEntity`` extends ``CableBlockEntity``. Let's go over the code:

#### The Facade Block

The facade block is like the cable block but in addition it will have some logic in case
the facade is destroyed (so that the original cable can be restored). In addition we also
override ``getShape()`` so that we can return the shape of the mimiced block.

```java
public class FacadeBlock extends CableBlock implements EntityBlock {

    public FacadeBlock() {
        super();
    }

    @Nullable
    @Override
    public BlockEntity newBlockEntity(@NotNull BlockPos pos, @NotNull BlockState state) {
        return new FacadeBlockEntity(pos, state);
    }

    @NotNull
    @Override
    public VoxelShape getShape(@NotNull BlockState state, @NotNull BlockGetter world, @NotNull BlockPos pos, @NotNull CollisionContext context) {
        if (world.getBlockEntity(pos) instanceof FacadeBlockEntity facade) {
            BlockState mimicBlock = facade.getMimicBlock();
            if (mimicBlock != null) {
                return mimicBlock.getShape(world, pos, context);
            }
        }
        return super.getShape(state, world, pos, context);
    }

    // This function is called when the facade block is succesfully harvested by the player
    // When the player destroys the facade we need to drop the facade block item with the correct mimiced block
    @Override
    public void playerDestroy(@Nonnull Level level, @Nonnull Player player, @Nonnull BlockPos pos, @Nonnull BlockState state, @Nullable BlockEntity te, @Nonnull ItemStack stack) {
        ItemStack item = new ItemStack(Registration.FACADE_BLOCK.get());
        BlockState mimicBlock;
        if (te instanceof FacadeBlockEntity) {
            mimicBlock = ((FacadeBlockEntity) te).getMimicBlock();
        } else {
            mimicBlock = Blocks.COBBLESTONE.defaultBlockState();
        }
        FacadeBlockItem.setMimicBlock(item, mimicBlock);
        popResource(level, pos, item);
    }

    // When the player destroys the facade we need to restore the cable block
    @Override
    public boolean onDestroyedByPlayer(BlockState state, Level world, BlockPos pos, Player player, boolean willHarvest, FluidState fluid) {
        BlockState defaultState = Registration.CABLE_BLOCK.get().defaultBlockState();
        BlockState newState = CableBlock.calculateState(world, pos, defaultState);
        return ((LevelAccessor) world).setBlock(pos, newState, ((LevelAccessor) world).isClientSide()
                ? Block.UPDATE_ALL + Block.UPDATE_IMMEDIATE
                : Block.UPDATE_ALL);
    }

}
```

#### The Facade Block Entity

The facade block entity is like the cable block entity but in addition it will keep track
of the block that is mimiced. It extends ``CableBlockEntity`` so that it is also recognized
as a valid cable for the purpose of transfering power.

It is very important to note that baked models cannot access the level and so they cannot
access the block entity. That means that we cannot use the block entity to get the mimiced
block. Instead we need to communicate this information through the model data system (using
the ``FACADEID`` model property).

See the comments in the code for more information about what each method does.

```java
public class FacadeBlockEntity extends CableBlockEntity {

    public static final String MIMIC_TAG = "mimic";

    @Nullable private BlockState mimicBlock = null;

    public FacadeBlockEntity(BlockPos pos, BlockState state) {
        super(Registration.FACADE_BLOCK_ENTITY.get(), pos, state);
    }

    // The default onDataPacket() will call load() to load the data from the packet.
    // In addition to that we send a block update to the client
    // and also request a model data update (for the cable baked model)
    @Override
    public void onDataPacket(Connection net, ClientboundBlockEntityDataPacket packet) {
        super.onDataPacket(net, packet);

        if (level.isClientSide) {
            level.sendBlockUpdated(worldPosition, getBlockState(), getBlockState(), Block.UPDATE_ALL);
            requestModelDataUpdate();
        }
    }

    // getUpdatePacket() is called on the server when a block is placed or updated.
    // It should return a packet containing all information needed to render this block on the client.
    // In our case this is the block mimic information. On the client side onDataPacket() is called
    // with this packet.
    @Nullable
    @Override
    public ClientboundBlockEntityDataPacket getUpdatePacket() {
        CompoundTag nbtTag = new CompoundTag();
        saveMimic(nbtTag);
        return ClientboundBlockEntityDataPacket.create(this, (BlockEntity entity) -> {return nbtTag;});
    }

    // getUpdateTag() is called on the server on initial load of the chunk. It will cause
    // the packet to be sent to the client and handleUpdateTag() will be called on the client.
    // The default implementation of handleUpdateTag() will call load() to load the data from the packet.
    // In our case this is sufficient
    @Nonnull
    @Override
    public CompoundTag getUpdateTag() {
        CompoundTag updateTag = super.getUpdateTag();
        saveMimic(updateTag);
        return updateTag;
    }

    public @Nullable BlockState getMimicBlock() {
        return mimicBlock;
    }

    // This is used to build the model data for the cable baked model.
    @Nonnull
    @Override
    public ModelData getModelData() {
        return ModelData.builder()
                .with(CableBlock.FACADEID, mimicBlock)
                .build();
    }


    public void setMimicBlock(BlockState mimicBlock) {
        this.mimicBlock = mimicBlock;
        setChanged();
        getLevel().sendBlockUpdated(getBlockPos(), getBlockState(), getBlockState(), Block.UPDATE_CLIENTS + Block.UPDATE_NEIGHBORS);
    }

    @Override
    public void load(CompoundTag tagCompound) {
        super.load(tagCompound);
        loadMimic(tagCompound);
    }

    private void loadMimic(CompoundTag tagCompound) {
        if (tagCompound.contains(MIMIC_TAG)) {
            mimicBlock = NbtUtils.readBlockState(BuiltInRegistries.BLOCK.asLookup(), tagCompound.getCompound(MIMIC_TAG));
        } else {
            mimicBlock = null;
        }
    }

    @Override
    public void saveAdditional(@Nonnull CompoundTag tagCompound) {
        super.saveAdditional(tagCompound);
        saveMimic(tagCompound);
    }

    private void saveMimic(@NotNull CompoundTag tagCompound) {
        if (mimicBlock != null) {
            CompoundTag tag = NbtUtils.writeBlockState(mimicBlock);
            tagCompound.put(MIMIC_TAG, tag);
        }
    }
}
```

#### The Facade Block Item

Because we need some special handling when the facade block is placed we need to create
a custom block item for it. This is the ``FacadeBlockItem``. It is responsible for
setting the mimiced block when the facade is placed.

```java
public class FacadeBlockItem extends BlockItem {

    public static final String FACADE_IS_MIMICING = "tutorial.facade.is_mimicing";

    private static String getMimickingString(ItemStack stack) {
        CompoundTag tag = stack.getTag();
        if (tag != null) {
            CompoundTag mimic = tag.getCompound("mimic");
            Block value = ForgeRegistries.BLOCKS.getValue(new ResourceLocation(mimic.getString("Name")));
            if (value != null) {
                ItemStack s = new ItemStack(value, 1);
                s.getItem();
                return s.getHoverName().getString();
            }
        }
        return "<unset>";
    }


    public FacadeBlockItem(FacadeBlock block, Item.Properties properties) {
        super(block, properties);
    }

    private static void userSetMimicBlock(@Nonnull ItemStack item, BlockState mimicBlock, UseOnContext context) {
        Level world = context.getLevel();
        Player player = context.getPlayer();
        setMimicBlock(item, mimicBlock);
        if (world.isClientSide) {
            player.displayClientMessage(Component.translatable(FACADE_IS_MIMICING, mimicBlock.getBlock().getDescriptionId()), false);
        }
    }

    public static void setMimicBlock(@Nonnull ItemStack item, BlockState mimicBlock) {
        CompoundTag tagCompound = new CompoundTag();
        CompoundTag nbt = NbtUtils.writeBlockState(mimicBlock);
        tagCompound.put("mimic", nbt);
        item.setTag(tagCompound);
    }

    public static BlockState getMimicBlock(Level level, @Nonnull ItemStack stack) {
        CompoundTag tagCompound = stack.getTag();
        if (tagCompound == null || !tagCompound.contains("mimic")) {
            return Blocks.COBBLESTONE.defaultBlockState();
        } else {
            return NbtUtils.readBlockState(BuiltInRegistries.BLOCK.asLookup(), tagCompound.getCompound("mimic"));
        }
    }

    @Override
    protected boolean canPlace(@Nonnull BlockPlaceContext context, @Nonnull BlockState state) {
        return true;
    }

    // This function is called when our block item is right clicked on something. When this happens
    // we want to either set the minic block or place the facade block
    @Nonnull
    @Override
    public InteractionResult useOn(UseOnContext context) {
        Level world = context.getLevel();
        BlockPos pos = context.getClickedPos();
        Player player = context.getPlayer();
        BlockState state = world.getBlockState(pos);
        Block block = state.getBlock();

        ItemStack itemstack = context.getItemInHand();

        if (!itemstack.isEmpty()) {

            if (block == Registration.CABLE_BLOCK.get()) {
                // We are hitting a cable block. We want to replace it with a facade block
                FacadeBlock facadeBlock = (FacadeBlock) this.getBlock();
                BlockPlaceContext blockContext = new ReplaceBlockItemUseContext(context);
                BlockState placementState = facadeBlock.getStateForPlacement(blockContext)
                        .setValue(NORTH, state.getValue(NORTH))
                        .setValue(SOUTH, state.getValue(SOUTH))
                        .setValue(WEST, state.getValue(WEST))
                        .setValue(EAST, state.getValue(EAST))
                        .setValue(UP, state.getValue(UP))
                        .setValue(DOWN, state.getValue(DOWN))
                        ;

                if (placeBlock(blockContext, placementState)) {
                    SoundType soundtype = world.getBlockState(pos).getBlock().getSoundType(world.getBlockState(pos), world, pos, player);
                    world.playSound(player, pos, soundtype.getPlaceSound(), SoundSource.BLOCKS, (soundtype.getVolume() + 1.0F) / 2.0F, soundtype.getPitch() * 0.8F);
                    BlockEntity te = world.getBlockEntity(pos);
                    if (te instanceof FacadeBlockEntity) {
                        ((FacadeBlockEntity) te).setMimicBlock(getMimicBlock(world, itemstack));
                    }
                    int amount = -1;
                    itemstack.grow(amount);
                }
            } else if (block == Registration.FACADE_BLOCK.get()) {
                // We are hitting a facade block. We want to copy the block it is mimicing
                BlockEntity te = world.getBlockEntity(pos);
                if (!(te instanceof FacadeBlockEntity facade)) {
                    return InteractionResult.FAIL;
                }
                if (facade.getMimicBlock() == null) {
                    return InteractionResult.FAIL;
                }
                userSetMimicBlock(itemstack, facade.getMimicBlock(), context);
            } else {
                // We are hitting something else. We want to set that block as what we are going to mimic
                userSetMimicBlock(itemstack, state, context);
            }
            return InteractionResult.SUCCESS;
        } else {
            return InteractionResult.FAIL;
        }
    }

    @Override
    public void appendHoverText(@Nonnull ItemStack stack, @Nullable Level level, @Nonnull List<Component> tooltip, @Nonnull TooltipFlag flag) {
        super.appendHoverText(stack, level, tooltip, flag);
        if (stack.hasTag()) {
            tooltip.add(Component.translatable(FACADE_IS_MIMICING, getMimickingString(stack)));
        }
    }
}
```

We also need a little class that helps us with the right click handling. This is the
``ReplaceBlockItemUseContext``. It is a ``BlockPlaceContext`` that will set ``replaceClicked``
to true. This will make sure that when our facade is placed it will replace the cable that is there:

```java
public class ReplaceBlockItemUseContext extends BlockPlaceContext {

    public ReplaceBlockItemUseContext(UseOnContext context) {
        super(context);
        replaceClicked = true;
    }
}
```

### Registration

Here is the code to register both our cable and facade blocks:

```java
public class Registration {
    
    ...
    
    public static final RegistryObject<CableBlock> CABLE_BLOCK = BLOCKS.register("cable", CableBlock::new);
    public static final RegistryObject<Item> CABLE_BLOCK_ITEM = ITEMS.register("cable", () -> new BlockItem(CABLE_BLOCK.get(), new Item.Properties()));
    public static final RegistryObject<BlockEntityType<CableBlockEntity>> CABLE_BLOCK_ENTITY = BLOCK_ENTITIES.register("cable",
            () -> BlockEntityType.Builder.of(CableBlockEntity::new, CABLE_BLOCK.get()).build(null));

    public static final RegistryObject<FacadeBlock> FACADE_BLOCK = BLOCKS.register("facade", FacadeBlock::new);
    public static final RegistryObject<Item> FACADE_BLOCK_ITEM = ITEMS.register("facade", () -> new FacadeBlockItem(FACADE_BLOCK.get(), new Item.Properties()));
    public static final RegistryObject<BlockEntityType<FacadeBlockEntity>> FACADE_BLOCK_ENTITY = BLOCK_ENTITIES.register("facade",
            () -> BlockEntityType.Builder.of(FacadeBlockEntity::new, FACADE_BLOCK.get()).build(null));

    public static RegistryObject<CreativeModeTab> TAB = TABS.register("tutpower", () -> CreativeModeTab.builder()
            .title(Component.translatable("tab.tutpower"))
            .icon(() -> new ItemStack(GENERATOR_BLOCK.get()))
            .withTabsBefore(CreativeModeTabs.SPAWN_EGGS)
            .displayItems((featureFlags, output) -> {
                output.accept(GENERATOR_BLOCK.get());
                output.accept(CHARGER_BLOCK.get());
                output.accept(CABLE_BLOCK.get());
                output.accept(FACADE_BLOCK.get());
            })
            .build());
}
```

### Baked Model

The baked model is responsible for generating the actual model for the cable. It will do this
by looking at the six directions and the type of cable in that direction and then generating
the appropriate quads. Both the cable block and the facade block use the same baked model.

#### The Baked Model Loader

To implement a baked model you first need to implement a model loader. This loader is responsible
for loading the model from the json file. In our case we have a single json file that is used
for both the cable block and the facade block. Because we need to distinguish between the two
we use a ``facade`` property in the json file. This property is set to ``true`` for the facade
and to ``false`` for the cable block. The loader will read this property and then create the
appropriate ``CableBakedModel``.

```java
public class CableModelLoader implements IGeometryLoader<CableModelLoader.CableModelGeometry> {

    public static final ResourceLocation GENERATOR_LOADER = new ResourceLocation(TutorialPower.MODID, "cableloader");

    public static void register(ModelEvent.RegisterGeometryLoaders event) {
        event.register("cableloader", new CableModelLoader());
    }


    @Override
    public CableModelGeometry read(JsonObject jsonObject, JsonDeserializationContext deserializationContext) throws JsonParseException {
        boolean facade = jsonObject.has("facade") && jsonObject.get("facade").getAsBoolean();
        return new CableModelGeometry(facade);
    }

    public static class CableModelGeometry implements IUnbakedGeometry<CableModelGeometry> {

        private final boolean facade;

        public CableModelGeometry(boolean facade) {
            this.facade = facade;
        }

        @Override
        public BakedModel bake(IGeometryBakingContext context, ModelBaker baker, Function<Material, TextureAtlasSprite> spriteGetter, ModelState modelState, ItemOverrides overrides, ResourceLocation modelLocation) {
            return new CableBakedModel(context, facade);
        }
    }
}
```

The ``register()`` method needs to be called from the ``ModelEvent.RegisterGeometryLoaders`` event.
We do that in ``ClientSetup``. In addition we also need to register the block color handler which
will be covered later. This color handler makes sure that when we are (for example) mimicing grass,
it will get the correct color (from the biome).

```java
@Mod.EventBusSubscriber(modid = MODID, bus = Mod.EventBusSubscriber.Bus.MOD, value = Dist.CLIENT)
public class ClientSetup {

    ...

    @SubscribeEvent
    public static void modelInit(ModelEvent.RegisterGeometryLoaders event) {
        CableModelLoader.register(event);
    }

    @SubscribeEvent
    public static void registerBlockColor(RegisterColorHandlersEvent.Block event) {
        event.register(new FacadeBlockColor(), Registration.FACADE_BLOCK.get());
    }

}
```

#### The block color handler

When we are mimicing another block we need to make sure that the color of the block is correct.
For example, if we are mimicing grass then we need to make sure that the grass is the correct
color:

```java
public class FacadeBlockColor implements BlockColor {

    @Override
    public int getColor(@Nonnull BlockState blockState, @Nullable BlockAndTintGetter world, @Nullable BlockPos pos, int tint) {
        if (world != null) {
            BlockEntity te = world.getBlockEntity(pos);
            if (te instanceof FacadeBlockEntity facade) {
                BlockState mimic = facade.getMimicBlock();
                if (mimic != null) {
                    return Minecraft.getInstance().getBlockColors().getColor(mimic, world, pos, tint);
                }
            }
        }
        return -1;
    }
}
```

#### The Baked Model

The baked model is responsible for generating the actual model for the cable. It will do this
by looking at the six directions and the type of cable in that direction and then generating
the appropriate quads. Both the cable block and the facade block use the same baked model.

This code uses the ``CablePatterns`` helper class to generate the quads. That class knows
how to translate a certain connector type to the correct quads.

The important routine in this class is the ``getQuads()`` routine. This routine is called
by the renderer to get the quads for the cable.

```java
public class CableBakedModel implements IDynamicBakedModel {

    private final IGeometryBakingContext context;
    private final boolean facade;

    private TextureAtlasSprite spriteConnector;
    private TextureAtlasSprite spriteNoneCable;
    private TextureAtlasSprite spriteNormalCable;
    private TextureAtlasSprite spriteEndCable;
    private TextureAtlasSprite spriteCornerCable;
    private TextureAtlasSprite spriteThreeCable;
    private TextureAtlasSprite spriteCrossCable;
    private TextureAtlasSprite spriteSide;

    static {
        // For all possible patterns we define the sprite to use and the rotation. Note that each
        // pattern looks at the existance of a cable section for each of the four directions
        // excluding the one we are looking at.
        CablePatterns.PATTERNS.put(Pattern.of(false, false, false, false), QuadSetting.of(SPRITE_NONE, 0));
        CablePatterns.PATTERNS.put(Pattern.of(true, false, false, false), QuadSetting.of(SPRITE_END, 3));
        CablePatterns.PATTERNS.put(Pattern.of(false, true, false, false), QuadSetting.of(SPRITE_END, 0));
        CablePatterns.PATTERNS.put(Pattern.of(false, false, true, false), QuadSetting.of(SPRITE_END, 1));
        CablePatterns.PATTERNS.put(Pattern.of(false, false, false, true), QuadSetting.of(SPRITE_END, 2));
        CablePatterns.PATTERNS.put(Pattern.of(true, true, false, false), QuadSetting.of(SPRITE_CORNER, 0));
        CablePatterns.PATTERNS.put(Pattern.of(false, true, true, false), QuadSetting.of(SPRITE_CORNER, 1));
        CablePatterns.PATTERNS.put(Pattern.of(false, false, true, true), QuadSetting.of(SPRITE_CORNER, 2));
        CablePatterns.PATTERNS.put(Pattern.of(true, false, false, true), QuadSetting.of(SPRITE_CORNER, 3));
        CablePatterns.PATTERNS.put(Pattern.of(false, true, false, true), QuadSetting.of(SPRITE_STRAIGHT, 0));
        CablePatterns.PATTERNS.put(Pattern.of(true, false, true, false), QuadSetting.of(SPRITE_STRAIGHT, 1));
        CablePatterns.PATTERNS.put(Pattern.of(true, true, true, false), QuadSetting.of(SPRITE_THREE, 0));
        CablePatterns.PATTERNS.put(Pattern.of(false, true, true, true), QuadSetting.of(SPRITE_THREE, 1));
        CablePatterns.PATTERNS.put(Pattern.of(true, false, true, true), QuadSetting.of(SPRITE_THREE, 2));
        CablePatterns.PATTERNS.put(Pattern.of(true, true, false, true), QuadSetting.of(SPRITE_THREE, 3));
        CablePatterns.PATTERNS.put(Pattern.of(true, true, true, true), QuadSetting.of(SPRITE_CROSS, 0));
    }

    public CableBakedModel(IGeometryBakingContext context, boolean facade) {
        this.context = context;
        this.facade = facade;
    }

    private void initTextures() {
        if (spriteConnector == null) {
            spriteConnector = getTexture("block/cable/connector");
            spriteNormalCable = getTexture("block/cable/normal");
            spriteNoneCable = getTexture("block/cable/none");
            spriteEndCable = getTexture("block/cable/end");
            spriteCornerCable = getTexture("block/cable/corner");
            spriteThreeCable = getTexture("block/cable/three");
            spriteCrossCable = getTexture("block/cable/cross");
            spriteSide = getTexture("block/cable/side");
        }
    }

    // All textures are baked on a big texture atlas. This function gets the texture from that atlas
    private TextureAtlasSprite getTexture(String path) {
        return Minecraft.getInstance().getTextureAtlas(InventoryMenu.BLOCK_ATLAS).apply(new ResourceLocation(TutorialPower.MODID, path));
    }

    private TextureAtlasSprite getSpriteNormal(CablePatterns.SpriteIdx idx) {
        initTextures();
        return switch (idx) {
            case SPRITE_NONE -> spriteNoneCable;
            case SPRITE_END -> spriteEndCable;
            case SPRITE_STRAIGHT -> spriteNormalCable;
            case SPRITE_CORNER -> spriteCornerCable;
            case SPRITE_THREE -> spriteThreeCable;
            case SPRITE_CROSS -> spriteCrossCable;
        };
    }

    @Override
    public boolean usesBlockLight() {
        return false;
    }

    @Override
    @NotNull
    public List<BakedQuad> getQuads(@Nullable BlockState state, @Nullable Direction side, @NotNull RandomSource rand, @NotNull ModelData extraData, @Nullable RenderType layer) {
        initTextures();
        List<BakedQuad> quads = new ArrayList<>();
        if (side == null && (layer == null || layer.equals(RenderType.solid()))) {
            // Called with the blockstate from our block. Here we get the values of the six properties and pass that to
            // our baked model implementation. If state == null we are called from the inventory and we use the default
            // values for the properties
            ConnectorType north, south, west, east, up, down;
            if (state != null) {
                north = state.getValue(CableBlock.NORTH);
                south = state.getValue(CableBlock.SOUTH);
                west = state.getValue(CableBlock.WEST);
                east = state.getValue(CableBlock.EAST);
                up = state.getValue(CableBlock.UP);
                down = state.getValue(CableBlock.DOWN);
            } else {
                // If we are a facade and we are an item then we render as the 'side' texture as a full block
                if (facade) {
                    quads.add(quad(v(0, 1, 1), v(1, 1, 1), v(1, 1, 0), v(0, 1, 0), spriteSide));
                    quads.add(quad(v(0, 0, 0), v(1, 0, 0), v(1, 0, 1), v(0, 0, 1), spriteSide));
                    quads.add(quad(v(1, 0, 0), v(1, 1, 0), v(1, 1, 1), v(1, 0, 1), spriteSide));
                    quads.add(quad(v(0, 0, 1), v(0, 1, 1), v(0, 1, 0), v(0, 0, 0), spriteSide));
                    quads.add(quad(v(0, 1, 0), v(1, 1, 0), v(1, 0, 0), v(0, 0, 0), spriteSide));
                    quads.add(quad(v(0, 0, 1), v(1, 0, 1), v(1, 1, 1), v(0, 1, 1), spriteSide));
                    return quads;
                }
                north = south = west = east = up = down = NONE;
            }

            TextureAtlasSprite spriteCable = spriteNormalCable;
            Function<CablePatterns.SpriteIdx, TextureAtlasSprite> spriteGetter = this::getSpriteNormal;

            double o = .4;      // Thickness of the cable. .0 would be full block, .5 is infinitely thin.
            double p = .1;      // Thickness of the connector as it is put on the connecting block
            double q = .2;      // The wideness of the connector

            // For each side we either cap it off if there is no similar block adjacent on that side
            // or else we extend so that we touch the adjacent block:
            if (up == CABLE) {
                quads.add(quad(v(1 - o, 1, o), v(1 - o, 1, 1 - o), v(1 - o, 1 - o, 1 - o), v(1 - o, 1 - o, o), spriteCable));
                quads.add(quad(v(o, 1, 1 - o), v(o, 1, o), v(o, 1 - o, o), v(o, 1 - o, 1 - o), spriteCable));
                quads.add(quad(v(o, 1, o), v(1 - o, 1, o), v(1 - o, 1 - o, o), v(o, 1 - o, o), spriteCable));
                quads.add(quad(v(o, 1 - o, 1 - o), v(1 - o, 1 - o, 1 - o), v(1 - o, 1, 1 - o), v(o, 1, 1 - o), spriteCable));
            } else if (up == BLOCK) {
                quads.add(quad(v(1 - o, 1 - p, o), v(1 - o, 1 - p, 1 - o), v(1 - o, 1 - o, 1 - o), v(1 - o, 1 - o, o), spriteCable));
                quads.add(quad(v(o, 1 - p, 1 - o), v(o, 1 - p, o), v(o, 1 - o, o), v(o, 1 - o, 1 - o), spriteCable));
                quads.add(quad(v(o, 1 - p, o), v(1 - o, 1 - p, o), v(1 - o, 1 - o, o), v(o, 1 - o, o), spriteCable));
                quads.add(quad(v(o, 1 - o, 1 - o), v(1 - o, 1 - o, 1 - o), v(1 - o, 1 - p, 1 - o), v(o, 1 - p, 1 - o), spriteCable));

                quads.add(quad(v(1 - q, 1 - p, q), v(1 - q, 1, q), v(1 - q, 1, 1 - q), v(1 - q, 1 - p, 1 - q), spriteSide));
                quads.add(quad(v(q, 1 - p, 1 - q), v(q, 1, 1 - q), v(q, 1, q), v(q, 1 - p, q), spriteSide));
                quads.add(quad(v(q, 1, q), v(1 - q, 1, q), v(1 - q, 1 - p, q), v(q, 1 - p, q), spriteSide));
                quads.add(quad(v(q, 1 - p, 1 - q), v(1 - q, 1 - p, 1 - q), v(1 - q, 1, 1 - q), v(q, 1, 1 - q), spriteSide));

                quads.add(quad(v(q, 1 - p, q), v(1 - q, 1 - p, q), v(1 - q, 1 - p, 1 - q), v(q, 1 - p, 1 - q), spriteConnector));
                quads.add(quad(v(q, 1, q), v(q, 1, 1 - q), v(1 - q, 1, 1 - q), v(1 - q, 1, q), spriteSide));
            } else {
                QuadSetting pattern = CablePatterns.findPattern(west, south, east, north);
                quads.add(quad(v(o, 1 - o, 1 - o), v(1 - o, 1 - o, 1 - o), v(1 - o, 1 - o, o), v(o, 1 - o, o), spriteGetter.apply(pattern.sprite()), pattern.rotation()));
            }

            if (down == CABLE) {
                quads.add(quad(v(1 - o, o, o), v(1 - o, o, 1 - o), v(1 - o, 0, 1 - o), v(1 - o, 0, o), spriteCable));
                quads.add(quad(v(o, o, 1 - o), v(o, o, o), v(o, 0, o), v(o, 0, 1 - o), spriteCable));
                quads.add(quad(v(o, o, o), v(1 - o, o, o), v(1 - o, 0, o), v(o, 0, o), spriteCable));
                quads.add(quad(v(o, 0, 1 - o), v(1 - o, 0, 1 - o), v(1 - o, o, 1 - o), v(o, o, 1 - o), spriteCable));
            } else if (down == BLOCK) {
                quads.add(quad(v(1 - o, o, o), v(1 - o, o, 1 - o), v(1 - o, p, 1 - o), v(1 - o, p, o), spriteCable));
                quads.add(quad(v(o, o, 1 - o), v(o, o, o), v(o, p, o), v(o, p, 1 - o), spriteCable));
                quads.add(quad(v(o, o, o), v(1 - o, o, o), v(1 - o, p, o), v(o, p, o), spriteCable));
                quads.add(quad(v(o, p, 1 - o), v(1 - o, p, 1 - o), v(1 - o, o, 1 - o), v(o, o, 1 - o), spriteCable));

                quads.add(quad(v(1 - q, 0, q), v(1 - q, p, q), v(1 - q, p, 1 - q), v(1 - q, 0, 1 - q), spriteSide));
                quads.add(quad(v(q, 0, 1 - q), v(q, p, 1 - q), v(q, p, q), v(q, 0, q), spriteSide));
                quads.add(quad(v(q, p, q), v(1 - q, p, q), v(1 - q, 0, q), v(q, 0, q), spriteSide));
                quads.add(quad(v(q, 0, 1 - q), v(1 - q, 0, 1 - q), v(1 - q, p, 1 - q), v(q, p, 1 - q), spriteSide));

                quads.add(quad(v(q, p, 1 - q), v(1 - q, p, 1 - q), v(1 - q, p, q), v(q, p, q), spriteConnector));
                quads.add(quad(v(q, 0, 1 - q), v(q, 0, q), v(1 - q, 0, q), v(1 - q, 0, 1 - q), spriteSide));
            } else {
                QuadSetting pattern = CablePatterns.findPattern(west, north, east, south);
                quads.add(quad(v(o, o, o), v(1 - o, o, o), v(1 - o, o, 1 - o), v(o, o, 1 - o), spriteGetter.apply(pattern.sprite()), pattern.rotation()));
            }

            if (east == CABLE) {
                quads.add(quad(v(1, 1 - o, 1 - o), v(1, 1 - o, o), v(1 - o, 1 - o, o), v(1 - o, 1 - o, 1 - o), spriteCable));
                quads.add(quad(v(1, o, o), v(1, o, 1 - o), v(1 - o, o, 1 - o), v(1 - o, o, o), spriteCable));
                quads.add(quad(v(1, 1 - o, o), v(1, o, o), v(1 - o, o, o), v(1 - o, 1 - o, o), spriteCable));
                quads.add(quad(v(1, o, 1 - o), v(1, 1 - o, 1 - o), v(1 - o, 1 - o, 1 - o), v(1 - o, o, 1 - o), spriteCable));
            } else if (east == BLOCK) {
                quads.add(quad(v(1 - p, 1 - o, 1 - o), v(1 - p, 1 - o, o), v(1 - o, 1 - o, o), v(1 - o, 1 - o, 1 - o), spriteCable));
                quads.add(quad(v(1 - p, o, o), v(1 - p, o, 1 - o), v(1 - o, o, 1 - o), v(1 - o, o, o), spriteCable));
                quads.add(quad(v(1 - p, 1 - o, o), v(1 - p, o, o), v(1 - o, o, o), v(1 - o, 1 - o, o), spriteCable));
                quads.add(quad(v(1 - p, o, 1 - o), v(1 - p, 1 - o, 1 - o), v(1 - o, 1 - o, 1 - o), v(1 - o, o, 1 - o), spriteCable));

                quads.add(quad(v(1 - p, 1 - q, 1 - q), v(1, 1 - q, 1 - q), v(1, 1 - q, q), v(1 - p, 1 - q, q), spriteSide));
                quads.add(quad(v(1 - p, q, q), v(1, q, q), v(1, q, 1 - q), v(1 - p, q, 1 - q), spriteSide));
                quads.add(quad(v(1 - p, 1 - q, q), v(1, 1 - q, q), v(1, q, q), v(1 - p, q, q), spriteSide));
                quads.add(quad(v(1 - p, q, 1 - q), v(1, q, 1 - q), v(1, 1 - q, 1 - q), v(1 - p, 1 - q, 1 - q), spriteSide));

                quads.add(quad(v(1 - p, q, 1 - q), v(1 - p, 1 - q, 1 - q), v(1 - p, 1 - q, q), v(1 - p, q, q), spriteConnector));
                quads.add(quad(v(1, q, 1 - q), v(1, q, q), v(1, 1 - q, q), v(1, 1 - q, 1 - q), spriteSide));
            } else {
                QuadSetting pattern = CablePatterns.findPattern(down, north, up, south);
                quads.add(quad(v(1 - o, o, o), v(1 - o, 1 - o, o), v(1 - o, 1 - o, 1 - o), v(1 - o, o, 1 - o), spriteGetter.apply(pattern.sprite()), pattern.rotation()));
            }

            if (west == CABLE) {
                quads.add(quad(v(o, 1 - o, 1 - o), v(o, 1 - o, o), v(0, 1 - o, o), v(0, 1 - o, 1 - o), spriteCable));
                quads.add(quad(v(o, o, o), v(o, o, 1 - o), v(0, o, 1 - o), v(0, o, o), spriteCable));
                quads.add(quad(v(o, 1 - o, o), v(o, o, o), v(0, o, o), v(0, 1 - o, o), spriteCable));
                quads.add(quad(v(o, o, 1 - o), v(o, 1 - o, 1 - o), v(0, 1 - o, 1 - o), v(0, o, 1 - o), spriteCable));
            } else if (west == BLOCK) {
                quads.add(quad(v(o, 1 - o, 1 - o), v(o, 1 - o, o), v(p, 1 - o, o), v(p, 1 - o, 1 - o), spriteCable));
                quads.add(quad(v(o, o, o), v(o, o, 1 - o), v(p, o, 1 - o), v(p, o, o), spriteCable));
                quads.add(quad(v(o, 1 - o, o), v(o, o, o), v(p, o, o), v(p, 1 - o, o), spriteCable));
                quads.add(quad(v(o, o, 1 - o), v(o, 1 - o, 1 - o), v(p, 1 - o, 1 - o), v(p, o, 1 - o), spriteCable));

                quads.add(quad(v(0, 1 - q, 1 - q), v(p, 1 - q, 1 - q), v(p, 1 - q, q), v(0, 1 - q, q), spriteSide));
                quads.add(quad(v(0, q, q), v(p, q, q), v(p, q, 1 - q), v(0, q, 1 - q), spriteSide));
                quads.add(quad(v(0, 1 - q, q), v(p, 1 - q, q), v(p, q, q), v(0, q, q), spriteSide));
                quads.add(quad(v(0, q, 1 - q), v(p, q, 1 - q), v(p, 1 - q, 1 - q), v(0, 1 - q, 1 - q), spriteSide));

                quads.add(quad(v(p, q, q), v(p, 1 - q, q), v(p, 1 - q, 1 - q), v(p, q, 1 - q), spriteConnector));
                quads.add(quad(v(0, q, q), v(0, q, 1 - q), v(0, 1 - q, 1 - q), v(0, 1 - q, q), spriteSide));
            } else {
                QuadSetting pattern = CablePatterns.findPattern(down, south, up, north);
                quads.add(quad(v(o, o, 1 - o), v(o, 1 - o, 1 - o), v(o, 1 - o, o), v(o, o, o), spriteGetter.apply(pattern.sprite()), pattern.rotation()));
            }

            if (north == CABLE) {
                quads.add(quad(v(o, 1 - o, o), v(1 - o, 1 - o, o), v(1 - o, 1 - o, 0), v(o, 1 - o, 0), spriteCable));
                quads.add(quad(v(o, o, 0), v(1 - o, o, 0), v(1 - o, o, o), v(o, o, o), spriteCable));
                quads.add(quad(v(1 - o, o, 0), v(1 - o, 1 - o, 0), v(1 - o, 1 - o, o), v(1 - o, o, o), spriteCable));
                quads.add(quad(v(o, o, o), v(o, 1 - o, o), v(o, 1 - o, 0), v(o, o, 0), spriteCable));
            } else if (north == BLOCK) {
                quads.add(quad(v(o, 1 - o, o), v(1 - o, 1 - o, o), v(1 - o, 1 - o, p), v(o, 1 - o, p), spriteCable));
                quads.add(quad(v(o, o, p), v(1 - o, o, p), v(1 - o, o, o), v(o, o, o), spriteCable));
                quads.add(quad(v(1 - o, o, p), v(1 - o, 1 - o, p), v(1 - o, 1 - o, o), v(1 - o, o, o), spriteCable));
                quads.add(quad(v(o, o, o), v(o, 1 - o, o), v(o, 1 - o, p), v(o, o, p), spriteCable));

                quads.add(quad(v(q, 1 - q, p), v(1 - q, 1 - q, p), v(1 - q, 1 - q, 0), v(q, 1 - q, 0), spriteSide));
                quads.add(quad(v(q, q, 0), v(1 - q, q, 0), v(1 - q, q, p), v(q, q, p), spriteSide));
                quads.add(quad(v(1 - q, q, 0), v(1 - q, 1 - q, 0), v(1 - q, 1 - q, p), v(1 - q, q, p), spriteSide));
                quads.add(quad(v(q, q, p), v(q, 1 - q, p), v(q, 1 - q, 0), v(q, q, 0), spriteSide));

                quads.add(quad(v(q, q, p), v(1 - q, q, p), v(1 - q, 1 - q, p), v(q, 1 - q, p), spriteConnector));
                quads.add(quad(v(q, q, 0), v(q, 1 - q, 0), v(1 - q, 1 - q, 0), v(1 - q, q, 0), spriteSide));
            } else {
                QuadSetting pattern = CablePatterns.findPattern(west, up, east, down);
                quads.add(quad(v(o, 1 - o, o), v(1 - o, 1 - o, o), v(1 - o, o, o), v(o, o, o), spriteGetter.apply(pattern.sprite()), pattern.rotation()));
            }

            if (south == CABLE) {
                quads.add(quad(v(o, 1 - o, 1), v(1 - o, 1 - o, 1), v(1 - o, 1 - o, 1 - o), v(o, 1 - o, 1 - o), spriteCable));
                quads.add(quad(v(o, o, 1 - o), v(1 - o, o, 1 - o), v(1 - o, o, 1), v(o, o, 1), spriteCable));
                quads.add(quad(v(1 - o, o, 1 - o), v(1 - o, 1 - o, 1 - o), v(1 - o, 1 - o, 1), v(1 - o, o, 1), spriteCable));
                quads.add(quad(v(o, o, 1), v(o, 1 - o, 1), v(o, 1 - o, 1 - o), v(o, o, 1 - o), spriteCable));
            } else if (south == BLOCK) {
                quads.add(quad(v(o, 1 - o, 1 - p), v(1 - o, 1 - o, 1 - p), v(1 - o, 1 - o, 1 - o), v(o, 1 - o, 1 - o), spriteCable));
                quads.add(quad(v(o, o, 1 - o), v(1 - o, o, 1 - o), v(1 - o, o, 1 - p), v(o, o, 1 - p), spriteCable));
                quads.add(quad(v(1 - o, o, 1 - o), v(1 - o, 1 - o, 1 - o), v(1 - o, 1 - o, 1 - p), v(1 - o, o, 1 - p), spriteCable));
                quads.add(quad(v(o, o, 1 - p), v(o, 1 - o, 1 - p), v(o, 1 - o, 1 - o), v(o, o, 1 - o), spriteCable));

                quads.add(quad(v(q, 1 - q, 1), v(1 - q, 1 - q, 1), v(1 - q, 1 - q, 1 - p), v(q, 1 - q, 1 - p), spriteSide));
                quads.add(quad(v(q, q, 1 - p), v(1 - q, q, 1 - p), v(1 - q, q, 1), v(q, q, 1), spriteSide));
                quads.add(quad(v(1 - q, q, 1 - p), v(1 - q, 1 - q, 1 - p), v(1 - q, 1 - q, 1), v(1 - q, q, 1), spriteSide));
                quads.add(quad(v(q, q, 1), v(q, 1 - q, 1), v(q, 1 - q, 1 - p), v(q, q, 1 - p), spriteSide));

                quads.add(quad(v(q, 1 - q, 1 - p), v(1 - q, 1 - q, 1 - p), v(1 - q, q, 1 - p), v(q, q, 1 - p), spriteConnector));
                quads.add(quad(v(q, 1 - q, 1), v(q, q, 1), v(1 - q, q, 1), v(1 - q, 1 - q, 1), spriteSide));
            } else {
                QuadSetting pattern = CablePatterns.findPattern(west, down, east, up);
                quads.add(quad(v(o, o, 1 - o), v(1 - o, o, 1 - o), v(1 - o, 1 - o, 1 - o), v(o, 1 - o, 1 - o), spriteGetter.apply(pattern.sprite()), pattern.rotation()));
            }
        }

        // Render the facade if we have one in addition to the cable above. Note that the facade comes from the model data property
        // (FACADEID)
        BlockState facadeId = extraData.get(CableBlock.FACADEID);
        if (facadeId != null) {
            BakedModel model = Minecraft.getInstance().getBlockRenderer().getBlockModelShaper().getBlockModel(facadeId);
            ChunkRenderTypeSet renderTypes = model.getRenderTypes(facadeId, rand, extraData);
            if (layer == null || renderTypes.contains(layer)) { // always render in the null layer or the block-breaking textures don't show up
                try {
                    quads.addAll(model.getQuads(state, side, rand, ModelData.EMPTY, layer));
                } catch (Exception ignored) {
                }
            }
        }

        return quads;
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

    // Because we can potentially mimic other blocks we need to render on all render types
    @Override
    @Nonnull
    public ChunkRenderTypeSet getRenderTypes(@NotNull BlockState state, @NotNull RandomSource rand, @NotNull ModelData data) {
        return ChunkRenderTypeSet.all();
    }

    @Nonnull
    @Override
    public TextureAtlasSprite getParticleIcon() {
        return spriteNormalCable == null
                ? Minecraft.getInstance().getTextureAtlas(InventoryMenu.BLOCK_ATLAS).apply((new ResourceLocation("minecraft", "missingno")))
                : spriteNormalCable;
    }

    // To let our cable/facade render correctly as an item (both in inventory and on the ground) we
    // get the correct transforms from the context
    @Nonnull
    @Override
    public ItemTransforms getTransforms() {
        return context.getTransforms();
    }

    @Nonnull
    @Override
    public ItemOverrides getOverrides() {
        return ItemOverrides.EMPTY;
    }

}
```

#### The CablePatterns helper

```java
public class CablePatterns {

    // This map takes a pattern of four directions (excluding the one we are looking at) and returns the sprite index
    // and rotation for the quad that we are looking at.
    static final Map<Pattern, QuadSetting> PATTERNS = new HashMap<>();

    // Given a pattern of four directions (excluding the one we are looking at) we return the sprite index and rotation
    // for the quad that we are looking at.
    public static QuadSetting findPattern(ConnectorType s1, ConnectorType s2, ConnectorType s3, ConnectorType s4) {
        return PATTERNS.get(new Pattern(s1 != NONE, s2 != NONE, s3 != NONE, s4 != NONE));
    }

    // This enum represents the type of sprite (texture)
    public enum SpriteIdx {
        SPRITE_NONE,
        SPRITE_END,
        SPRITE_STRAIGHT,
        SPRITE_CORNER,
        SPRITE_THREE,
        SPRITE_CROSS
    }

    // This enum represents the type of sprite (texture) as well as the rotation for that sprite
    public record QuadSetting(SpriteIdx sprite, int rotation) {

        public static QuadSetting of(SpriteIdx sprite, int rotation) {
            return new QuadSetting(sprite, rotation);
        }
    }

    // A pattern represents a configuration (cable or no cable) for the four directions excluding the one we are looking at
    public record Pattern(boolean s1, boolean s2, boolean s3, boolean s4) {

        public static Pattern of(boolean s1, boolean s2, boolean s3, boolean s4) {
            return new Pattern(s1, s2, s3, s4);
        }
    }
}
```

#### The BakedModelHelper

The ``BakedModelHelper`` is a helper class that contains some helper methods for creating quads. We
use this class to create the quads for the cables.

```java
public class BakedModelHelper {

    public static BakedQuad quad(Vec3 v1, Vec3 v2, Vec3 v3, Vec3 v4, TextureAtlasSprite sprite, int rotation) {
        return switch (rotation) {
            case 0 -> quad(v1, v2, v3, v4, sprite);
            case 1 -> quad(v2, v3, v4, v1, sprite);
            case 2 -> quad(v3, v4, v1, v2, sprite);
            case 3 -> quad(v4, v1, v2, v3, sprite);
            default -> quad(v1, v2, v3, v4, sprite);
        };
    }

    public static BakedQuad quad(Vec3 v1, Vec3 v2, Vec3 v3, Vec3 v4, TextureAtlasSprite sprite) {
        Vec3 normal = v3.subtract(v2).cross(v1.subtract(v2)).normalize();

        BakedQuad[] quad = new BakedQuad[1];
        QuadBakingVertexConsumer builder = new QuadBakingVertexConsumer(q -> quad[0] = q);
        builder.setSprite(sprite);
        builder.setDirection(Direction.getNearest(normal.x, normal.y, normal.z));
        putVertex(builder, normal, v1.x, v1.y, v1.z, 0, 0, sprite);
        putVertex(builder, normal, v2.x, v2.y, v2.z, 0, 16, sprite);
        putVertex(builder, normal, v3.x, v3.y, v3.z, 16, 16, sprite);
        putVertex(builder, normal, v4.x, v4.y, v4.z, 16, 0, sprite);
        return quad[0];
    }

    private static void putVertex(VertexConsumer builder, Position normal,
                                 double x, double y, double z, float u, float v,
                                 TextureAtlasSprite sprite) {
        float iu = sprite.getU(u);
        float iv = sprite.getV(v);
        builder.vertex(x, y, z)
                .uv(iu, iv)
                .uv2(0, 0)
                .color(1.0f, 1.0f, 1.0f, 1.0f)
                .normal((float) normal.x(), (float) normal.y(), (float) normal.z())
                .endVertex();
    }

    public static Vec3 v(double x, double y, double z) {
        return new Vec3(x, y, z);
    }
}
```

### Data Generation

The final thing we need to explain is data generation. We are not going into full detail here as you should
know how this works by now. You can look at the github code to see specifics. However, I do want
to explain how we can also do datageneration for our models that use the baked model system.

For generating the jsons for the cable and facade we can use the following code in ``TutBlockStates``.
Because we need a custom builder for our model we need to create a custom builder class. This class
is called ``CableLoaderBuilder`` and it extends ``CustomLoaderBuilder``. The ``CableLoaderBuilder`` takes
a ``ResourceLocation`` for the loader id, a ``BlockModelBuilder`` for the parent, an ``ExistingFileHelper`` and
a boolean that indicates if we are generating a facade or not. The ``CableLoaderBuilder`` overrides the
``toJson`` method to add the ``facade`` property to the json. The ``facade`` property is used in the
``CableModelLoader`` to determine if we are generating a cable or a facade.

In ``registerCable()`` and ``registerFacade()`` we create a ``BlockModelBuilder`` and set the parent to
``cube``. We then set the custom loader to our ``CableLoaderBuilder`` and set the ``facade`` property.
Finally we call ``simpleBlock`` with the ``BlockModelBuilder`` and the block.

Because we use the standard vanilla ``cube`` model as the parent we will inherit the proper transformations
for the item. This means that the cable and facade will render correctly in the inventory and on the ground
(also because in our baked model we use the ``context`` to get the transforms).

```java
public class TutBlockStates extends BlockStateProvider {

    ...

    @Override
    protected void registerStatesAndModels() {
        ...
        registerCable();
        registerFacade();
    }

    private void registerCable() {
        BlockModelBuilder model = models().getBuilder("cable")
                .parent(models().getExistingFile(mcLoc("cube")))
                .customLoader((builder, helper) -> new CableLoaderBuilder(CableModelLoader.GENERATOR_LOADER, builder, helper, false))
                .end();
        simpleBlock(Registration.CABLE_BLOCK.get(), model);
    }

    private void registerFacade() {
        BlockModelBuilder model = models().getBuilder("facade")
                .parent(models().getExistingFile(mcLoc("cube")))
                .customLoader((builder, helper) -> new CableLoaderBuilder(CableModelLoader.GENERATOR_LOADER, builder, helper, true))
                .end();
        simpleBlock(Registration.FACADE_BLOCK.get(), model);
    }

    ...
    
    public static class CableLoaderBuilder extends CustomLoaderBuilder<BlockModelBuilder> {

        private final boolean facade;

        public CableLoaderBuilder(ResourceLocation loader, BlockModelBuilder parent, ExistingFileHelper existingFileHelper,
                                  boolean facade) {
            super(loader, parent, existingFileHelper);
            this.facade = facade;
        }

        @Override
        public JsonObject toJson(JsonObject json) {
            JsonObject obj = super.toJson(json);
            obj.addProperty("facade", facade);
            return obj;
        }
    }
}
```
