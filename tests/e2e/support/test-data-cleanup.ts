import { loadEnvConfig } from "@next/env";
import { inArray, like } from "drizzle-orm";

import { getDatabase } from "../../../src/db";
import { user as authUsers, rooms, tags } from "../../../src/db/schema";

loadEnvConfig(process.cwd());

export type E2eTestDataTracker = {
  authUserEmails: Set<string>;
  roomSlugs: Set<string>;
  tagSlugs: Set<string>;
};

export function createE2eTestDataTracker(): E2eTestDataTracker {
  return {
    authUserEmails: new Set<string>(),
    roomSlugs: new Set<string>(),
    tagSlugs: new Set<string>(),
  };
}

export async function cleanupE2eTestData(
  tracker: E2eTestDataTracker,
): Promise<void> {
  const database = getDatabase();
  const roomSlugs = Array.from(tracker.roomSlugs);
  const tagSlugs = Array.from(tracker.tagSlugs);
  const authUserEmails = Array.from(tracker.authUserEmails);

  if (roomSlugs.length > 0) {
    await database.delete(rooms).where(inArray(rooms.slug, roomSlugs));
  }

  if (tagSlugs.length > 0) {
    await database.delete(tags).where(inArray(tags.slug, tagSlugs));
  }

  if (authUserEmails.length > 0) {
    await database
      .delete(authUsers)
      .where(inArray(authUsers.email, authUserEmails));
  }
}

export async function cleanupLingeringPhase1ATestData(): Promise<void> {
  const database = getDatabase();

  await database.delete(rooms).where(like(rooms.slug, "e2e-%"));
  await database.delete(tags).where(like(tags.slug, "e2e-%"));
  await database
    .delete(authUsers)
    .where(like(authUsers.email, "e2e-%@example.com"));
}
