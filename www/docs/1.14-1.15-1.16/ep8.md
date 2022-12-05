---
sidebar_position: 8
---

# Episode 8

Back: [Index](./1.14-1.15-1.16.md)

### Introduction

In this tutorial we create a very simple entity that doesn't do anything.
This is basically a 'getting started on entities' tutorial.

### The Basic Entity Class

What you need first is the basic entity class.
In this tutorial we decide to make it an animal, so we extend from AnimalEntity.
That means we also have to override createChild() but we don't support this yet so just return null there:

```java
public class WeirdMobEntity extends AnimalEntity {

    public WeirdMobEntity(EntityType<? extends AnimalEntity> type, World worldIn) {
        super(type, worldIn);
    }

    @Nullable
    @Override
    public AgeableEntity createChild(AgeableEntity ageable) {
        return null;
    }
}
```

This entity has to be registered. So first we add a new ModEntities class which keeps our object holder:

```java
public class ModEntities {

    @ObjectHolder("mytutorial:weirdmob")
    public static EntityType<WeirdMobEntity> WEIRDMOB;

}
```

And then we extend our RegistryEvents class in the MyTutorial class with the following registry event handler:

```java
        @SubscribeEvent
        public static void onEntityRegistry(final RegistryEvent.Register<EntityType<?>> event) {
            event.getRegistry().register(EntityType.Builder.create(WeirdMobEntity::new, EntityClassification.CREATURE)
                    .size(1, 1)
                    .setShouldReceiveVelocityUpdates(false)
                    .build("weirdmob").setRegistryName(MyTutorial.MODID, "weirdmob"));

        }
```

### Model and Renderer

On the client side our entity needs a model and a renderer.
In our example we make very simple ones. Create the following two classes:

```java
public class WeirdMobModel extends EntityModel<WeirdMobEntity> {

    public RendererModel body;

    public WeirdMobModel() {
        body = new RendererModel(this, 0, 0);
        body.addBox(-3, -3, -3, 6, 6, 6);
    }

    @Override
    public void render(WeirdMobEntity entityIn, float limbSwing, float limbSwingAmount, float ageInTicks, float netHeadYaw, float headPitch, float scale) {
        setRotationAngles(entityIn, limbSwing, limbSwingAmount, ageInTicks, netHeadYaw, headPitch, scale);
        body.render(scale);
    }

    @Override
    public void setRotationAngles(WeirdMobEntity entityIn, float limbSwing, float limbSwingAmount, float ageInTicks, float netHeadYaw, float headPitch, float scaleFactor) {

    }
}
```

And also the renderer:

```java
public class WeirdMobRenderer extends MobRenderer<WeirdMobEntity, WeirdMobModel> {

    private static final ResourceLocation TEXTURE = new ResourceLocation(MyTutorial.MODID, "textures/entity/weirdmob.png");

    public WeirdMobRenderer(EntityRendererManager manager) {
        super(manager, new WeirdMobModel(), 0.5f);
    }

    @Nullable
    @Override
    protected ResourceLocation getEntityTexture(WeirdMobEntity entity) {
        return TEXTURE;
    }
}
```

We also need to register this renderer. For this we add a new line to ClientProxy:

```java
    @Override
    public void init() {
        ...
        RenderingRegistry.registerEntityRenderingHandler(WeirdMobEntity.class, WeirdMobRenderer::new);
    }
```

### Spawn Egg

The above code is sufficient for the entity itself.
However, we also want to add a spawn egg.
Because the default vanilla SpawnEggItem requires EntityType as a parameter and items are registered before entities we can't use it easily.
So as a solution here we will make our own custom spawn egg item. It's just an item, so you don't have to extend from SpawnEggItem.
This is basically a modified copy from the vanilla SpawnEggItem:

```java
public class WeirdMobEggItem extends Item {

    public WeirdMobEggItem() {
        super(new Item.Properties()
                .maxStackSize(1)
                .group(MyTutorial.setup.itemGroup));
        setRegistryName("weirdmob_egg");
    }

    /**
     * Called when this item is used when targetting a Block
     */
    @Override
    public ActionResultType onItemUse(ItemUseContext context) {
        World world = context.getWorld();
        if (world.isRemote) {
            return ActionResultType.SUCCESS;
        } else {
            ItemStack itemstack = context.getItem();
            BlockPos blockpos = context.getPos();
            Direction direction = context.getFace();
            BlockState blockstate = world.getBlockState(blockpos);
            Block block = blockstate.getBlock();
            if (block == Blocks.SPAWNER) {
                TileEntity tileentity = world.getTileEntity(blockpos);
                if (tileentity instanceof MobSpawnerTileEntity) {
                    AbstractSpawner abstractspawner = ((MobSpawnerTileEntity)tileentity).getSpawnerBaseLogic();
                    abstractspawner.setEntityType(ModEntities.WEIRDMOB);
                    tileentity.markDirty();
                    world.notifyBlockUpdate(blockpos, blockstate, blockstate, 3);
                    itemstack.shrink(1);
                    return ActionResultType.SUCCESS;
                }
            }

            BlockPos blockpos1;
            if (blockstate.getCollisionShape(world, blockpos).isEmpty()) {
                blockpos1 = blockpos;
            } else {
                blockpos1 = blockpos.offset(direction);
            }

            if (ModEntities.WEIRDMOB.spawn(world, itemstack, context.getPlayer(), blockpos1, SpawnReason.SPAWN_EGG, true, !Objects.equals(blockpos, blockpos1) && direction == Direction.UP) != null) {
                itemstack.shrink(1);
            }

            return ActionResultType.SUCCESS;
        }
    }

}
```

We also have to make an object holder and register it as usual:

```java
@SubscribeEvent
public static void onItemsRegistry(final RegistryEvent.Register<Item> event) {
    ...
    event.getRegistry().register(new WeirdMobEggItem());
}
```

Our spawn egg uses the same item model as the vanilla spawn eggs (check GitHub for that) so it needs a color (the spawn egg texture is an uncolored texture that has to be colored in code).
To do that we add a new `ClientRegistration` class to listen to the `ColorHandlerEvent.Item` event:

```java
@Mod.EventBusSubscriber(modid = MyTutorial.MODID, value = Dist.CLIENT, bus = Mod.EventBusSubscriber.Bus.MOD)
public class ClientRegistration {

    @SubscribeEvent
    public static void onItemColor(ColorHandlerEvent.Item event) {
        event.getItemColors().register((stack, i) -> 0xff0000, ModItems.WEIRDMOB_EGG);
    }
}
```

That concludes this tutorial.
