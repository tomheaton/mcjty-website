# Single Project Approach

## Preparation

For all mod projects that you want to include in this multi-mod project you have to adapt the build.gradle as follows:

```gradle
...
dependencies {
    deobfCompile "mezz.jei:jei_${jei_version}"
    deobfCompile "mcp.mobius.waila:Hwyla:${waila_version}"
    deobfCompile "mcjty.theoneprobe:TheOneProbe-${top_version}"
    ...

    if (!project.hasProperty("singleproject")) {
        deobfCompile "com.github.mcjty:mcjtylib:${mcjtylib_version}"
    } else {
	    compile project(':McJtyLib')
    }
}
...
```

So basically for all dependencies that you want to include in the multi-mod project you have to use a conditional on the 'singleproject' property (more on this later) so that instead of getting the dependency from the maven you add it from the project module.

### A template

Perhaps the easiest way to proceed here is to check out the template that McJty was using for his multi-mod project and adapt it to your needs. To do this make a clone from:
[SingleProject github](https://github.com/McJtyMods/SingleProject.git)

This repository contains the master build.gradle and other gradle files needed to get this setup to work.
You might want to change the `rootProject.name` property in `settings.gradle` to match a name better suited for you.
There is also a `setupSingleProject.sh` script that you might want to use.
The only thing it does is make a clone of all the repositories you want.
You can modify this script to include your projects or else you can just clone your projects manually.

The MC folder is the master 'mod' project that is used to collect all AT's and is also used for the run configuration for IDEA.
You will need to modify the `common_at.cfg` file in that directory so that it contains the combination of all AT's used in your own projects.
If you don't need any AT's (lucky you!) then you just make this file blank.

In addition, you want to modify the `build.gradle` in the MC module to contain the dependencies you want to use at runtime.
This is usually all the normal deps (like JEI, TOP, WAILA, Redstone Flux, ...) and also your own modules.
Note that you don't have to include all your mods here if you want to run with fewer mods then are present in your project.

This is everything you have to do. The master `build.gradle` handles everything for you.

### Doing the setup

There are two options here.
Either you run `gradlew setupDecompWorkspace` in the single project directory from the commandline and after that you import the project into IDEA or else you start by importing it into IDEA, and then you can run the `setupDecompWorkspace` task from there (don't forget to refresh gradle after this!)

In the ideal world this should now compile from IDEA.
In a less than ideal world you might have to fix some things here and there (i.e. add excludes to the module configuration for duplicate api classes and so on).

### Creating a run configuration

Now you can create a new 'Application' run configuration. Use `MC_main` as the module and pick a spot where you want the run folder to be (something like 'run' would work). Use `GradleStart` as the main class (don't worry if it is red).

If all went well you should now be able to run Minecraft with all your mods.
