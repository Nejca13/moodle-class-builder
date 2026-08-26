import { describe, expect, it } from "vitest";
import {
  buildList,
  escapeHtml,
  getList,
  getText,
  isValidUrl,
  sanitizeUrl,
  validateGeneratedHtml,
} from "../utils/htmlGenerator";

describe("escapeHtml", () => {
  it("escapes angle brackets and quotes", () => {
    expect(escapeHtml(`<script>"'&`)).toBe("&lt;script&gt;&quot;&#39;&amp;");
  });
});

describe("isValidUrl / sanitizeUrl", () => {
  it("accepts http, https and mailto", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://example.com/x")).toBe(true);
    expect(isValidUrl("mailto:a@b.com")).toBe(true);
  });

  it("rejects javascript: and relative/invalid urls", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("not a url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
  });

  it("sanitizeUrl returns null for unsafe input and escaped value otherwise", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeUrl("")).toBeNull();
    expect(sanitizeUrl('https://a.com/?x="<')).toBe("https://a.com/?x=&quot;&lt;");
  });
});

describe("getList / getText", () => {
  it("normalizes values for lists and text", () => {
    expect(getList(["a", "b"])).toEqual(["a", "b"]);
    expect(getList("solo")).toEqual(["solo"]);
    expect(getList(undefined)).toEqual([]);
    expect(getText("hola")).toBe("hola");
    expect(getText(["a", "b"])).toBe("a b");
    expect(getText(undefined)).toBe("");
  });
});

describe("buildList", () => {
  it("returns empty string for no items", () => {
    expect(buildList([])).toBe("");
    expect(buildList(["", "  "])).toBe("");
  });

  it("builds an unordered list with escaped items", () => {
    const html = buildList(["Aprender Python", "<b>tag</b>"]);
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
    expect(html).toContain("Aprender Python");
    expect(html).toContain("&lt;b&gt;tag&lt;/b&gt;");
    expect(html).not.toContain("<b>tag</b>");
  });

  it("builds an ordered list when requested", () => {
    const html = buildList(["uno", "dos"], true);
    expect(html).toContain("<ol");
  });
});

describe("validateGeneratedHtml", () => {
  it("reports empty html", () => {
    expect(validateGeneratedHtml("").valid).toBe(false);
  });

  it("flags <script>", () => {
    expect(validateGeneratedHtml("<script>alert(1)</script>").valid).toBe(false);
  });

  it("flags javascript: protocol", () => {
    const r = validateGeneratedHtml('<a href="javascript:alert(1)">x</a>');
    expect(r.valid).toBe(false);
    expect(r.errors.join()).toContain("javascript:");
  });

  it("flags inline event handlers", () => {
    expect(validateGeneratedHtml('<img src="x" onerror="alert(1)">').valid).toBe(false);
  });

  it("flags iframes", () => {
    expect(validateGeneratedHtml("<iframe src='x'></iframe>").valid).toBe(false);
  });

  it("flags external js/css dependencies", () => {
    expect(validateGeneratedHtml('<script src="https://x.com/a.js"></script>').valid).toBe(false);
  });

  it("accepts safe self-contained html", () => {
    const safe = '<div><h2>Título</h2><p>Texto</p><ul><li>a</li></ul></div>';
    expect(validateGeneratedHtml(safe).valid).toBe(true);
  });
});
