import { useState } from "react";
import { copyText } from "../../utils/clipboard";
import { Copy, FileText, Download, Eye, EyeOff, RotateCcw, Code2, Check, ChevronDown } from "lucide-react";

interface CopyButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
}

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold cursor-pointer select-none transition-colors";

export function CopyButton({ label, onClick, variant = "primary", icon }: CopyButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800"
      : "border border-line-strong bg-white text-ink hover:bg-paper";
  return (
    <button type="button" onClick={onClick} className={`${BUTTON_BASE} ${styles}`}>
      {icon}
      <span>{label}</span>
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
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton
        label="Copiar HTML"
        onClick={onCopyHtml}
        variant="primary"
        icon={<Copy className="size-4" aria-hidden="true" />}
      />
      <CopyButton
        label="Copiar texto"
        onClick={onCopyText}
        variant="secondary"
        icon={<FileText className="size-4" aria-hidden="true" />}
      />
      <CopyButton
        label="Descargar HTML"
        onClick={onDownload}
        variant="secondary"
        icon={<Download className="size-4" aria-hidden="true" />}
      />
      <button
        type="button"
        onClick={onTogglePreview}
        aria-pressed={previewVisible}
        className={`${BUTTON_BASE} border border-line-strong bg-white text-ink hover:bg-paper`}
      >
        {previewVisible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        <span>{previewVisible ? "Ocultar previsualización" : "Previsualizar"}</span>
      </button>
      <button
        type="button"
        onClick={onClear}
        className={`${BUTTON_BASE} ms-auto text-rose-800 hover:bg-rose-50`}
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        <span>Limpiar</span>
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
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <details className="group rounded-xl border border-line bg-white">
      <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 text-base font-semibold text-ink select-none">
        <span className="flex items-center gap-2">
          <Code2 className="size-4 text-brand-700" aria-hidden="true" />
          Ver código HTML generado
        </span>
        <ChevronDown className="size-4 text-ink-soft transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-line p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-ink-soft">{html.length} caracteres · listo para TinyMCE</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="size-4" aria-hidden="true" />
                Copiar código
              </>
            )}
          </button>
        </div>
        <pre className="mcb-scroll max-h-72 overflow-auto rounded-lg bg-ink p-3.5 font-mono text-sm leading-relaxed text-brand-100">
          <code>{html}</code>
        </pre>
      </div>
    </details>
  );
}
