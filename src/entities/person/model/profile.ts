import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Profile {
  name: string;
  handle: string;
  bio: string;
  email: string;
  avatar?: string;
}

interface ProfilesState {
  profiles: Record<string, Profile>;
  save: (account: string, profile: Profile) => void;
}

export const useProfiles = create<ProfilesState>()(
  persist(
    (set) => ({
      profiles: {},
      save: (account, profile) =>
        set(({ profiles }) => ({
          profiles: { ...profiles, [account]: profile },
        })),
    }),
    { name: "kinopolka-profiles" },
  ),
);
