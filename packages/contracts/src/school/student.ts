import { z } from "zod";
import { isoDate } from "../common";

export const studentStatus = z.enum(["active", "inactive"]);
export type StudentStatus = z.infer<typeof studentStatus>;

export const createStudentSchema = z.object({
  admissionNumber: z.string().trim().min(1).optional(),
  firstName: z.string().trim().min(1, "First name is required."),
  middleName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  dateOfBirth: isoDate("Date of birth must be yyyy-mm-dd."),
});
export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const studentDto = z.object({
  id: z.string(),
  admissionNumber: z.string().nullable(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string(),
  status: studentStatus,
});
export type StudentDto = z.infer<typeof studentDto>;

export const studentCreatedDto = z.object({ studentId: z.string() });
export type StudentCreatedDto = z.infer<typeof studentCreatedDto>;
