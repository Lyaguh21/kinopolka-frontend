import {
  ActionIcon,
  Anchor,
  Box,
  Breadcrumbs,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "react-router";
import {
  severanceDescription,
  type FilmTitle,
  type ShelfEntry,
} from "../../../entities/title";
import {
  interstellar,
  titleGallery,
  type EpisodeDetails,
} from "../model/titleDetails";
import { TitleActions } from "./TitleActions";
import classes from "./FilmPage.module.css";

export function TitleHero({
  title,
  live,
  episode,
  entry,
  updateEntry,
  onWatch,
}: {
  title: FilmTitle;
  live?: {
    platformAverage?: number | null;
    ratings: import("../../../entities/title/api/catalog").Detail["externalRatings"];
    backdrop: string | null;
    overview: string | null;
    metadata: string;
  };
  episode?: EpisodeDetails;
  entry?: ShelfEntry;
  updateEntry: (change: Partial<ShelfEntry>) => void;
  onWatch: () => void;
}) {
  const isInterstellar = title.id === "interstellar";
  const isSeverance = title.id === "severance";
  const season = episode?.location.season;
  const episodeNumber = episode?.location.episode;
  const preview = titleGallery(title.id)[0]?.file ?? title.poster;
  const displayTitle = episode
    ? { name: episode.name, rating: episode.score }
    : title;
  return (
    <Box
      component="section"
      className={classes.hero}
      data-series={isSeverance && !episode}
      data-episode={Boolean(episode)}
    >
      {!episode && (
        <Image
          src={
            live
              ? (live.backdrop ?? title.poster)
              : isSeverance
                ? "/figma/series-backdrop.png"
                : preview
          }
          alt=""
          className={classes.backdrop}
        />
      )}
      <Stack gap="xl">
        <Group>
          <ActionIcon
            component={Link}
            to="/catalog"
            variant="default"
            size={40}
            aria-label="К каталогу"
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Breadcrumbs className={classes.breadcrumbs}>
            <Anchor component={Link} to="/catalog" c="dimmed">
              Каталог
            </Anchor>
            <Text c="dimmed">
              {title.kind === "Сериал" ? "Сериалы" : "Фильмы"}
            </Text>
            {episode ? (
              <Anchor component={Link} to="/title/severance">
                {title.name}
              </Anchor>
            ) : (
              <Text>{title.name}</Text>
            )}
            {episode && (
              <Text>
                Сезон {season}, серия {episodeNumber}
              </Text>
            )}
          </Breadcrumbs>
        </Group>
        <Group className={classes.heroDetails} align="flex-start" wrap="nowrap">
          <Image
            src={title.poster}
            alt={`Постер: ${title.name}`}
            className={classes.poster}
          />
          <Stack gap="md" className={classes.heroCopy}>
            <Title order={1} fz="clamp(2rem, 4vw, 3.25rem)" fw={700}>
              {displayTitle.name}
            </Title>
            <Text c="dimmed">
              {episode
                ? season === 1 && episodeNumber === 1
                  ? "Good News About Hell · 57 мин · 18 февраля 2022"
                  : episode.minutes
                    ? `${episode.minutes} мин`
                    : `Сезон ${season}, серия ${episodeNumber}`
                : isInterstellar
                  ? "Interstellar · 2014 · США, Великобритания · 12+"
                  : isSeverance
                    ? "Severance · с 2022 · США · 18+"
                    : live?.metadata || title.year}
            </Text>
            {!episode && (
              <Text c="dimmed">
                {isInterstellar
                  ? "Фантастика, драма, приключения · 2 ч 49 мин"
                  : isSeverance
                    ? "Фантастика, триллер, драма · 2 сезона · 19 серий"
                    : `${title.genre} · ${title.kind}`}
              </Text>
            )}
            {live?.overview && <Text maw={920}>{live.overview}</Text>}
            {isInterstellar && <Text maw={920}>{interstellar.synopsis}</Text>}
            {isSeverance && !episode && (
              <Text maw={920}>{severanceDescription}</Text>
            )}
            {season === 1 && episodeNumber === 1 && (
              <Text maw={920}>
                Марк возглавляет отдел макроданных. Его первая задача — помочь
                новой сотруднице привыкнуть к правилам разделённого этажа.
              </Text>
            )}
            <Group gap={28}>
              {live && (
                <Stack gap={0} align="center">
                  <Text fz={32} fw={700} c="var(--kino-accent)">
                    {live.platformAverage?.toFixed(1) ?? "—"}
                  </Text>
                  <Text fz={13} c="dimmed">
                    Кинополка
                  </Text>
                </Stack>
              )}
              <Stack gap={0} align="center">
                <Text
                  fz={32}
                  fw={700}
                  c={live ? undefined : "var(--kino-accent)"}
                >
                  {displayTitle.rating}
                </Text>
                <Text fz={13} c="dimmed">
                  {live ? "TMDB" : "Кинополка"}
                </Text>
              </Stack>
              {live?.ratings?.map((r) => (
                <Stack key={r.source} gap={0} align="center">
                  <Anchor
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    c="inherit"
                    fz={32}
                    fw={700}
                    title={
                      "Источник · " +
                      new Date(r.updatedAt).toLocaleDateString("ru")
                    }
                  >
                    {r.score.toFixed(1)}
                  </Anchor>
                  <Text fz={13} c="dimmed">
                    {r.source === "kinopoisk" ? "Кинопоиск" : "SeriesGraph"}
                  </Text>
                </Stack>
              ))}
              {(live
                ? []
                : episode
                  ? [
                      [
                        season === 1 && episodeNumber === 1
                          ? "8.6"
                          : episode.score,
                        "Series Graph",
                      ],
                    ]
                  : [
                      [title.sourceRatings?.imdb ?? "—", "IMDb"],
                      [title.sourceRatings?.kinopoisk ?? "—", "Кинопоиск"],
                    ]
              ).map(([score, label]) => (
                <Stack key={label} gap={0} align="center">
                  <Text fz={32} fw={700}>
                    {score}
                  </Text>
                  <Text fz={13} c="dimmed">
                    {label}
                  </Text>
                </Stack>
              ))}
            </Group>
            <TitleActions
              entry={entry}
              isEpisode={Boolean(episode)}
              hidePlayIcon={isSeverance}
              onWatch={onWatch}
              updateEntry={updateEntry}
            />
          </Stack>
        </Group>
      </Stack>
    </Box>
  );
}
