import { describe, expect, it } from "vitest";
import { theoreticalClass } from "../templates/theoreticalClass";
import { validateGeneratedHtml } from "../utils/htmlGenerator";

describe("theoreticalClass template", () => {
  it("generates the title in the header", () => {
    const html = theoreticalClass.generateHtml({ title: "Introducción a Python" });
    expect(html).toContain("Introducción a Python");
    expect(html).toContain("<h2");
  });

  it("renders objectives as an unordered list", () => {
    const html = theoreticalClass.generateHtml({
      title: "Tema",
      objectives: ["Aprender Python", "Comprender funciones", "Crear un programa"],
    });
    expect(html).toContain("<ul ");
    expect(html).toContain("Aprender Python");
    expect(html).toContain("Comprender funciones");
    expect(html).toContain("Crear un programa");
  });

  it("omits empty sections", () => {
    const html = theoreticalClass.generateHtml({ title: "Tema" });
    expect(html).not.toContain("Objetivos");
    expect(html).not.toContain("Cierre");
  });

  it("escapes dangerous HTML entered as text", () => {
    const html = theoreticalClass.generateHtml({
      title: "X",
      introduction: "<script>alert(1)</script>",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("preserves special characters", () => {
    const html = theoreticalClass.generateHtml({
      title: "A & B <C>",
      introduction: "áéí óñ ü & ©",
    });
    expect(html).toContain("A &amp; B &lt;C&gt;");
    expect(html).toContain("áéí óñ ü &amp; ©");
  });

  it("produces valid (safe) HTML", () => {
    const html = theoreticalClass.generateHtml({
      title: "Tema",
      objectives: ["a", "b"],
      introduction: "intro",
    });
    expect(validateGeneratedHtml(html).valid).toBe(true);
  });

  it("renders the cover image when provided", () => {
    const html = theoreticalClass.generateHtml({
      title: "Tema",
      portada: "https://x.com/cover.png",
    });
    expect(html).toContain("<img");
    expect(html).toContain("https://x.com/cover.png");
  });

  it("omits the cover image when not provided", () => {
    const html = theoreticalClass.generateHtml({ title: "Tema" });
    expect(html).not.toContain("<img");
  });
});
