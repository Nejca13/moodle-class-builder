import { useState } from "react";
import { copyText } from "../../utils/clipboard";

interface CopyButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function CopyButton({ label, onClick, variant = "primary" }: CopyButtonProps) {
  const base =
    "rounded-md px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition";
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500"
      : "bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 focus-visible:ring-gray-500";
  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
      {label}
    </button>
  );
}

interface ActionBarProps {
  onCopyHtml: () => void;
  onCopyText: () => void;
  onDownload: () => void;
  onTogglePreview: () => void;
  previewVisible: boolean;
  onClear: () => void;
}

export function ActionBar({
  onCopyHtml,
  onCopyText,
  onDownload,
  onTogglePreview,
  previewVisible,
  onClear,
}: ActionBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <CopyButton label="Copiar HTML" onClick={onCopyHtml} variant="primary" />
      <CopyButton label="Copiar texto" onClick={onCopyText} variant="secondary" />
      <CopyButton label="Descargar HTML" onClick={onDownload} variant="secondary" />
      <button
        type="button"
        onClick={onTogglePreview}
        aria-pressed={previewVisible}
        className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
      >
        {previewVisible ? "Ocultar previsualización" : "Previsualizar"}
      </button>
      <button
        type="button"
        onClick={onClear}
        className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
      >
        Limpiar
      </button>
    </div>
  );
}

interface HtmlOutputProps {
  html: string;
}

export function HtmlOutput({ html }: HtmlOutputProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const ok = await copyText(html);
    setCopied(ok);
  };

  return (
    <details className="mt-6 border border-gray-200 rounded-lg">
      <summary className="cursor-pointer px-4 py-3 font-medium text-gray-800 select-none">
        Ver código HTML generado
      </summary>
      <div className="border-t border-gray-200 p-4">
        <button
          type="button"
          onClick={handleCopy}
          className="mb-3 rounded-md bg-gray-100 border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
        >
          {copied ? "Copiado ✓" : "Copiar código"}
        </button>
        <pre className="overflow-auto bg-gray-50 border border-gray-200 rounded-md p-3 text-xs leading-relaxed">
          <code>{html}</code>
        </pre>
      </div>
    </details>
  );
}
