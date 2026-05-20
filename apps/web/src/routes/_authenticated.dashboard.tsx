import { createFileRoute } from "@tanstack/react-router";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type APIResponse = {
  status: number;
  statusText: string;
  payload: unknown;
};

function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [apiResponse, setApiResponse] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSecureAPI = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      // Get the JWT session token from Clerk
      const token = await getToken();

      if (!token) {
        throw new Error("No token returned from Clerk");
      }

      // Fetch from the Fastify API
      const response = await fetch("http://localhost:4000/api/protected", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        const errorMsg = typeof data.message === "string" ? data.message : `API error: ${response.status.toString()}`;
        throw new Error(errorMsg);
      }

      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        payload: data,
      });
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to contact Fastify API";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl shadow-indigo-500/10">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
            <img
              src={user?.imageUrl ?? ""}
              alt={user?.fullName ?? "User avatar"}
              className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-md object-cover"
            />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.firstName ?? "Creator"}!
              </h1>
              <p className="text-indigo-100 text-sm max-w-md font-medium">
                Manage your whiteboards, team collaboration, and explore secure endpoints.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center sm:items-end text-sm text-indigo-100 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 self-stretch md:self-auto">
            <span className="font-semibold text-white">Account Details</span>
            <span>{user?.primaryEmailAddress?.emailAddress ?? ""}</span>
            <span className="text-xs text-indigo-200 mt-1">ID: {user?.id ?? ""}</span>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Integration Test Card (Col-span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold tracking-tight">Secure Fastify API Connection</h2>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              Test full-stack authentication by sending an authenticated request from this React client to your local
              Fastify server. The client will generate a secure JWT, which the Fastify plugin will decrypt and validate.
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
            <span className="text-zinc-400 dark:text-zinc-600">{"// API Request Header"}</span>
            <br />
            Authorization: Bearer <span className="text-indigo-500 font-semibold">[Clerk JWT Session Token]</span>
          </div>

          {/* Response Box */}
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 rounded-2xl p-4 text-sm text-red-600 dark:text-red-400 space-y-1">
              <div className="font-semibold">Request Failed</div>
              <div>{error}</div>
            </div>
          )}

          {apiResponse && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-900/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">API Response</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md text-xs">
                  HTTP {apiResponse.status.toString()}
                </span>
              </div>
              <pre className="text-xs font-mono bg-zinc-950 text-indigo-400 p-4 rounded-xl overflow-x-auto border border-zinc-800 shadow-inner">
                {JSON.stringify(apiResponse.payload, null, 2)}
              </pre>
            </div>
          )}

          <button
            onClick={() => {
              void testSecureAPI();
            }}
            disabled={loading}
            className="cursor-pointer mt-4 w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-2xl shadow-lg shadow-indigo-600/15 disabled:opacity-50 transition-all duration-200 text-sm"
          >
            {loading ? "Calling API..." : "Test Protected API Route"}
          </button>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold tracking-tight">Workspace Stats</h2>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl flex justify-between items-center">
              <div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Active Boards</div>
                <div className="text-2xl font-black mt-1">4</div>
              </div>
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-bold">
                🎨
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl flex justify-between items-center">
              <div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Members</div>
                <div className="text-2xl font-black mt-1">1 (Personal)</div>
              </div>
              <div className="w-10 h-10 bg-pink-50 dark:bg-pink-950 rounded-xl flex items-center justify-center text-pink-600 dark:text-pink-400 text-xl font-bold">
                👥
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl flex justify-between items-center">
              <div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Security State</div>
                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">MFA Protected</div>
              </div>
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl font-bold">
                🛡️
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
