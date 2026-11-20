export interface ScriptConfig {
  /** Add a "copy" button on every code block. */
  copyButtons: boolean;
  copyLabel: string;
  copiedLabel: string;
  /** localStorage key used to remember the chosen theme, or null to remember nothing. */
  storageKey: string | null;
}

/** Make a value safe to put inside an inline <script> element. */
function literal(value: unknown): string {
  // U+2028 and U+2029 are line terminators in older JavaScript: escape them too.
  const separators = new RegExp("[" + String.fromCharCode(0x2028, 0x2029) + "]", "g");
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(separators, (c) => "\\u" + c.charCodeAt(0).toString(16));
}

/**
 * Small script embedded in the page: copy buttons, highlight of the current section in the
 * table of contents, and the light / dark theme button.
 */
export function clientScript(config: ScriptConfig): string {
  return `(function () {
  var CFG = ${literal(config)};
  // "Copy" button on every code block
  if (CFG.copyButtons) document.querySelectorAll('main pre').forEach(function (pre) {
    var wrap = document.createElement('div');
    wrap.className = 'codewrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'copy'; b.textContent = CFG.copyLabel;
    b.addEventListener('click', function () {
      var text = pre.innerText;
      var done = function () { b.textContent = CFG.copiedLabel; b.classList.add('ok');
        setTimeout(function () { b.textContent = CFG.copyLabel; b.classList.remove('ok'); }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
      function fallback() {
        var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t);
        t.select(); try { document.execCommand('copy'); done(); } catch (e) {} document.body.removeChild(t);
      }
    });
    wrap.appendChild(b);
  });
  // Highlight the current section in the table of contents
  var links = Array.prototype.slice.call(document.querySelectorAll('nav.toc a'));
  var map = {}; links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var heads = Array.prototype.slice.call(document.querySelectorAll('main h2[id], main h3[id]'));
  function onScroll() {
    var cur = null, y = window.scrollY + 110;
    heads.forEach(function (h) { if (h.offsetTop <= y) cur = h.id; });
    links.forEach(function (a) { a.classList.remove('on'); });
    if (cur && map[cur]) map[cur].classList.add('on');
  }
  if (links.length) { window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
  // Light / dark theme
  var root = document.documentElement, btn = document.getElementById('theme');
  if (CFG.storageKey) {
    try { var saved = localStorage.getItem(CFG.storageKey); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  }
  if (btn) btn.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    if (CFG.storageKey) { try { localStorage.setItem(CFG.storageKey, next); } catch (e) {} }
  });
})();
`;
}
