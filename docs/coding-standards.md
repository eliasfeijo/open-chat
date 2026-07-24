# OpenChat Coding Standards

## Purpose

This document defines the implementation standards for OpenChat.

It translates the architecture and project principles into concrete coding rules that contributors can apply during day-to-day work.

If a proposed implementation is valid TypeScript but conflicts with this document, the implementation is not acceptable for this repository.

---

## Relationship To Other Documents

Use this document together with:

- `AGENTS.md`
- `docs/architecture.md`
- `docs/project-principles.md`
- relevant ADRs in `docs/adr/`

This document does not replace the architecture. It defines how code should look and behave within the established architecture.

---

## Core Standards

All code in OpenChat should optimize for:

- readability
- explicitness
- maintainability
- testability
- small coherent units
- predictable AI-assisted generation

OpenChat does not optimize for cleverness, dense abstractions, or speculative extensibility.

---

## Language Standards

The entire application is written in TypeScript.

Rules:

- use strict TypeScript settings
- do not use `any`
- prefer `unknown` when a value is truly unknown
- prefer explicit return types on exported functions when they clarify contracts
- model inputs and outputs with explicit types or schemas

Why:

TypeScript is part of the repository's architectural discipline, not only a developer convenience.

---

## Module Structure Standards

OpenChat is organized by feature modules.

Each feature module owns its own:

- `domain`
- `application`
- `infrastructure`
- `api`
- `validation`

Canonical example:

```text
rooms/
	domain/
	application/
	infrastructure/
	api/
	validation.ts
```

Rules:

- place new behavior in the owning module
- keep cross-module imports minimal and explicit
- do not access another module's infrastructure implementation directly
- keep shared code technical rather than domain-specific

Do not reorganize feature behavior into generic root-level folders such as `services`, `controllers`, or `repositories` as the primary project structure.

---

## Layer Standards

### Domain Layer

Use the domain layer for:

- entities
- value objects
- business invariants
- domain policies
- domain-specific errors

Do not place in the domain layer:

- React code
- Next.js code
- Drizzle queries
- Redis access
- request or response objects

### Application Layer

Use the application layer for:

- use cases
- orchestration
- authorization checks
- transaction control
- coordination between domain and infrastructure

Rules:

- prefer one primary use case per file when practical
- keep business workflows explicit
- keep framework request and response types out of application code

### Infrastructure Layer

Use the infrastructure layer for:

- Drizzle repositories
- Redis adapters
- external service integrations
- persistence mapping

Rules:

- repositories do not contain business logic
- infrastructure code may optimize access patterns but may not redefine business behavior
- transaction boundaries should remain visible at the application level

### API And WebSocket Entry Points

Use transport layers for:

- parsing requests or events
- validating external input
- resolving authentication context
- calling application services
- mapping results to transport responses

Rules:

- route handlers remain thin
- WebSocket handlers remain thin
- neither layer owns business policy
- neither layer accesses repositories directly when an application use case should own the flow

### UI Layer

Use the UI layer for:

- rendering
- form handling
- interaction behavior
- client-side state and subscription consumption

Rules:

- no React component accesses Drizzle
- no React component owns business rules
- server state belongs in TanStack Query
- local shared client state should use Zustand only when local component state is insufficient

---

## Naming Standards

Names should describe business intent clearly.

Prefer names such as:

- `createRoom`
- `updateRoomDetails`
- `joinRoom`
- `leaveRoom`
- `sendMessage`
- `searchRooms`

Avoid names such as:

- `process`
- `handle`
- `manager`
- `helper`
- `service`

Rules:

- file names should reflect the primary use case or concept they contain
- exported symbols should be explicit enough to understand without scanning the implementation first
- domain errors should use domain language, for example `RoomNotFoundError`

---

## Function And File Size Standards

Prefer:

- files under roughly 300 lines when practical
- functions under roughly 40 lines when practical
- one primary responsibility per file
- one clear reason to change per function

These are guidelines, not arbitrary limits.

The rule behind them is more important than the number: small, explicit units are easier to test, review, and extend.

---

## Validation Standards

All external input must be validated with Zod.

This includes:

- route params
- query strings
- request bodies
- server action input
- WebSocket payloads

Rules:

- validation schemas belong to the owning feature
- do not rely on TypeScript types alone for runtime safety
- validate as close to the system boundary as possible
- higher-level business invariants may still be enforced inside the application or domain layers

---

## Data And Persistence Standards

PostgreSQL is the source of truth.

Redis is used only for ephemeral or derived state.

Rules:

- durable data is written to PostgreSQL
- durable messages are never stored only in Redis
- repositories should remain SQL-friendly and explicit
- avoid ORM magic and hidden behavior
- use explicit migrations for schema changes

Why:

The repository favors clear persistence behavior over abstraction-heavy data access patterns.

---

## Error Handling Standards

Expected business failures must be explicit.

Rules:

- do not throw generic `Error` for expected business conditions
- use domain-specific error names
- keep error semantics stable across layers
- map errors deliberately at transport boundaries

Examples:

- `RoomNotFoundError`
- `UserAlreadyJoinedError`
- `PermissionDeniedError`

---

## State Management Standards

Use the smallest state mechanism that correctly models the problem.

Rules:

- server state belongs in TanStack Query
- local UI state belongs in component state unless it must be shared
- Zustand is allowed for shared client-side state when warranted
- form state belongs in React Hook Form
- business state does not belong in ad hoc client-side stores

Why:

Separating server, UI, and form concerns keeps the frontend predictable and reduces accidental complexity.

---

## Testing Standards

Tests are required for meaningful code changes.

Expectations:

- domain and application logic should be covered with Vitest
- end-to-end user flows should be covered with Playwright when relevant
- bug fixes should include regression tests when practical
- tests should verify behavior, not implementation trivia

Rules:

- keep business logic testable without framework-heavy setup where possible
- avoid coupling tests to unstable internal details
- prefer focused tests over broad fragile ones

---

## Immutability And Composition Standards

Prefer immutable objects where practical.

Prefer pure functions where practical.

Prefer composition over inheritance.

Why:

These defaults reduce hidden side effects and align well with both modular architecture and AI-assisted maintenance.

They are preferences, not dogma. Use mutation or stateful objects when the problem genuinely requires them, but do so deliberately.

---

## Import And Dependency Standards

Imports should make dependency direction obvious.

Rules:

- do not import from another module's infrastructure folder
- do not import database code into UI code
- do not import framework-specific transport types into domain code
- keep shared utilities small and technical

Avoid broad utility folders that accumulate unrelated behavior.

If code becomes widely reused, first ask whether the reuse is technical or whether it signals missing module boundaries.

---

## Documentation Standards

Code changes must be accompanied by documentation updates when they affect:

- architecture
- contributor expectations
- schema or infrastructure behavior
- module ownership or naming rules
- feature behavior that future contributors need to understand

Relevant documents include:

- `README.md`
- `docs/architecture.md`
- `docs/project-principles.md`
- `docs/roadmap.md`
- `docs/adr/`
- `docs/ai/prompting-guide.md`

---

## Forbidden Patterns

Do not:

- put business logic in React components
- put business logic in route handlers
- put business logic in WebSocket gateway handlers
- put business logic in repositories
- bypass Zod validation at external boundaries
- access another feature's database layer directly
- create generic dumping-ground utilities
- introduce new architectural styles without an ADR

These are not suggestions. They are repository rules.
