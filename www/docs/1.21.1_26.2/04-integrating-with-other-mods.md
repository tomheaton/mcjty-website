---
sidebar_position: 5
---

# Tutorial 4: Integrating with JEI and The One Probe

In this tutorial we will make the Tutorial Block cooperate with two popular
mods:

- **Just Enough Items (JEI)** shows items and recipes. We will teach it that
  the off and on Tutorial Blocks are two meaningful forms of the same item,
  add the on form to its ingredient list, and add an information page.
- **The One Probe (TOP)** shows information about a block in the world. We
  will add a line that reports whether the Tutorial Block is on or off.

This tutorial focuses entirely on mod integration. Its main sections target
Minecraft 1.21.1 and continue from Tutorial 3. The final section compares the
working port in the companion Minecraft 26.2 project, including the external
API and dependency changes.

## What integration means

An integration sits between two independently developed mods. Our code can
use another mod's public API, but it should not copy that mod's implementation
or assume that every player has installed it.

That creates three separate concerns:

```text
During compilation
    API classes must be available to javac

During a development run
    full JEI and TOP mods should be available for testing

For players
    either mod may be present or absent
```

Gradle dependency configurations and optional mod metadata let us express
those requirements accurately. The finished Tutorial Mod jar does not contain
JEI or TOP, and it does not require either one to start.

## Choosing versions from the correct Maven

For Minecraft 1.21.1 this tutorial uses:

| Mod | Maven artifact version |
| --- | --- |
| JEI | `19.25.0.325` |
| The One Probe | `1.21_neo-12.0.3-5` |

Minecraft integrations are version-sensitive. A newer-looking JEI or TOP
version may target another Minecraft release and therefore use different
Minecraft types or method signatures. Keep these version values beside the
Minecraft and NeoForge values in `gradle.properties`:

```properties
# Optional mod integrations
jei_version=19.25.0.325
top_version=1.21_neo-12.0.3-5
```

The unusual TOP version is not a typo. Maven coordinates are opaque strings
chosen by the publisher; copy the exact version from the repository rather
than trying to derive it from the Minecraft version.

## Adding the Maven repositories

Gradle must know where each publisher hosts its artifacts. Add these blocks
after `group = mod_group_id` in `build.gradle`:

```groovy
repositories {
    exclusiveContent {
        forRepository {
            maven { url = 'https://maven.blamejared.com' }
        }
        filter { includeGroup 'mezz.jei' }
    }

    exclusiveContent {
        forRepository {
            maven { url = 'https://maven.k-4u.nl' }
        }
        filter { includeGroup 'mcjty.theoneprobe' }
    }
}
```

JEI is published under the `mezz.jei` group and TOP under
`mcjty.theoneprobe`. `exclusiveContent` tells Gradle to consult each repository
only for its owner's group. This avoids asking every custom Maven for every
dependency and prevents an unrelated repository from supplying an artifact
with a matching coordinate.

A Maven repository is a build-time download location. It does not make the
downloaded project part of our mod and it does not tell NeoForge that the mod
is optional. Those jobs belong to the dependency declarations and mod
metadata.

## Compile APIs and development runtimes

Add a `dependencies` block below the repositories:

```groovy
dependencies {
    // Compile against integration APIs, and load the complete mods in dev runs.
    compileOnly "mezz.jei:jei-${minecraft_version}-common-api:${jei_version}"
    compileOnly "mezz.jei:jei-${minecraft_version}-neoforge-api:${jei_version}"
    compileOnly "mcjty.theoneprobe:theoneprobe:${top_version}"

    // Use -Pexclude_optional_mods to verify that the mod also starts by itself.
    if (!project.hasProperty('exclude_optional_mods')) {
        runtimeOnly "mezz.jei:jei-${minecraft_version}-neoforge:${jei_version}"
        runtimeOnly "mcjty.theoneprobe:theoneprobe:${top_version}"
    }
}
```

The configurations have distinct meanings:

| Configuration | Available while compiling | Loaded in a development run | Packed inside our jar |
| --- | --- | --- | --- |
| `compileOnly` | Yes | No by itself | No |
| `runtimeOnly` | No | Yes | No |

JEI publishes separate common and NeoForge API artifacts as well as its full
NeoForge mod. TOP publishes its public API in the same artifact as the mod for
this version, so its coordinate appears in both configurations. Gradle resolves
the shared module once for the runtime classpath.

Using `implementation` for everything would also make the classes compile and
run, but it would describe the relationship less clearly and expose those
dependencies to downstream compile consumers of this project. The two-line
pattern documents exactly what we need.

Run this after changing dependencies:

```bash
./gradlew compileJava
```

Gradle downloads the artifacts on the first run and then reuses its cache.

## Declaring optional mod relationships

The dependency block in `build.gradle` controls Gradle. NeoForge reads
`neoforge.mods.toml` inside the built jar instead. Add these entries to
`src/main/templates/META-INF/neoforge.mods.toml`:

```toml
[[dependencies.${mod_id}]]
modId="jei"
type="optional"
versionRange="[${jei_version},)"
ordering="AFTER"
side="CLIENT"

[[dependencies.${mod_id}]]
modId="theoneprobe"
type="optional"
versionRange="[0,)"
ordering="AFTER"
side="BOTH"
```

`type="optional"` means the Tutorial Mod may load without the named mod.
`ordering="AFTER"` asks NeoForge to initialize us after it when both are
present. JEI is a client interface, while TOP has code on both physical sides,
so their `side` values differ.

The TOP artifact embeds the Minecraft version in its mod version string. The
permissive range avoids pretending that its Maven artifact version is a normal
semantic version. Compatibility is still fixed precisely for development by
`top_version` in `gradle.properties`.

Because the metadata template now contains the JEI version placeholder, also
pass it to the existing `generateModMetadata` task:

```groovy
def replaceProperties = [
    // existing properties omitted here
    mod_version : mod_version,
    jei_version : jei_version
]
```

Gradle expands `${jei_version}` while building the TOML file. Groovy map syntax
does not require the keys to line up; the spacing used by this project is only
for readability.

## What JEI already does automatically

JEI reads Minecraft's recipe manager. The shaped crafting recipe generated in
Tutorial 2 therefore appears without any integration plugin. Do not register a
normal data-driven crafting recipe a second time or JEI may show duplicate
entries.

A JEI plugin is needed when JEI cannot infer something from the vanilla recipe
and item systems. Our block has such a case: its `tutorialmod:is_on` data
component creates two meaningful item forms, but only the off form appears in
the creative tab. We also want to attach explanatory text that is specific to
JEI.

Our plugin will provide three pieces of information:

```text
Tutorial Block ItemStack
├── subtype identity: is_on=false or is_on=true
├── extra ingredient: an ItemStack with is_on=true
└── information page: how the block is toggled and preserved
```

## Creating the JEI plugin

Create
`src/main/java/com/example/tutorialmod/integration/jei/TutorialJeiPlugin.java`:

```java
package com.example.tutorialmod.integration.jei;

import com.example.tutorialmod.TutorialMod;
import com.example.tutorialmod.registration.ModDataComponents;
import com.example.tutorialmod.registration.ModItems;
import mezz.jei.api.IModPlugin;
import mezz.jei.api.JeiPlugin;
import mezz.jei.api.ingredients.subtypes.ISubtypeInterpreter;
import mezz.jei.api.ingredients.subtypes.UidContext;
import mezz.jei.api.registration.IExtraIngredientRegistration;
import mezz.jei.api.registration.IRecipeRegistration;
import mezz.jei.api.registration.ISubtypeRegistration;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.item.ItemStack;

import java.util.List;

@JeiPlugin
public final class TutorialJeiPlugin implements IModPlugin {
    private static final ResourceLocation PLUGIN_ID =
            ResourceLocation.fromNamespaceAndPath(
                    TutorialMod.MOD_ID,
                    "jei_plugin"
            );

    @Override
    public ResourceLocation getPluginUid() {
        return PLUGIN_ID;
    }

    // Registration methods are added in the following sections.
}
```

JEI discovers classes annotated with `@JeiPlugin`; we do not construct this
class from `TutorialMod`. `IModPlugin` supplies callbacks for the parts of JEI
that a mod can extend.

Every plugin needs a stable, unique ID. Using our mod namespace prevents a
collision with plugins from other mods. The path identifies this particular
plugin and does not need a separate registry entry.

This class deliberately lives in an `integration.jei` package. Keeping all
JEI imports in a dedicated package makes the optional boundary visible and
makes later API upgrades easier to review.

## Teaching JEI about component-based subtypes

JEI compares ingredients to index them, search for them, and associate them
with recipes. The item registry identity alone cannot distinguish our two
stacks because both contain `tutorialmod:tutorial_block`.

Register a subtype interpreter:

```java
@Override
public void registerItemSubtypes(ISubtypeRegistration registration) {
    registration.registerSubtypeInterpreter(
            ModItems.TUTORIAL_BLOCK_ITEM.get(),
            new TutorialBlockSubtypeInterpreter()
    );
}
```

Then add this nested class:

```java
private static final class TutorialBlockSubtypeInterpreter
        implements ISubtypeInterpreter<ItemStack> {
    @Override
    public Object getSubtypeData(ItemStack ingredient, UidContext context) {
        return ingredient.getOrDefault(
                ModDataComponents.IS_ON.get(),
                false
        );
    }

    @Override
    @SuppressWarnings("deprecation")
    public String getLegacyStringSubtypeInfo(
            ItemStack ingredient,
            UidContext context
    ) {
        return Boolean.toString(
                ingredient.getOrDefault(
                        ModDataComponents.IS_ON.get(),
                        false
                )
        );
    }
}
```

`getSubtypeData` returns only data that changes the logical subtype. The
Boolean implements `equals` and `hashCode`, so JEI can safely use it when
building identifiers and lookup maps.

Do not return the entire component map unless every component really changes
the subtype. Values such as energy level or transient counters could create
hundreds of nearly identical JEI entries. Our one Boolean has exactly two
meaningful values.

`UidContext` allows an interpreter to distinguish ingredient-list identity
from recipe identity. This block uses the same Boolean in both contexts, so it
does not need to branch on that argument.

JEI 19 still requires `getLegacyStringSubtypeInfo` so it can read older saved
configuration identifiers, even though the method itself is deprecated. The
localized suppression documents that this one use is deliberate and prevents
an otherwise noisy compilation warning.

## Adding the on stack to JEI

Only the default off stack appears in the creative tab. Create the on stack in
one helper so every JEI callback builds it consistently:

```java
private static ItemStack createOnStack() {
    ItemStack stack =
            ModItems.TUTORIAL_BLOCK_ITEM.get().getDefaultInstance();
    stack.set(ModDataComponents.IS_ON.get(), true);
    return stack;
}
```

Never mutate the registered item's shared default component values here.
`getDefaultInstance()` returns a new stack, and `set` changes only that stack.

Register it as an extra ingredient:

```java
@Override
public void registerExtraIngredients(
        IExtraIngredientRegistration registration
) {
    registration.addExtraItemStacks(List.of(createOnStack()));
}
```

JEI already learns about the off stack from the creative tab, so we add only
the missing on stack. Thanks to the subtype interpreter, JEI retains the two
forms as separate entries even though they share an item registry ID.

The inventory model property from Tutorial 3 reads the same data component.
The added stack therefore renders with the on texture in JEI without any
JEI-specific rendering code.

## Adding a JEI information page

Add an information page for both item forms:

```java
@Override
public void registerRecipes(IRecipeRegistration registration) {
    registration.addItemStackInfo(
            List.of(
                    ModItems.TUTORIAL_BLOCK_ITEM.get().getDefaultInstance(),
                    createOnStack()
            ),
            Component.translatable(
                    "jei.tutorialmod.tutorial_block.description"
            )
    );
}
```

JEI models ingredient information as a recipe-like page, which is why this
happens in `registerRecipes`. `addItemStackInfo` associates the page with both
subtypes. Players can open JEI's uses view on either form to find the same
instructions.

Use a translatable component rather than a literal English string. Add its
English text to `ModLanguageProvider`:

```java
add(
        "jei.tutorialmod.tutorial_block.description",
        "Right-click with an empty hand to toggle this block on or off. "
                + "Its state is preserved when broken and placed again."
);
```

Other languages can later supply the same key in their own language files.
JEI receives the component and lets Minecraft resolve it for the current
client language.

## How The One Probe accepts integrations

TOP uses a provider interface. It calls every registered block provider for
the block under the crosshair, and each provider decides whether it has
anything to add.

Unlike JEI's annotation discovery, TOP obtains integrations through NeoForge
inter-mod communication (IMC):

```text
NeoForge reaches InterModEnqueueEvent
    -> Tutorial Mod sends "getTheOneProbe" message
        -> TOP supplies its ITheOneProbe API object
            -> Tutorial Mod registers its block provider
```

The registration happens during the lifecycle phase intended for mods to send
messages to one another. It does not happen in a static initializer, where
load order would be harder to control.

## Creating the TOP provider

Create
`src/main/java/com/example/tutorialmod/integration/top/TutorialBlockProbeProvider.java`:

```java
package com.example.tutorialmod.integration.top;

import com.example.tutorialmod.TutorialMod;
import com.example.tutorialmod.block.TutorialBlock;
import com.example.tutorialmod.registration.ModBlocks;
import mcjty.theoneprobe.api.IProbeHitData;
import mcjty.theoneprobe.api.IProbeInfo;
import mcjty.theoneprobe.api.IProbeInfoProvider;
import mcjty.theoneprobe.api.ProbeMode;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.state.BlockState;

public final class TutorialBlockProbeProvider
        implements IProbeInfoProvider {
    private static final ResourceLocation PROVIDER_ID =
            ResourceLocation.fromNamespaceAndPath(
                    TutorialMod.MOD_ID,
                    "tutorial_block"
            );

    @Override
    public ResourceLocation getID() {
        return PROVIDER_ID;
    }

    @Override
    public void addProbeInfo(
            ProbeMode mode,
            IProbeInfo probeInfo,
            Player player,
            Level level,
            BlockState blockState,
            IProbeHitData hitData
    ) {
        if (!blockState.is(ModBlocks.TUTORIAL_BLOCK.get())) {
            return;
        }

        String stateKey = blockState.getValue(TutorialBlock.ON)
                ? "state.tutorialmod.on"
                : "state.tutorialmod.off";
        probeInfo.text(Component.translatable(
                "top.tutorialmod.state",
                Component.translatable(stateKey)
        ));
    }
}
```

`getID` identifies this provider to TOP. It is separate from the block's
registry ID, although using the block name as its path is clear and unique in
this small mod.

TOP invokes `addProbeInfo` for blocks from many mods. The early block check is
therefore essential. Returning immediately also ensures that we read the `ON`
property only from a state that defines it; calling `getValue` on an unrelated
state would throw an exception.

The remaining callback parameters enable richer integrations later:

- `mode` distinguishes TOP's normal and extended display modes;
- `player` allows information to depend on the viewing player;
- `level` gives access to the world and its block entities;
- `hitData` contains the position, hit side, and exact hit point;
- `probeInfo` is the layout to which providers add text or visual elements.

This provider needs only `probeInfo` and `blockState`.

### Why the provider reads the block state

Tutorial 3 established the block entity's `isOn` field as stored data and the
`TutorialBlock.ON` property as its synchronized visual representation. TOP
builds its overlay on the client, which already receives the block-state
update whenever the value changes.

Reading that property gives the overlay current information without creating
a second custom block-entity synchronization packet:

```text
Server toggles TutorialBlockEntity.isOn
    -> server updates BlockState[on]
        -> normal block update reaches client
            -> TOP provider reads BlockState[on]
```

For data that is not mirrored into a block state, the provider could read the
block entity at `hitData.getPos()`. That data must also be synchronized to the
client, or the overlay would display an old value. Integration code does not
make server-only block entity fields visible automatically.

## Translating the TOP line

Add three more entries to `ModLanguageProvider`:

```java
add("top.tutorialmod.state", "State: %s");
add("state.tutorialmod.on", "On");
add("state.tutorialmod.off", "Off");
```

The outer component supplies the label and placeholder. The nested component
supplies the translated state word. Keeping `On` and `Off` in separate keys
also makes them reusable by a future screen or normal item tooltip.

Run data generation after editing the provider:

```bash
./gradlew runData
```

The generated `assets/tutorialmod/lang/en_us.json` now contains all five
integration strings.

## Registering the provider through IMC

Create
`src/main/java/com/example/tutorialmod/integration/top/TopIntegration.java`:

```java
package com.example.tutorialmod.integration.top;

import mcjty.theoneprobe.api.ITheOneProbe;
import net.neoforged.fml.InterModComms;

import java.util.function.Function;

public final class TopIntegration {
    private TopIntegration() {
    }

    public static void register() {
        InterModComms.sendTo(
                "theoneprobe",
                "getTheOneProbe",
                () -> (Function<ITheOneProbe, Void>) probe -> {
                    probe.registerProvider(
                            new TutorialBlockProbeProvider()
                    );
                    return null;
                }
        );
    }
}
```

The message key `getTheOneProbe` is part of TOP's integration contract. Its
payload is a function. TOP calls that function with its public API object, and
our function registers the provider.

The function returns `Void`, so it ends with `return null`. The supplier around
it lets NeoForge defer construction of the message payload until the receiving
mod processes IMC.

Keep this class and the provider in the TOP integration package. They directly
import API classes that do not exist when TOP is absent.

## Keeping the optional boundary safe

Add a listener in the `TutorialMod` constructor:

```java
modEventBus.addListener(TutorialMod::enqueueInterModCommunication);
```

Then add this method to the same class:

```java
private static void enqueueInterModCommunication(
        InterModEnqueueEvent event
) {
    if (ModList.get().isLoaded("theoneprobe")) {
        TopIntegration.register();
    }
}
```

This requires these imports:

```java
import com.example.tutorialmod.integration.top.TopIntegration;
import net.neoforged.fml.ModList;
import net.neoforged.fml.event.lifecycle.InterModEnqueueEvent;
```

The loaded-mod check does more than avoid sending a message with no receiver.
It prevents execution from entering `TopIntegration`, whose bytecode refers to
`ITheOneProbe`. The JVM can leave that integration class unresolved when TOP
is absent.

JEI needs no equivalent call from `TutorialMod`. When JEI is installed it scans
for `@JeiPlugin`. When it is absent, nothing loads `TutorialJeiPlugin` and its
JEI API references remain isolated.

Optional metadata alone is insufficient if common startup code directly
constructs a class from the missing mod. Optional integration needs both:

```text
NeoForge metadata says the dependency may be absent
    +
startup code does not resolve its API classes when absent
```

## Testing the integrations

Compile and package the complete project:

```bash
./gradlew build
```

Then start a development client:

```bash
./gradlew runClient
```

The `runtimeOnly` dependencies put JEI and TOP in this development run. Verify
the following behavior:

1. Search JEI for `Tutorial Block`. Both its off and on models should appear.
2. Open the uses view for either form. The information page should explain how
   to toggle it.
3. Place the block and look at it with TOP active. Its overlay should include
   `State: Off`.
4. Right-click it with an empty hand. The texture and TOP line should both
   change to the on state.
5. Break an on block and inspect JEI again. Its stack remains the on subtype
   because both systems read the component defined in Tutorial 3.

An optional integration also needs a missing-mod test. The conditional runtime
dependencies in `build.gradle` provide a switch for that check:

```bash
./gradlew runClient -Pexclude_optional_mods
```

The Tutorial Mod must still start, and the two integrations will simply be
inactive. Omitting the property restores both mods in later development runs.

Finally, inspect the built jar rather than assuming runtime dependencies were
bundled:

```bash
./gradlew build
```

The jar in `build/libs` should contain our two integration packages but no
`mezz/jei` or `mcjty/theoneprobe` classes.

## Common integration mistakes

### Adding a Maven without declaring a dependency

A repository is only a place Gradle can search. It does not download anything
until a dependency references an artifact from it.

### Treating an optional API as always present

Importing an API in an isolated compatibility class is safe only while common
startup paths avoid loading that class when the other mod is absent. Guard the
entry point, not every individual line inside the provider.

### Registering the normal crafting recipe twice

JEI reads recipes from Minecraft. Use `registerRecipes` to add custom JEI
content such as our information page, not to duplicate an ordinary recipe that
the recipe manager already contains.

### Forgetting subtype identity

Adding two component-different stacks without an interpreter can make JEI
merge them or associate lookups incorrectly. Return the smallest stable value
that describes the meaningful distinction.

### Reading unsynchronized block entity data on the client

TOP's overlay is rendered on the client. A server-side field is not visible
there merely because a provider can access a block entity. Use already
synchronized state, as this tutorial does, or implement explicit block entity
update synchronization for richer data.

### Writing English directly in integration code

Both APIs accept Minecraft `Component` values. Translation keys let resource
packs and additional language files localize the integration alongside the
rest of the mod.

## Minecraft 26.2 differences

The companion 26.2 project implements the same two integrations. JEI still
discovers an annotated `IModPlugin`, and TOP still receives an
`IProbeInfoProvider` through the `getTheOneProbe` IMC message. Optional
metadata, isolated integration packages, the loaded-mod guard, translation
keys, and the `exclude_optional_mods` development switch all work the same
way.

The port mainly updates dependency versions and two API details. This is a
useful distinction from porting Minecraft behavior: JEI and TOP publish their
own APIs, so their breaking changes do not necessarily line up with a
Minecraft or NeoForge release boundary.

### Difference summary and version boundaries

| Area | Minecraft 1.21.1 project | Minecraft 26.2 project | Change boundary |
| --- | --- | --- | --- |
| JEI artifact | `19.25.0.325` | `30.30.0.204` | Select the JEI release published for the target Minecraft version |
| TOP artifact | `1.21_neo-12.0.3-5` | `26.2_neo-15.0.0-1` | Select the TOP release published for the target Minecraft version |
| NeoForge version | `21.1.249` | `26.2.0.75` | The available TOP 26.2 artifact requires NeoForge `26.2.0.75` or newer |
| Plugin and provider ID type | `ResourceLocation` | `Identifier` | Minecraft **26.1** |
| JEI subtype compatibility method | Implement `getSubtypeData` and deprecated `getLegacyStringSubtypeInfo` | Implement only `getSubtypeData` | Removed from the JEI **30.x** API used by the 26.2 port |
| JEI registration callbacks | Subtypes, extra item stacks, and item information | Same callbacks | No change in this port |
| TOP registration and tooltip callback | IMC function and `IProbeInfoProvider` | Same structure | Only the Minecraft identifier type changed |

Java 25, the newer mod metadata format, and separate client/server data runs
are general 26.2 project changes covered by Tutorials 1 and 2. This section
only repeats a data-run detail where it directly affects the new integration
translations.

### Updating the dependency versions

The companion project's `gradle.properties` contains:

```properties
# Minecraft and NeoForge versions
minecraft_version=26.2
minecraft_version_range=[26.2]
neo_version=26.2.0.75

# Optional mod integrations
jei_version=30.30.0.204
top_version=26.2_neo-15.0.0-1
```

The TOP 26.2 jar declares both Minecraft `[26.2]` and NeoForge
`[26.2.0.75,)` in its own metadata. A development run cannot use the earlier
`26.2.0.72` from Tutorial 1 with that TOP release, so the companion project
raises NeoForge to `26.2.0.75`.

The final `-1` on `26.2_neo-15.0.0-1` is the Maven build suffix. The public
mod filename may display `26.2_neo-15.0.0`, but Gradle needs the complete
published Maven version. Treat the repository coordinate as authoritative.

No repository or dependency-block rewrite is needed. The properties continue
to fill the same coordinates:

```groovy
compileOnly "mezz.jei:jei-${minecraft_version}-common-api:${jei_version}"
compileOnly "mezz.jei:jei-${minecraft_version}-neoforge-api:${jei_version}"
compileOnly "mcjty.theoneprobe:theoneprobe:${top_version}"

if (!project.hasProperty('exclude_optional_mods')) {
    runtimeOnly "mezz.jei:jei-${minecraft_version}-neoforge:${jei_version}"
    runtimeOnly "mcjty.theoneprobe:theoneprobe:${top_version}"
}
```

The JEI and TOP Maven repositories, their group names, and the separation
between `compileOnly` and `runtimeOnly` are unchanged. The optional TOML
entries are also structurally identical.

### ResourceLocation became Identifier in 26.1

Minecraft renamed `ResourceLocation` to `Identifier` in **26.1**. Both
external APIs use Minecraft's identifier type, so this affects the JEI plugin
UID and the TOP provider ID.

The 26.2 JEI plugin declares:

```java
import net.minecraft.resources.Identifier;

private static final Identifier PLUGIN_ID =
        Identifier.fromNamespaceAndPath(
                TutorialMod.MOD_ID,
                "jei_plugin"
        );

@Override
public Identifier getPluginUid() {
    return PLUGIN_ID;
}
```

The 26.2 TOP provider makes the equivalent change:

```java
import net.minecraft.resources.Identifier;

private static final Identifier PROVIDER_ID =
        Identifier.fromNamespaceAndPath(
                TutorialMod.MOD_ID,
                "tutorial_block"
        );

@Override
public Identifier getID() {
    return PROVIDER_ID;
}
```

The namespace and path are unchanged. Only the Java type name differs. This
boundary comes from Minecraft itself rather than from a JEI- or TOP-specific
design change.

### JEI removed the legacy subtype string method

In the JEI 19 API used by the 1.21.1 project, `ISubtypeInterpreter` has two
methods. `getSubtypeData` supplies the current structured identity, while the
deprecated `getLegacyStringSubtypeInfo` supports old saved string identifiers.

The JEI 30 API used by the 26.2 port removes that compatibility method and
makes `ISubtypeInterpreter` a functional interface. The nested interpreter is
therefore shorter:

```java
private static final class TutorialBlockSubtypeInterpreter
        implements ISubtypeInterpreter<ItemStack> {
    @Override
    public Object getSubtypeData(ItemStack ingredient, UidContext context) {
        return ingredient.getOrDefault(
                ModDataComponents.IS_ON.get(),
                false
        );
    }
}
```

Remove the old override and its `@SuppressWarnings("deprecation")` annotation.
Leaving it in the class produces an `@Override` compilation error because JEI
30 no longer declares that method.

The interpreter could now be written as a lambda, but retaining the named
nested class keeps the 1.21.1 and 26.2 tutorials easy to compare. Its behavior
is unchanged: the Boolean component remains the complete subtype identity.

### The remaining JEI integration ports directly

JEI 30 retains the callbacks used for the other parts of this example:

```java
@Override
public void registerItemSubtypes(ISubtypeRegistration registration) {
    registration.registerSubtypeInterpreter(
            ModItems.TUTORIAL_BLOCK_ITEM.get(),
            new TutorialBlockSubtypeInterpreter()
    );
}

@Override
public void registerExtraIngredients(
        IExtraIngredientRegistration registration
) {
    registration.addExtraItemStacks(List.of(createOnStack()));
}

@Override
public void registerRecipes(IRecipeRegistration registration) {
    registration.addItemStackInfo(
            List.of(
                    ModItems.TUTORIAL_BLOCK_ITEM.get().getDefaultInstance(),
                    createOnStack()
            ),
            Component.translatable(
                    "jei.tutorialmod.tutorial_block.description"
            )
    );
}
```

`ItemStack#set`, `getDefaultInstance`, and the tutorial component lookup also
remain suitable for the 26.2 item. The port still adds one on stack, lets JEI
discover the normal off stack, and associates the information page with both.

### The TOP integration ports directly after the ID rename

TOP 15 retains the same provider callback parameters and `IProbeInfo#text`
operation. The body that selects a translation key from the synchronized block
state is unchanged:

```java
if (!blockState.is(ModBlocks.TUTORIAL_BLOCK.get())) {
    return;
}

String stateKey = blockState.getValue(TutorialBlock.ON)
        ? "state.tutorialmod.on"
        : "state.tutorialmod.off";
probeInfo.text(Component.translatable(
        "top.tutorialmod.state",
        Component.translatable(stateKey)
));
```

Registration also continues to send the same IMC message and function:

```java
InterModComms.sendTo(
        "theoneprobe",
        "getTheOneProbe",
        () -> (Function<ITheOneProbe, Void>) probe -> {
            probe.registerProvider(new TutorialBlockProbeProvider());
            return null;
        }
);
```

The `ModList` check in `TutorialMod` remains necessary. Updating an API version
does not change the class-loading rule that keeps an optional integration safe
when TOP is absent.

### Generating translations and testing the 26.2 port

The language keys and English values are identical in both projects. Minecraft
26.2 uses separate client and server data runs, introduced earlier in the
series. Language data is client data, so regenerate it with:

```bash
./gradlew runClientData
```

Build and run the complete integration with:

```bash
./gradlew build
./gradlew runClient
```

Repeat the optional-dependency test with:

```bash
./gradlew runClient -Pexclude_optional_mods
```

The same five in-game checks from the main tutorial apply: two JEI subtypes,
the information page, off and on TOP lines, synchronized changes after
right-clicking, and preserved item state after breaking the block.

### Quick guide for intermediate versions

| Target | Integration guidance |
| --- | --- |
| Minecraft 1.21.1 with JEI 19 and TOP 12 | Use the complete main tutorial |
| Minecraft 1.21.2 through 1.21.11 | Select artifacts published for the exact Minecraft version and compile against them; keep `ResourceLocation` until the Minecraft rename |
| Minecraft 26.1 | Use `Identifier`; verify which JEI and TOP builds exist and inspect their exact API methods and NeoForge minimums |
| Minecraft 26.2 with JEI 30 and TOP 15 | Use the companion values and changes in this section |

Do not choose an integration artifact by comparing only its largest version
number. Start with the Minecraft version, select the matching loader artifact,
and then let compilation reveal API changes. Also inspect the dependency mod's
metadata: the TOP 26.2 artifact is what raises this companion project's minimum
NeoForge version.

## Further reading

- [JEI plugin API](https://github.com/mezz/JustEnoughItems/wiki/Getting-Started)
- [JEI plugin implementation examples](https://github.com/mezz/JustEnoughItems/wiki/List-of-Plugin-Implementations)
- [JEI Maven repository](https://maven.blamejared.com/mezz/jei/)
- [The One Probe source and API](https://github.com/McJtyMods/TheOneProbe)
- [NeoForge mod files and dependency metadata](https://docs.neoforged.net/docs/1.21.1/gettingstarted/modfiles/)
- [NeoForge sides](https://docs.neoforged.net/docs/1.21.1/concepts/sides/)
- [NeoForge 26.2 MDK](https://github.com/NeoForgeMDKs/MDK-26.2-ModDevGradle)
