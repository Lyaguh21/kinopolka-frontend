import {
  Anchor,
  Avatar,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  TextInput,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useNavigate } from "react-router";
import { useState } from "react";
import { isAxiosError } from "axios";
import { useSession } from "../../../entities/session";
import { http } from "../../../shared/api/http";
import { PageBody, NotFoundView } from "../../../shared/ui";
type User = { nickname: string };
interface Profile extends User {
  name: string | null;
  bio: string | null;
  avatar: string | null;
  friends: User[];
  incoming: User[];
  sent: boolean;
  received: boolean;
  comments: { id: number; body: string; titleId: number; title: string }[];
}
export function useCommunityProfile(name?: string) {
  const viewer = useSession((s) => s.account);
  return useQuery({
    queryKey: ["public-profile", name, viewer ?? null],
    enabled: !!name,
    retry: false,
    queryFn: async ({ signal }) =>
      (
        await http.get<Profile>("api/profiles/" + encodeURIComponent(name!), {
          signal,
        })
      ).data,
  });
}
export function FriendsPage({ profile = false }: { profile?: boolean }) {
  const { personId } = useParams(),
    account = useSession((s) => s.account),
    name = personId ?? account;
  const query = useCommunityProfile(name),
    client = useQueryClient(),
    navigate = useNavigate();
  const [search, setSearch] = useState("");
  const relation = useMutation({
    mutationFn: ({ nickname, add }: { nickname: string; add: boolean }) =>
      http.post(
        "api/profiles/" + encodeURIComponent(nickname) + "/friend",
        { add },
        { headers: { "X-Filmets-Account": account } },
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: ["public-profile"] }),
  });
  if (!name)
    return (
      <PageBody>
        <Title>Друзья</Title>
        <Anchor component={Link} to="/login">
          Войти в Кинополку
        </Anchor>
      </PageBody>
    );
  if (query.isError)
    return isAxiosError(query.error) && query.error.response?.status === 404 ? (
      <NotFoundView />
    ) : (
      <PageBody>
        <Button onClick={() => query.refetch()}>
          Повторить загрузку профиля
        </Button>
      </PageBody>
    );
  if (!query.data)
    return (
      <PageBody>
        <Text>Загрузка профиля…</Text>
      </PageBody>
    );
  const data = query.data;
  return (
    <PageBody>
      {profile && data.avatar && <Avatar src={data.avatar} size={80} />}
      <Title>
        {profile
          ? (data.name ?? "@" + name)
          : personId
            ? "Друзья @" + name
            : "Мои друзья"}
      </Title>
      {profile && data.name && <Text c="dimmed">@{name}</Text>}
      {profile && data.bio && <Text>{data.bio}</Text>}
      {profile && account && account !== name && (
        <Group>
          <Button
            disabled={relation.isPending}
            onClick={() => relation.mutate({ nickname: name, add: !data.sent })}
          >
            {data.sent
              ? data.received
                ? "Удалить из друзей"
                : "Отозвать заявку"
              : data.received
                ? "Принять заявку"
                : "Добавить в друзья"}
          </Button>
        </Group>
      )}
      {name === account && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (search.trim())
              navigate("/profiles/" + encodeURIComponent(search.trim()));
          }}
        >
          <Group align="end">
            <TextInput
              label="Ник зрителя"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <Button type="submit" disabled={!search.trim()}>
              Открыть профиль
            </Button>
          </Group>
        </form>
      )}
      {relation.isError && (
        <Text c="red">Не удалось изменить список друзей.</Text>
      )}
      {data.incoming.length > 0 && (
        <Stack>
          <Title order={2}>Входящие заявки</Title>
          {data.incoming.map((u) => (
            <Group key={u.nickname}>
              <Anchor component={Link} to={"/profiles/" + u.nickname}>
                @{u.nickname}
              </Anchor>
              <Button
                disabled={relation.isPending}
                onClick={() =>
                  relation.mutate({ nickname: u.nickname, add: true })
                }
              >
                Принять
              </Button>
            </Group>
          ))}
        </Stack>
      )}
      <Stack>
        {profile && <Title order={2}>Друзья</Title>}
        {data.friends.length ? (
          data.friends.map((u) => (
            <Anchor
              key={u.nickname}
              component={Link}
              to={"/profiles/" + u.nickname}
            >
              @{u.nickname}
            </Anchor>
          ))
        ) : (
          <Text c="dimmed">Список друзей пока пуст.</Text>
        )}
      </Stack>
      {profile && (
        <Stack>
          <Title order={2}>Последние комментарии</Title>
          {data.comments.length ? (
            data.comments.map((c) => (
              <Paper key={c.id} withBorder p="md">
                <Anchor component={Link} to={"/title/" + c.titleId}>
                  {c.title}
                </Anchor>
                <Text
                  style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
                  {c.body}
                </Text>
              </Paper>
            ))
          ) : (
            <Text c="dimmed">Комментариев пока нет.</Text>
          )}
        </Stack>
      )}
    </PageBody>
  );
}
