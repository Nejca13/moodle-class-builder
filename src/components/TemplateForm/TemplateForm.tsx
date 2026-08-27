import { useRef, useState } from "react";
import type { FieldDefinition, TemplateDefinition, TemplateValue, TemplateValues } from "../../types/template";
import { getList, getText } from "../../utils/htmlGenerator";
import { ListEditor } from "../ListEditor/ListEditor";

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
    <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600">
      {error}
    </p>
  );
}

export function TemplateForm({ template, values, errors, onChange, onImageAdded }: TemplateFormProps) {
  return (
    <form className="space-y-5" aria-labelledby="form-heading" onSubmit={(e) => e.preventDefault()}>
      <h2 id="form-heading" className="text-lg font-semibold text-gray-900">
        {template.icon} {template.name}
      </h2>
      <p className="text-sm text-gray-500">{template.description}</p>

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
            "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        };

        return (
          <div key={field.id}>
            <label htmlFor={field.id} className="block font-medium text-gray-800 mb-1">
              {field.label}
              {field.required && (
                <span className="text-red-600" aria-hidden="true">
                  {" "}
                  *
                </span>
              )}
            </label>
            {field.help && <p className="text-sm text-gray-500 mb-2">{field.help}</p>}

            {field.type === "url" ? (
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
    <div>
      <label htmlFor={field.id} className="block font-medium text-gray-800 mb-1">
        {field.label}
        {field.required && (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {field.help && <p className="text-sm text-gray-500 mb-2">{field.help}</p>}

      <input
        id={field.id}
        type="url"
        aria-invalid={error ? ("true" as const) : undefined}
        aria-describedby={describedBy}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
          className="block text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-blue-700 hover:file:bg-blue-100"
          onChange={handleFile}
        />
        {isData && (
          <button
            type="button"
            onClick={() => {
              if (fileRef.current) fileRef.current.value = "";
              onChange(field.id, "");
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Quitar
          </button>
        )}
      </div>

      {value && (
        <img
          src={value}
          alt={`Vista previa de ${field.label}`}
          className="mt-3 max-h-44 rounded-lg border border-gray-200 object-contain"
        />
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
    let ref_ = data ? onImageAdded(data) : url.trim();
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
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={field.id} className="block font-medium text-gray-800 mb-1">
          {field.label}
          {field.required && (
            <span className="text-red-600" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-sm text-blue-600 hover:underline"
        >
          Insertar imagen
        </button>
      </div>
      {field.help && <p className="text-sm text-gray-500 mb-2">{field.help}</p>}

      <textarea
        ref={ref}
        id={field.id}
        rows={5}
        aria-invalid={error ? ("true" as const) : undefined}
        aria-describedby={describedBy}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.id, e.target.value)}
      />

      {open && (
        <div className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
          <input
            type="url"
            aria-label={`URL de la imagen para ${field.label}`}
            placeholder="https://... (o subí un archivo)"
            value={url}
            disabled={!!data}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <input
            type="file"
            accept={IMAGE_ACCEPT}
            aria-label={`Subir imagen para ${field.label}`}
            className="block text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleFile}
          />
          {data && (
            <p className="text-xs text-gray-500">Archivo cargado (se incrustará como base64).</p>
          )}
          <input
            type="text"
            aria-label={`Texto alternativo de la imagen para ${field.label}`}
            placeholder="Texto alternativo (opcional)"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={insert}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Insertar
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:underline"
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
