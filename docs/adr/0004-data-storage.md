# ADR 0004: Data Storage Architecture

## Status

Accepted

## Context

OpenChat stores user profiles, rooms, memberships, tags, and messages.

The product is public and searchable, which means durable data integrity matters more than raw write throughput in the MVP.

The architecture also requires realtime presence and room activity signals, which are transient and high-churn.

## Problem

The system needs a storage architecture that clearly separates durable data from ephemeral state.

Without an explicit decision, contributors may store durable chat history in caches, implement inconsistent transaction patterns, or design indexes around speculation rather than real query needs.

## Decision

PostgreSQL is the source of truth for all durable business data.

Redis is used only for ephemeral state, coordination, and short-lived derived data.

Durable chat messages are always stored in PostgreSQL and are never considered committed if they exist only in Redis or application memory.

Drizzle ORM is used to define schema, queries, and migrations in an explicit SQL-friendly style.

## PostgreSQL Responsibilities

PostgreSQL stores:

- users
- rooms
- room memberships
- tags
- room-tag relations
- messages
- session-related durable auth records when applicable

Why PostgreSQL was chosen:

- relational consistency matches the domain
- transactions are necessary for membership and message operations
- SQL remains understandable and auditable
- full-text search can cover initial room discovery needs

## Redis Responsibilities

Redis stores only ephemeral or derived state.

Allowed responsibilities:

- online presence
- room presence counters
- typing indicators
- connection and subscription coordination
- short-lived caches for read optimization when justified
- cross-instance publish and subscribe coordination

Disallowed responsibilities:

- durable message storage
- authoritative room membership storage
- long-term profile storage
- permanent search indexes used as the only source of truth

Why Redis is constrained this way:

- it prevents cache drift from becoming data loss
- it keeps durability semantics obvious
- it reduces recovery complexity after failures

## Why Redis Never Stores Durable Messages

Durable messages define the core product history.

If messages existed only in Redis, the system would inherit avoidable problems:

- data loss risk during eviction or misconfiguration
- weak durability guarantees
- harder replay and recovery semantics
- ambiguous ordering and consistency across instances

For OpenChat, messages must be queryable, searchable, and durable. PostgreSQL is therefore the only acceptable source of record for committed chat history.

## Transaction Strategy

Transactions are controlled in the application layer.

Rules:

- multi-step durable operations that must succeed together use a single PostgreSQL transaction
- repositories do not hide transaction boundaries implicitly
- ephemeral Redis updates occur after durable success when the operation depends on committed data

Examples:

- room creation and initial ownership membership may share one transaction
- membership changes that affect durable state use one transaction
- message creation persists first, then triggers ephemeral broadcast side effects

Why this strategy was chosen:

- the application layer owns use-case semantics
- transaction boundaries stay visible and reviewable

## Indexing Philosophy

Indexes are added to support known access patterns.

Expected early indexes include:

- unique indexes on stable identifiers such as usernames and room slugs
- lookup indexes for room membership joins
- time-oriented indexes for room message retrieval
- search-supporting indexes for room discovery fields

Rules:

- do not add speculative indexes without a defined query path
- prefer simple indexes before advanced tuning
- review indexes when query patterns change

Why this philosophy was chosen:

- excessive indexing increases write cost and schema complexity
- explicit indexing discipline aligns with the project's simplicity goals

## Migrations

Schema changes are applied through explicit Drizzle migrations.

Rules:

- every schema change must have a migration
- migrations must be reviewable and deterministic
- data backfills require explicit operational planning when needed
- destructive schema changes must be justified and sequenced carefully

Why this approach was chosen:

- durable systems require predictable schema evolution
- AI contributors need explicit migration workflow constraints

## Future Partitioning Strategy

Partitioning is deferred until real data volume justifies it.

Likely candidate:

- the `messages` table, partitioned by time or another operationally meaningful key

Rules for adopting partitioning:

- only after measured evidence of maintenance, retention, or query pain
- preserve application-facing semantics
- document the decision in a new ADR before adoption

Why partitioning is deferred:

- it adds operational complexity and migration risk
- the MVP does not need it by default

## Future Archival Strategy

Archival is also deferred until retention cost or query performance justifies it.

Expected direction:

- cold or historical messages may move to cheaper storage while recent messages remain in the primary database
- archival must preserve a clear retrieval contract if older history remains user-visible

Constraints:

- archival cannot break the rule that committed messages originate from PostgreSQL first
- archival design must not leak into MVP message write paths prematurely

## Alternatives Considered

### Redis as primary message storage

Rejected because it undermines durability, searchability, and transactional clarity.

### Event sourcing as the primary persistence model

Rejected because it adds conceptual and operational complexity that the MVP does not need.

### Multiple specialized data stores from day one

Rejected because premature polyglot persistence would make the architecture harder to understand and evolve.

## Consequences

Positive consequences:

- clear durable versus ephemeral boundaries
- simpler recovery semantics
- consistent query model for core product behavior

Negative consequences:

- PostgreSQL handles all durable message writes from the start
- some highly dynamic data still requires careful Redis expiration and cleanup behavior

## Trade-offs

The storage architecture prioritizes correctness and clarity over peak theoretical throughput.

This is the correct trade for the MVP because product evolution and maintainability matter more than infrastructure sophistication.

## Future Evolution

Potential future changes:

- dedicated search infrastructure for advanced discovery
- message partitioning when history growth requires it
- archival flows for old content

These changes must preserve the central rule that PostgreSQL is the system of record and Redis remains non-durable.
