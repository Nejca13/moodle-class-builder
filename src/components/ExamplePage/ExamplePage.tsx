import { useMemo } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { TemplateDefinition } from "../../types/template";
import { EXAMPLE_ACCENTS, EXAMPLES } from "../../examples";
import { Preview } from "../Preview/Preview";
import { ScenarioTag, TemplateIcon } from "../TemplateIcon/TemplateIcon";

interface ExamplePageProps {
  template: TemplateDefinition;
  onUseTemplate: (id: string) => void;
}

/** Página de ejemplo de una plantilla (se abre con `?ejemplo=<id>`). */
export function ExamplePage({ template, onUseTemplate }: ExamplePageProps) {
  const html = useMemo(
    () => template.generateHtml(EXAMPLES[template.id], EXAMPLE_ACCENTS[template.id]),
    [template],
  );

  return (
    <section aria-labelledby="example-heading" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 animate-fade-in">
      <a
        href="./"
        className="inline-flex items-center gap-1.5 text-base font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:decoration-brand-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver a las plantillas
      </a>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <TemplateIcon icon={template.icon} className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-soft">Ejemplo de plantilla</p>
            <h2 id="example-heading" className="text-2xl font-bold text-ink">
              {template.name}
            </h2>
            <p className="text-base text-ink-soft">
              Completada con la materia de prueba “Gatitos #1”. Es el mismo HTML que se pega en Moodle.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {template.scenarios.map((s) => (
                <ScenarioTag key={s} scenario={s} />
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onUseTemplate(template.id)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-base font-semibold text-white hover:bg-brand-700"
        >
          Usar esta plantilla
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6">
        <Preview html={html} fullHeight />
      </div>
    </section>
  );
}
