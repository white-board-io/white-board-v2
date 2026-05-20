"use client";

/**
 * ThemeProvider — toggles a `.dark` class on <html>, persists the choice
 * in localStorage, and respects `prefers-color-scheme: dark` as the default.
 *
 *   // apps/web/src/main.tsx
 *   import { ThemeProvider } from "@repo/ui/theme-provider";
 *   …
 *   <ThemeProvider defaultTheme="system">
 *     <RouterProvider router={router} />
 *   </ThemeProvider>
 *
 * Then consume with the hook:
 *   const { theme, setTheme, resolvedTheme } = useTheme();
 */

import * as React from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "wb-theme";

function resolve(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyToDocument(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({ children, defaultTheme = "system", storageKey = STORAGE_KEY }: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return (window.localStorage.getItem(storageKey) as Theme | null) ?? defaultTheme;
  });
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(() => resolve(theme));

  // Apply on mount + whenever theme changes
  React.useEffect(() => {
    const r = resolve(theme);
    setResolvedTheme(r);
    applyToDocument(r);
  }, [theme]);

  // React to OS-level changes when theme === "system"
  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const r = mq.matches ? "dark" : "light";
      setResolvedTheme(r);
      applyToDocument(r);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = React.useCallback(
    (next: Theme) => {
      window.localStorage.setItem(storageKey, next);
      setThemeState(next);
    },
    [storageKey],
  );

  const value = React.useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme() must be used inside a <ThemeProvider>");
  return ctx;
}
