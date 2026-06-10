import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth, useOrganizationList } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AppHeader } from "../../components/app-header";
import { AppSidebar } from "../../components/app-sidebar";
import { useAcademicYearStore } from "../../store/academic-year";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isLoaded, isSignedIn, orgId } = useAuth({ treatPendingAsSignedOut: false });
  const { isLoaded: orgsLoaded, userMemberships, setActive } = useOrganizationList({ userMemberships: true });
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryClient = useQueryClient();
  const setSelectedYear = useAcademicYearStore((s) => s.setSelectedYear);
  const previousOrgId = useRef(orgId);

  const soleOrgId =
    orgsLoaded && !orgId && userMemberships.count === 1 ? userMemberships.data[0]?.organization.id : undefined;

  useEffect(() => {
    if (soleOrgId && setActive) {
      void setActive({ organization: soleOrgId });
    }
  }, [soleOrgId, setActive]);

  // Reset cached data and the selected year when the active workspace changes.
  useEffect(() => {
    if (previousOrgId.current !== orgId) {
      previousOrgId.current = orgId;
      queryClient.clear();
      setSelectedYear(null);
    }
  }, [orgId, queryClient, setSelectedYear]);

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
          onClick={() => {
            setMobileOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <AppSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => {
          setMobileOpen(false);
        }}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader
          onOpenMenu={() => {
            setMobileOpen(true);
          }}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
