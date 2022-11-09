The One Probe is a mod that shows an overlay on screen giving information on the object that the player is looking at. It is similar to WAILA but more immersive as it needs an actual probe to show this information (note that this requirement can be disabled in the config). More information about TOP can be found on the wiki: https://github.com/McJty/TheOneProbe/wiki and you can download it from: http://mods.curse.com/mc-mods/minecraft/245211-the-one-probe

It is very easy to add support for your mod for The One Probe. In this tutorial we will show how you can do this without getting a hard dependency on the mod.

First you need to alter build.gradle so that The One Probe mod and API is automatically included in your project. You need to add an entry for the TOP maven to the repositories as well as add a dependency:
```
<syntaxhighlight lang="gradle">
repositories {
    maven { // TOP
        name 'tterrag maven'
        url "http://maven.tterrag.com/"
    }
}

...

dependencies {
deobfCompile "mcjty.theoneprobe:TheOneProbe-1.12:1.12-1.4.14-7"
}
</syntaxhighlight >
```
Then use gradlew or your integration with IDEA or Eclipse to setup your project again and you should automatically get TOP when you run Minecraft from your development environment.


The next thing you have to do is to make sure that TOP integration is enabled in your mod but only when the TOP mod is actually loaded. There are many ways to do this. Here we show one of them. First we add a TOPCompatibility class. This class will send a message (using the forge IMC system) to The One Probe including as a parameter the name of the class that will be called back with the needed API information. That class is in this case an inner class of TOPCompatibility called GetTheOneProbe. Inside that callback class we get access to the ITheOneProbe API and by that we can register our own custom provider for TOP tooltips. This provider will check if the block implements TOPInfoProvider and if that is the case it will call the method in that interface to update the probe tooltip:
```
<syntaxhighlight lang="java">
public class TOPCompatibility {

    private static boolean registered;

    public static void register() {
        if (registered)
            return;
        registered = true;
        FMLInterModComms.sendFunctionMessage("theoneprobe", "getTheOneProbe", "mcjty.modtut.compat.top.TOPCompatibility$GetTheOneProbe");
    }


    public static class GetTheOneProbe implements Function<ITheOneProbe, Void> {

        public static ITheOneProbe probe;

        @Nullable
        @Override
        public Void apply(ITheOneProbe theOneProbe) {
            probe = theOneProbe;
            ModTut.logger.log(Level.INFO, "Enabled support for The One Probe");
            probe.registerProvider(new IProbeInfoProvider() {
                @Override
                public String getID() {
                    return "modtut:default";
                }

                @Override
                public void addProbeInfo(ProbeMode mode, IProbeInfo probeInfo, EntityPlayer player, World world, IBlockState blockState, IProbeHitData data) {
                    if (blockState.getBlock() instanceof TOPInfoProvider) {
                        TOPInfoProvider provider = (TOPInfoProvider) blockState.getBlock();
                        provider.addProbeInfo(mode, probeInfo, player, world, blockState, data);
                    }

                }
            });
            return null;
        }
    }
}
</syntaxhighlight >
```
The TOPInfoProvider interface is very simple:
```
<syntaxhighlight lang="java">
public interface TOPInfoProvider {
    void addProbeInfo(ProbeMode mode, IProbeInfo probeInfo, EntityPlayer player, World world, IBlockState blockState, IProbeHitData data);
}
</syntaxhighlight >
```
Then we add a MainCompatHandler class which will handle compatibility with all mods that we need (TOP, WAILA, ...):
```
<syntaxhighlight lang="java">
public class MainCompatHandler {
    public static void registerTOP() {
        if (Loader.isModLoaded("theoneprobe")) {
            TOPCompatibility.register();
        }
    }

}
</syntaxhighlight >
```
And finally we have to call registerTOP somewhere. We do that in CommonProxy:
```
<syntaxhighlight lang="java">
    public static class CommonProxy {
        public void preInit(FMLPreInitializationEvent e) {
            ...
            MainCompatHandler.registerTOP();
        }
</syntaxhighlight >
```

As an example we will use the DataBlock from a previous tutorial to show what you can do with this API. First make sure our block implements the new TOPInfoProvider interface and then we implement the addProbeInfo() method. It is important to note that that method will always be called server side. That way we don't have to go to extra trouble to fetch information from the server. We can just access everything, including our tile entity directly from this method.
```
<syntaxhighlight lang="java">
public class DataBlock extends Block implements ITileEntityProvider, TOPInfoProvider {

...

    @Override
    public void addProbeInfo(ProbeMode mode, IProbeInfo probeInfo, EntityPlayer player, World world, IBlockState blockState, IProbeHitData data) {
        TileEntity te = world.getTileEntity(data.getPos());
        if (te instanceof DataTileEntity) {
            // If we are sure that the entity there is correct we can proceed:
            DataTileEntity dataTileEntity = (DataTileEntity) te;
            // First add a horizontal line showing the clock item followed by current contents of the counter in the tile entity
            probeInfo.horizontal()
                    .item(new ItemStack(Items.CLOCK))
                    .text(TextFormatting.GREEN + "Counter: " + dataTileEntity.getCounter());
            // Then add another line with a border. Inside the border there will be a horse and the counter shown as a progress bar
            probeInfo.horizontal(probeInfo.defaultLayoutStyle().borderColor(0xffff0000))
                    .entity("minecraft:horse")
                    .progress(dataTileEntity.getCounter() % 100, 100, probeInfo.defaultProgressStyle().suffix("%"));
        }
    }



...
}
</syntaxhighlight >
```
We also have to add a public getter for counter to our tile entity:
```
<syntaxhighlight lang="java">
public class DataTileEntity extends TileEntity {

...

    public int getCounter() {
        return counter;
    }
</syntaxhighlight >
```

The end result looks like this:
```
<img src="http://i.imgur.com/i0rYFr7.png" alt="The One Probe">
```