import { useEffect, useMemo, useState } from "react";
import type { TemplateValue, TemplateValues } from "./types/template";
import { getTemplateById, templates } from "./templates";
import { getList, getText, isValidUrl } from "./utils/htmlGenerator";
import { copyText } from "./utils/clipboard";
import { downloadHtml } from "./utils/download";
import { htmlToText } from "./utils/htmlToText";
import {
  clearDraft,
  getDraft,
  getLastTemplateId,
  saveDraft,
  saveLastTemplateId,
} from "./utils/storage";
import { Header } from "./components/Header/Header";
import { TemplateSelector } from "./components/TemplateSelector/TemplateSelector";
import { TemplateForm } from "./components/TemplateForm/TemplateForm";
import { Preview } from "./components/Preview/Preview";
import { ActionBar, HtmlOutput } from "./components/CopyButton/CopyButton";
import { HelpSection } from "./components/HelpSection/HelpSection";

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

  const template = useMemo(() => getTemplateById(selectedId), [selectedId]);

  useEffect(() => {
    if (selectedId) {
      saveLastTemplateId(selectedId);
      saveDraft(selectedId, values);
    }
  }, [selectedId, values]);

  const generatedHtml = useMemo(
    () => (template ? template.generateHtml(values) : ""),
    [template, values],
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setValues(getDraft(id) ?? emptyValues());
    setStatus("");
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      <main>
        {!template ? (
          <TemplateSelector templates={templates} onSelect={handleSelect} />
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-6">
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                setStatus("");
              }}
              className="mb-4 text-sm text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              ← Cambiar de plantilla
            </button>

            <div className="grid gap-6 lg:grid-cols-2">
              <section aria-label="Formulario" className="bg-white border border-gray-200 rounded-xl p-5">
                <TemplateForm
                  template={template}
                  values={values}
                  errors={errors}
                  onChange={handleChange}
                />
              </section>

              <section aria-label="Previsualización" className="bg-white border border-gray-200 rounded-xl p-5">
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

      <footer className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
        Aplicación estática. Tu contenido no sale de este navegador.
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
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg"
          aria-hidden="true"
        >
          {status}
        </div>
      )}
    </div>
  );
}

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
