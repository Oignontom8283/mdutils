#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { parseArgs } from "node:util";
import { defaultLabels, markdownToHtml } from "./page.js";
import type { Labels, PageOptions } from "./page.js";

/** Error shown to the user without a stack trace. */
class UsageError extends Error {}

const HELP = `mdutils - tools to work with Markdown

Usage:
  mdutils <command> [arguments] [options]

Commands:
  html <input.md>      Convert a Markdown file to a standalone HTML page

Use "-" as input to read from standard input and "-o -" to write to standard output.

Options for html:
  -o, --output <file>      Output file (default: the input name with .html)
      --title <text>       Title of the browser tab (default: the first "# heading")
      --lang <code>        Language of the page (default: en)
      --site-name <text>   Name shown in the top bar (default: the title)
      --no-site-name       Do not show a name in the top bar
      --theme <mode>       auto (default), light or dark
      --no-theme-toggle    Remove the light/dark button
      --no-copy-buttons    Remove the copy button on code blocks
      --no-toc             Remove the side table of contents
      --toc-exclude <text> Leave a heading out of the table of contents (repeatable)
      --storage-key <key>  localStorage key remembering the theme (default: mdutils-theme)
      --no-storage         Do not remember the theme
      --css <file>         Add the content of a CSS file after the built-in styles
      --label <name=text>  Change a text of the page (repeatable). Names: ${Object.keys(defaultLabels).join(", ")}
      --allow-html         Keep raw HTML found in the Markdown (off by default)
  -h, --help               Show this help
  -v, --version            Show the version
`;

const PAGE_FLAGS = {
  title: { type: "string" },
  lang: { type: "string" },
  "site-name": { type: "string" },
  "no-site-name": { type: "boolean" },
  theme: { type: "string" },
  "no-theme-toggle": { type: "boolean" },
  "no-copy-buttons": { type: "boolean" },
  "no-toc": { type: "boolean" },
  "toc-exclude": { type: "string", multiple: true },
  "storage-key": { type: "string" },
  "no-storage": { type: "boolean" },
  css: { type: "string" },
  label: { type: "string", multiple: true },
  "allow-html": { type: "boolean" },
} as const;

type PageValues = {
  title?: string;
  lang?: string;
  "site-name"?: string;
  "no-site-name"?: boolean;
  theme?: string;
  "no-theme-toggle"?: boolean;
  "no-copy-buttons"?: boolean;
  "no-toc"?: boolean;
  "toc-exclude"?: string[];
  "storage-key"?: string;
  "no-storage"?: boolean;
  css?: string;
  label?: string[];
  "allow-html"?: boolean;
};

function readText(file: string): string {
  try {
    return readFileSync(file === "-" ? 0 : file, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") throw new UsageError(`cannot read "${file}": no such file`);
    throw new UsageError(`cannot read "${file}": ${(error as Error).message}`);
  }
}

function pageOptions(values: PageValues): PageOptions {
  const options: PageOptions = {};
  if (values.title !== undefined) options.title = values.title;
  if (values.lang !== undefined) options.lang = values.lang;
  if (values["no-site-name"]) options.siteName = false;
  else if (values["site-name"] !== undefined) options.siteName = values["site-name"];
  if (values.theme !== undefined) {
    if (values.theme !== "auto" && values.theme !== "light" && values.theme !== "dark") {
      throw new UsageError(`invalid --theme "${values.theme}" (use auto, light or dark)`);
    }
    options.theme = values.theme;
  }
  if (values["no-theme-toggle"]) options.themeToggle = false;
  if (values["no-copy-buttons"]) options.copyButtons = false;
  if (values["no-toc"]) options.toc = false;
  else if (values["toc-exclude"]) options.toc = { exclude: values["toc-exclude"] };
  if (values["no-storage"]) options.storageKey = false;
  else if (values["storage-key"] !== undefined) options.storageKey = values["storage-key"];
  if (values.css !== undefined) options.css = readText(values.css);
  if (values["allow-html"]) options.html = true;
  if (values.label) {
    const labels: Partial<Labels> = {};
    for (const entry of values.label) {
      const at = entry.indexOf("=");
      const name = entry.slice(0, at);
      if (at < 1 || !(name in defaultLabels)) {
        throw new UsageError(`invalid --label "${entry}" (use name=text, names: ${Object.keys(defaultLabels).join(", ")})`);
      }
      labels[name as keyof Labels] = entry.slice(at + 1);
    }
    options.labels = labels;
  }
  return options;
}

function defaultOutput(input: string, extension: string): string | undefined {
  if (input === "-") return undefined;
  return input.slice(0, input.length - extname(input).length) + extension;
}

function write(output: string | undefined, content: string): void {
  if (output === undefined || output === "-") process.stdout.write(content);
  else {
    writeFileSync(output, content, "utf8");
    console.error(`${basename(output)} written`);
  }
}

function runHtml(args: string[]): void {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: { output: { type: "string", short: "o" }, ...PAGE_FLAGS },
  });
  if (positionals.length !== 1) throw new UsageError("expected exactly one input file (use - for standard input)");
  const input = positionals[0];
  const html = markdownToHtml(readText(input), pageOptions(values as PageValues));
  write(values.output ?? defaultOutput(input, ".html"), html);
}

function version(): string {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
  return pkg.version;
}

function main(argv: string[]): void {
  const [command, ...rest] = argv;
  if (!command || command === "-h" || command === "--help" || command === "help") {
    process.stdout.write(HELP);
    process.exitCode = command ? 0 : 1;
    return;
  }
  if (command === "-v" || command === "--version") {
    console.log(version());
    return;
  }
  if (rest.includes("-h") || rest.includes("--help")) {
    process.stdout.write(HELP);
    return;
  }
  switch (command) {
    case "html":
      return runHtml(rest);
    default:
      throw new UsageError(`unknown command "${command}"`);
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`mdutils: ${message}`);
  if (error instanceof UsageError || (error as NodeJS.ErrnoException).code?.startsWith("ERR_PARSE_ARGS")) {
    console.error('Run "mdutils --help" for usage.');
    process.exitCode = 2;
  } else {
    process.exitCode = 1;
  }
}
