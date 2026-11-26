import { CheckCircle2 } from "lucide-react";
import { MOODLE_STEPS } from "../../content/moodleSteps";
import { Modal } from "../Modal/Modal";

interface PasteGuideDialogProps {
  open: boolean;
  /** true cuando se abre justo después de copiar. */
  justCopied: boolean;
  hideAfterCopy: boolean;
  onHideAfterCopyChange: (value: boolean) => void;
  onClose: () => void;
}

/** Pasos para pegar en Moodle, a mano justo cuando el docente los necesita. */
export function PasteGuideDialog({
  open,
  justCopied,
  hideAfterCopy,
  onHideAfterCopyChange,
  onClose,
}: PasteGuideDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      lightDismiss
      size="lg"
      title={justCopied ? "¡Listo, ya está copiado!" : "Cómo pegarlo en Moodle"}
      description={
        justCopied ? (
          <p className="flex items-center gap-2 font-semibold text-brand-800">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            Ahora pegalo en Moodle siguiendo estos pasos.
          </p>
        ) : (
          <p>Primero presioná "Copiar para Moodle". Después seguí estos pasos.</p>
        )
      }
      footer={
        <>
          {justCopied && (
            <label className="me-auto flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={hideAfterCopy}
                onChange={(e) => onHideAfterCopyChange(e.target.checked)}
                className="size-4 accent-brand-600"
              />
              Ya lo sé, no mostrar más al copiar
            </label>
          )}
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-base font-semibold text-white hover:bg-brand-700"
          >
            Entendido
          </button>
        </>
      }
    >
      <ol className="space-y-3">
        {MOODLE_STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-bold text-brand-700"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div>
              <p className="font-bold text-ink">{step.title}</p>
              <p className="text-base text-ink-soft">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-sm text-ink-soft">
        <strong className="text-ink">¿Querés cambiarla más adelante?</strong> En la pantalla de inicio usá
        "Editar una clase ya publicada" y pegá el código que está en Moodle. Hacé los cambios en el
        Gestor y no en el editor de Moodle: lo que se cambia en Moodle no queda guardado para la próxima vez.
      </p>
      <p className="mt-3 rounded-xl bg-paper p-4 text-sm text-ink-soft">
        <strong className="text-ink">Atajo para probar:</strong> también podés pegar directo en el
        editor, sin abrir "Código fuente". Algunos Moodle quitan colores y estilos al pegar así: si
        no se ve igual que en la vista previa, deshacé (Ctrl+Z) y usá "Código fuente".
      </p>
    </Modal>
  );
}
