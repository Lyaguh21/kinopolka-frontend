import { Avatar, Box, Group, Stack, UnstyledButton } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { Link, NavLink, useLocation } from "react-router";
import { AccountMenu } from "./AccountMenu";
import classes from "./MobileNavigation.module.css";

const links = [
  { to: "/", label: "Главная", icon: "home" },
  { to: "/catalog", label: "Каталог", icon: "catalog" },
  { to: "/collections", label: "Подборки", icon: "collections" },
  { to: "/shelf", label: "Моя полка", icon: "bookmark" },
] as const;

export function MobileNavigation({
  account,
  onSignOut,
}: {
  account?: string;
  onSignOut: () => void;
}) {
  const { pathname } = useLocation();
  const inCatalog = /^\/(title|people)\//.test(pathname);
  const inAccount = /^\/profiles?(?:\/|$)/.test(pathname);

  return (
    <Stack
      component="nav"
      aria-label="Мобильная навигация"
      className={classes.nav}
      hiddenFrom="sm"
    >
      <Group grow wrap="nowrap" gap={2} w="100%">
        {links.map(({ to, label, icon }) => (
          <Box
            component={NavLink}
            key={to}
            to={to}
            end={to === "/"}
            aria-label={label}
            className={classes.item}
            data-active={to === "/catalog" && inCatalog}
          >
            <Box
              component="span"
              aria-hidden
              className={classes.icon}
              style={{ maskImage: `url(/figma/mobile-${icon}.svg)` }}
            />
          </Box>
        ))}
        {account ? (
          <AccountMenu
            mobile
            onSignOut={onSignOut}
            trigger={
              <UnstyledButton
                className={classes.item}
                type="button"
                data-active={inAccount}
                aria-label={`Меню аккаунта ${account}`}
              >
                <Avatar
                  src="/figma/mobile-avatar.png"
                  alt=""
                  size={26}
                  radius="xl"
                />
              </UnstyledButton>
            }
          />
        ) : (
          <Box
            component={Link}
            to="/login"
            className={classes.item}
            aria-label="Войти"
          >
            <IconUser size={24} aria-hidden />
          </Box>
        )}
      </Group>
      <Box className={classes.homeIndicator} aria-hidden />
    </Stack>
  );
}
