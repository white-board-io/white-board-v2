import { create } from "zustand";
import { devtools } from "zustand/middleware";

type AppState = {
  count: number;
  increment: () => void;
};

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => {
        set((state) => ({ count: state.count + 1 }));
      },
    }),
    { name: "AppStore" },
  ),
);
