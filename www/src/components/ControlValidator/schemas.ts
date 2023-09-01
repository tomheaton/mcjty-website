import z from "zod";

const mcid = z
  .string()
  .regex(
    /^[a-z0-9_]+:[a-z0-9_]+/,
    "Invalid minecraft id. Format is <modid>:<id>",
  );
const modid = z
  .string()
  .regex(
    /^[a-z0-9_]+/,
    "Invalid mod id. It should be a string with only lowercase letters, numbers and underscores",
  );

const counter = z
  .object({
    mob: z.optional(mcid.or(z.array(mcid))),
    amount: z.number().int(),
    perplayer: z.optional(z.boolean()),
    perchunk: z.optional(z.boolean()),
    mod: z.optional(modid),
    hostile: z.optional(z.boolean()),
    passive: z.optional(z.boolean()),
    all: z.optional(z.boolean()),
  })
  .strict();

const itemWeighted = z
  .object({
    factor: z.optional(z.number()),
    item: z.optional(mcid),
    damage: z.optional(z.number().int()),
    count: z.optional(z.number().int()),
    nbt: z.optional(z.string()),
  })
  .strict();

const testExpression = z
  .number()
  .int()
  .or(
    z.string().refine((v) => {
      if (v.startsWith(">=")) {
        return !isNaN(Number.parseInt(v.slice(2)));
      }
      if (v.startsWith("<=")) {
        return !isNaN(Number.parseInt(v.slice(2)));
      }
      if (v.startsWith(">")) {
        return !isNaN(Number.parseInt(v.slice(1)));
      }
      if (v.startsWith("<")) {
        return !isNaN(Number.parseInt(v.slice(1)));
      }
      if (v.startsWith("=")) {
        return !isNaN(Number.parseInt(v.slice(1)));
      }
      if (v.startsWith("!=") || v.startsWith("<>")) {
        return !isNaN(Number.parseInt(v.slice(2)));
      }
      if (v.includes("-")) {
        const range = v.split("-").map((v) => Number.parseInt(v.trim()));
        return range.length === 2 && range[0] <= range[1];
      }
      return !isNaN(Number.parseInt(v));
    }),
  );

const itemTest = z
  .object({
    item: z.optional(mcid),
    empty: z.optional(z.boolean()),
    damage: z.optional(testExpression),
    count: z.optional(testExpression),
    energy: z.optional(testExpression),
    tag: z.optional(mcid),
    mod: z.optional(modid),
    nbt: z.optional(z.array(z.object({}))),
  })
  .strict();

const itemOrIdWeighted = z.string().or(itemWeighted);
const itemOrIdTest = z.string().or(itemTest);

const expression = z.string().refine((v) => {
  const val = v.toLowerCase();
  if (!val.endsWith(")")) return false;
  if (val.startsWith("range(")) {
    const range = val
      .slice(6, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 2 && range[0] <= range[1];
  }
  if (val.startsWith("outsiderange(")) {
    const range = val
      .slice(13, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 2 && range[0] <= range[1];
  }
  if (val.startsWith("greater(")) {
    const range = val
      .slice(8, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("gt(")) {
    const range = val
      .slice(3, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("smaller(")) {
    const range = val
      .slice(8, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("lt(")) {
    const range = val
      .slice(3, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("greaterorequal(")) {
    const range = val
      .slice(15, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("ge(")) {
    const range = val
      .slice(3, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("smallerorequal(")) {
    const range = val
      .slice(15, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("le(")) {
    const range = val
      .slice(3, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("equal(")) {
    const range = val
      .slice(6, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("eq(")) {
    const range = val
      .slice(3, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("notequal(")) {
    const range = val
      .slice(9, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("ne(")) {
    const range = val
      .slice(3, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 1;
  }
  if (val.startsWith("repeat(")) {
    const range = val
      .slice(7, -1)
      .split(",")
      .map((v) => parseInt(v.trim()));
    return range.length === 3;
  }
}, "Invalid range expression");

const blockSchema = z
  .object({
    tag: z.optional(mcid),
    block: z.optional(mcid),
    mod: z.optional(modid),
    energy: z.optional(z.string()),
    contains: z.optional(z.string()),
    side: z.optional(z.enum(["up", "down", "north", "south", "east", "west"])),
  })
  .or(z.string());

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
  biometype: z.optional(
    z.enum(["desert", "desert_legacy", "warm", "cool", "icy"]),
  ),

  mincount: z.optional(z.number().int().or(counter)),
  maxcount: z.optional(z.number().int().or(counter)),

  minspawndist: z.optional(z.number()),
  maxspawndist: z.optional(z.number()),

  mindifficulty: z.optional(z.number()),
  maxdifficulty: z.optional(z.number()),

  block: z.optional(blockSchema.or(z.array(blockSchema))),
  blockoffset: z.optional(z.object({})), // @TODO: add schema

  armorhelmet: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  armorchest: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  armorlegs: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  armorboots: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  playerhelditem: z.optional(itemOrIdTest.or(z.array(itemOrIdTest))),
  helditem: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  offhanditem: z.optional(itemOrIdTest.or(z.array(itemOrIdTest))),
  bothhandsitem: z.optional(itemOrIdTest.or(z.array(itemOrIdTest))),

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

  nbt: z.optional(z.object({})),
});

function spawnRefinement(o: any) {
  return o
    .refine(
      (v) => !((v.result === "allow" || v.result == "default") && v.mincount),
      "Warning: result=allow and mincount are probably not what you want",
    )
    .refine(
      (v) => !(v.result === "deny" && v.maxcount),
      "Warning: result=deny and maxcount are probably not what you want",
    )
    .refine(
      (v) => !((v.result === "allow" || v.result == "default") && v.minlight),
      "Warning: result=allow and minlight are probably not what you want",
    )
    .refine(
      (v) => !(v.result === "deny" && v.maxlight),
      "Warning: result=deny and maxlight are probably not what you want",
    );
}

export const spawnSchema1_20 = z.array(
  spawnRefinement(
    generalSpawnKeywords
      .extend({
        when: z.optional(z.enum(["position", "onjoin", "finalize", "despawn"])),
      })
      .strict(),
  ),
);

export const spawnSchema1_19 = z.array(
  spawnRefinement(
    generalSpawnKeywords
      .extend({
        onjoin: z.optional(z.boolean()),
      })
      .strict(),
  ),
);

export const spawnerSchema = z.array(
  z
    .object({
      mob: z.optional(mcid.or(z.array(mcid))),
      weights: z.optional(z.array(z.number())),
      mobsfrombiome: z.optional(
        z.enum([
          "monster",
          "creature",
          "ambient",
          "water_creature",
          "water_ambient",
          "misc",
        ]),
      ),
      phase: z.optional(z.string()),
      addscoreboardtags: z.optional(z.string().or(z.array(z.string()))),
      attempts: z.number().int(),
      persecond: z.number(),
      amount: z
        .object({
          minimum: z.number().int(),
          maximum: z.number().int(),
          groupdistance: z.optional(z.number().int()),
        })
        .strict(),
      conditions: z
        .object({
          dimension: mcid.or(
            z
              .array(mcid)
              .refine((v) => v.length > 0, "Must have at least one dimension"),
          ),
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
        .strict(),
    })
    .strict(),
);

export const phasesSchema = z
  .array(
    z
      .object({
        name: z.string(),
        conditions: z
          .object({
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
          })
          .strict(),
      })
      .strict(),
  )
  .refine((v) => {
    const names = v.map((phase) => phase.name);
    return new Set(names).size === names.length;
  }, "Phase names must be unique");
