# Multi-Mod-Project

## Introduction

This is an advanced tutorial/document describing how to set up a multi-mod project for IDEA.
The solution described here is not ideal and needs some various tweaks to get working but if you need to work on multiple mods at the same time (to make refactoring/testing easier for example) then this can be a workable solution.

## Three Approaches

### Approach one: [Older Multi-Mod Project](./multi-old.md)

The first approach is the easiest to set up but also the least flexible.
It is based on a tutorial from LatvianModder: [LatvianModder's tutorial on this subject](https://latmod.com/moddingtutorials/?page=multimods).
This approach is hard to get working right if you have different AT's in different mods though.

### Approach two (single project): [Single Project Approach](./single)

The second approach is more automated, but it is a slow process to set up with multiple mods, and it has the same stability issue with AT's.
It was created with the help of Jared:

### Approach three (use the Forge!): [Single Forge Approach](./single-forge)

The third approach was created together with KingLemmings. It is the least automated to set up, but it is VERY efficient and works really well with AT's:
