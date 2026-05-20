import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { routeTree } from "./routeTree.gen";
import "./index.css";

// Create router instance with initial type-safe auth state context
const router = createRouter({
  routeTree,
  context: {
    auth: {
      isSignedIn: undefined,
      userId: undefined,
    },
  },
});

declare module "@tanstack/react-router" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: typeof router;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

// Read the Clerk Publishable Key from Vite environment variables and safely cast it
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

if (!PUBLISHABLE_KEY) {
  // If the developer has not configured Clerk keys yet, show a premium help card rather than a blank screen/crash
  root.render(
    <StrictMode>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-purple-500/20">
            Clerk
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">Set up Clerk Authentication</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your White Board application is set up for Clerk auth, but the publishable key is missing.
            </p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-left font-mono text-xs text-zinc-300">
            <span className="text-zinc-500"># In apps/web/.env</span>
            <br />
            VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key
          </div>
          <p className="text-xs text-zinc-500">
            Get your keys from the <a href="https://dashboard.clerk.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Clerk Dashboard</a>.
          </p>
        </div>
      </div>
    </StrictMode>
  );
} else {
  root.render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <InnerApp />
      </ClerkProvider>
    </StrictMode>,
  );
}
