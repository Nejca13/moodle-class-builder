import DOMPurify from "dompurify";

/**
 * Sanitizes the generated HTML before rendering it in the in-app preview.
 *
 * The generated HTML is already safe by construction (all user text is
 * escaped), but we run it through DOMPurify as a defense-in-depth measure
 * because it is injected with `dangerouslySetInnerHTML`.
 *
 * Inline `style` is preserved so the preview matches the output exactly.
 */
export function sanitizeForPreview(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    FORBID_TAGS: [
      "script",
      "iframe",
      "object",
      "embed",
      "link",
      "meta",
      "form",
      "input",
      "button",
      "textarea",
      "select",
      "style",
    ],
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onmouseout",
      "onfocus",
      "onblur",
      "onchange",
      "onsubmit",
    ],
  });
}
