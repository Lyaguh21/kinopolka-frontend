import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShelfStatus } from "./title";

export interface ShelfEntry {
  status?: ShelfStatus;
  favorite?: boolean;
  rating?: number;
}

interface ShelfState {
  shelves: Record<string, Record<string, ShelfEntry>>;
  update: (account: string, id: string, entry: Partial<ShelfEntry>) => void;
}

export const emptyShelf: Record<string, ShelfEntry> = {};

export const useShelf = create<ShelfState>()(
  persist(
    (set) => ({
      shelves: {},
      update: (account, id, entry) =>
        set(({ shelves }) => {
          const accountShelf = shelves[account] ?? emptyShelf;
          return {
            shelves: {
              ...shelves,
              [account]: {
                ...accountShelf,
                [id]: { ...accountShelf[id], ...entry },
              },
            },
          };
        }),
    }),
    { name: "kinopolka-shelves" },
  ),
);
