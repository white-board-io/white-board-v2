import { Enrolment } from "../../domain/enrolment/enrolment";
import type { EnrolmentRepository } from "../../domain/enrolment/enrolment-repository";
import { NotFoundError, ValidationError } from "../../domain/shared/errors";
import type { ClassSectionLookup } from "../ports";

export type PromoteStudentInput = {
  studentId: string;
  toClassSectionId: string;
  rollNumber?: string | null;
};

export type PromoteStudentResult = { enrolmentId: string };

export class PromoteStudent {
  readonly #enrolments: EnrolmentRepository;
  readonly #classSections: ClassSectionLookup;

  constructor(enrolments: EnrolmentRepository, classSections: ClassSectionLookup) {
    this.#enrolments = enrolments;
    this.#classSections = classSections;
  }

  async execute(workspaceId: string, input: PromoteStudentInput): Promise<PromoteStudentResult> {
    const target = await this.#classSections.findRef(workspaceId, input.toClassSectionId);
    if (!target) throw new NotFoundError("Target class section not found.");
    if (target.status !== "active") {
      throw new ValidationError("Cannot promote into an archived class section.");
    }

    const current = await this.#enrolments.findActiveByStudent(workspaceId, input.studentId);
    if (!current) {
      throw new NotFoundError("Student has no active enrolment to promote from.");
    }
    if (current.academicYearId === target.academicYearId) {
      throw new ValidationError(
        "Promotion must target a different academic year; use a transfer for same-year section changes.",
      );
    }

    // Close-old / open-new, persisted atomically.
    current.close("promoted");
    const next = Enrolment.open({
      workspaceId,
      studentId: input.studentId,
      academicYearId: target.academicYearId,
      classSectionId: input.toClassSectionId,
      rollNumber: input.rollNumber,
    });
    await this.#enrolments.saveTransition(current, next);
    return { enrolmentId: next.id };
  }
}
