/** Triggers a download of the full standalone HTML document. */
export function downloadHtml(filename: string, bodyHtml: string): void {
  const escapedTitle = filename.replace(/\.html$/i, "");
  const documentHtml =
    `<!doctype html>\n` +
    `<html lang="es">\n` +
    `<head>\n` +
    `  <meta charset="utf-8">\n` +
    `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n` +
    `  <title>${escapedTitle}</title>\n` +
    `</head>\n` +
    `<body>\n${bodyHtml}\n</body>\n` +
    `</html>\n`;

  const blob = new Blob([documentHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".html") ? filename : `${filename}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
