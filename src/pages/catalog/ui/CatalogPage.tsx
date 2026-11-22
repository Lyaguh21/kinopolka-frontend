import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Group,
  Image,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconCategory, IconDeviceTv, IconMovie } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { useSession } from "../../../entities/session";
import {
  emptyShelf,
  TitleCard,
  titlesQuery,
  useShelf,
  type TitleKind,
} from "../../../entities/title";
import { EmptyState, PageBody } from "../../../shared/ui";
import { GuideMark, GuidePanel } from "./GuidePanel";
import { CatalogFilters, initial } from "./CatalogFilters";
import classes from "./CatalogPage.module.css";

const kinds = [
  { value: "all", label: "Всё", icon: <IconCategory size={16} aria-hidden /> },
  {
    value: "recommended",
    label: "Рекомендации",
    icon: <GuideMark variant="recommend" />,
  },
  {
    value: "Фильм",
    label: "Фильмы",
    icon: <IconMovie size={16} aria-hidden />,
  },
  {
    value: "Сериал",
    label: "Сериалы",
    icon: <IconDeviceTv size={16} aria-hidden />,
  },
  {
    value: "Аниме",
    label: "Аниме",
    icon: <Image src="/figma/catalog-anime.svg" alt="" w="auto" h={16} />,
  },
] as const;
const countryByTitle: Record<string, string[]> = {
  interstellar: ["США", "Великобритания"],
  dune: ["США", "Канада"],
  "dune-2021": ["США", "Канада"],
  severance: ["США"],
  inception: ["США", "Великобритания"],
  arrival: ["США", "Канада"],
  "blade-runner": ["США", "Великобритания", "Канада"],
  "spirited-away": ["Япония"],
  "grand-budapest": ["США", "Германия"],
};
const sortOptions = ["По популярности", "По рейтингу", "По году выхода"];
const popularity = [
  "interstellar",
  "dune",
  "dune-2021",
  "inception",
  "arrival",
  "blade-runner",
  "spirited-away",
  "severance",
  "grand-budapest",
];

export function CatalogPage() {
  const query = useQuery(titlesQuery);
  const [params, setParams] = useSearchParams();
  const [kind, setKind] = useState<TitleKind | "all" | "recommended">("all");
  const [filters, setFilters] = useState(initial);
  const [sort, setSort] = useState(sortOptions[0]);
  const account = useSession((state) => state.account);
  const shelf = useShelf((state) => state.shelves[account ?? ""] ?? emptyShelf);
  const results = (query.data ?? [])
    .filter((title) => {
      const year = Number(title.year.slice(0, 4));
      return (
        (kind === "all" ||
          kind === title.kind ||
          (kind === "recommended" && Number(title.rating) >= 8.5)) &&
        (!filters.genres.length || filters.genres.includes(title.genre)) &&
        (!filters.from || year >= Number(filters.from)) &&
        (!filters.to || year <= Number(filters.to)) &&
        (!filters.rating || Number(title.rating) >= Number(filters.rating)) &&
        (!filters.country.length ||
          filters.country.some((country) =>
            countryByTitle[title.id]?.includes(country),
          )) &&
        (!filters.hideWatched || shelf[title.id]?.status !== "watched")
      );
    })
    .sort((a, b) => {
      if (sort === sortOptions[1]) return Number(b.rating) - Number(a.rating);
      if (sort === sortOptions[2]) return b.year.localeCompare(a.year);
      return popularity.indexOf(a.id) - popularity.indexOf(b.id);
    });
  function setGuide(opened: boolean) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (opened) next.set("guide", "1");
        else next.delete("guide");
        return next;
      },
      { replace: true },
    );
  }

  return (
    <PageBody>
      <Group justify="space-between">
        <Stack gap="xs">
          <Title order={1} fz={40} fw={700}>
            Каталог
          </Title>
          <Text c="dimmed">
            Фильмы, сериалы и аниме — найди то, что стоит твоего времени.
          </Text>
        </Stack>
      </Group>
      <ActionIcon
        className={classes.guideTab}
        onClick={() => setGuide(true)}
        aria-label="Открыть КиноГид"
        aria-expanded={params.get("guide") === "1"}
      >
        <GuideMark variant="tab" />
      </ActionIcon>
      <Group gap="sm">
        {kinds.map(({ value, label, icon }) => (
          <Button
            className={classes.tag}
            key={value}
            variant={value === kind ? "filled" : "default"}
            onClick={() => setKind(value)}
            leftSection={icon}
            aria-pressed={value === kind}
          >
            {label}
          </Button>
        ))}
      </Group>
      <Box className={classes.layout}>
        <CatalogFilters
          apply={setFilters}
          onReset={() => {
            setFilters(initial);
            setKind("all");
          }}
        />
        <Stack component="section" gap="lg" aria-label="Результаты">
          <Group justify="space-between">
            <Text c="dimmed" aria-live="polite">
              Найдено произведений: {results.length}
            </Text>
            <Select
              aria-label="Сортировать каталог"
              data={sortOptions}
              value={sort}
              allowDeselect={false}
              onChange={(value) => value && setSort(value)}
            />
          </Group>
          {query.isPending && <Skeleton h={326} radius="lg" />}
          {query.isError && (
            <Alert title="Не удалось загрузить каталог">
              <UnstyledButton onClick={() => void query.refetch()}>
                Повторить загрузку
              </UnstyledButton>
            </Alert>
          )}
          {query.isSuccess && !results.length && (
            <EmptyState message="По этим фильтрам ничего не найдено." />
          )}
          <SimpleGrid
            cols={{ base: 2, md: 3, lg: 4 }}
            spacing={{ base: "sm", sm: "lg" }}
          >
            {results.map((title) => (
              <TitleCard
                key={title.id}
                title={title}
                status={shelf[title.id]?.status}
                favorite={shelf[title.id]?.favorite}
                to={`/title/${title.id}`}
              />
            ))}
          </SimpleGrid>
        </Stack>
      </Box>
      <GuidePanel
        opened={params.get("guide") === "1"}
        onClose={() => setGuide(false)}
      />
    </PageBody>
  );
}
