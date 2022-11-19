---
sidebar_position: 2
---

# Episode 2

## Introduction

After setting up the basic mod in the previous episode it is now time to add a block.
This block has properties for direction and being powered or not.
It has an inventory and it can generate power.
Capabilities are explained as well as the DeferredRegistry for registering Minecraft things:

* Video: https://www.youtube.com/watch?v=r2JxNEZa58A
* [Main Tutorial Index](./1.15.md)

## Concepts

* **Registration**: Almost all Minecraft objects are represented by a registry. This includes blocks, tile entities, entities, items, biomes, dimensions, potions and so on. By using this registry it is possible for mods to add their own instances of these objects and by doing that extend the base game. Registration of these objects happens in a specific manner through events.

* **Events**: In order to prevent mods from having to make modifications to the internal Minecraft code, Forge added hooks to various locations in the Minecraft source code. This is done with events. Basically whenever something important happens in Minecraft (like a mob is attacked), Forge will call all registered events for that specific thing (like the attack event). These events can be provided by mods and by doing that these mods have a chance to act on that attack (like modify the damage or cancel the attack)

* **Block**: A block represents a type of block that can exist in the world. Some vanilla examples are cobblestone, crafting table, brewing stand, iron ore, ... Every block has just one single instance which is used for all blocks of that type in the world (this implies that blocks are not the place to store data)

* **BlockState**: Blocks are not placed directly in the world. This is because a block can have multiple states. For example, stained clay is one block, but it has different variants (red, green, blue, ...). Each of these variants represents a different blockstate and this is what you can place in the world. Another example is the orientation of (for example) a furnace. A furnace facing north has a different blockstate compared to a furnace facing south

* **Property**: This is used in combination with Block to derive at a BlockState: every block has a supported set of properties. The combination of that block with all the possible values of those properties gives the possible set of blockstates. For example, say you have a block that represents a furnace, but it can be oriented in six ways (like the regular vanilla furnace) and have 16 colors. That block would have two properties: direction and color. It would also be represented by a set of 6*16 blockstates (every combination of direction and color)

* **TileEntity**: The only information a block in the world has is its current BlockState. There is no other data storage available. So if you need to store more data, or you need the block to ''do something'' then you need a TileEntity. Examples of these are the vanilla chest (needs to store items) and the vanilla furnace (needs to store items as well and also process those items)

* **Localisation**: It is good practice to make sure your mod can be translated to other languages. Not everyone wants to play Minecraft in English. Minecraft and Forge have full support for this

* **Container**: A container is an object that exists on both the server and the client side and is used for controlling the GUI. For example, when you have the GUI of a furnace open there will be a container class on the server side and one on the client side. This container is responsible for synchronizing the contents of the furnace to the client and also send changes that happen on the GUI back to the server

* **Capability**: A capability is a Forge feature that represents data and logic that can be attached dynamically to objects (tile entities, entities, itemstacks, worlds, and chunks). Forge itself defines three types of capabilities (for storing items, energy or fluids). In this tile tutorial we want to use it for items and energy.

* **ResourceLocation**: A ResourceLocation represents a unique ID of something. This is used for objects that can be registered (like blocks, items, entities, ...) but also for locations of textures and models. ResourceLocations are often represented as strings like for example `minecraft:diamond_block`.

## The Block

We start by defining the [FirstBlock](https://github.com/McJty/YouTubeModding14/blob/master/src/main/java/com/mcjty/mytutorial/blocks/FirstBlock.java) class. This class extends from the vanilla Block class. Note that there will only be one instance of this class at all times (even if the block is placed multiple times in the world) so you can't really store data in this. The following things are notable in this class:

* The constructor has no parameters and instead calls the superclass constructor which requires a `Properties` object. This defines all the needed characteristics for this block. Like the material type, the hardness and so on.

* We override `addInformation()` so that we can supply a nice hint to the user when hovering over this block in the inventory. We use `TranslationTextComponent` so that we can have a translatable message. The actual translation is done in [`en_us.json`](https://github.com/McJty/YouTubeModding14/blob/master/src/main/resources/assets/mytutorial/lang/en_us.json)

* `getLightValue()` is used so that when the block is working we can emit light

* `hasTileEntity()` and `createTileEntity()` are used because we also need a tile entity in addition to this block. Warning! Use the versions that have a BlockState parameter!

* The `getStateForPlacement()` function is called whenever the player tries to place our block. We can use it to alter the BlockState right before it is being placed. In this tutorial we calculate the direction from which the player is placing the block (we use `context.getNearestLookingDirection()` for this)

* We also override `onBlockActivated()`. This is called every time the player activates (right clicks) our block. Note that this is called two times: server side and client side. You can see what side you are on by checking `world.isRemote` (this is true on client side). In our implementation here we only do something server side. Whenever the player activates our block we create a container so that our GUI will open.

* Finally, we override `fillStateContainer()` so that we can initialize the desired properties for our block. We need two properties: `FACING` (representing the direction our block is facing) and `POWERED` (true if our block is working, false otherwise)

## The TileEntity

Because our block needs to be able to store an item and also store power we need a tile entity.
This is the [FirstBlockTile](https://github.com/McJty/YouTubeModding14/blob/master/src/main/java/com/mcjty/mytutorial/blocks/FirstBlockTile.java) class.
This tile entity has the following notable features:

* First we declare an `itemHandler` variable of type `ItemStackHandler` (this is a default implementation for the item handler capability that Forge defines). We only need to be able to store one item in our tile entity so the `createHandler()` routine will create an instance of this that is capable of storing 1 item.

* Then we declare an `energyStorage` variable of type `CustomEnergyStorage`. This is our own implementation of the energy capability that Forge defines. More on that later.

* The variables `itemHandler` and `energyStorage` are meant for efficient access to our stored items and energy from inside our own tile entity implementation. However, we also need to expose this to the outside world so that other mods can pipe items into our block or get energy from it. That's what `handler` and `energy` are for. These are instances of `LazyOptional` which is a class defined by Forge that is responsible for efficiently delaying instantation of a certain thing until it is needed. LazyOptionals are also returned by the capability system (see `getCapability()` later in this tile entity implementation)

* We also have a `counter` variable that is used to count down until we are ready to produce power again.

* The only thing the constructor does is pass along the reference to the tile entity type. More on that later when we cover registration.

* The `remove()` function is called when the tile entity is destroyed. It is good practice to invalidate any lazy optionals you have there so that other mods that still keep a reference to it will be properly notified.

* Because this tile entity also implements `ITickableTileEntity` it will get notified every tick. That means that every tick (20 times per second) the `tick()` method will be called on both the server and the client. This is where our tile entity will do its actual work. In our case it will do nothing in case it is on the client (`world.isRemote` check). Otherwise, it will use the `counter` to check if it is still producing power from a previously inserted diamond. If so it will do that. Otherwise, it will check if there is a diamond in `itemsHandler` and if so it will consume it and start producing power again (by setting `counter` to a configured value). To make sure our block changes state (i.e. front panel changes) when needed we use `world.setBlockState()` in case the `counter` variable is greater than zero. Because setBlockState is expensive (certainly because in our case we also want to communicate this to the client so that the client can change the model) we only do this when the state actually has to change.

* Important note: whenever something in your tile entity changes that needs to be persisted you have to call `markDirty()`. This will not immediately save the tile entity, but it will mark it as dirty so that the next time Minecraft decides to save the chunk it will also save the tile entity.

* The `sendOutPower()` routine which is called in `tick()` in all cases will send out any power we might have stored internally to adjacent machines. Forge Energy (or RF) is a push type energy system. That means that generators and power cells send out power to adjacent machines. Machines should never pull power out of a generator or power cell.

* The methods `read()` and `write()` are responsible for actually persisting the tile entity when Minecraft thinks it is time to do that (so `write()` will be called some time after you call markDirty). We need to store the power and items we have, and we delegate that functionality to `itemHandler` and `energyStorage` as they have built-in support for that. In addition, we need to read or write the `counter` variable ourselves. Note that the format that Minecraft uses for storing things is represented in code with NBT (`CompoundNBT` in this case)

* The `createHandler()` and `createEnergy()` methods will create the item and energy handlers for our tile entity.

* `getCapability()` is meant for other mods and vanilla to be able to access capabilities from this tile entity. In this particular case for items and energy. For example, a hopper will use the item capability to be able to push items into this tile entity.

## The Container

When the player opens the GUI of a block a container is used on both server and client side to synchronize the data that is visible in the GUI.
Usually this is for items, but it can also be for other information like the burning progress of a vanilla furnace.
In this tutorial we use that feature to synchronize the current amount of energy in our block so that the GUI can display it.
Whenever the player activates a block that has a GUI a container is created server-side.
This causes the server to send a packet to the client which in its turn will create the client-side container and also the actual GUI Screen (more on that later)

There are a few things we need to take care of in our container:

* In the constructor we call `super()` with our container type (more on that in the registration section) and a unique window ID which represents the actual open window. We don't need to worry about that ID. Just pass it along to the super constructor. Then we need to add `Slot` instances for every slot in our GUI which we want to synchronize between client and server. In this case this will be the single slot from our own tile entity (fetched with `getCapability` on the item handler) and the slots from the player inventory. We also call `trackPower()`

* `trackPower()` will use `trackInt()` to set up client/server communication of the energy that's in the block. In this case we will only need it to sync the power from the server to the client so that we can show it in the GUI. Warning! Even though the method is called `Container.trackInt()` it can actually only track 16-bit integers, so we need to split our energy level into (which is 32-bit) into two parts.

* The `getEnergy()` routine is a convenience method that is used by the GUI to get the current amount of energy stored in our tile entity.

* We override `canInteractWith()` so that we can make sure that our GUI will not open if we are too far or if the block was removed. That ensure that no duping can occur. The easiest way to implement this is by calling `Container.isWithinUsableDistance()`

* You have to override `transferStackInSlot()` so that the items move to the right slots when the player shift-clicks them. This code does look a bit more complicated, but basically it first checks the index of the slot that was shift-clicks and depending on where that was it finds the appropriate place to move the item too. In our case, if it is a diamond we prefer to move it to the input slot of our tile entity if that still has room.

* The last routines are helpers to make it easier to add slots to our container.

## The Screen

The last thing we need is the actual GUI class.
All GUI's in Minecraft need to extend directly or indirectly from `Screen`.
Because we also have an associated container it is easier to extend from `ContainerScreen` as this class knows how to work with containers.

* The `GUI` field contains a reference to our GUI texture. We use it later when rendering the background of our GUI.

* The `render()` method is called every frame and is responsible for rendering our GUI.

* The two important methods for us to override are `drawGuiContainerForegroundLayer()` and `drawGuiContainerBackgroundLayer()`. On the background layer we render our GUI texture and on the foreground layer we render a string representing the amount of power that is in our tile entity (this is synced by the container as we saw previously). You don't have to render items because that's handled by the `render()` method.

## Registration

To let Minecraft/Forge know about all the classes we just created you need to register them.
For the blocks, container, and tile entity this is done in the [Registration](https://github.com/McJty/YouTubeModding14/blob/master/src/main/java/com/mcjty/mytutorial/setup/Registration.java) class.

There are two ways to register things.
First you can subscribe to the registry events for the appropriate object and do it like that.
Usually this is done in combination with ObjectHolders. However, in this tutorial we use the `DeferredRegister` instead.
This is a very nice and clean way to register all your Minecraft objects.
