import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { rooms } from "@/db/schema/rooms";
import { createCreatedAtColumn } from "@/db/schema/shared";
import { users } from "@/db/schema/users";

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    body: text("body").notNull(),
    createdAt: createCreatedAtColumn(),
  },
  (table) => [
    index("messages_room_created_at_idx").on(table.roomId, table.createdAt),
    index("messages_author_user_id_idx").on(table.authorUserId),
  ],
);
