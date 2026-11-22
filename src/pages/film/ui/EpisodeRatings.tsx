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
import {
  emptyShelf,
  episodeHref,
  severanceScores,
  useShelf,
} from "../../../entities/title";
import classes from "./EpisodeRatings.module.css";

const holdDelay = 400;
const holdStyle = { "--hold-duration": `${holdDelay}ms` } as CSSProperties;

export function EpisodeRatings({ account }: { account?: string }) {
  const [mode, setMode] = useState("all");
  const [pressing, setPressing] = useState<string>();
  const shelf = useShelf((state) => state.shelves[account ?? ""] ?? emptyShelf);
  const update = useShelf((state) => state.update);
  const navigate = useNavigate();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const held = useRef<string | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function cancelHold() {
    clearTimeout(timer.current);
    setPressing(undefined);
  }

  function toggle(key: string) {
    if (!account) {
      navigate("/login-required?title=severance");
      return;
    }
    update(account, key, {
      status: shelf[key]?.status === "watched" ? undefined : "watched",
    });
  }

  return (
    <Stack gap="sm">
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
      <Table className={classes.table} style={holdStyle} withRowBorders={false}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Серия</Table.Th>
            <Table.Th>Сезон 1</Table.Th>
            <Table.Th>Сезон 2</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {Array.from({ length: 10 }, (_, index) => (
            <Table.Tr key={index}>
              <Table.Td>{String(index + 1).padStart(2, "0")}</Table.Td>
              {severanceScores.map((scores, season) => {
                const score = scores[index];
                const key = `severance:${season + 1}:${index + 1}`;
                const entry = shelf[key];
                const shown = mode === "mine" ? entry?.rating : score;
                const watched = entry?.status === "watched";
                return (
                  <Table.Td key={season}>
                    {score !== undefined && (
                      <UnstyledButton
                        component={Link}
                        to={episodeHref(season + 1, index + 1)}
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
                        aria-label={`Сезон ${season + 1}, серия ${index + 1}${watched ? ", просмотрена" : ""}`}
                        onPointerDown={(event) => {
                          if (event.button !== 0 || !event.isPrimary) return;
                          held.current = undefined;
                          clearTimeout(timer.current);
                          setPressing(key);
                          timer.current = setTimeout(() => {
                            held.current = key;
                            setPressing(undefined);
                            toggle(key);
                          }, holdDelay);
                        }}
                        onPointerUp={cancelHold}
                        onPointerLeave={cancelHold}
                        onPointerCancel={cancelHold}
                        onContextMenu={(event) => event.preventDefault()}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && event.shiftKey) {
                            event.preventDefault();
                            toggle(key);
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
                          {shown ? shown.toFixed(mode === "mine" ? 0 : 1) : "—"}
                        </Box>
                      </UnstyledButton>
                    )}
                  </Table.Td>
                );
              })}
            </Table.Tr>
          ))}
          {mode === "all" && (
            <Table.Tr>
              <Table.Td>AVG.</Table.Td>
              <Table.Td>
                <Box className={classes.average}>8.8</Box>
              </Table.Td>
              <Table.Td>
                <Box className={classes.average} data-season="2">
                  8.7
                </Box>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
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
