import {
  Alert,
  Group,
  Image,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  recentTitleViewer,
  TitleCard,
  titlesQuery,
  useRecentTitle,
  useShelf,
  useTitleFromPreviousLaunch,
  type FilmTitle,
} from "../../../entities/title";
import { ActionButton, EmptyState } from "../../../shared/ui";
import { FeaturedHero } from "./FeaturedHero";
import { NextEpisodePrompt } from "./NextEpisodePrompt";
import classes from "./HomePage.module.css";

const sections = [
  {
    title: "Лучшие фильмы",
    ids: ["dune", "severance", "blade-runner", "spirited-away", "arrival"],
  },
  {
    title: "Сейчас популярно",
    ids: [
      "interstellar",
      "inception",
      "grand-budapest",
      "arrival",
      "spirited-away",
    ],
  },
];

export function HomePage({ account }: { account?: string }) {
  const navigate = useNavigate();
  const titles = useQuery(titlesQuery);
  const [showInvite, setShowInvite] = useState(true);
  const reducedMotion = useReducedMotion();
  const viewer = recentTitleViewer(account);
  const recentId = useTitleFromPreviousLaunch(viewer);
  const dismiss = useRecentTitle((state) => state.dismiss);
  const alreadyRated = useShelf((state) =>
    Boolean(account && recentId && state.shelves[account]?.[recentId]?.rating),
  );
  const recent = alreadyRated
    ? undefined
    : titles.data?.find(({ id }) => id === recentId);
  const showGuestInvite =
    !account && showInvite && !recent && (!recentId || !titles.isPending);

  return (
    <Stack component="main" gap="xl" className={classes.main}>
      <FeaturedHero />
      <NextEpisodePrompt viewer={viewer} titles={titles.data} />
      {(recent || showGuestInvite) && (
        <Group
          component="section"
          justify="space-between"
          className={classes.invite}
        >
          <Group gap="sm">
            {recent && (
              <Image src={recent.poster} w={40} h={56} radius="xs" alt="" />
            )}
            <Stack gap={5}>
              <Text c="dimmed" fz={13}>
                {recent ? "Недавно открывали" : "Личная кинополка"}
              </Text>
              <Text fz={21} fw={600}>
                {recent
                  ? `Оцените «${recent.name}»`
                  : "Создайте аккаунт и сохраняйте любимые фильмы"}
              </Text>
            </Stack>
          </Group>
          <Group gap="sm">
            <UnstyledButton
              c="dimmed"
              fz={14}
              p="sm"
              onClick={() => {
                if (recent) dismiss(viewer, recent.id);
                setShowInvite(false);
              }}
            >
              Не сейчас
            </UnstyledButton>
            <ActionButton
              onClick={() =>
                navigate(recent ? `/title/${recent.id}#ratings` : "/register")
              }
            >
              {recent
                ? recent.kind === "Сериал"
                  ? "Оценить сериал"
                  : recent.kind === "Аниме"
                    ? "Оценить аниме"
                    : "Оценить фильм"
                : "Создать полку"}
            </ActionButton>
          </Group>
        </Group>
      )}
      {titles.isError && (
        <Alert title="Не удалось загрузить фильмы">
          <UnstyledButton onClick={() => void titles.refetch()}>
            Повторить загрузку
          </UnstyledButton>
        </Alert>
      )}
      {sections.map((section) => {
        const visible = section.ids
          .map((id) => titles.data?.find((title) => title.id === id))
          .filter((title): title is FilmTitle => Boolean(title));

        return (
          <Stack component="section" gap="lg" key={section.title}>
            <Group justify="space-between">
              <Title order={2} fz={28}>
                {section.title}
              </Title>
              <Group
                renderRoot={(props) => <Link {...props} to="/catalog" />}
                gap={5}
                c="var(--kino-accent)"
                fz={14}
              >
                Смотреть всё <IconArrowRight size={15} />
              </Group>
            </Group>
            {titles.isPending && <Skeleton height={326} radius="lg" />}
            {titles.isSuccess && !visible.length && (
              <EmptyState
                compact
                message="В этой подборке ничего не найдено."
              />
            )}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0.84, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              <SimpleGrid cols={{ base: 2, xs: 3, md: 4, lg: 5 }} spacing="lg">
                {visible.map((title) => (
                  <TitleCard
                    key={title.id}
                    title={title}
                    to={`/title/${title.id}`}
                  />
                ))}
              </SimpleGrid>
            </motion.div>
          </Stack>
        );
      })}
    </Stack>
  );
}
