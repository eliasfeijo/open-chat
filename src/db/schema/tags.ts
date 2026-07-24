import {
  index,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { rooms } from "@/db/schema/rooms";

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
  },
  (table) => [
    uniqueIndex("tags_slug_key").on(table.slug),
    uniqueIndex("tags_name_key").on(table.name),
  ],
);

export const roomTags = pgTable(
  "room_tags",
  {
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.roomId, table.tagId], name: "room_tags_pk" }),
    index("room_tags_tag_id_idx").on(table.tagId),
  ],
);
