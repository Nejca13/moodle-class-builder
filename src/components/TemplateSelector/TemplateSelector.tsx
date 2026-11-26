import type { TemplateDefinition } from "../../types/template";
import { TEMPLATE_GROUPS } from "../../templates";
import { ExternalLink, FilePen } from "lucide-react";
import { hasExample } from "../../examples";
import { ScenarioTag, TemplateIcon } from "../TemplateIcon/TemplateIcon";

interface TemplateSelectorProps {
  templates: TemplateDefinition[];
  onSelect: (id: string) => void;
  onOpenImport: () => void;
}

export function TemplateSelector({ templates, onSelect, onOpenImport }: TemplateSelectorProps) {
  return (
    <section
      aria-labelledby="select-template-heading"
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6 animate-fade-in"
    >
      <div className="max-w-2xl">
        <h2
          id="select-template-heading"
          className="text-[clamp(1.9rem,1.4rem+1.6vw,2.6rem)] font-bold leading-tight text-ink"
        >
          Elegí una plantilla
        </h2>
        <p className="mt-3 text-lg text-ink-soft">
          Están ordenadas según el momento de la cursada. Completás el formulario y te
          llevás el HTML listo para pegar en Moodle.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 sm:p-5">
        <p className="text-base text-ink">
          <strong className="font-semibold">¿Ya publicaste una clase y querés cambiarla?</strong>{" "}
          <span className="text-ink-soft">Traela de vuelta al formulario.</span>
        </p>
        <button
          type="button"
          onClick={onOpenImport}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-300 bg-brand-50 px-4 py-2.5 text-base font-semibold text-brand-800 hover:bg-brand-100"
        >
          <FilePen className="size-4" aria-hidden="true" />
          Editar una clase ya publicada
        </button>
      </div>

      <ol className="mt-10 space-y-12">
        {TEMPLATE_GROUPS.map((group, index) => {
          const items = templates.filter((t) => t.group === group.id);
          if (items.length === 0) return null;
          const headingId = `group-${group.id}`;
          return (
            <li key={group.id}>
              <section aria-labelledby={headingId}>
                <div className="flex items-baseline gap-4 border-b border-line pb-3">
                  <span
                    className="font-display text-3xl font-bold text-brand-600"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 id={headingId} className="text-xl font-bold text-ink">
                      {group.title}
                    </h3>
                    <p className="text-base text-ink-soft">{group.description}</p>
                  </div>
                </div>

                <ul className="mt-5 grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,19rem),1fr))]">
                  {items.map((template) => (
                    <li key={template.id} className="flex">
                      <article className="mcb-card flex w-full flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_0_var(--color-line)] transition-colors">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                          <TemplateIcon icon={template.icon} className="size-6" />
                        </div>
                        <h4 className="text-lg font-bold text-ink">
                          <button
                            type="button"
                            onClick={() => onSelect(template.id)}
                            className="mcb-card-action cursor-pointer text-start"
                          >
                            {template.name}
                          </button>
                        </h4>
                        <p className="text-base text-ink-soft">{template.description}</p>
                        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex flex-wrap gap-2">
                            {template.scenarios.map((s) => (
                              <ScenarioTag key={s} scenario={s} />
                            ))}
                          </div>
                          {hasExample(template.id) && (
                            <a
                              href={`?ejemplo=${template.id}`}
                              target="_blank"
                              rel="noopener"
                              className="inline-flex items-center gap-1.5 text-base font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:decoration-brand-700"
                            >
                              Ver ejemplo
                              <span className="sr-only">
                                {" "}de {template.name} (se abre en una pestaña nueva)
                              </span>
                              <ExternalLink className="size-4" aria-hidden="true" />
                            </a>
                          )}
                        </footer>
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
