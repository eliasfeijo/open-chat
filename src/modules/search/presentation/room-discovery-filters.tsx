import Link from "next/link";
import type { ReactElement } from "react";

import type { Tag } from "@/modules/tags";

type RoomDiscoveryFiltersProps = Readonly<{
  activeQuery: string;
  activeTagSlug: string;
  availableTags: Tag[];
}>;

export function RoomDiscoveryFilters({
  activeQuery,
  activeTagSlug,
  availableTags,
}: RoomDiscoveryFiltersProps): ReactElement {
  const hasActiveFilters = activeQuery !== "" || activeTagSlug !== "";
  const hasAvailableTags = availableTags.length > 0;
  const orderedTags = [...availableTags].sort((leftTag, rightTag) => {
    const leftIsActive = leftTag.slug === activeTagSlug;
    const rightIsActive = rightTag.slug === activeTagSlug;

    if (leftIsActive === rightIsActive) {
      return 0;
    }

    return leftIsActive ? -1 : 1;
  });

  function buildTagFilterHref(tagSlug: string) {
    const params = new URLSearchParams();

    if (activeQuery !== "") {
      params.set("q", activeQuery);
    }

    if (tagSlug !== "") {
      params.set("tag", tagSlug);
    }

    const queryString = params.toString();

    return queryString === "" ? "/rooms" : `/rooms?${queryString}`;
  }

  return (
    <section className="rounded-[1.75rem] border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
      <div className="flex flex-col gap-5">
        <form
          action="/rooms"
          className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(12rem,0.8fr)_auto] lg:items-end"
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

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-(--color-muted)">
              Browse by tag
            </p>
            {hasActiveFilters ? (
              <Link
                className="inline-flex items-center text-sm font-medium text-(--color-accent) transition hover:brightness-110"
                href="/rooms"
              >
                Clear filters
              </Link>
            ) : null}
          </div>

          {hasAvailableTags ? (
            <div className="flex flex-wrap gap-2">
              <Link
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  activeTagSlug === ""
                    ? "bg-(--color-accent) text-(--color-accent-foreground)"
                    : "border border-(--color-border) bg-(--color-page) text-(--color-muted) hover:text-(--color-accent)"
                }`}
                href={buildTagFilterHref("")}
              >
                All tags
              </Link>

              {orderedTags.map((tag) => {
                const isActiveTag = activeTagSlug === tag.slug;

                return (
                  <Link
                    key={tag.id}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      isActiveTag
                        ? "bg-(--color-accent) text-(--color-accent-foreground)"
                        : "border border-(--color-border) bg-(--color-page) text-(--color-muted) hover:text-(--color-accent)"
                    }`}
                    href={buildTagFilterHref(isActiveTag ? "" : tag.slug)}
                  >
                    #{tag.slug}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-(--color-muted)">
              No tags available yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
