import { createFileRoute, Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 px-4 py-20 select-none">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl text-center space-y-8 px-4 flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wider uppercase">
          ⚡️ Built with React, Vite & TanStack Router
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 dark:from-white dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
            Collaborative Whiteboards, Reimagined
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Create, brainstorm, and bring your designs to life with a modern vector drafting canvas, backed by secure authentication.
          </p>
        </div>

        {/* Call to Actions (CTA) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <SignedIn>
            <Link
              to="/dashboard"
              className="group cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-semibold py-3.5 px-8 rounded-full shadow-lg shadow-indigo-600/25 transition-all duration-200"
            >
              <span>Go to Dashboard</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="group cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-semibold py-3.5 px-8 rounded-full shadow-lg shadow-indigo-600/25 transition-all duration-200">
                <span>Get Started Free</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Canvas Preview/Mockup */}
        <div className="w-full max-w-3xl mt-12 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md p-2 shadow-2xl">
          <div className="h-64 sm:h-80 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

            <div className="space-y-2 text-center z-10">
              <span className="text-3xl sm:text-4xl">🎨</span>
              <h3 className="text-sm font-bold">Interactive Vector Board</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs leading-relaxed">
                Unlock collaborative editing and persistence by logging in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
