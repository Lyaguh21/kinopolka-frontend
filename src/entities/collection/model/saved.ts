import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SavedState {
  byAccount: Record<string, string[]>;
  toggle: (account: string, id: string) => void;
}

export const emptySaved: string[] = [];

export function countLocalSaves(byAccount: Record<string, string[]>) {
  const counts = new Map<string, number>();
  for (const saved of Object.values(byAccount)) {
    for (const id of new Set(saved)) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

export const useSavedCollections = create<SavedState>()(
  persist(
    (set) => ({
      byAccount: {},
      toggle: (account, id) =>
        set(({ byAccount }) => {
          const saved = byAccount[account] ?? emptySaved;
          return {
            byAccount: {
              ...byAccount,
              [account]: saved.includes(id)
                ? saved.filter((item) => item !== id)
                : [...saved, id],
            },
          };
        }),
    }),
    { name: "kinopolka-collections" },
  ),
);
