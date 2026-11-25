import { ChevronDown, HelpCircle } from "lucide-react";
export function HelpSection() {
  const steps = [
    {
      num: "1",
      title: "Generar y copiar el código",
      desc: "Elegí una plantilla, completá el contenido en el formulario y presioná el botón \"Copiar HTML\".",
    },
    {
      num: "2",
      title: "Ingresar a tu curso en Moodle",
      desc: "Iniciá sesión en la plataforma Moodle y seleccioná el curso al cual querés agregar la clase.",
    },
    {
      num: "3",
      title: "Activar el modo edición",
      desc: "Hacé clic en el botón \"Activar modo edición\" (ubicado en la esquina superior derecha).",
    },
    {
      num: "4",
      title: "Seleccionar sección o semana",
      desc: "Andá a la sección o semana a editar y agregá o editá la actividad o recurso (ej: Página o Etiqueta).",
    },
    {
      num: "5",
      title: "Escribir el título",
      desc: "Colocá el nombre o título de la clase/actividad manualmente en el campo correspondiente.",
    },
    {
      num: "6",
      title: "Abrir Código fuente en TinyMCE",
      desc: "En la sección Descripción o Contenido, en la barra del editor buscá la pestaña \"Herramientas\" y seleccioná \"Código fuente\" (icono <>).",
    },
    {
      num: "7",
      title: "Pegar el HTML y confirmar",
      desc: "Pegá el HTML copiado dentro de la ventana emergente de código fuente y presioná \"Guardar\".",
    },
    {
      num: "8",
      title: "Guardar cambios en Moodle",
      desc: "Por último, bajá al final de la página y hacé clic en \"Guardar cambios\" o \"Guardar cambios y volver al curso\".",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-labelledby="help-heading">
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
