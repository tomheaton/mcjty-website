In this chapter we show how to make a very basic first item.

More in-depth information on items can be found at the official forge documentation: https://mcforge.readthedocs.io/en/latest/items/items/
```
<syntaxhighlight lang="java">
public class FirstItem extends Item {

    public FirstItem() {
        setRegistryName("firstitem");        // The unique name (within your mod) that identifies this item
        setUnlocalizedName(ModTut.MODID + ".firstitem");     // Used for localization (en_US.lang)
    }

}
</syntaxhighlight>
```
Then it is recommended you have some centralized place where you hold all your items. It is common to call this ModItems. This is similar like how it worked for blocks. Note that you don't actually need to hold a reference to your item if you don't intend to reference it anywhere in code.
```
<syntaxhighlight lang="java">
public class ModItems {

    @GameRegistry.ObjectHolder("modtut:firstitem")
    public static FirstItem firstItem;
}
</syntaxhighlight>
```
It then is also required to register your item in CommonProxy:
```
<syntaxhighlight lang="java">
@Mod.EventBusSubscriber
public class CommonProxy {

    ...

    @SubscribeEvent
    public static void registerItems(RegistryEvent.Register<Item> event) {
        event.getRegistry().register(new FirstItem());
        ...
    }

}
</syntaxhighlight>
```