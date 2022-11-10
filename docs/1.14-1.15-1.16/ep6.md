---
sidebar_position: 6
---

# Episode 6

Back: [Index](/1.14-1.15-1.16/1.14-1.15-1.16.md)

===Calling markDirty===

Something we forgot to do last episode is calling markDirty() when something in our inventory handler changes. Calling TileEntity.markDirty() has to be done whenever something changes so that Minecraft knows that it has to save this tile entity when the world is saved.

To fix this we change our createItemHandler (in FirstBlockTile) as follows:
```
<syntaxhighlight lang="java">
    private IItemHandler createHandler() {
        return new ItemStackHandler(1) {

            @Override
            protected void onContentsChanged(int slot) {
                markDirty();
            }

            ...
        };
    }
</syntaxhighlight>
```
For our energy storage we don't have to do this since we control that ourselves (no other device can insert or extract power, this is all done in our tick function).

===Sending out Power===

Forge Energy typically works with a 'push' system. That means that power generators and energy cells push power to nearby machines. It is not the machines that extract power out of a generator. To implement this functionality we have to change our tick method as follows:
```
<syntaxhighlight lang="java">
    @Override
    public void tick() {
        if (world.isRemote) {
            return;
        }

        if (counter > 0) {
            counter--;
            if (counter <= 0) {
                energy.ifPresent(e -> ((CustomEnergyStorage) e).addEnergy(1000));
            }
            markDirty();
        }

        if (counter <= 0) {
            handler.ifPresent(h -> {
                ItemStack stack = h.getStackInSlot(0);
                if (stack.getItem() == Items.DIAMOND) {
                    h.extractItem(0, 1, false);
                    counter = 20;
                    markDirty();
                }
            });
        }

        sendOutPower();
    }
</syntaxhighlight>
```
We changed the if structure a bit so that we can immediatelly start extracting a new diamond as soon as the previous one has done generating (the reason for that is so that our machine doesn't temporarily turn off for one tick, this is important for a later part of this tutorial). We also call a new sendOutPower method:
```
<syntaxhighlight lang="java">
    private void sendOutPower() {
        energy.ifPresent(energy -> {
            AtomicInteger capacity = new AtomicInteger(energy.getEnergyStored());
            if (capacity.get() > 0) {
                for (Direction direction : Direction.values()) {
                    TileEntity te = world.getTileEntity(pos.offset(direction));
                    if (te != null) {
                        boolean doContinue = te.getCapability(CapabilityEnergy.ENERGY, direction).map(handler -> {
                                    if (handler.canReceive()) {
                                        int received = handler.receiveEnergy(Math.min(capacity.get(), 100), false);
                                        capacity.addAndGet(-received);
                                        ((CustomEnergyStorage) energy).consumeEnergy(received);
                                        markDirty();
                                        return capacity.get() > 0;
                                    } else {
                                        return true;
                                    }
                                }
                        ).orElse(true);
                        if (!doContinue) {
                            return;
                        }
                    }
                }
            }
        });
    }
</syntaxhighlight>
```
This function will (if there is any power present in our generator) loop over all six directions and check if there is a power receiver there that is willing to get power from us. Our map function that we use for handling the capability will return true in case we still have enough power to check the next direction. That way we can exit early if power is depleted. We use an AtomicInteger for our capacity because it is possible to modify those from inside a lambda.

This should make it send out power. We will test this later when we actually have a machine that can accept power.

===Configuration===

We are using a lot of hardcoded values inside our block. It would be much better if you could configure them. Add a new Config class as follows:
```
<syntaxhighlight lang="java">
@Mod.EventBusSubscriber
public class Config {

    public static final String CATEGORY_GENERAL = "general";
    public static final String CATEGORY_POWER = "power";
    public static final String SUBCATEGORY_FIRSTBLOCK = "firstblock";

    private static final ForgeConfigSpec.Builder COMMON_BUILDER = new ForgeConfigSpec.Builder();
    private static final ForgeConfigSpec.Builder CLIENT_BUILDER = new ForgeConfigSpec.Builder();

    public static ForgeConfigSpec COMMON_CONFIG;
    public static ForgeConfigSpec CLIENT_CONFIG;


    public static ForgeConfigSpec.IntValue FIRSTBLOCK_MAXPOWER;
    public static ForgeConfigSpec.IntValue FIRSTBLOCK_GENERATE;
    public static ForgeConfigSpec.IntValue FIRSTBLOCK_SEND;
    public static ForgeConfigSpec.IntValue FIRSTBLOCK_TICKS;


    static {

        COMMON_BUILDER.comment("General settings").push(CATEGORY_GENERAL);
        COMMON_BUILDER.pop();

        COMMON_BUILDER.comment("Power settings").push(CATEGORY_POWER);

        setupFirstBlockConfig();

        COMMON_BUILDER.pop();


        COMMON_CONFIG = COMMON_BUILDER.build();
        CLIENT_CONFIG = CLIENT_BUILDER.build();
    }

    private static void setupFirstBlockConfig() {
        COMMON_BUILDER.comment("FirstBlock settings").push(SUBCATEGORY_FIRSTBLOCK);

        FIRSTBLOCK_MAXPOWER = COMMON_BUILDER.comment("Maximum power for the FirstBlock generator")
                .defineInRange("maxPower", 100000, 0, Integer.MAX_VALUE);
        FIRSTBLOCK_GENERATE = COMMON_BUILDER.comment("Power generation per diamond")
                .defineInRange("generate", 1000, 0, Integer.MAX_VALUE);
        FIRSTBLOCK_SEND = COMMON_BUILDER.comment("Power generation to send per tick")
                .defineInRange("send", 100, 0, Integer.MAX_VALUE);
        FIRSTBLOCK_TICKS = COMMON_BUILDER.comment("Ticks per diamond")
                .defineInRange("ticks", 20, 0, Integer.MAX_VALUE);

        COMMON_BUILDER.pop();
    }

    public static void loadConfig(ForgeConfigSpec spec, Path path) {

        final CommentedFileConfig configData = CommentedFileConfig.builder(path)
                .sync()
                .autosave()
                .writingMode(WritingMode.REPLACE)
                .build();

        configData.load();
        spec.setConfig(configData);
    }

    @SubscribeEvent
    public static void onLoad(final ModConfig.Loading configEvent) {

    }

    @SubscribeEvent
    public static void onReload(final ModConfig.ConfigReloading configEvent) {
    }

}
</syntaxhighlight>
```
In this config class we define four configurable values. Using push/pop we can define categories inside our config. The common config is used both client and server side. We don't use any client side configs yet.

The onLoad and onReload event handlers can be useful in case you want to do some calculations based on config values.

In the constructor of our mod we add the following lines:
```
<syntaxhighlight lang="java">
    public MyTutorial() {
        ModLoadingContext.get().registerConfig(ModConfig.Type.CLIENT, Config.CLIENT_CONFIG);
        ModLoadingContext.get().registerConfig(ModConfig.Type.COMMON, Config.COMMON_CONFIG);

        // Register the setup method for modloading
        FMLJavaModLoadingContext.get().getModEventBus().addListener(this::setup);

        Config.loadConfig(Config.CLIENT_CONFIG, FMLPaths.CONFIGDIR.get().resolve("mytutorial-client.toml"));
        Config.loadConfig(Config.COMMON_CONFIG, FMLPaths.CONFIGDIR.get().resolve("mytutorial-common.toml"));
    }
</syntaxhighlight>
```
The first two lines do the actual registration of our config while the two last lines make sure the configs are loaded/saved to disk. Doing this in the constructor has the advantage that the config values will be usable at every future stage (during registration and initialization of our mod).


To use the new config values in our tile entity we have to make the following modifications to FirstBlockTile:
```
<syntaxhighlight lang="java">
public class FirstBlockTile extends TileEntity implements ITickableTileEntity, INamedContainerProvider {

    ...

    @Override
    public void tick() {

        ...
        energy.ifPresent(e -> ((CustomEnergyStorage) e).addEnergy(Config.FIRSTBLOCK_GENERATE.get()));
        ...
    }

</syntaxhighlight>
```
So basically everywhere that you use a hardcoded value you can change it with the config value. Check out the github for the other locations that were changed.


===Front panel animation===

It would be nice if our power generation actually had a different front panel when it is generating power. To do that we need to add a new property to our block. Modify FirstBlock as follows:
```
<syntaxhighlight lang="java">
public class FirstBlock extends Block {

    ...

    @Override
    public int getLightValue(BlockState state) {
        return state.get(BlockStateProperties.POWERED) ? super.getLightValue(state) : 0;
    }

    ...

    @Override
    protected void fillStateContainer(StateContainer.Builder<Block, BlockState> builder) {
        builder.add(BlockStateProperties.FACING, BlockStateProperties.POWERED);
    }

    ...

}
</syntaxhighlight>
```
So basically we use a new property (POWERED) and we also change the light value from our block to zero when it is not powered.

We need to add a new model with a different front face (see GitHub) and the blockstate we modify as follows:
```
<syntaxhighlight lang="json">
{
  "variants": {
    "facing=north,powered=false": { "model": "mytutorial:block/firstblock" },
    "facing=south,powered=false": { "model": "mytutorial:block/firstblock", "y": 180 },
    "facing=west,powered=false": { "model": "mytutorial:block/firstblock", "y": 270 },
    "facing=east,powered=false": { "model": "mytutorial:block/firstblock", "y": 90 },
    "facing=up,powered=false": { "model": "mytutorial:block/firstblock", "x": -90 },
    "facing=down,powered=false": { "model": "mytutorial:block/firstblock", "x": 90 },
    "facing=north,powered=true": { "model": "mytutorial:block/firstblock_powered" },
    "facing=south,powered=true": { "model": "mytutorial:block/firstblock_powered", "y": 180 },
    "facing=west,powered=true": { "model": "mytutorial:block/firstblock_powered", "y": 270 },
    "facing=east,powered=true": { "model": "mytutorial:block/firstblock_powered", "y": 90 },
    "facing=up,powered=true": { "model": "mytutorial:block/firstblock_powered", "x": -90 },
    "facing=down,powered=true": { "model": "mytutorial:block/firstblock_powered", "x": 90 }
  }
}
</syntaxhighlight>
```
Finally we need to modify our tile entity to actually set this property when it is generating power. Modify FirstBlockTile as follows:
```
<syntaxhighlight lang="java">
    @Override
    public void tick() {

        ...

        BlockState blockState = world.getBlockState(pos);
        if (blockState.get(BlockStateProperties.POWERED) != counter > 0) {
            world.setBlockState(pos, blockState.with(BlockStateProperties.POWERED, counter > 0), 3);
        }

        sendOutPower();
    }
</syntaxhighlight>
```
To prevent unneeded changing of our blockstate we make sure to compare our current value of POWERED with the desired value. Only if it is different do we call world.setBlockState. Make sure to use flag 3 to notify the client that this changed (tick is only working server side in our case).
