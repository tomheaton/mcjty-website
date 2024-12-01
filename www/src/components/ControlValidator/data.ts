import z from "zod";
import {
  phasesSchema,
  spawnSchema1_18,
  spawnSchema1_19,
  spawnSchema1_20,
  spawnerSchema,
} from "./schemas";

export const MINECRAFT_VERSIONS = [
  "1.16.5",
  "1.18.2",
  "1.19.2",
  "1.20",
] as const;
export type MinecraftVersion = (typeof MINECRAFT_VERSIONS)[number];

export const VALIDATOR_TYPES = ["spawn", "spawner", "phases"] as const;
export type ValidatorType = (typeof VALIDATOR_TYPES)[number];

type DataType = Partial<
  Record<MinecraftVersion, Partial<Record<ValidatorType, z.ZodSchema<any>>>>
>;
export const DATA: DataType = {
  "1.16.5": {
    spawn: spawnSchema1_19,
    spawner: spawnerSchema,
    phases: phasesSchema,
  },
  "1.18.2": {
    spawn: spawnSchema1_18,
    spawner: spawnerSchema,
    phases: phasesSchema,
  },
  "1.19.2": {
    spawn: spawnSchema1_19,
    spawner: spawnerSchema,
    phases: phasesSchema,
  },
  "1.20": {
    spawn: spawnSchema1_20,
    spawner: spawnerSchema,
    phases: phasesSchema,
  },
} as const;
