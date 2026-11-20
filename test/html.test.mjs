import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { convert, markdownToHtml, renderParts, slugify } from "../dist/index.js";

const sample = readFileSync(new URL("./fixtures/sample.md", import.meta.url), "utf8");

test("slugify follows the GitHub convention", () => {
  assert.equal(slugify("1. Getting started"), "1-getting-started");
  assert.equal(slugify("2. Repérer les périphériques"), "2-repérer-les-périphériques");
  assert.equal(slugify("Plug / unplug (hot)"), "plug--unplug-hot");
});

test("convert finds the title and gives every heading a unique id", () => {
  const { title, headings, html } = convert(sample);
  assert.equal(title, "Sample guide");
  assert.deepEqual(
    headings.map((h) => h.id),
    ["sample-guide", "1-getting-started", "install---put-it-on-your-machine", "usage", "contents", "usage_1"],
  );
  assert.match(html, /<h2 id="1-getting-started"><a class="anchor" href="#1-getting-started" aria-label="Link to this section">#<\/a>1\. Getting started<\/h2>/);
  assert.match(html, /<h1 id="sample-guide">Sample guide<\/h1>/);
});

test("a title is not taken from a code block", () => {
  assert.equal(convert("```\n# not a title\n```\n\n# Real title\n").title, "Real title");
});

test("tables are wrapped and escaped pipes stay inside the cell", () => {
  const { html } = convert(sample);
  assert.match(html, /<div class="tablewrap"><table>/);
  assert.match(html, /<td><code>a \| b<\/code><\/td>/);
  assert.ok(html.endsWith("<p>The end.</p>"));
});

test("in-page links keep their accents", () => {
  const { html } = convert("[go](#2-repérer-les-périphériques)\n");
  assert.match(html, /href="#2-repérer-les-périphériques"/);
});

test("raw HTML is escaped by default and kept with the html option", () => {
  const off = convert("<b>hi</b> <script>alert(1)</script>\n").html;
  assert.match(off, /&lt;script&gt;/);
  assert.doesNotMatch(off, /<script>/);
  assert.match(convert("<b>hi</b>\n", { html: true }).html, /<b>hi<\/b>/);
});

test("the page is complete and standalone", () => {
  const page = markdownToHtml(sample);
  assert.match(page, /^<!DOCTYPE html>\n<html lang="en">/);
  assert.match(page, /<title>Sample guide<\/title>/);
  assert.match(page, /<header class="topbar">\n  <strong>Sample guide<\/strong>/);
  assert.match(page, /<nav class="toc" aria-label="Table of contents">/);
  assert.match(page, /<script>\n\(function \(\) \{/);
  assert.doesNotMatch(page, /<link |<script src|https?:\/\/fonts/);
  assert.ok(page.endsWith("</html>\n"));
});

test("the side menu nests h3 under h2 and ignores h1", () => {
  const { toc } = renderParts(sample);
  assert.equal(
    toc,
    [
      '<li class="h2"><a href="#1-getting-started">1. Getting started</a>',
      '<ul class="sub">',
      '<li><a href="#install---put-it-on-your-machine">install - put it on your machine</a></li>',
      '<li><a href="#usage">Usage</a></li>',
      "</ul>",
      "</li>",
      '<li class="h2"><a href="#contents">Contents</a>',
      "</li>",
      '<li class="h2"><a href="#usage_1">Usage</a>',
      "</li>",
    ].join("\n"),
  );
});

test("toc options: exclude, relabel, remove", () => {
  const parts = renderParts(sample, {
    toc: { exclude: ["contents", "Usage"], label: (h) => h.text.split(" - ")[0] },
  });
  assert.match(parts.toc, /<a href="#install---put-it-on-your-machine">install<\/a>/);
  assert.doesNotMatch(parts.toc, /#contents|#usage"/);
  const page = markdownToHtml(sample, { toc: false });
  assert.doesNotMatch(page, /<nav class="toc"/);
  assert.match(page, /<div class="layout no-toc">/);
});

test("a hidden h2 hides its h3 headings too", () => {
  const { toc } = renderParts("## A\n\n### a1\n\n## B\n\n### b1\n", { toc: { exclude: ["A"] } });
  assert.equal(toc, '<li class="h2"><a href="#b">B</a>\n<ul class="sub">\n<li><a href="#b1">b1</a></li>\n</ul>\n</li>');
});

test("page options: language, texts, theme and storage", () => {
  const page = markdownToHtml(sample, {
    lang: "fr",
    title: "Guide",
    siteName: "Ma doc",
    theme: "dark",
    storageKey: "my-key",
    labels: { theme: "Thème", copy: "Copier", copied: "Copié", toc: "Sommaire" },
  });
  assert.match(page, /<html lang="fr" data-theme="dark">/);
  assert.match(page, /<title>Guide<\/title>/);
  assert.match(page, /<strong>Ma doc<\/strong>/);
  assert.match(page, />Thème<\/button>/);
  assert.match(page, /aria-label="Sommaire"/);
  assert.match(page, /"copyLabel":"Copier"/);
  assert.match(page, /"storageKey":"my-key"/);
  assert.doesNotMatch(markdownToHtml(sample, { storageKey: false }), /"storageKey":"/);
});

test("the top bar can be reduced or removed", () => {
  const noName = markdownToHtml(sample, { siteName: false });
  assert.match(noName, /<header class="topbar">\n  <span class="sp"><\/span>/);
  assert.match(noName, /id="theme"/);
  const none = markdownToHtml(sample, { siteName: false, themeToggle: false });
  assert.doesNotMatch(none, /<header/);
  assert.match(none, /<body class="no-topbar">/);
});

test("css, head and script options", () => {
  const page = markdownToHtml(sample, { css: ".mine{color:red}", head: '<meta name="x" content="y">', script: false });
  assert.match(page, /\.mine\{color:red\}\n<\/style>/);
  assert.match(page, /<meta name="x" content="y">\n<\/head>/);
  assert.doesNotMatch(page, /<script>/);
});

test("untrusted values cannot break out of the page", () => {
  const page = markdownToHtml("# T\n", {
    title: "</title><script>x</script>",
    siteName: '"><img src=x>',
    labels: { copy: "</script><script>alert(1)</script>" },
  });
  assert.doesNotMatch(page, /<script>x<\/script>/);
  assert.doesNotMatch(page, /<img src=x>/);
  assert.equal(page.split("<script>").length - 1, 1);
});

test("text with replacement patterns is left alone", () => {
  assert.ok(markdownToHtml("# T\n\nprice $& $1 $'\n").includes("price $&amp; $1 $'"));
});
