==Links==

* [https://www.youtube.com/watch?v=e8CdEqQ4hRM&ab_channel=JorritTyberghein Configuration]
* [[YouTube-Tutorials-18|Back to 1.18 Tutorial Index]]
* [https://github.com/McJty/TutorialV3 Tutorial GitHub]

==Introduction==

In this tutorial we explain how you can allow users to configure your mod. The Forge config system uses toml files for configuration. There are three types of configuration:

* Client: client side configs are only relevant for the client. They are usually related to rendering, sound, and other things that are pure client side. The server doesn't know about these. These config files can be found in the config directoryof the Minecraft instance and so are global over all worlds (single and multi player)
* Common: common configs are loaded on both the server and the client and are also stored in the global config directory. They are NOT synced which means that the client side version of these configs can differ from the server side version
* Server: server configs are stored with the server instance (or with the world). They are stored in each `<world>/serverconfig` directory. Server configs are synced to the clients during connection but a client cannot override them. Note that all configs in the global defaultconfigs directory are automatically used for any new world

So when do you choose common and when do you choose server? Basically server should be the default because that way configs can be different depending on which server you play on. It's the most flexible technique. However for things like worldgen you need to put it in common since server side config doesn't exist yet when the world is first created.

===Basic Setup===

There are many ways to setup configuration for your mod. In this tutorial we present you one option. Start by making a Config class in the setup package ([https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/setup/Config.java Config.java on Github]). In this class we use the ForgeConfigSpec helper from Forge to generate configs for client, common, and server. We also split the actual setup of the configuration keys for each module in a separate file for clarity:
```
 <syntaxhighlight lang="java">
public class Config {

    public static void register() {
        registerServerConfigs();
        registerCommonConfigs();
        registerClientConfigs();
    }

    private static void registerClientConfigs() {
        ForgeConfigSpec.Builder CLIENT_BUILDER = new ForgeConfigSpec.Builder();
        PowergenConfig.registerClientConfig(CLIENT_BUILDER);
        ModLoadingContext.get().registerConfig(ModConfig.Type.CLIENT, CLIENT_BUILDER.build());
    }

    private static void registerCommonConfigs() {
        ForgeConfigSpec.Builder COMMON_BUILDER = new ForgeConfigSpec.Builder();
        OresConfig.registerCommonConfig(COMMON_BUILDER);
        ModLoadingContext.get().registerConfig(ModConfig.Type.COMMON, COMMON_BUILDER.build());
    }

    private static void registerServerConfigs() {
        ForgeConfigSpec.Builder SERVER_BUILDER = new ForgeConfigSpec.Builder();
        GeneratorConfig.registerServerConfig(SERVER_BUILDER);
        PowergenConfig.registerServerConfig(SERVER_BUILDER);
        ModLoadingContext.get().registerConfig(ModConfig.Type.SERVER, SERVER_BUILDER.build());
    }
}
</syntaxhighlight>
```
In our main mod file we call Config.register like this:
```
 <syntaxhighlight lang="java">
    public TutorialV3() {

        Registration.init();
        Config.register();

        ...
    }
</syntaxhighlight>
```
A very important note about order here. Even though there seems to be an order here. i.e. first we call Registration.init() and then we call Config.register() that order is actually not important. The only thing both setup methods do is make sure that registration and configuration will kick in at the right time during mod setup. It's up to Forge to decide when this happens. And configuration occurs AFTER registration. This means that you should not use configuration to enable or disable registration of certain objects in your mod. Always register all objects. If you need a config to disable something then either do that through datapacks (disabling the recipe) or perhaps use conditional recipes (more on that in a possible future tutorial).

{{warning|1=Configuration happens AFTER registration but BEFORE FMLCommonSetupEvent!}}

{{warning|1=Server type configuration happens AFTER the world is loaded!}}

===Config Modules===

In this section we will describe the different config modules:

====Powergen Config====

The powergen configuration ([https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/blocks/PowergenConfig.java PowergenConfig.java on Github]) has server config values and one client side config value. To declare these you use `ForgeConfigSpec.<Xxx>Value`. Toml files are structured. For every module we use 'push' and 'pop' to better structure our config file and make sure that settings that belong together are in the same section:
```
 <syntaxhighlight lang="java">
public class PowergenConfig {

    public static ForgeConfigSpec.IntValue POWERGEN_CAPACITY;
    public static ForgeConfigSpec.IntValue POWERGEN_GENERATE;
    public static ForgeConfigSpec.IntValue POWERGEN_SEND;

    public static ForgeConfigSpec.DoubleValue RENDER_SCALE;

    public static void registerServerConfig(ForgeConfigSpec.Builder SERVER_BUILDER) {
        SERVER_BUILDER.comment("Settings for the power generator").push("powergen");

        POWERGEN_CAPACITY = SERVER_BUILDER
                .comment("How much energy fits into the power generator")
                .defineInRange("capacity", 50000, 1, Integer.MAX_VALUE);
        POWERGEN_GENERATE = SERVER_BUILDER
                .comment("How much energy is generated by the power generator")
                .defineInRange("generate", 60, 1, Integer.MAX_VALUE);
        POWERGEN_SEND = SERVER_BUILDER
                .comment("How much energy the power generator will send out to adjacent blocks every tick")
                .defineInRange("send", 200, 1, Integer.MAX_VALUE);

        SERVER_BUILDER.pop();
    }

    public static void registerClientConfig(ForgeConfigSpec.Builder CLIENT_BUILDER) {
        CLIENT_BUILDER.comment("Client settings for the power generator").push("powergen");

        RENDER_SCALE = CLIENT_BUILDER
                .comment("Scale of the renderer")
                .defineInRange("scale", .3, 0.000001, 1000.0);

        CLIENT_BUILDER.pop();
    }
}
</syntaxhighlight>
```
====Others====

It's similar in the other modules. Check the github for those.

===Using the config===

To actually use the config you just need to do .get() on the config value like this:
```
 <syntaxhighlight lang="java">
    public void tickServer() {
        if (counter > 0) {
            energyStorage.addEnergy(PowergenConfig.POWERGEN_GENERATE.get());
            counter--;
            setChanged();
        }
</syntaxhighlight>
```
Note that you can also use .set() to set a value and this will automatically update the config file.
