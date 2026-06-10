import { uuidv7 } from "uuidv7";
import type { DomainEvent } from "../shared/domain-event";
import { ValidationError } from "../shared/errors";
import { isValidIsoDate, normalizeOptional } from "../shared/util";
import { studentCreated } from "./events";

export type StudentStatus = "active" | "inactive";

export type StudentState = {
  id: string;
  workspaceId: string;
  admissionNumber: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  dateOfBirth: string;
  status: StudentStatus;
};

export type CreateStudentProps = {
  workspaceId: string;
  admissionNumber?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  dateOfBirth: string;
};

/**
 * Student aggregate. Identity (first name + DOB) is stable across years;
 * last name is optional (single-name students are supported).
 */
export class Student {
  readonly #state: StudentState;
  readonly #events: DomainEvent[] = [];

  private constructor(state: StudentState) {
    this.#state = state;
  }

  static create(props: CreateStudentProps): Student {
    const firstName = props.firstName.trim();
    if (firstName.length === 0) {
      throw new ValidationError("First name is required.");
    }
    if (!isValidIsoDate(props.dateOfBirth)) {
      throw new ValidationError("A valid date of birth (yyyy-mm-dd) is required.");
    }

    const state: StudentState = {
      id: uuidv7(),
      workspaceId: props.workspaceId,
      admissionNumber: normalizeOptional(props.admissionNumber),
      firstName,
      middleName: normalizeOptional(props.middleName),
      lastName: normalizeOptional(props.lastName),
      dateOfBirth: props.dateOfBirth,
      status: "active",
    };

    const student = new Student(state);
    student.#events.push(studentCreated(state.id, state.workspaceId));
    return student;
  }

  static reconstitute(state: StudentState): Student {
    return new Student(state);
  }

  get id(): string {
    return this.#state.id;
  }

  get workspaceId(): string {
    return this.#state.workspaceId;
  }

  toState(): StudentState {
    return { ...this.#state };
  }

  pullEvents(): DomainEvent[] {
    return this.#events.splice(0);
  }
}
