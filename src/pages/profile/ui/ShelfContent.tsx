import { Anchor, SimpleGrid, Text, Title } from "@mantine/core";
import { Link } from "react-router";
import { publicProfiles } from "../../../entities/person";
import {
  emptyShelf,
  TitleCard,
  useShelf,
  type FilmTitle,
} from "../../../entities/title";
import { PageBody } from "../../../shared/ui";
import { annaShelf } from "../model/anna";

export const annaProfile = publicProfiles.anna;
export const historyIllustration = "/illustrations/empty-watch-history.png";
export const profileEmptyMessage = "Тут пока пусто.";
export const profileEmptyImageSize = 168;

export function RequireAccount({ title }: { title: string }) {
  return (
    <PageBody>
      <Title order={1}>{title}</Title>
      <Text c="dimmed">Войди, чтобы открыть свою личную кинополку.</Text>
      <Anchor component={Link} to="/login">
        Войти в Кинополку
      </Anchor>
    </PageBody>
  );
}

export function ShelfGrid({
  titles,
  account,
  other = false,
}: {
  titles: FilmTitle[];
  account?: string;
  other?: boolean;
}) {
  const personal = useShelf(
    (state) => state.shelves[account ?? ""] ?? emptyShelf,
  );
  const shelf = other ? annaShelf : personal;
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="lg">
      {titles.map((title) => {
        const entry = shelf[title.id];
        const ratings = [];
        const mine = personal[title.id]?.rating;
        if (mine)
          ratings.push({
            name: "Моя оценка",
            avatar: "/figma/avatar-small.png",
            value: mine,
          });
        if (other && entry?.rating)
          ratings.push({
            name: "Оценка Анны",
            avatar: annaProfile.avatar,
            value: entry.rating,
          });
        return (
          <TitleCard
            key={title.id}
            title={title}
            status={entry?.status}
            favorite={entry?.favorite}
            to={`/title/${title.id}`}
            personalRatings={ratings}
          />
        );
      })}
    </SimpleGrid>
  );
}
