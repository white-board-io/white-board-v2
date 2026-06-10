import { sql } from "drizzle-orm";
import { date, index, pgEnum, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { primaryId, timestamps, workspaceId } from "../_helpers";
import { academicYears } from "./academic-years";
import { classSections } from "./class-sections";
import { students } from "./students";

export const enrolmentStatus = pgEnum("enrolment_status", ["active", "promoted", "transferred", "left", "repeated"]);

export const studentEnrolments = pgTable(
  "student_enrolments",
  {
    id: primaryId(),
    workspaceId: workspaceId(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
    classSectionId: uuid("class_section_id")
      .notNull()
      .references(() => classSections.id),
    rollNumber: text("roll_number"),
    status: enrolmentStatus("status").notNull().default("active"),
    enrolledOn: date("enrolled_on"),
    exitedOn: date("exited_on"),
    ...timestamps,
  },
  (t) => [
    // The core invariant: at most one active enrolment per Student per
    // Academic Year. The DB makes the race impossible.
    uniqueIndex("enrolments_one_active_per_student_year_uq")
      .on(t.studentId, t.academicYearId)
      .where(sql`${t.status} = 'active'`),
    // Roll numbers are unique within a Class Section when assigned.
    uniqueIndex("enrolments_roll_no_per_section_uq")
      .on(t.classSectionId, t.rollNumber)
      .where(sql`${t.rollNumber} is not null`),
    index("enrolments_workspace_idx").on(t.workspaceId),
    index("enrolments_student_idx").on(t.studentId),
    index("enrolments_class_section_idx").on(t.classSectionId),
    index("enrolments_academic_year_idx").on(t.academicYearId),
  ],
);

export type StudentEnrolment = typeof studentEnrolments.$inferSelect;
export type NewStudentEnrolment = typeof studentEnrolments.$inferInsert;
