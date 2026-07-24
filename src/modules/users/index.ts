import { getDatabase } from "@/db";
import { createDeleteUserProfileById } from "@/modules/users/application/delete-user-profile-by-id";
import { createGetUserProfileById } from "@/modules/users/application/get-user-profile-by-id";
import { createGetUserProfilesByIds } from "@/modules/users/application/get-user-profiles-by-ids";
import { createSyncUserProfileFromAuthIdentity } from "@/modules/users/application/sync-user-profile-from-auth-identity";
import { createUpdateOwnUserProfile } from "@/modules/users/application/update-own-user-profile";
import { createDrizzleUserProfileRepository } from "@/modules/users/infrastructure/drizzle-user-profile-repository";

function createUsersServices() {
  const userProfileRepository =
    createDrizzleUserProfileRepository(getDatabase());

  return {
    deleteUserProfileById: createDeleteUserProfileById({
      userProfileRepository,
    }),
    getUserProfileById: createGetUserProfileById({
      userProfileRepository,
    }),
    getUserProfilesByIds: createGetUserProfilesByIds({
      userProfileRepository,
    }),
    syncUserProfileFromAuthIdentity: createSyncUserProfileFromAuthIdentity({
      userProfileRepository,
    }),
    updateOwnUserProfile: createUpdateOwnUserProfile({
      userProfileRepository,
    }),
  };
}

export async function syncUserProfileFromAuthIdentity(input: {
  authUserId: string;
}) {
  return createUsersServices().syncUserProfileFromAuthIdentity(input);
}

export async function deleteUserProfileById(userId: string) {
  return createUsersServices().deleteUserProfileById(userId);
}

export async function getUserProfileById(userId: string) {
  return createUsersServices().getUserProfileById(userId);
}

export async function getUserProfilesByIds(userIds: string[]) {
  return createUsersServices().getUserProfilesByIds(userIds);
}

export async function updateOwnUserProfile(input: {
  bio: string | null;
  userId: string;
  username: string | null;
}) {
  return createUsersServices().updateOwnUserProfile(input);
}

export type { UserProfile } from "@/modules/users/validation";
