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
- api
- validation

Example:

rooms/

    application/

    domain/

    infrastructure/

    api/

    validation.ts

Cross-module imports should be minimized.

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

---

# Business Logic

Business rules belong in application services.

Never inside React components.

Never inside route handlers.

Never inside database repositories.

---

# API

Route Handlers should be thin.

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

---

# AI Guidelines

When generating code:

- avoid placeholders
- avoid TODO comments
- generate complete implementations
- follow existing patterns
- do not introduce new architectural styles

If unsure, prefer consistency over creativity.
