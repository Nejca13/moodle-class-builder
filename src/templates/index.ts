import type { Scenario, TemplateDefinition, TemplateGroup } from "../types/template";
import { theoreticalClass } from "./theoreticalClass";
import { practicalActivity } from "./practicalActivity";
import { educationalResource } from "./educationalResource";
import { synchronousMeeting } from "./synchronousMeeting";
import { courseRoadmap } from "./courseRoadmap";

/**
 * Registry of available templates.
 *
 * To add a new template (Fase 2), create its file in this folder and add
 * it to this array. No other part of the application needs to change.
 */
export const templates: TemplateDefinition[] = [
  courseRoadmap,
  theoreticalClass,
  synchronousMeeting,
  practicalActivity,
  educationalResource,
];

/**
 * Grupos del selector, en el orden en que se usan durante la cursada:
 * primero se arma el aula, después se dan las clases y en paralelo se
 * publica el trabajo en el aula virtual.
 */
export const TEMPLATE_GROUPS: Array<{ id: TemplateGroup; title: string; description: string }> = [
  {
    id: "inicio",
    title: "Inicio de la cursada",
    description: "Lo primero que ve el estudiante al entrar al aula virtual.",
  },
  {
    id: "clases",
    title: "Clases y encuentros",
    description: "Lo que pasa en el aula física o por videoconferencia.",
  },
  {
    id: "aula-virtual",
    title: "Trabajo en el aula virtual",
    description: "Consignas y materiales para el tiempo asincrónico.",
  },
];

export const SCENARIO_LABELS: Record<Scenario, string> = {
  presencial: "Presencial",
  sincronico: "Sincrónico",
  asincronico: "Asincrónico",
  cursada: "Toda la cursada",
};

export function templatesByGroup(group: TemplateGroup): TemplateDefinition[] {
  return templates.filter((t) => t.group === group);
}

export function getTemplateById(id: string | null): TemplateDefinition | null {
  if (!id) return null;
  return templates.find((t) => t.id === id) ?? null;
}
