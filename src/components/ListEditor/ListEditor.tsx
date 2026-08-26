import type { FieldDefinition } from "../../types/template";

interface ListEditorProps {
  field: FieldDefinition;
  items: string[];
  onChange: (items: string[]) => void;
  error?: string;
}

export function ListEditor({ field, items, onChange, error }: ListEditorProps) {
  const isUrl = field.itemType === "url";
  const addLabel = `Agregar ${field.label.toLowerCase()}`;
  const errorId = `${field.id}-error`;

  const updateItem = (index: number, value: string) => {
    const next = items.slice();
    next[index] = value;
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([...items, ""]);
  };

  return (
    <div>
      <span className="block font-medium text-gray-800 mb-1">{field.label}</span>
      {field.help && <p className="text-sm text-gray-500 mb-2">{field.help}</p>}

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <input
              type={isUrl ? "url" : "text"}
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={field.placeholder}
              aria-label={`${field.label} elemento ${index + 1}`}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? errorId : undefined}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              aria-label={`Eliminar ${field.label.toLowerCase()} ${index + 1}`}
              className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={addItem}
        className="mt-2 inline-flex items-center gap-1 rounded-md border border-dashed border-gray-400 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        + {addLabel}
      </button>

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
