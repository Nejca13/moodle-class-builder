import type { TemplateValues } from "../types/template";

const LAST_TEMPLATE_KEY = "mcb:lastTemplateId";
const DRAFT_PREFIX = "mcb:draft:";

export function saveLastTemplateId(id: string): void {
  try {
    localStorage.setItem(LAST_TEMPLATE_KEY, id);
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

export function getLastTemplateId(): string | null {
  try {
    return localStorage.getItem(LAST_TEMPLATE_KEY);
  } catch {
    return null;
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
  } catch {
    // ignore
  }
}
