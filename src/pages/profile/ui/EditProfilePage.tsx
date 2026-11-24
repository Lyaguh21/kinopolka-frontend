import { useQueryClient } from "@tanstack/react-query";
import { requestError } from "../../../entities/session/model/session";
import {
  Avatar,
  Box,
  Button,
  FileButton,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useProfiles } from "../../../entities/person";
import { useSession } from "../../../entities/session";
import { ActionButton, PageBody } from "../../../shared/ui";
import { RequireAccount } from "./ShelfContent";

export function EditProfilePage() {
  const account = useSession((state) => state.account);
  const profile = useProfiles((state) => state.profiles[account ?? ""]);
  const save = useProfiles((state) => state.save);
  const client = useQueryClient();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(profile?.avatar);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  if (!account) return <RequireAccount title="Редактирование профиля" />;

  async function changeAvatar(file: File | null) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setAvatarError("Выберите JPG или PNG размером до 5 МБ.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 224;
      const side = Math.min(bitmap.width, bitmap.height);
      canvas
        .getContext("2d")
        ?.drawImage(
          bitmap,
          (bitmap.width - side) / 2,
          (bitmap.height - side) / 2,
          side,
          side,
          0,
          0,
          224,
          224,
        );
      bitmap.close();
      setAvatar(canvas.toDataURL("image/webp", 0.85));
      setAvatarError("");
    } catch {
      setAvatarError("Не удалось открыть изображение.");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    if (!value("name") || !value("handle")) return;
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await save(account, {
        name: value("name"),
        handle: value("handle"),
        bio: value("bio"),
        email: value("email"),
        avatar,
      });
      await client.invalidateQueries({ queryKey: ["public-profile", account] });
      navigate("/profile");
    } catch (e) {
      setError(requestError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageBody maw={970}>
      <Title order={1} fz="clamp(1.875rem, 5vw, 2.375rem)" fw={700}>
        Редактирование профиля
      </Title>
      <Stack
        renderRoot={(props) => (
          <Box component="form" {...props} onSubmit={submit} />
        )}
        gap="lg"
      >
        <Paper bg="var(--kino-raised)" p={{ base: "md", sm: "xl" }} radius="xl">
          <Stack gap="lg">
            <Group>
              <Avatar
                src={avatar}
                alt="Фотография профиля"
                size={88}
                radius="xl"
              />
              <Stack gap="xs">
                <FileButton
                  onChange={(file) => void changeAvatar(file)}
                  accept="image/png,image/jpeg"
                >
                  {(props) => (
                    <Button {...props} variant="default">
                      Изменить фото
                    </Button>
                  )}
                </FileButton>
                <Text
                  c={avatarError ? "var(--kino-dropped)" : "dimmed"}
                  fz={13}
                >
                  {avatarError || "JPG или PNG, до 5 МБ"}
                </Text>
              </Stack>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                label="Имя"
                name="name"
                defaultValue={profile?.name ?? account}
                required
                maxLength={60}
              />
              <TextInput
                label="Никнейм"
                name="handle"
                defaultValue={profile?.handle ?? account}
                required
                maxLength={40}
              />
            </SimpleGrid>
            <Textarea
              label="О себе"
              name="bio"
              rows={4}
              defaultValue={profile?.bio}
              maxLength={400}
            />
            <TextInput
              label="Электронная почта"
              name="email"
              type="email"
              defaultValue={profile?.email}
            />
          </Stack>
        </Paper>
        <Group justify="flex-end">
          {error && <Text c="red">{error}</Text>}
          <ActionButton type="submit" disabled={busy}>
            Сохранить изменения
          </ActionButton>
          <ActionButton
            appearance="secondary"
            onClick={() => navigate("/profile")}
          >
            Отменить
          </ActionButton>
        </Group>
      </Stack>
    </PageBody>
  );
}
