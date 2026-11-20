"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface RoleHint {
  role: string;
  label: string;
  credentialName: string;
  description: string;
  placeholder: string;
  badge: string;
}

const ROLE_HINTS: RoleHint[] = [
  {
    role: "siswa",
    label: "Siswa",
    credentialName: "NISN",
    description: "Nomor Induk Siswa Nasional (10 digit)",
    placeholder: "Masukkan 10 digit NISN",
    badge: "NISN Siswa",
  },
  {
    role: "guru",
    label: "Guru",
    credentialName: "Email Guru",
    description: "Alamat email resmi sekolah",
    placeholder: "nama.guru@sekolah.sch.id",
    badge: "Email Resmi",
  },
  {
    role: "kurikulum",
    label: "Kurikulum",
    credentialName: "Email Kurikulum",
    description: "Alamat email staf kurikulum",
    placeholder: "kurikulum@sekolah.sch.id",
    badge: "Email Staf",
  },
  {
    role: "kepsek",
    label: "Kepsek",
    credentialName: "NIP",
    description: "Nomor Induk Pegawai resmi",
    placeholder: "Masukkan NIP resmi",
    badge: "NIP Pimpinan",
  },
  {
    role: "admin",
    label: "Admin",
    credentialName: "Username",
    description: "Username administrator terdaftar",
    placeholder: "Masukkan username admin",
    badge: "Username IT",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const [selectedRoleHint, setSelectedRoleHint] = useState<string>("siswa");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const activeHint = ROLE_HINTS.find((r) => r.role === selectedRoleHint) || ROLE_HINTS[0];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const result = await res.json();

      if (!result.success) {
        setErrorMsg(result.message || "Identitas akun atau password tidak cocok.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("lms_user", JSON.stringify(result.data));

      const roleRedirect: Record<string, string> = {
        admin: "/admin",
        guru: "/guru",
        siswa: "/siswa",
        kepsek: "/kepsek",
        kurikulum: "/kurikulum",
      };

      router.push(roleRedirect[result.data.role] || "/");
    } catch {
      setErrorMsg("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#FAF7F9] p-4 text-[#1E161C] antialiased sm:p-6 lg:p-8">
      {/* Background Subtle Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 -top-28 -z-10 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-[#FCEEF3] to-transparent blur-3xl opacity-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -right-28 -z-10 h-[480px] w-[480px] rounded-full bg-gradient-to-tl from-[#F4E3EC] to-transparent blur-3xl opacity-75"
      />

      {/* Main Unified Card Container */}
      <div className="relative w-full max-w-[1020px] overflow-hidden rounded-3xl border border-[#EDE3E9] bg-white shadow-[0_24px_64px_rgba(66,22,59,0.08)]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* =========================================================
              LEFT COLUMN: Institutional Identity & Value Showcase
          ========================================================= */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#3D1437] via-[#2A0E27] to-[#1A0618] p-8 text-white sm:p-10 lg:col-span-5 lg:p-12">
            {/* Background Ambient Accents */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#D45D79]/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#42163B]/40 blur-3xl"
            />

            {/* Top Brand Identity */}
            <div className="relative z-10">
              <Link
                href="/"
                className="group inline-flex items-center gap-3 transition-opacity hover:opacity-95"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 p-2 shadow-sm ring-1 ring-white/20 backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
                  <Image
                    src="/logo.png"
                    alt="Logo SMK Citra Negara"
                    width={32}
                    height={32}
                    priority
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold tracking-tight text-white">
                      SMK Citra Negara
                    </span>
                    <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FCEEF3]">
                      LMS
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-white/70">
                    Portal Pembelajaran Vokasi
                  </p>
                </div>
              </Link>

              {/* Main Headline & Description */}
              <div className="mt-10 lg:mt-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                  Sistem Akademik Aktif
                </div>
                <h1 className="mt-4 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                  Belajar Terarah, Raih Prestasi Unggul.
                </h1>
                <p className="mt-3 text-xs leading-relaxed text-white/80 sm:text-sm">
                  Portal terpadu untuk mengakses modul materi kejuruan, pengumpulan tugas, kuis online otomatis, dan rekapitulasi penilaian transparan.
                </p>
              </div>

              {/* 3 Key Feature Bullets */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur-xs">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D45D79]/20 text-[#FCEEF3]">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">Modul &amp; Materi PDF</p>
                    <p className="text-white/60">Akses bahan ajar fleksibel 24/7</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur-xs">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D45D79]/20 text-[#FCEEF3]">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <circle cx="10" cy="10" r="7" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 6v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">Kuis Berdurasi Waktu</p>
                    <p className="text-white/60">Koreksi &amp; skor langsung otomatis</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur-xs">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D45D79]/20 text-[#FCEEF3]">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M3 17h14M5 13v-3M9 13V7M13 13V4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">Rekapitulasi Nilai</p>
                    <p className="text-white/60">Transparansi capaian rapor siswa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Details */}
            <div className="relative z-10 mt-8 border-t border-white/15 pt-5 text-xs text-white/70">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 font-semibold text-white/90 hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M16 10H4M10 16l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Kembali ke Beranda</span>
                </Link>
                <span className="font-medium text-white/50">Akreditasi A</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: Modern, Focused Login Form
          ========================================================= */}
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-7 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              {/* Form Header */}
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#BD4564]">
                  Autentikasi Akun
                </span>
                <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#42163B] sm:text-3xl">
                  Masuk ke Portal LMS
                </h2>
                <p className="mt-1 text-xs text-[#685664] sm:text-sm">
                  Pilih peran Anda dan masukkan kredensial resmi sekolah yang terdaftar.
                </p>
              </div>

              {/* Role Filter Selector */}
              <div className="mb-6 rounded-2xl border border-[#EDE3E9] bg-[#FAF7F9] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E7E8B]">
                    Format Peran
                  </span>
                  <span className="rounded-md bg-[#FCEEF3] px-2 py-0.5 text-[10px] font-bold text-[#BD4564]">
                    {activeHint.badge}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {ROLE_HINTS.map((r) => {
                    const isSelected = selectedRoleHint === r.role;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => {
                          setSelectedRoleHint(r.role);
                          setErrorMsg("");
                        }}
                        className={`rounded-lg py-2 text-xs font-bold transition-all duration-150 text-center ${
                          isSelected
                            ? "bg-[#501D45] text-white shadow-xs"
                            : "bg-white text-[#685664] hover:bg-[#FCEEF3] hover:text-[#501D45]"
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2.5 text-[11px] font-medium text-[#685664]">
                  <strong className="text-[#42163B]">{activeHint.label}</strong> masuk dengan {activeHint.credentialName} ({activeHint.description}).
                </p>
              </div>

              {/* Error Alert Box */}
              {errorMsg && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 shadow-xs"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {/* Interactive Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Identifier Input */}
                <div>
                  <label
                    htmlFor="identifier"
                    className="mb-1.5 block text-xs font-bold text-[#42163B] sm:text-sm"
                  >
                    Identitas Akun ({activeHint.credentialName})
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8E7E8B]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                      </svg>
                    </span>
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={activeHint.placeholder}
                      className="h-11 w-full rounded-xl border border-[#EDE3E9] bg-white pl-10 pr-4 text-xs text-[#1E161C] outline-none transition-all placeholder:text-[#AFA1AC] hover:border-[#D45D79]/50 focus:border-[#D45D79] focus:ring-4 focus:ring-[#D45D79]/15 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold text-[#42163B] sm:text-sm"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8E7E8B]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password akun Anda"
                      className="h-11 w-full rounded-xl border border-[#EDE3E9] bg-white pl-10 pr-11 text-xs text-[#1E161C] outline-none transition-all placeholder:text-[#AFA1AC] hover:border-[#D45D79]/50 focus:border-[#D45D79] focus:ring-4 focus:ring-[#D45D79]/15 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#8E7E8B] hover:text-[#501D45] transition-colors"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A11 11 0 0 1 12 5c5 0 9 4 10 7-.4 1.1-1.3 2.3-2.6 3.3M6.2 6.2C3.8 7.7 2.5 10 2 12c1 3 5 7 10 7 1.5 0 2.8-.3 4-.9" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#501D45] px-5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(80,29,69,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3B1333] hover:shadow-[0_8px_22px_rgba(80,29,69,0.28)] focus:ring-4 focus:ring-[#D45D79]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        <span>Memverifikasi Akun...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke Portal LMS</span>
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        >
                          <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Support & Help Note */}
              <div className="mt-8 border-t border-[#EDE3E9] pt-4 text-center">
                <p className="text-xs text-[#8E7E8B]">
                  Kendala akses akun atau lupa password?
                </p>
                <p className="mt-1 text-xs font-semibold text-[#501D45]">
                  Hubungi staf Administrator IT di Ruang Tata Usaha SMK Citra Negara.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
