---
sidebar_position: 2
---

# Porting to 1.19

Here is a step by step description on how the tutorial mod was ported. As a reference you can find the 1.19 source of the tutorial here.

## Getting Started

First start with this guide to do the initial steps on your working 1.18.2 mod auto refactor guide. After that many renames will already have been done for you.

### build.gradle

Do the following changes to `build.gradle`. After making this changes you need to refresh gradle and run the `genIntellijRuns` task

### Forge

First visit The Forge Download Site to see what the latest version of Forge is. Then change the minecraft dependency to that version. For example:

```gradle
minecraft 'net.minecraftforge:forge:1.19.2-42.0.1'
```

### Mappings

Also you want to set the correct mappings. Check The Parchment Wiki to find the latest version. As of this moment there are no parchment mappings for 1.19 so we use official mappings instead:

```gradle
mappings channel: 'official', version: "1.19.2"
```

### JEI

We also want to get JEI. Consult The JEI wiki for more information. As of this writing we use this:

```gradle
// compile against the JEI API but do not include it at runtime
compileOnly fg.deobf("mezz.jei:jei-1.19.1-common-api:${jei_version}")
compileOnly fg.deobf("mezz.jei:jei-1.19.1-forge-api:${jei_version}")
// at runtime, use the full JEI jar for Forge
runtimeOnly fg.deobf("mezz.jei:jei-1.19.1-forge:${jei_version}")
```
