export type FieldType = "text" | "textarea" | "url" | "date" | "list" | "image" | "select";

export type TemplateValue = string | string[];

export type TemplateValues = Record<string, TemplateValue>;

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  /** Only for `list` fields: type of each list item. */
  itemType?: "text" | "url";
  /** Only for `image` fields: an image the teacher can pick with one click. */
  suggestedImage?: { url: string; label: string };
  /** Only for `select` fields: the available options (stored as the chosen string). */
  options?: string[];
}

/** Momento de la cursada en el que se usa la plantilla (agrupa el selector). */
export type TemplateGroup = "inicio" | "clases" | "aula-virtual";

/** Escenarios de la educación híbrida que cubre una plantilla. */
export type Scenario = "presencial" | "sincronico" | "asincronico" | "cursada";

/**
 * Grupo de campos que el formulario muestra como una sección plegable.
 * La primera sección ("Lo esencial") arranca abierta y debe contener los
 * campos obligatorios; el resto es opcional y arranca cerrado.
 */
export interface FieldSection {
  id: string;
  title: string;
  /** Una línea que explica para qué sirve la sección. */
  description?: string;
  /** Ids de los campos, en el orden en que se muestran. */
  fields: string[];
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  group: TemplateGroup;
  scenarios: Scenario[];
  fields: FieldDefinition[];
  /** Secciones del formulario. Sin secciones, los campos se muestran en una sola lista. */
  sections?: FieldSection[];
  generateHtml: (
    values: TemplateValues,
    accent?: string,
    images?: Record<string, string>,
  ) => string;
}
