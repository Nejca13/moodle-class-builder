export type FieldType = "text" | "textarea" | "url" | "date" | "list" | "image";

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
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: FieldDefinition[];
  generateHtml: (
    values: TemplateValues,
    accent?: string,
    images?: Record<string, string>,
  ) => string;
}
