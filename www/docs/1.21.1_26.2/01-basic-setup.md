---
sidebar_position: 2
---

# Tutorial 1: Basic NeoForge Setup

In this tutorial we will create the smallest useful NeoForge mod project. The
mod will not add blocks or items yet. It will load in Minecraft and write one
message to the log, giving us a clean base for the rest of the series.

The main tutorial targets:

| Tool | Version |
| --- | --- |
| Minecraft | 1.21.1 |
| NeoForge | 21.1.249 |
| Java | 21 |
| ModDevGradle | 2.0.144 |
| Gradle wrapper | 9.2.1 |

The final section explains every setup difference for Minecraft 26.2 and says
when each difference was introduced. This is useful when targeting an
intermediate version such as 1.21.11.

## What you need

- A 64-bit Java 21 JDK
- IntelliJ IDEA, or another Java IDE with Gradle support
- An internet connection for the first Gradle import

A **JDK** is the Java Development Kit. It contains the tools needed to compile
Java code. A JRE can only run Java programs and is not enough for mod
development.

Minecraft 1.21.1 uses Java 21. This project also uses a Gradle toolchain, so
Gradle can download a suitable Java 21 JDK when one is not already installed.
Installing Java 21 yourself is still useful because it makes IDE setup and
troubleshooting easier.

NeoForge officially supports IntelliJ IDEA and Eclipse. This tutorial uses
IntelliJ terminology, but the Gradle commands work with any editor.

## The project structure

Our initial project looks like this:

```text
tutorial-mod/
├── gradle/wrapper/
│   ├── gradle-wrapper.jar
│   └── gradle-wrapper.properties
├── src/main/
│   ├── java/com/example/tutorialmod/
│   │   └── TutorialMod.java
│   └── templates/META-INF/
│       └── neoforge.mods.toml
├── .gitattributes
├── .gitignore
├── build.gradle
├── gradle.properties
├── gradlew
├── gradlew.bat
├── README.md
└── settings.gradle
```

The most important locations are:

- `src/main/java` contains our Java source code.
- `src/main/templates` contains mod metadata with values that Gradle fills in.
- `gradle.properties` contains versions and basic information about the mod.
- `build.gradle` tells Gradle how to compile and run the mod.
- `gradlew` and `gradlew.bat` are the Gradle wrapper scripts. They let everyone
  build the project with the same Gradle version without installing Gradle
  separately.

Folders such as `.gradle`, `build`, and `run` are generated locally and are
ignored by Git. Do not put source code in them.

## Configuring Gradle

Gradle is the build system. It downloads Minecraft and NeoForge, compiles our
code, creates development run configurations, and packages the finished mod.

### `settings.gradle`

Create `settings.gradle` in the project root:

```groovy
pluginManagement {
    repositories {
        gradlePluginPortal()
    }
}

plugins {
    // Downloads the required Java version when it is not installed locally.
    id 'org.gradle.toolchains.foojay-resolver-convention' version '1.0.0'
}

rootProject.name = 'tutorial-mod'
```

The `pluginManagement` block tells Gradle where to find Gradle plugins. The
Foojay resolver helps Gradle obtain the Java toolchain requested by the build.
`rootProject.name` is the name IntelliJ and Gradle show for this project.

### `gradle.properties`

Create `gradle.properties` in the project root:

```properties
# Gradle settings
org.gradle.jvmargs=-Xmx2G
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configuration-cache=true

# Minecraft and NeoForge versions
minecraft_version=1.21.1
minecraft_version_range=[1.21.1]
neo_version=21.1.249
loader_version_range=[1,)

# Mod information
# Keep mod_id lowercase and use only letters, numbers, and underscores.
mod_id=tutorialmod
mod_name=Tutorial Mod
mod_license=All Rights Reserved
mod_version=1.0.0
mod_group_id=com.example.tutorialmod
```

The first group controls Gradle itself. For example, `-Xmx2G` allows Gradle to
use up to two gigabytes of memory. The daemon, build cache, and configuration
cache make later builds faster.

The version properties select Minecraft and NeoForge:

- `minecraft_version` is the version used while compiling and running.
- `minecraft_version_range=[1.21.1]` says the built mod supports exactly
  Minecraft 1.21.1.
- `neo_version` selects the NeoForge development dependency.
- `loader_version_range=[1,)` accepts language-loader version 1 or newer.

The remaining properties describe our mod:

- `mod_id` is its unique technical name. It becomes the namespace for things
  we add later, such as `tutorialmod:ruby_block`.
- `mod_name` is the human-readable name shown in the Mods screen.
- `mod_license` states how other people may use the mod. Choose a real license
  before publishing; `All Rights Reserved` is only the safe initial default.
- `mod_version` is our own mod's version, independent of the Minecraft version.
- `mod_group_id` is also the base Java package. A real project normally uses a
  reversed domain or another namespace you control instead of `com.example`.

The mod ID must start with a lowercase letter and contain only lowercase
letters, numbers, and underscores. It must match the ID in the Java entrypoint.

### `build.gradle`

Create `build.gradle` in the project root:

```groovy
plugins {
    id 'java-library'
    id 'net.neoforged.moddev' version '2.0.144'
    id 'idea'
}

version = mod_version
group = mod_group_id

base {
    archivesName = mod_id
}

// Minecraft 1.21.1 uses Java 21.
java.toolchain.languageVersion = JavaLanguageVersion.of(21)

neoForge {
    version = project.neo_version

    // These tasks let us start Minecraft directly from Gradle or an IDE.
    runs {
        client {
            client()
        }

        server {
            server()
            programArgument '--nogui'
        }
    }

    mods {
        "${mod_id}" {
            sourceSet(sourceSets.main)
        }
    }
}

// Replace ${...} placeholders in neoforge.mods.toml with gradle.properties values.
def generateModMetadata = tasks.register('generateModMetadata', ProcessResources) {
    def replaceProperties = [
        minecraft_version      : minecraft_version,
        minecraft_version_range: minecraft_version_range,
        neo_version            : neo_version,
        loader_version_range   : loader_version_range,
        mod_id                 : mod_id,
        mod_name               : mod_name,
        mod_license            : mod_license,
        mod_version            : mod_version
    ]

    inputs.properties replaceProperties
    expand replaceProperties
    from 'src/main/templates'
    into layout.buildDirectory.dir('generated/sources/modMetadata')
}

sourceSets.main.resources.srcDir generateModMetadata
neoForge.ideSyncTask generateModMetadata

tasks.withType(JavaCompile).configureEach {
    options.encoding = 'UTF-8'
}

idea {
    module {
        downloadSources = true
        downloadJavadoc = true
    }
}
```

There are four important parts here:

1. The `plugins` block enables Java support, NeoForge's ModDevGradle plugin,
   and IntelliJ integration.
2. The Java toolchain ensures that our code is compiled with Java 21.
3. `neoForge.runs` creates the `runClient` and `runServer` Gradle tasks and the
   matching IDE run configurations.
4. `generateModMetadata` replaces placeholders such as `${mod_id}` in the TOML
   template with values from `gradle.properties`. It runs during builds and IDE
   synchronization.

`sourceSet(sourceSets.main)` connects this mod to the normal Java and resource
directories under `src/main`.

## Adding the mod metadata

Create `src/main/templates/META-INF/neoforge.mods.toml`:

```toml
modLoader="javafml"
loaderVersion="${loader_version_range}"
license="${mod_license}"

[[mods]]
modId="${mod_id}"
version="${mod_version}"
displayName="${mod_name}"
description='''
A simple NeoForge mod used as the starting point for a modding tutorial.
'''

[[dependencies.${mod_id}]]
modId="neoforge"
type="required"
versionRange="[${neo_version},)"
ordering="NONE"
side="BOTH"

[[dependencies.${mod_id}]]
modId="minecraft"
type="required"
versionRange="${minecraft_version_range}"
ordering="NONE"
side="BOTH"
```

This TOML file tells NeoForge what is inside the JAR:

- `javafml` says that this is a Java mod whose entrypoint uses NeoForge's Java
  loading system.
- `[[mods]]` declares our mod and the information shown to players.
- The two `[[dependencies...]]` sections require compatible NeoForge and
  Minecraft versions.
- `side="BOTH"` means the requirements apply to both client and dedicated
  server.

The `${...}` values are intentionally not filled in here. The Gradle metadata
task replaces them while building, which keeps the values in one central file:
`gradle.properties`.

## Creating the mod entrypoint

Create
`src/main/java/com/example/tutorialmod/TutorialMod.java`:

```java
package com.example.tutorialmod;

import com.mojang.logging.LogUtils;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import org.slf4j.Logger;

/**
 * The main class for the mod.
 *
 * <p>NeoForge creates this class when it finds the {@link Mod} annotation.</p>
 */
@Mod(TutorialMod.MOD_ID)
public final class TutorialMod {
    // This must match mod_id in gradle.properties.
    public static final String MOD_ID = "tutorialmod";

    private static final Logger LOGGER = LogUtils.getLogger();

    public TutorialMod(IEventBus modEventBus) {
        // We will use modEventBus in later tutorials to register blocks and items.
        LOGGER.info("Tutorial Mod is loading!");
    }
}
```

Let us break down what happens when Minecraft starts:

1. NeoForge reads `neoforge.mods.toml` and discovers the mod ID `tutorialmod`.
2. It scans the mod's classes and finds `@Mod(TutorialMod.MOD_ID)`.
3. Because `MOD_ID` is also `tutorialmod`, NeoForge knows that this class is an
   entrypoint for the declared mod.
4. NeoForge creates `TutorialMod` and supplies its mod-specific `IEventBus` to
   the constructor.
5. The constructor writes `Tutorial Mod is loading!` to the log.

`IEventBus` is not used yet, but accepting it now gives us the object we will
need to register blocks, items, and lifecycle listeners in later tutorials.

We use a logger instead of `System.out.println`. Minecraft and NeoForge route
logger messages into both the development console and `run/logs/latest.log`,
along with useful timestamps and context.

## A short introduction to events

NeoForge uses an **event system** to let mods react when something happens.
Instead of changing Minecraft's code directly, a mod registers an event
listener. NeoForge calls that listener when it posts the matching event. The
event object contains information about what happened, such as the player,
entity, block, or current setup phase involved.

An **event bus** connects events to their listeners. A listener is normally a
method that receives one event parameter and returns nothing. Registering the
method does not call it immediately; it tells the bus to call the method when
that kind of event is posted later.

NeoForge has two important event buses:

- The **mod event bus** belongs to one mod and is passed into its `@Mod`
  constructor. It is mainly used while mods are loading: registering content,
  performing setup, gathering generated data, and configuring client features.
- `NeoForge.EVENT_BUS`, also called the **game event bus**, is shared by loaded
  mods. It carries events related to the running game, such as an entity
  jumping, a block being broken, or a player interacting with something.

The parameter in our constructor is the mod event bus:

```java
public TutorialMod(IEventBus modEventBus) {
    LOGGER.info("Tutorial Mod is loading!");
}
```

We do not need to subscribe to an event yet, but later tutorials will use this
same object. For example, the general shape of listener registration is:

```java
modEventBus.addListener(TutorialMod::handleModEvent);
NeoForge.EVENT_BUS.addListener(TutorialMod::handleGameEvent);
```

The two handler names are placeholders that illustrate the pattern; do not add
these lines to the project yet. A real listener's parameter type tells Java and
the event bus which event it handles.

These are two different destinations. A listener must be added to the bus on
which its event is posted. Registering a game event on the mod bus, or a mod
event on the game bus, means the listener will never receive the event.

Most mod lifecycle events run only once during startup, and several may run in
parallel. Game events can occur repeatedly while playing. Some events can also
be cancelled or have a result that influences what Minecraft does next. We
will introduce those details when we first need them; for now, remember that
the event type determines which bus and listener method to use.

## Importing the project into IntelliJ IDEA

1. Open the project folder in IntelliJ IDEA.
2. Import it as a **Gradle project** if IntelliJ asks.
3. Wait for Gradle to download dependencies and finish synchronization.
4. Open the Gradle tool window and click **Reload All Gradle Projects** if the
   project was already open.

There is no `genIntellijRuns` task when using ModDevGradle. The client and
server run configurations are created automatically during Gradle sync from
the `neoForge.runs` block in `build.gradle`.

The first import is much slower than later imports because Gradle must download
and prepare Minecraft, NeoForge, and their dependencies.

## Running the mod

Select the client run configuration in IntelliJ and click Run, or use a
terminal in the project folder:

```bash
./gradlew runClient
```

On Windows, use:

```powershell
.\gradlew.bat runClient
```

After Minecraft opens, check the IDE console or `run/logs/latest.log` for:

```text
Tutorial Mod is loading!
```

The mod should also appear as **Tutorial Mod** in the Mods screen. At this
point it has loaded correctly even though it does not add any gameplay content.

A dedicated development server can be started with:

```bash
./gradlew runServer
```

On its first start, a dedicated server may ask you to accept Minecraft's EULA
in the generated `run/eula.txt` before it can continue.

## Building the mod JAR

Run:

```bash
./gradlew build
```

Gradle compiles the code, processes `neoforge.mods.toml`, and creates:

```text
build/libs/tutorialmod-1.0.0.jar
```

The `build` directory is generated output. It should not be committed to Git.
Run the build again whenever you want a new JAR.

## Renaming the example

When turning this tutorial project into your own mod, change these values
together:

1. Change `mod_id`, `mod_name`, and `mod_group_id` in `gradle.properties`.
2. Rename the package directories below `src/main/java`.
3. Update the `package` declaration in `TutorialMod.java`.
4. Change `MOD_ID` in `TutorialMod.java` so it exactly matches `mod_id`.
5. Choose an appropriate license before publishing.

A mismatch between `mod_id`, `MOD_ID`, and the Java package is one of the most
common sources of confusion in a first mod project.

## What we deliberately have not added

This first project contains no blocks, items, menus, configuration files,
network messages, or data generation. Those concepts are easier to understand
when introduced one at a time. For now, the important result is that the mod
can be imported, run, and built successfully.

## Minecraft 26.2 differences

The companion Minecraft 26.2 project has the same directory layout, Gradle
wrapper, ModDevGradle version, run definitions, and `TutorialMod.java`. Only the
version/toolchain settings and two old metadata fields differ.

### Difference summary and version boundaries

| Area | Minecraft 1.21.1 project | Minecraft 26.2 project | Change began in |
| --- | --- | --- | --- |
| Java toolchain | Java 21 | Java 25 | **26.1** |
| IntelliJ baseline | Any release supporting Java 21 | IntelliJ IDEA 2025.2 or newer | **26.1**, because of Java 25 |
| Minecraft version number | `1.21.1` | `26.2` | **26.1**, the first release using the year-based scheme |
| NeoForge version | `21.1.249` | `26.2.0.72` | **26.1**, when NeoForge began including the full Minecraft version |
| Explicit `modLoader` and `loaderVersion` | Present | Omitted; Java FML defaults are used | Current official MDKs omit them from **1.21.5** onward |
| Obfuscation | Minecraft binaries require a deobfuscation/mapping step | Vanilla is distributed unobfuscated | **26.1** |

Minecraft 1.21.11 is therefore still a Java 21 version using the old Minecraft
and NeoForge numbering. It already uses the shorter metadata style in the
current official MDK. It does **not** need the Java 25 or 26.x version changes.

### Java 25

Change the toolchain in `build.gradle`:

```groovy
// Minecraft 26.2 uses Java 25.
java.toolchain.languageVersion = JavaLanguageVersion.of(25)
```

Minecraft upgraded from Java 21 to Java 25 in **26.1**. NeoForge's 26.1
migration primer also notes that IntelliJ IDEA 2025.2 is the first IntelliJ
release suitable for this Java level. This requirement applies to 26.1 and
newer, but not to 1.21.11 and older.

### New Minecraft and NeoForge version numbers

Use these properties for the companion 26.2 project:

```properties
minecraft_version=26.2
minecraft_version_range=[26.2]
neo_version=26.2.0.72
```

Mojang introduced the year-based Minecraft numbering scheme in **26.1**. In
this scheme, `26` is the year and `.2` identifies the second game drop of that
year.

NeoForge also changed its version format in **26.1** because the older format
assumed every Minecraft version began with `1`. A version such as
`26.2.0.72` contains the full Minecraft version (`26.2`), a zero for the
omitted Minecraft patch component, and the NeoForge build component (`72`).

Always select a NeoForge build made for the exact Minecraft version. Do not try
to infer a usable NeoForge version by editing only part of the number.

### Shorter loader metadata

Remove this property from `gradle.properties`:

```properties
loader_version_range=[1,)
```

Remove it from the replacement map in `build.gradle`:

```groovy
loader_version_range: loader_version_range,
```

Finally, remove these lines from the top of `neoforge.mods.toml`:

```toml
modLoader="javafml"
loaderVersion="${loader_version_range}"
```

The 26.2 file therefore starts with:

```toml
license="${mod_license}"
```

This simplification is **not a 26.x change**. The current official NeoForge
ModDevGradle templates first omit these fields for **Minecraft 1.21.5**. The
Java language loader and its compatible range have defaults, so an ordinary
Java `@Mod` project no longer needs to repeat them.

Older documentation for some releases may still describe the fields as
mandatory. When targeting an older NeoForge build, use the MDK belonging to
that exact Minecraft version rather than copying metadata blindly from a newer
tutorial.

### Unobfuscated vanilla code

Starting with **Minecraft 26.1**, Mojang distributes the game's Java code
unobfuscated. This does not change `TutorialMod.java`, and the imports used in
this tutorial remain the same. It does change part of the build pipeline and
will matter more in later tutorials when reading Minecraft source or porting
code that refers to vanilla internals.

### Quick guide for intermediate versions

| Target Minecraft versions | Java | Version style | Metadata starting point |
| --- | --- | --- | --- |
| 1.21.1 through 1.21.4 | 21 | `1.21.x`; NeoForge `21.x.y` | Keep `modLoader` and `loaderVersion` as shown in this tutorial |
| 1.21.5 through 1.21.11 | 21 | `1.21.x`; NeoForge `21.x.y` | Current official MDKs omit the two loader fields |
| 26.1 and newer | 25 | Year-based Minecraft number; full Minecraft number in NeoForge version | Use the shorter metadata and Java 25 |

Treat this table as a starting point, then check the MDK and migration primer
for the exact version you are targeting. Minecraft APIs can change even when
the basic project layout stays the same.

## Further reading

- [NeoForge 1.21.1 MDK](https://github.com/NeoForgeMDKs/MDK-1.21.1-ModDevGradle)
- [NeoForge 26.2 MDK](https://github.com/NeoForgeMDKs/MDK-26.2-ModDevGradle)
- [ModDevGradle documentation](https://github.com/neoforged/ModDevGradle)
- [NeoForge mod-file documentation](https://docs.neoforged.net/docs/1.21.1/gettingstarted/modfiles/)
- [NeoForge 1.21.1 event documentation](https://docs.neoforged.net/docs/1.21.1/concepts/events/)
- [Minecraft 1.21.11 to 26.1 migration primer](https://docs.neoforged.net/primer/docs/26.1/)
- [Minecraft's 26.1 version-number announcement](https://www.minecraft.net/en-us/article/minecraft-26-1-snapshot-1)
- [NeoForge versioning documentation](https://docs.neoforged.net/docs/gettingstarted/versioning/)
- [`neoforge.mods.toml` in the 1.21.4 MDK](https://github.com/NeoForgeMDKs/MDK-1.21.4-ModDevGradle/blob/main/src/main/templates/META-INF/neoforge.mods.toml)
- [`neoforge.mods.toml` in the 1.21.5 MDK](https://github.com/NeoForgeMDKs/MDK-1.21.5-ModDevGradle/blob/main/src/main/templates/META-INF/neoforge.mods.toml)
