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
  /** Only for `select` fields: the available options (stored as the chosen string). */
  options?: string[];
}

/** Momento de la cursada en el que se usa la plantilla (agrupa el selector). */
export type TemplateGroup = "inicio" | "clases" | "aula-virtual";

/** Escenarios de la educación híbrida que cubre una plantilla. */
export type Scenario = "presencial" | "sincronico" | "asincronico" | "cursada";

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  group: TemplateGroup;
  scenarios: Scenario[];
  fields: FieldDefinition[];
  generateHtml: (
    values: TemplateValues,
    accent?: string,
    images?: Record<string, string>,
  ) => string;
}
