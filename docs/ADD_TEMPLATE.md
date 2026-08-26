# Cómo agregar una nueva plantilla

Las plantillas son **datos + una función**, no lógica repartida por la app. Para
agregar una cuarta plantilla no hace falta tocar `App.tsx`.

## 1. Crear el archivo de la plantilla

Creá `src/templates/quiz.ts`:

```ts
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

export const quiz: TemplateDefinition = {
  id: "quiz",                       // único
  name: "Cuestionario",
  description: "Crear preguntas de repaso.",
  icon: "❓",
  fields: [
    { id: "title", label: "Título", type: "text", required: true },
    { id: "questions", label: "Preguntas", type: "list", placeholder: "¿...?" },
    { id: "answerKey", label: "Respuestas", type: "textarea" },
  ],
  generateHtml(values) {
    let inner = headerCard(getText(values.title));
    inner += section("Preguntas", buildList(getList(values.questions)));
    inner += section("Respuestas", formatText(getText(values.answerKey)));
    return wrapContent(inner);
  },
};
```

## 2. Registrarla

En `src/templates/index.ts` agregala al array `templates`:

```ts
import { quiz } from "./quiz";
export const templates: TemplateDefinition[] = [
  theoreticalClass,
  practicalActivity,
  educationalResource,
  quiz, // <- nueva
];
```

¡Listo! Aparecerá automáticamente en el selector, con formulario, previsualización,
validación, copia y tests de integración funcionando.

## Campos disponibles (`FieldDefinition`)

| `type`      | Control en el formulario              |
| ----------- | ------------------------------------- |
| `text`      | `<input type="text">`                 |
| `textarea`  | `<textarea>`                          |
| `url`       | `<input type="url">` (validado)       |
| `date`      | `<input type="date">`                 |
| `list`      | editor de lista (botón "Agregar")     |

Para listas de URLs usá `itemType: "url"`; cada ítem se valida y se renderiza
como `<a href>`.

## Helpers de `htmlGenerator`

- `escapeHtml`, `isValidUrl`, `sanitizeUrl`
- `formatText` (texto -> párrafos con saltos de línea)
- `buildList(items, ordered?)` (lista texto)
- `buildUrlList(items)` / `buildUrlLink(value, label)` (enlaces)
- `section(título, html)` (sección con encabezado)
- `headerCard(título, subtítulo?)` (tarjeta superior)
- `wrapContent(html)` (contenedor autocontenido)
- `validateGeneratedHtml(html)` (reglas de seguridad)
