import { FileText, MessageSquare, Upload } from "lucide-react";

import { StatusDot } from "@/components/app/app-shell";
import type { Chat } from "@/types/api";

/**
 * Chat-list dashboard body. Pure props, so the landing page can render the
 * real component with demo data instead of a screenshot.
 */
export function ChatDashboardBody({
  userName,
  chats,
  demo = false,
  onNewChat,
}: {
  userName: string;
  chats: Chat[];
  demo?: boolean;
  onNewChat?: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[560px] px-5 py-8">
      <h2 className="text-center text-[17px] font-semibold text-ink/90">
        Welcome back, {userName}
      </h2>
      <p className="mt-1.5 text-center text-[12px] text-ink/50">
        Upload a document, then ask questions and get grounded answers with sources.
      </p>

      <div className="mt-5 space-y-2">
        <Step
          n={1}
          title="Start a chat"
          hint="Each chat keeps its own documents and history."
        />
        <Step
          n={2}
          title="Upload your files"
          hint="PDF, DOCX, XLSX, PPTX, TXT or CSV — up to a few at a time."
        />
        <Step n={3} title="Ask anything" hint="Answers stream in as they're generated." />
      </div>

      <div className="mt-6 rounded-2xl border border-ink/[0.08] bg-surface-raised p-1.5">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <Upload className="size-4 text-ink/30" />
            <p className="text-[12.5px] text-ink/60">Upload a document to start</p>
            <p className="text-[11px] text-ink/40">
              Create a chat, drop a file in, and ask your first question.
            </p>
          </div>
        ) : (
          <ul>
            {chats.map((chat) => (
              <li
                key={chat.id}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-ink/[0.04]"
              >
                <StatusDot tone="info" />
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink/80">
                  {chat.title ?? "Untitled chat"}
                </span>
                <MessageSquare className="size-3.5 text-ink/25" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {!demo ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onNewChat}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-surface hover:bg-ink/90"
          >
            <FileText className="size-3.5" />
            New chat
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Step({ n, title, hint }: { n: number; title: string; hint: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-ink/[0.08] bg-surface-raised px-3 py-2.5">
      <span className="mt-0.5 flex size-4 items-center justify-center rounded bg-ink text-[9px] font-semibold text-surface">
        {n}
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-ink/85">{title}</p>
        <p className="text-[11px] text-ink/45">{hint}</p>
      </div>
    </div>
  );
}
