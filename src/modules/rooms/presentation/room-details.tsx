import type { ReactElement } from "react";

import type { Room } from "@/modules/rooms";
import type { UserProfile } from "@/modules/users";

type RoomDetailsProps = Readonly<{
  currentUserId: string;
  ownerProfile: UserProfile | null;
  room: Room;
}>;

export function RoomDetails({
  currentUserId,
  ownerProfile,
  room,
}: RoomDetailsProps): ReactElement {
  return (
    <section className="space-y-6 rounded-4xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-page) px-3 py-1 text-xs font-medium text-(--color-muted)">
              /{room.slug}
            </span>
            <span className="inline-flex rounded-full bg-(--color-page) px-3 py-1 text-xs font-medium text-(--color-muted)">
              {room.ownerUserId === currentUserId
                ? "You own this room"
                : "Public room"}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {room.name}
            </h1>

            {room.topic ? (
              <p className="text-lg font-medium text-(--color-foreground)">
                {room.topic}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
            Description
          </h2>
          <p className="text-base leading-8 text-(--color-muted)">
            {room.description ?? "No description yet."}
          </p>
        </div>

        <dl className="grid gap-4 rounded-3xl border border-(--color-border) bg-(--color-page) p-5">
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
              Owner
            </dt>
            <dd className="space-y-1 text-sm text-(--color-foreground)">
              <p className="font-medium">
                {ownerProfile?.username
                  ? `@${ownerProfile.username}`
                  : "Profile pending setup"}
              </p>
              <p className="break-all text-(--color-muted)">
                {room.ownerUserId}
              </p>
              {ownerProfile?.bio ? (
                <p className="leading-6 text-(--color-muted)">
                  {ownerProfile.bio}
                </p>
              ) : null}
            </dd>
          </div>

          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
              Created
            </dt>
            <dd className="text-sm text-(--color-foreground)">
              {room.createdAt.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
