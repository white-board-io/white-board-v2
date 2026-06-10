import { useAuth } from "@clerk/clerk-react";
import { useCallback, useMemo } from "react";
import { z } from "zod";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000";

/**
 * Typed fetch client bound to the current Clerk session. Injects the bearer
 * token (which carries the active orgId the API uses for tenancy), parses the
 * API's `{ message }` errors into thrown Errors, and validates every response
 * against the shared @repo/contracts schema (ADR-0008).
 */
export function useApiClient() {
  const { getToken } = useAuth();

  const request = useCallback(
    async <S extends z.ZodType>(method: string, path: string, schema: S, body?: unknown): Promise<z.infer<S>> => {
      const token = await getToken();
      if (!token) throw new Error("Your session has expired. Please sign in again.");

      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : undefined;

      if (!res.ok) {
        const message =
          data && typeof data === "object" && "message" in data
            ? String((data as { message?: unknown }).message)
            : "Something went wrong.";
        throw new Error(message);
      }

      return schema.parse(data);
    },
    [getToken],
  );

  return useMemo(
    () => ({
      get: <S extends z.ZodType>(path: string, schema: S) => request("GET", path, schema),
      post: <S extends z.ZodType>(path: string, body: unknown, schema: S) => request("POST", path, schema, body),
    }),
    [request],
  );
}
