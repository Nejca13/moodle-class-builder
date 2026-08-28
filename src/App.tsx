import { useEffect, useMemo, useState } from "react";
import type { TemplateValue, TemplateValues } from "./types/template";
import { getTemplateById, templates } from "./templates";
import { getList, getText, isValidUrl, sanitizeImageSrc } from "./utils/htmlGenerator";
import { copyText } from "./utils/clipboard";
import { downloadHtml } from "./utils/download";
import { htmlToText } from "./utils/htmlToText";
import {
  clearDraft,
  getAccent,
  getDraft,
  getImages,
  getLastTemplateId,
  saveAccent,
  saveDraft,
  saveImages,
  saveLastTemplateId,
  type ImageStore,
} from "./utils/storage";
import { Header } from "./components/Header/Header";
import { TemplateSelector } from "./components/TemplateSelector/TemplateSelector";
import { TemplateForm } from "./components/TemplateForm/TemplateForm";
import { Preview } from "./components/Preview/Preview";
import { ActionBar, HtmlOutput } from "./components/CopyButton/CopyButton";
import { HelpSection } from "./components/HelpSection/HelpSection";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

function emptyValues(): TemplateValues {
  return {};
}

function validate(
  templateId: string,
  values: TemplateValues,
): Record<string, string> {
  const template = getTemplateById(templateId);
  const errors: Record<string, string> = {};
  if (!template) return errors;

  for (const field of template.fields) {
    const value = values[field.id];

    if (field.type === "list") {
      const items = getList(value);
      if (field.required && items.length === 0) {
        errors[field.id] = `${field.label} es obligatorio.`;
      }
      if (field.itemType === "url") {
        const hasInvalid = items.some((i) => i.trim() !== "" && !isValidUrl(i.trim()));
        if (hasInvalid) errors[field.id] = "Hay una URL inválida.";
      }
      continue;
    }

    const text = getText(value).trim();
    if (field.required && !text) {
      errors[field.id] = `${field.label} es obligatorio.`;
    }
    if (text && field.type === "url" && !isValidUrl(text)) {
      errors[field.id] = "La URL no es válida.";
    }
    if (text && field.type === "image" && !sanitizeImageSrc(text)) {
      errors[field.id] = "La imagen no es válida (usá una URL o un archivo de imagen).";
    }
  }

  return errors;
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const last = getLastTemplateId();
    return getTemplateById(last) ? last : null;
  });
  const [values, setValues] = useState<TemplateValues>(() => {
    const last = getLastTemplateId();
    return last && getTemplateById(last) ? getDraft(last) ?? emptyValues() : emptyValues();
  });
  const [previewVisible, setPreviewVisible] = useState(true);
  const [status, setStatus] = useState("");
  const [accent, setAccent] = useState<string>(() => {
    const last = getLastTemplateId();
    return (last && getAccent(last)) || "#4f46e5";
  });
  const [images, setImages] = useState<ImageStore>(() => {
    const last = getLastTemplateId();
    return (last && getImages(last)) || {};
  });

  const template = useMemo(() => getTemplateById(selectedId), [selectedId]);

  useEffect(() => {
    if (selectedId) {
      saveLastTemplateId(selectedId);
      saveDraft(selectedId, values);
      saveImages(selectedId, images);
    }
  }, [selectedId, values, images]);

  const generatedHtml = useMemo(
    () => (template ? template.generateHtml(values, accent, images) : ""),
    [template, values, accent, images],
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setValues(getDraft(id) ?? emptyValues());
    setAccent(getAccent(id) || "#4f46e5");
    setImages(getImages(id) || {});
    setStatus("");
  };

  const handleImageAdded = (dataUri: string): string => {
    const id = `img_${Math.random().toString(36).slice(2, 9)}`;
    setImages((prev) => ({ ...prev, [id]: dataUri }));
    return id;
  };

  const handleChange = (id: string, value: TemplateValue) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    if (status) setStatus("");
  };

  const handleClear = () => {
    if (selectedId) clearDraft(selectedId);
    setValues(emptyValues());
    setStatus("Formulario limpiado.");
  };

  const runIfValid = (action: () => void) => {
    if (!template) return;
    const errors = validate(template.id, values);
    if (Object.keys(errors).length > 0) {
      setStatus("Corregí los campos señalados antes de copiar.");
      return;
    }
    action();
  };

  const handleCopyHtml = () => {
    runIfValid(async () => {
      const ok = await copyText(generatedHtml);
      setStatus(ok ? "HTML copiado correctamente." : "No se pudo copiar el HTML.");
    });
  };

  const handleCopyText = () => {
    runIfValid(async () => {
      const ok = await copyText(htmlToText(generatedHtml));
      setStatus(ok ? "Texto copiado correctamente." : "No se pudo copiar el texto.");
    });
  };

  const handleDownload = () => {
    runIfValid(() => {
      const safeName = (getText(values.title) || "contenido-moodle")
        .trim()
        .replace(/[^\w-]+/g, "-")
        .toLowerCase();
      downloadHtml(safeName, generatedHtml);
      setStatus("Descarga iniciada.");
    });
  };

  const errors = template ? validate(template.id, values) : {};

  return (
    <div className="min-h-screen text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="flex-1">
        {!template ? (
          <TemplateSelector templates={templates} onSelect={handleSelect} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
            {/* Top Bar: Back button + Accent Color Picker */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setStatus("");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Cambiar de plantilla</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <label htmlFor="accent" className="text-xs sm:text-sm font-semibold text-slate-700">
                  Color de acento
                </label>
                <div className="relative flex items-center">
                  <input
                    id="accent"
                    type="color"
                    value={accent}
                    onChange={(e) => {
                      setAccent(e.target.value);
                      if (selectedId) saveAccent(selectedId, e.target.value);
                    }}
                    className="h-8 w-10 cursor-pointer rounded-lg border border-slate-300 bg-white p-0.5 shadow-xs"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  {ACCENT_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setAccent(c);
                        if (selectedId) saveAccent(selectedId, c);
                      }}
                      className={`h-6 w-6 rounded-full border border-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-transform ${
                        accent.toLowerCase() === c.toLowerCase()
                          ? "scale-125 ring-2 ring-indigo-500 ring-offset-2"
                          : "hover:scale-110 shadow-xs"
                      }`}
                      style={{ background: c }}
                      aria-label={`Usar color ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 2-Column Split: Form + Live Preview */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              {/* Form Section */}
              <section
                aria-label="Formulario"
                className="lg:col-span-6 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm"
              >
                <TemplateForm
                  template={template}
                  values={values}
                  errors={errors}
                  onChange={handleChange}
                  onImageAdded={handleImageAdded}
                />
              </section>

              {/* Preview Section */}
              <section
                aria-label="Previsualización"
                className="lg:col-span-6 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm sticky top-20"
              >
                <ActionBar
                  onCopyHtml={handleCopyHtml}
                  onCopyText={handleCopyText}
                  onDownload={handleDownload}
                  onTogglePreview={() => setPreviewVisible((v) => !v)}
                  previewVisible={previewVisible}
                  onClear={handleClear}
                />

                {previewVisible && <Preview html={generatedHtml} />}

                <HtmlOutput html={generatedHtml} />
              </section>
            </div>
          </div>
        )}

        <HelpSection />
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-xs text-slate-400 font-medium">
        <p>Moodle Class Builder · Generador de contenido educativo compatible con Moodle TinyMCE</p>
      </footer>

      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        style={srOnlyStyle}
      >
        {status}
      </div>
      {status && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl border border-slate-700/60 flex items-center gap-2 z-50 animate-fade-in"
          aria-hidden="true"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{status}</span>
        </div>
      )}
    </div>
  );
}

const ACCENT_PRESETS = [
  "#4f46e5",
  "#0ea5e9",
  "#059669",
  "#d97706",
  "#dc2626",
  "#db2777",
  "#7c3aed",
  "#0d9488",
];

const srOnlyStyle: React.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};
