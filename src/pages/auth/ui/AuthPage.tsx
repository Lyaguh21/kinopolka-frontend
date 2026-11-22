import {
  Box,
  Image,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useSession } from "../../../entities/session";
import { useShelf } from "../../../entities/title";
import { ActionButton } from "../../../shared/ui";
import classes from "./AuthPage.module.css";

const nicknameHint = "Только строчные латинские буквы и знак _.";

export function AuthPage({ registration = false }: { registration?: boolean }) {
  const [error, setError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();
  const signIn = useSession((state) => state.signIn);
  const updateShelf = useShelf((state) => state.update);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rawAccount = String(data.get("account") ?? "");
    const account = registration ? rawAccount : rawAccount.trim();
    if (registration && !/^[a-z_]+$/.test(account)) {
      setNicknameError(nicknameHint);
      return;
    }
    if (!account) {
      setError("Введите логин");
      return;
    }
    if (registration && data.get("password") !== data.get("confirmation")) {
      setError("Пароли не совпадают");
      return;
    }
    signIn(account);
    if (typeof state?.favorite === "string")
      updateShelf(account, state.favorite, { favorite: true });
    const returnTo =
      typeof state?.returnTo === "string" &&
      /^\/(catalog|collections\/new|profile\/friends|title\/[a-z0-9-]+)$/.test(
        state.returnTo,
      )
        ? state.returnTo
        : "/";
    navigate(returnTo, { replace: true });
  }

  return (
    <Box component="main" className={classes.layout}>
      <Stack className={classes.illustration} gap="xl">
        <Text component={Link} to="/" c="var(--kino-accent)" fz={12} fw={600}>
          КИНОПОЛКА
        </Text>
        <Title order={1} fw={700} className={classes.slogan}>
          Твоё кино.
          <br />
          На твоей полке.
        </Title>
        <Box className={classes.ticket}>
          <Image src="/figma/ticket.svg" alt="" />
        </Box>
      </Stack>
      <Paper className={classes.panel}>
        <Stack
          renderRoot={(props) => (
            <Box
              component="form"
              {...props}
              onSubmit={submit}
              onInput={() => setError("")}
            />
          )}
          gap={18}
        >
          <Title order={2} fz={32} fw={700}>
            {registration ? "Регистрация" : "С возвращением"}
          </Title>
          <Text c="dimmed" fz={15}>
            {registration
              ? "Создай аккаунт и погрузись в мир кино"
              : "Войди, чтобы продолжить свою киноисторию."}
          </Text>
          <TextInput
            name="account"
            label={registration ? "Никнейм" : "Логин"}
            placeholder={registration ? "Придумайте никнейм" : "Введите логин"}
            description={
              registration && !nicknameError ? nicknameHint : undefined
            }
            error={nicknameError}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            onChange={() => setNicknameError("")}
            required
            classNames={{ input: classes.field, label: classes.label }}
          />
          <PasswordInput
            name="password"
            label="Пароль"
            placeholder={registration ? "Придумайте пароль" : "Введите пароль"}
            autoComplete={registration ? "new-password" : "current-password"}
            required
            classNames={{ input: classes.field, label: classes.label }}
          />
          {registration && (
            <PasswordInput
              name="confirmation"
              label="Повторите пароль"
              placeholder="Введите пароль ещё раз"
              autoComplete="new-password"
              required
              classNames={{ input: classes.field, label: classes.label }}
            />
          )}
          {error && (
            <Text role="alert" c="var(--kino-dropped)" fz={14}>
              {error}
            </Text>
          )}
          <ActionButton type="submit" fullWidth>
            {registration ? "Создать аккаунт" : "Войти"}
          </ActionButton>
          {registration && (
            <Text c="dimmed" fz={12}>
              Принимаю условия использования и политику конфиденциальности
            </Text>
          )}
          <Text
            component={Link}
            to={registration ? "/login" : "/register"}
            state={state}
            ta="center"
            c="var(--kino-accent)"
            fz={14}
          >
            {registration
              ? "Уже есть аккаунт? Войти →"
              : "Нет аккаунта? Зарегистрироваться →"}
          </Text>
        </Stack>
      </Paper>
    </Box>
  );
}
