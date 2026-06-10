import { Button } from "@repo/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "../../../../../components/page-header";
import { EmptyState, ErrorState, Spinner, errorMessage } from "../../../../../components/states";
import { useClassSections, useSectionRoster } from "../../../../../features/class-sections/api";
import { useGradeLevels } from "../../../../../features/grade-levels/api";
import { useStreams } from "../../../../../features/streams/api";

export const Route = createFileRoute("/_authenticated/academics/sections/$sectionId")({
  component: SectionRosterPage,
});

function fullName(p: { firstName: string; middleName: string | null; lastName: string | null }): string {
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");
}

function SectionRosterPage() {
  const { sectionId } = Route.useParams();
  const roster = useSectionRoster(sectionId);
  const sections = useClassSections();
  const grades = useGradeLevels();
  const streams = useStreams();

  const section = sections.data?.find((s) => s.id === sectionId);
  const gradeName = section ? (grades.data?.find((g) => g.id === section.gradeLevelId)?.name ?? "") : "";
  const streamName = section?.streamId ? (streams.data?.find((s) => s.id === section.streamId)?.name ?? null) : null;
  const label = section
    ? `${gradeName} - ${section.sectionName}${streamName ? ` (${streamName})` : ""}`
    : "Section roster";

  return (
    <div className="mx-auto max-w-5xl p-6">
      <PageHeader
        title={label}
        description="Students currently enrolled in this section."
        action={
          <Button variant="secondary" asChild>
            <Link to="/academics/sections">Back to sections</Link>
          </Button>
        }
      />
      {roster.isPending ? (
        <Spinner />
      ) : roster.error ? (
        <ErrorState message={errorMessage(roster.error)} />
      ) : roster.data.length === 0 ? (
        <EmptyState
          title="No students enrolled"
          description="Enrol students into this section from a student's page."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-semibold">Roll</th>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roster.data.map((r) => (
                <tr key={r.enrolmentId} className="hover:bg-secondary/30">
                  <td className="px-4 py-2 text-muted-foreground">{r.rollNumber ?? "—"}</td>
                  <td className="px-4 py-2 font-medium text-foreground">{fullName(r)}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to="/people/students/$studentId"
                      params={{ studentId: r.studentId }}
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
