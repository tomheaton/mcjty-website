# 7.00 Changelog WIP

## Things you can do with the new blocks

* Scan an area of the world or one of your buildings and build it again in another world
* Make a scaled down projection of the world to look cool in your base or find structures
* Show beacons and markers on that projection to find entities and locate machines that are low on energy
* Build geometrical shapes in other orientations (like a 90 degree rotated torus)
* Build combinations of geometrical shapes with various materials
* Make a daily scan of your base and save all the scans for your personal 'base building museum'
* Build your own island by first scanning a mountain. Then scanning another mountain and then combining both scans in the Composer (one scan flipped upside down). Finally, intersect it with a cylinder to get a cylindrical shaped island. Use the Builder to build it
* You can use the scanner and void out things like stone, dirt, gravel, ... so you can more easily find ores and other important features in the landscape
* Use the composer to build a cool looking geometrical shape (use mimic blocks in the composer to make parts colored) and then use the projector (set to auto-rotate) to show off in your base
* Use the scanner to scan a building and then use the shield to fool other players on your world into thinking you got a building somewhere
* Using the scanner, the locator and projector you can always know when other players are close to your base!
* Lost your sheep you called 'Alfred'? Don't worry. With the scanner, the locator and a projector you will be able to find them again

## Changes from alpha1 to alpha2

* The powercell statistics are now long instead of int to prevent overflow
* Changed the scanner to use power, have a redstone mode and a 'scan' button instead of a locked toggle
* The Builder now has redstone mode control
* Fixed an issue with TOP showing the wrong mining level on the Builder
* There is now a 'restart' button in the gui of the builder to restart the scan for the Builder
* Building from a scanned area will correctly copy meta when appropriate
* New Projector block. More detailed information below
* Changed where 'scan' data is stored. They are now stored in the world save folder in the 'rftoolsscans' folder
* This also means that shapecards are no longer linked to scanners but instead directly refer to that ID. The scanner also refers to that ID. Additionally, this means that the scanner no longer has to be chunkloaded (or even exist) for a scan card to work
* Added 'rftshape listscans' command to list all available scans and their ids

## 7.00 Complete Changelog

This is a Work In Progress changelog for RFTools 7.00 for as long as it is in alpha.
It also explains how the new shape system works until there is proper in-game documentation.

* Elevator fixes:
    * Fixed elevator button modules sometimes not calculating the right floor for the last column of floors
    * The elevator can no longer move bedrock blocks or blocks that it is not allowed to break
    * Made the screen guis a bit more compact so that the elevator module's gui fits nicely
* Shield changes:
    * It is now again possible to have the shield mimic other blocks (like in 1.7.10)
    * Fixed a bug where removing a shield block would leave most of the template blocks formed as shield blocks.
* Builder changes:
    * Everything related to the Builder, Shields and all the new shape card related blocks is now documented in a new manual (Shape Manual)
    * Added redstone mode control (no longer needed to bring a lever)
    * There is now a 'restart' button in the gui of the builder to restart the scan for the Builder
    * New feature for the Builder to place liquids in the world (new type of shapecard). Needs a tank on top or below the builder to work
* Shape card changes:
    * New 'heart' form for shapecards (useful for Shield and Builder)
    * New 'cone' form for shapecards
    * The shapecard gui now shows a preview of the shapecard (same as the Composer and Scanner do). If the previewed area is bigger than 256x256x256 then this preview will not work due to performance reasons.
    * If you have a shapecard in your hand you can save the contents to a file using `/rftshape save <filename>`. Note that this will save the actual resulting data to the file. That means that if you save a primitive shape (like a box or torus) the end result will be the actual generated data. That means that if you load it again you will get a shapecard of type 'Scan' as if it came from a scanner. Similarly, for a composed shapecard. Saving that will not save the actual formulas being used but only the end result.
    * If you have a shapecard in your hand you can load the contents to a file using `/rftshape load <filename>`. This will result in a shapecard of type 'Scan'. Because of that you can only use this command if the shapecard in your hand is already linked to a Scanner. So to use this. Place a Scanner, insert a shapecard in it. Then remove that shapecard and load your data. The Scanner is automatically locked and will have the data.
* Major new features:
    * New 'scanner' block. With this block you can scan an area in the world and put the result in a shapecard. The scanner data is stored in the world/rftoolsscans folder. Note that a scanner gets an ID so only that scanner will be able to modify that scan. That's important if you want to change the scanned data for shapecards linked to that scan id. Note that a scan can take a while. Especially on big areas but progress is not remembered! Make sure the scanner tile entity doesn't get unloaded, or it will have to start over!
    * Added 'rftshape listscans' command to list all available scans and their ids
    * New 'composer' block. With this block you can compose more complex shapes out of other shapecards. In contrast with the Scanner the composer does not need to remain for the composed shapecard to work. However, keep in mind that you cannot edit a composed shapecard unless you have the composer with the child shapecards still present! The composer can also work with shapecards containing a scan of an area (from the Scanner)
    * New 'projector' block. This block can project shapecards directly above it. It has various controls to scale and rotate this projection. It also has a 'grayscale' mode. This is useful in combination with the Locator as the colored beacons and markers are easier to see that way
    * New 'locator' block. Place this block on top of a scanner and then projectors projecting that scan will be able to show various information found by the Locator. The Locator can find passive mobs, hostile mobs, players (with or without name and nametags). In addition, it can also find blocks that are low or high on energy. Note that looking for energy blocks only works for maximum 5x5 chunks as it is too expensive to calculate otherwise. The projector can show these markers as icons or with beacons. The color can be configured in the Locator
    * New 'modifier' item. This item can be used to modify the end result of the scanner by discarding some types of blocks or changing some types of blocks into other types. The modifier also supports the storage filter item
    * Using the Composer and Scanner it is possible that shapecards also contain block information (the Scanner will collect that block information from the world, possibly modified with a Modifier item, while the Composer has the ability to force shapes into using a certain block). The Shield and Builder will respect that block choice if possible. For the Shield you have to set the shield to 'mimic' mode for this to work. For the Builder you need the right materials in the inventory on top or below it.
* Various:
    * The powercell statistics are now long instead of int to prevent overflow
    * In the storage scanner UI it is now possible to search for @mod and multiple words
    * Changed the default config so that that dimensional shards spawn in the nether and end even if RFTools dimensions is present

## Documentation

The Scanner. With the Scanner you can scan an area of the world. The GUI looks like this:

![image](https://i.imgur.com/dJbWdwh.png)

At the top there are three slots. The first slot is for a shapecard and is currently only used to determine the size of the scanned area. Without a shapecard there the scanner will not work! Note that currently it only uses the dimensions from that card. Nothing else. In the future the shapecard data will be used as a first filter to scan. For example, if you want your scanned result to be spherical you will be able to use a sphere shapecard. For that reason you should use 'solid box' shapecards (for future compatibility).

The second slot is for a simple item filter. Only blocks matching that filter will be in the resulting scan.

The third slot is for a modifier item. This is a more advanced filter that can also allow you to replace blocks in the scan with other blocks. Using this you can (for example) void all stone and highlight a specific ore you want to look for. Like is done in the scan above. Here you can see the GUI of the Modifier item to produce the above scan:

![image](https://i.imgur.com/7ehp12k.png)

At the bottom of the GUI is the output slot. If you place a shapecard there it will be filled with the resulting scan data. Note that this is a dynamic link. If you later do a new scan the data in that shapecard will also update.

The Composer. With the Composer you can combine multiple shapecards into a new more complex shapecard. The GUI looks like this:

![image](https://i.imgur.com/olz6OkU.png)

In contrast with the Scanner you have to put a destination shapecard in the bottom slot to start with and give it the correct dimensions. The rest of the shapecard parameters don't matter. They will be filled by the composer. Once you have done that you can start putting other shapecards in the right slots to combine them. In this example the first shapecard is a scan produced by a scanner. Because such a scan results in a solid world we have marked it as hollow. However, even a hollowed out shapecard still has the outer box. We want to see the caves and ravines, so we have to remove that outer box by subtracting a hollow box. This is the second shapecard. Then we also add two random shapes to the result for fun.

The Projector. With the Projector you can project a shapecard into the world. Here is the GUI:

![image](https://i.imgur.com/sUmZ5il.png)

Just under the shapecard slot (this is what is going to be projected) there are various sliders and buttons to control how the projection should look like. At the left there are four colored areas. These are redstone controls for each side of the projector (which is similarly colored). The left operation in every such box is what happens if redstone is on at that side. The right operation is what happens if redstone is off. By default, the south side is configured to be on in both cases to make sure that by default the projector works. However, there are various other operations that you can use to animate rotation, offset, scale and so on.
