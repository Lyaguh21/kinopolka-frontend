import { queryOptions } from "@tanstack/react-query";
import { http } from "../../../shared/api/http";
import type { FilmTitle } from "../model/title";

interface Card {
  id: number;
  title: string;
  type: "movie" | "series";
  releaseDate: string | null;
  posterUrl: string | null;
  tmdbRating: { value: number | null; votes: number | null };
  genres?: string[];
  minutes?: number | null;
}
interface Page<T> {
  total: number;
  totalPages: number;
  items: T[];
}
interface Credit {
  personId: number;
  name: string;
  profileUrl?: string | null;
  jobs: string[];
  characters: string[];
}
export interface Detail extends Omit<Card, "genres"> {
  externalRatings: {
    source: "kinopoisk" | "seriesgraph";
    score: number;
    url: string;
    updatedAt: string;
  }[];
  originalTitle: string | null;
  overview: string | null;
  backdropUrl: string | null;
  runtimeMinutes: number | null;
  genres: { name: string }[];
  countries: { name: string; iso_3166_1: string }[];
  companies: { name: string | null }[];
  keywords: { name: string }[];
  budget: number | null;
  revenue: number | null;
  tagline: string | null;
  cast: { items: Credit[] };
  creators: Credit[];
  seasons: {
    seasonNumber: number;
    name: string;
    episodeCount: number;
    posterUrl: string | null;
  }[];
  seriesCreators: { name: string }[];
  media: {
    trailer: {
      key: string;
      official: boolean;
      type: string;
      embedUrl: string;
      name: string;
      watchUrl: string;
    } | null;
    backdrops: { url: string; path: string }[];
  };
}
interface Person {
  name: string;
  profileUrl: string | null;
  biography: string | null;
  filmography: { total: number; items: Card[] };
}
export function filmCard(row: Card): FilmTitle {
  return {
    id: String(row.id),
    minutes: row.minutes ?? undefined,
    name: row.title,
    kind: row.type === "movie" ? "Фильм" : "Сериал",
    genre: row.genres?.join(", ") ?? "",
    year: row.releaseDate?.slice(0, 4) ?? "",
    poster: row.posterUrl ?? "",
    rating:
      row.tmdbRating.votes && row.tmdbRating.value != null
        ? row.tmdbRating.value.toFixed(1)
        : "—",
  };
}
function apiQuery<T>(path: string, params: Record<string, unknown> = {}) {
  return queryOptions({
    queryKey: ["filmets", path, params],
    queryFn: async ({ signal }) =>
      (await http.get<T>("api/" + path, { params, signal })).data,
    staleTime: 60_000,
  });
}
export const catalogQuery = (params: Record<string, unknown>) =>
  apiQuery<Page<Card>>("titles", params);
export const peopleSearchQuery = (q: string) =>
  apiQuery<{ id: number; name: string; avatar: string | null }[]>("people", {
    q,
  });
export const viewerRecommendations = (account: string, signal: string) => ({
  ...apiQuery<{ items: Card[] }>("titles/recommended"),
  queryKey: ["viewer-recommendations", account, signal],
  enabled: !!account,
});
export const genreQuery = apiQuery<{ name: string }[]>("genres");
export const detailQuery = (id: string) => apiQuery<Detail>("titles/" + id);
export const similarQuery = (id: string, exclude: string[]) =>
  queryOptions({
    queryKey: ["filmets", "similar", id, exclude],
    queryFn: async ({ signal }) =>
      (
        await http.post<{ items: Card[] }>(
          "api/titles/" + id + "/similar",
          { exclude },
          { signal },
        )
      ).data,
    staleTime: 60_000,
  });
export const personIdQuery = (tmdbId: number) =>
  apiQuery<{ id: number }>("people/tmdb/" + tmdbId);
export const personQuery = (id: string, page: number, sort = "newest") =>
  apiQuery<Person>("people/" + id, { page, limit: 20, sort });

export const shelfCardsQuery = (ids: string[]) =>
  queryOptions({
    queryKey: ["filmets", "shelf-cards", ids],
    queryFn: async ({ signal }) =>
      (
        await http.post<Card[]>("api/titles/cards", { ids }, { signal })
      ).data.map(filmCard),
    enabled: ids.length > 0,
    staleTime: 60_000,
  });
