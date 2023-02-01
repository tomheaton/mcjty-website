---
sidebar_position: 2
---

# Concepts

In this section we will explain and clarify various terms and concepts that are relevant to modding Minecraft.

###  Block

A block represents a basic block in minecraft. In itself a block cannot contain data. There is only one 'dirt' block for example even though you have multiple blocks of dirt in your world. They all share the same Block instance. The only information you can store together with a block is 4 bits of metadata (which in 1.12 you should not access directly, see block states).

###  Item

An item is something you have in your inventory. For all blocks there is usually a corresponding item (that is created automatically) but there are also items that have no corresponding block (like a pickaxe, there is no pickaxe block). Like with blocks all items of the same type share the same Item instance, so you cannot store item specific information in this class. If you need to do that you have to do that with NBT or damage through the ItemStack (more on this later).

###  TileEntity

A tile entity is one way to add extra information and even logic to a block. As opposed to a Block, there is a difference instance of a tile entity for every block of the same type. That means you can store information here. All tile entity information that you want to persist when the world is saved has to be convertable to NBT data. By default, tile entities are only data. You can also have a tile entity that 'ticks' by implementing the ITickable interface. This way your tile entity can do operations and have an effect on the world in general.

###  ItemStack

Items (or blocks) are never stored directly in inventories or containers. They are contained in an ItemStack instance. An ItemStack refers to some item, has a damage value (an integer) and optionally also NBT data. Starting with 1.11.2 the empty stack is represented by ItemStack.EMPTY and not with null. Be very careful with this!

###  NBT Data

ItemStacks keep their data in NBT format directly. Tile entities don't do that normally, but you still have to be able to convert your tile entity state to NBT. NBT data is basically a map of data that can easily be persisted into storage (save file).

###  Entity

An entity is not the same as a tile entity. An entity represents a dynamic object in the world. For example, a mob or an item that has been dropped on the ground.

###  Block states

Before 1.8 you had to use metadata for blocks directly (4 bits). Starting with 1.8 there is a new concept which is the BlockState. No longer do you directly do world.getBlock() but instead you do world.getBlockState() from which you can get the block as well as the properties that are defined for the given block state. These properties have to map to some metadata (which is done in the block implementation) but beyond that you should never use metadata directly. Note that block states can also be used for describing features of a block that do not have to correspond to actual metadata. For example, extended blockstate which can be used for custom baked model rendering as well as actual blockstate which can be used for TESR rendering.

###  TileEntitySpecialRenderer (TESR)

A TESR is a class that can be used to render tile entity information in the world. In order to use one of these block must have an associated tile entity. Note that TESR's are rendered every frame so be careful not to overuse them. TESR's are mostly useful if you have a block that changes appearance very often, so it doesn't make sense to include it in the static geometry of a chunk.

###  IBakedModel

A baked model is a class that can be used to render a block statically. It should be used if you cannot find a way to express your static block geometry using the regular JSON system. You don't need a tile entity to have a custom baked model. They are mostly useful when you have relatively complex geometry that doesn't change often but still needs to render differently depending on (external) conditions. A good example is a conduit system where you need to render every conduit based on the presence of adjacent conduit blocks.
