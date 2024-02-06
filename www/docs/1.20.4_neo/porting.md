---
sidebar_position: 0
---

# Introduction

NeoForge decided to rewrite a few systems so porting a mod from Forge to NeoForge is not always trivial.
This tutorial will help you with that. Note that this is far from complete and
only touches a few areas that have changed.

## Build Setup

There are a few things you need to change in your build files.

### settings.gradle

Let's start with `settings.gradle`. Use the following template:

```gradle
pluginManagement {
    repositories {
        mavenLocal()
        gradlePluginPortal()
        maven { url = 'https://maven.neoforged.net/releases' }
    }
}

plugins {
    id 'org.gradle.toolchains.foojay-resolver-convention' version '0.5.0'
}
```

### gradle.properties

Then in `gradle.properties` you can have this. Of course change the versions to the versions you want to use.
This property file also enables parchment which makes it so that you get better names
for parameters in Minecraft code:

```properties
org.gradle.jvmargs=-Xmx3G
org.gradle.daemon=false

minecraft_version=1.20.4
minecraft_version_range=[1.20.4,1.21)
neo_version=20.4.151-beta
neo_version_range=[20.4,)
loader_version_range=[2,)

neogradle.subsystems.parchment.minecraftVersion=1.20.3
neogradle.subsystems.parchment.mappingsVersion=2023.12.31


## Mod Properties

mod_id=tut2block
mod_name=Tutorial 2 Block
mod_license=MIT
mod_version=1.0.0
mod_group_id=com.mcjty.tut2block
mod_authors=McJty
mod_description=Tutorial V4, Episode 2\nA more complex block

top_version=1.20.4_neo-11.0.1-2
jei_version=17.3.0.48
```

### build.gradle

Here is an example of a `build.gradle` file:

```gradle
plugins {
    id 'java-library'
    id 'eclipse'
    id 'idea'
    id 'maven-publish'
    id 'net.neoforged.gradle.userdev' version '7.0.80'
}

version = mod_version
group = mod_group_id

repositories {
    mavenLocal()
}

base {
    archivesName = mod_id
}

java.toolchain.languageVersion = JavaLanguageVersion.of(17)

runs {
    configureEach {
        systemProperty 'forge.logging.markers', 'REGISTRIES'
        systemProperty 'forge.logging.console.level', 'debug'
        modSource project.sourceSets.main
    }

    client {
        systemProperty 'forge.enabledGameTestNamespaces', project.mod_id
    }

    server {
        systemProperty 'forge.enabledGameTestNamespaces', project.mod_id
        programArgument '--nogui'
    }

    gameTestServer {
        systemProperty 'forge.enabledGameTestNamespaces', project.mod_id
    }

    data {
        programArguments.addAll '--mod', project.mod_id, '--all', '--output', file('src/generated/resources/').getAbsolutePath(), '--existing', file('src/main/resources/').getAbsolutePath()
    }
}

sourceSets.main.resources { srcDir 'src/generated/resources' }

repositories {
    maven { // JEI
        url "https://maven.blamejared.com"
    }
    maven { // TOP
        url "https://maven.k-4u.nl"
    }
}

dependencies {
    implementation "net.neoforged:neoforge:${neo_version}"

    compileOnly "mezz.jei:jei-${minecraft_version}-common-api:${jei_version}"
    compileOnly "mezz.jei:jei-${minecraft_version}-neoforge-api:${jei_version}"
    runtimeOnly "mezz.jei:jei-${minecraft_version}-neoforge:${jei_version}"

    implementation "mcjty.theoneprobe:theoneprobe:${top_version}"
}

tasks.withType(ProcessResources).configureEach {
    var replaceProperties = [
            minecraft_version   : minecraft_version, minecraft_version_range: minecraft_version_range,
            neo_version         : neo_version, neo_version_range: neo_version_range,
            loader_version_range: loader_version_range,
            mod_id              : mod_id, mod_name: mod_name, mod_license: mod_license, mod_version: mod_version,
            mod_authors         : mod_authors, mod_description: mod_description,
    ]
    inputs.properties replaceProperties

    filesMatching(['META-INF/mods.toml']) {
        expand replaceProperties + [project: project]
    }
}

jar {
    manifest {
        attributes([
                "Specification-Title"     : mod_id,
                "Specification-Vendor"    : mod_authors,
                "Specification-Version"   : "1", // We are version 1 of ourselves
                "Implementation-Title"    : project.name,
                "Implementation-Version"  : project.jar.archiveVersion,
                "Implementation-Vendor"   : mod_authors,
                "Implementation-Timestamp": new Date().format("yyyy-MM-dd'T'HH:mm:ssZ")
        ])
    }
}

jar.finalizedBy('reobfJar')

publishing {
    publications {
        mavenJava(MavenPublication) {
            artifact jar
        }
    }
    repositories {
        maven {
            url "file://${project.projectDir}/mcmodsrepo"
        }
    }
}

tasks.withType(JavaCompile).configureEach {
    options.encoding = 'UTF-8' // Use the UTF-8 charset for Java compilation
}
```

## The main mod file

A few things have changed in the main mod. First the mod constructor can now have
optional parameters:

* The mod bus can now be obtained through a parameter in the constructor
* The side at which the mod is running can be obtained through a parameter in the constructor

These parameters are optional. If you don't need them you don't have to use them. But here is
an example of a mod constructor that uses both parameters:

```java
    public MyMod(IEventBus modEventBus, Dist dist) {
        modEventBus.addListener(...);
        if (dist.isClient()) {
            ...
        }
    }
```

If you needed to register events on the forge bus then you have to use the
`NeoForge.EVENTBUS` now.

## Registration of objects

The registration of blocks, items, block entities and other registry objects
has also changed a bit. There are now a few possibilities:

For blocks and items there are basically three options. First option is to
use a simple supplier:

```java
    public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(BuiltInRegistries.BLOCK, MODID);
    public static final Supplier<Block> MY_BLOCK = BLOCKS.register("my_block", MyBlock::new);
```

Another option is to use the new `DeferredHolder`:

```java
    public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(BuiltInRegistries.BLOCK, MODID);
    public static final DeferredHolder<Block, MyBlock> MY_BLOCK = BLOCKS.register("my_block", MyBlock::new);
```

Only for blocks and items there is also the option to use a more compact version:

```java
    public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks(Tutorial2Block.MODID);
    public static final DeferredBlock<MyBlock> COMPLEX_BLOCK = BLOCKS.register("my_block", MyBlock::new);
```

## Networking

Networking has changed a lot. The `SimpleChannel` class is gone. More information
about this can be found at the [networking refactor documentation](https://neoforged.net/news/20.4networking-rework/).

In short, the easiest way to port your old networking code is to convert
every packet to a record like this:

```java
public record MyPacket(... fields ...) implements CustomPacketPayload {

    public static final ResourceLocation ID = new ResourceLocation(MODID, "unique_name");

    public static PacketHitToServer create(FriendlyByteBuf buf) {
        return new PacketHitToServer(... fields ...);
    }

    @Override
    public void write(FriendlyByteBuf buf) {
        // Write fields to the buffer
    }

    @Override
    public ResourceLocation id() {
        return ID;
    }

    public void handle(PlayPayloadContext ctx) {
        ctx.workHandler().submitAsync(() -> {
            // Handle the packet
        });
    }
}
```

Then you need to register this packet in the `RegisterPayloadHandlerEvent`.
In this example we register our packet as a packet that will be sent from
client to server. But the other way is also possible of course:

```java
    public static void onRegisterPayloadHandler(RegisterPayloadHandlerEvent event) {
        final IPayloadRegistrar registrar = event.registrar(MODID)
                .versioned("1.0")
                .optional();
        registrar.play(MyPacket.ID, MyPacket::create, handler -> handler
                .server(MyPacket::handle));
    }
```

This event has to be added to the mod event bus. You can do that in the constructor of
the mod like this:

```java
    public MyMod(IEventBus modEventBus, Dist dist) {
        modEventBus.addListener(this::onRegisterPayloadHandler);
    }
```

## Capabilities

Another system that has changed a lot in NeoForge is the capability system.
Read the [capability rework documentation](https://neoforged.net/news/20.3capability-rework/)
for more information. Important to note is that capabilities have now split in
two separate and independent systems. One is for adding data to objects (called
`Data attachments`) and the other is for adding behaviour (called `Capabilities`).

### Getting a standard capability from a block entity

In Forge you would use `blockentity.getCapability()` to get a capability from a block entity.
This is no longer the case. Block entity capabilities are now accessed from
the level like this:

```java
   IItemHandler handler = level.getCapability(Capabilities.ItemHandler.BLOCK, pos, direction);
```

Similar for energy and fluid capabilities.

### Adding a capability to a block entity

Adding a capability has also changed completely. Let's say you want to add an item
handler to a block entity. Here is some example code:

```java
public class MyBlockEntity extends BlockEntity {

    private final Lazy<IItemHandler> itemHandler = Lazy.of(() -> createItemHandler());

    @Nonnull
    private ItemStackHandler createItemHandler() {
        return new ItemStackHandler(SLOT_COUNT) {
            @Override
            protected void onContentsChanged(int slot) {
                setChanged();
                level.sendBlockUpdated(worldPosition, getBlockState(), getBlockState(), Block.UPDATE_ALL);
            }
        };
    }

    public IItemHandler getItemHandler() {
        return itemHandler.get();
    }
}
```

Then you need to register this in the `RegisterCapabilitiesEvent`:

```java
    public static void onRegisterCapabilities(RegisterCapabilitiesEvent event) {
        event.registerBlockEntity(Capabilities.ItemHandler.BLOCK, Registration.MY_BLOCK_ENTITY.get(), (o, direction) -> o.getItemHandler());
    }
```
This also has to be registered on the mod event bus:

```java
    public MyMod(IEventBus modEventBus, Dist dist) {
        modEventBus.addListener(this::onRegisterCapabilities);
    }
```

### Opening a gui

To open a gui server side you cannot use `NetworkHooks.openScreen()` anymore. Instead
you do:

```java
    player.openMenu(containerProvider, buf -> buf.writeBlockPos(pos));
```

And instead of `IForgeMenuType.create` you nave to use `IMenuTypeExtension.create`.

