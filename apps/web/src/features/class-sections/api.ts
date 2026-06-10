import { useAuth } from "@clerk/clerk-react";
import { classSectionDto, rosterEntryDto, type CreateClassSectionInput } from "@repo/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useApiClient } from "../../lib/api-client";

const listSchema = z.array(classSectionDto);
const rosterSchema = z.array(rosterEntryDto);

export function useClassSections() {
  const api = useApiClient();
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ["class-sections", orgId],
    queryFn: () => api.get("/api/class-sections", listSchema),
  });
}

export function useCreateClassSection() {
  const api = useApiClient();
  const qc = useQueryClient();
  const { orgId } = useAuth();
  return useMutation({
    mutationFn: (input: CreateClassSectionInput) => api.post("/api/class-sections", input, classSectionDto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["class-sections", orgId] }),
  });
}

export function useSectionRoster(sectionId: string) {
  const api = useApiClient();
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ["class-sections", orgId, sectionId, "roster"],
    queryFn: () => api.get(`/api/class-sections/${sectionId}/students`, rosterSchema),
  });
}
