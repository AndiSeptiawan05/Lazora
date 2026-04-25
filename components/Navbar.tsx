'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon, LogOut, Sparkles } from 'lucide-react';

type NavbarProps = {
  darkMode: boolean
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (user) {
      setUsername(user);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 pt-4 pb-4">
      <div
        className={`relative mx-auto max-w-6xl flex items-center justify-between rounded-2xl px-5 transition-all duration-500 ease-out border
          ${scrolled
            ? 'py-3 bg-white/80 dark:bg-[#0a0a0a]/80 shadow-lg shadow-black/5 dark:shadow-black/50 backdrop-blur-xl border-black/10 dark:border-white/10'
            : 'py-4 bg-white/50 dark:bg-white/5 shadow-sm backdrop-blur-md border-black/5 dark:border-white/5'
          }
        `}
      >
        {/* LEFT & MIDDLE: Logo & Greeting */}
        <div className="flex items-center flex-1 overflow-hidden shrink-0">
          <img
            src="https://i.imgur.com/QXnaRPj.png"
            alt="Lazora Workspace Logo"
            className="h-8 md:h-10 w-auto object-contain relative z-20"
          />

          {username && (
            <div className="flex ml-3 lg:ml-6 flex-1 max-w-[100px] sm:max-w-[150px] lg:max-w-[250px] overflow-hidden relative items-center">
              <style>{`
                @keyframes marquee {
                  from { transform: translateX(100%); }
                  to { transform: translateX(-100%); }
                }
                .animate-marquee {
                  display: inline-block;
                  width: 100%;
                  animation: marquee 8s linear infinite;
                  will-change: transform;
                }
              `}</style>
              <div className="animate-marquee">
                <span 
                  className="font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap" 
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                >
                  Welcome back, {username}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100/80 text-slate-600 transition-all duration-300 hover:bg-slate-200 hover:text-slate-900 dark:bg-white/10 dark:text-slate-400 dark:hover:bg-white/20 dark:hover:text-white border border-transparent dark:hover:border-white/10"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 transition-transform duration-500 group-hover:rotate-90" />
            ) : (
              <Moon className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-12" />
            )}
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-white/10 mx-1"></div>

          <button
            type="button"
            onClick={handleLogout}
            className="group relative overflow-hidden flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20 dark:bg-white dark:text-black dark:hover:shadow-white/20"
          >
            <span className="relative z-10 font-semibold">Sign out</span>
            <LogOut className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            <div className="absolute inset-0 bg-slate-800 dark:bg-slate-200 translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
          </button>
        </div>
      </div>
    </header>
  )
}