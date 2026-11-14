const configuredAppUrl = (import.meta.env["VITE_APP_URL"] as string | undefined)?.trim();

export function getAppSignInUrl(): string {
  if (!configuredAppUrl) {
    return "/signin";
  }

  return `${configuredAppUrl.replace(/\/+$/, "")}/signin`;
}
