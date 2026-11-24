import {
  ActionIcon,
  Box,
  Group,
  Image,
  Kbd,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useReducedMotion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
  catalogQuery,
  filmCard,
  peopleSearchQuery,
} from "../../../entities/title/api/catalog";
import { useDebouncedValue } from "@mantine/hooks";
import classes from "./TitleSearch.module.css";
import { EmptyState } from "../../../shared/ui";

export function TitleSearch({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const phrase = value.trim().toLocaleLowerCase("ru");
  const [debounced] = useDebouncedValue(phrase, 200);
  const query = useQuery({
    ...catalogQuery({ q: debounced, limit: 6 }),
    enabled: opened,
  });
  const results =
    phrase === debounced ? (query.data?.items.map(filmCard) ?? []) : [];
  const people = useQuery({
    ...peopleSearchQuery(debounced),
    enabled: opened && !!debounced,
  });
  const peopleResults =
    phrase && phrase === debounced ? (people.data ?? []) : [];

  function closeSearch() {
    setValue("");
    onClose();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const first = results[0]
      ? `/title/${results[0].id}`
      : peopleResults[0]
        ? "/people/" + peopleResults[0].id
        : undefined;
    if (!first) return;
    navigate(first);
    closeSearch();
  }

  return (
    <Modal
      opened={opened}
      onClose={closeSearch}
      title="Поиск по Кинополке"
      classNames={{
        content: classes.modal,
        header: classes.hidden,
        body: classes.body,
        inner: classes.inner,
        overlay: classes.overlay,
      }}
      size={704}
      yOffset={68}
      overlayProps={{
        color: "var(--kino-scrim)",
        backgroundOpacity: 0.62,
        blur: 4.5,
      }}
      transitionProps={{ duration: reducedMotion ? 0 : 150 }}
    >
      <Box component="form" onSubmit={submit} className={classes.form}>
        <TextInput
          autoComplete="off"
          data-autofocus
          aria-label="Название фильма или сериала"
          placeholder="Что ищем?"
          maxLength={200}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          leftSection={<IconSearch size={22} aria-hidden />}
          rightSection={
            <UnstyledButton
              type="button"
              onClick={closeSearch}
              aria-label="Закрыть поиск"
            >
              <Kbd>Esc</Kbd>
            </UnstyledButton>
          }
          rightSectionWidth={58}
          classNames={{
            root: classes.fieldRoot,
            input: classes.field,
            section: classes.fieldSection,
          }}
        />
        <ActionIcon
          type="button"
          onClick={closeSearch}
          c="var(--kino-mobileNavIcon)"
          variant="subtle"
          size={44}
          aria-label="Закрыть поиск"
          hiddenFrom="sm"
        >
          <IconX size={22} aria-hidden />
        </ActionIcon>
      </Box>
      {!phrase && (
        <Text className={classes.prompt} fz={13} c="dimmed" hiddenFrom="sm">
          Фильмы, сериалы, люди
        </Text>
      )}
      <Box className={classes.results} data-empty-query={!phrase}>
        <ScrollArea.Autosize mah="60vh">
          <Stack p="sm" gap={5}>
            {!!results.length && (
              <Text px="sm" fz={13} c="dimmed" fw={600}>
                Фильмы и сериалы
              </Text>
            )}
            {results.map((title) => (
              <Group
                key={title.id}
                renderRoot={(props) => (
                  <Link
                    {...props}
                    to={`/title/${title.id}`}
                    onClick={closeSearch}
                  />
                )}
                className={classes.result}
                wrap="nowrap"
              >
                <Image src={title.poster} alt="" w={40} h={56} radius="xs" />
                <Stack gap={0}>
                  <Text fz={17}>{title.name}</Text>
                  <Text fz={13} c="dimmed">
                    {title.year} · {title.genre}
                  </Text>
                </Stack>
                <Text ml="auto" pr="sm" c="var(--kino-ratingGood)" fw={600}>
                  {title.rating}
                </Text>
              </Group>
            ))}
            {!!peopleResults.length && (
              <Text px="sm" mt="sm" fz={13} c="dimmed" fw={600}>
                Люди
              </Text>
            )}
            {peopleResults.map((person) => (
              <Group
                key={person.id}
                renderRoot={(props) => (
                  <Link
                    {...props}
                    to={"/people/" + person.id}
                    onClick={closeSearch}
                  />
                )}
                className={classes.result}
                wrap="nowrap"
              >
                <Image src={person.avatar} alt="" w={40} h={56} radius="xs" />
                <Stack gap={0}>
                  <Text fz={17}>{person.name}</Text>
                  <Text fz={13} c="dimmed">
                    Персона
                  </Text>
                </Stack>
              </Group>
            ))}
            {!results.length &&
              !peopleResults.length &&
              (query.isSuccess &&
              (!phrase || people.isSuccess) &&
              phrase === debounced ? (
                <EmptyState compact message="Ничего не найдено." />
              ) : (
                <Text p="sm" c="dimmed">
                  {query.isPending || people.isFetching || phrase !== debounced
                    ? "Загружаем фильмы…"
                    : "Поиск временно недоступен"}
                </Text>
              ))}
          </Stack>
        </ScrollArea.Autosize>
      </Box>
    </Modal>
  );
}
