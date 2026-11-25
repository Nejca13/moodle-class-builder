import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { copyText } from "../utils/clipboard";

vi.mock("../utils/clipboard", () => ({
  copyText: vi.fn().mockResolvedValue(true),
}));

describe("App integration", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, "", "/");
    vi.mocked(copyText).mockClear();
  });

  it("selects a template, fills the form and updates the preview", async () => {
    vi.mocked(copyText).mockClear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Introducción a Python");

    expect(screen.getByText("Introducción a Python")).toBeInTheDocument();
  });

  it("adds list items and reflects them in the preview", async () => {
    vi.mocked(copyText).mockClear();
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
    vi.mocked(copyText).mockClear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Mi clase");

    await user.click(screen.getByRole("button", { name: /^Copiar HTML$/i }));

    expect(copyText).toHaveBeenCalled();
    expect((copyText as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain(
      "Mi clase",
    );
    // The generated content (with the title) is reflected in the preview.
    expect(screen.getByText("Mi clase")).toBeInTheDocument();
  });

  it("blocks copy and shows an error when required title is empty", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.click(screen.getByRole("button", { name: /^Copiar HTML$/i }));

    expect(screen.getByText(/Título es obligatorio/i)).toBeInTheDocument();
    expect(copyText).not.toHaveBeenCalled();
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
    vi.mocked(copyText).mockClear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Algo");
    await user.click(screen.getByRole("button", { name: /Limpiar/i }));

    expect(screen.getByLabelText(/Título/i)).toHaveValue("");
  });

  it("puts the selected template in the URL and persists its draft", async () => {
    vi.mocked(copyText).mockClear();
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
    vi.mocked(copyText).mockClear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.click(screen.getByRole("button", { name: /Cambiar de plantilla/i }));
    expect(screen.getByRole("heading", { name: /Elegí una plantilla/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Actividad/i }));
    expect(screen.getByText(/Crear una consigna o trabajo práctico/i)).toBeInTheDocument();
  });
});
