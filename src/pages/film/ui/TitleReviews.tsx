import {
  Box,
  Button,
  Checkbox,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { ReviewCard, type Review } from "../../../entities/review";
import { ActionButton } from "../../../shared/ui";
import { emptyReviews, useReviews } from "../model/reviews";
import classes from "./FilmPage.module.css";

const severanceReview: Review = {
  author: "Анна К.",
  rating: 9,
  title: "В Lumon страшнее всего вежливость",
  body: "Белые коридоры и спокойные голоса сначала кажутся смешными. К концу серии та же улыбка начальника уже пугает.",
  likes: 128,
};
const filmReviews: Record<string, Review[]> = {
  interstellar: [
    {
      author: "Анна К.",
      rating: 9,
      title: "Большое кино, в котором важно самое близкое",
      body: "Иногда сильнее всего запоминается не масштаб кадра, а короткое сообщение от тех, кто остался на Земле.",
      likes: 128,
    },
    {
      author: "Алексей М.",
      rating: 3,
      title: "Тишина космоса",
      body: "Музыка и крупные планы впечатляют, но история раскрылась для меня только к финалу.",
      likes: 2,
    },
  ],
  severance: [
    severanceReview,
    { ...severanceReview, rating: 3 },
    {
      author: "Алексей М.",
      rating: 8,
      title: "По другую сторону лифта",
      body: "Один и тот же коридор ощущается по-разному, когда начинаешь понимать правила этого места.",
      likes: 12,
    },
  ],
};

export function TitleReviews({
  id,
  account,
  rating,
  ratingPanel,
}: {
  id: string;
  account?: string;
  rating?: number;
  ratingPanel: ReactNode;
}) {
  const published = useReviews((state) => state.byTitle[id] ?? emptyReviews);
  const saveReview = useReviews((state) => state.publish);
  const reviews = [...published, ...(filmReviews[id] ?? emptyReviews)];
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(2);

  function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    if (!rating) {
      setError("Выберите оценку перед публикацией.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const body = String(data.get("body") ?? "").trim();
    if (!title || !body) {
      setError("Заполните заголовок и текст рецензии.");
      return;
    }
    const review = {
      author: account,
      rating,
      title,
      body,
      spoiler: data.get("spoiler") === "on",
      likes: 0,
    };
    saveReview(id, review);
    event.currentTarget.reset();
    setError("");
  }

  return (
    <Stack>
      <Paper className={classes.panel} p="lg">
        <Stack gap="xl">
          {ratingPanel}
          <Stack
            gap="md"
            className={classes.reviewForm}
            renderRoot={(props) => (
              <Box component="form" {...props} onSubmit={publish} />
            )}
          >
            <Title order={3}>Моя рецензия</Title>
            <TextInput
              name="title"
              label="Заголовок"
              placeholder="Как бы вы назвали свою рецензию?"
              maxLength={120}
              required
            />
            <Textarea
              name="body"
              label="Текст рецензии"
              placeholder={
                id === "severance"
                  ? "Что вам запомнилось в сериале?"
                  : "Что вам запомнилось в фильме?"
              }
              maxLength={2000}
              rows={3}
              required
            />
            <Group justify="space-between">
              <Checkbox name="spoiler" label="Есть спойлеры" />
              {account ? (
                <ActionButton type="submit" w={208}>
                  Опубликовать
                </ActionButton>
              ) : (
                <Text
                  component={Link}
                  to={`/login-required?title=${id}`}
                  c="var(--kino-accent)"
                >
                  Войти для публикации
                </Text>
              )}
            </Group>
            {error && (
              <Text role="alert" c="var(--kino-dropped)">
                {error}
              </Text>
            )}
          </Stack>
        </Stack>
      </Paper>
      {reviews.slice(0, visibleCount).map((review, index) => (
        <ReviewCard
          key={`${review.author}-${review.title}-${reviews.length - index}`}
          review={review}
        />
      ))}
      {reviews.length > visibleCount && (
        <Button
          variant="default"
          mx="auto"
          onClick={() => setVisibleCount((count) => count + 2)}
        >
          Посмотреть ещё
        </Button>
      )}
    </Stack>
  );
}
