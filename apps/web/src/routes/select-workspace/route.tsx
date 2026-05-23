import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useAuth, useOrganizationList } from "@clerk/clerk-react";
import { useState } from "react";
import { School, GraduationCap, Globe, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/select-workspace")({
  component: SelectWorkspacePage,
});

const WORKSPACE_TYPES = {
  school: { label: "School", Icon: School },
  training_institute: { label: "Training Institute", Icon: GraduationCap },
  online_institute: { label: "Online Institute", Icon: Globe },
} as const;

type WorkspaceType = keyof typeof WORKSPACE_TYPES;

function workspaceType(metadata: unknown): (typeof WORKSPACE_TYPES)[WorkspaceType] | undefined {
  const orgType = (metadata as { orgType?: string } | null)?.orgType;
  return orgType && orgType in WORKSPACE_TYPES ? WORKSPACE_TYPES[orgType as WorkspaceType] : undefined;
}

function SelectWorkspacePage() {
  const { isLoaded: authLoaded, isSignedIn, orgId } = useAuth({ treatPendingAsSignedOut: false });
  const { isLoaded: orgsLoaded, setActive, userMemberships } = useOrganizationList({ userMemberships: true });
  const navigate = useNavigate();

  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSelect = async (id: string) => {
    if (!setActive) return;
    setError(null);
    setSelectingId(id);
    try {
      await setActive({ organization: id });
      await navigate({ to: "/discover", replace: true });
    } catch {
      setError("Could not switch to that workspace. Please try again.");
      setSelectingId(null);
    }
  };

  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!orgsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Self-guards: only the genuine multi-Workspace, no-Active-Workspace case renders here.
  if (userMemberships.count === 0) {
    return <Navigate to="/create-workspace" replace />;
  }
  if (orgId || userMemberships.count === 1) {
    return <Navigate to="/discover" replace />;
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background px-4 py-12">
      {/* Full-screen background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-primary to-brand-700" />
      <div className="absolute inset-0 bg-background/5" />

      {/* Centered card */}
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-background shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <img src="/whiteboard-logo.svg" alt="WhiteBoard" className="w-11 h-11" />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Select a workspace</h1>
            <p className="text-sm text-muted-foreground">Choose which workspace to continue with</p>
          </div>
        </div>

        <ul className="space-y-3">
          {userMemberships.data.map((membership) => {
            const { organization } = membership;
            const type = workspaceType(organization.publicMetadata);
            const Icon = type?.Icon ?? School;
            const isSelecting = selectingId === organization.id;
            return (
              <li key={organization.id}>
                <button
                  type="button"
                  disabled={selectingId !== null}
                  onClick={() => {
                    void onSelect(organization.id);
                  }}
                  className="group flex w-full items-center gap-4 rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={20} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-foreground">{organization.name}</span>
                    {type && <span className="text-xs text-muted-foreground">{type.label}</span>}
                  </span>
                  {isSelecting ? (
                    <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
