# Platform / Access & Tenancy

The shared identity, authentication, and multi-tenancy layer that every vertical
context (School, Training Institute, Online Institute) operates inside. Owns
Users, Sessions, and Workspaces. See [CONTEXT-MAP.md](./CONTEXT-MAP.md) for how
this relates to the domain contexts.

## Glossary

**Session**
A Clerk-managed authenticated session, represented as a JWT. Present when `useAuth().isSignedIn` is true. Absent on the login page and any unauthenticated state.

**Sign-in Flow**
The custom email + password authentication flow at `/login`. Implemented using Clerk's `useSignIn()` hook — no Clerk prebuilt UI components. Handles credential validation, Clerk error mapping, and post-login redirect. When the account has two-factor authentication enabled, Clerk returns `needs_second_factor` after the password step and the flow advances to Second-Factor Verification before completing.

**Second-Factor Verification**
The in-page step of the Sign-in Flow where a User with 2FA enabled enters a 6-digit code Clerk emails them (`email_code` strategy). Reached only when sign-in returns `needs_second_factor`. Includes a resend-code action. On success the Session is created and the User is redirected like any other sign-in.

**Sign-up Flow**
The custom account-creation flow at `/signup`. Two in-page steps: account details (first name, last name, email, password) then Email Verification. Implemented with Clerk's `useSignUp()` hook — no prebuilt UI. On completion the User has a Session but no Workspace, so the Onboarding Gate sends them to Workspace creation.

**Email Verification**
The step where a newly signed-up User confirms their email by entering a 6-digit code Clerk sends. Until verified, the signup is incomplete. Includes a resend-code action.

**Password Reset Flow**
The self-service password recovery flow at `/forgot-password`, reached via a "Forgot password?" link on the login form. Two in-page steps: request a reset code by email, then enter the code with a new password. Implemented with Clerk's reset-password-email-code strategy.

**Workspace Owner**
The User who creates a Workspace. Becomes the administrator of the underlying Clerk Organization. Recorded server-side as the organization's creator — never trusted from client input.

**Discover**
The first in-app screen a User lands on after successful authentication and workspace setup, at `/discover`. The post-login destination for all auth flows (sign-in, sign-up, password reset, workspace creation).

**Redirect URL**
The `?redirect_url=<path>` query parameter appended to `/login` when the router bounces an unauthenticated user from a protected route. After successful sign-in, the user is sent to this path. Falls back to `/discover` if absent or invalid.

**Public Layout**
The `_public/route.tsx` layout route. No navbar. Full-screen split-panel shell used exclusively for auth screens (login, signup, forgot-password). Shares no chrome with the authenticated app shell.

**Authenticated Layout**
The `_authenticated/route.tsx` layout route. Requires a valid Session. Redirects unauthenticated users to `/login?redirect_url=<current-path>`. Wraps all in-app routes (e.g. `/discover`).

**Auth Gate**
The application-wide rule: every route requires a Session. There is no public-facing landing page. Unauthenticated requests to any route are redirected to `/login`.

**Workspace**
The tenant boundary of the product — the educational institution a User belongs to. Realized as a Clerk Organization: the Workspace name is the organization's native name, and Workspace-specific attributes (address, type) are stored on the organization. A User creates a Workspace as the final step of signing up. The active Workspace's `orgId` is carried in the Session JWT.

**Workspace Type**
The category of educational institution a Workspace represents. One of a fixed set: School, Training Institute, Online Institute. Chosen at Workspace creation.

**Workspace Board**
The single examination board a school Workspace follows (e.g. CBSE, State, ICSE). A Workspace attribute stored alongside Workspace Type and address (Clerk `publicMetadata`), not a domain entity. Domain structures (grade levels, sections) do not vary by board in the MVP, and a Workspace has at most one board.

**Active Workspace**
The single Workspace currently in effect for a Session, carried as `orgId` in the Session JWT. A User may belong to many Workspaces but has at most one Active Workspace at a time. Clerk persists the last Active Workspace on the client across logins, so a returning User normally resumes with the same one.

**Workspace Selection**
The full-screen screen at `/select-workspace` where a User who has a Session and belongs to more than one Workspace, but currently has no Active Workspace, chooses which Workspace to activate. Selecting one sets it as the Active Workspace and sends the User to Discover. A User with exactly one Workspace never sees this screen — that Workspace is activated automatically.

**Onboarding Gate**
The application-wide rule: a User with a valid Session but zero Workspaces cannot reach any in-app route. Such Users are redirected to a full-screen Workspace-creation screen. Complements the Auth Gate — together they guarantee every in-app route has both a Session and an Active Workspace.

**Workspace Gate**
The application-wide rule that guarantees every in-app route has an Active Workspace. After the Auth Gate confirms a Session, the Workspace Gate routes by Workspace state: zero Workspaces fall to the Onboarding Gate (Workspace creation); no Active Workspace with exactly one Workspace activates it automatically; no Active Workspace with multiple Workspaces goes to Workspace Selection; an Active Workspace already set proceeds to the requested route.
