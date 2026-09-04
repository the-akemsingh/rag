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

export interface WsOutgoing {
  message: string;
}

export type WsIncoming =
  | { type: "stream"; response: string }
  | { type: "clarification"; response: string };

export interface WsConnectionError {
  error: "Invalid token" | "Chat not found" | "No document uploaded for this chat yet";
}
