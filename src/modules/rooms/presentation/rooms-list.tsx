import Link from "next/link";
import type { ReactElement } from "react";

import type { RoomSearchResult } from "@/modules/search";

function formatRelativeTime(fromDate: Date, toDate: Date = new Date()): string {
  const differenceInSeconds = Math.round(
    (fromDate.getTime() - toDate.getTime()) / 1000,
  );
  const absSeconds = Math.abs(differenceInSeconds);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSeconds < 60) {
    return formatter.format(differenceInSeconds, "second");
  }

  const differenceInMinutes = Math.round(differenceInSeconds / 60);
  const absMinutes = Math.abs(differenceInMinutes);

  if (absMinutes < 60) {
    return formatter.format(differenceInMinutes, "minute");
  }

  const differenceInHours = Math.round(differenceInMinutes / 60);
  const absHours = Math.abs(differenceInHours);

  if (absHours < 24) {
    return formatter.format(differenceInHours, "hour");
  }

  const differenceInDays = Math.round(differenceInHours / 24);
  const absDays = Math.abs(differenceInDays);

  if (absDays < 30) {
    return formatter.format(differenceInDays, "day");
  }

  const differenceInMonths = Math.round(differenceInDays / 30);
  const absMonths = Math.abs(differenceInMonths);

  if (absMonths < 12) {
    return formatter.format(differenceInMonths, "month");
  }

  const differenceInYears = Math.round(differenceInMonths / 12);

  return formatter.format(differenceInYears, "year");
}

type RoomsListProps = Readonly<{
  activeTagSlug: string | null;
  currentUserId: string | null;
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
      <div className="space-y-5 rounded-4xl border border-dashed border-(--color-border) bg-(--color-surface) p-8">
        <p className="text-sm leading-7 text-(--color-muted)">
          There are no public conversations yet.
        </p>
        <div className="space-y-2 text-sm text-(--color-muted)">
          <p className="font-medium text-(--color-foreground)">
            Try creating one of these rooms:
          </p>
          <ul className="space-y-1">
            <li>Indie Hackers</li>
            <li>Golang</li>
            <li>Linux</li>
            <li>Brazil</li>
            <li>Photography</li>
          </ul>
        </div>
      </div>
    );
  }

  const membershipRoomIdSet = new Set(membershipRoomIds);
  const joinedRooms: RoomSearchResult[] = [];
  const discoverRooms: RoomSearchResult[] = [];

  for (const room of rooms) {
    if (!currentUserId) {
      discoverRooms.push(room);

      continue;
    }

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
      currentUserId && input.room.ownerUserId === currentUserId
        ? "You own this room"
        : "Joined";
    const latestRoomActivity =
      input.room.latestMessageAt ?? input.room.updatedAt;
    const hasMessages = input.room.messageCount > 0;
    const lastActivityLabel = hasMessages
      ? formatRelativeTime(latestRoomActivity)
      : "No messages yet";

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

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-(--color-border) bg-(--color-page) px-3 py-1 text-xs font-medium text-(--color-muted)">
                {input.room.memberCount} member
                {input.room.memberCount === 1 ? "" : "s"}
              </span>
              <span className="rounded-full border border-(--color-border) bg-(--color-page) px-3 py-1 text-xs font-medium text-(--color-muted)">
                {input.room.messageCount} message
                {input.room.messageCount === 1 ? "" : "s"}
              </span>
              <span className="rounded-full border border-(--color-border) bg-(--color-page) px-3 py-1 text-xs font-medium text-(--color-muted)">
                Last activity {lastActivityLabel}
              </span>
            </div>
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
