import {
  ActionIcon,
  Box,
  Group,
  Image,
  Kbd,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconBookmark, IconChevronDown, IconSearch } from "@tabler/icons-react";
import { Link, NavLink } from "react-router";
import { AccountMenu } from "./AccountMenu";
import classes from "./SiteHeader.module.css";

interface SiteHeaderProps {
  account?: string;
  onSearch: () => void;
  onSignOut?: () => void;
}

export function SiteHeader({ account, onSearch, onSignOut }: SiteHeaderProps) {
  return (
    <Box component="header" className={classes.header}>
      <Box component={Link} to="/" aria-label="Кинополка — главная">
        <Image
          src="/figma/logo.svg"
          alt="Кинополка"
          w={{ base: 160, sm: 210 }}
          h={{ base: 37, sm: 48 }}
          fit="contain"
        />
      </Box>
      <Group
        component="nav"
        aria-label="Основная навигация"
        gap={28}
        className={classes.navigation}
        visibleFrom="sm"
      >
        <NavLink to="/" end>
          Главная
        </NavLink>
        <NavLink to="/catalog">Каталог</NavLink>
        <NavLink to="/collections">Подборки</NavLink>
      </Group>
      <Group gap="sm" wrap="nowrap" className={classes.actions}>
        <UnstyledButton
          className={classes.search}
          onClick={onSearch}
          aria-label="Открыть поиск"
          aria-keyshortcuts="Control+k Meta+k"
        >
          <IconSearch
            size={20}
            aria-hidden
            className={classes.desktopSearchIcon}
          />
          <Image
            src="/figma/mobile-search.svg"
            alt=""
            w={20}
            h={20}
            hiddenFrom="sm"
          />
          <Text component="span" fz={14} className={classes.searchText}>
            Поиск
          </Text>
          <Kbd className={classes.shortcut}>⌘ K</Kbd>
        </UnstyledButton>
        <ActionIcon
          component={Link}
          to="/shelf"
          className={classes.bookmark}
          size={44}
          radius="lg"
          aria-label="Моя полка"
          visibleFrom="sm"
        >
          <IconBookmark size={24} aria-hidden />
        </ActionIcon>
        {account ? (
          <AccountMenu
            onSignOut={onSignOut}
            trigger={
              <UnstyledButton
                type="button"
                className={classes.account}
                aria-label={`Меню аккаунта ${account}`}
                visibleFrom="sm"
              >
                <Image
                  src="/figma/avatar.png"
                  alt=""
                  w={40}
                  h={40}
                  radius="xl"
                />
                <Text
                  component="span"
                  className={classes.accountName}
                  fz={15}
                  fw={600}
                >
                  {account}
                </Text>
                <IconChevronDown
                  size={15}
                  className={classes.accountChevron}
                  aria-hidden
                />
              </UnstyledButton>
            }
          />
        ) : (
          <Box
            component={Link}
            to="/login"
            className={classes.account}
            visibleFrom="sm"
          >
            <Text fz={15} fw={600}>
              Войти
            </Text>
          </Box>
        )}
      </Group>
    </Box>
  );
}
