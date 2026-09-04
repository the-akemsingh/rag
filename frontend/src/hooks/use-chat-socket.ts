import { useCallback, useEffect, useRef, useState } from "react";
import { BASE } from "@/lib/api";
import type { WsIncoming } from "@/types/api";

export interface StreamedTurn {
  content: string;
  isClarification: boolean;
  done: boolean;
}

const IDLE_MS = 900;
const MAX_RETRIES = 4;

export function useChatSocket(chatId: string, enabled: boolean, onSettled?: () => void) {
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [turn, setTurn] = useState<StreamedTurn | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;

  useEffect(() => {
    if (!enabled) return;
    let closedByUs = false;
    let retries = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const open = () => {
      const token = localStorage.getItem("token");
      const wsUrl = (import.meta.env["VITE_WEBSOCKET_URL"] as string | undefined) ?? "ws://localhost:8000"
      const socket = new WebSocket(`${wsUrl}/ws/chat/${chatId}?token=${token}`);
      socketRef.current = socket;

      socket.onopen = () => {
        retries = 0;
        setConnected(true);
        setConnectionError(null);
      };

      socket.onmessage = (event) => {
        let data: WsIncoming | { error: string };
        try {
          data = JSON.parse(event.data as string);
        } catch {
          return;
        }
        if ("error" in data) {
          setConnectionError(data.error);
          return;
        }
        if (idleTimer.current) clearTimeout(idleTimer.current);

        if (data.type === "clarification") {
          setTurn({ content: data.response, isClarification: true, done: true });
          settledRef.current?.();
          return;
        }
        setTurn((prev) => ({
          content: (prev?.content ?? "") + data.response,
          isClarification: false,
          done: false,
        }));
        // No terminator in the protocol: settle the turn after a short idle gap.
        idleTimer.current = setTimeout(() => {
          setTurn((prev) => (prev ? { ...prev, done: true } : prev));
          settledRef.current?.();
        }, IDLE_MS);
      };

      socket.onclose = (event) => {
        setConnected(false);
        if (closedByUs) return;
        if (event.code === 1008) {
          setConnectionError((prev) => prev ?? "Connection refused by the server");
          return;
        }
        if (retries < MAX_RETRIES) {
          const delay = Math.min(8000, 500 * 2 ** retries);
          retries += 1;
          retryTimer = setTimeout(open, delay);
        } else {
          setConnectionError("Connection lost. Reload to try again.");
        }
      };
    };

    open();

    return () => {
      closedByUs = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [chatId, enabled]);

  const send = useCallback((message: string) => {
    setTurn(null);
    socketRef.current?.send(JSON.stringify({ message }));
  }, []);

  const clearTurn = useCallback(() => setTurn(null), []);

  return { send, turn, clearTurn, connectionError, connected };
}
