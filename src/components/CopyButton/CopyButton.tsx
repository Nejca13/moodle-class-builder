import { useState } from "react";
import { copyText } from "../../utils/clipboard";
import { Copy, FileText, Download, Eye, EyeOff, RotateCcw, Code2, Check } from "lucide-react";

interface CopyButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
}

export function CopyButton({ label, onClick, variant = "primary", icon }: CopyButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-200 cursor-pointer select-none";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-indigo-500"
      : "bg-white text-slate-700 border border-slate-200/90 shadow-xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:bg-slate-100 focus-visible:ring-slate-400";
  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
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
    <div className="flex flex-wrap items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
      <CopyButton
        label="Copiar HTML"
        onClick={onCopyHtml}
        variant="primary"
        icon={<Copy className="w-4 h-4" />}
      />
      <CopyButton
        label="Copiar texto"
        onClick={onCopyText}
        variant="secondary"
        icon={<FileText className="w-4 h-4 text-slate-500" />}
      />
      <CopyButton
        label="Descargar HTML"
        onClick={onDownload}
        variant="secondary"
        icon={<Download className="w-4 h-4 text-slate-500" />}
      />
      <button
        type="button"
        onClick={onTogglePreview}
        aria-pressed={previewVisible}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition cursor-pointer select-none"
      >
        {previewVisible ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
        <span>{previewVisible ? "Ocultar previsualización" : "Previsualizar"}</span>
      </button>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 shadow-xs hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 transition cursor-pointer select-none ml-auto"
      >
        <RotateCcw className="w-3.5 h-3.5" />
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
    <details className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-900 text-slate-100 overflow-hidden shadow-sm transition-all duration-200 group">
      <summary className="cursor-pointer px-4 py-3 text-xs sm:text-sm font-bold text-slate-200 select-none flex items-center justify-between hover:bg-slate-800/80 transition">
        <span className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span>Ver código HTML generado</span>
        </span>
        <span className="text-xs text-slate-400 font-normal group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>
      <div className="border-t border-slate-800 p-4 bg-slate-950/60">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">
            {html.length} caracteres · Listo para TinyMCE
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-bold shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar código</span>
              </>
            )}
          </button>
        </div>
        <pre className="overflow-auto rounded-xl bg-slate-900 border border-slate-800 p-3.5 text-xs leading-relaxed text-indigo-200 font-mono max-h-72">
          <code>{html}</code>
        </pre>
      </div>
    </details>
  );
}
