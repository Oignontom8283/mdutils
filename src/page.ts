import { escapeHtml } from "./html.js";
import { convert } from "./markdown.js";
import type { Heading, MarkdownOptions } from "./markdown.js";
import { clientScript } from "./script.js";
import { styles } from "./styles.js";
import { buildToc } from "./toc.js";
import type { TocOptions } from "./toc.js";

/** Texts shown by the page itself. Translate them with the `labels` option. */
export interface Labels {
  /** Text of the theme button. */
  theme: string;
  /** Tooltip of the theme button. */
  themeTitle: string;
  /** Text of the copy button of code blocks. */
  copy: string;
  /** Text of the copy button right after a successful copy. */
  copied: string;
  /** Accessible label of the "#" link next to headings. */
  anchor: string;
  /** Accessible name of the table of contents. */
  toc: string;
}

export interface PageOptions extends MarkdownOptions {
  /** Language of the page (`lang` attribute). Default: "en". */
  lang?: string;
  /** Title of the browser tab. Default: the first level 1 heading, or "Document". */
  title?: string;
  /** Name shown in the top bar. Default: the title. `false` shows no name. */
  siteName?: string | false;
  /** Theme to start with: follow the system ("auto"), or force "light" or "dark". Default: "auto". */
  theme?: "auto" | "light" | "dark";
  /** Show the button that switches between light and dark. Default: true. */
  themeToggle?: boolean;
  /** Show a copy button on code blocks. Default: true. */
  copyButtons?: boolean;
  /** localStorage key remembering the chosen theme. `false` remembers nothing. Default: "mdutils-theme". */
  storageKey?: string | false;
  /** Side table of contents (h2 and h3). `false` removes it. Default: true. */
  toc?: boolean | TocOptions;
  /** Replace some of the texts of the page (translation). */
  labels?: Partial<Labels>;
  /** Extra CSS added after the built-in stylesheet. */
  css?: string;
  /** Extra HTML added at the end of `<head>`. */
  head?: string;
  /** Include the small script (copy buttons, theme button, table of contents highlight). Default: true. */
  script?: boolean;
}

export const defaultLabels: Labels = {
  theme: "Theme",
  themeTitle: "Switch between light and dark theme",
  copy: "Copy",
  copied: "Copied",
  anchor: "Link to this section",
  toc: "Table of contents",
};

export interface PageParts {
  /** Resolved title of the document. */
  title: string;
  /** HTML of the document body. */
  html: string;
  /** Every heading of the document. */
  headings: Heading[];
  /** `<li>` entries of the table of contents (empty when there is none). */
  toc: string;
  /** The built-in stylesheet, followed by the `css` option. */
  css: string;
  /** The page script (empty when `script` is false). */
  script: string;
  /** Text of the labels in use. */
  labels: Labels;
}

/**
 * Everything needed to build a page, in pieces: use this to place the rendered Markdown inside your own layout.
 */
export function renderParts(markdown: string, options: PageOptions = {}): PageParts {
  const labels: Labels = { ...defaultLabels, ...options.labels };
  const converted = convert(markdown, { html: options.html, anchorLabel: labels.anchor });
  const tocOptions = options.toc === false ? undefined : options.toc === true || options.toc === undefined ? {} : options.toc;
  const storageKey = options.storageKey === undefined ? "mdutils-theme" : options.storageKey;
  return {
    title: options.title ?? converted.title ?? "Document",
    html: converted.html,
    headings: converted.headings,
    toc: tocOptions ? buildToc(converted.headings, tocOptions) : "",
    css: options.css ? `${styles}${options.css}\n` : styles,
    script:
      options.script === false
        ? ""
        : clientScript({
            copyButtons: options.copyButtons !== false,
            copyLabel: labels.copy,
            copiedLabel: labels.copied,
            storageKey: storageKey === false ? null : storageKey,
          }),
    labels,
  };
}

/** Convert Markdown to a complete, standalone HTML page (styles and script included, nothing to download). */
export function markdownToHtml(markdown: string, options: PageOptions = {}): string {
  const parts = renderParts(markdown, options);
  const lang = options.lang ?? "en";
  const siteName = options.siteName === undefined ? parts.title : options.siteName;
  const themeToggle = options.themeToggle !== false;
  const hasTopbar = siteName !== false || themeToggle;
  const rootAttr = options.theme === "light" || options.theme === "dark" ? ` data-theme="${options.theme}"` : "";

  const header = hasTopbar
    ? [
        '<header class="topbar">',
        siteName === false ? "" : `  <strong>${escapeHtml(siteName)}</strong>`,
        '  <span class="sp"></span>',
        themeToggle
          ? `  <button class="btn" id="theme" type="button" title="${escapeHtml(parts.labels.themeTitle)}">${escapeHtml(parts.labels.theme)}</button>`
          : "",
        "</header>",
      ].filter(Boolean)
    : [];

  const nav = parts.toc
    ? [`  <nav class="toc" aria-label="${escapeHtml(parts.labels.toc)}">`, "    <ul>", parts.toc, "    </ul>", "  </nav>"]
    : [];

  return [
    "<!DOCTYPE html>",
    `<html lang="${escapeHtml(lang)}"${rootAttr}>`,
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(parts.title)}</title>`,
    "<style>",
    parts.css + "</style>",
    ...(options.head ? [options.head] : []),
    "</head>",
    hasTopbar ? "<body>" : '<body class="no-topbar">',
    ...header,
    `<div class="layout${parts.toc ? "" : " no-toc"}">`,
    ...nav,
    "  <main>",
    parts.html,
    "  </main>",
    "</div>",
    ...(parts.script ? ["<script>", parts.script + "</script>"] : []),
    "</body>",
    "</html>",
    "",
  ].join("\n");
}
