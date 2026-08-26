import { describe, expect, it } from "vitest";
import { educationalResource } from "../templates/educationalResource";
import { validateGeneratedHtml, isValidUrl } from "../utils/htmlGenerator";

describe("educationalResource template", () => {
  it("includes title, description and reflection questions", () => {
    const html = educationalResource.generateHtml({
      title: "Guía de redes IoT",
      description: "Material introductorio.",
      questions: ["¿Qué pasaría si...?", "¿Cómo se comunican los dispositivos?"],
    });
    expect(html).toContain("Guía de redes IoT");
    expect(html).toContain("Material introductorio.");
    expect(html).toContain("¿Qué pasaría si...?");
  });

  it("renders URL lists as links with safe protocol", () => {
    const html = educationalResource.generateHtml({
      title: "Recurso",
      reading: ["https://docs.python.org", "https://example.com/guia"],
    });
    expect(html).toContain('<a href="https://docs.python.org"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("ignores invalid URLs in link lists", () => {
    const html = educationalResource.generateHtml({
      title: "Recurso",
      reading: ["javascript:alert(1)", "https://good.com"],
    });
    expect(html).not.toContain("javascript:");
    expect(html).toContain("https://good.com");
    // only the valid link should appear
    const linkCount = (html.match(/<a href=/g) ?? []).length;
    expect(linkCount).toBe(1);
  });

  it("renders the video field as a single link", () => {
    const html = educationalResource.generateHtml({
      title: "Recurso",
      video: "https://youtube.com/watch?v=abc",
    });
    expect(html).toContain("Ver video / recurso multimedia");
    expect(html).toContain("https://youtube.com/watch?v=abc");
  });

  it("omits sections with empty values", () => {
    const html = educationalResource.generateHtml({ title: "Recurso" });
    expect(html).not.toContain("Descripción");
    expect(html).not.toContain("Enlaces útiles");
  });

  it("produces valid (safe) HTML", () => {
    const html = educationalResource.generateHtml({
      title: "Recurso",
      links: ["https://example.com"],
      questions: ["¿Por qué?"],
    });
    expect(validateGeneratedHtml(html).valid).toBe(true);
  });

  it("isValidUrl still rejects javascript in this context", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
  });
});
