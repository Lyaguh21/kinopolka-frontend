import {
  ActionIcon,
  Box,
  Button,
  Drawer,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  TextInput,
  SegmentedControl,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconArrowUp,
  IconChevronRight,
  IconTrash,
} from "@tabler/icons-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { ActionButton } from "../../../shared/ui";
import classes from "./GuidePanel.module.css";

import {
  semanticSearch,
  type GuideScope,
  type SemanticTitle,
} from "../../../entities/title/api/semanticSearch";

interface Turn {
  id: number;
  question: string;
  scope: GuideScope;
  items?: SemanticTitle[];
  message?: string;
  failed?: boolean;
  previous?: string;
}
const scopeLabels = { all: "Всё", movie: "Фильмы", series: "Сериалы" };

const marks = {
  header: "guide-sparkle",
  tab: "guide-tab",
  recommend: "catalog-recommend",
};

export function GuideMark({
  variant = "header",
}: {
  variant?: keyof typeof marks;
}) {
  return (
    <Box
      component="span"
      className={classes.mark}
      data-variant={variant}
      aria-hidden
    >
      <Image
        src={`/figma/${marks[variant]}-large.svg`}
        alt=""
        className={classes.largeSparkle}
      />
      <Image
        src={`/figma/${marks[variant]}-small.svg`}
        alt=""
        className={classes.smallSparkle}
      />
    </Box>
  );
}

export function GuidePanel({
  exclude,
  opened,
  onClose,
}: {
  exclude: string[];
  opened: boolean;
  onClose: () => void;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [scope, setScope] = useState<GuideScope>("all");
  const active = useRef<AbortController | null>(null);
  const nextId = useRef(0);
  const messages = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const last = turns.at(-1);
  const pending = Boolean(last && !last.failed && !last.items);

  useEffect(() => () => active.current?.abort(), []);
  useEffect(() => {
    const panel = messages.current;
    const question = panel?.querySelector<HTMLElement>('[data-current="true"]');
    if (panel && question)
      panel.scrollTop +=
        question.getBoundingClientRect().top -
        panel.getBoundingClientRect().top;
  }, [turns, opened]);

  function clear() {
    active.current?.abort();
    active.current = null;
    setTurns([]);
    setInput("");
  }

  async function search(turn: Turn, retry = false) {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setTurns((previous) =>
      retry
        ? previous.map((item) => (item.id === turn.id ? turn : item))
        : [...previous.slice(-9), turn],
    );
    let result: Partial<Turn>;
    try {
      result = await semanticSearch(
        turn.question,
        turn.scope,
        controller.signal,
        exclude,
        turn.previous,
      );
    } catch {
      result = { failed: true };
    }
    if (active.current !== controller || controller.signal.aborted) return;
    active.current = null;
    setTurns((previous) =>
      previous.map((item) =>
        item.id === turn.id ? { ...item, ...result } : item,
      ),
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || active.current) return;
    setInput("");
    void search({
      id: ++nextId.current,
      question,
      scope,
      previous: last?.items?.length ? last.question : undefined,
    });
  }
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={520}
      title={
        <Group gap="xs">
          <GuideMark />
          <Text component="span" fw={600} fz={28}>
            КиноГид
          </Text>
        </Group>
      }
      classNames={{
        inner: classes.inner,
        content: classes.drawer,
        header: classes.header,
        body: classes.body,
      }}
      closeButtonProps={{ "aria-label": "Закрыть КиноГид" }}
      overlayProps={{ color: "var(--kino-scrim)", backgroundOpacity: 0.42 }}
      transitionProps={{ duration: reducedMotion ? 0 : 180 }}
    >
      <ActionIcon
        className={classes.closeTab}
        onClick={onClose}
        aria-label="Свернуть КиноГид"
      >
        <IconChevronRight size={24} />
      </ActionIcon>
      <ActionIcon
        className={classes.clear}
        variant="subtle"
        color="gray"
        aria-label="Очистить диалог"
        onClick={clear}
      >
        <IconTrash size={18} />
      </ActionIcon>
      <Stack h="100%" gap="lg">
        <Text fz={13} c="dimmed">
          Помогу найти твоё кино
        </Text>
        <Stack
          className={classes.messages}
          gap="md"
          ref={messages}
          aria-live="polite"
        >
          {!turns.length && (
            <Text c="dimmed">
              Какое кино хочется посмотреть? Опиши сюжет или настроение.
            </Text>
          )}
          {turns.map((turn) => (
            <Stack key={turn.id} data-current={turn.id === last?.id} gap="sm">
              <Paper className={classes.question} p="md">
                <Text>{turn.question}</Text>
                {turn.scope !== "all" && (
                  <Text size="xs" c="dimmed">
                    {scopeLabels[turn.scope]}
                  </Text>
                )}
              </Paper>
              <Paper className={classes.answer} p="md">
                <Stack>
                  {turn.message && <Text>{turn.message}</Text>}
                  {turn.failed ? (
                    <>
                      <Text>
                        КиноГид не смог проверить ответ. Попробуй ещё раз.
                      </Text>
                      <Button
                        variant="default"
                        disabled={pending || turn.id !== last?.id}
                        onClick={() =>
                          void search(
                            {
                              id: turn.id,
                              question: turn.question,
                              scope: turn.scope,
                              previous: turn.previous,
                            },
                            true,
                          )
                        }
                      >
                        Повторить
                      </Button>
                    </>
                  ) : !turn.items ? (
                    <Text>Проверяю запрос и подбираю ответ…</Text>
                  ) : !turn.items.length ? (
                    <Text>
                      {turn.message
                        ? ""
                        : "Для этого запроса в выбранном разделе ничего не найдено."}
                    </Text>
                  ) : (
                    turn.items.map((item) => (
                      <Group
                        key={item.id}
                        className={classes.recommendation}
                        align="flex-start"
                      >
                        {item.posterUrl && (
                          <Image
                            src={item.posterUrl}
                            alt=""
                            w={60}
                            h={84}
                            radius="md"
                          />
                        )}
                        <Stack
                          className={classes.recommendationDetails}
                          flex={1}
                          gap="xs"
                        >
                          <Title order={3} fz={20}>
                            {item.title}
                          </Title>
                          <Text c="dimmed" size="sm">
                            {[
                              item.type === "movie" ? "Фильм" : "Сериал",
                              item.releaseDate?.slice(0, 4),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </Text>
                          {item.reason && <Text size="sm">{item.reason}</Text>}
                          {item.overview && (
                            <Text size="sm" lineClamp={3}>
                              {item.overview}
                            </Text>
                          )}
                          <ActionButton
                            rightSection={<IconArrowRight size={16} />}
                            onClick={() => {
                              onClose();
                              navigate("/title/" + item.id);
                            }}
                          >
                            Открыть карточку
                          </ActionButton>
                        </Stack>
                      </Group>
                    ))
                  )}
                </Stack>
              </Paper>
              {turn.items && turn.id === last?.id && (
                <Button
                  variant="subtle"
                  onClick={() => {
                    setInput(turn.question);
                    setScope(turn.scope);
                  }}
                >
                  Уточнить запрос
                </Button>
              )}
            </Stack>
          ))}
        </Stack>
        <Stack
          renderRoot={(props) => (
            <Box component="form" {...props} onSubmit={submit} />
          )}
          gap="xs"
        >
          <SegmentedControl
            aria-label="Где искать"
            value={scope}
            onChange={(v) => setScope(v as GuideScope)}
            data={Object.entries(scopeLabels).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <TextInput
            maxLength={1000}
            size="lg"
            placeholder="Спроси о кино…"
            aria-label="Сообщение КиноГиду"
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            classNames={{ input: classes.input }}
            rightSection={
              <ActionIcon
                type="submit"
                disabled={pending || !input.trim()}
                size={36}
                aria-label="Отправить сообщение"
              >
                <IconArrowUp size={21} />
              </ActionIcon>
            }
            rightSectionWidth={52}
          />
          <Text fz={11} c="dimmed" ta="center">
            AI может ошибаться. Проверяй информацию в карточке
          </Text>
        </Stack>
      </Stack>
    </Drawer>
  );
}
