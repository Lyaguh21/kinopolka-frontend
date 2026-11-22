import { Box, Group, Image, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";
import { useEffect } from "react";
import { Link } from "react-router";
import { trailerSearchUrl } from "../../../entities/title";
import { ActionButton } from "../../../shared/ui";
import { featuredHero, rememberFeaturedHero } from "../model/featuredHeroes";
import classes from "./FeaturedHero.module.css";

const actionStyles = { inner: { gap: 4 }, section: { marginInline: 0 } };

export function FeaturedHero() {
  useEffect(rememberFeaturedHero, []);

  const {
    id,
    name,
    category,
    heading,
    description,
    rating,
    year,
    duration,
    age,
  } = featuredHero;

  return (
    <Stack
      component="section"
      className={classes.hero}
      gap={15}
      align="flex-start"
    >
      <Image
        src={`/figma/hero-${id}.jpg`}
        alt=""
        fetchPriority="high"
        className={classes.image}
      />
      <Text fw={600} fz={12} lh={1.4} c="var(--kino-accent)" tt="uppercase">
        Выбор редакции · {category}
      </Text>
      <Title className={classes.heading} order={1} fw={700} lh={1.4}>
        {heading[0]}
        <br />
        {heading[1]}
      </Title>
      <Text fw={600} fz={24} lh={1.4}>
        {name}
      </Text>
      <Text fz={17} lh={1.4}>
        {description[0]}
        <br />
        {description[1]}
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
        <ActionButton
          appearance="secondary"
          styles={actionStyles}
          w={208}
          leftSection={<IconPlayerPlay size={15} aria-hidden />}
          renderRoot={(props) => (
            <Box
              component="a"
              {...props}
              href={trailerSearchUrl(featuredHero)}
              target="_blank"
              rel="noopener noreferrer"
            />
          )}
        >
          Смотреть трейлер
        </ActionButton>
      </Group>
      <Text fz={13} lh={1.4} c="dimmed" className={classes.metadata}>
        {[`${rating} Кинополка`, year, duration, age].join("  ·  ")}
      </Text>
    </Stack>
  );
}
