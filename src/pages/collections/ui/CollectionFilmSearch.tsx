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
import {
  TitleCard,
  titlesQuery,
  type FilmTitle,
} from "../../../entities/title";
import { ActionButton, EmptyState } from "../../../shared/ui";
import classes from "./CreateCollectionPage.module.css";

function normalize(text: string) {
  return text.toLocaleLowerCase("ru").replaceAll("ё", "е").trim();
}

export function CollectionFilmSearch({
  selected,
  onAdd,
}: {
  selected: FilmTitle[];
  onAdd: (film: FilmTitle) => void;
}) {
  const [search, setSearch] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const query = useQuery(titlesQuery);
  const words = normalize(search).split(/\s+/);
  const results = (query.data ?? []).filter((film) => {
    if (film.kind !== "Фильм") return false;
    const searchable = normalize(
      [film.name, film.director, film.genre, film.year].join(" "),
    );
    return words.every((word) => searchable.includes(word));
  });

  return (
    <Stack gap="md">
      <Title order={2} fz={24} lh={1.45}>
        Найти фильмы
      </Title>
      <Text c="dimmed" fz={14} lh={1.45}>
        Ищи по названию, режиссёру или жанру.
      </Text>
      <TextInput
        ref={input}
        aria-label="Поиск фильмов"
        placeholder="Название, режиссёр или жанр"
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
            {formatFilmCount(results.length)}
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
                disabled={added}
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
