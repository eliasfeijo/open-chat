import { eq, inArray } from "drizzle-orm";

import type { Database } from "@/db";
import { users } from "@/db/schema";
import type { UserProfileRepository } from "@/modules/users/application/ports/user-profile-repository";
import { UserProfileProvisioningError } from "@/modules/users/domain/user-profile";
import { userProfileSchema } from "@/modules/users/validation";

function mapUserProfile(row: typeof users.$inferSelect) {
  return userProfileSchema.parse(row);
}

export function createDrizzleUserProfileRepository(
  database: Database,
): UserProfileRepository {
  return {
    async createForAuthUser(authUserId) {
      await database
        .insert(users)
        .values({
          id: authUserId,
        })
        .onConflictDoNothing({
          target: users.id,
        });

      const createdUserProfile = await database.query.users.findFirst({
        where: eq(users.id, authUserId),
      });

      if (!createdUserProfile) {
        throw new UserProfileProvisioningError(authUserId);
      }

      return mapUserProfile(createdUserProfile);
    },

    async deleteById(userId) {
      await database.delete(users).where(eq(users.id, userId));
    },

    async findById(userId) {
      const userProfile = await database.query.users.findFirst({
        where: eq(users.id, userId),
      });

      return userProfile ? mapUserProfile(userProfile) : null;
    },

    async findByIds(userIds) {
      if (userIds.length === 0) {
        return [];
      }

      const userProfiles = await database.query.users.findMany({
        where: inArray(users.id, userIds),
      });

      return userProfiles.map(mapUserProfile);
    },

    async findByUsername(username) {
      const userProfile = await database.query.users.findFirst({
        where: eq(users.username, username),
      });

      return userProfile ? mapUserProfile(userProfile) : null;
    },

    async updateById(input) {
      const [updatedUserProfile] = await database
        .update(users)
        .set({
          bio: input.bio,
          updatedAt: new Date(),
          username: input.username,
        })
        .where(eq(users.id, input.userId))
        .returning();

      return mapUserProfile(updatedUserProfile);
    },
  };
}
