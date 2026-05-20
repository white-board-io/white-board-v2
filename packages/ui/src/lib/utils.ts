/**
 * The `cn()` helper — merge Tailwind class names, deduping conflicts.
 * Imported by every primitive in @repo/ui.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
