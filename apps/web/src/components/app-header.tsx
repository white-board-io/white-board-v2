import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { YearSwitcher } from "./year-switcher";

export function AppHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <button
        onClick={onOpenMenu}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>
      <Link to="/discover" className="flex items-center gap-2 transition-opacity hover:opacity-80 lg:hidden">
        <img src="/whiteboard-logo.svg" alt="" className="h-7 w-7" />
        <span className="text-sm font-bold text-foreground">WhiteBoard</span>
      </Link>
      <div className="flex-1" />
      <YearSwitcher />
    </header>
  );
}
