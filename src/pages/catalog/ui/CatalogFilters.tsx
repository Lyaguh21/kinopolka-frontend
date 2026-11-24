import {
  Box,
  Button,
  Checkbox,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconAdjustments, IconChevronDown } from "@tabler/icons-react";
import { useId, useState } from "react";
import { ActionButton } from "../../../shared/ui";
import classes from "./CatalogPage.module.css";

const years = Array.from({ length: 57 }, (_, index) => String(2026 - index));
const countries = ["США", "Великобритания", "Япония", "Канада", "Германия"];
export const initial = {
  genres: [] as string[],
  from: "",
  to: "",
  rating: "",
  country: [] as string[],
  hideWatched: false,
};
type Filters = typeof initial;

export function CatalogFilters({
  genres,
  apply,
  onReset,
}: {
  genres: string[];
  apply: (filters: Filters) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [expanded, setExpanded] = useState(false);
  const formId = useId();
  const invalidYears = Boolean(
    draft.from && draft.to && Number(draft.from) > Number(draft.to),
  );

  function reset() {
    setDraft(initial);
    onReset();
  }

  return (
    <Stack gap="sm">
      <Button
        hiddenFrom="sm"
        variant="default"
        leftSection={<IconAdjustments size={18} />}
        rightSection={<IconChevronDown size={16} />}
        aria-expanded={expanded}
        aria-controls={formId}
        onClick={() => setExpanded(!expanded)}
      >
        Фильтры
      </Button>
      <Box id={formId} className={classes.filters} data-expanded={expanded}>
        <Stack
          renderRoot={(props) => (
            <Box
              component="form"
              {...props}
              onSubmit={(event) => {
                event.preventDefault();
                if (!invalidYears) {
                  apply(draft);
                  setExpanded(false);
                }
              }}
            />
          )}
          gap={18}
        >
          <Title order={2} visibleFrom="sm">
            Фильтры
          </Title>
          <MultiSelect
            searchable
            nothingFoundMessage="Жанр не найден"
            label="Жанры"
            placeholder="Выбрать жанры"
            data={genres}
            value={draft.genres}
            onChange={(value) => setDraft({ ...draft, genres: value })}
          />
          <Stack gap={5}>
            <Text fz={14} fw={500}>
              Год выхода
            </Text>
            <Group grow>
              <Select
                aria-label="Год выхода от"
                placeholder="От"
                data={years}
                value={draft.from || null}
                clearable
                onChange={(value) => setDraft({ ...draft, from: value ?? "" })}
              />
              <Select
                aria-label="Год выхода до"
                placeholder="До"
                data={years}
                value={draft.to || null}
                clearable
                onChange={(value) => setDraft({ ...draft, to: value ?? "" })}
                error={invalidYears}
              />
            </Group>
            {invalidYears && (
              <Text c="var(--kino-dropped)" fz={12}>
                Укажите корректный диапазон.
              </Text>
            )}
          </Stack>
          <Select
            label="Рейтинг"
            placeholder="Любой рейтинг"
            data={["6", "7", "8", "9"].map((value) => ({
              value,
              label: `От ${value}`,
            }))}
            value={draft.rating || null}
            clearable
            onChange={(value) => setDraft({ ...draft, rating: value ?? "" })}
          />
          <MultiSelect
            label="Страна"
            placeholder="Любая страна"
            data={countries}
            value={draft.country}
            onChange={(value) => setDraft({ ...draft, country: value })}
          />
          <Checkbox
            label="Скрыть просмотренное"
            checked={draft.hideWatched}
            onChange={(event) =>
              setDraft({ ...draft, hideWatched: event.currentTarget.checked })
            }
          />
          <ActionButton fullWidth type="submit" disabled={invalidYears}>
            Применить
          </ActionButton>
          <UnstyledButton ta="center" c="dimmed" onClick={reset}>
            Сбросить всё
          </UnstyledButton>
        </Stack>
      </Box>
    </Stack>
  );
}
