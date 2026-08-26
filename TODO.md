# TODO — Moodle Class Builder

Estado: **implementación completa y verificada** (build + lint + 45 tests OK).
Este archivo es para retomar rápido desde otra PC.

## Checklist de entrega (del enunciado) — estado

- [x] Código fuente completo (React + TS + Vite + Tailwind)
- [x] README.md (ejecutar / build / deploy Vercel+Netlify+GH Pages / agregar plantilla)
- [x] Tests unitarios (3 generadores + htmlGenerator + clipboard)
- [x] Tests de integración (App.test.tsx)
- [x] 3 plantillas funcionales
- [x] Ejemplos de HTML generado (tests/moodle/*.html)
- [x] TypeScript sin errores (`npm run build`)
- [x] Build exitoso
- [x] Tests exitosos (45/45)
- [x] Lint exitoso (`npm run lint`)
- [x] HTML generado limpio y autocontenido
- [x] Arquitectura extensible (registry de plantillas)
- [ ] E2E con Playwright (opcional, NO incluido; se eligió Vitest unit+integration)

## Comandos rápidos

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc --noEmit + vite build -> dist/
npm run preview  # previsualizar el build
npm test         # vitest run
npm run lint     # eslint .
```

## Trabajo ya hecho (no repetir)

1. Scaffold: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`,
   `eslint.config.js`, `src/styles/main.css`, `src/main.tsx`.
2. Tipos: `src/types/template.ts` (`TemplateDefinition`, `FieldDefinition`,
   `TemplateValue`, `TemplateValues`).
3. Utils: `htmlGenerator.ts` (escape, validate, builders), `sanitize.ts`
   (DOMPurify), `clipboard.ts` (con fallback `execCommand`), `storage.ts`
   (localStorage), `download.ts`, `htmlToText.ts`.
4. Plantillas: `theoreticalClass.ts`, `practicalActivity.ts`,
   `educationalResource.ts`, `index.ts` (registry).
5. Componentes: `Header`, `TemplateSelector`, `TemplateForm`, `ListEditor`,
   `Preview`, `CopyButton` (ActionBar + HtmlOutput), `HelpSection`.
6. `App.tsx`: estado, selección, validación, preview, acciones, persistencia,
   mensaje de estado accesible (`role="status"`).
7. Tests + `setup.ts` (polyfill de `localStorage` para jsdom).
8. `tests/moodle/*.html` (ejemplos para pegar en TinyMCE).
9. `README.md` + `docs/ADD_TEMPLATE.md`.

## Posibles próximos pasos (Fase 2, fuera de alcance actual)

- [ ] Agregar más plantillas (ver docs/ADD_TEMPLATE.md).
- [ ] Importar / exportar plantillas en JSON.
- [ ] Guardar varias plantillas localmente + duplicar/editar.
- [ ] Temas visuales / modo oscuro.
- [ ] Exportación DOCX / PDF.
- [ ] (Opcional) Tests E2E con Playwright.
- [ ] Compartir plantillas mediante archivos.

## Caveats conocidos

- `vite.config.ts` usa `overrides: { "vite": "^6.0.11" }` en package.json para
  evitar versión duplicada de `vite` (rompía el tipado de `test`). No quitar.
- `setup.ts` polyfilla `localStorage` porque jsdom (este setup) no lo expone.
- El test de copia en `App.test.tsx` mockea `utils/clipboard` (no `navigator.clipboard`)
  por la misma razón; el caso real está en `src/tests/clipboard.test.ts`.
