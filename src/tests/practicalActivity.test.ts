import { describe, expect, it } from "vitest";
import { practicalActivity } from "../templates/practicalActivity";
import { validateGeneratedHtml } from "../utils/htmlGenerator";

describe("practicalActivity template", () => {
  it("includes title, consigna and criteria", () => {
    const html = practicalActivity.generateHtml({
      title: "API REST con FastAPI",
      objective: "Crear una API REST básica.",
      assignment: "Desarrollar una API que permita...",
      criteria: ["Cumple con el endpoint", "Valida la entrada"],
    });
    expect(html).toContain("API REST con FastAPI");
    expect(html).toContain("Desarrollar una API que permita...");
    expect(html).toContain("Cumple con el endpoint");
  });

  it("renders steps as an ordered list", () => {
    const html = practicalActivity.generateHtml({
      title: "Actividad",
      objective: "o",
      assignment: "c",
      steps: ["Crear proyecto", "Crear endpoint", "Implementar validación", "Probar con Swagger"],
    });
    expect(html).toContain("<ol ");
    expect(html).toContain("Crear proyecto");
    expect(html).toContain("Probar con Swagger");
  });

  it("renders the optional due date when present", () => {
    const html = practicalActivity.generateHtml({
      title: "Actividad",
      objective: "o",
      assignment: "c",
      dueDate: "2026-09-01",
    });
    expect(html).toContain("Fecha límite");
    expect(html).toContain("2026-09-01");
  });

  it("omits the due date when empty", () => {
    const html = practicalActivity.generateHtml({
      title: "Actividad",
      objective: "o",
      assignment: "c",
    });
    expect(html).not.toContain("Fecha límite");
  });

  it("escapes HTML in text fields", () => {
    const html = practicalActivity.generateHtml({
      title: "X",
      objective: "<img src=x onerror=alert(1)>",
      assignment: "c",
    });
    expect(html).not.toContain("<img src=x");
    expect(validateGeneratedHtml(html).valid).toBe(true);
  });

  it("produces valid (safe) HTML", () => {
    const html = practicalActivity.generateHtml({
      title: "Actividad",
      objective: "o",
      assignment: "c",
      steps: ["a"],
    });
    expect(validateGeneratedHtml(html).valid).toBe(true);
  });
});
