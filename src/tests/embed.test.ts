import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { embedFormData, extractFormData, hasEmbeddedData } from "../utils/embed";
import { getTemplateById } from "../templates";
import { validateGeneratedHtml } from "../utils/htmlGenerator";

const IMG = "data:image/png;base64," + "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB".repeat(8) + "AAAA==";

function build(values: Record<string, string | string[]>, images: Record<string, string> = {}) {
  const template = getTemplateById("theoretical-class")!;
  const html = template.generateHtml(values, "#2b5ba3", images);
  return embedFormData(html, { templateId: template.id, accent: "#2b5ba3", values, images });
}

describe("datos incrustados para volver a editar", () => {
  it("recupera plantilla, color y campos (con acentos y emojis)", () => {
    const values = { title: "Clase 1: ñandú 🐾 -- prueba", objectives: ["Uno", "Dos"] };
    const result = extractFormData(build(values));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.templateId).toBe("theoretical-class");
    expect(result.accent).toBe("#2b5ba3");
    expect(result.values.title).toBe(values.title);
    expect(result.values.objectives).toEqual(["Uno", "Dos"]);
    expect(result.missingImages).toBe(0);
  });

  it("no duplica las imágenes: las recupera del propio HTML", () => {
    const html = build(
      { title: "Con fotos", portada: IMG, contents: "Mirá [[imagen:img_abc|gato]]" },
      { img_abc: IMG },
    );
    const comment = html.slice(html.lastIndexOf("<!--"));
    expect(comment).not.toContain("data:image");
    const result = extractFormData(html);
    expect(result.ok && result.values.portada).toBe(IMG);
    expect(result.ok && result.images.img_abc).toBe(IMG);
  });

  it("cuenta las imágenes que no se pudieron recuperar", () => {
    const html = build({ title: "x", portada: IMG }).split(IMG).join("https://example.com/a.png");
    const result = extractFormData(html);
    expect(result.ok && result.missingImages).toBe(1);
  });

  it("el comentario es seguro y explica para qué está", () => {
    const html = build({ title: "x" });
    expect(hasEmbeddedData(html)).toBe(true);
    expect(html).toMatch(/<!-- gestor-de-clases:v1 \(no borrar: [^)]*\):[A-Za-z0-9+/=]+ -->$/);
    expect(validateGeneratedHtml(html).valid).toBe(true);
  });

  it("descarta campos desconocidos y colores inválidos", () => {
    const payload = btoa(JSON.stringify({ t: "theoretical-class", a: "red;x", v: { title: "ok", hack: "<script>" } }));
    const result = extractFormData(`<p>x</p><!-- gestor-de-clases:v1:${payload} -->`);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.values).toEqual({ title: "ok" });
    expect(result.accent).toBeUndefined();
  });

  it("explica por qué no puede importar", () => {
    expect(extractFormData("   ")).toEqual({ ok: false, reason: "empty" });
    expect(extractFormData("<p>Clase vieja</p>")).toEqual({ ok: false, reason: "no-data" });
    expect(extractFormData("<!-- gestor-de-clases:v1:@@@ -->")).toEqual({ ok: false, reason: "no-data" });
    expect(extractFormData("<!-- gestor-de-clases:v1:bm9qc29u -->")).toEqual({ ok: false, reason: "corrupt" });
    expect(extractFormData("<!-- gestor-de-clases:v9:e30= -->")).toEqual({ ok: false, reason: "newer-version" });
    const other = btoa(JSON.stringify({ t: "no-existe", v: {} }));
    expect(extractFormData(`<!-- gestor-de-clases:v1:${other} -->`)).toEqual({ ok: false, reason: "unknown-template" });
  });
});

describe("clase guardada por Moodle (archivo real)", () => {
  const html = readFileSync(resolve(__dirname, "../../tests/moodle/moodle-guardado.html"), "utf8");

  it("recupera los datos aunque Moodle haya reformateado el HTML", () => {
    const result = extractFormData(html);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.templateId).toBe("course-roadmap");
    expect(result.values.title).toBe("Gatitos #1 — Cuidado felino básico");
  });

  it("detecta solo los textos que se cambiaron a mano en Moodle", () => {
    const result = extractFormData(html);
    expect(result.ok && result.editedInMoodle).toEqual([
      "Gatitos #1 — Casdasdasd",
      "Ayuda y accesibilidada asdasdasd",
    ]);
  });

  it("no marca cambios cuando nadie tocó el contenido en Moodle", () => {
    const values = { title: "Sin cambios", objectives: ["Uno"], contents: "Con **negrita** y https://moodle.org" };
    expect(extractFormData(build(values))).toMatchObject({ ok: true, editedInMoodle: [] });
  });
});
