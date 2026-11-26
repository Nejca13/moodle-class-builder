import { useEffect, useMemo, useRef, useState } from "react";
import type {
  FieldDefinition,
  FieldSection,
  TemplateDefinition,
  TemplateValue,
  TemplateValues,
} from "../../types/template";
import { getList, getText } from "../../utils/htmlGenerator";
import { ListEditor } from "../ListEditor/ListEditor";
import { describeImage, prepareImage } from "../../utils/image";
import {
  Image as ImageIcon,
  AlertCircle,
  X,
  Check,
  ChevronDown,
  Sparkles,
  CircleCheck,
  Bold,
  Italic,
  Link2,
} from "lucide-react";
import { ScenarioTag, TemplateIcon } from "../TemplateIcon/TemplateIcon";

interface TemplateFormProps {
  template: TemplateDefinition;
  values: TemplateValues;
  errors: Record<string, string>;
  onChange: (id: string, value: TemplateValue) => void;
  onImageAdded: (dataUri: string) => string;
  /** Carga el ejemplo de la plantilla. Sin ejemplo, no se muestra el botón. */
  onLoadExample?: () => void;
  /** Cambia en cada intento fallido de copiar: abre y enfoca el primer error. */
  focusErrorsKey?: number;
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

export function TemplateForm({
  template,
  values,
  errors,
  onChange,
  onImageAdded,
  onLoadExample,
  focusErrorsKey = 0,
}: TemplateFormProps) {
  const sections = useMemo(() => resolveSections(template), [template]);
  const fieldsById = useMemo(
    () => new Map(template.fields.map((f) => [f.id, f])),
    [template],
  );

  // Arranca abierta "Lo esencial" y toda sección que ya tenga contenido
  // (por ejemplo, al volver a un borrador).
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    sections.forEach((section, index) => {
      if (index === 0 || filledCount(section, values) > 0) initial.add(section.id);
    });
    return initial;
  });

  const setSectionOpen = (id: string, open: boolean) => {
    setOpenSections((prev) => {
      if (prev.has(id) === open) return prev;
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Al intentar copiar con errores: abrir las secciones afectadas y llevar
  // el foco al primer campo con error.
  const errorsRef = useRef(errors);
  errorsRef.current = errors;
  useEffect(() => {
    if (!focusErrorsKey) return;
    const current = errorsRef.current;
    const withErrors = sections.filter((s) => s.fields.some((id) => current[id]));
    if (withErrors.length === 0) return;
    setOpenSections((prev) => new Set([...prev, ...withErrors.map((s) => s.id)]));
    const firstId = withErrors[0].fields.find((id) => current[id]);
    requestAnimationFrame(() => {
      const wrapper = document.getElementById(`campo-${firstId}`);
      const target = wrapper?.querySelector<HTMLElement>("input, textarea, select, button");
      wrapper?.scrollIntoView({ block: "center", behavior: "smooth" });
      target?.focus({ preventScroll: true });
    });
  }, [focusErrorsKey, sections]);

  const completed = sections.filter((s) => filledCount(s, values) > 0).length;

  const renderField = (field: FieldDefinition) => (
    <div key={field.id} id={`campo-${field.id}`} className="scroll-mt-24">
      <FieldControl
        field={field}
        values={values}
        errors={errors}
        onChange={onChange}
        onImageAdded={onImageAdded}
      />
    </div>
  );

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
        {onLoadExample && (
          <button
            type="button"
            onClick={onLoadExample}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-300 bg-brand-50 px-3.5 py-2 text-base font-semibold text-brand-800 hover:bg-brand-100"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Completar con un ejemplo
          </button>
        )}
      </div>

      {sections.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper p-4">
          <p className="text-base text-ink">
            <strong className="font-semibold">Solo "{sections[0].title}" es necesario.</strong>{" "}
            <span className="text-ink-soft">
              El resto suma, pero podés completarlo cuando quieras. Se guarda solo, un borrador por
              plantilla: antes de armar otra clase con esta plantilla, copiá la que tenés.
            </span>
          </p>
          <p className="text-sm font-semibold text-ink-soft" aria-live="polite">
            {completed} de {sections.length} secciones con contenido
          </p>
        </div>
      )}

      {sections.length <= 1
        ? template.fields.map(renderField)
        : sections.map((section, index) => {
            const filled = filledCount(section, values);
            const total = section.fields.length;
            const hasError = section.fields.some((id) => errors[id]);
            return (
              <details
                key={section.id}
                className="mcb-section rounded-xl border border-line bg-white"
                open={openSections.has(section.id)}
                onToggle={(e) => setSectionOpen(section.id, e.currentTarget.open)}
              >
                <summary className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 select-none hover:bg-paper">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${
                      filled > 0 ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"
                    }`}
                    aria-hidden="true"
                  >
                    {filled > 0 ? <CircleCheck className="size-4" /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold text-ink">
                      {section.title}
                      {index > 0 && (
                        <span className="ms-2 text-sm font-semibold text-ink-soft">(opcional)</span>
                      )}
                    </span>
                    {section.description && (
                      <span className="block text-sm text-ink-soft">{section.description}</span>
                    )}
                  </span>
                  {hasError ? (
                    <span className="flex items-center gap-1 text-sm font-semibold text-rose-700">
                      <AlertCircle className="size-4" aria-hidden="true" />
                      Revisar
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-ink-soft">
                      {filled}/{total}
                      <span className="sr-only"> campos completados</span>
                    </span>
                  )}
                  <ChevronDown className="mcb-section-chevron size-5 shrink-0 text-ink-soft" aria-hidden="true" />
                </summary>
                <div className="space-y-6 border-t border-line px-4 pt-5 pb-6">
                  {section.fields
                    .map((id) => fieldsById.get(id))
                    .filter((f): f is FieldDefinition => Boolean(f))
                    .map(renderField)}
                </div>
              </details>
            );
          })}
    </form>
  );
}

function FieldControl({
  field,
  values,
  errors,
  onChange,
  onImageAdded,
}: {
  field: FieldDefinition;
  values: TemplateValues;
  errors: Record<string, string>;
  onChange: (id: string, value: TemplateValue) => void;
  onImageAdded: (dataUri: string) => string;
}) {
  const error = errors[field.id];
  const errorId = `${field.id}-error`;
  const describedBy = error ? errorId : undefined;

  if (field.type === "list") {
    return (
      <ListEditor
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
}

/** Secciones de la plantilla; los campos que no figuran en ninguna van al final. */
function resolveSections(template: TemplateDefinition): FieldSection[] {
  if (!template.sections || template.sections.length === 0) return [];
  const listed = new Set(template.sections.flatMap((s) => s.fields));
  const rest = template.fields.map((f) => f.id).filter((id) => !listed.has(id));
  return rest.length > 0
    ? [...template.sections, { id: "otros", title: "Otros datos", fields: rest }]
    : template.sections;
}

function isFilled(value: TemplateValue | undefined): boolean {
  if (Array.isArray(value)) return value.some((v) => v.trim() !== "");
  return typeof value === "string" && value.trim() !== "";
}

function filledCount(section: FieldSection, values: TemplateValues): number {
  return section.fields.filter((id) => isFilled(values[id])).length;
}

function ImageInfo({ info }: { info: { text: string; heavy: boolean } }) {
  return (
    <p
      className={`mt-2 flex items-start gap-1.5 text-sm font-medium ${
        info.heavy ? "text-amber-800" : "text-brand-800"
      }`}
    >
      {info.heavy ? (
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      ) : (
        <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      )}
      <span>{info.text}</span>
    </p>
  );
}

function FormatButton({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={pressed}
      className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-ink-soft hover:bg-paper-deep hover:text-ink aria-pressed:bg-brand-50 aria-pressed:text-brand-800"
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
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
  const [info, setInfo] = useState<{ text: string; heavy: boolean } | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!IMAGE_ACCEPT.split(",").includes(file.type)) {
      setInfo({ heavy: true, text: "Ese archivo no es una imagen compatible (usá JPG, PNG, GIF o WebP)." });
      return;
    }
    const image = await prepareImage(file);
    setInfo(describeImage(image));
    onChange(field.id, image.dataUri);
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

      {field.suggestedImage && value !== field.suggestedImage.url && (
        <button
          type="button"
          onClick={() => {
            if (fileRef.current) fileRef.current.value = "";
            setInfo(null);
            onChange(field.id, field.suggestedImage!.url);
          }}
          className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-300 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-800 hover:bg-brand-100"
        >
          <ImageIcon className="size-4" aria-hidden="true" />
          {field.suggestedImage.label}
        </button>
      )}

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
              setInfo(null);
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition"
          >
            Quitar
          </button>
        )}
      </div>

      {isData && info && <ImageInfo info={info} />}
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

  const [info, setInfo] = useState<{ text: string; heavy: boolean } | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !IMAGE_ACCEPT.split(",").includes(file.type)) return;
    const image = await prepareImage(file);
    setInfo(describeImage(image));
    setData(image.dataUri);
  };

  /** Envuelve la selección (o un texto de ejemplo) con las marcas de formato. */
  const wrap = (before: string, after: string, placeholder: string) => {
    const ta = ref.current;
    const start = ta ? ta.selectionStart : value.length;
    const end = ta ? ta.selectionEnd : value.length;
    const selected = value.slice(start, end) || placeholder;
    onChange(field.id, value.slice(0, start) + before + selected + after + value.slice(end));
    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
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
    setInfo(null);
    requestAnimationFrame(() => {
      if (ta) {
        ta.focus();
        const pos = start + token.length;
        ta.setSelectionRange(pos, pos);
      }
    });
  };

  return (
    <div className="group/text space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={field.id} className="block text-base font-semibold text-ink">
          {field.label}
          {field.required && (
            <span className="text-rose-500 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="flex items-center gap-1" aria-label={`Formato de ${field.label}`} role="group">
          <FormatButton label="Negrita" onClick={() => wrap("**", "**", "texto en negrita")}>
            <Bold className="size-4" aria-hidden="true" />
          </FormatButton>
          <FormatButton label="Cursiva" onClick={() => wrap("*", "*", "texto en cursiva")}>
            <Italic className="size-4" aria-hidden="true" />
          </FormatButton>
          <FormatButton label="Enlace" onClick={() => wrap("[", "](https://)", "texto del enlace")}>
            <Link2 className="size-4" aria-hidden="true" />
          </FormatButton>
          <FormatButton label="Insertar imagen" pressed={open} onClick={() => setOpen((o) => !o)}>
            <ImageIcon className="size-4" aria-hidden="true" />
          </FormatButton>
        </div>
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
      <p className="hidden text-sm text-ink-soft group-focus-within/text:block">
        Seleccioná texto y usá los botones de arriba. Las direcciones web (https://…) se convierten
        solas en enlaces.
      </p>
      {value.includes("[[imagen:") && (
        <p className="text-sm text-ink-soft">
          La marca <code className="rounded bg-paper-deep px-1">[[imagen:…]]</code> indica dónde va
          cada imagen. Podés moverla, pero no la cambies.
        </p>
      )}

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
          {data && info && <ImageInfo info={info} />}
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
