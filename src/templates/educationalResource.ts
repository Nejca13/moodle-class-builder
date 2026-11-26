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
import { CEAER_COVER } from "../content/brand";

export const educationalResource: TemplateDefinition = {
  id: "educational-resource",
  name: "Material educativo",
  description: "Crear un recurso de estudio con lecturas, videos y enlaces.",
  icon: "GraduationCap",
  group: "aula-virtual",
  scenarios: ["asincronico"],
  fields: [
    { id: "title", label: "Título", type: "text", required: true, placeholder: "Ej: Guía de redes IoT" },
    { id: "portada", label: "Imagen de portada", type: "image", required: true, suggestedImage: CEAER_COVER, help: "Pegá el enlace de una imagen (lo más liviano) o subí un archivo desde tu dispositivo: lo achicamos para que pese poco." },
    { id: "estimatedTime", label: "Tiempo estimado de lectura / estudio", type: "text", placeholder: "Ej: 45 minutos" },
    { id: "description", label: "Descripción", type: "textarea", placeholder: "Describí brevemente el material." },
    {
      id: "readingGuide",
      label: "Guía de lectura / consigna",
      type: "textarea",
      placeholder: "Ej: mientras leés, identificá los tres tipos de protocolo y anotá un ejemplo de cada uno.",
      help: "Todo material necesita una consigna o guía que lo oriente: la disponibilidad sola no asegura el aprendizaje (pág. 38).",
    },
    { id: "mainConcepts", label: "Conceptos principales", type: "list", placeholder: "Concepto clave..." },
    { id: "reading", label: "Material de lectura", type: "list", itemType: "url", placeholder: "https://..." },
    { id: "video", label: "Video / recurso multimedia", type: "url", placeholder: "https://youtube.com/..." },
    { id: "links", label: "Enlaces útiles", type: "list", itemType: "url", placeholder: "https://..." },
    { id: "recommendations", label: "Recomendaciones", type: "textarea", placeholder: "Sugerencias de estudio." },
    { id: "questions", label: "Preguntas para reflexionar", type: "list", placeholder: "¿Qué pasaría si...?" },
    {
      id: "accessibility",
      label: "Accesibilidad",
      type: "textarea",
      placeholder: "Ej: el video tiene subtítulos; la presentación está disponible en PDF descargable.",
      help: "Subtítulos o transcripción, texto alternativo, versiones descargables (pág. 25).",
    },
    {
      id: "sources",
      label: "Fuentes, licencias y citas",
      type: "textarea",
      placeholder: "Ej: Autor (año). Título. Licencia CC BY-SA 4.0.",
      help: "Indicá licencias, permisos y cómo citar el material (pág. 39).",
    },
  ],
  sections: [
    { id: "esencial", title: "Lo esencial", description: "El material y dónde encontrarlo.", fields: ["title", "portada", "description", "reading", "video", "links"] },
    { id: "guia", title: "Guía de estudio", description: "Cómo recorrer el material y qué tener en cuenta.", fields: ["estimatedTime", "readingGuide", "mainConcepts", "recommendations", "questions"] },
    { id: "accesibilidad", title: "Accesibilidad y fuentes", description: "Formatos alternativos, licencias y citas.", fields: ["accessibility", "sources"] },
  ],
  generateHtml(values, accent, images) {
    setActiveImages(images);
    let inner = headerCard(getText(values.title), undefined, accent, getText(values.portada));
    inner += metaChips([["Tiempo estimado", getText(values.estimatedTime)]], accent);
    inner += section("Descripción", formatText(getText(values.description)), accent);
    inner += section("Guía de lectura", formatText(getText(values.readingGuide)), accent);
    inner += section("Conceptos principales", buildList(getList(values.mainConcepts), false, accent), accent);
    inner += section("Material de lectura", buildUrlList(getList(values.reading), accent), accent);
    inner += buildUrlLink(getText(values.video), "Ver video / recurso multimedia", accent);
    inner += section("Enlaces útiles", buildUrlList(getList(values.links), accent), accent);
    inner += section("Recomendaciones", formatText(getText(values.recommendations)), accent);
    inner += section("Preguntas para reflexionar", buildList(getList(values.questions), false, accent), accent);
    inner += section("Accesibilidad", formatText(getText(values.accessibility)), accent);
    inner += section("Fuentes y licencias", formatText(getText(values.sources)), accent);
    return wrapContent(inner);
  },
};
