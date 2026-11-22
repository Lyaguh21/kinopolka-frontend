import { Group, Image, Stack, Text, UnstyledButton } from "@mantine/core";
import { useState } from "react";
import {
  nextEpisode,
  useRecentTitle,
  type FilmTitle,
} from "../../../entities/title";
import { WatchSourcesModal } from "../../../features/watch-sources";
import { ActionButton } from "../../../shared/ui";
import classes from "./HomePage.module.css";

export function NextEpisodePrompt({
  viewer,
  titles,
}: {
  viewer: string;
  titles?: FilmTitle[];
}) {
  const current = useRecentTitle((state) => state.episodeByViewer[viewer]);
  const remember = useRecentTitle((state) => state.rememberEpisode);
  const dismiss = useRecentTitle((state) => state.dismissEpisode);
  const [opened, setOpened] = useState(false);
  const episode = nextEpisode(current);
  const title = titles?.find(({ id }) => id === episode?.titleId);

  if (!title || !episode) return null;

  return (
    <Group
      component="section"
      justify="space-between"
      className={classes.invite}
    >
      <Group gap="sm" wrap="nowrap">
        <Image src={title.poster} w={40} h={56} radius="xs" alt="" />
        <Stack gap={4}>
          <Text c="dimmed" fz={13}>
            Следующая серия
          </Text>
          <Text fz={21} fw={600}>
            {title.name}
          </Text>
          <Text c="dimmed" fz={14}>
            Сезон {episode.season}, серия {episode.episode}
          </Text>
        </Stack>
      </Group>
      <Group gap="sm">
        <UnstyledButton
          c="dimmed"
          fz={14}
          p="sm"
          onClick={() => dismiss(viewer)}
        >
          Не сейчас
        </UnstyledButton>
        <ActionButton onClick={() => setOpened(true)}>
          Смотреть следующую серию
        </ActionButton>
      </Group>
      <WatchSourcesModal
        title={title}
        episode={episode}
        opened={opened}
        onClose={() => setOpened(false)}
        onProviderSelect={() => {
          remember(viewer, episode);
          setOpened(false);
        }}
      />
    </Group>
  );
}
