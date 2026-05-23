# ADR-0003: React Hook Form + Zod is the standard form stack

## Status
Accepted

## Context
The original login form (ADR-0001) manages state with raw `useState` and ad-hoc validation. The signup, email-verification, password-reset, and create-workspace flows introduce many more fields (a structured address alone is six), with shared needs: typed schemas, per-field validation, error display, and submit/disabled state. Hand-rolling this per form is repetitive and drifts in behaviour.

## Decision
All forms use **React Hook Form** for state/submission and **Zod** (via `@hookform/resolvers`) for schema validation. This is the default pattern for new forms, and the existing login form is migrated to it for consistency. Email + password remains the only auth method — this decision is about form mechanics, not auth scope.

## Consequences
- `react-hook-form`, `zod`, and `@hookform/resolvers` are added to `apps/web`.
- Zod schemas are the single source of truth for a form's shape and client-side rules; they also document the payload sent to the backend (e.g. the workspace address object in [ADR-0002](0002-backend-owned-workspace-creation.md)).
- Clerk remains the authority on server-side rules (password strength, email uniqueness); Zod handles client-side ergonomics only, and Clerk error mapping still applies.
