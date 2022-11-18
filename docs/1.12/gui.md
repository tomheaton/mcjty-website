---
sidebar_position: 9
---

# GUI

In this tutorial we explain how you can make a chest that can hold 9 items (that's all you need right?) and opens a GUI, so you can access those items.

![image](https://i.imgur.com/g5yIlgc.png)

Here is the block code. In this code we register our tile entity as well.
In onBlockActivated() we actually open the GUI.
Note that this is done on the server because a gui for a tile entity has to be 'opened' on both sides so that there is a mechanism in place for synchronizing the contents.
The player.openGui() call happens on the server and this will be synced to the client using the IGuiHandler (more on this later). i.e. if you have a GUI open for a chest you want to see the items appear in real time as well as the other way around:

```java
public class TestContainerBlock extends Block implements ITileEntityProvider {

    public static final int GUI_ID = 1;

    public TestContainerBlock() {
        super(Material.ROCK);
        setUnlocalizedName(ModTut.MODID + ".testcontainerblock");
        setRegistryName("testcontainerblock");
    }

    @SideOnly(Side.CLIENT)
    public void initModel() {
        ModelLoader.setCustomModelResourceLocation(Item.getItemFromBlock(this), 0, new ModelResourceLocation(getRegistryName(), "inventory"));
    }

    @Override
    public TileEntity createNewTileEntity(World worldIn, int meta) {
        return new TestContainerTileEntity();
    }

    @Override
    public boolean onBlockActivated(World world, BlockPos pos, IBlockState state, EntityPlayer player, EnumHand hand, ItemStack heldItem, EnumFacing side,
                float hitX, float hitY, float hitZ) {
        // Only execute on the server
        if (world.isRemote) {
            return true;
        }
        TileEntity te = world.getTileEntity(pos);
        if (!(te instanceof TestContainerTileEntity)) {
            return false;
        }
        player.openGui(ModTut.instance, GUI_ID, world, pos.getX(), pos.getY(), pos.getZ());
        return true;
    }
}
```

Do the proper registration in CommonProxy:

```java
@Mod.EventBusSubscriber
public class CommonProxy {

    ...

    @SubscribeEvent
    public static void registerBlocks(RegistryEvent.Register<Block> event) {
        event.getRegistry().register(new TestContainerBlock());
        GameRegistry.registerTileEntity(TestContainerTileEntity.class, ModTut.MODID + "_testcontainerblock");
        ...
    }

    @SubscribeEvent
    public static void registerItems(RegistryEvent.Register<Item> event) {
        event.getRegistry().register(new ItemBlock(ModBlocks.testContainerBlock).setRegistryName(ModBlocks.testContainerBlock.getRegistryName()));
        ...
    }
}
```

And add the ObjectHolder and call to initModel() to ModBlocks:

```java
public class ModBlocks {

    @GameRegistry.ObjectHolder("modtut:testcontainerblock")
    public static TestContainerBlock testContainerBlock;

    ...

    @SideOnly(Side.CLIENT)
    public static void initModels() {
        ...

        testContainerBlock.initModel();
    }
}
```

The tile entity is what is actually storing the items.
In this tutorial we will no longer use the vanilla IInventory system, but instead we implement our inventory using the new recommended capability system (IItemHandler).

```java
public class TestContainerTileEntity extends TileEntity {

    public static final int SIZE = 9;

    // This item handler will hold our nine inventory slots
    private ItemStackHandler itemStackHandler = new ItemStackHandler(SIZE) {
        @Override
        protected void onContentsChanged(int slot) {
            // We need to tell the tile entity that something has changed so
            // that the chest contents is persisted
            TestContainerTileEntity.this.markDirty();
        }
    };

    @Override
    public void readFromNBT(NBTTagCompound compound) {
        super.readFromNBT(compound);
        if (compound.hasKey("items")) {
            itemStackHandler.deserializeNBT((NBTTagCompound) compound.getTag("items"));
        }
    }

    @Override
    public NBTTagCompound writeToNBT(NBTTagCompound compound) {
        super.writeToNBT(compound);
        compound.setTag("items", itemStackHandler.serializeNBT());
        return compound;
    }

    public boolean canInteractWith(EntityPlayer playerIn) {
        // If we are too far away from this tile entity you cannot use it
        return !isInvalid() && playerIn.getDistanceSq(pos.add(0.5D, 0.5D, 0.5D)) <= 64D;
    }

    @Override
    public boolean hasCapability(Capability<?> capability, EnumFacing facing) {
        if (capability == CapabilityItemHandler.ITEM_HANDLER_CAPABILITY) {
            return true;
        }
        return super.hasCapability(capability, facing);
    }

    @Override
    public <T> T getCapability(Capability<T> capability, EnumFacing facing) {
        if (capability == CapabilityItemHandler.ITEM_HANDLER_CAPABILITY) {
            return CapabilityItemHandler.ITEM_HANDLER_CAPABILITY.cast(itemStackHandler);
        }
        return super.getCapability(capability, facing);
    }
}
```

Here is the blockstate json (`blockstates/testcontainerblock.json`).
Note that in this example we don't have our own block model but instead use the vanilla cube_all model:

```json title="blockstates/testcontainerblock.json"
{
  "forge_marker": 1,
  "defaults": {
    "model": "cube_all",
    "textures": { "all":"modtut:blocks/testcontainer"}
  },
  "variants": {
    "normal": [{}],
    "inventory": [{}]
  }
}
```

This is not enough, however.
For a GUI to work we need actual GUI code and also a Container implementation.
While it is the Tile Entity that holds the actual contents, it is the Container that is used to communicate between the GUI and the actual contents on the server.
Keep in mind that when you open a GUI for a chest (for example) you not only see the slots from the chest itself but also slots from the player inventory.
So the Container is a view on at least two inventories in this case.

When a GUI is opened in Minecraft this usually happens on the server side.
There a Container implementation is used to indicate what inventory is being opened.
On the client side a synchronized copy of that Container is also used and given to the actual GUI.

Here you see the Container for this example.
Note how slots are added both for our own tile entity and the player inventory.

One note. It is crucial that you implement transferStackInSlot.
If you don't your block will crash if the player uses shift-click on an item.
In this example we copied the implementation that is also used by the vanilla chest.
It basically transfers slots between hotbar/player inventory/chest depending on where the item started and where there is room.

```java
public class TestContainer extends Container {

    private TestContainerTileEntity te;

    public TestContainer(IInventory playerInventory, TestContainerTileEntity te) {
        this.te = te;

        // This container references items out of our own inventory (the 9 slots we hold ourselves)
        // as well as the slots from the player inventory so that the user can transfer items between
        // both inventories. The two calls below make sure that slots are defined for both inventories.
        addOwnSlots();
        addPlayerSlots(playerInventory);
    }

    private void addPlayerSlots(IInventory playerInventory) {
        // Slots for the main inventory
        for (int row = 0; row < 3; ++row) {
            for (int col = 0; col < 9; ++col) {
                int x = 9 + col * 18;
                int y = row * 18 + 70;
                this.addSlotToContainer(new Slot(playerInventory, col + row * 9 + 10, x, y));
            }
        }

        // Slots for the hotbar
        for (int row = 0; row < 9; ++row) {
            int x = 9 + row * 18;
            int y = 58 + 70;
            this.addSlotToContainer(new Slot(playerInventory, row, x, y));
        }
    }

    private void addOwnSlots() {
        IItemHandler itemHandler = this.te.getCapability(CapabilityItemHandler.ITEM_HANDLER_CAPABILITY, null);
        int x = 9;
        int y = 6;

        // Add our own slots
        int slotIndex = 0;
        for (int i = 0; i < itemHandler.getSlots(); i++) {
            addSlotToContainer(new SlotItemHandler(itemHandler, slotIndex, x, y));
            slotIndex++;
            x += 18;
        }
    }

    @Override
    public ItemStack transferStackInSlot(EntityPlayer playerIn, int index) {
        ItemStack itemstack = ItemStack.EMPTY;
        Slot slot = this.inventorySlots.get(index);

        if (slot != null && slot.getHasStack()) {
            ItemStack itemstack1 = slot.getStack();
            itemstack = itemstack1.copy();

            if (index < TestContainerTileEntity.SIZE) {
                if (!this.mergeItemStack(itemstack1, TestContainerTileEntity.SIZE, this.inventorySlots.size(), true)) {
                    return ItemStack.EMPTY;
                }
            } else if (!this.mergeItemStack(itemstack1, 0, TestContainerTileEntity.SIZE, false)) {
                return ItemStack.EMPTY;
            }

            if (itemstack1.isEmpty()) {
                slot.putStack(ItemStack.EMPTY);
            } else {
                slot.onSlotChanged();
            }
        }

        return itemstack;
    }

    @Override
    public boolean canInteractWith(EntityPlayer playerIn) {
        return te.canInteractWith(playerIn);
    }
}
```

Now we also need a GUI. GUI's for containers usually extend from GuiContainer.
In this simple case there is not much code we need to get this GUI working.
You can of course add your own custom rendering to make this GUI more fancy as well as adding custom components and stuff like that:

```java
public class TestContainerGui extends GuiContainer {
    public static final int WIDTH = 180;
    public static final int HEIGHT = 152;

    private static final ResourceLocation background = new ResourceLocation(ModTut.MODID, "textures/gui/testcontainer.png");

    public TestContainerGui(TestContainerTileEntity tileEntity, TestContainer container) {
        super(container);

        xSize = WIDTH;
        ySize = HEIGHT;
    }

    @Override
    protected void drawGuiContainerBackgroundLayer(float partialTicks, int mouseX, int mouseY) {
        mc.getTextureManager().bindTexture(background);
        drawTexturedModalRect(guiLeft, guiTop, 0, 0, xSize, ySize);
    }
}
```

Now there is one final thing you need to do and that is to tell Minecraft how to create your GUI and Container implementations.
For this a IGuiHandler is needed which contains server and client side code to handle the GUI.
In the example below we hardcoded the TestContainerTileEntity and TestContainer names.
I recommend not doing that in your own code but using a simple framework.
For example, you could have a GenericTileEntity that you can do 'instanceof' of and then have methods in that to create your gui and/or container.
Or you can also make use of the given ID which is also given to player.openGui() as it was called above (GUI_ID).
This example is just to demonstrate how it works.

```java
public class GuiProxy implements IGuiHandler {

    @Override
    public Object getServerGuiElement(int ID, EntityPlayer player, World world, int x, int y, int z) {
        BlockPos pos = new BlockPos(x, y, z);
        TileEntity te = world.getTileEntity(pos);
        if (te instanceof TestContainerTileEntity) {
            return new TestContainer(player.inventory, (TestContainerTileEntity) te);
        }
        return null;
    }

    @Override
    public Object getClientGuiElement(int ID, EntityPlayer player, World world, int x, int y, int z) {
        BlockPos pos = new BlockPos(x, y, z);
        TileEntity te = world.getTileEntity(pos);
        if (te instanceof TestContainerTileEntity) {
            TestContainerTileEntity containerTileEntity = (TestContainerTileEntity) te;
            return new TestContainerGui(containerTileEntity, new TestContainer(player.inventory, containerTileEntity));
        }
        return null;
    }
}
```

And finally you need to register this GuiProxy class in your CommonProxy:

```java
public static class CommonProxy {

    ...

    public void init(FMLInitializationEvent e) {
        NetworkRegistry.INSTANCE.registerGuiHandler(instance, new GuiProxy());
    }

    ...
}
```

This completes this tutorial.
