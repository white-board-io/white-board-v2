import { academicYears, asc, classSections, db, eq, gradeLevels, streams } from "@repo/db";
import type { AcademicYear, ClassSection, GradeLevel, Stream } from "@repo/db";
import { mapUniqueViolation } from "./errors";

function firstOrThrow<T>(rows: T[]): T {
  const row = rows[0];
  if (!row) throw new Error("Insert returned no row.");
  return row;
}

/* ------------------------------- Academic Years ------------------------------- */

export type CreateAcademicYearInput = {
  name: string;
  startsOn: string;
  endsOn: string;
  status?: "draft" | "active" | "closed";
  isCurrent?: boolean;
};

export async function createAcademicYear(
  workspaceId: string,
  input: CreateAcademicYearInput,
): Promise<AcademicYear> {
  try {
    const rows = await db
      .insert(academicYears)
      .values({
        workspaceId,
        name: input.name.trim(),
        startsOn: input.startsOn,
        endsOn: input.endsOn,
        status: input.status ?? "draft",
        isCurrent: input.isCurrent ?? false,
      })
      .returning();
    return firstOrThrow(rows);
  } catch (err) {
    mapUniqueViolation(err, "Could not create academic year.");
  }
}

export function listAcademicYears(workspaceId: string): Promise<AcademicYear[]> {
  return db
    .select()
    .from(academicYears)
    .where(eq(academicYears.workspaceId, workspaceId))
    .orderBy(asc(academicYears.startsOn));
}

/* -------------------------------- Grade Levels -------------------------------- */

export type CreateGradeLevelInput = {
  name: string;
  shortName?: string | null;
  sortOrder?: number;
};

export async function createGradeLevel(
  workspaceId: string,
  input: CreateGradeLevelInput,
): Promise<GradeLevel> {
  try {
    const rows = await db
      .insert(gradeLevels)
      .values({
        workspaceId,
        name: input.name.trim(),
        shortName: input.shortName ?? null,
        sortOrder: input.sortOrder ?? 0,
      })
      .returning();
    return firstOrThrow(rows);
  } catch (err) {
    mapUniqueViolation(err, "Could not create class.");
  }
}

export function listGradeLevels(workspaceId: string): Promise<GradeLevel[]> {
  return db
    .select()
    .from(gradeLevels)
    .where(eq(gradeLevels.workspaceId, workspaceId))
    .orderBy(asc(gradeLevels.sortOrder));
}

/* ----------------------------------- Streams ---------------------------------- */

export type CreateStreamInput = {
  name: string;
  sortOrder?: number;
};

export async function createStream(workspaceId: string, input: CreateStreamInput): Promise<Stream> {
  try {
    const rows = await db
      .insert(streams)
      .values({ workspaceId, name: input.name.trim(), sortOrder: input.sortOrder ?? 0 })
      .returning();
    return firstOrThrow(rows);
  } catch (err) {
    mapUniqueViolation(err, "Could not create stream.");
  }
}

export function listStreams(workspaceId: string): Promise<Stream[]> {
  return db
    .select()
    .from(streams)
    .where(eq(streams.workspaceId, workspaceId))
    .orderBy(asc(streams.sortOrder));
}

/* -------------------------------- Class Sections ------------------------------- */

export type CreateClassSectionInput = {
  academicYearId: string;
  gradeLevelId: string;
  streamId?: string | null;
  sectionName: string;
  displayName?: string | null;
  capacity?: number | null;
};

export async function createClassSection(
  workspaceId: string,
  input: CreateClassSectionInput,
): Promise<ClassSection> {
  try {
    const rows = await db
      .insert(classSections)
      .values({
        workspaceId,
        academicYearId: input.academicYearId,
        gradeLevelId: input.gradeLevelId,
        streamId: input.streamId ?? null,
        sectionName: input.sectionName.trim(),
        displayName: input.displayName ?? null,
        capacity: input.capacity ?? null,
      })
      .returning();
    return firstOrThrow(rows);
  } catch (err) {
    mapUniqueViolation(err, "Could not create class section.");
  }
}

export function listClassSections(workspaceId: string): Promise<ClassSection[]> {
  return db
    .select()
    .from(classSections)
    .where(eq(classSections.workspaceId, workspaceId))
    .orderBy(asc(classSections.sectionName));
}
