# mdutils demo

A short document showing what a page produced by mdutils looks like.
Everything you see here comes from plain Markdown: **bold**, *italic*, `inline code` and [links](#code-blocks).

> Hover a code block to reveal its copy button, and use the top-right button to switch between the light and dark themes.

## Getting started

### Install and run

```bash
npm install --global github:Oignontom8283/mdutils
mdutils html examples/demo.md
```

The command writes `examples/demo.html`: one file, no external resources, ready to open or share.

### Add it to a script

```js
import { markdownToHtml } from "mdutils";

const page = markdownToHtml("# Hello\n\nSome *Markdown*.");
```

## Writing content

### Code blocks

Fenced blocks keep their formatting and get a copy button.

```
$ ls -l
total 8
-rw-r--r-- 1 me me 120 Jan  1 10:00 notes.txt
```

### Tables

| Option | Effect |
|---|---|
| `--theme dark` | start in the dark theme |
| `--no-toc` | hide the side menu |
| `--lang fr` | set the language of the page |

### Lists

- Headings become a side menu that follows your reading.
- Anchors appear next to h2 and h3 titles when you hover them.
- The layout adapts to phones and prints cleanly.

1. Write Markdown
2. Run `mdutils html`
3. Share the file

## Good to know

Raw HTML in the Markdown is shown as text unless you turn it on, so untrusted content stays safe by default.
