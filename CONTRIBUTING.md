# Contributing To OpenChat

## Purpose

This document defines how contributors should propose, implement, validate, and document changes in OpenChat.

The goal is not only to keep the repository clean. It is to preserve the documented architecture as the codebase grows through contributions from both humans and AI assistants.

---

## Before You Start

Read these documents before implementing non-trivial changes:

- `AGENTS.md`
- `docs/architecture.md`
- `docs/project-principles.md`
- `docs/coding-standards.md`
- relevant ADRs in `docs/adr/`

If the change touches contributor workflow or AI usage, also read:

- `docs/ai/prompting-guide.md`

Why:

OpenChat is intentionally architecture-driven. Contributions are expected to fit the repository model, not redefine it accidentally.

---

## Contribution Flow

The standard contribution sequence is:

1. Feature request, bug report, or problem statement
2. Architecture discussion when the shape of the solution is unclear
3. ADR if the change alters architecture, dependencies, or cross-cutting rules
4. Domain design for new business concepts or rules
5. Application-layer use cases and orchestration
6. Infrastructure implementation such as persistence or external adapters
7. API or WebSocket transport entry points
8. UI implementation when user-facing changes are required
9. Automated tests
10. Documentation updates

This order matters.

It keeps business rules ahead of transport and presentation concerns.

---

## When An ADR Is Required

Create or update an ADR when a change does any of the following:

- introduces a new architectural pattern
- changes module boundaries
- changes database or cache responsibilities
- changes the realtime transport model
- adds a major dependency that influences implementation style
- changes a repository-wide rule that future contributors need to follow

An ADR is usually not required for:

- local bug fixes within existing architecture
- small implementation refinements
- adding a use case that fits the current module and layer model

If there is doubt, discuss the change before implementation.

---

## Module Ownership Rules

OpenChat is organized by feature modules.

Each module owns its own:

- domain
- application
- infrastructure
- api
- validation

Contributors must:

- place new behavior in the owning module
- keep cross-module imports intentional and minimal
- avoid reaching into another module's infrastructure internals
- keep shared code technical rather than domain-specific

Do not reorganize the codebase into generic root folders such as `services`, `controllers`, or `repositories` as the main structure.

---

## Layer Responsibilities

### Domain

Owns business invariants, value objects, policies, and domain errors.

Must not depend on frameworks or persistence details.

### Application

Owns use cases, orchestration, transactions, and authorization.

Must not contain UI behavior or transport formatting.

### Infrastructure

Owns database access, Redis access, and external integrations.

Must not own business policy.

### API And WebSocket Entry Points

Own request parsing, validation, authentication context resolution, and mapping to application services.

Must remain thin.

### UI

Owns rendering and user interaction.

Must not contain business logic or direct database access.

---

## Implementation Standards

All contributions should follow these standards:

- use TypeScript
- avoid `any`
- validate external input with Zod
- keep business logic out of React components, route handlers, and repositories
- prefer explicit names and small files
- prefer composition over inheritance
- use domain-specific errors for expected business failures
- keep PostgreSQL as the source of truth
- use Redis only for ephemeral or derived state

If a contribution requires violating one of these rules, the architectural decision must be made explicit first.

---

## Tests Are Required

Contributions should include tests appropriate to the change.

Expectations:

- domain and application logic should be covered with Vitest
- user-critical flows should receive Playwright coverage when relevant
- bug fixes should include regression coverage when practical

Avoid submitting implementation changes that leave behavior unverified.

---

## Documentation Is Required

Update documentation whenever a change affects:

- architecture rules
- contributor workflow
- naming or structure conventions
- feature behavior that future contributors need to understand
- schema or infrastructure expectations

Relevant documents may include:

- `README.md`
- `docs/architecture.md`
- `docs/project-principles.md`
- `docs/coding-standards.md`
- `docs/roadmap.md`
- `docs/adr/`
- `docs/ai/prompting-guide.md`

Do not treat documentation as a separate optional cleanup task.

---

## Pull Request Expectations

A good change set is:

- scoped to one coherent problem
- consistent with the documented architecture
- validated by tests or a clear executable check
- documented when contributor-facing behavior changes

Pull requests should make it easy to answer:

- what changed
- why it changed
- which module owns the behavior
- how the change was validated

---

## What Not To Do

Do not:

- invent a new architectural style during implementation
- add placeholder code or TODO-driven partial implementations
- bypass Zod validation at external boundaries
- store durable messages in Redis
- put business logic in UI or transport layers
- create broad utility dumping grounds
- introduce dependencies without clear justification

If a change seems to require one of these actions, stop and resolve the architectural issue first.
