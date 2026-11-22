import {
  Anchor,
  Box,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Lightbox } from "@mantine-bites/lightbox";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useReducedMotion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { trailerSearchUrl, type FilmTitle } from "../../../entities/title";
import { titleGallery } from "../model/titleDetails";
import classes from "./FilmPage.module.css";

export function TitleMedia({ title }: { title: FilmTitle }) {
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const isInterstellar = title.id === "interstellar";
  const isSeverance = title.id === "severance";
  const gallery = titleGallery(title.id);
  const galleryImages = gallery
    .slice(1)
    .map(({ name, file }) => ({ src: file, alt: name, caption: name }));

  if (!gallery.length) return null;
  return (
    <>
      <Stack component="section" gap="lg">
        <Title order={2}>Создатели и актёры</Title>
        <SimpleGrid
          cols={{ base: 1, sm: 3 }}
          className={isSeverance ? classes.seriesCast : undefined}
        >
          {(isInterstellar
            ? [
                ["Режиссёр", "Кристофер Нолан"],
                ["В главных ролях", "Мэттью Макконахи · Энн Хэтэуэй"],
                ["Сценарий", "Джонатан и Кристофер Нолан"],
              ]
            : [
                ["Режиссёр", "Бен Стиллер"],
                [
                  "В главных ролях",
                  "Адам Скотт · Бритт Лауэр · Патриша Аркетт",
                ],
                ["Создатель", "Дэн Эриксон"],
              ]
          ).map(([label, value]) => (
            <Stack key={label} gap="sm">
              <Text c="dimmed" fz={13}>
                {label}
              </Text>
              {isInterstellar && label === "Режиссёр" ? (
                <Anchor component={Link} to="/people/christopher-nolan">
                  {value} →
                </Anchor>
              ) : (
                <Text
                  c={label === "Режиссёр" ? "var(--kino-accent)" : undefined}
                >
                  {value}
                </Text>
              )}
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>
      <Stack component="section" gap="lg">
        <Title order={2}>Трейлер и кадры</Title>
        <Box className={classes.gallery}>
          {gallery.map(({ name, file }, index) => (
            <Stack
              key={name}
              renderRoot={(props) =>
                index === 0 ? (
                  <Box
                    component="a"
                    {...props}
                    href={trailerSearchUrl(title)}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ) : (
                  <Box
                    component="button"
                    {...props}
                    type="button"
                    onClick={() => setGalleryIndex(index - 1)}
                  />
                )
              }
              className={classes.galleryButton}
              gap="sm"
            >
              <Box
                w="100%"
                className={
                  isSeverance && index === 1 ? classes.shadedStill : undefined
                }
              >
                <Image
                  src={file}
                  className={classes.galleryImage}
                  radius="lg"
                  alt=""
                />
              </Box>
              <Text fz={14} c={index === 0 ? undefined : "dimmed"}>
                {index === 0 && (
                  <IconPlayerPlay
                    size={15}
                    color="var(--kino-accent)"
                    className={classes.playIcon}
                  />
                )}
                {name}
              </Text>
            </Stack>
          ))}
        </Box>
      </Stack>
      <Lightbox
        opened={galleryIndex !== null}
        onClose={() => setGalleryIndex(null)}
        images={galleryImages}
        slidesProps={{ initialSlide: galleryIndex ?? 0 }}
        transitionProps={{ duration: reduceMotion ? 0 : 160 }}
      />
    </>
  );
}
