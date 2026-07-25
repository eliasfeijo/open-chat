# OpenChat Deployment Guide

## Purpose

This document describes the recommended deployment approach for the current OpenChat runtime.

It focuses on the smallest production-shaped setup that matches the current codebase:

- one long-running Node.js application process
- one public HTTPS origin
- one reverse proxy in front of the application
- one single-instance realtime gateway started from the same application runtime

This guide is intentionally optimized for low-cost VM hosting, including Oracle Cloud Always Free VMs.

---

## Current Runtime Shape

OpenChat is not currently shaped like a serverless-only deployment.

The current runtime starts:

- the Next.js application server for HTTP rendering and server actions
- a native WebSocket listener for realtime room subscriptions

The WebSocket listener is started during Node.js server startup through the runtime bootstrap path, not through a separate external service.

Current implications:

- the application expects a long-running Node.js process
- the first realtime slice is single-instance only
- the application is a better fit for VM or container hosting than request-only serverless platforms

---

## Recommended Production Topology

The recommended topology for the current repository is:

1. Run OpenChat as one Node.js application service.
2. Let the application listen on an internal HTTP port such as `3000`.
3. Let the realtime gateway listen on an internal WebSocket port such as `3001`.
4. Put Caddy or Nginx in front of both listeners.
5. Expose only `80` and `443` publicly.
6. Proxy normal web traffic to the application port.
7. Proxy `/ws` traffic to the realtime gateway port.

Why this is the recommended shape:

- it preserves the current modular monolith runtime
- it keeps the websocket transport thin and colocated with the app
- it avoids a second deployable application before cross-instance fan-out exists
- it works well on a small VM without introducing a local PaaS layer

---

## Recommended Host Pattern

For a small VM, the recommended host pattern is:

- `systemd` for process supervision
- Caddy or Nginx as the reverse proxy
- external PostgreSQL
- Upstash Redis or another compatible Redis endpoint for ephemeral typing state
- one application instance only

Why this is preferred over Dokku or similar tooling on a very small VM:

- lower RAM overhead
- fewer moving parts
- simpler debugging
- fewer failure modes during deploys and restarts

---

## Reverse Proxy Recommendation

Caddy is the default recommendation for the current project because it provides:

- automatic TLS
- simple reverse proxy configuration
- straightforward WebSocket proxying

Nginx is also acceptable when the operator already prefers it.

The required proxy behavior is explicit:

- `https://your-domain/` to `http://127.0.0.1:3000`
- `https://your-domain/ws` to `http://127.0.0.1:3001`

Rule:

Do not expose the realtime gateway port directly to the public internet unless there is a deliberate operational reason to do so. Prefer one public HTTPS origin with reverse proxy routing.

---

## Environment Contract

The current deployment should define at least the following environment variables:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `REALTIME_GATEWAY_PORT`
- `NEXT_PUBLIC_REALTIME_WS_URL`

Recommended production values:

- `BETTER_AUTH_URL=https://your-domain`
- `REALTIME_GATEWAY_PORT=3001`
- `NEXT_PUBLIC_REALTIME_WS_URL=wss://your-domain/ws`

Notes:

- PostgreSQL remains the durable source of truth.
- Redis is now required for the current typing-indicator slice.
- The current Redis integration uses the Upstash REST client and the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables.
- Room presence and message fan-out are still single-instance runtime behavior even though typing state now uses Redis.

---

## CI/CD Recommendation

The recommended delivery model is a custom CI/CD pipeline rather than a local PaaS layer on the VM.

### CI Responsibilities

CI should run off-box and perform the full validation suite needed before deployment.

Minimum recommended CI steps:

1. install dependencies with a frozen lockfile
2. run `pnpm lint`
3. run `pnpm typecheck`
4. run `pnpm test`
5. run `pnpm build`

Why:

- the VM should not be the first place a broken change is discovered
- off-box validation reduces CPU and memory pressure on a very small host

### CD Responsibilities

CD should deploy only validated revisions to the VM and restart the application through `systemd`.

Preferred direction:

1. build the Next.js production output in CI
2. assemble a complete runtime artifact in CI, including runtime `node_modules`
3. copy that artifact to the VM
4. unpack into a versioned release directory
5. update a stable symlink such as `current`
6. restart the application service
7. verify local and public health before completing the deploy
8. prune old releases after success

Operational rule:

Do not perform dependency installation or application builds on the tiny VM as part of the normal deployment path. The Oracle Cloud micro instance should primarily extract the ready-to-run artifact, switch the `current` symlink, restart the service, and answer health checks.

Trade-off:

The CI-built artifact is larger than a source-only deploy, but it avoids repeated dependency resolution and build work on a very small machine, which is the more important constraint for the current production setup.

### Service Runtime

The working production service path is:

- `systemd` supervises the application
- `WorkingDirectory` points at `/srv/open-chat/current`
- the service starts the app with `next start`

Recommended service command:

```ini
ExecStart=/usr/bin/env sh -lc 'exec ./node_modules/.bin/next start -p "${PORT:-3000}"'
```

Why:

- it runs the packaged production runtime directly
- it avoids `pnpm start` runtime checks during service boot
- it keeps the deploy path compatible with runner-built artifacts

### Health Verification

Deployment verification should happen in two stages:

1. on the VM, confirm the service is active and responds on `http://127.0.0.1:3000`
2. from CI, confirm the public HTTPS origin responds successfully

Why:

- the first check isolates application boot from proxy behavior
- the second check confirms the full public path through Caddy

### Release Retention

Keep only a small number of recent releases on the VM, for example the last five.

Why:

- preserves limited disk space on the VM
- still allows fast rollback to a recent working release

---

## Oracle Cloud VM Notes

For a small Oracle Cloud VM such as `VM.Standard.E2.1.Micro`:

- keep the runtime single-instance
- do not run PostgreSQL locally
- do not add Dokku, CapRover, or similar platform layers by default
- add swap conservatively if the machine is memory constrained
- keep the Node.js process and reverse proxy as the only long-running app services when possible
- prefer runner-built release artifacts over VM-side dependency installation

Why:

- the current realtime slice already assumes a single-instance in-memory subscription hub
- the machine size is small enough that extra orchestration layers are usually a net negative

---

## Operational Constraints

The current deployment model has explicit limits.

### Single-instance realtime only

Realtime room fan-out and room presence counts are currently backed by in-memory subscription state inside one application instance.

Consequence:

- multiple application instances will not share realtime subscriptions yet

### Redis is not yet the fan-out layer

Redis currently stores ephemeral typing state, but it is not yet the cross-instance subscription or fan-out layer.

Consequence:

- do not assume horizontal scaling is complete for realtime behavior

### VM-first hosting is the current default

Because the runtime starts a long-running WebSocket listener, deployment targets must support persistent processes.

Consequence:

- generic request-only serverless hosting is not the default recommendation for the current repository state

---

## Deployment Checklist

Before calling the deployment setup complete, verify:

1. the reverse proxy serves the main app over HTTPS
2. the reverse proxy forwards `/ws` to the realtime gateway
3. `BETTER_AUTH_URL` matches the public HTTPS origin
4. `NEXT_PUBLIC_REALTIME_WS_URL` points to the public websocket endpoint
5. the application starts cleanly under `systemd` via `./node_modules/.bin/next start`
6. `http://127.0.0.1:3000` responds locally on the VM after restart
7. the realtime gateway starts with the application process
8. a signed-in room member can receive a newly posted room message without refresh
9. a signed-in room member can receive room-scoped typing indicator updates while Redis is reachable

---

## Future Evolution

The deployment model can evolve later, but the next change should follow measured product and operational needs.

Likely future steps:

- formalize a release artifact for CI/CD
- add Redis-backed cross-instance realtime fan-out
- revisit multi-instance deployment only after realtime coordination is implemented

Until then, prefer one VM, one application instance, one reverse proxy, and one explicit CI/CD pipeline.
