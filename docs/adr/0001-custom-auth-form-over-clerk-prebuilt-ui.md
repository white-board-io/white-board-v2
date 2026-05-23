# ADR-0001: Custom auth form over Clerk prebuilt UI

## Status

Accepted

## Context

Clerk provides a prebuilt `<SignIn>` component that handles the full auth UI — form, error states, MFA, social OAuth. The alternative is a fully custom form calling `useSignIn()` directly.

## Decision

Use a custom form (`useSignIn()` hooks) instead of the Clerk prebuilt `<SignIn>` component.

## Reasons

1. The product has an established visual design (`app.white-board.io`) that must be pixel-matched. The Clerk component cannot be fully unstyled to match Quicksand typography, the exact `rgb(89, 95, 174)` primary, and the split-panel layout.
2. This is a SaaS product — the login screen is a brand touchpoint. Clerk's default aesthetic is intentionally generic.

## Trade-offs

- **We own error handling**: Clerk error codes (`form_identifier_not_found`, `form_password_incorrect`, etc.) must be mapped to user-facing messages manually.
- **We own loading states**: Spinner/disabled button logic is our responsibility.
- **Scope is deliberately narrow**: Email + password only. No social OAuth, no MFA. ~~No "Forgot password" for now.~~ Adding any of these requires new custom UI work.
  - **Update (ADR-0002 era):** A custom Password Reset Flow (`/forgot-password`, Clerk `reset_password_email_code`) and the full Sign-up Flow (`/signup` + Email Verification) have since been added — same custom-UI / `useSignIn`-`useSignUp` approach, no prebuilt components. Social OAuth and MFA remain out of scope.

## Consequences

The Clerk `<SignIn>`, `<SignInButton>`, and `<SignedOut>` components are removed from the app. Authentication state is read exclusively via `useAuth()` and `useSignIn()`.
