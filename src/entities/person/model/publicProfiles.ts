export const publicProfiles = {
  anna: {
    id: "anna",
    name: "Анна К.",
    handle: "anna.in.cinema",
    bio: "Люблю истории, к которым хочется возвращаться.",
    avatar: "/figma/profile-avatar.png",
  },
  alex: {
    id: "alex",
    name: "Алексей М.",
    handle: "alex",
    bio: "",
    avatar: "/figma/avatar-alex.png",
  },
} as const;

export type PublicProfileId = keyof typeof publicProfiles;

export function isPublicProfileId(value: string): value is PublicProfileId {
  return Object.hasOwn(publicProfiles, value);
}

export function getFriends(owner?: PublicProfileId) {
  return Object.values(publicProfiles).filter(({ id }) => id !== owner);
}
