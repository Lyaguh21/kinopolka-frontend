import type { ShelfStatus } from "../../../entities/title";

export const annaShelf: Record<
  string,
  { status: ShelfStatus; favorite?: boolean; rating?: number }
> = {
  dune: { status: "watching" },
  severance: { status: "watching", favorite: true },
  "spirited-away": { status: "planned" },
  "blade-runner": { status: "planned" },
  interstellar: { status: "watched", favorite: true, rating: 8 },
  inception: { status: "watched", favorite: true },
  "grand-budapest": { status: "paused" },
  arrival: { status: "dropped" },
};
