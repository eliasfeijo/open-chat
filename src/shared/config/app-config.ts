export const appConfig = {
  name: "RoomSurf",
  siteUrl: "https://room.surf",
  description:
    "Public-first chat for discoverable conversations. Surf public rooms, discover active communities, and join realtime discussions.",
  seoKeywords: [
    "public chat",
    "public communities",
    "discoverable conversations",
    "realtime discussion",
    "chat rooms",
  ],
  initialModules: ["auth", "users", "rooms", "tags", "messages", "search"],
  foundationAreas: [
    {
      name: "Application shell",
      description:
        "Next.js App Router, Tailwind CSS, and shared providers establish the web baseline without hiding architectural decisions.",
    },
    {
      name: "Project boundaries",
      description:
        "Feature-first modules, explicit docs, and ADRs keep implementation work inside clear ownership lines from the first commit onward.",
    },
    {
      name: "Tooling baseline",
      description:
        "Vitest, Playwright, Drizzle generation, and environment contracts are present before feature code starts to accumulate.",
    },
  ],
} as const;
