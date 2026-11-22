import { Image, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

export function EmptyState({
  message,
  action,
  compact = false,
  illustration = "/illustrations/empty-shelf.png",
  imageSize = compact ? 72 : 144,
}: {
  message: string;
  action?: ReactNode;
  compact?: boolean;
  illustration?: string;
  imageSize?: number;
}) {
  return (
    <Stack
      align="center"
      gap="xs"
      py={compact ? "sm" : "xl"}
      px="md"
      ta="center"
    >
      <Image
        src={illustration}
        alt=""
        w={imageSize}
        h={imageSize}
        maw="100%"
        fit="contain"
      />
      <Text c="dimmed" fz={compact ? 14 : 16}>
        {message}
      </Text>
      {action}
    </Stack>
  );
}
