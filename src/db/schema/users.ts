import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { user as authUser } from "@/db/schema/auth";
import { createTimestampColumns } from "@/db/schema/shared";

export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .references(() => authUser.id, { onDelete: "cascade" }),
    username: text("username"),
    bio: text("bio"),
    ...createTimestampColumns(),
  },
  (table) => [uniqueIndex("users_username_key").on(table.username)],
);
