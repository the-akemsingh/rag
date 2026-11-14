import { PillButton, Wordmark } from "@/components/app/app-shell";
import { ProductDemo } from "@/components/marketing/product-demo";
import { getAppSignInUrl } from "@/lib/app-url";

export function MarketingHome() {
  const signInUrl = getAppSignInUrl();

  return (
    <main className="min-h-screen bg-surface">
      <nav className="flex items-center justify-between px-5 py-4 sm:px-10">
        <Wordmark />
        <div className="flex items-center gap-2">
          <a href={signInUrl}>
            <PillButton variant="outline">Sign up</PillButton>
          </a>
          <a href={signInUrl}>
            <PillButton>Sign in</PillButton>
          </a>
        </div>
      </nav>

      <section className="px-5 pt-14 text-center sm:pt-20">
        <h1 className="mx-auto max-w-3xl font-heading text-[44px] italic leading-[1.02] tracking-tight text-ink/90 sm:text-[68px]">
          Ask your documents
          <br />
          anything.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-ink/50">
          Drop contracts, decks and spreadsheets into a chat. AskDocs reads them and answers your
          questions in plain language — streaming as it thinks, and asking back when something is
          unclear.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <a href={signInUrl}>
            <PillButton>Get started →</PillButton>
          </a>
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
