import {
  ActionIcon,
  Anchor,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconHeart, IconSparkles, IconStar, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router";
import { titlesQuery } from "../../../entities/title";
import { ActionButton, PageBody } from "../../../shared/ui";

const benefits = [
  [IconHeart, "Избранное и списки на потом"],
  [IconStar, "Оценки и личная история"],
  [IconSparkles, "Рекомендации по твоему вкусу"],
] as const;

export function AuthRequiredPage() {
  const [params] = useSearchParams();
  const query = useQuery(titlesQuery);
  const navigate = useNavigate();
  const title = query.data?.find(({ id }) => id === params.get("title"));
  const from = title ? `/title/${title.id}` : "/catalog";
  const state = {
    returnTo: from,
    favorite: params.get("action") === "favorite" ? title?.id : undefined,
  };
  const prompt =
    title && state.favorite
      ? `Войди, чтобы добавить «${title.name}» в избранное. Мы сохраним твой выбор и учтём его в рекомендациях.`
      : "Войди, чтобы сохранять любимые фильмы, ставить оценки и собирать свою полку.";

  return (
    <PageBody align="center" mih="calc(100svh - 168px)" pt={80}>
      <Paper
        bg="var(--kino-raised)"
        p={{ base: "lg", sm: 40 }}
        radius="xl"
        maw={580}
        w="100%"
      >
        <Stack gap="lg">
          <Group justify="space-between">
            <Text fz={12} fw={600} c="var(--kino-accent)">
              КИНОПОЛКА
            </Text>
            <ActionIcon
              component={Link}
              to={from}
              variant="subtle"
              color="gray"
              aria-label="Закрыть"
            >
              <IconX size={18} />
            </ActionIcon>
          </Group>
          <Title order={1} fz={36} fw={700}>
            Для любимого кино нужна своя полка
          </Title>
          <Text c="dimmed" fz={17}>
            {prompt}
          </Text>
          <Stack gap="xs">
            {benefits.map(([Icon, text]) => (
              <Group gap="xs" key={text}>
                <Icon size={17} aria-hidden />
                <Text>{text}</Text>
              </Group>
            ))}
          </Stack>
          <Stack gap="sm">
            <ActionButton
              fullWidth
              onClick={() => navigate("/login", { state })}
            >
              Войти
            </ActionButton>
            <Anchor
              component={Link}
              to="/register"
              state={state}
              ta="center"
              fw={600}
              c="var(--kino-text)"
            >
              Создать аккаунт
            </Anchor>
          </Stack>
          <Anchor component={Link} to={from} c="dimmed" ta="center" fz={14}>
            Продолжить просмотр без входа →
          </Anchor>
        </Stack>
      </Paper>
    </PageBody>
  );
}
