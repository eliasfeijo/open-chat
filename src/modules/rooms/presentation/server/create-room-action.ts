"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { getAuthenticatedUser } from "@/modules/auth";
import { createRoom } from "@/modules/rooms";
import {
  RoomSlugAlreadyExistsError,
  UnauthenticatedRoomCreatorError,
} from "@/modules/rooms/domain/room-errors";
import { createRoomFormSchema } from "@/modules/rooms/validation";

export type CreateRoomActionState = {
  fieldErrors: {
    description?: string;
    name?: string;
    slug?: string;
    tags?: string;
    topic?: string;
  };
  message: string | null;
  status: "idle" | "error" | "success";
};

function getFieldErrorMessage(
  error: ZodError,
  fieldName: "description" | "name" | "slug" | "tags" | "topic",
) {
  return error.issues.find((issue) => issue.path[0] === fieldName)?.message;
}

export async function createRoomAction(
  _previousState: CreateRoomActionState,
  formData: FormData,
): Promise<CreateRoomActionState> {
  const authenticatedUser = await getAuthenticatedUser();

  try {
    const rawInput = createRoomFormSchema.parse({
      description: formData.get("description"),
      name: formData.get("name"),
      slug: formData.get("slug"),
      tags: formData.get("tags"),
      topic: formData.get("topic"),
    });

    await createRoom({
      actorUserId: authenticatedUser?.id ?? null,
      description: rawInput.description,
      name: rawInput.name,
      slug: rawInput.slug,
      tagSlugs: rawInput.tagSlugs,
      topic: rawInput.topic,
    });

    revalidatePath("/rooms");

    return {
      fieldErrors: {},
      message: "Room created.",
      status: "success",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        fieldErrors: {
          description: getFieldErrorMessage(error, "description"),
          name: getFieldErrorMessage(error, "name"),
          slug: getFieldErrorMessage(error, "slug"),
          tags: getFieldErrorMessage(error, "tags"),
          topic: getFieldErrorMessage(error, "topic"),
        },
        message: "Please correct the highlighted fields.",
        status: "error",
      };
    }

    if (error instanceof RoomSlugAlreadyExistsError) {
      return {
        fieldErrors: {
          slug: error.message,
        },
        message: "Choose another room slug.",
        status: "error",
      };
    }

    if (error instanceof UnauthenticatedRoomCreatorError) {
      return {
        fieldErrors: {},
        message: error.message,
        status: "error",
      };
    }

    throw error;
  }
}
