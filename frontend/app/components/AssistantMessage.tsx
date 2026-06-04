"use client";

import {
  parseAssistantContent,
  type AssistantBlock,
  type TextSegment,
} from "@/lib/parse-assistant-content";

function InlineText({ segments }: { segments: TextSegment[] }) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.type === "bold" ? (
          <strong key={index} className="font-semibold text-zinc-900 dark:text-zinc-50">
            {segment.value}
          </strong>
        ) : (
          <span key={index}>{segment.value}</span>
        ),
      )}
    </>
  );
}

function OrderedListBlock({
  items,
}: {
  items: Extract<AssistantBlock, { kind: "ordered" }>["items"];
}) {
  return (
    <ol className="mt-3 flex flex-col gap-2.5">
      {items.map((item) => (
        <li
          key={`${item.index}-${item.title}`}
          className="flex gap-3 rounded-xl border border-zinc-200/80 bg-white px-3.5 py-3 dark:border-zinc-700/80 dark:bg-zinc-900/60"
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            aria-hidden
          >
            {item.index}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function UnorderedListBlock({
  items,
}: {
  items: Extract<AssistantBlock, { kind: "unordered" }>["items"];
}) {
  return (
    <ul className="mt-2 list-disc space-y-1.5 pl-5">
      {items.map((segments, index) => (
        <li key={index}>
          <InlineText segments={segments} />
        </li>
      ))}
    </ul>
  );
}

export default function AssistantMessage({ content }: { content: string }) {
  const blocks = parseAssistantContent(content);

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.kind === "paragraph") {
          return (
            <p key={index} className="leading-relaxed">
              <InlineText segments={block.segments} />
            </p>
          );
        }

        if (block.kind === "ordered") {
          return <OrderedListBlock key={index} items={block.items} />;
        }

        return <UnorderedListBlock key={index} items={block.items} />;
      })}
    </div>
  );
}
