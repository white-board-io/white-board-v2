import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@repo/ui/button";
import { PageHeader } from "../../../../components/page-header";
import { EmptyState, ErrorState, Spinner, errorMessage } from "../../../../components/states";
import { useAcademicYears } from "../../../../features/academic-years/api";

export const Route = createFileRoute("/_authenticated/academics/academic-years/")({
  component: AcademicYearsPage,
});

function AcademicYearsPage() {
  const { data, isPending, error } = useAcademicYears();

  const addButton = (
    <Button asChild>
      <Link to="/academics/academic-years/new">Add year</Link>
    </Button>
  );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <PageHeader title="Academic Years" description="The school years your workspace operates in." action={addButton} />
      {isPending ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={errorMessage(error)} />
      ) : data.length === 0 ? (
        <EmptyState title="No academic years yet" description="Create your first academic year to get started." action={addButton} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Starts</th>
                <th className="px-4 py-2 font-semibold">Ends</th>
                <th className="px-4 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((y) => (
                <tr key={y.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-2 font-medium text-foreground">
                    {y.name}
                    {y.isCurrent && (
                      <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                        current
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{y.startsOn}</td>
                  <td className="px-4 py-2 text-muted-foreground">{y.endsOn}</td>
                  <td className="px-4 py-2 text-muted-foreground capitalize">{y.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
