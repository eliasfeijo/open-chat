import type { ReactElement } from "react";

import type { Room } from "@/modules/rooms";

type RoomsListProps = Readonly<{
  currentUserId: string;
  rooms: Room[];
}>;

export function RoomsList({
  currentUserId,
  rooms,
}: RoomsListProps): ReactElement {
  if (rooms.length === 0) {
    return (
      <div className="rounded-4xl border border-dashed border-(--color-border) bg-(--color-surface) p-8 text-sm leading-7 text-(--color-muted)">
        No rooms yet. Create the first public room for this workspace slice.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {rooms.map((room) => (
        <article
          key={room.id}
          className="rounded-[1.75rem] border border-(--color-border) bg-(--color-surface) p-6 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-(--color-foreground)">
                  {room.name}
                </h2>
                <span className="rounded-full border border-(--color-border) bg-(--color-page) px-3 py-1 text-xs font-medium text-(--color-muted)">
                  /{room.slug}
                </span>
              </div>

              {room.topic ? (
                <p className="text-sm font-medium text-(--color-foreground)">
                  {room.topic}
                </p>
              ) : null}

              <p className="text-sm leading-7 text-(--color-muted)">
                {room.description ?? "No description yet."}
              </p>
            </div>

            <span className="rounded-full bg-(--color-page) px-3 py-1 text-xs font-medium text-(--color-muted)">
              {room.ownerUserId === currentUserId
                ? "You own this room"
                : "Public room"}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
