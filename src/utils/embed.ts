/**
 * Datos del formulario incrustados en el HTML generado, para poder volver a
 * editar una clase ya publicada en Moodle.
 *
 * Van en un comentario HTML al final del contenido (invisible en Moodle):
 *   <!-- gestor-de-clases:v1 (no borrar: ...):BASE64 -->
 * El JSON se codifica en base64 para que no contenga "--" ni caracteres que
 * el editor pueda alterar. Las imágenes incrustadas (data:) no se duplican:
 * se guarda una huella y al importar se recuperan del propio HTML.
 */
import type { TemplateValue, TemplateValues } from "../types/template";
import { getTemplateById } from "../templates";

export const EMBED_VERSION = 1;
const MARKER = "gestor-de-clases";
const NOTE = "no borrar: permite volver a editar esta clase en plantillas.ceaer.edu.ar";
const COMMENT_RE = /<!--\s*gestor-de-clases:v(\d+)(?:\s*\([^)]*\))?:([A-Za-z0-9+/=]+)\s*-->/;
const IMG_REF = "@img:";
const DATA_IMG_RE = /data:image\/(?:png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+/gi;

export interface FormSnapshot {
  templateId: string;
  accent?: string;
  values: TemplateValues;
  images: Record<string, string>;
}

interface Payload {
  t: string;
  a?: string;
  v: TemplateValues;
  i?: Record<string, string>;
  /** Fecha de generación (AAAA-MM-DD). */
  d?: string;
}

export type ExtractResult =
  | (FormSnapshot & {
      ok: true;
      missingImages: number;
      savedOn?: string;
      /**
       * Textos visibles que no coinciden con los datos guardados: cambios
       * hechos directamente en Moodle, que no se pueden recuperar.
       */
      editedInMoodle: string[];
    })
  | { ok: false; reason: "empty" | "no-data" | "corrupt" | "unknown-template" | "newer-version" };

function fingerprint(dataUri: string): string {
  const b64 = dataUri.slice(dataUri.indexOf(",") + 1);
  return `${b64.length}.${b64.slice(0, 16)}.${b64.slice(-16)}`;
}

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function fromBase64(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function mapValue(value: TemplateValue, fn: (s: string) => string): TemplateValue {
  return Array.isArray(value) ? value.map(fn) : fn(value);
}

export function hasEmbeddedData(html: string): boolean {
  return COMMENT_RE.test(html);
}

/** Agrega al HTML los datos del formulario para poder recuperarlos después. */
export function embedFormData(html: string, snapshot: FormSnapshot): string {
  const toRef = (s: string) => (/^data:image\//i.test(s) ? IMG_REF + fingerprint(s) : s);
  const payload: Payload = {
    t: snapshot.templateId,
    a: snapshot.accent,
    v: Object.fromEntries(
      Object.entries(snapshot.values).map(([k, v]) => [k, mapValue(v, toRef)]),
    ),
    i: Object.fromEntries(Object.entries(snapshot.images).map(([k, v]) => [k, toRef(v)])),
    d: new Date().toISOString().slice(0, 10),
  };
  return `${html}\n<!-- ${MARKER}:v${EMBED_VERSION} (${NOTE}):${toBase64(JSON.stringify(payload))} -->`;
}

/** Recupera los datos del formulario desde el HTML de una clase publicada. */
export function extractFormData(html: string): ExtractResult {
  if (!html.trim()) return { ok: false, reason: "empty" };
  const match = COMMENT_RE.exec(html);
  if (!match) return { ok: false, reason: "no-data" };
  if (Number(match[1]) > EMBED_VERSION) return { ok: false, reason: "newer-version" };

  let payload: Payload;
  try {
    payload = JSON.parse(fromBase64(match[2]));
  } catch {
    return { ok: false, reason: "corrupt" };
  }
  if (!payload || typeof payload !== "object" || typeof payload.t !== "string") {
    return { ok: false, reason: "corrupt" };
  }

  const template = getTemplateById(payload.t);
  if (!template) return { ok: false, reason: "unknown-template" };

  // Imágenes incrustadas presentes en el HTML, por huella.
  const embedded = new Map<string, string>();
  for (const uri of html.match(DATA_IMG_RE) ?? []) embedded.set(fingerprint(uri), uri);

  let missingImages = 0;
  const fromRef = (s: string) => {
    if (!s.startsWith(IMG_REF)) return s;
    const uri = embedded.get(s.slice(IMG_REF.length));
    if (!uri) missingImages += 1;
    return uri ?? "";
  };

  // Solo campos que existen en la plantilla y con el tipo esperado.
  const values: TemplateValues = {};
  for (const field of template.fields) {
    const raw = payload.v?.[field.id];
    if (field.type === "list") {
      if (Array.isArray(raw)) values[field.id] = raw.filter((x) => typeof x === "string").map(fromRef);
    } else if (typeof raw === "string") {
      values[field.id] = fromRef(raw);
    }
  }

  const images: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload.i ?? {})) {
    if (!/^img_[a-z0-9]+$/i.test(key) || typeof value !== "string") continue;
    const resolved = fromRef(value);
    if (resolved) images[key] = resolved;
  }

  const accent = typeof payload.a === "string" && /^#[0-9a-f]{6}$/i.test(payload.a) ? payload.a : undefined;
  const original = new Set(textBlocks(template.generateHtml(values, accent, images)));
  const editedInMoodle = [...new Set(textBlocks(html).filter((b) => !original.has(b)))];

  return {
    ok: true,
    templateId: template.id,
    accent,
    editedInMoodle,
    values,
    images,
    missingImages,
    savedOn: typeof payload.d === "string" ? payload.d : undefined,
  };
}

/**
 * Textos visibles del contenido, por bloque (títulos, párrafos e ítems), con
 * los espacios normalizados: Moodle reacomoda saltos de línea y estilos al
 * guardar, pero el texto tiene que coincidir.
 */
function textBlocks(html: string): string[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.body.querySelectorAll("h1, h2, h3, h4, p, li, blockquote, td, th"))
    .map((el) => (el.textContent ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}
