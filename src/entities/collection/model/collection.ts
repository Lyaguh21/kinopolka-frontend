import { create } from "zustand";
import { persist } from "zustand/middleware";
import { editorialAndDemoCollections } from "./demoCollections";

export interface Collection {
  id: string;
  name: string;
  description?: string;
  titles: string[];
  count: string;
  author: string;
  authorId?: string;
  owner?: string;
  avatar?: string;
  cover: string;
  initialSaves: number;
}

type NewCollection = Omit<Collection, "id" | "count" | "initialSaves">;

interface CollectionsState {
  created: Collection[];
  add: (draft: NewCollection) => string;
}

const filmPlural = new Intl.PluralRules("ru");
const filmNoun = { one: "фильм", few: "фильма", many: "фильмов" };

export function formatFilmCount(count: number) {
  const category = filmPlural.select(count);
  const noun =
    category === "one" || category === "few"
      ? filmNoun[category]
      : filmNoun.many;
  return count + " " + noun;
}

const useCollectionsState = create<CollectionsState>()(
  persist(
    (set) => ({
      created: [],
      add: (draft) => {
        const random = crypto.getRandomValues(new Uint32Array(4));
        const id =
          "collection-" +
          Array.from(random, (part) => part.toString(16).padStart(8, "0")).join(
            "",
          );
        const collection = {
          ...draft,
          id,
          initialSaves: 0,
          count: formatFilmCount(draft.titles.length),
        };
        set(({ created }) => ({ created: [collection, ...created] }));
        return id;
      },
    }),
    { name: "kinopolka-created-collections" },
  ),
);

export function useCollections() {
  const created = useCollectionsState((state) => state.created);
  return [...created, ...editorialAndDemoCollections];
}

export function useCreateCollection() {
  return useCollectionsState((state) => state.add);
}

export function collectionAuthorPath(collection: Collection, account?: string) {
  if (collection.authorId) return "/profiles/" + collection.authorId;
  if (collection.owner && collection.owner === account) return "/profile";
  return undefined;
}
