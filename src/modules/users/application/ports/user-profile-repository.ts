import type {
  UpdateOwnUserProfileInput,
  UserProfile,
} from "@/modules/users/validation";

export interface UserProfileRepository {
  createForAuthUser(authUserId: string): Promise<UserProfile>;
  deleteById(userId: string): Promise<void>;
  findById(userId: string): Promise<UserProfile | null>;
  findByIds(userIds: string[]): Promise<UserProfile[]>;
  findByUsername(username: string): Promise<UserProfile | null>;
  updateById(
    input: Pick<UpdateOwnUserProfileInput, "bio" | "userId" | "username">,
  ): Promise<UserProfile>;
}
