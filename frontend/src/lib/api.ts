import type { Chat, Message, UploadDocResponse, User } from "@/types/api";

export const BASE =
  (import.meta.env["VITE_BACKEND_URL"] as string | undefined) ?? "http://localhost:8000";


function authHeaders(): HeadersInit {
  const token = typeof window === "undefined" ? null : localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginWithGoogle(idToken: string) {
  const res = await fetch(`${BASE}/api/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: idToken }),
  });
  if (!res.ok) throw new Error("Google sign-in failed");
  const data: { message: string; token: string; user: User } = await res.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  window.dispatchEvent(new Event("auth-changed"));
  return data.user;
}

export function signOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-changed"));
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw || !localStorage.getItem("token")) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function createChat(): Promise<Chat> {
  const res = await fetch(`${BASE}/chats`, { method: "POST", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to create chat");
  const text = await res.text();
  return text ? (JSON.parse(text) as Chat) : ({} as Chat);
}

export async function listChats(): Promise<Chat[]> {
  const res = await fetch(`${BASE}/chats`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load chats");
  return res.json();
}

export async function deleteChat(chatId: string): Promise<void> {
  const res = await fetch(`${BASE}/chats/${chatId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete chat");
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const res = await fetch(`${BASE}/chats/${chatId}/messages`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json();
}

export async function uploadDocuments(
  chatId: string,
  files: File[],
): Promise<UploadDocResponse> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await fetch(`${BASE}/chats/${chatId}/upload-doc`, {
    method: "POST",
    headers: authHeaders(), // no Content-Type: the browser sets the multipart boundary
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
