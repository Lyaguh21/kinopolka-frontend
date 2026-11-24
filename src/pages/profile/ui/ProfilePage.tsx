import {
  ActionIcon,
  Anchor,
  Avatar,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconLogout, IconPencil } from "@tabler/icons-react";
import { shelfCardsQuery } from "../../../entities/title/api/catalog";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { useCollectionData } from "../../../entities/collection";
import { publicProfiles, useProfiles } from "../../../entities/person";
import { useSession } from "../../../entities/session";
import { emptyShelf, useShelf } from "../../../entities/title";
import { EmptyState, PageBody } from "../../../shared/ui";
import { annaShelf } from "../model/anna";
import { ProfileStatistics } from "./ProfileStatistics";
import {
  annaProfile,
  historyIllustration,
  profileEmptyImageSize,
  profileEmptyMessage,
  RequireAccount,
  ShelfGrid,
} from "./ShelfContent";

import { useCommunityProfile } from "../../friends/ui/FriendsPage";
const friendPlural = new Intl.PluralRules("ru");
const friendNouns = {
  zero: "друзей",
  one: "друг",
  two: "друга",
  few: "друга",
  many: "друзей",
  other: "друзей",
};

export function ProfilePage({
  other = false,
  alex = false,
}: {
  other?: boolean;
  alex?: boolean;
}) {
  const account = useSession((state) => state.account);
  const admin = useSession((s) => s.admin);
  const signOut = useSession((state) => state.signOut);

  const ownProfile = useProfiles((state) => state.profiles[account ?? ""]);
  const personal = useShelf(
    (state) => state.shelves[account ?? ""] ?? emptyShelf,
  );
  const saved = useCollectionData().data?.filter((c) => c.saved) ?? [];
  const publicProfile = alex
    ? publicProfiles.alex
    : other
      ? annaProfile
      : undefined;
  const profile = publicProfile ?? ownProfile;
  const friendCount = useCommunityProfile(account).data?.friends.length;
  const friendsPath = publicProfile
    ? `/profiles/${publicProfile.id}/friends`
    : "/profile/friends";
  const shelf = alex ? emptyShelf : other ? annaShelf : personal;
  const numericIds = Object.keys(shelf)
    .filter((id) => /^[1-9]\d*$/.test(id))
    .sort();
  const live = useQuery(shelfCardsQuery(numericIds));
  const shelfPath = alex
    ? "/profiles/alex"
    : other
      ? "/profiles/anna/shelf"
      : "/shelf";
  const navigate = useNavigate();
  if (!account && !other && !alex)
    return <RequireAccount title="Мой профиль" />;

  const films = live.data ?? [];
  const watched = films.filter(({ id }) => shelf[id]?.status === "watched");
  const favorites = films.filter(({ id }) => shelf[id]?.favorite);
  const minutesWatched = watched.reduce(
    (sum, film) => sum + (film.minutes ?? 0),
    0,
  );

  return (
    <PageBody>
      <Group justify="space-between">
        <Group gap="lg">
          <Avatar
            src={profile?.avatar}
            alt=""
            style={{ "--avatar-size": "clamp(5.25rem, 14.6vw, 7rem)" }}
            radius="xl"
          />
          <Stack gap="xs" miw={0} maw="100%">
            <Title
              order={1}
              fz="clamp(1.875rem, 5vw, 2.5rem)"
              fw={700}
              style={{ overflowWrap: "anywhere" }}
            >
              {profile?.name ?? account}
            </Title>
            <Group gap="xs" c="dimmed" fz={14}>
              <Text fz="inherit" style={{ overflowWrap: "anywhere" }}>
                @{profile?.handle ?? account}
              </Text>
              <Text fz="inherit" aria-hidden>
                ·
              </Text>
              <Anchor component={Link} to={friendsPath} c="dimmed" fz="inherit">
                {friendCount === undefined
                  ? "Друзья"
                  : friendCount +
                    " " +
                    friendNouns[friendPlural.select(friendCount)]}
              </Anchor>
            </Group>
            {profile?.bio && (
              <Text style={{ overflowWrap: "anywhere" }}>{profile.bio}</Text>
            )}
          </Stack>
        </Group>
        {!other && !alex && (
          <Group gap="xs">
            {admin && (
              <Anchor component={Link} to="/admin">
                Управление сайтом
              </Anchor>
            )}
            <Tooltip label="Редактировать профиль">
              <ActionIcon
                size={44}
                variant="default"
                component={Link}
                to="/profile/edit"
                aria-label="Редактировать профиль"
              >
                <IconPencil size={21} aria-hidden />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Выйти">
              <ActionIcon
                size={44}
                variant="default"
                aria-label="Выйти"
                onClick={async () => {
                  if (await signOut()) navigate("/");
                }}
              >
                <IconLogout size={21} aria-hidden />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </Group>
      {!alex && (
        <>
          <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }}>
            {[
              {
                count: watched.length,
                label: "Просмотрено",
                image: "profile-camera.png",
              },
              {
                count: `${Math.round(minutesWatched / 60)} ч`,
                label: "За хорошим кино",
                image: "profile-hourglass.png",
              },
              {
                count: favorites.length,
                label: "В избранном",
                image: "profile-heart.png",
              },
              {
                count: other ? 1 : saved.length,
                label: other ? "Личных подборок" : "Сохранено подборок",
                image: "profile-ticket.png",
              },
            ].map(({ count: amount, label, image }) => (
              <Paper key={label} bg="var(--kino-raised)" p="lg" radius="lg">
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap="xs">
                    <Text fz={32} fw={600}>
                      {amount}
                    </Text>
                    <Text c="dimmed">{label}</Text>
                  </Stack>
                  <Image
                    w={{ base: 40, sm: 76 }}
                    fit="contain"
                    src={`/figma/${image}`}
                    alt=""
                  />
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
          <ProfileStatistics
            shelf={shelf}
            watched={watched}
            shelfPath={shelfPath}
            title={other ? "Полка Анны" : "Моя полка"}
          />
          {[
            {
              label: "Последнее посмотренное",
              link: "История",
              href: other ? "/profiles/anna/history" : "/profile/history",
              titles: watched,
            },
            {
              label: "На любимой полке",
              link: "Всё избранное",
              href: `${shelfPath}?status=favorite`,
              titles: favorites,
            },
          ].map(({ label, link, href, titles }) => (
            <Stack component="section" key={label}>
              <Group justify="space-between">
                <Title order={2}>{label}</Title>
                <Anchor component={Link} to={href}>
                  {link} →
                </Anchor>
              </Group>
              {numericIds.length > 0 && live.isPending ? (
                <Skeleton h={124} radius="lg" />
              ) : live.isError ? (
                <Text c="dimmed">Не удалось загрузить список.</Text>
              ) : titles.length ? (
                <ShelfGrid
                  titles={titles.slice(0, 5)}
                  account={account}
                  other={other}
                />
              ) : (
                <EmptyState
                  compact
                  message={profileEmptyMessage}
                  imageSize={profileEmptyImageSize}
                  illustration={
                    label === "Последнее посмотренное"
                      ? historyIllustration
                      : undefined
                  }
                />
              )}
            </Stack>
          ))}
        </>
      )}
      <Group component="section" justify="space-between">
        <Title order={2}>
          {other || alex ? "Личные подборки" : "Сохранённые подборки"}
        </Title>
        <Anchor
          component={Link}
          to={
            alex
              ? "/collections?author=alex"
              : other
                ? "/collections?author=anna"
                : "/collections?tab=saved"
          }
        >
          Подборки →
        </Anchor>
      </Group>
    </PageBody>
  );
}
