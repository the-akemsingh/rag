import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/api";
import type { User } from "@/types/api";

/** Reads the JWT session from localStorage and re-renders on `auth-changed`. */
export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const read = () => {
      setUser(getStoredUser());
      setIsPending(false);
    };
    read();
    window.addEventListener("auth-changed", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("auth-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  return { user, isPending };
}

export const GOOGLE_CLIENT_ID = (import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined) ?? "";
