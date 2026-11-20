/** Stylesheet of the generated page (light and dark themes, layout, print). */
export const styles = `:root {
  color-scheme: light;
  --bg: #f7f8fa; --surface: #ffffff; --ink: #1c2330; --muted: #5d6779; --line: #e1e5ec;
  --accent: #0b6bcb; --accent-soft: #e6f0fb; --code-bg: #101826; --code-ink: #e6edf7;
  --inline-bg: #eef1f6; --inline-ink: #b3361f; --quote-bg: #fff7e0; --quote-line: #e2a600;
  --th-bg: #f0f3f8;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --bg: #0e131b; --surface: #151c27; --ink: #e4e9f1; --muted: #98a3b6; --line: #263041;
    --accent: #6cb2ff; --accent-soft: #16283f; --code-bg: #0a0f17; --code-ink: #e6edf7;
    --inline-bg: #1c2533; --inline-ink: #ff9d85; --quote-bg: #2a2410; --quote-line: #c79a1a;
    --th-bg: #1b2433;
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0e131b; --surface: #151c27; --ink: #e4e9f1; --muted: #98a3b6; --line: #263041;
  --accent: #6cb2ff; --accent-soft: #16283f; --code-bg: #0a0f17; --code-ink: #e6edf7;
  --inline-bg: #1c2533; --inline-ink: #ff9d85; --quote-bg: #2a2410; --quote-line: #c79a1a;
  --th-bg: #1b2433;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 5rem; }
body { margin: 0; background: var(--bg); color: var(--ink);
  font: 16px/1.65 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
.topbar { position: sticky; top: 0; z-index: 5; background: color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter: blur(8px); border-bottom: 1px solid var(--line);
  display: flex; align-items: center; gap: .75rem; padding: .6rem 1rem; }
.topbar strong { font-size: 1rem; }
.topbar .sp { flex: 1; }
.btn { border: 1px solid var(--line); background: var(--surface); color: var(--ink); border-radius: 8px;
  padding: .35rem .7rem; font: inherit; font-size: .85rem; cursor: pointer; }
.btn:hover { border-color: var(--accent); color: var(--accent); }
.layout { display: grid; grid-template-columns: 17rem minmax(0, 1fr); gap: 2rem;
  max-width: 78rem; margin: 0 auto; padding: 1.5rem 1rem 4rem; }
nav.toc { position: sticky; top: 4.2rem; align-self: start; max-height: calc(100vh - 5.5rem); overflow: auto;
  font-size: .88rem; padding-right: .5rem; }
nav.toc ul { list-style: none; margin: 0; padding: 0; }
nav.toc li.h2 { margin-top: .55rem; }
nav.toc li.h2 > a { font-weight: 600; color: var(--ink); }
nav.toc ul.sub { margin: .15rem 0 0 .6rem; border-left: 2px solid var(--line); padding-left: .6rem; }
nav.toc a { display: block; padding: .15rem .3rem; border-radius: 6px; color: var(--muted); text-decoration: none; }
nav.toc a:hover, nav.toc a.on { background: var(--accent-soft); color: var(--accent); }
main { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 1.5rem 2rem 2.5rem;
  min-width: 0; }
h1 { font-size: 2rem; line-height: 1.2; margin: .2rem 0 1rem; }
h2 { font-size: 1.45rem; margin: 2.6rem 0 .8rem; padding-bottom: .35rem; border-bottom: 2px solid var(--line); }
h3 { font-size: 1.12rem; margin: 2rem 0 .5rem; }
h3 code { font-size: 1.05em; }
h4 { margin: 1.4rem 0 .4rem; }
.anchor { margin-left: -1.1em; padding-right: .3em; opacity: 0; color: var(--accent); text-decoration: none; font-weight: 400; }
h2:hover .anchor, h3:hover .anchor, .anchor:focus { opacity: 1; }
a { color: var(--accent); }
p, li { max-width: 74ch; }
code { font: .88em/1.4 ui-monospace, "Cascadia Code", Consolas, "Courier New", monospace;
  background: var(--inline-bg); color: var(--inline-ink); padding: .1em .38em; border-radius: 5px; }
.codewrap { position: relative; margin: 1rem 0; }
pre { margin: 0; background: var(--code-bg); color: var(--code-ink); border-radius: 10px; padding: .9rem 1rem;
  overflow-x: auto; font-size: .88rem; line-height: 1.55; }
pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
.copy { position: absolute; top: .4rem; right: .5rem; border: 1px solid #ffffff33; background: #ffffff14; color: #cdd7e6;
  border-radius: 6px; padding: .15rem .55rem; font-size: .75rem; cursor: pointer; opacity: 0; transition: opacity .15s; }
.codewrap:hover .copy, .copy:focus { opacity: 1; }
.copy.ok { background: #1d7a46; border-color: #1d7a46; color: #fff; opacity: 1; }
blockquote { margin: 1.1rem 0; padding: .7rem 1rem; background: var(--quote-bg); border-left: 4px solid var(--quote-line);
  border-radius: 0 8px 8px 0; }
blockquote p { margin: .25rem 0; }
.tablewrap { overflow-x: auto; margin: 1rem 0; border: 1px solid var(--line); border-radius: 10px; }
table { border-collapse: collapse; width: 100%; font-size: .93rem; }
th, td { text-align: left; padding: .5rem .8rem; border-bottom: 1px solid var(--line); vertical-align: top; }
th { background: var(--th-bg); font-weight: 600; white-space: nowrap; }
tr:last-child td { border-bottom: 0; }
td:first-child { white-space: nowrap; }
hr { border: 0; border-top: 1px solid var(--line); margin: 2.2rem 0; }
ul, ol { padding-left: 1.4rem; }
li { margin: .2rem 0; }
.layout.no-toc { grid-template-columns: minmax(0, 1fr); max-width: 54rem; }
body.no-topbar nav.toc { top: 1rem; max-height: calc(100vh - 2rem); }
@media (max-width: 62rem) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  nav.toc { position: static; max-height: none; border: 1px solid var(--line); border-radius: 12px; padding: .6rem .8rem;
    background: var(--surface); }
  main { padding: 1.1rem 1rem 2rem; }
  .anchor { display: none; }
}
@media print {
  :root, :root:not([data-theme="light"]), :root[data-theme="dark"] {
    color-scheme: light;
    --bg: #ffffff; --surface: #ffffff; --ink: #1c2330; --muted: #5d6779; --line: #e1e5ec;
    --accent: #0b6bcb; --accent-soft: #e6f0fb; --code-bg: #101826; --code-ink: #e6edf7;
    --inline-bg: #eef1f6; --inline-ink: #b3361f; --quote-bg: #fff7e0; --quote-line: #e2a600;
    --th-bg: #f0f3f8;
  }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .topbar, nav.toc, .copy, .anchor { display: none !important; }
  .layout { display: block; padding: 0; max-width: none; } main { border: 0; padding: 0; }
  pre { white-space: pre-wrap; }
  .tablewrap { overflow: visible; }
  h1, h2, h3, h4 { break-after: avoid; }
  pre, blockquote, tr, img { break-inside: avoid; }
}
`;
