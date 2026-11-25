import type { TemplateDefinition } from "../types/template";
import {
  buildList,
  formatText,
  headerCard,
  metaChips,
  section,
  wrapContent,
  getList,
  getText,
  setActiveImages,
} from "../utils/htmlGenerator";
import { scenarioField } from "./hybrid";

export const theoreticalClass: TemplateDefinition = {
  id: "theoretical-class",
  name: "Clase teórica",
  description: "Crear una explicación estructurada de un tema.",
  icon: "BookOpen",
  group: "clases",
  scenarios: ["presencial", "sincronico"],
  fields: [
    { id: "title", label: "Título", type: "text", required: true, placeholder: "Ej: Introducción a Python" },
    { id: "portada", label: "Imagen de portada", type: "image", help: "URL de una imagen o subí un archivo desde tu dispositivo." },
    scenarioField,
    { id: "estimatedTime", label: "Duración / tiempo estimado", type: "text", placeholder: "Ej: 80 minutos" },
    {
      id: "purpose",
      label: "Propósito",
      type: "textarea",
      placeholder: "¿Qué se espera que el estudiante comprenda, analice, produzca o aplique?",
      help: "Primero el propósito y las capacidades; después la estrategia y la herramienta (pág. 18).",
    },
    { id: "objectives", label: "Objetivos", type: "list", placeholder: "Aprender a...", help: "Capacidades profesionales que se desarrollan." },
    {
      id: "introduction",
      label: "Apertura",
      type: "textarea",
      placeholder: "Presentá el tema y retomá lo trabajado antes de la clase.",
      help: "Recuperá lecturas, videos o producciones previas del aula virtual (pág. 23).",
    },
    { id: "contents", label: "Contenidos", type: "textarea", placeholder: "Desarrollá los contenidos principales." },
    { id: "development", label: "Desarrollo", type: "textarea", placeholder: "Explicá el tema paso a paso." },
    {
      id: "problemQuestions",
      label: "Preguntas problematizadoras",
      type: "list",
      placeholder: "¿Qué pasaría si...?",
      help: "Orientan el debate y la construcción colectiva (pág. 29).",
    },
    { id: "keyConcepts", label: "Conceptos clave", type: "list", placeholder: "Definir concepto..." },
    { id: "example", label: "Ejemplo", type: "textarea", placeholder: "Mostrá un ejemplo práctico." },
    { id: "activity", label: "Actividad propuesta", type: "textarea", placeholder: "Proponé una actividad para practicar." },
    { id: "conclusion", label: "Cierre", type: "textarea", placeholder: "Resumí lo aprendido." },
    {
      id: "afterClass",
      label: "Después de la clase (aula virtual)",
      type: "textarea",
      placeholder: "Consigna de sistematización o producción en Moodle.",
      help: "Lo trabajado en clase se proyecta en una tarea asincrónica (pág. 28).",
    },
  ],
  generateHtml(values, accent, images) {
    setActiveImages(images);
    let inner = headerCard(getText(values.title), undefined, accent, getText(values.portada));
    inner += metaChips(
      [
        ["Escenario", getText(values.scenario)],
        ["Duración", getText(values.estimatedTime)],
      ],
      accent,
    );
    inner += section("Propósito", formatText(getText(values.purpose)), accent);
    inner += section("Objetivos", buildList(getList(values.objectives), false, accent), accent);
    inner += section("Apertura", formatText(getText(values.introduction)), accent);
    inner += section("Contenidos", formatText(getText(values.contents)), accent);
    inner += section("Desarrollo", formatText(getText(values.development)), accent);
    inner += section("Preguntas para pensar", buildList(getList(values.problemQuestions), false, accent), accent);
    inner += section("Conceptos clave", buildList(getList(values.keyConcepts), false, accent), accent);
    inner += section("Ejemplo", formatText(getText(values.example)), accent);
    inner += section("Actividad propuesta", formatText(getText(values.activity)), accent);
    inner += section("Cierre", formatText(getText(values.conclusion)), accent);
    inner += section("Después de la clase", formatText(getText(values.afterClass)), accent);
    return wrapContent(inner);
  },
};
