---
sidebar_position: 10
---

# Mobs

In this tutorial we will show you how you can make your own custom mob and make it spawn in the game. This tutorial does not explain how to make mob models. We simply use the vanilla zombie model but with another texture:
```
<img src="http://i.imgur.com/yDWCYTW.png" alt="The Weird Zombie">
```
The first thing you need is an actual entity. The entity we use here is an adaptation of the vanilla zombie entity. It has a special property (ARMS_RAISED) which is used while attacking:
```
<syntaxhighlight lang="java">
public class EntityWeirdZombie extends EntityMob {

    // We reuse the zombie model which has arms that need to be raised when the zombie is attacking:
    private static final DataParameter<Boolean> ARMS_RAISED = EntityDataManager.createKey(EntityWeirdZombie.class, DataSerializers.BOOLEAN);

    public static final ResourceLocation LOOT = new ResourceLocation(ModTut.MODID, "entities/weird_zombie");

    public EntityWeirdZombie(World worldIn) {
        super(worldIn);
        setSize(0.6F, 1.95F);
    }

    @Override
    protected void entityInit() {
        super.entityInit();
        this.getDataManager().register(ARMS_RAISED, Boolean.valueOf(false));
    }

    @Override
    protected void applyEntityAttributes() {
        super.applyEntityAttributes();
        // Here we set various attributes for our mob. Like maximum health, armor, speed, ...
        this.getEntityAttribute(SharedMonsterAttributes.FOLLOW_RANGE).setBaseValue(35.0D);
        this.getEntityAttribute(SharedMonsterAttributes.MOVEMENT_SPEED).setBaseValue(0.13D);
        this.getEntityAttribute(SharedMonsterAttributes.ATTACK_DAMAGE).setBaseValue(3.0D);
        this.getEntityAttribute(SharedMonsterAttributes.ARMOR).setBaseValue(2.0D);
    }

public void setArmsRaised(boolean armsRaised) {
this.getDataManager().set(ARMS_RAISED, Boolean.valueOf(armsRaised));
}

    @SideOnly(Side.CLIENT)
    public boolean isArmsRaised() {
        return this.getDataManager().get(ARMS_RAISED).booleanValue();
    }

    @Override
    protected void initEntityAI() {
        this.tasks.addTask(0, new EntityAISwimming(this));
        this.tasks.addTask(2, new EntityAIWeirdZombieAttack(this, 1.0D, false));
        this.tasks.addTask(5, new EntityAIMoveTowardsRestriction(this, 1.0D));
        this.tasks.addTask(7, new EntityAIWander(this, 1.0D));
        this.tasks.addTask(8, new EntityAIWatchClosest(this, EntityPlayer.class, 8.0F));
        this.tasks.addTask(8, new EntityAILookIdle(this));
        this.applyEntityAI();
    }

    private void applyEntityAI() {
        this.tasks.addTask(6, new EntityAIMoveThroughVillage(this, 1.0D, false));
        this.targetTasks.addTask(1, new EntityAIHurtByTarget(this, true, new Class[]{EntityPigZombie.class}));
        this.targetTasks.addTask(2, new EntityAINearestAttackableTarget(this, EntityPlayer.class, true));
        this.targetTasks.addTask(3, new EntityAINearestAttackableTarget(this, EntityVillager.class, false));
        this.targetTasks.addTask(3, new EntityAINearestAttackableTarget(this, EntityIronGolem.class, true));
    }

    @Override
    public boolean attackEntityAsMob(Entity entityIn) {
        if (super.attackEntityAsMob(entityIn)) {
            if (entityIn instanceof EntityLivingBase) {
                // This zombie gives health boost and regeneration when it attacks
                ((EntityLivingBase)entityIn).addPotionEffect(new PotionEffect(MobEffects.HEALTH_BOOST, 200));
                ((EntityLivingBase)entityIn).addPotionEffect(new PotionEffect(MobEffects.REGENERATION, 200));
            }
            return true;
        } else {
            return false;
        }
    }

    @Override
    @Nullable
    protected ResourceLocation getLootTable() {
        return LOOT;
    }

    @Override
    protected boolean isValidLightLevel() {
        return true;
    }

    @Override
    public int getMaxSpawnedInChunk() {
        return 5;
    }
}
</syntaxhighlight>
```
We also need a custom Mele Attack AI task because we need to support the raising of arms while attacking. This is again a copy of vanilla code but adapted to our entity:
```
<syntaxhighlight lang="java">
public class EntityAIWeirdZombieAttack extends EntityAIAttackMelee {
    private int raiseArmTicks;
    private EntityWeirdZombie weirdZombie;

    public EntityAIWeirdZombieAttack(EntityWeirdZombie zombieIn, double speedIn, boolean longMemoryIn) {
        super(zombieIn, speedIn, longMemoryIn);
        this.weirdZombie = zombieIn;
    }

    /**
     * Execute a one shot task or start executing a continuous task
     */
    @Override
    public void startExecuting() {
        super.startExecuting();
        this.raiseArmTicks = 0;
    }

    /**
     * Resets the task
     */
    @Override
    public void resetTask() {
        super.resetTask();
        this.weirdZombie.setArmsRaised(false);
    }

    /**
     * Updates the task
     */
    @Override
    public void updateTask() {
        super.updateTask();
        ++this.raiseArmTicks;

        if (this.raiseArmTicks >= 5 && this.attackTick < 10) {
            this.weirdZombie.setArmsRaised(true);
        } else {
            this.weirdZombie.setArmsRaised(false);
        }
    }
}
</syntaxhighlight>
```
We also need a rendering object. In this class we reuse the ModelZombie from vanilla but we do supply our own texture:
```
<syntaxhighlight lang="java">
public class RenderWeirdZombie extends RenderLiving<EntityWeirdZombie> {

    private ResourceLocation mobTexture = new ResourceLocation("modtut:textures/entity/weirdzombie.png");

    public static final Factory FACTORY = new Factory();

    public RenderWeirdZombie(RenderManager rendermanagerIn) {
        // We use the vanilla zombie model here and we simply
        // retexture it. Of course you can make your own model
        super(rendermanagerIn, new ModelZombie(), 0.5F);
    }

    @Override
    @Nonnull
    protected ResourceLocation getEntityTexture(@Nonnull EntityWeirdZombie entity) {
        return mobTexture;
    }

    public static class Factory implements IRenderFactory<EntityWeirdZombie> {

        @Override
        public Render<? super EntityWeirdZombie> createRenderFor(RenderManager manager) {
            return new RenderWeirdZombie(manager);
        }

    }

}
</syntaxhighlight>
```
Finally we need to register all this to the system. We make a new ModEntities class like this. Note that registerModEntity also makes us a spawn egg which is handy for testing our mob:
```
<syntaxhighlight lang="java">
public class ModEntities {

    public static void init() {
        // Every entity in our mod has an ID (local to this mod)
        int id = 1;
        EntityRegistry.registerModEntity(EntityWeirdZombie.class, "WeirdZombie", id++, ModTut.instance, 64, 3, true, 0x996600, 0x00ff00);

        // We want our mob to spawn in Plains and ice plains biomes. If you don't add this then it will not spawn automatically
        // but you can of course still make it spawn manually
        EntityRegistry.addSpawn(EntityWeirdZombie.class, 100, 3, 5, EnumCreatureType.MONSTER, Biomes.PLAINS, Biomes.ICE_PLAINS);

        // This is the loot table for our mob
        LootTableList.register(EntityWeirdZombie.LOOT);
    }

    @SideOnly(Side.CLIENT)
    public static void initModels() {
        RenderingRegistry.registerEntityRenderingHandler(EntityWeirdZombie.class, RenderWeirdZombie.FACTORY);
    }
}
</syntaxhighlight>
```
Then we change CommonProxy and ClientProxy to call the new init methods:
```
<syntaxhighlight lang="java">
    public static class CommonProxy {
        public void preInit(FMLPreInitializationEvent e) {

            ...

            ModEntities.init();

            ...
        }


    public static class ClientProxy extends CommonProxy {
        @Override
        public void preInit(FMLPreInitializationEvent e) {

            ...

            ModEntities.initModels();

            ...
        }
</syntaxhighlight>
```
We also need to define the loot for this mob:
```
 <nowiki>
{
  "pools": [
    {
      "name": "modtut:weird_zombie",
      "rolls": 1,
      "entries": [
        {
          "type": "item",
          "name": "minecraft:diamond",
          "weight": 1,
          "functions": [
            {
              "function": "set_count",
              "count": {
                "min": 0,
                "max": 2
              }
            },
            {
              "function": "looting_enchant",
              "count": {
                "min": 0,
                "max": 1
              }
            }
          ]
        }
      ]
    },
    {
      "name": "modtut:weird_zombie",
      "conditions": [
        {
          "condition": "killed_by_player"
        },
        {
          "condition": "random_chance_with_looting",
          "chance": 0.05,
          "looting_multiplier": 0.01
        }
      ],
      "rolls": 1,
      "entries": [
        {
          "type": "item",
          "name": "modtut:simpletextureditem",
          "weight": 1
        }
      ]
    }
  ]
}
</nowiki>
```
