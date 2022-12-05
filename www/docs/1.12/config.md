---
sidebar_position: 4
---

# Configuration

Almost all mods need some kind of config file where players can change how your mod is balanced. Adding a config file is very easy. In this tutorial we will show you how you can do this.

More explanation on the config system as well as an alternative way to do configs using annotations can be found here: https://mcforge.readthedocs.io/en/latest/config/annotations/

First we add a 'Config' class that will handle our configuration. In this example it is just a single class. In bigger mods you might want to structure your configuration classes differently and perhaps group them per module. In this example we make a config file with two sections (called categories). One is for general configuration and the other is for dimension configuration (currently unused).

**Automatic Creation:** It is important to note that the Forge configuration framework lets you access the config file without having to worry if it exists or not. It will automatically create the file for you if needed and add config options to it if needed. For example, if you later decide to add a new config option then you can just do that here and the config file will be automatically extended.

**Changing Defaults:** If you change the default value of a config option then this will not be reflected in the config file. You have to tell your users to manually delete the config file or else use another trick to force a reset if you have a config option that absolutely needs a different default. One way can be to rename the config. That way a new config will be created with the new default (but the old one will remain in already generated config files). Another way is to add versioning (another number that you add to your config).

**Server/Client config:** One final remark: the configuration file is read both on the server and the client side. Think about this when adding values that you need to use on both sides. For example, how much power a machine needs is a server side config but the client might also want to use this to display that information in a tooltip. If you have something like that you must either make sure that clients always have an up-to-date config file (because otherwise the tooltip would be wrong) or else send over the real information from the server to the clients with network packets.

```java
public class Config {

    private static final String CATEGORY_GENERAL = "general";
    private static final String CATEGORY_DIMENSIONS = "dimensions";

    // This values below you can access elsewhere in your mod:
    public static boolean isThisAGoodTutorial = true;
    public static String yourRealName = "Steve";

    // Call this from CommonProxy.preInit(). It will create our config if it doesn't
    // exist yet and read the values if it does exist.
    public static void readConfig() {
        Configuration cfg = CommonProxy.config;
        try {
            cfg.load();
            initGeneralConfig(cfg);
            initDimensionConfig(cfg);
        } catch (Exception e1) {
            ModTut.logger.log(Level.ERROR, "Problem loading config file!", e1);
        } finally {
            if (cfg.hasChanged()) {
                cfg.save();
            }
        }
    }

    private static void initGeneralConfig(Configuration cfg) {
        cfg.addCustomCategoryComment(CATEGORY_GENERAL, "General configuration");
        // cfg.getBoolean() will get the value in the config if it is already specified there. If not it will create the value.
        isThisAGoodTutorial = cfg.getBoolean("goodTutorial", CATEGORY_GENERAL, isThisAGoodTutorial, "Set to false if you don't like this tutorial");
        yourRealName = cfg.getString("realName", CATEGORY_GENERAL, yourRealName, "Set your real name here");
    }

    private static void initDimensionConfig(Configuration cfg) {
        cfg.addCustomCategoryComment(CATEGORY_DIMENSIONS, "Dimension configuration");
    }
}
```

We also have to add some things to our CommonProxy class.
We create a new configuration file in the directory given to us in the FMLPreInitializationEvent, and then we call Config.readConfig() to set it all up.
We also have to implement something in postInit() to make sure that when our config changes during init it gets saved as well:

```java
@Mod.EventBusSubscriber
public class CommonProxy {

    // Config instance
    public static Configuration config;

    public void preInit(FMLPreInitializationEvent e) {
        File directory = e.getModConfigurationDirectory();
        config = new Configuration(new File(directory.getPath(), "modtut.cfg"));
        Config.readConfig();

        ...
    }

    ...

    public void postInit(FMLPostInitializationEvent e) {
        if (config.hasChanged()) {
            config.save();
        }
    }
}
```
