import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, Send } from "lucide-react";

import { StatusDot, WorkspacePageHeader, useWorkspace } from "@/components/app/app-shell";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { getMessages, uploadDocuments } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { DocumentStatus, Message } from "@/types/api";

export const Route = createFileRoute("/_workspace/chat/$chatId")({
  head: () => ({
    meta: [
      { title: "Document chat — AskDocs" },
      {
        name: "description",
        content: "Ask questions about the documents in this chat and get streamed answers.",
      },
      { property: "og:title", content: "Document chat — AskDocs" },
      {
        property: "og:description",
        content: "Ask questions about the documents in this chat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatThread,
});

const statusTone: Record<DocumentStatus, "ok" | "warn" | "bad" | "info"> = {
  pending: "warn",
  indexing: "info",
  indexed: "ok",
  failed: "bad",
};

function ChatThread() {
  const { chatId } = Route.useParams();
  const { chats, refreshChats } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const chat = chats.find((c) => c.id === chatId);

  const load = useCallback(async () => {
    try {
      setMessages(await getMessages(chatId));
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setPendingQuestion(null);
    void load();
  }, [load]);

  const documents = useMemo(
    () => messages.filter((m) => m.role === "document"),
    [messages],
  );
  const hasDocument = documents.length > 0;
  const hasIndexed = documents.some((d) => d.status === "indexed");
  const stillProcessing = documents.some(
    (d) => d.status === "pending" || d.status === "indexing" || d.status === "failed",
  );

  // Documents index asynchronously: poll until every one has settled.
  useEffect(() => {
    if (!stillProcessing) return;
    const timer = setInterval(() => void load(), 5000);
    return () => clearInterval(timer);
  }, [stillProcessing, load]);

  const onSettled = useCallback(() => {
    void load();
  }, [load]);

  const { send, turn, clearTurn, connectionError } = useChatSocket(
    chatId,
    hasDocument,
    onSettled,
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, turn, pendingQuestion]);

  useEffect(() => {
    if (hasIndexed) composerRef.current?.focus();
  }, [hasIndexed, chatId]);

  useEffect(() => {
    if (turn?.done) setPendingQuestion(null);
  }, [turn?.done]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);
    try {
      await uploadDocuments(chatId, Array.from(files));
      await load();
      await refreshChats();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = () => {
    const text = input.trim();
    if (!text || !hasIndexed) return;
    clearTurn();
    setPendingQuestion(text);
    send(text);
    setInput("");
    composerRef.current?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="hidden lg:block">
        <WorkspacePageHeader
          title={chat?.title ?? "Untitled chat"}
          subtitle={`${documents.length} ${documents.length === 1 ? "document" : "documents"}`}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-[680px] flex-col gap-3">
          {loading ? <p className="text-[12.5px] text-ink/40">Loading conversation…</p> : null}

          {!loading && !hasDocument ? (
            <div className="rounded-2xl border border-dashed border-ink/[0.14] bg-surface-raised px-5 py-8 text-center">
              <p className="text-[13px] font-medium text-ink/80">
                Upload a document to start
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-[11.5px] text-ink/45">
                PDF, DOCX, XLSX, PPTX, TXT or CSV. Once it's indexed you can ask questions
                about it.
              </p>
            </div>
          ) : null}

          {messages.map((message) =>
            message.role === "document" ? (
              <div
                key={message.id}
                className="mx-auto flex items-center gap-2 rounded-full border border-ink/[0.08] bg-surface-raised px-3 py-1.5"
              >
                <StatusDot tone={statusTone[message.status ?? "pending"]} />
                <span className="text-[11.5px] text-ink/70">{message.content}</span>
                <span className="text-[10.5px] uppercase tracking-wide text-ink/30">
                  {message.status ?? "pending"}
                </span>
              </div>
            ) : (
              <Bubble
                key={message.id}
                role={message.role}
                content={message.content}
                isClarification={message.is_clarification}
              />
            ),
          )}

          {pendingQuestion ? <Bubble role="user" content={pendingQuestion} /> : null}
          {turn ? (
            <Bubble
              role="assistant"
              content={turn.content}
              isClarification={turn.isClarification}
            />
          ) : pendingQuestion ? (
            <p className="text-[12.5px] text-ink/40">Thinking…</p>
          ) : null}

          {connectionError ? (
            <p className="rounded-xl bg-status-bad/10 px-3 py-2 text-[12px] text-status-bad">
              {connectionError}
            </p>
          ) : null}
          {uploadError ? (
            <p className="text-[12px] text-status-bad">{uploadError}</p>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-ink/[0.07] bg-surface px-4 py-3">
        <div className="mx-auto max-w-[680px]">
          <div className="flex items-end gap-2 rounded-2xl border border-ink/[0.09] bg-surface-raised p-2">
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.pptx,.txt,.csv"
              className="hidden"
              onChange={(e) => void handleUpload(e.target.files)}
            />
            <button
              type="button"
              aria-label="Upload documents"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-full p-2 text-ink/45 hover:bg-ink/[0.06] disabled:opacity-50"
            >
              <Paperclip className="size-4" />
            </button>
            <textarea
              ref={composerRef}
              rows={1}
              value={input}
              disabled={!hasIndexed}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={
                hasIndexed
                  ? "Ask a question about your documents…"
                  : "Upload a document to start asking questions"
              }
              className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-1 py-2 text-[13px] text-ink/90 outline-none placeholder:text-ink/35 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              aria-label="Send"
              onClick={submit}
              disabled={!hasIndexed || input.trim().length === 0}
              className="flex size-8 items-center justify-center rounded-full bg-ink text-surface transition-colors hover:bg-ink/90 disabled:opacity-40"
            >
              <Send className="size-3.5" />
            </button>
          </div>
          <p className="mt-1.5 px-1 text-[11px] text-ink/35">
            {uploading
              ? "Uploading…"
              : hasIndexed
                ? "Enter to send · Shift+Enter for a new line"
                : hasDocument
                  ? "Your document is still being processed."
                  : "Upload a document to start asking questions."}
          </p>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  role,
  content,
  isClarification,
}: {
  role: "user" | "assistant" | "document";
  content: string;
  isClarification?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[86%]", isUser && "flex flex-col items-end")}>
        {isClarification ? (
          <p className="mb-1 text-[10.5px] uppercase tracking-[0.1em] text-ink/35">
            asking for clarification
          </p>
        ) : null}
        <div
          className={cn(
            "whitespace-pre-wrap text-[13.5px] leading-relaxed",
            isUser
              ? "rounded-2xl bg-ink px-3.5 py-2 text-surface"
              : "text-ink/85",
          )}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
