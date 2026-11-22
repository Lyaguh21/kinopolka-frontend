import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
  Group,
  Avatar,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Link, useParams } from "react-router";
import {
  getFriends,
  isPublicProfileId,
  publicProfiles,
} from "../../../entities/person";
import { useSession } from "../../../entities/session";
import { EmptyState, NotFoundView, PageBody } from "../../../shared/ui";
import classes from "./FriendsPage.module.css";

export function FriendsPage() {
  const { personId } = useParams();
  const account = useSession((state) => state.account);

  if (personId !== undefined && !isPublicProfileId(personId))
    return <NotFoundView />;
  if (!personId && !account) {
    return (
      <PageBody>
        <Title order={1} fz={40} fw={700}>
          Друзья
        </Title>
        <Text c="dimmed">Войди, чтобы увидеть свой список друзей.</Text>
        <Anchor
          component={Link}
          to="/login"
          state={{ returnTo: "/profile/friends" }}
        >
          Войти в Кинополку
        </Anchor>
      </PageBody>
    );
  }

  const owner = personId ? publicProfiles[personId] : undefined;
  const profilePath = owner ? `/profiles/${owner.id}` : "/profile";
  const friends = getFriends(owner?.id);

  return (
    <PageBody>
      <Group gap="md">
        <ActionIcon
          component={Link}
          to={profilePath}
          variant="default"
          size={40}
          aria-label="Вернуться в профиль"
        >
          <IconChevronLeft size={22} aria-hidden />
        </ActionIcon>
        <Breadcrumbs>
          <Anchor component={Link} to={profilePath} c="dimmed">
            {owner?.name ?? "Профиль"}
          </Anchor>
          <Text fz={15}>Друзья</Text>
        </Breadcrumbs>
      </Group>

      <Title order={1} fz={40} fw={700}>
        Друзья
      </Title>

      {friends.length ? (
        <Stack
          component="ul"
          className={classes.list}
          gap="sm"
          maw={644}
          aria-label="Список друзей"
        >
          {friends.map((friend) => (
            <li key={friend.id}>
              <Paper
                component={Link}
                to={`/profiles/${friend.id}`}
                className={classes.friend}
              >
                <Group gap="md" wrap="nowrap">
                  <Avatar src={friend.avatar} alt="" size={56} radius="xl" />
                  <Stack gap={2} flex={1}>
                    <Text fz={18} fw={600}>
                      {friend.name}
                    </Text>
                    <Text fz={14} c="dimmed">
                      @{friend.handle}
                    </Text>
                  </Stack>
                  <IconChevronRight
                    className={classes.chevron}
                    size={20}
                    aria-hidden
                  />
                </Group>
              </Paper>
            </li>
          ))}
        </Stack>
      ) : (
        <EmptyState message="Здесь пока нет друзей." />
      )}
    </PageBody>
  );
}
