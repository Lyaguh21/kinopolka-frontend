const heroes = [
  {
    id: "interstellar",
    name: "Интерстеллар",
    category: "Фантастика",
    year: "2014",
    rating: "8.6",
    duration: "2 ч 49 мин",
    age: "12+",
    heading: ["На закутках", "вселенной"],
    description: [
      "За пределами галактики — о самом близком.",
      "Открой фильм, который останется с тобой.",
    ],
  },
  {
    id: "dune",
    name: "Дюна: Часть вторая",
    category: "Фантастика",
    year: "2024",
    rating: "8.5",
    duration: "2 ч 46 мин",
    age: "16+",
    heading: ["За гранью", "знакомого мира."],
    description: [
      "Пески Арракиса скрывают больше, чем кажется.",
      "Продолжи путешествие Пола Атрейдеса.",
    ],
  },
  {
    id: "arrival",
    name: "Прибытие",
    category: "Фантастика",
    year: "2016",
    rating: "8.0",
    duration: "1 ч 56 мин",
    age: "16+",
    heading: ["Услышать чужих.", "Понять себя."],
    description: [
      "Первый контакт меняет всё, что мы знали о мире.",
      "История о языке, времени и человеческой связи.",
    ],
  },
  {
    id: "severance",
    name: "Разделение",
    category: "Сериал",
    year: "2022–…",
    rating: "8.7",
    duration: "2 сезона",
    age: "18+",
    heading: ["Работа — отдельно.", "Жизнь — отдельно."],
    description: [
      "Идеальный баланс работы и жизни?",
      "У корпорации Lumon есть свой ответ.",
    ],
  },
] as const;

const storageKey = "kinopolka-featured-hero";

function selectHero() {
  try {
    const previous = sessionStorage.getItem(storageKey);
    const previousIndex = heroes.findIndex(({ id }) => id === previous);
    return heroes[(previousIndex + 1) % heroes.length];
  } catch {
    return heroes[Math.floor(Math.random() * heroes.length)];
  }
}

// Use one selection for the entire document, including client-side navigation.
export const featuredHero = selectHero();

export function rememberFeaturedHero() {
  try {
    sessionStorage.setItem(storageKey, featuredHero.id);
  } catch {
    // The banner still renders when the browser blocks storage.
  }
}
