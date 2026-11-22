import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EpisodeLocation } from "./episodes";

interface RecentTitleState {
  lastByViewer: Record<string, string>;
  dismissed: Record<string, boolean>;
  episodeByViewer: Partial<Record<string, EpisodeLocation>>;
  remember: (viewer: string, titleId: string) => void;
  dismiss: (viewer: string, titleId: string) => void;
  rememberEpisode: (viewer: string, episode: EpisodeLocation) => void;
  dismissEpisode: (viewer: string) => void;
}

export const useRecentTitle = create<RecentTitleState>()(
  persist(
    (set) => ({
      lastByViewer: {},
      dismissed: {},
      episodeByViewer: {},
      rememberEpisode: (viewer, episode) =>
        set(({ episodeByViewer }) => ({
          episodeByViewer: { ...episodeByViewer, [viewer]: episode },
        })),
      dismissEpisode: (viewer) =>
        set(({ episodeByViewer }) => {
          const next = { ...episodeByViewer };
          delete next[viewer];
          return { episodeByViewer: next };
        }),
      remember: (viewer, titleId) =>
        set(({ lastByViewer }) => ({
          lastByViewer: { ...lastByViewer, [viewer]: titleId },
        })),
      dismiss: (viewer, titleId) =>
        set(({ dismissed, lastByViewer }) => {
          const next = { ...lastByViewer };
          if (next[viewer] === titleId) delete next[viewer];
          return {
            dismissed: { ...dismissed, [viewer]: true },
            lastByViewer: next,
          };
        }),
    }),
    {
      name: "kinopolka-recent-titles",
      partialize: ({ lastByViewer, episodeByViewer }) => ({
        lastByViewer,
        episodeByViewer,
      }),
    },
  ),
);

// New visits only change the persisted state, so prompts come from an earlier launch.
const titlesAtStartup = useRecentTitle.getState().lastByViewer;

export function recentTitleViewer(account?: string) {
  return account ? `account:${account}` : "guest";
}

export function useTitleFromPreviousLaunch(viewer: string) {
  return useRecentTitle((state) =>
    state.dismissed[viewer] ? undefined : titlesAtStartup[viewer],
  );
}
