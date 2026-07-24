# OpenChat AI Prompting Guide

## Purpose

This guide defines how AI assistants should work in the OpenChat repository.

It is not a general prompting tutorial. It is a repository-specific operating guide intended to keep AI-generated work aligned with the documented architecture.

Use this guide together with the architecture and coding standards documents.

---

## Required Reading Before Implementation

Before implementing any feature, bug fix, refactor, or schema change, read the following documents in this order:

1. `AGENTS.md`
2. `docs/architecture.md`
3. `docs/project-principles.md`
4. `docs/coding-standards.md`
5. relevant ADRs in `docs/adr/`

Why this order:

- `AGENTS.md` defines repository-wide operating rules
- `docs/architecture.md` defines the canonical system structure
- `docs/project-principles.md` defines invariants and decision rules
- `docs/coding-standards.md` defines implementation-level expectations
- ADRs explain why specific architecture choices were made

If the requested work conflicts with these documents, the AI assistant must follow the documented architecture unless the user explicitly asks to change the architecture itself.

---

## Primary Rule

AI may implement architecture.

AI must not invent architecture.

This rule overrides convenience.

If a task appears easier with a new pattern, framework, abstraction, folder structure, or dependency, do not introduce it unless the repository already uses it or the change is explicitly justified and documented.

---

## Repository Model

OpenChat is a modular monolith.

Every feature belongs to a module and each module owns its own:

- domain
- application
- infrastructure
- api
- validation

Current primary modules are:

- auth
- users
- rooms
- tags
- messages
- search

Do not reorganize work into generic root-level folders such as `services`, `controllers`, or `repositories` as the primary structure.

---

## How To Start Any Task

For every implementation task, follow this sequence:

1. Identify the relevant module.
2. Identify the affected layer or layers.
3. Confirm the dependency direction is valid.
4. Locate existing naming and file patterns in nearby code.
5. Implement the smallest complete change that fits the architecture.
6. Add or update tests.
7. Update documentation if behavior, architecture, or contributor expectations changed.

Questions to answer before writing code:

- Which module owns this behavior?
- Is this a domain rule, application use case, infrastructure concern, API concern, or UI concern?
- Does the change require an ADR?
- Does the change introduce a new external input boundary that needs Zod validation?
- Does the change alter durable data and therefore require a migration?

---

## Layer Rules

### Domain Layer

Allowed:

- business invariants
- value objects
- domain entities
- domain errors
- pure policy functions

Not allowed:

- React code
- Next.js code
- Drizzle queries
- Redis access
- request or response objects

### Application Layer

Allowed:

- use cases
- orchestration
- transaction boundaries
- authorization checks
- coordination between domain and infrastructure

Not allowed:

- direct UI logic
- transport-specific response formatting
- hidden business rules inside repositories

### Infrastructure Layer

Allowed:

- Drizzle repositories
- Redis adapters
- external service integrations
- persistence mapping

Not allowed:

- ownership of business policy
- framework-driven orchestration

### API And WebSocket Entry Points

Allowed:

- request parsing
- Zod validation
- authentication context resolution
- mapping input to application services
- mapping results to transport responses

Not allowed:

- direct business rule implementation
- direct repository orchestration that bypasses application services

### UI Layer

Allowed:

- rendering
- user interaction
- form handling
- client-side state
- realtime subscription consumption

Not allowed:

- durable business logic
- database access
- domain rule ownership

---

## Validation Rules

All external input must be validated.

Required cases:

- HTTP params
- HTTP query strings
- HTTP bodies
- WebSocket payloads
- server action input

Use Zod schemas owned by the relevant feature.

Do not rely on TypeScript types alone for runtime validation.

---

## Naming Rules

Prefer explicit action-oriented names.

Good examples:

- `createRoom`
- `updateRoomDetails`
- `joinRoom`
- `leaveRoom`
- `sendMessage`
- `searchRooms`

Avoid generic names.

Bad examples:

- `process`
- `handle`
- `manager`
- `helper`
- `service`

When in doubt, choose a name that makes the use case clear without reading the file body.

---

## File And Function Shape

Prefer:

- small files
- small functions
- one primary use case per file when practical
- composition over inheritance
- explicit imports over deep indirection

Avoid:

- giant multi-purpose service files
- utility dumping grounds
- generic abstractions introduced before repeated need exists

Why:

OpenChat is intentionally optimized for maintainability and AI comprehension. Smaller explicit units produce more predictable code generation and easier review.

---

## Data And Realtime Rules

Durable data rules:

- PostgreSQL is the source of truth
- Redis is ephemeral only
- durable messages must be stored in PostgreSQL before being treated as committed

Realtime rules:

- use native WebSockets
- keep subscriptions explicit and room-scoped
- presence and typing are ephemeral
- business actions over WebSocket still go through the application layer

Do not:

- store durable messages in Redis
- move business logic into gateway handlers
- introduce Socket.IO-style abstractions unless the architecture is intentionally changed

---

## Testing Expectations

AI-generated changes must include appropriate tests.

Minimum expectation:

- application and domain logic should have Vitest coverage
- critical user flows should be covered by Playwright when relevant
- bug fixes should include regression coverage when practical

Do not leave tests for later.

---

## Documentation Expectations

Documentation must be updated when any of the following changes:

- architecture rules
- contributor workflow
- feature behavior that affects future implementation decisions
- repository conventions
- schema or infrastructure expectations that matter to contributors

At minimum, consider whether the change requires updates to:

- `docs/architecture.md`
- `docs/project-principles.md`
- `docs/coding-standards.md`
- `docs/roadmap.md`
- `docs/adr/`
- `README.md`

---

## Forbidden AI Behaviors

Do not:

- invent a new architectural style
- add placeholders or TODO-based pseudo-implementations
- bypass validation
- put business logic in UI, API, or repository layers
- add new dependencies without justification
- silently create cross-module coupling
- use generic `Error` for expected business failures
- optimize for hypothetical scale instead of current product needs

---

## Prompt Template For Feature Work

When asking an AI assistant to implement a feature, use prompts that contain:

- the product behavior to implement
- the owning module
- the relevant architectural constraints
- the expected validation behavior
- the expected tests
- any documentation updates required

Example structure:

```text
Implement room join behavior in the rooms module.

Constraints:
- Follow AGENTS.md, docs/architecture.md, docs/project-principles.md, and docs/coding-standards.md.
- Keep business logic in the application layer.
- Validate external input with Zod.
- Do not access another module's infrastructure layer.
- Add Vitest coverage for membership rules.
- Update documentation if contributor-facing behavior changes.
```

This style produces better results than vague prompts because it reduces architectural ambiguity.
