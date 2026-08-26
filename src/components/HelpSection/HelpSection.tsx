export function HelpSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10" aria-labelledby="help-heading">
      <details className="border border-gray-200 rounded-lg bg-white">
        <summary className="cursor-pointer px-4 py-3 font-medium text-gray-800 select-none">
          ¿Cómo usarlo en Moodle?
        </summary>
        <ol className="list-decimal list-inside space-y-2 px-4 pb-4 text-gray-700">
          <li>Elegí una plantilla.</li>
          <li>Completá el contenido en el formulario.</li>
          <li>Presioná <strong>Copiar HTML</strong>.</li>
          <li>En Moodle, abrí el editor TinyMCE de tu actividad o recurso.</li>
          <li>Abrí <strong>Código fuente</strong> (icono &lt;&gt; o menú).</li>
          <li>Pegá el HTML copiado.</li>
          <li>Guardá la actividad o recurso.</li>
        </ol>
        <p className="px-4 pb-4 text-sm text-gray-500">
          No se necesitan permisos de administrador ni plugins de Moodle. Todo el
          contenido se genera en tu navegador.
        </p>
      </details>
    </section>
  );
}
