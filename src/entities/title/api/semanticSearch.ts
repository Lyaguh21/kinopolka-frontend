import { http } from "../../../shared/api/http";

export type GuideScope = "all" | "movie" | "series";

export interface SemanticTitle {
  id: number;
  title: string;
  type: "movie" | "series";
  overview: string | null;
  posterUrl: string | null;
  releaseDate: string | null;
  reason?: string;
}

export async function semanticSearch(
  q: string,
  scope: GuideScope,
  signal: AbortSignal,
  exclude: string[],
  previous?: string,
) {
  const { data } = await http.post<{
    items: SemanticTitle[];
    message?: string;
  }>(
    "api/search/guide",
    {
      q,
      type: scope === "all" ? undefined : scope,
      limit: "3",
      exclude,
      previous,
    },
    { signal },
  );
  return data;
}
