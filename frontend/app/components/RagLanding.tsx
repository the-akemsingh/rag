"use client";

import { useRef, useState } from "react";
import AssistantMessage from "@/app/components/AssistantMessage";
import {
  getDocumentAcceptAttribute,
  getDocumentRejectionMessage,
  isAllowedDocument,
} from "@/lib/allowed-documents";

type ChatEntry = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type UploadPhase = "idle" | "uploading" | "ready" | "error";

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function RagLanding() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  function scrollChatToBottom() {
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setUploadError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isAllowedDocument(file)) {
      setSelectedFile(null);
      setUploadError(getDocumentRejectionMessage());
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFile(file);
    setUploadPhase("idle");
  }

  async function handleUpload() {
    if (!selectedFile || uploadPhase === "uploading") {
      return;
    }

    setUploadError(null);
    setUploadPhase("uploading");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload-doc", {
        method: "POST",
        body: formData,
      });

      if (response.status !== 201) {
        const data = await response.json().catch(() => ({}));
        const detail =
          typeof data?.error === "string"
            ? data.error
            : typeof data?.detail === "string"
              ? data.detail
              : `Upload failed (${response.status}).`;
        throw new Error(detail);
      }

      setUploadedFileName(selectedFile.name);
      setUploadPhase("ready");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setUploadPhase("error");
      setUploadError(
        error instanceof Error ? error.message : "Upload failed.",
      );
    }
  }

  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || isSending || uploadPhase !== "ready") {
      return;
    }

    const userEntry: ChatEntry = {
      id: createId(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userEntry]);
    setChatInput("");
    setChatError(null);
    setIsSending(true);
    scrollChatToBottom();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status !== 200) {
        const detail =
          typeof data?.error === "string"
            ? data.error
            : typeof data?.detail === "string"
              ? data.detail
              : `Chat failed (${response.status}).`;
        throw new Error(detail);
      }

      const assistantText =
        typeof data?.response === "string"
          ? data.response
          : "No response returned from the server.";

      const assistantEntry: ChatEntry = {
        id: createId(),
        role: "assistant",
        content: assistantText,
      };

      setMessages((prev) => [...prev, assistantEntry]);
      scrollChatToBottom();
    } catch (error) {
      setChatError(
        error instanceof Error ? error.message : "Failed to send message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  const showChat = uploadPhase === "ready";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 bg-white/80 px-6 py-5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-3xl flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            RAG Assistant
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Ask questions about your document
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Upload one PDF, Word, Excel, or similar document at a time. Images
            and videos are not supported.
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
        {!showChat && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-medium">Upload document</h2>

            <label
              htmlFor="document-upload"
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 transition hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20"
            >
              <span className="text-4xl" aria-hidden>
                📄
              </span>
              <span className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                {selectedFile
                  ? selectedFile.name
                  : "Choose a PDF, DOCX, XLSX, or similar file"}
              </span>
              <span className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                Browse files
              </span>
            </label>

            <input
              ref={fileInputRef}
              id="document-upload"
              type="file"
              accept={getDocumentAcceptAttribute()}
              className="sr-only"
              disabled={uploadPhase === "uploading"}
              onChange={handleFileChange}
            />

            {uploadError && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
                {uploadError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || uploadPhase === "uploading"}
                className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadPhase === "uploading" ? "Uploading…" : "Upload"}
              </button>
            </div>

            {uploadPhase === "uploading" && (
              <div
                className="mt-6 flex items-center gap-3 rounded-xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800"
                role="status"
                aria-live="polite"
              >
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  Uploading your document…
                </span>
              </div>
            )}
          </section>
        )}

        {showChat && (
          <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Document ready
              </p>
              <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
                {uploadedFileName}
              </p>
            </div>

            <div className="flex min-h-[320px] flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
              {messages.length === 0 && (
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Ask a question about your uploaded document.
                </p>
              )}

              {messages.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      entry.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    {entry.role === "assistant" ? (
                      <AssistantMessage content={entry.content} />
                    ) : (
                      entry.content
                    )}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-3 text-sm dark:bg-zinc-800">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
                    Thinking…
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {chatError && (
              <p className="px-5 pb-2 text-sm text-red-600 dark:text-red-400" role="alert">
                {chatError}
              </p>
            )}

            <form
              onSubmit={handleSendMessage}
              className="flex gap-3 border-t border-zinc-200 p-4 dark:border-zinc-800"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask something about your document…"
                disabled={isSending}
                className="h-11 flex-1 rounded-full border border-zinc-300 bg-zinc-50 px-4 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isSending}
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
