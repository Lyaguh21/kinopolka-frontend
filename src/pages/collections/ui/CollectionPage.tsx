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
  useCollectionBookmark,
  useCollections,
  useCreateCollection,
} from "../../../entities/collection";
import { TitleCard, type FilmTitle } from "../../../entities/title";
import {
  ActionButton,
  EmptyState,
  NotFoundView,
  PageBody,
} from "../../../shared/ui";
import { http } from "../../../shared/api/http";
type CardResponse = Parameters<typeof filmCard>[0];
import { filmCard, shelfCardsQuery } from "../../../entities/title/api/catalog";
import classes from "./CollectionsPage.module.css";

const sorts = ["Порядок автора", "По рейтингу"];

export function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sort, setSort] = useState(sorts[0]);

  const account = useSession((state) => state.account);
  const publish = useCreateCollection();
  const [share, setShare] = useState("");
  const bookmark = useCollectionBookmark(account);
  const collections = useCollections();
  const collection = collections.items.find((item) => item.id === id);

  const keys = collection?.titles ?? [];
  const source = shelfCardsQuery(keys);
  const hasLegacyKeys = keys.some((k) => !/^\d+$/.test(k));
  const query = useQuery({
    ...source,
    ...(hasLegacyKeys
      ? {
          queryKey: ["legacy-collection-cards", keys],
          queryFn: async ({ signal }: { signal: AbortSignal }) => {
            const cards = await Promise.all(
              keys.map(
                async (key) =>
                  (
                    await http.post<CardResponse[]>(
                      "api/titles/cards",
                      { ids: [key] },
                      { signal },
                    )
                  ).data[0],
              ),
            );
            return cards.filter((c) => c != null).map(filmCard);
          },
        }
      : {}),
  });
  if (!collection && collections.pending)
    return (
      <PageBody>
        <Text>Загрузка подборки…</Text>
      </PageBody>
    );
  if (!collection && collections.error)
    return (
      <PageBody>
        <Text>Подборка пока недоступна.</Text>
        <Anchor component={Link} to="/collections">
          Перейти к подборкам
        </Anchor>
      </PageBody>
    );
  if (!collection) return <NotFoundView />;

  const ordered = collection.local
    ? (query.data ?? [])
    : collection.titles
        .map((titleId) => query.data?.find((title) => title.id === titleId))
        .filter((title): title is FilmTitle => Boolean(title));
  const titles = [...ordered];
  if (sort === sorts[1])
    titles.sort((a, b) => Number(b.rating) - Number(a.rating));
  const isSaved = !!collection.saved;
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
          {collection.local && account && (
            <ActionButton
              disabled={publish.isPending || !titles.length}
              onClick={() =>
                publish.mutate(
                  {
                    ...collection,
                    owner: account,
                    titles: ordered.map((t) => t.id),
                  },
                  { onSuccess: (newId) => navigate("/collections/" + newId) },
                )
              }
            >
              Опубликовать копию подборки
            </ActionButton>
          )}
          {!collection.local && (
            <Group>
              <ActionButton
                appearance="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setShare("Ссылка скопирована");
                  } catch {
                    setShare(window.location.href);
                  }
                }}
              >
                Поделиться ссылкой
              </ActionButton>
              {share && (
                <Text size="sm" role="status">
                  {share}
                </Text>
              )}
            </Group>
          )}
          <ActionButton
            w={250}
            disabled={collection.local || bookmark.isPending}
            aria-pressed={isSaved}
            leftSection={
              isSaved ? (
                <IconBookmarkFilled size={16} aria-hidden />
              ) : (
                <IconBookmark size={16} aria-hidden />
              )
            }
            onClick={() =>
              account ? bookmark.mutate(collection) : navigate("/login")
            }
          >
            {collection.local
              ? "Личная подборка в этом браузере"
              : isSaved
                ? "Подборка сохранена"
                : "Сохранить подборку"}
          </ActionButton>
        </Stack>
      </Box>
      {publish.isError && <Text c="red">Не удалось опубликовать копию.</Text>}
      {bookmark.isError && <Text c="red">Не удалось сохранить подборку.</Text>}
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
