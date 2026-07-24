import type { UserProfile } from "@/modules/users/validation";

export class UserProfileProvisioningError extends Error {
  constructor(userId: string) {
    super(`Failed to provision a user profile for auth user ${userId}.`);
    this.name = "UserProfileProvisioningError";
  }
}

export class UserProfileNotFoundError extends Error {
  constructor(userId: string) {
    super(`User profile ${userId} was not found.`);
    this.name = "UserProfileNotFoundError";
  }
}

export class UsernameAlreadyTakenError extends Error {
  constructor(username: string) {
    super(`Username ${username} is already taken.`);
    this.name = "UsernameAlreadyTakenError";
  }
}

export function canManageUserProfile(
  actorUserId: string,
  targetUserId: string,
): boolean {
  return actorUserId === targetUserId;
}

export function createEmptyUserProfile(input: {
  authUserId: string;
  createdAt: Date;
  updatedAt: Date;
}): UserProfile {
  return {
    id: input.authUserId,
    username: null,
    bio: null,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}
