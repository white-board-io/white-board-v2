import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";

export type RouterContext = {
  auth: {
    isSignedIn: boolean | undefined;
    userId: string | null | undefined;
  };
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 flex flex-col font-sans antialiased">
      {/* Premium Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
            >
              <span>WhiteBoard</span>
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                to="/"
                activeProps={{ className: "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50" }}
                inactiveProps={{
                  className: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
                }}
                className="px-3 py-1.5 rounded-lg transition-colors"
              >
                Home
              </Link>
              <SignedIn>
                <Link
                  to="/dashboard"
                  activeProps={{ className: "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50" }}
                  inactiveProps={{
                    className: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
                  }}
                  className="px-3 py-1.5 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
              </SignedIn>
            </nav>
          </div>

          {/* User Section / CTA */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="cursor-pointer bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-4 py-2 rounded-full font-medium text-xs sm:text-sm shadow-sm transition-all duration-200 active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-flex text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  Go to App
                </Link>
                <UserButton
                  appearance={{ elements: { avatarBox: "h-9 w-9 border border-zinc-200/50 dark:border-zinc-800/50" } }}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      <TanStackRouterDevtools position="bottom-right" />
    </div>
  ),
});
