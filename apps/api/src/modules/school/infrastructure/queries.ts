import type { RosterEntryDto, StudentDetailDto, StudentDto } from "@repo/contracts";
import { and, asc, classSections, db, eq, gradeLevels, streams, studentEnrolments, students } from "@repo/db";

/** All students in a workspace. */
export function listStudents(workspaceId: string): Promise<StudentDto[]> {
  return db
    .select({
      id: students.id,
      admissionNumber: students.admissionNumber,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      dateOfBirth: students.dateOfBirth,
      status: students.status,
    })
    .from(students)
    .where(eq(students.workspaceId, workspaceId))
    .orderBy(asc(students.firstName));
}

/** A student with their current placement, denormalized for display. */
export async function getStudentById(workspaceId: string, id: string): Promise<StudentDetailDto | null> {
  const [student] = await db
    .select()
    .from(students)
    .where(and(eq(students.workspaceId, workspaceId), eq(students.id, id)))
    .limit(1);
  if (!student) return null;

  const [currentEnrolment] = await db
    .select({
      enrolmentId: studentEnrolments.id,
      classSectionId: classSections.id,
      sectionName: classSections.sectionName,
      gradeLevel: gradeLevels.name,
      stream: streams.name,
      academicYearId: studentEnrolments.academicYearId,
      rollNumber: studentEnrolments.rollNumber,
    })
    .from(studentEnrolments)
    .innerJoin(classSections, eq(studentEnrolments.classSectionId, classSections.id))
    .innerJoin(gradeLevels, eq(classSections.gradeLevelId, gradeLevels.id))
    .leftJoin(streams, eq(classSections.streamId, streams.id))
    .where(
      and(
        eq(studentEnrolments.workspaceId, workspaceId),
        eq(studentEnrolments.studentId, id),
        eq(studentEnrolments.status, "active"),
      ),
    )
    .limit(1);

  return {
    id: student.id,
    admissionNumber: student.admissionNumber,
    firstName: student.firstName,
    middleName: student.middleName,
    lastName: student.lastName,
    dateOfBirth: student.dateOfBirth,
    status: student.status,
    currentEnrolment: currentEnrolment ?? null,
  };
}

/** The active roster for a class section. */
export function getStudentsByClassSection(workspaceId: string, classSectionId: string): Promise<RosterEntryDto[]> {
  return db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      rollNumber: studentEnrolments.rollNumber,
      enrolmentId: studentEnrolments.id,
    })
    .from(studentEnrolments)
    .innerJoin(students, eq(studentEnrolments.studentId, students.id))
    .where(
      and(
        eq(studentEnrolments.workspaceId, workspaceId),
        eq(studentEnrolments.classSectionId, classSectionId),
        eq(studentEnrolments.status, "active"),
      ),
    )
    .orderBy(asc(studentEnrolments.rollNumber));
}
