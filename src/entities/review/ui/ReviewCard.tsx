import {
  Group,
  Image,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useState } from "react";
import classes from "./ReviewCard.module.css";

export interface Review {
  author: string;
  rating: number;
  title: string;
  body: string;
  likes: number;
  dislikes?: number;
  spoiler?: boolean;
}

const colors = [
  "ratingLow",
  "ratingFair",
  "ratingAverage",
  "ratingGood",
  "ratingGreat",
];

export function ReviewCard({ review }: { review: Review }) {
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const color =
    colors[Math.min(4, Math.max(0, Math.floor((review.rating - 1) / 2)))];

  return (
    <Paper
      component="article"
      className={classes.review}
      style={{
        borderInlineStartColor:
          review.rating >= 7 ? "var(--kino-positive)" : `var(--kino-${color})`,
      }}
    >
      <Stack gap="sm">
        <Group gap="sm">
          <Text fz={48} fw={600} lh={1.1} c={`var(--kino-${color})`}>
            {review.rating}
          </Text>
          <Text fz={24} fw={600}>
            {review.author}
          </Text>
        </Group>
        {review.spoiler && !showSpoiler ? (
          <UnstyledButton c="dimmed" onClick={() => setShowSpoiler(true)}>
            Показать рецензию со спойлерами
          </UnstyledButton>
        ) : (
          <>
            <Text fz={22} fw={600}>
              {review.title}
            </Text>
            <Text fz={16} c="dimmed">
              {review.body}
            </Text>
          </>
        )}
        <Group gap="lg">
          {(["like", "dislike"] as const).map((kind) => (
            <UnstyledButton
              key={kind}
              className={classes.reaction}
              aria-label={kind === "like" ? "Нравится" : "Не нравится"}
              aria-pressed={reaction === kind}
              onClick={() =>
                setReaction((previous) => (previous === kind ? null : kind))
              }
            >
              <Image
                src={`/figma/review-${kind}.svg`}
                alt=""
                w={18}
                h={18}
                className={kind === "dislike" ? classes.dislike : undefined}
              />
              {(kind === "like" ? review.likes : (review.dislikes ?? 0)) +
                Number(reaction === kind)}
            </UnstyledButton>
          ))}
        </Group>
      </Stack>
    </Paper>
  );
}
