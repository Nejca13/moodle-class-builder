import { describe, it, expect, vi, beforeEach } from "vitest";
import { copyHtml, copyText } from "../utils/clipboard";

describe("copyText", () => {
  beforeEach(() => {
    Object.defineProperty(window, "isSecureContext", {
      value: true,
      configurable: true,
    });
  });

  it("copies text using navigator.clipboard when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    const ok = await copyText("hola mundo");
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hola mundo");
  });

  it("returns false when clipboard rejects and fallback fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    document.execCommand = vi.fn().mockReturnValue(false) as unknown as typeof document.execCommand;

    const ok = await copyText("hola");
    expect(ok).toBe(false);
  });

  it("uses the legacy fallback when navigator.clipboard is missing", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand as unknown as typeof document.execCommand;

    const ok = await copyText("legacy");
    expect(ok).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });
});

describe("copyHtml", () => {
  beforeEach(() => {
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
  });

  it("writes the HTML both as rich content and as source code", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { write }, configurable: true });
    class FakeItem {
      constructor(public items: Record<string, Blob>) {}
    }
    vi.stubGlobal("ClipboardItem", FakeItem);

    const ok = await copyHtml("<p>Hola</p>");
    expect(ok).toBe(true);
    const item = write.mock.calls[0][0][0] as FakeItem;
    expect(Object.keys(item.items).sort()).toEqual(["text/html", "text/plain"]);
    expect(item.items["text/plain"].type).toBe("text/plain");
    expect(item.items["text/plain"].size).toBe("<p>Hola</p>".length);
    vi.unstubAllGlobals();
  });

  it("falls back to plain text copy when rich copy is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    document.execCommand = vi.fn().mockReturnValue(false) as unknown as typeof document.execCommand;

    const ok = await copyHtml("<p>Hola</p>");
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith("<p>Hola</p>");
  });
});
