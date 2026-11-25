/**
 * Criterios compartidos del marco de Educación Híbrida para ITS
 * (Dirección de Educación Superior, Río Negro — "Orientaciones pedagógicas
 * para el diseño y la implementación de la Educación Híbrida en la
 * Educación Técnica Superior", 2026). Las páginas citadas en los textos de
 * ayuda corresponden a ese documento.
 */
import type { FieldDefinition } from "../types/template";
import { buildList, formatText, notice } from "../utils/htmlGenerator";

/** Los tres escenarios de la educación híbrida (págs. 12-13). */
export const SCENARIOS = [
  "Presencialidad física",
  "Presencialidad sincrónica virtual",
  "Asincronía (aula virtual)",
];

/** Formatos pedagógicos de las unidades curriculares (págs. 20-22). */
export const PEDAGOGICAL_FORMATS = [
  "Asignatura",
  "Seminario",
  "Taller",
  "Laboratorio",
  "Ateneo",
  "Prácticas Profesionalizantes",
];

/** Formatos de encuentro sincrónico según su propósito (pág. 32). */
export const SYNC_FORMATS = [
  "Presentación y desarrollo conceptual",
  "Trabajo práctico",
  "Consulta y acompañamiento",
  "Intercambio y socialización",
];

export const WORK_MODES = ["Individual", "En parejas", "En grupo"];

/**
 * Niveles de uso de IA por consigna. Basado en la AI Assessment Scale
 * (Perkins, Furze, Roe y MacVaugh, 2024), adaptado al español.
 */
export const AI_LEVELS = [
  "Nivel 1 — Sin IA",
  "Nivel 2 — IA para planificar e investigar",
  "Nivel 3 — IA para colaborar en partes de la tarea",
  "Nivel 4 — Uso amplio de IA",
  "Nivel 5 — Exploración creativa con IA",
];

/** Protocolo de cinco principios (Cassany 2024, citado en pág. 50). */
export const AI_PROTOCOL = [
  "Transparencia: indicá cuándo, cómo y qué herramienta de IA usaste.",
  "Verificación: contrastá lo generado con fuentes confiables.",
  "Justificación: fundamentá las decisiones que tomaste en el proceso.",
  "Amplificación: usá la IA para expandir tu propio pensamiento, no para reemplazarlo.",
  "Profundización: andá más allá de la primera respuesta.",
];

/** Campo "Escenario" reutilizable. */
export const scenarioField: FieldDefinition = {
  id: "scenario",
  label: "Escenario",
  type: "select",
  options: SCENARIOS,
  help: "Elegí el escenario según las capacidades que se trabajan, no según la carga horaria (págs. 14 y 18).",
};

/** Campos de uso de IA reutilizables. */
export const aiFields: FieldDefinition[] = [
  {
    id: "aiLevel",
    label: "Uso de IA permitido",
    type: "select",
    options: AI_LEVELS,
    help: "Transparentá las condiciones de uso de IA desde el inicio (contrato didáctico, pág. 50).",
  },
  {
    id: "aiNotes",
    label: "Condiciones de uso de IA",
    type: "textarea",
    placeholder: "Ej: podés usar IA para buscar ideas, pero el código y la redacción final tienen que ser tuyos.",
  },
];

/**
 * Bloque "Uso de inteligencia artificial". Si se permite algún uso de IA
 * (nivel 2 o superior) agrega la declaración obligatoria y el protocolo.
 */
export function renderAiBlock(level: string, notes: string, accent?: string): string {
  const lvl = level.trim();
  const body = [
    lvl ? formatText(lvl) : "",
    formatText(notes),
  ];
  const allowsAi = lvl !== "" && !lvl.startsWith("Nivel 1");
  if (allowsAi) {
    body.push(
      formatText(
        "Al entregar, incluí una declaración de uso de IA: qué herramienta usaste, para qué y qué verificaste.",
      ),
      buildList(AI_PROTOCOL, false, accent),
    );
  }
  return notice("Uso de inteligencia artificial", body.filter(Boolean).join("\n"));
}

/** Aviso obligatorio para Prácticas Profesionalizantes (Res. CPE N.° 3745/24). */
export function renderPPWarning(format: string): string {
  if (format.trim() !== "Prácticas Profesionalizantes") return "";
  return notice(
    "Prácticas Profesionalizantes: 100 % presenciales",
    formatText(
      "Esta unidad curricular no admite hibridación (Res. CPE N.° 3745/24). El aula virtual se usa solo para planificar, registrar y sistematizar, sin reemplazar la experiencia presencial.",
    ),
    "warning",
  );
}
