---
sidebar_position: 0
---

# Concepts

Every concept we talk about in this tutorial series will be summarized here in alphabetical
order with links to the tutorials where they are discussed.

* **Block:** a Block is the basic building block in Minecraft. Every type of block has just one instance. [Episode 2](./ep2.md)
* **BlockEntity:** a BlockEntity is a class that is associated with a Block. It is used to store data for a Block and often also logic. [Episode 2](./ep2.md)
* **BlockEntityType:** a BlockEntityType is a type of BlockEntity. For example, a furnace has a BlockEntityType. It's also a singleton object. [Episode 2](./ep2.md)
* **BlockState:** a BlockState is a combination of a Block and a set of properties. Every blockstate (every block/property combination) exists only once. [Episode 2](./ep2.md)
* **Capability:** a Capability is a way to attach data to an object. For example, a BlockEntity can have a Capability that stores the energy of that BlockEntity. Capabilities can also be attached to itemstacks, entities, chunks, ... [Episode 2](./ep2.md)
* **Client:** the client is the part of Minecraft that controls the visual part of the game. [Episode 1](./ep1.md)
* **Dynamic Rendering:** dynamic rendering is usually done using a `BlockEntityRenderer`. It can be used if you need to animate something. [Episode 2](./ep2.md)
* **Event:** an Event is a way to hook into the Minecraft code. For example, there is an event that is called when a player logs in. There are two types of events: forge bus and mod bus. [Episode 1](./ep1.md)
* **Event Bus:** there are two event busses in Forge: the forge bus and the mod bus. The forge bus is used for events that happen during the game (like breaking a block). The mod bus is used for events that are related to lifecycle and setup (like registration). [Episode 1](./ep1.md)
* **Gradle:** Gradle is a build system. It is used to build your mod. [Episode 1](./ep1.md)
* **Item:** an Item is an item in the game. Every type of item has just one instance.
* **Item Handler:** an Item Handler is the Forge way to access the items in an inventory. It's implemented as a capability. [Episode 2](./ep2.md)
* **ItemStack:** an ItemStack is an instance of an Item. It can have a size (how many items are in the stack) and it can have NBT data.
* **JSON:** JSON is a format to store data. It is used in Minecraft for recipes, loot tables, blockstates, and more. [Episode 2](./ep2.md)
* **LazyOptional:** a LazyOptional is a way to delay creation of an object until needed. It's often used in combination with capabilities. [Episode 2](./ep2.md)
* **Loot table:** a loot table is a way to define what items are dropped when a block is broken or an entity is killed. [Episode 2](./ep2.md)
* **Mappings:** mappings are readable names for the obfuscated names that Minecraft uses internally. [Episode 1](./ep1.md)
* **Model:** a model is a way to define how a block or item looks. [Episode 2](./ep2.md)
* **NBT:** NBT is used by Minecraft to persist data. Block entities, itemstacks, entities, and more use NBT to save their data to the savefile. NBT is also used for syncing data between client and server. [Episode 2](./ep2.md)
* **PoseStack:** a PoseStack is a way to store transformations (for example, to transform the object space to camera space). It's used in the rendering code. [Episode 2](./ep2.md)
* **Property:** a Property is a property of a BlockState. For example, a BlockState can have a property "facing" which can be north, south, east, or west.
* **Quad:** a quad is a rectangular polygon. It's used in the rendering code. A block is made up of quads. [Episode 2](./ep2.md)
* **Registration:** the act of registering something in the game. For example, registering a block means that the block is now known to the game. [Episode 1](./ep1.md)
* **Registry:** a Registry is a collection of registry objects. For example, the Block registry contains all blocks. [Episode 1](./ep1.md)
* **RenderType:** a RenderType is a way to define how a block is rendered. It defines various graphical operations relevant for that render type. For example, a block can be rendered as a solid block or as a cutout block. [Episode 2](./ep2.md)
* **ResourceLocation:** a ResourceLocation is a unique identifier for a registry object or a resource on disk (like a texture file). For example, `minecraft:stone` is the ResourceLocation for the stone block. [Episode 2](./ep2.md)
* **Server:** the server is the part of Minecraft that controls the game logic. In single player there is an integrated server. In multiplayer there is a dedicated server. [Episode 1](./ep1.md)
* **Static Model:** a static model is a model that is defined in a JSON file or with a baked model. It's is static in the sense that it's geometry is baked into the chunk geometry. [Episode 2](./ep2.md)
* **Tag:** a tag defines a group of registry objects. Tags are often used for items and blocks but can be used for any registry object. Common uses for tags are recipes but there are also tags that specify if a block can be mined with a certain type of tool. [Episode 2](./ep2.md)
* **Texture Atlas:** a texture atlas is a texture that contains multiple textures. It's used to reduce the number of textures that need to be loaded on the graphics card. [Episode 2](./ep2.md)
* **TextureAtlasSprite:** a TextureAtlasSprite is a texture that is part of a texture atlas. [Episode 2](./ep2.md)
* **Tick:** a tick is a unit of time in Minecraft. The game runs at 20 ticks per second. [Episode 2](./ep2.md)
 