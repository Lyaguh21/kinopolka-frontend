import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Group,
  Image,
  Select,
  Pagination,
  TextInput,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconCategory, IconDeviceTv, IconMovie } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  catalogQuery,
  genreQuery,
  filmCard,
} from "../../../entities/title/api/catalog";
import { useDebouncedValue } from "@mantine/hooks";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { useSession } from "../../../entities/session";
import {
  emptyShelf,
  excludedTitles,
  TitleCard,
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
    label: "Высокий рейтинг",
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
const sortOptions = ["По популярности", "По рейтингу", "По году выхода"];
const countryCodes: Record<string, string> = {
  США: "US",
  Великобритания: "GB",
  Япония: "JP",
  Канада: "CA",
  Германия: "DE",
};
export function CatalogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q] = useDebouncedValue(search.trim(), 250);
  const genreList = useQuery(genreQuery);
  const [params, setParams] = useSearchParams();
  const [kind, setKind] = useState<TitleKind | "all" | "recommended">("all");
  const [filters, setFilters] = useState(initial);
  const [sort, setSort] = useState(sortOptions[0]);
  const account = useSession((state) => state.account);
  const shelf = useShelf((state) => state.shelves[account ?? ""] ?? emptyShelf);
  const query = useQuery(
    catalogQuery({
      page,
      limit: 20,
      q: q || undefined,
      type:
        kind === "Фильм" ? "movie" : kind === "Сериал" ? "series" : undefined,
      anime: kind === "Аниме" || undefined,
      genres: filters.genres.join(",") || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      countries:
        filters.country.map((c) => countryCodes[c]).join(",") || undefined,
      minRating: filters.rating || undefined,
      exclude: filters.hideWatched
        ? Object.keys(shelf)
            .filter((id) => /^\d+$/.test(id) && shelf[id]?.status === "watched")
            .join(",") || undefined
        : undefined,
      sort:
        kind === "recommended"
          ? "rating"
          : ["popular", "rating", "newest"][sortOptions.indexOf(sort)],
    }),
  );
  const results = query.data?.items.map(filmCard) ?? [];
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
            onClick={() => {
              setKind(value);
              setPage(1);
            }}
            leftSection={icon}
            aria-pressed={value === kind}
          >
            {label}
          </Button>
        ))}
      </Group>
      <Box className={classes.layout}>
        <CatalogFilters
          genres={[...new Set(genreList.data?.map((g) => g.name))].sort()}
          apply={(v) => {
            setFilters(v);
            setPage(1);
          }}
          onReset={() => {
            setFilters(initial);
            setPage(1);
            setSearch("");
            setKind("all");
          }}
        />
        <Stack component="section" gap="lg" aria-label="Результаты">
          <TextInput
            label="Поиск по названию"
            placeholder="Например, Интерстеллар"
            maxLength={200}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
          />
          <Group justify="space-between">
            <Text c="dimmed" aria-live="polite">
              Найдено произведений: {query.data?.total ?? "…"}
            </Text>
            <Select
              aria-label="Сортировать каталог"
              data={sortOptions}
              value={kind === "recommended" ? sortOptions[1] : sort}
              disabled={kind === "recommended"}
              allowDeselect={false}
              onChange={(value) => value && (setSort(value), setPage(1))}
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
          {query.data && query.data.totalPages > 1 && (
            <Pagination
              total={query.data.totalPages}
              value={page}
              onChange={setPage}
            />
          )}
        </Stack>
      </Box>
      <GuidePanel
        key={JSON.stringify([account, excludedTitles(shelf)])}
        exclude={excludedTitles(shelf)}
        opened={params.get("guide") === "1"}
        onClose={() => setGuide(false)}
      />
    </PageBody>
  );
}
