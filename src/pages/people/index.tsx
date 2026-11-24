import { Alert, Button, Skeleton } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Navigate } from "react-router";
import { personIdQuery } from "../../entities/title/api/catalog";
import { NotFoundView, PageBody } from "../../shared/ui";

// Старые ссылки ведут на именную страницу. TMDB ID сохраняется при повторном импорте.
export function DirectorPage() {
  const query = useQuery(personIdQuery(525));
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
        <Alert title="Не удалось открыть страницу режиссёра">
          <Button onClick={() => query.refetch()}>Повторить</Button>
        </Alert>
      </PageBody>
    );
  return <Navigate replace to={"/people/" + query.data.id} />;
}
