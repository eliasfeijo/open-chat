import Link from "next/link";
import type { ReactElement } from "react";

type RoomDiscoveryFiltersProps = Readonly<{
  activeQuery: string;
  activeTagSlug: string;
}>;

export function RoomDiscoveryFilters({
  activeQuery,
  activeTagSlug,
}: RoomDiscoveryFiltersProps): ReactElement {
  const hasActiveFilters = activeQuery !== "" || activeTagSlug !== "";

  return (
    <section className="rounded-[1.75rem] border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <form
          action="/rooms"
          className="grid flex-1 gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(12rem,0.8fr)_auto]"
        >
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="room-discovery-query"
            >
              Search rooms
            </label>
            <input
              className="w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
              defaultValue={activeQuery}
              id="room-discovery-query"
              name="q"
              placeholder="Search by room name, topic, or description"
              type="search"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="room-discovery-tag">
              Filter by tag
            </label>
            <input
              className="w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
              defaultValue={activeTagSlug}
              id="room-discovery-tag"
              name="tag"
              placeholder="typescript"
              type="text"
            />
          </div>

          <button
            className="inline-flex items-center justify-center rounded-full bg-(--color-accent) px-6 py-3 text-sm font-semibold text-(--color-accent-foreground) transition hover:brightness-110"
            type="submit"
          >
            Discover rooms
          </button>
        </form>

        {hasActiveFilters ? (
          <Link
            className="inline-flex items-center text-sm font-medium text-(--color-accent) transition hover:brightness-110"
            href="/rooms"
          >
            Clear filters
          </Link>
        ) : null}
      </div>
    </section>
  );
}
