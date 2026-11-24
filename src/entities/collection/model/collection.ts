import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { http } from "../../../shared/api/http";
import { useSession } from "../../session";
export interface Collection {
  id: string;
  saved?: boolean;
  local?: boolean;
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

export function useCollectionData() {
  const account = useSession((s) => s.account);
  return useQuery({
    queryKey: ["collections", account ?? null],
    queryFn: async ({ signal }) =>
      (await http.get<Collection[]>("api/collections", { signal })).data,
  });
}
function localDrafts(account?: string): Collection[] {
  if (!account) return [];
  try {
    const items = JSON.parse(
      localStorage.getItem("kinopolka-created-collections") ?? "null",
    )?.state?.created;
    return Array.isArray(items)
      ? items
          .filter((c) => c?.owner === account && Array.isArray(c.titles))
          .map((c) => ({ ...c, local: true }))
      : [];
  } catch {
    return [];
  }
}
export function useCollectionBookmark(account?: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (c: Collection) =>
      http.patch(
        "api/collections/" + c.id + "/bookmark",
        { saved: !c.saved },
        { headers: { "X-Filmets-Account": account } },
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: ["collections"] }),
  });
}
export function useCollections() {
  const account = useSession((s) => s.account);
  const records = useCollectionData();
  const rows = records.data ?? [];
  return {
    items: [
      ...rows.map((c) => ({ ...c, count: formatFilmCount(c.titles.length) })),
      ...localDrafts(account),
    ],
    pending: records.isPending,
    error: records.isError,
  };
}

export function useCreateCollection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (draft: NewCollection) =>
      (
        await http.post<{ id: string }>(
          "api/collections",
          {
            name: draft.name,
            description: draft.description,
            titles: draft.titles,
          },
          { headers: { "X-Filmets-Account": draft.owner } },
        )
      ).data.id,
    onSuccess: () => client.invalidateQueries({ queryKey: ["collections"] }),
  });
}

export function collectionAuthorPath(collection: Collection, account?: string) {
  if (collection.authorId) return "/profiles/" + collection.authorId;
  if (collection.owner && collection.owner === account) return "/profile";
  return collection.owner ? "/profiles/" + collection.owner : undefined;
}
