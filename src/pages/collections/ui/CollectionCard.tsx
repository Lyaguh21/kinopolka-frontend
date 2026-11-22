import {
  ActionIcon,
  Box,
  Group,
  Image,
  Stack,
  Text,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";
import { Link } from "react-router";
import type { Collection } from "../../../entities/collection";
import classes from "./CollectionsPage.module.css";

export function CollectionCard({
  collection,
  authorPath,
  saved,
  saveCount,
  onToggle,
}: {
  collection: Collection;
  authorPath?: string;
  saved: boolean;
  saveCount: number;
  onToggle: () => void;
}) {
  const path = "/collections/" + collection.id;
  const author = (
    <>
      {collection.avatar && (
        <Image src={collection.avatar} radius="xl" h={28} w={28} alt="" />
      )}
      <Text fw={600} className={classes.cardText}>
        {collection.author}
      </Text>
    </>
  );

  return (
    <Stack component="article" gap="sm" miw={0}>
      <Box pos="relative">
        <Box component={Link} to={path} aria-label={collection.name}>
          <Image
            src={collection.cover}
            radius="lg"
            className={classes.cover}
            alt=""
          />
        </Box>
        <ActionIcon
          pos="absolute"
          top={12}
          right={12}
          size={36}
          variant="default"
          aria-pressed={saved}
          aria-label={saved ? "Убрать из сохранённых" : "Сохранить подборку"}
          onClick={onToggle}
        >
          {saved ? (
            <IconBookmarkFilled
              size={17}
              color="var(--kino-accent)"
              aria-hidden
            />
          ) : (
            <IconBookmark size={17} aria-hidden />
          )}
        </ActionIcon>
      </Box>
      <Title order={2} className={classes.cardText}>
        <Link to={path}>{collection.name}</Link>
      </Title>
      <Text c="dimmed" fz={14}>
        {collection.count}
      </Text>
      <Group justify="space-between" wrap="nowrap">
        {authorPath ? (
          <Group
            gap="xs"
            wrap="nowrap"
            renderRoot={(props) => <Link {...props} to={authorPath} />}
          >
            {author}
          </Group>
        ) : (
          <Group gap="xs" wrap="nowrap">
            {author}
          </Group>
        )}
        <Group gap={6} c="dimmed" wrap="nowrap">
          <IconBookmark size={16} aria-hidden />
          <Text fz={14}>
            <VisuallyHidden component="span">Сохранений: </VisuallyHidden>
            {saveCount}
          </Text>
        </Group>
      </Group>
    </Stack>
  );
}
