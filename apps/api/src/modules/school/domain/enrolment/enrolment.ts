import { uuidv7 } from "uuidv7";
import type { DomainEvent } from "../shared/domain-event";
import { ValidationError } from "../shared/errors";
import { normalizeOptional, today } from "../shared/util";
import { studentEnrolled } from "./events";

export type EnrolmentStatus = "active" | "promoted" | "transferred" | "left" | "repeated";
/** Every status except `active` is terminal — a closed-out placement. */
export type TerminalStatus = Exclude<EnrolmentStatus, "active">;

export type EnrolmentState = {
  id: string;
  workspaceId: string;
  studentId: string;
  academicYearId: string;
  classSectionId: string;
  rollNumber: string | null;
  status: EnrolmentStatus;
  enrolledOn: string | null;
  exitedOn: string | null;
};

export type OpenEnrolmentProps = {
  workspaceId: string;
  studentId: string;
  academicYearId: string;
  classSectionId: string;
  rollNumber?: string | null;
  enrolledOn?: string | null;
};

/**
 * Student Enrolment aggregate — its own consistency boundary. The "at most one
 * active enrolment per student per academic year" invariant is enforced
 * atomically by a DB partial unique index (see ADR-0006), not in-memory.
 */
export class Enrolment {
  readonly #state: EnrolmentState;
  readonly #events: DomainEvent[] = [];

  private constructor(state: EnrolmentState) {
    this.#state = state;
  }

  static open(props: OpenEnrolmentProps): Enrolment {
    const state: EnrolmentState = {
      id: uuidv7(),
      workspaceId: props.workspaceId,
      studentId: props.studentId,
      academicYearId: props.academicYearId,
      classSectionId: props.classSectionId,
      rollNumber: normalizeOptional(props.rollNumber),
      status: "active",
      enrolledOn: props.enrolledOn ?? today(),
      exitedOn: null,
    };

    const enrolment = new Enrolment(state);
    enrolment.#events.push(studentEnrolled(state));
    return enrolment;
  }

  static reconstitute(state: EnrolmentState): Enrolment {
    return new Enrolment(state);
  }

  get id(): string {
    return this.#state.id;
  }

  get academicYearId(): string {
    return this.#state.academicYearId;
  }

  get status(): EnrolmentStatus {
    return this.#state.status;
  }

  /** Close an active placement when promoting, transferring, repeating, or leaving. */
  close(status: TerminalStatus, exitedOn?: string | null): void {
    if (this.#state.status !== "active") {
      throw new ValidationError("Only an active enrolment can be closed.");
    }
    this.#state.status = status;
    this.#state.exitedOn = exitedOn ?? today();
  }

  toState(): EnrolmentState {
    return { ...this.#state };
  }

  pullEvents(): DomainEvent[] {
    return this.#events.splice(0);
  }
}
