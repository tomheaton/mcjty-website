---
sidebar_position: 4
---

# Render Block Different faces

In this example we show how you can make a block that has a different texture on every side. In addition the block will also use blockstates to orient itself according to how the player places the block.

Note that blockstates roughly translate to metadata as you would use in older versions of Minecraft. The blockstate system is much cleaner but remember that in 1.8.9 the meta data is still represented by 4 bits (for blocks at least) so you are limited to 16 different states. In the example below we define a property called 'FACING' which is a direction property. Based on this property we will decide how to rotate our model in the blockstate json.
```
<img src="http://i.imgur.com/ne5i9nJ.png" alt="Block with multiple faces">
```
```
<syntaxhighlight lang="java">
public class MultiTexturedBlock extends Block {

    public static final PropertyDirection FACING = PropertyDirection.create("facing");


    public MultiTexturedBlock() {
        super(Material.ROCK);
        setUnlocalizedName(ModTut.MODID + ".multitexturedblock");
        setRegistryName("multitexturedblock");

        setDefaultState(blockState.getBaseState().withProperty(FACING, EnumFacing.NORTH));
    }

    @SideOnly(Side.CLIENT)
    public void initModel() {
        ModelLoader.setCustomModelResourceLocation(Item.getItemFromBlock(this), 0, new ModelResourceLocation(getRegistryName(), "inventory"));
    }

    @Override
    public void onBlockPlacedBy(World world, BlockPos pos, IBlockState state, EntityLivingBase placer, ItemStack stack) {
        world.setBlockState(pos, state.withProperty(FACING, getFacingFromEntity(pos, placer)), 2);
    }

    public static EnumFacing getFacingFromEntity(BlockPos clickedBlock, EntityLivingBase entity) {
        return EnumFacing.getFacingFromVector(
             (float) (entity.posX - clickedBlock.getX()),
             (float) (entity.posY - clickedBlock.getY()),
             (float) (entity.posZ - clickedBlock.getZ()));
    }

    @Override
    public IBlockState getStateFromMeta(int meta) {
        return getDefaultState().withProperty(FACING, EnumFacing.getFront(meta & 7));
    }

    @Override
    public int getMetaFromState(IBlockState state) {
        return state.getValue(FACING).getIndex();
    }

    @Override
    protected BlockStateContainer createBlockState() {
        return new BlockStateContainer(this, FACING);
    }
}
</syntaxhighlight>
```
Here is the blockstate json (blockstates/multitexturedblock.json):
```
 <nowiki>
{
  "forge_marker": 1,
  "defaults": {
    "model": "modtut:multitexturedblock"
  },
  "variants": {
    "normal": [{}],
    "inventory": [{}],
    "facing": {
      "north": {},
      "south": {"y": 180},
      "west": {"y": 270},
      "east": {"y": 90},
      "up": {"x": -90},
      "down": {"x": 90}
    }
  }
}
</nowiki>
```
And here is the actual model (models/block/multitexturedblock.json):
```
 <nowiki>
{
  "parent": "block/cube",
  "textures": {
    "particle": "modtut:blocks/faceFront",
    "down": "modtut:blocks/faceDown",
    "up": "modtut:blocks/faceUp",
    "east": "modtut:blocks/faceLeft",
    "west": "modtut:blocks/faceRight",
    "north": "modtut:blocks/faceFront",
    "south": "modtut:blocks/faceBack"
  }
}
</nowiki>
```
