---
sidebar_position: 4
---

# Episode 4

## Links

* [Video](todo)
* [Back to 1.20 Tutorial Index](./1.20.md)
* [Tutorial GitHub](https://github.com/McJty/Tut4_3Power)
* [Tag for this episode](todo)

## Introduction

In this tutorial we start with a fresh new mod. So nothing from the previous tutorials is needed.
The basic idea in this tutorial is that we are going to make a full working tech mod with power
generation, power transmition, and little bots (entities) that can do things for us if they
are charged up. This first episode only focuses on the power generation and the first block
that uses that power.

* Forge Power
* Animated texture
* Custom creative tab

## The Power Generator

The power generator is a block that will generate Forge Energy (FE) given some fuel (a
burnable item). The block will have a GUI that shows the current energy level and it also
has an item slot where you can put in fuel. The front of the generator will show when it's
generating power.

### Block

Let's start with the block. This is very similar to the block we made in the previous tutorial.
The main difference is that we support two properties (FACING and POWERED). The FACING property
is set when the player places the block based on where the player is looking.

![processor](../assets/tutorials/powergen.png)

```java
public class GeneratorBlock extends Block implements EntityBlock {

    public static final String SCREEN_TUTORIAL_GENERATOR = "tutorial.screen.generator";

    public GeneratorBlock() {
        super(BlockBehaviour.Properties.of()
                .strength(3.5F)
                .requiresCorrectToolForDrops()
                .sound(SoundType.METAL));
    }

    @Nullable
    @Override
    public BlockEntity newBlockEntity(BlockPos blockPos, BlockState blockState) {
        return new GeneratorBlockEntity(blockPos, blockState);
    }

    @Nullable
    @Override
    public <T extends BlockEntity> BlockEntityTicker<T> getTicker(Level level, BlockState state, BlockEntityType<T> type) {
        if (level.isClientSide) {
            return null;
        } else {
            return (lvl, pos, st, be) -> {
                if (be instanceof GeneratorBlockEntity generator) {
                    generator.tickServer();
                }
            };
        }
    }

    @Override
    public InteractionResult use(BlockState state, Level level, BlockPos pos, Player player, InteractionHand hand, BlockHitResult trace) {
        if (!level.isClientSide) {
            BlockEntity be = level.getBlockEntity(pos);
            if (be instanceof GeneratorBlockEntity) {
                MenuProvider containerProvider = new MenuProvider() {
                    @Override
                    public Component getDisplayName() {
                        return Component.translatable(SCREEN_TUTORIAL_GENERATOR);
                    }

                    @Override
                    public AbstractContainerMenu createMenu(int windowId, Inventory playerInventory, Player playerEntity) {
                        return new GeneratorContainer(windowId, playerEntity, pos);
                    }
                };
                NetworkHooks.openScreen((ServerPlayer) player, containerProvider, be.getBlockPos());
            } else {
                throw new IllegalStateException("Our named container provider is missing!");
            }
        }
        return InteractionResult.SUCCESS;
    }

    @Nullable
    @Override
    public BlockState getStateForPlacement(BlockPlaceContext context) {
        return this.defaultBlockState()
                .setValue(BlockStateProperties.FACING, context.getNearestLookingDirection().getOpposite())
                .setValue(BlockStateProperties.POWERED, false);
    }

    @Override
    protected void createBlockStateDefinition(StateDefinition.Builder<Block, BlockState> builder) {
        super.createBlockStateDefinition(builder);
        builder.add(BlockStateProperties.POWERED, BlockStateProperties.FACING);
    }
}
```

### BlockEntity

The block entity takes care of actually generating power when it has fuel.

