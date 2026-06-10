import { sql } from "drizzle-orm";
import { date, index, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { primaryId, timestamps, workspaceId } from "../_helpers";

export const studentStatus = pgEnum("student_status", ["active", "inactive"]);

export const students = pgTable(
  "students",
  {
    id: primaryId(),
    workspaceId: workspaceId(),
    // The canonical school identifier. Optional, but unique within a Workspace
    // when present.
    admissionNumber: text("admission_number"),
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    // Optional: single-name students are supported.
    lastName: text("last_name"),
    dateOfBirth: date("date_of_birth").notNull(),
    status: studentStatus("status").notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("students_workspace_admission_no_uq")
      .on(t.workspaceId, t.admissionNumber)
      .where(sql`${t.admissionNumber} is not null`),
    index("students_workspace_idx").on(t.workspaceId),
  ],
);

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
