# Single Forge Approach

### Introduction

In this approach we don't use the build.gradle's from any of the mods. This is all done with manual IDEA project setup. To accomplish this we actually clone a local version of Forge itself.

### Setting up Forge

The first thing you need to do is to make a new directory that will host your project and in that directory you clone Minecraft Forge like this:

```shell
git clone https://github.com/MinecraftForge/MinecraftForge.git
```

Now you need to copy all AT files from all your mods inside `MinecraftForge/src/main/resources/assets`.
Or alternatively you can make a single file (like `common_at.cfg` or something) containing the combination of all your AT's.

Then go inside the 'MinecraftForge' directory and type `gradlew setupForge`. After a while this will have configured and build forge.
This is the *last* time you'll use gradle for anything! No more setupDecompWorkspace or anything. This makes this approach really efficient and fast.

### Clone all your mods

Then inside your project directory (the directory that contains MinecraftForge) you clone all the mods you want to use:

```shell
git clone https://github.com/SuperModder/SuperMod.git
git clone https://github.com/SuperModder/SplendidMod.git
git clone https://github.com/SuperModder/ExcellentMod.git
```

### Prepare the workspace

Now make a new 'Workspace' directory. Here we will put all the IDEA related things.

Go in that directory and for every mod make an 'iml' file called 'SuperMod.iml', 'SplendidMod.iml', and so on. You can make these from within IDEA but it may be easier to just use this template:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<module type="JAVA_MODULE" version="4">
  <component name="NewModuleRootManager" inherit-compiler-output="true">
    <exclude-output />
    <content url="file://$MODULE_DIR$/../SplendidMod">
      <sourceFolder url="file://$MODULE_DIR$/../SplendidMod/src/main/java" isTestSource="false" />
      <sourceFolder url="file://$MODULE_DIR$/../SplendidMod/src/main/resources" isTestSource="false" />
      <sourceFolder url="file://$MODULE_DIR$/../SplendidMod/src/api/java" isTestSource="false" />
    </content>
    <orderEntry type="inheritedJdk" />
    <orderEntry type="sourceFolder" forTests="false" />
    <orderEntry type="module" module-name="MinecraftForge" />
    <orderEntry type="module" module-name="SuperMod" />
  </component>
</module>
```

In this example you can also add your dependencies between mods already. You can also do this from within IDEA later.

You also need an iml file for MinecraftForge. For this you can use the following template:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<module relativePaths="true" type="JAVA_MODULE" version="4">
  <component name="NewModuleRootManager" inherit-compiler-output="true">
    <exclude-output />
    <content url="file://$MODULE_DIR$/../MinecraftForge">
      <sourceFolder url="file://$MODULE_DIR$/../MinecraftForge/src/main/java" isTestSource="false" />
      <sourceFolder url="file://$MODULE_DIR$/../MinecraftForge/src/main/resources" isTestSource="false" />
      <sourceFolder url="file://$MODULE_DIR$/../MinecraftForge/projects/Forge/src/main/java" isTestSource="false" />
      <sourceFolder url="file://$MODULE_DIR$/../MinecraftForge/projects/Forge/src/main/resources" isTestSource="false" />
      <sourceFolder url="file://$MODULE_DIR$/../MinecraftForge/projects/Forge/src/main/start" isTestSource="false" />
    </content>
    <orderEntry type="sourceFolder" forTests="false" />
    <orderEntry type="inheritedJdk" />
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.google.code.findbugs/jsr305/3.0.1/f7be08ec23c21485b9b5a1cf1654c2ec8c58168d/jsr305-3.0.1.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.google.code.findbugs/jsr305/3.0.1/a2926c057ca3b662b9db194c869bdbe7d3bb8aef/jsr305-3.0.1-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.mojang/patchy/1.1/aef610b34a1be37fa851825f12372b78424d8903/patchy-1.1.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.mojang/patchy/1.1/5e398295fbcb8fb590e3e3bddace13f659792e50/patchy-1.1-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/oshi-project/oshi-core/1.1/9ddf7b048a8d701be231c0f4f95fd986198fd2d8/oshi-core-1.1.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/oshi-project/oshi-core/1.1/1ec1ab1e6ac5a1572edfd0dd9ac95e83684b8a65/oshi-core-1.1-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.java.dev.jna/jna/4.4.0/cb208278274bf12ebdb56c61bd7407e6f774d65a/jna-4.4.0.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.java.dev.jna/jna/4.4.0/9d45d3dc35711eef7267d8b4fc2c0dc482ef9fd2/jna-4.4.0-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.java.dev.jna/platform/3.4.0/e3f70017be8100d3d6923f50b3d2ee17714e9c13/platform-3.4.0.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.java.dev.jna/platform/3.4.0/2f42653596d0044f0ab456620cba54c9cf53c5ca/platform-3.4.0-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.ibm.icu/icu4j-core-mojang/51.2/63d216a9311cca6be337c1e458e587f99d382b84/icu4j-core-mojang-51.2.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.ibm.icu/icu4j-core-mojang/51.2/814397ccbafff1132758e551c37396c528d7f2d7/icu4j-core-mojang-51.2-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.sf.jopt-simple/jopt-simple/5.0.3/cdd846cfc4e0f7eefafc02c0f5dce32b9303aa2a/jopt-simple-5.0.3.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.sf.jopt-simple/jopt-simple/5.0.3/36d4348605fd4605d36c8641495f3e78756e454b/jopt-simple-5.0.3-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.paulscode/codecjorbis/20101023/c73b5636faf089d9f00e8732a829577de25237ee/codecjorbis-20101023.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.paulscode/codecjorbis/20101023/4ca2436396bc14ebd78b7db1d4e11ca607c8705e/codecjorbis-20101023-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.paulscode/codecwav/20101023/12f031cfe88fef5c1dd36c563c0a3a69bd7261da/codecwav-20101023.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.paulscode/codecwav/20101023/71ec00b9b9c1a6a2c3a8a25f481a23ddb5b21ddb/codecwav-20101023-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.paulscode/libraryjavasound/20101123/5c5e304366f75f9eaa2e8cca546a1fb6109348b3/libraryjavasound-20101123.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.paulscode/libraryjavasound/20101123/945ff5711de27751cf699641d1ea316ba6cf7589/libraryjavasound-20101123-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.paulscode/librarylwjglopenal/20100824/73e80d0794c39665aec3f62eee88ca91676674ef/librarylwjglopenal-20100824.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.paulscode/librarylwjglopenal/20100824/ecfc8dac1d41bef748997e4edf563d486923ee1e/librarylwjglopenal-20100824-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.paulscode/soundsystem/20120107/419c05fe9be71f792b2d76cfc9b67f1ed0fec7f6/soundsystem-20120107.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.paulscode/soundsystem/20120107/1b9f4eb11ef11fede7fd76a2e5e8203c2a8adcd/soundsystem-20120107-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/io.netty/netty-all/4.1.9.Final/97860965d6a0a6b98e7f569f3f966727b8db75/netty-all-4.1.9.Final.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/io.netty/netty-all/4.1.9.Final/69b921f5e296428c88c2ea4418e630443a699b06/netty-all-4.1.9.Final-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.google.guava/guava/21.0/3a3d111be1be1b745edfa7d91678a12d7ed38709/guava-21.0.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.google.guava/guava/21.0/b9ed26b8c23fe7cd3e6b463b34e54e5c6d9536d5/guava-21.0-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.commons/commons-lang3/3.5/6c6c702c89bfff3cd9e80b04d668c5e190d588c6/commons-lang3-3.5.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.commons/commons-lang3/3.5/f7d878153e86a1cdddf6b37850e00a9f8bff726f/commons-lang3-3.5-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/commons-io/commons-io/2.5/2852e6e05fbb95076fc091f6d1780f1f8fe35e0f/commons-io-2.5.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/commons-io/commons-io/2.5/caf033a4a7c37b4a8ff3ea084cba591539b0b69/commons-io-2.5-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/commons-codec/commons-codec/1.10/4b95f4897fa13f2cd904aee711aeafc0c5295cd8/commons-codec-1.10.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/commons-codec/commons-codec/1.10/11fb3d88ae7e3b757d70237064210ceb954a5a04/commons-codec-1.10-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.java.jinput/jinput/2.0.5/39c7796b469a600f72380316f6b1f11db6c2c7c4/jinput-2.0.5.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.java.jinput/jinput/2.0.5/82604cfeb87b9ab70ed70aa19a137de8ceb21504/jinput-2.0.5-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.java.jutils/jutils/1.0.0/e12fe1fda814bd348c1579329c86943d2cd3c6a6/jutils-1.0.0.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.java.jutils/jutils/1.0.0/d18678a00b216863206a1bb6190507e02a32971b/jutils-1.0.0-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.google.code.gson/gson/2.8.0/c4ba5371a29ac9b2ad6129b1d39ea38750043eff/gson-2.8.0.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.google.code.gson/gson/2.8.0/baf95d8519fc1a11d388f8543cb40cd2bb9d66dc/gson-2.8.0-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.mojang/authlib/1.5.25/9834cdf236c22e84b946bba989e2f94ef5897c3c/authlib-1.5.25.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.mojang/authlib/1.5.25/18840707f662a3236542716fff61c659584f3e6c/authlib-1.5.25-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.mojang/realms/1.10.19/c0e1cddb173faa8bf69a4236211cfd0af6c6150d/realms-1.10.19.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES />
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.commons/commons-compress/1.8.1/a698750c16740fd5b3871425f4cb3bbaa87f529d/commons-compress-1.8.1.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.commons/commons-compress/1.8.1/3caea4421428752206c7a94c3e3097f0c47f1bb8/commons-compress-1.8.1-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.httpcomponents/httpclient/4.3.3/18f4247ff4572a074444572cee34647c43e7c9c7/httpclient-4.3.3.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.httpcomponents/httpclient/4.3.3/65cba03c4f6207f2885f88206fcf52c53f8d111b/httpclient-4.3.3-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/commons-logging/commons-logging/1.1.3/f6f66e966c70a83ffbdb6f17a0919eaf7c8aca7f/commons-logging-1.1.3.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/commons-logging/commons-logging/1.1.3/28bb0405fddaf04f15058fbfbe01fe2780d7d3b6/commons-logging-1.1.3-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.httpcomponents/httpcore/4.3.2/31fbbff1ddbf98f3aa7377c94d33b0447c646b6e/httpcore-4.3.2.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.httpcomponents/httpcore/4.3.2/4809f38359edeea9487f747e09aa58ec8d3a54c5/httpcore-4.3.2-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/it.unimi.dsi/fastutil/7.1.0/9835253257524c1be7ab50c057aa2d418fb72082/fastutil-7.1.0.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/it.unimi.dsi/fastutil/7.1.0/4a33438326f2fea664656d63d655c349d4131e14/fastutil-7.1.0-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.logging.log4j/log4j-api/2.8.1/e801d13612e22cad62a3f4f3fe7fdbe6334a8e72/log4j-api-2.8.1.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.logging.log4j/log4j-api/2.8.1/a5edb6b8c77843c8be98e0cb1f875699e76ee122/log4j-api-2.8.1-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.logging.log4j/log4j-core/2.8.1/4ac28ff2f1ddf05dae3043a190451e8c46b73c31/log4j-core-2.8.1.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.logging.log4j/log4j-core/2.8.1/a0a7f683da620c345b502fff04d1e46cde2e8d9/log4j-core-2.8.1-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.lwjgl.lwjgl/lwjgl/2.9.4-nightly-20150209/697517568c68e78ae0b4544145af031c81082dfe/lwjgl-2.9.4-nightly-20150209.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.lwjgl.lwjgl/lwjgl/2.9.4-nightly-20150209/7da2cff65127b558a66e8e38456174161723d3a7/lwjgl-2.9.4-nightly-20150209-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.lwjgl.lwjgl/lwjgl_util/2.9.4-nightly-20150209/d51a7c040a721d13efdfbd34f8b257b2df882ad0/lwjgl_util-2.9.4-nightly-20150209.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.lwjgl.lwjgl/lwjgl_util/2.9.4-nightly-20150209/2e3787f55c68a245e994f88755795b3a7684b3/lwjgl_util-2.9.4-nightly-20150209-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.mojang/text2speech/1.10.3/48fd510879dff266c3815947de66e3d4809f8668/text2speech-1.10.3.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.mojang/text2speech/1.10.3/404339fe43d1011ee046a249b0ec7ae9ce04a834/text2speech-1.10.3-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.minecraft/launchwrapper/1.12/111e7bea9c968cdb3d06ef4632bf7ff0824d0f36/launchwrapper-1.12.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.minecraft/launchwrapper/1.12/fd80cad9a1b967ce2ff20529dc54e520d5338d7/launchwrapper-1.12-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/jline/jline/2.13/2d9530d0a25daffaffda7c35037b046b627bb171/jline-2.13.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/jline/jline/2.13/e290282bf7683ae3307e85bdc5d5e08424dfb893/jline-2.13-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.ow2.asm/asm-debug-all/5.2/3354e11e2b34215f06dab629ab88e06aca477c19/asm-debug-all-5.2.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.ow2.asm/asm-debug-all/5.2/ed60d4287d18996bc940f26656c570532b20d863/asm-debug-all-5.2-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.typesafe.akka/akka-actor_2.11/2.3.3/ed62e9fc709ca0f2ff1a3220daa8b70a2870078e/akka-actor_2.11-2.3.3.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.typesafe.akka/akka-actor_2.11/2.3.3/9dbceb71c4fd943b4eb4607847261075a989d47f/akka-actor_2.11-2.3.3-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.typesafe/config/1.2.1/f771f71fdae3df231bcd54d5ca2d57f0bf93f467/config-1.2.1.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/com.typesafe/config/1.2.1/bdacf4f82ce9b29cd474bfde2e91eeb0ca623d28/config-1.2.1-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/lzma/lzma/0.0.1/521616dc7487b42bef0e803bd2fa3faf668101d7/lzma-0.0.1.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES />
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/java3d/vecmath/1.5.2/79846ba34cbd89e2422d74d53752f993dcc2ccaf/vecmath-1.5.2.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/java3d/vecmath/1.5.2/42442b23189fbef9353c1751055610b63dd57e85/vecmath-1.5.2-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.sf.trove4j/trove4j/3.0.3/42ccaf4761f0dfdfa805c9e340d99a755907e2dd/trove4j-3.0.3.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/net.sf.trove4j/trove4j/3.0.3/109c5be93362e6e651e417c51d1863477a22969c/trove4j-3.0.3-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.maven/maven-artifact/3.5.3/7dc72b6d6d8a6dced3d294ed54c2cc3515ade9f4/maven-artifact-3.5.3.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.apache.maven/maven-artifact/3.5.3/25c6b5e0103ae09bc1cac02ee6dff968bacbdba9/maven-artifact-3.5.3-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" scope="TEST">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/junit/junit/4.12/2973d150c0dc1fefe998f834810d68f278ea58ec/junit-4.12.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/junit/junit/4.12/a6c32b40bf3d76eca54e3c601e5d1470c86fcdfa/junit-4.12-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" scope="TEST">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.junit.jupiter/junit-jupiter-api/5.0.0/f7fe1b74bef74d640493781abecafba191472ad/junit-jupiter-api-5.0.0.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.junit.jupiter/junit-jupiter-api/5.0.0/fadbe39cb1fd01b65e5114b0e0d140af0621a8ac/junit-jupiter-api-5.0.0-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" scope="TEST">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.opentest4j/opentest4j/1.0.0/6f09c598e9ff64bf0ce2fa7e7de49a99ba83c0b4/opentest4j-1.0.0.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.opentest4j/opentest4j/1.0.0/a67ba0f50d97fa616f2470c5a48eb7f9eb38391c/opentest4j-1.0.0-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" scope="TEST">
      <library>
        <CLASSES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.hamcrest/hamcrest-core/1.3/42a25dc3219429f0e5d060061f71acb49bf010a0/hamcrest-core-1.3.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES>
          <root url="jar://$USER_HOME$/.gradle/caches/modules-2/files-2.1/org.hamcrest/hamcrest-core/1.3/1dc37250fbc78e23a65a67fbbaf71d2e9cbc3c0b/hamcrest-core-1.3-sources.jar!/" />
        </SOURCES>
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$MODULE_DIR$/libs/Hwyla-1.8.24-B39_1.12.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES />
      </library>
    </orderEntry>
    <orderEntry type="module-library" exported="">
      <library>
        <CLASSES>
          <root url="jar://$MODULE_DIR$/libs/jei_1.12.2-4.9.1.175.jar!/" />
        </CLASSES>
        <JAVADOC />
        <SOURCES />
      </library>
    </orderEntry>
    <orderEntry type="module" module-name="SuperMod" scope="RUNTIME" />
    <orderEntry type="module" module-name="SplendidMod" scope="RUNTIME" />
    <orderEntry type="module" module-name="ExcellentMod" scope="RUNTIME" />
  </component>
</module>
```

### Fetching additional dependencies

If you have other dependencies like JEI, WAILA, TOP, ... you have to download the normal release jars from Curse and put them in the 'Workspace/libs' folder.

### Creating the IDEA project

Make a normal IDEA java project and in de 'Project Structure' window import all the iml files you just created (`MinecraftForge.iml` and all your mod imls).
Double check that all dependencies are ok:

* MinecraftForge needs 'runtime' dependencies on all your mods that you actually want to use at runtime (using this you can leave out mods that you want to have in your project but don't want to use at runtime)
* MinecraftForge needs 'compile' dependencies for all mods you put in Workspace/libs
* MinecraftForge needs 'provide' dependencies for all mods you put in Workspace/libs because you need them for compilation but that you don't want at runtime
* All mods need a 'compile' dependency on MinecraftForge
* All mods need a 'compile' dependency on other mods that they depend on

### Setting up the run configuration

Create a new 'Application' type run configuration and call it 'Client' (or whatever you like). As working directory you can use Workspace/run or any other directory.
I recommend to keep it inside 'run' or some other directory to have a cleaner directory structure. The run configuration should use the classpath of the 'MinecraftForge' module.

Note: you may need to set 'Shorten command line' to 'none'. Forge can have trouble detecting mods otherwise.

As the main class you have to use 'GradleStart'.

If all went well this should compile and run.
