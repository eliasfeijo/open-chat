import Link from "next/link";
import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getAuthenticatedUser } from "@/modules/auth";
import { NavigationBar } from "@/modules/auth/presentation/navigation-bar";
import { CreateRoomForm } from "@/modules/rooms/presentation/create-room-form";
import { RoomsList } from "@/modules/rooms/presentation/rooms-list";
import { listUserRoomMemberships } from "@/modules/rooms";
import { RoomDiscoveryFilters } from "@/modules/search/presentation/room-discovery-filters";
import { searchRooms } from "@/modules/search";
import { listTags } from "@/modules/tags";
import { syncUserProfileFromAuthIdentity } from "@/modules/users";

type RoomsPageProps = Readonly<{
  searchParams: Promise<{
    q?: string;
    tag?: string;
  }>;
}>;

export default async function RoomsPage({
  searchParams,
}: RoomsPageProps): Promise<ReactElement> {
  const authenticatedUser = await getAuthenticatedUser();

  if (authenticatedUser) {
    await syncUserProfileFromAuthIdentity({
      authUserId: authenticatedUser.id,
    });
  }

  const resolvedSearchParams = await searchParams;
  const activeQuery = resolvedSearchParams.q ?? "";
  const activeTagSlug = resolvedSearchParams.tag ?? "";
  const [availableTags, rooms, memberships] = await Promise.all([
    listTags({
      limit: 100,
    }),
    searchRooms({
      limit: 20,
      query: activeQuery,
      tagSlug: activeTagSlug,
    }),
    authenticatedUser
      ? listUserRoomMemberships({
          userId: authenticatedUser.id,
        })
      : Promise.resolve([]),
  ]);
  const membershipRoomIds = memberships.map((membership) => membership.roomId);
  const hasDiscoveryFilters = activeQuery !== "" || activeTagSlug !== "";

  const createRoomPanel = authenticatedUser ? (
    <CreateRoomForm />
  ) : (
    <section className="space-y-5 rounded-4xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-(--color-foreground)">
          Want to start a room?
        </h2>
        <p className="text-sm leading-7 text-(--color-muted)">
          Browsing is public. Creating and posting require an account so rooms
          stay human and accountable.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex items-center justify-center rounded-full bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-(--color-accent-foreground) transition hover:brightness-110"
          href="/sign-up?redirectTo=/rooms"
        >
          Create account to start a room
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-full border border-(--color-border) bg-(--color-page) px-5 py-2.5 text-sm font-medium transition hover:bg-(--color-surface-strong)"
          href="/sign-in?redirectTo=/rooms"
        >
          Sign in
        </Link>
      </div>
    </section>
  );

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
                Build public rooms people can actually find.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-(--color-muted)">
                Name the room, set the topic, add discovery tags, and make it
                easy for the right people to join.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-(--color-border) bg-(--color-surface) p-5 text-sm leading-7 text-(--color-muted)">
              Good public rooms have a clear purpose. A short description and a
              focused set of tags make discovery much better.
            </div>
          </div>

          {createRoomPanel}
        </div>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-(--color-foreground)">
              Discover rooms
            </h2>
            <p className="text-base leading-7 text-(--color-muted)">
              Search by name, topic, description, or tag to find active
              conversations.
            </p>
          </div>

          <RoomDiscoveryFilters
            activeQuery={activeQuery}
            activeTagSlug={activeTagSlug}
            availableTags={availableTags}
          />

          {hasDiscoveryFilters ? (
            <p className="text-sm text-(--color-muted)">
              Showing {rooms.length} room{rooms.length === 1 ? "" : "s"} for the
              current discovery filters.
            </p>
          ) : null}

          <RoomsList
            activeTagSlug={activeTagSlug || null}
            currentUserId={authenticatedUser?.id ?? null}
            membershipRoomIds={membershipRoomIds}
            rooms={rooms}
          />
        </section>
      </section>
    </main>
  );
}

export const metadata: Metadata = {
  description:
    "Browse public rooms, discover active topics, and join realtime discussions on RoomSurf.",
  keywords: [
    "public chat",
    "public communities",
    "discoverable conversations",
    "realtime discussion",
    "chat rooms",
  ],
  robots: {
    follow: true,
    index: true,
  },
  title: "Discover Rooms",
};
