import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { useAcademicYears } from "../features/academic-years/api";
import { useAcademicYearStore } from "../store/academic-year";

/** Global academic-year selector. Defaults to the workspace's current year. */
export function YearSwitcher() {
  const { data: years } = useAcademicYears();
  const selectedYearId = useAcademicYearStore((s) => s.selectedYearId);
  const setSelectedYear = useAcademicYearStore((s) => s.setSelectedYear);

  useEffect(() => {
    if (!years || years.length === 0) return;
    if (selectedYearId && years.some((y) => y.id === selectedYearId)) return;
    const fallback = years.find((y) => y.isCurrent) ?? years[0];
    setSelectedYear(fallback ? fallback.id : null);
  }, [years, selectedYearId, setSelectedYear]);

  if (!years || years.length === 0) return null;

  return (
    <Select value={selectedYearId ?? undefined} onValueChange={setSelectedYear}>
      <SelectTrigger className="h-9 w-44">
        <SelectValue placeholder="Academic year" />
      </SelectTrigger>
      <SelectContent>
        {years.map((y) => (
          <SelectItem key={y.id} value={y.id}>
            {y.name}
            {y.isCurrent ? " (current)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
