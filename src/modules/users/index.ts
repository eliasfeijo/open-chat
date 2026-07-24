import { getDatabase } from "@/db";
import { createDeleteUserProfileById } from "@/modules/users/application/delete-user-profile-by-id";
import { createGetUserProfileById } from "@/modules/users/application/get-user-profile-by-id";
import { createSyncUserProfileFromAuthIdentity } from "@/modules/users/application/sync-user-profile-from-auth-identity";
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
    syncUserProfileFromAuthIdentity: createSyncUserProfileFromAuthIdentity({
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

export type { UserProfile } from "@/modules/users/validation";
