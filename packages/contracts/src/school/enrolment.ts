import { z } from "zod";
import { uuid } from "../common";
import { studentDto } from "./student";

export const enrollStudentSchema = z.object({
  studentId: uuid(),
  classSectionId: uuid(),
  rollNumber: z.string().trim().min(1).optional(),
});
export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;

export const promoteStudentSchema = z.object({
  toClassSectionId: uuid(),
  rollNumber: z.string().trim().min(1).optional(),
});
export type PromoteStudentInput = z.infer<typeof promoteStudentSchema>;

export const enrolmentCreatedDto = z.object({ enrolmentId: z.string() });
export type EnrolmentCreatedDto = z.infer<typeof enrolmentCreatedDto>;

/** A student's current placement, denormalized for display. */
export const currentEnrolmentDto = z.object({
  enrolmentId: z.string(),
  classSectionId: z.string(),
  sectionName: z.string(),
  gradeLevel: z.string(),
  stream: z.string().nullable(),
  academicYearId: z.string(),
  rollNumber: z.string().nullable(),
});
export type CurrentEnrolmentDto = z.infer<typeof currentEnrolmentDto>;

export const studentDetailDto = studentDto.extend({
  currentEnrolment: currentEnrolmentDto.nullable(),
});
export type StudentDetailDto = z.infer<typeof studentDetailDto>;

/** A row in a class section's roster. */
export const rosterEntryDto = z.object({
  studentId: z.string(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  lastName: z.string().nullable(),
  rollNumber: z.string().nullable(),
  enrolmentId: z.string(),
});
export type RosterEntryDto = z.infer<typeof rosterEntryDto>;
