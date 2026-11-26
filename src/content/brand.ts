/** Dominio de producción: base de las imágenes que se usan en el HTML para Moodle. */
export const PRODUCTION_BASE = "https://plantillas.ceaer.edu.ar/";

/**
 * Portada institucional del CEAER (public/portada-ceaer.jpg, 1600×450).
 * Se usa la URL absoluta del sitio publicado: el HTML se pega en Moodle y
 * la imagen tiene que cargarse desde ahí, no desde la computadora del docente.
 */
export const CEAER_COVER = {
  url: new URL("portada-ceaer.jpg", PRODUCTION_BASE).href,
  label: "Usar la portada del CEAER",
};
