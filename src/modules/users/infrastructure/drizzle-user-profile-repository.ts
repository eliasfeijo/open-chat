import { eq, inArray } from "drizzle-orm";

import type { Database } from "@/db";
import { user as authUser, users } from "@/db/schema";
import type { UserProfileRepository } from "@/modules/users/application/ports/user-profile-repository";
import { UserProfileProvisioningError } from "@/modules/users/domain/user-profile";
import { userProfileSchema } from "@/modules/users/validation";

function mapUserProfile(row: {
  bio: string | null;
  createdAt: Date;
  displayName: string;
  id: string;
  updatedAt: Date;
  username: string | null;
}) {
  return userProfileSchema.parse(row);
}

function createUserProfileSelection() {
  return {
    bio: users.bio,
    createdAt: users.createdAt,
    displayName: authUser.name,
    id: users.id,
    updatedAt: users.updatedAt,
    username: users.username,
  } as const;
}

async function findJoinedUserProfileById(database: Database, userId: string) {
  const [userProfile] = await database
    .select(createUserProfileSelection())
    .from(users)
    .innerJoin(authUser, eq(authUser.id, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  return userProfile ? mapUserProfile(userProfile) : null;
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

      const createdUserProfile = await findJoinedUserProfileById(
        database,
        authUserId,
      );

      if (!createdUserProfile) {
        throw new UserProfileProvisioningError(authUserId);
      }

      return createdUserProfile;
    },

    async deleteById(userId) {
      await database.delete(users).where(eq(users.id, userId));
    },

    async findById(userId) {
      return findJoinedUserProfileById(database, userId);
    },

    async findByIds(userIds) {
      if (userIds.length === 0) {
        return [];
      }

      const userProfiles = await database
        .select(createUserProfileSelection())
        .from(users)
        .innerJoin(authUser, eq(authUser.id, users.id))
        .where(inArray(users.id, userIds));

      return userProfiles.map(mapUserProfile);
    },

    async findByUsername(username) {
      const [userProfile] = await database
        .select(createUserProfileSelection())
        .from(users)
        .innerJoin(authUser, eq(authUser.id, users.id))
        .where(eq(users.username, username))
        .limit(1);

      return userProfile ? mapUserProfile(userProfile) : null;
    },

    async updateById(input) {
      await database
        .update(users)
        .set({
          bio: input.bio,
          updatedAt: new Date(),
          username: input.username,
        })
        .where(eq(users.id, input.userId));

      const updatedUserProfile = await findJoinedUserProfileById(
        database,
        input.userId,
      );

      if (!updatedUserProfile) {
        throw new UserProfileProvisioningError(input.userId);
      }

      return updatedUserProfile;
    },
  };
}
