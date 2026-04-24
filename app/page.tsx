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
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300 p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("https://i.imgur.com/MGrOjVW.jpeg")' }}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/20 dark:bg-black/40 text-white backdrop-blur-md hover:bg-white/30 dark:hover:bg-black/60 transition-all z-10 border border-white/10"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Container */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-5xl transition-colors duration-300 z-10 flex flex-col md:flex-row gap-6 md:gap-8">

        {/* Left Column: Branding / Logo */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center">
          <img
            src="https://i.imgur.com/k08TR9i.png"
            alt="Lazora Logo"
            className="w-56 md:w-72 object-contain mb-6 drop-shadow-sm"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide text-center">
            Let's Start Your Journey!

          </h1>
        </div>

        {/* Right Column: Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white/50 dark:bg-[#1a1b1e]/40 backdrop-blur-1xl rounded-[2.5rem] shadow-[inset_0_0_20px_rgba(255,255,255,0.5),0_8px_32px_rgba(0,0,0,0.4)] dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.6)] border border-white/50 dark:border-white/10">
          <form className="space-y-6" onSubmit={handleLogin}>

            {/* Username Input */}
            <h1 className="text-1xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-wide text-center">
              LOGIN
            </h1>
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

      </div>
      <Toaster position="top-right" />
    </div>
  );
}
