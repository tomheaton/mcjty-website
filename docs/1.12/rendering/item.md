---
sidebar_position: 1
---

# Render Item Basic

In order to have a basic model for our first item we need to make a json file and access this. Again there are many approaches that one can follow and this tutorial just presents one possibility:

First we have to extend our item class so that we can initialize where Minecraft can find our model. The name 'inventory' refers to the variant in the json. It is commonly used to indicate the model as it should render in the inventory itself:
```
<syntaxhighlight lang="java">
public class SimpleTexturedItem extends Item {

    public SimpleTexturedItem() {
        setRegistryName("simpletextureditem");
        setUnlocalizedName(ModTut.MODID + ".simpletextureditem");
    }

    @SideOnly(Side.CLIENT)
    public void initModel() {
        ModelLoader.setCustomModelResourceLocation(this, 0, new ModelResourceLocation(getRegistryName(), "inventory"));
    }
}
</syntaxhighlight >
```
This has to be called from within ClientProxy.preInit so you can add a method for this in ModItems:
```
<syntaxhighlight lang="java">
public class ModItems{

    @GameRegistry.ObjectHolder("modtut:simpletextureditem")
    public static SimpleTexturedItem simpleTexturedItem;

    @SideOnly(Side.CLIENT)
    public static void initModels() {
        simpleTexturedItem.initModel();
    }
}
</syntaxhighlight >
```
And the registration in the CommonProxy:
```
<syntaxhighlight lang="java">
@Mod.EventBusSubscriber
public class CommonProxy {

    ...

    @SubscribeEvent
    public static void registerItems(RegistryEvent.Register<Item> event) {
        event.getRegistry().register(new SimpleTexturedItem());
        ...
    }
}
</syntaxhighlight >
```
Also in ClientProxy:
```
<syntaxhighlight lang="java">
@Mod.EventBusSubscriber(Side.CLIENT)
public class ClientProxy extends CommonProxy {

    ...

    @SubscribeEvent
    public static void registerModels(ModelRegistryEvent event) {
        ModBlocks.initModels();
        ModItems.initModels();
    }


}
</syntaxhighlight >
```

Now the only thing left to do is to define your json file and add a texture. In this case we just need a single json file located in `main/resources/assets/<yourmod>/models/item/simpletextureditem.json`:
```
 <nowiki>
{
  "parent": "item/generated",
  "textures": {
    "layer0": "modtut:items/itemtexture"
  }
}
</nowiki>
```
Then add a texture file called 'itemtexture.png' in the directory `main/resources/assets/modtut/textures/items/itemtexture.png`
