import Link from "next/link";
import type { ReactElement } from "react";

import { getAuthenticatedUser } from "@/modules/auth";
import { NavigationBar } from "@/modules/auth/presentation/navigation-bar";
import { appConfig } from "@/shared/config/app-config";

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: appConfig.name,
  description: appConfig.description,
  url: appConfig.siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    "query-input": "required name=search_term_string",
    target: `${appConfig.siteUrl}/rooms?q={search_term_string}`,
  },
};

const liveTodayChecklist = [
  "Create a public profile with a recognizable handle",
  "Create and discover public rooms",
  "Join conversations instantly",
  "Post durable messages with realtime updates",
  "Use tags and search to find relevant communities",
];

const productPillars = [
  {
    description:
      "Rooms are public by default so communities are visible without private invite links.",
    name: "Public-first",
  },
  {
    description:
      "Messages appear live, so each room feels like a real conversation instead of a delayed thread.",
    name: "Live by default",
  },
  {
    description:
      "Search and tags are first-class features, making conversations easier to revisit and discover.",
    name: "Discoverable",
  },
];

const guestHighlights = [
  {
    description:
      "Browse any public room before creating an account. Read first, decide later.",
    title: "Open doors",
  },
  {
    description:
      "Search by topic and tags to find people obsessing over the exact thing you came for.",
    title: "Find your people",
  },
  {
    description:
      "Join when ready and post with your identity attached, so the conversation stays human.",
    title: "Speak with context",
  },
];

export default async function Home(): Promise<ReactElement> {
  const authenticatedUser = await getAuthenticatedUser();

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-(--color-page)">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      <NavigationBar />
      <div className="absolute inset-x-0 top-0 -z-10 h-128 bg-[radial-gradient(circle_at_top,rgba(217,119,6,0.18),transparent_48%),radial-gradient(circle_at_left,rgba(14,116,144,0.18),transparent_32%)]" />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-end">
          <div className="space-y-8">
            <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1 text-xs font-medium text-(--color-muted) shadow-sm sm:px-4 sm:text-sm">
              {authenticatedUser
                ? `Signed in as ${authenticatedUser.name}`
                : "Read first. Join when ready."}
            </span>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-(--color-foreground) sm:text-5xl lg:text-6xl">
                {authenticatedUser
                  ? "Public conversations that stay discoverable."
                  : "Conversations worth reading, before you even sign in."}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-(--color-muted) sm:text-lg sm:leading-8 lg:text-xl">
                {authenticatedUser
                  ? "OpenChat helps people create, find, and join public rooms without hidden invites. If it matters to a community, it should be easy to find and easy to join."
                  : "Explore public rooms like a curious passerby, then join the ones that feel like home. No invite maze, no secret handshake, just discoverable conversations."}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Link
                className="inline-flex w-full items-center justify-center rounded-full bg-(--color-accent) px-6 py-3 text-sm font-semibold text-(--color-accent-foreground) transition hover:brightness-110 md:w-auto"
                href={
                  authenticatedUser
                    ? "/profile"
                    : "/sign-up?redirectTo=/profile"
                }
              >
                {authenticatedUser ? "Continue to profile" : "Join OpenChat"}
              </Link>
              <Link
                className="inline-flex w-full items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) px-6 py-3 text-sm font-semibold text-(--color-foreground) transition hover:bg-(--color-surface-strong) md:w-auto"
                href="/rooms"
              >
                Browse rooms
              </Link>
              {authenticatedUser ? (
                <Link
                  className="inline-flex w-full items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) px-6 py-3 text-sm font-semibold text-(--color-foreground) transition hover:bg-(--color-surface-strong) md:w-auto"
                  href="/profile"
                >
                  Edit profile
                </Link>
              ) : (
                <a
                  className="inline-flex w-full items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) px-6 py-3 text-sm font-semibold text-(--color-foreground) transition hover:bg-(--color-surface-strong) md:w-auto"
                  href="#how-it-works"
                >
                  How it works
                </a>
              )}
            </div>
          </div>

          <aside className="rounded-4xl border border-(--color-border) bg-(--color-surface) p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--color-muted)">
              Live today
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-(--color-foreground)">
              {liveTodayChecklist.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-(--color-accent)" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {!authenticatedUser ? (
              <p className="mt-5 rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-sm leading-6 text-(--color-muted)">
                Read as much as you want. Posting unlocks after sign in and
                joining a room.
              </p>
            ) : null}
          </aside>
        </div>

        <section id="highlights" className="grid gap-6 md:grid-cols-3">
          {productPillars.map((area) => (
            <article
              key={area.name}
              className="rounded-[1.75rem] border border-(--color-border) bg-(--color-surface) p-6 shadow-sm"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-muted)">
                {area.name}
              </p>
              <p className="mt-3 text-base leading-7 text-(--color-foreground)">
                {area.description}
              </p>
            </article>
          ))}
        </section>

        {authenticatedUser ? (
          <section
            id="modules"
            className="rounded-4xl border border-(--color-border) bg-(--color-surface-strong) p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-(--color-foreground)">
                  Product scope with clear boundaries
                </h2>
                <p className="text-base leading-7 text-(--color-muted)">
                  OpenChat keeps a focused scope while growing deliberately. The
                  modules below cover the current product and keep delivery
                  reliable as new features arrive.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-120">
                {appConfig.initialModules.map((moduleName) => (
                  <div
                    key={moduleName}
                    className="rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-sm font-medium text-(--color-foreground)"
                  >
                    {moduleName}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section id="how-it-works" className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-(--color-foreground)">
                How OpenChat feels for new visitors
              </h2>
              <p className="text-base leading-7 text-(--color-muted)">
                You can browse first, find signal quickly, and only sign in when
                you are ready to contribute.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {guestHighlights.map((highlight) => (
                <article
                  key={highlight.title}
                  className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
                    {highlight.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-(--color-foreground)">
                    {highlight.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
