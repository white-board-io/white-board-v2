# ADR-0004: Route post-login by Active Workspace presence, not membership count

## Status
Accepted

## Context
A User may belong to many Workspaces (Clerk Organizations), but a Session has at most one **Active Workspace** — the `orgId` carried in the JWT (see [CONTEXT.md](../../CONTEXT.md)). After the Auth Gate confirms a Session, something must decide where the User lands, and in particular when to make them choose a Workspace.

The obvious rule — "member of more than one Workspace → show a picker every login" — forces returning multi-Workspace Users to re-pick on every single sign-in, even though Clerk already persists their last Active Workspace per-client. That persistence means the system usually *already knows* which Workspace the User wants.

There is also an asymmetry Clerk forces on us: an Active Workspace is **not** guaranteed just because a User has memberships. On a new device or browser, a single-Workspace User has one membership but `orgId` is null (the prior activation isn't persisted there). ADR-0002 already notes Clerk "does not return [a newly created org] as active automatically." So "has memberships" and "has an Active Workspace" are genuinely different states.

## Decision
The `_authenticated` layout owns a single **Workspace Gate** that routes by Active Workspace presence (`auth.orgId`), not membership count:

- No Session → `/login` (Auth Gate).
- `count === 0` → `/create-workspace` (Onboarding Gate).
- `orgId` set → render the requested route.
- `orgId` null, `count === 1` → silently `setActive({ organization })`, show a spinner, then render.
- `orgId` null, `count > 1` → `/select-workspace` (Workspace Selection).

Workspace Selection is a top-level full-screen route mirroring `/create-workspace` (own session check, no app chrome). Selecting a Workspace calls `setActive` and navigates to `/discover` — always Discover, never a preserved deep link. The login route is left untouched; the gate handles org state on every entry path (login, refresh, deep link).

## Considered options
- **Force a picker every login for any multi-Workspace User** — simplest rule, but ignores Clerk's persisted Active Workspace and re-prompts returning Users needlessly. Rejected.
- **Drive the gate off membership count only** — would skip the picker correctly but cannot distinguish "one membership, already active" from "one membership, no active org on this device," leaving `/discover` with a null `orgId`. Rejected.
- **Pre-activate / pick at the login route** — only covers the login entry path, not refresh or deep links, and splits the gate across two places. Rejected in favour of a single owner.
- **Thread `redirect_url` through Workspace Selection** — preserves deep links across a Workspace pick, but adds plumbing for a marginal case. Deferred; Discover is the defined post-login home.

## Consequences
- The single-Workspace silent-activation branch is load-bearing for the new-device case, not just cosmetic — without it, org-scoped API calls on `/discover` would fail with a null `orgId`.
- Returning multi-Workspace Users skip the picker entirely, because Clerk restores their last Active Workspace.
- A manual Workspace switcher (switching while already inside the app) is a separate, not-yet-built feature; the gate is login-time only.
- The picker keys off accepted `userMemberships`; invitations are out of scope until the invite module. When that module auto-accepts invited parents/students, those become memberships and will count toward the gate's one-vs-many logic.
- Reversing to "force-pick every login" later is a small, localized change to the gate.
