"use client";

/**
 * ThemeToggle — small button group that cycles light / dark / system.
 *
 *   <ThemeToggle />
 *
 * Drop anywhere inside a <ThemeProvider>.
 */

import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "./lib/utils";
import { useTheme, type Theme } from "./theme-provider";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("inline-flex items-center gap-1 rounded-md border border-border bg-card p-1", className)}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-sm",
              "transition-colors duration-150 [transition-timing-function:var(--ease-standard)]",
              "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--color-ring)]",
              active ? "bg-primary text-primary-foreground" : "text-ink-4 hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
