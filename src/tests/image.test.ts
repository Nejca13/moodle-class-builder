import { describe, it, expect } from "vitest";
import { dataUriBytes, describeImage, formatBytes, HEAVY_IMAGE_BYTES } from "../utils/image";

describe("imágenes subidas", () => {
  it("calcula el peso de un data URI", () => {
    expect(dataUriBytes("data:image/png;base64,AAAA")).toBe(3);
  });

  it("muestra el peso en KB o MB", () => {
    expect(formatBytes(150 * 1024)).toBe("150 KB");
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1,5 MB");
  });

  it("avisa cuando la imagen es pesada", () => {
    const heavy = describeImage({ dataUri: "", bytes: HEAVY_IMAGE_BYTES + 1, reduced: true });
    expect(heavy.heavy).toBe(true);
    expect(heavy.text).toMatch(/conviene subirla a Moodle/);
    const light = describeImage({ dataUri: "", bytes: 80 * 1024, reduced: true });
    expect(light).toEqual({ heavy: false, text: "Imagen lista: la achicamos a 80 KB para que cargue rápido." });
  });
});
