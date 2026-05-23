import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useAuth, useOrganizationList } from "@clerk/clerk-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { School, GraduationCap, Globe } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";

export const Route = createFileRoute("/create-workspace")({
  component: CreateWorkspacePage,
});

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000";

const WORKSPACE_TYPES = [
  { value: "school", label: "School", description: "K–12 or general schooling", Icon: School, comingSoon: false },
  {
    value: "training_institute",
    label: "Training Institute",
    description: "In-person coaching or training",
    Icon: GraduationCap,
    comingSoon: true,
  },
  {
    value: "online_institute",
    label: "Online Institute",
    description: "Fully remote teaching",
    Icon: Globe,
    comingSoon: true,
  },
] as const;

const schema = z.object({
  name: z.string().min(1, "Workspace name is required").max(999, "Workspace name must be 999 characters or fewer"),
  orgType: z.enum(["school", "training_institute", "online_institute"], {
    error: "Select a workspace type",
  }),
  address: z.object({
    line1: z.string().min(1, "Address line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State / region is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
});
type WorkspaceValues = z.infer<typeof schema>;

function CreateWorkspacePage() {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth({ treatPendingAsSignedOut: false });
  const { isLoaded: orgsLoaded, setActive, userMemberships } = useOrganizationList({ userMemberships: true });
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceValues>({ resolver: zodResolver(schema), defaultValues: { orgType: "school" } });

  const selectedType = watch("orgType");

  const onSubmit = async (values: WorkspaceValues) => {
    if (!setActive) return;
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch(`${API_BASE}/api/workspaces`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as { orgId?: string; message?: string };
      if (!response.ok || !data.orgId) {
        throw new Error(data.message ?? "Could not create your workspace. Please try again.");
      }

      await setActive({ organization: data.orgId });
      await navigate({ to: "/discover", replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create your workspace. Please try again.";
      setError("root", { message });
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

  if (userMemberships.count > 0) {
    return <Navigate to="/discover" replace />;
  }

  if (isSubmitting || userMemberships.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
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
            <h1 className="text-2xl font-bold text-foreground">Create your workspace</h1>
            <p className="text-sm text-muted-foreground">Set up your institution to get started</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
          className="space-y-6"
          noValidate
        >
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-semibold text-foreground">
              Workspace name
            </label>
            <Input
              id="name"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              placeholder="e.g. E.D. Willmott Matric Higher Secondary School"
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <span className="text-sm font-semibold text-foreground">Workspace type</span>
            <div className="grid gap-3 sm:grid-cols-3">
              {WORKSPACE_TYPES.map(({ value, label, description, Icon, comingSoon }) => {
                const active = selectedType === value;
                return (
                  <label
                    key={value}
                    className={`relative flex flex-col gap-2 rounded-xl border p-4 transition-colors ${
                      comingSoon
                        ? "cursor-not-allowed border-border opacity-50"
                        : active
                          ? "cursor-pointer border-primary ring-2 ring-ring/40 bg-primary/5"
                          : "cursor-pointer border-border hover:border-primary/60"
                    }`}
                  >
                    <input
                      type="radio"
                      value={value}
                      className="sr-only"
                      disabled={comingSoon}
                      {...register("orgType")}
                    />
                    <div className="flex items-center gap-2">
                      <Icon size={20} className={active ? "text-primary" : "text-muted-foreground"} />
                      {comingSoon && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                    <span className="text-xs text-muted-foreground leading-snug">{description}</span>
                  </label>
                );
              })}
            </div>
            {errors.orgType && <p className="text-sm text-destructive">{errors.orgType.message}</p>}
          </div>

          {/* Address */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-foreground mb-1">Address</legend>

            <div className="space-y-1.5">
              <Input aria-label="Address line 1" placeholder="Address line 1" {...register("address.line1")} />
              {errors.address?.line1 && <p className="text-sm text-destructive">{errors.address.line1.message}</p>}
            </div>

            <Input
              aria-label="Address line 2 (optional)"
              placeholder="Address line 2 (optional)"
              {...register("address.line2")}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Input aria-label="City" placeholder="City" {...register("address.city")} />
                {errors.address?.city && <p className="text-sm text-destructive">{errors.address.city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Input aria-label="State / region" placeholder="State / region" {...register("address.state")} />
                {errors.address?.state && <p className="text-sm text-destructive">{errors.address.state.message}</p>}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Input aria-label="Postal code" placeholder="Postal code" {...register("address.postalCode")} />
                {errors.address?.postalCode && (
                  <p className="text-sm text-destructive">{errors.address.postalCode.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Input aria-label="Country" placeholder="Country" {...register("address.country")} />
                {errors.address?.country && (
                  <p className="text-sm text-destructive">{errors.address.country.message}</p>
                )}
              </div>
            </div>
          </fieldset>

          {errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.message}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            Create workspace
          </Button>
        </form>
      </div>
    </div>
  );
}
