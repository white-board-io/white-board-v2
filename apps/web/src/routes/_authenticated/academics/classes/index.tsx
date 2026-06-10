import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@repo/ui/button";
import { PageHeader } from "../../../../components/page-header";
import { EmptyState, ErrorState, Spinner, errorMessage } from "../../../../components/states";
import { useGradeLevels } from "../../../../features/grade-levels/api";

export const Route = createFileRoute("/_authenticated/academics/classes/")({
  component: ClassesPage,
});

function ClassesPage() {
  const { data, isPending, error } = useGradeLevels();

  const addButton = (
    <Button asChild>
      <Link to="/academics/classes/new">Add class</Link>
    </Button>
  );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <PageHeader
        title="Classes"
        description="Reusable grade levels (LKG, Class 1 … Class 12). Not tied to a year."
        action={addButton}
      />
      {isPending ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={errorMessage(error)} />
      ) : data.length === 0 ? (
        <EmptyState title="No classes yet" description="Add the grade levels your school teaches." action={addButton} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Short name</th>
                <th className="px-4 py-2 font-semibold">Order</th>
                <th className="px-4 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((g) => (
                <tr key={g.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-2 font-medium text-foreground">{g.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{g.shortName ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{g.sortOrder}</td>
                  <td className="px-4 py-2 text-muted-foreground capitalize">{g.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
