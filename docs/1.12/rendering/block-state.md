In this example I show how you can make the front panel of a block depend on a redstone signal. Here we add an additional property to our blockstate that says if the block is enabled (powered) or not.
```
<img src="http://i.imgur.com/ouNhzQy.png" alt="State textured block">
```
```
<syntaxhighlight lang="java">
public class StateTexturedBlock extends Block {

    public static final PropertyDirection FACING = PropertyDirection.create("facing");
    public static final PropertyBool ENABLED = PropertyBool.create("enabled");


    public StateTexturedBlock() {
        super(Material.ROCK);
        setUnlocalizedName(ModTut.MODID + ".statetexturedblock");
        setRegistryName("statetexturedblock");

        setDefaultState(blockState.getBaseState().withProperty(FACING, EnumFacing.NORTH));
    }

    @SideOnly(Side.CLIENT)
    public void initModel() {
        ModelLoader.setCustomModelResourceLocation(Item.getItemFromBlock(this), 0, new ModelResourceLocation(getRegistryName(), "inventory"));
    }

    @Override
    public void neighborChanged(IBlockState state, World world, BlockPos pos, Block blockIn, BlockPos p_189540_5_) {
        int powered = world.isBlockIndirectlyGettingPowered(pos);
        world.setBlockState(pos, state.withProperty(ENABLED, powered > 0), 3);
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
        return getDefaultState()
                .withProperty(FACING, EnumFacing.getFront(meta & 7))
                .withProperty(ENABLED, (meta & 8) != 0);
    }

    @Override
    public int getMetaFromState(IBlockState state) {
        return state.getValue(FACING).getIndex() + (state.getValue(ENABLED) ? 8 : 0);
    }

    @Override
    protected BlockStateContainer createBlockState() {
        return new BlockStateContainer(this, FACING, ENABLED);
    }
}
</syntaxhighlight>
```
And here is the blockstate json (blockstates/statetexturedblock.json). Here you see how we change the front texture when the 'enabled' property is true. This work because in our model file (see later) we added a '#front' parameter for one of the textures:
```
 <nowiki>
{
  "forge_marker": 1,
  "defaults": {
    "model": "modtut:statetexturedblock",
    "textures": {
      "front": "modtut:blocks/statetexture_off"
    }
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
    },
    "enabled": {
      "false": {},
      "true": {
        "textures": {
          "front": "modtut:blocks/statetexture_on"
        }
      }
    }
  }
}
</nowiki>
```
Finally we need our model file (models/block/statetexturedblock.json). The 'north' texture is defined with the #front parameter which is given in the blockstate json:
```
 <nowiki>
{
  "parent": "block/cube",
  "textures": {
    "particle": "modtut:blocks/statetexture",
    "down": "modtut:blocks/statetexture",
    "up": "modtut:blocks/statetexture",
    "east": "modtut:blocks/statetexture",
    "west": "modtut:blocks/statetexture",
    "north": "#front",
    "south": "modtut:blocks/statetexture"
  }
}</nowiki>
```