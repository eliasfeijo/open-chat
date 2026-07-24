import type { UserProfileRepository } from "@/modules/users/application/ports/user-profile-repository";
import { userIdSchema } from "@/modules/users/validation";

export function createGetUserProfilesByIds(dependencies: {
  userProfileRepository: UserProfileRepository;
}) {
  return async function getUserProfilesByIds(userIds: string[]) {
    const parsedUserIds = Array.from(
      new Set(userIds.map((userId) => userIdSchema.parse(userId.trim()))),
    );

    return dependencies.userProfileRepository.findByIds(parsedUserIds);
  };
}
