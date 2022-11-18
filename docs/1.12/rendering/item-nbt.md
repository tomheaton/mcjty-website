---
sidebar_position: 2
---

# Render Item NBT

In this tutorial we show you can render a different model depending on the current NBT of the item. Here we have an item that has two different possibilities depending on a flag in the NBT. If the tag 'blue' is present in the NBT then we show the 'blue' model. Otherwise we show the 'red' model. We solve this by defining different models based on the 'variant'. You can of course have more possibilities here.

This example is a bit more complex. It also adds code to switch between the mode by right clicking with the item in your hand.
```
<syntaxhighlight lang="java">
public class MultiModelItem extends Item {

    public MultiModelItem() {
        setRegistryName("multimodelitem");
        setUnlocalizedName(ModTut.MODID + ".multimodelitem");
    }

    @SideOnly(Side.CLIENT)
    public void initModel() {
        ModelResourceLocation blueModel = new ModelResourceLocation(getRegistryName() + "_blue", "inventory");
        ModelResourceLocation redModel = new ModelResourceLocation(getRegistryName() + "_red", "inventory");

        ModelBakery.registerItemVariants(this, blueModel, redModel);

        ModelLoader.setCustomMeshDefinition(this, new ItemMeshDefinition() {
            @Override
            public ModelResourceLocation getModelLocation(ItemStack stack) {
                if (isBlue(stack)) {
                    return blueModel;
                } else {
                    return redModel;
                }
            }
        });
    }

    private boolean isBlue(ItemStack stack) {
        return getTagCompoundSafe(stack).hasKey("blue");
    }

    @Override
    public ActionResult<ItemStack> onItemRightClick(World world, EntityPlayer playerIn, EnumHand hand) {
        if (!world.isRemote) {
            if (isBlue(stack)) {
                getTagCompoundSafe(stack).removeTag("blue");
            } else {
                getTagCompoundSafe(stack).setBoolean("blue", true);
            }
        }
        return new ActionResult<>(EnumActionResult.SUCCESS, stack);
    }

    private NBTTagCompound getTagCompoundSafe(ItemStack stack) {
        NBTTagCompound tagCompound = stack.getTagCompound();
        if (tagCompound == null) {
            tagCompound = new NBTTagCompound();
            stack.setTagCompound(tagCompound);
        }
        return tagCompound;
    }
}
</syntaxhighlight>
```
In addition to the myitem.json that we already added you also have to add a new json for the two models (multimodelitem_red.json and multimodelitem_blue.json):
```
 <nowiki>
{
  "parent": "item/generated",
  "textures": {
    "layer0": "modtut:items/itemtexture"
  }
}
</nowiki>

 <nowiki>
{
  "parent": "item/generated",
  "textures": {
    "layer0": "modtut:items/itemtexture_blue"
  }
}
</nowiki>
```
