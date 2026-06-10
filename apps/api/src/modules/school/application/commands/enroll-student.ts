import { Enrolment } from "../../domain/enrolment/enrolment";
import type { EnrolmentRepository } from "../../domain/enrolment/enrolment-repository";
import { ConflictError, NotFoundError, ValidationError } from "../../domain/shared/errors";
import type { StudentRepository } from "../../domain/student/student-repository";
import type { ClassSectionLookup } from "../ports";

export type EnrollStudentInput = {
  studentId: string;
  classSectionId: string;
  rollNumber?: string | null;
};

export type EnrollStudentResult = { enrolmentId: string };

export class EnrollStudent {
  readonly #enrolments: EnrolmentRepository;
  readonly #students: StudentRepository;
  readonly #classSections: ClassSectionLookup;

  constructor(
    enrolments: EnrolmentRepository,
    students: StudentRepository,
    classSections: ClassSectionLookup,
  ) {
    this.#enrolments = enrolments;
    this.#students = students;
    this.#classSections = classSections;
  }

  async execute(workspaceId: string, input: EnrollStudentInput): Promise<EnrollStudentResult> {
    // The academic year is derived from the section, never trusted from input.
    const section = await this.#classSections.findRef(workspaceId, input.classSectionId);
    if (!section) throw new NotFoundError("Class section not found.");
    if (section.status !== "active") {
      throw new ValidationError("Cannot enrol into an archived class section.");
    }

    const studentExists = await this.#students.existsById(workspaceId, input.studentId);
    if (!studentExists) throw new NotFoundError("Student not found.");

    // Friendly pre-check; the DB partial unique index is the atomic backstop.
    const alreadyActive = await this.#enrolments.hasActiveInYear(
      workspaceId,
      input.studentId,
      section.academicYearId,
    );
    if (alreadyActive) {
      throw new ConflictError("Student already has an active enrolment for this academic year.");
    }

    const enrolment = Enrolment.open({
      workspaceId,
      studentId: input.studentId,
      academicYearId: section.academicYearId,
      classSectionId: input.classSectionId,
      rollNumber: input.rollNumber,
    });
    await this.#enrolments.save(enrolment);
    return { enrolmentId: enrolment.id };
  }
}
