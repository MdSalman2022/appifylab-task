const LOCAL_API_URL = "http://localhost:4000";

export function getApiUrl(): string {
  const configuredUrl = process.env.API_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return LOCAL_API_URL;
  throw new Error("API_URL is required in production");
}
