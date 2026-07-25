import Link from "next/link";
import type { ReactElement } from "react";

import type { RoomSearchResult } from "@/modules/search";

type RoomsListProps = Readonly<{
  activeTagSlug: string | null;
  currentUserId: string;
  membershipRoomIds: string[];
  rooms: RoomSearchResult[];
}>;

export function RoomsList({
  activeTagSlug,
  currentUserId,
  membershipRoomIds,
  rooms,
}: RoomsListProps): ReactElement {
  if (rooms.length === 0) {
    return (
      <div className="rounded-4xl border border-dashed border-(--color-border) bg-(--color-surface) p-8 text-sm leading-7 text-(--color-muted)">
        No rooms yet. Create the first public room for this workspace slice.
      </div>
    );
  }

  const membershipRoomIdSet = new Set(membershipRoomIds);
  const joinedRooms: RoomSearchResult[] = [];
  const discoverRooms: RoomSearchResult[] = [];

  for (const room of rooms) {
    const isJoinedRoom =
      room.ownerUserId === currentUserId || membershipRoomIdSet.has(room.id);

    if (isJoinedRoom) {
      joinedRooms.push(room);

      continue;
    }

    discoverRooms.push(room);
  }

  function renderRoomCard(input: {
    isJoinedRoom: boolean;
    room: RoomSearchResult;
  }) {
    const ownershipLabel =
      input.room.ownerUserId === currentUserId ? "You own this room" : "Joined";

    return (
      <article
        key={input.room.id}
        className={`rounded-[1.75rem] border p-6 shadow-sm ${
          input.isJoinedRoom
            ? "border-emerald-400/40 bg-emerald-100/30 dark:border-emerald-500/30 dark:bg-emerald-950/20"
            : "border-(--color-border) bg-(--color-surface)"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-(--color-foreground)">
                <Link
                  className="transition hover:text-(--color-accent)"
                  href={`/rooms/${input.room.slug}`}
                >
                  {input.room.name}
                </Link>
              </h2>
              <span className="rounded-full border border-(--color-border) bg-(--color-page) px-3 py-1 text-xs font-medium text-(--color-muted)">
                /{input.room.slug}
              </span>
            </div>

            {input.room.topic ? (
              <p className="text-sm font-medium text-(--color-foreground)">
                {input.room.topic}
              </p>
            ) : null}

            <p className="text-sm leading-7 text-(--color-muted)">
              {input.room.description ?? "No description yet."}
            </p>

            {input.room.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {input.room.tags.map((tag) => {
                  const isActiveTag = activeTagSlug === tag.slug;

                  return (
                    <Link
                      key={tag.id}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        isActiveTag
                          ? "bg-(--color-accent) text-(--color-accent-foreground)"
                          : "border border-(--color-border) bg-(--color-page) text-(--color-muted) hover:text-(--color-accent)"
                      }`}
                      href={`/rooms?tag=${tag.slug}`}
                    >
                      #{tag.slug}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              input.isJoinedRoom
                ? "border border-emerald-500/30 bg-emerald-100/70 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-100"
                : "bg-(--color-page) text-(--color-muted)"
            }`}
          >
            {input.isJoinedRoom ? ownershipLabel : "Public room"}
          </span>
        </div>

        <div className="mt-4">
          <Link
            className="inline-flex items-center text-sm font-medium text-(--color-accent) transition hover:brightness-110"
            href={`/rooms/${input.room.slug}`}
          >
            Open room
          </Link>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-6">
      {joinedRooms.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
              Your rooms
            </h3>
            <span className="text-xs text-(--color-muted)">
              {joinedRooms.length} room{joinedRooms.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid gap-4">
            {joinedRooms.map((room) =>
              renderRoomCard({
                isJoinedRoom: true,
                room,
              }),
            )}
          </div>
        </section>
      ) : null}

      {discoverRooms.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
              Explore rooms
            </h3>
            <span className="text-xs text-(--color-muted)">
              {discoverRooms.length} room{discoverRooms.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid gap-4">
            {discoverRooms.map((room) =>
              renderRoomCard({
                isJoinedRoom: false,
                room,
              }),
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
