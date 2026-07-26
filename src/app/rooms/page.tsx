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
    page?: string;
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
  const parsedPage = Number.parseInt(resolvedSearchParams.page ?? "1", 10);
  const activePage =
    Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const activeQuery = resolvedSearchParams.q ?? "";
  const activeTagSlug = resolvedSearchParams.tag ?? "";
  const [availableTags, roomsDiscovery, memberships] = await Promise.all([
    listTags({
      limit: 20,
    }),
    searchRooms({
      limit: 20,
      page: activePage,
      query: activeQuery,
      tagSlug: activeTagSlug,
    }),
    authenticatedUser
      ? listUserRoomMemberships({
          userId: authenticatedUser.id,
        })
      : Promise.resolve([]),
  ]);
  const rooms = roomsDiscovery.items;
  const membershipRoomIds = memberships.map((membership) => membership.roomId);
  const hasDiscoveryFilters = activeQuery !== "" || activeTagSlug !== "";

  function buildPaginationHref(page: number) {
    const params = new URLSearchParams();

    if (activeQuery !== "") {
      params.set("q", activeQuery);
    }

    if (activeTagSlug !== "") {
      params.set("tag", activeTagSlug);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const queryString = params.toString();

    return queryString === "" ? "/rooms" : `/rooms?${queryString}`;
  }

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
              Rooms 🏄
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
              Discover rooms 🌊
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
              Showing {rooms.length} room{rooms.length === 1 ? "" : "s"} on page{" "}
              {roomsDiscovery.page} for the current discovery filters.
            </p>
          ) : null}

          <RoomsList
            activeTagSlug={activeTagSlug || null}
            currentUserId={authenticatedUser?.id ?? null}
            membershipRoomIds={membershipRoomIds}
            rooms={rooms}
          />

          <nav
            aria-label="Rooms pagination"
            className="flex items-center justify-between gap-3 rounded-3xl border border-(--color-border) bg-(--color-surface) p-4"
          >
            <Link
              aria-disabled={!roomsDiscovery.hasPreviousPage}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition ${
                roomsDiscovery.hasPreviousPage
                  ? "border border-(--color-border) bg-(--color-page) text-(--color-foreground) hover:bg-(--color-surface-strong)"
                  : "cursor-not-allowed border border-(--color-border) bg-(--color-page) text-(--color-muted) opacity-60"
              }`}
              href={buildPaginationHref(Math.max(roomsDiscovery.page - 1, 1))}
              tabIndex={roomsDiscovery.hasPreviousPage ? 0 : -1}
            >
              Previous
            </Link>

            <span className="text-sm text-(--color-muted)">
              Page {roomsDiscovery.page}
            </span>

            <Link
              aria-disabled={!roomsDiscovery.hasNextPage}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition ${
                roomsDiscovery.hasNextPage
                  ? "border border-(--color-border) bg-(--color-page) text-(--color-foreground) hover:bg-(--color-surface-strong)"
                  : "cursor-not-allowed border border-(--color-border) bg-(--color-page) text-(--color-muted) opacity-60"
              }`}
              href={buildPaginationHref(roomsDiscovery.page + 1)}
              tabIndex={roomsDiscovery.hasNextPage ? 0 : -1}
            >
              Next
            </Link>
          </nav>
        </section>
      </section>
    </main>
  );
}

export const metadata: Metadata = {
  description:
    "Browse public rooms, discover active topics, and join realtime discussions on RoomSurf.",
  openGraph: {
    description:
      "Browse public rooms, discover active topics, and join realtime discussions on RoomSurf.",
    siteName: "RoomSurf",
    title: "Discover Rooms | RoomSurf",
    type: "website",
  },
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
  title: "Discover Rooms | RoomSurf",
  twitter: {
    card: "summary_large_image",
    description:
      "Browse public rooms, discover active topics, and join realtime discussions on RoomSurf.",
    title: "Discover Rooms | RoomSurf",
  },
};
