import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
const run = (args, input) => spawnSync(process.execPath, [cli, ...args], { input, encoding: "utf8" });

const dir = mkdtempSync(join(tmpdir(), "mdutils-test-"));
const md = join(dir, "doc.md");
writeFileSync(md, "# Doc\n\n## Part\n\nHello `world`.\n");
test.after(() => rmSync(dir, { recursive: true, force: true }));

test("html writes the page next to the input by default", () => {
  const r = run(["html", md]);
  assert.equal(r.status, 0);
  const page = readFileSync(join(dir, "doc.html"), "utf8");
  assert.match(page, /<title>Doc<\/title>/);
  assert.match(page, /Hello <code>world<\/code>/);
});

test("html accepts -o, options and a CSS file", () => {
  const css = join(dir, "extra.css");
  writeFileSync(css, ".extra{color:red}");
  const out = join(dir, "custom.html");
  const r = run(["html", md, "-o", out, "--lang", "fr", "--theme", "dark", "--no-toc", "--css", css, "--label", "copy=Copier"]);
  assert.equal(r.status, 0);
  const page = readFileSync(out, "utf8");
  assert.match(page, /<html lang="fr" data-theme="dark">/);
  assert.match(page, /\.extra\{color:red\}/);
  assert.match(page, /"copyLabel":"Copier"/);
  assert.doesNotMatch(page, /<nav class="toc"/);
});

test("html reads standard input and writes standard output", () => {
  const r = run(["html", "-"], "# From stdin\n");
  assert.equal(r.status, 0);
  assert.match(r.stdout, /<title>From stdin<\/title>/);
  assert.ok(!existsSync("-.html"));
});

test("raw HTML needs --allow-html", () => {
  assert.match(run(["html", "-"], "<b>x</b>\n").stdout, /&lt;b&gt;x&lt;\/b&gt;/);
  assert.match(run(["html", "-", "--allow-html"], "<b>x</b>\n").stdout, /<b>x<\/b>/);
});

test("errors are readable and exit with a non zero code", () => {
  const missing = run(["html", join(dir, "nope.md")]);
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /mdutils: cannot read ".*nope\.md": no such file/);
  assert.match(run(["html", md, "--theme", "blue"]).stderr, /invalid --theme "blue"/);
  assert.match(run(["html", md, "--label", "nope=x"]).stderr, /invalid --label/);
  assert.match(run(["unknown"]).stderr, /unknown command "unknown"/);
  assert.equal(run(["html", md, "--bogus"]).status, 2);
});

test("help and version", () => {
  const help = run(["--help"]);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Usage:/);
  assert.match(run(["--version"]).stdout, /^\d+\.\d+\.\d+/);
});
