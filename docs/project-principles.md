# OpenChat Project Principles

## Purpose

This document defines the operating principles that govern product decisions, architecture decisions, and code generation in OpenChat.

It exists to reduce ambiguity.

If a proposed implementation is technically valid but conflicts with these principles, the implementation is wrong for this repository.

This document is normative for both human contributors and AI coding assistants.

---

## Product Definition

OpenChat is a public chat platform for discoverable conversations.

The product model is intentionally narrow in the MVP:

- users create accounts
- users edit profiles
- users create public rooms
- rooms have names, descriptions, topics, and tags
- users search and browse rooms
- users join and leave rooms
- users send messages in joined rooms
- users see online presence in active rooms

The intended product shape is closer to Reddit meets IRC than to a full community suite.

Why this matters:

- it prevents architecture from being shaped by features that do not exist yet
- it keeps implementation decisions aligned with actual scope
- it reduces pressure to add systems that only make sense for a much broader platform

---

## MVP Boundaries

The following capabilities are explicitly out of scope for V1:

- private messaging
- threads
- reactions
- uploads
- voice
- video
- bots
- moderation systems
- notifications
- federation
- plugins

Rule:

Out-of-scope features must not drive present-day architecture unless a dependency is unavoidable and explicitly documented.

Example:

Do not introduce a plugin runtime, generalized event bus, or media pipeline in preparation for future features.

---

## Primary Optimization Targets

OpenChat optimizes for:

- maintainability
- clarity
- simplicity
- incremental evolution
- AI-assisted development
- low operational overhead

OpenChat does not optimize for:

- maximum theoretical scalability
- broad framework optionality
- premature service decomposition
- abstract extensibility without an active product need

Why:

The highest current risk is architecture becoming harder to understand than the product requires.

---

## Architectural Principles

These principles are mandatory.

### Modular Monolith

The system is one application composed of explicit modules.

Implications:

- no microservices by default
- no separate service per domain area
- no distributed consistency model for MVP business flows

### PostgreSQL Is The Source Of Truth

All durable product data lives in PostgreSQL.

Implications:

- Redis may mirror, cache, or coordinate
- Redis may not become the only source of committed business data
- messages are durable only after PostgreSQL persistence succeeds

### Business Logic Is Framework-Independent

Business rules belong in domain and application code.

Implications:

- not in React components
- not in route handlers
- not in WebSocket gateway handlers
- not in repositories

### Feature Ownership

Every feature owns its domain, application, infrastructure, presentation, and validation surfaces.

Implications:

- organize by feature first
- avoid root-level generic service folders
- avoid reaching into another module's internals

### Explicit Over Implicit

The repository prefers direct, readable, explicit code.

Implications:

- prefer named use cases over catch-all service classes
- prefer explicit schemas over inferred runtime assumptions
- prefer visible transaction boundaries over hidden ORM behavior

### Evolution Through ADRs

Architecture changes require deliberate documentation.

Implications:

- contributors may improve implementation details without an ADR
- contributors may not introduce new architectural patterns silently

---

## Ownership Boundaries

The default module set is:

- auth
- users
- rooms
- tags
- messages
- search

Rules:

- each module owns its internal layers
- cross-module imports should target stable application-facing contracts
- one module must not import another module's infrastructure implementation directly
- shared code must stay technical and must not accumulate business rules

Why:

Ownership boundaries are the main defense against monolith sprawl.

---

## Dependency Rules

Allowed dependency direction:

- UI to transport or application-facing client abstractions
- transport and WebSocket entry points to application services
- application to domain and infrastructure abstractions
- infrastructure to external libraries and data stores

Forbidden dependency direction:

- domain to framework packages
- UI to database access code
- route handlers to repositories
- WebSocket transport code to repository internals
- cross-module access into another module's infrastructure layer

Rule:

If a dependency makes business logic harder to isolate or test, it is probably in the wrong direction.

---

## Realtime Principles

Realtime support exists to deliver room messaging and ephemeral room activity.

Rules:

- native WebSockets are the default transport
- room subscriptions are explicit
- presence and typing are ephemeral
- business actions invoked over WebSocket still go through the application layer
- broadcast follows durable success for committed messages

Why:

Realtime transport should stay simple and should not become a second business layer.

---

## Data Principles

Data design must remain simple and relational.

Rules:

- prefer explicit tables over generic polymorphic storage
- prefer join tables for many-to-many relationships
- add indexes for known access patterns, not speculation
- migrations are explicit and reviewable
- archival and partitioning are deferred until measured need exists

Why:

Simple schemas are easier to evolve, query, and reason about.

---

## Validation Principles

All external input is untrusted.

Rules:

- validate HTTP input with Zod
- validate WebSocket payloads with Zod
- keep validation schemas close to the owning feature
- do not rely on TypeScript types alone for runtime safety

Why:

Validation is both a security control and an architectural boundary.

---

## Naming And Structure Principles

Naming should describe business intent.

Preferred names:

- `createRoom`
- `joinRoom`
- `leaveRoom`
- `sendMessage`
- `searchRooms`

Avoid generic names:

- `process`
- `handle`
- `manager`
- `helper`

Structure rules:

- prefer one use case per file when practical
- prefer small files
- prefer small functions
- prefer composition over inheritance

Why:

Clear names and small units improve maintainability and improve AI-generated code quality.

---

## AI Contribution Principles

OpenChat is intentionally AI-assisted.

That does not lower architectural rigor. It increases the need for explicit rules.

Rules for AI-generated work:

- AI may implement architecture
- AI may not invent architecture
- AI must stay within documented module boundaries
- AI must not bypass validation
- AI must not add new dependencies without clear justification
- AI must favor existing repository patterns over clever alternatives

Why:

AI tools perform best when invariants are explicit and stable.

---

## Delivery Principles

Implementation should follow incremental vertical slices.

Preferred delivery order:

1. authentication
2. room creation and browsing
3. room membership
4. message persistence and retrieval
5. realtime room updates
6. room search
7. presence and profile refinement

Why:

This sequence builds product value while preserving a coherent architecture at each step.

---

## Decision Standard

When more than one implementation is possible, choose the option that best satisfies the following order:

1. preserves architectural invariants
2. keeps business logic explicit
3. minimizes operational complexity
4. is easiest to understand in six months
5. works well with AI-assisted maintenance

If a proposal only wins on novelty or theoretical flexibility, it should be rejected.
