import { useAuth } from "@clerk/clerk-react";
import { streamDto, type CreateStreamInput } from "@repo/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useApiClient } from "../../lib/api-client";

const listSchema = z.array(streamDto);

export function useStreams() {
  const api = useApiClient();
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ["streams", orgId],
    queryFn: () => api.get("/api/streams", listSchema),
  });
}

export function useCreateStream() {
  const api = useApiClient();
  const qc = useQueryClient();
  const { orgId } = useAuth();
  return useMutation({
    mutationFn: (input: CreateStreamInput) => api.post("/api/streams", input, streamDto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["streams", orgId] }),
  });
}
