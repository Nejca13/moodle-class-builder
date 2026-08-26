import type { FieldDefinition, TemplateDefinition, TemplateValue, TemplateValues } from "../../types/template";
import { getList, getText } from "../../utils/htmlGenerator";
import { ListEditor } from "../ListEditor/ListEditor";

interface TemplateFormProps {
  template: TemplateDefinition;
  values: TemplateValues;
  errors: Record<string, string>;
  onChange: (id: string, value: TemplateValue) => void;
}

function FieldError({ field, errors }: { field: FieldDefinition; errors: Record<string, string> }) {
  const error = errors[field.id];
  if (!error) return null;
  return (
    <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600">
      {error}
    </p>
  );
}

export function TemplateForm({ template, values, errors, onChange }: TemplateFormProps) {
  return (
    <form className="space-y-5" aria-labelledby="form-heading" onSubmit={(e) => e.preventDefault()}>
      <h2 id="form-heading" className="text-lg font-semibold text-gray-900">
        {template.icon} {template.name}
      </h2>
      <p className="text-sm text-gray-500">{template.description}</p>

      {template.fields.map((field) => {
        const error = errors[field.id];
        const errorId = `${field.id}-error`;
        const describedBy = error ? errorId : undefined;

        if (field.type === "list") {
          return (
            <ListEditor
              key={field.id}
              field={field}
              items={getList(values[field.id])}
              onChange={(items) => onChange(field.id, items)}
              error={error}
            />
          );
        }

        const commonProps = {
          id: field.id,
          "aria-invalid": error ? ("true" as const) : undefined,
          "aria-describedby": describedBy,
          className:
            "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        };

        return (
          <div key={field.id}>
            <label htmlFor={field.id} className="block font-medium text-gray-800 mb-1">
              {field.label}
              {field.required && (
                <span className="text-red-600" aria-hidden="true">
                  {" "}
                  *
                </span>
              )}
            </label>
            {field.help && <p className="text-sm text-gray-500 mb-2">{field.help}</p>}

            {field.type === "textarea" ? (
              <textarea
                {...commonProps}
                rows={5}
                value={getText(values[field.id])}
                placeholder={field.placeholder}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            ) : (
              <input
                {...commonProps}
                type={field.type === "url" ? "url" : field.type === "date" ? "date" : "text"}
                value={getText(values[field.id])}
                placeholder={field.placeholder}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            )}

            <FieldError field={field} errors={errors} />
          </div>
        );
      })}
    </form>
  );
}
