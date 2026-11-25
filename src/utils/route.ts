import { getTemplateById } from "../templates";
import { EXAMPLES } from "../examples";

/**
 * The URL decides what is shown (static site, no router):
 * - `/`                      → template selector
 * - `?plantilla=<id>`        → editor of that template
 * - `?ejemplo=<id>`          → example page of that template
 * Unknown or invalid ids fall back to the selector.
 */
export type Route =
  | { view: "selector" }
  | { view: "editor"; id: string }
  | { view: "example"; id: string };

export function readRoute(search: string): Route {
  const params = new URLSearchParams(search);
  const editorId = params.get("plantilla");
  if (editorId && getTemplateById(editorId)) return { view: "editor", id: editorId };
  const exampleId = params.get("ejemplo");
  if (exampleId && EXAMPLES[exampleId] && getTemplateById(exampleId)) {
    return { view: "example", id: exampleId };
  }
  return { view: "selector" };
}

export function routeToSearch(route: Route): string {
  switch (route.view) {
    case "editor":
      return `?plantilla=${encodeURIComponent(route.id)}`;
    case "example":
      return `?ejemplo=${encodeURIComponent(route.id)}`;
    default:
      return "";
  }
}
