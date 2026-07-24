import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";
import { getServerEnv } from "@/lib/env";

export type Database = PostgresJsDatabase<typeof schema>;

let database: Database | null = null;

export function createDatabase(databaseUrl: string): Database {
  const client = postgres(databaseUrl, {
    prepare: false,
  });

  return drizzle(client, {
    schema,
  });
}

export function getDatabase(): Database {
  if (database) {
    return database;
  }

  database = createDatabase(getServerEnv().DATABASE_URL);

  return database;
}
