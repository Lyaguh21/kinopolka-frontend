import {
  Box,
  Group,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router";
import type { Detail } from "../../../entities/title/api/catalog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "../../../shared/api/http";
import { requestError } from "../../../entities/session/model/session";
import classes from "./EpisodeRatings.module.css";

const holdDelay = 400;
const holdStyle = { "--hold-duration": `${holdDelay}ms` } as CSSProperties;

interface EpisodeScore {
  season: number;
  episode: number;
  average: number | null;
  mine: number | null;
  watched: boolean;
}
export function EpisodeRatings({
  account,
  id,
  seasons,
}: {
  account?: string;
  id: string;
  seasons: Detail["seasons"];
}) {
  const [mode, setMode] = useState("all");
  const [pressing, setPressing] = useState<string>();
  const ordered = [...seasons].sort(
    (a, b) => (a.seasonNumber || Infinity) - (b.seasonNumber || Infinity),
  );
  const client = useQueryClient();
  const queryKey = ["episode-scores", id, account ?? null];
  const scores = useQuery({
    queryKey,
    queryFn: async ({ signal }) =>
      (
        await http.get<EpisodeScore[]>(
          "api/titles/" + id + "/episodes/scores",
          { signal },
        )
      ).data,
  });
  const byEpisode = new Map(
    scores.data?.map((s) => [s.season + ":" + s.episode, s]),
  );
  const averages = new Map<number, { sum: number; count: number }>();
  for (const score of scores.data ?? []) {
    if (score.average === null) continue;
    const group = averages.get(score.season) ?? { sum: 0, count: 0 };
    group.sum += score.average;
    group.count++;
    averages.set(score.season, group);
  }
  const mark = useMutation({
    mutationFn: ({
      season,
      episode,
      watched,
    }: {
      season: number;
      episode: number;
      watched: boolean;
    }) =>
      http.patch(
        `api/titles/${id}/seasons/${season}/episodes/${episode}/watched`,
        { watched },
        { headers: { "X-Filmets-Account": account } },
      ),
    onSuccess: () => client.invalidateQueries({ queryKey }),
  });
  const navigate = useNavigate();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const held = useRef<string | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function cancelHold() {
    clearTimeout(timer.current);
    setPressing(undefined);
  }

  function toggle(season: number, episode: number, watched: boolean) {
    if (!account) {
      navigate("/login-required?title=" + id);
      return;
    }
    if (!mark.isPending) mark.mutate({ season, episode, watched: !watched });
  }

  return (
    <Stack gap="sm" miw={0}>
      <Title order={3} fz={22}>
        Оценки по сериям
      </Title>
      <SegmentedControl
        classNames={{ root: classes.switcher }}
        color="coral"
        value={mode}
        onChange={setMode}
        data={[
          { label: "Все", value: "all" },
          { label: "Я", value: "mine" },
        ]}
      />
      {(scores.isError || mark.isError) && (
        <Text role="alert">{requestError(scores.error ?? mark.error)}</Text>
      )}
      <Box style={{ overflow: "auto", maxHeight: "38rem" }}>
        <Table
          miw={72 + ordered.length * 96}
          className={classes.table}
          style={holdStyle}
          withRowBorders={false}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Серия</Table.Th>
              {ordered.map((s) => (
                <Table.Th key={s.seasonNumber} title={s.name}>
                  {s.seasonNumber ? "Сезон " + s.seasonNumber : "Спец."}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Array.from(
              { length: Math.max(0, ...ordered.map((s) => s.episodeCount)) },
              (_, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{String(index + 1).padStart(2, "0")}</Table.Td>
                  {ordered.map(({ seasonNumber: season, episodeCount }) => {
                    const key = season + ":" + (index + 1);
                    const entry = byEpisode.get(key);
                    const shown =
                      mode === "mine" ? entry?.mine : entry?.average;
                    const watched = !!entry?.watched;
                    return (
                      <Table.Td key={season}>
                        {index < episodeCount && (
                          <UnstyledButton
                            component={Link}
                            to={`/title/${id}/episodes/${index + 1}?season=${season}`}
                            className={classes.cell}
                            data-band={
                              shown == null || shown === 0
                                ? "unrated"
                                : shown >= 9.5
                                  ? "top"
                                  : shown >= 9
                                    ? "high"
                                    : "mid"
                            }
                            data-holding={pressing === key}
                            aria-label={`Сезон ${season}, серия ${index + 1}${watched ? ", просмотрена" : ""}`}
                            onPointerDown={(event) => {
                              if (event.button !== 0 || !event.isPrimary)
                                return;
                              held.current = undefined;
                              clearTimeout(timer.current);
                              setPressing(key);
                              timer.current = setTimeout(() => {
                                held.current = key;
                                setPressing(undefined);
                                toggle(season, index + 1, watched);
                              }, holdDelay);
                            }}
                            onPointerUp={cancelHold}
                            onPointerLeave={cancelHold}
                            onPointerCancel={cancelHold}
                            onContextMenu={(event) => event.preventDefault()}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && event.shiftKey) {
                                event.preventDefault();
                                toggle(season, index + 1, watched);
                              }
                            }}
                            onClick={(event) => {
                              if (event.detail !== 0 && held.current === key) {
                                event.preventDefault();
                                held.current = undefined;
                              }
                            }}
                          >
                            {watched && <IconEye size={19} aria-hidden />}
                            <Box component="span" className={classes.score}>
                              {shown
                                ? shown.toFixed(mode === "mine" ? 0 : 1)
                                : "—"}
                            </Box>
                          </UnstyledButton>
                        )}
                      </Table.Td>
                    );
                  })}
                </Table.Tr>
              ),
            )}
            {mode === "all" && (
              <Table.Tr>
                <Table.Td>AVG.</Table.Td>
                {ordered.map((s) => {
                  const avg = averages.get(s.seasonNumber);
                  return (
                    <Table.Td key={s.seasonNumber}>
                      <Box
                        className={classes.average}
                        data-season={s.seasonNumber}
                      >
                        {avg ? (avg.sum / avg.count).toFixed(1) : "—"}
                      </Box>
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Box>
      <Group gap="xl" fz={13} c="dimmed">
        <Group gap="xs">
          <Box className={classes.legend} />
          Не просмотрена
        </Group>
        <Group gap="xs">
          <Box className={classes.legend}>
            <IconEye size={17} />
          </Box>
          Просмотрена
        </Group>
      </Group>
      <Text fz={13} c="dimmed">
        Нажмите на серию, чтобы открыть её. Удерживайте или нажмите Shift +
        Enter, чтобы изменить статус просмотра.
      </Text>
    </Stack>
  );
}
