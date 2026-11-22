import {
  severanceEpisodes,
  severanceScores,
  type EpisodeLocation,
} from "../../../entities/title";

export interface EpisodeDetails {
  location: EpisodeLocation;
  name: string;
  minutes?: number;
  score: string;
}

export function getEpisode(
  id: string | undefined,
  season: number,
  episode: number,
): EpisodeDetails | undefined {
  const score = severanceScores[season - 1]?.[episode - 1];
  if (id !== "severance" || score === undefined) return undefined;
  const details = season === 1 ? severanceEpisodes[episode - 1] : undefined;
  return {
    location: { titleId: id, season, episode },
    name: details?.[0] ?? "Серия " + episode,
    minutes: details?.[1],
    score: score.toFixed(1),
  };
}

export const interstellar = {
  synopsis:
    "Когда Земля становится непригодной для жизни, команда исследователей отправляется сквозь червоточину в поисках нового дома для человечества. История о времени, любви и связях, которые сильнее расстояний.",
  gallery: [
    {
      name: "Официальный трейлер · 2:19",
      file: "/figma/interstellar-poster.png",
    },
    { name: "Кадры из фильма · 12", file: "/figma/interstellar-space.png" },
    { name: "За кадром", file: "/figma/interstellar-field.png" },
  ],
};
export const seriesGallery = [
  { name: "Официальный трейлер", file: "/figma/series-media.png" },
  { name: "Кадр из сериала", file: "/figma/series-still.png" },
  { name: "Постер сериала", file: "/figma/series-media.png" },
];

export function titleGallery(id: string) {
  if (id === "interstellar") return interstellar.gallery;
  if (id === "severance") return seriesGallery;
  return [];
}
