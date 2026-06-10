import { useAuth } from "@clerk/clerk-react";
import {
  enrolmentCreatedDto,
  studentCreatedDto,
  studentDetailDto,
  studentDto,
  type CreateStudentInput,
  type EnrollStudentInput,
  type PromoteStudentInput,
} from "@repo/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useApiClient } from "../../lib/api-client";

const listSchema = z.array(studentDto);

export function useStudents() {
  const api = useApiClient();
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ["students", orgId],
    queryFn: () => api.get("/api/students", listSchema),
  });
}

export function useStudent(studentId: string) {
  const api = useApiClient();
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ["students", orgId, studentId],
    queryFn: () => api.get(`/api/students/${studentId}`, studentDetailDto),
  });
}

export function useCreateStudent() {
  const api = useApiClient();
  const qc = useQueryClient();
  const { orgId } = useAuth();
  return useMutation({
    mutationFn: (input: CreateStudentInput) => api.post("/api/students", input, studentCreatedDto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students", orgId] }),
  });
}

export function useEnrollStudent(studentId: string) {
  const api = useApiClient();
  const qc = useQueryClient();
  const { orgId } = useAuth();
  return useMutation({
    mutationFn: (input: EnrollStudentInput) => api.post("/api/enrolments", input, enrolmentCreatedDto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students", orgId, studentId] }),
  });
}

export function usePromoteStudent(studentId: string) {
  const api = useApiClient();
  const qc = useQueryClient();
  const { orgId } = useAuth();
  return useMutation({
    mutationFn: (input: PromoteStudentInput) =>
      api.post(`/api/students/${studentId}/promotion`, input, enrolmentCreatedDto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students", orgId, studentId] }),
  });
}
