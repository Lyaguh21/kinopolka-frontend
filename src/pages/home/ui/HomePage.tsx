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
  useRecentTitle,
  useShelf,
  useTitleFromPreviousLaunch,
} from "../../../entities/title";
import { ActionButton, EmptyState } from "../../../shared/ui";
import { FeaturedHero } from "./FeaturedHero";
import {
  catalogQuery,
  viewerRecommendations,
  filmCard,
  shelfCardsQuery,
} from "../../../entities/title/api/catalog";
import classes from "./HomePage.module.css";

export function HomePage({ account }: { account?: string }) {
  const navigate = useNavigate();
  const popular = useQuery(catalogQuery({ sort: "popular", limit: 5 }));
  const best = useQuery(
    catalogQuery({ type: "movie", sort: "rating", limit: 5 }),
  );
  const shelf = useShelf((s) => s.shelves[account ?? ""]);
  const personal = useQuery(
    viewerRecommendations(account ?? "", JSON.stringify(shelf ?? {})),
  );
  const sections = [
    ...(account && personal.data?.items.length
      ? [{ title: "По твоей полке", query: personal }]
      : []),
    { title: "Лучшие фильмы", query: best },
    { title: "Сейчас популярно", query: popular },
  ];
  const [showInvite, setShowInvite] = useState(true);
  const reducedMotion = useReducedMotion();
  const viewer = recentTitleViewer(account);
  const recentId = useTitleFromPreviousLaunch(viewer);
  const dismiss = useRecentTitle((state) => state.dismiss);
  const alreadyRated = useShelf((state) =>
    Boolean(account && recentId && state.shelves[account]?.[recentId]?.rating),
  );
  const titles = useQuery(shelfCardsQuery(recentId ? [recentId] : []));
  const recent = alreadyRated ? undefined : titles.data?.[0];
  const showGuestInvite =
    !account && showInvite && !recent && (!recentId || !titles.isPending);

  return (
    <Stack component="main" gap="xl" className={classes.main}>
      {popular.data?.items[0] && (
        <FeaturedHero id={String(popular.data.items[0].id)} />
      )}
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
      {sections.map((section) => {
        const titles = section.query;
        const visible = titles.data?.items.map(filmCard) ?? [];

        return (
          <Stack component="section" gap="lg" key={section.title}>
            <Group justify="space-between">
              <Title order={2} fz={28}>
                {section.title}
              </Title>
              {section.query !== personal && (
                <Group
                  renderRoot={(props) => <Link {...props} to="/catalog" />}
                  gap={5}
                  c="var(--kino-accent)"
                  fz={14}
                >
                  Смотреть всё <IconArrowRight size={15} />
                </Group>
              )}
            </Group>
            {titles.isError && (
              <Alert title="Не удалось загрузить подборку">
                <UnstyledButton onClick={() => titles.refetch()}>
                  Повторить
                </UnstyledButton>
              </Alert>
            )}
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
