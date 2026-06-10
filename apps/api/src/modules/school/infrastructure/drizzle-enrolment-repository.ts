import { and, db, eq, studentEnrolments } from "@repo/db";
import type { DB, NewStudentEnrolment, StudentEnrolment } from "@repo/db";
import { Enrolment } from "../domain/enrolment/enrolment";
import type { EnrolmentState } from "../domain/enrolment/enrolment";
import type { EnrolmentRepository } from "../domain/enrolment/enrolment-repository";
import { mapUniqueViolation } from "./errors";

function toRow(state: EnrolmentState): NewStudentEnrolment {
  return {
    id: state.id,
    workspaceId: state.workspaceId,
    studentId: state.studentId,
    academicYearId: state.academicYearId,
    classSectionId: state.classSectionId,
    rollNumber: state.rollNumber,
    status: state.status,
    enrolledOn: state.enrolledOn,
    exitedOn: state.exitedOn,
  };
}

function toAggregate(row: StudentEnrolment): Enrolment {
  return Enrolment.reconstitute({
    id: row.id,
    workspaceId: row.workspaceId,
    studentId: row.studentId,
    academicYearId: row.academicYearId,
    classSectionId: row.classSectionId,
    rollNumber: row.rollNumber,
    status: row.status,
    enrolledOn: row.enrolledOn,
    exitedOn: row.exitedOn,
  });
}

export class DrizzleEnrolmentRepository implements EnrolmentRepository {
  readonly #db: DB;

  constructor(database: DB = db) {
    this.#db = database;
  }

  async findActiveByStudent(workspaceId: string, studentId: string): Promise<Enrolment | null> {
    const [row] = await this.#db
      .select()
      .from(studentEnrolments)
      .where(
        and(
          eq(studentEnrolments.workspaceId, workspaceId),
          eq(studentEnrolments.studentId, studentId),
          eq(studentEnrolments.status, "active"),
        ),
      )
      .limit(1);
    return row ? toAggregate(row) : null;
  }

  async hasActiveInYear(
    workspaceId: string,
    studentId: string,
    academicYearId: string,
  ): Promise<boolean> {
    const [row] = await this.#db
      .select({ id: studentEnrolments.id })
      .from(studentEnrolments)
      .where(
        and(
          eq(studentEnrolments.workspaceId, workspaceId),
          eq(studentEnrolments.studentId, studentId),
          eq(studentEnrolments.academicYearId, academicYearId),
          eq(studentEnrolments.status, "active"),
        ),
      )
      .limit(1);
    return Boolean(row);
  }

  async save(enrolment: Enrolment): Promise<void> {
    try {
      await this.#db.insert(studentEnrolments).values(toRow(enrolment.toState()));
    } catch (err) {
      mapUniqueViolation(err, "Could not save enrolment.");
    }
  }

  async saveTransition(closed: Enrolment, opened: Enrolment): Promise<void> {
    const closedState = closed.toState();
    const openedState = opened.toState();
    try {
      await this.#db.transaction(async (tx) => {
        await tx
          .update(studentEnrolments)
          .set({ status: closedState.status, exitedOn: closedState.exitedOn })
          .where(
            and(
              eq(studentEnrolments.id, closedState.id),
              eq(studentEnrolments.workspaceId, closedState.workspaceId),
            ),
          );
        await tx.insert(studentEnrolments).values(toRow(openedState));
      });
    } catch (err) {
      mapUniqueViolation(err, "Could not promote student.");
    }
  }
}
