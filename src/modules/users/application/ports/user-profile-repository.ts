import type { UserProfile } from "@/modules/users/validation";

export interface UserProfileRepository {
  createForAuthUser(authUserId: string): Promise<UserProfile>;
  deleteById(userId: string): Promise<void>;
  findById(userId: string): Promise<UserProfile | null>;
}
