"use server";

import { revalidatePath } from "next/cache";
import { ZodError, z } from "zod";

import { getAuthenticatedUser } from "@/modules/auth";
import { updateOwnUserProfile } from "@/modules/users";
import {
  UserProfileNotFoundError,
  UsernameAlreadyTakenError,
} from "@/modules/users/domain/user-profile";

const updateOwnUserProfileFormSchema = z.object({
  bio: z.string(),
  username: z.string(),
});

export type UpdateOwnUserProfileActionState = {
  fieldErrors: {
    bio?: string;
    username?: string;
  };
  message: string | null;
  status: "idle" | "error" | "success";
};

function getFieldErrorMessage(error: ZodError, fieldName: "bio" | "username") {
  return error.issues.find((issue) => issue.path[0] === fieldName)?.message;
}

export async function updateOwnUserProfileAction(
  _previousState: UpdateOwnUserProfileActionState,
  formData: FormData,
): Promise<UpdateOwnUserProfileActionState> {
  const authenticatedUser = await getAuthenticatedUser();

  if (!authenticatedUser) {
    return {
      fieldErrors: {},
      message: "You need to sign in to update your profile.",
      status: "error",
    };
  }

  try {
    const rawInput = updateOwnUserProfileFormSchema.parse({
      bio: formData.get("bio"),
      username: formData.get("username"),
    });

    await updateOwnUserProfile({
      bio: rawInput.bio,
      userId: authenticatedUser.id,
      username: rawInput.username,
    });

    revalidatePath("/profile");

    return {
      fieldErrors: {},
      message: "Profile updated.",
      status: "success",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        fieldErrors: {
          bio: getFieldErrorMessage(error, "bio"),
          username: getFieldErrorMessage(error, "username"),
        },
        message: "Please correct the highlighted fields.",
        status: "error",
      };
    }

    if (error instanceof UsernameAlreadyTakenError) {
      return {
        fieldErrors: {
          username: error.message,
        },
        message: "Choose another username.",
        status: "error",
      };
    }

    if (error instanceof UserProfileNotFoundError) {
      return {
        fieldErrors: {},
        message: "We could not load your profile.",
        status: "error",
      };
    }

    throw error;
  }
}
