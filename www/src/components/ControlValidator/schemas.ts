import z from "zod";

const mcid = z.string().regex(/^[a-z0-9_]+:[a-z0-9_]+/);
const modid = z.string().regex(/^[a-z0-9_]+/);

const expression = z.string().refine((v) => {
  const val = v.toLowerCase();
  if (!val.endsWith(")")) return false;
  if (val.startsWith("range(")) {
    const range = val.slice(6, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 2 && range[0] <= range[1];
  }
  if (val.startsWith("outsiderange(")) {
    const range = val.slice(13, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 2 && range[0] <= range[1];
  }
  if (val.startsWith("greater(")) {
    const range = val.slice(8, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("gt(")) {
    const range = val.slice(3, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("smaller(")) {
    const range = val.slice(8, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("lt(")) {
    const range = val.slice(3, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("greaterorequal(")) {
    const range = val.slice(15, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("ge(")) {
    const range = val.slice(3, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("smallerorequal(")) {
    const range = val.slice(15, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("le(")) {
    const range = val.slice(3, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("equal(")) {
    const range = val.slice(6, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("eq(")) {
    const range = val.slice(3, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("notequal(")) {
    const range = val.slice(9, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("ne(")) {
    const range = val.slice(3, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("repeat(")) {
    const range = val.slice(7, -1).split(",").map((v) => parseInt(v.trim()));
    return range.length === 3;
  }
}, "Invalid range expression");

const blockSchema = z.object({
  tag: z.optional(mcid),
  block: z.optional(mcid),
  mod: z.optional(modid),
  energy: z.optional(z.string()),
  contains: z.optional(z.string()),
  side: z.optional(z.enum(["up", "down", "north", "south", "east", "west"])),
}).or(z.string());

export const generalSpawnKeywords = z.object({
  result: z.enum(["default", "allow", "deny"]),
  continue: z.optional(z.boolean()),
  phase: z.optional(z.string()),
  random: z.optional(z.number().gte(0).lte(1)),

  mob: z.optional(mcid.or(z.array(mcid))),
  mod: z.optional(modid.or(z.array(modid))),
  dimension: z.optional(mcid.or(z.array(mcid))),
  dimensionmod: z.optional(modid.or(z.array(modid))),

  hostile: z.optional(z.boolean()),
  passive: z.optional(z.boolean()),
  baby: z.optional(z.boolean()),
  canspawnhere: z.optional(z.boolean()),
  notcolliding: z.optional(z.boolean()),
  spawner: z.optional(z.boolean()),
  incontrol: z.optional(z.boolean()),
  seesky: z.optional(z.boolean()),
  slime: z.optional(z.boolean()),
  nodespawn: z.optional(z.boolean()),

  height: z.optional(expression),
  minheight: z.optional(z.number().int()),
  maxheight: z.optional(z.number().int()),

  time: z.optional(expression),
  mintime: z.optional(z.number().int()),
  maxtime: z.optional(z.number().int()),

  daycount: z.optional(expression),
  mindaycount: z.optional(z.number().int()),
  maxdaycount: z.optional(z.number().int()),

  light: z.optional(expression),
  minlight: z.optional(z.number().int()),
  maxlight: z.optional(z.number().int()),
  minlight_full: z.optional(z.number().int()),
  maxlight_full: z.optional(z.number().int()),

  weather: z.optional(z.enum(["rain", "thunder"])),
  difficulty: z.optional(z.enum(["peaceful", "easy", "normal", "hard"])),

  biome: z.optional(mcid.or(z.array(mcid))),
  biometags: z.optional(mcid.or(z.array(mcid))),
  biometype: z.optional(z.enum(["desert", "desert_legacy", "warm", "cool", "icy"])),

  minspawndist: z.optional(z.number()),
  maxspawndist: z.optional(z.number()),

  mindifficulty: z.optional(z.number()),
  maxdifficulty: z.optional(z.number()),

  block: z.optional(blockSchema.or(z.array(blockSchema))),
  blockoffset: z.optional(z.object({})),  // @TODO: add schema

  armorhelmet: z.optional(mcid.or(z.array(mcid))),
  armorchest: z.optional(mcid.or(z.array(mcid))),
  armorlegs: z.optional(mcid.or(z.array(mcid))),
  armorboots: z.optional(mcid.or(z.array(mcid))),
  playerhelditem: z.optional(mcid.or(z.array(mcid))),
  helditem: z.optional(mcid.or(z.array(mcid))),
  offhanditem: z.optional(mcid.or(z.array(mcid))),
  bothhandsitem: z.optional(mcid.or(z.array(mcid))),

  lackhelmet: z.optional(mcid.or(z.array(mcid))),
  lackchestplate: z.optional(mcid.or(z.array(mcid))),
  lackleggings: z.optional(mcid.or(z.array(mcid))),
  lackboots: z.optional(mcid.or(z.array(mcid))),
  lackhelditem: z.optional(mcid.or(z.array(mcid))),
  lackoffhanditem: z.optional(mcid.or(z.array(mcid))),

  structure: z.optional(mcid),
  scoreboardtags_all: z.optional(z.string().or(z.array(z.string()))),
  scoreboardtags_any: z.optional(z.string().or(z.array(z.string()))),

  state: z.optional(z.string()),
  pstate: z.optional(z.string()),

  summer: z.optional(z.boolean()),
  winter: z.optional(z.boolean()),
  spring: z.optional(z.boolean()),
  autumn: z.optional(z.boolean()),

  incity: z.optional(z.boolean()),
  instreet: z.optional(z.boolean()),
  insphere: z.optional(z.boolean()),
  inbuilding: z.optional(z.boolean()),
  building: z.optional(z.string().or(z.array(z.string()))),

  gamestage: z.optional(z.string()),

  amulet: z.optional(mcid.or(z.array(mcid))),
  ring: z.optional(mcid.or(z.array(mcid))),
  belt: z.optional(mcid.or(z.array(mcid))),
  trinket: z.optional(mcid.or(z.array(mcid))),
  head: z.optional(mcid.or(z.array(mcid))),
  body: z.optional(mcid.or(z.array(mcid))),
  charm: z.optional(mcid.or(z.array(mcid))),

  message: z.optional(z.string()),
  addscoreboardtags: z.optional(z.string().or(z.array(z.string()))),
  healthset: z.optional(z.number()),
  healthmultiply: z.optional(z.number()),
  healthadd: z.optional(z.number()),
  speedset: z.optional(z.number()),
  speedmultiply: z.optional(z.number()),
  speedadd: z.optional(z.number()),
  damageset: z.optional(z.number()),
  damagemultiply: z.optional(z.number()),
  damageadd: z.optional(z.number()),
  sizemultiply: z.optional(z.number()),
  sizeadd: z.optional(z.number()),
  angry: z.optional(z.boolean()),
  customname: z.optional(z.string()),
  potion: z.optional(mcid),

  nbt: z.optional(z.object({}))
});

export const spawnSchema1_20 = z.array(generalSpawnKeywords.extend({
  when: z.optional(z.enum(["position", "onjoin", "finalize", "despawn"])),
}).strict());

export const spawnSchema1_19 = z.array(generalSpawnKeywords.extend({
  onjoin: z.optional(z.boolean()),
}).strict());

export const spawnerSchema = z.array(z.object({
  mob: z.optional(mcid.or(z.array(mcid))),
  weights: z.optional(z.array(z.number())),
  mobsfrombiome: z.optional(z.enum(["monster", "creature", "ambient", "water_creature", "water_ambient", "misc"])),
  phase: z.optional(z.string()),
  addscoreboardtags: z.optional(z.string().or(z.array(z.string()))),
  attempts: z.number().int(),
  persecond: z.number(),
  amount: z.object({
    minimum: z.number().int(),
    maximum: z.number().int(),
    groupdistance: z.optional(z.number().int()),
  }),
  conditions: z.object({
    dimension: mcid.or(z.array(mcid)),
    norestrictions: z.optional(z.boolean()),
    inwater: z.optional(z.boolean()),
    inlava: z.optional(z.boolean()),
    inair: z.optional(z.boolean()),
    validspawn: z.optional(z.boolean()),
    sturdy: z.optional(z.boolean()),
    mindaycount: z.optional(z.number().int()),
    maxdaycount: z.optional(z.number().int()),
    mindist: z.optional(z.number()),
    maxdist: z.optional(z.number()),
    minheight: z.optional(z.number().int()),
    maxheight: z.optional(z.number().int()),
    minverticaldist: z.optional(z.number()),
    maxverticaldist: z.optional(z.number()),
    maxthis: z.optional(z.number().int()),
    maxtotal: z.optional(z.number().int()),
    maxpeaceful: z.optional(z.number().int()),
    maxhostile: z.optional(z.number().int()),
    maxneutral: z.optional(z.number().int()),
    maxlocal: z.optional(z.number().int()),
  })
})).strict();

export const phasesSchema = z.array(z.object({
  name: z.string(),
  conditions: z.object({
    time: z.optional(expression),
    mintime: z.optional(z.number().int()),
    maxtime: z.optional(z.number().int()),

    daycount: z.optional(expression),
    mindaycount: z.optional(z.number().int()),
    maxdaycount: z.optional(z.number().int()),

    weather: z.optional(z.enum(["rain", "thunder"])),

    summer: z.optional(z.boolean()),
    winter: z.optional(z.boolean()),
    spring: z.optional(z.boolean()),
    autumn: z.optional(z.boolean()),

    state: z.optional(z.string()),
  }),
})).refine((v) => {
    const names = v.map((phase) => phase.name);
    return new Set(names).size === names.length;
}, "Phase names must be unique").strict();