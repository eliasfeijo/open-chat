# OpenChat

OpenChat is an open-source public chat platform for discoverable conversations.

The product goal is to make public rooms easy to create, easy to browse, and easy to search. The intended shape is closer to Reddit meets IRC than to a full closed-community platform.

Unlike Discord, OpenChat treats discoverability and public search as core product characteristics rather than secondary features.

---

## MVP Scope

The initial product scope is intentionally narrow.

Users can:

- create an account
- authenticate
- edit a profile
- create public rooms
- define room name, description, topic, and tags
- browse rooms
- search rooms
- join rooms
- leave rooms
- send messages
- receive realtime room updates
- see online users in active rooms

Explicitly not in V1:

- private messages
- threads
- reactions
- uploads
- voice
- video
- bots
- moderation systems
- notifications
- federation

---

## Project Principles

OpenChat intentionally optimizes for:

- maintainability
- clarity
- simplicity
- incremental evolution
- AI-assisted development
- low operational overhead

The project does not optimize for premature scale or premature architectural flexibility.

Core architectural rules:

- modular monolith
- PostgreSQL as the source of truth
- Redis only for ephemeral state
- business logic independent from frameworks
- feature ownership over generic technical folders
- explicit code over hidden behavior

---

## Technology Stack

Frontend:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form

Backend:

- Next.js Route Handlers
- Server Actions
- Native WebSockets

Platform and data:

- Better Auth
- Zod
- PostgreSQL
- Drizzle ORM
- Redis

Testing:

- Vitest
- Playwright

Deployment:

- Vercel
- Neon PostgreSQL
- Upstash Redis

---

## Repository Shape

```text
src/
	app/
	modules/
		auth/
		users/
		rooms/
		tags/
		messages/
		search/
	db/
	lib/
	shared/
	websocket/
```

Modules own their own domain, application, infrastructure, API, and validation surfaces.

---

## Documentation

Canonical documentation lives in:

- docs/architecture.md
- docs/project-principles.md
- docs/coding-standards.md
- docs/roadmap.md
- docs/adr/0001-modular-monolith.md
- docs/adr/0002-tech-stack.md
- docs/adr/0003-realtime.md
- docs/adr/0004-data-storage.md

Read the architecture and ADR set before changing architectural direction.

---

## AI Contribution

This repository is designed for AI-assisted development.

Before generating code, review:

- AGENTS.md
- .github/copilot-instructions.md
- docs/architecture.md
- docs/project-principles.md

AI assistants should implement within the documented architecture and must not invent new architectural patterns.

---

## Development

Prerequisites:

- Node.js 20.9 or newer
- pnpm 11.17 or newer

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Run the baseline validation checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run end-to-end tests:

```bash
pnpm test:e2e
```

Generate database migrations after schema changes:

```bash
pnpm db:generate
```

---

## First Commit Baseline

The initial scaffold is expected to provide:

- Next.js App Router application under `src/app`
- feature-first module structure under `src/modules`
- shared configuration and environment contracts
- Vitest and Playwright baseline test setup
- Drizzle migration generation configuration
- documentation and ADRs aligned with the intended architecture

The first functional application slices should build on this baseline instead of reshaping it.
