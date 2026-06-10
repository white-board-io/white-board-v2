import { z } from "zod";

export const gradeLevelStatus = z.enum(["active", "archived"]);
export type GradeLevelStatus = z.infer<typeof gradeLevelStatus>;

export const createGradeLevelSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  shortName: z.string().trim().min(1).optional(),
  sortOrder: z.number().int().optional(),
});
export type CreateGradeLevelInput = z.infer<typeof createGradeLevelSchema>;

export const gradeLevelDto = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  sortOrder: z.number(),
  status: gradeLevelStatus,
});
export type GradeLevelDto = z.infer<typeof gradeLevelDto>;
