import { useRouterState } from "@tanstack/react-router";
import { Construction } from "lucide-react";

export function ComingSoon() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <Construction className="size-6" />
      </div>
      <h1 className="text-xl font-bold text-foreground">Coming soon</h1>
      <p className="text-sm text-muted-foreground">
        <code className="rounded bg-secondary px-1.5 py-0.5">{pathname}</code> isn&rsquo;t built yet.
      </p>
    </div>
  );
}
