---
sidebar_position: 6
---

# Render Block OBJ

In this chapter I show how you can make a block that renders a static model exported from Blender or another 3D program that supports WaveFront OBJ files. The result looks like this:
```
<img src="http://i.imgur.com/jMOm6m4.png" alt="Model Block">
```
The first thing you have to do is to add this to your ClientProxy.preInit(). This makes sure the obj loader knows about your domain:
```
<syntaxhighlight lang="java">
    public static class ClientProxy extends CommonProxy {
        @Override
        public void preInit(FMLPreInitializationEvent e) {
            super.preInit(e);

            OBJLoader.INSTANCE.addDomain(MODID);

            ...
        }
    }
</syntaxhighlight>
```
Then there is the block:
```
<syntaxhighlight lang="java">
public class ModelBlock extends Block {

    public ModelBlock() {
        super(Material.ROCK);
        setUnlocalizedName(ModTut.MODID + ".modelblock");
        setRegistryName("modelblock");
    }

    @SideOnly(Side.CLIENT)
    public void initModel() {
        ModelLoader.setCustomModelResourceLocation(Item.getItemFromBlock(this), 0, new ModelResourceLocation(getRegistryName(), "inventory"));
    }

    @Override
    @SideOnly(Side.CLIENT)
    public boolean shouldSideBeRendered(IBlockState blockState, IBlockAccess worldIn, BlockPos pos, EnumFacing side) {
        return false;
    }

    @Override
    public boolean isBlockNormalCube(IBlockState blockState) {
        return false;
    }

    @Override
    public boolean isOpaqueCube(IBlockState blockState) {
        return false;
    }
}
</syntaxhighlight>
```
Then you also need a blockstate as usual (blockstates/modelblock.json). Here instead of using another json as a model we directly refer to the obj that is exported from Blender. Because Blender and Forge apparently don't agree on vertical texture coordinate (the 'v' axis) you need to add the 'flip-v' attribute:
```
 <nowiki>
{
  "forge_marker": 1,
  "defaults": {
    "custom": { "flip-v": true },
    "model": "modtut:model.obj"
  },
  "variants": {
    "normal": [{}],
    "inventory": [{}]
  }
}
</nowiki>
```
The obj file you exported from Blender should go to models/block/model.obj. Note that you also need the model.mtl file which is also exported by blender but you have to modify it so that all referenced textures now use the standard `<modid>:<name>` format:
```
 <nowiki>
newmtl None
Ns 0
Ka 0.000000 0.000000 0.000000
Kd 0.8 0.8 0.8
Ks 0.8 0.8 0.8
d 1
illum 2
map_Kd modtut:blocks/modeltexture
</nowiki>
```
Another method of adding textures is through the blockstate file, by adding texture maps. One of the benefits of this is that you can re-export your .mtl file without having to add the map_Kd line each time. Your .mtl file will have at least one "newmtl [name]" line. To map the texture, add "#[name] to the texture map. Instead of the previous example, where you added a "map_Kd" line, you could just change the blockstate to the following:
```
 <nowiki>
{
  "forge_marker": 1,
  "defaults": {
    "custom": { "flip-v": true },
    "model": "modtut:model.obj",
    "textures": {
      "#None": "modtut:blocks/modeltexture"
    }
  },
  "variants": {
    "normal": [{}],
    "inventory": [{}]
  }
}
</nowiki>
```
