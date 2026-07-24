import type { UserProfileRepository } from "@/modules/users/application/ports/user-profile-repository";
import { userIdSchema } from "@/modules/users/validation";

export function createGetUserProfileById(dependencies: {
  userProfileRepository: UserProfileRepository;
}) {
  return async function getUserProfileById(userId: string) {
    const parsedUserId = userIdSchema.parse(userId);

    return dependencies.userProfileRepository.findById(parsedUserId);
  };
}
