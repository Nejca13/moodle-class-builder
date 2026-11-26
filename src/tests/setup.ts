import "@testing-library/jest-dom";

// jsdom in this Vitest setup exposes a `localStorage` property whose value
// is `undefined`. Provide a minimal in-memory implementation so
// storage-dependent behavior (and the App integration tests) can run.
const store = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string): string | null => (store.has(key) ? (store.get(key) as string) : null),
  setItem: (key: string, value: string): void => {
    store.set(key, String(value));
  },
  removeItem: (key: string): void => {
    store.delete(key);
  },
  clear: (): void => {
    store.clear();
  },
  key: (index: number): string | null => Array.from(store.keys())[index] ?? null,
  get length(): number {
    return store.size;
  },
};

try {
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    configurable: true,
    writable: true,
  });
} catch {
  (globalThis as unknown as { localStorage: typeof localStorageMock }).localStorage =
    localStorageMock;
}

// jsdom no implementa showModal()/close() de <dialog>: alcanza con abrir y
// cerrar el elemento y disparar "close" como hace el navegador.
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement, value?: string) {
    if (!this.hasAttribute("open")) return;
    if (value !== undefined) this.returnValue = value;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

// jsdom tampoco implementa scrollIntoView.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}
