import type { TemplateValues } from "../types/template";

const DRAFT_PREFIX = "mcb:draft:";
const ACCENT_PREFIX = "mcb:accent:";

export function saveAccent(templateId: string, accent: string): void {
  try {
    localStorage.setItem(ACCENT_PREFIX + templateId, accent);
  } catch {
    // ignore
  }
}

export function getAccent(templateId: string): string | null {
  try {
    return localStorage.getItem(ACCENT_PREFIX + templateId);
  } catch {
    return null;
  }
}

export function clearAccent(templateId: string): void {
  try {
    localStorage.removeItem(ACCENT_PREFIX + templateId);
  } catch {
    // ignore
  }
}

const IMAGES_PREFIX = "mcb:images:";

export type ImageStore = Record<string, string>;

export function saveImages(templateId: string, images: ImageStore): void {
  try {
    localStorage.setItem(IMAGES_PREFIX + templateId, JSON.stringify(images));
  } catch {
    // ignore
  }
}

export function getImages(templateId: string): ImageStore | null {
  try {
    const raw = localStorage.getItem(IMAGES_PREFIX + templateId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as ImageStore) : null;
  } catch {
    return null;
  }
}

export function clearImages(templateId: string): void {
  try {
    localStorage.removeItem(IMAGES_PREFIX + templateId);
  } catch {
    // ignore
  }
}

export function saveDraft(templateId: string, values: TemplateValues): void {
  try {
    localStorage.setItem(DRAFT_PREFIX + templateId, JSON.stringify(values));
  } catch {
    // ignore
  }
}

export function getDraft(templateId: string): TemplateValues | null {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + templateId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as TemplateValues) : null;
  } catch {
    return null;
  }
}

export function clearDraft(templateId: string): void {
  try {
    localStorage.removeItem(DRAFT_PREFIX + templateId);
    localStorage.removeItem(ACCENT_PREFIX + templateId);
    localStorage.removeItem(IMAGES_PREFIX + templateId);
  } catch {
    // ignore
  }
}

const FLAG_PREFIX = "mcb:flag:";

/** Preferencias simples del docente (por ejemplo, no volver a mostrar una guía). */
export function getFlag(name: string): boolean {
  try {
    return localStorage.getItem(FLAG_PREFIX + name) === "1";
  } catch {
    return false;
  }
}

export function setFlag(name: string, value: boolean): void {
  try {
    if (value) localStorage.setItem(FLAG_PREFIX + name, "1");
    else localStorage.removeItem(FLAG_PREFIX + name);
  } catch {
    // ignore
  }
}
