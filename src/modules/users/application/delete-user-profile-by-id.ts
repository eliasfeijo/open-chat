import type { UserProfileRepository } from "@/modules/users/application/ports/user-profile-repository";
import { userIdSchema } from "@/modules/users/validation";

export function createDeleteUserProfileById(dependencies: {
  userProfileRepository: UserProfileRepository;
}) {
  return async function deleteUserProfileById(userId: string): Promise<void> {
    const parsedUserId = userIdSchema.parse(userId);

    await dependencies.userProfileRepository.deleteById(parsedUserId);
  };
}
