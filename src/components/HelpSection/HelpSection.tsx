import { ChevronDown, HelpCircle } from "lucide-react";
import { COPY_STEP, MOODLE_STEPS } from "../../content/moodleSteps";
export function HelpSection() {
  const steps = [COPY_STEP, ...MOODLE_STEPS].map((step, i) => ({ ...step, num: String(i + 1) }));

  return (
    <section id="ayuda-moodle" className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-labelledby="help-heading">
      <details className="group rounded-2xl border border-line bg-white">
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 select-none">
          <span className="flex items-center gap-3">
            <HelpCircle className="size-5 text-brand-700" aria-hidden="true" />
            <span id="help-heading" className="font-display text-lg font-bold text-ink">
              Paso a paso: ¿cómo pegar el HTML en Moodle?
            </span>
          </span>
          <ChevronDown className="size-5 text-ink-soft transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>

        <div className="border-t border-line px-5 py-6">
          <ol className="grid gap-x-8 gap-y-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,22rem),1fr))]">
            {steps.map((step) => (
              <li key={step.num} className="flex gap-3">
                <span
                  className="font-display text-2xl font-bold leading-none text-brand-600"
                  aria-hidden="true"
                >
                  {step.num}
                </span>
                <div>
                  <h3 className="font-sans text-base font-bold text-ink">{step.title}</h3>
                  <p className="text-base text-ink-soft">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-6 rounded-xl bg-brand-50 p-4 text-base text-brand-900">
            <strong>Tip:</strong> el HTML generado ya trae todos los estilos. Al pegarlo en{" "}
            <em>Herramientas → Código fuente</em>, Moodle respeta el diseño y los colores sin
            plugins adicionales.
          </p>
        </div>
      </details>
    </section>
  );
}
