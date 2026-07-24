"use server";

import { revalidatePath } from "next/cache";
import { ZodError, z } from "zod";

import { getAuthenticatedUser } from "@/modules/auth";
import { createRoom } from "@/modules/rooms";
import { RoomSlugAlreadyExistsError } from "@/modules/rooms/domain/room";
import { syncUserProfileFromAuthIdentity } from "@/modules/users";

const createRoomFormSchema = z.object({
  description: z.string(),
  name: z.string(),
  slug: z.string(),
  topic: z.string(),
});

export type CreateRoomActionState = {
  fieldErrors: {
    description?: string;
    name?: string;
    slug?: string;
    topic?: string;
  };
  message: string | null;
  status: "idle" | "error" | "success";
};

function getFieldErrorMessage(
  error: ZodError,
  fieldName: "description" | "name" | "slug" | "topic",
) {
  return error.issues.find((issue) => issue.path[0] === fieldName)?.message;
}

export async function createRoomAction(
  _previousState: CreateRoomActionState,
  formData: FormData,
): Promise<CreateRoomActionState> {
  const authenticatedUser = await getAuthenticatedUser();

  if (!authenticatedUser) {
    return {
      fieldErrors: {},
      message: "You need to sign in to create a room.",
      status: "error",
    };
  }

  try {
    const rawInput = createRoomFormSchema.parse({
      description: formData.get("description"),
      name: formData.get("name"),
      slug: formData.get("slug"),
      topic: formData.get("topic"),
    });

    await syncUserProfileFromAuthIdentity({
      authUserId: authenticatedUser.id,
    });

    await createRoom({
      actorUserId: authenticatedUser.id,
      description: rawInput.description,
      name: rawInput.name,
      slug: rawInput.slug,
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

    throw error;
  }
}
