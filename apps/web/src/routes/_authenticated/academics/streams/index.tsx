import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@repo/ui/button";
import { PageHeader } from "../../../../components/page-header";
import { EmptyState, ErrorState, Spinner, errorMessage } from "../../../../components/states";
import { useStreams } from "../../../../features/streams/api";

export const Route = createFileRoute("/_authenticated/academics/streams/")({
  component: StreamsPage,
});

function StreamsPage() {
  const { data, isPending, error } = useStreams();

  const addButton = (
    <Button asChild>
      <Link to="/academics/streams/new">Add stream</Link>
    </Button>
  );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <PageHeader
        title="Streams"
        description="Academic tracks for higher grades (Science, Commerce, Arts)."
        action={addButton}
      />
      {isPending ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={errorMessage(error)} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No streams yet"
          description="Add streams if your higher grades are split by track."
          action={addButton}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Order</th>
                <th className="px-4 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-2 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{s.sortOrder}</td>
                  <td className="px-4 py-2 text-muted-foreground capitalize">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
