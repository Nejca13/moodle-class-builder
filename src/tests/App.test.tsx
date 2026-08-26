import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { copyText } from "../utils/clipboard";

vi.mock("../utils/clipboard", () => ({
  copyText: vi.fn().mockResolvedValue(true),
}));

describe("App integration", () => {
  beforeEach(() => {
    localStorage.clear();
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

  it("clears the form", async () => {
    vi.mocked(copyText).mockClear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Algo");
    await user.click(screen.getByRole("button", { name: /Limpiar/i }));

    expect(screen.getByLabelText(/Título/i)).toHaveValue("");
  });

  it("persists the selected template and draft in localStorage", async () => {
    vi.mocked(copyText).mockClear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Clase teórica/i }));
    await user.type(screen.getByLabelText(/Título/i), "Persistido");

    expect(localStorage.getItem("mcb:lastTemplateId")).toBe("theoretical-class");
    const draft = JSON.parse(localStorage.getItem("mcb:draft:theoretical-class") ?? "{}");
    expect(draft.title).toBe("Persistido");
  });

  it("restores the last template and draft on startup", async () => {
    vi.mocked(copyText).mockClear();
    localStorage.setItem("mcb:lastTemplateId", "practical-activity");
    localStorage.setItem(
      "mcb:draft:practical-activity",
      JSON.stringify({ title: "Actividad previa", objective: "o", assignment: "c" }),
    );
    render(<App />);

    expect(screen.getByLabelText(/Título/i)).toHaveValue("Actividad previa");
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
