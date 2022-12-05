---
sidebar_position: 1
---

# Episode 1

## Introduction

In this tutorial the basic principles of modding are explained.
You learn how to use the build system.
How to update Forge and get the basic mod going.

* Video: https://www.youtube.com/watch?v=gbhfKgAAmMM
* [Main Tutorial Index](./1.15.md)

## Useful Links

* GitHub: https://github.com/McJty/YouTubeModding14
* Forge: http://files.minecraftforge.net/
* Forge Forums: https://forums.minecraftforge.net/
* Official Forge Documentation: https://mcforge.readthedocs.io/en/1.15.x/
* Forge Discord: https://discord.gg/UvedJ9m
* McJty Discord: https://discord.gg/dRTtrdK
* Mappings: http://export.mcpbot.bspk.rs/
* Official Java Documentation: https://docs.oracle.com/javase/tutorial/
* Basic Java Tutorial: https://www.codecademy.com/learn/learn-java
* Online Java Course using assignments: https://java-programming.mooc.fi/

## Concepts

* **Mod**: a mod is a set of Java classes, usually distributed in a jar archive, which is designed to modify the Minecraft game. These days mods no longer directly modify Minecraft code, but instead they work through an API that sits on top of Minecraft. Two popular APIs (also called mod loaders) are Forge and Fabric. In this tutorial we focus on modding using Forge.

* **Mappings**: Minecraft ships with obfuscated names due to various reasons that are beyond the scope of this tutorial. In order to make the life of modders easier these names are first translated to SRG names. These are still not human-readable, but they are standard over different versions of Minecraft (as long as the signature of the method doesn't change and as long as it isn't a new method/class that didn't exist before). Finally, SRG names are mapped to human-readable names. This process is automated by the gradle setup, so you usually don't have to worry about it except for picking the appropriate version of the mappings.

* **Gradle**: Gradle is the build tool that is used to set up a mod project. It integrates well with both IntelliJ and Eclipse.

* **Registration**: Almost all Minecraft objects are represented by a registry. This includes blocks, tile entities, entities, items, biomes, dimensions, potions and so on. By using this registry it is possible for mods to add their own instances of these objects and by doing that extend the base game. Registration of these objects happens in a specific manner through events.

* **Client/Server**: Even when you run Minecraft in single player mode there is still an internal server that runs. When making a Minecraft mod you have to be aware of this dual sided nature at all times. A very solid explanation on this can be found in the official Forge documentation: https://mcforge.readthedocs.io/en/1.15.x/concepts/sides/

* **Events**: In order to prevent mods from having to make modifications to the internal Minecraft code, Forge added hooks to various locations in the Minecraft source code. This is done with events. Basically whenever something important happens in Minecraft (like a mob is attacked), Forge will call all registered events for that specific thing (like the attack event). These events can be provided by mods and by doing that these mods have a chance to act on that attack (like modify the damage or cancel the attack)

## Project Setup

Setup of Minecraft mod projects happens with gradle.
The `build.gradle` file ([here](https://github.com/McJty/YouTubeModding14/blob/master/build.gradle)) is the most important file for that.
In that file you set up dependencies, the version of Forge that you are using, the version of the mappings that you are using and so on.

## Mod Setup

For your actual mod you need at least the following files (besides build.gradle):

* [`MyTutorial.java`](https://github.com/McJty/YouTubeModding14/blob/master/src/main/java/com/mcjty/mytutorial/MyTutorial.java): this is the actual main mod class, and it's the first thing that fires up when your mod is activated.  In this class we first register our client and server configs (more on configs in a later episode). We also call our ''Registration.init()'' to fire up the registration system for our mod, and we register two callbacks that are automatically called at the right time (after registration) by Forge. The reason for the two callbacks is that one is server-side (is fired on the server and client) and one is client-side only (for things related to rendering). In theory, you can put all the mod in this single file but that's usually not recommended. How much you put in the main mod class and how much you put elsewhere is mostly a matter of taste. I personally prefer to keep the main mod file as small as possible.

* [`mods.toml`](https://github.com/McJty/YouTubeModding14/blob/master/src/main/resources/META-INF/mods.toml): this file describes your mod in more detail and how it relates to other mods. You define dependencies here (for example, you need at minimum this version of forge, you need another library mod, and so on) and you also give more meta information about your mod here. Check the file and the associated comments to see what's possible.

* [`pack.mcmeta`](https://github.com/McJty/YouTubeModding14/blob/master/src/main/resources/pack.mcmeta): this is another file that is needed to describe the structure of the resource folder (where all the textures and models are located)

## Helper Classes

As I prefer to keep the main mod file small and like to structure things in a neater way I split the rest of the mod setup in the following four classes:

* [`ModSetup.java`](https://github.com/McJty/YouTubeModding14/blob/master/src/main/java/com/mcjty/mytutorial/setup/ModSetup.java): this is where all the initialisation happens that needs to happen on both server and client side. It is in itself a class that also listens to events (through the Mod.EventBusSubscriber annotation). Most of this class will be explained in later episodes in the appropriate episodes. For now, you can leave this class mostly empty except for an empty `init()` method

* [`ClientSetup.java`](https://github.com/McJty/YouTubeModding14/blob/master/src/main/java/com/mcjty/mytutorial/setup/ClientSetup.java): this is similar to ModSetup except that it is only executed on the client. For now, you can also keep this class empty with an empty `init()` method

* [`Config.java`](https://github.com/McJty/YouTubeModding14/blob/master/src/main/java/com/mcjty/mytutorial/setup/Config.java): Configuration is handled in a future episode

* [`Registration.java`](https://github.com/McJty/YouTubeModding14/blob/master/src/main/java/com/mcjty/mytutorial/setup/Registration.java): Here is where the registration of our modded objects is done. More on that later
