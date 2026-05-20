/**
 * Code — inline code styling. Replaces the original placeholder.
 */

import { type JSX } from "react";
import { cn } from "./lib/utils";

export function Code({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return (
    <code
      className={cn(
        "font-mono text-[0.92em] bg-secondary border border-border rounded-sm px-1.5 py-0.5 text-foreground",
        className,
      )}
    >
      {children}
    </code>
  );
}
