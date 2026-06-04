export type TextSegment =
  | { type: "text"; value: string }
  | { type: "bold"; value: string };

export type OrderedItem = {
  index: number;
  title: string;
  description: string;
};

export type AssistantBlock =
  | { kind: "paragraph"; segments: TextSegment[] }
  | { kind: "ordered"; items: OrderedItem[] }
  | { kind: "unordered"; items: TextSegment[][] };

const ORDERED_ITEM_REGEX =
  /(\d+)\.\s+\*\*([^*]+)\*\*\s*[–\-:]\s*([\s\S]*?)(?=\s*\d+\.\s+\*\*|$)/g;

const ORDERED_LINE_REGEX =
  /^(\d+)\.\s+\*\*([^*]+)\*\*\s*[–\-:]\s*(.+)$/;
const BULLET_LINE_REGEX = /^[-*]\s+(.+)$/;
const HEADING_REGEX = /^(#{1,3})\s+(.+)$/;

export function parseInlineSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "bold", value: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }];
}

function extractInlineOrderedItems(text: string): {
  intro: string | null;
  items: OrderedItem[];
} {
  const firstMatch = ORDERED_ITEM_REGEX.exec(text);
  if (!firstMatch) {
    ORDERED_ITEM_REGEX.lastIndex = 0;
    return { intro: null, items: [] };
  }

  const intro = text.slice(0, firstMatch.index).trim().replace(/:\s*$/, "") || null;
  const items: OrderedItem[] = [];

  ORDERED_ITEM_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ORDERED_ITEM_REGEX.exec(text)) !== null) {
    items.push({
      index: Number.parseInt(match[1], 10),
      title: match[2].trim(),
      description: match[3].trim(),
    });
  }

  return { intro, items };
}

function flushParagraph(lines: string[], blocks: AssistantBlock[]) {
  const text = lines.join(" ").trim();
  lines.length = 0;
  if (text) {
    blocks.push({ kind: "paragraph", segments: parseInlineSegments(text) });
  }
}

export function parseAssistantContent(raw: string): AssistantBlock[] {
  const content = raw.trim();
  if (!content) {
    return [];
  }

  const { intro, items: inlineItems } = extractInlineOrderedItems(content);
  if (inlineItems.length > 0) {
    const blocks: AssistantBlock[] = [];
    if (intro) {
      blocks.push({ kind: "paragraph", segments: parseInlineSegments(intro) });
    }
    blocks.push({ kind: "ordered", items: inlineItems });
    return blocks;
  }

  const lines = content.split(/\r?\n/);
  const blocks: AssistantBlock[] = [];
  const paragraphLines: string[] = [];
  let orderedItems: OrderedItem[] | null = null;
  let bulletItems: TextSegment[][] | null = null;

  function flushOrdered() {
    if (orderedItems && orderedItems.length > 0) {
      blocks.push({ kind: "ordered", items: orderedItems });
    }
    orderedItems = null;
  }

  function flushBullets() {
    if (bulletItems && bulletItems.length > 0) {
      blocks.push({ kind: "unordered", items: bulletItems });
    }
    bulletItems = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(paragraphLines, blocks);
      flushOrdered();
      flushBullets();
      continue;
    }

    const headingMatch = trimmed.match(HEADING_REGEX);
    if (headingMatch) {
      flushParagraph(paragraphLines, blocks);
      flushOrdered();
      flushBullets();
      blocks.push({
        kind: "paragraph",
        segments: [
          {
            type: "bold",
            value: headingMatch[2].trim(),
          },
        ],
      });
      continue;
    }

    const orderedMatch = trimmed.match(ORDERED_LINE_REGEX);
    if (orderedMatch) {
      flushParagraph(paragraphLines, blocks);
      flushBullets();
      if (!orderedItems) {
        orderedItems = [];
      }
      orderedItems.push({
        index: Number.parseInt(orderedMatch[1], 10),
        title: orderedMatch[2].trim(),
        description: orderedMatch[3].trim(),
      });
      continue;
    }

    const bulletMatch = trimmed.match(BULLET_LINE_REGEX);
    if (bulletMatch) {
      flushParagraph(paragraphLines, blocks);
      flushOrdered();
      if (!bulletItems) {
        bulletItems = [];
      }
      bulletItems.push(parseInlineSegments(bulletMatch[1].trim()));
      continue;
    }

    flushOrdered();
    flushBullets();
    paragraphLines.push(trimmed);
  }

  flushParagraph(paragraphLines, blocks);
  flushOrdered();
  flushBullets();

  if (blocks.length > 0) {
    return blocks;
  }

  return [{ kind: "paragraph", segments: parseInlineSegments(content) }];
}
