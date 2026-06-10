import type { DomainEvent } from "../shared/domain-event";
import type { EnrolmentState } from "./enrolment";

export const studentEnrolled = (state: EnrolmentState): DomainEvent => ({
  name: "school.student.enrolled",
  occurredAt: new Date(),
  payload: {
    enrolmentId: state.id,
    studentId: state.studentId,
    classSectionId: state.classSectionId,
    academicYearId: state.academicYearId,
  },
});
