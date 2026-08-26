/**
 * Converts generated HTML into readable plain text for the "Copiar texto"
 * action. Uses the DOM so the conversion is consistent across browsers
 * and the test environment (jsdom).
 */
export function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  // <br> -> newline
  doc.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));

  const blocks = doc.querySelectorAll(
    "h2, h3, p, li, blockquote, div, ul, ol",
  );
  blocks.forEach((block) => {
    block.appendChild(doc.createTextNode("\n"));
  });

  const text = doc.body.textContent ?? "";
  return text
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}
