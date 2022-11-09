=Introduction=

Here is a step by step description on how the tutorial mod was ported. As a reference you can find the 1.19 source of the tutorial [https://github.com/McJty/TutorialV3/tree/1.19 here].

==Starting Steps==

First start with this guide to do the initial steps on your working 1.18.2 mod [https://gist.github.com/amadornes/cead90457e766f6d4294cb6b812f91dc auto refactor guide]. After that many renames will already have been done for you.

====build.gradle====

Do the following changes to [https://github.com/McJty/TutorialV3/blob/1.19/build.gradle build.gradle]. After making this changes you need to refresh gradle and run the 'genIntellijRuns' task


====Forge====
First visit [https://files.minecraftforge.net/net/minecraftforge/forge/index_1.19.html The Forge Download Site] to see what the latest version of Forge is. Then change the minecraft dependency to that version. For example:
```
 <syntaxhighlight lang="gradle">
minecraft 'net.minecraftforge:forge:1.19.2-42.0.1'
</syntaxhighlight>
```
====Mappings====
Also you want to set the correct mappings. Check [https://github.com/ParchmentMC/Parchment/wiki/Getting-Started The Parchment Wiki] to find the latest version. As of this moment there are no parchment mappings for 1.19 so we use official mappings instead:
```
 <syntaxhighlight lang="gradle">
mappings channel: 'official', version: "1.19.2"
</syntaxhighlight>
```
====JEI====
We also want to get JEI. Consult [https://github.com/mezz/JustEnoughItems/wiki/Getting-Started-%5BJEI-10-or-higher-for-Forge-or-Fabric%5D#dependencies-for-forgegradle The JEI wiki] for more information. As of this writing we use this:
```
 <syntaxhighlight lang="gradle">
// compile against the JEI API but do not include it at runtime
compileOnly fg.deobf("mezz.jei:jei-1.19.1-common-api:${jei_version}")
compileOnly fg.deobf("mezz.jei:jei-1.19.1-forge-api:${jei_version}")
// at runtime, use the full JEI jar for Forge
runtimeOnly fg.deobf("mezz.jei:jei-1.19.1-forge:${jei_version}")
</syntaxhighlight>
```
In gradle.properties we then set this: jei_version=11.2.0.244

====TOP====
Finally we want to include The One Probe. Check here to find what the latest version is [https://maven.k-4u.nl/mcjty/theoneprobe/theoneprobe/ The TOP Maven].
```
 <syntaxhighlight lang="gradle">
implementation fg.deobf(project.dependencies.create("mcjty.theoneprobe:theoneprobe:${top_version}") {
    transitive = false
})
</syntaxhighlight>
```
And again in gradle.properties we put this: top_version=1.19-6.2.0-6

==The Porting Tutorial Video==

[https://www.youtube.com/watch?v=du2gINiZzOc&ab_channel=JorritTyberghein The tutorial video]

==Various bits of information to help with porting==

{{warning|1=This is not a complete list. The information in the list below contains everything that was discovered during the porting of the RFTools mods and the tutorial}}

[https://github.com/McJty/TutorialV3/commit/7fe99a7fd4f03c71550c9fa61d75bbcf434805aa This] is the commit where the 1.18.2 tutorial was ported to 1.19.2. It's complete and can be used as a reference as well.

====Various Renames====

Before starting to actually port you should follow [https://gist.github.com/amadornes/cead90457e766f6d4294cb6b812f91dc this guide] to do a lot of renames for you.

* In many places World has been replaced with Level. For example it's now LevelTickEvent
* Similarly many 'world' instance members have been replaced with 'level'. Especially in Forge events
* Containers are now called MenuTypes. For example ForgeRegistries.CONTAINERS is now ForgeRegistries.MENU_TYPES
* ForgeRegistries.BLOCK_ENTITIES is now called ForgeRegistries.BLOCK_ENTITY_TYPES
* ForgeRegistries.ENTITIES is now called ForgeRegistries.ENTITY_TYPES
* RenderGameOverlayEvent has become RenderGuiOverlayEvent and the getType() is replaced by getOverlay(). You can find the vanilla overlays in VanillaGuiOverlay
* getMatrixStack() -> getPoseStack()
* InputEvent.KeyInputEvent -> InputEvent.Key
* NetworkHooks.openGui() -> NetworkHooks.openScreen()
* Block Properties: noDrops() -> noLootTable()
* IModelLoader -> IGeometryLoader
* IModelGeometry -> IUnbakedGeometry
* ModelRegistryEvent -> ModelEvent.RegisterGeometryLoaders

====More JSon====

Various things should now be defined in json. Like for the ores you can use jsons in worldgen/configured_feature and worldgen/placed_feature. See the tutorial github for examples.

====Various Removals====

* net.minecraftforge.registries.ForgeRegistryEntry is gone. You can simply remove it. It is no longer needed

====KeyBindings====

ClientRegistry.registerKeyBinding() has gone and is replaced by the RegisterKeyMappingsEvent event that you have to subscribe to the mod bus.

====getRegistryName()====

The getRegistryName() function is gone now. To get the ResourceLocation from an object you can do these:
```
 <syntaxhighlight language="java">
ResourceLocation rl = ForgeRegistries.ITEMS.getKey(item);
ResourceLocation rl = ForgeRegistries.BLOCKS.getKey(block);
ResourceLocation rl = ForgeRegistries.FLUIDS.getKey(fluid);
ResourceLocation rl = level.registryAccess().registryOrThrow(Registry.BIOME_REGISTRY).getKey(biome);
</syntaxhighlight>
```
Note how it is different for biomes. The reason for that is that biomes can be specified fully in Json. And when that happens there will be no entry for this biome in the forge registry. The method using registryAccess() is the safest way to get the key for a biome. The same is true for other objects that can be added dynamically to the game using json only (structures, dimensions, ...)

Note that if you have a RegistryObject then an easier way to get the registry name is to use registryobject.getId().

====Text Component changes====

You can no longer do things like new TranslatableComponent(), new TextComponent(), or new KeybindComponent(). Instead you have to do things like:

* Component.translatable(key)
* Component.literal(text)
* Component.keybind(keybind)

====Fluid API changes====

There have been extensive changes to fluids. [https://forge.gemwire.uk/wiki/User:ChampionAsh5357/Sandbox/Fluids_API Here is a guide]

* Fluid.getAttributes() is gone and replaced with IClientFluidTypeExtensions.of(fluid) for render attributes and fluid.getFluidType() for other settings
* When making a custom fluid the createAttributes() method is gone. Instead you have to create (and register) a new FluidType and also make a IClientFluidTypeExtensions anonymous subclass for client side attributes. See the fluid guide.

====Data Generators====

Data generation has changed. addProvider() has an extra boolean parameter. For a server-side datagenerator you pass event.includeServer() and for a client-side datagenerator you pass event.includeClient(). The 'if' can be removed:
```
 <syntaxhighlight language="java">
    public static void gatherData(GatherDataEvent event) {
        DataGenerator generator = event.getGenerator();
        generator.addProvider(event.includeServer(), new Recipes(generator));
        generator.addProvider(event.includeServer(), new LootTables(generator));
        BlockTags blockTags = new BlockTags(generator, event.getExistingFileHelper());
        generator.addProvider(event.includeServer(), blockTags);
        generator.addProvider(event.includeServer(), new ItemTags(generator, blockTags, event.getExistingFileHelper()));
        generator.addProvider(event.includeClient(), new BlockStates(generator, event.getExistingFileHelper()));
        generator.addProvider(event.includeClient(), new Items(generator, event.getExistingFileHelper()));
    }
</syntaxhighlight>
```
For the loot table provider the HashCache parameter has changed to CachedOutput and DataProvider.save() is now DataProvider.saveStable().

====Random vs RandomSource====

In various places (like worldgen but also in block ticking) Mojang is now using RandomSource instead of Random. In addition tickable sounds now have an extra RandomSource parameter in their constructor.

====Chat messages====

Player.sendMessage() has now become player.sendSystemMessage() and the UUID parameter has been removed.

====Biome Loading Event vs BiomeDecorators====

See [https://forge.gemwire.uk/wiki/Biome_Modifiers this guide] for more information on Biome Decorators.

BiomeLoadingEvent is gone. You can now do (most/all) stuff with json Biome Modifiers. Example of a biome decorator (place in `data/<modid>/forge/biome_modifier`):
```
 <syntaxhighlight language="json">
{
  "type": "forge:add_features",
  "biomes": "#minecraft:is_overworld",
  "features": "deepresonance:resonating_overworld",
  "step": "underground_ores"
}
</syntaxhighlight>
```
====Structures====

Structures now extend Structure and need a codec for persistance. The codec has to be registered on the Registry.STRUCTURE_TYPE_REGISTRY vanilla registry (you can use DeferredRegister for this):
```
 <syntaxhighlight language="java">
    private static final DeferredRegister<StructureType<?>> STRUCTURES = DeferredRegister.create(Registry.STRUCTURE_TYPE_REGISTRY, MODID);

    public static void init() {
        IEventBus bus = FMLJavaModLoadingContext.get().getModEventBus();
        ...
        STRUCTURES.register(bus);
    }

    public static final RegistryObject<StructureType<?>> PORTAL = STRUCTURES.register("portal", () -> typeConvert(PortalStructure.CODEC));

    // Helper method to register since compiler will complain about typing otherwise
    private static <S extends Structure> StructureType<S> typeConvert(Codec<S> codec) {
        return () -> codec;
    }
</syntaxhighlight>
```
====CraftingContainer====

When making CraftingContainer instances (if you want to craft a recipe in code) you also need to implement quickMoveStack() now. Just return ItemStack.EMPTY

====Gui Overlays====

IIngameOverlay has been replaced with IGuiOverlay and you have to register your overlays in the RegisterGuiOverlaysEvent event like this:
```
 <syntaxhighlight language="java">
    @SubscribeEvent
    public static void onRegisterOverlays(RegisterGuiOverlaysEvent event) {
        event.registerAbove(VanillaGuiOverlay.HOTBAR.id(), "mana_overlay", ManaOverlay.HUD_MANA);
    }
</syntaxhighlight>
```
====Render Types====

Although the old way still works it is deprecated and you should move your render type setting to the block model. This can also be done with datagen. Basically ItemBlockRenderTypes.setRenderLayer() is now deprecated. Instead make a model like this:
```
 <syntaxhighlight language="json">
{
  "parent": "deepresonance:block/crystal",
  "render_type": "minecraft:translucent",
  "textures": {
    "crystal_texture": "deepresonance:block/empty_crystal",
    "particle": "deepresonance:block/empty_crystal"
  }
}
</syntaxhighlight>
```
====Baked Models====

There have been a lot of render related changes. To get some idea of this you can look at [https://forge-render-refactor.notion.site/forge-render-refactor/ecd69011d01042c48a0fca80696cb4da?v=dd40865450614d9c9130c3dedcd085e5 this notion site]. Here is a summary:

BakedQuadBuilder has been replaced with QuadBakingVertexConsumer. You use it as follows:
```
<syntaxhighlight language="java">
BakedQuad[] quad = new BakedQuad[1];
QuadBakingVertexConsumer builder = new QuadBakingVertexConsumer(q -> quad[0] = q);
builder.setSprite(sprite);
builder.setDirection(Direction.getNearest(normal.x, normal.y, normal.z));
RenderHelper.putVertex(builder, normal, v1.x, v1.y, v1.z, 0, 0, sprite, r, g, b, a);
RenderHelper.putVertex(builder, normal, v2.x, v2.y, v2.z, 0, 16, sprite, r, g, b, a);
RenderHelper.putVertex(builder, normal, v3.x, v3.y, v3.z, 16, 16, sprite, r, g, b, a);
RenderHelper.putVertex(builder, normal, v4.x, v4.y, v4.z, 16, 0, sprite, r, g, b, a);
return quad[0];
</syntaxhighlight>
```
And building a vertex has also changed. Here is an example:
```
 <syntaxhighlight language="java">
    public static void putVertex(VertexConsumer builder, Position normal,
                                 double x, double y, double z, float u, float v, TextureAtlasSprite sprite, float r, float g, float b, float a) {
        float iu = sprite.getU(u);
        float iv = sprite.getV(v);
        builder.vertex(x, y, z)
                .uv(iu, iv)
                .uv2(0, 0)
                .color(r, g, b, a)
                .normal((float)normal.x(), (float)normal.y(), (float)normal.z())
                .endVertex();
    }
</syntaxhighlight>
```
====ModelData====

Also for baked models the model data system has slightly changed. Instead of ModelDataManager.requestModelDataRefresh(this) you now do requestModelDataUpdate(). Also instead of:
```
 <syntaxhighlight language="java">
    public IModelData getModelData() {
        return new ModelDataMap.Builder().withInitial(...).build();
    }
</syntaxhighlight>
```
you do:
```
 <syntaxhighlight language="java">
    public IModelData getModelData() {
        return ModelData.builder().with(...).build();
    }
</syntaxhighlight>```
