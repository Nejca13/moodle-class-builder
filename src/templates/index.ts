import type { TemplateDefinition } from "../types/template";
import { theoreticalClass } from "./theoreticalClass";
import { practicalActivity } from "./practicalActivity";
import { educationalResource } from "./educationalResource";

/**
 * Registry of available templates.
 *
 * To add a new template (Fase 2), create its file in this folder and add
 * it to this array. No other part of the application needs to change.
 */
export const templates: TemplateDefinition[] = [
  theoreticalClass,
  practicalActivity,
  educationalResource,
];

export function getTemplateById(id: string | null): TemplateDefinition | null {
  if (!id) return null;
  return templates.find((t) => t.id === id) ?? null;
}
