import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — see packages/db/.env.example");
}

const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });

export type DB = typeof db;
/** A db handle that is either the root client or an open transaction. */
export type DbExecutor = DB | Parameters<Parameters<DB["transaction"]>[0]>[0];
