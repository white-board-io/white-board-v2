import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context }) => {
    // If user is not signed in, redirect them to the home page
    if (!context.auth.isSignedIn) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: "/",
      });
    }
  },
  component: () => <Outlet />,
});
