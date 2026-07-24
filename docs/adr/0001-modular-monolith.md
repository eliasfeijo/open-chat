# ADR 0001: Modular Monolith

## Status

Accepted

## Context

OpenChat is an early-stage product with a deliberately constrained MVP.

The system needs public rooms, authentication, membership, messaging, search, and lightweight realtime behavior. Those capabilities are related, evolve together, and will be developed with heavy AI assistance.

The project explicitly optimizes for:

- maintainability
- clarity
- incremental evolution
- low operational overhead
- architecture that AI tools can implement consistently

The project explicitly does not optimize for premature horizontal decomposition.

## Problem

The repository needs an architecture that provides strong module boundaries without introducing the operational and conceptual overhead of distributed systems.

The system must be easy to understand, easy to deploy, and safe to evolve while product requirements are still changing.

## Decision

OpenChat will be implemented as a modular monolith.

This means:

- the system is deployed as one application
- features are organized into explicit modules
- each module owns its domain, application, infrastructure, presentation, and validation code
- module boundaries are enforced through dependency rules rather than separate processes
- the database is shared, but access remains disciplined by module ownership

Canonical module examples:

- auth
- users
- rooms
- tags
- messages
- search

## Alternatives Considered

### Microservices

Rejected.

Why:

- the MVP does not have stable service boundaries yet
- distributed systems would add deployment, observability, and consistency overhead too early
- multiple services would slow down feature iteration and complicate AI-generated changes

### Hexagonal-first Architecture as the Primary Organizing Principle

Rejected as the top-level repository structure.

Why:

- the project does need separation between business logic and frameworks, but a pure ports-and-adapters presentation at the repository root tends to hide feature ownership
- feature modules are a more practical primary navigation model for the team and for AI assistants
- modular monolith with layered modules still preserves the important benefits of dependency inversion where needed

### Event-driven Internal Architecture

Rejected as the default coordination model.

Why:

- the MVP mostly requires direct request and command flows
- event-heavy internal design would make control flow harder to trace and debug
- asynchronous event choreography would increase ambiguity for AI-generated code

### CQRS

Rejected.

Why:

- the read and write workloads are not yet complex enough to justify split models
- CQRS would introduce duplicate concepts, additional handlers, and more infrastructure decisions
- the product benefits more from simple explicit queries and commands inside the same application layer

## Consequences

Positive consequences:

- one deployable application keeps operations simple
- explicit module ownership keeps the codebase organized
- business logic can remain framework-independent within modules
- new engineers can understand the system without tracing network boundaries
- AI tools work better with small explicit modules than with distributed architecture ambiguity

Negative consequences:

- module isolation is enforced by discipline and review, not process boundaries
- a shared database requires careful ownership rules
- future extraction of services is possible but not free

## Trade-offs

The modular monolith trades hard runtime isolation for lower complexity and faster iteration.

That is the correct trade for OpenChat because the current risk is architectural sprawl, not service saturation.

This architecture also aligns with the project's AI-first workflow. AI tools are more reliable when the codebase has explicit boundaries, small files, and clear ownership, but they do not benefit from premature distributed-system complexity.

## Future Evolution

If the product later develops stable high-scale or independently evolving boundaries, selected modules may be extracted into separate services.

That extraction is allowed only if:

- a clear operational bottleneck exists
- the module boundary is already stable inside the monolith
- the benefits outweigh added deployment and consistency complexity

Until then, the modular monolith remains the default and preferred architecture.
