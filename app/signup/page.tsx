'use client'

import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sign up and route to dashboard
    router.push('/dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1f2022] transition-colors duration-300 p-4 relative">

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-[#2c2d30] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#383a3f] transition-all"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Container */}
      <div className="w-full max-w-[420px] bg-white dark:bg-[#2c2d30] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] p-8 transition-colors duration-300">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#f8f9fa] tracking-tight">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sign up to get started.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSignup}>

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
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-[#f8f9fa]" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-black dark:border-[#4a4b50] rounded-lg text-gray-900 dark:text-[#f8f9fa] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 dark:focus:border-red-500 transition-all"
                placeholder="Create a password"
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
            Sign Up
            <ArrowRight className="h-5 w-5" />
          </button>

        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/" className="font-semibold text-gray-900 hover:underline dark:text-[#f8f9fa]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
