import { createFileRoute, Link } from "@tanstack/react-router";

import { PillButton, Wordmark } from "@/components/app/app-shell";
import { ProductDemo } from "@/components/landing/product-demo";

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
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-surface">
      <nav className="flex items-center justify-between px-5 py-4 sm:px-10">
        <Wordmark />
        <Link to="/sign-in" search={{ next: "/chat" }}>
          <PillButton>Sign in</PillButton>
        </Link>
      </nav>

      <section className="px-5 pt-14 text-center sm:pt-20">
        <h1 className="mx-auto max-w-3xl font-heading text-[44px] italic leading-[1.02] tracking-tight text-ink/90 sm:text-[68px]">
          Ask your documents
          <br />
          anything.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-ink/50">
          Drop contracts, decks and spreadsheets into a chat. AskDocs reads them and answers
          your questions in plain language — streaming as it thinks, and asking back when
          something is unclear.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Link to="/sign-in" search={{ next: "/chat" }}>
            <PillButton>Get started →</PillButton>
          </Link>
          <a href="#how-it-works">
            <PillButton variant="outline">See how it works</PillButton>
          </a>
        </div>
      </section>

      <section id="how-it-works" className="px-5 py-14 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <ProductDemo />
        </div>
      </section>

      <footer className="border-t border-ink/[0.07] px-5 py-6 text-center text-[11.5px] text-ink/35 sm:px-10">
        AskDocs — grounded answers from your own documents.
      </footer>
    </main>
  );
}
