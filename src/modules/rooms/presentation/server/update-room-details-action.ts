"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { getAuthenticatedUser } from "@/modules/auth";
import { updateRoomDetails } from "@/modules/rooms";
import {
  RoomNotFoundError,
  RoomUpdateForbiddenError,
  UnauthenticatedRoomEditorError,
} from "@/modules/rooms/domain/room-errors";
import { updateRoomDetailsFormSchema } from "@/modules/rooms/validation";

export type UpdateRoomDetailsActionState = {
  fieldErrors: {
    description?: string;
    name?: string;
    topic?: string;
  };
  message: string | null;
  status: "idle" | "error" | "success";
};

function getFieldErrorMessage(
  error: ZodError,
  fieldName: "description" | "name" | "topic",
) {
  return error.issues.find((issue) => issue.path[0] === fieldName)?.message;
}

export async function updateRoomDetailsAction(
  _previousState: UpdateRoomDetailsActionState,
  formData: FormData,
): Promise<UpdateRoomDetailsActionState> {
  const authenticatedUser = await getAuthenticatedUser();

  if (!authenticatedUser) {
    return {
      fieldErrors: {},
      message: "You need to sign in to update this room.",
      status: "error",
    };
  }

  try {
    const rawInput = updateRoomDetailsFormSchema.parse({
      description: formData.get("description"),
      name: formData.get("name"),
      roomId: formData.get("roomId"),
      roomSlug: formData.get("roomSlug"),
      topic: formData.get("topic"),
    });

    await updateRoomDetails({
      actorUserId: authenticatedUser.id,
      description: rawInput.description,
      name: rawInput.name,
      roomId: rawInput.roomId,
      topic: rawInput.topic,
    });

    revalidatePath("/rooms");
    revalidatePath(`/rooms/${rawInput.roomSlug}`);

    return {
      fieldErrors: {},
      message: "Room updated.",
      status: "success",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        fieldErrors: {
          description: getFieldErrorMessage(error, "description"),
          name: getFieldErrorMessage(error, "name"),
          topic: getFieldErrorMessage(error, "topic"),
        },
        message: "Please correct the highlighted fields.",
        status: "error",
      };
    }

    if (
      error instanceof RoomNotFoundError ||
      error instanceof RoomUpdateForbiddenError ||
      error instanceof UnauthenticatedRoomEditorError
    ) {
      return {
        fieldErrors: {},
        message: error.message,
        status: "error",
      };
    }

    throw error;
  }
}
