import type { FilmTitle } from "../model/title";

export function titleSearchText({
  name,
  year,
}: Pick<FilmTitle, "name" | "year">) {
  return `${name} ${year.match(/^\d{4}/)?.[0] ?? year}`.trim();
}

export function trailerSearchUrl(title: Pick<FilmTitle, "name" | "year">) {
  const params = new URLSearchParams({
    search_query: `${titleSearchText(title)} официальный трейлер`,
  });
  return `https://www.youtube.com/results?${params}`;
}
