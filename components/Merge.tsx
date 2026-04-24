'use client'

import { useMemo, useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import toast from 'react-hot-toast'

type MergeItem = {
  id: string
  file: File
  name: string
  type: string
  size: number
}

const MAX_TARGET_BYTES = 1024 * 1024 // 1MB

export default function MergeCvDocuments() {
  const [items, setItems] = useState<MergeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const totalSize = useMemo(
    () => items.reduce((sum, item) => sum + item.size, 0),
    [items]
  )

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return

    const supported = Array.from(fileList).filter((file) => {
      const extOk = /\.(pdf|jpg|jpeg|png)$/i.test(file.name)
      const mimeOk =
        file.type === 'application/pdf' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/jpg' ||
        file.type === 'image/png'

      return extOk || mimeOk
    })

    if (!supported.length) {
      toast.error('Upload PDF, JPG, JPEG, atau PNG saja.')
      return
    }

    const mapped = supported.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      type: file.type || inferMime(file.name),
      size: file.size,
    }))

    setItems((prev) => [...prev, ...mapped])
    toast.success('File berhasil ditambahkan')
  }

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(event.target.files)
    event.target.value = ''
  }

  const onDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    await handleFiles(event.dataTransfer.files)
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    setItems((prev) => {
      const next = [...prev]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= next.length) return prev
        ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const clearAll = () => {
    setItems([])
    toast.success('Daftar file dibersihkan')
  }

  const mergeAndCompress = async () => {
    if (!items.length) {
      toast.error('Tambahkan file dulu.')
      return
    }

    setLoading(true)

    try {
      const attempts: CompressionPlan[] = [
        { maxWidth: 1400, quality: 0.8 },
        { maxWidth: 1200, quality: 0.7 },
        { maxWidth: 1000, quality: 0.6 },
        { maxWidth: 900, quality: 0.5 },
        { maxWidth: 800, quality: 0.42 },
      ]

      let bestBytes: Uint8Array | null = null

      for (const plan of attempts) {
        const merged = await buildMergedPdf(items, plan)
        bestBytes = merged
        if (merged.byteLength <= MAX_TARGET_BYTES) break
      }

      if (!bestBytes) {
        throw new Error('Gagal membuat PDF gabungan.')
      }

      const blob = new Blob([bestBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Lamaran-CV-dan-Lampiran.pdf'
      a.click()
      URL.revokeObjectURL(url)

      const finalSize = formatBytes(bestBytes.byteLength)

      if (bestBytes.byteLength <= MAX_TARGET_BYTES) {
        toast.success(`PDF berhasil dibuat (${finalSize})`)
      } else {
        toast.success(`PDF dibuat (${finalSize})`)
        toast(
          'Sudah dikompres, tapi belum bisa di bawah 1MB. Coba file sumber yang lebih kecil.'
        )
      }
    } catch (error) {
      console.error(error)
      toast.error('Gagal merge PDF. Coba ulangi lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-2xl backdrop-blur-2xl transition-colors duration-300 dark:border-white/20 dark:bg-white/10">
      <div className="mb-4 flex items-center gap-3">
        <img
          src="https://i.imgur.com/k9kcRG9.png"
          alt="Merge documents"
          className="h-12 w-12 rounded-xl object-contain"
        />
        <div>
          <h2 className="text-0.5xl font-bold text-slate-900 dark:text-white">
            MERGE PDF
          </h2>
          <p className="text-sm text-slate-600 dark:text-white/70">
            Jadikan semua berkas lamaran anda jadi satu PDF.
          </p>
        </div>
      </div>

      <div
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.value = ''
            inputRef.current.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`mb-4 flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center backdrop-blur-xl transition ${dragActive
          ? 'border-[#0097b2] bg-white/90 dark:bg-white/18'
          : 'border-[#0097b2]/70 bg-white/60 hover:bg-white/80 dark:bg-white/8 dark:hover:bg-white/12'
          }`}
      >
        <p className="text-base font-semibold text-slate-900 dark:text-white">
          UPLOAD FILE PDF/JPG/PNG
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
          or click to browse files
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {items.length > 0 && (
        <>
          <div className="mb-4 rounded-2xl border border-black/10 bg-white/60 p-4 transition-colors duration-300 dark:border-white/20 dark:bg-white/8">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Total file: {items.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-white/70">
                Ukuran awal: {formatBytes(totalSize)}
              </p>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white/70 px-3 py-3 text-slate-900 transition-colors duration-300 sm:flex-row sm:items-center sm:justify-between dark:border-white/15 dark:bg-white/10 dark:text-white"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-slate-600 dark:text-white/70">
                      {item.type || 'unknown'} · {formatBytes(item.size)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => moveItem(index, 'up')}
                      className="rounded-xl border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white sm:hover:scale-105 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      ↑ Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 'down')}
                      className="rounded-xl border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white sm:hover:scale-105 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      ↓ Down
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-xl border border-red-300/40 bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-red-400/20 sm:hover:scale-105 dark:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={mergeAndCompress}
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-[#0097b2] to-[#00c2e0] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(0,151,178,0.35)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Merging...' : 'Merge & Compress PDF'}
            </button>

            <button
              type="button"
              onClick={clearAll}
              disabled={loading}
              className="rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg backdrop-blur-xl transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  )
}

type CompressionPlan = {
  maxWidth: number
  quality: number
}

async function buildMergedPdf(items: MergeItem[], plan: CompressionPlan) {
  const mergedPdf = await PDFDocument.create()

  for (const item of items) {
    const fileType = item.type || inferMime(item.name)

    if (fileType.includes('pdf')) {
      const bytes = await item.file.arrayBuffer()
      const sourcePdf = await PDFDocument.load(bytes)
      const pages = await mergedPdf.copyPages(
        sourcePdf,
        sourcePdf.getPageIndices()
      )
      pages.forEach((page) => mergedPdf.addPage(page))
      continue
    }

    if (
      fileType.includes('image/jpeg') ||
      fileType.includes('image/jpg') ||
      fileType.includes('image/png')
    ) {
      const compressed = await compressImage(
        item.file,
        plan.maxWidth,
        plan.quality
      )
      const imageBytes = await compressed.arrayBuffer()

      const pdfImage =
        compressed.type === 'image/png'
          ? await mergedPdf.embedPng(imageBytes)
          : await mergedPdf.embedJpg(imageBytes)

      const imgWidth = pdfImage.width
      const imgHeight = pdfImage.height

      const page = mergedPdf.addPage([imgWidth, imgHeight])
      page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: imgWidth,
        height: imgHeight,
      })
    }
  }

  return await mergedPdf.save({ useObjectStreams: true })
}

async function compressImage(file: File, maxWidth: number, quality: number) {
  const dataUrl = await readFileAsDataUrl(file)
  const img = await loadImage(dataUrl)

  const ratio = Math.min(1, maxWidth / img.width)
  const width = Math.max(1, Math.round(img.width * ratio))
  const height = Math.max(1, Math.round(img.height * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  ctx.drawImage(img, 0, 0, width, height)

  const outputType = 'image/jpeg'
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), outputType, quality)
  })

  if (!blob) throw new Error('Failed to compress image')

  return new File([blob], replaceExt(file.name, '.jpg'), { type: outputType })
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function replaceExt(name: string, newExt: string) {
  return name.replace(/\.[^.]+$/, '') + newExt
}

function inferMime(name: string) {
  if (/\.pdf$/i.test(name)) return 'application/pdf'
  if (/\.png$/i.test(name)) return 'image/png'
  if (/\.(jpg|jpeg)$/i.test(name)) return 'image/jpeg'
  return 'application/octet-stream'
}
