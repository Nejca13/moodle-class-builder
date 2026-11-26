/**
 * Copies text to the clipboard, with a fallback for non-secure contexts
 * (e.g. opening the built file directly via file://).
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy method
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Copia contenido HTML en dos formatos a la vez:
 * - text/plain: el código fuente, para pegarlo en "Código fuente" de Moodle.
 * - text/html: el contenido con formato, para pegarlo directo en un editor.
 * El sistema elige el formato según dónde se pegue.
 */
export async function copyHtml(html: string): Promise<boolean> {
  try {
    if (
      window.isSecureContext &&
      navigator.clipboard?.write &&
      typeof ClipboardItem !== "undefined"
    ) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([html], { type: "text/plain" }),
        }),
      ]);
      return true;
    }
  } catch {
    // fall through to the legacy method
  }

  // Respaldo: el evento "copy" permite cargar ambos formatos.
  let handled = false;
  const onCopy = (e: ClipboardEvent) => {
    if (!e.clipboardData) return;
    e.clipboardData.setData("text/html", html);
    e.clipboardData.setData("text/plain", html);
    e.preventDefault();
    handled = true;
  };
  document.addEventListener("copy", onCopy);
  try {
    const ok = document.execCommand("copy");
    if (ok && handled) return true;
  } catch {
    // ignore
  } finally {
    document.removeEventListener("copy", onCopy);
  }
  return copyText(html);
}
