import { useAuth } from "@clerk/clerk-react";
import { gradeLevelDto, type CreateGradeLevelInput } from "@repo/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useApiClient } from "../../lib/api-client";

const listSchema = z.array(gradeLevelDto);

export function useGradeLevels() {
  const api = useApiClient();
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ["grade-levels", orgId],
    queryFn: () => api.get("/api/grade-levels", listSchema),
  });
}

export function useCreateGradeLevel() {
  const api = useApiClient();
  const qc = useQueryClient();
  const { orgId } = useAuth();
  return useMutation({
    mutationFn: (input: CreateGradeLevelInput) => api.post("/api/grade-levels", input, gradeLevelDto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grade-levels", orgId] }),
  });
}
