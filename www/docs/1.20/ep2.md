---
sidebar_position: 2
---

# Episode 2

## Links

* Video: n.a.
* [Back to 1.20 Tutorial Index](./1.20.md)
* [Tutorial GitHub](https://github.com/McJty/Tut4_2Block)

## Introduction

In this episode we will create a simple block and a more complex block with associated block entity.
We will learn the following things in this tutorial:

* Creation of a custom block and block entity
* Block entity renderer for fancy effect
* Simple usage of a particle system
* Capability for storing items
* Datagen for all the jsons

We will also clean up the gradle and mod setup stuff a bit.

## The main mod class

In this tutorial we greatly simplified the main mod class. Most of the things we did here are now
done in other classes. We removed the client specific setup. This is now in a different file.
We moved all registration stuff to the Registration class. Finally we removed all things we don't
need right now.

```java
@Mod(Tutorial2Block.MODID)
public class Tutorial2Block {

    public static final String MODID = "tut2block";
    public static final Logger LOGGER = LogUtils.getLogger();

    public Tutorial2Block() {
        IEventBus modEventBus = FMLJavaModLoadingContext.get().getModEventBus();
        Registration.init(modEventBus);

        modEventBus.addListener(this::commonSetup);
        modEventBus.addListener(Registration::addCreative);
        modEventBus.addListener(DataGeneration::generate);
    }

    private void commonSetup(final FMLCommonSetupEvent event) {
    }
}
```

## Registration

Everything related to registration has moved to the `Registration` class. We define three
deferred registers here: one for blocks, one for items and one for block entities. We then
go on to define a simple block with associated item and a complex block with associated
item and block entity. The `init` method is called from the main mod class to register
the deferred registers.

Finally the `addCreative` method is added to the mod event bus to add the blocks to the
creative tabs.

```java
public class Registration {

    public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(ForgeRegistries.BLOCKS, Tutorial2Block.MODID);
    public static final DeferredRegister<Item> ITEMS = DeferredRegister.create(ForgeRegistries.ITEMS, Tutorial2Block.MODID);
    public static final DeferredRegister<BlockEntityType<?>> BLOCK_ENTITIES = DeferredRegister.create(ForgeRegistries.BLOCK_ENTITY_TYPES, Tutorial2Block.MODID);

    public static final RegistryObject<SimpleBlock> SIMPLE_BLOCK = BLOCKS.register("simple_block", SimpleBlock::new);
    public static final RegistryObject<Item> SIMPLE_BLOCK_ITEM = ITEMS.register("simple_block", () -> new BlockItem(SIMPLE_BLOCK.get(), new Item.Properties()));

    public static final RegistryObject<ComplexBlock> COMPLEX_BLOCK = BLOCKS.register("complex_block", ComplexBlock::new);
    public static final RegistryObject<Item> COMPLEX_BLOCK_ITEM = ITEMS.register("complex_block", () -> new BlockItem(COMPLEX_BLOCK.get(), new Item.Properties()));
    public static final RegistryObject<BlockEntityType<ComplexBlockEntity>> COMPLEX_BLOCK_ENTITY = BLOCK_ENTITIES.register("complex_block",
            () -> BlockEntityType.Builder.of(ComplexBlockEntity::new, COMPLEX_BLOCK.get()).build(null));

    public static void init(IEventBus modEventBus) {
        BLOCKS.register(modEventBus);
        ITEMS.register(modEventBus);
        BLOCK_ENTITIES.register(modEventBus);
    }

    static void addCreative(BuildCreativeModeTabContentsEvent event) {
        if (event.getTabKey() == CreativeModeTabs.BUILDING_BLOCKS) {
            event.accept(SIMPLE_BLOCK_ITEM);
            event.accept(COMPLEX_BLOCK_ITEM);
        }
    }
}
```

## Simple block

Let's first discuss the simple block. This is a block that doesn't have a block entity but it
does have some special features. Let's look at the code first. In the constructor
we define a block with a strength of 3.5 (that influences how long it takes for a pickaxe
to actually break the block), we require the correct tool for drops and we enable random ticks.

Note: the tool that is required to harvest this is defined with tags. More on that later in this
tutorial.

Because we specified random ticks we need to override the `randomTick` method. This method is
called every random tick. In this case we send some smoke particles at the top of the block.

Finally we override the `use` method. This method is called when the player right clicks on
the block. In this case we check if we are on the client side. If so we explode the block
and return `InteractionResult.SUCCESS` to indicate that we handled the interaction. If we
are on the server side we return `InteractionResult.PASS` to indicate that we didn't handle
the interaction.

```java
public class SimpleBlock extends Block {

    public SimpleBlock() {
        // Let our block behave like a metal block
        super(Properties.of()
                .strength(3.5F)
                .requiresCorrectToolForDrops()
                .sound(SoundType.METAL).randomTicks());
    }

    @Override
    public void randomTick(BlockState state, ServerLevel level, BlockPos pos, RandomSource random) {
        level.sendParticles(ParticleTypes.SMOKE, pos.getX() + .5, pos.getY() + 1.5, pos.getZ() + .5, 10, 0, 0, 0, 0.15);
    }

    @Override
    public InteractionResult use(BlockState state, Level level, BlockPos pos, Player player, InteractionHand hand, BlockHitResult result) {
        if (level.isClientSide) {
            level.explode(null, pos.getX() + .5, pos.getY() + .5, pos.getZ() + .5, 2f, false, Level.ExplosionInteraction.MOB);
            return InteractionResult.SUCCESS;
        }
        return InteractionResult.PASS;
    }
}
```

That's all there is to it. Later when we talk about data generation we will show how we define
the model, the loot table, a recipe and the tags for this block.

## Complex block

The complex block is a block that has a block entity. The block entity is used to store one item
and also to render a fancy effect. Let's first look at the block class.

### The block class

The constructor is similar to the simple block.

Because we have an associated block entity with our block we need to implement the `EntityBlock`
interface. This interface has two methods that we need to implement. The first method is
`newBlockEntity`. This method is called when the block is placed in the world. It is used to
create the block entity. The second method is `getTicker`. This method is called when the block
entity is created. It is used to create a `BlockEntityTicker` that can be used to perform
certain actions every tick. In this case we return `null` for the client side because we don't
need a ticker there. On the server side we return a ticker that will delegate to the block
entity. By doing it like this we know that our block will only tick on the server side.

```java
public class ComplexBlock extends Block implements EntityBlock {

    public ComplexBlock() {
        // Let our block behave like a metal block
        super(BlockBehaviour.Properties.of()
                .strength(3.5F)
                .requiresCorrectToolForDrops()
                .sound(SoundType.METAL));
    }

    // Our block has an associated block entity. This method from EntityBlock is used to create that block entity
    @Nullable
    @Override
    public BlockEntity newBlockEntity(BlockPos pos, BlockState state) {
        return new ComplexBlockEntity(pos, state);
    }

    // This method is used to create a BlockEntityTicker for our block entity. This ticker can be used to perform certain actions every tick
    @Nullable
    @Override
    public <T extends BlockEntity> BlockEntityTicker<T> getTicker(Level level, BlockState state, BlockEntityType<T> type) {
        if (level.isClientSide) {
            // We don't have anything to do on the client side
            return null;
        } else {
            // Server side we delegate ticking to our block entity
            return (lvl, pos, st, blockEntity) -> {
                if (blockEntity instanceof ComplexBlockEntity be) {
                    be.tickServer();
                }
            };
        }
    }
}
```

### The Block Entity class

The block entity class is where the magic happens. We are going to go over this code in parts. First
start with a few constants. We define a tag name for the items that we store in the block entity (more
on that later). We also define the number of slots that we have and the index of the slot that we use.
This block will have an inventory of only one slot.

#### Capabilities

To represent our items we use a **capability**. Capabilities are a way to attach additional data to an
object. In this case we attach an inventory to our block entity. Capabilities can also be
attached to other objects like entities, itemstacks, chunks, etc. By using capabilities we can
ensure that our block will work correctly with other mods that also use capabilities.

The capability that we use in this block is the `ITEM_HANDLER` capability. This capability is
used to represent an inventory. We use the `LazyOptional` class to create a lazy reference to
the capability. By using this you can delay the actual creation of the capability instance
until it is actually needed. This is useful because the capability might not be needed at all.
In this tutorial we are guaranteed to always need the items so that's why we do a direct
declaration of the item stack handler (`items` variable). This variable allows us to access
the items in a more optimal and convenient way.

It's important to note that we need to invalidate the capability when the block entity is
destroyed. This is done in the `invalidateCaps` method. In this method we invalidate the capability so
that mods that kept a reference to this capability can get notified of this.

For our item handler we use the standard Forge item stack handler (`ItemStackHandler`).
This class is a conveniant way to store a list of items. It also has methods to serialize
and desirealize the items (we will use that later). We override the `onContentsChanged` method to mark the block entity as
changed when the contents of the item handler change. This is needed so that the block entity
will be saved to disk.

Because we also need to tell the client that the block entity has changed we also send a block
update to the client. Later on the client we will listen for this and update the block entity.

Finally we override the `getCapability` method to return our item handler capability. This
method is used by other mods to get access to the capability. This method has an optional
parameter that allows you to specify a direction. This is used to get the capability from
a specific side. In our case we don't care about the side so we just return the capability
without looking at the side.

```java
public class ComplexBlockEntity extends BlockEntity {

    public static final String ITEMS_TAG = "Inventory";

    public static int SLOT_COUNT = 1;
    public static int SLOT = 0;

    private final ItemStackHandler items = createItemHandler();
    private final LazyOptional<IItemHandler> itemHandler = LazyOptional.of(() -> items);

    public ComplexBlockEntity(BlockPos pos, BlockState state) {
        super(COMPLEX_BLOCK_ENTITY.get(), pos, state);
    }

    @Override
    public void invalidateCaps() {
        super.invalidateCaps();
        itemHandler.invalidate();
    }

    @Nonnull
    private ItemStackHandler createItemHandler() {
        return new ItemStackHandler(SLOT_COUNT) {
            @Override
            protected void onContentsChanged(int slot) {
                setChanged();
                level.sendBlockUpdated(worldPosition, getBlockState(), getBlockState(), Block.UPDATE_ALL);
            }
        };
    }

    @NotNull
    @Override
    public <T> LazyOptional<T> getCapability(@NotNull Capability<T> cap, @Nullable Direction side) {
        if (cap == ForgeCapabilities.ITEM_HANDLER) {
            return itemHandler.cast();
        } else {
            return super.getCapability(cap, side);
        }
    }
```

#### Saving and Loading

Now some more code. This code is responsible for saving and loading the block entity. We seperate
the saving and loading of the inventory itself to a separate method since we will need that for
server to client synchronization as well.

NBT (represented by the `CompoundTag` class) is a way to store data to disk. It's a hierarchical
structure that can contain other tags. The `CompoundTag` class is basically a map of string keys to tags.
Tags can be of different types like `StringTag`, `IntTag`, `ListTag`, etc.

:::info Tip!
A common misconception is that blocks contain NBT in memory. This is not true. NBT is a serialization
format that is used to store data to disk. In memory a block entity is just a class with fields.
The only exception where NBT is used in memory is with itemstacks.
:::

:::danger Warning
Everytime you make a change to the block entity you need to call `setChanged` to mark the block
entity as changed. If you don't do this your changes will not be saved to disk and you will lose
them when the world is saved and reloaded.
:::

```java
    @Override
    protected void saveAdditional(CompoundTag tag) {
        super.saveAdditional(tag);
        saveClientData(tag);
    }

    private void saveClientData(CompoundTag tag) {
        tag.put(ITEMS_TAG, items.serializeNBT());
    }

    @Override
    public void load(CompoundTag tag) {
        super.load(tag);
        loadClientData(tag);
    }

    private void loadClientData(CompoundTag tag) {
        if (tag.contains(ITEMS_TAG)) {
            items.deserializeNBT(tag.getCompound(ITEMS_TAG));
        }
    }
```

#### Server to Client synchronization

Because we want to synchronize the block entity from the server to the client (for rendering) we need to
override a few methods. The `getUpdateTag` and `handleUpdateTag` methods are used whenever a
new chunk is loaded. `getUpdateTag` is called server side and creates a tag that is sent to the client.
It's important to keep this tag as small as possible (network overhead) so we only send the data that
is really needed. That's why we made the `saveClientData` method.

The `getUpdatePacket` and `onDataPacket` methods are used whenever a block update happens. This is
used to notify the client that a block has changed. This is used for example when a blockstate changes
or when a block is explicitly marked as changed by the server. In our case we use this to notify the
client that the inventory has changed. We use the `ClientboundBlockEntityDataPacket` class to create
a packet that contains the data we want to send to the client. We use the `saveClientData` method
to save the data to the packet. On the client side we use the `onDataPacket` method to load the data
from the packet. We use the `loadClientData` method to load the data from the packet.
Note that ClientboundBlockEntityDataPacket.create(this) actually uses `getUpdateTag` to create the packet.

:::info Note!
Be aware that even in single player we use networking to communicate information from server to
client and vice versa.
:::

```java
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
        // This is called client side
        CompoundTag tag = pkt.getTag();
        // This will call loadClientData()
        if (tag != null) {
            handleUpdateTag(tag);
        }
    }
```

#### Block Entity Logic

Finally we actually need to give some logic to our block entity. In this case we want to
increase the durability of the item in the inventory every second. If the durability reaches
maximum we eject the item from the block entity.

We use `level.getGameTime()` to get the current game time. This is a counter that is increased
every tick. We use the modulo operator (`%`) to check if the current game time is a multiple
of 20 (20 ticks = 1 second). If it is we get the itemstack from the inventory and check if it
is damageable. If it is we decrease the damage value by 1. If the damage value reaches 0 we
eject the item from the block entity.

Note that `tickServer` is called from our block (ticker) class.

```java
    public void tickServer() {
        if (level.getGameTime() % 20 == 0) {
            ItemStack stack = items.getStackInSlot(SLOT);
            if (!stack.isEmpty()) {
                if (stack.isDamageableItem()) {
                    // Increase durability of item
                    int value = stack.getDamageValue();
                    if (value > 0) {
                        stack.setDamageValue(value - 1);
                    } else {
                        ejectItem();
                    }
                } else {
                    ejectItem();
                }
            }
        }
    }

    private void ejectItem() {
        BlockPos pos = worldPosition.relative(Direction.UP);
        Block.popResource(level, pos, items.extractItem(SLOT, 1, false));
    }
```
