import type { UserProfileRepository } from "@/modules/users/application/ports/user-profile-repository";
import { syncUserProfileFromAuthIdentitySchema } from "@/modules/users/validation";

export function createSyncUserProfileFromAuthIdentity(dependencies: {
  userProfileRepository: UserProfileRepository;
}) {
  return async function syncUserProfileFromAuthIdentity(input: {
    authUserId: string;
  }) {
    const command = syncUserProfileFromAuthIdentitySchema.parse(input);
    const existingUserProfile =
      await dependencies.userProfileRepository.findById(command.authUserId);

    if (existingUserProfile) {
      return existingUserProfile;
    }

    return dependencies.userProfileRepository.createForAuthUser(
      command.authUserId,
    );
  };
}
