---
sidebar_position: 5
---

# Episode 5

Back: [Index](./1.14-1.15-1.16.md)

### Fixing our container

The container as it was left in the last episode has a problem. If you shift-click items it will crash Minecraft. So solve this you need to implement the transferStackInSlot method:
```java
public class FirstBlockContainer extends Container {

    ...

    @Override
    public ItemStack transferStackInSlot(PlayerEntity playerIn, int index) {
        ItemStack itemstack = ItemStack.EMPTY;
        Slot slot = this.inventorySlots.get(index);
        if (slot != null && slot.getHasStack()) {
            ItemStack stack = slot.getStack();
            itemstack = stack.copy();
            if (index == 0) {
                if (!this.mergeItemStack(stack, 1, 37, true)) {
                    return ItemStack.EMPTY;
                }
                slot.onSlotChange(stack, itemstack);
            } else {
                if (stack.getItem() == Items.DIAMOND) {
                    if (!this.mergeItemStack(stack, 0, 1, false)) {
                        return ItemStack.EMPTY;
                    }
                } else if (index < 28) {
                    if (!this.mergeItemStack(stack, 28, 37, false)) {
                        return ItemStack.EMPTY;
                    }
                } else if (index < 37 && !this.mergeItemStack(stack, 1, 28, false)) {
                    return ItemStack.EMPTY;
                }
            }

            if (stack.isEmpty()) {
                slot.putStack(ItemStack.EMPTY);
            } else {
                slot.onSlotChanged();
            }

            if (stack.getCount() == itemstack.getCount()) {
                return ItemStack.EMPTY;
            }

            slot.onTake(playerIn, stack);
        }

        return itemstack;
    }


    ...
}
```
This function is responsible for transfering items when the player shift-clicks them. It gets the index of the clicked slot. Remember that these indices are indices in the container. So in our case that means that index 0 is the inventory slot of our tile entity while the rest are player slots. The logic in this method will transfer the stack to another location depending on what it is (diamond or not) and where it is.

### Loot table improvement

When we currently break our block the contents is lost. To fix that we extend our loot table as follows (inspiration taken from the shulkerbox):
```json
{
  "type": "minecraft:block",
  "pools": [
    {
      "name": "pool1",
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "functions": [
            {
              "function": "minecraft:copy_name",
              "source": "block_entity"
            },
            {
              "function": "minecraft:copy_nbt",
              "source": "block_entity",
              "ops": [
                {
                  "source": "inv",
                  "target": "BlockEntityTag.inv",
                  "op": "replace"
                },
                {
                  "source": "energy",
                  "target": "BlockEntityTag.energy",
                  "op": "replace"
                }
              ]
            },
            {
              "function": "minecraft:set_contents",
              "entries": [
                {
                  "type": "minecraft:dynamic",
                  "name": "minecraft:contents"
                }
              ]
            }
          ],
          "name": "mytutorial:firstblock"
        }
      ],
      "conditions": [
        {
          "condition": "minecraft:survives_explosion"
        }
      ]
    }
  ]
}
```
Basically we add some functions to copy the NBT from the tile entity to the dropped item. The NBT tags we want to copy are 'inv' (our inventory) and 'energy' (our future energy tag).

### Adding Energy Capability

First we add a new class which will be our energy storage implementation. It is basically a subclass of the Forge provided EnergyStorage:
```java
public class CustomEnergyStorage extends EnergyStorage implements INBTSerializable<CompoundNBT> {

    public CustomEnergyStorage(int capacity, int maxTransfer) {
        super(capacity, maxTransfer);
    }

    public void setEnergy(int energy) {
        this.energy = energy;
    }

    public void addEnergy(int energy) {
        this.energy += energy;
        if (this.energy > getMaxEnergyStored()) {
            this.energy = getEnergyStored();
        }
    }

    @Override
    public CompoundNBT serializeNBT() {
        CompoundNBT tag = new CompoundNBT();
        tag.putInt("energy", getEnergyStored());
        return tag;
    }

    @Override
    public void deserializeNBT(CompoundNBT nbt) {
        setEnergy(nbt.getInt("energy"));
    }
}
```
This class also implements INBTSerializable so that we can use it the same way as our item handler that we're already using.

In FirstBlockTile we need to make the following adjustments:
```java
public class FirstBlockTile extends TileEntity implements ITickableTileEntity, INamedContainerProvider {

    private LazyOptional<IItemHandler> handler = LazyOptional.of(this::createHandler);
    private LazyOptional<IEnergyStorage> energy = LazyOptional.of(this::createEnergy);

    ...

    @Override
    public void read(CompoundNBT tag) {
        CompoundNBT invTag = tag.getCompound("inv");
        handler.ifPresent(h -> ((INBTSerializable<CompoundNBT>)h).deserializeNBT(invTag));
        CompoundNBT energyTag = tag.getCompound("energy");
        energy.ifPresent(h -> ((INBTSerializable<CompoundNBT>)h).deserializeNBT(energyTag));
        super.read(tag);
    }

    @Override
    public CompoundNBT write(CompoundNBT tag) {
        handler.ifPresent(h -> {
            CompoundNBT compound = ((INBTSerializable<CompoundNBT>)h).serializeNBT();
            tag.put("inv", compound);
        });
        energy.ifPresent(h -> {
            CompoundNBT compound = ((INBTSerializable<CompoundNBT>)h).serializeNBT();
            tag.put("energy", compound);
        });
        return super.write(tag);
    }

    ...

    private IEnergyStorage createEnergy() {
        return new CustomEnergyStorage(100000, 0);
    }

    @Nonnull
    @Override
    public <T> LazyOptional<T> getCapability(@Nonnull Capability<T> cap, @Nullable Direction side) {
        if (cap == CapabilityItemHandler.ITEM_HANDLER_CAPABILITY) {
            return handler.cast();
        }
        if (cap == CapabilityEnergy.ENERGY) {
            return energy.cast();
        }
        return super.getCapability(cap, side);
    }

    ...
}
```
So basically we add a new LazyOptional for our energy storage. All the code is similar to the code we already have for our item handler.

To actually produce power we need to make the following adjustments to our tile entity:
```java
public class FirstBlockTile extends TileEntity implements ITickableTileEntity, INamedContainerProvider {

    ...

    private int counter;

    ...

    @Override
    public void tick() {
        if (counter > 0) {
            counter--;
            if (counter <= 0) {
                energy.ifPresent(e -> ((CustomEnergyStorage)e).addEnergy(1000));
            }
        } else {
            handler.ifPresent(h -> {
                ItemStack stack = h.getStackInSlot(0);
                if (stack.getItem() == Items.DIAMOND) {
                    h.extractItem(0, 1, false);
                    counter = 20;
                }
            });
        }
    }

    @Override
    public void read(CompoundNBT tag) {
        ...
        counter = tag.getInt("counter");
        super.read(tag);
    }

    @Override
    public CompoundNBT write(CompoundNBT tag) {
        ...
        tag.putInt("counter", counter);
        return super.write(tag);
    }


    ...

}
```
So if counter is equal to zero we are doing nothing. In that case we check if there is a diamond to consume. If so we consume it and set the counter to 20 (1 second). If the counter > 0 then we decrease it until we reach 0. At that point we produce energy.


### Showing energy in GUI

To show the energy in the GUI we need to communicate this from server to client. The easiest way to do that is through the container. Edit FirstBlockContainer as follows:
```java
public class FirstBlockContainer extends Container {

    ...

    public FirstBlockContainer(int windowId, World world, BlockPos pos, PlayerInventory playerInventory, PlayerEntity player) {

        ...

        trackInt(new IntReferenceHolder() {
            @Override
            public int get() {
                return getEnergy();
            }

            @Override
            public void set(int value) {
                tileEntity.getCapability(CapabilityEnergy.ENERGY).ifPresent(h -> ((CustomEnergyStorage)h).setEnergy(value));
            }
        });
    }

    public int getEnergy() {
        return tileEntity.getCapability(CapabilityEnergy.ENERGY).map(IEnergyStorage::getEnergyStored).orElse(0);
    }

    ...
}
```
This is using a function that hasn't been correctly mapped yet at this stage. Basically it registers a way to get and set an integer, and it will also keep track of changes so that any changes are property communicated to the client.

Then we can show this information in our GUI. Modify FirstBlockScreen as follows:
```java
public class FirstBlockScreen extends ContainerScreen<FirstBlockContainer> {

    ...

    @Override
    protected void drawGuiContainerForegroundLayer(int mouseX, int mouseY) {
        drawString(Minecraft.getInstance().fontRenderer, "Energy: " + container.getEnergy(), 10, 10, 0xffffff);
    }

    ...
}

```
And that's it. The container handles communication of the energy value automatically, so we don't have to do anything else.
