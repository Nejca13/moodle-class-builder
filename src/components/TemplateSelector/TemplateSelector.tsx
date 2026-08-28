import type { TemplateDefinition } from "../../types/template";
import { BookOpen, FileText, GraduationCap, Layers, ArrowRight } from "lucide-react";

interface TemplateSelectorProps {
  templates: TemplateDefinition[];
  onSelect: (id: string) => void;
}

function renderTemplateIcon(icon: string) {
  switch (icon) {
    case "BookOpen":
      return <BookOpen className="w-6 h-6 text-indigo-600" />;
    case "FileText":
      return <FileText className="w-6 h-6 text-indigo-600" />;
    case "GraduationCap":
      return <GraduationCap className="w-6 h-6 text-indigo-600" />;
    default:
      return <Layers className="w-6 h-6 text-indigo-600" />;
  }
}

export function TemplateSelector({ templates, onSelect }: TemplateSelectorProps) {
  return (
    <section aria-labelledby="select-template-heading" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
          Paso 1 de 2
        </span>
        <h2 id="select-template-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Elegí una plantilla
        </h2>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Seleccioná el formato ideal para tu clase o recurso. El código generado será 100% compatible con TinyMCE de Moodle.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className="group relative text-left bg-white/90 backdrop-blur-sm border border-slate-200/90 hover:border-indigo-500/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50/80 border border-indigo-100/80 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-transform duration-300 shadow-xs" aria-hidden="true">
              {renderTemplateIcon(template.icon)}
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {template.name}
              </h3>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              {template.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
