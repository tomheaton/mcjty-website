import z from "zod";

export const spawnSchema = z.object({
  dimension: z.string(),
  mob: z.string(),
  mincount: z.object({
    amount: z.number(),
    hostile: z.boolean(),
    perplayer: z.boolean(),
  }),
  result: z.string(),
});
