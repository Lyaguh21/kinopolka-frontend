import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  account?: string;
  signIn: (account: string) => void;
  signOut: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      signIn: (account) => set({ account }),
      signOut: () => set({ account: undefined }),
    }),
    { name: "kinopolka-session", partialize: ({ account }) => ({ account }) },
  ),
);
