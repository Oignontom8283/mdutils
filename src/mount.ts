import { markdownToHtml } from "./page.js";
import type { PageOptions } from "./page.js";

export interface MountOptions extends PageOptions {
  /**
   * Height of the frame, as a CSS value. Default: "100%", so give the container a height
   * (for example `height: 100vh`).
   */
  height?: string;
  /**
   * `sandbox` attribute of the frame. By default the frame is sandboxed (scripts allowed, nothing else)
   * only when raw HTML is enabled with the `html` option, because that content could contain scripts.
   * Pass `false` to never sandbox. In a sandbox the theme choice cannot be remembered.
   */
  sandbox?: string | false;
}

/**
 * Show a Markdown document, rendered as a full documentation page, inside `target`.
 * The page lives in an iframe, so its styles never leak into your site and yours never leak into it.
 * Returns the iframe; call `mount` again on the same target to replace the document.
 */
export function mount(target: Element, markdown: string, options: MountOptions = {}): HTMLIFrameElement {
  const frame = target.ownerDocument.createElement("iframe");
  frame.style.cssText = `display:block;width:100%;height:${options.height ?? "100%"};border:0`;
  frame.title = options.title ?? "Document";
  frame.setAttribute("allow", "clipboard-write");
  const sandbox = options.sandbox === undefined ? (options.html ? "allow-scripts allow-popups" : false) : options.sandbox;
  if (sandbox !== false) frame.setAttribute("sandbox", sandbox);
  frame.srcdoc = markdownToHtml(markdown, options);
  target.replaceChildren(frame);
  return frame;
}
