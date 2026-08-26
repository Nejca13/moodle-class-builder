# Moodle Class Builder — Objetivo y estado

Aplicación **web estática** para docentes: elegís una plantilla, completás un
formulario y obtenés **HTML listo para copiar y pegar en el editor TinyMCE de
Moodle**. Sin backend, sin base de datos, sin plugins ni permisos de Moodle.

## Restricciones (no negociables)

- Sin backend / sin base de datos / sin conexión a Moodle.
- HTML generado autocontenido: solo etiquetas semánticas + estilos inline.
- No `<script>`, no `iframe`, no handlers `on*`, no dependencias `js`/`css` externas.
- El HTML de preview es el MISMO que se copia (se pasa por DOMPurify antes de
  `dangerouslySetInnerHTML` como capa extra).

## Stack

- React 18 + TypeScript + Vite 6
- Tailwind CSS v4 (`@tailwindcss/vite`)
- DOMPurify (solo para sanitizar el preview)
- Vitest + @testing-library/react + jsdom (tests unit + integration)
- Gestor de paquetes: **npm**

## Plantillas (3 iniciales)

1. `theoreticalClass` — Clase teórica 📚
2. `practicalActivity` — Actividad / Trabajo práctico 📝
3. `educationalResource` — Material educativo 📖

Cada plantilla es un objeto `TemplateDefinition` (datos + `generateHtml`).
Para agregar una 4ª plantilla: crear `src/templates/xxx.ts` y registrarla en
`src/templates/index.ts` (ver `docs/ADD_TEMPLATE.md`). No hace falta tocar `App.tsx`.

## Estado actual (al 2026-08-26)

- ✅ Proyecto completo y funcional.
- ✅ Build: `npm run build` OK (tsc + vite).
- ✅ Lint: `npm run lint` OK.
- ✅ Tests: **45/45 passing** (`npm test`).
- ✅ README.md y docs/ADD_TEMPLATE.md escritos.
- ✅ Ejemplos de HTML generado en `tests/moodle/*.html`.

### Pendiente / posible mejora menor (NO bloqueante)

- El test de integración `copies HTML to the clipboard` verifica el flujo mockeando
  el módulo `utils/clipboard` (ya que jsdom no expone `navigator.clipboard` de forma
  fiable). El comportamiento real del portapapeles está cubierto por
  `src/tests/clipboard.test.ts`. Si se quiere, se puede reemplazar ese mock por un
  polyfill de `navigator.clipboard` en `src/tests/setup.ts`.
- Fase 2 (fuera de alcance): más plantillas, import/export JSON, DOCX/PDF, modo
  oscuro, etc. La arquitectura ya está preparada (registry de plantillas).

## Cómo retomar en otra PC

```bash
cd moodle-class-builder
npm install
npm run dev        # desarrollo
npm test           # tests
npm run build      # build de producción -> dist/
npm run lint       # lint
```

## Estructura

```
moodle-class-builder/
  index.html
  package.json
  vite.config.ts        # incluye config de Vitest (jsdom)
  tsconfig.json
  eslint.config.js
  src/
    components/  Header, TemplateSelector, TemplateForm, ListEditor,
                 Preview, CopyButton (ActionBar + HtmlOutput), HelpSection
    templates/   theoreticalClass.ts, practicalActivity.ts,
                 educationalResource.ts, index.ts
    types/       template.ts
    utils/       htmlGenerator, sanitize, clipboard, storage, download, htmlToText
    tests/       *.test.ts (unit + integration), setup.ts
    App.tsx, main.tsx, styles/main.css
  tests/moodle/  theoretical-example.html, practical-example.html,
                educational-example.html
  docs/ADD_TEMPLATE.md
  README.md
```

## Notas de implementación útiles

- `utils/htmlGenerator.ts` tiene los helpers de escaping y `validateGeneratedHtml()`
  (reglas de seguridad). El regex de `on*` y `javascript:` solo se aplica DENTRO de
  etiquetas reales, para no dar falsos positivos con texto escapado.
- `localStorage` se usa solo para: última plantilla y borrador. Envuelto en try/catch.
- El validador de formulario (`validate()` en `App.tsx`) marca campos requeridos y
  URLs inválidas; bloquea la copia hasta corregir.
