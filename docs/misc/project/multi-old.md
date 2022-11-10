# Older Multi-Mod Project

=== Preparations ===

To make things easier it might be a good idea to prepare the build.gradle of all your projects before you start with this. If the mods you plan to include in this multi-mod project depend on each other you might want to do some special setup because presumably your build.gradle files will fetch these dependencies from some maven. In the multi-mod project setup you don't want to do that because then you would a) get duplicates and b) it wouldn't work against the local version of that dependency. One way to solve this is with a build.gradle like this (this code was copied from EnderIO build.gradle):
```
 <nowiki>
buildscript {

...

// More user properties
ext.user = parseConfig(file('extra.properties'))
if (ext.user != null) {
ext.user.each { k, v ->
project.ext.set(k, v)
}
}

// parse and import external config
def parseConfig(File config) {
if (!config.exists())
return null

    config.withReader {
        def prop = new Properties()
        prop.load(it)
        return (new ConfigSlurper().parse(prop))
    }
}


...


dependencies {
deobfCompile "mezz.jei:jei_${jei_version}"
deobfCompile "mcp.mobius.waila:Hwyla:${waila_version}"
deobfCompile "mcjty.theoneprobe:TheOneProbe-${top_version}"
deobfCompile "cofh:RedstoneFlux:${redstoneflux_version}"

    deobfCompile "com.github.mcjty:intwheel:${intwheel_version}"
    if (!project.hasProperty("singleproject")) {
        deobfCompile "com.github.mcjty:mcjtylib:${mcjtylib_version}"
        deobfCompile "com.github.mcjty:xnet:1.12-1.6.7"
        deobfCompile "com.github.mcjty:rftools:1.12-7.30"
    }
    compile "li.cil.oc:OpenComputers:${oc_version}"
}

...
</nowiki>
```
This example is from a multi-mod project containing many mods including McJtyLib, XNet, RFTools. Deep Resonance has these as dependencies but we don't want to pull them in if the 'singleproject' property is equal to true. This property can then be set in the optional 'extra.properties' file. The reason it is not put in the normal 'gradle.properties' is that the latter will contain things like forge version, dependency versions and so on and we want to push that file to git so that someone checking out your mod can compile it with the correct dependency versions. However we don't want to push the 'singleproject' property to github. So we keep that seperate.

=== First steps ===

Like explained in LatvianModder's tutorial you should start by creating a new project with type 'Application'. In this tutorial it is assumed you name the main module 'MC' like in that tutorial.

Make sure the gradle and git/github plugins in IDEA are present and enabled.

For every mod that you want to add to this project you have to do the following (however, see possible preparations that you might want to do first):

* VCS -> Checkout from Version Control -> Git (or GitHub) and checkout your mod inside your project home (so each mod sits in its own directory)
* File -> Project Structure -> Modules -> Import Module -> `<your mod>/build.gradle` (make sure to unselect "Create module per source set")
* If you prepared your project for automatically disabling maven dependencies then copy the 'extra.properties' file in your new module with 'singleproject' set to true
* From your gradle tab run 'setupDecompWorkspace' for this new module
* Also from your gradle tab select 'Refresh Gradle project' for this new module
* File -> Project Structure -> Modules: select the new module and go to the 'Dependencies' tab. If you did not follow the above preparations section and your mod depends on other mods that will also be in this multi-mod project then you have to manually remove them from the dependencies. Also add a module dependency for the correct modules here (i.e. add McJtyLib module if your mod depends on that module for example)
* File -> Project Structure -> Modules: select the MC module and add this new mod as a dependency. Make sure to set the scope to 'Runtime'!

=== Making a run Configuration ===

Follow LatvianModder's tutorial for this. Basically make a new configuration for the 'MC' module. Add 'GradleStart' as the main class.

=== What if you have AT's? ===

If you need some AT's for some of your mods you might need a bit more work to get this right. The problem with this setup is that every module will have its own version of Forge. First make sure that they are all using the same version of Forge. It seems that for compilation IDEA uses the last module (alphabetically) so one thing you could do is make a dummy mod called ZZZ or something. Add that mod the same way as all the other mods that you have added to this project. Make sure it has an AT file (for example zzz_at.cfg) at the correct spot and copy all AT's from all other mods to that file. Having that seems to solve IDEA being able to compile the project.

However, to be able to run the project you also have to make sure that the MC client runs with the correct Forge as well. Given that all mods use the same Forge version they actually all use the same forge cached by gradle. So that means that the last 'setupDecompWorkspace' is the one that decides what AT's are active! So after making any change to the project that caused a setupDecompWorkspace for any of the other mods you'll have to redo 'setupDecompWorkspace' (with --refresh-dependencies to force recreate it) for the ZZZ module. That's the only way I found to make sure the forge is correct at runtime.

=== Problems ===

Besides the AT situation the following problems are also present:

* Doing a refresh of a module in gradle will get rid of the module dependencies. You'll have to redo those manually
* If you have a lot of mods doing the setup on this is hard to automate (i.e. have to do setupDecompWorkspace manually on each module)
