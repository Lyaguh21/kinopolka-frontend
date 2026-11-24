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
import type { Detail } from "../../../entities/title/api/catalog";
import { EpisodeRatings } from "./EpisodeRatings";
import classes from "./FilmPage.module.css";

export interface ViewerScore {
  votes: number;
  average: number | null;
  histogram: Record<string, number> | null;
}
export function TitleRatings({
  id,
  account,
  seasons,
  score,
  rating,
  pending,
  onRate,
}: {
  id?: string;
  account?: string;
  seasons?: Detail["seasons"];
  score?: ViewerScore;
  rating?: number | null;
  pending: boolean;
  onRate?: (rating: number | null) => void;
}) {
  const series = !!seasons?.length;
  const viewerDistribution = Array.from({ length: 10 }, (_, i) =>
    score?.votes
      ? Math.round((1000 * (score.histogram?.[10 - i] ?? 0)) / score.votes) / 10
      : 0,
  );
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
            readOnly={!onRate || pending}
            onChange={(rating) => onRate?.(rating || null)}
            getSymbolLabel={(number) => `Оценка ${number} из 10`}
          />
          {!id ? (
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
              disabled={!rating || pending || !onRate}
              onClick={() => onRate?.(null)}
              aria-label="Удалить оценку"
            >
              {rating ?? "—"}
            </Button>
          )}
        </Group>
      </Group>
      {
        <Box
          className={classes.distribution}
          data-series={series}
          data-film={!series}
        >
          {series && id && (
            <EpisodeRatings id={id} seasons={seasons!} account={account} />
          )}
          <Stack
            gap="lg"
            className={
              !series ? classes.filmViewerScores : classes.viewerScores
            }
          >
            <Stack gap="xs">
              <Title order={3} fz={22}>
                Оценки зрителей
              </Title>
              <Group align="baseline" gap="xs">
                <Text fz={64} fw={700} lh={1}>
                  {score?.average?.toFixed(1) ?? "—"}
                </Text>
                <Text c="dimmed" fz={16}>
                  из 10
                </Text>
              </Group>
              <Text c="dimmed" fz={15}>
                {score ? `Голосов: ${score.votes}` : "Загрузка оценок…"}
              </Text>
            </Stack>
            {viewerDistribution && (
              <Stack gap={!series ? 2 : "sm"}>
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
      }
    </Stack>
  );
  return id ? (
    ratingPanel
  ) : (
    <Paper className={classes.panel} p="lg">
      {ratingPanel}
    </Paper>
  );
}
