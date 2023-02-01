---
sidebar_position: 2
---

# Episode 2

## Links

* Video: [Items, smelting, powergenerator, capabilities, gui](https://www.youtube.com/watch?v=tv6oFjC8sq8&ab_channel=JorritTyberghein)
* [Back to 1.18 Tutorial Index](./1.18.md)
* [Tutorial GitHub](https://github.com/McJty/TutorialV3)

## Introduction

In this tutorial we start by adding the raw chunk and ingot items as well as smelting recipes for them.
After that we will cover a more advanced power generator.

### Adding the raw chunk and ingot

We want to handle the ore the same way as Vanilla.
That means that breaking the ore block should give us raw chunks and these can be melted to ingots:

Add the following things to Registration:

```java
public static final RegistryObject<Item> RAW_MYSTERIOUS_CHUNK = ITEMS.register("raw_mysterious_chunk", () -> new Item(ITEM_PROPERTIES));
public static final RegistryObject<Item> MYSTERIOUS_INGOT = ITEMS.register("mysterious_ingot", () -> new Item(ITEM_PROPERTIES));

public static final TagKey<Block> MYSTERIOUS_ORE = TagKey.create(Registry.BLOCK_REGISTRY, new ResourceLocation(TutorialV3.MODID, "mysterious_ore"));
public static final TagKey<Item> MYSTERIOUS_ORE_ITEM = TagKey.create(Registry.ITEM_REGISTRY, new ResourceLocation(TutorialV3.MODID, "mysterious_ore"));
```

The first two lines are just normal items for our raw chunk and ingot.
The two others are tags that we will use to group the four different variants of our ore into a single tag.

Then we need to extend our datagenerators:

```java
public class TutItemModels extends ItemModelProvider {
    ...
    singleTexture(Registration.RAW_MYSTERIOUS_CHUNK.getId().getPath(), mcLoc("item/generated"), "layer0", modLoc("item/raw_mysterious_chunk"));
    singleTexture(Registration.MYSTERIOUS_INGOT.getId().getPath(), mcLoc("item/generated"), "layer0", modLoc("item/mysterious_ingot"));
    ...
}


public class TutBlockTags extends BlockTagsProvider {
    ...
    tag(Registration.MYSTERIOUS_ORE)
        .add(Registration.MYSTERIOUS_ORE_OVERWORLD.get())
        .add(Registration.MYSTERIOUS_ORE_NETHER.get())
        .add(Registration.MYSTERIOUS_ORE_END.get())
        .add(Registration.MYSTERIOUS_ORE_DEEPSLATE.get());
    ...
}


public class TutItemTags extends ItemTagsProvider {
    ...
    tag(Registration.MYSTERIOUS_ORE_ITEM)
        .add(Registration.MYSTERIOUS_ORE_OVERWORLD_ITEM.get())
        .add(Registration.MYSTERIOUS_ORE_NETHER_ITEM.get())
        .add(Registration.MYSTERIOUS_ORE_END_ITEM.get())
        .add(Registration.MYSTERIOUS_ORE_DEEPSLATE_ITEM.get());
    ...
}


public class TutLanguageProvider extends LanguageProvider {
    ...
    add(Registration.RAW_MYSTERIOUS_CHUNK.get(), "Mysterious Raw Chunk");
    add(Registration.MYSTERIOUS_INGOT.get(), "Mysterious Ingot");
    ...
}


public class TutRecipes extends RecipeProvider {
    ...
    SimpleCookingRecipeBuilder.smelting(Ingredient.of(Registration.MYSTERIOUS_ORE_ITEM),
    Registration.MYSTERIOUS_INGOT.get(), 1.0f, 100)
        .unlockedBy("has_ore", has(Registration.MYSTERIOUS_ORE_ITEM))
        .save(consumer, "mysterious_ingot1");
    SimpleCookingRecipeBuilder.smelting(Ingredient.of(Registration.RAW_MYSTERIOUS_CHUNK.get()),
    Registration.MYSTERIOUS_INGOT.get(), 0.0f, 100)
        .unlockedBy("has_chunk", has(Registration.RAW_MYSTERIOUS_CHUNK.get()))
        .save(consumer, "mysterious_ingot2");
    ...
}


public class TutLootTables extends BaseLootTableProvider {
    ...
    lootTables.put(Registration.MYSTERIOUS_ORE_OVERWORLD.get(), createSilkTouchTable("mysterious_ore_overworld", Registration.MYSTERIOUS_ORE_OVERWORLD.get(), Registration.RAW_MYSTERIOUS_CHUNK.get(), 1, 3));
    lootTables.put(Registration.MYSTERIOUS_ORE_NETHER.get(), createSilkTouchTable("mysterious_ore_nether", Registration.MYSTERIOUS_ORE_NETHER.get(), Registration.RAW_MYSTERIOUS_CHUNK.get(), 1, 3));
    lootTables.put(Registration.MYSTERIOUS_ORE_END.get(), createSilkTouchTable("mysterious_ore_end", Registration.MYSTERIOUS_ORE_END.get(), Registration.RAW_MYSTERIOUS_CHUNK.get(), 1, 3));
    lootTables.put(Registration.MYSTERIOUS_ORE_DEEPSLATE.get(), createSilkTouchTable("mysterious_ore_deepslate", Registration.MYSTERIOUS_ORE_DEEPSLATE.get(), Registration.RAW_MYSTERIOUS_CHUNK.get(), 1, 3));
    ...
}

```
Run 'runData' again to generate the needed files. Note how our recipe is using the tags to be able to work with the four different variants easily.

Note: `mcLoc` is a shortcut for `new ResourceLocation("minecraft", ...)` while modLoc is a shortcut for `new ResourceLocation(MODID, ...)`.
ResourceLocation is the global key that is used in Minecraft to uniquely identify objects as well as assets.

For the loot table we use a `createSilkTouchTable()` method that is defined in the `BaseLootTableProvider` (see GitHub).

### The PowerGenerator

The power generator is the block on the right of this image. It's currently generating power which is why it is red and also has a star rendered on top:

![image](https://i.imgur.com/rNHnnjH.png)

First add the following to the Registration class:

```java
private static final DeferredRegister<BlockEntityType<?>> BLOCK_ENTITIES = DeferredRegister.create(ForgeRegistries.BLOCK_ENTITIES, MODID);
private static final DeferredRegister<MenuType<?>> CONTAINERS = DeferredRegister.create(ForgeRegistries.CONTAINERS, MODID);

public static void init() {
    IEventBus bus = FMLJavaModLoadingContext.get().getModEventBus();
    BLOCKS.register(bus);
    ITEMS.register(bus);
    BLOCK_ENTITIES.register(bus);
    CONTAINERS.register(bus);
}

public static final RegistryObject<PowergenBlock> POWERGEN = BLOCKS.register("powergen", PowergenBlock::new);
public static final RegistryObject<Item> POWERGEN_ITEM = fromBlock(POWERGEN);
public static final RegistryObject<BlockEntityType<PowergenBE>> POWERGEN_BE = BLOCK_ENTITIES.register("powergen", () -> BlockEntityType.Builder.of(PowergenBE::new, POWERGEN.get()).build(null));
public static final RegistryObject<MenuType<PowergenContainer>> POWERGEN_CONTAINER = CONTAINERS.register("powergen", () -> IForgeMenuType.create((windowId, inv, data) -> new PowergenContainer(windowId, data.readBlockPos(), inv, inv.player)));
```

Basically our power generator will be more than just a block and an item.
We also need a block entity.
This will be responsible for holding the inventory (the items that we want to burn for power) as well as the actual power that is being generated.
In addition, it will also need to 'tick' (a tick is 1/20 second).
It is during this tick that our block entity can do something.

We also need a container.
The container acts like a bridge between the server and the client.
When the user opens the gui for a certain block this actually happens on the server side.
A container instance for the block will be made, and it will set up communication to the client.
At that point the client will also open the same container and together with that the associated screen.
This will be explained more in the section about containers.

### The Powergen Block

The first thing we want to create is the actual power generator block. A few notes about this block:

* We implement EntityBlock. This is needed because our block is coupled to a Block Entity. In this interface are a few methods. One is responsible for actually creating the block entity and the other one we will use to create a 'ticker'. This is a small object that is responsible for delegating ticks to our block entity so that our power generator can do something. We only do this server side. Client side we don't need a ticker.
* Our power generator block can have two states: powered or not powered. We use the standard vanilla POWERED property for that and add it to our blockstate.
* We make the occlusion shape of our block slightly smaller so that the block will not hide faces of adjacent other blocks (which would create 'holes' in the world)
* We use translatable messages for our tooltip (appendHoverText)

The 'use' method requires a bit more explanation.
Basically use is called on both sides (server and client) whenever the player right-clicks our block.
We want the user interface to open whenever the player does that. Earlier we explained that opening a gui is typically done by opening the container on the server.
That's why we only do something in 'use' when we are on the server.

We use NetworkHooks.openGui() which is a convenience function made by forge that will open the container for us and also initialize an extra packet that is sent to the client for additional data.
In this case that packet is used to send over the position of our block entity so that the client also knows for what block entity the container is being opened.

```java
public class PowergenBlock extends Block implements EntityBlock {

    public static final String MESSAGE_POWERGEN = "message.powergen";
    public static final String SCREEN_TUTORIAL_POWERGEN = "screen.tutorial.powergen";

    private static final VoxelShape RENDER_SHAPE = Shapes.box(0.1, 0.1, 0.1, 0.9, 0.9, 0.9);

    public PowergenBlock() {
        super(Properties.of(Material.METAL)
                .sound(SoundType.METAL)
                .strength(2.0f)
                .lightLevel(state -> state.getValue(BlockStateProperties.POWERED) ? 14 : 0)
                .requiresCorrectToolForDrops()
        );
    }

    @SuppressWarnings("deprecation")
    @Override
    public VoxelShape getOcclusionShape(BlockState state, BlockGetter reader, BlockPos pos) {
        return RENDER_SHAPE;
    }


    @Override
    public void appendHoverText(ItemStack stack, @Nullable BlockGetter reader, List<Component> list, TooltipFlag flags) {
        list.add(new TranslatableComponent(MESSAGE_POWERGEN, Integer.toString(PowergenBE.POWERGEN_GENERATE))
                .withStyle(ChatFormatting.BLUE));
    }

    @Nullable
    @Override
    public BlockEntity newBlockEntity(BlockPos blockPos, BlockState blockState) {
        return new PowergenBE(blockPos, blockState);
    }

    @Nullable
    @Override
    public <T extends BlockEntity> BlockEntityTicker<T> getTicker(Level level, BlockState state, BlockEntityType<T> type) {
        if (level.isClientSide()) {
            return null;
        }
        return (lvl, pos, blockState, t) -> {
            if (t instanceof PowergenBE tile) {
                tile.tickServer();
            }
        };
    }

    @Override
    protected void createBlockStateDefinition(StateDefinition.Builder<Block, BlockState> builder) {
        super.createBlockStateDefinition(builder);
        builder.add(BlockStateProperties.POWERED);
    }

    @Nullable
    @Override
    public BlockState getStateForPlacement(BlockPlaceContext context) {
        return super.getStateForPlacement(context).setValue(BlockStateProperties.POWERED, false);
    }

    @SuppressWarnings("deprecation")
    @Override
    public InteractionResult use(BlockState state, Level level, BlockPos pos, Player player, InteractionHand hand, BlockHitResult trace) {
        if (!level.isClientSide) {
            BlockEntity be = level.getBlockEntity(pos);
            if (be instanceof PowergenBE) {
                MenuProvider containerProvider = new MenuProvider() {
                    @Override
                    public Component getDisplayName() {
                        return new TranslatableComponent(SCREEN_TUTORIAL_POWERGEN);
                    }

                    @Override
                    public AbstractContainerMenu createMenu(int windowId, Inventory playerInventory, Player playerEntity) {
                        return new PowergenContainer(windowId, pos, playerInventory, playerEntity);
                    }
                };
                NetworkHooks.openGui((ServerPlayer) player, containerProvider, be.getBlockPos());
            } else {
                throw new IllegalStateException("Our named container provider is missing!");
            }
        }
        return InteractionResult.SUCCESS;
    }
}
```

:::info 1.19
Use `Component.translatable()` instead of `new TranslatableComponent()`
:::

### The Powergen Block Entity

The powergenerator Block Entity is responsible for actually generating power from fuel items. In order to do that it needs an inventory (to hold the items to generate power from) and power. It also needs to tick so that it can actually do the processing required to generate power and also to send out power to adjacent blocks.

A few notes:

* Forge Energy is a 'push' system. That means that power generators and power cells will always push out power to adjacent blocks that need it. Blocks should never extract power. That will break this assumption and cause many generators to fail working properly.
* To hold the inventory and power we use a system designed by Forge called ''capabilities''. A capability is basically data that you can attach to some minecraft objects (like block entities, entities, chunks, ...). In this tutorial we use capabilities that are predefined by Forge itself (for items and power) but in future episodes you will learn how to make your own capabilities. Capabilities are designed as a way to ensure that objects from different mods can communicate with each other (and with vanilla). Forge has patched all vanilla blocks to also support capabilities.
* As a consequence of this. NEVER directly use the vanilla Inventory class. Always use capabilities (IItemHandler).
* When using capabilities in a Block Entity it is good practice to store a normal reference to your capability object in a regular pointer (for easier access inside your own block entity) and a separate LazyOptional to hold the data for getCapability(). Never allocate your LazyOptional inside getCapability() or use a local variable there!
* It's a good idea to invalidate your capabilities in setRemoved()
* Override 'load' and 'saveAdditional' to load and save all data that you want to remember in your block entity. Make sure to call 'setChanged()' on your block entity whenever something changes that requires saving.
* Our item handler and energy storage implementations make sure that setChanged() is called on the block entity whenever there is a change in the items or energy.

Let's explain tickServer() a bit in more detail. It has the following parts:
* Part One: if counter is greater than zero it means we are busy burning a fuel item and generating power.
* Part Two: if the counter reaches zero then our fuel item is consumed. We then check if our only input slot contains a burnable item, and we get the actual burntime from it using ForgeHooks.getBurnTime. We extract the fuel item and initialize our counter to that time. Next tick we will start generating power from this.
* Part Three: if we have power available then we need to distribute it to all adjacent blocks that need power. To do that we will iterate over all six sides and check if there is a block there that implements Forge Energy. Because getCapability() returns a LazyOptional we need to call map() to actually process it (functional). The AtomicInteger is needed because a normal integer can't be modified from inside a lambda.

```java
public class PowergenBE extends BlockEntity {

    public static final int POWERGEN_CAPACITY = 50000; // Max capacity
    public static final int POWERGEN_GENERATE = 60;    // Generation per tick
    public static final int POWERGEN_SEND = 200;       // Power to send out per tick

    // Never create lazy optionals in getCapability. Always place them as fields in the tile entity:
    private final ItemStackHandler itemHandler = createHandler();
    private final LazyOptional<IItemHandler> handler = LazyOptional.of(() -> itemHandler);

    private final CustomEnergyStorage energyStorage = createEnergy();
    private final LazyOptional<IEnergyStorage> energy = LazyOptional.of(() -> energyStorage);

    private int counter;

    public PowergenBE(BlockPos pos, BlockState state) {
        super(Registration.POWERGEN_BE.get(), pos, state);
    }


    @Override
    public void setRemoved() {
        super.setRemoved();
        handler.invalidate();
        energy.invalidate();
    }

    public void tickServer() {
        if (counter > 0) {
            energyStorage.addEnergy(POWERGEN_GENERATE);
            counter--;
            setChanged();
        }

        if (counter <= 0) {
            ItemStack stack = itemHandler.getStackInSlot(0);
            int burnTime = ForgeHooks.getBurnTime(stack, RecipeType.SMELTING);
            if (burnTime > 0) {
                itemHandler.extractItem(0, 1, false);
                counter = burnTime;
                setChanged();
            }
        }

        BlockState blockState = level.getBlockState(worldPosition);
        if (blockState.getValue(BlockStateProperties.POWERED) != counter > 0) {
            level.setBlock(worldPosition, blockState.setValue(BlockStateProperties.POWERED, counter > 0),
                    Block.UPDATE_ALL);
        }

        sendOutPower();
    }

    private void sendOutPower() {
        AtomicInteger capacity = new AtomicInteger(energyStorage.getEnergyStored());
        if (capacity.get() > 0) {
            for (Direction direction : Direction.values()) {
                BlockEntity be = level.getBlockEntity(worldPosition.relative(direction));
                if (be != null) {
                    boolean doContinue = be.getCapability(CapabilityEnergy.ENERGY, direction.getOpposite()).map(handler -> {
                                if (handler.canReceive()) {
                                    int received = handler.receiveEnergy(Math.min(capacity.get(), POWERGEN_SEND), false);
                                    capacity.addAndGet(-received);
                                    energyStorage.consumeEnergy(received);
                                    setChanged();
                                    return capacity.get() > 0;
                                } else {
                                    return true;
                                }
                            }
                    ).orElse(true);
                    if (!doContinue) {
                        return;
                    }
                }
            }
        }
    }

    @Override
    public void load(CompoundTag tag) {
        if (tag.contains("Inventory")) {
            itemHandler.deserializeNBT(tag.getCompound("Inventory"));
        }
        if (tag.contains("Energy")) {
            energyStorage.deserializeNBT(tag.get("Energy"));
        }
        if (tag.contains("Info")) {
            counter = tag.getCompound("Info").getInt("Counter");
        }
        super.load(tag);
    }

    @Override
    public void saveAdditional(CompoundTag tag) {
        tag.put("Inventory", itemHandler.serializeNBT());
        tag.put("Energy", energyStorage.serializeNBT());

        CompoundTag infoTag = new CompoundTag();
        infoTag.putInt("Counter", counter);
        tag.put("Info", infoTag);
    }

    private ItemStackHandler createHandler() {
        return new ItemStackHandler(1) {

            @Override
            protected void onContentsChanged(int slot) {
                // To make sure the TE persists when the chunk is saved later we need to
                // mark it dirty every time the item handler changes
                setChanged();
            }

            @Override
            public boolean isItemValid(int slot, @Nonnull ItemStack stack) {
                return ForgeHooks.getBurnTime(stack, RecipeType.SMELTING) > 0;
            }

            @Nonnull
            @Override
            public ItemStack insertItem(int slot, @Nonnull ItemStack stack, boolean simulate) {
                if (ForgeHooks.getBurnTime(stack, RecipeType.SMELTING) <= 0) {
                    return stack;
                }
                return super.insertItem(slot, stack, simulate);
            }
        };
    }

    private CustomEnergyStorage createEnergy() {
        return new CustomEnergyStorage(POWERGEN_CAPACITY, 0) {
            @Override
            protected void onEnergyChanged() {
                setChanged();
            }
        };
    }

    @Nonnull
    @Override
    public <T> LazyOptional<T> getCapability(@Nonnull Capability<T> cap, @Nullable Direction side) {
        if (cap == CapabilityItemHandler.ITEM_HANDLER_CAPABILITY) {
            return handler.cast();
        }
        if (cap == CapabilityEnergy.ENERGY) {
            return energy.cast();
        }
        return super.getCapability(cap, side);
    }
}
```

### The Powergen Block Container 

As said before the Container is responsible for communicating between the server and the client when the player has opened a gui. It does this by adding 'slots' for every item that you want to be synchronized. Typically, this is all the items of our block entity (the single fuel item slot) and the items of the player inventory.

Some notes:

* This is one case where you get an Inventory instance. To use this properly you can use the InvWrapper forge class which will convert it to an IItemHandler.
* In addition to the item slots we also want to communicate the current power from the server to the client so that we can display that in the gui. Minecraft supports sending over 16-bit integers for this purpose. Our power is 32-bit however, so we need to split it in two data slots.
* quickMoveStack() is used whenever the player shift-clicks an item in our gui. In this method we need to decide what to do whenever a certain item in a certain slot is shift-clicked. In this implementation we make sure that fuel items get put in the fuel slot.

:::danger Warning
Don't forget that integer data slots only hold 16-bits of data!
:::

```java
public class PowergenContainer extends AbstractContainerMenu {

    private BlockEntity blockEntity;
    private Player playerEntity;
    private IItemHandler playerInventory;

    public PowergenContainer(int windowId, BlockPos pos, Inventory playerInventory, Player player) {
        super(Registration.POWERGEN_CONTAINER.get(), windowId);
        blockEntity = player.getCommandSenderWorld().getBlockEntity(pos);
        this.playerEntity = player;
        this.playerInventory = new InvWrapper(playerInventory);

        if (blockEntity != null) {
            blockEntity.getCapability(CapabilityItemHandler.ITEM_HANDLER_CAPABILITY).ifPresent(h -> {
                addSlot(new SlotItemHandler(h, 0, 64, 24));
            });
        }
        layoutPlayerInventorySlots(10, 70);
        trackPower();
    }

    // Setup syncing of power from server to client so that the GUI can show the amount of power in the block
    private void trackPower() {
        // Unfortunatelly on a dedicated server ints are actually truncated to short so we need
        // to split our integer here (split our 32 bit integer into two 16 bit integers)
        addDataSlot(new DataSlot() {
            @Override
            public int get() {
                return getEnergy() & 0xffff;
            }

            @Override
            public void set(int value) {
                blockEntity.getCapability(CapabilityEnergy.ENERGY).ifPresent(h -> {
                    int energyStored = h.getEnergyStored() & 0xffff0000;
                    ((CustomEnergyStorage)h).setEnergy(energyStored + (value & 0xffff));
                });
            }
        });
        addDataSlot(new DataSlot() {
            @Override
            public int get() {
                return (getEnergy() >> 16) & 0xffff;
            }

            @Override
            public void set(int value) {
                blockEntity.getCapability(CapabilityEnergy.ENERGY).ifPresent(h -> {
                    int energyStored = h.getEnergyStored() & 0x0000ffff;
                    ((CustomEnergyStorage)h).setEnergy(energyStored | (value << 16));
                });
            }
        });
    }

    public int getEnergy() {
        return blockEntity.getCapability(CapabilityEnergy.ENERGY).map(IEnergyStorage::getEnergyStored).orElse(0);
    }

    @Override
    public boolean stillValid(Player playerIn) {
        return stillValid(ContainerLevelAccess.create(blockEntity.getLevel(), blockEntity.getBlockPos()), playerEntity, Registration.POWERGEN.get());
    }

    @Override
    public ItemStack quickMoveStack(Player playerIn, int index) {
        ItemStack itemstack = ItemStack.EMPTY;
        Slot slot = this.slots.get(index);
        if (slot != null && slot.hasItem()) {
            ItemStack stack = slot.getItem();
            itemstack = stack.copy();
            if (index == 0) {
                if (!this.moveItemStackTo(stack, 1, 37, true)) {
                    return ItemStack.EMPTY;
                }
                slot.onQuickCraft(stack, itemstack);
            } else {
                if (ForgeHooks.getBurnTime(stack, RecipeType.SMELTING) > 0) {
                    if (!this.moveItemStackTo(stack, 0, 1, false)) {
                        return ItemStack.EMPTY;
                    }
                } else if (index < 28) {
                    if (!this.moveItemStackTo(stack, 28, 37, false)) {
                        return ItemStack.EMPTY;
                    }
                } else if (index < 37 && !this.moveItemStackTo(stack, 1, 28, false)) {
                    return ItemStack.EMPTY;
                }
            }

            if (stack.isEmpty()) {
                slot.set(ItemStack.EMPTY);
            } else {
                slot.setChanged();
            }

            if (stack.getCount() == itemstack.getCount()) {
                return ItemStack.EMPTY;
            }

            slot.onTake(playerIn, stack);
        }

        return itemstack;
    }

    private int addSlotRange(IItemHandler handler, int index, int x, int y, int amount, int dx) {
        for (int i = 0 ; i < amount ; i++) {
            addSlot(new SlotItemHandler(handler, index, x, y));
            x += dx;
            index++;
        }
        return index;
    }

    private int addSlotBox(IItemHandler handler, int index, int x, int y, int horAmount, int dx, int verAmount, int dy) {
        for (int j = 0 ; j < verAmount ; j++) {
            index = addSlotRange(handler, index, x, y, horAmount, dx);
            y += dy;
        }
        return index;
    }

    private void layoutPlayerInventorySlots(int leftCol, int topRow) {
        // Player inventory
        addSlotBox(playerInventory, 9, leftCol, topRow, 9, 18, 3, 18);

        // Hotbar
        topRow += 58;
        addSlotRange(playerInventory, 0, leftCol, topRow, 9, 18);
    }
}
```

### The Powergen Screen 

When the user right-clicks the power generator the following gui will open:

![image](https://i.imgur.com/mCeqOEQ.png)

Here is the code for this screen.
The GUI represents the background of our user interface.
There are various methods to override depending on the time when you want to render something.
In `renderLabels()` we actually render the current energy which is in the container.
Like explained earlier our container implementation makes sure that the current energy level is correctly synced from server to client for all clients that have an open container:

```java
public class PowergenScreen extends AbstractContainerScreen<PowergenContainer> {

    private final ResourceLocation GUI = new ResourceLocation(TutorialV3.MODID, "textures/gui/powergen_gui.png");

    public PowergenScreen(PowergenContainer container, Inventory inv, Component name) {
        super(container, inv, name);
    }

    @Override
    public void render(PoseStack matrixStack, int mouseX, int mouseY, float partialTicks) {
        this.renderBackground(matrixStack);
        super.render(matrixStack, mouseX, mouseY, partialTicks);
        this.renderTooltip(matrixStack, mouseX, mouseY);
    }

    @Override
    protected void renderLabels(PoseStack matrixStack, int mouseX, int mouseY) {
        drawString(matrixStack, Minecraft.getInstance().font, "Energy: " + menu.getEnergy(), 10, 10, 0xffffff);
    }

    @Override
    protected void renderBg(PoseStack matrixStack, float partialTicks, int mouseX, int mouseY) {
        RenderSystem.setShaderTexture(0, GUI);
        int relX = (this.width - this.imageWidth) / 2;
        int relY = (this.height - this.imageHeight) / 2;
        this.blit(matrixStack, relX, relY, 0, 0, this.imageWidth, this.imageHeight);
    }
}
```

We also need to register this screen. For that purpose we have to attach our container to the screen on the client.
This is done by `MenuScreens.register` in `ClientSetup`.
Also note that we are setting the render layer for our power generator to `RenderType.translucent()`.
Render types will be explained more in depth in future tutorials but here we use the builtin render type to mark our object as being translucent.
That's required because our block has a transparent texture.

Note that we use `event.enqueueWork`.
This ensures that the code is run in the main thread.
`FMLCommonSetupEvent` and `FMLClientSetupEvent` can potentially run in parallel (on different threads).
However, many Vanilla structures are not thread-safe.
That means you should only access them from the main thread.
`event.enqueueWork()` ensures that's the case:

:::danger Warning
Don't forget `event.enqueueWork()` whenever you are registering something on a vanilla subsystem
:::

```java
public class ClientSetup {

    public static void init(FMLClientSetupEvent event) {
        event.enqueueWork(() -> {
            MenuScreens.register(Registration.POWERGEN_CONTAINER.get(), PowergenScreen::new);           // Attach our container to the screen
            ItemBlockRenderTypes.setRenderLayer(Registration.POWERGEN.get(), RenderType.translucent()); // Set the render type for our power generator to translucent
        });
    }
}
```
### Powergen Datageneration

Just like with the other blocks and items we need to add datagen.
Add the following lines to the various datagen classes:

```java
public class TutBlockStates extends BlockStateProvider {

    @Override
    protected void registerStatesAndModels() {
        registerPowergen();
        ...
    }

    private void registerPowergen() {
        BlockModelBuilder frame = models().getBuilder("block/powergen/main");
        frame.parent(models().getExistingFile(mcLoc("cube")));

        floatingCube(frame, 0f, 0f, 0f, 1f, 16f, 1f);
        floatingCube(frame, 15f, 0f, 0f, 16f, 16f, 1f);
        floatingCube(frame, 0f, 0f, 15f, 1f, 16f, 16f);
        floatingCube(frame, 15f, 0f, 15f, 16f, 16f, 16f);

        floatingCube(frame, 1f, 0f, 0f, 15f, 1f, 1f);
        floatingCube(frame, 1f, 15f, 0f, 15f, 16f, 1f);
        floatingCube(frame, 1f, 0f, 15f, 15f, 1f, 16f);
        floatingCube(frame, 1f, 15f, 15f, 15f, 16f, 16f);

        floatingCube(frame, 0f, 0f, 1f, 1f, 1f, 15f);
        floatingCube(frame, 15f, 0f, 1f, 16f, 1f, 15f);
        floatingCube(frame, 0f, 15f, 1f, 1f, 16f, 15f);
        floatingCube(frame, 15f, 15f, 1f, 16f, 16f, 15f);

        floatingCube(frame, 1f, 1f, 1f, 15f, 15f, 15f);

        frame.texture("window", modLoc("block/powergen_window"));
        frame.texture("particle", modLoc("block/powergen_off"));

        createPowergenModel(Registration.POWERGEN.get(), frame);
    }

    private void floatingCube(BlockModelBuilder builder, float fx, float fy, float fz, float tx, float ty, float tz) {
        builder.element()
                .from(fx, fy, fz)
                .to(tx, ty, tz)
                .allFaces((direction, faceBuilder) -> faceBuilder.texture("#window"))
                .end();
    }

    private void createPowergenModel(Block block, BlockModelBuilder frame) {
        BlockModelBuilder singleOff = models().getBuilder("block/powergen/singleoff")
                .element().from(3, 3, 3).to(13, 13, 13).face(Direction.DOWN).texture("#single").end().end()
                .texture("single", modLoc("block/powergen_off"));
        BlockModelBuilder singleOn = models().getBuilder("block/powergen/singleon")
                .element().from(3, 3, 3).to(13, 13, 13).face(Direction.DOWN).texture("#single").end().end()
                .texture("single", modLoc("block/powergen_on"));

        MultiPartBlockStateBuilder bld = getMultipartBuilder(block);

        bld.part().modelFile(frame).addModel();

        BlockModelBuilder[] models = new BlockModelBuilder[] { singleOff, singleOn };
        for (int i = 0 ; i < 2 ; i++) {
            boolean powered = i == 1;
            bld.part().modelFile(models[i]).addModel().condition(BlockStateProperties.POWERED, powered);
            bld.part().modelFile(models[i]).rotationX(180).addModel().condition(BlockStateProperties.POWERED, powered);
            bld.part().modelFile(models[i]).rotationX(90).addModel().condition(BlockStateProperties.POWERED, powered);
            bld.part().modelFile(models[i]).rotationX(270).addModel().condition(BlockStateProperties.POWERED, powered);
            bld.part().modelFile(models[i]).rotationY(90).rotationX(90).addModel().condition(BlockStateProperties.POWERED, powered);
            bld.part().modelFile(models[i]).rotationY(270).rotationX(90).addModel().condition(BlockStateProperties.POWERED, powered);
        }
    }
}

public class TutItemModels extends ItemModelProvider {
    ...
    withExistingParent(Registration.POWERGEN_ITEM.get().getRegistryName().getPath(), modLoc("block/powergen/main"));
    ...
}


public class TutBlockTags extends BlockTagsProvider {
    ...
    tag(BlockTags.MINEABLE_WITH_PICKAXE)
        .add(Registration.POWERGEN.get())
        ...
    tag(BlockTags.NEEDS_IRON_TOOL)
        .add(Registration.POWERGEN.get())
        ...
    ...
}


public class TutLanguageProvider extends LanguageProvider {
    ...
    add(MESSAGE_POWERGEN, "Power generator generating %s per tick!");
    add(SCREEN_TUTORIAL_POWERGEN, "Power generator");
    add(Registration.POWERGEN.get(), "Power generator");
    ...
}



public class TutLootTables extends BaseLootTableProvider {
    ...
    lootTables.put(Registration.POWERGEN.get(), createStandardTable("powergen", Registration.POWERGEN.get(), Registration.POWERGEN_BE.get()));
    ...
}


public class TutRecipes extends RecipeProvider {
    ...
    ShapedRecipeBuilder.shaped(Registration.POWERGEN.get())
        .pattern("mmm")
        .pattern("x#x")
        .pattern("#x#")
        .define('x', Tags.Items.DUSTS_REDSTONE)
        .define('#', Tags.Items.INGOTS_IRON)
        .define('m', Registration.MYSTERIOUS_INGOT.get())
        .group("tutorialv3")
        .unlockedBy("mysterious", InventoryChangeTrigger.TriggerInstance.hasItems(Registration.MYSTERIOUS_INGOT.get()))
        .save(consumer);
    ...
}
```

The blockstate generator is the most complicated thing here.
Basically the code presented here will generate a multipart model where some parts are conditional depending on being powered or not.

:::info 1.19
Add `frame.renderType("translucent")` at the end of `registerPowergen()`
:::
