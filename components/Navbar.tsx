type NavbarProps = {
  darkMode: boolean
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 px-4 pt-6">
      <div className="relative mb-8 overflow-hidden rounded-[32px] border border-black/10 bg-white/65 px-8 py-6 shadow-2xl backdrop-blur-2xl transition-colors duration-300 dark:border-white/15 dark:bg-white/[0.08]">
        <div className="flex items-center justify-between gap-6">
          {/* LEFT */}
          <div className="flex items-center gap-5">
            <div className="rounded-2xl border border-black/10 bg-white/70 p-2 shadow-lg dark:border-white/10 dark:bg-white/10">
              <img
                src="https://i.imgur.com/p9iUQfo.png"
                alt="LazyJobSeeker Logo"
                className="h-16 w-16 object-contain"
              />
            </div>

            <p className="text-xl font-bold tracking-wide text-slate-900 transition-colors duration-300 dark:text-white">
              LAZORA
            </p>
          </div>

          {/* RIGHT */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full border border-black/10 bg-white/70 px-5 py-2 text-sm font-medium text-slate-900 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
    </header>
  )
}