---
sidebar_position: 2
---

# Episode 2

## Links

* Video: n.a.
* [Back to 1.20 Tutorial Index](./1.20.md)
* [Tutorial GitHub](https://github.com/McJty/Tut4_2Block)

## Introduction

In this episode we will create a simple block and a more complex block with associated block entity.
We will use datagen to generate the jsons for both blocks and we will create a renderer for the complex block.
This tutorial will also use a capability for the items that are stored in the block entity.

We will also clean up the gradle and mod setup stuff a bit.

## The main mod class

In this tutorial we greatly simplified the main mod class. Most of the things we did here are now
done in other classes. We removed the client specific setup. This is now in a different file.
We moved all registration stuff to the Registration class. Finally we removed all things we don't
need right now.

```java
@Mod(Tutorial2Block.MODID)
public class Tutorial2Block {

    public static final String MODID = "tut2block";
    public static final Logger LOGGER = LogUtils.getLogger();

    public Tutorial2Block() {
        IEventBus modEventBus = FMLJavaModLoadingContext.get().getModEventBus();
        Registration.init(modEventBus);

        modEventBus.addListener(this::commonSetup);
        modEventBus.addListener(Registration::addCreative);
        modEventBus.addListener(DataGeneration::generate);
    }

    private void commonSetup(final FMLCommonSetupEvent event) {
    }
}
```

