import { escapeHtml } from "./html.js";
import type { Heading } from "./markdown.js";

export interface TocOptions {
  /** Headings to leave out of the table of contents, matched on their text (case-insensitive). */
  exclude?: string[];
  /** Change the text shown in the table of contents for a heading. */
  label?: (heading: Heading) => string;
}

/**
 * Build the entries of the side table of contents: every h2 is an entry, the h3 that follow it are nested under it.
 * Returns a list of `<li>` elements (without the surrounding `<ul>`), or an empty string if there is nothing to show.
 */
export function buildToc(headings: Heading[], options: TocOptions = {}): string {
  const excluded = new Set((options.exclude ?? []).map((text) => text.trim().toLowerCase()));
  const labelOf = (heading: Heading): string => escapeHtml(options.label ? options.label(heading) : heading.text);
  const out: string[] = [];
  let openItem = false;
  let openSub = false;
  let skipping = false;

  const closeSub = (): void => {
    if (openSub) out.push("</ul>");
    openSub = false;
  };

  for (const heading of headings) {
    if (heading.level !== 2 && heading.level !== 3) continue;
    const hidden = excluded.has(heading.text.trim().toLowerCase());
    if (heading.level === 2) skipping = hidden; // the h3 of a hidden h2 are hidden too
    if (hidden || (heading.level === 3 && skipping)) continue;
    if (heading.level === 2 || !openItem) {
      // A level 2 heading, or a level 3 heading with no parent: a top level entry.
      closeSub();
      if (openItem) out.push("</li>");
      out.push(`<li class="h2"><a href="#${escapeHtml(heading.id)}">${labelOf(heading)}</a>`);
      openItem = true;
    } else {
      if (!openSub) {
        out.push('<ul class="sub">');
        openSub = true;
      }
      out.push(`<li><a href="#${escapeHtml(heading.id)}">${labelOf(heading)}</a></li>`);
    }
  }
  closeSub();
  if (openItem) out.push("</li>");
  return out.join("\n");
}
