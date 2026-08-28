import { HelpCircle, ChevronDown, CheckCircle2 } from "lucide-react";

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
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8" aria-labelledby="help-heading">
      <details className="group rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-sm shadow-xs overflow-hidden transition-all duration-200">
        <summary className="cursor-pointer px-5 py-4 text-sm font-bold text-slate-800 select-none flex items-center justify-between hover:bg-slate-50 transition">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </span>
            <span id="help-heading" className="text-base font-bold text-slate-900">
              Paso a paso: ¿Cómo pegar el HTML en Moodle?
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
        </summary>

        <div className="border-t border-slate-100 px-6 py-6 space-y-6 bg-slate-50/40">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-white p-4 sm:p-4.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {step.num}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Paso {step.num}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1.5 leading-snug">{step.title}</h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-indigo-50/70 border border-indigo-200/60 p-4 flex items-start sm:items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
              <strong>Tip:</strong> El HTML generado ya contiene todos los estilos visuales embebidos. Al pegarlo mediante <em>Herramientas → Código fuente</em>, Moodle respetará exactamente el diseño, las tarjetas y los colores elegidos sin requerir ningún plugin adicional.
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}
