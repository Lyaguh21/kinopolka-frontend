import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Review } from "../../../entities/review";

export const emptyReviews: Review[] = [];

interface ReviewsState {
  byTitle: Record<string, Review[]>;
  publish: (titleId: string, review: Review) => void;
}

export const useReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      byTitle: {},
      publish: (titleId, review) =>
        set(({ byTitle }) => ({
          byTitle: {
            ...byTitle,
            [titleId]: [review, ...(byTitle[titleId] ?? emptyReviews)],
          },
        })),
    }),
    { name: "kinopolka-reviews" },
  ),
);
