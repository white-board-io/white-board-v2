export * from "./client";
export * from "./schema";

// Re-export the handful of Drizzle operators consumers need, so the rest of the
// monorepo depends only on @repo/db rather than on drizzle-orm directly.
export { and, asc, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
