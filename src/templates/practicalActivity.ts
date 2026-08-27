import type { TemplateDefinition } from "../types/template";
import {
  buildList,
  formatText,
  headerCard,
  section,
  wrapContent,
  getList,
  getText,
  setActiveImages,
} from "../utils/htmlGenerator";

export const practicalActivity: TemplateDefinition = {
  id: "practical-activity",
  name: "Actividad",
  description: "Crear una consigna o trabajo práctico.",
  icon: "📝",
  fields: [
    { id: "title", label: "Título", type: "text", required: true, placeholder: "Ej: API REST con FastAPI" },
    { id: "portada", label: "Imagen de portada", type: "image", help: "URL de una imagen o subí un archivo desde tu dispositivo." },
    { id: "context", label: "Contexto", type: "textarea", placeholder: "Describí el contexto de la actividad." },
    { id: "objective", label: "Objetivo", type: "textarea", required: true, placeholder: "¿Qué deben lograr los estudiantes?" },
    { id: "assignment", label: "Consigna", type: "textarea", required: true, placeholder: "Describí la tarea a realizar." },
    { id: "steps", label: "Pasos / instrucciones", type: "list", placeholder: "Paso 1..." },
    { id: "resources", label: "Recursos necesarios", type: "list", placeholder: "Editor de código..." },
    { id: "deliverable", label: "Entregable", type: "textarea", placeholder: "Qué deben entregar." },
    { id: "criteria", label: "Criterios de evaluación", type: "list", placeholder: "Cumple con..." },
    { id: "dueDate", label: "Fecha límite", type: "date", help: "Opcional." },
  ],
  generateHtml(values, accent, images) {
    setActiveImages(images);
    let inner = headerCard(getText(values.title), undefined, accent, getText(values.portada));
    inner += section("Contexto", formatText(getText(values.context)), accent);
    inner += section("Objetivo", formatText(getText(values.objective)), accent);
    inner += section("Consigna", formatText(getText(values.assignment)), accent);
    inner += section("Pasos / instrucciones", buildList(getList(values.steps), true, accent));
    inner += section("Recursos necesarios", buildList(getList(values.resources), false, accent));
    inner += section("Entregable", formatText(getText(values.deliverable)), accent);

    const due = getText(values.dueDate).trim();
    if (due) {
      inner += section(
        "Fecha límite",
        `<p style="margin: 0 0 12px; display: inline-block; padding: 8px 16px; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 8px; font-weight: 700;">📅 ${due}</p>`,
        accent,
      );
    }

    inner += section("Criterios de evaluación", buildList(getList(values.criteria), false, accent));
    return wrapContent(inner);
  },
};
