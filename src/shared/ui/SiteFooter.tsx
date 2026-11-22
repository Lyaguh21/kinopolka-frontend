import { Group, Text } from "@mantine/core";
import { Link } from "react-router";
import classes from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <Group
      component="footer"
      gap="xl"
      className={classes.footer}
      fz={13}
      c="dimmed"
    >
      <Text fz="inherit" c="var(--kino-text)">
        Кинополка © 2026
      </Text>
      <Text fz="inherit">Твоё кино. На своём месте.</Text>
      <Text component={Link} to="/about" fz="inherit">
        О проекте
      </Text>
      <Text component={Link} to="/privacy" fz="inherit">
        Конфиденциальность
      </Text>
      <Text component={Link} to="/feedback" fz="inherit">
        Обратная связь
      </Text>
    </Group>
  );
}
