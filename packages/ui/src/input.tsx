/**
 * Input — text fields, search, etc.
 * Pairs with <Label> for accessible forms.
 */

import * as React from "react";
import { cn } from "./lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-11 w-full rounded-md border border-input bg-card px-3.5 py-2",
      "font-sans text-base font-medium text-foreground",
      "placeholder:text-ink-5 placeholder:font-normal",
      "transition-[border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-standard)]",
      "hover:border-line-strong",
      "focus-visible:outline-none focus-visible:border-brand-500 focus-visible:shadow-[0_0_0_4px_rgba(89,95,174,0.25)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[0_0_0_4px_rgba(210,74,54,0.20)]",
      "file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
