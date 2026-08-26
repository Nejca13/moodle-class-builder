# Moodle Class Builder

Herramienta **estática** y mínima para docentes: elegís una plantilla, completás
un formulario y obtenés **HTML listo para copiar y pegar en el editor TinyMCE de
Moodle**.

- ✅ Sin backend, sin base de datos, sin plugins de Moodle.
- ✅ Sin permisos de administrador ni acceso al servidor.
- ✅ Funciona en el navegador; el contenido no sale del dispositivo.
- ✅ Se despliega como sitio estático (Vercel, Netlify, GitHub Pages).

## Plantillas incluidas

1. **📚 Clase teórica** — explicación estructurada de un tema.
2. **📝 Actividad** — consigna o trabajo práctico.
3. **📖 Material educativo** — recurso de estudio con lecturas, videos y enlaces.

## Cómo usarlo (docente)

1. Elegí una plantilla.
2. Completá el formulario (solo el título es obligatorio en la mayoría).
3. Mirá la previsualización a la derecha.
4. Presioná **Copiar HTML**.
5. En Moodle, abrí el editor TinyMCE de tu actividad/recurso.
6. Abrí **Código fuente** (icono `<>` o menú).
7. Pegá el HTML y guardá.

También podés **Copiar texto**, **Descargar HTML** o **Limpiar** el formulario.

## Requisitos

- Node.js 18+ (se desarrolló con Node 26).
- npm (o pnpm).

## Ejecutar en local

```bash
cd moodle-class-builder
npm install
npm run dev
```

Abrí la URL que muestra Vite (por defecto `http://localhost:5173`).

## Build (producción)

```bash
npm run build
```

Genera la carpeta `dist/` con el sitio estático.

Para previsualizar el build:

```bash
npm run preview
```

## Tests

```bash
npm test          # ejecuta todos los tests (unit + integration)
npm run test:watch
```

Incluye:

- Generadores de HTML (3 plantillas, campos vacíos, caracteres especiales,
  escapado de HTML, URLs inválidas, listas vacías/múltiples).
- `validateGeneratedHtml` (sin `<script>`, `javascript:`, `on*`, `iframe`,
  dependencias externas).
- Copia al portapapeles (con fallback).
- Integración: selección de plantilla, completar formulario, actualización de
  previsualización, copiar, limpiar, cambiar de plantilla y persistencia en
  `localStorage`.

Lint:

```bash
npm run lint
```

## Despliegue

La app es 100% estática (`dist/`).

### Vercel

- Framework: **Vite**.
- Build command: `npm run build`.
- Output directory: `dist`.

O simplemente importá el repo en Vercel (lo detecta automáticamente).

### Netlify

- Build command: `npm run build`.
- Publish directory: `dist`.

### GitHub Pages

`vite build` usa `/` como `base` por defecto. Si publicás en
`https://usuario.github.io/repo/` debés setear la base en `vite.config.ts`:

```ts
export default defineConfig({
  base: "/nombre-del-repo/",
  plugins: [react(), tailwindcss()],
});
```

Luego subí el contenido de `dist/` a la rama `gh-pages` (puede usar
`vite-plugin-gh-pages` o GitHub Actions).

## Seguridad del HTML generado

- Todo el texto del usuario se **escapa** antes de insertarse.
- Solo se generan etiquetas semánticas (`section`, `div`, `h2/h3`, `p`, `ul/ol`,
  `li`, `strong`, `a`, `blockquote`) con **estilos inline autocontenidos**.
- No se generan `<script>`, `iframe`, controladores `on*`, ni dependencias
  externas `js`/`css`.
- La **previsualización** usa el mismo HTML que se copia, pero se pasa por
  **DOMPurify** como capa extra de defensa antes de `dangerouslySetInnerHTML`.
- `validateGeneratedHtml()` verifica que el HTML cumple las reglas anteriores.

## Estructura del proyecto

```
moodle-class-builder/
  src/
    components/      Header, TemplateSelector, TemplateForm, ListEditor,
                     Preview, CopyButton (ActionBar + HtmlOutput), HelpSection
    templates/       theoreticalClass.ts, practicalActivity.ts,
                     educationalResource.ts, index.ts (registry)
    types/           template.ts (TemplateDefinition, FieldDefinition)
    utils/           htmlGenerator, sanitize, clipboard, storage,
                     download, htmlToText
    tests/           unit + integration tests
    App.tsx, main.tsx, styles/
  tests/moodle/      ejemplos reales de HTML generado (para probar en TinyMCE)
```

## Agregar una nueva plantilla

Ver [`docs/ADD_TEMPLATE.md`](docs/ADD_TEMPLATE.md).

## Fase 2 (no implementada, pero prevista)

La arquitectura basada en un *registry* de `TemplateDefinition` permite luego
agregar: más plantillas, plantillas personalizadas, importar/exportar JSON,
guardar varias plantillas localmente, duplicar/editar plantillas, temas, modo
oscuro y exportación DOCX/PDF.
