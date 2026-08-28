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

/**
 * Resolved accent palette derived from a single base color.
 * Provides the gradient end, light tints for chips, and the text
 * color that stays readable on top of the accent (white or dark).
 */
export interface ResolvedTheme {
  primary: string;
  gradientTo: string;
  tint: string;
  tintBorder: string;
  linkText: string;
  marker: string;
  onAccent: string;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const h = m[1];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mixes a color toward white (positive) or black (negative) by `amount` (0..1). */
function shade(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const target = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  const mix = (c: number) => Math.round((target - c) * t + c);
  return rgbToHex(mix(rgb[0]), mix(rgb[1]), mix(rgb[2]));
}

const DEFAULT_ACCENT = "#4f46e5";

/** Builds the full palette from a user-provided accent (falls back to indigo). */
export function resolveTheme(accent?: string): ResolvedTheme {
  const base = accent && hexToRgb(accent) ? accent! : DEFAULT_ACCENT;
  const rgb = hexToRgb(base)!;
  const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return {
    primary: base,
    gradientTo: shade(base, -0.18),
    tint: shade(base, 0.86),
    tintBorder: shade(base, 0.62),
    linkText: shade(base, -0.28),
    marker: base,
    onAccent: lum > 0.62 ? "#1f2937" : "#ffffff",
  };
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
 * Token inline image: [[imagen:ref|texto alternativo]].
 * `ref` is either a URL/data URI, or a short id (e.g. "img_abc123")
 * resolved via the `images` store (so base64 never shows in the textarea).
 */
const IMG_TOKEN = /\[\[imagen:([^\]|]+)(?:\|([^\]]*))?\]\]/g;

/**
 * Active image store for the current generation pass. Templates call
 * `setActiveImages` at the start of `generateHtml` so inline `[[imagen:id]]`
 * tokens resolve to their data URIs without threading the map everywhere.
 */
let activeImages: Record<string, string> | undefined;
export function setActiveImages(images?: Record<string, string>): void {
  activeImages = images;
}

/**
 * Renders a (non-paragraph) text fragment to HTML: escapes everything
 * except recognized [[imagen:...]] tokens, which become safe <img> tags.
 * Works on raw (unescaped) text so image URLs with query params survive.
 */
function renderInline(raw: string, images?: Record<string, string>): string {
  let result = "";
  let last = 0;
  let m: RegExpExecArray | null;
  const store = images ?? activeImages;
  IMG_TOKEN.lastIndex = 0;
  while ((m = IMG_TOKEN.exec(raw)) !== null) {
    result += escapeHtml(raw.slice(last, m.index)).replace(/\n/g, "<br>");
    const ref = m[1].trim();
    const resolved = (store && store[ref]) || null;
    const src = resolved ?? sanitizeImageSrc(ref);
    if (src) {
      const alt = escapeHtml(m[2] ? m[2].trim() : "");
      result += `<img src="${src}" alt="${alt}" style="display: block; max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.09); border: 1px solid rgba(0,0,0,0.06);">`;
    }
    last = m.index + m[0].length;
  }
  result += escapeHtml(raw.slice(last)).replace(/\n/g, "<br>");
  return result;
}

/**
 * Formats free text into HTML paragraphs, preserving line breaks.
 * Blank lines separate paragraphs; single newlines become `<br>`.
 * Recognizes inline [[imagen:...]] tokens (resolved via `images` or the
 * active store set by the running template).
 */
export function formatText(text: string, images?: Record<string, string>): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return trimmed
    .split(/\n{2,}/)
    .map(
      (block) =>
        `    <p style="margin: 0 0 16px; color: #374151; font-size: 1.02rem; line-height: 1.8;">${renderInline(block, images ?? activeImages)}</p>`,
    )
    .join("\n");
}

/** Builds an unordered/ordered list from items, or "" when there are none. */
export function buildList(items: string[], ordered = false, accent?: string): string {
  const filtered = items.map((i) => i.trim()).filter((i) => i.length > 0);
  if (filtered.length === 0) return "";
  const tag = ordered ? "ol" : "ul";
  const theme = resolveTheme(accent);
  const lis = filtered
    .map((i, idx) => {
      if (ordered) {
        return `      <li style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 12px; padding: 10px 14px; background: #f9fafb; border-radius: 10px; border-left: 3px solid ${theme.primary};"><span style="flex: 0 0 auto; width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, ${theme.primary}, ${theme.gradientTo}); color: ${theme.onAccent}; font-size: 0.85rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px ${theme.primary}40;">${idx + 1}</span><span style="color: #374151; line-height: 1.6; font-size: 0.98rem; padding-top: 2px;">${escapeHtml(i)}</span></li>`;
      }
      return `      <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; padding: 8px 12px; background: #fafafa; border-radius: 8px;"><span style="flex: 0 0 auto; width: 8px; height: 8px; border-radius: 50%; background: ${theme.marker}; margin-top: 8px; box-shadow: 0 0 0 3px ${theme.tint};"></span><span style="color: #374151; line-height: 1.6; font-size: 0.98rem;">${escapeHtml(i)}</span></li>`;
    })
    .join("\n");
  return `    <${tag} style="margin: 0 0 16px; padding: 0; list-style: none;">\n${lis}\n    </${tag}>`;
}

/** Builds a list of links from URL items, or "" when there are none. */
export function buildUrlList(items: string[], accent?: string): string {
  const links = items
    .map((i) => i.trim())
    .filter((i) => i.length > 0)
    .map((i) => sanitizeUrl(i))
    .filter((u): u is string => u !== null);
  if (links.length === 0) return "";
  const theme = resolveTheme(accent);
  const lis = links
    .map(
      (u) =>
        `      <li style="margin-bottom: 10px;"><a href="${u}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: ${theme.tint}; color: ${theme.linkText}; border: 1px solid ${theme.tintBorder}; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.95rem; word-break: break-all; box-shadow: 0 2px 5px rgba(0,0,0,0.03);"><svg style="display:inline-block; vertical-align:middle; width:15px; height:15px; margin-right:4px; flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg><span>${u}</span></a></li>`,
    )
    .join("\n");
  return `    <ul style="margin: 0 0 16px; padding: 0; list-style: none;">\n${lis}\n    </ul>`;
}

/** Builds a single link from a URL value, or "" when empty/invalid. */
export function buildUrlLink(value: string, label: string, accent?: string): string {
  const url = sanitizeUrl(value);
  if (!url) return "";
  const theme = resolveTheme(accent);
  return `  <p style="margin: 0 0 16px;"><a href="${url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; background: linear-gradient(135deg, ${theme.primary}, ${theme.gradientTo}); color: ${theme.onAccent}; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 14px ${theme.primary}4d; letter-spacing: 0.01em;"><svg style="display:inline-block; vertical-align:middle; width:16px; height:16px; margin-right:4px;" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>${escapeHtml(label)}</span></a></p>`;
}

/**
 * Sanitizes an image source: allows safe http(s)/mailto URLs and
 * base64 `data:image/...` URIs (raster only — SVG is excluded to avoid
 * embedded scripts). Returns the escaped value, or null when invalid.
 */
export function sanitizeImageSrc(value: string): string | null {
  const v = (value || "").trim();
  if (!v) return null;
  if (/^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(v)) return escapeHtml(v);
  if (isValidUrl(v)) return escapeHtml(v);
  return null;
}

/** Builds a responsive image block, or "" when the source is empty/invalid. */
export function buildImage(src: string, alt = "", accent?: string): string {
  const safe = sanitizeImageSrc(src);
  if (!safe) return "";
  const a = escapeHtml(alt || "");
  void accent;
  return `  <p style="margin: 0 0 18px;"><img src="${safe}" alt="${a}" style="display: block; max-width: 100%; height: auto; border-radius: 14px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e5e7eb;"></p>`;
}

/** Wraps a heading + body (already-generated HTML) into a labeled section. */
export function section(heading: string, body: string, accent?: string): string {
  const cleanBody = body.trim();
  if (!cleanBody) return "";
  const theme = resolveTheme(accent);
  return `  <section style="margin: 32px 0 24px;">\n    <div style="display: flex; align-items: center; margin: 0 0 16px;"><h3 style="display: inline-block; margin: 0; padding: 7px 18px; font-size: 1.05rem; font-weight: 700; color: ${theme.onAccent}; background: linear-gradient(135deg, ${theme.primary}, ${theme.gradientTo}); border-radius: 9999px; box-shadow: 0 4px 14px ${theme.primary}38; letter-spacing: 0.01em;">${escapeHtml(heading)}</h3><div style="flex: 1; height: 1px; background: linear-gradient(to right, ${theme.tintBorder}, transparent); margin-left: 14px;"></div></div>\n${body}\n  </section>`;
}

/** Builds the header "card" with title, optional subtitle, and optional cover image. */
export function headerCard(
  title: string,
  subtitle?: string,
  accent?: string,
  cover?: string,
  coverAlt = "",
): string {
  const theme = resolveTheme(accent);
  const safeCover = sanitizeImageSrc(cover ?? "");
  const coverHtml = safeCover
    ? `<img src="${safeCover}" alt="${escapeHtml(coverAlt)}" style="display: block; width: 100%; height: 210px; object-fit: cover; border-radius: 16px 16px 0 0;">`
    : "";
  const t = `<h2 style="margin: 0 0 8px; font-size: 1.85rem; font-weight: 800; color: ${theme.onAccent}; letter-spacing: -0.02em; line-height: 1.25;">${escapeHtml(title)}</h2>`;
  const s = subtitle
    ? `<p style="margin: 0; color: ${theme.onAccent}; opacity: 0.92; font-size: 1.05rem; font-weight: 400; line-height: 1.5;">${escapeHtml(subtitle)}</p>`
    : "";
  const body = `    <div style="background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.gradientTo} 100%); padding: 32px 30px; position: relative;">\n      ${t}\n      ${s}\n    </div>`;
  return `  <div style="border-radius: 16px; overflow: hidden; margin-bottom: 32px; box-shadow: 0 10px 25px -5px ${theme.primary}35, 0 8px 10px -6px ${theme.primary}25; border: 1px solid rgba(255, 255, 255, 0.15);">\n    ${coverHtml}\n${body}\n  </div>`;
}

/** Wraps the full content in a self-contained container <div>. */
export function wrapContent(inner: string): string {
  return `<div style="font-family: 'Segoe UI', system-ui, -apple-system, Arial, Helvetica, sans-serif; line-height: 1.75; color: #1f2937; max-width: 820px; margin: 0 auto; padding: 36px 32px 40px; background: #ffffff; border-radius: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;">\n${inner}\n</div>`;
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

  // Allow only image data: URIs; reject any other (e.g. data:text/html).
  if (/data:(?!image\/)/i.test(html)) {
    errors.push("El HTML contiene un data: URI que no es una imagen.");
  }

  return { valid: errors.length === 0, errors };
}
