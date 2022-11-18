---
sidebar_position: 7
---

# Episode 7

## Links

* Video: [World Data, Player Capabilities, Networking, Overlay](https://www.youtube.com/watch?v=prqMxqUtj-0&ab_channel=JorritTyberghein)
* [Back to 1.18 Tutorial Index](./1.18.md)
* [Tutorial GitHub](https://github.com/McJty/TutorialV3)

## Introduction

In this tutorial we explain various ways that you can store data and also communicate that data to the client. We will cover world data, player capabilities, and networking. In addition we also cover a new way to make render overlays (HUD's)

### Key Bindings

In this tutorial we want a key binding that the player can press to gather mana from the chunk. How we will store and make this mana is for later but let's first make the key binding. First add the class to actually define the key binding ([https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/manasystem/client/KeyBindings.java KeyBindings.java on GitHub]). In this class we make a new keymapping which by default is assigned to the period key. The player can reconfigure this in the standard Minecraft options screen:

![image](https://i.imgur.com/pLm4syY.png)

```java title="KeyBindings.java"
public class KeyBindings {

    public static final String KEY_CATEGORIES_TUTORIAL = "key.categories.tutorial";
    public static final String KEY_GATHER_MANA = "key.gatherMana";

    public static KeyMapping gatherManaKeyMapping;

    public static void init() {
        // Use KeyConflictContext.IN_GAME to indicate this key is meant for usage in-game
        gatherManaKeyMapping = new KeyMapping(KEY_GATHER_MANA, KeyConflictContext.IN_GAME, InputConstants.getKey("key.keyboard.period"), KEY_CATEGORIES_TUTORIAL);
        ClientRegistry.registerKeyBinding(gatherManaKeyMapping);
    }
}
```

![image](https://i.imgur.com/o7hgFpp.png)

```java title="KeyBindings.java"
public class KeyBindings {

    public static final String KEY_CATEGORIES_TUTORIAL = "key.categories.tutorial";
    public static final String KEY_GATHER_MANA = "key.gatherMana";

    public static KeyMapping gatherManaKeyMapping;

    public static void init(RegisterKeyMappingsEvent event) {
        gatherManaKeyMapping = new KeyMapping(KEY_GATHER_MANA, KeyConflictContext.IN_GAME, InputConstants.getKey("key.keyboard.period"), KEY_CATEGORIES_TUTORIAL);
        event.register(gatherManaKeyMapping);
    }
}
```

![image](https://i.imgur.com/pLm4syY.png)

We also need to call this method.
We do that in `ClientSetup.init()` ([`ClientSetup.java` on GitHub](https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/setup/ClientSetup.java)):

```java title="ClientSetup.java"
public static void init(FMLClientSetupEvent event) {
    ...
    KeyBindings.init();
}
```

![image](https://i.imgur.com/o7hgFpp.png)

In 1.19.2 you add this code:

```java
@SubscribeEvent
public static void onKeyBindRegister(RegisterKeyMappingsEvent event) {
    KeyBindings.init(event);
}
```

In addition to the key binding we also need an input handler. That input handler will be called whenever the key is pressed. To do this we listen to the KeyInputEvent and when that event is received we consume the keypress (so it doesn't get used for something else) and send a message to the server:

:::danger Warning
To also allow the player to bind this action on a mouse button you would also need to listen to `InputEvent.MouseInputEvent`
:::

```java title="KeyInputHandler.java"
public class KeyInputHandler {

    public static void onKeyInput(InputEvent.KeyInputEvent event) {
        if (KeyBindings.gatherManaKeyMapping.consumeClick()) {
            Messages.sendToServer(new PacketGatherMana());
        }
    }
}
```

We need to register this event.
Again edit `ClientSetup.init()` for that:

We also need to call this method.
We do that in `ClientSetup.init()`:

```java title="ClientSetup.java"
public static void init(FMLClientSetupEvent event) {
    ...
    MinecraftForge.EVENT_BUS.addListener(KeyInputHandler::onKeyInput);
    KeyBindings.init();
}
```
### Networking

Whenever a key is pressed on the client we need to send a message to the server.
The reason for that is that actual logic and the mana system will live on the server.
To support networking add the following class ([`Messages.java` on GitHub](https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/setup/Messages.java)).
This class is the main entry point for networking.
It basically makes use of a `SimpleChannel` which is a helper class from Forge:

```java
public class Messages {

    private static SimpleChannel INSTANCE;

    // Every packet needs a unique ID (unique for this channel)
    private static int packetId = 0;
    private static int id() {
        return packetId++;
    }

    public static void register() {
        // Make the channel. If needed you can do version checking here
        SimpleChannel net = NetworkRegistry.ChannelBuilder
                .named(new ResourceLocation(TutorialV3.MODID, "messages"))
                .networkProtocolVersion(() -> "1.0")
                .clientAcceptedVersions(s -> true)
                .serverAcceptedVersions(s -> true)
                .simpleChannel();

        INSTANCE = net;

        // Register all our packets. We only have one right now. The new message has a unique ID, an indication
        // of how it is going to be used (from client to server) and ways to encode and decode it. Finally 'handle'
        // will actually execute when the packet is received
        net.messageBuilder(PacketGatherMana.class, id(), NetworkDirection.PLAY_TO_SERVER)
                .decoder(PacketGatherMana::new)
                .encoder(PacketGatherMana::toBytes)
                .consumer(PacketGatherMana::handle)
                .add();
    }

    public static <MSG> void sendToServer(MSG message) {
        INSTANCE.sendToServer(message);
    }

    public static <MSG> void sendToPlayer(MSG message, ServerPlayer player) {
        INSTANCE.send(PacketDistributor.PLAYER.with(() -> player), message);
    }
}
```

And we also need the actual message ([`PacketGatherMana.java` on GitHub](https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/manasystem/network/PacketGatherMana.java)).
This message is sent from the client to the server and otherwise contains no data.
That's why the `toBytes()` and constructors are empty.
The `handle()` method is currently empty because we don't have the mana system yet:

```java
public class PacketGatherMana {

    public static final String MESSAGE_NO_MANA = "message.nomana";

    public PacketGatherMana() {
    }

    public PacketGatherMana(FriendlyByteBuf buf) {
    }

    public void toBytes(FriendlyByteBuf buf) {
    }

    public boolean handle(Supplier<NetworkEvent.Context> supplier) {
        NetworkEvent.Context ctx = supplier.get();
        ctx.enqueueWork(() -> {
            // Here we are server side
            ...  TODO for later
        });
        return true;
    }
}
```

We also need to register our Messages class.
Do that by calling `Messages.register()` from `ModSetup` ([ModSetup on GitHub](https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/setup/ModSetup.java)):

```java title="ModSetup.java"
public static void init(FMLCommonSetupEvent event) {
    ...
    Messages.register();
}
```

### Saved Data (ManaManager)

In this tutorial we want to keep mana in every chunk. This mana is generated randomly for every chunk so we need to store it somewhere. You could use capabilities for this but because we will already be using capabilities for attaching mana to the player we're going to use another technique for storing it in the world. Minecraft has the SavedData class that you can use for this. It's basically a way to attach arbitrary data to a level which is also going to be persisted. Here is our ManaManager class ([https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/manasystem/data/ManaManager.java ManaManager.java on GitHub]). See the comments in this class for some explanation:

:::danger Warning
SavedData is local to each level (dimension).
If you want global data it's recommended to attach it to the overworld since it's easy to access that at all times
:::

:::danger Warning
Do not forget to call `setDirty()` whenever you make a change that needs to be persisted!
:::

```java title="ManaManager.java"
public class ManaManager extends SavedData {

    // For every chunk that we visisted already we store the mana currently available. Note that this is done in a lazy way.
    // Chunks that we didn't visit will not have mana yet
    private final Map<ChunkPos, Mana> manaMap = new HashMap<>();
    private final Random random = new Random();

    // Keep a counter so that we don't send mana back to the client every tick
    private int counter = 0;

    // This function can be used to get access to the mana manager for a given level. It can only be called server-side!
    @Nonnull
    public static ManaManager get(Level level) {
        if (level.isClientSide) {
            throw new RuntimeException("Don't access this client-side!");
        }
        // Get the vanilla storage manager from the level
        DimensionDataStorage storage = ((ServerLevel)level).getDataStorage();
        // Get the mana manager if it already exists. Otherwise create a new one. Note that both
        // invocations of ManaManager::new actually refer to a different constructor. One without parameters
        // and the other with a CompoundTag parameter
        return storage.computeIfAbsent(ManaManager::new, ManaManager::new, "manamanager");
    }

    @NotNull
    private Mana getManaInternal(BlockPos pos) {
        // Get the mana at a certain chunk. If this is the first time then we fill in the manaMap using computeIfAbsent
        ChunkPos chunkPos = new ChunkPos(pos);
        return manaMap.computeIfAbsent(chunkPos, cp -> new Mana(random.nextInt(ManaConfig.CHUNK_MAX_MANA.get()) + ManaConfig.CHUNK_MIN_MANA.get()));
    }

    public int getMana(BlockPos pos) {
        Mana mana = getManaInternal(pos);
        return mana.getMana();
    }

    public int extractMana(BlockPos pos) {
        Mana mana = getManaInternal(pos);
        int present = mana.getMana();
        if (present > 0) {
            mana.setMana(present-1);
            // Do not forget to call setDirty() whenever making changes that need to be persisted!
            setDirty();
            return 1;
        } else {
            return 0;
        }
    }

    // This tick is called from a tick event (see later)
    public void tick(Level level) {
        counter--;
        // Every 10 ticks this code will synchronize the mana of each player and the mana of the current
        // chunk of that player to the client so that it can be displayed on screen
        if (counter <= 0) {
            counter = 10;
            // Synchronize the mana to the players in this world
            // todo expansion: keep the previous data that was sent to the player and only send if changed
            level.players().forEach(player -> {
                if (player instanceof ServerPlayer serverPlayer) {
                    int playerMana = serverPlayer.getCapability(PlayerManaProvider.PLAYER_MANA)
                            .map(PlayerMana::getMana)
                            .orElse(-1);
                    int chunkMana = getMana(serverPlayer.blockPosition());
                    Messages.sendToPlayer(new PacketSyncManaToClient(playerMana, chunkMana), serverPlayer);
                }
            });

            // todo expansion: here it would be possible to slowly regenerate mana in chunks
        }
    }

    // This constructor is called for a new mana manager
    public ManaManager() {
    }

    // This constructor is called when loading the mana manager from disk
    public ManaManager(CompoundTag tag) {
        ListTag list = tag.getList("mana", Tag.TAG_COMPOUND);
        for (Tag t : list) {
            CompoundTag manaTag = (CompoundTag) t;
            Mana mana = new Mana(manaTag.getInt("mana"));
            ChunkPos pos = new ChunkPos(manaTag.getInt("x"), manaTag.getInt("z"));
            manaMap.put(pos, mana);
        }
    }

    @Override
    public CompoundTag save(CompoundTag tag) {
        ListTag list = new ListTag();
        manaMap.forEach((chunkPos, mana) -> {
            CompoundTag manaTag = new CompoundTag();
            manaTag.putInt("x", chunkPos.x);
            manaTag.putInt("z", chunkPos.z);
            manaTag.putInt("mana", mana.getMana());
            list.add(manaTag);
        });
        tag.put("mana", list);
        return tag;
    }

}
</syntaxhighlight>
```
We also need this small class to hold our mana:
```
 <syntaxhighlight lang="java">
public class Mana {
    private int mana;

    public Mana(int mana) {
        this.mana = mana;
    }

    public int getMana() {
        return mana;
    }

    public void setMana(int mana) {
        this.mana = mana;
    }
}
```

#### PacketSyncManaToClient

We need a new packet to sync the mana to our clients ([`PacketSyncManaToClient.java` on GitHub] (https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/manasystem/network/PacketSyncManaToClient.java)).
This packet has two integers (the player mana and the mana from the current chunk where the player is located) so we need to actually encode and decode this data on the byte buffer.
This byte buffer is what is eventually used to send over the network:

:::danger Warning
Network packets typically need to work on two sides (client and server).
So be very careful to avoid the usage of client-only classes here (like Minecraft) as these classes don't exist on a server and can make your code break
:::

:::danger Warning
Keep network packets as small as you can as network traffic can be expensive and slow
:::

:::danger Warning
Even on single player and when the server is on the same machine as the client you need to use packets to communicate data between the two sides!
:::

```java title="PacketSyncManaToClient.java"
public class PacketSyncManaToClient {

    private final int playerMana;
    private final int chunkMana;

    public PacketSyncManaToClient(int playerMana, int chunkMana) {
        this.playerMana = playerMana;
        this.chunkMana = chunkMana;
    }

    public PacketSyncManaToClient(FriendlyByteBuf buf) {
        playerMana = buf.readInt();
        chunkMana = buf.readInt();
    }

    public void toBytes(FriendlyByteBuf buf) {
        buf.writeInt(playerMana);
        buf.writeInt(chunkMana);
    }

    public boolean handle(Supplier<NetworkEvent.Context> supplier) {
        NetworkEvent.Context ctx = supplier.get();
        ctx.enqueueWork(() -> {
            // Here we are client side.
            // Be very careful not to access client-only classes here! (like Minecraft) because
            // this packet needs to be available server-side too
            ClientManaData.set(playerMana, chunkMana);
        });
        return true;
    }
}
```

And here we keep the stored mana client-side.
Since the client only needs this data for the current player it's ok to store this in a static variable:

```java
/**
 * Class holding the data for mana client-side
 */
public class ClientManaData {

    private static int playerMana;
    private static int chunkMana;

    public static void set(int playerMana, int chunkMana) {
        ClientManaData.playerMana = playerMana;
        ClientManaData.chunkMana = chunkMana;
    }

    public static int getPlayerMana() {
        return playerMana;
    }

    public static int getChunkMana() {
        return chunkMana;
    }
}
```

And finally we need to register our new packet in Messages.java:

```java
public static void register() {
    ...
    net.messageBuilder(PacketSyncManaToClient.class, id(), NetworkDirection.PLAY_TO_CLIENT)
            .decoder(PacketSyncManaToClient::new)
            .encoder(PacketSyncManaToClient::toBytes)
            .consumer(PacketSyncManaToClient::handle)
            .add();
}
```

### Player Capability

Capabilities are a system added by Forge that allows arbitrary data to be attached to various Minecraft objects. We already saw how it was being used for forge energy and items (in episode 2). In that tutorial we were using standard capabilities defined by Forge. Here we will make our own capability to attach data to the player.

We want to store the mana that the player has gathered. For this we will define a new capability and attach it to the player. First add the PlayerMana class ([https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/manasystem/data/PlayerMana.java PlayerMana.java on GitHub]). It's basically a simple class holding a single integer but it also has code to save and load this data to NBT (which will later get added to the player through the capability system):

```java
public class PlayerMana {

    private int mana;

    public int getMana() {
        return mana;
    }

    public void setMana(int mana) {
        this.mana = mana;
    }

    public void addMana(int mana) {
        this.mana += mana;
    }

    public void copyFrom(PlayerMana source) {
        mana = source.mana;
    }


    public void saveNBTData(CompoundTag compound) {
        compound.putInt("mana", mana);
    }

    public void loadNBTData(CompoundTag compound) {
        mana = compound.getInt("mana");
    }
}
```

#### Capability Provider

Because we want this data to be stored on the player as a capability we need a capability provider ([https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/manasystem/data/PlayerManaProvider.java PlayerManaProvider.java on GitHub]):

:::danger Warning
Capabilities are not automatically synced to the client!
:::

```java
public class PlayerManaProvider implements ICapabilityProvider, INBTSerializable<CompoundTag> {

    public static Capability<PlayerMana> PLAYER_MANA = CapabilityManager.get(new CapabilityToken<>(){});

    private PlayerMana playerMana = null;
    private final LazyOptional<PlayerMana> opt = LazyOptional.of(this::createPlayerMana);

    @Nonnull
    private PlayerMana createPlayerMana() {
        if (playerMana == null) {
            playerMana = new PlayerMana();
        }
        return playerMana;
    }

    @Nonnull
    @Override
    public <T> LazyOptional<T> getCapability(@Nonnull Capability<T> cap) {
        if (cap == PLAYER_MANA) {
            return opt.cast();
        }
        return LazyOptional.empty();
    }

    @Nonnull
    @Override
    public <T> LazyOptional<T> getCapability(@Nonnull Capability<T> cap, @Nullable Direction side) {
        return getCapability(cap);
    }

    @Override
    public CompoundTag serializeNBT() {
        CompoundTag nbt = new CompoundTag();
        createPlayerMana().saveNBTData(nbt);
        return nbt;
    }

    @Override
    public void deserializeNBT(CompoundTag nbt) {
        createPlayerMana().loadNBTData(nbt);
    }
}
```

#### Capability Events

We need to register this capability which is done with `RegisterCapabilitiesEvent`.
Because we also need other events for our player capability we're going to add a new ManaEvents class ([`ManaEvents.java` on GitHub](https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/manasystem/data/ManaEvents.java)):

```java
    // Whenever a new object of some type is created the AttachCapabilitiesEvent will fire. In our case we want to know
    // when a new player arrives so that we can attach our capability here
    public static void onAttachCapabilitiesPlayer(AttachCapabilitiesEvent<Entity> event){
        if (event.getObject() instanceof Player) {
            if (!event.getObject().getCapability(PlayerManaProvider.PLAYER_MANA).isPresent()) {
                // The player does not already have this capability so we need to add the capability provider here
                event.addCapability(new ResourceLocation(TutorialV3.MODID, "playermana"), new PlayerManaProvider());
            }
        }
    }

    // When a player dies or teleports from the end capabilities are cleared. Using the PlayerEvent.Clone event
    // we can detect this and copy our capability from the old player to the new one
    public static void onPlayerCloned(PlayerEvent.Clone event) {
        if (event.isWasDeath()) {
            // We need to copyFrom the capabilities
            event.getOriginal().getCapability(PlayerManaProvider.PLAYER_MANA).ifPresent(oldStore -> {
                event.getPlayer().getCapability(PlayerManaProvider.PLAYER_MANA).ifPresent(newStore -> {
                    newStore.copyFrom(oldStore);
                });
            });
        }
    }

    // Finally we need to register our capability in a RegisterCapabilitiesEvent
    public static void onRegisterCapabilities(RegisterCapabilitiesEvent event) {
        event.register(PlayerMana.class);
    }
```

We also need to setup these events in ModSetup.
Because `ManaEvents::onAttachCapabilitiesPlayer()` is a generic event (it has a generic parameter) we need to use `addGenericListener()`:

```java title="ModSetup.java"
public static void setup() {
    ...
    bus.addGenericListener(Entity.class, ManaEvents::onAttachCapabilitiesPlayer);
    bus.addListener(ManaEvents::onPlayerCloned);
    bus.addListener(ManaEvents::onRegisterCapabilities);
}
```

### Tying Things Together

Let's fix a few things.
First we need to fix PacketGatherMana so that it actually gets mana out of the current chunk and gives it to the player ([`PacketGatherMana.java` on GitHub](https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/manasystem/network/PacketGatherMana.java)):

```java title="PacketGatherMana.java"
public boolean handle(Supplier<NetworkEvent.Context> supplier) {
    NetworkEvent.Context ctx = supplier.get();
    ctx.enqueueWork(() -> {
        // Here we are server side
        ServerPlayer player = ctx.getSender();
        // First try to extract mana from the current chunk
        int extracted = ManaManager.get(player.level).extractMana(player.blockPosition());
        if (extracted <= 0) {
            player.sendMessage(new TranslatableComponent(MESSAGE_NO_MANA).withStyle(ChatFormatting.RED), Util.NIL_UUID);
        } else {
            // Get the capability from the player and use it to add mana
            player.getCapability(PlayerManaProvider.PLAYER_MANA).ifPresent(playerMana -> {
                playerMana.addMana(extracted);
            });
        }
    });
    return true;
}
```

We also need to actually call `ManaManager.tick()` every tick for every world.
We do this in `ManaEvents`:

```java title="ManaEvents.java"
public static void onWorldTick(TickEvent.WorldTickEvent event) {
    // Don't do anything client side
    if (event.world.isClientSide) {
        return;
    }
    if (event.phase == TickEvent.Phase.START) {
        return;
    }
    // Get the mana manager for this level
    ManaManager manager = ManaManager.get(event.world);
    manager.tick(event.world);
}
```

And then we need to register this event in `ModSetup`:

```java title="ModSetup.java"
public static void setup() {
    ...
    bus.addListener(ManaEvents::onWorldTick);
}
```

Also, we want to have some configuration ([`ManaConfig.java` on GitHub](https://github.com/McJty/TutorialV3/blob/main/src/main/java/com/example/tutorialv3/manasystem/ManaConfig.java)):

```java title="ManaConfig.java"
public class ManaConfig {

    public static ForgeConfigSpec.IntValue CHUNK_MIN_MANA;
    public static ForgeConfigSpec.IntValue CHUNK_MAX_MANA;

    public static ForgeConfigSpec.IntValue MANA_HUD_X;
    public static ForgeConfigSpec.IntValue MANA_HUD_Y;
    public static ForgeConfigSpec.IntValue MANA_HUD_COLOR;

    public static void registerServerConfig(ForgeConfigSpec.Builder SERVER_BUILDER) {
        SERVER_BUILDER.comment("Settings for the mana system").push("mana");

        CHUNK_MIN_MANA = SERVER_BUILDER
                .comment("Minumum amount of mana in a chunk")
                .defineInRange("minMana", 10, 0, Integer.MAX_VALUE);
        CHUNK_MAX_MANA = SERVER_BUILDER
                .comment("Maximum amount of mana in a chunk (relative to minMana)")
                .defineInRange("maxMana", 100, 1, Integer.MAX_VALUE);

        SERVER_BUILDER.pop();
    }

    public static void registerClientConfig(ForgeConfigSpec.Builder CLIENT_BUILDER) {
        CLIENT_BUILDER.comment("Settings for the mana system").push("mana");

        MANA_HUD_X = CLIENT_BUILDER
                .comment("X location of the mana hud")
                .defineInRange("manaHudX", 10, -1, Integer.MAX_VALUE);
        MANA_HUD_Y = CLIENT_BUILDER
                .comment("Y location of the mana hud")
                .defineInRange("manaHudY", 10, -1, Integer.MAX_VALUE);
        MANA_HUD_COLOR = CLIENT_BUILDER
                .comment("Color of the mana hud")
                .defineInRange("manaHudColor", 0xffffffff, Integer.MIN_VALUE, Integer.MAX_VALUE);

        CLIENT_BUILDER.pop();
    }
```

Add the appropriate calls to Config.java.

### The HUD

We already created a system to periodically (every 10 ticks) send the current mana to each player.
Let's register a small overlay to display this information on screen:

![image](https://i.imgur.com/pLm4syY.png)

```java title="ManaOverlay.java"
public class ManaOverlay {

    public static final IIngameOverlay HUD_MANA = (gui, poseStack, partialTicks, width, height) -> {
        String toDisplay = ClientManaData.getPlayerMana() + " / " + ClientManaData.getChunkMana();
        int x = ManaConfig.MANA_HUD_X.get();
        int y = ManaConfig.MANA_HUD_Y.get();
        if (x >= 0 && y >= 0) {
            gui.getFont().draw(poseStack, toDisplay, x, y, ManaConfig.MANA_HUD_COLOR.get());
        }
    };
}
```

And then in `ClientSetup`:

```java title="ClientSetup.java"
public static void init(FMLClientSetupEvent event) {
    ...
    OverlayRegistry.registerOverlayAbove(HOTBAR_ELEMENT, "name", ManaOverlay.HUD_MANA);
}
```

![image](https://i.imgur.com/o7hgFpp.png)

```java title="ManaOverlay.java"
public class ManaOverlay {

    public static final IGuiOverlay HUD_MANA = (gui, poseStack, partialTicks, width, height) -> {
        String toDisplay = ClientManaData.getPlayerMana() + " / " + ClientManaData.getChunkMana();
        int x = ManaConfig.MANA_HUD_X.get();
        int y = ManaConfig.MANA_HUD_Y.get();
        if (x >= 0 && y >= 0) {
            gui.getFont().draw(poseStack, toDisplay, x, y, ManaConfig.MANA_HUD_COLOR.get());
        }
    };
}
```

And then in `ClientSetup`:

```java title="ClientSetup.java"
@SubscribeEvent
public static void onRegisterOverlays(RegisterGuiOverlaysEvent event) {
    event.registerAbove(VanillaGuiOverlay.HOTBAR.id(), "mana_overlay", ManaOverlay.HUD_MANA);
}
```
