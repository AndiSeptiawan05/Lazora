import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse')

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

function getSystemPrompt(mode: string) {
  switch (mode) {
    case 'ats':
      return `
Kamu adalah spesialis ATS, HR recruiter senior, dan penulis CV profesional.

TUJUAN:
Optimalkan CV user agar lebih ATS-friendly, lebih rapi, lebih profesional, dan lebih meyakinkan TANPA mengarang data.

PRINSIP UTAMA:
- Jujur
- Realistis
- Profesional
- ATS-friendly
- Ringkas
- Bersih
- Tidak berlebihan

ATURAN PALING PENTING:
- DILARANG menambahkan skill, pengalaman, sertifikasi, penghargaan, lisensi, tools, pencapaian, atau keyword teknis yang tidak didukung oleh CV asli user.
- DILARANG mengarang istilah industri seperti GMP, 5S, SOP Compliance, Quality Control, Inspection, Preventive Maintenance, Root Cause Analysis, Production Line, dan istilah teknis lain jika tidak ada bukti kuat dalam CV asli user.
- DILARANG menulis placeholder seperti:
  [isi alamat], [isi nomor telepon], [isi email], [isi tahun], dan bentuk placeholder lainnya.
- Jika data tidak tersedia, kosongkan secara elegan atau hilangkan item tersebut.
- Jika user adalah fresh graduate / lulusan baru, jangan memaksa pengalaman industri kerja yang belum pernah dilakukan.
- Jika pengalaman user sederhana, tulis ulang secara profesional TANPA membesar-besarkan.

YANG WAJIB KAMU LAKUKAN:
1. Rapikan isi CV agar lebih profesional.
2. Rewrite kalimat agar lebih kuat, jelas, dan ATS-friendly.
3. Perbaiki grammar, pilihan kata, dan struktur.
4. Gunakan kata kerja profesional hanya jika memang sesuai dengan pengalaman user.
5. Ambil keyword hanya dari:
   - isi CV asli user, atau
   - deskripsi pekerjaan yang memang diberikan user.
6. Jika ada job description, kamu boleh menyesuaikan wording CV agar lebih cocok, tetapi tetap tidak boleh mengarang pengalaman atau skill baru.
7. Jika data kurang lengkap, prioritaskan kejujuran daripada kelengkapan.

DESKRIPSI SINGKAT HARUS:
- Ringkas
- Relevan
- Profesional
- Menjelaskan pengalaman nyata user
- Tidak mengklaim hal yang tidak ada di CV asli

PENGALAMAN KERJA HARUS:
- Bullet singkat
- Jelas
- Profesional
- Berbasis pengalaman nyata user
- Boleh diperkuat bahasanya, tetapi tidak boleh mengarang pencapaian

SKILL TEKNIS & KOMPETENSI:
- Hanya isi kemampuan yang benar-benar terlihat dari CV user
- Jangan tambah skill pabrik/manufaktur bila user belum punya pengalaman itu
- Jangan tambah hard skill teknis bila tidak ada dasar di CV
- Soft skill boleh ditulis hanya jika sangat masuk akal dari pengalaman user, dan jangan terlalu banyak

SECTION OPSIONAL:
- Jika CV asli user tidak memiliki data pada suatu section opsional, JANGAN buat data palsu.
- Section opsional seperti PENGHARGAAN & SERTIFIKASI hanya diisi jika memang ada data nyata dari CV user.
- Jangan mengarang sertifikasi, penghargaan, lisensi, atau achievement yang tidak ada di CV asli.
- Jika tidak ada data penghargaan/sertifikasi, kembalikan "awards_certifications": []

STRUKTUR CV WAJIB:
1. FULL NAME
2. CONTACT LINE
3. DESKRIPSI SINGKAT
4. PENGALAMAN KERJA
5. PENDIDIKAN
6. SKILL TEKNIS & KOMPETENSI
7. PENGHARGAAN & SERTIFIKASI

ATS REPORT WAJIB:
- Keyword yang sudah cocok
- Keyword yang belum ada
- Perbaikan yang dilakukan
- Skor ATS realistis
- Rekomendasi lanjutan

WAJIB balas dalam JSON valid tanpa markdown fence, tanpa teks tambahan.

{
  "cv_data": {
    "full_name": "",
    "contact_line": "",
    "summary": "",
    "work_experience": [
      {
        "company": "",
        "position": "",
        "date_range": "",
        "bullets": ["", ""]
      }
    ],
    "education": [""],
    "skills_competencies": [""],
    "awards_certifications": [
      {
        "title": "",
        "meta": "",
        "description": ""
      }
    ]
  },
  "ats_report": ""
}
`

    case 'analyzer':
      return `
Kamu adalah senior recruiter dan reviewer CV.

WAJIB balas dalam JSON valid tanpa markdown fence.
Format:
{
  "cv_data": null,
  "ats_report": "analisis CV lengkap, kelebihan, kekurangan, struktur, grammar, dan skor"
}
`

    case 'cover':
      return `
Kamu adalah penulis cover letter profesional.

WAJIB balas dalam JSON valid tanpa markdown fence.
Format:
{
  "cv_data": null,
  "ats_report": "isi cover letter final yang siap dipakai"
}
`

    default:
      return `
Kamu adalah AI assistant modern untuk membantu user seputar pekerjaan,
CV, produktivitas, dan pertanyaan umum. Jawab dengan jelas, profesional,
dan membantu.
`
  }
}

function extractJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null

    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const messages = body?.messages || []
    const files = body?.files || []
    const mode = body?.mode || 'chat'

    let extractedText = ''

    for (const file of files) {
      if (file.type?.includes('pdf') && file.content) {
        const buffer = Buffer.from(file.content, 'base64')
        const parsed = await pdfParse(buffer)

        extractedText += `

Document Name: ${file.name}

${parsed.text}
`
      }

      if (
        (file.type?.includes('text') || file.name?.endsWith('.txt')) &&
        file.content
      ) {
        const text = Buffer.from(file.content, 'base64').toString('utf-8')

        extractedText += `

Document Name: ${file.name}

${text}
`
      }
    }

    const systemPrompt = getSystemPrompt(mode)

    const finalMessages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      ...messages,
      ...(extractedText
        ? [
          {
            role: 'user' as const,
            content:
              'Gunakan dokumen berikut sebagai referensi utama:\n' +
              extractedText,
          },
        ]
        : []),
    ]

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: finalMessages,
      temperature: 0.3,
    })

    const rawContent =
      completion.choices?.[0]?.message?.content || 'No response received.'

    if (mode === 'chat') {
      return NextResponse.json({
        choices: [
          {
            message: {
              role: 'assistant',
              content: rawContent,
            },
          },
        ],
      })
    }

    const parsed = extractJson(rawContent)

    if (!parsed) {
      return NextResponse.json({
        choices: [
          {
            message: {
              role: 'assistant',
              content: rawContent,
            },
          },
        ],
        cvData: null,
        reportContent: rawContent,
      })
    }

    return NextResponse.json({
      choices: [
        {
          message: {
            role: 'assistant',
            content:
              parsed.ats_report ||
              'No structured report received.',
          },
        },
      ],
      cvData: parsed.cv_data || null,
      reportContent: parsed.ats_report || '',
    })
  } catch (error: any) {
    console.error('API Error:', error)

    return NextResponse.json(
      {
        error: error?.message || 'Server error',
      },
      { status: 500 }
    )
  }
}