import type { Student } from "./student";

export type StudentRepository = {
  findById(workspaceId: string, id: string): Promise<Student | null>;
  existsById(workspaceId: string, id: string): Promise<boolean>;
  save(student: Student): Promise<void>;
};
