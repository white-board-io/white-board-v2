import type { Enrolment } from "./enrolment";

export type EnrolmentRepository = {
  findActiveByStudent(workspaceId: string, studentId: string): Promise<Enrolment | null>;
  hasActiveInYear(workspaceId: string, studentId: string, academicYearId: string): Promise<boolean>;
  save(enrolment: Enrolment): Promise<void>;
  /** Atomically persist a closed enrolment and its replacement (promotion/transfer). */
  saveTransition(closed: Enrolment, opened: Enrolment): Promise<void>;
};
