# ADR 0002: Technology Stack

## Status

Accepted

## Context

OpenChat is intentionally optimized for maintainability, clarity, low operational overhead, and AI-assisted development.

The MVP needs to ship public rooms, search, messaging, presence, and authentication without splitting the system into separate codebases or operational stacks.

The selected stack must support:

- one primary language across frontend and backend
- explicit architecture boundaries
- good TypeScript ergonomics
- low-cost deployment
- straightforward local development
- strong tool support for human and AI contributors

## Problem

The project needs a coherent technology stack that minimizes accidental complexity while still supporting realtime messaging, room search, authentication, and durable persistence.

Without an explicit stack decision, contributors would introduce inconsistent frameworks, multiple languages, or overlapping libraries that make the system harder to evolve.

## Decision

OpenChat adopts the following core stack.

- Language: TypeScript
- Frontend framework: Next.js with App Router
- UI styling: Tailwind CSS
- UI primitives: shadcn/ui
- Server entry points: Next.js Route Handlers and Server Actions
- Authentication: Better Auth
- Validation: Zod
- Database: PostgreSQL
- ORM: Drizzle ORM
- Cache and ephemeral coordination: Redis
- Realtime transport: native WebSockets
- Server-state fetching and caching: TanStack Query
- Client shared state: Zustand when local component state is insufficient
- Forms: React Hook Form
- Unit and integration testing: Vitest
- End-to-end testing: Playwright
- Deployment: Vercel, Neon PostgreSQL, and Upstash Redis

## Rationale By Technology

### TypeScript

Why it was chosen:

- one language across the full stack reduces context switching
- strict typing improves maintainability and AI-generated code quality
- the ecosystem aligns well with Next.js, Zod, Drizzle, and Better Auth

Rejected alternatives:

- Go for the backend was rejected for the MVP because it would create a two-language system before the product requires that complexity
- JavaScript without strict typing was rejected because it weakens architecture enforcement and tool feedback

### Next.js App Router

Why it was chosen:

- provides a mature React ecosystem
- supports server components and route handlers in one framework
- fits the modular monolith deployment model
- has strong TypeScript support and strong AI tool familiarity

Rejected alternatives:

- Remix was rejected because the team has stronger alignment with the Next.js ecosystem and community support
- a separate React SPA plus custom API server was rejected because it increases deployment and coordination overhead

### Tailwind CSS and shadcn/ui

Why they were chosen:

- fast development without introducing a heavy component framework
- explicit styling with low abstraction cost
- shadcn/ui keeps components in the repository rather than hiding them behind a package API

Rejected alternatives:

- Material UI was rejected because it imposes a stronger design system and abstraction model than needed
- CSS-in-JS solutions were rejected because they add runtime and cognitive overhead without solving a core MVP problem

### Route Handlers and Server Actions

Why they were chosen:

- keep the transport model simple inside a single framework
- reduce the need for a separate API platform in the MVP
- allow thin entry points that delegate to application services

Rejected alternatives:

- a separate Express or Fastify server was rejected because it adds a second server composition layer without a clear product benefit

### Better Auth

Why it was chosen:

- modern authentication support for Next.js
- good TypeScript ergonomics
- reduces custom authentication implementation risk

Rejected alternatives:

- rolling custom authentication was rejected because auth is a security-sensitive commodity problem
- Lucia was not selected because Better Auth provides a more aligned developer experience for the intended stack

### Zod

Why it was chosen:

- explicit runtime validation at boundaries
- strong TypeScript inference
- aligns with the rule that every external input must be validated

Rejected alternatives:

- class-validator style decorator validation was rejected because it hides validation behind framework-like patterns
- relying only on TypeScript types was rejected because types do not validate runtime input

### PostgreSQL

Why it was chosen:

- relational data model fits users, rooms, memberships, tags, and messages well
- transactions matter for chat integrity and membership operations
- built-in full-text search is sufficient for the initial room search scope

Rejected alternatives:

- MongoDB was rejected because the core data model is relational and consistency is more important than schema flexibility
- SQLite was rejected for the production target because concurrent multi-user workloads and deployment expectations exceed its intended role

### Drizzle ORM

Why it was chosen:

- SQL-first approach aligns with the repository philosophy
- explicit queries are easier to understand and review
- strong type inference without hiding SQL behavior
- AI tools generate Drizzle code reliably

Rejected alternatives:

- Prisma was rejected because it introduces more abstraction, generated client magic, and a less SQL-first workflow than desired
- raw SQL everywhere was rejected because it would duplicate boilerplate and lose useful type safety

### Redis

Why it was chosen:

- good fit for ephemeral presence, typing, and subscription state
- useful for multi-instance fan-out and coordination
- operationally simple in the chosen hosting model

Rejected alternatives:

- storing all transient state in application memory only was rejected because it does not scale cleanly across instances
- using Redis as a durable message store was rejected because it violates the source-of-truth rule

### Native WebSockets

Why it was chosen:

- minimal protocol overhead
- enough browser support for the target audience
- explicit protocol design fits the architecture philosophy

Rejected alternatives:

- Socket.IO was rejected because fallback transports, custom protocol behavior, and extra abstraction are not needed for the MVP

### TanStack Query, Zustand, and React Hook Form

Why they were chosen:

- TanStack Query clearly separates server state from UI state
- Zustand is reserved for small shared client-state cases without introducing heavier patterns
- React Hook Form works well with Zod and keeps form logic explicit

Rejected alternatives:

- Redux was rejected because it introduces more ceremony than the MVP needs
- ad hoc fetch state in many components was rejected because it leads to duplication and inconsistency

### Vitest and Playwright

Why they were chosen:

- Vitest is fast, modern, and well aligned with the TypeScript toolchain
- Playwright provides strong browser-level coverage for critical flows

Rejected alternatives:

- Jest was rejected because Vitest provides a simpler modern fit for the intended toolchain
- Cypress was rejected because Playwright better matches the team's target for end-to-end coverage and browser automation

### Vercel, Neon, and Upstash

Why they were chosen:

- low operational overhead
- cost-efficient for early stages
- strong alignment with the chosen application model

Rejected alternatives:

- self-managed infrastructure was rejected because the MVP does not justify that operational burden
- Kubernetes was rejected because it solves scaling and platform concerns that do not exist yet

## Alternatives Considered

### Split frontend and backend into separate services

Rejected because it would add deployment, versioning, and coordination complexity without solving an MVP bottleneck.

### Go backend with Next.js frontend

Rejected for now because one-language development produces faster implementation, simpler onboarding, and more consistent AI-assisted output.

### Prisma instead of Drizzle

Rejected because Drizzle better supports the project's SQL-first and explicitness-oriented philosophy.

### Socket.IO instead of native WebSockets

Rejected because the project does not need transport fallbacks or custom protocol abstractions for its initial target.

## Consequences

Positive consequences:

- consistent developer experience across the stack
- explicit architecture that is easier to preserve
- lower operational cost for the MVP
- strong support for AI-assisted implementation

Negative consequences:

- Next.js becomes a central dependency for both UI and API delivery
- some selected libraries constrain patterns contributors may prefer
- native WebSockets require explicit protocol handling work

## Trade-offs

The chosen stack favors clarity and coherence over optionality.

This means contributors have fewer degrees of freedom, but the resulting system is easier to understand and extend safely.

The main trade-off is deliberate lock-in to a well-integrated TypeScript-first toolchain during the MVP period.

## Future Evolution

Potential future changes that do not invalidate this decision:

- add Meilisearch or OpenSearch when PostgreSQL search is insufficient
- add object storage for uploads when attachments become a product requirement
- extract selected infrastructure into separate deployables only after the modular boundaries prove stable

Any change to the core stack must be justified by measured pain, not preference.
