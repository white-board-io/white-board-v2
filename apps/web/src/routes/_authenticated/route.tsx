import { createFileRoute, Outlet, Link, Navigate } from "@tanstack/react-router";
import { UserButton, useAuth, useOrganizationList } from "@clerk/clerk-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isLoaded, isSignedIn, orgId } = useAuth({ treatPendingAsSignedOut: false });
  const { isLoaded: orgsLoaded, userMemberships, setActive } = useOrganizationList({ userMemberships: true });

  // No Active Workspace but exactly one membership: activate it silently.
  // Covers the new-device case where Clerk has no persisted active org.
  const soleOrgId =
    orgsLoaded && !orgId && userMemberships.count === 1
      ? userMemberships.data[0]?.organization.id
      : undefined;

  useEffect(() => {
    if (soleOrgId && setActive) {
      void setActive({ organization: soleOrgId });
    }
  }, [soleOrgId, setActive]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" search={{ redirect_url: window.location.pathname }} replace />;
  }

  if (!orgsLoaded || userMemberships.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!orgId && userMemberships.count === 0) {
    return <Navigate to="/create-workspace" replace />;
  }

  if (!orgId) {
    if (userMemberships.count > 1) {
      return <Navigate to="/select-workspace" replace />;
    }
    // count === 1: silent activation in flight (see effect above).
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/discover" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img src="/whiteboard-logo.svg" alt="" className="w-8 h-8" />
            <span className="text-base font-bold text-foreground">WhiteBoard</span>
          </Link>
          <UserButton
            appearance={{
              elements: { avatarBox: "h-9 w-9 border border-border" },
            }}
          />
        </div>
      </header>
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
