import type { UserProfileRepository } from "@/modules/users/application/ports/user-profile-repository";
import {
  UserProfileNotFoundError,
  UsernameAlreadyTakenError,
} from "@/modules/users/domain/user-profile";
import { updateOwnUserProfileSchema } from "@/modules/users/validation";

export function createUpdateOwnUserProfile(dependencies: {
  userProfileRepository: UserProfileRepository;
}) {
  return async function updateOwnUserProfile(input: {
    bio: string;
    userId: string;
    username: string;
  }) {
    const command = updateOwnUserProfileSchema.parse(input);
    const existingUserProfile =
      await dependencies.userProfileRepository.findById(command.userId);

    if (!existingUserProfile) {
      throw new UserProfileNotFoundError(command.userId);
    }

    if (command.username) {
      const userProfileWithUsername =
        await dependencies.userProfileRepository.findByUsername(
          command.username,
        );

      if (
        userProfileWithUsername &&
        userProfileWithUsername.id !== command.userId
      ) {
        throw new UsernameAlreadyTakenError(command.username);
      }
    }

    return dependencies.userProfileRepository.updateById(command);
  };
}
