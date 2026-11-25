import { useEffect, useMemo, useState } from 'react'
import type { TemplateValue, TemplateValues } from './types/template'
import { getTemplateById, templates } from './templates'
import {
  getList,
  getText,
  isValidUrl,
  sanitizeImageSrc,
} from './utils/htmlGenerator'
import { copyText } from './utils/clipboard'
import { downloadHtml } from './utils/download'
import { htmlToText } from './utils/htmlToText'
import {
  clearDraft,
  getAccent,
  getDraft,
  getImages,
  getLastTemplateId,
  saveAccent,
  saveDraft,
  saveImages,
  saveLastTemplateId,
  type ImageStore,
} from './utils/storage'
import { Header } from './components/Header/Header'
import { TemplateSelector } from './components/TemplateSelector/TemplateSelector'
import { TemplateForm } from './components/TemplateForm/TemplateForm'
import { Preview } from './components/Preview/Preview'
import { ActionBar, HtmlOutput } from './components/CopyButton/CopyButton'
import { HelpSection } from './components/HelpSection/HelpSection'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'

function emptyValues(): TemplateValues {
  return {}
}

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
      errors[field.id] = `${field.label} es obligatorio.`
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
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const last = getLastTemplateId()
    return getTemplateById(last) ? last : null
  })
  const [values, setValues] = useState<TemplateValues>(() => {
    const last = getLastTemplateId()
    return last && getTemplateById(last)
      ? (getDraft(last) ?? emptyValues())
      : emptyValues()
  })
  const [previewVisible, setPreviewVisible] = useState(true)
  const [status, setStatus] = useState('')
  const [accent, setAccent] = useState<string>(() => {
    const last = getLastTemplateId()
    return (last && getAccent(last)) || DEFAULT_ACCENT
  })
  const [images, setImages] = useState<ImageStore>(() => {
    const last = getLastTemplateId()
    return (last && getImages(last)) || {}
  })

  // Errors are shown only for fields the teacher already edited, or for all
  // fields after a copy/download attempt (validate after interaction).
  const [touched, setTouched] = useState<Set<string>>(() => new Set())
  const [showAllErrors, setShowAllErrors] = useState(false)

  const template = useMemo(() => getTemplateById(selectedId), [selectedId])

  useEffect(() => {
    if (selectedId) {
      saveLastTemplateId(selectedId)
      saveDraft(selectedId, values)
      saveImages(selectedId, images)
    }
  }, [selectedId, values, images])

  const generatedHtml = useMemo(
    () => (template ? template.generateHtml(values, accent, images) : ''),
    [template, values, accent, images],
  )

  const handleSelect = (id: string) => {
    scrollToTop()
    setSelectedId(id)
    setValues(getDraft(id) ?? emptyValues())
    setTouched(new Set())
    setShowAllErrors(false)
    setAccent(getAccent(id) || DEFAULT_ACCENT)
    setImages(getImages(id) || {})
    setStatus('')
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
    setTouched(new Set())
    setShowAllErrors(false)
    setStatus('Formulario limpiado.')
  }

  const runIfValid = (action: () => void) => {
    if (!template) return
    const errors = validate(template.id, values)
    if (Object.keys(errors).length > 0) {
      setShowAllErrors(true)
      setStatus('Corregí los campos señalados antes de copiar.')
      return
    }
    action()
  }

  const handleCopyHtml = () => {
    runIfValid(async () => {
      const ok = await copyText(generatedHtml)
      setStatus(
        ok ? 'HTML copiado correctamente.' : 'No se pudo copiar el HTML.',
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
    <div className='flex min-h-screen flex-col'>
      <Header />

      <main className='flex-1'>
        {!template ? (
          <TemplateSelector templates={templates} onSelect={handleSelect} />
        ) : (
          <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 animate-fade-in'>
            <nav aria-label='Ubicación' className='mb-5 flex flex-wrap items-center gap-3'>
              <button
                type='button'
                onClick={() => {
                  scrollToTop()
                  setSelectedId(null)
                  setStatus('')
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
            </nav>

            <div className='grid items-start gap-6 lg:grid-cols-12'>
              <section
                aria-label='Formulario'
                className='rounded-2xl border border-line bg-white p-5 sm:p-7 lg:col-span-6'
              >
                <TemplateForm
                  template={template}
                  values={values}
                  errors={errors}
                  onChange={handleChange}
                  onImageAdded={handleImageAdded}
                />
              </section>

              <section
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
                  onClear={handleClear}
                />

                {previewVisible && <Preview html={generatedHtml} />}

                <HtmlOutput html={generatedHtml} />
              </section>
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
      {status && (
        <div
          className='fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-5 py-3 text-base font-semibold text-white shadow-lg animate-fade-in'
          aria-hidden='true'
        >
          <CheckCircle2 className='size-4 shrink-0 text-brand-200' aria-hidden='true' />
          <span>{status}</span>
        </div>
      )}
      <Analytics />
    </div>
  )
}

/** Al cambiar de pantalla (selector <-> editor) se empieza desde arriba. */
function scrollToTop() {
  document.documentElement.scrollTop = 0
}

const DEFAULT_ACCENT = '#23685c'

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
