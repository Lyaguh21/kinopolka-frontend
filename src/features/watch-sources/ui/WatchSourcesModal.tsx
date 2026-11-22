import {
  ActionIcon,
  Box,
  Group,
  Image,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowUpRight, IconX } from "@tabler/icons-react";
import { useReducedMotion } from "motion/react";
import {
  titleSearchText,
  type EpisodeLocation,
  type FilmTitle,
} from "../../../entities/title";
import classes from "./WatchSourcesModal.module.css";

function getProviders(title: FilmTitle, episode?: EpisodeLocation) {
  const query = episode
    ? `${titleSearchText(title)} сезон ${episode.season} серия ${episode.episode}`
    : titleSearchText(title);
  const name = encodeURIComponent(query);
  return [
    [
      "Кинопоиск",
      "provider-kinopoisk.png",
      `https://www.kinopoisk.ru/index.php?kp_query=${name}`,
    ],
    ["VK Видео", "provider-vk.png", `https://vkvideo.ru/?q=${name}`],
    [
      "RUTUBE",
      "provider-rutube.png",
      `https://rutube.ru/search/?query=${name}`,
    ],
    [
      "LordFilm",
      "provider-lordfilm.svg",
      `https://yandex.ru/search/?text=${encodeURIComponent(`${query} LordFilm`)}`,
    ],
  ];
}

export function WatchSourcesModal({
  title,
  episode,
  opened,
  onClose,
  onProviderSelect,
}: {
  title: FilmTitle;
  episode?: EpisodeLocation;
  opened: boolean;
  onClose: () => void;
  onProviderSelect?: () => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      centered
      size={488}
      classNames={{ content: classes.content }}
      transitionProps={{ transition: "pop", duration: reducedMotion ? 0 : 160 }}
    >
      <Modal.Overlay
        color="var(--kino-playerScrim)"
        backgroundOpacity={0.66}
        blur={3.5}
      />
      <Modal.Content>
        <Modal.Body className={classes.body}>
          <Group
            justify="space-between"
            align="flex-start"
            wrap="nowrap"
            mb="lg"
          >
            <Stack gap="xs">
              <Modal.Title className={classes.title}>Где смотреть</Modal.Title>
              <Text fz={15} c="dimmed" lh={1.2}>
                {title.name} · {title.year}
              </Text>
              {episode && (
                <Text fz={14} c="dimmed">
                  Сезон {episode.season}, серия {episode.episode}
                </Text>
              )}
            </Stack>
            <ActionIcon
              className={classes.close}
              size={38}
              onClick={onClose}
              aria-label="Закрыть"
              data-autofocus
            >
              <IconX size={20} aria-hidden />
            </ActionIcon>
          </Group>
          <Stack gap="xs">
            {getProviders(title, episode).map(([name, logo, href]) => (
              <Group
                key={name}
                renderRoot={(props) => (
                  <Box
                    component="a"
                    {...props}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onProviderSelect}
                  />
                )}
                className={classes.source}
                wrap="nowrap"
              >
                <Image
                  src={`/figma/${logo}`}
                  alt=""
                  w={34}
                  h={34}
                  fit="contain"
                  radius="sm"
                />
                <Text fw={500} fz={17}>
                  {name}
                </Text>
                <Box className={classes.arrow}>
                  <IconArrowUpRight size={20} aria-hidden />
                </Box>
              </Group>
            ))}
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
