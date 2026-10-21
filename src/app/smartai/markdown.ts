/**
 * Tiny Markdown subset used by SmartAI answers: headings, lists, tables,
 * quotes, rules and paragraphs. Parsed into plain data and rendered as React
 * elements (never as HTML), so model output cannot inject markup.
 */
export type Block =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "table"; header: string[]; rows: string[][] }
  | { kind: "quote"; text: string }
  | { kind: "rule" }
  | { kind: "paragraph"; text: string };

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const isTableSeparator = (line: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);

export function parseMarkdown(text: string): Block[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length > 0) blocks.push({ kind: "paragraph", text: paragraph.join("\n") });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flush();
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flush();
      blocks.push({ kind: "heading", level: heading[1].length <= 2 ? 2 : 3, text: heading[2].replace(/#+$/, "").trim() });
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flush();
      blocks.push({ kind: "rule" });
      continue;
    }

    if (trimmed.startsWith("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flush();
      const header = cells(trimmed);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(cells(lines[i]));
        i++;
      }
      i--;
      blocks.push({ kind: "table", header, rows });
      continue;
    }

    const bullet = trimmed.match(/^([-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      flush();
      const ordered = /\d/.test(bullet[1]);
      const last = blocks[blocks.length - 1];
      if (last?.kind === "list" && last.ordered === ordered) last.items.push(bullet[2]);
      else blocks.push({ kind: "list", ordered, items: [bullet[2]] });
      continue;
    }

    if (trimmed.startsWith(">")) {
      flush();
      const text = trimmed.replace(/^>\s?/, "");
      const last = blocks[blocks.length - 1];
      if (last?.kind === "quote") last.text += `\n${text}`;
      else blocks.push({ kind: "quote", text });
      continue;
    }

    paragraph.push(trimmed);
  }
  flush();
  return blocks;
}

export type Inline = { text: string; bold?: boolean; italic?: boolean };

/** Splits **bold** and _italic_ runs. */
export function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  const pattern = /\*\*(.+?)\*\*|(?<![\p{L}\d])_(.+?)_(?![\p{L}\d])/gu;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    if (match[1] !== undefined) parts.push({ text: match[1], bold: true });
    else parts.push({ text: match[2], italic: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/** Plain-text version of an answer (for copying into WhatsApp or a .txt). */
export function toPlainText(text: string): string {
  return text
    .split("\n")
    .filter((line) => !isTableSeparator(line))
    .map((line) =>
      line
        .replace(/^#{1,4}\s+/, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/^\|\s*|\s*\|$/g, "")
        .replace(/\s*\|\s*/g, " · "),
    )
    .join("\n")
    .trim();
}
