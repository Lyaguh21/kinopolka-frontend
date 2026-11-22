import {
  Button,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useSession } from "../../../entities/session";
import {
  collectionAuthorPath,
  countLocalSaves,
  emptySaved,
  useCollections,
  useSavedCollections,
  type Collection,
} from "../../../entities/collection";
import { ActionButton, EmptyState, PageBody } from "../../../shared/ui";
import { CollectionCard } from "./CollectionCard";

const tabs = ["Все подборки", "От редакции", "От пользователей", "Сохранённые"];
const tabKeys = ["all", "editorial", "users", "saved"];
const sorts = ["По популярности", "По названию"];

export function CollectionsPage() {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState(sorts[0]);
  const account = useSession((state) => state.account);
  const byAccount = useSavedCollections((state) => state.byAccount);
  const saved = byAccount[account ?? ""] ?? emptySaved;
  const collections = useCollections();
  const localSaves = countLocalSaves(byAccount);
  const saveCount = (item: Collection) =>
    item.initialSaves + (localSaves.get(item.id) ?? 0);
  const toggle = useSavedCollections((state) => state.toggle);
  const navigate = useNavigate();
  const author = params.get("author");
  const tab = Math.max(0, tabKeys.indexOf(params.get("tab") ?? "all"));
  const visible = collections
    .filter((item) => !author || item.authorId === author)
    .filter(
      (item) =>
        tab === 0 ||
        (tab === 1 && !item.authorId && !item.owner) ||
        (tab === 2 && Boolean(item.authorId || item.owner)) ||
        (tab === 3 && saved.includes(item.id)),
    )
    .sort((a, b) =>
      sort === sorts[0]
        ? saveCount(b) - saveCount(a)
        : a.name.localeCompare(b.name, "ru"),
    );

  return (
    <PageBody>
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs">
          <Title order={1} fz={40} fw={700}>
            {author === "anna"
              ? "Подборки Анны К."
              : author === "alex"
                ? "Подборки Алексея М."
                : "Подборки"}
          </Title>
          <Text c="dimmed">
            Хорошее кино, собранное с чувством. Редакцией и такими же зрителями,
            как ты.
          </Text>
        </Stack>
        <ActionButton
          leftSection={<IconPlus size={18} aria-hidden />}
          renderRoot={(props) => <Link {...props} to="/collections/new" />}
        >
          Создать
        </ActionButton>
      </Group>
      <Group gap="sm">
        {tabs.map((name, index) => (
          <Button
            key={name}
            variant={index === tab ? "filled" : "default"}
            aria-pressed={index === tab}
            onClick={() =>
              setParams({ tab: tabKeys[index], ...(author ? { author } : {}) })
            }
          >
            {name}
          </Button>
        ))}
      </Group>
      <Group justify="space-between">
        <Text c="dimmed" fz={14}>
          Найдено подборок: {visible.length}
        </Text>
        <Select
          aria-label="Сортировать подборки"
          data={sorts}
          value={sort}
          allowDeselect={false}
          onChange={(value) => value && setSort(value)}
        />
      </Group>
      {!visible.length && <EmptyState message="Здесь пока нет подборок." />}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {visible.map((item) => (
          <CollectionCard
            key={item.id}
            collection={item}
            authorPath={collectionAuthorPath(item, account)}
            saved={saved.includes(item.id)}
            saveCount={saveCount(item)}
            onToggle={() =>
              account ? toggle(account, item.id) : navigate("/login")
            }
          />
        ))}
      </SimpleGrid>
    </PageBody>
  );
}
