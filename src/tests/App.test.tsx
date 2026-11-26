import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { copyHtml } from "../utils/clipboard";
import { embedFormData } from "../utils/embed";
import { getTemplateById } from "../templates";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

vi.mock("../utils/clipboard", () => ({
  copyText: vi.fn().mockResolvedValue(true),
  copyHtml: vi.fn().mockResolvedValue(true),
}));

/** Campo de enlace de la imagen de portada (obligatoria). */
const coverInput = () => screen.getByRole("textbox", { name: /^Imagen de portada/i });

describe("App integration", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, "", "/");
    vi.mocked(copyHtml).mockClear();
  });

  it("selects a template, fills the form and updates the preview", async () => {
    vi.mocked(copyHtml).mockClear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Introducción a Python");

    expect(screen.getByText("Introducción a Python")).toBeInTheDocument();
  });

  it("adds list items and reflects them in the preview", async () => {
    vi.mocked(copyHtml).mockClear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Tema");
    await user.click(screen.getByRole("button", { name: /Agregar objetivos/i }));

    const objectiveInputs = screen.getAllByLabelText(/Objetivos elemento/i);
    await user.type(objectiveInputs[0], "Aprender Python");
    await user.click(screen.getByRole("button", { name: /Agregar objetivos/i }));
    const objectiveInputs2 = screen.getAllByLabelText(/Objetivos elemento/i);
    await user.type(objectiveInputs2[1], "Crear un programa");

    expect(screen.getByText("Aprender Python")).toBeInTheDocument();
    expect(screen.getByText("Crear un programa")).toBeInTheDocument();
  });

  it("copies HTML to the clipboard", async () => {
    vi.mocked(copyHtml).mockClear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Mi clase");
    await user.type(coverInput(), "https://example.com/portada.jpg");

    await user.click(screen.getAllByRole("button", { name: /^Copiar para Moodle$/i })[0]);

    expect(copyHtml).toHaveBeenCalled();
    expect((copyHtml as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain(
      "Mi clase",
    );
    // The generated content (with the title) is reflected in the preview.
    expect(screen.getByText("Mi clase")).toBeInTheDocument();
  });

  it("blocks copy and shows an error when required title is empty", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.click(screen.getAllByRole("button", { name: /^Copiar para Moodle$/i })[0]);

    expect(screen.getByText(/Título es obligatorio/i)).toBeInTheDocument();
    expect(copyHtml).not.toHaveBeenCalled();
    // Lleva el foco al campo que falta completar.
    await waitFor(() => expect(screen.getByLabelText(/Título/i)).toHaveFocus());
  });

  it("requires a cover image before copying", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Mi clase");
    await user.click(screen.getAllByRole("button", { name: /^Copiar para Moodle$/i })[0]);

    expect(copyHtml).not.toHaveBeenCalled();
    expect(screen.getByText(/Agregá una imagen/i)).toBeInTheDocument();
    await waitFor(() => expect(coverInput()).toHaveFocus());
  });

  it("uses the CEAER cover with one click", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.click(screen.getByRole("button", { name: /Usar la portada del CEAER/i }));

    expect(coverInput()).toHaveValue("https://plantillas.ceaer.edu.ar/portada-ceaer.jpg");
    expect(screen.queryByRole("button", { name: /Usar la portada del CEAER/i })).not.toBeInTheDocument();
  });

  it("embeds the form data in the copied HTML", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Mi clase");
    await user.type(coverInput(), "https://example.com/portada.jpg");
    await user.click(screen.getAllByRole("button", { name: /^Copiar para Moodle$/i })[0]);

    expect(vi.mocked(copyHtml).mock.calls[0][0]).toMatch(/<!-- gestor-de-clases:v1 /);
  });

  it("reopens a published class from its HTML to edit it", async () => {
    const values = { title: "Clase publicada", portada: "https://example.com/p.jpg", objectives: ["Repasar"] };
    const html = embedFormData(getTemplateById("theoretical-class")!.generateHtml(values, "#6a4a8c"), {
      templateId: "theoretical-class",
      accent: "#6a4a8c",
      values,
      images: {},
    });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Editar una clase ya publicada/i }));
    const dialog = screen.getByRole("dialog", { name: /Editar una clase ya publicada/i });
    await user.click(within(dialog).getByLabelText(/Código de la clase/i));
    await user.paste(html);
    await user.click(within(dialog).getByRole("button", { name: /Abrir para editar/i }));

    expect(window.location.search).toBe("?plantilla=theoretical-class");
    expect(screen.getByLabelText(/Título/i)).toHaveValue("Clase publicada");
    expect(localStorage.getItem("mcb:accent:theoretical-class")).toBe("#6a4a8c");
  });

  it("warns about changes made directly in Moodle and lists them in the editor", async () => {
    const html = readFileSync(resolve(__dirname, "../../tests/moodle/moodle-guardado.html"), "utf8");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Editar una clase ya publicada/i }));
    const dialog = screen.getByRole("dialog", { name: /Editar una clase ya publicada/i });
    await user.click(within(dialog).getByLabelText(/Código de la clase/i));
    await user.paste(html);
    await user.click(within(dialog).getByRole("button", { name: /Abrir para editar/i }));

    const warning = within(dialog).getByRole("alert");
    expect(warning).toHaveTextContent(/cambios hechos directamente en Moodle/i);
    expect(warning).toHaveTextContent("Gatitos #1 — Casdasdasd");
    await user.click(within(dialog).getByRole("button", { name: /^Abrir igual$/i }));

    expect(screen.getByLabelText(/Título/i)).toHaveValue("Gatitos #1 — Cuidado felino básico");
    const banner = screen.getByRole("region", { name: /Cambios hechos en Moodle/i });
    expect(banner).toHaveTextContent("Ayuda y accesibilidada asdasdasd");
    await user.click(within(banner).getByRole("button", { name: /ya los rehice/i }));
    expect(screen.queryByRole("region", { name: /Cambios hechos en Moodle/i })).not.toBeInTheDocument();
  });

  it("explains why an old class cannot be reopened", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Editar una clase ya publicada/i }));
    const dialog = screen.getByRole("dialog", { name: /Editar una clase ya publicada/i });
    const code = within(dialog).getByLabelText(/Código de la clase/i);
    await user.click(code);
    await user.paste("<p>Clase hecha a mano</p>");
    await user.click(within(dialog).getByRole("button", { name: /Abrir para editar/i }));

    expect(within(dialog).getByRole("alert")).toHaveTextContent(/no tiene los datos del Gestor/i);
    expect(code).toHaveAttribute("aria-invalid", "true");
  });

  it("asks before replacing an existing draft when reopening a class", async () => {
    localStorage.setItem("mcb:draft:theoretical-class", JSON.stringify({ title: "Borrador previo" }));
    const values = { title: "Clase publicada" };
    const html = embedFormData(getTemplateById("theoretical-class")!.generateHtml(values), {
      templateId: "theoretical-class",
      values,
      images: {},
    });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Editar una clase ya publicada/i }));
    const dialog = screen.getByRole("dialog", { name: /Editar una clase ya publicada/i });
    await user.click(within(dialog).getByLabelText(/Código de la clase/i));
    await user.paste(html);
    await user.click(within(dialog).getByRole("button", { name: /Abrir para editar/i }));

    expect(within(dialog).getByRole("alert")).toHaveTextContent(/Ya tenés un borrador/i);
    await user.click(within(dialog).getByRole("button", { name: /Reemplazar el borrador y abrir/i }));
    expect(screen.getByLabelText(/Título/i)).toHaveValue("Clase publicada");
  });

  it("does not show required errors before the teacher interacts", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    expect(screen.queryByText(/Título es obligatorio/i)).not.toBeInTheDocument();
  });

  it("groups templates by moment of the course", async () => {
    render(<App />);
    const groups = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(groups.slice(0, 3)).toEqual([
      "Inicio de la cursada",
      "Clases y encuentros",
      "Trabajo en el aula virtual",
    ]);
  });

  it("links each template card to its example in a new tab", () => {
    render(<App />);

    const links = screen.getAllByRole("link", { name: /Ver ejemplo/i });
    expect(links).toHaveLength(5);
    const activity = screen.getByRole("link", { name: /Ver ejemplo de Actividad/i });
    expect(activity).toHaveAttribute("href", "?ejemplo=practical-activity");
    expect(activity).toHaveAttribute("target", "_blank");
    // The landing no longer embeds the examples.
    expect(screen.queryByText(/TP 1: Diario de observación de un gato/)).not.toBeInTheDocument();
  });

  it("opens the example page from ?ejemplo= and switches to the editor", async () => {
    window.history.pushState(null, "", "/?ejemplo=practical-activity");
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/TP 1: Diario de observación de un gato/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Usar esta plantilla/i }));
    expect(window.location.search).toBe("?plantilla=practical-activity");
    expect(screen.getByRole("heading", { name: /^Actividad$/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByLabelText(/Título/i)).toHaveValue("");
  });

  it("clears the form", async () => {
    vi.mocked(copyHtml).mockClear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Algo");
    await user.click(screen.getByRole("button", { name: /Empezar de nuevo/i }));
    await user.click(screen.getByRole("button", { name: /Sí, borrar todo/i }));

    expect(screen.getByLabelText(/Título/i)).toHaveValue("");
  });

  it("asks before clearing and keeps the content when cancelled", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Algo");
    await user.click(screen.getByRole("button", { name: /Empezar de nuevo/i }));

    expect(screen.getByRole("dialog", { name: /Borrar todo el formulario/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Cancelar$/i }));
    expect(screen.getByLabelText(/Título/i)).toHaveValue("Algo");
  });

  it("shows the Moodle paste guide after copying, unless the teacher hides it", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Mi clase");
    await user.type(coverInput(), "https://example.com/portada.jpg");
    await user.click(screen.getAllByRole("button", { name: /^Copiar para Moodle$/i })[0]);

    const guide = screen.getByRole("dialog", { name: /ya está copiado/i });
    expect(within(guide).getByText(/Activá el modo edición/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/no mostrar más al copiar/i));
    await user.click(screen.getByRole("button", { name: /Entendido/i }));
    expect(localStorage.getItem("mcb:flag:hidePasteGuide")).toBe("1");

    await user.click(screen.getAllByRole("button", { name: /^Copiar para Moodle$/i })[0]);
    expect(copyHtml).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("dialog", { name: /ya está copiado/i })).not.toBeInTheDocument();
  });

  it("opens the paste guide on demand", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.click(screen.getByRole("button", { name: /Cómo lo pego en Moodle/i }));
    expect(screen.getByRole("dialog", { name: /Cómo pegarlo en Moodle/i })).toBeInTheDocument();
  });

  it("fills an empty form with the example right away", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Actividad/i }));
    await user.click(screen.getByRole("button", { name: /Completar con un ejemplo/i }));

    expect(screen.getByLabelText(/Título/i)).toHaveValue("TP 1: Diario de observación de un gato");
  });

  it("asks before replacing existing content with the example", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Actividad/i }));
    await user.type(screen.getByLabelText(/Título/i), "Mi TP");
    await user.click(screen.getByRole("button", { name: /Completar con un ejemplo/i }));
    await user.click(screen.getByRole("button", { name: /Sí, cargar el ejemplo/i }));

    expect(screen.getByLabelText(/Título/i)).toHaveValue("TP 1: Diario de observación de un gato");
  });

  it("adds bold markup with the format button and renders it in the preview", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    const field = within(document.getElementById("campo-contents") as HTMLElement);
    await user.click(field.getByRole("button", { name: "Negrita" }));

    expect(field.getByRole("textbox")).toHaveValue("**texto en negrita**");
    expect(document.querySelector(".mcb-preview strong")).toHaveTextContent("texto en negrita");
  });

  it("groups the form in sections with only the essentials open", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Actividad/i }));
    const essentials = screen.getByText("Lo esencial").closest("details");
    const optional = screen.getByText("Organización").closest("details");
    expect(essentials).toHaveAttribute("open");
    expect(optional).not.toHaveAttribute("open");
  });

  it("puts the selected template in the URL and persists its draft", async () => {
    vi.mocked(copyHtml).mockClear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Persistido");

    expect(window.location.search).toBe("?plantilla=theoretical-class");
    const draft = JSON.parse(localStorage.getItem("mcb:draft:theoretical-class") ?? "{}");
    expect(draft.title).toBe("Persistido");
  });

  it("opens the selector at the root even if a template was used before", () => {
    // Regression: the app used to jump into the last opened template.
    localStorage.setItem("mcb:lastTemplateId", "practical-activity");
    localStorage.setItem("mcb:draft:practical-activity", JSON.stringify({ title: "Actividad previa" }));
    render(<App />);

    expect(screen.getByRole("heading", { name: /Elegí una plantilla/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Título/i)).not.toBeInTheDocument();
  });

  it("restores the draft when the template is opened from the URL", () => {
    window.history.replaceState(null, "", "/?plantilla=practical-activity");
    localStorage.setItem(
      "mcb:draft:practical-activity",
      JSON.stringify({ title: "Actividad previa", objective: "o", assignment: "c" }),
    );
    render(<App />);

    expect(screen.getByLabelText(/Título/i)).toHaveValue("Actividad previa");
  });

  it("falls back to the selector for an unknown template id", () => {
    window.history.replaceState(null, "", "/?plantilla=no-existe");
    render(<App />);
    expect(screen.getByRole("heading", { name: /Elegí una plantilla/i })).toBeInTheDocument();
  });

  it("supports the browser back button", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();

    window.history.back();
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /Elegí una plantilla/i })).toBeInTheDocument(),
    );
  });

  it("switches back to the selector and chooses another template", async () => {
    vi.mocked(copyHtml).mockClear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.click(screen.getByRole("button", { name: /Cambiar de plantilla/i }));
    expect(screen.getByRole("heading", { name: /Elegí una plantilla/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Actividad/i }));
    expect(screen.getByText(/Crear una consigna o trabajo práctico/i)).toBeInTheDocument();
  });
});
