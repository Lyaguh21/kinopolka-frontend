import { Menu } from "@mantine/core";
import { IconLogout, IconUser, IconUsers } from "@tabler/icons-react";
import type { ReactElement } from "react";
import { Link } from "react-router";
import classes from "./SiteHeader.module.css";

export function AccountMenu({
  trigger,
  onSignOut,
  mobile = false,
}: {
  trigger: ReactElement;
  onSignOut?: () => void;
  mobile?: boolean;
}) {
  return (
    <Menu
      position={mobile ? "top-end" : "bottom-end"}
      width={184}
      offset={10}
      classNames={{ dropdown: classes.accountMenu }}
    >
      <Menu.Target>{trigger}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          to="/profile"
          leftSection={<IconUser size={17} aria-hidden />}
        >
          Профиль
        </Menu.Item>
        <Menu.Item
          component={Link}
          to="/profile/friends"
          leftSection={<IconUsers size={17} aria-hidden />}
        >
          Друзья
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="coral"
          disabled={!onSignOut}
          onClick={onSignOut}
          leftSection={<IconLogout size={17} aria-hidden />}
        >
          Выйти
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
