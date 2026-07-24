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

## Phase 1: Core MVP

Goal:

Deliver a usable public chat product with room discovery, membership, messaging, and a stable architecture foundation.

Scope:

- authentication
- user profile basics
- public room creation
- room editing for owners
- room topics and tags
- room browsing
- room search
- join and leave room flows
- message creation and retrieval
- realtime room message delivery

Success criteria:

- a new user can sign up, create a room, join a room, send messages, and discover rooms
- the repository contains stable module boundaries for auth, users, rooms, messages, tags, and search
- PostgreSQL and Redis responsibilities are enforced according to the architecture

Out of scope in this phase:

- private messaging
- reactions
- uploads
- moderation systems
- notifications

---

## Phase 2: Presence And Usability

Goal:

Improve room activity visibility and refine the product without widening the platform model.

Scope:

- online presence
- typing indicators
- richer profile editing
- room settings refinement
- room list and search relevance improvements
- better realtime connection handling and recovery behavior

Success criteria:

- users can reliably see who is active in a room
- typing state behaves as short-lived ephemeral UI feedback
- profile editing is complete enough for basic identity customization

Architectural constraint:

Presence and typing remain ephemeral and do not change the rule that PostgreSQL is the durable source of truth.

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

## Decision Rules For New Work

When deciding whether to start a roadmap item, ask:

1. Does it strengthen the current phase or distract from it?
2. Does it require new architecture or only implementation work?
3. Can it be implemented within existing module boundaries?
4. Does it force premature infrastructure complexity?

If the answer indicates architectural expansion without a current product need, the work should be deferred.
