'use client'

import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('username', username);
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300 p-4">

      {/* Cinematic Universe Background */}
      <style>{`
        .space-bg {
          position: absolute;
          inset: 0;
          background-color: #030008;
          background-image: 
            radial-gradient(1px 1px at 10% 10%, white, transparent),
            radial-gradient(2px 2px at 20% 30%, #aaaaaa, transparent),
            radial-gradient(1px 1px at 30% 60%, white, transparent),
            radial-gradient(2px 2px at 40% 80%, #dddddd, transparent),
            radial-gradient(1px 1px at 50% 20%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, #888888, transparent),
            radial-gradient(1px 1px at 70% 40%, white, transparent),
            radial-gradient(2px 2px at 80% 90%, #cccccc, transparent),
            radial-gradient(1px 1px at 90% 15%, white, transparent),
            radial-gradient(2px 2px at 15% 90%, #bbbbbb, transparent),
            radial-gradient(1px 1px at 25% 45%, white, transparent),
            radial-gradient(2px 2px at 35% 15%, #999999, transparent),
            radial-gradient(1px 1px at 45% 75%, white, transparent),
            radial-gradient(2px 2px at 55% 35%, #eeeeee, transparent),
            radial-gradient(1px 1px at 65% 85%, white, transparent),
            radial-gradient(2px 2px at 75% 25%, #777777, transparent),
            radial-gradient(1px 1px at 85% 65%, white, transparent),
            radial-gradient(2px 2px at 95% 50%, #dddddd, transparent);
          background-size: 200px 200px;
          animation: moveStars 100s linear infinite;
          z-index: 0;
        }

        .space-bg-2 {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(2px 2px at 5% 5%, #ffffff, transparent),
            radial-gradient(3px 3px at 25% 25%, #aaaaff, transparent),
            radial-gradient(2px 2px at 45% 45%, #ffffff, transparent),
            radial-gradient(3px 3px at 65% 65%, #ffaaaa, transparent),
            radial-gradient(2px 2px at 85% 85%, #ffffff, transparent);
          background-size: 300px 300px;
          animation: moveStars 70s linear infinite;
          opacity: 0.6;
          z-index: 0;
        }

        .space-bg-3 {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(3px 3px at 15% 15%, #ffffff, transparent),
            radial-gradient(4px 4px at 55% 55%, #aaffaa, transparent),
            radial-gradient(3px 3px at 95% 95%, #ffffff, transparent);
          background-size: 400px 400px;
          animation: moveStars 40s linear infinite;
          opacity: 0.3;
          z-index: 0;
        }

        .nebula {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(85, 40, 160, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(40, 85, 160, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(160, 40, 85, 0.2) 0%, transparent 60%);
          animation: pulseNebula 15s alternate infinite;
          z-index: 0;
        }

        @keyframes moveStars {
          from { background-position: 0 0; }
          to { background-position: -1000px 1000px; }
        }

        @keyframes pulseNebula {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>

      <div className="space-bg pointer-events-none"></div>
      <div className="space-bg-2 pointer-events-none"></div>
      <div className="space-bg-3 pointer-events-none"></div>
      <div className="nebula pointer-events-none"></div>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/20 dark:bg-black/40 text-white backdrop-blur-md hover:bg-white/30 dark:hover:bg-black/60 transition-all z-10 border border-white/10"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Container */}
      <div className="w-full max-w-[420px] bg-white/85 dark:bg-[#2c2d30]/85 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/10 p-8 transition-colors duration-300 z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="https://i.imgur.com/k08TR9i.png"
            alt="Lazora Logo"
            className="mx-auto w-96 object-contain mb-4 drop-shadow-sm"
          />
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-wide">
            Let's Start Your Journey!
          </p>
          <br></br>
          <p className="text-0.5xl font-medium text-gray-800 dark:text-gray-100 tracking-wide">
            Silahkan Masukan Username dan Password anda
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleLogin}>

          {/* Username Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-[#f8f9fa]" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="username"
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-black dark:border-[#4a4b50] rounded-lg text-gray-900 dark:text-[#f8f9fa] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 dark:focus:border-red-500 transition-all"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-900 dark:text-[#f8f9fa]" htmlFor="password">
                Password
              </label>
              <Link href="#" className="text-sm font-medium text-[#4da6ff] hover:text-[#3399ff] dark:text-[#66b3ff] dark:hover:text-[#80bfff] transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-black dark:border-[#4a4b50] rounded-lg text-gray-900 dark:text-[#f8f9fa] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 dark:focus:border-red-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#dc2626] transition-all dark:focus:ring-offset-[#2c2d30] mt-2"
          >
            Sign In
            <ArrowRight className="h-5 w-5" />
          </button>

        </form>

      </div>
      <Toaster position="top-right" />
    </div>
  );
}
