import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { getAuthenticatedUser } from "@/modules/auth";
import { NavigationBar } from "@/modules/auth/presentation/navigation-bar";
import { CreateRoomForm } from "@/modules/rooms/presentation/create-room-form";
import { RoomsList } from "@/modules/rooms/presentation/rooms-list";
import { listRooms } from "@/modules/rooms";
import { syncUserProfileFromAuthIdentity } from "@/modules/users";

export default async function RoomsPage(): Promise<ReactElement> {
  const authenticatedUser = await getAuthenticatedUser();

  if (!authenticatedUser) {
    redirect("/sign-in?redirectTo=/rooms");
  }

  await syncUserProfileFromAuthIdentity({
    authUserId: authenticatedUser.id,
  });

  const rooms = await listRooms({ limit: 20 });

  return (
    <main className="min-h-screen bg-(--color-page)">
      <NavigationBar />
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,1.05fr)] lg:items-start">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-1 text-sm font-medium text-(--color-muted)">
              Rooms
            </span>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Create public rooms and browse what already exists.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-(--color-muted)">
                This slice adds the first real room workflow. Creating a room
                also records your initial membership and ownership so the next
                iterations can build on explicit room state.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-(--color-border) bg-(--color-surface) p-5 text-sm leading-7 text-(--color-muted)">
              Start with a clear name, a stable slug, and a short description.
              The creator is stored as the room owner immediately.
            </div>
          </div>

          <CreateRoomForm />
        </div>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-(--color-foreground)">
              Current rooms
            </h2>
            <p className="text-base leading-7 text-(--color-muted)">
              Minimal room browsing for the first product slice.
            </p>
          </div>

          <RoomsList currentUserId={authenticatedUser.id} rooms={rooms} />
        </section>
      </section>
    </main>
  );
}
