import { z } from "zod";
import { isoDate } from "../common";

export const academicYearStatus = z.enum(["draft", "active", "closed"]);
export type AcademicYearStatus = z.infer<typeof academicYearStatus>;

export const createAcademicYearSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  startsOn: isoDate("Start date must be yyyy-mm-dd."),
  endsOn: isoDate("End date must be yyyy-mm-dd."),
  status: academicYearStatus.optional(),
  isCurrent: z.boolean().optional(),
});
export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;

export const academicYearDto = z.object({
  id: z.string(),
  name: z.string(),
  startsOn: z.string(),
  endsOn: z.string(),
  status: academicYearStatus,
  isCurrent: z.boolean(),
});
export type AcademicYearDto = z.infer<typeof academicYearDto>;
