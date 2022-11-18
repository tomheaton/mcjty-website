---
sidebar_position: 2
---

# API - WAILA

Just like you can interface with The One Probe you can of course also do this for WAILA (actually Hwyla for 1.12).
Again you have to modify your `build.gradle`:

```gradle title="build.gradle"
repositories {
    maven { // The repo from which to get waila
        name "Mobius Repo"
        url "http://tehnut.info/maven"
    }
    maven { // TOP
        name 'tterrag maven'
        url "http://maven.tterrag.com/"
    }
}

...

dependencies {
    deobfCompile "mcp.mobius.waila:Hwyla:1.8.18-B32_1.12:api"
    deobfCompile "mcjty.theoneprobe:TheOneProbe-1.12:1.12-1.4.11-5"
}
```

Now we add a WailaCompatibility class and also a WailaInfoProvider interface similar to how we did it with TOP:

```java
public class WailaCompatibility implements IWailaDataProvider {

    public static final WailaCompatibility INSTANCE = new WailaCompatibility();

    private WailaCompatibility() {}

    private static boolean registered;
    private static boolean loaded;

    public static void load(IWailaRegistrar registrar) {
        System.out.println("WailaCompatibility.load");
        if (!registered){
            throw new RuntimeException("Please register this handler using the provided method.");
        }
        if (!loaded) {
            registrar.registerHeadProvider(INSTANCE, DataBlock.class);
            registrar.registerBodyProvider(INSTANCE, DataBlock.class);
            registrar.registerTailProvider(INSTANCE, DataBlock.class);
            loaded = true;
        }
    }

    public static void register(){
        if (registered)
            return;
        registered = true;
        FMLInterModComms.sendMessage("Waila", "register", "mcjty.modtut.compat.waila.WailaCompatibility.load");
    }

    @Override
    public NBTTagCompound getNBTData(EntityPlayerMP player, TileEntity te, NBTTagCompound tag, World world, BlockPos pos) {
        return tag;
    }

    @Override
    public ItemStack getWailaStack(IWailaDataAccessor accessor, IWailaConfigHandler config) {
        return null;
    }

    @Override
    public List<String> getWailaHead(ItemStack itemStack, List<String> currenttip, IWailaDataAccessor accessor, IWailaConfigHandler config) {
        return currenttip;
    }

    @Override
    public List<String> getWailaBody(ItemStack itemStack, List<String> currenttip, IWailaDataAccessor accessor, IWailaConfigHandler config) {
        Block block = accessor.getBlock();
        if (block instanceof WailaInfoProvider) {
            return ((WailaInfoProvider) block).getWailaBody(itemStack, currenttip, accessor, config);
        }
        return currenttip;
    }

    @Override
    public List<String> getWailaTail(ItemStack itemStack, List<String> currenttip, IWailaDataAccessor accessor, IWailaConfigHandler config) {
        return currenttip;
    }

}

public interface WailaInfoProvider {
    List<String> getWailaBody(ItemStack itemStack, List<String> currenttip, IWailaDataAccessor accessor, IWailaConfigHandler config);
}
```

Then we alter the MainCompatHandler class to add a method for WAILA:

```java
public class MainCompatHandler {
    public static void registerWaila() {
        if (Loader.isModLoaded("Waila")) {
            WailaCompatibility.register();
        }
    }

    public static void registerTOP() {
        if (Loader.isModLoaded("theoneprobe")) {
            TOPCompatibility.register();
        }
    }
}
```

And finally we have to call registerWaila somewhere.
We do that in CommonProxy:

```java title="CommonProxy.java"
public static class CommonProxy {
    public void preInit(FMLPreInitializationEvent e) {
        ...
        MainCompatHandler.registerWaila();
        MainCompatHandler.registerTOP();
    }
```

Then we add support in our DataBlock.
It is important to note that (in contrast with The One Probe) the getWailaBody method is called on the client side.
That means we can't easily access information that is only present on the server.
And since our DataBlock does not sync its counter value to the client the WAILA tooltip will always show 0.
There are ways to fix this with packets:

```java
public class DataBlock extends Block implements ITileEntityProvider, TOPInfoProvider, WailaInfoProvider {

    ...

    @Override
    public List<String> getWailaBody(ItemStack itemStack, List<String> currenttip, IWailaDataAccessor accessor, IWailaConfigHandler config) {
        TileEntity te = accessor.getTileEntity();
        if (te instanceof DataTileEntity) {
            DataTileEntity dataTileEntity = (DataTileEntity) te;
            currenttip.add(TextFormatting.GRAY + "Counter: " + dataTileEntity.getCounter());
        }
        return currenttip;
    }
```
