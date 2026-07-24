import { timestamp } from "drizzle-orm/pg-core";

export function createTimestampColumns() {
  return {
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  } as const;
}

export function createCreatedAtColumn(columnName = "created_at") {
  return timestamp(columnName, {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow();
}

export function createNullableTimestampColumn(columnName: string) {
  return timestamp(columnName, {
    mode: "date",
    withTimezone: true,
  });
}
