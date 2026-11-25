import type { FieldDefinition } from "../../types/template";
import { Plus, X, AlertCircle } from "lucide-react";

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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="block text-base font-semibold text-ink">
          {field.label}
          {field.required && (
            <span className="text-rose-500 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {items.length > 0 && (
          <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
            {items.length} {items.length === 1 ? "ítem" : "ítems"}
          </span>
        )}
      </div>
      {field.help && <p className="text-sm text-ink-soft mb-1.5">{field.help}</p>}

      {items.length > 0 && (
        <ul className="space-y-2.5">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-500 shrink-0 select-none">
                {index + 1}
              </div>
              <input
                type={isUrl ? "url" : "text"}
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={field.placeholder}
                aria-label={`${field.label} elemento ${index + 1}`}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? errorId : undefined}
                className="flex-1 rounded-xl border border-line-strong bg-white px-3.5 py-2 text-base text-ink placeholder:text-stone-500 focus:bg-white focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 transition duration-150"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                aria-label={`Eliminar ${field.label.toLowerCase()} ${index + 1}`}
                className="shrink-0 w-8 h-8 rounded-lg border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={addItem}
        className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-brand-300 bg-brand-50/30 px-3.5 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50 hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition duration-150 shadow-xs cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{addLabel}</span>
      </button>

      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-semibold text-rose-700 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
