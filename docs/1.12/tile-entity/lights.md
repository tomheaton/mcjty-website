In this tile entity example we demonstrate how you can have a tile entity do some calculation and do something based on this. The calculations of this tile entity are pretty simple.

Every tick we count how many entities there are in a 20x20x20 box around the block and we let the block blink a texture depending on how many there are. So if you have tons of rabbits around your block it will blink faster. Note: doing this every tick is not very efficient. For that reason we only count every 10 ticks (two times per second). Also since we only need to blink on the client we only calculate this client side. That means that this is a tile entity that has no data to persist (no readFromNBT) and also no data that is known on the server. It is considerations like this that you have to take into account if you want to make efficient mods that don't cause lag on the server or the client (or both).
```
<img src="http://i.imgur.com/1w1y9XW.png" alt="Blinking Block">
```
First the block. We use a dummy blockstate property (via getActualState()) that is not represented by metadata to communicate the 'blinking' state of our block to the json blockstate (so that it can switch the texture). Note that this block is translucent which is the reason for the getBlockLayer() and isOpaqueCube() overrides:
```
<syntaxhighlight lang="java">
public class BlinkingBlock extends Block implements ITileEntityProvider {

    public static final PropertyBool LIT = PropertyBool.create("lit");

    public BlinkingBlock() {
        super(Material.rock);
        setUnlocalizedName(ModTut.MODID + ".blinkingblock");
        setRegistryName("blinkingblock");
    }

    @SideOnly(Side.CLIENT)
    public void initModel() {
        ModelLoader.setCustomModelResourceLocation(Item.getItemFromBlock(this), 0, new ModelResourceLocation(getRegistryName(), "inventory"));
    }

    @SideOnly(Side.CLIENT)
    @Override
    public BlockRenderLayergetBlockLayer() {
        return BlockRenderLayer.TRANSLUCENT;
    }

    @Override
    public boolean isOpaqueCube(IBlockState state) {
        return false;
    }

    @Override
    public TileEntity createNewTileEntity(World worldIn, int meta) {
        return new BlinkingTileEntity();
    }

    private BlinkingTileEntity getTE(IBlockAccess world, BlockPos pos) {
        return (BlinkingTileEntity) world.getTileEntity(pos);
    }

    @Override
    public IBlockState getActualState(IBlockState state, IBlockAccess world, BlockPos pos) {
        return state.withProperty(LIT, getTE(world, pos).isLit());
    }

    @Override
    protected BlockStateContainer createBlockState() {
        return new BlockStateContainer (this, LIT);
    }

    @Override
    public int getMetaFromState(IBlockState state) {
        return 0;
    }
}
</syntaxhighlight>
```
We assume that by now you know how to register this block. You need to add an ObjectHolder to ModBlocks and register the block, tile entity, and ItemBlock in CommonProxy. Also don't forget to call initModel() from ModBlocks.initModels()!

We now have to define our tile entity. Since this tile entity has to 'tick' (i.e. called 20 times per second) we have to implement ITickable:
```
<syntaxhighlight lang="java">
public class BlinkingTileEntity extends TileEntity implements ITickable {

    // We only calculate this value on the client so we don't care about the server
    // side and we also don't care about saving this value. That's why we have no
    // readFromNBT() and writeToNBT().
    private boolean lit = false;

    // Counter that is decremented faster if there are more entities in the vicinity.
    // If it reaches negative we toggle the light
    private int counter = 0;

    // To prevent counting entities every tick we delay it for 10 ticks and remember the last count we had.
    private int delayCounter = 10;
    private int lastCount = 0;

    public boolean isLit() {
        return lit;
    }

    @Override
    public void update() {
        // This method is called every tick (20 times per second normally)

        if (world.isRemote) {
            // We only do something on the client so we don't have to bother about client-server communication.
            // The effect that we want to have (blinking the block) is client-side as well.
            updateCounter();
            counter -= lastCount * 3;
            if (counter <= 0) {
                lit = !lit;
                counter = 400;      // This is 20 seconds. Rate increases if more mods are near
                world.markBlockRangeForRenderUpdate(getPos(), getPos());
            }
        }
    }

    private void updateCounter() {
        // Don't count the entities every tick. That would be a bit slow.
        delayCounter--;
        if (delayCounter <= 0) {
            List<EntityLivingBase> list = world.getEntitiesWithinAABB(EntityLivingBase.class, new AxisAlignedBB(
                 getPos().add(-10, -10, -10), getPos().add(10, 10, 10)));
            delayCounter = 10;
            lastCount = list.size();
        }
    }
}
</syntaxhighlight>
```
Finally we have our blockstate json (blockstates/blinkingblock.json):
```
 <nowiki>
{
  "forge_marker": 1,
  "defaults": {
    "model": "modtut:blinkingblock",
    "textures": {
      "txt": "modtut:blocks/blinkingtexture"
    }
  },
  "variants": {
    "normal": [{}],
    "inventory": [{}],
    "lit": {
      "false": {},
      "true": {
        "textures": {
          "txt": "modtut:blocks/blinkingtexture_on"
        }
      }
    }
  }
}
</nowiki>
```
And our model (models/block/blinkingblock.json):
```
 <nowiki>
{
  "parent": "block/cube_all",
  "textures": {
    "all": "#txt"
  }
}
</nowiki>
```