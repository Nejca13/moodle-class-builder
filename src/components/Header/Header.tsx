import { NotebookPen } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <NotebookPen className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight text-ink sm:text-2xl">Gestor de Clases</h1>
            <p className="text-sm text-ink-soft">Plantillas para Moodle · Educación híbrida</p>
          </div>
        </div>

        <a
          href="https://nejca.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:decoration-brand-700"
        >
          por Nejca
        </a>
      </div>
    </header>
  );
}
