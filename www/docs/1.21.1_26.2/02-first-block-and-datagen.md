---
sidebar_position: 3
---

# Tutorial 2: A First Block and Data Generation

In this tutorial we will add a simple textured block to the mod. The block can
be found in the Building Blocks creative tab, placed in the world, crafted, and
mined to get the block back.

Along the way we will learn what blocks, block states, items, item stacks,
models, and data generators are. This is more important than merely making one
block appear: the same structure scales to the many blocks and items we will add
in later tutorials.

The main part of this tutorial targets Minecraft 1.21.1 and continues from the
project created in Tutorial 1. The final section ports the same feature to
Minecraft 26.2 and states when each relevant API change was introduced.

## What we are adding

Our new content has the registry name `tutorialmod:tutorial_block`. It consists
of several connected pieces:

```text
Placed in the world
    registered Block
        -> BlockState at each position
        -> blockstate JSON
        -> block model JSON
        -> block_texture.png

Held in an inventory
    registered BlockItem
        -> ItemStack containing the item and a count
        -> item model JSON
        -> the same block model JSON
```

The Java objects define the behavior. The resource files tell Minecraft how to
display the block and item, how to craft the item, and what the block drops.

Only the texture is written by hand. Java data providers generate the JSON
files for us.

## Blocks are registered singletons

A `Block` is the type of thing that can occupy a position in a Minecraft world.
The `Block` object defines shared behavior and properties such as hardness,
explosion resistance, sounds, collision, and light emission.

It is tempting to imagine that placing ten tutorial blocks creates ten Java
`Block` objects. That is not what happens. A registry contains exactly one
`Block` object for `tutorialmod:tutorial_block`. Every placed tutorial block
refers back to that same registered object.

This is called a **singleton**. The one registered `Block` describes every
occurrence of that block type. Never create a new `Block` each time one is
placed, and do not call `new Block` outside registration.

Registries give singleton objects stable names. The block registry maps:

```text
tutorialmod:tutorial_block -> our one Block object
```

The namespace before the colon is our mod ID. The path after the colon is the
name of this particular entry. Together they prevent our tutorial block from
colliding with a block from Minecraft or another mod.

## What is a BlockState?

A `BlockState` describes the current state of a block at one world position. It
contains a reference to the registered `Block` plus values for all of that
block's state properties.

For example, one stairs `Block` can have states describing its direction,
whether it is upside down, and its corner shape. Minecraft does not register a
different stairs block for every combination. It registers one stairs block
and uses different `BlockState` values at different positions.

Our first block has no custom state properties, so it has only one possible
state. The distinction still matters:

- `Block` means the one registered type and its shared behavior.
- `BlockState` means that block plus a particular combination of state values
  at a world position.

Block states are immutable and reused. If a state needs to change, Minecraft
uses another valid state instead of modifying the existing object. This is one
reason custom per-position data does not belong in fields on a `Block`. A later
tutorial will introduce state properties and block entities when we need them.

There is also a resource file commonly called a **blockstate JSON**. It is not
the Java `BlockState` object. The file maps possible state combinations to the
models the client should render. Because our block has no properties, its file
contains one empty variant that always selects the same model.

## What is a model?

A model tells the client what shape to render and which textures to put on that
shape. Most ordinary full blocks use Minecraft's existing `cube_all` parent
model: a cube whose six faces all use one texture.

Models and textures have separate jobs:

- The **blockstate JSON** chooses a model for a `BlockState`.
- The **block model JSON** describes the shape and assigns textures.
- The **PNG texture** contains the actual pixels.

Keeping these separate lets one texture be reused by multiple models and lets
one block choose different models for different states. Our simple block uses
one blockstate variant, one cube model, and one 16 by 16 texture.

These resources are client assets. A dedicated server does not render them,
but they still belong in the mod JAR so every client can display the block.

## Why a block also needs an item

Blocks live in the block registry and can be placed in the world. Inventories,
hotbars, item entities, recipes, and creative tabs work with items from the item
registry. A `Block` cannot appear in an inventory by itself.

We therefore register a `BlockItem`. It is an `Item` whose placement behavior
points at our registered block. When the player uses it on a suitable position,
the `BlockItem` places that block and consumes one item from the stack when the
player is not in creative mode.

The block and block item deliberately have the same name:

```text
Block registry: tutorialmod:tutorial_block -> one Block
Item registry:  tutorialmod:tutorial_block -> one BlockItem
```

This is valid because they are two different registries. There is still only
one registered `BlockItem` object. A player carrying 64 tutorial blocks does not
have 64 Java `Item` objects.

### ItemStack represents an occurrence and quantity

Inventories store `ItemStack` objects. An item stack contains a reference to a
registered item, a count, and any data components that differ for that stack.
For example:

```text
ItemStack
├── item:  the one registered tutorial BlockItem
├── count: 64
└── components: per-stack data, if any
```

Two inventory slots can contain two different `ItemStack` objects while both
refer to the same registered `Item`. Splitting a stack creates another stack,
not another registered item. The stack is where quantity and per-stack data
belong; the singleton `Item` contains behavior shared by every stack of that
item.

For this tutorial NeoForge and Minecraft create and use item stacks for us. We
only register the item and refer to it in recipes and the creative tab. We will
work with `ItemStack` directly in a future tutorial.

## Resources and data generation

Minecraft loads much of its content from JSON resources rather than hardcoding
everything in Java. The files used here fall into two groups:

| Side | Generated content | Purpose |
| --- | --- | --- |
| Client assets | blockstate, block model, item model, language | Render and name the block and item |
| Server data | loot table, recipe, recipe advancement | Define gameplay behavior |

Client assets go below `assets/tutorialmod`. Server data goes below
`data/tutorialmod`. NeoForge packages both sets into the finished mod.

We could maintain all of these JSON files manually. Instead, we describe them
with Java **data providers** and run Minecraft's data generator. The generated
JSON is still what Minecraft loads at runtime; the providers only create it
during development.

Data generation is useful because it:

- refers directly to registered blocks and items instead of repeating names;
- provides helpers for common patterns such as a cube model or self-drop loot;
- catches missing references and invalid combinations early;
- keeps a family of similar resources consistent;
- makes large changes mechanical instead of editing many JSON files by hand;
- lets the generator write the correct JSON format for the targeted Minecraft
  version.

The last point becomes visible in the 26.2 port. The Java intent stays almost
the same even where Minecraft changed the generated item and recipe formats.

Generated resources are source-controlled build inputs. Run data generation
after changing a provider, inspect the changes, and commit the resulting JSON
with the Java source. The small cache files under
`src/generated/resources/.cache` are machine-generated bookkeeping and should
remain ignored.

## Adding the texture

Place the provided 16 by 16 texture at:

```text
src/main/resources/assets/tutorialmod/textures/block/block_texture.png
```

The location follows this pattern:

```text
assets/<namespace>/textures/<path>.png
```

Code will refer to this texture as `tutorialmod:block/block_texture`. Resource
references omit the `textures` directory and `.png` extension.

Textures are authored assets, so we do not generate this file. Our model data
provider will reference it and generate the JSON around it.

## Registering the block

Create
`src/main/java/com/example/tutorialmod/registration/ModBlocks.java`:

```java
package com.example.tutorialmod.registration;

import com.example.tutorialmod.TutorialMod;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.SoundType;
import net.minecraft.world.level.block.state.BlockBehaviour;
import net.minecraft.world.level.material.MapColor;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.neoforge.registries.DeferredBlock;
import net.neoforged.neoforge.registries.DeferredRegister;

public final class ModBlocks {
    public static final DeferredRegister.Blocks BLOCKS =
            DeferredRegister.createBlocks(TutorialMod.MOD_ID);

    public static final DeferredBlock<Block> TUTORIAL_BLOCK =
            BLOCKS.registerSimpleBlock(
                    "tutorial_block",
                    BlockBehaviour.Properties.of()
                            .mapColor(MapColor.METAL)
                            .strength(3.0F)
                            .sound(SoundType.METAL)
            );

    private ModBlocks() {
    }

    public static void register(IEventBus modEventBus) {
        BLOCKS.register(modEventBus);
    }
}
```

`DeferredRegister.Blocks` is NeoForge's specialized deferred register for the
block registry. Deferred registration is the recommended approach because it
queues our entry and creates it during the correct registry event.

`registerSimpleBlock` is a convenience for an ordinary `Block` that needs no
custom Java subclass. It returns a `DeferredBlock<Block>`. This holder gives us
a safe reference before registry events have finished; after registration,
`TUTORIAL_BLOCK.get()` returns the singleton block.

The block properties mean:

- `mapColor(MapColor.METAL)` chooses its color on maps.
- `strength(3.0F)` sets both destroy time and explosion resistance to `3.0`.
- `sound(SoundType.METAL)` gives it metal placement, step, hit, and break
  sounds.

The private constructor prevents accidental instances of this utility class.
The `register` method attaches the deferred register to our mod event bus.

## Registering the block item

Create
`src/main/java/com/example/tutorialmod/registration/ModItems.java`:

```java
package com.example.tutorialmod.registration;

import com.example.tutorialmod.TutorialMod;
import net.minecraft.world.item.BlockItem;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.neoforge.registries.DeferredItem;
import net.neoforged.neoforge.registries.DeferredRegister;

public final class ModItems {
    public static final DeferredRegister.Items ITEMS =
            DeferredRegister.createItems(TutorialMod.MOD_ID);

    public static final DeferredItem<BlockItem> TUTORIAL_BLOCK_ITEM =
            ITEMS.registerSimpleBlockItem(ModBlocks.TUTORIAL_BLOCK);

    private ModItems() {
    }

    public static void register(IEventBus modEventBus) {
        ITEMS.register(modEventBus);
    }
}
```

`DeferredRegister.Items` is the corresponding specialized register for items.
`registerSimpleBlockItem` creates a normal `BlockItem`, connects it to
`TUTORIAL_BLOCK`, and uses the block's path for the item registry name.

Keeping blocks and items in separate classes makes their registries obvious.
It also prevents a common mistake: registering a block and forgetting its item
form.

## Connecting registration to the mod

Update `TutorialMod.java` so its constructor registers both deferred registers,
adds the block item to a creative tab, and listens for data generation:

```java
package com.example.tutorialmod;

import com.example.tutorialmod.datagen.ModDataGenerators;
import com.example.tutorialmod.registration.ModBlocks;
import com.example.tutorialmod.registration.ModItems;
import com.mojang.logging.LogUtils;
import net.minecraft.world.item.CreativeModeTabs;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import net.neoforged.neoforge.event.BuildCreativeModeTabContentsEvent;
import org.slf4j.Logger;

@Mod(TutorialMod.MOD_ID)
public final class TutorialMod {
    public static final String MOD_ID = "tutorialmod";

    private static final Logger LOGGER = LogUtils.getLogger();

    public TutorialMod(IEventBus modEventBus) {
        ModBlocks.register(modEventBus);
        ModItems.register(modEventBus);

        modEventBus.addListener(TutorialMod::addCreativeTabItems);
        modEventBus.addListener(ModDataGenerators::gatherData);

        LOGGER.info("Tutorial Mod is loading!");
    }

    private static void addCreativeTabItems(
            BuildCreativeModeTabContentsEvent event
    ) {
        if (event.getTabKey() == CreativeModeTabs.BUILDING_BLOCKS) {
            event.accept(ModItems.TUTORIAL_BLOCK_ITEM);
        }
    }
}
```

Calling `register` does not immediately construct extra copies. It connects
each deferred register to the mod bus so NeoForge can create and register its
one queued object at the right time.

The creative-tab event is separate from registration. Registering an item
makes it exist; accepting it in `BUILDING_BLOCKS` makes it discoverable in that
creative tab. Survival players can still obtain it through the recipe and loot
table regardless of creative-tab placement.

The last listener is only used by a data run. It supplies our data providers
when NeoForge fires `GatherDataEvent`.

## Configuring the data run

Add the generated resources directory to the main resources near the top of
`build.gradle`:

```groovy
sourceSets.main.resources {
    // Include the JSON files created by the data generators.
    srcDir 'src/generated/resources'
}
```

This makes generated JSON part of development runs and the final JAR, just like
files under `src/main/resources`.

Then add a `data` run inside `neoForge.runs`:

```groovy
data {
    data()
    programArguments.addAll '--mod', project.mod_id,
            '--all',
            '--output', file('src/generated/resources').absolutePath,
            '--existing', file('src/main/resources').absolutePath
}
```

The arguments mean:

- `--mod tutorialmod` runs providers belonging to our mod.
- `--all` includes client and server generators.
- `--output` selects the directory where JSON will be written.
- `--existing` tells validation where to find handwritten resources, including
  `block_texture.png`.

After Gradle synchronization, this run creates a `runData` Gradle task and a
matching IDE run configuration.

## Gathering the data providers

Create
`src/main/java/com/example/tutorialmod/datagen/ModDataGenerators.java`:

```java
package com.example.tutorialmod.datagen;

import net.minecraft.core.HolderLookup;
import net.minecraft.data.DataGenerator;
import net.minecraft.data.PackOutput;
import net.neoforged.neoforge.common.data.ExistingFileHelper;
import net.neoforged.neoforge.data.event.GatherDataEvent;

import java.util.concurrent.CompletableFuture;

public final class ModDataGenerators {
    private ModDataGenerators() {
    }

    public static void gatherData(GatherDataEvent event) {
        DataGenerator generator = event.getGenerator();
        PackOutput output = generator.getPackOutput();
        CompletableFuture<HolderLookup.Provider> lookupProvider =
                event.getLookupProvider();
        ExistingFileHelper existingFileHelper =
                event.getExistingFileHelper();

        generator.addProvider(
                event.includeClient(),
                new ModBlockStateProvider(output, existingFileHelper)
        );
        generator.addProvider(
                event.includeClient(),
                new ModLanguageProvider(output)
        );
        generator.addProvider(
                event.includeServer(),
                new ModBlockLootTableProvider(output, lookupProvider)
        );
        generator.addProvider(
                event.includeServer(),
                new ModRecipeProvider(output, lookupProvider)
        );
    }
}
```

This class is the central list of our providers:

- `ModBlockStateProvider` generates blockstates and block/item models.
- `ModLanguageProvider` generates the English name.
- `ModBlockLootTableProvider` generates block drops.
- `ModRecipeProvider` generates a crafting recipe and its unlock advancement.

`PackOutput` tells providers where to write. The lookup provider gives them
access to registries, and `ExistingFileHelper` lets client generators validate
references to resources that already exist.

`includeClient()` and `includeServer()` respect which side the data run was
asked to generate. Our `--all` argument enables both.

## Generating the blockstate and models

Create
`src/main/java/com/example/tutorialmod/datagen/ModBlockStateProvider.java`:

```java
package com.example.tutorialmod.datagen;

import com.example.tutorialmod.TutorialMod;
import com.example.tutorialmod.registration.ModBlocks;
import net.minecraft.data.PackOutput;
import net.neoforged.neoforge.client.model.generators.BlockStateProvider;
import net.neoforged.neoforge.client.model.generators.ModelFile;
import net.neoforged.neoforge.common.data.ExistingFileHelper;

public final class ModBlockStateProvider extends BlockStateProvider {
    public ModBlockStateProvider(
            PackOutput output,
            ExistingFileHelper existingFileHelper
    ) {
        super(output, TutorialMod.MOD_ID, existingFileHelper);
    }

    @Override
    protected void registerStatesAndModels() {
        ModelFile tutorialBlockModel = models().cubeAll(
                "tutorial_block",
                modLoc("block/block_texture")
        );

        simpleBlockWithItem(
                ModBlocks.TUTORIAL_BLOCK.get(),
                tutorialBlockModel
        );
    }
}
```

`models().cubeAll` creates a block model named `tutorial_block` using the same
texture on every face. `modLoc` creates a resource location in our mod's
namespace, so the texture reference becomes
`tutorialmod:block/block_texture`.

`simpleBlockWithItem` performs three related jobs:

1. It generates the blockstate JSON that selects the model.
2. It generates the cube block model.
3. It generates an item model that inherits the block model.

The third job makes the block item look like a small three-dimensional block in
the inventory and in the player's hand. A registered `BlockItem` is not enough
to make it render; it still needs client model data.

## Generating the English name

Create
`src/main/java/com/example/tutorialmod/datagen/ModLanguageProvider.java`:

```java
package com.example.tutorialmod.datagen;

import com.example.tutorialmod.TutorialMod;
import com.example.tutorialmod.registration.ModBlocks;
import net.minecraft.data.PackOutput;
import net.neoforged.neoforge.common.data.LanguageProvider;

public final class ModLanguageProvider extends LanguageProvider {
    public ModLanguageProvider(PackOutput output) {
        super(output, TutorialMod.MOD_ID, "en_us");
    }

    @Override
    protected void addTranslations() {
        add(ModBlocks.TUTORIAL_BLOCK.get(), "Tutorial Block");
    }
}
```

Minecraft displays translation keys rather than hardcoded names. A block's
default key is `block.<namespace>.<path>`, so ours is:

```text
block.tutorialmod.tutorial_block
```

The block item uses the block description prefix, so this one translation also
names the inventory item. The provider turns it into
`assets/tutorialmod/lang/en_us.json`.

Other languages can later use another `LanguageProvider` with a locale such as
`nl_be`. Language JSON can also be supplied by translators without recompiling
the mod.

## Generating the loot table

Create
`src/main/java/com/example/tutorialmod/datagen/ModBlockLootTableProvider.java`:

```java
package com.example.tutorialmod.datagen;

import com.example.tutorialmod.registration.ModBlocks;
import net.minecraft.core.HolderLookup;
import net.minecraft.data.PackOutput;
import net.minecraft.data.loot.BlockLootSubProvider;
import net.minecraft.data.loot.LootTableProvider;
import net.minecraft.world.flag.FeatureFlags;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.storage.loot.parameters.LootContextParamSets;

import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

public final class ModBlockLootTableProvider extends LootTableProvider {
    public ModBlockLootTableProvider(
            PackOutput output,
            CompletableFuture<HolderLookup.Provider> lookupProvider
    ) {
        super(
                output,
                Set.of(),
                List.of(new SubProviderEntry(
                        ModBlockLootTables::new,
                        LootContextParamSets.BLOCK
                )),
                lookupProvider
        );
    }

    private static final class ModBlockLootTables
            extends BlockLootSubProvider {
        private ModBlockLootTables(
                HolderLookup.Provider lookupProvider
        ) {
            super(Set.of(), FeatureFlags.DEFAULT_FLAGS, lookupProvider);
        }

        @Override
        protected void generate() {
            dropSelf(ModBlocks.TUTORIAL_BLOCK.get());
        }

        @Override
        protected Iterable<Block> getKnownBlocks() {
            return ModBlocks.BLOCKS.getEntries()
                    .stream()
                    .map(holder -> (Block) holder.value())
                    .toList();
        }
    }
}
```

Breaking a block and receiving an item are separate actions. Registering a
`BlockItem` does not automatically make the block drop it. Loot tables decide
what block breaking produces and can take tools, enchantments, explosions, and
other context into account.

`dropSelf` is the common rule that makes a block drop its matching item. It also
adds the standard survives-explosion condition. If an explosion destroys the
block, the item only drops when it survives Minecraft's explosion chance.

`getKnownBlocks` supplies every block in our deferred register. The base class
uses this list to validate that we did not forget a loot table for a registered
block. This turns a common silent omission into a data-generation error.

## Generating the crafting recipe

Create
`src/main/java/com/example/tutorialmod/datagen/ModRecipeProvider.java`:

```java
package com.example.tutorialmod.datagen;

import com.example.tutorialmod.registration.ModItems;
import net.minecraft.core.HolderLookup;
import net.minecraft.data.PackOutput;
import net.minecraft.data.recipes.RecipeCategory;
import net.minecraft.data.recipes.RecipeOutput;
import net.minecraft.data.recipes.RecipeProvider;
import net.minecraft.data.recipes.ShapedRecipeBuilder;
import net.minecraft.world.item.Items;

import java.util.concurrent.CompletableFuture;

public final class ModRecipeProvider extends RecipeProvider {
    public ModRecipeProvider(
            PackOutput output,
            CompletableFuture<HolderLookup.Provider> lookupProvider
    ) {
        super(output, lookupProvider);
    }

    @Override
    protected void buildRecipes(RecipeOutput recipeOutput) {
        ShapedRecipeBuilder.shaped(
                        RecipeCategory.BUILDING_BLOCKS,
                        ModItems.TUTORIAL_BLOCK_ITEM.get()
                )
                .pattern("III")
                .pattern("ISI")
                .pattern("III")
                .define('I', Items.IRON_INGOT)
                .define('S', Items.STONE)
                .unlockedBy("has_iron_ingot", has(Items.IRON_INGOT))
                .save(recipeOutput);
    }
}
```

This generates a shaped crafting recipe:

```text
I I I
I S I    -> Tutorial Block
I I I
```

`I` means an iron ingot and `S` means stone. A shaped recipe requires this
arrangement, although Minecraft may move the whole pattern within a larger
crafting grid when the pattern is smaller than that grid.

`RecipeCategory.BUILDING_BLOCKS` places the recipe in the appropriate recipe
book category. `unlockedBy` creates an advancement criterion: the recipe enters
the player's recipe book after they obtain an iron ingot. Every generated
recipe needs an unlock criterion unless recipe advancement generation is
explicitly disabled.

The recipe result refers to the registered item, not the block, because
crafting grids contain and return item stacks.

## Running data generation

Run the generator from the project root:

```bash
./gradlew runData
```

On Windows, use:

```powershell
.\gradlew.bat runData
```

Data generation should create this tree:

```text
src/generated/resources/
├── assets/tutorialmod/
│   ├── blockstates/
│   │   └── tutorial_block.json
│   ├── lang/
│   │   └── en_us.json
│   └── models/
│       ├── block/
│       │   └── tutorial_block.json
│       └── item/
│           └── tutorial_block.json
└── data/tutorialmod/
    ├── advancement/recipes/building_blocks/
    │   └── tutorial_block.json
    ├── loot_table/blocks/
    │   └── tutorial_block.json
    └── recipe/
        └── tutorial_block.json
```

Do not edit these files to make a lasting change. Edit the provider and rerun
`runData`; otherwise the next generation will overwrite the manual edit.

It is still valuable to read generated JSON. It shows exactly what Minecraft
will load and helps connect each provider call with a runtime resource.

For example, the generated blockstate has one empty state selector:

```json
{
  "variants": {
    "": {
      "model": "tutorialmod:block/tutorial_block"
    }
  }
}
```

The block model uses Minecraft's cube template and our texture:

```json
{
  "parent": "minecraft:block/cube_all",
  "textures": {
    "all": "tutorialmod:block/block_texture"
  }
}
```

The item model inherits that block model:

```json
{
  "parent": "tutorialmod:block/tutorial_block"
}
```

This small chain is why one texture renders correctly both in the world and in
the inventory.

## Trying the block in Minecraft

First build the project so Java compilation and resource processing are both
checked:

```bash
./gradlew build
```

Then start the development client:

```bash
./gradlew runClient
```

Check all of the following:

1. Open the Building Blocks creative tab and find **Tutorial Block**.
2. Confirm that its inventory icon is a textured cube.
3. Place several copies and confirm that every face uses the texture.
4. Mine one in survival mode and confirm that it drops itself.
5. Put eight iron ingots around one stone in a crafting table and confirm the
   recipe produces one Tutorial Block.

If the world shows a purple-and-black missing texture, check the namespace and
path in both the texture and model provider. If the held item has no model,
check that `simpleBlockWithItem` was used rather than only `simpleBlock`. If the
block disappears when mined, check that the loot provider ran and its generated
file is included in the main resources.

## What the project now understands

We have one registered block and one registered block item. World positions
refer to the block through block states, while inventory slots hold item stacks
that refer to the item. Data-generated resources connect those singleton Java
objects to rendering, names, drops, and crafting.

This tutorial deliberately uses the simplest possible block. Future tutorials
can add state properties, custom behavior, block entities, item-stack data, and
more complex models without changing these basic relationships.

## Minecraft 26.2 differences

The companion Minecraft 26.2 project implements the same block, item, creative
tab entry, texture, language, loot rule, and recipe. Registration is still
deferred and the singleton, block-state, and item-stack concepts are unchanged.

The port crosses several API changes introduced between 1.21.1 and 26.2. They
did not all arrive in 26.2.

### Difference summary and version boundaries

| Area | Minecraft 1.21.1 | Minecraft 26.2 | Change began in |
| --- | --- | --- | --- |
| Simple block properties | Pass a completed `BlockBehaviour.Properties` | Pass a properties modifier lambda | **1.21.2** |
| Recipe provider | Provider is itself a `DataProvider`; `buildRecipes` receives the output | A `RecipeProvider.Runner` creates a recipe-building provider with registries and output | **1.21.2** |
| Data events | One `GatherDataEvent` with client/server flags | Separate `GatherDataEvent.Client` and `.Server` events | **1.21.4** |
| Gradle data runs | One `data` run and `runData` task | Separate `clientData` and `serverData` runs/tasks | **1.21.4** |
| Model generator | NeoForge `BlockStateProvider` and `ExistingFileHelper` | Vanilla `ModelProvider`, `BlockModelGenerators`, and `TexturedModel` | **1.21.4** |
| Item render definition | `assets/<modid>/models/item/<name>.json` directly supplies the item model | `assets/<modid>/items/<name>.json` is a client-item definition that points at a model | **1.21.4** |
| Resource identifier class | `ResourceLocation` | `Identifier` | **26.1** |
| Texture values in model datagen | Raw resource locations | `Material` values containing a texture identifier and render information | **26.1** |
| Shared-output data cache | One run owns the output cache | Both runs use `--uncached` when sharing one output directory | `--uncached` was added in **26.1** |

The Java 25 and project-version changes from Tutorial 1 still apply, but they
are not repeated here because they are not part of this block feature.

### Block registration properties changed in 1.21.2

Use a modifier lambda in `ModBlocks.java`:

```java
public static final DeferredBlock<Block> TUTORIAL_BLOCK =
        BLOCKS.registerSimpleBlock(
                "tutorial_block",
                properties -> properties
                        .mapColor(MapColor.METAL)
                        .strength(3.0F)
                        .sound(SoundType.METAL)
        );
```

Starting in **Minecraft 1.21.2**, block and item properties must know the
resource key of the object they create. NeoForge's specialized deferred
register helpers manage that key. Supplying a modifier lets the helper prepare
the correctly keyed properties first and then apply our choices.

This is why the 26.2 code no longer imports `BlockBehaviour` merely to call
`BlockBehaviour.Properties.of()`. The resulting block behavior is otherwise
the same.

### RecipeProvider changed in 1.21.2

Starting in **Minecraft 1.21.2**, `RecipeProvider` is a recipe-building context
rather than a `DataProvider`. A `RecipeProvider.Runner` is the provider attached
to data generation; it creates the context after registry lookup data is ready.

The 26.2 implementation is:

```java
package com.example.tutorialmod.datagen;

import com.example.tutorialmod.registration.ModItems;
import net.minecraft.core.HolderLookup;
import net.minecraft.data.PackOutput;
import net.minecraft.data.recipes.RecipeCategory;
import net.minecraft.data.recipes.RecipeOutput;
import net.minecraft.data.recipes.RecipeProvider;
import net.minecraft.world.item.Items;

import java.util.concurrent.CompletableFuture;

public final class ModRecipeProvider extends RecipeProvider.Runner {
    public ModRecipeProvider(
            PackOutput output,
            CompletableFuture<HolderLookup.Provider> lookupProvider
    ) {
        super(output, lookupProvider);
    }

    @Override
    protected RecipeProvider createRecipeProvider(
            HolderLookup.Provider registries,
            RecipeOutput output
    ) {
        return new Provider(registries, output);
    }

    @Override
    public String getName() {
        return "Tutorial Mod Recipes";
    }

    private static final class Provider extends RecipeProvider {
        private Provider(
                HolderLookup.Provider registries,
                RecipeOutput output
        ) {
            super(registries, output);
        }

        @Override
        protected void buildRecipes() {
            shaped(
                    RecipeCategory.BUILDING_BLOCKS,
                    ModItems.TUTORIAL_BLOCK_ITEM.get()
            )
                    .pattern("III")
                    .pattern("ISI")
                    .pattern("III")
                    .define('I', Items.IRON_INGOT)
                    .define('S', Items.STONE)
                    .unlockedBy(
                            "has_iron_ingot",
                            has(Items.IRON_INGOT)
                    )
                    .save(output);
        }
    }
}
```

Notice that `buildRecipes` has no parameter. The recipe context stores the
registry lookup and output in protected fields, and its `shaped` helper creates
the builder. The recipe itself has not changed.

### Client and server datagen split in 1.21.4

Starting in **Minecraft 1.21.4**, NeoForge exposes separate client and server
gather-data events. Replace the one listener with two typed listeners in
`TutorialMod.java`:

```java
import net.neoforged.neoforge.data.event.GatherDataEvent;

// Inside the constructor:
modEventBus.addListener(
        GatherDataEvent.Client.class,
        ModDataGenerators::gatherClientData
);
modEventBus.addListener(
        GatherDataEvent.Server.class,
        ModDataGenerators::gatherServerData
);
```

The central provider class becomes much smaller:

```java
package com.example.tutorialmod.datagen;

import net.neoforged.neoforge.data.event.GatherDataEvent;

public final class ModDataGenerators {
    private ModDataGenerators() {
    }

    public static void gatherClientData(GatherDataEvent.Client event) {
        event.createProvider(ModBlockStateProvider::new);
        event.createProvider(ModLanguageProvider::new);
    }

    public static void gatherServerData(GatherDataEvent.Server event) {
        event.createProvider(ModBlockLootTableProvider::new);
        event.createProvider(ModRecipeProvider::new);
    }
}
```

The event already owns the output and lookups, so `createProvider` can construct
each provider from a constructor reference.

Gradle follows the same client/server separation:

```groovy
clientData {
    clientData()
    programArguments.addAll '--mod', project.mod_id,
            '--all',
            '--uncached',
            '--output', file('src/generated/resources').absolutePath,
            '--existing', file('src/main/resources').absolutePath
}

serverData {
    serverData()
    programArguments.addAll '--mod', project.mod_id,
            '--all',
            '--uncached',
            '--output', file('src/generated/resources').absolutePath,
            '--existing', file('src/main/resources').absolutePath
}
```

This creates `runClientData` and `runServerData` tasks instead of `runData`.
Run both whenever generated resources change:

```bash
./gradlew runClientData runServerData
```

The split events and runs began in **1.21.4**. The `--uncached` option shown
here is newer: NeoForge added it for **26.1**. Both 26.2 runs write to the same
`src/generated/resources` directory. Without `--uncached`, one run's cache can
treat files made by the other run as stale and remove them. Disabling the data
generator cache prevents the two independent runs from fighting over that
shared directory.

Do not copy `--uncached` into a pre-26.1 build where the option does not exist.
For those versions, follow that version's MDK and datagen documentation.

### Model datagen changed in 1.21.4 and again in 26.1

Minecraft introduced the vanilla `ModelProvider` data-generation system in
**1.21.4**. It replaces the NeoForge `BlockStateProvider` used by the 1.21.1
project. That transition also generated the new client-item definition
described below.

The 26.2 provider is:

```java
package com.example.tutorialmod.datagen;

import com.example.tutorialmod.TutorialMod;
import com.example.tutorialmod.registration.ModBlocks;
import net.minecraft.client.data.models.BlockModelGenerators;
import net.minecraft.client.data.models.ItemModelGenerators;
import net.minecraft.client.data.models.ModelProvider;
import net.minecraft.client.data.models.model.TexturedModel;
import net.minecraft.client.resources.model.sprite.Material;
import net.minecraft.data.PackOutput;
import net.minecraft.resources.Identifier;

public final class ModBlockStateProvider extends ModelProvider {
    public ModBlockStateProvider(PackOutput output) {
        super(output, TutorialMod.MOD_ID);
    }

    @Override
    protected void registerModels(
            BlockModelGenerators blockModels,
            ItemModelGenerators itemModels
    ) {
        Material tutorialBlockTexture = new Material(
                Identifier.fromNamespaceAndPath(
                        TutorialMod.MOD_ID,
                        "block/block_texture"
                )
        );

        blockModels.createTrivialBlock(
                ModBlocks.TUTORIAL_BLOCK.get(),
                block -> TexturedModel.createAllSame(
                        tutorialBlockTexture
                )
        );
    }
}
```

`createTrivialBlock` is the newer equivalent of our simple cube setup. It
generates the blockstate, cube block model, and matching block-item client data.

Two details in that code arrived later than `ModelProvider` itself:

- In **26.1**, `ResourceLocation` was renamed to `Identifier`.
- Also in **26.1**, model texture mappings began using `Material` rather than a
  raw identifier. A material contains the texture reference and can also carry
  rendering information such as forced translucency.

Therefore, code targeting 1.21.4 through 1.21.11 uses the new model-provider
architecture but still uses the resource-location and texture APIs belonging
to that exact release. Do not copy the entire 26.2 provider into 1.21.4 merely
because both extend `ModelProvider`.

### Item model files moved in 1.21.4

In 1.21.1, the generated item model is:

```text
assets/tutorialmod/models/item/tutorial_block.json
```

and it directly inherits the block model.

Starting in **Minecraft 1.21.4**, item rendering is selected by a separate
client-item definition. The 26.2 provider generates:

```text
assets/tutorialmod/items/tutorial_block.json
```

with this shape:

```json
{
  "model": {
    "type": "minecraft:model",
    "model": "tutorialmod:block/tutorial_block"
  }
}
```

The file says to render this item using the existing block model. The result on
screen is the same textured cube, but the resource format and lookup path are
different.

This distinction is particularly useful when porting. If an item works in the
game but shows a missing model after moving from 1.21.1 to 1.21.4 or newer,
check for an `assets/<modid>/items` client-item definition rather than assuming
the old `models/item` file is sufficient.

### Parts that did not need a port

`ModItems.java`, `ModLanguageProvider.java`, and
`ModBlockLootTableProvider.java` have the same structure in both tutorial
projects. The creative-tab callback is also unchanged. Their generated JSON may
be serialized a little differently by different Minecraft versions, but the
Java intent remains the same:

- one deferred block item points to the registered block;
- one translation names the block and its item form;
- `dropSelf` makes the block drop that item;
- the creative event exposes the item in Building Blocks.

This is the flexibility we want when porting: preserve the behavior and change
only the API layer that represents it.

### Quick guide for intermediate versions

| Target Minecraft versions | Relevant starting point for this tutorial |
| --- | --- |
| 1.21.1 | Use the complete main tutorial: one data event/run, NeoForge `BlockStateProvider`, old item model path, and old recipe provider |
| 1.21.2 through 1.21.3 | Add keyed-property-compatible registration and `RecipeProvider.Runner`; keep the older data event and model system |
| 1.21.4 through 1.21.11 | Also use split client/server datagen, vanilla `ModelProvider`, and client-item definitions; use that version's `ResourceLocation`-based texture API |
| 26.1 and newer | Also use `Identifier`, `Material`, Java 25, and `--uncached` when the two data runs share an output directory |

Always use the MDK and migration primer for the exact target version. Version
boundaries tell you where to look, but method signatures can continue to evolve
inside the same general architecture.

## Further reading

- [NeoForge 1.21.1 registries](https://docs.neoforged.net/docs/1.21.1/concepts/registries/)
- [NeoForge 1.21.1 blocks](https://docs.neoforged.net/docs/1.21.1/blocks/)
- [NeoForge 1.21.1 items](https://docs.neoforged.net/docs/1.21.1/items/)
- [NeoForge 1.21.1 model data generation](https://docs.neoforged.net/docs/1.21.1/resources/client/models/datagen/)
- [NeoForge 1.21.1 loot-table data generation](https://docs.neoforged.net/docs/1.21.1/resources/server/loottables/)
- [NeoForge 1.21.1 recipe data generation](https://docs.neoforged.net/docs/1.21.1/resources/server/recipes/)
- [Minecraft 1.21.1 to 1.21.2 migration primer](https://docs.neoforged.net/primer/docs/1.21.2/)
- [Minecraft 1.21.2/3 to 1.21.4 migration primer](https://docs.neoforged.net/primer/docs/1.21.4/)
- [NeoForge 1.21.4 model data generation](https://docs.neoforged.net/docs/1.21.4/resources/client/models/datagen/)
- [Minecraft 1.21.11 to 26.1 migration primer](https://docs.neoforged.net/primer/docs/26.1/)
- [NeoForge 26.2 MDK](https://github.com/NeoForgeMDKs/MDK-26.2-ModDevGradle)
