import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@repo/ui/button";
import { PageHeader } from "../../../../components/page-header";
import { EmptyState, ErrorState, Spinner, errorMessage } from "../../../../components/states";
import { useStudents } from "../../../../features/students/api";

export const Route = createFileRoute("/_authenticated/people/students/")({
  component: StudentsPage,
});

function StudentsPage() {
  const { data, isPending, error } = useStudents();

  const addButton = (
    <Button asChild>
      <Link to="/people/students/new">Add student</Link>
    </Button>
  );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <PageHeader title="Students" description="Everyone studying at your school." action={addButton} />
      {isPending ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={errorMessage(error)} />
      ) : data.length === 0 ? (
        <EmptyState title="No students yet" description="Add your first student to get started." action={addButton} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-semibold">Admission #</th>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Date of birth</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-2 text-muted-foreground">{s.admissionNumber ?? "—"}</td>
                  <td className="px-4 py-2 font-medium text-foreground">
                    {[s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ")}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{s.dateOfBirth}</td>
                  <td className="px-4 py-2 text-muted-foreground capitalize">{s.status}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to="/people/students/$studentId"
                      params={{ studentId: s.id }}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
