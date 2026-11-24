import { Alert, Button, Stack, Title } from "@mantine/core";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { http } from "../../../shared/api/http";
import { requestError } from "../../../entities/session/model/session";
import { useShelf } from "../../../entities/title";
import type { Detail } from "../../../entities/title/api/catalog";
import { TitleRatings, type ViewerScore } from "./TitleRatings";
import { TitleReviews, type ReviewRow } from "./TitleReviews";

interface Community extends ViewerScore {
  total: number;
  comments: ReviewRow[];
  own: Pick<ReviewRow, "id" | "title" | "body" | "spoiler"> | null;
}
export function useFilmCommunity(id: string, account?: string) {
  const key = ["community", id, account ?? null];
  return useInfiniteQuery({
    queryKey: key,
    initialPageParam: 1,
    queryFn: async ({ signal, pageParam }) =>
      (
        await http.get<Community>("api/titles/" + id + "/community", {
          params: { page: pageParam },
          signal,
        })
      ).data,
    getNextPageParam: (last, pages) =>
      pages.length * 10 < last.total ? pages.length + 1 : undefined,
  });
}

export function FilmCommunity({
  id,
  account,
  seasons,
  query,
}: {
  id: string;
  account?: string;
  seasons?: Detail["seasons"];
  query: ReturnType<typeof useFilmCommunity>;
}) {
  const client = useQueryClient();
  const rating = useShelf((s) => s.shelves[account ?? ""]?.[id]?.rating);
  const refresh = () =>
    client.invalidateQueries({ queryKey: ["community", id] });
  const rate = useMutation({
    mutationFn: (value: number | null) =>
      useShelf.getState().save(account!, id, { rating: value ?? undefined }),
    onSuccess: refresh,
  });
  const data = query.data?.pages[0];
  return (
    <Stack component="section" id="ratings">
      <Title order={2}>Оценки и рецензии</Title>
      {(query.isError || rate.isError) && (
        <Alert color="red">
          {requestError(query.error ?? rate.error)}{" "}
          {query.isError && (
            <Button onClick={() => query.refetch()}>Повторить</Button>
          )}
        </Alert>
      )}
      <TitleReviews
        id={id}
        account={account}
        rating={rating}
        series={!!seasons}
        own={data?.own}
        reviews={query.data?.pages.flatMap((p) => p.comments) ?? []}
        total={data?.total ?? 0}
        loadMore={() => query.fetchNextPage()}
        loadingMore={query.isFetchingNextPage}
        refresh={refresh}
        ready={!!data && !rate.isPending}
        ratingPanel={
          <TitleRatings
            id={id}
            account={account}
            seasons={seasons}
            score={data}
            rating={rating}
            pending={rate.isPending}
            onRate={account ? (v) => rate.mutate(v) : undefined}
          />
        }
      />
    </Stack>
  );
}
