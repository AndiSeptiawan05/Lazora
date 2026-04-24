'use client'

import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import Chat from '../../components/Chat'
import JpgToPdf from '../../components/JpgToPdf'
import MergeCvDocuments from '../../components/Merge'
import { FileText } from 'lucide-react'

const cvParticles = [
  { left: '10%', duration: 15, delay: 0, size: 32 },
  { left: '25%', duration: 18, delay: 2, size: 24 },
  { left: '40%', duration: 12, delay: 4, size: 40 },
  { left: '55%', duration: 20, delay: 1, size: 28 },
  { left: '70%', duration: 14, delay: 5, size: 36 },
  { left: '85%', duration: 17, delay: 3, size: 30 },
  { left: '15%', duration: 16, delay: 6, size: 26 },
  { left: '35%', duration: 19, delay: 7, size: 34 },
  { left: '60%', duration: 13, delay: 8, size: 38 },
  { left: '80%', duration: 21, delay: 2, size: 22 },
];

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const isDark = savedTheme === 'dark'

    setDarkMode(isDark)

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-white relative overflow-hidden">
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {/* Flying CV Animations */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {cvParticles.map((particle, i) => (
          <div
            key={i}
            className="absolute bottom-[-10%] text-slate-300 dark:text-slate-700/50"
            style={{
              left: particle.left,
              animation: `floatUp ${particle.duration}s linear ${particle.delay}s infinite`,
            }}
          >
            <FileText size={particle.size} />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 pt-2">
          {/* TOOLS 3 KOLOM */}
          <section className="grid gap-6 lg:grid-cols-[2fr_2fr_1fr]">
            <Chat />
            <JpgToPdf />
            <MergeCvDocuments />
          </section>

          {/* HERO BRANDING DI BAWAH */}
          <section className="relative mx-auto mt-8 overflow-hidden rounded-[32px] border border-black/10 bg-white/70 p-8 shadow-2xl backdrop-blur-2xl transition-colors duration-300 dark:border-white/15 dark:bg-white/[0.08]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0097b2]/10 via-white/[0.03] to-transparent" />

            <div className="relative mx-auto text-center">
              <img
                src="https://i.imgur.com/5q9JAfP.png"
                alt="Logo"
                className="mx-auto w-full max-w-[520px] object-contain"
              />

              <h1 className="mt-4 text-2xl font-extrabold uppercase tracking-tight text-slate-900 drop-shadow-lg transition-colors duration-300 dark:text-white md:text-4xl">
                Find Your Dream Job With Us
              </h1>

              <p className="mt-2 text-sm font-semibold tracking-[0.25em] text-slate-700 transition-colors duration-300 dark:text-white/90 md:text-base">
                CEPAT • MUDAH • EFEKTIF
              </p>
            </div>
          </section>
        </main>

        <div className="relative z-10">
          <Toaster position="top-right" />
        </div>
      </div>
    </div>
  )
}