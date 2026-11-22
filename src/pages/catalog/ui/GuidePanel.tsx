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
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconArrowUp,
  IconChevronRight,
  IconTrash,
} from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { ActionButton } from "../../../shared/ui";
import classes from "./GuidePanel.module.css";

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
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [showExample, setShowExample] = useState(true);
  const [input, setInput] = useState("");
  const [followUp, setFollowUp] = useState("");
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) return;
    if (showExample) setFollowUp(input.trim());
    setShowExample(true);
    setInput("");
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
        onClick={() => {
          setShowExample(false);
          setFollowUp("");
        }}
      >
        <IconTrash size={18} />
      </ActionIcon>
      <Stack h="100%" gap="lg">
        <Text fz={13} c="dimmed">
          Помогу найти твоё кино
        </Text>
        <Stack className={classes.messages} gap="md">
          {showExample && (
            <>
              <Paper className={classes.question} p="md">
                Хочу что-то похожее на «Интерстеллар», но не такое длинное.
              </Paper>
              <Paper className={classes.answer} p="md">
                <Stack>
                  <Text>
                    Попробуй «Прибытие». Это камерная фантастика о первом
                    контакте, времени и человеческой связи. Длится 1 ч 56 мин —
                    и его ещё нет в твоей истории.
                  </Text>
                  <Group className={classes.recommendation} align="stretch">
                    <Image
                      src="/figma/home-arrival.png"
                      alt=""
                      w={{ base: 60, sm: 90 }}
                      h={{ base: 84, sm: 126 }}
                      radius="lg"
                    />
                    <Stack
                      className={classes.recommendationDetails}
                      flex={1}
                      justify="space-between"
                      gap="xs"
                    >
                      <Title order={3} fz={21}>
                        Прибытие
                      </Title>
                      <Text c="dimmed" fz={13}>
                        2016 · 1 ч 56 мин · 16+
                      </Text>
                      <Text c="var(--kino-accent)" fz={13}>
                        8.0 · 98% совпадение
                      </Text>
                      <ActionButton
                        fullWidth
                        px={{ base: "xs", sm: "md" }}
                        rightSection={<IconArrowRight size={16} />}
                        onClick={() => {
                          onClose();
                          navigate("/title/arrival");
                        }}
                      >
                        Открыть фильм
                      </ActionButton>
                    </Stack>
                  </Group>
                </Stack>
              </Paper>
              <Paper className={classes.answer} p="md">
                Если хочется сменить жанр, попробуй «Отель „Гранд Будапешт“»: 1
                ч 40 мин и совсем другое настроение.
              </Paper>
              <Group gap="xs">
                {["Ещё короче", "Без грустного финала"].map((prompt) => (
                  <Button
                    key={prompt}
                    variant="subtle"
                    c="var(--kino-text)"
                    onClick={() => setFollowUp(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </Group>
            </>
          )}
          {!showExample && (
            <Button variant="default" onClick={() => setShowExample(true)}>
              Показать пример диалога
            </Button>
          )}
          <AnimatePresence>
            {followUp && (
              <motion.div
                key={followUp}
                initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16 }}
              >
                <Stack>
                  <Paper className={classes.question} p="md">
                    {followUp}
                  </Paper>
                  <Paper className={classes.answer} p="md">
                    Сейчас доступен демонстрационный диалог. Открой предложенный
                    фильм, чтобы узнать о нём больше.
                  </Paper>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
        <Stack
          renderRoot={(props) => (
            <Box component="form" {...props} onSubmit={submit} />
          )}
          gap="xs"
        >
          <TextInput
            size="lg"
            placeholder="Спроси о кино…"
            aria-label="Сообщение КиноГиду"
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            classNames={{ input: classes.input }}
            rightSection={
              <ActionIcon
                type="submit"
                size={36}
                aria-label="Отправить сообщение"
              >
                <IconArrowUp size={21} />
              </ActionIcon>
            }
            rightSectionWidth={52}
          />
          <Text fz={11} c="dimmed" ta="center">
            AI может ошибаться. Проверяй информацию в карточке.
          </Text>
        </Stack>
      </Stack>
    </Drawer>
  );
}
