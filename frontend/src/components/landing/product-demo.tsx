import { WorkspacePageHeader, WorkspaceSidebar } from "@/components/app/app-shell";
import { ChatDashboardBody } from "@/components/app/chat-dashboard-body";
import { GradientFrame } from "@/components/landing/gradient-frame";
import type { Chat } from "@/types/api";

const demoChats: Chat[] = [
  { id: "1", title: "Q3 board deck questions", created_at: "2026-08-20T10:00:00Z" },
  { id: "2", title: "Lease agreement review", created_at: "2026-08-18T09:00:00Z" },
  { id: "3", title: "Vendor invoices — Q2", created_at: "2026-08-11T09:00:00Z" },
];

/**
 * The hero renders the real workspace components with demo props, so the
 * marketing page can never drift from the actual product UI.
 */
export function ProductDemo() {
  return (
    <GradientFrame>
      <div className="flex h-[70vh] min-w-0">
        <WorkspaceSidebar
          userName="Maya Alvarez"
          userEmail="maya@acme.com"
          chats={demoChats}
          activeChatId="1"
          demo
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <WorkspacePageHeader title="Chats" subtitle="3 chats · 7 documents" forceDesktop />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ChatDashboardBody userName="Maya" chats={demoChats} demo />
          </div>
        </div>
      </div>
    </GradientFrame>
  );
}
