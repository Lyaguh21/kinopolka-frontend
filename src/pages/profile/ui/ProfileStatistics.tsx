import { DonutChart } from "@mantine/charts";
import {
  Box,
  Button,
  Center,
  Group,
  Image,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconDeviceTv, IconMovie } from "@tabler/icons-react";
import { Link } from "react-router";
import {
  statusLabels,
  type FilmTitle,
  type ShelfStatus,
} from "../../../entities/title";
import classes from "./ProfileStatistics.module.css";

const statuses: ShelfStatus[] = [
  "watching",
  "planned",
  "watched",
  "paused",
  "dropped",
];
const watchedKinds = [
  {
    kind: "Фильм",
    label: "Фильмы",
    color: "var(--kino-profileMovies)",
    icon: <IconMovie size={22} aria-hidden />,
  },
  {
    kind: "Сериал",
    label: "Сериалы",
    color: "var(--kino-profileSeries)",
    icon: <IconDeviceTv size={22} aria-hidden />,
  },
  {
    kind: "Аниме",
    label: "Аниме",
    color: "var(--kino-profileAnime)",
    icon: <Image src="/figma/profile-anime.svg" alt="" w={24} h="auto" />,
  },
] as const;

export function ProfileStatistics({
  shelf,
  watched,
  shelfPath,
  title,
}: {
  shelf: Readonly<Record<string, { status?: ShelfStatus }>>;
  watched: FilmTitle[];
  shelfPath: string;
  title: string;
}) {
  const counts = new Map<ShelfStatus, number>();
  for (const [id, { status }] of Object.entries(shelf)) {
    if (status && !id.includes(":"))
      counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  const segments = statuses.map((status) => ({
    name: statusLabels[status],
    value: counts.get(status) ?? 0,
    color: `var(--kino-${status})`,
  }));
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const chartData = total
    ? segments.filter(({ value }) => value > 0)
    : [{ name: "Полка пуста", value: 1, color: "var(--kino-profileTrack)" }];

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <Paper component="section" className={classes.panel}>
        <Group justify="space-between" mb="md" gap="sm">
          <Title order={2} fz={22}>
            {title}
          </Title>
          <Button size="sm" variant="default" component={Link} to={shelfPath}>
            Показать все
          </Button>
        </Group>
        <Box className={classes.breakdown}>
          <Box className={classes.chart} aria-hidden="true">
            <DonutChart
              data={chartData}
              size={172}
              thickness={23}
              withTooltip={false}
              strokeWidth={0}
              startAngle={90}
              endAngle={-270}
            />
            <Center className={classes.chartLabel}>
              <Stack gap={2} align="center">
                <Text fz={34} fw={600} lh={1}>
                  {total}
                </Text>
                <Text fz={13} c="dimmed">
                  на полке
                </Text>
              </Stack>
            </Center>
          </Box>
          <Stack
            component="ul"
            gap="sm"
            className={classes.legend}
            aria-label="Статусы на полке"
          >
            {segments.map(({ name, value, color }) => (
              <Group
                component="li"
                key={name}
                justify="space-between"
                wrap="nowrap"
              >
                <Group gap="md" wrap="nowrap">
                  <Box component="span" className={classes.dot} bg={color} />
                  <Text fz={15} c="dimmed">
                    {name}
                  </Text>
                </Group>
                <Text fw={600}>{value}</Text>
              </Group>
            ))}
          </Stack>
        </Box>
      </Paper>
      <Paper component="section" className={classes.panel}>
        <Title order={2} fz={22} mb="lg">
          Просмотрено
        </Title>
        <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm">
          {watchedKinds.map(({ kind, label, color, icon }) => {
            const amount = watched.filter((item) => item.kind === kind).length;
            const share = watched.length ? (100 * amount) / watched.length : 0;

            return (
              <Stack key={kind} className={classes.watchedCard} gap={0}>
                <Center component="span" w={24} h={24} c={color}>
                  {icon}
                </Center>
                <Text fz={34} fw={600} lh={1.15} mt="md">
                  {amount}
                </Text>
                <Text c="dimmed" mt="xs">
                  {label}
                </Text>
                <Progress
                  className={classes.track}
                  color={color}
                  size={5}
                  radius={2}
                  value={share}
                  aria-label={`Доля просмотренного: ${label.toLocaleLowerCase("ru")}`}
                />
              </Stack>
            );
          })}
        </SimpleGrid>
      </Paper>
    </SimpleGrid>
  );
}
