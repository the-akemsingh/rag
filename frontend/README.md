# Document Q&A

# Frontend Build Prompt — RAG Document Chat App

Paste this whole document into your frontend AI coding tool (Claude Code, Cursor, v0, Lovable, etc.) as the build brief.

---

## 0. What you're building

A Next.js frontend for a document-based Q&A product. Users sign in with Google, create chats, upload documents (PDF/DOCX/XLSX/PPTX/TXT/CSV) into a chat, and ask questions over WebSocket — the backend streams a LangGraph-driven RAG answer back token-by-token, and can also ask a clarifying question instead of answering.

**Stack:**
- Next.js 14+, App Router, TypeScript
- Tailwind CSS with custom design tokens (see §2)
- Native `WebSocket` for chat streaming — no socket.io, backend doesn't use it
- Auth: Google Identity Services on the client → exchange for an app JWT via the backend (backend does **not** use NextAuth/Better-Auth patterns, it issues its own JWT)
- No heavy state library needed — React context + hooks is enough for this scope

**Reference material you're given:** a landing-page screenshot and two component files from an unrelated product ("nmemo"). Use them only for the *visual language* and the *hero-demo architecture pattern* described below. Do not reuse their nav items, copy, product name, or connector list (Slack/Notion/GitHub/Memory) — this product's sidebar is about chats and documents, not connectors.

---

## 1. Backend contract — do not deviate from this

Base URL: `process.env.NEXT_PUBLIC_BACKEND_URL`. All authenticated REST calls send `Authorization: Bearer <token>`. The WebSocket takes the token as a **query param**, not a header.

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/auth/google` | Exchange a Google ID token for an app JWT |
| POST | `/chats` | Create a chat (`201`, empty body) |
| GET | `/chats` | List chats, newest first |
| DELETE | `/chats/{chat_id}` | Delete a chat + its messages/docs |
| GET | `/chats/{chat_id}/messages` | List messages, chronological |
| POST | `/chats/{chat_id}/upload-doc` | Multipart upload, `files: UploadFile[]`. `chat_id="new"` creates the chat inline |
| WS | `/ws/chat/{chat_id}?token=<jwt>` | Send `{message}`, receive `{response, type}` chunks |

### Data models (TypeScript — use these verbatim as your types)

```typescript
// types/api.ts

export interface User {
  id: number;
  email: string;
  name: string;
  image?: string;
}

export interface Chat {
  id: string; // UUID
  title: string | null;
  created_at: string; // ISO8601
}

export type MessageRole = "user" | "assistant" | "document";
export type DocumentStatus = "pending" | "indexing" | "indexed" | "failed";

export interface Message {
  id: string;
  role: MessageRole;
  content: string; // for role="document", this is the filename
  created_at: string;
  is_clarification: boolean;
  status?: DocumentStatus; // only populated when role === "document"
}

export interface UploadedDocument {
  id: string;
  name: string;
}

export interface UploadDocResponse {
  message: string;
  chat_id: string;
  chat_title: string;
  documents: UploadedDocument[];
}

// WebSocket wire types
export interface WsOutgoing {
  message: string;
}

export type WsIncoming =
  | { type: "stream"; response: string }
  | { type: "clarification"; response: string };

export interface WsConnectionError {
  error: "Invalid token" | "Chat not found" | "No document uploaded for this chat yet";
}
```

### Behavioral rules the UI must respect

- A chat's WebSocket connection **requires at least one document already uploaded**, or the socket closes immediately with `code 1008` and an error payload. Block the composer / show an upload prompt until a document exists.
- `type: "stream"` arrives as multiple separate JSON messages — concatenate `response` fields into one growing bubble as they arrive, don't wait for a terminator.
- `type: "clarification"` arrives as a single message instead of a stream — render it as an assistant bubble and just let the user reply normally in the composer; no special mode needed.
- Document processing is async and retried every 60s on `failed`. Poll `GET /chats/{id}/messages` (or refetch after upload) to move a document row through `pending → indexing → indexed | failed`.
- `POST /chats/{id}/upload-doc` always returns `201` even if a doc later fails — status only shows up via the messages endpoint.
- On login, store `token` and `user` (JSON) in `localStorage` and dispatch a `window` event (e.g. `auth-changed`) so other mounted components (e.g. the nav) re-render.

---

## 2. Design language (extracted from the reference screenshot)

The reference is a light, monochrome-first UI with color used only as small accents (status dots) and one gradient used purely as a decorative backdrop behind the hero demo. Recreate the *feel*, not the literal brand:

- **Palette:** near-white surface (`--surface`), a slightly warm off-white for the sidebar rail (`--rail`), near-black ink text (`--ink`) used at partial opacity for hierarchy (`ink/90` headings, `ink/50` secondary, `ink/30` tertiary/labels) rather than switching hex colors. Borders are `ink` at very low opacity (`~7%`), not a separate gray.
- **Accent dots only:** small 6px colored dots (`status-ok`, `status-warn`, `status-bad`, `status-info`, `status-alt`) next to list rows to indicate connection/type — the rest of the UI stays grayscale.
- **Typography contrast:** the marketing headline uses an italic **serif display font** (large, tight tracking, two centered lines) — a deliberate contrast against everything else, which is a clean grotesk sans. Don't use the serif anywhere except the hero headline.
- **Shape language:** buttons are fully pill-shaped (`rounded-full`), cards and panels use large radii (12–20px), and the primary CTA is solid black with white text; secondary buttons are white/outline with a hairline border.
- **Hero backdrop:** one large rounded panel (~20px radius) filled with a soft diagonal gradient (light blue → light lavender), with soft ambient shadow, that *contains* the floating app screenshot — this is the only place saturated color appears on the whole page.
- **Elevation:** two shadow tokens — a small `panel-shadow` for in-app floating menus, and a large soft `bezel-shadow` for the hero device frame.

Suggested Tailwind theme extension:

```js
// tailwind.config.ts (excerpt)
extend: {
  colors: {
    surface: "var(--surface)",
    "surface-soft": "var(--surface-soft)",
    "surface-raised": "var(--surface-raised)",
    rail: "var(--rail)",
    ink: "var(--ink)",
    border: "var(--border)",
    "status-ok": "var(--status-ok)",
    "status-warn": "var(--status-warn)",
    "status-bad": "var(--status-bad)",
    "status-info": "var(--status-info)",
    "status-alt": "var(--status-alt)",
  },
  boxShadow: {
    panel: "var(--panel-shadow)",
    bezel: "var(--bezel-shadow)",
  },
  fontFamily: {
    heading: ["var(--font-serif-display)", "serif"],
  },
}
```

---

## 3. Landing page

### 3a. Nav
Simple bar: wordmark + small logomark on the left, a single primary pill CTA ("Sign in" or "Try it") on the right. Don't recreate GitHub star counts or a connectors submenu — this product has neither.

### 3b. Hero
Two-line italic serif headline describing the product in the user's own words (something like *"Ask your documents anything."*), a one/two-sentence gray subhead, and a centered CTA row (one solid black pill + one outline pill, e.g. "Get started" and "See how it works").

### 3c. The live-demo hero — the important pattern to copy

The reference doesn't screenshot the product for the hero. It renders the **actual dashboard components** (`WorkspaceSidebar`, `WorkspacePageHeader`, dashboard body) standalone, with hardcoded demo props, inside a decorative gradient frame. This guarantees the marketing page never drifts from the real UI. Build your components the same way:

1. Every shell component (`AppShell`, `WorkspaceSidebar`, `ChatList`, `MainPanel`) accepts its data as **props**, never fetches internally by itself in a way that requires a real session. The authenticated page composes them with live data; the landing page composes them with mock data.
2. Add a `demo?: boolean` and `forceDesktop?: boolean` prop to the sidebar/shell so demo instances (a) don't wire up real sign-out/navigation, and (b) force the desktop layout even inside a small hero frame that's below the `lg:` breakpoint.
3. Wrap the composed demo in a gradient "device frame" component purely for decoration.

```tsx
// components/landing/product-demo.tsx
"use client";

import { WorkspaceSidebar, WorkspacePageHeader } from "@/components/app/app-shell";
import { ChatDashboardBody } from "@/components/app/chat-dashboard-body";
import { GradientFrame } from "@/components/landing/gradient-frame";

const demoChats = [
  { id: "1", title: "Q3 board deck questions", created_at: "2026-08-20T10:00:00Z" },
  { id: "2", title: "Lease agreement review", created_at: "2026-08-18T09:00:00Z" },
];

export function ProductDemo() {
  return (
    


      
        


          


            
            


              
              


                
              


            


          


        


      
    


  );
}
```

Do this instead of a static `` screenshot — it's the whole point of the pattern.

---

## 4. Authenticated workspace shell

One `AppShell` client component, mounted once in `app/(workspace)/layout.tsx`, responsible for:

- Redirecting to `/sign-in?next=` when there's no session
- Loading the chat list once per session (cache by user id, the way the reference guards `checkingUser` against re-fetch loops)
- Rendering a desktop sidebar (`lg:flex`, hidden below that) and a separate mobile drawer triggered from a compact header — don't try to make one sidebar responsive, keep them as two components sharing the same `nav`/`chats` data like the reference does
- A single source-of-truth array for sidebar sections (Chats list + "New chat" action + Settings/Sign out), so the desktop rail, mobile drawer, and any command palette all read from the same list instead of duplicating it three times — this is the actual value of the reference's `nav` array pattern, independent of which links you put in it

Sidebar sections for this app (adapt freely, this replaces the reference's connector list):
- **Chats** — scrollable list of the user's chats (title, relative created_at), "New chat" button at top
- **Workspace** — Settings / Sign out at the bottom, same as the reference's account menu popover

---

## 5. Core pages

| Route | Purpose |
|---|---|
| `/` | Landing page (§3) |
| `/sign-in` | Google sign-in button only |
| `/chat` | Chat list + empty state ("upload a document to start") |
| `/chat/[chatId]` | Message thread + composer + document upload zone |

### Chat thread page behavior
- On mount: `GET /chats/{id}/messages` to hydrate history, then open the WebSocket.
- Render `role: "document"` messages as a compact status chip (filename + colored dot for `pending/indexing/indexed/failed`), not a chat bubble.
- Render `role: "user"` / `"assistant"` as normal bubbles; `is_clarification: true` assistant messages get a subtle "asking for clarification" tag.
- Composer is disabled with an inline hint ("Upload a document to start asking questions") until at least one `indexed` document exists in the thread.
- If the socket closes with a `1008` error payload, surface the specific reason (`Invalid token` / `Chat not found` / `No document uploaded for this chat yet`) instead of a generic failure toast.

---

## 6. Data layer

```typescript
// lib/api.ts
import type { Chat, Message, UploadDocResponse, User } from "@/types/api";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
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

export async function createChat(): Promise<Chat> {
  const res = await fetch(`${BASE}/chats`, { method: "POST", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to create chat");
  return res.json();
}

export async function listChats(): Promise<Chat[]> {
  const res = await fetch(`${BASE}/chats`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load chats");
  return res.json();
}

export async function deleteChat(chatId: string): Promise<void> {
  const res = await fetch(`${BASE}/chats/${chatId}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to delete chat");
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const res = await fetch(`${BASE}/chats/${chatId}/messages`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json();
}

export async function uploadDocuments(chatId: string, files: File[]): Promise<UploadDocResponse> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await fetch(`${BASE}/chats/${chatId}/upload-doc`, {
    method: "POST",
    headers: authHeaders(), // do NOT set Content-Type — let the browser set the multipart boundary
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}
```

```typescript
// hooks/use-chat-socket.ts
"use client";

import { useEffect, useRef, useState } from "react";
import type { WsIncoming } from "@/types/api";

export interface StreamedTurn {
  content: string;
  isClarification: boolean;
  done: boolean;
}

export function useChatSocket(chatId: string) {
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [turn, setTurn] = useState<StreamedTurn | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const base = process.env.NEXT_PUBLIC_BACKEND_URL!.replace(/^http/, "ws");
    const socket = new WebSocket(`${base}/ws/chat/${chatId}?token=${token}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as WsIncoming | { error: string };
      if ("error" in data) {
        setConnectionError(data.error);
        return;
      }
      if (data.type === "clarification") {
        setTurn({ content: data.response, isClarification: true, done: true });
        return;
      }
      // type === "stream": append chunk
      setTurn((prev) => ({
        content: (prev?.content ?? "") + data.response,
        isClarification: false,
        done: false,
      }));
    };

    socket.onclose = (event) => {
      if (event.code === 1008 && !connectionError) {
        setConnectionError("Connection closed unexpectedly");
      }
    };

    return () => socket.close();
  }, [chatId]);

  function send(message: string) {
    setTurn(null);
    socketRef.current?.send(JSON.stringify({ message }));
  }

  return { send, turn, connectionError };
}
```

Note: mark the current streamed turn `done` once you decide a response is finished (e.g. a short idle timeout after the last chunk, since the protocol doesn't send an explicit terminator) — then refetch `GET /chats/{id}/messages` to reconcile with what the backend actually persisted.

---

## 7. Do / don't

- **Do** copy: the pill-button + serif-headline visual language, the gradient hero device frame, the "real components rendered with demo props" hero pattern, the single-source-of-truth nav/list array for the sidebar.
- **Don't** copy: the "nmemo" name, its connector list (Slack/Notion/GitHub/Memory), its exact nav links (Playground/Sources/Connectors/API keys/Docs), or its landing copy. This product's information architecture is chats + documents, not connectors + context sources.
- **Don't** invent backend behavior not in §1 — no optimistic message IDs the backend doesn't return, no assumed pagination on `/chats` (it returns a full array), no reconnect/backoff spec since the backend doesn't document one (add a simple exponential retry client-side, but don't invent server support for it). 


```


```
"use client";

/** The logged-in workspace chrome: one useful sidebar and the current page. */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  LogOut,
  Settings2,
  UserRound,
  X,
} from "lucide-react";

import {
  CommandSearch,
  SearchTrigger,
  type CommandItem,
} from "@/components/app/command-search";
import { LayeredRoleLogo } from "@/components/layered-role-logo";
import {
  ConnectorsRoleIcon,
  DocsRoleIcon,
  KeysRoleIcon,
  PlaygroundRoleIcon,
  SettingsRoleIcon,
  SourcesRoleIcon,
} from "@/components/layered-role-icons";
import { Logo } from "@/components/logo";
import { AppShellSkeleton } from "@/components/ui/loading-states";
import { ConnectorsProvider, useConnectors } from "@/lib/connectors-store";
import {
  ApiError,
  prefetchAuthenticatedData,
  setApiCacheScope,
  type Workspace,
} from "@/lib/api";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/**
 * Every destination in the app, once. The icon rail, the tab row, the mobile
 * drawer, and the command palette all read from this list, so a route can never
 * appear in one and be missing from another.
 */
const nav = [
  {
    href: "/home",
    icon: LayeredRoleLogo,
    label: "Dashboard",
    hint: "Workspace setup and context status",
  },
  {
    href: "/playground",
    icon: PlaygroundRoleIcon,
    label: "Playground",
    hint: "Ask a question and watch context get selected",
  },
  {
    href: "/sources",
    icon: SourcesRoleIcon,
    label: "Sources",
    hint: "Documents and workspace knowledge",
  },
  {
    href: "/connectors",
    icon: ConnectorsRoleIcon,
    label: "Connectors",
    hint: "Memory, Slack, Notion, GitHub",
  },
  {
    href: "/keys",
    icon: KeysRoleIcon,
    label: "API keys",
    hint: "Keys for the SDK and Context API",
  },
  {
    href: "/docs/sdk",
    icon: DocsRoleIcon,
    label: "Docs",
    hint: "SDK, connectors, and API reference",
  },
  {
    href: "/settings",
    icon: SettingsRoleIcon,
    label: "Settings",
    hint: "Workspace, IDs, and account",
  },
] as const;

/** Routes that own their own scrolling — the shell must not add a padded scroll frame. */
const FULL_BLEED = ["/playground"];

function navActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string) {
  return nav.find((item) => navActive(pathname, item.href))?.label ?? "nmemo";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [workspaceReadyFor, setWorkspaceReadyFor] = useState(
    null,
  );
  const [workspace, setWorkspace] = useState(null);
  const checkingUser = useRef(null);

  const userId = session?.user?.id ?? null;
  if (userId) setApiCacheScope(userId);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, session, router, pathname]);

  useEffect(() => {
    if (isPending || !userId || checkingUser.current === userId) return;

    checkingUser.current = userId;
    setWorkspace(null);

    let cancelled = false;
    void prefetchAuthenticatedData()
      .then((nextWorkspace) => {
        if (!cancelled) {
          setWorkspace(nextWorkspace);
          setWorkspaceReadyFor(userId);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const missing =
          (err instanceof ApiError && err.status === 404) ||
          (err instanceof Error && /no workspace/i.test(err.message));
        if (missing) {
          router.replace("/create-workspace");
          return;
        }

        // A temporary API failure must not misclassify an existing user as new.
        // Let the destination render its own useful error state.
        setWorkspaceReadyFor(userId);
      });

    return () => {
      cancelled = true;
    };
  }, [isPending, userId, router]);

  if (isPending || !session?.user || workspaceReadyFor !== session.user.id) {
    return ;
  }

  return (
    
      
        {children}
      
    
  );
}

function AppShellChrome({
  userName,
  userEmail,
  pathname,
  children,
}: {
  userName: string;
  userEmail?: string;
  pathname: string;
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { connectors } = useConnectors();
  const connectedTypes = connectors
    .filter((connector) => connector.status === "connected")
    .map((connector) => connector.type);
  const connectedCount = new Set(connectedTypes).size;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const commandItems = useMemo(
    () =>
      nav.map((item) => ({
        id: `page-${item.href}`,
        label: item.label,
        hint: item.hint,
        href: item.href,
        group: "Pages" as const,
      })),
    [],
  );

  const fullBleed = FULL_BLEED.some((href) => navActive(pathname, href));
  const title = pageTitle(pathname);

  return (
    


      


        

        


          {/* Mobile header — tap the title to open the nav drawer */}
          


             setMenuOpen(true)}
              className="min-w-0 flex-1 rounded-sm px-1 py-1 text-left hover:bg-foreground/5"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
            >
              
                
                  {userName}
                
                
              
              
                {title}
              
            

            


               setSearchOpen(true)} />
            


          



           setSearchOpen(true)}
          />

          


            {fullBleed ? (
              


                {children}
              


            ) : (
              


                {children}
              


            )}
          


        


      



      {/* Mobile nav drawer */}
      {menuOpen ? (
        


           setMenuOpen(false)}
          />
          


            


               setMenuOpen(false)}
                className="min-w-0"
              >
                


                  {userName}
                


                


                  Workspace & IDs →
                


              
              

 setMenuOpen(false)}
                className="flex size-8 shrink-0 items-center justify-center rounded-sm text-neutral-500 hover:bg-foreground/5 hover:text-foreground"
                aria-label="Close"
              >
                
              
            



            
              


                {nav.map((item) => {
                  const Icon = item.icon;
                  return (
                    


                       setMenuOpen(false)}
                        className={cn(
                          "flex items-start gap-2.5 rounded-sm px-2 py-2 text-left hover:bg-foreground/5",
                          navActive(pathname, item.href) && "bg-foreground/10",
                        )}
                      >
                        
                        
                          
                            {item.label}
                          
                          
                            {item.hint}
                          
                        
                      
                    


                  );
                })}
              


            

            


               {
                  setMenuOpen(false);
                  void signOut();
                }}
                className="w-full rounded-sm px-2 py-1.5 text-left text-xs font-semibold text-neutral-500 hover:bg-foreground/5 hover:text-foreground"
              >
                Sign out
              
            


          


        
      ) : null}

      
    
  );
}

export function WorkspaceSidebar({
  userName,
  userEmail,
  pathname,
  connectedTypes,
  connectedCount,
  demo = false,
  forceDesktop = false,
}: {
  userName: string;
  userEmail?: string;
  pathname: string;
  connectedTypes: readonly string[];
  connectedCount: number;
  demo?: boolean;
  forceDesktop?: boolean;
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    


      


        
          
          
            nmemo
          
        
        
          workspace
        
      



      
        
      

      
        
        
        
        
        
      

      
        
        
        
      

      


        {accountMenuOpen ? (
          


            


              


                {userName}
              


              {userEmail ? (
                


                  {userEmail}
                


              ) : null}
            


            


              
              
            


            


              
            


            


               {
                  if (!demo) void signOut();
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[12px] font-medium text-ink/60 transition-colors hover:bg-ink/[0.07] hover:text-ink"
              >
                
                Sign out
              
            


          


        ) : null}

        


           setAccountMenuOpen((open) => !open)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-ink/[0.06]"
            aria-expanded={accountMenuOpen}
            aria-label="Open workspace menu"
          >
            
              
                {userName}'s workspace
              
            
            
          
          
            
          
        


      


    


  );
}

function AccountLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    
      
      {label}
    
  );
}

export function WorkspacePageHeader({
  title,
  onSearch,
  forceDesktop = false,
}: {
  title: string;
  onSearch?: () => void;
  forceDesktop?: boolean;
}) {
  return (
    


      


        {title}
      


       undefined)} />
    


  );
}

function SidebarGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    


      


        {label}
      


      

{children}


    


  );
}

function SidebarLink({
  href,
  label,
  pathname,
  count,
  dot,
  connected,
}: {
  href: string;
  label: string;
  pathname: string;
  count?: number;
  dot?: string;
  connected?: boolean;
}) {
  const active = !dot && navActive(pathname, href);
  return (
    
      {dot ?  : null}
      {label}
      {typeof count === "number" ? (
        {count}
      ) : connected ? (
        on
      ) : null}
    
  );
}


```
import {
  WorkspacePageHeader,
  WorkspaceSidebar,
} from "@/components/app/app-shell";
import { HomeDashboard } from "@/components/app/home-dashboard";
import { WallpaperPlate } from "@/components/landing/wallpaper";

const demoSources = [
  { type: "documents" },
  { type: "slack" },
  { type: "notion" },
  { type: "github" },
] as const;

export function HomeDemo() {
  return (
    


      
        


          


             source.type)}
              connectedCount={demoSources.length}
              demo
              forceDesktop
            />

            


              
              


                
              


            


          


        


      
    


  );
}
```

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/20ec31ae-f7f1-42e5-9b9c-034922286d2a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
