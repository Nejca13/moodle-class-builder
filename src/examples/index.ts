import type { TemplateValues } from "../types/template";
import { AI_LEVELS } from "../templates/hybrid";

import { PRODUCTION_BASE } from "../content/brand";
export { PRODUCTION_BASE };

/**
 * Fotos de Wikimedia Commons en dominio público o CC0, copiadas al repo en
 * public/ejemplos/ (créditos en public/ejemplos/CREDITOS.md) para no depender
 * de servidores externos.
 */
const PHOTO_FILES = {
  kittensResting: "kittens-resting.jpg",
  catOnWall: "cat-on-wall.jpg",
  kittenInHand: "kitten-in-hand.jpg",
  kittenSleeping: "kitten-sleeping.jpg",
  catFoodBowl: "cat-food-bowl.jpg",
  catEatingGarden: "cat-eating-garden.jpg",
};

type Photos = Record<keyof typeof PHOTO_FILES, string>;

/** Absolute photo URLs for a given site base (the generated HTML needs absolute URLs). */
function photoUrls(base: string): Photos {
  const entries = Object.entries(PHOTO_FILES).map(([key, file]) => [
    key,
    new URL(`ejemplos/${file}`, base).href,
  ]);
  return Object.fromEntries(entries) as Photos;
}

/** Color de acento de cada ejemplo, para mostrar que el color es configurable. */
export const EXAMPLE_ACCENTS: Record<string, string> = {
  "course-roadmap": "#23685c", // verde pizarrón
  "theoretical-class": "#2b5ba3", // azul
  "synchronous-meeting": "#6a4a8c", // violeta
  "practical-activity": "#a4492a", // terracota
  "educational-resource": "#b45309", // ámbar
};

/**
 * Ejemplos completos de cada plantilla, todos de la misma materia de prueba
 * ("Gatitos #1"). Son datos, no HTML: se generan con la plantilla en cada
 * render, así siempre reflejan el diseño actual.
 */
function buildExamples(PHOTOS: Photos): Record<string, TemplateValues> {
  return {
  "course-roadmap": {
    title: "Gatitos #1 — Cuidado felino básico",
    portada: PHOTOS.kittensResting,
    teachers: "Contreras Nicolás",
    pedagogicalFormat: "Taller",
    welcome:
      "¡Bienvenidos y bienvenidas a Gatitos #1! En esta materia vamos a conocer cómo piensan, juegan y se comunican los gatos, y qué necesitan para vivir sanos y felices.\n\nPrepárense para ronroneos, maullidos y mucha observación.",
    purpose:
      "Que puedan reconocer las necesidades básicas de un gato (alimentación, juego, descanso e higiene) y diseñar un plan de cuidado responsable para un gatito de hasta un año.",
    capacities: [
      "Interpretar el lenguaje corporal felino (cola, orejas y bigotes)",
      "Planificar una rutina diaria de alimentación y juego",
      "Detectar señales de alerta que requieren consulta veterinaria",
    ],
    scenarios: [
      "Presencial: martes 18 a 20 h, observación en el refugio",
      "Sincrónico: jueves 19 h por Zoom, análisis de videos de gatitos",
      "Asincrónico: lecturas y foro semanal en Moodle",
    ],
    itinerary: [
      "Unidad 1 (semanas 1-3): El gatito llega a casa",
      "Unidad 2 (semanas 4-6): Alimentación y arenero",
      "Unidad 3 (semanas 7-9): Juego, rascadores y enriquecimiento",
      "Unidad 4 (semanas 10-12): Salud, vacunas y visita al veterinario",
    ],
    attendance:
      "La asistencia se registra por presencia en el refugio o por ingreso y participación semanal en el aula virtual.",
    communication: [
      "Foro \"Maullidos y consultas\": respuesta en 48 h hábiles",
      "Mensajería de Moodle: solo temas personales",
      "Encuentro de consulta: jueves 20 h",
    ],
    evaluation: [
      "Diario de observación de un gato (40 %)",
      "Plan de cuidado de un gatito (40 %)",
      "Participación en foros (20 %)",
    ],
    tools: ["Moodle", "Zoom", "Planilla compartida de observaciones"],
    aiLevel: AI_LEVELS[1],
    aiContract:
      "Podés usar IA para buscar ideas o información sobre razas y cuidados, pero el diario de observación tiene que ser tuyo: lo que viste, con tus palabras. Si la usás, contá qué herramienta usaste y qué verificaste. Copiar textos generados sin declararlo se considera un trabajo no entregado.",
    support:
      "Si tenés alergia a los gatos, problemas de conectividad o necesitás un ajuste razonable, escribinos por mensajería de Moodle y lo resolvemos juntos.",
  },

  "theoretical-class": {
    title: "Clase 3: El lenguaje corporal felino",
    portada: PHOTOS.catOnWall,
    scenario: "Presencialidad física",
    estimatedTime: "80 minutos",
    purpose:
      "Que puedan leer el estado de ánimo de un gato a partir de su postura, su cola, sus orejas y sus bigotes.",
    objectives: [
      "Identificar las posiciones de la cola y qué expresan",
      "Distinguir un gato relajado de uno asustado o a la defensiva",
      "Registrar observaciones con vocabulario preciso",
    ],
    introduction:
      "Retomamos los videos que miraron en el aula virtual: ¿qué hacía el gato justo antes de bufar? Compartimos en parejas lo que anotaron.",
    contents:
      "La cola como indicador del estado de ánimo. Orejas y bigotes. Las pupilas. El parpadeo lento como señal de confianza.",
    development:
      "Recorremos cada señal con fotos y videos cortos. Después, en grupos, clasifican diez imágenes de gatos según su estado: relajado, curioso, asustado o a la defensiva.",
    problemQuestions: [
      "¿Un gato que mueve la cola está siempre contento?",
      "¿Qué señales nos avisan que es mejor no acercarse?",
    ],
    keyConcepts: ["Cola en signo de pregunta", "Orejas en avión", "Parpadeo lento"],
    example:
      "Michi tiene la cola erguida con la punta curvada y se frota contra las piernas: está saludando y pide atención.",
    activity: "Cada grupo arma una ficha visual con tres posturas y su significado.",
    conclusion:
      "El lenguaje corporal se lee en conjunto: una sola señal no alcanza para saber cómo está el gato.",
    afterClass:
      "Subí al foro una foto o descripción de un gato que observaste esta semana y explicá qué te dice su postura.",
  },

  "synchronous-meeting": {
    title: "Encuentro: ¿Qué nos dice la cola?",
    portada: PHOTOS.kittenInHand,
    format: "Intercambio y socialización",
    schedule: "Jueves 19 h",
    duration: "60 minutos",
    meetingLink: "https://zoom.us/j/1234567890",
    objectives: [
      "Socializar las observaciones del diario",
      "Acordar criterios comunes para describir posturas",
    ],
    preparation: "Traé dos observaciones de tu diario y una duda sobre la clase 3.",
    opening: "Ronda rápida: cada persona comparte en una palabra cómo estaba el gato que observó.",
    development:
      "Analizamos en conjunto tres videos cortos. Primero cada grupo los describe; después comparamos las descripciones y discutimos las diferencias.",
    dynamics: [
      "Salas de subgrupos de 4 personas, 15 minutos",
      "Roles: relator, secretario y moderador",
      "Encuesta rápida: ¿relajado o a la defensiva?",
    ],
    questions: ["¿Por qué dos personas describen distinto el mismo video?"],
    collaborativeTools: ["https://jamboard.example.com/gatitos-1"],
    closing: "Síntesis de los criterios acordados y consigna para la semana.",
    afterMeeting: "Revisá tu diario con los criterios acordados y corregí una entrada.",
    participationCriteria: [
      "Participa en la sala de subgrupo",
      "Aporta al menos una observación propia",
    ],
    recording: "La grabación y la pizarra quedan en la sección de la Unidad 1 del aula virtual.",
  },

  "practical-activity": {
    title: "TP 1: Diario de observación de un gato",
    portada: PHOTOS.kittenSleeping,
    scenario: "Asincronía (aula virtual)",
    workMode: "Individual",
    estimatedTime: "3 horas en dos semanas",
    context:
      "Para cuidar a un gato hay que aprender a mirarlo. En este trabajo vas a observar a un gato real durante una semana.",
    sequenceLink:
      "Retoma lo trabajado en la clase 3 y se socializa en el encuentro sincrónico del jueves.",
    objective:
      "Registrar con precisión las conductas de un gato y relacionarlas con su estado de ánimo.",
    assignment:
      "Observá a un gato (propio, de un familiar o del refugio) al menos cuatro veces en la semana, 15 minutos cada vez. Registrá qué hacía, su postura y el contexto.",
    steps: [
      "Elegí el gato y anotá su nombre, edad aproximada y dónde vive",
      "Hacé cuatro observaciones de 15 minutos en distintos momentos del día",
      "Registrá cada observación en la planilla compartida",
      "Escribí una conclusión de media página",
    ],
    resources: ["Planilla de observación", "Ficha de posturas de la clase 3"],
    deliverable: "Un documento PDF con las cuatro observaciones y la conclusión.",
    dueDate: "2027-04-15",
    criteria: [
      "Las observaciones son precisas y están fechadas",
      "Usa el vocabulario de la clase 3",
      "La conclusión se apoya en lo observado",
    ],
    feedback:
      "Devolución escrita en Moodle dentro de los 7 días. Incluye una autoevaluación con la rúbrica antes de entregar.",
    aiLevel: AI_LEVELS[0],
    aiNotes: "Este trabajo es de observación directa: lo que importa es lo que vos viste.",
    support: "Foro \"Maullidos y consultas\"; respondo en 48 h hábiles.",
  },

  "educational-resource": {
    title: "Guía: Alimentación del gatito en su primer año",
    portada: PHOTOS.catFoodBowl,
    estimatedTime: "40 minutos",
    description:
      `Material de lectura para la Unidad 2. Resume qué, cuánto y cada cuánto come un gatito según su edad.\n\n[[imagen:${PHOTOS.catEatingGarden}|Gato comiendo alimento balanceado en un jardín]]`,
    readingGuide:
      "Mientras leés, armá una tabla con tres columnas: edad, tipo de alimento y cantidad de comidas por día. La vamos a usar en el plan de cuidado.",
    mainConcepts: [
      "Destete y transición al alimento sólido",
      "Alimento húmedo y seco",
      "Agua fresca siempre disponible",
    ],
    reading: ["https://example.com/gatitos/alimentacion-primer-anio.pdf"],
    video: "https://www.youtube.com/watch?v=gatitos-alimentacion",
    links: ["https://example.com/gatitos/alimentos-prohibidos"],
    recommendations: "Leé primero la sección sobre el destete; el resto se entiende mejor después.",
    questions: ["¿Por qué un gatito necesita comer más veces al día que un gato adulto?"],
    accessibility:
      "El video tiene subtítulos en español. La guía también está disponible en formato de texto accesible.",
    sources:
      "Material elaborado para Gatitos #1. Licencia CC BY-SA 4.0. Fotos: Wikimedia Commons, dominio público y CC0.",
  },
};
}

/** Ids de las plantillas que tienen ejemplo. */
export const EXAMPLE_IDS: string[] = Object.keys(buildExamples(photoUrls(PRODUCTION_BASE)));

export function hasExample(id: string): boolean {
  return EXAMPLE_IDS.includes(id);
}

/**
 * Valores del ejemplo de una plantilla. Las fotos apuntan al sitio donde corre
 * la app (localhost o producción); `base` permite fijar otro dominio.
 */
export function getExample(id: string, base: string = document.baseURI): TemplateValues | undefined {
  return buildExamples(photoUrls(base))[id];
}
