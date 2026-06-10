import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@repo/ui/button";
import { PageHeader } from "../../../../components/page-header";
import { EmptyState, ErrorState, Spinner, errorMessage } from "../../../../components/states";
import { useClassSections } from "../../../../features/class-sections/api";
import { useGradeLevels } from "../../../../features/grade-levels/api";
import { useStreams } from "../../../../features/streams/api";
import { useAcademicYearStore } from "../../../../store/academic-year";

export const Route = createFileRoute("/_authenticated/academics/sections/")({
  component: SectionsPage,
});

function SectionsPage() {
  const selectedYearId = useAcademicYearStore((s) => s.selectedYearId);
  const sections = useClassSections();
  const grades = useGradeLevels();
  const streams = useStreams();

  const addButton = (
    <Button asChild>
      <Link to="/academics/sections/new">Add section</Link>
    </Button>
  );

  const isPending = sections.isPending || grades.isPending || streams.isPending;
  const error = sections.error ?? grades.error ?? streams.error;
  const rows = (sections.data ?? []).filter((s) => !selectedYearId || s.academicYearId === selectedYearId);

  const gradeName = (id: string) => grades.data?.find((g) => g.id === id)?.name ?? "—";
  const streamName = (id: string | null) => (id ? (streams.data?.find((s) => s.id === id)?.name ?? null) : null);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <PageHeader
        title="Sections"
        description="Teaching groups for the academic year selected in the header."
        action={addButton}
      />
      {isPending ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={errorMessage(error)} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No sections for this year"
          description="Add a section, or pick another year in the header."
          action={addButton}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-semibold">Class</th>
                <th className="px-4 py-2 font-semibold">Stream</th>
                <th className="px-4 py-2 font-semibold">Section</th>
                <th className="px-4 py-2 font-semibold">Capacity</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-2 font-medium text-foreground">{gradeName(s.gradeLevelId)}</td>
                  <td className="px-4 py-2 text-muted-foreground">{streamName(s.streamId) ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{s.sectionName}</td>
                  <td className="px-4 py-2 text-muted-foreground">{s.capacity ?? "—"}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to="/academics/sections/$sectionId"
                      params={{ sectionId: s.id }}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Roster
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
