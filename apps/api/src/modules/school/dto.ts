import type { AcademicYearDto, ClassSectionDto, GradeLevelDto, StreamDto, StudentDto } from "@repo/contracts";
import type { AcademicYear, ClassSection, GradeLevel, Stream, Student } from "@repo/db";

// Row → DTO mappers. The wire boundary (ADR-0008): persistence columns like
// workspace_id and timestamps never leave the API.

export const toAcademicYearDto = (r: AcademicYear): AcademicYearDto => ({
  id: r.id,
  name: r.name,
  startsOn: r.startsOn,
  endsOn: r.endsOn,
  status: r.status,
  isCurrent: r.isCurrent,
});

export const toGradeLevelDto = (r: GradeLevel): GradeLevelDto => ({
  id: r.id,
  name: r.name,
  shortName: r.shortName,
  sortOrder: r.sortOrder,
  status: r.status,
});

export const toStreamDto = (r: Stream): StreamDto => ({
  id: r.id,
  name: r.name,
  sortOrder: r.sortOrder,
  status: r.status,
});

export const toClassSectionDto = (r: ClassSection): ClassSectionDto => ({
  id: r.id,
  academicYearId: r.academicYearId,
  gradeLevelId: r.gradeLevelId,
  streamId: r.streamId,
  sectionName: r.sectionName,
  displayName: r.displayName,
  capacity: r.capacity,
  status: r.status,
});

export const toStudentDto = (r: Student): StudentDto => ({
  id: r.id,
  admissionNumber: r.admissionNumber,
  firstName: r.firstName,
  middleName: r.middleName,
  lastName: r.lastName,
  dateOfBirth: r.dateOfBirth,
  status: r.status,
});
