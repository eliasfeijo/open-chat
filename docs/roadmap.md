# OpenChat Roadmap

## Purpose

This roadmap defines the intended delivery sequence for OpenChat.

It is a planning document, not a promise of dates.

The roadmap exists to keep implementation aligned with product scope and architecture maturity. New work should normally reinforce the current phase before expanding into later-phase concerns.

---

## Planning Principles

The roadmap follows these rules:

- deliver the smallest coherent public chat product first
- prefer vertical slices over broad unfinished subsystems
- do not let future features distort MVP architecture
- introduce operational complexity only after product need is proven
- use ADRs when roadmap items require architectural change

Why:

OpenChat is intentionally optimized for incremental evolution. The roadmap should reduce scope drift, not create it.

---

## Current Repository State

This section reflects the current committed implementation, not the intended end state.

Implemented and usable now:

- authentication with Better Auth route handling and authenticated session lookup
- basic profile onboarding and profile editing for username and bio
- public room creation with owner membership and initial tag assignment created transactionally
- room listing, room detail pages, explicit join and leave flows, and owner editing for name, description, topic, and tags
- room discovery with text search and tag filtering over persisted room data
- durable room message posting and transcript retrieval backed by PostgreSQL
- validation and unit tests across the implemented auth, users, rooms, and messages slices

Implemented only in part:

- room editing exists for the current core metadata, but slug remains intentionally immutable while room routing is slug-based
- messaging is durable and permission-checked, but new messages do not arrive in realtime
- tag vocabulary remains implicit and room owners can manage room tags, but there is no broader tag curation flow yet

Not implemented yet despite earlier roadmap expectations:

- WebSocket gateway, presence, typing indicators, and cross-instance ephemeral coordination

Planning consequence:

The repository already has a stronger durable-chat foundation in auth, profiles, rooms, and persisted messaging than the previous roadmap made explicit. The remaining work splits cleanly into two milestones: finishing the durable discovery and messaging product, then introducing realtime message delivery as a separate execution model.

---

## Phase 1A: Durable Core MVP

Goal:

Complete the already-started public room product so discovery, membership, messaging, and the architecture foundation work together as one coherent MVP.

Scope:

- authentication and session handling
- user profile onboarding and editing basics
- public room creation, listing, detail, and membership flows
- owner room editing for core room metadata
- room topics surfaced as real product data
- tags and room-tag assignment
- room browsing and room search
- message creation and retrieval

Current status:

Already implemented:

- authentication and authenticated session resolution
- basic profile sync and profile editing
- room creation, listing, room detail, join, leave, and owner editing for name, description, topic, and tags
- room tag assignment and owner-managed tag editing plus durable room discovery by text and tag
- durable message posting and transcript listing

Partially implemented:

- room topics exist in room data and owner editing, but are not yet part of a broader discovery flow
- room URLs remain slug-based, so slug changes are intentionally deferred until the routing implications are designed explicitly
- room tags exist in real module behavior, but broader tag curation flows are still missing

Still required before Phase 1 is coherent:

- tag curation workflows beyond per-room owner management
- end-to-end coverage of the core signed-up user journey through profile, rooms, membership, and messaging

Success criteria:

- a new user can sign up, complete a basic public profile, create a room, discover rooms, join a room, and send messages that persist correctly without manual data repair
- room discovery is backed by implemented search and tag flows rather than only a static list or schema placeholders
- the repository has stable, implemented module boundaries for auth, users, rooms, and messages, with tags and search added as real feature slices rather than only planned ownership areas
- PostgreSQL remains the source of truth for durable room and message data

Out of scope in this phase:

- realtime delivery
- presence
- typing indicators
- private messaging
- reactions
- uploads
- moderation systems
- notifications

---

## Phase 1B: Realtime Message Delivery

Goal:

Introduce live room message delivery on top of the durable Phase 1A product without pulling broader ephemeral activity into the same milestone.

Scope:

- websocket gateway for room message subscriptions
- durable-message fan-out after successful persistence
- minimal reconnect and delivery behavior for room conversation
- transport and application boundaries for realtime message publication

Success criteria:

- joined users receive newly posted room messages without manual refresh
- realtime delivery follows successful durable persistence instead of bypassing PostgreSQL
- the new websocket surface remains a transport adapter and does not become a second business layer

Architectural note:

Realtime is a distinct execution model, not just the end of the durable messaging slice. It should be planned, implemented, and reviewed as its own milestone.

---

## Phase 2: Presence And Usability

Goal:

Build on the completed core room product with ephemeral room activity and usability improvements that do not change the product model.

Scope:

- online presence
- typing indicators
- richer profile editing
- room settings refinement beyond basic owner editing
- room list and search relevance improvements
- better realtime connection handling and recovery behavior

Success criteria:

- users can reliably see who is active in a room
- typing state behaves as short-lived ephemeral UI feedback
- profile editing is complete enough for basic identity customization beyond username and bio

Architectural constraint:

Presence and typing remain ephemeral and do not change the rule that PostgreSQL is the durable source of truth.

Planning note:

Presence and typing move after the Phase 1B realtime message slice. The current codebase has no websocket surface yet, so the smallest coherent step is durable-message fan-out first, then richer ephemeral room activity.

---

## Phase 3: Community Safety And Conversation Refinement

Goal:

Add basic community management and improve conversation ergonomics after the core chat model is stable.

Scope:

- moderation primitives
- mentions
- emoji reactions
- pinned messages
- clearer room ownership and management flows

Success criteria:

- rooms gain basic control mechanisms without turning OpenChat into a full enterprise collaboration suite
- new features fit the existing modular architecture rather than introducing separate subsystems prematurely

Architectural note:

Moderation should first be implemented as explicit application-layer policy within existing modules before introducing separate moderation infrastructure.

---

## Phase 4: Richer Content And Delivery

Goal:

Extend the platform with richer content and user re-engagement once the messaging and room model is well established.

Scope:

- attachments
- notifications
- private rooms
- mobile experience improvements

Success criteria:

- attachments have a clear storage model
- notifications do not bypass the application-layer ownership model
- private room access rules are explicit and testable
- the product remains usable on mobile-sized viewports

Architectural note:

This phase is the first likely trigger for object storage and more deliberate notification infrastructure. Both require explicit design and may require new ADRs.

---

## Phase 5: Platform Expansion

Goal:

Evaluate whether OpenChat should become a broader platform after the core public-room product is validated.

Candidate scope:

- federation
- plugins
- public API
- bots

Success criteria:

- there is evidence that platform-style extensibility is needed
- module boundaries are stable enough to support extension points
- any new distributed or externally consumed interfaces are intentionally designed

Architectural warning:

This phase should not influence implementation in earlier phases unless an ADR documents a concrete justified dependency.

---

## Immediate Next Implementation Plan

1. Implement tags and search as real Phase 1 discovery slices so the product matches the public and discoverable positioning in the architecture documents.
2. Add the minimal realtime message delivery path described by ADR 0003 without pulling presence or typing into the same change set.
3. Extend end-to-end coverage so the core user journey is exercised across sign-up, profile completion, room creation, membership, and messaging.
4. Revisit slug mutability only after there is an explicit routing-safe rename policy for room URLs and revalidation behavior.

Why this ordering:

The codebase already supports durable room conversation, room ownership editing, and membership. The biggest remaining Phase 1 risk is an incoherent MVP where rooms exist but are hard to discover, do not update live, and are not yet covered by broader end-to-end verification.

---

## Decision Rules For New Work

When deciding whether to start a roadmap item, ask:

1. Does it strengthen the current phase or distract from it?
2. Does it require new architecture or only implementation work?
3. Can it be implemented within existing module boundaries?
4. Does it force premature infrastructure complexity?

If the answer indicates architectural expansion without a current product need, the work should be deferred.
