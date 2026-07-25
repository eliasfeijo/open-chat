"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { getAuthenticatedUser } from "@/modules/auth";
import { postRoomMessage } from "@/modules/messages";
import {
  RoomMessageAuthorNotMemberError,
  UnauthenticatedMessageAuthorError,
} from "@/modules/messages/domain/message";
import type { Message } from "@/modules/messages/validation";
import { postRoomMessageFormSchema } from "@/modules/messages/validation";

export type PostRoomMessageActionState = {
  createdMessage?: Message;
  fieldErrors: {
    body?: string;
  };
  message: string | null;
  status: "idle" | "error" | "success";
};

export type PostRoomMessageActionResult = {
  createdMessage?: Message;
  fieldErrors: {
    body?: string;
  };
  message: string | null;
  status: "error" | "success";
};

const initialFieldErrors = {};

export async function postRoomMessageAction(
  formData: FormData,
): Promise<PostRoomMessageActionResult> {
  const authenticatedUser = await getAuthenticatedUser();

  try {
    const rawInput = postRoomMessageFormSchema.parse({
      body: formData.get("body"),
      roomId: formData.get("roomId"),
      roomSlug: formData.get("roomSlug"),
    });

    const createdMessage = await postRoomMessage({
      actorUserId: authenticatedUser?.id ?? null,
      body: rawInput.body,
      roomId: rawInput.roomId,
    });

    revalidatePath(`/rooms/${rawInput.roomSlug}`);

    return {
      createdMessage,
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
