import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FileText, LogOut, Menu, MessageSquare, Plus, Settings2, Trash2, X } from "lucide-react";

import { createChat, listChats, relativeTime, signOut as clearSession } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { Chat } from "@/types/api";

/* ------------------------------------------------------------------ *
 * One source of truth for what the sidebar shows. The desktop rail,
 * the mobile drawer, and anything else read from this shape.
 * ------------------------------------------------------------------ */

export interface SidebarData {
  chats: Chat[];
  activeChatId?: string | null;
  loadingChats?: boolean;
}

interface WorkspaceValue {
  chats: Chat[];
  refreshChats: () => Promise<void>;
  startNewChat: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used inside the workspace shell");
  return value;
}

/* ------------------------------------------------------------------ */

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="flex size-5 items-center justify-center rounded-[6px] bg-ink">
        <FileText className="size-3 text-surface" strokeWidth={2.2} />
      </span>
      <span className="text-[13px] font-semibold tracking-tight text-ink/90">AskDocs</span>
    </span>
  );
}

export function PillButton({
  variant = "solid",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "solid"
          ? "bg-ink text-surface hover:bg-ink/90"
          : "border border-ink/[0.12] bg-surface-raised text-ink/80 hover:bg-ink/[0.04]",
        className,
      )}
    />
  );
}

export function StatusDot({ tone }: { tone: "ok" | "warn" | "bad" | "info" | "alt" }) {
  const map = {
    ok: "bg-status-ok",
    warn: "bg-status-warn",
    bad: "bg-status-bad",
    info: "bg-status-info",
    alt: "bg-status-alt",
  } as const;
  return <span className={cn("size-1.5 shrink-0 rounded-full", map[tone])} />;
}

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/30">
      {children}
    </p>
  );
}

export function WorkspaceSidebar({
  userName,
  userEmail,
  chats,
  activeChatId,
  loadingChats,
  onNewChat,
  onDeleteChat,
  demo = false,
  forceDesktop = false,
}: SidebarData & {
  userName: string;
  userEmail?: string;
  onNewChat?: () => void;
  onDeleteChat?: (chatId: string) => void;
  demo?: boolean;
  forceDesktop?: boolean;
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <aside
      className={cn(
        "w-[232px] shrink-0 flex-col border-r border-ink/[0.07] bg-rail px-3 py-3.5",
        forceDesktop ? "flex" : "hidden lg:flex",
      )}
    >
      <div className="flex items-center justify-between px-1">
        <Wordmark />
        <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink/40">
          workspace
        </span>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => !demo && onNewChat?.()}
          className="flex w-full items-center gap-2 rounded-lg border border-ink/[0.09] bg-surface-raised px-2.5 py-2 text-left text-[12.5px] font-medium text-ink/80 transition-colors hover:bg-ink/[0.04]"
        >
          <Plus className="size-3.5" />
          New chat
        </button>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
        <SidebarLabel>Chats</SidebarLabel>
        {loadingChats ? (
          <p className="px-2 text-[12px] text-ink/40">Loading…</p>
        ) : chats.length === 0 ? (
          <p className="px-2 text-[12px] leading-relaxed text-ink/40">
            No chats yet. Start one and upload a document.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {chats.map((chat) => {
              const active = chat.id === activeChatId;
              const row = (
                <>
                  <StatusDot tone={active ? "info" : "alt"} />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink/80">
                    {chat.title ?? "Untitled chat"}
                  </span>
                  <span className="shrink-0 text-[10.5px] text-ink/30">
                    {relativeTime(chat.created_at)}
                  </span>
                </>
              );
              return (
                <li
                  key={chat.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-ink/[0.05]",
                    active && "bg-ink/[0.07]",
                  )}
                >
                  {demo ? (
                    <div className="flex min-w-0 flex-1 items-center gap-2">{row}</div>
                  ) : (
                    <Link
                      to="/chat/$chatId"
                      params={{ chatId: chat.id }}
                      className="flex min-w-0 flex-1 items-center gap-2"
                    >
                      {row}
                    </Link>
                  )}
                  {!demo && onDeleteChat ? (
                    <button
                      type="button"
                      aria-label="Delete chat"
                      onClick={() => onDeleteChat(chat.id)}
                      className="hidden shrink-0 rounded p-0.5 text-ink/30 hover:text-status-bad group-hover:block"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="relative mt-3 border-t border-ink/[0.07] pt-3">
        {accountMenuOpen ? (
          <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-ink/[0.08] bg-surface-raised p-1.5 shadow-panel">
            <div className="px-2 py-1.5">
              <p className="truncate text-[12px] font-medium text-ink/90">{userName}</p>
              {userEmail ? (
                <p className="truncate text-[11px] text-ink/40">{userEmail}</p>
              ) : null}
            </div>
            <div className="my-1 h-px bg-ink/[0.07]" />
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-ink/60 hover:bg-ink/[0.06] hover:text-ink"
            >
              <Settings2 className="size-3.5" />
              Settings
            </button>
            <button
              type="button"
              onClick={() => !demo && clearSession()}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-ink/60 hover:bg-ink/[0.06] hover:text-ink"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        ) : null}

        <SidebarLabel>Workspace</SidebarLabel>
        <button
          type="button"
          onClick={() => setAccountMenuOpen((open) => !open)}
          aria-expanded={accountMenuOpen}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-ink/[0.06]"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-ink/[0.08] text-[10px] font-semibold text-ink/60">
            {userName.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-[12px] text-ink/70">{userName}</span>
        </button>
      </div>
    </aside>
  );
}

export function WorkspacePageHeader({
  title,
  subtitle,
  onOpenNav,
  forceDesktop = false,
}: {
  title: string;
  subtitle?: string;
  onOpenNav?: () => void;
  forceDesktop?: boolean;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-ink/[0.07] px-4 py-3">
      {!forceDesktop ? (
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onOpenNav}
          className="rounded-lg p-1.5 text-ink/50 hover:bg-ink/[0.06] lg:hidden"
        >
          <Menu className="size-4" />
        </button>
      ) : null}
      <div className="min-w-0">
        <h1 className="truncate text-[13px] font-semibold text-ink/90">{title}</h1>
        {subtitle ? <p className="truncate text-[11px] text-ink/40">{subtitle}</p> : null}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeChatId = pathname.startsWith("/chat/") ? (pathname.split("/")[2] ?? null) : null;

  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const loadedFor = useRef<number | null>(null);

  const entryPath = useRef(pathname);

  useEffect(() => {
    if (!isPending && !user) {
      void navigate({
        to: "/",
        search: { next: entryPath.current },
        replace: true,
      });
    }
  }, [isPending, user, navigate]);

  const refreshChats = useCallback(async () => {
    try {
      setChats(await listChats());
    } catch {
      /* leave the last known list in place */
    } finally {
      setLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    if (!user || loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    void refreshChats();
  }, [user, refreshChats]);

  useEffect(() => setDrawerOpen(false), [pathname]);

  const startNewChat = useCallback(async () => {
    const before = new Set(chats.map((c) => c.id));
    await createChat();
    const next = await listChats();
    setChats(next);
    const created = next.find((c) => !before.has(c.id)) ?? next[0];
    if (created) void navigate({ to: "/chat/$chatId", params: { chatId: created.id } });
  }, [chats, navigate]);

  const onDeleteChat = useCallback(
    async (chatId: string) => {
      await deleteAndRefresh(chatId, refreshChats);
      if (activeChatId === chatId) void navigate({ to: "/chat" });
    },
    [refreshChats, activeChatId, navigate],
  );

  const value = useMemo<WorkspaceValue>(
    () => ({ chats, refreshChats, startNewChat }),
    [chats, refreshChats, startNewChat],
  );

  if (isPending || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-[13px] text-ink/40">Loading your workspace…</p>
      </div>
    );
  }

  const sidebarProps = {
    userName: user.name,
    userEmail: user.email,
    chats,
    activeChatId,
    loadingChats,
    onNewChat: () => void startNewChat(),
    onDeleteChat: (id: string) => void onDeleteChat(id),
  };

  return (
    <WorkspaceContext.Provider value={value}>
      <div className="flex min-h-screen bg-surface">
        <WorkspaceSidebar {...sidebarProps} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="lg:hidden">
            <WorkspacePageHeader
              title="AskDocs"
              subtitle={user.name}
              onOpenNav={() => setDrawerOpen(true)}
            />
          </div>
          <div className="min-h-0 flex-1">{children}</div>
        </div>

        {drawerOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close navigation"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-ink/25"
            />
            <div className="absolute inset-y-0 left-0 flex w-[264px] max-w-[86%] flex-col bg-rail">
              <div className="flex items-center justify-between px-3 py-3">
                <Wordmark />
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded p-1 text-ink/40 hover:bg-ink/[0.06]"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <WorkspaceSidebar {...sidebarProps} forceDesktop />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </WorkspaceContext.Provider>
  );
}

async function deleteAndRefresh(chatId: string, refresh: () => Promise<void>) {
  const { deleteChat } = await import("@/lib/api");
  await deleteChat(chatId);
  await refresh();
}

export { MessageSquare };
