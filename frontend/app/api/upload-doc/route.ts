import { getBackendUrl } from "@/lib/backend";

export async function POST(request: Request) {
  try {
    const backendUrl = getBackendUrl();
    const incoming = await request.formData();
    const file = incoming.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "No document file provided." }, { status: 400 });
    }

    const outbound = new FormData();
    outbound.append("file", file);

    const response = await fetch(`${backendUrl}/upload-doc`, {
      method: "POST",
      body: outbound,
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
      error instanceof Error ? error.message : "Upload proxy failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
