---
sidebar_position: 3
---

# Render Block Basic

Rendering a basic block is very similar to a basic item except that you need two json files now.
One for the blockstates:

```java title="SimpleTexturedBlock.java"
public class SimpleTexturedBlock extends Block {

    public SimpleTexturedBlock() {
        super(Material.ROCK);
        setUnlocalizedName(ModTut.MODID + ".simpletexturedblock");
        setRegistryName("simpletexturedblock");
    }

    @SideOnly(Side.CLIENT)
    public void initModel() {
        ModelLoader.setCustomModelResourceLocation(Item.getItemFromBlock(this), 0, new ModelResourceLocation(getRegistryName(), "inventory"));
    }
}
```

Now the blockstate json (`resources/assets/firstmod/blockstates/simpletexturedblock.json`):
(Please note that `simpletexturedblock.json` is the exact same name as the name set in your unlocalizedName and RegistryName above!)

```json title="resources/assets/firstmod/blockstates/simpletexturedblock.json"
{
  "forge_marker": 1,
  "defaults": {
    "model": "modtut:simpletexturedblock"
  },
  "variants": {
    "normal": [{}],
    "inventory": [{}]
  }
}
```

The model itself (`resources/assets/firstmod/models/block/simpletexturedblock.json`):
(Please note that `simpletexturedblock.json` is the exact same name as the name set in your unlocalizedName and RegistryName above!)

```json title="resources/assets/firstmod/models/block/simpletexturedblock.json"
{
  "parent": "block/cube_all",
  "textures": {
    "all": "modtut:blocks/blocktexture"
  }
}
```

Then don't forget to add a `blocktexture.png` texture in `assets/firstmod/textures/blocks`
