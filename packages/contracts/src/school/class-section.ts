import { z } from "zod";
import { uuid } from "../common";

export const classSectionStatus = z.enum(["active", "archived"]);
export type ClassSectionStatus = z.infer<typeof classSectionStatus>;

export const createClassSectionSchema = z.object({
  academicYearId: uuid(),
  gradeLevelId: uuid(),
  streamId: uuid().optional(),
  sectionName: z.string().trim().min(1, "Section name is required."),
  displayName: z.string().trim().min(1).optional(),
  capacity: z.number().int().positive().optional(),
});
export type CreateClassSectionInput = z.infer<typeof createClassSectionSchema>;

export const classSectionDto = z.object({
  id: z.string(),
  academicYearId: z.string(),
  gradeLevelId: z.string(),
  streamId: z.string().nullable(),
  sectionName: z.string(),
  displayName: z.string().nullable(),
  capacity: z.number().nullable(),
  status: classSectionStatus,
});
export type ClassSectionDto = z.infer<typeof classSectionDto>;
