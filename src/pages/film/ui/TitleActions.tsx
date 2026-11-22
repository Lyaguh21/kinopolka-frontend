import { Group, Select } from "@mantine/core";
import {
  IconChevronDown,
  IconHeart,
  IconHeartFilled,
  IconPlayerPlay,
} from "@tabler/icons-react";
import {
  statusLabels,
  type ShelfEntry,
  type ShelfStatus,
} from "../../../entities/title";
import { ActionButton } from "../../../shared/ui";
import classes from "./FilmPage.module.css";

const shelfOptions = [
  { value: "none", label: "Не посмотрено" },
  ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
];

export function TitleActions({
  entry,
  isEpisode,
  hidePlayIcon,
  onWatch,
  updateEntry,
}: {
  entry?: ShelfEntry;
  isEpisode: boolean;
  hidePlayIcon: boolean;
  onWatch: () => void;
  updateEntry: (change: Partial<ShelfEntry>) => void;
}) {
  return (
    <Group className={classes.heroActions}>
      <ActionButton
        w={182}
        onClick={onWatch}
        leftSection={hidePlayIcon ? undefined : <IconPlayerPlay size={17} />}
      >
        Смотреть
      </ActionButton>
      {isEpisode ? (
        <ActionButton
          appearance="secondary"
          onClick={() =>
            updateEntry({
              status: entry?.status === "watched" ? undefined : "watched",
            })
          }
        >
          {entry?.status === "watched"
            ? "Просмотрена"
            : "Отметить просмотренной"}
        </ActionButton>
      ) : (
        <>
          <Select
            value={entry?.status ?? "none"}
            data={shelfOptions}
            allowDeselect={false}
            classNames={{ input: classes.statusSelect }}
            w={196}
            maw="100%"
            rightSection={<IconChevronDown size={16} aria-hidden />}
            size="md"
            aria-label="Статус на полке"
            onChange={(value) =>
              updateEntry({
                status: value === "none" ? undefined : (value as ShelfStatus),
              })
            }
          />
          <ActionButton
            appearance="secondary"
            aria-pressed={Boolean(entry?.favorite)}
            leftSection={
              entry?.favorite ? (
                <IconHeartFilled size={18} />
              ) : (
                <IconHeart size={18} />
              )
            }
            onClick={() => updateEntry({ favorite: !entry?.favorite })}
          >
            {entry?.favorite ? "В избранном" : "В избранное"}
          </ActionButton>
        </>
      )}
    </Group>
  );
}
