import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { mount } from "../dist/index.js";

/** A tiny stand-in for the DOM: enough to see what mount() does. */
function fakeTarget() {
  const target = {
    child: undefined,
    replaceChildren(node) {
      this.child = node;
    },
    ownerDocument: {
      createElement(tag) {
        const attrs = {};
        return { tag, attrs, style: {}, title: "", srcdoc: "", setAttribute: (k, v) => (attrs[k] = v) };
      },
    },
  };
  return target;
}

test("mount puts the rendered page in an iframe", () => {
  const target = fakeTarget();
  const frame = mount(target, "# Hello\n\n## Part\n", { lang: "fr", height: "80vh" });
  assert.equal(target.child, frame);
  assert.equal(frame.tag, "iframe");
  assert.match(frame.srcdoc, /^<!DOCTYPE html>\n<html lang="fr">/);
  assert.match(frame.srcdoc, /<title>Hello<\/title>/);
  assert.match(frame.style.cssText, /height:80vh/);
  assert.equal(frame.title, "Document");
  assert.equal(frame.attrs.allow, "clipboard-write");
});

test("mount takes the frame title from the options", () => {
  assert.equal(mount(fakeTarget(), "# A\n", { title: "Guide" }).title, "Guide");
});

test("the frame is sandboxed only when raw HTML is enabled, unless told otherwise", () => {
  assert.equal(mount(fakeTarget(), "# A\n").attrs.sandbox, undefined);
  assert.equal(mount(fakeTarget(), "# A\n", { html: true }).attrs.sandbox, "allow-scripts allow-popups");
  assert.equal(mount(fakeTarget(), "# A\n", { html: true, sandbox: false }).attrs.sandbox, undefined);
  assert.equal(mount(fakeTarget(), "# A\n", { sandbox: "allow-scripts" }).attrs.sandbox, "allow-scripts");
});

test("the browser bundle runs without Node.js and exposes the library", () => {
  const code = readFileSync(new URL("../dist/mdutils.browser.js", import.meta.url), "utf8");
  const sandbox = {};
  runInNewContext(code, sandbox); // an empty context: no require, no process, no Buffer
  const { mdutils } = sandbox;
  assert.equal(typeof mdutils.markdownToHtml, "function");
  assert.equal(typeof mdutils.mount, "function");
  assert.equal(typeof mdutils.renderParts, "function");
  assert.match(mdutils.markdownToHtml("# Browser\n"), /<title>Browser<\/title>/);
});
