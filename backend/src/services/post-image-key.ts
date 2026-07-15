const POST_IMAGE_KEY_PATTERN =
  /^users\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/posts\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/i;

export function isPostImageKeyOwnedByUser(key: string, userId: string) {
  return POST_IMAGE_KEY_PATTERN.exec(key)?.[1]?.toLowerCase() === userId.toLowerCase();
}
