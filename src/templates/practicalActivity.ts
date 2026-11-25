import type { TemplateDefinition } from "../types/template";
import {
  buildList,
  escapeHtml,
  formatText,
  headerCard,
  metaChips,
  section,
  wrapContent,
  getList,
  getText,
  setActiveImages,
} from "../utils/htmlGenerator";
import { aiFields, renderAiBlock, scenarioField, WORK_MODES } from "./hybrid";

export const practicalActivity: TemplateDefinition = {
  id: "practical-activity",
  name: "Actividad",
  description: "Crear una consigna o trabajo práctico.",
  icon: "FileText",
  group: "aula-virtual",
  scenarios: ["asincronico", "presencial"],
  fields: [
    { id: "title", label: "Título", type: "text", required: true, placeholder: "Ej: API REST con FastAPI" },
    { id: "portada", label: "Imagen de portada", type: "image", help: "URL de una imagen o subí un archivo desde tu dispositivo." },
    scenarioField,
    { id: "workMode", label: "Modalidad de trabajo", type: "select", options: WORK_MODES },
    {
      id: "estimatedTime",
      label: "Tiempo estimado de dedicación",
      type: "text",
      placeholder: "Ej: 3 horas",
      help: "Explicitalo para que el estudiante pueda planificar su trabajo autónomo (pág. 37).",
    },
    { id: "context", label: "Contexto", type: "textarea", placeholder: "Describí el contexto de la actividad." },
    {
      id: "sequenceLink",
      label: "Relación con la secuencia",
      type: "textarea",
      placeholder: "Ej: retoma lo visto en el encuentro del martes y se socializa en la próxima clase presencial.",
      help: "Cada actividad se integra con los encuentros sincrónicos y presenciales; evitá tareas sueltas (pág. 34).",
    },
    { id: "objective", label: "Objetivo", type: "textarea", required: true, placeholder: "¿Qué deben lograr los estudiantes?" },
    { id: "assignment", label: "Consigna", type: "textarea", required: true, placeholder: "Describí la tarea a realizar." },
    { id: "steps", label: "Pasos / instrucciones", type: "list", placeholder: "Paso 1..." },
    { id: "resources", label: "Recursos necesarios", type: "list", placeholder: "Editor de código..." },
    { id: "deliverable", label: "Producto esperado / entregable", type: "textarea", placeholder: "Qué deben entregar y en qué formato." },
    { id: "dueDate", label: "Fecha límite", type: "date", help: "Opcional." },
    {
      id: "criteria",
      label: "Criterios de evaluación",
      type: "list",
      placeholder: "Cumple con...",
      help: "Publicalos desde el comienzo (pág. 37).",
    },
    {
      id: "feedback",
      label: "Devolución y retroalimentación",
      type: "textarea",
      placeholder: "Ej: devolución escrita en Moodle dentro de los 7 días; incluye autoevaluación.",
      help: "Cuándo y cómo vas a devolver; si hay autoevaluación o coevaluación (págs. 40 y 43).",
    },
    ...aiFields,
    {
      id: "support",
      label: "Consultas",
      type: "textarea",
      placeholder: "Ej: foro de consultas de la unidad; respondo en 48 h hábiles.",
      help: "Canal y tiempo de respuesta acordados.",
    },
  ],
  generateHtml(values, accent, images) {
    setActiveImages(images);
    let inner = headerCard(getText(values.title), undefined, accent, getText(values.portada));
    inner += metaChips(
      [
        ["Escenario", getText(values.scenario)],
        ["Modalidad", getText(values.workMode)],
        ["Tiempo estimado", getText(values.estimatedTime)],
      ],
      accent,
    );
    inner += section("Contexto", formatText(getText(values.context)), accent);
    inner += section("Relación con la secuencia", formatText(getText(values.sequenceLink)), accent);
    inner += section("Objetivo", formatText(getText(values.objective)), accent);
    inner += section("Consigna", formatText(getText(values.assignment)), accent);
    inner += section("Pasos / instrucciones", buildList(getList(values.steps), true, accent), accent);
    inner += section("Recursos necesarios", buildList(getList(values.resources), false, accent), accent);
    inner += section("Producto esperado", formatText(getText(values.deliverable)), accent);

    const due = getText(values.dueDate).trim();
    if (due) {
      inner += section(
        "Fecha límite",
        `<p style="margin: 0 0 14px; display: inline-flex; align-items: center; gap: 8px; padding: 9px 18px; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 10px; font-weight: 700; font-size: 0.95rem; box-shadow: 0 2px 6px rgba(217, 119, 6, 0.12);"><svg style="display:inline-block; vertical-align:middle; width:16px; height:16px; margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>${escapeHtml(due)}</span></p>`,
        accent,
      );
    }

    inner += section("Criterios de evaluación", buildList(getList(values.criteria), false, accent), accent);
    inner += section("Devolución", formatText(getText(values.feedback)), accent);
    inner += renderAiBlock(getText(values.aiLevel), getText(values.aiNotes), accent);
    inner += section("Consultas", formatText(getText(values.support)), accent);
    return wrapContent(inner);
  },
};
