import { createFileRoute, Outlet, Link, Navigate } from "@tanstack/react-router";
import { useAuth, useOrganizationList } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "../../components/app-sidebar";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isLoaded, isSignedIn, orgId } = useAuth({ treatPendingAsSignedOut: false });
  const { isLoaded: orgsLoaded, userMemberships, setActive } = useOrganizationList({ userMemberships: true });
  const [mobileOpen, setMobileOpen] = useState(false);

  const soleOrgId =
    orgsLoaded && !orgId && userMemberships.count === 1
      ? userMemberships.data[0]?.organization.id
      : undefined;

  useEffect(() => {
    if (soleOrgId && setActive) {
      void setActive({ organization: soleOrgId });
    }
  }, [soleOrgId, setActive]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, []);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      {/* Mobile backdrop */}
      {mobileOpen && (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => { setMobileOpen(false); }}
        />
      )}

      {/* Sidebar */}
      <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => { setMobileOpen(false); }} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-border bg-card shrink-0">
          <button
            onClick={() => { setMobileOpen(true); }}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <Link
            to="/discover"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/whiteboard-logo.svg" alt="" className="w-7 h-7" />
            <span className="font-bold text-sm text-foreground">WhiteBoard</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
