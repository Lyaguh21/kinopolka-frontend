import {
  ActionIcon,
  Badge,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import { IconGripVertical, IconX } from "@tabler/icons-react";
import { Reorder, useDragControls, useReducedMotion } from "motion/react";
import type { FilmTitle } from "../../../entities/title";
import classes from "./CreateCollectionPage.module.css";

interface SelectedFilmProps {
  film: FilmTitle;
  index: number;
  onRemove: (id: string) => void;
  onMove: (index: number, offset: number) => void;
}

function SelectedFilm({ film, index, onRemove, onMove }: SelectedFilmProps) {
  const controls = useDragControls();
  const reducedMotion = useReducedMotion();

  return (
    <Reorder.Item
      value={film}
      dragListener={false}
      dragControls={controls}
      transition={reducedMotion ? { duration: 0 } : undefined}
    >
      <Group className={classes.selectedRow} gap={10} wrap="nowrap">
        <ActionIcon
          variant="transparent"
          color="gray"
          size={28}
          className={classes.grip}
          aria-label={"Изменить порядок: " + film.name}
          aria-describedby="collection-order-hint"
          onPointerDown={(event) => controls.start(event)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
            event.preventDefault();
            onMove(index, event.key === "ArrowUp" ? -1 : 1);
          }}
        >
          <IconGripVertical size={24} aria-hidden />
        </ActionIcon>
        <Text c="dimmed" fz={13}>
          {String(index + 1).padStart(2, "0")}
        </Text>
        <Image
          src={film.poster}
          alt=""
          w={{ base: 44, sm: 56 }}
          h={{ base: 60, sm: 76 }}
          radius="xs"
        />
        <Stack gap={3} flex={1} miw={0}>
          <Text fw={600} fz={16} lh={1.45} className={classes.selectedTitle}>
            {film.name}
          </Text>
          <Text c="dimmed" fz={12} lh={1.45}>
            {[film.year, film.director].filter(Boolean).join(" · ")}
          </Text>
          {index === 0 && (
            <Text c="var(--kino-accent)" fz={12} lh={1.45}>
              Обложка подборки
            </Text>
          )}
        </Stack>
        <ActionIcon
          variant="transparent"
          color="gray"
          size={30}
          onClick={() => onRemove(film.id)}
          aria-label={"Убрать: " + film.name}
        >
          <IconX size={22} aria-hidden />
        </ActionIcon>
      </Group>
    </Reorder.Item>
  );
}

export function SelectedCollectionFilms({
  films,
  onReorder,
  onRemove,
}: {
  films: FilmTitle[];
  onReorder: (films: FilmTitle[]) => void;
  onRemove: (id: string) => void;
}) {
  function move(index: number, offset: number) {
    const position = index + offset;
    if (position < 0 || position >= films.length) return;
    const reordered = [...films];
    [reordered[index], reordered[position]] = [
      reordered[position],
      reordered[index],
    ];
    onReorder(reordered);
  }

  return (
    <Stack component="aside" gap="lg" miw={0}>
      <Paper className={classes.selection}>
        <Stack gap={20}>
          <Group justify="space-between" wrap="nowrap">
            <Title order={2} fz={24} lh={1.45}>
              В подборке
            </Title>
            <Badge size="lg" className={classes.countBadge} aria-live="polite">
              {films.length}
            </Badge>
          </Group>
          <Text fz={14} c="dimmed" lh={1.45} id="collection-order-hint">
            {films.length
              ? "Потяни за значок, чтобы изменить порядок."
              : "Добавь фильмы из результатов поиска."}
            <VisuallyHidden component="span">
              {" "}
              На клавиатуре используй стрелки вверх и вниз.
            </VisuallyHidden>
          </Text>
          {films.length > 0 && (
            <Reorder.Group
              as="ol"
              axis="y"
              values={films}
              onReorder={onReorder}
              className={classes.selectedList}
            >
              {films.map((film, index) => (
                <SelectedFilm
                  key={film.id}
                  film={film}
                  index={index}
                  onRemove={onRemove}
                  onMove={move}
                />
              ))}
            </Reorder.Group>
          )}
          <Text fz={13} c="dimmed" lh={1.45}>
            Первый фильм станет обложкой подборки.
            <br />
            Новые фильмы появятся в конце списка.
          </Text>
        </Stack>
      </Paper>
      <Stack gap="xs" px={4}>
        <Text fw={600} lh={1.45}>
          Хорошая подборка — это история
        </Text>
        <Text c="dimmed" fz={14} lh={1.45}>
          Порядок задаёт настроение. Начни с фильма, который лучше всего
          передаёт твою идею.
        </Text>
      </Stack>
    </Stack>
  );
}
