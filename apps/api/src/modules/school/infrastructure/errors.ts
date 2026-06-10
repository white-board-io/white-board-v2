import { ConflictError } from "../domain/shared/errors";

type PgError = { code?: string; constraint_name?: string };

function asPgError(err: unknown): PgError | null {
  const candidates: unknown[] = [err, (err as { cause?: unknown } | null)?.cause];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && "code" in candidate) {
      return candidate as PgError;
    }
  }
  return null;
}

/** Translate a Postgres unique-violation (23505) into a friendly ConflictError; rethrow anything else. */
export function mapUniqueViolation(err: unknown, fallback: string): never {
  const pg = asPgError(err);
  if (pg?.code === "23505") {
    throw new ConflictError(messageForConstraint(pg.constraint_name) ?? fallback);
  }
  throw err;
}

function messageForConstraint(constraint: string | undefined): string | null {
  switch (constraint) {
    case "students_workspace_admission_no_uq":
      return "Admission number is already in use.";
    case "enrolments_one_active_per_student_year_uq":
      return "Student already has an active enrolment for this academic year.";
    case "enrolments_roll_no_per_section_uq":
      return "Roll number is already taken in this class section.";
    case "class_sections_identity_uq":
      return "A section with this name already exists for this class, stream, and year.";
    case "academic_years_one_current_per_workspace_uq":
      return "Another academic year is already marked as current.";
    case "academic_years_workspace_name_uq":
      return "An academic year with this name already exists.";
    case "grade_levels_workspace_name_uq":
      return "A class with this name already exists.";
    case "streams_workspace_name_uq":
      return "A stream with this name already exists.";
    default:
      return null;
  }
}
