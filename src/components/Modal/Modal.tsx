import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Texto breve bajo el título. */
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Botones del pie. */
  footer?: React.ReactNode;
  /** Cerrar al tocar fuera del diálogo. Desactivalo en confirmaciones. */
  lightDismiss?: boolean;
  size?: "sm" | "lg";
}

const supportsClosedBy =
  typeof HTMLDialogElement !== "undefined" && "closedBy" in HTMLDialogElement.prototype;

let counter = 0;

/**
 * Diálogo modal nativo (<dialog> + showModal()). El navegador se encarga de
 * la captura del foco, de cerrar con Esc o con el gesto "atrás" y de devolver
 * el foco al botón que lo abrió (modern-web-guidance: ui-components/dialog).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  lightDismiss = false,
  size = "sm",
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const idRef = useRef(`mcb-dialog-${++counter}`);
  const titleId = `${idRef.current}-title`;
  const descId = `${idRef.current}-desc`;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  // Respaldo de closedby="any" para navegadores que todavía no lo soportan.
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (!lightDismiss || supportsClosedBy) return;
    if (e.target === e.currentTarget) e.currentTarget.close();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      closedby={lightDismiss ? "any" : "closerequest"}
      onClick={handleBackdropClick}
      className={`mcb-dialog ${size === "lg" ? "mcb-dialog--lg" : ""} rounded-2xl border border-line bg-white p-0 text-ink shadow-2xl`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="-m-1.5 shrink-0 cursor-pointer rounded-lg p-1.5 text-ink-soft hover:bg-paper-deep hover:text-ink"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>
        {description && (
          <div id={descId} className="mt-2 text-base text-ink-soft">
            {description}
          </div>
        )}
        {children && <div className="mt-4">{children}</div>}
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </dialog>
  );
}
