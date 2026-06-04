import { getBackendUrl } from "@/lib/backend";

export async function POST(request: Request) {
  try {
    const backendUrl = getBackendUrl();
    const payload = await request.json();

    if (typeof payload?.message !== "string" || !payload.message.trim()) {
      return Response.json({ error: "message is required." }, { status: 400 });
    }

    const response = await fetch(`${backendUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: payload.message.trim() }),
    });

    const text = await response.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = { detail: text };
      }
    }

    return Response.json(body ?? {}, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Chat proxy failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
