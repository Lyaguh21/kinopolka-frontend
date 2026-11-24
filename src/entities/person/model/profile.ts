import { create } from "zustand";
import { http } from "../../../shared/api/http";

export interface Profile {
  name: string;
  handle: string;
  bio: string;
  email: string;
  avatar?: string;
}

interface ProfilesState {
  profiles: Record<string, Profile>;
  load: (account: string, profile: Profile | null) => void;
  save: (account: string, profile: Profile) => Promise<void>;
}
export const useProfiles = create<ProfilesState>((set, get) => ({
  profiles: {},
  load: (account, profile) => {
    if (!profile) {
      try {
        profile =
          JSON.parse(localStorage.getItem("kinopolka-profiles") ?? "null")
            ?.state?.profiles?.[account] ?? null;
      } catch {
        /* Профиль ещё не создан */
      }
    }
    set((state) => {
      const profiles = { ...state.profiles };
      if (profile) profiles[account] = profile;
      else delete profiles[account];
      return { profiles };
    });
  },
  save: async (account, profile) => {
    const result = await http.patch<Profile>("api/me/profile", profile, {
      headers: { "X-Filmets-Account": account },
    });
    get().load(account, result.data);
  },
}));
