/**
 * Textarea — multi-line text input.
 */

import * as React from "react";
import { cn } from "./lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[88px] w-full rounded-md border border-input bg-card px-3.5 py-2.5",
      "font-sans text-base font-medium text-foreground",
      "placeholder:text-ink-5 placeholder:font-normal",
      "transition-[border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-standard)]",
      "hover:border-line-strong",
      "focus-visible:outline-none focus-visible:border-brand-500 focus-visible:shadow-[0_0_0_4px_rgba(89,95,174,0.25)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-invalid:border-destructive",
      "resize-y",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
