'use client'

import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import jsPDF from 'jspdf'

type ChatFile = {
  name: string
  type: string
  size: number
  content: string
}

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type CvData = {
  full_name: string
  contact_line: string
  summary: string
  work_experience: {
    company: string
    position: string
    date_range: string
    bullets: string[]
  }[]
  education: string[]
  skills_competencies: string[]
  awards_certifications: {
    title: string
    meta: string
    description: string
  }[]
}

const defaultMessage: ChatMessage = {
  role: 'assistant',
  content:
    'Hai! Saya bisa membantu Anda memikirkan ide pencarian pekerjaan, memperbaiki materi aplikasi, dan menjawab pertanyaan karier.',
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([defaultMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<ChatFile[]>([])
  const [mode, setMode] = useState('chat')
  const [downloadContent, setDownloadContent] = useState('')
  const [cvData, setCvData] = useState<CvData | null>(null)
  const inputFileRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (!selectedFiles.length) return

    const allowedFiles = selectedFiles.filter((file) => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ]

      return (
        validTypes.includes(file.type) ||
        /\.(pdf|doc|docx|txt)$/i.test(file.name)
      )
    })

    if (!allowedFiles.length) {
      toast.error('Please upload PDF, DOC, DOCX, or TXT files only.')
      event.target.value = ''
      return
    }

    const converted = await Promise.all(
      allowedFiles.map(async (file) => ({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        content: await fileToBase64(file),
      }))
    )

    setFiles((prev) => [...prev, ...converted])
    toast.success('Document attached')
    event.target.value = ''
  }

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const clearHistory = () => {
    setMessages([defaultMessage])
    setInput('')
    setFiles([])
    setDownloadContent('')
    setCvData(null)
    toast.success('Riwayat chat dihapus')
  }

  const getDownloadFileName = () => {
    switch (mode) {
      case 'ats':
        return 'CV-ATS-Optimized.pdf'
      case 'analyzer':
        return 'CV-Analysis-Report.pdf'
      case 'cover':
        return 'Cover-Letter.pdf'
      default:
        return 'AI-Response.pdf'
    }
  }

  const downloadPdf = () => {
    const FONT = 'helvetica'
    const BLACK: [number, number, number] = [0, 0, 0]

    if (mode === 'ats' && cvData) {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      })

      const pageWidth = 595
      const pageHeight = 842
      const margin = 42
      const contentWidth = pageWidth - margin * 2
      let y = 52

      const ensurePage = (needed = 20) => {
        if (y + needed > pageHeight - 45) {
          pdf.addPage()
          y = 52
        }
      }

      const writeText = (
        text: string,
        size = 11,
        bold = false,
        indent = 0,
        lineHeight = 15
      ) => {
        pdf.setFont(FONT, bold ? 'bold' : 'normal')
        pdf.setFontSize(size)
        pdf.setTextColor(...BLACK)

        const lines = pdf.splitTextToSize(text, contentWidth - indent)

        lines.forEach((line: string) => {
          ensurePage(lineHeight)
          pdf.text(line, margin + indent, y)
          y += lineHeight
        })
      }

      const section = (title: string) => {
        y += 10
        ensurePage(20)
        pdf.setFont(FONT, 'bold')
        pdf.setFontSize(12)
        pdf.setTextColor(...BLACK)
        pdf.text(title, margin, y)
        y += 14

        pdf.setDrawColor(0, 0, 0)
        pdf.setLineWidth(0.7)
        pdf.line(margin, y, pageWidth - margin, y)
        y += 12
      }

      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')

      pdf.setFont(FONT, 'bold')
      pdf.setFontSize(22)
      pdf.setTextColor(...BLACK)
      pdf.text(cvData.full_name || 'FULL NAME', margin, y)

      y += 18

      writeText(cvData.contact_line || '', 10.5, false, 0, 13)

      y += 6

      section('DESKRIPSI SINGKAT')
      writeText(cvData.summary || '', 11)

      section('PENGALAMAN KERJA')
      cvData.work_experience?.forEach((job) => {
        ensurePage(55)

        writeText(job.company || '', 11.5, true)
        writeText(job.position || '', 10.5, true)
        writeText(job.date_range || '', 10)

        job.bullets?.forEach((bullet) => {
          const clean = bullet.replace(/^[-•*+]\s*/, '').trim()
          writeText(`• ${clean}`, 10.5, false, 0, 14)
        })

        y += 6
      })

      const validEducation =
        cvData.education?.filter((item) => item && item.trim() !== '') || []

      if (validEducation.length > 0) {
        section('PENDIDIKAN')

        validEducation.forEach((item) => {
          ensurePage(30)

          let schoolName = item
          let detail = ''

          if (item.includes(':')) {
            const parts = item.split(':')
            schoolName = parts[0].trim()
            detail = parts.slice(1).join(':').trim()
          } else if (item.includes('|')) {
            const parts = item.split('|')
            schoolName = parts[0].trim()
            detail = parts.slice(1).join('|').trim()
          }

          pdf.setFont(FONT, 'bold')
          pdf.setFontSize(10.8)
          pdf.setTextColor(...BLACK)
          pdf.text(schoolName, margin, y)
          y += 14

          if (detail) {
            pdf.setFont(FONT, 'normal')
            pdf.setFontSize(10.3)
            pdf.setTextColor(...BLACK)

            const lines = pdf.splitTextToSize(detail, contentWidth)
            lines.forEach((line: string) => {
              ensurePage(14)
              pdf.text(line, margin, y)
              y += 14
            })
          }

          y += 4
        })
      }

      const validSkills =
        cvData.skills_competencies?.filter((item) => item && item.trim() !== '') || []

      if (validSkills.length > 0) {
        const minimumSectionSpace = 120
        if (y > pageHeight - minimumSectionSpace) {
          pdf.addPage()
          y = 52
        }

        section('SKILL TEKNIS & KOMPETENSI')

        const leftX = margin
        const rightX = margin + contentWidth / 2 + 10
        const columnWidth = contentWidth / 2 - 15
        const lineHeight = 14

        const splitIndex = Math.ceil(validSkills.length / 2)
        const leftColumn = validSkills.slice(0, splitIndex)
        const rightColumn = validSkills.slice(splitIndex)

        const totalRows = Math.max(leftColumn.length, rightColumn.length)

        for (let i = 0; i < totalRows; i++) {
          const leftText = leftColumn[i] ? `• ${leftColumn[i]}` : ''
          const rightText = rightColumn[i] ? `• ${rightColumn[i]}` : ''

          const leftLines = leftText ? pdf.splitTextToSize(leftText, columnWidth) : []
          const rightLines = rightText ? pdf.splitTextToSize(rightText, columnWidth) : []

          const rowLines = Math.max(leftLines.length, rightLines.length, 1)
          const rowHeight = rowLines * lineHeight

          if (y + rowHeight > pageHeight - 45) {
            pdf.addPage()
            y = 52
          }

          pdf.setFont(FONT, 'normal')
          pdf.setFontSize(10.5)
          pdf.setTextColor(...BLACK)

          leftLines.forEach((line: string, idx: number) => {
            pdf.text(line, leftX, y + idx * lineHeight)
          })

          rightLines.forEach((line: string, idx: number) => {
            pdf.text(line, rightX, y + idx * lineHeight)
          })

          y += rowHeight + 2
        }

        y += 8
      }

      const validAwards =
        cvData.awards_certifications?.filter((item) => {
          const title = item?.title?.trim()
          const meta = item?.meta?.trim()
          const description = item?.description?.trim()
          return Boolean(title || meta || description)
        }) || []

      if (validAwards.length > 0) {
        section('PENGHARGAAN & SERTIFIKASI')

        validAwards.forEach((item) => {
          if (item.title?.trim()) {
            writeText(`• ${item.title.trim()}`, 10.8, true)
          }

          if (item.meta?.trim()) {
            writeText(item.meta.trim(), 10)
          }

          if (item.description?.trim()) {
            writeText(item.description.trim(), 10)
          }

          y += 4
        })
      }

      pdf.save(getDownloadFileName())
      toast.success('CV downloaded')
      return
    }

    if (!downloadContent.trim()) {
      toast.error('Tidak ada file untuk diunduh.')
      return
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    })

    const margin = 40
    let y = 45

    pdf.setFont(FONT, 'normal')
    pdf.setFontSize(11)
    pdf.setTextColor(...BLACK)

    const lines = pdf.splitTextToSize(downloadContent, 515)

    lines.forEach((line: string) => {
      if (y > 800) {
        pdf.addPage()
        y = 45
      }

      pdf.text(line, margin, y)
      y += 16
    })

    pdf.save(getDownloadFileName())
    toast.success('Download started')
  }

  const sendMessage = async () => {
    if ((!input.trim() && files.length === 0) || loading) return

    let userContent = input.trim()

    if (files.length > 0) {
      const fileSummary = files
        .map((file) => `- ${file.name} (${Math.round(file.size / 1024)} KB)`)
        .join('\n')

      userContent = `${userContent || 'Please analyze the attached documents.'
        }\n\nAttached files:\n${fileSummary}`
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: userContent,
    }

    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          messages: nextMessages,
          files,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data?.error || 'Failed to get AI response')
        return
      }

      const rawReply = data?.choices?.[0]?.message?.content
      const assistantReply =
        typeof rawReply === 'string'
          ? rawReply
          : JSON.stringify(rawReply, null, 2)

      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: assistantReply,
        },
      ])

      if (mode === 'ats') {
        setCvData(data?.cvData || null)
        setDownloadContent('')
      } else if (mode === 'cover') {
        setCvData(null)
        setDownloadContent(data?.reportContent || assistantReply)
      } else if (mode === 'analyzer') {
        setCvData(null)
        setDownloadContent(data?.reportContent || assistantReply)
      } else {
        setCvData(null)
        setDownloadContent('')
      }

      setFiles([])
      toast.success('Response received')
    } catch (error) {
      console.error(error)
      toast.error('API failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-2xl backdrop-blur-2xl transition-colors duration-300 dark:border-white/20 dark:bg-white/10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src="https://i.imgur.com/oBlWFRk.png"
            alt="AI Assistant"
            className="h-12 w-12 rounded-xl object-contain"
          />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            AI Chat
          </h2>
        </div>

        <button
          type="button"
          onClick={clearHistory}
          className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
        >
          Hapus Riwayat
        </button>
      </div>

      <div className="mb-4">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-slate-900 outline-none transition dark:border-white/20 dark:bg-white/10 dark:text-white"
        >
          <option value="chat" className="text-black">
            Chat Biasa
          </option>
          <option value="ats" className="text-black">
            Optimisasi CV untuk ATS
          </option>
          <option value="analyzer" className="text-black">
            CV Analisa
          </option>
          <option value="cover" className="text-black">
            Buat Surat Lamaran
          </option>
        </select>
      </div>

      {((mode === 'ats' && cvData) ||
        (mode === 'analyzer' && downloadContent) ||
        (mode === 'cover' && downloadContent)) && (
          <div className="mb-4">
            <button
              type="button"
              onClick={downloadPdf}
              className="w-full rounded-2xl bg-gradient-to-r from-[#0097b2] to-[#00c2e0] px-4 py-3 text-sm font-semibold text-white"
            >
              ⬇ Unduh CV ATS
            </button>
          </div>
        )}

      <div className="mb-4 h-[420px] space-y-4 overflow-y-auto rounded-2xl border border-black/10 bg-white/60 p-4 transition-colors duration-300 dark:border-white/20 dark:bg-white/8">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${message.role === 'user'
                ? 'bg-gradient-to-r from-[#0097b2] to-[#00c2e0] text-white'
                : 'border border-black/10 bg-white/70 text-slate-900 dark:border-white/20 dark:bg-white/15 dark:text-white'
                }`}
            >
              <ReactMarkdown>
                {typeof message.content === 'string'
                  ? message.content
                  : JSON.stringify(message.content, null, 2)}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-slate-900 transition-colors duration-300 dark:border-white/20 dark:bg-white/15 dark:text-white">
            Thinking...
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs text-slate-900 transition-colors duration-300 dark:border-white/20 dark:bg-white/10 dark:text-white"
            >
              <span className="max-w-[160px] truncate">{file.name}</span>

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="font-bold text-red-500 dark:text-red-300"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage()
          }}
          placeholder="Ask AI anything..."
          className="flex-1 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-500 transition-colors duration-300 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/60"
        />

        <div className="flex gap-2">
          <input
            ref={inputFileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              if (inputFileRef.current) {
                inputFileRef.current.value = ''
                inputFileRef.current.click()
              }
            }}
            className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-xl text-slate-900 transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            📁
          </button>

          <button
            type="button"
            onClick={sendMessage}
            disabled={loading}
            className="rounded-full bg-gradient-to-r from-[#0097b2] to-[#00c2e0] px-6 py-3 text-sm font-semibold text-white"
          >
            {loading ? 'Sending...' : 'Enter'}
          </button>
        </div>
      </div>
    </div>
  )
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = String(reader.result || '')
      resolve(result.split(',')[1] || '')
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}