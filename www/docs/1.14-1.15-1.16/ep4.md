---
sidebar_position: 4
---

# Episode 4

Back: [Index](./1.14-1.15-1.16.md)

### The Container

For creating a gui one of the most important classes is the container. This is a class that exists on the client and the server, and it makes sure that changes the user does on the client are communicated properly to the server and the other way around (i.e. the player having a gui open while a hopper is inserting items into the block). Create a class called FirstBlockContainer as follows:

```java
public class FirstBlockContainer extends Container {

    private TileEntity tileEntity;
    private PlayerEntity playerEntity;
    private IItemHandler playerInventory;

    public FirstBlockContainer(int windowId, World world, BlockPos pos, PlayerInventory playerInventory, PlayerEntity player) {
        super(FIRSTBLOCK_CONTAINER, windowId);
        tileEntity = world.getTileEntity(pos);
        this.playerEntity = player;
        this.playerInventory = new InvWrapper(playerInventory);

        tileEntity.getCapability(CapabilityItemHandler.ITEM_HANDLER_CAPABILITY).ifPresent(h -> {
            addSlot(new SlotItemHandler(h, 0, 64, 24));
        });
        layoutPlayerInventorySlots(10, 70);
    }

    @Override
    public boolean canInteractWith(PlayerEntity playerIn) {
        return isWithinUsableDistance(IWorldPosCallable.of(tileEntity.getWorld(), tileEntity.getPos()), playerEntity, ModBlocks.FIRSTBLOCK);
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

In the container we store the inventory of the player (as we need to manipulate player inventory slots too) and the inventory of our tile entity (the item handler we created the previous episode). For every slot that we want to manipulate we call addSlot() with SlotItemHandler which is a convenient way to wrap an IItemHandler to a slot (added by Forge). In canInteractWith we test if the player is near enough to the block to open the inventory.

We also need a container type (FIRSTBLOCK_CONTAINER) that we add to ModBlocks and register in your main class:

```java
public class ModBlocks {

    ...

    @ObjectHolder("mytutorial:firstblock")
    public static ContainerType<FirstBlockContainer> FIRSTBLOCK_CONTAINER;
}
```

```java
    @Mod.EventBusSubscriber(bus = Mod.EventBusSubscriber.Bus.MOD)
    public static class RegistryEvents {

        ...

        @SubscribeEvent
        public static void onContainerRegistry(final RegistryEvent.Register<ContainerType<?>> event) {
            event.getRegistry().register(IForgeContainerType.create((windowId, inv, data) -> {
                BlockPos pos = data.readBlockPos();
                return new FirstBlockContainer(windowId, MyTutorial.proxy.getClientWorld(), pos, inv, MyTutorial.proxy.getClientPlayer());
            }).setRegistryName("firstblock"));
        }
    }
```

The container type is only used client-side, so we can use your proxy getClientWorld and getClientPlayer to get a reference to the world and player. We also need our tile entity and for that we use a custom data packet that is sent from the server to the client. In our case we simply send the position of our block over to this factory (more on that later).

### The Screen

The container is present on both sides but the Screen (the actual GUI) is only present on the client. Make a new class called FirstBlockScreen:

```java
public class FirstBlockScreen extends ContainerScreen<FirstBlockContainer> {

    private ResourceLocation GUI = new ResourceLocation(MyTutorial.MODID, "textures/gui/firstblock_gui.png");

    public FirstBlockScreen(FirstBlockContainer container, PlayerInventory inv, ITextComponent name) {
        super(container, inv, name);
    }

    @Override
    public void render(int mouseX, int mouseY, float partialTicks) {
        this.renderBackground();
        super.render(mouseX, mouseY, partialTicks);
        this.renderHoveredToolTip(mouseX, mouseY);
    }

    @Override
    protected void drawGuiContainerForegroundLayer(int mouseX, int mouseY) {
    }

    @Override
    protected void drawGuiContainerBackgroundLayer(float partialTicks, int mouseX, int mouseY) {
        GlStateManager.color4f(1.0F, 1.0F, 1.0F, 1.0F);
        this.minecraft.getTextureManager().bindTexture(GUI);
        int relX = (this.width - this.xSize) / 2;
        int relY = (this.height - this.ySize) / 2;
        this.blit(relX, relY, 0, 0, this.xSize, this.ySize);
    }
}
```

When our gui is opened we will get a reference to the client side version of the container. We basically render our custom background (a normal gui texture with the player slots and a single inventory slot for our diamond) and leave the rest to Minecraft.

We also have to couple our container to this screen. This we do in the ClientProxy:

```java
public class ClientProxy implements IProxy {

    @Override
    public void init() {
        ScreenManager.registerFactory(ModBlocks.FIRSTBLOCK_CONTAINER, FirstBlockScreen::new);
    }

    @Override
    public World getClientWorld() {
        return Minecraft.getInstance().world;
    }

    @Override
    public PlayerEntity getClientPlayer() {
        return Minecraft.getInstance().player;
    }
}
```

By doing ScreenManager.registerFactory Minecraft knows that our container is associated with the given Screen.

### Tile Entity and Block

On the server side we have to extend our block and tile entity to support this new gui. First the tile entity. Add this to FirstBlockTile:

```java
public class FirstBlockTile extends TileEntity implements ITickableTileEntity, INamedContainerProvider {

    ...

    @Override
    public ITextComponent getDisplayName() {
        return new StringTextComponent(getType().getRegistryName().getPath());
    }

    @Nullable
    @Override
    public Container createMenu(int i, PlayerInventory playerInventory, PlayerEntity playerEntity) {
        return new FirstBlockContainer(i, world, pos, playerInventory, playerEntity);
    }
}
```

So first we need to implement INamedContainerProvider. I choose to do it in the tile entity, but you can also make a separate implementation of this. Again a matter of taste. The important method here is createMenu(). This is responsible for creating the server-side version of the container.

Finally, we need to add a method to our block. Extend FirstBlock as follows:

```java
public class FirstBlock extends Block {

    ...

    @Override
    public boolean onBlockActivated(BlockState state, World world, BlockPos pos, PlayerEntity player, Hand hand, BlockRayTraceResult result) {
        if (!world.isRemote) {
            TileEntity tileEntity = world.getTileEntity(pos);
            if (tileEntity instanceof INamedContainerProvider) {
                NetworkHooks.openGui((ServerPlayerEntity) player, (INamedContainerProvider) tileEntity, tileEntity.getPos());
            } else {
                throw new IllegalStateException("Our named container provider is missing!");
            }
            return true;
        }
        return super.onBlockActivated(state, world, pos, player, hand, result);
    }
}
```
This method will be called when the user activates (right clicks) our block. Since we have a server-side component to our gui we only open the gui on the server side. That's the reason for the !world.isRemote test. After that we find our tile entity and check that it is a INamedContainerProvider. If so we can call NetworkHooks.openGui. Note the tileEntity.getPos(). That position will be communicated to the client using a packet (and in our client side container factory we read it again). If you want to communicate more information to the client you can make your own custom data here.

This is basically it. At this point our gui should work.
