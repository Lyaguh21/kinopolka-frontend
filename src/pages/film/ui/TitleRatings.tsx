import {
  Box,
  Button,
  Group,
  Paper,
  Progress,
  Rating,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import type { FilmTitle } from "../../../entities/title";
import type { EpisodeDetails } from "../model/titleDetails";
import { EpisodeRatings } from "./EpisodeRatings";
import { TitleReviews } from "./TitleReviews";
import classes from "./FilmPage.module.css";

const distribution = [32, 29, 20, 10, 4, 2, 1, 1, 0.5, 0.5];

export function TitleRatings({
  title,
  episode,
  account,
  rating,
  onRate,
}: {
  title: FilmTitle;
  episode?: EpisodeDetails;
  account?: string;
  rating?: number;
  onRate: (rating: number) => void;
}) {
  const isFilm = title.kind === "Фильм";
  const isSeverance = title.id === "severance";
  const viewerDistribution = isFilm
    ? title.ratingDistribution
    : isSeverance
      ? distribution
      : undefined;
  const ratingPanel = (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Stack gap={5}>
          <Title order={3}>Моя оценка</Title>
          <Text c="dimmed" fz={13}>
            Выберите оценку от 1 до 10
          </Text>
        </Stack>
        <Group>
          <Rating
            size={26}
            className={classes.stars}
            emptySymbol={<IconStar size={26} color="var(--kino-muted)" />}
            fullSymbol={<IconStarFilled size={26} color="var(--kino-accent)" />}
            count={10}
            value={rating ?? 0}
            color="coral"
            onChange={(rating) => onRate(rating)}
            getSymbolLabel={(number) => `Оценка ${number} из 10`}
          />
          {episode ? (
            <Text
              aria-live="polite"
              c={rating ? "var(--kino-accent)" : "dimmed"}
              fw={600}
              fz={20}
              miw={40}
              ta="center"
            >
              {rating ? `${rating}/10` : "—"}
            </Text>
          ) : (
            <Button
              variant="light"
              disabled={!rating}
              onClick={() => onRate(0)}
              aria-label="Удалить оценку"
            >
              −
            </Button>
          )}
        </Group>
      </Group>
      {(isFilm || isSeverance) && (
        <Box
          className={classes.distribution}
          data-series={isSeverance && !episode}
          data-film={isFilm}
        >
          {isSeverance && !episode && <EpisodeRatings account={account} />}
          <Stack
            gap="lg"
            className={isFilm ? classes.filmViewerScores : classes.viewerScores}
          >
            <Stack gap="xs">
              <Title order={3} fz={22}>
                Оценки зрителей
              </Title>
              <Group align="baseline" gap="xs">
                <Text fz={64} fw={700} lh={1}>
                  {episode?.score ?? title.rating}
                </Text>
                <Text c="dimmed" fz={16}>
                  из 10
                </Text>
              </Group>
              <Text c="dimmed" fz={15}>
                Рейтинг Кинополки
              </Text>
              {isFilm && title.sourceRatings && (
                <Group gap="lg" mt="xs">
                  {[
                    ["IMDb", title.sourceRatings.imdb],
                    ["Кинопоиск", title.sourceRatings.kinopoisk],
                  ].map(([name, score]) => (
                    <Stack key={name} gap={2}>
                      <Text fz={24} fw={600} lh={1.2}>
                        {score}
                      </Text>
                      <Text fz={13} c="dimmed">
                        {name}
                      </Text>
                    </Stack>
                  ))}
                </Group>
              )}
            </Stack>
            {viewerDistribution && (
              <Stack gap={isFilm ? 2 : "sm"}>
                {viewerDistribution.map((fraction, index) => (
                  <Group key={index} gap="md" wrap="nowrap">
                    <Text w={20} ta="right" c="dimmed" fz={13}>
                      {10 - index}
                    </Text>
                    <Progress
                      className={classes.ratingTrack}
                      flex={1}
                      value={fraction}
                      color="coral"
                      size={6}
                      aria-label={`${10 - index}: ${fraction}%`}
                    />
                    <Text w={42} c="dimmed" fz={13}>
                      {String(fraction).replace(".", ",")} %
                    </Text>
                  </Group>
                ))}
              </Stack>
            )}
          </Stack>
        </Box>
      )}
    </Stack>
  );
  return (
    <Stack component="section" id="ratings">
      {!episode && <Title order={2}>Оценки и рецензии</Title>}
      {episode ? (
        <Paper className={classes.panel} p="lg">
          {ratingPanel}
        </Paper>
      ) : (
        <TitleReviews
          id={title.id}
          account={account}
          rating={rating}
          ratingPanel={ratingPanel}
        />
      )}
    </Stack>
  );
}
