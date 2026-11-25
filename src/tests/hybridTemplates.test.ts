import { describe, expect, it } from "vitest";
import { TEMPLATE_GROUPS, templates, templatesByGroup } from "../templates";
import { theoreticalClass } from "../templates/theoreticalClass";
import { practicalActivity } from "../templates/practicalActivity";
import { educationalResource } from "../templates/educationalResource";
import { synchronousMeeting } from "../templates/synchronousMeeting";
import { courseRoadmap } from "../templates/courseRoadmap";
import { AI_LEVELS, AI_PROTOCOL } from "../templates/hybrid";
import { validateGeneratedHtml } from "../utils/htmlGenerator";

describe("marco de educación híbrida en las plantillas", () => {
  it("registra las cinco plantillas con ids únicos", () => {
    const ids = templates.map((t) => t.id);
    expect(ids).toContain("synchronous-meeting");
    expect(ids).toContain("course-roadmap");
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ordena las plantillas por momento de la cursada", () => {
    expect(TEMPLATE_GROUPS.map((g) => g.id)).toEqual(["inicio", "clases", "aula-virtual"]);
    expect(templatesByGroup("inicio").map((t) => t.id)).toEqual(["course-roadmap"]);
    expect(templatesByGroup("clases").map((t) => t.id)).toEqual(["theoretical-class", "synchronous-meeting"]);
    expect(templatesByGroup("aula-virtual").map((t) => t.id)).toEqual(["practical-activity", "educational-resource"]);
    const grouped = TEMPLATE_GROUPS.flatMap((g) => templatesByGroup(g.id));
    expect(grouped).toHaveLength(templates.length);
  });

  it("todos los campos select tienen opciones", () => {
    for (const t of templates) {
      for (const f of t.fields.filter((f) => f.type === "select")) {
        expect(f.options?.length, `${t.id}.${f.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("cada plantilla genera HTML seguro con solo el título", () => {
    for (const t of templates) {
      const html = t.generateHtml({ title: "Tema" });
      expect(validateGeneratedHtml(html).valid, t.id).toBe(true);
      expect(html).not.toContain("Uso de inteligencia artificial");
    }
  });

  it("clase teórica muestra escenario y duración como chips", () => {
    const html = theoreticalClass.generateHtml({
      title: "Tema",
      scenario: "Presencialidad física",
      estimatedTime: "80 minutos",
      afterClass: "Subir síntesis al foro",
    });
    expect(html).toContain("Escenario:");
    expect(html).toContain("Presencialidad física");
    expect(html).toContain("80 minutos");
    expect(html).toContain("Después de la clase");
  });

  it("actividad con IA permitida pide declaración y muestra el protocolo", () => {
    const html = practicalActivity.generateHtml({
      title: "TP",
      objective: "o",
      assignment: "c",
      aiLevel: AI_LEVELS[2],
    });
    expect(html).toContain("Uso de inteligencia artificial");
    expect(html).toContain("declaración de uso de IA");
    expect(html).toContain(AI_PROTOCOL[0].split(":")[0]);
  });

  it("actividad sin IA no pide declaración", () => {
    const html = practicalActivity.generateHtml({
      title: "TP",
      objective: "o",
      assignment: "c",
      aiLevel: AI_LEVELS[0],
    });
    expect(html).toContain("Nivel 1");
    expect(html).not.toContain("declaración de uso de IA");
  });

  it("escapa la fecha límite", () => {
    const html = practicalActivity.generateHtml({
      title: "TP",
      objective: "o",
      assignment: "c",
      dueDate: "<b>x</b>",
    });
    expect(html).not.toContain("<b>x</b>");
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
  });

  it("material educativo incluye guía de lectura y fuentes", () => {
    const html = educationalResource.generateHtml({
      title: "Guía",
      readingGuide: "Identificá los protocolos",
      sources: "CC BY-SA 4.0",
    });
    expect(html).toContain("Guía de lectura");
    expect(html).toContain("Identificá los protocolos");
    expect(html).toContain("Fuentes y licencias");
  });

  it("encuentro sincrónico renderiza enlace, dinámicas y momentos", () => {
    const html = synchronousMeeting.generateHtml({
      title: "Debate",
      meetingLink: "https://zoom.us/j/123",
      dynamics: ["Salas de subgrupos"],
      opening: "a",
      closing: "c",
    });
    expect(html).toContain('href="https://zoom.us/j/123"');
    expect(html).toContain("Entrar al encuentro");
    expect(html).toContain("Salas de subgrupos");
    expect(html).toContain("Apertura");
    expect(html).toContain("Cierre");
    expect(validateGeneratedHtml(html).valid).toBe(true);
  });

  it("encuentro sincrónico descarta enlaces inseguros", () => {
    const html = synchronousMeeting.generateHtml({ title: "X", meetingLink: "javascript:alert(1)" });
    expect(html).not.toContain("javascript:");
  });

  it("hoja de ruta advierte que las Prácticas Profesionalizantes son presenciales", () => {
    const html = courseRoadmap.generateHtml({
      title: "Práctica I",
      pedagogicalFormat: "Prácticas Profesionalizantes",
    });
    expect(html).toContain("100 % presenciales");
    expect(html).toContain("3745/24");
  });

  it("hoja de ruta no muestra la advertencia para otros formatos", () => {
    const html = courseRoadmap.generateHtml({ title: "Python", pedagogicalFormat: "Asignatura" });
    expect(html).not.toContain("100 % presenciales");
  });

  it("hoja de ruta incluye contrato de IA, asistencia e itinerario ordenado", () => {
    const html = courseRoadmap.generateHtml({
      title: "Python",
      aiContract: "Podés usar IA para depurar.",
      attendance: "Ingreso al aula virtual o asistencia presencial.",
      itinerary: ["Unidad 1", "Unidad 2"],
    });
    expect(html).toContain("Podés usar IA para depurar.");
    expect(html).toContain("Asistencia");
    expect(html).toContain("<ol ");
    expect(validateGeneratedHtml(html).valid).toBe(true);
  });
});
