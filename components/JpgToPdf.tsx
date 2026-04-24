'use client'

import { useRef, useState } from 'react'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'

export default function JpgToPdf() {
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const processFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const jpgFiles = Array.from(selectedFiles).filter((file) => {
      return file.type === 'image/jpeg' || file.type === 'image/jpg'
    })

    if (!jpgFiles.length) {
      toast.error('Please upload JPG images only.')
      return
    }

    const mapped = jpgFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setFiles((prev) => [...prev, ...mapped])
    toast.success('Images added')
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files)
    event.target.value = ''
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    processFiles(event.dataTransfer.files)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const convertToPdf = async () => {
    if (!files.length) {
      toast.error('Upload at least one JPG image first.')
      return
    }

    let pdf: jsPDF | null = null

    for (let index = 0; index < files.length; index += 1) {
      const item = files[index]
      const imageData = await fileToDataUrl(item.file)

      const img = new Image()
      img.src = imageData

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
      })

      const imgWidth = img.width
      const imgHeight = img.height
      const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait'

      if (index === 0) {
        pdf = new jsPDF({
          orientation,
          unit: 'pt',
          format: [imgWidth, imgHeight],
        })
      } else {
        pdf!.addPage([imgWidth, imgHeight], orientation)
      }

      pdf!.addImage(imageData, 'JPEG', 0, 0, imgWidth, imgHeight)
    }

    pdf?.save('lazyjobseeker-images.pdf')
    toast.success('PDF downloaded')
  }

  const clearFiles = () => {
    setFiles([])
    toast.success('Images cleared')
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-2xl backdrop-blur-2xl transition-colors duration-300 dark:border-white/20 dark:bg-white/10">
      <div className="mb-4 flex items-center gap-3">
        <img
          src="https://i.imgur.com/EgqJMBv.png"
          alt="JPG to PDF"
          className="h-12 w-12 rounded-xl object-contain"
        />
        <div>
          <h2 className="text-0.5xl font-bold text-slate-900 dark:text-white">
            JPG TO PDF
          </h2>
          <p className="text-sm text-slate-600 dark:text-white/70">
            Unggah beberapa file foto dan ubah menjadi satu PDF dengan mudah!
          </p>
        </div>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.value = ''
            inputRef.current.click()
          }
        }}
        className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0097b2]/70 bg-white/60 p-6 text-center backdrop-blur-xl transition hover:scale-[1.01] hover:bg-white/80 dark:bg-white/8 dark:hover:bg-white/12"
      >
        <p className="text-base font-semibold text-slate-900 dark:text-white">
          UPLOAD FILE JPG
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
          or click to browse files
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {files.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white/70 backdrop-blur-xl transition-colors duration-300 dark:border-white/20 dark:bg-white/10"
              >
                <img
                  src={item.preview}
                  alt={item.file.name}
                  className="h-32 w-full object-cover"
                />
                <div className="truncate px-3 py-2 text-xs text-slate-700 dark:text-white/80">
                  {item.file.name}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={convertToPdf}
              className="rounded-full bg-gradient-to-r from-[#0097b2] to-[#00c2e0] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(0,151,178,0.35)] transition hover:scale-105"
            >
              Convert to PDF
            </button>

            <button
              type="button"
              onClick={clearFiles}
              className="rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg backdrop-blur-xl transition hover:scale-105 hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}