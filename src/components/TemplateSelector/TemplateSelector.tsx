import type { TemplateDefinition } from "../../types/template";

interface TemplateSelectorProps {
  templates: TemplateDefinition[];
  onSelect: (id: string) => void;
}

export function TemplateSelector({ templates, onSelect }: TemplateSelectorProps) {
  return (
    <section aria-labelledby="select-template-heading" className="max-w-6xl mx-auto px-4 py-8">
      <h2 id="select-template-heading" className="text-xl font-semibold text-gray-900 mb-4">
        Elegí una plantilla
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className="text-left bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-blue-500 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
          >
            <div className="text-3xl mb-2" aria-hidden="true">
              {template.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
            <p className="text-gray-600 mt-1 text-sm">{template.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
