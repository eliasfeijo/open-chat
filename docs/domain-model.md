# OpenChat Domain Model

## Purpose

This document captures the current business vocabulary, aggregates, and invariants that should remain explicit as the repository grows.

It is intentionally narrower than the architecture document. Its job is to describe what must stay true in the product model, not how the code is wired.

---

## Core Terms

- actor: the principal attempting an action in the system. The current implementation passes authenticated user identifiers in most use cases, but the term remains broader than "user" so future system actors do not force a conceptual rewrite.
- user profile: the public identity attached to an authenticated account.
- room: the primary public conversation container.
- tag: a normalized public discovery label attached to a room.
- room membership: a user's participation relationship to a room.
- message: a durable room post authored by a joined participant.

---

## Room Aggregate

The room aggregate currently spans room state plus the owner membership created at room creation time.

Current invariants:

- a room must have a persisted owner user identifier
- room creation must create the owner membership transactionally with the room
- the owner membership role is `owner`
- non-owner participants receive the `member` role
- the owner cannot leave the room in the current model
- only the owner may update room name, description, and topic
- the room slug is unique
- the room slug is intentionally immutable in the current routing model
- room name must be 3 to 80 characters
- room description must be at most 280 characters when present
- room topic must be at most 120 characters when present
- room creation may assign zero to five tags transactionally with the room
- only the owner may replace the room's tag set in the current model
- room tags are normalized to lowercase slug values
- duplicate room tags collapse to one assigned tag

Design note:

The current domain code is intentionally small. As rooms gain capacity rules, transfer ownership, moderation, privacy, or lifecycle state, prefer moving those behaviors into explicit domain objects or domain policies instead of expanding application-layer conditionals indefinitely.

---

## User Profile

Current invariants:

- a profile is keyed by the authenticated user identifier
- profile synchronization from auth identity is idempotent
- username is optional during the current onboarding flow
- when a username is present, it must be unique
- usernames may contain only lowercase letters, numbers, and underscores
- usernames must be at least 3 characters when present and at most 32 characters
- bio is optional and must be at most 160 characters when present

---

## Messaging

Current invariants:

- only an authenticated actor may post a message
- only a joined room member may post a message
- message body must contain at least one non-whitespace character
- message body must be at most 2000 characters
- messages are durable only after PostgreSQL persistence succeeds

Realtime note:

Realtime fan-out is not allowed to become the source of truth. Delivery happens after durable success.

---

## Authorization And Policy Direction

The current repository keeps most permission checks inside application use cases with small supporting domain rules.

This is acceptable at the current size, but future growth should follow these rules:

- do not scatter ad hoc permission checks across presentation and infrastructure files
- when permission logic expands, introduce explicit policies before introducing roles for their own sake
- prefer policy names that reflect business intent, such as `canEditRoom`, `canJoinRoom`, or `canDeleteMessage`

Reserved evolution path:

If authorization becomes a substantial cross-cutting concern, add an explicit authorization capability rather than letting rooms, messages, and future modules each invent their own incompatible policy model.
