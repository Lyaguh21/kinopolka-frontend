import { create } from "zustand";
import { isAxiosError } from "axios";
import { http } from "../../../shared/api/http";
import { useShelf, type ShelfEntry } from "../../title/model/shelf";

export function requestError(error: unknown) {
  const msg = isAxiosError(error) ? error.response?.data?.message : undefined;
  return typeof msg === "string"
    ? msg
    : "Не удалось связаться с базой. Попробуй ещё раз.";
}
interface SessionState {
  admin?: boolean;
  account?: string;
  ready: boolean;
  error?: string;
  restore: () => Promise<void>;
  signIn: (
    nickname: string,
    password: string,
    register: boolean,
  ) => Promise<void>;
  signOut: () => Promise<boolean>;
}
import { useProfiles, type Profile } from "../../person/model/profile";
let version = 0;
export const useSession = create<SessionState>((set, get) => ({
  ready: false,
  restore: async () => {
    const current = ++version;
    try {
      const { data } = await http.get<{
        admin?: boolean;
        account: string | null;
        profile: Profile | null;
        shelf: Record<string, ShelfEntry>;
      }>("api/auth/me");
      if (current !== version) return;
      if (data.account) useProfiles.getState().load(data.account, data.profile);
      if (data.account) useShelf.getState().load(data.account, data.shelf);
      set({
        admin: data.admin ?? false,
        account: data.account ?? undefined,
        ready: true,
        error: undefined,
      });
    } catch (error) {
      if (current === version) set({ ready: true, error: requestError(error) });
    }
  },
  signIn: async (nickname, password, register) => {
    ++version;
    await http.post("api/auth/" + (register ? "register" : "login"), {
      nickname,
      password,
    });
    await get().restore();
    if (get().account !== nickname) throw Error("Не удалось открыть профиль");
  },
  signOut: async () => {
    ++version;
    try {
      await http.post("api/auth/logout");
      set({ admin: false, account: undefined, error: undefined });
      return true;
    } catch (e) {
      set({ error: requestError(e) });
      return false;
    }
  },
}));
