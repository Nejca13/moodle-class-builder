import type { TemplateDefinition } from "../types/template";
import {
  buildList,
  formatText,
  headerCard,
  section,
  wrapContent,
  getList,
  getText,
} from "../utils/htmlGenerator";

export const practicalActivity: TemplateDefinition = {
  id: "practical-activity",
  name: "Actividad",
  description: "Crear una consigna o trabajo práctico.",
  icon: "📝",
  fields: [
    { id: "title", label: "Título", type: "text", required: true, placeholder: "Ej: API REST con FastAPI" },
    { id: "context", label: "Contexto", type: "textarea", placeholder: "Describí el contexto de la actividad." },
    { id: "objective", label: "Objetivo", type: "textarea", required: true, placeholder: "¿Qué deben lograr los estudiantes?" },
    { id: "assignment", label: "Consigna", type: "textarea", required: true, placeholder: "Describí la tarea a realizar." },
    { id: "steps", label: "Pasos / instrucciones", type: "list", placeholder: "Paso 1..." },
    { id: "resources", label: "Recursos necesarios", type: "list", placeholder: "Editor de código..." },
    { id: "deliverable", label: "Entregable", type: "textarea", placeholder: "Qué deben entregar." },
    { id: "criteria", label: "Criterios de evaluación", type: "list", placeholder: "Cumple con..." },
    { id: "dueDate", label: "Fecha límite", type: "date", help: "Opcional." },
  ],
  generateHtml(values) {
    let inner = headerCard(getText(values.title));
    inner += section("Contexto", formatText(getText(values.context)));
    inner += section("Objetivo", formatText(getText(values.objective)));
    inner += section("Consigna", formatText(getText(values.assignment)));
    inner += section("Pasos / instrucciones", buildList(getList(values.steps), true));
    inner += section("Recursos necesarios", buildList(getList(values.resources)));
    inner += section("Entregable", formatText(getText(values.deliverable)));

    const due = getText(values.dueDate).trim();
    if (due) {
      inner += section(
        "Fecha límite",
        `<p style="margin: 0 0 12px;"><strong>${due}</strong></p>`,
      );
    }

    inner += section("Criterios de evaluación", buildList(getList(values.criteria)));
    return wrapContent(inner);
  },
};
