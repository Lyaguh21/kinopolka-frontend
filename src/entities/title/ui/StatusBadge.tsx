import { Group, Text } from "@mantine/core";
import {
  IconBookmark,
  IconCheck,
  IconPlayerPause,
  IconPlayerPlay,
  IconX,
} from "@tabler/icons-react";
import type { ShelfStatus } from "../model/title";
import classes from "./TitleCard.module.css";

export const statusLabels: Record<ShelfStatus, string> = {
  watching: "Смотрю",
  planned: "В планах",
  watched: "Просмотрено",
  paused: "Отложено",
  dropped: "Брошено",
};

const statusIcons = {
  watching: IconPlayerPlay,
  planned: IconBookmark,
  watched: IconCheck,
  paused: IconPlayerPause,
  dropped: IconX,
};

export function StatusBadge({ status }: { status: ShelfStatus }) {
  const Icon = statusIcons[status];

  return (
    <Group
      component="span"
      gap={5}
      wrap="nowrap"
      className={classes.status}
      c={`var(--kino-${status})`}
    >
      <Icon size={16} aria-hidden />
      <Text component="span" fz={13} fw={500} lh={1}>
        {statusLabels[status]}
      </Text>
    </Group>
  );
}
