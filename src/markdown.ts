import MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import { escapeHtml } from "./html.js";
import { slugify, uniqueId } from "./slug.js";

export interface MarkdownOptions {
  /**
   * Let raw HTML written in the Markdown source through to the output.
   * Leave it off (the default) for content you do not trust: tags are then shown as text.
   */
  html?: boolean;
}

export interface ConvertOptions extends MarkdownOptions {
  /** Accessible label of the "#" link shown next to h2 and h3 headings. Default: "Link to this section". */
  anchorLabel?: string;
}

export interface Heading {
  /** 1 to 6 */
  level: number;
  /** Anchor name, unique in the document. */
  id: string;
  /** Plain text of the heading (inline code kept, markup removed). */
  text: string;
}

export interface Converted {
  /** Text of the first level 1 heading, if the document has one. */
  title: string | undefined;
  /** HTML of the document body. */
  html: string;
  /** Every heading of the document, in order. */
  headings: Heading[];
}

interface Env {
  headings: Heading[];
  anchorLabel: string;
}

function headingText(inline: Token | undefined): string {
  if (!inline?.children) return "";
  let text = "";
  for (const child of inline.children) {
    if (child.type === "text" || child.type === "code_inline") text += child.content;
    else if (child.type === "softbreak" || child.type === "hardbreak") text += " ";
  }
  return text;
}

function createParser(html: boolean): MarkdownIt {
  const md = new MarkdownIt({ html, linkify: false, typographer: false });

  // In-page links (#section) are kept as written, accents included.
  const normalizeLink = md.normalizeLink;
  md.normalizeLink = (url) => (url.startsWith("#") ? url : normalizeLink(url));

  // Give every heading an id and record it.
  md.core.ruler.push("heading_ids", (state) => {
    const env = state.env as Env;
    const used = new Set<string>();
    state.tokens.forEach((token, i) => {
      if (token.type !== "heading_open") return;
      const text = headingText(state.tokens[i + 1]);
      const id = uniqueId(slugify(text), used);
      token.attrSet("id", id);
      env.headings.push({ level: Number(token.tag.slice(1)), id, text });
    });
    return true;
  });

  // h2 and h3 get a clickable "#" anchor.
  md.renderer.rules.heading_open = (tokens, idx, _options, env: Env) => {
    const token = tokens[idx];
    const id = escapeHtml(token.attrGet("id") ?? "");
    const anchor =
      token.tag === "h2" || token.tag === "h3"
        ? `<a class="anchor" href="#${id}" aria-label="${escapeHtml(env.anchorLabel)}">#</a>`
        : "";
    return `<${token.tag} id="${id}">${anchor}`;
  };

  // Tables scroll sideways inside their own box on narrow screens.
  md.renderer.rules.table_open = () => '<div class="tablewrap"><table>\n';
  md.renderer.rules.table_close = () => "</table></div>\n";

  return md;
}

const parsers = new Map<boolean, MarkdownIt>();

/** Convert Markdown to an HTML body and collect its headings. */
export function convert(markdown: string, options: ConvertOptions = {}): Converted {
  const html = options.html === true;
  let md = parsers.get(html);
  if (!md) {
    md = createParser(html);
    parsers.set(html, md);
  }
  const env: Env = { headings: [], anchorLabel: options.anchorLabel ?? "Link to this section" };
  const body = md.render(markdown, env).replace(/\n+$/, "");
  const title = env.headings.find((h) => h.level === 1)?.text.trim();
  return { title, html: body, headings: env.headings };
}
