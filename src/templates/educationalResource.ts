import type { TemplateDefinition } from "../types/template";
import {
  buildList,
  buildUrlLink,
  buildUrlList,
  formatText,
  headerCard,
  section,
  wrapContent,
  getList,
  getText,
} from "../utils/htmlGenerator";

export const educationalResource: TemplateDefinition = {
  id: "educational-resource",
  name: "Material educativo",
  description: "Crear un recurso de estudio con lecturas, videos y enlaces.",
  icon: "📖",
  fields: [
    { id: "title", label: "Título", type: "text", required: true, placeholder: "Ej: Guía de redes IoT" },
    { id: "description", label: "Descripción", type: "textarea", placeholder: "Describí brevemente el material." },
    { id: "mainConcepts", label: "Conceptos principales", type: "list", placeholder: "Concepto clave..." },
    { id: "reading", label: "Material de lectura", type: "list", itemType: "url", placeholder: "https://..." },
    { id: "video", label: "Video / recurso multimedia", type: "url", placeholder: "https://youtube.com/..." },
    { id: "links", label: "Enlaces útiles", type: "list", itemType: "url", placeholder: "https://..." },
    { id: "recommendations", label: "Recomendaciones", type: "textarea", placeholder: "Sugerencias de estudio." },
    { id: "questions", label: "Preguntas para reflexionar", type: "list", placeholder: "¿Qué pasaría si...?" },
  ],
  generateHtml(values) {
    let inner = headerCard(getText(values.title));
    inner += section("Descripción", formatText(getText(values.description)));
    inner += section("Conceptos principales", buildList(getList(values.mainConcepts)));
    inner += section("Material de lectura", buildUrlList(getList(values.reading)));
    inner += buildUrlLink(getText(values.video), "Ver video / recurso multimedia");
    inner += section("Enlaces útiles", buildUrlList(getList(values.links)));
    inner += section("Recomendaciones", formatText(getText(values.recommendations)));
    inner += section("Preguntas para reflexionar", buildList(getList(values.questions)));
    return wrapContent(inner);
  },
};
