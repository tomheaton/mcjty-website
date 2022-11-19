---
sidebar_position: 3
---

# Episode 3

Back: [Index](./1.14-1.15-1.16.md)

### Block Properties

We want to let our block have a different look from the front side. To do that we add a block property. Change the FirstBlock class as follows:

```java
public class FirstBlock extends Block {

    ...

    @Override
    public void onBlockPlacedBy(World world, BlockPos pos, BlockState state, @Nullable LivingEntity entity, ItemStack stack) {
        if (entity != null) {
            world.setBlockState(pos, state.with(BlockStateProperties.FACING, getFacingFromEntity(pos, entity)), 2);
        }
    }

    public static Direction getFacingFromEntity(BlockPos clickedBlock, LivingEntity entity) {
        return Direction.getFacingFromVector((float) (entity.posX - clickedBlock.getX()), (float) (entity.posY - clickedBlock.getY()), (float) (entity.posZ - clickedBlock.getZ()));
    }

    @Override
    protected void fillStateContainer(StateContainer.Builder<Block, BlockState> builder) {
        builder.add(BlockStateProperties.FACING);
    }
}
```

We use one of the standard vanilla properties called FACING.
This represents a direction with six possible values (north, south, east, west, up, down).
In fillStateContainer we add our property to the state container builder so that the system knows this block supports this property.
Then we override onBlockPlacedBy to make sure our block faces the right direction when it is placed by a player.

We need to change our blockstate JSON now:

```json
{
  "variants": {
    "facing=north": { "model": "mytutorial:block/firstblock" },
    "facing=south": { "model": "mytutorial:block/firstblock", "y": 180 },
    "facing=west": { "model": "mytutorial:block/firstblock", "y": 270 },
    "facing=east": { "model": "mytutorial:block/firstblock", "y": 90 },
    "facing=up": { "model": "mytutorial:block/firstblock", "x": -90 },
    "facing=down": { "model": "mytutorial:block/firstblock", "x": 90 }
  }
}
```

So basically we have six variants which all use the same model but with a different rotation.

We also have to change the model so that the north side has a different texture:

```json
{
  "parent": "block/cube",
  "textures": {
    "particle": "mytutorial:block/firstblock",
    "down": "mytutorial:block/firstblock",
    "up": "mytutorial:block/firstblock",
    "east": "mytutorial:block/firstblock",
    "west": "mytutorial:block/firstblock",
    "north": "mytutorial:block/firstblock_front",
    "south": "mytutorial:block/firstblock"
  }
}
```

### Tile Entity

Now it is time to start adding functionality to our block.
This is done with a tile entity.
Create a new class called FirstBlockTile:

```java
public class FirstBlockTile extends TileEntity implements ITickableTileEntity {

    public FirstBlockTile() {
        super(FIRSTBLOCK_TILE);
    }

    @Override
    public void tick() {
    }
}
```

Because we know we're going to need a tile entity that does some work we implement ITickableTileEntity (don't use ITickable! That's something else) so that our tile entity gets notified every tick.

Now we have to define our TileEntityType (FIRSTBLOCK_TILE). We do this in ModBlocks:

```java
public class ModBlocks {

    @ObjectHolder("mytutorial:firstblock")
    public static FirstBlock FIRSTBLOCK;

    @ObjectHolder("mytutorial:firstblock")
    public static TileEntityType<FirstBlockTile> FIRSTBLOCK_TILE;
}
```

And we need to register it.
This is done in your main mod class:

```java
@Mod.EventBusSubscriber(bus = Mod.EventBusSubscriber.Bus.MOD)
public static class RegistryEvents {

    ...

    @SubscribeEvent
    public static void onTileEntityRegistry(final RegistryEvent.Register<TileEntityType<?>> event) {
        event.getRegistry().register(TileEntityType.Builder.create(FirstBlockTile::new, ModBlocks.FIRSTBLOCK).build(null).setRegistryName("firstblock"));
    }
}
```

Don't forget to set a registry name and also don't forget to associate the tile entity type with the blocks that need it (in this case FIRSTBLOCK).

We also have to add some extra methods to our block to make sure the tile entity is actually associated with it. Modify FirstBlock as follows:

```java title="FirstBlock.java"
public class FirstBlock extends Block {

    ...

    @Override
    public boolean hasTileEntity(BlockState state) {
        return true;
    }

    @Nullable
    @Override
    public TileEntity createTileEntity(BlockState state, IBlockReader world) {
        return new FirstBlockTile();
    }

    ...
}
```

### Item Handler

Now we want to add an item handler so that our block has an inventory (note, the code here differs from the code at the end of tutorial 3 because in the beginning of tutorial 4 we make some corrections).

First expand FirstBlockTile as follows:

```java title="FirstBlockTile.java"
public class FirstBlockTile extends TileEntity implements ITickableTileEntity {

    private LazyOptional<IItemHandler> handler = LazyOptional.of(this::createHandler);


    public FirstBlockTile() {
        super(FIRSTBLOCK_TILE);
    }

    @Override
    public void tick() {
    }

    @Override
    public void read(CompoundNBT tag) {
        CompoundNBT invTag = tag.getCompound("inv");
        handler.ifPresent(h -> ((INBTSerializable<CompoundNBT>)h).deserializeNBT(invTag));
        super.read(tag);
    }

    @Override
    public CompoundNBT write(CompoundNBT tag) {
        handler.ifPresent(h -> {
            CompoundNBT compound = ((INBTSerializable<CompoundNBT>)h).serializeNBT();
            tag.put("inv", compound);
        });
        return super.write(tag);
    }

    private IItemHandler createHandler() {
        return new ItemStackHandler(1);
    }

    @Nonnull
    @Override
    public <T> LazyOptional<T> getCapability(@Nonnull Capability<T> cap, @Nullable Direction side) {
        if (cap == CapabilityItemHandler.ITEM_HANDLER_CAPABILITY) {
            return handler.cast();
        }
        return super.getCapability(cap, side);
    }
}
```

Our LazyOptional handler is the instance that will contain our inventory.
It is a lazy optional which means it will be created the first time it is needed and cached after that. createHandler() actually creates the item handler.
The ItemStackHandler is a handy class provided by Forge that allows you to quickly make inventories of a certain size.
In this case we only need 1 slot.

To associate the inventory with our tile entity we use a Forge system called capabilities.
Using capabilities you can attach various things (energy, inventories, ...) to tile entities, entities and so on.
You can also define your own capabilities which we will be doing in a future episode.
To give our tile entity the item handler capability you have to override getCapability and return the handler.

To make sure our inventory gets stored when Minecraft saves and restored when it loads we also have to implement read() and write() in our tile entity.
Here we see how you can use the ifPresent() call on a LazyOptional to safely access the contained handler (and do nothing if it happens to be missing for whatever reason).

Our block doesn't have a GUI yet but using a hopper you can test that it is actually working.

### Restricting the type of item

We are going to create a power generator that runs on diamonds, so we need to make sure that our handler can only contain diamonds.
To do that we change our createHander() as follows:

```java
private IItemHandler createHandler() {
    return new ItemStackHandler(1) {
        @Override
        public boolean isItemValid(int slot, @Nonnull ItemStack stack) {
            return stack.getItem() == Items.DIAMOND;
        }

        @Nonnull
        @Override
        public ItemStack insertItem(int slot, @Nonnull ItemStack stack, boolean simulate) {
            if (stack.getItem() != Items.DIAMOND) {
                return stack;
            }
            return super.insertItem(slot, stack, simulate);
        }
    };
}
```
