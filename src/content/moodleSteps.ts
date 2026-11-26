/** Pasos para pegar el HTML generado en Moodle (editor TinyMCE). */
export interface MoodleStep {
  title: string;
  desc: string;
}

export const COPY_STEP: MoodleStep = {
  title: "Generar y copiar el contenido",
  desc: "Elegí una plantilla, completá el formulario y presioná el botón \"Copiar para Moodle\".",
};

/** Lo que hay que hacer en Moodle una vez copiado el contenido. */
export const MOODLE_STEPS: MoodleStep[] = [
  {
    title: "Entrá a tu curso en Moodle",
    desc: "Iniciá sesión y abrí el curso donde querés publicar el contenido.",
  },
  {
    title: "Activá el modo edición",
    desc: "Usá el interruptor \"Modo de edición\", arriba a la derecha.",
  },
  {
    title: "Agregá o editá un recurso",
    desc: "En la sección o semana que corresponda, agregá una Página o un Área de texto y medios, o editá una actividad existente.",
  },
  {
    title: "Escribí el nombre",
    desc: "Completá el campo \"Nombre\" con el título de la clase o actividad.",
  },
  {
    title: "Abrí el código fuente del editor",
    desc: "En la barra del editor de la Descripción o el Contenido, entrá a \"Herramientas\" y elegí \"Código fuente\" (ícono <>). Si no ves la barra completa, tocá los tres puntos (⋯).",
  },
  {
    title: "Pegá y confirmá",
    desc: "Borrá lo que haya, pegá con Ctrl+V (Cmd+V en Mac) y presioná \"Guardar\" en esa ventana.",
  },
  {
    title: "Guardá los cambios",
    desc: "Bajá al final de la página y presioná \"Guardar cambios y regresar al curso\".",
  },
];
