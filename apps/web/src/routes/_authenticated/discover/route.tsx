import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/discover")({
  component: DiscoverPage,
});

function DiscoverPage() {
  return <p>Hello world</p>;
}
