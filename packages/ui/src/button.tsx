/**
 * Button — shadcn-style, design-system-aware.
 *
 * Variants:
 *   - primary     (default)  filled brand violet with soft brand shadow
 *   - secondary               white surface, line border
 *   - tonal                   subtle brand wash (bg-accent / text-accent-fg)
 *   - ghost                   transparent, hover sunken
 *   - destructive             danger fill
 *   - link                    inline text link
 *
 * Sizes: sm | default | lg | icon
 *
 * Set `asChild` to render the styles on a slot (e.g. an <a> or router Link).
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md",
    "font-sans font-semibold leading-none select-none",
    "transition-[background-color,border-color,box-shadow,transform] duration-[180ms]",
    "[transition-timing-function:var(--ease-standard)]",
    "active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_rgba(89,95,174,0.45)]",
    "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-brand hover:bg-brand-600 active:bg-brand-700",
        secondary: "bg-card text-foreground border border-border shadow-xs hover:border-line-strong",
        tonal: "bg-accent text-accent-foreground border border-brand-100 hover:bg-brand-100",
        ghost: "text-foreground hover:bg-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-danger-700",
        link: "text-brand-600 hover:text-brand-700 underline-offset-[3px] hover:underline decoration-2 px-0",
      },
      size: {
        sm: "h-9  px-3 text-sm rounded-sm [&_svg]:size-4",
        default: "h-11 px-[18px] text-sm [&_svg]:size-4",
        lg: "h-12 px-6 text-base rounded-lg [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-4 rounded-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";

export { buttonVariants };
