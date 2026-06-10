import { create } from "zustand";

type AcademicYearState = {
  /** The active academic year id, or null until initialized from the workspace's current year. */
  selectedYearId: string | null;
  setSelectedYear: (id: string | null) => void;
};

export const useAcademicYearStore = create<AcademicYearState>((set) => ({
  selectedYearId: null,
  setSelectedYear: (id) => {
    set({ selectedYearId: id });
  },
}));
