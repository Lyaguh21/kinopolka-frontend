import {
  ActionIcon,
  Alert,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconCheck, IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { formatFilmCount } from "../../../entities/collection";
import { TitleCard, type FilmTitle } from "../../../entities/title";
import { ActionButton, EmptyState } from "../../../shared/ui";
import { catalogQuery, filmCard } from "../../../entities/title/api/catalog";
import { useDebouncedValue } from "@mantine/hooks";
import classes from "./CreateCollectionPage.module.css";

export function CollectionFilmSearch({
  selected,
  onAdd,
}: {
  selected: FilmTitle[];
  onAdd: (film: FilmTitle) => void;
}) {
  const [search, setSearch] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const [debounced] = useDebouncedValue(search.trim(), 200);
  const query = useQuery(catalogQuery({ q: debounced, limit: 18 }));
  const results = query.data?.items.map(filmCard) ?? [];
  return (
    <Stack gap="md">
      <Title order={2} fz={24} lh={1.45}>
        Найти фильмы
      </Title>
      <Text c="dimmed" fz={14} lh={1.45}>
        Ищи фильмы и сериалы по русскому или оригинальному названию.
      </Text>
      <TextInput
        ref={input}
        aria-label="Поиск фильмов"
        placeholder="Название фильма или сериала"
        classNames={{ input: classes.field }}
        leftSection={<IconSearch size={24} aria-hidden />}
        leftSectionWidth={56}
        rightSectionWidth={56}
        rightSection={
          search ? (
            <ActionIcon
              variant="subtle"
              color="gray"
              size={36}
              aria-label="Очистить поиск фильмов"
              onClick={() => {
                setSearch("");
                input.current?.focus();
              }}
            >
              <IconX size={24} aria-hidden />
            </ActionIcon>
          ) : undefined
        }
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.nativeEvent.isComposing)
            event.preventDefault();
        }}
      />
      <Group justify="space-between">
        <Text fz={14} fw={500} lh={1.45}>
          Результаты поиска
        </Text>
        {query.data && (
          <Text fz={14} c="dimmed" lh={1.45} aria-live="polite">
            {formatFilmCount(query.data.total)}
          </Text>
        )}
      </Group>
      {query.isPending && <Skeleton h={240} radius="lg" />}
      {query.isError && (
        <Alert title="Не удалось загрузить фильмы">
          <ActionButton
            appearance="secondary"
            onClick={() => void query.refetch()}
          >
            Повторить загрузку
          </ActionButton>
        </Alert>
      )}
      {query.isSuccess && !results.length && (
        <EmptyState compact message="По этому запросу ничего не найдено." />
      )}
      <SimpleGrid cols={{ base: 2, xs: 3 }} spacing={{ base: "sm", sm: "lg" }}>
        {results.map((film) => {
          const added = selected.some(({ id }) => id === film.id);
          return (
            <Stack key={film.id} gap="md" justify="space-between" miw={0}>
              <TitleCard title={film} />
              <ActionButton
                appearance="secondary"
                fullWidth
                disabled={added || selected.length >= 100}
                c={added ? "var(--kino-collectionSelected)" : undefined}
                className={classes.addFilm}
                leftSection={
                  added ? (
                    <IconCheck size={16} aria-hidden />
                  ) : (
                    <IconPlus size={16} aria-hidden />
                  )
                }
                aria-label={(added ? "В подборке: " : "Добавить: ") + film.name}
                onClick={() => onAdd(film)}
              >
                {added ? "В подборке" : "Добавить"}
              </ActionButton>
            </Stack>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
