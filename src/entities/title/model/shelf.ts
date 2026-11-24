import { create } from "zustand";
import { http } from "../../../shared/api/http";
import { persist } from "zustand/middleware";
import type { ShelfStatus } from "./title";

export interface ShelfEntry {
  status?: ShelfStatus;
  favorite?: boolean;
  rating?: number;
}

interface ShelfState {
  shelves: Record<string, Record<string, ShelfEntry>>;
  load: (account: string, entries: Record<string, ShelfEntry>) => void;
  error?: string;
  save: (
    account: string,
    id: string,
    change: Partial<ShelfEntry>,
  ) => Promise<void>;
  update: (account: string, id: string, entry: Partial<ShelfEntry>) => void;
}

export const emptyShelf: Record<string, ShelfEntry> = {};

export function excludedTitles(shelf: Record<string, ShelfEntry>): string[] {
  return Object.keys(shelf)
    .filter((id) => {
      const entry = shelf[id];
      return (
        !id.includes(":") &&
        Boolean(
          (entry.status && entry.status !== "planned") ||
            entry.favorite ||
            (entry.rating ?? 0) > 0,
        )
      );
    })
    .sort();
}

let shelfQueue = Promise.resolve();
export const useShelf = create<ShelfState>()(
  persist(
    (set, get) => ({
      shelves: {},
      load: (account, entries) =>
        set((state) => ({
          shelves: {
            ...state.shelves,
            [account]: {
              ...Object.fromEntries(
                Object.entries(state.shelves[account] ?? {}).filter(
                  ([key]) => !/^\d+$/.test(key),
                ),
              ),
              ...entries,
            },
          },
        })),
      update: (account, id, change) => {
        void get()
          .save(account, id, change)
          .catch(() =>
            set({
              error:
                "Не удалось сохранить отметку. Проверь вход в аккаунт и попробуй ещё раз.",
            }),
          );
      },
      save: async (account, id, change) => {
        const apply = (entry: ShelfEntry | null) =>
          set((state) => {
            const items = { ...state.shelves[account] };
            if (entry) items[id] = entry;
            else delete items[id];
            return {
              shelves: { ...state.shelves, [account]: items },
              error: undefined,
            };
          });
        if (!/^\d+$/.test(id)) {
          set((state) => ({
            shelves: {
              ...state.shelves,
              [account]: {
                ...state.shelves[account],
                [id]: { ...state.shelves[account]?.[id], ...change },
              },
            },
          }));
          return;
        }
        const operation = shelfQueue.then(async () => {
          const patch = Object.fromEntries(
            Object.entries(change).map(([key, v]) => [key, v ?? null]),
          );
          const { data } = await http.patch<{ entry: ShelfEntry | null }>(
            "api/me/shelf/" + id,
            patch,
            { headers: { "X-Filmets-Account": account } },
          );
          apply(data.entry);
        });
        shelfQueue = operation.catch(() => {});
        return operation;
      },
    }),
    {
      name: "filmets-shelves-cache",
      partialize: (state) => ({ shelves: state.shelves }),
    },
  ),
);
