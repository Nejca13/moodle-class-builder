import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TemplateValue, TemplateValues } from './types/template'
import { getTemplateById, templates } from './templates'
import {
  DEFAULT_ACCENT,
  getList,
  getText,
  isValidUrl,
  sanitizeImageSrc,
} from './utils/htmlGenerator'
import { copyHtml, copyText } from './utils/clipboard'
import { downloadHtml } from './utils/download'
import { htmlToText } from './utils/htmlToText'
import {
  clearDraft,
  getAccent,
  getDraft,
  getFlag,
  getImages,
  saveAccent,
  saveDraft,
  saveImages,
  setFlag,
  type ImageStore,
} from './utils/storage'
import { Header } from './components/Header/Header'
import { TemplateSelector } from './components/TemplateSelector/TemplateSelector'
import { TemplateForm } from './components/TemplateForm/TemplateForm'
import { Preview } from './components/Preview/Preview'
import { ActionBar, HtmlOutput } from './components/CopyButton/CopyButton'
import { HelpSection } from './components/HelpSection/HelpSection'
import { ExamplePage } from './components/ExamplePage/ExamplePage'
import { readRoute, routeToSearch, type Route } from './utils/route'
import { getExample, hasExample } from './examples'
import { Modal } from './components/Modal/Modal'
import { PasteGuideDialog } from './components/PasteGuide/PasteGuideDialog'
import { ImportDialog } from './components/ImportDialog/ImportDialog'
import { embedFormData } from './utils/embed'
import { ArrowLeft, CheckCircle2, CloudCheck, Copy, Eye, TriangleAlert } from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'

function emptyValues(): TemplateValues {
  return {}
}

function hasContent(values: TemplateValues): boolean {
  return Object.values(values).some((v) =>
    Array.isArray(v) ? v.some((i) => i.trim() !== '') : String(v ?? '').trim() !== '',
  )
}

const HIDE_GUIDE_FLAG = 'hidePasteGuide'

type ConfirmKind = 'clear' | 'example' | null

function validate(
  templateId: string,
  values: TemplateValues,
): Record<string, string> {
  const template = getTemplateById(templateId)
  const errors: Record<string, string> = {}
  if (!template) return errors

  for (const field of template.fields) {
    const value = values[field.id]

    if (field.type === 'list') {
      const items = getList(value)
      if (field.required && items.length === 0) {
        errors[field.id] = `${field.label} es obligatorio.`
      }
      if (field.itemType === 'url') {
        const hasInvalid = items.some(
          (i) => i.trim() !== '' && !isValidUrl(i.trim()),
        )
        if (hasInvalid) errors[field.id] = 'Hay una URL inválida.'
      }
      continue
    }

    const text = getText(value).trim()
    if (field.required && !text) {
      errors[field.id] =
        field.type === 'image'
          ? 'Agregá una imagen: pegá un enlace o subí un archivo.'
          : `${field.label} es obligatorio.`
    }
    if (text && field.type === 'url' && !isValidUrl(text)) {
      errors[field.id] = 'La URL no es válida.'
    }
    if (text && field.type === 'image' && !sanitizeImageSrc(text)) {
      errors[field.id] =
        'La imagen no es válida (usá una URL o un archivo de imagen).'
    }
  }

  return errors
}

export default function App() {
  // The URL is the source of truth for the current screen.
  const [route, setRoute] = useState<Route>(() => readRoute(window.location.search))
  const selectedId = route.view === 'editor' ? route.id : null

  const initialId = selectedId
  const [values, setValues] = useState<TemplateValues>(
    () => (initialId && getDraft(initialId)) || emptyValues(),
  )
  const [previewVisible, setPreviewVisible] = useState(true)
  const [status, setStatus] = useState('')
  const [accent, setAccent] = useState<string>(
    () => (initialId && getAccent(initialId)) || DEFAULT_ACCENT,
  )
  const [images, setImages] = useState<ImageStore>(
    () => (initialId && getImages(initialId)) || {},
  )

  // Errors are shown only for fields the teacher already edited, or for all
  // fields after a copy/download attempt (validate after interaction).
  const [touched, setTouched] = useState<Set<string>>(() => new Set())
  const [showAllErrors, setShowAllErrors] = useState(false)
  // Cambia en cada intento fallido de copiar: el formulario abre y enfoca el error.
  const [focusErrorsKey, setFocusErrorsKey] = useState(0)
  // Cambia al cargar un ejemplo o limpiar: rearma el formulario (secciones abiertas).
  const [formKey, setFormKey] = useState(0)

  const [confirm, setConfirm] = useState<ConfirmKind>(null)
  const [guide, setGuide] = useState<{ open: boolean; justCopied: boolean }>({
    open: false,
    justCopied: false,
  })
  const [hideGuideAfterCopy, setHideGuideAfterCopy] = useState(() => getFlag(HIDE_GUIDE_FLAG))
  const [importOpen, setImportOpen] = useState(false)
  // Textos cambiados a mano en Moodle que el docente tiene que rehacer.
  const [moodleEdits, setMoodleEdits] = useState<string[]>([])
  const modalOpen = confirm !== null || guide.open || importOpen
  // Mantiene el texto del diálogo mientras se anima el cierre.
  const lastConfirm = useRef<Exclude<ConfirmKind, null>>('clear')
  if (confirm) lastConfirm.current = confirm
  const confirmKind = confirm ?? lastConfirm.current

  const template = useMemo(() => getTemplateById(selectedId), [selectedId])
  const exampleTemplate =
    route.view === 'example' ? getTemplateById(route.id) : null

  /** Loads the saved draft, color and images of a template into the editor. */
  const loadTemplateState = (id: string) => {
    setValues(getDraft(id) ?? emptyValues())
    setTouched(new Set())
    setShowAllErrors(false)
    setAccent(getAccent(id) || DEFAULT_ACCENT)
    setImages(getImages(id) || {})
    setStatus('')
  }

  const navigate = (next: Route) => {
    const url = window.location.pathname + routeToSearch(next)
    window.history.pushState(null, '', url)
    setRoute(next)
    scrollToTop()
  }

  // Browser back/forward.
  useEffect(() => {
    const onPopState = () => {
      const next = readRoute(window.location.search)
      if (next.view === 'editor') loadTemplateState(next.id)
      setRoute(next)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (selectedId) {
      saveDraft(selectedId, values)
      saveImages(selectedId, images)
    }
  }, [selectedId, values, images])

  // El aviso flotante se va solo: es informativo y el estado también se ve en pantalla.
  useEffect(() => {
    if (!status) return
    const timer = window.setTimeout(() => setStatus(''), 4500)
    return () => window.clearTimeout(timer)
  }, [status])

  const closeGuide = useCallback(() => setGuide((g) => ({ ...g, open: false })), [])
  const closeConfirm = useCallback(() => setConfirm(null), [])
  const closeImport = useCallback(() => setImportOpen(false), [])

  // El HTML lleva incrustados los datos del formulario (invisibles en Moodle)
  // para poder volver a editar la clase más adelante.
  const generatedHtml = useMemo(
    () =>
      template
        ? embedFormData(template.generateHtml(values, accent, images), {
            templateId: template.id,
            accent,
            values,
            images,
          })
        : '',
    [template, values, accent, images],
  )

  const handleSelect = (id: string) => {
    setMoodleEdits([])
    loadTemplateState(id)
    navigate({ view: 'editor', id })
  }

  const handleImport = (data: {
    templateId: string
    accent?: string
    values: TemplateValues
    images: ImageStore
    missingImages: number
    editedInMoodle: string[]
  }) => {
    setImportOpen(false)
    setMoodleEdits(data.editedInMoodle)
    saveDraft(data.templateId, data.values)
    saveImages(data.templateId, data.images)
    if (data.accent) saveAccent(data.templateId, data.accent)
    loadTemplateState(data.templateId)
    setFormKey((k) => k + 1)
    navigate({ view: 'editor', id: data.templateId })
    // El botón que abrió el diálogo ya no existe: el foco va al título del formulario.
    requestAnimationFrame(() => document.getElementById('form-heading')?.focus())
    setStatus(
      data.editedInMoodle.length > 0
        ? 'Clase recuperada. Arriba del formulario tenés la lista de cambios para rehacer.'
        : data.missingImages > 0
        ? `Clase recuperada, pero faltan ${data.missingImages === 1 ? '1 imagen' : `${data.missingImages} imágenes`}: volvé a cargarlas.`
        : 'Clase recuperada. Hacé los cambios y volvé a copiarla para Moodle.',
    )
  }

  const handleImageAdded = (dataUri: string): string => {
    const id = `img_${Math.random().toString(36).slice(2, 9)}`
    setImages((prev) => ({ ...prev, [id]: dataUri }))
    return id
  }

  const handleChange = (id: string, value: TemplateValue) => {
    setValues((prev) => ({ ...prev, [id]: value }))
    setTouched((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
    if (status) setStatus('')
  }

  const handleClear = () => {
    if (selectedId) clearDraft(selectedId)
    setValues(emptyValues())
    setImages({})
    setTouched(new Set())
    setShowAllErrors(false)
    setFormKey((k) => k + 1)
    setStatus('Formulario vacío. Podés empezar de nuevo.')
  }

  const requestClear = () => {
    if (!hasContent(values)) {
      setStatus('El formulario ya está vacío.')
      return
    }
    setConfirm('clear')
  }

  const loadExample = () => {
    if (!selectedId) return
    const example = getExample(selectedId)
    if (!example) return
    setValues(structuredClone(example))
    setTouched(new Set())
    setShowAllErrors(false)
    setFormKey((k) => k + 1)
    setStatus('Se cargó el ejemplo. Reemplazá los textos por los de tu materia.')
  }

  const requestExample = () => {
    if (hasContent(values)) setConfirm('example')
    else loadExample()
  }

  const handleConfirm = () => {
    const kind = confirm
    setConfirm(null)
    if (kind === 'clear') handleClear()
    if (kind === 'example') loadExample()
  }

  const runIfValid = (action: () => void) => {
    if (!template) return
    const errors = validate(template.id, values)
    if (Object.keys(errors).length > 0) {
      setShowAllErrors(true)
      setFocusErrorsKey((k) => k + 1)
      setStatus('Falta completar algo: te llevamos al campo marcado.')
      return
    }
    action()
  }

  const handleCopyHtml = () => {
    runIfValid(async () => {
      const ok = await copyHtml(generatedHtml)
      if (ok && !hideGuideAfterCopy) {
        setGuide({ open: true, justCopied: true })
        setStatus('Contenido copiado. Ahora pegalo en Moodle.')
        return
      }
      setStatus(
        ok
          ? 'Contenido copiado. Pegalo en Moodle desde Herramientas → Código fuente.'
          : 'No se pudo copiar. Probá con "Más opciones → Descargar archivo".',
      )
    })
  }

  const handleCopyText = () => {
    runIfValid(async () => {
      const ok = await copyText(htmlToText(generatedHtml))
      setStatus(
        ok ? 'Texto copiado correctamente.' : 'No se pudo copiar el texto.',
      )
    })
  }

  const handleDownload = () => {
    runIfValid(() => {
      const safeName = (getText(values.title) || 'contenido-moodle')
        .trim()
        .replace(/[^\w-]+/g, '-')
        .toLowerCase()
      downloadHtml(safeName, generatedHtml)
      setStatus('Descarga iniciada.')
    })
  }

  const allErrors = template ? validate(template.id, values) : {}
  const errors = showAllErrors
    ? allErrors
    : Object.fromEntries(
        Object.entries(allErrors).filter(([id]) => touched.has(id)),
      )

  return (
    <div className={`flex min-h-screen flex-col ${template && !exampleTemplate ? 'pb-24 lg:pb-0' : ''}`}>
      <Header />

      <main className='flex-1'>
        {exampleTemplate ? (
          <ExamplePage
            template={exampleTemplate}
            onUseTemplate={handleSelect}
          />
        ) : !template ? (
          <TemplateSelector
            templates={templates}
            onSelect={handleSelect}
            onOpenImport={() => setImportOpen(true)}
          />
        ) : (
          <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 animate-fade-in'>
            <nav aria-label='Ubicación' className='mb-5 flex flex-wrap items-center gap-3'>
              <button
                type='button'
                onClick={() => {
                  setStatus('')
                  navigate({ view: 'selector' })
                }}
                className='inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-line-strong bg-white px-3.5 py-2 text-base font-semibold text-ink hover:bg-paper-deep'
              >
                <ArrowLeft className='size-4' aria-hidden='true' />
                <span>Cambiar de plantilla</span>
              </button>
              <span className='text-base text-ink-soft'>
                Plantillas <span aria-hidden='true'>/</span>{' '}
                <strong className='font-semibold text-ink'>{template.name}</strong>
              </span>
              {hasContent(values) && (
                <span className='ms-auto inline-flex items-center gap-1.5 text-sm text-ink-soft'>
                  <CloudCheck className='size-4 text-brand-700' aria-hidden='true' />
                  Borrador guardado en este navegador
                </span>
              )}
            </nav>

            {moodleEdits.length > 0 && (
              <section
                aria-labelledby='moodle-edits-heading'
                className='mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 sm:p-5'
              >
                <h2 id='moodle-edits-heading' className='flex items-center gap-2 text-lg font-bold'>
                  <TriangleAlert className='size-5 shrink-0' aria-hidden='true' />
                  Cambios hechos en Moodle para volver a escribir
                </h2>
                <p className='mt-1 text-base'>
                  Estos textos se habían cambiado directamente en Moodle. Buscá el campo que corresponde y
                  escribilos de nuevo antes de copiar.
                </p>
                <ul className='mt-3 list-disc space-y-1 ps-6 text-base'>
                  {moodleEdits.map((t) => (
                    <li key={t}>“{t}”</li>
                  ))}
                </ul>
                <button
                  type='button'
                  onClick={() => setMoodleEdits([])}
                  className='mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400 bg-white px-3.5 py-2 text-base font-semibold text-amber-950 hover:bg-amber-100'
                >
                  <CheckCircle2 className='size-4' aria-hidden='true' />
                  Listo, ya los rehice
                </button>
              </section>
            )}

            <div className='grid items-start gap-6 lg:grid-cols-12'>
              <section
                aria-label='Formulario'
                className='rounded-2xl border border-line bg-white p-5 sm:p-7 lg:col-span-6'
              >
                <TemplateForm
                  key={`${template.id}-${formKey}`}
                  template={template}
                  values={values}
                  errors={errors}
                  onChange={handleChange}
                  onImageAdded={handleImageAdded}
                  onLoadExample={hasExample(template.id) ? requestExample : undefined}
                  focusErrorsKey={focusErrorsKey}
                />
              </section>

              <section
                id='vista-previa'
                aria-labelledby='preview-heading'
                className='space-y-4 rounded-2xl border border-line bg-paper-deep p-5 sm:p-6 lg:sticky lg:top-4 lg:col-span-6'
              >
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <h2 id='preview-heading' className='text-xl font-bold text-ink'>
                    Así se verá en Moodle
                  </h2>
                  <fieldset className='flex flex-wrap items-center gap-2'>
                    <legend className='sr-only'>Color del contenido</legend>
                    <label htmlFor='accent' className='text-sm font-semibold text-ink-soft'>
                      Color
                    </label>
                    <input
                      id='accent'
                      type='color'
                      value={accent}
                      onChange={(e) => {
                        setAccent(e.target.value)
                        if (selectedId) saveAccent(selectedId, e.target.value)
                      }}
                      className='h-8 w-10 cursor-pointer rounded-lg border border-line-strong bg-white p-0.5'
                    />
                    {ACCENT_PRESETS.map((c) => {
                      const active = accent.toLowerCase() === c.toLowerCase()
                      return (
                        <button
                          key={c}
                          type='button'
                          onClick={() => {
                            setAccent(c)
                            if (selectedId) saveAccent(selectedId, c)
                          }}
                          aria-pressed={active}
                          aria-label={`Usar color ${c}`}
                          className={`size-6 cursor-pointer rounded-full border-2 ${
                            active ? 'border-ink outline-2 outline-offset-2 outline-ink' : 'border-white'
                          }`}
                          style={{ background: c }}
                        />
                      )
                    })}
                  </fieldset>
                </div>

                <ActionBar
                  onCopyHtml={handleCopyHtml}
                  onCopyText={handleCopyText}
                  onDownload={handleDownload}
                  onTogglePreview={() => setPreviewVisible((v) => !v)}
                  previewVisible={previewVisible}
                  onClear={requestClear}
                  onShowGuide={() => setGuide({ open: true, justCopied: false })}
                />

                {previewVisible && <Preview html={generatedHtml} />}

                <HtmlOutput html={generatedHtml} />
              </section>
            </div>

            {/* En pantallas chicas la acción principal queda siempre a mano. */}
            <div className='fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-white/95 p-3 shadow-[0_-4px_16px_rgb(0_0_0/0.06)] backdrop-blur lg:hidden'>
              <button
                type='button'
                onClick={handleCopyHtml}
                className='inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white hover:bg-brand-700'
              >
                <Copy className='size-5' aria-hidden='true' />
                Copiar para Moodle
              </button>
              <button
                type='button'
                onClick={() => {
                  setPreviewVisible(true)
                  document
                    .getElementById('vista-previa')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line-strong bg-white px-4 py-3 text-base font-semibold text-ink hover:bg-paper'
              >
                <Eye className='size-5' aria-hidden='true' />
                Ver cómo queda
              </button>
            </div>
          </div>
        )}

        <HelpSection />
      </main>

      <footer className='mx-auto max-w-7xl px-4 py-8 text-center text-sm text-ink-soft sm:px-6'>
        <p>
          Gestor de Clases · contenido educativo compatible con el editor TinyMCE de Moodle ·{' '}
          <a
            href='https://nejca.com.ar'
            target='_blank'
            rel='noopener noreferrer'
            className='font-semibold text-brand-700 underline underline-offset-4'
          >
            nejca.com.ar
          </a>
        </p>
      </footer>

      <div role='status' aria-live='polite' className='sr-only' style={srOnlyStyle}>
        {status}
      </div>
      {status && !modalOpen && (
        <div
          className='fixed bottom-24 left-1/2 lg:bottom-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-5 py-3 text-base font-semibold text-white shadow-lg animate-fade-in'
          aria-hidden='true'
        >
          <CheckCircle2 className='size-4 shrink-0 text-brand-200' aria-hidden='true' />
          <span>{status}</span>
        </div>
      )}
      <PasteGuideDialog
        open={guide.open}
        justCopied={guide.justCopied}
        hideAfterCopy={hideGuideAfterCopy}
        onHideAfterCopyChange={(value) => {
          setHideGuideAfterCopy(value)
          setFlag(HIDE_GUIDE_FLAG, value)
        }}
        onClose={closeGuide}
      />

      <ImportDialog
        open={importOpen}
        onClose={closeImport}
        hasDraft={(id) => hasContent(getDraft(id) ?? {})}
        onImport={handleImport}
      />

      <Modal
        open={confirm !== null}
        onClose={closeConfirm}
        title={confirmKind === 'example' ? '¿Reemplazar lo que escribiste?' : '¿Borrar todo el formulario?'}
        description={
          confirmKind === 'example'
            ? 'El ejemplo va a reemplazar todo lo que completaste en esta plantilla. No se puede deshacer.'
            : 'Se borra todo lo que completaste en esta plantilla, incluidas las imágenes. No se puede deshacer.'
        }
        footer={
          <>
            <button
              type='button'
              autoFocus
              onClick={closeConfirm}
              className='inline-flex cursor-pointer items-center justify-center rounded-xl border border-line-strong bg-white px-4 py-2.5 text-base font-semibold text-ink hover:bg-paper'
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={handleConfirm}
              className='inline-flex cursor-pointer items-center justify-center rounded-xl bg-rose-700 px-4 py-2.5 text-base font-semibold text-white hover:bg-rose-800'
            >
              {confirmKind === 'example' ? 'Sí, cargar el ejemplo' : 'Sí, borrar todo'}
            </button>
          </>
        }
      />

      <Analytics />
    </div>
  )
}

/** Al cambiar de pantalla (selector <-> editor) se empieza desde arriba. */
function scrollToTop() {
  document.documentElement.scrollTop = 0
}

const ACCENT_PRESETS = [
  DEFAULT_ACCENT,
  '#2b5ba3',
  '#a4492a',
  '#3b7135',
  '#6a4a8c',
  '#b45309',
  '#be185d',
  '#1f2a2e',
]

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
}
