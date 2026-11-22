export type TitleKind = "Фильм" | "Сериал" | "Аниме";
export type ShelfStatus =
  | "watching"
  | "planned"
  | "watched"
  | "paused"
  | "dropped";

export interface FilmTitle {
  id: string;
  name: string;
  year: string;
  genre: string;
  director?: string;
  kind: TitleKind;
  rating: string;
  sourceRatings?: { imdb: string; kinopoisk: string };
  ratingDistribution?: number[];
  poster: string;
  minutes?: number;
}
