import {
  Anchor,
  Button,
  Group,
  Image,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams, useSearchParams } from "react-router";
import { isAxiosError } from "axios";
import { useSession } from "../../../entities/session";
import { http } from "../../../shared/api/http";
import { PageBody, NotFoundView } from "../../../shared/ui";
import {
  detailQuery,
  shelfCardsQuery,
} from "../../../entities/title/api/catalog";
import classes from "./FilmPage.module.css";
import { TitleRatings, type ViewerScore } from "./TitleRatings";
import { CatalogFilm } from "./CatalogFilm";
function Episode({
  id,
  episode,
  season,
}: {
  id: string;
  episode: string;
  season: string;
}) {
  const account = useSession((s) => s.account),
    client = useQueryClient(),
    detail = useQuery(detailQuery(id));
  const url =
    "api/titles/" +
    id +
    "/seasons/" +
    season +
    "/episodes/" +
    episode +
    "/rating";
  const key = ["episode-rating", url, account ?? null];
  const score = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) =>
      (
        await http.get<
          ViewerScore & {
            votes: number;
            average: number | null;
            mine: number | null;
          }
        >(url, { signal })
      ).data,
    retry: false,
  });
  const update = useMutation({
    mutationFn: (rating: number | null) =>
      http.patch(
        url,
        { rating },
        { headers: { "X-Filmets-Account": account } },
      ),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ["episode-rating", url] }),
        client.invalidateQueries({ queryKey: ["episode-scores", id] }),
      ]),
  });
  if (score.isError || detail.isError) {
    const err = score.error ?? detail.error;
    return isAxiosError(err) &&
      [400, 404].includes(err.response?.status ?? 0) ? (
      <NotFoundView />
    ) : (
      <PageBody>
        <Button
          onClick={() => {
            score.refetch();
            detail.refetch();
          }}
        >
          Повторить загрузку серии
        </Button>
      </PageBody>
    );
  }
  if (!score.data || !detail.data)
    return (
      <PageBody>
        <Skeleton h={240} />
      </PageBody>
    );
  const seasonInfo = detail.data.seasons.find(
    (s) => s.seasonNumber === Number(season),
  );
  return (
    <PageBody>
      <Anchor component={Link} to={"/title/" + id}>
        {detail.data.title}
      </Anchor>
      <Group align="flex-start" className={classes.heroDetails}>
        {(seasonInfo?.posterUrl || detail.data.posterUrl) && (
          <Image
            className={classes.poster}
            src={seasonInfo?.posterUrl ?? detail.data.posterUrl}
            alt={"Постер · " + detail.data.title}
          />
        )}
        <Stack>
          <Text c="dimmed">
            {detail.data.title} · {seasonInfo?.name}
          </Text>
          <Title>Серия {episode}</Title>
        </Stack>
      </Group>
      <TitleRatings
        score={score.data}
        rating={score.data.mine}
        pending={update.isPending}
        onRate={account ? (v) => update.mutate(v) : undefined}
      />
      {!account && (
        <Anchor
          component={Link}
          to="/login"
          state={{
            returnTo:
              "/title/" + id + "/episodes/" + episode + "?season=" + season,
          }}
        >
          Войти, чтобы оценить серию
        </Anchor>
      )}
      {update.isError && <Text c="red">Не удалось сохранить оценку.</Text>}
      <Group justify="center">
        {[Number(episode) - 1, Number(episode) + 1]
          .filter((n) => n > 0 && n <= (seasonInfo?.episodeCount ?? 0))
          .map((n) => (
            <Button
              variant={n > Number(episode) ? "filled" : "default"}
              key={n}
              component={Link}
              to={"/title/" + id + "/episodes/" + n + "?season=" + season}
            >
              {n > Number(episode) ? "Следующая серия →" : "← Предыдущая серия"}
            </Button>
          ))}
      </Group>
    </PageBody>
  );
}
export function FilmPage() {
  const { id, episode } = useParams(),
    [params] = useSearchParams();
  if (id && /^\d+$/.test(id))
    return episode ? (
      <Episode id={id} episode={episode} season={params.get("season") ?? "1"} />
    ) : (
      <CatalogFilm id={id} />
    );
  return <LegacyTitle id={id ?? ""} />;
}
function LegacyTitle({ id }: { id: string }) {
  const query = useQuery({ ...shelfCardsQuery([id]), retry: false });
  if (query.isPending)
    return (
      <PageBody>
        <Skeleton h={320} />
      </PageBody>
    );
  if (!query.data?.length) return <NotFoundView />;
  return <Navigate replace to={"/title/" + query.data[0].id} />;
}
