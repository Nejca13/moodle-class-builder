import type { TemplateValue } from "../types/template";

/**
 * Escapes a string so it can be safely embedded inside generated HTML
 * (as text content or as an attribute value). This is the primary
 * protection against injecting markup/JS through user input.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SAFE_PROTOCOLS = ["http:", "https:", "mailto:"];

/** Returns true when the value is a non-empty URL with a safe protocol. */
export function isValidUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  try {
    const url = new URL(v);
    return SAFE_PROTOCOLS.includes(url.protocol);
  } catch {
    return false;
  }
}

/**
 * Returns a sanitized, escaped URL string ready to be used in an `href`
 * attribute, or `null` when the value is empty or unsafe.
 */
export function sanitizeUrl(value: string): string | null {
  const v = value.trim();
  if (!v || !isValidUrl(v)) return null;
  return escapeHtml(v);
}

/** Normalizes a template value into a string array (for list fields). */
export function getList(value: TemplateValue | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
}

/** Normalizes a template value into a plain string. */
export function getText(value: TemplateValue | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(" ");
  return "";
}

/**
 * Formats free text into HTML paragraphs, preserving line breaks.
 * Blank lines separate paragraphs; single newlines become `<br>`.
 */
export function formatText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const escaped = escapeHtml(trimmed);
  return escaped
    .split(/\n{2,}/)
    .map((block) => `  <p style="margin: 0 0 12px;">${block.replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

/** Builds an unordered/ordered list from items, or "" when there are none. */
export function buildList(items: string[], ordered = false): string {
  const filtered = items.map((i) => i.trim()).filter((i) => i.length > 0);
  if (filtered.length === 0) return "";
  const tag = ordered ? "ol" : "ul";
  const lis = filtered
    .map((i) => `      <li style="margin-bottom: 6px;">${escapeHtml(i)}</li>`)
    .join("\n");
  return `    <${tag} style="margin: 0 0 12px; padding-left: 22px;">\n${lis}\n    </${tag}>`;
}

/** Builds a list of links from URL items, or "" when there are none. */
export function buildUrlList(items: string[]): string {
  const links = items
    .map((i) => i.trim())
    .filter((i) => i.length > 0)
    .map((i) => sanitizeUrl(i))
    .filter((u): u is string => u !== null);
  if (links.length === 0) return "";
  const lis = links
    .map(
      (u) =>
        `      <li style="margin-bottom: 6px;"><a href="${u}" target="_blank" rel="noopener noreferrer" style="color: #2563eb;">${u}</a></li>`,
    )
    .join("\n");
  return `    <ul style="margin: 0 0 12px; padding-left: 22px;">\n${lis}\n    </ul>`;
}

/** Builds a single link from a URL value, or "" when empty/invalid. */
export function buildUrlLink(value: string, label: string): string {
  const url = sanitizeUrl(value);
  if (!url) return "";
  return `  <p style="margin: 0 0 12px;"><a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb;">${escapeHtml(label)}</a></p>`;
}

/** Wraps a heading + body (already-generated HTML) into a labeled section. */
export function section(heading: string, body: string): string {
  const cleanBody = body.trim();
  if (!cleanBody) return "";
  return `  <h3 style="border-left: 4px solid #2563eb; padding-left: 10px; margin: 24px 0 12px; color: #1e3a8a; font-size: 1.2rem;">${escapeHtml(heading)}</h3>\n${body}`;
}

/** Builds the header "card" with the title and an optional subtitle. */
export function headerCard(title: string, subtitle?: string): string {
  const t = `<h2 style="margin: 0 0 6px; font-size: 1.6rem; color: #111827;">${escapeHtml(title)}</h2>`;
  const s = subtitle
    ? `<p style="margin: 0; color: #4b5563;">${escapeHtml(subtitle)}</p>`
    : "";
  return `  <div style="background: #f5f7fa; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">\n    ${t}\n    ${s}\n  </div>`;
}

/** Wraps the full content in a self-contained container <div>. */
export function wrapContent(inner: string): string {
  return `<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f2937; max-width: 900px; margin: 0 auto; padding: 16px;">\n${inner}\n</div>`;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates generated HTML against the project's safety rules:
 * no scripts, no javascript: pseudo-protocol, no inline event handlers,
 * no iframes, no external js/css dependencies, and non-empty.
 */
export function validateGeneratedHtml(html: string): ValidationResult {
  const errors: string[] = [];
  if (html.trim().length === 0) errors.push("El HTML está vacío.");

  if (/<script[\s>]/i.test(html)) {
    errors.push("El HTML contiene una etiqueta <script>.");
  }
  // Only flag javascript: when used inside a real href/src attribute.
  if (/(?:href|src)\s*=\s*["']?\s*javascript:/i.test(html)) {
    errors.push("El HTML contiene el pseudo-protocolo 'javascript:'.");
  }
  // Only flag event handlers that appear inside an actual tag, not in
  // escaped text content (e.g. a teacher typing "<img onerror=...>").
  if (/<[a-z][^>]*\son[a-z]+\s*=/i.test(html)) {
    errors.push("El HTML contiene manejadores de eventos (atributos on*).");
  }
  if (/<iframe[\s>]/i.test(html)) {
    errors.push("El HTML contiene un <iframe>.");
  }
  if (/(?:src|href)\s*=\s*["']?\s*https?:\/\/[^"'>\s]+\.(?:js|css)\b/i.test(html)) {
    errors.push("El HTML depende de archivos externos .js/.css.");
  }

  return { valid: errors.length === 0, errors };
}
