---
sidebar_position: 4
---

# Tutorial 3: Block Entities and Persistent State

In this tutorial we will turn the Tutorial Block into a block with its own
per-position data. Right-clicking the block with an empty hand toggles it
between **off** and **on**. Its top texture changes to show the current state,
and that state survives saving the world, breaking the block, carrying it in
an inventory, and placing it again.

This introduces three related systems:

- a **block entity** stores data for one placed block;
- a **block-state property** exposes the small visual state used by the model;
- an **item data component** stores the same value on an `ItemStack` while the
  block is in an inventory.

The main part of the tutorial targets Minecraft 1.21.1 and continues from
Tutorial 2. The final section shows the differences for Minecraft 26.2 and the
Minecraft version in which each API change began.

## What we are adding

The block now has an off and an on form:

```text
Placed Tutorial Block
├── TutorialBlock
│   ├── defines the ON block-state property
│   ├── creates a TutorialBlockEntity
│   └── handles empty-hand right-clicks
├── TutorialBlockEntity at this position
│   └── stores isOn and saves it with the world
└── BlockState
    └── mirrors isOn as on=false or on=true for the model

Dropped Tutorial Block ItemStack
├── item: tutorialmod:tutorial_block
├── count: usually 1
└── tutorialmod:is_on data component
    └── preserves the value and selects the inventory model
```

There are three textures:

| Texture | Use |
| --- | --- |
| `block_texture.png` | Sides and bottom in both states |
| `block_texture_off.png` | Top while off |
| `block_texture_on.png` | Top while on |

As in Tutorial 2, the PNG files are handwritten assets. Data generation
creates the blockstate, two block models, item model, and updated loot table.

## Why block entities exist

A normal `Block` is a registered singleton. All Tutorial Blocks placed in the
world share the same `TutorialBlock` object, so a field on that object cannot
store a different value for every position.

A block entity is different. Minecraft creates a separate `BlockEntity`
instance for every suitable placed block:

```text
One registered TutorialBlock
├── position (10, 64, 10) -> TutorialBlockEntity { isOn = false }
├── position (11, 64, 10) -> TutorialBlockEntity { isOn = true  }
└── position (12, 64, 10) -> TutorialBlockEntity { isOn = false }
```

The registered `BlockEntityType` is still a singleton. It describes which
class to construct and which blocks may own that class. The
`TutorialBlockEntity` objects created from that type are the per-position
instances that contain the actual data.

Block entities are appropriate for values that cannot be represented
comfortably by a small set of block states: inventories, progress counters,
energy, custom names, ownership information, and similar data. They may also
perform work every game tick, but ticking is optional. This tutorial only uses
a block entity to attach and persist data. We deliberately do not add a
ticker yet.

### Could this boolean be only a block-state property?

Yes. A boolean has only two values, so this particular feature could be made
with only a block-state property. We use both systems to demonstrate how a
block entity owns persistent data and how a small part of that data can be
mirrored into a block state for rendering.

For this tutorial, `TutorialBlockEntity.isOn` is the stored data and
`TutorialBlock.ON` is its visual representation. Keeping that relationship
explicit prepares us for later block entities whose full data cannot fit in a
block state. For example, a machine may store a large inventory and progress
counter in its block entity while exposing only `lit=true` or `lit=false` to
its model.

Do not put large or unbounded values into block states. Every possible
combination becomes a valid state that Minecraft must construct and manage.

## Why the item needs its own data

A placed block entity belongs to a world position. When the block is broken,
that block entity is removed. The dropped object is an `ItemStack`, not a
detached block entity.

Item stacks store their per-stack information in **data components**. A data
component is a typed key-value entry. We register a Boolean component named
`tutorialmod:is_on`, then copy the block entity value into it when the block is
mined. Placing the item copies the value in the opposite direction.

```text
Break block
    TutorialBlockEntity.isOn
        -> ItemStack[tutorialmod:is_on]

Place item
    ItemStack[tutorialmod:is_on]
        -> new TutorialBlockEntity.isOn
```

The component belongs to the stack. Two Tutorial Block stacks can therefore
refer to the same registered `BlockItem` while carrying different values.
Stacking rules also take component values into account: an on stack will not
normally merge with an otherwise identical off stack.

Data component values should be treated as immutable. `Boolean` is already
immutable, so toggling means setting a new `true` or `false` value rather than
mutating an object in place.

## Adding the state textures

Keep the original texture and place the two new 16 by 16 PNG files beside it:

```text
src/main/resources/assets/tutorialmod/textures/block/
├── block_texture.png
├── block_texture_off.png
└── block_texture_on.png
```

The filenames are not special to Minecraft. They are names chosen by our model
provider. As before, model references omit both the `textures` directory and
the `.png` extension, so the on texture is referenced as
`tutorialmod:block/block_texture_on`.

## Registering the data component

Create
`src/main/java/com/example/tutorialmod/registration/ModDataComponents.java`:

```java
package com.example.tutorialmod.registration;

import com.example.tutorialmod.TutorialMod;
import com.mojang.serialization.Codec;
import net.minecraft.core.component.DataComponentType;
import net.minecraft.core.registries.Registries;
import net.minecraft.network.codec.ByteBufCodecs;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.neoforge.registries.DeferredHolder;
import net.neoforged.neoforge.registries.DeferredRegister;

public final class ModDataComponents {
    public static final DeferredRegister.DataComponents DATA_COMPONENTS =
            DeferredRegister.createDataComponents(
                    Registries.DATA_COMPONENT_TYPE,
                    TutorialMod.MOD_ID
            );

    public static final DeferredHolder<
            DataComponentType<?>,
            DataComponentType<Boolean>
    > IS_ON = DATA_COMPONENTS.registerComponentType(
            "is_on",
            builder -> builder
                    .persistent(Codec.BOOL)
                    .networkSynchronized(ByteBufCodecs.BOOL)
    );

    private ModDataComponents() {
    }

    public static void register(IEventBus modEventBus) {
        DATA_COMPONENTS.register(modEventBus);
    }
}
```

`DataComponentType<Boolean>` is the type-safe key. It says that a value found
under `tutorialmod:is_on` must be a Boolean.

The two codecs have different jobs:

- `persistent(Codec.BOOL)` describes how the value is stored on disk and in
  data such as item commands.
- `networkSynchronized(ByteBufCodecs.BOOL)` describes its compact network
  representation when an item stack is sent between server and client.

The component type is registered with a deferred register for the same reason
as blocks and items: it receives its registry name during the correct registry
event.

## Giving the block item a default value

Replace the simple item registration in `ModItems.java` with a `BlockItem`
whose default component value is `false`:

```java
package com.example.tutorialmod.registration;

import com.example.tutorialmod.TutorialMod;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.Item;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.neoforge.registries.DeferredItem;
import net.neoforged.neoforge.registries.DeferredRegister;

public final class ModItems {
    public static final DeferredRegister.Items ITEMS =
            DeferredRegister.createItems(TutorialMod.MOD_ID);

    public static final DeferredItem<BlockItem> TUTORIAL_BLOCK_ITEM =
            ITEMS.register(
                    "tutorial_block",
                    () -> new BlockItem(
                            ModBlocks.TUTORIAL_BLOCK.get(),
                            new Item.Properties().component(
                                    ModDataComponents.IS_ON.get(),
                                    false
                            )
                    )
            );

    private ModItems() {
    }

    public static void register(IEventBus modEventBus) {
        ITEMS.register(modEventBus);
    }
}
```

The default means a newly crafted or creative-menu stack starts off. A stack
only needs to carry a component patch when its value differs from the item's
defaults, although `getOrDefault` will work in either case.

This registration still creates one `BlockItem` singleton. Its properties
describe default components; individual stacks can override those values.

## Registering the block entity type

Create
`src/main/java/com/example/tutorialmod/registration/ModBlockEntities.java`:

```java
package com.example.tutorialmod.registration;

import com.example.tutorialmod.TutorialMod;
import com.example.tutorialmod.block.entity.TutorialBlockEntity;
import net.minecraft.core.registries.Registries;
import net.minecraft.world.level.block.entity.BlockEntityType;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.neoforge.registries.DeferredHolder;
import net.neoforged.neoforge.registries.DeferredRegister;

public final class ModBlockEntities {
    public static final DeferredRegister<BlockEntityType<?>>
            BLOCK_ENTITY_TYPES = DeferredRegister.create(
                    Registries.BLOCK_ENTITY_TYPE,
                    TutorialMod.MOD_ID
            );

    public static final DeferredHolder<
            BlockEntityType<?>,
            BlockEntityType<TutorialBlockEntity>
    > TUTORIAL_BLOCK_ENTITY = BLOCK_ENTITY_TYPES.register(
            "tutorial_block",
            () -> BlockEntityType.Builder.of(
                    TutorialBlockEntity::new,
                    ModBlocks.TUTORIAL_BLOCK.get()
            ).build(null)
    );

    private ModBlockEntities() {
    }

    public static void register(IEventBus modEventBus) {
        BLOCK_ENTITY_TYPES.register(modEventBus);
    }
}
```

The builder receives two important arguments:

- `TutorialBlockEntity::new` is a constructor reference. Minecraft uses it to
  create an instance for a position and its initial block state.
- `ModBlocks.TUTORIAL_BLOCK.get()` declares that our Tutorial Block is valid
  for this block entity type.

Passing `null` to `build` means we are not providing a vanilla DataFixer type.
That is normal for a simple mod block entity in 1.21.1.

## Creating the block entity

Create
`src/main/java/com/example/tutorialmod/block/entity/TutorialBlockEntity.java`:

```java
package com.example.tutorialmod.block.entity;

import com.example.tutorialmod.block.TutorialBlock;
import com.example.tutorialmod.registration.ModBlockEntities;
import com.example.tutorialmod.registration.ModDataComponents;
import net.minecraft.core.BlockPos;
import net.minecraft.core.HolderLookup;
import net.minecraft.core.component.DataComponentMap;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockState;

public final class TutorialBlockEntity extends BlockEntity {
    private static final String TAG_IS_ON = "is_on";

    private boolean isOn;

    public TutorialBlockEntity(BlockPos position, BlockState state) {
        super(ModBlockEntities.TUTORIAL_BLOCK_ENTITY.get(), position, state);
        isOn = state.getValue(TutorialBlock.ON);
    }

    public boolean isOn() {
        return isOn;
    }

    public void toggle() {
        setOn(!isOn);
    }

    public void setOn(boolean isOn) {
        if (this.isOn == isOn) {
            return;
        }

        this.isOn = isOn;
        setChanged();

        if (level != null
                && getBlockState().getValue(TutorialBlock.ON) != isOn) {
            level.setBlock(
                    worldPosition,
                    getBlockState().setValue(TutorialBlock.ON, isOn),
                    Block.UPDATE_CLIENTS
            );
        }
    }

    @Override
    protected void loadAdditional(
            CompoundTag tag,
            HolderLookup.Provider lookupProvider
    ) {
        super.loadAdditional(tag, lookupProvider);
        isOn = tag.getBoolean(TAG_IS_ON);
    }

    @Override
    protected void saveAdditional(
            CompoundTag tag,
            HolderLookup.Provider lookupProvider
    ) {
        super.saveAdditional(tag, lookupProvider);
        tag.putBoolean(TAG_IS_ON, isOn);
    }

    @Override
    protected void collectImplicitComponents(
            DataComponentMap.Builder components
    ) {
        super.collectImplicitComponents(components);
        components.set(ModDataComponents.IS_ON.get(), isOn);
    }

    @Override
    protected void applyImplicitComponents(
            DataComponentInput components
    ) {
        super.applyImplicitComponents(components);
        setOn(components.getOrDefault(
                ModDataComponents.IS_ON.get(),
                false
        ));
    }

    @SuppressWarnings("deprecation")
    @Override
    public void removeComponentsFromTag(CompoundTag tag) {
        super.removeComponentsFromTag(tag);
        tag.remove(TAG_IS_ON);
    }
}
```

### Changing and saving the value

`toggle` delegates to `setOn`, so all updates follow one path. `setOn` first
returns when nothing changed. Otherwise it:

1. updates the block entity field;
2. calls `setChanged()` so Minecraft knows the chunk needs saving;
3. replaces the block state with one containing the matching `ON` value;
4. uses `Block.UPDATE_CLIENTS` so clients receive the changed state and rebuild
   the rendered block.

The server owns the authoritative value. The block state is synchronized by
Minecraft, so we do not need a custom block-entity update packet merely to
display these two models.

`saveAdditional` writes the field to the block entity's NBT when its chunk is
saved. `loadAdditional` restores it when the block entity is loaded. Always
call the superclass methods; Minecraft and NeoForge use them for their own
data.

The block state itself is also saved by Minecraft. Because every change goes
through `setOn`, the persisted field and visual property remain in agreement.

### Moving the value between block entity and item

The three component hooks form Minecraft's block-entity/item bridge:

- `collectImplicitComponents` exposes `isOn` as our data component. The loot
  function added later can copy that component to the dropped stack.
- `applyImplicitComponents` is called by `BlockItem` after it creates the new
  block entity. It reads the component from the placing stack and calls
  `setOn`, which updates both stored data and the block state.
- `removeComponentsFromTag` prevents `is_on` from also being copied into the
  generic `minecraft:block_entity_data` component when Minecraft saves a block
  entity to an item. The typed `tutorialmod:is_on` component is the one place
  the item should carry this value.

`removeComponentsFromTag` is deprecated, but it is still the intended 1.21.1
hook for excluding values that have a typed component representation. The
suppression is narrow so other deprecation warnings remain visible.

## Turning the block into an entity block

Replace the simple `Block` with
`src/main/java/com/example/tutorialmod/block/TutorialBlock.java`:

```java
package com.example.tutorialmod.block;

import com.example.tutorialmod.block.entity.TutorialBlockEntity;
import net.minecraft.core.BlockPos;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.EntityBlock;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.state.BlockBehaviour;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.StateDefinition;
import net.minecraft.world.level.block.state.properties.BooleanProperty;
import net.minecraft.world.phys.BlockHitResult;

public final class TutorialBlock extends Block implements EntityBlock {
    public static final BooleanProperty ON = BooleanProperty.create("on");

    public TutorialBlock(BlockBehaviour.Properties properties) {
        super(properties);
        registerDefaultState(stateDefinition.any().setValue(ON, false));
    }

    @Override
    protected void createBlockStateDefinition(
            StateDefinition.Builder<Block, BlockState> builder
    ) {
        builder.add(ON);
    }

    @Override
    public BlockEntity newBlockEntity(BlockPos position, BlockState state) {
        return new TutorialBlockEntity(position, state);
    }

    @Override
    protected InteractionResult useWithoutItem(
            BlockState state,
            Level level,
            BlockPos position,
            Player player,
            BlockHitResult hitResult
    ) {
        if (!player.getMainHandItem().isEmpty()) {
            return InteractionResult.PASS;
        }

        if (!level.isClientSide()
                && level.getBlockEntity(position)
                instanceof TutorialBlockEntity blockEntity) {
            blockEntity.toggle();
        }

        return InteractionResult.sidedSuccess(level.isClientSide());
    }
}
```

`EntityBlock` tells Minecraft that this block can provide a block entity.
`newBlockEntity` constructs a fresh instance for the given position. We do not
override `getTicker`; its default result is `null`, so Minecraft performs no
per-tick callback for this block entity.

### Defining the Boolean block-state property

Creating a `BooleanProperty` is not enough by itself. It must be added to the
block's `StateDefinition` in `createBlockStateDefinition`. The constructor can
then select the default value:

```java
registerDefaultState(stateDefinition.any().setValue(ON, false));
```

The property's serialized name is `on`, which is why generated blockstate
selectors use `on=false` and `on=true`.

Block states are immutable. Calling `setValue` returns a different state; it
does not modify the existing state object. `level.setBlock` installs that
state at the position.

### Handling the empty-hand interaction

`useWithoutItem` is the block callback for an empty-hand use. The explicit
main-hand check keeps the tutorial's intent clear and lets other behavior try
the interaction by returning `PASS` when an item is held.

Minecraft runs interaction logic on both logical sides:

- the **server** changes the authoritative block entity and block state;
- the **client** returns a successful result so the interaction feels
  immediate, but does not toggle its own copy independently.

`InteractionResult.sidedSuccess` selects the appropriate success result for
the side. Running the mutation only behind `!level.isClientSide()` prevents a
double toggle and avoids a temporary client value that the server would need
to correct.

## Registering the custom block class

Update `ModBlocks.java` to construct `TutorialBlock` instead of using
`registerSimpleBlock`:

```java
public static final DeferredBlock<TutorialBlock> TUTORIAL_BLOCK =
        BLOCKS.registerBlock(
                "tutorial_block",
                TutorialBlock::new,
                BlockBehaviour.Properties.of()
                        .mapColor(MapColor.METAL)
                        .strength(3.0F)
                        .sound(SoundType.METAL)
        );
```

`registerBlock` accepts the `TutorialBlock` constructor and the same properties
from Tutorial 2. The deferred holder is now typed as
`DeferredBlock<TutorialBlock>`, allowing other code to refer to `ON` and the
custom behavior safely.

## Connecting the new registries

Register the component type before the item that uses it, and register the
block entity type along with the other content in `TutorialMod`:

```java
public TutorialMod(IEventBus modEventBus) {
    ModDataComponents.register(modEventBus);
    ModBlocks.register(modEventBus);
    ModItems.register(modEventBus);
    ModBlockEntities.register(modEventBus);

    modEventBus.addListener(TutorialMod::addCreativeTabItems);
    modEventBus.addListener(ModDataGenerators::gatherData);

    LOGGER.info("Tutorial Mod is loading!");
}
```

All four registrations still use the mod event bus. Deferred registration
ensures construction happens during the correct registry events; the calls
above attach each queue to that bus.

## Generating two block models and their states

Replace `registerStatesAndModels` in `ModBlockStateProvider`:

```java
@Override
protected void registerStatesAndModels() {
    ResourceLocation baseTexture = modLoc("block/block_texture");

    ModelFile offModel = models().cubeBottomTop(
            "tutorial_block_off",
            baseTexture,
            baseTexture,
            modLoc("block/block_texture_off")
    );
    ModelFile onModel = models().cubeBottomTop(
            "tutorial_block_on",
            baseTexture,
            baseTexture,
            modLoc("block/block_texture_on")
    );

    getVariantBuilder(ModBlocks.TUTORIAL_BLOCK.get())
            .partialState()
            .with(TutorialBlock.ON, false)
            .modelForState()
            .modelFile(offModel)
            .addModel()
            .partialState()
            .with(TutorialBlock.ON, true)
            .modelForState()
            .modelFile(onModel)
            .addModel();

    itemModels().getBuilder("tutorial_block")
            .parent(offModel)
            .override()
            .predicate(modLoc("is_on"), 1.0F)
            .model(onModel)
            .end();
}
```

Also add these imports:

```java
import com.example.tutorialmod.block.TutorialBlock;
import net.minecraft.resources.ResourceLocation;
```

`cubeBottomTop` uses separate texture slots for the side, bottom, and top. We
give both models the original texture for their sides and bottoms, then use a
different top texture for each value.

The variant builder maps every valid block state to a model:

```text
on=false -> tutorialmod:block/tutorial_block_off
on=true  -> tutorialmod:block/tutorial_block_on
```

The item model defaults to the off model. Its override asks for a numeric item
property named `tutorialmod:is_on`; when that property is `1.0`, it uses the on
model. The JSON model does not itself know how to read our Boolean component,
so we register that connection in client code next.

## Selecting the inventory model from the component

Create
`src/main/java/com/example/tutorialmod/client/TutorialModClient.java`:

```java
package com.example.tutorialmod.client;

import com.example.tutorialmod.TutorialMod;
import com.example.tutorialmod.registration.ModDataComponents;
import com.example.tutorialmod.registration.ModItems;
import net.minecraft.client.renderer.item.ItemProperties;
import net.minecraft.resources.ResourceLocation;
import net.neoforged.api.distmarker.Dist;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.fml.common.EventBusSubscriber;
import net.neoforged.fml.event.lifecycle.FMLClientSetupEvent;

@EventBusSubscriber(modid = TutorialMod.MOD_ID, value = Dist.CLIENT)
public final class TutorialModClient {
    private static final ResourceLocation IS_ON_PROPERTY =
            ResourceLocation.fromNamespaceAndPath(
                    TutorialMod.MOD_ID,
                    "is_on"
            );

    private TutorialModClient() {
    }

    @SubscribeEvent
    private static void onClientSetup(FMLClientSetupEvent event) {
        event.enqueueWork(() -> ItemProperties.register(
                ModItems.TUTORIAL_BLOCK_ITEM.get(),
                IS_ON_PROPERTY,
                (stack, level, entity, seed) ->
                        stack.getOrDefault(
                                ModDataComponents.IS_ON.get(),
                                false
                        ) ? 1.0F : 0.0F
        ));
    }
}
```

This class is restricted to `Dist.CLIENT` because item models and
`ItemProperties` do not exist on a dedicated server. The event subscriber is
discovered automatically, so it does not need a manual listener in
`TutorialMod`.

The callback reads `IS_ON` from the stack and converts the Boolean into the
float expected by the 1.21.1 item-property system. `false` becomes `0.0` and
`true` becomes `1.0`. That value matches the generated model override.

Registration is enqueued because `ItemProperties.register` must run on the
appropriate main thread after client setup begins.

## Copying the component in the loot table

Tutorial 2 used `dropSelf`, which created a plain stack. Replace the `generate`
method in the loot-table subprovider with:

```java
@Override
protected void generate() {
    add(
            ModBlocks.TUTORIAL_BLOCK.get(),
            createSingleItemTable(ModBlocks.TUTORIAL_BLOCK.get())
                    .apply(
                            CopyComponentsFunction.copyComponents(
                                    CopyComponentsFunction.Source.BLOCK_ENTITY
                            ).include(ModDataComponents.IS_ON.get())
                    )
    );
}
```

Add this import:

```java
import net.minecraft.world.level.storage.loot.functions.CopyComponentsFunction;
```

`createSingleItemTable` retains the one-item drop and explosion-survival rule.
`CopyComponentsFunction` then asks the block entity for its components and
copies only `tutorialmod:is_on` to that result stack.

The `include` call is intentional. A block entity may expose more components
later, but this loot table promises to preserve only the component relevant to
this item. Explicit lists are easier to review than copying unrelated data by
accident.

This is data generated even though it describes runtime data transfer. The
provider produces a normal loot-table JSON function that Minecraft executes
when the block is broken.

## Running data generation

The providers are already connected from Tutorial 2. Run:

```bash
./gradlew runData
```

The relevant generated files are now:

```text
src/generated/resources/
├── assets/tutorialmod/
│   ├── blockstates/tutorial_block.json
│   └── models/
│       ├── block/
│       │   ├── tutorial_block_off.json
│       │   └── tutorial_block_on.json
│       └── item/tutorial_block.json
└── data/tutorialmod/
    └── loot_table/blocks/tutorial_block.json
```

The recipe, recipe advancement, and language file remain generated as before.
Do not edit generated JSON directly; change its provider and rerun the data
task.

The blockstate JSON contains both Boolean variants:

```json
{
  "variants": {
    "on=false": {
      "model": "tutorialmod:block/tutorial_block_off"
    },
    "on=true": {
      "model": "tutorialmod:block/tutorial_block_on"
    }
  }
}
```

The 1.21.1 item model contains the component-backed property override:

```json
{
  "parent": "tutorialmod:block/tutorial_block_off",
  "overrides": [
    {
      "model": "tutorialmod:block/tutorial_block_on",
      "predicate": {
        "tutorialmod:is_on": 1.0
      }
    }
  ]
}
```

The loot table includes a `minecraft:copy_components` function whose source is
`block_entity` and whose include list contains `tutorialmod:is_on`.

## Following one value through its complete lifecycle

It is useful to trace the feature from beginning to end:

1. A newly crafted item stack inherits `IS_ON=false` from the registered
   `BlockItem` properties.
2. The item model callback reads `false`, so the inventory renders the off
   block model.
3. Placing the stack creates a `TutorialBlockEntity`.
4. `BlockItem` calls `applyImplicitComponents`, which applies `false` to the
   block entity and its `ON` block state.
5. Empty-hand right-clicking runs on both sides, but only the server calls
   `toggle`.
6. `setOn(true)` marks the block entity changed and updates the block state.
7. The client receives `on=true` and renders the on block model.
8. World saving writes `is_on=true` through `saveAdditional`.
9. Breaking the block runs the generated loot table. It copies the component
   exposed by `collectImplicitComponents` to the dropped stack.
10. The dropped item and its inventory representation use the on model because
    its component is `true`.
11. Placing that stack again applies `true` to the new block entity.

This is why no one storage mechanism can simply be omitted: the block entity,
block state, and item stack each represent the block during a different part
of its lifecycle.

## Trying the feature in Minecraft

Build and launch the development client:

```bash
./gradlew build
./gradlew runClient
```

Check the complete lifecycle:

1. Obtain a Tutorial Block and confirm its top uses the off texture.
2. Place it and right-click it with an empty main hand.
3. Confirm the top changes between off and on on every click.
4. Hold an item while right-clicking and confirm the tutorial interaction does
   not consume that action.
5. Toggle the block on, save and reopen the world, and confirm it remains on.
6. Toggle it on, mine it in survival, and confirm the dropped item uses the on
   model.
7. Place that item and confirm the new block is still on.
8. Compare an on and off stack and confirm their models differ and they do not
   incorrectly merge.

If the world model never changes, check that `ON` was added in
`createBlockStateDefinition` and that `setOn` installs the new state. If the
value resets after reloading, check `setChanged`, `saveAdditional`, and
`loadAdditional`. If it resets only after breaking, inspect the generated loot
table and the component bridge methods. If the dropped item retains its data
but shows the off model, check the client item-property registration and the
generated item override.

## What the project now understands

The Tutorial Block now demonstrates four distinct kinds of object:

- one registered `TutorialBlock` defines shared behavior;
- one registered `BlockEntityType` knows how to create valid block entities;
- each placed block has its own `TutorialBlockEntity` instance and data;
- each inventory occurrence is an `ItemStack` with its own count and component
  values.

Its Boolean travels safely through world persistence and the block/item
lifecycle, while a small block-state property provides efficient model
selection. The block entity remains non-ticking; a later tutorial can add a
ticker when there is actual repeated work to perform.

## Minecraft 26.2 differences

The companion 26.2 project implements the same behavior and uses the same
three-part design: a block-entity field stores the placed value, a Boolean
block-state property selects the world model, and an item data component
preserves the value on an `ItemStack`.

Attachments are still optional in 26.2. For a block entity owned by this mod,
ordinary fields plus the block entity's save/load hooks remain the simpler and
preferred approach. An attachment is more useful when adding reusable or
optional data to an existing block entity, especially one from Minecraft or
another mod. It would also not replace the item component used while the block
is in an inventory.

### Difference summary and version boundaries

| Area | Minecraft 1.21.1 | Minecraft 26.2 | Change began in |
| --- | --- | --- | --- |
| Block entity type construction | `BlockEntityType.Builder.of(...).build(null)` | Direct `new BlockEntityType<>(factory, validBlocks)` | **1.21.2** |
| Successful interaction result | `InteractionResult.sidedSuccess(...)` | `SUCCESS` or `SUCCESS_SERVER`, then `withoutItem()` | **1.21.2** |
| Client item rendering | Runtime `ItemProperties` callback plus model `overrides` | Data-driven client-item definition; no client setup class | **1.21.4** |
| Component value item selector | Custom/runtime property in 1.21.1 | Built-in `ComponentContents` selector | **1.21.5** |
| Applying block entity components | `DataComponentInput` | `DataComponentGetter` | **1.21.5** |
| Block entity persistence | Raw `CompoundTag` plus registry lookup | `ValueInput` and `ValueOutput` | **1.21.6** |
| Removing duplicated saved fields | `CompoundTag#remove` | `ValueOutput#discard` | **1.21.6** |
| Loot component-copy builder | `copyComponents(Source.BLOCK_ENTITY)` | `copyComponentsFromBlockEntity(LootContextParams.BLOCK_ENTITY)` | **1.21.9** |
| Model provider architecture | NeoForge `BlockStateProvider` | Vanilla `ModelProvider`, `MultiVariantGenerator`, and `PropertyDispatch` | **1.21.4** |
| Resource and texture types used by model datagen | `ResourceLocation` texture references | `Identifier` and `Material` | **26.1** |

The split client/server data runs, property modifier registration, Java 25,
and other general project changes were covered in Tutorials 1 and 2. They
still apply to the 26.2 project but are not repeated in detail here.

### Block entity type construction changed in 1.21.2

Minecraft removed `BlockEntityType.Builder` in **1.21.2**. NeoForge exposes
the direct constructor, so the 26.2 registration is:

```java
public static final DeferredHolder<
        BlockEntityType<?>,
        BlockEntityType<TutorialBlockEntity>
> TUTORIAL_BLOCK_ENTITY = BLOCK_ENTITY_TYPES.register(
        "tutorial_block",
        () -> new BlockEntityType<>(
                TutorialBlockEntity::new,
                ModBlocks.TUTORIAL_BLOCK.get()
        )
);
```

The meaning is unchanged: supply the instance factory and the blocks on which
the type is valid. The obsolete DataFixer argument and final `build(null)` call
are gone.

### Interaction results changed in 1.21.2

The interaction-result hierarchy was redesigned in **1.21.2**.
`sidedSuccess` no longer exists. The 26.2 callback ends with:

```java
return (level.isClientSide()
        ? InteractionResult.SUCCESS
        : InteractionResult.SUCCESS_SERVER)
        .withoutItem();
```

`SUCCESS` requests a client-side hand swing, while `SUCCESS_SERVER` represents
the server result. `withoutItem()` records that the successful interaction did
not use or transform a held item. The server-only mutation and empty-hand guard
remain the same.

### Client item models became data-driven in 1.21.4

Minecraft replaced legacy item model overrides and the runtime
`ItemProperties` registry in **1.21.4**. Item rendering is now described by a
client-item definition under:

```text
assets/tutorialmod/items/tutorial_block.json
```

Consequently, the 26.2 project has no `TutorialModClient` class for this
feature. Its model provider directly generates a `minecraft:select` item
definition.

The general client-item system began in **1.21.4**, but the built-in
`ComponentContents` selector used here was added in **1.21.5**. It reads the
actual Boolean component value without converting it to a float:

```java
itemModels.itemModelOutput.accept(
        ModItems.TUTORIAL_BLOCK_ITEM.get(),
        ItemModelUtils.select(
                new ComponentContents<>(ModDataComponents.IS_ON.get()),
                ItemModelUtils.plainModel(offModel),
                ItemModelUtils.when(
                        true,
                        ItemModelUtils.plainModel(onModel)
                )
        )
);
```

The generated definition uses the off model as its fallback and selects the
on model when `tutorialmod:is_on` is `true`:

```json
{
  "model": {
    "type": "minecraft:select",
    "cases": [
      {
        "model": {
          "type": "minecraft:model",
          "model": "tutorialmod:block/tutorial_block_on"
        },
        "when": true
      }
    ],
    "component": "tutorialmod:is_on",
    "fallback": {
      "type": "minecraft:model",
      "model": "tutorialmod:block/tutorial_block_off"
    },
    "property": "minecraft:component"
  }
}
```

For exactly 1.21.4, use that version's client-item system, but do not assume
`ComponentContents` is available yet. It arrived one release later.

### Component input became DataComponentGetter in 1.21.5

Minecraft generalized component reads in **1.21.5** with
`DataComponentGetter`. The method body is unchanged; only the parameter type
differs:

```java
@Override
protected void applyImplicitComponents(DataComponentGetter components) {
    super.applyImplicitComponents(components);
    setOn(components.getOrDefault(
            ModDataComponents.IS_ON.get(),
            false
    ));
}
```

`collectImplicitComponents` still receives a `DataComponentMap.Builder`, so
the block-entity-to-item half of the bridge remains structurally the same.

### Value I/O replaced direct NBT access in 1.21.6

Starting in **Minecraft 1.21.6**, high-level objects such as block entities no
longer receive a raw `CompoundTag` in their normal persistence hooks. They use
`ValueInput` and `ValueOutput`:

```java
@Override
protected void loadAdditional(ValueInput input) {
    super.loadAdditional(input);
    isOn = input.getBooleanOr(TAG_IS_ON, false);
}

@Override
protected void saveAdditional(ValueOutput output) {
    super.saveAdditional(output);
    output.putBoolean(TAG_IS_ON, isOn);
}

@SuppressWarnings("deprecation")
@Override
public void removeComponentsFromTag(ValueOutput output) {
    super.removeComponentsFromTag(output);
    output.discard(TAG_IS_ON);
}
```

The world data is still normally backed by NBT. Value I/O is an abstraction
over that backing format, not a replacement for custom block-entity
persistence. Primitive methods closely match their old tag equivalents:

```text
tag.putBoolean(key, value)       -> output.putBoolean(key, value)
tag.getBoolean(key)              -> input.getBooleanOr(key, false)
tag.remove(key)                  -> output.discard(key)
```

The registry lookup parameter also disappears because the Value I/O object
already carries the serialization context needed for codecs.

### The loot builder changed in 1.21.9

In **Minecraft 1.21.9**, the general `copyComponents` builder was split into
source-specific factory methods. The 26.2 provider uses:

```java
CopyComponentsFunction.copyComponentsFromBlockEntity(
        LootContextParams.BLOCK_ENTITY
).include(ModDataComponents.IS_ON.get())
```

This still generates the same conceptual `minecraft:copy_components` loot
function. Only the Java builder used to describe its block-entity source
changed.

### Stateful model generation across 1.21.4 and 26.1

The 1.21.1 `BlockStateProvider` convenience API is replaced by Minecraft's
vanilla `ModelProvider` architecture starting in **1.21.4**. A stateful block
uses a `MultiVariantGenerator` and `PropertyDispatch` in the 26.2 project:

```java
blockModels.blockStateOutput.accept(
        MultiVariantGenerator.dispatch(ModBlocks.TUTORIAL_BLOCK.get())
                .with(
                        PropertyDispatch.initial(TutorialBlock.ON)
                                .select(false, plainVariant(offModel))
                                .select(true, plainVariant(onModel))
                )
);
```

The two models are created with `ModelTemplates.CUBE_BOTTOM_TOP` and separate
`TextureMapping` objects. The intent is the same as 1.21.1's
`cubeBottomTop`: both use the base texture for `SIDE` and `BOTTOM`, with an off
or on texture in `TOP`.

Two types in that provider changed later, in **26.1**:

- `ResourceLocation` was renamed to `Identifier`.
- Model texture mappings use `Material` values rather than raw resource
  identifiers.

This means a port to 1.21.4 through 1.21.11 uses the newer model-provider
architecture but must still use the identifier and texture types from that
specific Minecraft version.

### Block item defaults in 26.2

The component registration itself is unchanged. The 26.2 specialized block
item helper can add the default component through a properties modifier:

```java
public static final DeferredItem<BlockItem> TUTORIAL_BLOCK_ITEM =
        ITEMS.registerSimpleBlockItem(
                ModBlocks.TUTORIAL_BLOCK,
                properties -> properties.component(
                        ModDataComponents.IS_ON.get(),
                        false
                )
        );
```

Property modifier registration began in **1.21.2** and was already explained
in Tutorial 2. It does not change the meaning of the default value.

### Quick guide for intermediate versions

| Target Minecraft versions | Changes relevant to this tutorial |
| --- | --- |
| 1.21.1 | Use the complete main tutorial |
| 1.21.2 through 1.21.3 | Use the direct block entity type constructor and new interaction result constants |
| 1.21.4 | Also use data-driven client items and vanilla model datagen; use a selector available in that exact release |
| 1.21.5 | `applyImplicitComponents` takes `DataComponentGetter`, and `ComponentContents` can select directly from `IS_ON` |
| 1.21.6 through 1.21.8 | Also use `ValueInput`/`ValueOutput` persistence |
| 1.21.9 through 1.21.11 | Also use the source-specific block-entity component-copy builder |
| 26.1 and newer | Also use `Identifier`, `Material`, Java 25, and the current registration/datagen details from Tutorials 1 and 2 |

Always check the MDK and migration primer for the exact target. These version
boundaries identify the release where a design changed, but method names and
helper overloads can continue evolving afterward.

## Further reading

- [NeoForge 1.21.1 block entities](https://docs.neoforged.net/docs/1.21.1/blockentities/)
- [NeoForge 1.21.1 data components](https://docs.neoforged.net/docs/1.21.1/items/datacomponents/)
- [NeoForge 1.21.1 model data generation](https://docs.neoforged.net/docs/1.21.1/resources/client/models/datagen/)
- [NeoForge 1.21.1 loot functions](https://docs.neoforged.net/docs/1.21.1/resources/server/loottables/lootfunctions/)
- [Minecraft 1.21.1 to 1.21.2 migration primer](https://docs.neoforged.net/primer/docs/1.21.2/)
- [Minecraft 1.21.2/3 to 1.21.4 migration primer](https://docs.neoforged.net/primer/docs/1.21.4/)
- [Minecraft 1.21.4 to 1.21.5 migration primer](https://docs.neoforged.net/primer/docs/1.21.5/)
- [Minecraft 1.21.5 to 1.21.6 migration primer](https://docs.neoforged.net/primer/docs/1.21.6/)
- [Minecraft 1.21.8 to 1.21.9 migration primer](https://docs.neoforged.net/primer/docs/1.21.9/)
- [Minecraft 1.21.11 to 26.1 migration primer](https://docs.neoforged.net/primer/docs/26.1/)
- [NeoForge Value I/O](https://docs.neoforged.net/docs/datastorage/valueio/)
- [NeoForge 26.2 MDK](https://github.com/NeoForgeMDKs/MDK-26.2-ModDevGradle)
