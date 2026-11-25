import type { TemplateDefinition } from "../types/template";
import {
  buildList,
  buildUrlLink,
  buildUrlList,
  formatText,
  headerCard,
  metaChips,
  section,
  wrapContent,
  getList,
  getText,
  setActiveImages,
} from "../utils/htmlGenerator";
import { SYNC_FORMATS } from "./hybrid";

/**
 * Encuentro de presencialidad sincrónica virtual (págs. 29-32): no es una
 * clase expositiva por pantalla, sino un espacio de intercambio con
 * apertura, desarrollo y cierre, articulado con la asincronía.
 */
export const synchronousMeeting: TemplateDefinition = {
  id: "synchronous-meeting",
  name: "Encuentro sincrónico",
  description: "Planificar un encuentro por videoconferencia con apertura, participación y cierre.",
  icon: "Video",
  group: "clases",
  scenarios: ["sincronico"],
  fields: [
    { id: "title", label: "Título", type: "text", required: true, placeholder: "Ej: Debate sobre seguridad en redes IoT" },
    { id: "portada", label: "Imagen de portada", type: "image", help: "URL de una imagen o subí un archivo desde tu dispositivo." },
    { id: "format", label: "Formato del encuentro", type: "select", options: SYNC_FORMATS, help: "Según su propósito (pág. 32)." },
    {
      id: "schedule",
      label: "Día y horario",
      type: "text",
      placeholder: "Ej: martes 14/4, 19 a 20 h",
      help: "Dentro de los horarios institucionales previstos (pág. 32).",
    },
    { id: "duration", label: "Duración", type: "text", placeholder: "Ej: 60 minutos" },
    { id: "meetingLink", label: "Enlace a la sala", type: "url", placeholder: "https://zoom.us/j/..." },
    { id: "objectives", label: "Objetivos del encuentro", type: "list", placeholder: "Que al finalizar puedan..." },
    {
      id: "preparation",
      label: "Antes del encuentro",
      type: "textarea",
      placeholder: "Qué hay que leer, ver o producir antes de conectarse.",
      help: "El encuentro retoma lo trabajado en asincronía (pág. 29).",
    },
    { id: "opening", label: "Apertura", type: "textarea", placeholder: "Recuperación de lo trabajado y contextualización." },
    {
      id: "development",
      label: "Desarrollo",
      type: "textarea",
      placeholder: "Construcción colectiva: casos, problemas, debate.",
      help: "Alterná exposiciones breves con intercambio activo; evitá la clase expositiva por pantalla (págs. 29-30).",
    },
    {
      id: "dynamics",
      label: "Dinámicas de participación",
      type: "list",
      placeholder: "Ej: salas de subgrupos de 4 personas, 15 minutos",
      help: "Salas de subgrupos, roles (relator, secretario, moderador), encuestas, documento compartido (pág. 30).",
    },
    { id: "questions", label: "Preguntas problematizadoras", type: "list", placeholder: "¿Por qué...?" },
    {
      id: "collaborativeTools",
      label: "Recursos colaborativos",
      type: "list",
      itemType: "url",
      placeholder: "https://... (pizarra, documento compartido)",
    },
    { id: "closing", label: "Cierre", type: "textarea", placeholder: "Síntesis, próximos pasos." },
    {
      id: "afterMeeting",
      label: "Después del encuentro",
      type: "textarea",
      placeholder: "Consigna de producción posterior en el aula virtual.",
    },
    { id: "participationCriteria", label: "Criterios de participación", type: "list", placeholder: "Participa en la sala de subgrupo..." },
    {
      id: "recording",
      label: "Grabación y materiales",
      type: "textarea",
      placeholder: "Ej: la grabación y la pizarra quedan en la sección de la unidad.",
      help: "Los materiales y producciones quedan disponibles para todos, también para quien no pudo conectarse (pág. 25).",
    },
  ],
  generateHtml(values, accent, images) {
    setActiveImages(images);
    let inner = headerCard(getText(values.title), undefined, accent, getText(values.portada));
    inner += metaChips(
      [
        ["Formato", getText(values.format)],
        ["Cuándo", getText(values.schedule)],
        ["Duración", getText(values.duration)],
      ],
      accent,
    );
    inner += buildUrlLink(getText(values.meetingLink), "Entrar al encuentro", accent);
    inner += section("Objetivos del encuentro", buildList(getList(values.objectives), false, accent), accent);
    inner += section("Antes del encuentro", formatText(getText(values.preparation)), accent);
    inner += section("Apertura", formatText(getText(values.opening)), accent);
    inner += section("Desarrollo", formatText(getText(values.development)), accent);
    inner += section("Cómo vamos a trabajar", buildList(getList(values.dynamics), false, accent), accent);
    inner += section("Preguntas para el debate", buildList(getList(values.questions), false, accent), accent);
    inner += section("Recursos colaborativos", buildUrlList(getList(values.collaborativeTools), accent), accent);
    inner += section("Cierre", formatText(getText(values.closing)), accent);
    inner += section("Después del encuentro", formatText(getText(values.afterMeeting)), accent);
    inner += section("Criterios de participación", buildList(getList(values.participationCriteria), false, accent), accent);
    inner += section("Grabación y materiales", formatText(getText(values.recording)), accent);
    return wrapContent(inner);
  },
};
