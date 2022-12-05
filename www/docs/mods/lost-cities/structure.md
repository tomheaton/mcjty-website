# Basic Structure

## Basic Structure

### Heights

The city generator works with heights that are a multiple of 6.
Every floor of a building is 6 high and subways and highways are also at a multiple of this height.
This makes it easier to make connections between buildings and fit streets better to highways and rail stations.
Buildings always generate at city levels 0 to 4 and the subway system is at level -3.
By default, level 0 corresponds to height 71.

### Chunks

During chunk generation there are currently three types of chunks as seen from the generation algorithm:

* A normal world chunk: here you get normal worldgen (from vanilla). However, there are still a few modifications that can occur even in normal chunks:
  ** Railways and highways generate overlayed on normal chunks
  ** Explosions in nearby city chunks can also cause damage to normal worldgen
  ** Edges of normal chunks are sometimes lowered or raised to fit better with city chunks
* A city chunk containing a building.
* A city chunk not containing a building. This is called a 'street' chunk

### Generating a normal chunk

Here all steps are explained for building a normal chunk:

* First the regular chunk generator is done. This generates the basic shape of the landscape (without foliage, dirt, and so on)
* If needed the borders of this chunk are flattened to fit better with adjacent city chunks. This can mean lowering or raising them
* Normal bridges are generated if applicable
* Highways are generated if applicable
* Subways are generated if applicable
* Subway dungeons are generated if applicable
* If this chunk is affected by explosions damage calculations are done
* If a nearby chunk has a building that is damaged by explosions debris from that building is scattered on this chunk

### Generating a street chunk

When building a street chunk the following steps are done:

* First the chunk gets filled with stone upto the current city level (multiple of 6)
* Street, park, and fountain parts are generated
* Corridors (hallways that go understreets and connect buildings underground) are generated if needed
* If there is an adjacent building it is possible that a 'building decoration' part is generated
* The 'border' is generated. This is a stone wall that you can see at the edge of cities or at the edge of street sections that are higher then adjacent street chunks
* If enabled the ruin generator will be used
* Stairs are generated
* Highways are generated
* If enabled the 'rubble' layer is generated. This adds a layer of stone (later dirt/sand) on the streets and optionally also a layer of leave blocks
* Subways are generated if applicable
* Subway dungeons are generated if applicable
* If this chunk is affected by explosions damage calculations are done
* If a nearby chunk has a building that is damaged by explosions debris from that building is scattered on this chunk

### Generating a building chunk

When building a building chunk the following steps are done:

* First the chunk gets filled with stone upto the current city level (multiple of 6) minus the lowest cellar level
* Then every floor of the building is generated
* Doorways are made to adjacent buildings or streets. If the doorway goes outside actual doors are placed, otherwise just air
* The outside walls of building floors that are underground will be converted to the 'stone' block of the building (i.e. replace the glass there)
* If there are adjacent corridors connections are made
* If enabled the ruin generator will be used
* Highways are generated (even if there is a building there can be a highway going under the building in a tunnel)
* If enabled the 'rubble' layer is generated. This adds a layer of stone (later dirt/sand) on the streets and optionally also a layer of leave blocks
* Subways are generated if applicable
* Subway dungeons are generated if applicable
* If this chunk is affected by explosions damage calculations are done
* If a nearby chunk has a building that is damaged by explosions debris from that building is scattered on this chunk

### Highways

There are two kinds of highways: horizontal (along the X axis) and vertical (along the Z axis).
For both directions, highways can only be generated on coordinates that are multiples of eight.
This is both for efficiency reasons and avoiding the generation of highways too close to each other.

So how does the mod decide if there is a highway (for either direction) at a certain chunk and how does it then decide how high that highway is?
Here are the steps that are used. This explanation is for a horizontal highway but the same algorithm is used for a vertical highway:

![Horizontal Highways](https://i.imgur.com/nafGwko.png)

* First the chunk coordinate is checked to see if it is a multiple of eight. If not then it cannot contain a highway (for that direction)
* A 2D perlin noise function is used which is sampled with a bigger scale vertically (so that nearby adjacent highways are less likely). If the value of the noise function (given the x,z coordinate of the chunk) is above a certain thresshold then this chunk is a candidate for a highway (not certain yet). Otherwise it cannot contain a highway. The image above shows how such a scaled perlin noise function would look and where we find areas dark enough (assuming dark is higher) for a highway.
* Given that this chunk is a candidate for a highway we scan all chunks left of this one to find the first chunk of a horizontal row of chunks that is still part of this highway (i.e. for which the perlin noise function is still high)
* Then we do the same on the right side to find the last chunk
* Both chunks now form the theoretical boundary of the entire highway
* Depending on settings we now check if there are cities on both sides or at least on one side. If there are not enough cities then this entire highway is discarded and no highway is generated
* If the conditions are valid we still check if the highway has at least 5 chunks. If not we don't generate a highway either
* At this point we are certain there is a highway. We now have to check how high it is. Depending on configuration we use the height of one or both of the cities (at the start and end chunk) to calculate the total height

### Subways

Subways are based on a grid of stations that occur every 10 chunks.
The reason 10 is chosen and not 8 (like for highways) is that this way subways are not always same distance from highways.
Subways are much more regular than highways and always form a worldwide repeating grid like this:

![Subway grid](https://i.imgur.com/GVH6elZ.png)

Every red square is a candidate for a station.
A station can only form if there is a city at that spot.
If there is no city then the station will be replaced with a horizontal railway part so that the subway continues there.
Stations in the grid can have one, two, or three tracks, but they all use the same part from the assets.
The unused tracks are (at runtime) replaced with the subway building block.

Note that there is an option to close off/remove subway sections if there are no stations nearby.
This is used in the 'rarecities' profile. With that option enabled the grid as seen in the picture above will have gaps and removed parts.

The entire subway grid is at level -3 (remember that the lowest city level for buildings is 0).
Stations can be either underground in which case it will also be at level -3 or on the surface (at city level).
A station on the surface is only possible if the city is not too high because the chunks adjacent to the station are needed to go down to level -3 and per chunk we can go down two levels.

The entire formation of every chunk in the subway system is based on the key station chunks.
All subway chunks are generated based on the nearest of them.
For example, if a station has three tracks then the adjacent horizontal chunks will also have three tracks.
If the station chunk is at level 0 then the first chunk adjacent to the station will bring the tracks down one level and the next chunk will bring it down two levels so that it ends up at -3 again.
