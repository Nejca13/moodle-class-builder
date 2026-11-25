import { useRef, useState } from "react";
import type { FieldDefinition, TemplateDefinition, TemplateValue, TemplateValues } from "../../types/template";
import { getList, getText } from "../../utils/htmlGenerator";
import { ListEditor } from "../ListEditor/ListEditor";
import { Image as ImageIcon, AlertCircle, X, Check } from "lucide-react";
import { ScenarioTag, TemplateIcon } from "../TemplateIcon/TemplateIcon";

interface TemplateFormProps {
  template: TemplateDefinition;
  values: TemplateValues;
  errors: Record<string, string>;
  onChange: (id: string, value: TemplateValue) => void;
  onImageAdded: (dataUri: string) => string;
}

function FieldError({ field, errors }: { field: FieldDefinition; errors: Record<string, string> }) {
  const error = errors[field.id];
  if (!error) return null;
  return (
    <p id={`${field.id}-error`} className="mt-1.5 text-sm font-semibold text-rose-700 flex items-center gap-1.5">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{error}</span>
    </p>
  );
}

export function TemplateForm({ template, values, errors, onChange, onImageAdded }: TemplateFormProps) {
  return (
    <form className="space-y-6" aria-labelledby="form-heading" onSubmit={(e) => e.preventDefault()}>
      <div className="border-b border-line pb-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <TemplateIcon icon={template.icon} className="size-6" />
          </div>
          <div>
            <h2 id="form-heading" className="text-2xl font-bold text-ink">
              {template.name}
            </h2>
            <p className="text-base text-ink-soft">{template.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {template.scenarios.map((s) => (
                <ScenarioTag key={s} scenario={s} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {template.fields.map((field) => {
        const error = errors[field.id];
        const errorId = `${field.id}-error`;
        const describedBy = error ? errorId : undefined;

        if (field.type === "list") {
          return (
            <ListEditor
              key={field.id}
              field={field}
              items={getList(values[field.id])}
              onChange={(items) => onChange(field.id, items)}
              error={error}
            />
          );
        }

        if (field.type === "image") {
          return (
            <ImageField
              key={field.id}
              field={field}
              value={getText(values[field.id])}
              error={error}
              describedBy={describedBy}
              onChange={onChange}
            />
          );
        }

        if (field.type === "textarea") {
          return (
            <RichTextArea
              key={field.id}
              field={field}
              value={getText(values[field.id])}
              error={error}
              describedBy={describedBy}
              onChange={onChange}
              onImageAdded={onImageAdded}
            />
          );
        }

        const commonProps = {
          id: field.id,
          "aria-invalid": error ? ("true" as const) : undefined,
          "aria-describedby": describedBy,
          className:
            "w-full rounded-xl border border-line-strong bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-stone-500 focus:bg-white focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 transition duration-150",
        };

        return (
          <div key={field.id} className="space-y-1">
            <label htmlFor={field.id} className="block text-base font-semibold text-ink">
              {field.label}
              {field.required && (
                <span className="text-rose-500 ml-0.5" aria-hidden="true">
                  *
                </span>
              )}
            </label>
            {field.help && <p className="text-sm text-ink-soft mb-1.5">{field.help}</p>}

            {field.type === "select" ? (
              <select
                {...commonProps}
                value={getText(values[field.id])}
                onChange={(e) => onChange(field.id, e.target.value)}
              >
                <option value="">— Elegí una opción —</option>
                {(field.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "url" ? (
              <input
                {...commonProps}
                type="url"
                value={getText(values[field.id])}
                placeholder={field.placeholder}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            ) : (
              <input
                {...commonProps}
                type={field.type === "date" ? "date" : "text"}
                value={getText(values[field.id])}
                placeholder={field.placeholder}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            )}

            <FieldError field={field} errors={errors} />
          </div>
        );
      })}
    </form>
  );
}

const IMAGE_ACCEPT = "image/png,image/jpeg,image/gif,image/webp";

function ImageField({
  field,
  value,
  error,
  describedBy,
  onChange,
}: {
  field: FieldDefinition;
  value: string;
  error?: string;
  describedBy?: string;
  onChange: (id: string, value: TemplateValue) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isData = value.startsWith("data:");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!IMAGE_ACCEPT.split(",").includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => onChange(field.id, String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1">
      <label htmlFor={field.id} className="block text-base font-semibold text-ink">
        {field.label}
        {field.required && (
          <span className="text-rose-500 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {field.help && <p className="text-sm text-ink-soft mb-1.5">{field.help}</p>}

      <input
        id={field.id}
        type="url"
        aria-invalid={error ? ("true" as const) : undefined}
        aria-describedby={describedBy}
        className="w-full rounded-xl border border-line-strong bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-stone-500 focus:bg-white focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 transition duration-150"
        value={isData ? "" : value}
        placeholder={field.placeholder ?? "https://... o subí un archivo"}
        onChange={(e) => onChange(field.id, e.target.value)}
      />

      <div className="mt-2 flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_ACCEPT}
          aria-label={`Subir imagen para ${field.label}`}
          className="block text-xs text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100 transition file:cursor-pointer"
          onChange={handleFile}
        />
        {isData && (
          <button
            type="button"
            onClick={() => {
              if (fileRef.current) fileRef.current.value = "";
              onChange(field.id, "");
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition"
          >
            Quitar
          </button>
        )}
      </div>

      {value && (
        <div className="mt-3 relative rounded-xl border border-stone-200/80 overflow-hidden bg-stone-50 p-2 max-w-sm">
          <img
            src={value}
            alt={`Vista previa de ${field.label}`}
            className="max-h-44 rounded-lg object-contain mx-auto"
          />
        </div>
      )}

      <FieldError field={field} errors={{ [field.id]: error ?? "" }} />
    </div>
  );
}

function RichTextArea({
  field,
  value,
  error,
  describedBy,
  onChange,
  onImageAdded,
}: {
  field: FieldDefinition;
  value: string;
  error?: string;
  describedBy?: string;
  onChange: (id: string, value: TemplateValue) => void;
  onImageAdded: (dataUri: string) => string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [data, setData] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !IMAGE_ACCEPT.split(",").includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => setData(String(reader.result));
    reader.readAsDataURL(file);
  };

  const insert = () => {
    const ref_ = data ? onImageAdded(data) : url.trim();
    if (!ref_) return;
    const token = `[[imagen:${ref_}|${alt.trim()}]]`;
    const ta = ref.current;
    const start = ta ? ta.selectionStart : value.length;
    const end = ta ? ta.selectionEnd : value.length;
    onChange(field.id, value.slice(0, start) + token + value.slice(end));
    setOpen(false);
    setUrl("");
    setAlt("");
    setData("");
    requestAnimationFrame(() => {
      if (ta) {
        ta.focus();
        const pos = start + token.length;
        ta.setSelectionRange(pos, pos);
      }
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={field.id} className="block text-base font-semibold text-ink">
          {field.label}
          {field.required && (
            <span className="text-rose-500 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Insertar imagen</span>
        </button>
      </div>
      {field.help && <p className="text-sm text-ink-soft mb-1.5">{field.help}</p>}

      <textarea
        ref={ref}
        id={field.id}
        rows={5}
        aria-invalid={error ? ("true" as const) : undefined}
        aria-describedby={describedBy}
        className="w-full rounded-xl border border-line-strong bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-stone-500 focus:bg-white focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 transition duration-150 leading-relaxed font-sans"
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.id, e.target.value)}
      />

      {open && (
        <div className="mt-2 space-y-3 rounded-xl border border-brand-100 bg-brand-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
              <span>Insertar imagen en texto</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-stone-500 hover:text-stone-600 text-xs p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="url"
            aria-label={`URL de la imagen para ${field.label}`}
            placeholder="https://... (o subí un archivo abajo)"
            value={url}
            disabled={!!data}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-line-strong bg-white px-3 py-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
          <input
            type="file"
            accept={IMAGE_ACCEPT}
            aria-label={`Subir imagen para ${field.label}`}
            className="block text-xs text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-brand-800 hover:file:bg-brand-200 file:cursor-pointer"
            onChange={handleFile}
          />
          {data && (
            <p className="text-xs font-medium text-brand-700 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Archivo cargado (se incrustará como base64).</span>
            </p>
          )}
          <input
            type="text"
            aria-label={`Texto alternativo de la imagen para ${field.label}`}
            placeholder="Texto alternativo (opcional)"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full rounded-lg border border-line-strong bg-white px-3 py-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={insert}
              className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-700 shadow-xs transition cursor-pointer"
            >
              Insertar
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <FieldError field={field} errors={{ [field.id]: error ?? "" }} />
    </div>
  );
}
