export const severanceEpisodes = [
  ["Хорошие новости об аде", 57],
  ["Полупетля", 53],
  ["Вечность", 56],
  ["Тот, кто ты есть", 46],
  ["Мрачная жестокость оптики и дизайна", 43],
  ["Прятки", 40],
  ["Дерзкий джаз", 49],
  ["Что на ужин?", 46],
  ["Мы такие, какими должны быть", 40],
] as const;

export const severanceDescription =
  "Сотрудники корпорации Lumon проходят процедуру, которая разделяет их рабочие и личные воспоминания. Но идеальный баланс оказывается опасной иллюзией.";

export const severanceScores = [
  [8.5, 8.3, 8.4, 8.6, 8.7, 8.5, 9.0, 9.1, 9.7],
  [8.4, 8.2, 8.5, 9.1, 8.3, 8.6, 9.0, 8.7, 8.9, 9.5],
];

export function episodeHref(season: number, episode: number) {
  return `/title/severance/episodes/${episode}${season === 2 ? "?season=2" : ""}`;
}
export interface EpisodeLocation {
  titleId: string;
  season: number;
  episode: number;
}

export function nextEpisode(
  current: EpisodeLocation | undefined,
): EpisodeLocation | undefined {
  if (!current || current.titleId !== "severance") return undefined;

  const thisSeason = severanceScores[current.season - 1];
  if (!thisSeason || thisSeason[current.episode - 1] === undefined)
    return undefined;
  if (current.episode < thisSeason.length)
    return { ...current, episode: current.episode + 1 };
  if (severanceScores[current.season])
    return { ...current, season: current.season + 1, episode: 1 };
  return undefined;
}
