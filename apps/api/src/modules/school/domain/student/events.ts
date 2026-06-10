import type { DomainEvent } from "../shared/domain-event";

export const studentCreated = (studentId: string, workspaceId: string): DomainEvent => ({
  name: "school.student.created",
  occurredAt: new Date(),
  payload: { studentId, workspaceId },
});
