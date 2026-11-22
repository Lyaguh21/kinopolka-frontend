import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
  Collapse,
  Group,
  Image,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { TitleCard, titlesQuery } from "../../entities/title";
import { PageBody } from "../../shared/ui";

const sorts = ["Сначала новые", "Сначала старые", "По рейтингу"];

export function DirectorPage() {
  const query = useQuery(titlesQuery);
  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState(sorts[0]);
  const films = (query.data ?? [])
    .filter(({ id }) => id === "interstellar" || id === "inception")
    .sort((a, b) => {
      if (sort === sorts[2]) return Number(b.rating) - Number(a.rating);
      return sort === sorts[0]
        ? b.year.localeCompare(a.year)
        : a.year.localeCompare(b.year);
    });

  return (
    <PageBody>
      <Group gap="lg">
        <ActionIcon
          component={Link}
          to="/title/interstellar"
          variant="default"
          size={40}
          aria-label="Назад к фильму"
        >
          <IconChevronLeft size={22} />
        </ActionIcon>
        <Breadcrumbs>
          <Text c="dimmed">Люди</Text>
          <Text>Кристофер Нолан</Text>
        </Breadcrumbs>
      </Group>
      <Group align="flex-start" gap={48}>
        <Image
          src="/figma/christopher-nolan.png"
          w={{ base: 200, sm: 300 }}
          h={{ base: 240, sm: 360 }}
          radius={14}
          alt="Кристофер Нолан"
        />
        <Stack flex="1 1 320px" gap="lg">
          <Text fz={12} fw={600} c="var(--kino-accent)">
            РЕЖИССЁР · СЦЕНАРИСТ · ПРОДЮСЕР
          </Text>
          <Title order={1} fw={700} fz="clamp(2rem, 4vw, 3rem)">
            Кристофер Нолан
          </Title>
          <Text fz={20} c="dimmed">
            Christopher Nolan
          </Text>
          <Text c="dimmed">Родился 30 июля 1970 · Лондон, Великобритания</Text>
          <Text fz={18}>
            Режиссёр, чьи истории исследуют время, память и человеческий выбор.
            Соединяет масштабное зрелище с нелинейным повествованием — от
            «Начала» до «Интерстеллара».
          </Text>
          <Anchor
            component="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            ta="left"
            fz={14}
          >
            {expanded ? "Свернуть биографию ↑" : "Развернуть биографию ↓"}
          </Anchor>
          <Collapse in={expanded}>
            <Text c="dimmed">
              В «Начале» режиссёр исследует границу между сном и реальностью, а
              в «Интерстелларе» связывает космическое путешествие с семейной
              историей.
            </Text>
          </Collapse>
        </Stack>
      </Group>
      <Stack component="section" gap="lg">
        <Group>
          <Title order={2} fz={28}>
            Фильмография
          </Title>
          <Select
            data={sorts}
            value={sort}
            onChange={(value) => value && setSort(value)}
            allowDeselect={false}
            aria-label="Сортировать фильмографию"
          />
        </Group>
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="lg">
          {films.map((title) => (
            <TitleCard key={title.id} title={title} to={`/title/${title.id}`} />
          ))}
        </SimpleGrid>
      </Stack>
    </PageBody>
  );
}
