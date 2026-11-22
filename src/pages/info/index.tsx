import { Anchor, Text, Title } from "@mantine/core";
import { Link } from "react-router";
import { PageBody } from "../../shared/ui";

export function InfoPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <PageBody>
      <Title order={1}>{title}</Title>
      {description && <Text c="dimmed">{description}</Text>}
      <Anchor component={Link} to="/">
        На главную
      </Anchor>
    </PageBody>
  );
}
