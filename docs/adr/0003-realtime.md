# ADR 0003: Realtime Architecture

## Status

Accepted

## Context

OpenChat requires realtime room messaging and lightweight presence in the MVP.

Users must be able to receive new messages quickly, see who is online in a room, and observe short-lived activity such as typing indicators.

The system should support these behaviors without introducing a separate realtime platform, custom broker fleet, or transport abstraction that exceeds the product scope.

## Problem

The application needs a realtime architecture that is operationally simple, explicit, and compatible with the modular monolith model.

The design must answer:

- how connections are authenticated
- how clients subscribe to rooms
- how messages are persisted and broadcast
- how presence is tracked
- how the system can scale beyond a single instance

## Decision

OpenChat uses native WebSockets as its realtime transport.

The WebSocket gateway is responsible for connection management, authentication verification, subscription tracking, payload validation, and room-scoped event broadcasting.

Business logic remains in application services.

Redis is used only for ephemeral coordination such as presence and cross-instance event fan-out. PostgreSQL remains the durable source of truth for messages and room membership.

## Current Repository Implementation

The repository currently implements one concrete realtime slice on top of this ADR.

### Implemented client commands

- `subscribe-room`: authenticate the socket, authorize room membership, register the connection in the room subscription hub, send a subscription acknowledgment, then publish the current room presence count and typing snapshot for that room
- `set-room-typing`: validate the room-scoped typing payload and forward it into the messages application layer

### Implemented server events

- `subscribed-room`: confirms that the socket is now subscribed to the requested room
- `room-message-posted`: broadcasts a newly persisted durable message to subscribed room connections
- `room-presence-updated`: broadcasts the current active participant count for a room
- `room-typing-updated`: broadcasts the current room-scoped typing snapshot with user ids, profile metadata when available, and expiry timestamps
- `error`: returns validation or authorization errors to the socket

### Current durable message update path

The current repository does not submit new messages over WebSocket.

Instead, durable message creation still happens through the existing server-side message flow. After PostgreSQL persistence succeeds, the messages application service publishes a realtime event through the in-process room subscription hub so subscribed clients receive the new message without refresh.

Consequence:

- PostgreSQL remains the commit point for durable chat history
- realtime message delivery is a publication path, not a second write path

### Current presence implementation

Room presence is currently implemented as a room-scoped active participant count.

The current gateway and subscription hub maintain connection state in memory inside one application instance. When a connection subscribes or disconnects, the hub recalculates the number of distinct subscribed user ids for that room and broadcasts `room-presence-updated`.

Current limitations:

- presence is single-instance only
- the current UI shows counts, not a named presence roster
- Redis is not yet used for presence coordination

### Current typing implementation

Typing is currently room-scoped, ephemeral, and Redis-backed.

Implementation details:

- the client sends `set-room-typing` only for joined rooms
- the messages application layer validates membership before mutating typing state
- typing indicators are stored in Redis under room-scoped keys with expiry timestamps as sorted-set scores
- each update publishes the full active typing snapshot for that room
- the client removes expired typing entries locally using the server-provided `expiresAt` timestamps

Current behavior:

- typing state is never written to PostgreSQL
- the current TTL is short-lived and intentionally ephemeral
- stop-typing signals are sent on blur, successful message submission, and component teardown

Current limitations:

- Redis stores typing state, but room fan-out is still single-instance
- the current protocol sends snapshots instead of deltas
- there is no reconnect replay policy beyond resending the snapshot on room subscription

## Connection Lifecycle

1. The client establishes a WebSocket connection after it has an authenticated session or when it needs anonymous realtime capabilities in the future.
2. The gateway verifies the session or token material and resolves the user identity.
3. The gateway creates a connection context containing connection id, user id, and authorized capabilities.
4. The client sends explicit subscribe requests for room channels.
5. The gateway validates that the user can subscribe to the requested room context.
6. The client may send realtime commands such as typing state changes or message submission events.
7. On disconnect, the gateway removes connection state and updates ephemeral presence records.

Why this lifecycle was chosen:

- it keeps authentication explicit
- it avoids hidden room auto-join behavior
- it produces deterministic state transitions that are easier to observe and debug

## Authentication

Authentication is performed at the gateway boundary.

Rules:

- the gateway does not trust connection metadata without verification
- authenticated identity is normalized before being passed to application services
- authorization for room-specific actions is enforced in application services, not only in the gateway

Trade-off:

The gateway performs some upfront work per connection, but this prevents ambiguous trust boundaries.

## Subscriptions

Subscriptions are explicit and room-scoped.

Rules:

- clients must subscribe to each room they want to observe
- subscription state is maintained per connection
- room presence is derived from active subscribed connections and authenticated membership rules
- cross-instance subscription coordination may use Redis when multiple application instances are active

Why this model was chosen:

- it maps directly to the product model of rooms
- it avoids global fan-out
- it keeps broadcast targeting simple

## Room Broadcasting

Broadcasting follows a persist-then-publish pattern for durable messages.

Message flow:

1. Client sends a message command.
2. Gateway validates payload shape with Zod.
3. Gateway calls the message application service.
4. The application service verifies membership and message rules.
5. The application service persists the message in PostgreSQL.
6. After persistence succeeds, the gateway broadcasts the new message event to subscribed room connections.

Why this pattern was chosen:

- PostgreSQL remains the source of truth
- clients do not observe messages that were never durably stored
- ordering is easier to reason about

Trade-off:

The broadcast path includes a database write before fan-out, which adds latency compared with purely in-memory broadcast. That latency is acceptable for the MVP because correctness is more important than micro-optimization.

## Presence

Presence is ephemeral.

Target Redis responsibilities for presence:

- track user online state
- track room-level active presence counts
- coordinate presence updates across instances

Rules:

- presence expiration must tolerate abrupt disconnects
- presence state is best-effort and eventually correct, not transactional with PostgreSQL
- presence data is never treated as durable user history

Why this approach was chosen:

- presence changes frequently and does not justify durable writes for each transition
- Redis provides a simple fit for expiring ephemeral state

Current implementation note:

- the repository currently uses an in-memory room subscription hub for presence counts and has not moved presence into Redis yet

## Typing Indicators

Typing indicators are transient room-scoped signals.

Rules:

- typing events are never persisted to PostgreSQL
- indicators should expire automatically after a short timeout
- broadcasts should be limited to subscribed clients in the relevant room

Why this approach was chosen:

- typing is ephemeral UI state, not business history
- automatic expiration keeps the system resilient to dropped connections and missed stop events

Current implementation note:

- the repository currently stores room typing state in Redis and publishes typing snapshots over the existing WebSocket gateway

## Scalability Considerations

The initial design targets a small number of application instances.

Scaling approach:

- keep connection handling in the application runtime
- use Redis for presence coordination and room event fan-out when more than one instance is active
- keep broadcast payloads scoped to rooms
- optimize only after observing connection counts, room hot spots, or publish latency issues

Current repository status:

- room message fan-out and room presence are still single-instance in-memory behavior
- Redis is currently used for typing state only, not for cross-instance pub/sub

What is intentionally not introduced now:

- Socket.IO clusters
- dedicated message brokers
- Kafka
- event sourcing
- CQRS read models

Why these were rejected:

- they increase operational and mental complexity before the product needs them
- they would make AI-generated code more error-prone by widening the architecture surface

## Alternatives Considered

### Socket.IO

Rejected.

Reasoning:

- fallback transports are not required for the target environment
- the custom protocol adds abstraction that the MVP does not need
- native WebSockets make message flow and failure handling more explicit

### Polling or Server-Sent Events

Rejected.

Reasoning:

- bidirectional communication is required for presence and client-originated realtime actions
- polling introduces unnecessary latency and overhead

### Dedicated realtime service

Rejected.

Reasoning:

- it would fragment business logic across deployables too early
- it would create additional consistency and deployment concerns

## Consequences

Positive consequences:

- explicit realtime protocol design
- simple transport stack
- durable message semantics remain clear

Negative consequences:

- more protocol details must be implemented manually than with Socket.IO
- multi-instance coordination must be handled deliberately

## Trade-offs

The chosen design favors explicitness and correctness over abstraction convenience.

This is appropriate for OpenChat because architecture predictability is more valuable than feature-rich transport tooling during the MVP.

## Future Evolution

Possible future steps:

- introduce a formal event envelope versioning scheme if client diversity grows
- add backpressure and per-room rate controls if room traffic becomes highly uneven
- move some fan-out concerns to dedicated infrastructure only if measured load justifies it

Any evolution must preserve the core invariant that durable messages are written to PostgreSQL before they are treated as committed system state.
