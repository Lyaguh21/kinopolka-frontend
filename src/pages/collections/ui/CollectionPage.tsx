import {
  ActionIcon,
  Anchor,
  Box,
  Breadcrumbs,
  Group,
  Image,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconBookmark,
  IconBookmarkFilled,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useSession } from "../../../entities/session";
import {
  collectionAuthorPath,
  emptySaved,
  useCollections,
  useSavedCollections,
} from "../../../entities/collection";
import {
  TitleCard,
  titlesQuery,
  type FilmTitle,
} from "../../../entities/title";
import {
  ActionButton,
  EmptyState,
  NotFoundView,
  PageBody,
} from "../../../shared/ui";
import classes from "./CollectionsPage.module.css";

const sorts = ["Порядок автора", "По рейтингу"];

export function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sort, setSort] = useState(sorts[0]);
  const query = useQuery(titlesQuery);
  const account = useSession((state) => state.account);
  const saved = useSavedCollections(
    (state) => state.byAccount[account ?? ""] ?? emptySaved,
  );
  const toggle = useSavedCollections((state) => state.toggle);
  const collections = useCollections();
  const collection = collections.find((item) => item.id === id);

  if (!collection) return <NotFoundView />;

  const titles = collection.titles
    .map((titleId) => query.data?.find((title) => title.id === titleId))
    .filter((title): title is FilmTitle => Boolean(title));
  if (sort === sorts[1])
    titles.sort((a, b) => Number(b.rating) - Number(a.rating));
  const isSaved = saved.includes(collection.id);
  const authorPath = collectionAuthorPath(collection, account);

  return (
    <PageBody>
      <Group>
        <ActionIcon
          component={Link}
          to="/collections"
          variant="default"
          size={40}
          aria-label="К подборкам"
        >
          <IconChevronLeft size={22} />
        </ActionIcon>
        <Breadcrumbs>
          <Anchor component={Link} to="/collections" c="dimmed">
            Подборки
          </Anchor>
          <Text>{collection.name}</Text>
        </Breadcrumbs>
      </Group>
      <Box component="section" className={classes.hero}>
        <Image src={collection.cover} alt="" className={classes.heroImage} />
        <Stack gap="md">
          <Text fz={12} c="var(--kino-accent)" fw={600}>
            {collection.authorId || collection.owner
              ? "ПОДБОРКА ПОЛЬЗОВАТЕЛЯ"
              : "ПОДБОРКА РЕДАКЦИИ"}
          </Text>
          <Title
            order={1}
            fz="clamp(2rem, 4vw, 3.25rem)"
            fw={700}
            className={classes.cardText}
          >
            {collection.name}
          </Title>
          {collection.description && (
            <Text
              fz={17}
              maw={550}
              className={classes.cardText}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {collection.description}
            </Text>
          )}
          <Group gap="xs" fz={14} c="dimmed">
            {authorPath ? (
              <Anchor component={Link} to={authorPath}>
                {collection.author}
              </Anchor>
            ) : (
              <Text fz="inherit">{collection.author}</Text>
            )}
            <Text fz="inherit">· {collection.count}</Text>
          </Group>
          <ActionButton
            w={250}
            aria-pressed={isSaved}
            leftSection={
              isSaved ? (
                <IconBookmarkFilled size={16} aria-hidden />
              ) : (
                <IconBookmark size={16} aria-hidden />
              )
            }
            onClick={() =>
              account ? toggle(account, collection.id) : navigate("/login")
            }
          >
            {isSaved ? "Подборка сохранена" : "Сохранить подборку"}
          </ActionButton>
        </Stack>
      </Box>
      <Group justify="space-between">
        <Title order={2}>Фильмы в подборке</Title>
        <Select
          data={sorts}
          value={sort}
          onChange={(value) => value && setSort(value)}
          allowDeselect={false}
          aria-label="Сортировать фильмы"
        />
      </Group>
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="lg">
        {titles.map((title) => (
          <TitleCard key={title.id} title={title} to={`/title/${title.id}`} />
        ))}
      </SimpleGrid>
      {query.isSuccess && titles.length === 0 && (
        <EmptyState message="В этой подборке пока нет фильмов." />
      )}
    </PageBody>
  );
}
