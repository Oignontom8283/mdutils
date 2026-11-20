/**
 * Turn a heading text into an anchor name, following the GitHub convention:
 * lowercase, keep letters, digits, underscores, spaces and dashes, then turn spaces into dashes.
 * "1. Getting started" becomes "1-getting-started", so hand written links like `#1-getting-started` work.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\s-]/gu, "")
    .split(" ")
    .join("-");
}

/**
 * Make an id unique among the ids already used on the page by appending `_1`, `_2`, ...
 * The chosen id is added to `used`.
 */
export function uniqueId(id: string, used: Set<string>): string {
  while (used.has(id) || !id) {
    const match = /^(.*)_([0-9]+)$/.exec(id);
    id = match ? `${match[1]}_${Number(match[2]) + 1}` : `${id}_1`;
  }
  used.add(id);
  return id;
}
