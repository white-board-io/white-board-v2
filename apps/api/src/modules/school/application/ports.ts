/** A minimal view of a Class Section, used by enrolment/promotion commands. */
export type ClassSectionRef = {
  id: string;
  academicYearId: string;
  status: "active" | "archived";
};

export type ClassSectionLookup = {
  findRef(workspaceId: string, classSectionId: string): Promise<ClassSectionRef | null>;
};
