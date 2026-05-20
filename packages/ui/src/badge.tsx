/**
 * Badge — small status chip.
 *
 * Variants:
 *   - default     neutral chip on paper-sunken
 *   - brand       tonal brand wash
 *   - success / warning / danger / info  — semantic
 *   - marker      yellow highlight (use sparingly)
 *   - outline     transparent + line border
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-tight border",
  {
    variants: {
      variant: {
        default: "bg-secondary text-foreground border-border",
        brand: "bg-accent text-accent-foreground border-brand-100",
        success: "bg-success-50 text-success-700 border-success-100",
        warning: "bg-warning-50 text-warning-700 border-warning-100",
        danger: "bg-danger-50 text-danger-700 border-danger-100",
        info: "bg-info-50 text-info-700 border-info-100",
        marker: "bg-marker-100 text-marker-700 border-marker-300",
        outline: "bg-transparent text-foreground border-border",
        ink: "bg-ink text-paper border-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
