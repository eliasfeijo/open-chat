"use server";

import { revalidatePath } from "next/cache";
import { ZodError, z } from "zod";

import { getAuthenticatedUser } from "@/modules/auth";
import { joinRoom, leaveRoom } from "@/modules/rooms";
import {
  RoomMembershipAlreadyExistsError,
  RoomMembershipNotFoundError,
  RoomNotFoundError,
  RoomOwnerCannotLeaveError,
  UnauthenticatedRoomMembershipActorError,
} from "@/modules/rooms/domain/room";

const roomMembershipFormSchema = z.object({
  roomId: z.string(),
  roomSlug: z.string(),
});

export type RoomMembershipActionState = {
  message: string | null;
  status: "idle" | "error" | "success";
};

function createErrorState(message: string): RoomMembershipActionState {
  return {
    message,
    status: "error",
  };
}

export async function joinRoomAction(
  _previousState: RoomMembershipActionState,
  formData: FormData,
): Promise<RoomMembershipActionState> {
  const authenticatedUser = await getAuthenticatedUser();

  try {
    const input = roomMembershipFormSchema.parse({
      roomId: formData.get("roomId"),
      roomSlug: formData.get("roomSlug"),
    });

    await joinRoom({
      actorUserId: authenticatedUser?.id ?? null,
      roomId: input.roomId,
    });

    revalidatePath(`/rooms/${input.roomSlug}`);

    return {
      message: "You joined the room.",
      status: "success",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return createErrorState("We could not read the room request.");
    }

    if (
      error instanceof RoomMembershipAlreadyExistsError ||
      error instanceof RoomNotFoundError ||
      error instanceof UnauthenticatedRoomMembershipActorError
    ) {
      return createErrorState(error.message);
    }

    throw error;
  }
}

export async function leaveRoomAction(
  _previousState: RoomMembershipActionState,
  formData: FormData,
): Promise<RoomMembershipActionState> {
  const authenticatedUser = await getAuthenticatedUser();

  try {
    const input = roomMembershipFormSchema.parse({
      roomId: formData.get("roomId"),
      roomSlug: formData.get("roomSlug"),
    });

    await leaveRoom({
      actorUserId: authenticatedUser?.id ?? null,
      roomId: input.roomId,
    });

    revalidatePath(`/rooms/${input.roomSlug}`);

    return {
      message: "You left the room.",
      status: "success",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return createErrorState("We could not read the room request.");
    }

    if (
      error instanceof RoomMembershipNotFoundError ||
      error instanceof RoomOwnerCannotLeaveError ||
      error instanceof UnauthenticatedRoomMembershipActorError
    ) {
      return createErrorState(error.message);
    }

    throw error;
  }
}
