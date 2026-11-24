import {
  Anchor,
  Box,
  Button,
  Group,
  Image,
  Modal,
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
import type { Detail } from "../../../entities/title/api/catalog";
import classes from "./FilmPage.module.css";

export function TitleMedia({ detail: d }: { detail: Detail }) {
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [showCast, setShowCast] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const reduceMotion = useReducedMotion();
  const { backdrops, trailer } = d.media;
  const images = backdrops.map((item, i) => ({
    src: item.url,
    alt: `«${d.title}» · кадр ${i + 1}`,
    caption: `${i + 1} / ${backdrops.length}`,
  }));
  const directors = d.creators.filter((p) => p.jobs.includes("Director"));
  const writers = d.creators.filter((p) =>
    p.jobs.some((j) =>
      ["Writer", "Screenplay", "Story", "Teleplay"].includes(j),
    ),
  );
  const leads = d.cast.items;
  const people = (list: typeof directors, limit: number) =>
    list.slice(0, limit).map((p, i) => (
      <span key={p.personId}>
        {i > 0 && " · "}
        <Anchor component={Link} to={"/people/" + p.personId} c="inherit">
          {p.name}
        </Anchor>
      </span>
    ));
  const series = d.seriesCreators.filter((p) => p.name);
  const trailerLabel =
    trailer?.type === "Teaser"
      ? "Тизер"
      : trailer?.official
        ? "Официальный трейлер"
        : "Трейлер";
  const fallbackPreview = d.backdropUrl ?? d.posterUrl ?? undefined;
  const preview = trailer?.key
    ? "https://i.ytimg.com/vi/" +
      encodeURIComponent(trailer.key) +
      "/hqdefault.jpg"
    : fallbackPreview;
  return (
    <>
      {directors.length + leads.length + writers.length + series.length > 0 && (
        <Stack component="section" gap="lg">
          <Group justify="space-between">
            <Title order={2}>Создатели и актёры</Title>
            {(leads.length > 0 || d.creators.length > 2) && (
              <Button
                variant="subtle"
                size="compact-sm"
                onClick={() => setShowCast(true)}
              >
                Смотреть состав →
              </Button>
            )}
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            {(series.length > 0 || directors.length > 0) && (
              <Stack gap="xs">
                <Text c="dimmed" fz={13}>
                  {series.length ? "Создатели сериала" : "Режиссёр"}
                </Text>
                <Text c="var(--kino-accent)">
                  {series.length
                    ? series
                        .slice(0, 2)
                        .map((p) => p.name)
                        .join(" · ")
                    : people(directors, 2)}
                </Text>
              </Stack>
            )}
            {!!leads.length && (
              <Stack gap="xs">
                <Text c="dimmed" fz={13}>
                  В главных ролях
                </Text>
                <Text>{people(leads, 2)}</Text>
              </Stack>
            )}
            {!!writers.length && (
              <Stack gap="xs">
                <Text c="dimmed" fz={13}>
                  Сценарий
                </Text>
                <Text>{people(writers, 2)}</Text>
              </Stack>
            )}
          </SimpleGrid>
        </Stack>
      )}
      <Modal
        opened={showCast}
        onClose={() => setShowCast(false)}
        title="Создатели и актёры"
        size="xl"
      >
        <Stack>
          {!!leads.length && (
            <SimpleGrid cols={{ base: 2, sm: 4 }}>
              {leads.map((p) => (
                <Anchor
                  component={Link}
                  key={p.personId}
                  to={"/people/" + p.personId}
                >
                  {p.profileUrl && (
                    <Image
                      src={p.profileUrl}
                      alt=""
                      loading="lazy"
                      radius="md"
                      style={{ aspectRatio: "2/3", objectPosition: "top" }}
                    />
                  )}
                  {p.name}
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {p.characters.slice(0, 2).join(" · ")}
                  </Text>
                </Anchor>
              ))}
            </SimpleGrid>
          )}
          {!!d.creators.length && (
            <Stack gap="xs">
              <Title order={3}>Съёмочная группа</Title>
              <Text>{people(d.creators, d.creators.length)}</Text>
            </Stack>
          )}
        </Stack>
      </Modal>
      {(trailer || images.length > 0) && (
        <Stack component="section" gap="lg">
          <Title order={2}>Трейлер и кадры</Title>
          <Box className={classes.gallery}>
            {trailer && (
              <button
                type="button"
                className={classes.galleryButton}
                onClick={() => setShowTrailer(true)}
              >
                {preview && (
                  <Image
                    src={preview}
                    fallbackSrc={fallbackPreview}
                    alt=""
                    className={classes.galleryImage}
                    radius="lg"
                  />
                )}
                <Text mt="xs" size="sm">
                  <IconPlayerPlay
                    size={15}
                    className={classes.playIcon}
                    color="var(--kino-accent)"
                  />
                  {trailerLabel}
                </Text>
              </button>
            )}
            {images.slice(0, trailer ? 2 : 3).map((img, i) => (
              <button
                key={img.src}
                className={classes.galleryButton}
                type="button"
                onClick={() => setGalleryIndex(i)}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  className={classes.galleryImage}
                  radius="lg"
                />
                <Text mt="xs" size="sm" c="dimmed">
                  {i === (trailer ? 1 : 2) && images.length > i + 1
                    ? "Все кадры · " + images.length
                    : "Кадр " + (i + 1)}
                </Text>
              </button>
            ))}
          </Box>
        </Stack>
      )}
      {galleryIndex !== null && (
        <Lightbox
          opened
          onClose={() => setGalleryIndex(null)}
          images={images}
          slidesProps={{ initialSlide: galleryIndex }}
          transitionProps={{ duration: reduceMotion ? 0 : 160 }}
        />
      )}
      {trailer && (
        <Modal
          opened={showTrailer}
          onClose={() => setShowTrailer(false)}
          title={trailer.name}
          size="xl"
        >
          {showTrailer && (
            <iframe
              title={trailer.name}
              width="100%"
              style={{ aspectRatio: "16/9", border: 0 }}
              src={trailer.embedUrl}
              allowFullScreen
            />
          )}
          <Anchor href={trailer.watchUrl} target="_blank" rel="noreferrer">
            Открыть на YouTube
          </Anchor>
        </Modal>
      )}
    </>
  );
}
