import {
  Alert,
  Button,
  Image,
  Pagination,
  Select,
  SimpleGrid,
  Skeleton,
  Text,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useParams } from "react-router";
import { TitleCard } from "../../entities/title";
import { personQuery, filmCard } from "../../entities/title/api/catalog";
import { PageBody, NotFoundView } from "../../shared/ui";

export function CatalogPerson() {
  const { id = "" } = useParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const query = useQuery({
    ...personQuery(id, page, sort),
    enabled: /^[1-9]\d*$/.test(id),
  });
  if (!/^[1-9]\d*$/.test(id)) return <NotFoundView />;
  if (query.isPending)
    return (
      <PageBody>
        <Skeleton h={320} />
      </PageBody>
    );
  if (query.isError)
    return isAxiosError(query.error) && query.error.response?.status === 404 ? (
      <NotFoundView />
    ) : (
      <PageBody>
        <Alert title="Не удалось загрузить страницу">
          <Button onClick={() => query.refetch()}>Повторить</Button>
        </Alert>
      </PageBody>
    );
  const p = query.data;
  return (
    <PageBody>
      <Title>{p.name}</Title>
      {p.profileUrl && (
        <Image src={p.profileUrl} w={180} radius="md" alt={p.name} />
      )}
      {p.biography && <Text maw={900}>{p.biography}</Text>}
      <Title order={2}>Фильмография в каталоге · {p.filmography.total}</Title>
      <Select
        aria-label="Сортировать фильмографию"
        w={220}
        value={sort}
        data={[
          { value: "newest", label: "Сначала новые" },
          { value: "oldest", label: "Сначала старые" },
          { value: "rating", label: "По рейтингу" },
        ]}
        allowDeselect={false}
        onChange={(value) => {
          if (value) {
            setSort(value);
            setPage(1);
          }
        }}
      />
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }}>
        {p.filmography.items.map((r) => (
          <TitleCard key={r.id} title={filmCard(r)} to={"/title/" + r.id} />
        ))}
      </SimpleGrid>
      {p.filmography.total > 20 && (
        <Pagination
          total={Math.ceil(p.filmography.total / 20)}
          value={page}
          onChange={setPage}
        />
      )}
    </PageBody>
  );
}
