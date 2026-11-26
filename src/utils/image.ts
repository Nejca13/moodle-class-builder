/** Lado máximo de una imagen subida: suficiente para Moodle y mucho más liviana. */
const MAX_SIDE = 1200;

/** A partir de este peso conviene usar un enlace en lugar de incrustar la imagen. */
export const HEAVY_IMAGE_BYTES = 400 * 1024;

export interface PreparedImage {
  dataUri: string;
  bytes: number;
  /** true si se achicó o se comprimió. */
  reduced: boolean;
}

export function dataUriBytes(uri: string): number {
  const base64 = uri.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Prepara una imagen para incrustarla en el HTML: la achica a 1200 px como
 * máximo y la comprime. Las imágenes incrustadas viajan dentro del código
 * que se pega en Moodle, así que cuanto más livianas, mejor.
 * Si el navegador no puede procesarla, devuelve el archivo tal cual.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  const original = await readAsDataUrl(file);
  const untouched = { dataUri: original, bytes: file.size, reduced: false };
  // Los GIF pueden ser animados: no se tocan.
  if (file.type === "image/gif" || typeof createImageBitmap !== "function") return untouched;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return untouched;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    // PNG puede tener transparencias: se prueba WebP (las conserva); las fotos van en JPEG.
    const candidates =
      file.type === "image/png"
        ? [canvas.toDataURL("image/webp", 0.85), canvas.toDataURL("image/png")]
        : [canvas.toDataURL("image/jpeg", 0.82)];
    const best = candidates
      .filter((uri) => uri.startsWith("data:image/"))
      .reduce((a, b) => (dataUriBytes(b) < dataUriBytes(a) ? b : a));
    const bytes = dataUriBytes(best);
    if (bytes >= file.size) return untouched;
    return { dataUri: best, bytes, reduced: true };
  } catch {
    return untouched;
  }
}

/** Mensaje para el docente después de cargar una imagen. */
export function describeImage(image: PreparedImage): { text: string; heavy: boolean } {
  const size = formatBytes(image.bytes);
  if (image.bytes > HEAVY_IMAGE_BYTES) {
    return {
      heavy: true,
      text: `La imagen pesa ${size}. Moodle puede rechazar contenido tan pesado: conviene subirla a Moodle o a Drive y pegar su enlace.`,
    };
  }
  return {
    heavy: false,
    text: image.reduced ? `Imagen lista: la achicamos a ${size} para que cargue rápido.` : `Imagen lista (${size}).`,
  };
}
