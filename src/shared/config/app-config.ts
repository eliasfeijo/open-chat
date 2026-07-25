export const appConfig = {
  name: "OpenChat",
  description:
    "OpenChat is an open-source public-first chat platform where rooms are discoverable, conversations are live, and communities are easy to find.",
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
