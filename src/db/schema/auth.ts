import {
  boolean,
  index,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import {
  createNullableTimestampColumn,
  createTimestampColumns,
} from "@/db/schema/shared";

export const user = pgTable(
  "auth_users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    name: text("name").notNull(),
    image: text("image"),
    ...createTimestampColumns(),
  },
  (table) => [uniqueIndex("auth_users_email_key").on(table.email)],
);

export const session = pgTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: createNullableTimestampColumn("expires_at").notNull(),
    token: text("token").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("auth_sessions_token_key").on(table.token),
    index("auth_sessions_user_id_idx").on(table.userId),
  ],
);

export const account = pgTable(
  "auth_accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: createNullableTimestampColumn(
      "access_token_expires_at",
    ),
    refreshTokenExpiresAt: createNullableTimestampColumn(
      "refresh_token_expires_at",
    ),
    scope: text("scope"),
    password: text("password"),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("auth_accounts_provider_account_key").on(
      table.providerId,
      table.accountId,
    ),
    index("auth_accounts_user_id_idx").on(table.userId),
  ],
);

export const verification = pgTable(
  "auth_verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: createNullableTimestampColumn("expires_at").notNull(),
    ...createTimestampColumns(),
  },
  (table) => [
    uniqueIndex("auth_verifications_identifier_value_key").on(
      table.identifier,
      table.value,
    ),
  ],
);

export const authSchema = {
  account,
  session,
  user,
  verification,
} as const;
