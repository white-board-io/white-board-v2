export type DomainErrorCode = "validation" | "not_found" | "conflict";

/** Base class for expected, caller-facing domain failures. */
export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super("validation", message);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super("not_found", message);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super("conflict", message);
  }
}
