import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  createCreatedAtColumn,
  createTimestampColumns,
} from "@/db/schema/shared";
import { users } from "@/db/schema/users";

export const roomMemberRole = pgEnum("room_member_role", ["owner", "member"]);

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    topic: text("topic"),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("rooms_slug_key").on(table.slug),
    index("rooms_owner_user_id_idx").on(table.ownerUserId),
  ],
);

export const roomMembers = pgTable(
  "room_members",
  {
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: roomMemberRole("role").notNull().default("member"),
    joinedAt: createCreatedAtColumn("joined_at"),
  },
  (table) => [
    primaryKey({
      columns: [table.roomId, table.userId],
      name: "room_members_pk",
    }),
    index("room_members_user_id_idx").on(table.userId),
    index("room_members_room_id_idx").on(table.roomId),
  ],
);
