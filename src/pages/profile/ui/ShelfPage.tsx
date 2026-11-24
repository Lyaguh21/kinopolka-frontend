import {
  ActionIcon,
  Anchor,
  Box,
  Breadcrumbs,
  Group,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBookmark,
  IconLayoutGrid,
  IconCheck,
  IconChevronLeft,
  IconHeart,
  IconPlayerPause,
  IconPlayerPlay,
  IconX,
} from "@tabler/icons-react";
import { shelfCardsQuery } from "../../../entities/title/api/catalog";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import { useSession } from "../../../entities/session";
import { emptyShelf, useShelf } from "../../../entities/title";
import { EmptyState, PageBody } from "../../../shared/ui";
import { annaShelf } from "../model/anna";
import {
  historyIllustration,
  profileEmptyImageSize,
  profileEmptyMessage,
  RequireAccount,
  ShelfGrid,
} from "./ShelfContent";
import classes from "./ProfilePages.module.css";

const tabs = [
  { key: "all", label: "Все статусы", icon: IconLayoutGrid, width: 142 },
  { key: "watching", label: "Смотрю", icon: IconPlayerPlay, width: 114 },
  { key: "favorite", label: "Избранное", icon: IconHeart, width: 114 },
  { key: "planned", label: "В планах", icon: IconBookmark, width: 119 },
  { key: "watched", label: "Просмотрено", icon: IconCheck, width: 148 },
  { key: "paused", label: "Отложено", icon: IconPlayerPause, width: 130 },
  { key: "dropped", label: "Брошено", icon: IconX, width: 124 },
] as const;

export function ShelfPage({
  history = false,
  other = false,
}: {
  history?: boolean;
  other?: boolean;
}) {
  const [params, setParams] = useSearchParams();

  const account = useSession((state) => state.account);
  const personal = useShelf(
    (state) => state.shelves[account ?? ""] ?? emptyShelf,
  );
  const shelf = other ? annaShelf : personal;
  const numericIds = Object.keys(shelf)
    .filter((id) => /^[1-9]\d*$/.test(id))
    .sort();
  const live = useQuery(shelfCardsQuery(numericIds));
  if (!account && !other)
    return (
      <RequireAccount title={history ? "История просмотра" : "Моя полка"} />
    );

  const tab = tabs.find(({ key }) => key === params.get("status"));
  const filter = history ? "watched" : (tab?.key ?? "all");
  const profilePath = other ? "/profiles/anna" : "/profile";
  const pageTitle = history
    ? other
      ? "История просмотра Анны К."
      : "История просмотра"
    : other
      ? "Полка Анны К."
      : "Моя полка";
  const visible = [...(live.data ?? [])].filter(
    ({ id }) => {
      const entry = shelf[id];
      if (filter === "all")
        return Boolean(entry?.status || entry?.favorite || entry?.rating);
      if (filter === "favorite") return entry?.favorite;
      return entry?.status === filter;
    },
  );

  return (
    <PageBody>
      <Group gap="md" wrap="nowrap">
        <ActionIcon
          component={Link}
          to={profilePath}
          variant="default"
          size={40}
          aria-label="Вернуться в профиль"
        >
          <IconChevronLeft size={22} aria-hidden />
        </ActionIcon>
        <Breadcrumbs
          separatorMargin="xs"
          renderRoot={(props) => (
            <Box component="nav" {...props} aria-label="Хлебные крошки" />
          )}
        >
          <Anchor component={Link} to={profilePath} c="dimmed" fz={15}>
            {other ? "Анна К." : "Профиль"}
          </Anchor>
          <Text fz={15} aria-current="page">
            {history ? "История просмотра" : "Личная полка"}
          </Text>
        </Breadcrumbs>
      </Group>
      <Stack gap="xs">
        <Title order={1} fz="clamp(1.875rem, 5vw, 2.625rem)" fw={500}>
          {pageTitle}
        </Title>
        <Text c="dimmed">
          {history
            ? "Здесь собраны просмотренные фильмы и сериалы"
            : "Здесь расположено то, что вы смотрите и уже посмотрели"}
        </Text>
      </Stack>
      {!history && (
        <ScrollArea scrollbars="x" type="never">
          <SegmentedControl
            aria-label="Статус на полке"
            value={filter}
            onChange={(key) => setParams(key === "all" ? {} : { status: key })}
            data={tabs.map(({ key, label, icon: Icon, width }) => ({
              value: key,
              label: (
                <Group
                  component="span"
                  w={width}
                  justify="center"
                  wrap="nowrap"
                  gap={6}
                >
                  <Icon size={16} aria-hidden />
                  {label}
                </Group>
              ),
            }))}
            color="coral"
            radius={7}
            withItemsBorders={false}
            classNames={{
              root: classes.shelfFilter,
              control: classes.shelfFilterControl,
              label: classes.shelfFilterLabel,
            }}
          />
        </ScrollArea>
      )}
      {(numericIds.length === 0 || live.isSuccess) &&
        !visible.length && (
          <EmptyState
            message={profileEmptyMessage}
            imageSize={profileEmptyImageSize}
            illustration={history ? historyIllustration : undefined}
            action={
              <Anchor component={Link} to="/catalog">
                Открыть каталог
              </Anchor>
            }
          />
        )}
      {live.isError && (
        <Text c="dimmed">Не удалось загрузить фильмы полки.</Text>
      )}
      <ShelfGrid titles={visible} account={account} other={other} />
    </PageBody>
  );
}
