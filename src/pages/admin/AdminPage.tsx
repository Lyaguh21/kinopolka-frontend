import {
  Alert,
  Button,
  Checkbox,
  Group,
  MultiSelect,
  Paper,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { PageBody } from "../../shared/ui";
import { http } from "../../shared/api/http";
import { useSession } from "../../entities/session";
import { requestError } from "../../entities/session/model/session";
import { catalogQuery } from "../../entities/title/api/catalog";
interface Item {
  value: string;
  label: string;
}
interface Collection {
  id: string;
  name: string;
  description: string;
  owner: string | null;
  items: Item[];
  hidden: boolean;
}
interface Dashboard {
  collections: Collection[];
  users: { nickname: string; admin: boolean; suspended: boolean }[];
}
const empty = {
  id: "",
  name: "",
  description: "",
  owner: null,
  items: [],
  hidden: false,
};
export function AdminPage() {
  const account = useSession((s) => s.account),
    admin = useSession((s) => s.admin),
    client = useQueryClient();
  const [edit, setEdit] = useState<Collection | null>(null),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("");
  const [q] = useDebouncedValue(search, 250);
  const list = useQuery({
    queryKey: ["admin", account],
    enabled: !!admin,
    queryFn: async () => (await http.get<Dashboard>("api/admin")).data,
  });
  const films = useQuery({
    ...catalogQuery({ q, limit: 30 }),
    enabled: !!admin && !!edit,
  });
  const mutation = useMutation({
    mutationFn: async (action: {
      method: "post" | "patch" | "delete";
      path: string;
      data?: unknown;
    }) => {
      await http.request({
        method: action.method,
        url: "api/admin/" + action.path,
        data: action.data,
        headers: { "X-Filmets-Account": account },
      });
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin"] }),
        client.invalidateQueries({ queryKey: ["collections"] }),
      ]);
    },
  });
  const busy = mutation.isPending;
  const options = new Map((edit?.items ?? []).map((i) => [i.value, i]));
  for (const film of films.data?.items ?? [])
    options.set(String(film.id), {
      value: String(film.id),
      label:
        film.title +
        (film.releaseDate ? " · " + film.releaseDate.slice(0, 4) : ""),
    });
  if (!admin)
    return (
      <PageBody>
        <Title order={2}>Требуются права администратора</Title>
      </PageBody>
    );
  return (
    <PageBody>
      <Title>Управление сайтом</Title>
      {(mutation.isError || list.isError) && (
        <Alert color="red">{requestError(mutation.error ?? list.error)}</Alert>
      )}
      <Tabs defaultValue="collections">
        <Tabs.List>
          <Tabs.Tab value="collections">Подборки</Tabs.Tab>
          <Tabs.Tab value="users">Пользователи</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="collections" pt="lg">
          <Stack>
            <Group>
              <Button
                onClick={() => {
                  setEdit({ ...empty });
                  setSearch("");
                }}
              >
                Создать подборку Кинополки
              </Button>
            </Group>
            {edit && (
              <Paper p="lg">
                <Stack
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    mutation.mutate(
                      {
                        method: edit.id ? "patch" : "post",
                        path: edit.id
                          ? "collections/" + edit.id
                          : "collections",
                        data: {
                          name: edit.name,
                          description: edit.description,
                          titles: edit.items.map((i) => i.value),
                        },
                      },
                      { onSuccess: () => setEdit(null) },
                    );
                  }}
                >
                  <Title order={3}>
                    {edit.id ? "Редактировать подборку" : "Новая подборка"}
                  </Title>
                  <Text size="sm">Автор · {edit.owner ?? "Кинополка"}</Text>
                  <TextInput
                    label="Название"
                    required
                    maxLength={100}
                    value={edit.name}
                    onChange={(e) =>
                      setEdit({ ...edit, name: e.currentTarget.value })
                    }
                  />
                  <Textarea
                    label="Описание"
                    maxLength={4000}
                    value={edit.description}
                    onChange={(e) =>
                      setEdit({ ...edit, description: e.currentTarget.value })
                    }
                  />
                  <MultiSelect
                    label="Фильмы и сериалы в порядке показа"
                    searchable
                    searchValue={search}
                    onSearchChange={setSearch}
                    data={[...options.values()]}
                    maxValues={100}
                    value={edit.items.map((i) => i.value)}
                    onChange={(v) =>
                      setEdit({
                        ...edit,
                        items: v.map((id) => options.get(id)!),
                      })
                    }
                    nothingFoundMessage="Произведений не найдено"
                  />
                  <Group>
                    <Button
                      type="submit"
                      loading={busy}
                      disabled={!edit.name.trim() || !edit.items.length}
                    >
                      Сохранить
                    </Button>
                    <Button variant="default" onClick={() => setEdit(null)}>
                      Отмена
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            )}
            {list.data?.collections.map((c) => (
              <Paper key={c.id} p="md">
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Text fw={600}>{c.name}</Text>
                    <Text size="sm" c="dimmed">
                      {c.owner ?? "Кинополка"} · {c.items.length} в подборке
                    </Text>
                  </Stack>
                  <Group>
                    <Checkbox
                      label="Скрыта"
                      checked={c.hidden}
                      disabled={busy}
                      onChange={() =>
                        mutation.mutate({
                          method: "patch",
                          path: "collections/" + c.id + "/visibility",
                          data: { hidden: !c.hidden },
                        })
                      }
                    />
                    <Button
                      variant="default"
                      disabled={busy}
                      onClick={() => {
                        setEdit(c);
                        setSearch("");
                      }}
                    >
                      Изменить
                    </Button>
                    <Button
                      color="red"
                      variant="subtle"
                      disabled={busy}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Удалить подборку «" +
                              c.name +
                              "» у всех пользователей?",
                          )
                        )
                          mutation.mutate(
                            { method: "delete", path: "collections/" + c.id },
                            {
                              onSuccess: () => {
                                if (edit?.id === c.id) setEdit(null);
                              },
                            },
                          );
                      }}
                    >
                      Удалить
                    </Button>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="users" pt="lg">
          <Stack>
            <TextInput
              label="Поиск по нику"
              value={filter}
              onChange={(e) => setFilter(e.currentTarget.value)}
            />
            {list.data?.users
              .filter((u) => u.nickname.includes(filter.toLowerCase()))
              .map((u) => (
                <Group justify="space-between" key={u.nickname}>
                  <Text>{u.nickname}</Text>
                  {u.admin ? (
                    <Text c="dimmed">Администратор</Text>
                  ) : (
                    <Button
                      variant="default"
                      disabled={busy}
                      onClick={() =>
                        mutation.mutate({
                          method: "patch",
                          path: "users/" + u.nickname,
                          data: { suspended: !u.suspended },
                        })
                      }
                    >
                      {u.suspended ? "Разблокировать" : "Заблокировать"}
                    </Button>
                  )}
                </Group>
              ))}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </PageBody>
  );
}
