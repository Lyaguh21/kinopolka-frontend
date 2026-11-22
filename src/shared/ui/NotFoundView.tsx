import { Group, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";
import { ActionButton } from "./ActionButton";
import classes from "./NotFoundView.module.css";

export function NotFoundView() {
  return (
    <Stack
      component="main"
      className={classes.page}
      align="center"
      justify="center"
      gap="lg"
      ta="center"
    >
      <Text component="p" className={classes.number} aria-hidden="true">
        404
      </Text>
      <Stack gap="md" align="center">
        <Title order={1} fw={700} className={classes.title}>
          Кажется, эта сцена пропала
        </Title>
        <Text c="dimmed" lh="25px" maw={560}>
          Такой страницы нет — возможно, ссылка устарела
          <br className={classes.lineBreak} /> или в адресе закралась опечатка.
          Но хорошее кино где-то рядом.
        </Text>
      </Stack>
      <Group gap="sm" justify="center" pt="xs">
        <ActionButton
          w={208}
          renderRoot={(props) => <Link {...props} to="/" />}
        >
          На главную
        </ActionButton>
        <ActionButton
          w={208}
          appearance="secondary"
          renderRoot={(props) => <Link {...props} to="/catalog" />}
        >
          В каталог
        </ActionButton>
      </Group>
    </Stack>
  );
}
