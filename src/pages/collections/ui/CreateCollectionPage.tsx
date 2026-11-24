import {
  Anchor,
  Box,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useCreateCollection } from "../../../entities/collection";
import { useProfiles } from "../../../entities/person";
import { requestError } from "../../../entities/session/model/session";
import { useSession } from "../../../entities/session";
import type { FilmTitle } from "../../../entities/title";
import { ActionButton, PageBody } from "../../../shared/ui";
import { CollectionFilmSearch } from "./CollectionFilmSearch";
import { SelectedCollectionFilms } from "./SelectedCollectionFilms";
import classes from "./CreateCollectionPage.module.css";

const maxNameLength = 100;

export function CreateCollectionPage() {
  const account = useSession((state) => state.account);
  const profile = useProfiles((state) => state.profiles[account ?? ""]);
  const createCollection = useCreateCollection();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [films, setFilms] = useState<FilmTitle[]>([]);

  if (!account)
    return (
      <Navigate to="/login" state={{ returnTo: "/collections/new" }} replace />
    );

  const isValid = Boolean(name.trim() && films.length);

  function addFilm(film: FilmTitle) {
    setFilms((current) =>
      current.length >= 100 || current.some(({ id }) => id === film.id)
        ? current
        : [...current, film],
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account || !isValid || createCollection.isPending) return;

    try {
      const id = await createCollection.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        author: profile?.name || account,
        avatar: profile?.avatar,
        owner: account,
        titles: films.map(({ id }) => id),
        cover: films[0].poster,
      });
      navigate("/collections/" + id, { replace: true });
    } catch {
      /* Ошибка отображается рядом с кнопкой. */
    }
  }

  return (
    <PageBody pt={{ base: 24, sm: 36 }} className={classes.page}>
      <Stack gap="md">
        <Anchor
          component={Link}
          to="/collections"
          className={classes.back}
          c="dimmed"
          fz={14}
        >
          <IconArrowLeft size={24} aria-hidden /> Все подборки
        </Anchor>
        <Title order={1} fw={700} fz="clamp(1.875rem, 4vw, 2.5rem)" lh={1.45}>
          Создание подборки
        </Title>
        <Text c="dimmed" lh={1.45}>
          Собери фильмы, которые хочется смотреть вместе, и поделись своей
          историей.
        </Text>
      </Stack>
      <Stack
        renderRoot={(props) => (
          <Box component="form" {...props} onSubmit={submit} />
        )}
        className={classes.form}
      >
        <Box className={classes.editor}>
          <Stack gap="xl" miw={0}>
            <TextInput
              label={
                <Group component="span" justify="space-between" gap="xs">
                  <Text component="span" fz="inherit">
                    Название
                  </Text>
                  <Text component="span" fz={13} c="dimmed">
                    {name.length} / {maxNameLength}
                  </Text>
                </Group>
              }
              aria-label="Название"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              maxLength={maxNameLength}
              required
              withAsterisk={false}
              placeholder="Придумай название подборки"
              classNames={{
                input: classes.field + " " + classes.nameField,
                label: classes.label,
              }}
            />
            <Stack gap="xs">
              <Textarea
                label={
                  <Group component="span" justify="space-between" gap="xs">
                    <Text component="span" fz="inherit">
                      Описание
                    </Text>
                    <Text component="span" fz={13} c="dimmed">
                      Необязательно
                    </Text>
                  </Group>
                }
                aria-label="Описание"
                aria-describedby="collection-description-hint"
                maxLength={4000}
                value={description}
                onChange={(event) => setDescription(event.currentTarget.value)}
                placeholder="Что объединяет эти фильмы?"
                classNames={{
                  input: classes.description,
                  label: classes.label,
                }}
              />
              <Text
                id="collection-description-hint"
                fz={13}
                c="dimmed"
                lh={1.45}
              >
                Расскажи, что объединяет эти фильмы.
              </Text>
            </Stack>
            <CollectionFilmSearch selected={films} onAdd={addFilm} />
          </Stack>
          <SelectedCollectionFilms
            films={films}
            onReorder={setFilms}
            onRemove={(id) =>
              setFilms((current) => current.filter((film) => film.id !== id))
            }
          />
        </Box>
        <Group gap="md" align="flex-start" className={classes.actions}>
          {createCollection.isError && (
            <Text c="red">{requestError(createCollection.error)}</Text>
          )}
          <ActionButton
            w={208}
            type="submit"
            disabled={!isValid || createCollection.isPending}
          >
            Создать подборку
          </ActionButton>
          <ActionButton
            w={132}
            appearance="secondary"
            renderRoot={(props) => <Link {...props} to="/collections" />}
          >
            Отмена
          </ActionButton>
          <Text c="dimmed" fz={14} lh={1.45}>
            Название и хотя бы один фильм — всё, что нужно.
          </Text>
        </Group>
      </Stack>
    </PageBody>
  );
}
