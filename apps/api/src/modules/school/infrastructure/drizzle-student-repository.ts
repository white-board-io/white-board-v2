import { and, db, eq, students } from "@repo/db";
import type { DB } from "@repo/db";
import { Student } from "../domain/student/student";
import type { StudentRepository } from "../domain/student/student-repository";
import { mapUniqueViolation } from "./errors";

export class DrizzleStudentRepository implements StudentRepository {
  readonly #db: DB;

  constructor(database: DB = db) {
    this.#db = database;
  }

  async findById(workspaceId: string, id: string): Promise<Student | null> {
    const [row] = await this.#db
      .select()
      .from(students)
      .where(and(eq(students.workspaceId, workspaceId), eq(students.id, id)))
      .limit(1);
    if (!row) return null;
    return Student.reconstitute({
      id: row.id,
      workspaceId: row.workspaceId,
      admissionNumber: row.admissionNumber,
      firstName: row.firstName,
      middleName: row.middleName,
      lastName: row.lastName,
      dateOfBirth: row.dateOfBirth,
      status: row.status,
    });
  }

  async existsById(workspaceId: string, id: string): Promise<boolean> {
    const [row] = await this.#db
      .select({ id: students.id })
      .from(students)
      .where(and(eq(students.workspaceId, workspaceId), eq(students.id, id)))
      .limit(1);
    return Boolean(row);
  }

  async save(student: Student): Promise<void> {
    const state = student.toState();
    try {
      await this.#db.insert(students).values({
        id: state.id,
        workspaceId: state.workspaceId,
        admissionNumber: state.admissionNumber,
        firstName: state.firstName,
        middleName: state.middleName,
        lastName: state.lastName,
        dateOfBirth: state.dateOfBirth,
        status: state.status,
      });
    } catch (err) {
      mapUniqueViolation(err, "Could not save student.");
    }
  }
}
