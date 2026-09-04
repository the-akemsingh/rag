import { createFileRoute } from "@tanstack/react-router";

import { WorkspacePageHeader, useWorkspace } from "@/components/app/app-shell";
import { ChatDashboardBody } from "@/components/app/chat-dashboard-body";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/_workspace/chat/")({
  head: () => ({
    meta: [
      { title: "Your chats — AskDocs" },
      {
        name: "description",
        content: "All your document chats in one place. Upload a document to start asking.",
      },
      { property: "og:title", content: "Your chats — AskDocs" },
      {
        property: "og:description",
        content: "All your document chats in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatIndex,
});

function ChatIndex() {
  const { chats, startNewChat } = useWorkspace();
  const { user } = useSession();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="hidden lg:block">
        <WorkspacePageHeader
          title="Chats"
          subtitle={`${chats.length} ${chats.length === 1 ? "chat" : "chats"}`}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ChatDashboardBody
          userName={user?.name?.split(" ")[0] ?? "there"}
          chats={chats}
          onNewChat={() => void startNewChat()}
        />
      </div>
    </div>
  );
}
