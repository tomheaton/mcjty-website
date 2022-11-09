This document talks about simple networking as well as key handling. In this example we are going to listen to a key press on the client side ('t') and then send a packet to the server so that the server can do some processing on it.

The official Forge documentation has more detailed information on networking as well: https://mcforge.readthedocs.io/en/latest/networking/

First we need to register our key bindings. This can be done like this. This code basically registers a new key and assigns it to 't' by default. The player can change this in the controls configuration:
```
<syntaxhighlight lang="java">
@SideOnly(Side.CLIENT)
public class KeyBindings {

    public static KeyBinding tutorialKey;

    public static void init() {
        tutorialKey = new KeyBinding("key.tutorial", Keyboard.KEY_T, "key.categories.modtut");
        ClientRegistry.registerKeyBinding(tutorialKey);
    }
}
</syntaxhighlight>
```
You also need to tell the system what should happen in case the player presses that key. That can be done as follows. Basically this class is an event handler that listens to the 'KeyInputEvent'. This is called client-side. Since we want to do our key handling server side the only thing we do here is to send a packet to the server. More on this in the second half of this tutorial:
```
<syntaxhighlight lang="java">
public class InputHandler {

    @SubscribeEvent
    public void onKeyInput(InputEvent.KeyInputEvent event) {
        if (KeyBindings.tutorialKey.isPressed()) {
            // Someone pressed our tutorialKey. We send a message
            PacketHandler.INSTANCE.sendToServer(new PacketSendKey());
        }
    }
}
</syntaxhighlight>
```
These two classes don't do anything yet. To make them actually work you need to add some things to the ClientProxy:
```
<syntaxhighlight lang="java">
        @Override
        public void init(FMLInitializationEvent e) {
            super.init(e);

            // Initialize our input handler so we can listen to keys
            MinecraftForge.EVENT_BUS.register(new InputHandler());
            KeyBindings.init();

            ...
        }
</syntaxhighlight>
```
Now we need to do is to add the actual packet implementation. There are actually two classes that you have to make. One is the actual message (this is created on the client and then sent to the server) and the other is the message handler (which is called on the server). It is recommended that you actually make two different classes. One way to make this easy to manage is to make the handler an inner static class of the message like what is done here. Note about the special warning with regards to networking and threads. Also note how with networking you have to be careful about abuse. In this case we check if the chunk is actually loaded to prevent a client from (accidently or not) overloading a server:
```
<syntaxhighlight lang="java">
public class PacketSendKey implements IMessage {
    private BlockPos blockPos;

    @Override
    public void fromBytes(ByteBuf buf) {
        // Encoding the position as a long is more efficient
        blockPos = BlockPos.fromLong(buf.readLong());
    }

    @Override
    public void toBytes(ByteBuf buf) {
        // Encoding the position as a long is more efficient
        buf.writeLong(blockPos.toLong());
    }

    public PacketSendKey() {
        // Calculate the position of the block we are looking at
        MovingObjectPosition mouseOver = Minecraft.getMinecraft().objectMouseOver;
        blockPos = mouseOver.getBlockPos();
    }

    public static class Handler implements IMessageHandler<PacketSendKey, IMessage> {
        @Override
        public IMessage onMessage(PacketSendKey message, MessageContext ctx) {
            // Always use a construct like this to actually handle your message. This ensures that
            // your 'handle' code is run on the main Minecraft thread. 'onMessage' itself
            // is called on the networking thread so it is not safe to do a lot of things
            // here.
            FMLCommonHandler.instance().getWorldThread(ctx.netHandler).addScheduledTask(() -> handle(message, ctx));
            return null;
        }

        private void handle(PacketSendKey message, MessageContext ctx) {
            // This code is run on the server side. So you can do server-side calculations here
            EntityPlayerMP playerEntity = ctx.getServerHandler().player;
            World world = playerEntity.getEntityWorld();
            // Check if the block (chunk) is loaded to prevent abuse from a client
            // trying to overload a server by randomly loading chunks
            if (world.isBlockLoaded(message.blockPos)) {
                Block block = world.getBlockState(message.blockPos).getBlock();
                // Note: if this is a real message you want to show to a player and not a debug message you should
                // use localized messages with TextComponentTranslated.
                playerEntity.sendStatusMessage(new TextComponentString(TextFormatting.GREEN + "Hit block: " + block.getRegistryName()), false);
            }
        }
    }
}
</syntaxhighlight>
```
Finally we need to setup our packet handler so that we can actually send a packet from the client to the server. First we make a new 'PacketHandler' class. In this class we will register all the packets that we need (currently just one) and specify if they should go from server to client or from client to server. In this example we only need a packet to go from client to server:
```
<syntaxhighlight lang="java">
public class PacketHandler {
    private static int packetId = 0;

    public static SimpleNetworkWrapper INSTANCE = null;

    public PacketHandler() {
    }

    public static int nextID() {
        return packetId++;
    }

    public static void registerMessages(String channelName) {
        INSTANCE = NetworkRegistry.INSTANCE.newSimpleChannel(channelName);
        registerMessages();
    }

    public static void registerMessages() {
        // Register messages which are sent from the client to the server here:
        INSTANCE.registerMessage(PacketSendKey.Handler.class, PacketSendKey.class, nextID(), Side.SERVER);
    }
}
</syntaxhighlight>
```
To make this actually work you have to extend the preInit() method in your CommonProxy:
```
<syntaxhighlight lang="java">
        public void preInit(FMLPreInitializationEvent e) {
            // Initialize our packet handler. Make sure the name is
            // 20 characters or less!
            PacketHandler.registerMessages("modtut");

            ...
        }
</syntaxhighlight>
```

Now if you try this you should be able to press 't' in game to get the registry name of the block that you are looking at.
