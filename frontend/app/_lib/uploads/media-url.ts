export const DEFAULT_AVATAR = "/assets/images/salman.jpg";

export function resolveAvatarUrl(
  avatarKey: string | null | undefined,
  fallback: string = DEFAULT_AVATAR,
): string {
  return resolveMediaUrl(avatarKey ?? null) ?? fallback;
}

export function resolveMediaUrl(key: string | null): string | null {
  if (!key) return null;
  if (key.startsWith("/")) return key;

  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim().replace(
    /\/$/,
    "",
  );
  if (!baseUrl) return null;
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${baseUrl}/${encodedKey}`;
}
