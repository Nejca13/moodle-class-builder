import type { TemplateDefinition } from "../types/template";
import {
  buildList,
  formatText,
  headerCard,
  metaChips,
  notice,
  section,
  wrapContent,
  getList,
  getText,
  setActiveImages,
} from "../utils/htmlGenerator";
import { AI_LEVELS, PEDAGOGICAL_FORMATS, renderAiBlock, renderPPWarning } from "./hybrid";
import { CEAER_COVER } from "../content/brand";

/**
 * Bloque de bienvenida e inicio del aula: hoja de ruta, canales de
 * comunicación, asistencia y contrato didáctico de IA (págs. 25, 37 y 50).
 */
export const courseRoadmap: TemplateDefinition = {
  id: "course-roadmap",
  name: "Bienvenida y hoja de ruta",
  description: "Presentar la materia: itinerario, canales de comunicación y contrato didáctico de IA.",
  icon: "Map",
  group: "inicio",
  scenarios: ["cursada"],
  fields: [
    { id: "title", label: "Título", type: "text", required: true, placeholder: "Ej: Programación en Python — 1.er año" },
    { id: "portada", label: "Imagen de portada", type: "image", required: true, suggestedImage: CEAER_COVER, help: "Pegá el enlace de una imagen (lo más liviano) o subí un archivo desde tu dispositivo: lo achicamos para que pese poco." },
    { id: "teachers", label: "Docente/s", type: "text", placeholder: "Ej: Prof. Ana Pérez" },
    {
      id: "pedagogicalFormat",
      label: "Formato pedagógico",
      type: "select",
      options: PEDAGOGICAL_FORMATS,
      help: "Las Prácticas Profesionalizantes no admiten hibridación (Res. CPE N.° 3745/24).",
    },
    { id: "welcome", label: "Bienvenida", type: "textarea", placeholder: "Presentá la materia y qué van a aprender." },
    { id: "purpose", label: "Propósito", type: "textarea", placeholder: "¿Para qué sirve esta unidad curricular en la formación?" },
    { id: "capacities", label: "Capacidades que se desarrollan", type: "list", placeholder: "Diseñar..." },
    {
      id: "scenarios",
      label: "Cómo se organiza la cursada",
      type: "list",
      placeholder: "Ej: Presencial: martes 18 a 20 h (laboratorio)",
      help: "Qué se hace en cada escenario. La virtualidad no supera el 50 % de la carga horaria (RAM, Res. CPE N.° 4077/14).",
    },
    {
      id: "itinerary",
      label: "Hoja de ruta",
      type: "list",
      placeholder: "Unidad 1 (semanas 1-3): ...",
      help: "Itinerario visible de la cursada, no una lista de carpetas (pág. 25).",
    },
    {
      id: "attendance",
      label: "Asistencia",
      type: "textarea",
      placeholder: "Ej: se registra por asistencia al aula física o por ingreso y participación en el aula virtual de cada semana.",
      help: "Se cumple con el ingreso al aula virtual o a la instancia presencial (RAM, art. 37).",
    },
    {
      id: "communication",
      label: "Canales de comunicación",
      type: "list",
      placeholder: "Foro de consultas: respuesta en 48 h hábiles",
      help: "Canal y tiempo de respuesta de cada uno (pág. 25).",
    },
    { id: "evaluation", label: "Evaluación y acreditación", type: "list", placeholder: "Trabajo práctico integrador..." },
    {
      id: "tools",
      label: "Herramientas que vamos a usar",
      type: "list",
      placeholder: "Moodle, Zoom, Google Colab...",
      help: "Las herramientas de evaluación tienen que conocerse de antemano (pág. 44).",
    },
    {
      id: "aiLevel",
      label: "Uso de IA en la materia",
      type: "select",
      options: AI_LEVELS,
      help: "Nivel general; cada actividad puede indicar el suyo.",
    },
    {
      id: "aiContract",
      label: "Contrato didáctico de IA",
      type: "textarea",
      placeholder: "Condiciones de uso, qué se espera de la producción propia y qué pasa ante un uso inadecuado.",
      help: "Se transparenta al inicio de la cursada (pág. 50).",
    },
    {
      id: "support",
      label: "Ayuda y accesibilidad",
      type: "textarea",
      placeholder: "Ej: si necesitás un ajuste razonable o tenés problemas de conectividad, escribinos por...",
    },
  ],
  sections: [
    { id: "esencial", title: "Lo esencial", description: "Con esto ya podés publicar la bienvenida.", fields: ["title", "portada", "teachers", "welcome", "purpose"] },
    { id: "cursada", title: "Cómo se cursa", description: "Formato, escenarios, hoja de ruta, asistencia y comunicación.", fields: ["pedagogicalFormat", "scenarios", "itinerary", "attendance", "communication"] },
    { id: "aprendizaje", title: "Qué se aprende y cómo se evalúa", description: "Capacidades y criterios de acreditación.", fields: ["capacities", "evaluation"] },
    { id: "herramientas", title: "Herramientas e inteligencia artificial", description: "Qué se usa en la materia y las reglas sobre IA.", fields: ["tools", "aiLevel", "aiContract"] },
    { id: "ayuda", title: "Ayuda y accesibilidad", description: "A quién recurrir y qué apoyos hay.", fields: ["support"] },
  ],
  generateHtml(values, accent, images) {
    setActiveImages(images);
    const format = getText(values.pedagogicalFormat);
    let inner = headerCard(getText(values.title), getText(values.teachers) || undefined, accent, getText(values.portada));
    inner += metaChips([["Formato", format]], accent);
    inner += renderPPWarning(format);
    inner += section("Bienvenida", formatText(getText(values.welcome)), accent);
    inner += section("Propósito", formatText(getText(values.purpose)), accent);
    inner += section("Capacidades que se desarrollan", buildList(getList(values.capacities), false, accent), accent);
    inner += section("Cómo se organiza la cursada", buildList(getList(values.scenarios), false, accent), accent);
    inner += section("Hoja de ruta", buildList(getList(values.itinerary), true, accent), accent);
    inner += notice("Asistencia", formatText(getText(values.attendance)));
    inner += section("Canales de comunicación", buildList(getList(values.communication), false, accent), accent);
    inner += section("Evaluación y acreditación", buildList(getList(values.evaluation), false, accent), accent);
    inner += section("Herramientas que vamos a usar", buildList(getList(values.tools), false, accent), accent);
    inner += renderAiBlock(getText(values.aiLevel), getText(values.aiContract), accent);
    inner += section("Ayuda y accesibilidad", formatText(getText(values.support)), accent);
    return wrapContent(inner);
  },
};
