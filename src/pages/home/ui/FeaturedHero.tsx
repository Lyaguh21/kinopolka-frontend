import { Box, Group, Image, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { detailQuery } from "../../../entities/title/api/catalog";
import { Link } from "react-router";

import { ActionButton } from "../../../shared/ui";

import classes from "./FeaturedHero.module.css";

const actionStyles = { inner: { gap: 4 }, section: { marginInline: 0 } };

export function FeaturedHero({ id }: { id: string }) {
  const { data } = useQuery(detailQuery(id));
  if (!data) return null;
  const category = data.type === "movie" ? "Фильм" : "Сериал";
  return (
    <Stack
      component="section"
      className={classes.hero}
      gap={15}
      align="flex-start"
    >
      <Image
        src={data.backdropUrl ?? data.posterUrl}
        alt=""
        fetchPriority="high"
        className={classes.image}
      />
      <Text fw={600} fz={12} lh={1.4} c="var(--kino-accent)" tt="uppercase">
        Сейчас популярно · {category}
      </Text>
      <Title className={classes.heading} order={1} fw={700} lh={1.4}>
        {data.title}
      </Title>
      <Text fw={600} fz={24} lh={1.4}>
        {data.originalTitle !== data.title ? data.originalTitle : ""}
      </Text>
      <Text fz={17} lh={1.4} maw={620} lineClamp={4}>
        {data.overview}
      </Text>
      <Group gap="lg" className={classes.actions}>
        <ActionButton
          styles={actionStyles}
          w={208}
          rightSection={<IconArrowRight size={15} aria-hidden />}
          renderRoot={(props) => <Link {...props} to={`/title/${id}`} />}
        >
          {category === "Сериал" ? "О сериале" : "О фильме"}
        </ActionButton>
        {data.media.trailer && (
          <ActionButton
            appearance="secondary"
            styles={actionStyles}
            w={208}
            leftSection={<IconPlayerPlay size={15} aria-hidden />}
            renderRoot={(props) => (
              <Box
                component="a"
                {...props}
                href={data.media.trailer?.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            )}
          >
            Смотреть трейлер
          </ActionButton>
        )}
      </Group>
      <Text fz={13} lh={1.4} c="dimmed" className={classes.metadata}>
        {[
          data.tmdbRating.votes && data.tmdbRating.value?.toFixed(1) + " TMDB",
          data.releaseDate?.slice(0, 4),
          ...data.genres.map((g) => g.name),
        ]
          .filter(Boolean)
          .join(" · ")}
      </Text>
    </Stack>
  );
}
