# ADR-0002: Workspaces are created server-side, not from the client

## Status

Accepted

## Context

A Workspace is a Clerk Organization (see [CONTEXT.md](../../CONTEXT.md)). Beyond its name, a Workspace carries an address and a type (School / Training Institute / Online Institute), which we store in the organization's `publicMetadata`. Clerk's **frontend** SDK can create an organization and update its `name`/`slug`, but organization `publicMetadata` is **read-only from the client** — unlike user `unsafeMetadata`, organizations have no client-writable metadata channel. So the address and type can only be persisted from the backend.

## Decision

The create-workspace form POSTs name + structured address + type to `POST /api/workspaces` on the Fastify API (`apps/api`). The backend verifies the Clerk session, then calls `clerkClient.organizations.createOrganization({ name, createdBy, publicMetadata: { address, orgType } })` and returns the new `orgId`. The frontend then reloads its organization list and calls `setActive({ organization: orgId })` before navigating into the app.

Critically, `createdBy` is taken from the **verified** `getAuth(request).userId`, never from the request body — a caller cannot create a Workspace owned by another User.

## Considered options

- **Frontend `createOrganization()` only** — simplest, but physically cannot set `publicMetadata`, so address and type would be lost. Rejected: contradicts the requirement.
- **Frontend creates org, backend patches metadata** — two round-trips and a window where an org exists with no address/type. Rejected in favour of one atomic backend create.

## Consequences

- `apps/api` graduates from a stub to a real dependency of signup; it requires `CLERK_SECRET_KEY`.
- Because the org is created off-session, the frontend must reload the organization list and explicitly activate the new org — Clerk does not return it as active automatically.
- Future Workspace attributes follow the same path: write from the backend, never the client.
