export function getBackendUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (!url) {
    throw new Error("BACKEND_URL is not set in environment variables.");
  }
  return url.replace(/\/$/, "");
}
