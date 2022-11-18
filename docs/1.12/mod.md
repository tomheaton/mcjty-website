---
sidebar_position: 3
---

# Basic Mod

There many ways that you can structure your mod. This section just proposes one solution. The official forge documentation gives more in depth info here: https://mcforge.readthedocs.io/en/latest/gettingstarted/structuring/

First here is a minimal mod class:
```
<syntaxhighlight lang="java">
@Mod(modid = ModTut.MODID, name = ModTut.MODNAME, version = ModTut.MODVERSION, dependencies = "required-after:forge@[11.16.0.1865,)", useMetadata = true)
public class ModTut {

    public static final String MODID = "modtut";
    public static final String MODNAME = "Mod tutorials";
    public static final String MODVERSION= "0.0.1";

    @SidedProxy(clientSide = "mcjty.modtut.proxy.ClientProxy", serverSide = "mcjty.modtut.proxy.ServerProxy")
    public static CommonProxy proxy;

    @Mod.Instance
    public static ModTut instance;

    public static Logger logger;

    @Mod.EventHandler
    public void preInit(FMLPreInitializationEvent event) {
        logger = event.getModLog();
        proxy.preInit(event);
    }

    @Mod.EventHandler
    public void init(FMLInitializationEvent e) {
        proxy.init(e);
    }

    @Mod.EventHandler
    public void postInit(FMLPostInitializationEvent e) {
        proxy.postInit(e);
    }
}
</syntaxhighlight>
```
Now let's talk through what each part of the code does:
```
<syntaxhighlight lang="java">
@Mod(modid = ModTut.MODID, name = ModTut.MODNAME, version = ModTut.MODVERSION, dependencies = "required-after:Forge@[11.16.0.1865,)", useMetadata = true)
</syntaxhighlight>
```
The "@Mod" let's Forge know that this is a mod and it should treat it as such. The "modid" tells forge what id it should use for your mod, in this case it references a string. The "name" part is the readable name that will be displayed, again this references a string. The "dependencies" part shows what mod(s) this mod depends on (what other mod(s) must be there for this to run), in this case Forge 11.15.0.1634. The "useMetadata" determines whether Forge should use the [[mcmod.info]] file to override the other settings in the annotation.
```
<syntaxhighlight lang="java">
    public static final String MODID = "modtut";
    public static final String MODNAME = "Mod tutorials";
    public static final String MODVERSION = "0.0.1";
</syntaxhighlight>
```
These are the strings referenced back in "@Mod". They say that the "MODID" is "modtut", the "MODNAME" is "Mod tutorials", and the VERSION is "0.0.1".
```
<syntaxhighlight lang="java">
    @SidedProxy(clientSide = "mcjty.modtut.proxy.ClientProxy", serverSide = "mcjty.modtut.proxy.ServerProxy")
    public static CommonProxy proxy;
</syntaxhighlight>
```
This part sets up the proxies which will be explained later
```
<syntaxhighlight lang="java">
    @Mod.Instance
    public static ModTut instance;
</syntaxhighlight>
```
This creates the mod instance by telling Forge it should run the ModTut class.
```
<syntaxhighlight lang="java">
    @Mod.EventHandler
    public void preInit(FMLPreInitializationEvent event) {
        logger = event.getModLog();
        proxy.preInit(event);
    }

    @Mod.EventHandler
    public void init(FMLInitializationEvent e) {
        proxy.init(e);
    }

    @Mod.EventHandler
    public void postInit(FMLPostInitializationEvent e) {
        proxy.postInit(e);
    }
</syntaxhighlight>
```
This large part sets up the running of parts of the mod during preInit, Init and postInit. It also set's up a logger for the mod to print to the console

You also need proxy classes. These classes take care of doing the init of your mod and make sure the right things get done at the right 'side' (i.e. server versus client). It is considered good practice to work like this. Note that in many cases you can use CommonProxy for the server side since most things you want to init on the server you have to init client side as well. These proxies use @Mod.EventBusSubscribers so that they are automatically put on the forge event bus. That way the events for block, item, and model registration will get a chance to register early enough (preInit time)
```
<syntaxhighlight lang="java">
@Mod.EventBusSubscriber
public class CommonProxy {
    public void preInit(FMLPreInitializationEvent e) {
    }

    public void init(FMLInitializationEvent e) {
    }

    public void postInit(FMLPostInitializationEvent e) {
    }

    @SubscribeEvent
    public static void registerBlocks(RegistryEvent.Register<Block> event) {
    }

    @SubscribeEvent
    public static void registerItems(RegistryEvent.Register<Item> event) {
    }
}


@Mod.EventBusSubscriber(Side.CLIENT)
public class ClientProxy extends CommonProxy {
@Override
public void preInit(FMLPreInitializationEvent e) {
super.preInit(e);
}

    @SubscribeEvent
    public static void registerModels(ModelRegistryEvent event) {
    }
}

public class ServerProxy extends CommonProxy {

}
</syntaxhighlight>
```
