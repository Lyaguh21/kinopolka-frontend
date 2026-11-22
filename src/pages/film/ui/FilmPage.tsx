import {
  Anchor,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { useSession } from "../../../entities/session";
import {
  episodeHref,
  nextEpisode,
  recentTitleViewer,
  severanceScores,
  TitleCard,
  titlesQuery,
  useRecentTitle,
  useShelf,
  type ShelfEntry,
} from "../../../entities/title";
import { WatchSourcesModal } from "../../../features/watch-sources";
import { ActionButton, NotFoundView, PageBody } from "../../../shared/ui";
import { getEpisode } from "../model/titleDetails";
import { TitleHero } from "./TitleHero";
import { TitleMedia } from "./TitleMedia";
import { TitleRatings } from "./TitleRatings";

const relatedSeriesIds = [
  "dune",
  "inception",
  "arrival",
  "blade-runner",
  "spirited-away",
];

export function FilmPage() {
  const { id, episode: episodeParam } = useParams();
  const { hash } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const titles = useQuery(titlesQuery);
  const account = useSession((state) => state.account);
  const viewer = recentTitleViewer(account);
  const episodeNumber = Number(episodeParam);
  const season = params.get("season") === "2" ? 2 : 1;
  const episode = getEpisode(id, season, episodeNumber);
  const entryId = episode ? [id, season, episodeNumber].join(":") : id;
  const entry = useShelf((state) =>
    account && entryId ? state.shelves[account]?.[entryId] : undefined,
  );
  const update = useShelf((state) => state.update);
  const rememberTitle = useRecentTitle((state) => state.remember);
  const rememberEpisode = useRecentTitle((state) => state.rememberEpisode);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const title = titles.data?.find((item) => item.id === id);

  useEffect(() => {
    if (title && !episodeParam) rememberTitle(viewer, title.id);
  }, [episodeParam, rememberTitle, title, viewer]);

  useEffect(() => {
    if (title && hash === "#ratings")
      document.getElementById("ratings")?.scrollIntoView();
  }, [title, hash]);

  if (titles.isPending)
    return (
      <PageBody>
        <Skeleton height={480} />
      </PageBody>
    );
  if (titles.isError && !title)
    return (
      <PageBody>
        <Title order={1}>Не удалось загрузить фильм</Title>
        <Anchor component={Link} to="/catalog">
          К каталогу
        </Anchor>
      </PageBody>
    );
  if (!title || (episodeParam && !episode)) return <NotFoundView />;

  const isSeverance = title.id === "severance";
  const next = nextEpisode(episode?.location);
  const previousHref =
    episodeNumber > 1
      ? episodeHref(season, episodeNumber - 1)
      : season > 1
        ? episodeHref(season - 1, severanceScores[season - 2].length)
        : undefined;

  function updateEntry(change: Partial<ShelfEntry>) {
    if (account && entryId) update(account, entryId, change);
    else if (id)
      navigate(
        "/login-required?title=" +
          id +
          (change.favorite ? "&action=favorite" : ""),
      );
  }

  return (
    <PageBody>
      <TitleHero
        title={title}
        episode={episode}
        entry={entry}
        updateEntry={updateEntry}
        onWatch={() => {
          if (episode) rememberEpisode(viewer, episode.location);
          setSourcesOpen(true);
        }}
      />
      {!episode && <TitleMedia title={title} />}
      <TitleRatings
        title={title}
        episode={episode}
        account={account}
        rating={entry?.rating}
        onRate={(rating) => updateEntry({ rating })}
      />
      {episode ? (
        <Group justify="center">
          <ActionButton
            appearance="secondary"
            disabled={!previousHref}
            onClick={() => previousHref && navigate(previousHref)}
          >
            ← Предыдущая серия
          </ActionButton>
          <ActionButton
            disabled={!next}
            onClick={() =>
              next && navigate(episodeHref(next.season, next.episode))
            }
          >
            Следующая серия →
          </ActionButton>
        </Group>
      ) : (
        <Stack component="section" gap="lg">
          <Group justify="space-between">
            <Title order={2}>
              {isSeverance
                ? "Если понравился этот сериал"
                : "Если понравился этот фильм"}
            </Title>
            <Anchor component={Link} to="/catalog" fz={14}>
              В каталог →
            </Anchor>
          </Group>
          <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="lg">
            {titles.data
              ?.filter((item) =>
                isSeverance
                  ? relatedSeriesIds.includes(item.id)
                  : item.id !== title.id,
              )
              .sort((a, b) =>
                isSeverance
                  ? relatedSeriesIds.indexOf(a.id) -
                    relatedSeriesIds.indexOf(b.id)
                  : 0,
              )
              .slice(0, 5)
              .map((item) => (
                <TitleCard
                  key={item.id}
                  title={item}
                  to={`/title/${item.id}`}
                />
              ))}
          </SimpleGrid>
        </Stack>
      )}
      <WatchSourcesModal
        title={title}
        episode={episode?.location}
        opened={sourcesOpen}
        onClose={() => setSourcesOpen(false)}
      />
    </PageBody>
  );
}
