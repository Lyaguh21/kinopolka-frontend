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
import { ReviewCard } from "../../../entities/review";
import { ActionButton } from "../../../shared/ui";
import { useMutation } from "@tanstack/react-query";
import { http } from "../../../shared/api/http";
import { requestError } from "../../../entities/session/model/session";
import classes from "./FilmPage.module.css";

export interface ReviewRow {
  id: number;
  nickname: string;
  rating: number | null;
  title: string | null;
  body: string;
  spoiler: boolean;
  likes: number;
  dislikes: number;
  reaction: "like" | "dislike" | null;
}
export function TitleReviews({
  id,
  account,
  rating,
  ratingPanel,
  series,
  own,
  reviews,
  total,
  loadMore,
  loadingMore,
  refresh,
  ready,
}: {
  id: string;
  account?: string;
  rating?: number;
  ratingPanel: ReactNode;
  series: boolean;
  own?: Pick<ReviewRow, "id" | "title" | "body" | "spoiler"> | null;
  reviews: ReviewRow[];
  total: number;
  loadMore: () => Promise<unknown>;
  loadingMore: boolean;
  refresh: () => Promise<unknown>;
  ready: boolean;
}) {
  const headers = { "X-Filmets-Account": account };
  const save = useMutation({
    mutationFn: (form: { title: string; text: string; spoiler: boolean }) =>
      http.post("api/titles/" + id + "/comments", form, { headers }),
    onSuccess: refresh,
  });
  const react = useMutation({
    mutationFn: ({ id, kind }: { id: number; kind: ReviewRow["reaction"] }) =>
      http.patch("api/reviews/" + id + "/reaction", { kind }, { headers }),
    onSuccess: refresh,
  });
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
    setError("");
    save.mutate({ title, text: body, spoiler: data.get("spoiler") === "on" });
  }

  return (
    <Stack>
      <Paper className={classes.panel} p="lg">
        <Stack gap="xl">
          {ratingPanel}
          <Stack
            key={own?.id ?? "new"}
            gap="md"
            className={classes.reviewForm}
            renderRoot={(props) => (
              <Box component="form" {...props} onSubmit={publish} />
            )}
          >
            <Title order={3}>Моя рецензия</Title>
            <TextInput
              defaultValue={own?.title ?? ""}
              name="title"
              label="Заголовок"
              placeholder="Как бы вы назвали свою рецензию?"
              maxLength={120}
              required
            />
            <Textarea
              defaultValue={own?.body ?? ""}
              name="body"
              label="Текст рецензии"
              placeholder={
                series
                  ? "Что вам запомнилось в сериале?"
                  : "Что вам запомнилось в фильме?"
              }
              maxLength={2000}
              rows={3}
              required
            />
            <Group justify="space-between">
              <Checkbox
                defaultChecked={own?.spoiler}
                name="spoiler"
                label="Есть спойлеры"
              />
              {account ? (
                <ActionButton
                  type="submit"
                  disabled={!ready}
                  loading={save.isPending}
                  w={208}
                >
                  {own ? "Сохранить изменения" : "Опубликовать"}
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
            {(error || save.isError || react.isError) && (
              <Text role="alert" c="var(--kino-dropped)">
                {error || requestError(save.error ?? react.error)}
              </Text>
            )}
          </Stack>
        </Stack>
      </Paper>
      {reviews.slice(0, visibleCount).map((review) => (
        <ReviewCard
          key={review.id}
          review={{
            ...review,
            author: review.nickname,
            title: review.title ?? "",
          }}
          reaction={review.reaction}
          disabled={!account || react.isPending}
          onReact={(kind) => react.mutate({ id: review.id, kind })}
        />
      ))}
      {total > visibleCount && (
        <Button
          variant="default"
          mx="auto"
          loading={loadingMore}
          onClick={async () => {
            if (visibleCount + 2 > reviews.length && reviews.length < total)
              await loadMore();
            setVisibleCount((count) => count + 2);
          }}
        >
          Посмотреть ещё
        </Button>
      )}
    </Stack>
  );
}
