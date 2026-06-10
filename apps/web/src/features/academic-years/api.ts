import { useAuth } from "@clerk/clerk-react";
import { academicYearDto, type CreateAcademicYearInput } from "@repo/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useApiClient } from "../../lib/api-client";

const listSchema = z.array(academicYearDto);

export function useAcademicYears() {
  const api = useApiClient();
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ["academic-years", orgId],
    queryFn: () => api.get("/api/academic-years", listSchema),
  });
}

export function useCreateAcademicYear() {
  const api = useApiClient();
  const qc = useQueryClient();
  const { orgId } = useAuth();
  return useMutation({
    mutationFn: (input: CreateAcademicYearInput) => api.post("/api/academic-years", input, academicYearDto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["academic-years", orgId] }),
  });
}
