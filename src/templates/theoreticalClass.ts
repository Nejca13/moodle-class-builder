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

export const theoreticalClass: TemplateDefinition = {
  id: "theoretical-class",
  name: "Clase teórica",
  description: "Crear una explicación estructurada de un tema.",
  icon: "📚",
  fields: [
    { id: "title", label: "Título", type: "text", required: true, placeholder: "Ej: Introducción a Python" },
    { id: "introduction", label: "Introducción", type: "textarea", placeholder: "Presentá el tema y por qué es relevante." },
    { id: "objectives", label: "Objetivos", type: "list", placeholder: "Aprender a..." },
    { id: "contents", label: "Contenidos", type: "textarea", placeholder: "Desarrollá los contenidos principales." },
    { id: "development", label: "Desarrollo", type: "textarea", placeholder: "Explicá el tema paso a paso." },
    { id: "keyConcepts", label: "Conceptos clave", type: "list", placeholder: "Definir concepto..." },
    { id: "example", label: "Ejemplo", type: "textarea", placeholder: "Mostrá un ejemplo práctico." },
    { id: "activity", label: "Actividad propuesta", type: "textarea", placeholder: "Proponé una actividad para practicar." },
    { id: "conclusion", label: "Cierre / conclusión", type: "textarea", placeholder: "Resumí lo aprendido." },
  ],
  generateHtml(values) {
    let inner = headerCard(getText(values.title));
    inner += section("Introducción", formatText(getText(values.introduction)));
    inner += section("Objetivos", buildList(getList(values.objectives)));
    inner += section("Contenidos", formatText(getText(values.contents)));
    inner += section("Desarrollo", formatText(getText(values.development)));
    inner += section("Conceptos clave", buildList(getList(values.keyConcepts)));
    inner += section("Ejemplo", formatText(getText(values.example)));
    inner += section("Actividad propuesta", formatText(getText(values.activity)));
    inner += section("Cierre", formatText(getText(values.conclusion)));
    return wrapContent(inner);
  },
};
