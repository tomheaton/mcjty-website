---
sidebar_position: 8
---

# Recipes

The recipe system has changed a lot in 1.12. This is not a complete tutorial but should show you a few basics. The information here is not yet included in the ModTut GitHub and needs to be worked out more.

More information on recipes can be found at the official forge documentation: https://mcforge.readthedocs.io/en/latest/utilities/recipes/

Recipes are now handled through json. Here is how you can define a simple recipe (no code changes are required). Simply place this json (name doesn't matter) in assets/modname/recipes and it will work:
```
<syntaxhighlight lang="json">
{
  "result": {
    "item": "modtut:datablock"
  },
  "pattern": [
    "did",
    "ere",
    "did"
  ],
  "type": "forge:ore_shaped",
  "key": {
    "i": {
      "type": "forge:ore_dict",
      "ore": "dyeBlack"
    },
    "r": {
      "item": "minecraft:redstone"
    },
    "d": {
      "item": "minecraft:dirt",
      "data": 0
    },
    "e": {
      "item": "minecraft:emerald"
    }
  }
}
</syntaxhighlight>
```
There are many more possibilities. For more advanced recipes it is possible to supply your own recipe factories to the system. Here is an example of a recipe factory that allows you to define recipes to upgrade items. This allows the recipe to retain the NBT in the machine that you are upgrading which is normally not possible with the regular crafting recipes.

First we need to define a factory for these kinds of recipes like this:
```
<syntaxhighlight lang="java">
public class CopyNBTRecipeFactory implements IRecipeFactory {
    @Override
    public IRecipe parse(JsonContext context, JsonObject json) {
        ShapedOreRecipe recipe = ShapedOreRecipe.factory(context, json);

        ShapedPrimer primer = new ShapedPrimer();
        primer.width = recipe.getWidth();
        primer.height = recipe.getHeight();
        primer.mirrored = JsonUtils.getBoolean(json, "mirrored", true);
        primer.input = recipe.getIngredients();

        return new CopyNBTRecipe(new ResourceLocation(RFTools.MODID, "copy_nbt_crafting"), recipe.getRecipeOutput(), primer);
    }

    public static class CopyNBTRecipe extends ShapedOreRecipe {
        public CopyNBTRecipe(ResourceLocation group, ItemStack result, ShapedPrimer primer) {
            super(group, result, primer);
        }

        @Override
        @Nonnull
        public ItemStack getCraftingResult(@Nonnull InventoryCrafting var1) {
            ItemStack newOutput = this.output.copy();

            ItemStack itemstack = ItemStack.EMPTY;

            for (int i = 0; i < var1.getSizeInventory(); ++i) {
                ItemStack stack = var1.getStackInSlot(i);

                if (!stack.isEmpty()) {
                    if (stack.getItem() instanceof INBTPreservingIngredient) {
                        itemstack = stack;
                    } else if (Block.getBlockFromItem(stack.getItem()) instanceof INBTPreservingIngredient) {
                        itemstack = stack;
                    }
                }
            }

            if (itemstack.hasTagCompound()) {
                newOutput.setTagCompound(itemstack.getTagCompound().copy());
            }

            return newOutput;
        }
    }
}
</syntaxhighlight>
```
This code looks for an item/block that implements the INBTPreservingIngredient interface and will then copy the NBT from that item/block to the end result of the crafting operation. You need to define the interface for this. This is simply:
```
<syntaxhighlight lang="java">
public interface INBTPreservingIngredient {
}
</syntaxhighlight>
```
Just implement that interface in your Block or Item and this will work.

To actually use this in your recipes you have to use a json similar to this one:
```
<syntaxhighlight lang="json">
{
  "result": {
    "item": "modtut:super_machine"
  },
  "pattern": [
    " T ",
    "cMc",
    " T "
  ],
  "type": "modtut:copy_nbt",
  "key": {
    "c": {
      "item": "minecraft:crafting_table"
    },
    "T": {
      "item": "minecraft:redstone_torch"
    },
    "M": {
      "item": "modtut:simple_machine"
    }
  }
}
</syntaxhighlight>
```
The only thing that remains to be done is to tell the system what "modtut:copy_nbt" actually means. This can be done in a '_factories.json' file (has to be called that) which you put in your assets/modname/recipes directory as well:
```
<syntaxhighlight lang="json">
{
  "recipes": {
    "copy_nbt": "mcjty.modtut.crafting.CopyNBTRecipeFactory"
  }
}
</syntaxhighlight>
```
