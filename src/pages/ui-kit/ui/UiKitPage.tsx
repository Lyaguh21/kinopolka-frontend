import {
  ActionIcon,
  Box,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router";
import {
  StatusBadge,
  TitleCard,
  statusLabels,
  type FilmTitle,
  type PersonalRating,
  type ShelfStatus,
} from "../../../entities/title";
import { ReviewCard } from "../../../entities/review";
import { ActionButton, SiteHeader } from "../../../shared/ui";
import classes from "./UiKitPage.module.css";

const demoTitle: FilmTitle = {
  id: "interstellar",
  name: "Интерстеллар",
  year: "2014",
  genre: "Фантастика",
  kind: "Фильм",
  rating: "8.6",
  poster: "/figma/interstellar-poster.png",
};
const mine = {
  name: "Моя оценка",
  value: 9,
  avatar: "/figma/avatar-small.png",
};
const guest = {
  name: "Оценка Анны",
  value: 8,
  avatar: "/figma/avatar-small.png",
};
const statuses = Object.keys(statusLabels) as ShelfStatus[];
const ratingBands = [
  ["1–2", "ratingLow"],
  ["3–4", "ratingFair"],
  ["5–6", "ratingAverage"],
  ["7–8", "ratingGood"],
  ["9–10", "ratingGreat"],
];

interface CardExample {
  label: string;
  status?: ShelfStatus;
  favorite?: boolean;
  personalRatings?: PersonalRating[];
}

function CardExamples({
  heading,
  examples,
  labelBefore = false,
}: {
  heading: string;
  examples: CardExample[];
  labelBefore?: boolean;
}) {
  return (
    <Stack component="section" gap="md">
      <Title order={3} fz={24} fw={500}>
        {heading}
      </Title>
      <Box className={classes.examples}>
        {examples.map(({ label, ...card }) => (
          <Stack key={label} gap="sm">
            {labelBefore && (
              <Text fz={15} fw={500}>
                {label}
              </Text>
            )}
            <TitleCard title={demoTitle} {...card} />
            {!labelBefore && (
              <Text fz={13} c="dimmed">
                {label}
              </Text>
            )}
          </Stack>
        ))}
      </Box>
    </Stack>
  );
}

export function UiKitPage({ onSearch }: { onSearch: () => void }) {
  const navigate = useNavigate();

  return (
    <Stack component="main" className={classes.kit} gap="xl">
      <Title order={1} fw={700}>
        Кинополка / основа интерфейса
      </Title>
      <Box w="100%" maw={1440}>
        <SiteHeader account="Настя" onSearch={onSearch} />
      </Box>
      <Group gap="md">
        <ActionButton w={208} onClick={() => navigate("/title/interstellar")}>
          Продолжить
        </ActionButton>
        <ActionButton
          w={208}
          appearance="secondary"
          onClick={() => navigate("/title/interstellar")}
        >
          Подробнее
        </ActionButton>
      </Group>
      <Image
        src="/figma/logo.svg"
        w={420}
        h={96}
        maw="100%"
        fit="contain"
        alt="Кинополка"
      />
      <Image
        src="/figma/kit-icons.svg"
        className={classes.kitIcons}
        alt="Кастомные знаки Кинополки"
      />
      <Stack component="section" gap="xl" className={classes.cardSection}>
        <Stack gap="xs">
          <Title order={2} fz={32} lh={1} fw={500}>
            Карточка фильма
          </Title>
          <Text c="dimmed" fz={14}>
            244 × 385 · Бейджи 30 px · Аватары 20 px · Скругление бейджей 6 px
          </Text>
          <Text c="dimmed" fz={14}>
            Общий рейтинг + избранное + статус полки + личные оценки. Нет оценки
            — соответствующий бейдж скрыт.
          </Text>
        </Stack>
        <CardExamples
          heading="01 · Основной компонент и состояния пользователя"
          labelBefore
          examples={[
            { label: "Основной компонент" },
            { label: "Просмотрено", status: "watched" },
            { label: "С личной оценкой", personalRatings: [mine] },
            { label: "В избранном", favorite: true },
            {
              label: "Все отметки",
              status: "watched",
              favorite: true,
              personalRatings: [mine],
            },
          ]}
        />
        <CardExamples
          heading="02 · Все статусы полки"
          examples={statuses.map((status) => ({
            status,
            label: statusLabels[status],
          }))}
        />
        <CardExamples
          heading="03 · Оценки в чужой полке"
          examples={[
            { label: "Нет оценок" },
            { label: "Только моя оценка", personalRatings: [mine] },
            { label: "Только оценка гостя", personalRatings: [guest] },
            { label: "Обе оценки", personalRatings: [mine, guest] },
          ]}
        />
      </Stack>
      <Stack component="section" gap={14}>
        <Title order={2} fw={500}>
          Цвета оценок
        </Title>
        <Group gap="sm">
          {ratingBands.map(([label, color]) => (
            <Group key={label} className={classes.swatch} gap="xs">
              <Box
                w={32}
                h={32}
                bd={0}
                className={classes.swatchColor}
                bg={`var(--kino-${color})`}
              />
              <Text fw={500} fz={17}>
                {label}
              </Text>
            </Group>
          ))}
        </Group>
      </Stack>
      <ReviewCard
        review={{
          author: "Анна К.",
          rating: 9,
          title: "В Lumon страшнее всего вежливость",
          body: "Белые коридоры и спокойные голоса сначала кажутся смешными. К концу серии та же улыбка начальника уже пугает.",
          likes: 128,
        }}
      />
      <Stack component="section" gap={14}>
        <Title order={2} fw={500}>
          Статусы на полке
        </Title>
        <Group gap="sm">
          {statuses.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </Group>
      </Stack>
      <Group component="nav" aria-label="Хлебные крошки" gap="md">
        <ActionIcon
          component={Link}
          to="/collections"
          className={classes.back}
          size={40}
          aria-label="Назад к подборкам"
        >
          <IconChevronLeft size={24} aria-hidden />
        </ActionIcon>
        <Group gap="xs">
          <Text component={Link} to="/collections" c="dimmed" fz={15}>
            Подборки
          </Text>
          <Text c="var(--kino-subtle)" aria-hidden>
            /
          </Text>
          <Text fz={15}>За пределами Земли</Text>
        </Group>
      </Group>
    </Stack>
  );
}
