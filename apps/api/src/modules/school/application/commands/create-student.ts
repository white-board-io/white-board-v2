import { Student } from "../../domain/student/student";
import type { StudentRepository } from "../../domain/student/student-repository";

export type CreateStudentInput = {
  admissionNumber?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  dateOfBirth: string;
};

export type CreateStudentResult = { studentId: string };

export class CreateStudent {
  readonly #students: StudentRepository;

  constructor(students: StudentRepository) {
    this.#students = students;
  }

  async execute(workspaceId: string, input: CreateStudentInput): Promise<CreateStudentResult> {
    const student = Student.create({ workspaceId, ...input });
    await this.#students.save(student);
    return { studentId: student.id };
  }
}
