import { Stack, type StackProps } from "@mantine/core";

export function PageBody(props: StackProps) {
  return (
    <Stack
      component="main"
      mx="auto"
      w="100%"
      maw={1440}
      px={{ base: "md", sm: "xl", lg: 64 }}
      pt={{ base: 24, sm: 32, lg: 48 }}
      pb={{ base: 40, lg: 56 }}
      gap="xl"
      {...props}
    />
  );
}
