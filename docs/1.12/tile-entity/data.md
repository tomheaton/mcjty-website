---
sidebar_position: 1
---

# TileEntity Data

In this example we make a simple block that holds a counter.
Since the counter can go pretty high we can't store it in the 4-bit metadata, so we have to use a tile entity.
But other than that the tile entity doesn't do anything. To operate the block in game you simply right-click (activate) the up arrow on the front of the block and the counter will go up.
If you activate the down arrow the counter goes down.
The block will also show the current value of the counter on the in-game console.
To making coding where we hit the block easier and also to demonstrate how you can do this we limit orientation of our block on the horizontal plane.

![image](https://i.imgur.com/iw9JB2p.png)

Here is the block code.
In this code we register our tile entity as well.
We also check if the block is activated and if so we call `increment()` or `decrement()` on our tile entity to do the actual counting work:

```java
public class DataBlock extends Block implements ITileEntityProvider {

    public static final PropertyDirection FACING = PropertyDirection.create("facing", EnumFacing.Plane.HORIZONTAL);

    public DataBlock() {
        super(Material.rock);
        setUnlocalizedName(ModTut.MODID + ".datablock");
        setRegistryName("datablock");
    }

    @SideOnly(Side.CLIENT)
    public void initModel() {
        ModelLoader.setCustomModelResourceLocation(Item.getItemFromBlock(this), 0, new ModelResourceLocation(getRegistryName(), "inventory"));
    }

    @Override
    public TileEntity createNewTileEntity(World worldIn, int meta) {
        return new DataTileEntity();
    }

    private DataTileEntity getTE(World world, BlockPos pos) {
        return (DataTileEntity) world.getTileEntity(pos);
    }

    @Override
    public boolean onBlockActivated(World world, BlockPos pos, IBlockState state, EntityPlayer player, EnumHand hand,
                EnumFacing side, float hitX, float hitY, float hitZ) {
        if (!world.isRemote) {
            // We only count on the server side.

            if (side == state.getValue(FACING)) {
                int counter;
                if (hitY < .5f) {
                    counter = getTE(world, pos).decrement();
                } else {
                    counter = getTE(world, pos).increment();
                }
                TextComponentTranslation component = new TextComponentTranslation("message.modtut.counter_par", counter);
                component.getStyle().setColor(TextFormatting.GREEN);
                player.sendStatusMessage(component, false);
            }
        }
        // Return true also on the client to make sure that MC knows we handled this and will not try to place
        // a block on the client
        return true;
    }

    @Override
    public void onBlockPlacedBy(World world, BlockPos pos, IBlockState state, EntityLivingBase placer, ItemStack stack) {
        world.setBlockState(pos, state.withProperty(FACING, placer.getHorizontalFacing().getOpposite()), 2);
    }

    @Override
    public IBlockState getStateFromMeta(int meta) {
        // Since we only allow horizontal rotation we need only 2 bits for facing. North, South, West, East start at index 2 so we have to add 2 here.
        return getDefaultState().withProperty(FACING, EnumFacing.getFront((meta & 3) + 2));
    }

    @Override
    public int getMetaFromState(IBlockState state) {
        // Since we only allow horizontal rotation we need only 2 bits for facing. North, South, West, East start at index 2 so we have to subtract 2 here.
        return state.getValue(FACING).getIndex()-2;
    }

    @Override
    protected BlockStateContainer createBlockState() {
        return new BlockStateContainer(this, FACING);
    }

}
```

Since we used a localized string we have to add this to the lang file:

```lang
message.modtut.counter_par=Counter: %d
```

The code to register the block as well as the tile entity is as follows in CommonProxy:

```java
@Mod.EventBusSubscriber
public class CommonProxy {
    ...

    @SubscribeEvent
    public static void registerBlocks(RegistryEvent.Register<Block> event) {
        event.getRegistry().register(new DataBlock());
        GameRegistry.registerTileEntity(DataTileEntity.class, ModTut.MODID + "_datablock");
        ...

    }

    @SubscribeEvent
    public static void registerItems(RegistryEvent.Register<Item> event) {
        event.getRegistry().register(new ItemBlock(ModBlocks.dataBlock).setRegistryName(ModBlocks.dataBlock.getRegistryName()));
        ...

    }
}
```

Because this block has a model now we need to add registration of that to the ClientProxy.
We add the corresponding initModels() to ModBlocks and ModItems as well:

```java
@Mod.EventBusSubscriber(Side.CLIENT)
public class ClientProxy extends CommonProxy {

    ...

    @SubscribeEvent
    public static void registerModels(ModelRegistryEvent event) {
        ModBlocks.initModels();
        ModItems.initModels();
    }
}
```

And we also need an object holder and an initModels() that is called from the ClientProxy:

```java
public class ModBlocks {

    @GameRegistry.ObjectHolder("modtut:datablock")
    public static DataBlock dataBlock;

    @SideOnly(Side.CLIENT)
    public static void initModels() {
        dataBlock.initModel();
    }
}
```

The tile entity is also pretty simple.
It only has to hold one counter, and it has to be able to convert that data to and from NBT (so that it will be saved on disk when the game is saved).
It doesn't care about client-side data, so it doesn't do any syncing to the client. An important call in the tile entity code is the call to markDirty().
This tells Minecraft that this tile entity has to be saved the next time this chunk has to be saved to disk.
Don't forget this or your data will not be remembered!
Note that markDirty() does not automatically cause data to be synchronized to the client. For that we need other mechanisms (more on those later).

```java
public class DataTileEntity extends TileEntity {

    private int counter = 0;

    public int decrement() {
        counter--;
        markDirty();
        return counter;
    }

    public int increment() {
        counter++;
        markDirty();
        return counter;
    }

    @Override
    public void readFromNBT(NBTTagCompound compound) {
        super.readFromNBT(compound);
        counter = compound.getInteger("counter");
    }

    @Override
    public NBTTagCompound writeToNBT(NBTTagCompound compound) {
        super.writeToNBT(compound);
        compound.setInteger("counter", counter);
        return compound;
    }
}
```

Here is the blockstate JSON (blockstates/datablock.json):

```json
{
  "forge_marker": 1,
  "defaults": {
    "model": "modtut:datablock"
  },
  "variants": {
    "normal": [{}],
    "inventory": [{}],
    "facing": {
      "north": {},
      "south": {"y": 180},
      "west": {"y": 270},
      "east": {"y": 90}
    }
  }
}
```

And here is the model itself:

```json
{
  "parent": "block/cube",
  "textures": {
    "particle": "modtut:blocks/blocktexture",
    "down": "modtut:blocks/blocktexture",
    "up": "modtut:blocks/blocktexture",
    "east": "modtut:blocks/blocktexture",
    "west": "modtut:blocks/blocktexture",
    "north": "modtut:blocks/datablocktexture",
    "south": "modtut:blocks/blocktexture"
  }
}
```
