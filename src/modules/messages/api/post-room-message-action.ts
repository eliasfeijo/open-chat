"use server";

import { revalidatePath } from "next/cache";
import { ZodError, z } from "zod";

import { getAuthenticatedUser } from "@/modules/auth";
import { postRoomMessage } from "@/modules/messages";
import {
  RoomMessageAuthorNotMemberError,
  UnauthenticatedMessageAuthorError,
} from "@/modules/messages/domain/message";

const postRoomMessageFormSchema = z.object({
  body: z.string(),
  roomId: z.string(),
  roomSlug: z.string(),
});

export type PostRoomMessageActionState = {
  fieldErrors: {
    body?: string;
  };
  message: string | null;
  status: "idle" | "error" | "success";
};

const initialFieldErrors = {};

export async function postRoomMessageAction(
  _previousState: PostRoomMessageActionState,
  formData: FormData,
): Promise<PostRoomMessageActionState> {
  const authenticatedUser = await getAuthenticatedUser();

  try {
    const rawInput = postRoomMessageFormSchema.parse({
      body: formData.get("body"),
      roomId: formData.get("roomId"),
      roomSlug: formData.get("roomSlug"),
    });

    await postRoomMessage({
      actorUserId: authenticatedUser?.id ?? null,
      body: rawInput.body,
      roomId: rawInput.roomId,
    });

    revalidatePath(`/rooms/${rawInput.roomSlug}`);

    return {
      fieldErrors: initialFieldErrors,
      message: "Message posted.",
      status: "success",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const messageIssue = error.issues.find(
        (issue) => issue.path[0] === "body",
      );

      return {
        fieldErrors: {
          body: messageIssue?.message,
        },
        message: "Please correct the highlighted fields.",
        status: "error",
      };
    }

    if (
      error instanceof RoomMessageAuthorNotMemberError ||
      error instanceof UnauthenticatedMessageAuthorError
    ) {
      return {
        fieldErrors: initialFieldErrors,
        message: error.message,
        status: "error",
      };
    }

    throw error;
  }
}
