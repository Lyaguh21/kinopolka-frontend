import {
  Alert,
  Button,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSession } from "../../../entities/session";
import {
  TitleCard,
  useShelf,
  emptyShelf,
  excludedTitles,
  recentTitleViewer,
  useRecentTitle,
} from "../../../entities/title";
import {
  detailQuery,
  filmCard,
  similarQuery,
} from "../../../entities/title/api/catalog";
import { WatchSourcesModal } from "../../../features/watch-sources";
import { PageBody, NotFoundView } from "../../../shared/ui";
import { FilmCommunity, useFilmCommunity } from "./FilmCommunity";
import { TitleMedia } from "./TitleMedia";
import { TitleHero } from "./TitleHero";

export function CatalogFilm({ id }: { id: string }) {
  const query = useQuery(detailQuery(id));

  const account = useSession((s) => s.account);
  const community = useFilmCommunity(id, account);
  const shelf = useShelf((s) =>
    account ? (s.shelves[account] ?? emptyShelf) : emptyShelf,
  );
  const similar = useQuery(similarQuery(id, excludedTitles(shelf)));
  const entry = useShelf((s) =>
    account ? s.shelves[account]?.[id] : undefined,
  );
  const update = useShelf((s) => s.update);
  const remember = useRecentTitle((s) => s.remember);
  useEffect(() => {
    if (query.data) remember(recentTitleViewer(account), id);
  }, [account, id, query.data, remember]);
  useEffect(() => {
    if (query.data && window.location.hash === "#ratings")
      document.getElementById("ratings")?.scrollIntoView();
  }, [id, query.data]);
  const navigate = useNavigate();
  const [sources, setSources] = useState(false);
  if (query.isPending)
    return (
      <PageBody>
        <Skeleton h={420} />
      </PageBody>
    );
  if (query.isError)
    return isAxiosError(query.error) && query.error.response?.status === 404 ? (
      <NotFoundView />
    ) : (
      <PageBody>
        <Alert title="Не удалось загрузить карточку">
          <Button onClick={() => query.refetch()}>Повторить</Button>
        </Alert>
      </PageBody>
    );
  const d = query.data;
  const title = filmCard({ ...d, genres: d.genres.map((g) => g.name) });
  const regions = new Intl.DisplayNames(["ru"], { type: "region" });
  const countries = d.countries.map((c) =>
    /^[A-Z]{2}$/.test(c.iso_3166_1)
      ? (regions.of(c.iso_3166_1) ?? c.name)
      : c.name,
  );
  return (
    <PageBody>
      <TitleHero
        title={title}
        entry={entry}
        live={{
          platformAverage: community.data?.pages[0]?.average,
          overview: d.overview,
          ratings: d.externalRatings,
          backdrop: d.backdropUrl,
          metadata: [
            d.originalTitle,
            title.year,
            ...countries,
            d.runtimeMinutes && d.runtimeMinutes + " мин",
          ]
            .filter(Boolean)
            .join(" · "),
        }}
        updateEntry={(change) =>
          account
            ? update(account, id, change)
            : navigate(
                "/login-required?title=" +
                  id +
                  (change.favorite ? "&action=favorite" : ""),
              )
        }
        onWatch={() => setSources(true)}
      />
      <TitleMedia detail={d} />
      <FilmCommunity
        query={community}
        key={id + (account ?? "")}
        id={id}
        account={account}
        seasons={d.type === "series" ? d.seasons : undefined}
      />
      <Stack>
        <Title order={2}>
          Если понравился {d.type === "series" ? "этот сериал" : "этот фильм"}
        </Title>
        {similar.isPending ? (
          <Skeleton h={150} />
        ) : similar.isError ? (
          <Button onClick={() => similar.refetch()}>
            Повторить поиск похожих
          </Button>
        ) : similar.data.items.length ? (
          <SimpleGrid cols={{ base: 2, lg: 5 }}>
            {similar.data.items.map((r) => (
              <TitleCard key={r.id} title={filmCard(r)} to={"/title/" + r.id} />
            ))}
          </SimpleGrid>
        ) : (
          <Text c="dimmed">Для этого произведения пока нет похожих.</Text>
        )}
      </Stack>
      <WatchSourcesModal
        title={title}
        opened={sources}
        onClose={() => setSources(false)}
      />
    </PageBody>
  );
}
