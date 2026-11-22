import { Flex } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router";
import { useSession } from "../entities/session";
import { TitleSearch } from "../features/title-search";
import { AuthPage, AuthRequiredPage } from "../pages/auth";
import { HomePage } from "../pages/home";
import { UiKitPage } from "../pages/ui-kit";
import { CatalogPage } from "../pages/catalog";
import { FilmPage } from "../pages/film";
import {
  CollectionPage,
  CollectionsPage,
  CreateCollectionPage,
} from "../pages/collections";
import { EditProfilePage, ProfilePage, ShelfPage } from "../pages/profile";
import { FriendsPage } from "../pages/friends";
import { InfoPage } from "../pages/info";
import { DirectorPage } from "../pages/people";
import { NotFoundView, SiteFooter } from "../shared/ui";
import { AppLayout } from "./ui/AppLayout";

function StandaloneLayout() {
  return (
    <Flex direction="column" mih="100svh">
      <Flex flex={1} direction="column">
        <Outlet />
      </Flex>
      <SiteFooter />
    </Flex>
  );
}

export function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const account = useSession((state) => state.account);
  const { pathname, hash } = useLocation();
  const openSearch = () => setSearchOpen(true);

  useHotkeys([["mod+K", openSearch]]);
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <Routes>
        <Route element={<StandaloneLayout />}>
          <Route path="/ui-kit" element={<UiKitPage onSearch={openSearch} />} />
          <Route path="/login" element={<AuthPage key="login" />} />
          <Route
            path="/register"
            element={<AuthPage key="register" registration />}
          />
        </Route>
        <Route element={<AppLayout onSearch={openSearch} />}>
          <Route index element={<HomePage account={account} />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/title/:id" element={<FilmPage key={pathname} />} />
          <Route
            path="/title/:id/episodes/:episode"
            element={<FilmPage key={pathname} />}
          />
          <Route path="/people/christopher-nolan" element={<DirectorPage />} />
          <Route path="/login-required" element={<AuthRequiredPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/new" element={<CreateCollectionPage />} />
          <Route path="/collections/:id" element={<CollectionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/friends" element={<FriendsPage />} />
          <Route
            path="/profile/history"
            element={<ShelfPage key="history" history />}
          />
          <Route path="/profiles/anna" element={<ProfilePage other />} />
          <Route path="/profiles/alex" element={<ProfilePage alex />} />
          <Route path="/profiles/:personId/friends" element={<FriendsPage />} />
          <Route
            path="/profiles/anna/shelf"
            element={<ShelfPage key="anna-shelf" other />}
          />
          <Route
            path="/profiles/anna/history"
            element={<ShelfPage key="anna-history" other history />}
          />
          <Route path="/shelf" element={<ShelfPage />} />
          <Route
            path="/about"
            element={
              <InfoPage
                title="О проекте"
                description="Кинополка помогает находить кино и собирать свою коллекцию фильмов, сериалов и аниме."
              />
            }
          />
          <Route
            path="/privacy"
            element={
              <InfoPage
                title="Конфиденциальность"
                description="Данные демонстрационной полки хранятся в этом браузере."
              />
            }
          />
          <Route
            path="/feedback"
            element={
              <InfoPage
                title="Обратная связь"
                description="Форма обратной связи появится после подключения сервиса отправки сообщений."
              />
            }
          />
          <Route path="*" element={<NotFoundView />} />
        </Route>
      </Routes>
      <TitleSearch opened={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
