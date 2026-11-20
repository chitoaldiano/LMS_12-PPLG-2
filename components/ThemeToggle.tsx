"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({
  className = "",
  rounded = "full",
}: {
  className?: string;
  rounded?: "full" | "xl";
}) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncTheme = () => {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDarkActive = stored === "dark" || (!stored && prefersDark);
      setIsDark(isDarkActive);
      if (isDarkActive) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    syncTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setIsDark(e.matches);
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    window.addEventListener("storage", syncTheme);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const toggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const roundedCls = rounded === "xl" ? "rounded-xl" : "rounded-full";

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 sm:w-11 sm:h-11 ${roundedCls} shrink-0 opacity-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      className={`relative w-9 h-9 sm:w-11 sm:h-11 ${roundedCls} shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer text-[#59234F] dark:text-[#F5EEF3] hover:bg-[#FFF0F6] dark:hover:bg-[#271424] active:scale-95 ${className}`}
    >
      {isDark ? (
        // Ikon Matahari (Sun)
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-90"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        // Ikon Bulan (Moon)
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 sm:w-6 sm:h-6 text-[#59234F] transition-transform duration-300 rotate-0 hover:-rotate-12"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
