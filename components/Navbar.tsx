'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type NavbarProps = {
  darkMode: boolean
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (user) {
      setUsername(user);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('username');
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 px-4 pt-6">
      <div className="relative mb-8 overflow-hidden rounded-[32px] border border-black/10 bg-white/65 px-8 py-6 shadow-2xl backdrop-blur-2xl transition-colors duration-300 dark:border-white/15 dark:bg-white/[0.08]">
        <div className="flex items-center justify-between gap-6">
          {/* LEFT: Running Text */}
          <div className="flex-1 overflow-hidden mr-6 flex items-center">
            <style>{`
              @keyframes marquee {
                from { transform: translateX(50vw); }
                to { transform: translateX(-100%); }
              }
              .animate-marquee-container {
                display: flex;
                overflow: hidden;
                width: 100%;
              }
              .animate-marquee-text {
                white-space: nowrap;
                animation: marquee 12s linear infinite;
              }
            `}</style>
            <div className="animate-marquee-container">
              <p className="animate-marquee-text text-xl font-bold tracking-wide text-slate-900 transition-colors duration-300 dark:text-white">
                welcome to Lazora {username ? username : ''}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-slate-900 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}