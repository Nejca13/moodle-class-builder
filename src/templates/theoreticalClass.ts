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

export const theoreticalClass: TemplateDefinition = {
  id: "theoretical-class",
  name: "Clase teórica",
  description: "Crear una explicación estructurada de un tema.",
  icon: "BookOpen",
  fields: [
    { id: "title", label: "Título", type: "text", required: true, placeholder: "Ej: Introducción a Python" },
    { id: "portada", label: "Imagen de portada", type: "image", help: "URL de una imagen o subí un archivo desde tu dispositivo." },
    { id: "introduction", label: "Introducción", type: "textarea", placeholder: "Presentá el tema y por qué es relevante." },
    { id: "objectives", label: "Objetivos", type: "list", placeholder: "Aprender a..." },
    { id: "contents", label: "Contenidos", type: "textarea", placeholder: "Desarrollá los contenidos principales." },
    { id: "development", label: "Desarrollo", type: "textarea", placeholder: "Explicá el tema paso a paso." },
    { id: "keyConcepts", label: "Conceptos clave", type: "list", placeholder: "Definir concepto..." },
    { id: "example", label: "Ejemplo", type: "textarea", placeholder: "Mostrá un ejemplo práctico." },
    { id: "activity", label: "Actividad propuesta", type: "textarea", placeholder: "Proponé una actividad para practicar." },
    { id: "conclusion", label: "Cierre / conclusión", type: "textarea", placeholder: "Resumí lo aprendido." },
  ],
  generateHtml(values, accent, images) {
    setActiveImages(images);
    let inner = headerCard(getText(values.title), undefined, accent, getText(values.portada));
    inner += section("Introducción", formatText(getText(values.introduction)), accent);
    inner += section("Objetivos", buildList(getList(values.objectives), false, accent));
    inner += section("Contenidos", formatText(getText(values.contents)), accent);
    inner += section("Desarrollo", formatText(getText(values.development)), accent);
    inner += section("Conceptos clave", buildList(getList(values.keyConcepts), false, accent));
    inner += section("Ejemplo", formatText(getText(values.example)), accent);
    inner += section("Actividad propuesta", formatText(getText(values.activity)), accent);
    inner += section("Cierre", formatText(getText(values.conclusion)), accent);
    return wrapContent(inner);
  },
};
