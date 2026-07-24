import type { Database } from "@/db";

type DatabaseTransactionCallback = Parameters<Database["transaction"]>[0];

type DatabaseTransaction = DatabaseTransactionCallback extends (
  transaction: infer Transaction,
) => unknown
  ? Transaction
  : never;

export type DrizzleRoomDatabase = Database | DatabaseTransaction;
