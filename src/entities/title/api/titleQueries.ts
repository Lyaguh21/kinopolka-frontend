import { queryOptions } from "@tanstack/react-query";
import { http } from "../../../shared/api/http";
import type { FilmTitle } from "../model/title";

export const titlesQuery = queryOptions({
  queryKey: ["titles"],
  queryFn: async ({ signal }) =>
    (await http.get<FilmTitle[]>("mocks/titles.json", { signal })).data,
  staleTime: 60_000,
});
