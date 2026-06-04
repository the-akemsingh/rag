export function getBackendUrl(): string {
  const url = process.env.BACKEND_URL?.trim();
  if (!url) {
    throw new Error("BACKEND_URL is not set in environment variables.");
  }
  return url.replace(/\/$/, "");
}
