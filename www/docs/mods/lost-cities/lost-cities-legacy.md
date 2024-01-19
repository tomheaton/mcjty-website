# Lost Cities Legacy Edition

The Lost Cities is a world generation mod. This page is for Minecraft 1.12.2 and 1.16.5. For more modern versions
of Lost Cities go to [Lost Cities](./lost-cities.md).

## Introduction

It has two major functionalities:

* Add a new world type, so you can generate the overworld with this mod
* Add a new dimension (default ID `111`) so you can travel to this dimension from within a normal overworld (or from another Lost City world)

The world generation is about an abandoned city.
Here is a gallery with screenshots:

[Gallery](https://minecraft.curseforge.com/projects/the-lost-cities/images)

## Basic Structure

This page is mostly about the internal structure and configuration about the mod.
In this first section the basic operation of the mod is explained.

The buildings, bridges, subway system, fountains and other structures you find in the world are actually not structures but real worldgen.
That means that are generated at the very first stage when a chunk is built.
This makes generation very efficient and also allows it to fit much better when the surrounding world.

It is important to note that this mod cannot depend on any specific order of chunk generation.
When generating a chunk it cannot depend on neighbouring chunks already being generated, so it has to be able to calculate things on its own.
Nevertheless, this mod maintains several world-wide data structures and is able to query information about nearby chunks without actually having to generate the chunk.

Read about it here: [Basic Structure](./structure.md)

## Configuration

TODO

## The Asset System

The asset system is a powerful system that you can customize to make your own buildings, decorations, control loot, mob spawners, building blocks and more.

* For 1.17 and older you can read about it here: [Asset System](./asset.md)
* For 1.18 and newer you need to visit this: [Asset DataPack System](./asset-datapack.md)
