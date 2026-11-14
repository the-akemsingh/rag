import { createFileRoute } from "@tanstack/react-router";

import { MarketingHome } from "@/components/marketing/marketing-home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AskDocs — Ask your documents anything" },
      {
        name: "description",
        content:
          "Upload contracts, decks and spreadsheets, then ask questions and get grounded answers streamed back with the context they came from.",
      },
      { property: "og:title", content: "AskDocs — Ask your documents anything" },
      {
        property: "og:description",
        content:
          "Upload your files and ask questions. AskDocs answers from your own documents, streaming as it reasons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketingHome,
});
