import { Avatar, Box, Group, Image, Stack, Text } from "@mantine/core";
import { IconHeartFilled } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import type { FilmTitle, ShelfStatus } from "../model/title";
import { StatusBadge } from "./StatusBadge";
import classes from "./TitleCard.module.css";

export interface PersonalRating {
  avatar: string;
  name: string;
  value: number;
}

interface TitleCardProps {
  title: FilmTitle;
  status?: ShelfStatus;
  favorite?: boolean;
  personalRatings?: PersonalRating[];
  to?: string;
}

export function TitleCard({
  title,
  status,
  favorite,
  personalRatings = [],
  to,
}: TitleCardProps) {
  const reducedMotion = useReducedMotion();
  const card = (
    <Stack gap="xs">
      <Box className={classes.poster}>
        <Image src={title.poster} alt="" className={classes.cover} />
        <Group className={classes.ratings} gap={6} wrap="nowrap">
          <Text
            component="span"
            className={classes.rating}
            aria-label={`Общий рейтинг: ${title.rating}`}
          >
            {title.rating}
          </Text>
          {personalRatings.map(({ avatar, name, value }) => (
            <Group
              component="span"
              className={classes.rating}
              key={name}
              gap={5}
              wrap="nowrap"
              aria-label={`${name}: ${value}`}
            >
              <Avatar src={avatar} alt="" size={20} />
              {value}
            </Group>
          ))}
        </Group>
        {favorite && (
          <Box className={classes.favorite} aria-label="В избранном">
            <IconHeartFilled size={18} aria-hidden />
          </Box>
        )}
        {status && (
          <Box className={classes.statusPosition}>
            <StatusBadge status={status} />
          </Box>
        )}
      </Box>
      <Text fw={600} fz={18} lh={1.4} className={classes.title}>
        {title.name}
      </Text>
      <Text c="dimmed" fz={13} lh={1.4}>
        {[title.year, title.genre, title.kind].filter(Boolean).join(" · ")}
      </Text>
    </Stack>
  );

  if (!to) return card;

  return (
    <motion.div
      whileHover={reducedMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.16 }}
    >
      <Box component={Link} className={classes.link} to={to}>
        {card}
      </Box>
    </motion.div>
  );
}
