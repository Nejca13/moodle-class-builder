import { describe, it, expect } from "vitest";
import { templates } from "../templates";

describe("secciones del formulario", () => {
  for (const template of templates) {
    describe(template.name, () => {
      const sections = template.sections ?? [];
      const listed = sections.flatMap((s) => s.fields);
      const fieldIds = template.fields.map((f) => f.id);

      it("tiene secciones y la primera es Lo esencial", () => {
        expect(sections.length).toBeGreaterThan(1);
        expect(sections[0].title).toBe("Lo esencial");
      });

      it("ubica cada campo en exactamente una sección", () => {
        expect([...listed].sort()).toEqual([...fieldIds].sort());
        expect(new Set(listed).size).toBe(listed.length);
      });

      it("deja los campos obligatorios en Lo esencial", () => {
        const required = template.fields.filter((f) => f.required).map((f) => f.id);
        for (const id of required) expect(sections[0].fields).toContain(id);
      });
    });
  }
});
