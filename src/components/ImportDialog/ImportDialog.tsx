import { useId, useRef, useState } from "react";
import { AlertCircle, FileUp, TriangleAlert } from "lucide-react";
import { Modal } from "../Modal/Modal";
import { extractFormData, hasEmbeddedData, type ExtractResult } from "../../utils/embed";
import { getTemplateById } from "../../templates";

type Imported = Extract<ExtractResult, { ok: true }>;

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  /** true si ya hay un borrador con contenido de esa plantilla en este navegador. */
  hasDraft: (templateId: string) => boolean;
  onImport: (data: Imported) => void;
}

const ERRORS: Record<Exclude<ExtractResult, { ok: true }>["reason"], string> = {
  empty: "Pegá el código de la clase o elegí el archivo que descargaste.",
  "no-data":
    "Este contenido no tiene los datos del Gestor. Revisá que lo hayas copiado desde \"Código fuente\" y no desde la página. Las clases creadas antes de esta función no se pueden recuperar: hay que armarlas de nuevo.",
  corrupt: "Los datos están incompletos. Volvé a copiar todo el código (Ctrl+A y Ctrl+C), sin dejar nada afuera.",
  "unknown-template": "La clase usa una plantilla que ya no existe en el Gestor.",
  "newer-version": "Esta clase se hizo con una versión más nueva del Gestor. Recargá la página (Ctrl+F5) y probá de nuevo.",
};

/**
 * Recupera el formulario de una clase ya publicada a partir de su HTML
 * (copiado desde "Código fuente" en Moodle o del archivo descargado).
 */
export function ImportDialog({ open, onClose, hasDraft, onImport }: ImportDialogProps) {
  const id = useId();
  const textId = `${id}-code`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  // Resultado que necesita confirmación: reemplaza un borrador o tiene
  // cambios hechos en Moodle que no se pueden recuperar.
  const [pending, setPending] = useState<{ data: Imported; replacesDraft: boolean } | null>(null);

  const reset = () => {
    setText("");
    setError("");
    setPending(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const close = () => {
    reset();
    onClose();
  };

  const tryImport = (html: string) => {
    const result = extractFormData(html);
    if (!result.ok) {
      setPending(null);
      setError(ERRORS[result.reason]);
      requestAnimationFrame(() => textRef.current?.focus());
      return;
    }
    setError("");
    const replacesDraft = hasDraft(result.templateId);
    if (replacesDraft || result.editedInMoodle.length > 0) {
      setPending({ data: result, replacesDraft });
      return;
    }
    reset();
    onImport(result);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    setText(content);
    tryImport(content);
  };

  // Si se copió el contenido con formato, los datos pueden venir solo en text/html.
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const plain = e.clipboardData.getData("text/plain");
    const rich = e.clipboardData.getData("text/html");
    if (!hasEmbeddedData(plain) && hasEmbeddedData(rich)) {
      e.preventDefault();
      setText(rich);
      setPending(null);
      setError("");
    }
  };

  const pendingName = pending ? getTemplateById(pending.data.templateId)?.name : "";
  const edits = pending?.data.editedInMoodle ?? [];

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title="Editar una clase ya publicada"
      description={<p>Recuperá el formulario de una clase hecha con el Gestor para cambiarla y volver a publicarla.</p>}
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-line-strong bg-white px-4 py-2.5 text-base font-semibold text-ink hover:bg-paper"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => (pending ? (reset(), onImport(pending.data)) : tryImport(text))}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-base font-semibold text-white hover:bg-brand-700"
          >
            {!pending ? "Abrir para editar" : pending.replacesDraft ? "Reemplazar el borrador y abrir" : "Abrir igual"}
          </button>
        </>
      }
    >
      <ol className="mb-5 list-decimal space-y-1 ps-5 text-base text-ink-soft marker:font-semibold marker:text-brand-700">
        <li>En Moodle, abrí la clase para editarla y entrá a "Código fuente" (ícono &lt;&gt;).</li>
        <li>Seleccioná todo (Ctrl+A) y copiá (Ctrl+C).</li>
        <li>Pegalo acá abajo (Ctrl+V).</li>
      </ol>

      <label htmlFor={textId} className="block text-base font-semibold text-ink">
        Código de la clase
      </label>
      <p id={hintId} className="mb-1.5 text-sm text-ink-soft">
        Tiene que incluir el final del código: ahí están guardados los datos del formulario.
      </p>
      <textarea
        ref={textRef}
        id={textId}
        rows={6}
        value={text}
        spellCheck={false}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        onPaste={handlePaste}
        onChange={(e) => {
          setText(e.target.value);
          setPending(null);
          if (error) setError("");
        }}
        className="w-full rounded-xl border border-line-strong bg-white px-3.5 py-2.5 font-mono text-sm text-ink focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 aria-invalid:border-rose-600"
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      <div className="mt-4">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line-strong bg-white px-3.5 py-2 text-base font-semibold text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-600 hover:bg-paper">
          <FileUp className="size-4" aria-hidden="true" />
          O elegí el archivo .html que descargaste
          <input ref={fileRef} type="file" accept=".html,.htm,text/html" onChange={handleFile} className="sr-only" />
        </label>
      </div>

      {pending && (
        <div role="alert" className="mt-4 space-y-3">
          {edits.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-base text-amber-900">
              <p className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Esta clase tiene cambios hechos directamente en Moodle</strong> que no se pueden
                  recuperar. Se va a abrir la última versión hecha en el Gestor; después vas a tener que
                  volver a escribir estos textos:
                </span>
              </p>
              <ul className="mt-2 list-disc space-y-1 ps-12">
                {edits.slice(0, 6).map((t) => (
                  <li key={t}>“{t.length > 140 ? `${t.slice(0, 140)}…` : t}”</li>
                ))}
                {edits.length > 6 && <li>y {edits.length - 6} más.</li>}
              </ul>
              <p className="mt-2 ps-7 text-sm">La lista va a quedar visible en el editor mientras hacés los cambios.</p>
            </div>
          )}
          {pending.replacesDraft && (
            <p className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-base text-amber-900">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <span>
                Ya tenés un borrador de <strong>{pendingName}</strong> en este navegador. Si continuás, se
                reemplaza por esta clase. Si lo necesitás, cancelá y copiá ese borrador primero.
              </span>
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
