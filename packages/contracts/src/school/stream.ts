import { z } from "zod";

export const streamStatus = z.enum(["active", "archived"]);
export type StreamStatus = z.infer<typeof streamStatus>;

export const createStreamSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  sortOrder: z.number().int().optional(),
});
export type CreateStreamInput = z.infer<typeof createStreamSchema>;

export const streamDto = z.object({
  id: z.string(),
  name: z.string(),
  sortOrder: z.number(),
  status: streamStatus,
});
export type StreamDto = z.infer<typeof streamDto>;
