# Gestor de Clases

Herramienta **estática** y mínima para docentes: elegís una plantilla, completás
un formulario y obtenés **HTML listo para copiar y pegar en el editor TinyMCE de
Moodle**.

- ✅ Sin backend, sin base de datos, sin plugins de Moodle.
- ✅ Sin permisos de administrador ni acceso al servidor.
- ✅ Funciona en el navegador; el contenido no sale del dispositivo.
- ✅ Se despliega como sitio estático (Vercel, Netlify, GitHub Pages).

**Sitio institucional:** <https://plantillas.ceaer.edu.ar>. Las imágenes del
HTML generado (portada del CEAER y fotos de los ejemplos) se cargan desde ese
dominio: está definido en `src/content/brand.ts` (`PRODUCTION_BASE`).

## Plantillas incluidas

1. **📚 Clase teórica** — explicación estructurada de un tema.
2. **📝 Actividad** — consigna o trabajo práctico.
3. **📖 Material educativo** — recurso de estudio con lecturas, videos y enlaces.
4. **🎥 Encuentro sincrónico** — encuentro por videoconferencia con apertura,
   dinámicas de participación y cierre.
5. **🗺️ Bienvenida y hoja de ruta** — presentación de la materia: itinerario,
   asistencia, canales de comunicación y contrato didáctico de IA.

Las plantillas siguen las *Orientaciones pedagógicas para el diseño y la
implementación de la Educación Híbrida en la Educación Técnica Superior*
(Dirección de Educación Superior, Río Negro, 2026): escenario de cada clase,
tiempos estimados, relación con la secuencia, devolución, uso de IA declarado
y aviso de que las Prácticas Profesionalizantes son 100 % presenciales.

## Cómo usarlo (docente)

1. Elegí una plantilla.
2. Completá el formulario: lo obligatorio está en "Lo esencial" (siempre título e imagen de portada).
3. Mirá la previsualización a la derecha.
4. Presioná **Copiar HTML**.
5. En Moodle, abrí el editor TinyMCE de tu actividad/recurso.
6. Abrí **Código fuente** (icono `<>` o menú).
7. Pegá el HTML y guardá.

En "Más opciones" podés copiar solo el texto, descargar el archivo o empezar de nuevo.

### Volver a editar una clase publicada

Cada HTML generado termina con un comentario invisible
`<!-- gestor-de-clases:v1 (...):BASE64 -->` que guarda los datos del formulario
(plantilla, color y campos; las imágenes incrustadas no se duplican, se
recuperan del propio HTML). En la pantalla de inicio, **Editar una clase ya
publicada** acepta el código copiado desde "Código fuente" de Moodle o el
archivo descargado. Ver `src/utils/embed.ts`.

## Requisitos

- Node.js 18+ (se desarrolló con Node 26).
- pnpm (no usar npm: el lockfile del proyecto es `pnpm-lock.yaml`).

## Ejecutar en local

```bash
cd moodle-class-builder
pnpm install
pnpm dev
```

Abrí la URL que muestra Vite (por defecto `http://localhost:5173`).

## Build (producción)

```bash
pnpm build
```

Genera la carpeta `dist/` con el sitio estático.

Para previsualizar el build:

```bash
pnpm preview
```

## Tests

```bash
pnpm test          # ejecuta todos los tests (unit + integration)
pnpm test:watch
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
pnpm lint
```

## Despliegue

La app es 100% estática (`dist/`).

### Vercel

- Framework: **Vite**.
- Build command: `pnpm build`.
- Output directory: `dist`.

O simplemente importá el repo en Vercel (lo detecta automáticamente).

### Netlify

- Build command: `pnpm build`.
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
