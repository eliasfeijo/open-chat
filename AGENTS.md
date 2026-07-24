# AGENTS.md

This repository is developed primarily with AI assistants.

Examples:

- GitHub Copilot
- ChatGPT
- Claude
- Cursor

The AI should follow these instructions when generating code.

---

# General Principles

Favor readability.

Favor explicitness.

Avoid unnecessary abstractions.

Avoid premature optimization.

Small files are preferred over large files.

Prefer composition over inheritance.

Business logic must remain independent from frameworks.

---

# Architecture

This project follows a modular monolith architecture.

Modules own their own:

- domain
- application
- infrastructure
- presentation
- validation

Example:

rooms/

    application/

    domain/

    infrastructure/

    presentation/

        server/

    validation.ts

The `presentation/` surface contains delivery-specific code for the web app.

`presentation/server/` is the transport adapter surface for:

- route handlers
- server actions

Presentation components may render UI and manage interaction state.

Presentation server files may:

- authenticate
- validate external input
- call one application use case
- translate typed failures into transport responses

Presentation server files may not:

- query Drizzle directly
- implement business rules
- enforce policy beyond basic authentication presence checks

Cross-module imports should be minimal and follow dependency direction.

Allowed:

- another module's public entry point
- another module's application-facing types or functions

Forbidden:

- another module's infrastructure
- another module's validation internals
- another module's presentation files

Dependency direction is inward only:

- presentation to application
- application to domain and infrastructure abstractions
- infrastructure to external libraries

Never invert that direction.

---

# Language

Everything is written in TypeScript.

Strict mode is always enabled.

Never use `any`.

Prefer `unknown`.

---

# Validation

All external input must be validated with Zod.

Never trust incoming data.

---

# Database

Database access uses Drizzle ORM.

Prefer SQL-friendly queries.

Avoid ORM magic.

Repositories persist and retrieve state.

Repositories never decide permissions.

Repositories never enforce business policy.

---

# Business Logic

Business rules belong in application services.

Never inside React components.

Never inside route handlers.

Never inside database repositories.

When rules become richer, move behavior into domain objects or domain policies rather than accumulating helper functions forever.

---

# Shared Code

`shared/` is for technical cross-cutting code with clear ownership, such as configuration.

Do not turn `shared/` into a business-logic junk drawer.

Do not add `helpers`, `common`, or generic utilities without a narrow, technical reason.

`lib/` is for framework or platform glue such as environment access and external clients.

`lib/` must not become a second application layer.

---

# Transport

Route handlers and server actions should be thin.

Receive request.

Validate.

Call application service.

Return response.

Nothing else.

---

# WebSocket

WebSockets should only:

- authenticate
- subscribe
- publish events

Business logic belongs elsewhere.

---

# React

Components should remain small.

Prefer Server Components.

Client Components only when necessary.

Avoid prop drilling.

---

# Naming

Prefer descriptive names.

createRoom()

joinRoom()

leaveRoom()

renameRoom()

Avoid generic names like:

process()

handle()

manager()

helper()

Prefer `presentation` over `api` for module-owned web delivery files that mix UI components and transport adapters.

---

# Errors

Never throw generic Error.

Use domain-specific errors.

Example:

RoomNotFoundError

UserAlreadyJoinedError

PermissionDeniedError

---

# Tests

Business logic should be easily testable.

Avoid framework coupling.

Add or update tests for new validation rules, domain rules, and application behavior.

---

# AI Guidelines

When generating code:

- avoid placeholders
- avoid TODO comments
- generate complete implementations
- follow existing patterns
- do not introduce new architectural styles

Before changing boundaries, check:

- AGENTS.md
- docs/architecture.md
- docs/coding-standards.md
- docs/domain-model.md

If unsure, prefer consistency over creativity.
