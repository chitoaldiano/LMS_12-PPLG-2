"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type SVGProps } from "react";

const FITUR = [
  {
    nomor: "01",
    judul: "Materi & Modul Kejuruan",
    deskripsi:
      "Guru membagikan modul terstruktur dalam format PDF dan tautan referensi praktikum interaktif yang dapat diakses siswa kapan pun dan di mana pun.",
    badge: "Akses 24/7",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 7h8M8 11h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    nomor: "02",
    judul: "Tugas & Pengumpulan Terjadwal",
    deskripsi:
      "Pengelolaan tugas dengan batas waktu (deadline) yang jelas, sistem pengumpulan berkas PDF atau tautan cloud, serta status konfirmasi otomatis.",
    badge: "Batas Waktu Jelas",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <rect x="3" y="4" width="18" height="17" rx="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 2v4M15 2v4M8 11l2.5 2.5L16 8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 16h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    nomor: "03",
    judul: "Kuis & Ujian Online Berpewaktu",
    deskripsi:
      "Pengerjaan kuis pilihan ganda berbasis batas durasi waktu dengan penilaian otomatis dan pengumuman skor langsung secara transparan.",
    badge: "Skor Otomatis",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 2.5h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    nomor: "04",
    judul: "Rekapitulasi Nilai Terpadu",
    deskripsi:
      "Rekap nilai siswa dari tugas, kuis, dan ujian terintegrasi dalam satu sistem serta dapat diunduh dalam format laporan CSV/Excel untuk keperluan rapor.",
    badge: "Ekspor Nilai CSV",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path d="M3 20h18" strokeLinecap="round" />
        <path d="M6 16v-4M12 16V8M18 16v-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 12l6-4 6-1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    nomor: "05",
    judul: "Pengumuman Resmi Sekolah",
    deskripsi:
      "Pusat informasi penting, agenda akademik, jadwal ujian, dan instruksi sekolah yang disiarkan langsung ke target siswa maupun dewan guru.",
    badge: "Broadcast Resmi",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    nomor: "06",
    judul: "Manajemen Kelas & Jurusan",
    deskripsi:
      "Pengelompokan siswa, wali kelas, guru mata pelajaran kejuruan, dan modul pembelajaran terorganisir rapi sesuai konsentrasi keahlian.",
    badge: "Multi Jurusan",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path d="M3 9l9-5 9 5v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 20V12h6v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const ROLES_INFO = [
  {
    key: "siswa",
    nama: "Siswa",
    peran: "Peserta Didik",
    ringkasan:
      "Portal belajar interaktif untuk mengakses modul materi, mengumpulkan tugas praktikum, mengikuti kuis berpewaktu, dan memantau riwayat nilai.",
    fitur: [
      "Akses modul materi pelajaran dan modul referensi guru 24/7",
      "Kumpulkan tugas digital dalam format PDF atau tautan Google Drive",
      "Kerjakan kuis online interaktif dengan skor yang keluar langsung",
      "Pantau riwayat pencapaian nilai dan pengumuman sekolah terkini",
    ],
    loginNote: "Login menggunakan NISN",
    placeholder: "Nomor Induk Siswa Nasional (10 digit)",
  },
  {
    key: "guru",
    nama: "Guru Pengampu",
    peran: "Tenaga Pendidik",
    ringkasan:
      "Fasilitas lengkap untuk mendistribusikan bahan ajar, menyusun evaluasi tugas/kuis terstruktur, dan mengelola perkembangan siswa per kelas.",
    fitur: [
      "Unggah materi ajar berbasis dokumen PDF atau referensi tautan web",
      "Buat tugas berbatas waktu dan berikan nilai serta umpan balik langsung",
      "Susun bank soal kuis online pilihan ganda dengan durasi otomatis",
      "Rekap nilai siswa per kelas dan tinjau keaktifan belajar secara berkala",
    ],
    loginNote: "Login menggunakan Email Guru",
    placeholder: "nama.guru@sekolah.sch.id",
  },
  {
    key: "kurikulum",
    nama: "Bagian Kurikulum",
    peran: "Tim Akademik",
    ringkasan:
      "Pusat supervisi alokasi pengajar, ketercapaian silabus materi, dan rekapitulasi penilaian komparatif antarkelas dan antarkompetensi.",
    fitur: [
      "Pantau sebaran beban mengajar dan keaktifan guru di setiap mata pelajaran",
      "Tinjau komparasi pencapaian nilai antarkelas dan jurusan kejuruan",
      "Unduh laporan rekapitulasi nilai sekolah ke format spreadsheet (CSV/Excel)",
      "Evaluasi keselarasan target kurikulum kejuruan dengan pelaksanaannya",
    ],
    loginNote: "Login menggunakan Email Kurikulum",
    placeholder: "kurikulum@sekolah.sch.id",
  },
  {
    key: "kepsek",
    nama: "Kepala Sekolah",
    peran: "Pimpinan Sekolah",
    ringkasan:
      "Dashboard eksekutif untuk pengawasan komprehensif terhadap mutu pembelajaran vokasi dan performa akademik seluruh civitas sekolah.",
    fitur: [
      "Ringkasan statistik guru, siswa, kelas, dan aktivitas belajar sekolah",
      "Grafik rata-rata capaian nilai per program kejuruan secara real-time",
      "Supervisi mutu pembelajaran dan kepatuhan pelaksanaan evaluasi",
      "Laporan evaluasi manajerial sekolah untuk perencanaan strategis",
    ],
    loginNote: "Login menggunakan NIP",
    placeholder: "Nomor Induk Pegawai resmi",
  },
  {
    key: "admin",
    nama: "Administrator",
    peran: "Pengelola Sistem IT",
    ringkasan:
      "Kendali penuh atas data master, pengelolaan akun civitas, konfigurasi kelas & jurusan, serta keamanan infrastruktur sistem pembelajaran.",
    fitur: [
      "Manajemen akun siswa, guru, staf kurikulum, dan kepala sekolah",
      "Konfigurasi data kelas, wali kelas, serta struktur mata pelajaran",
      "Publikasi pengumuman sekolah langsung ke dashboard civitas sasaran",
      "Pemeliharaan sistem dan pengelolaan hak akses LMS secara aman",
    ],
    loginNote: "Login menggunakan Username Admin",
    placeholder: "Username administrator terdaftar",
  },
];

const FAQS = [
  {
    q: "Bagaimana cara mendapatkan akun untuk login ke LMS SMK Citra Negara?",
    a: "Akun seluruh civitas sekolah didaftarkan secara terpusat oleh Administrator IT SMK Citra Negara. Siswa menggunakan Nomor Induk Siswa Nasional (NISN) 10 digit resmi, sedangkan dewan guru dan staf menggunakan identitas resmi yang telah disediakan oleh pihak sekolah.",
  },
  {
    q: "Format kredensial apa yang digunakan untuk masing-masing peran?",
    a: "Siswa masuk menggunakan NISN (10 digit), Guru dan Tim Kurikulum menggunakan Email resmi sekolah (@sekolah.sch.id), Kepala Sekolah menggunakan NIP resmi, dan Administrator menggunakan Username pengelola sistem.",
  },
  {
    q: "Format berkas apa saja yang didukung untuk materi dan pengumpulan tugas?",
    a: "Sistem mendukung unggah dokumen format PDF serta tautan berkas cloud (seperti Google Drive, YouTube, atau repositori GitHub) yang memudahkan pengumpulan tugas praktikum kejuruan.",
  },
  {
    q: "Apakah portal LMS dapat diakses melalui smartphone atau tablet?",
    a: "Ya. Antarmuka LMS SMK Citra Negara telah didesain sepenuhnya responsif, ringan, dan ramah sentuhan, sehingga sangat nyaman diakses baik melalui smartphone, tablet, maupun laptop/PC desktop.",
  },
  {
    q: "Bagaimana jika lupa password atau mengalami kendala login?",
    a: "Apabila lupa password atau menemui kendala saat masuk, Anda dapat langsung menghubungi staf Administrator IT di Ruang Tata Usaha SMK Citra Negara untuk verifikasi dan bantuan reset kredensial.",
  },
];

function ChevronRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" className={className}>
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const [activeRole, setActiveRole] = useState("siswa");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedRole = ROLES_INFO.find((r) => r.key === activeRole) || ROLES_INFO[0];

  return (
    <div className="min-h-screen bg-[#FAF7F9] text-[#1E161C] antialiased selection:bg-[#FCEEF3] selection:text-[#501D45]">
      {/* =========================================================
          NAVBAR: Clean, Modern, Professional SaaS Header
      ========================================================= */}
      <header className="sticky top-0 z-50 border-b border-[#EDE3E9] bg-white/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Identity */}
          <Link
            href="/"
            aria-label="Beranda LMS SMK Citra Negara"
            className="group flex items-center gap-3 transition-opacity hover:opacity-95"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF7F9] p-1.5 ring-1 ring-[#EDE3E9] transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Logo SMK Citra Negara"
                width={36}
                height={36}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-[#3D1437] sm:text-lg">
                  SMK Citra Negara
                </span>
                <span className="rounded-md bg-[#FCEEF3] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#BD4564]">
                  LMS
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#685664]">
                Portal Pembelajaran Digital Vokasi
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-7 lg:flex">
            <a
              href="#fitur"
              className="text-sm font-semibold text-[#685664] transition-colors hover:text-[#501D45]"
            >
              Fitur Platform
            </a>
            <a
              href="#peran"
              className="text-sm font-semibold text-[#685664] transition-colors hover:text-[#501D45]"
            >
              Peran Civitas
            </a>
            <a
              href="#alur"
              className="text-sm font-semibold text-[#685664] transition-colors hover:text-[#501D45]"
            >
              Alur Belajar
            </a>
            <a
              href="#keunggulan"
              className="text-sm font-semibold text-[#685664] transition-colors hover:text-[#501D45]"
            >
              Keunggulan
            </a>
            <a
              href="#faq"
              className="text-sm font-semibold text-[#685664] transition-colors hover:text-[#501D45]"
            >
              Tanya Jawab
            </a>
          </nav>

          {/* Action Button & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#501D45] px-5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(80,29,69,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3B1333] hover:shadow-[0_6px_18px_rgba(80,29,69,0.26)] sm:text-sm"
            >
              <span>Masuk ke LMS</span>
              <ChevronRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EDE3E9] bg-white text-[#501D45] shadow-xs hover:bg-[#FAF7F9] transition lg:hidden"
              aria-label="Buka menu navigasi"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-[#EDE3E9] bg-white px-4 py-4 shadow-lg lg:hidden sm:px-6">
            <nav className="flex flex-col space-y-2">
              <a
                href="#fitur"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#501D45] hover:bg-[#FAF7F9]"
              >
                Fitur Platform
              </a>
              <a
                href="#peran"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#501D45] hover:bg-[#FAF7F9]"
              >
                Peran Civitas
              </a>
              <a
                href="#alur"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#501D45] hover:bg-[#FAF7F9]"
              >
                Alur Belajar
              </a>
              <a
                href="#keunggulan"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#501D45] hover:bg-[#FAF7F9]"
              >
                Keunggulan
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#501D45] hover:bg-[#FAF7F9]"
              >
                Tanya Jawab (FAQ)
              </a>
              <div className="pt-2 border-t border-[#EDE3E9]">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#501D45] text-sm font-bold text-white shadow-xs"
                >
                  <span>Masuk ke Akun LMS</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* =========================================================
          HERO SECTION: Balanced, Impactful, Modern SaaS Composition
      ========================================================= */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        {/* Subtle Ambient Radial Gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 right-0 -z-10 h-[560px] w-[560px] rounded-full bg-gradient-to-b from-[#FCEEF3] to-transparent blur-3xl opacity-75"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#F4E3EC] to-transparent blur-3xl opacity-70"
        />

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Content (Text, CTAs, Highlights) */}
            <div className="lg:col-span-7 lg:pr-4">
              {/* Institutional Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#EDE3E9] bg-white px-3.5 py-1.5 shadow-[0_2px_8px_rgba(66,22,59,0.04)]">
                <span className="flex h-2 w-2 rounded-full bg-[#D45D79] shadow-[0_0_0_4px_rgba(212,93,121,0.2)]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#BD4564]">
                  Portal Akademik Resmi SMK Citra Negara
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#3D1437] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
                Belajar Lebih Terarah,{" "}
                <span className="text-[#D45D79]">Unggul dalam Kompetensi</span>
              </h1>

              {/* Description */}
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#685664] sm:text-lg">
                Ekosistem pembelajaran digital terpadu SMK Citra Negara. Akses modul kejuruan, kumpulkan tugas tepat waktu, ikuti kuis berpewaktu otomatis, dan pantau rekapitulasi nilai secara transparan.
              </p>

              {/* Call to Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-[#501D45] px-7 text-sm font-bold text-white shadow-[0_6px_20px_rgba(80,29,69,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3B1333] hover:shadow-[0_10px_24px_rgba(80,29,69,0.30)]"
                >
                  <span>Mulai Belajar Sekarang</span>
                  <ChevronRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#fitur"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-[#EDE3E9] bg-white px-6 text-sm font-bold text-[#501D45] shadow-xs transition-all duration-200 hover:border-[#D45D79]/50 hover:bg-[#FCEEF3]/40"
                >
                  Pelajari Fitur Platform
                </a>
              </div>

              {/* Trust & Foundation Strip */}
              <div className="mt-10 grid grid-cols-1 gap-3 pt-6 border-t border-[#EDE3E9] sm:grid-cols-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FCEEF3] text-[#D45D79]">
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#685664]">5 Peran Terintegrasi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FCEEF3] text-[#D45D79]">
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#685664]">Akses Fleksibel 24/7</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FCEEF3] text-[#D45D79]">
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#685664]">Penilaian Transparan</span>
                </div>
              </div>
            </div>

            {/* Right Visual (High-Fidelity Dashboard Mockup Frame) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto w-full max-w-[500px]">
                {/* Background Ambient Glow */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#501D45]/15 via-[#D45D79]/20 to-transparent blur-xl" />

                {/* Mockup Frame Container */}
                <div className="relative overflow-hidden rounded-2xl border border-[#EDE3E9] bg-white shadow-[0_20px_50px_rgba(66,22,59,0.10)]">
                  {/* Browser Window Header */}
                  <div className="flex items-center justify-between border-b border-[#EDE3E9] bg-[#FAF7F9] px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#E58097]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F3BF88]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#95D5A6]" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-[#EDE3E9] bg-white px-3 py-1 text-[11px] font-medium text-[#8E7E8B]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 text-[#D45D79]">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>lms.smkcitranegara.sch.id</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#501D45]">v2.0</span>
                  </div>

                  {/* Visual Content Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4E3EC]">
                    <Image
                      src="/hero-belajar-online.png"
                      alt="Siswa SMK Citra Negara sedang belajar online melalui laptop"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 500px"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2E1029]/75 via-transparent to-transparent" />

                    {/* Integrated Bottom Pill */}
                    <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl bg-white/95 p-3.5 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#501D45] text-white">
                          <Image
                            src="/logo.png"
                            alt="Logo SMK Citra Negara"
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#3D1437]">Ruang Belajar Digital</p>
                          <p className="text-[11px] font-medium text-[#685664]">Terintegrasi Seluruh Tingkat Kelas</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-bold text-[#059669]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                        Aktif
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Pill */}
                <div className="absolute -bottom-4 -left-4 hidden items-center gap-2.5 rounded-2xl border border-[#EDE3E9] bg-white px-4 py-2.5 shadow-[0_10px_25px_rgba(66,22,59,0.08)] sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FCEEF3] text-[#D45D79]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E7E8B]">Akreditasi Sekolah</p>
                    <p className="text-xs font-bold text-[#3D1437]">Predikat Unggul (A)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          KEY METRICS STRIP: Clean, Proportional Stats
      ========================================================= */}
      <section className="border-y border-[#EDE3E9] bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#EDE3E9] lg:grid-cols-4">
            <div className="p-6 text-center sm:text-left">
              <p className="text-2xl font-extrabold text-[#501D45] sm:text-3xl">5 Role</p>
              <p className="mt-1 text-xs font-semibold text-[#685664]">Siswa, Guru, Kurikulum, Kepsek &amp; Admin</p>
            </div>
            <div className="p-6 text-center sm:text-left">
              <p className="text-2xl font-extrabold text-[#501D45] sm:text-3xl">100% Digital</p>
              <p className="mt-1 text-xs font-semibold text-[#685664]">Materi PDF, Tugas Cloud &amp; Paperless</p>
            </div>
            <div className="p-6 text-center sm:text-left">
              <p className="text-2xl font-extrabold text-[#501D45] sm:text-3xl">Real-Time</p>
              <p className="mt-1 text-xs font-semibold text-[#685664]">Kuis Berpewaktu &amp; Koreksi Otomatis</p>
            </div>
            <div className="p-6 text-center sm:text-left">
              <p className="text-2xl font-extrabold text-[#501D45] sm:text-3xl">Multi Format</p>
              <p className="mt-1 text-xs font-semibold text-[#685664]">Ekspor Nilai CSV &amp; Tinjauan Komprehensif</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FITUR PLATFORM SECTION: Harmonious 6-Card Grid
      ========================================================= */}
      <section id="fitur" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#BD4564]">
              Fitur Terintegrasi
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#3D1437] sm:text-3xl lg:text-4xl">
              Semua Kebutuhan Belajar Mengajar dalam Satu Tempat
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#685664] sm:text-base">
              Dirancang dengan antarmuka yang bersih, intuitif, dan responsif untuk mendukung efisiensi akademik seluruh civitas sekolah.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FITUR.map((fitur) => {
              const Icon = fitur.icon;
              return (
                <div
                  key={fitur.nomor}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#EDE3E9] bg-white p-6 shadow-[0_2px_10px_rgba(66,22,59,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D45D79]/60 hover:shadow-[0_12px_30px_rgba(66,22,59,0.08)]"
                >
                  <div>
                    {/* Card Top: Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAF7F9] text-[#501D45] ring-1 ring-[#EDE3E9] transition-all duration-300 group-hover:bg-[#501D45] group-hover:text-white group-hover:ring-transparent">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-[#FCEEF3] px-3 py-1 text-[11px] font-bold text-[#BD4564]">
                        {fitur.badge}
                      </span>
                    </div>

                    {/* Card Title & Desc */}
                    <h3 className="mt-5 text-lg font-bold text-[#3D1437] group-hover:text-[#501D45]">
                      {fitur.judul}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#685664]">
                      {fitur.deskripsi}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-[#EDE3E9] pt-4 text-xs font-semibold">
                    <span className="font-mono text-[#8E7E8B]">MODUL {fitur.nomor}</span>
                    <span className="inline-flex items-center gap-1 text-[#BD4564] transition-transform duration-200 group-hover:translate-x-1">
                      <span>Detail fitur</span>
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          PERAN CIVITAS SHOWCASE: Interactive Multi-Role Portal
      ========================================================= */}
      <section id="peran" className="border-t border-[#EDE3E9] bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#BD4564]">
              Akses Berjenjang
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#3D1437] sm:text-3xl lg:text-4xl">
              Dirancang Spesifik untuk Setiap Peran Civitas
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#685664] sm:text-base">
              Setiap pengguna memiliki portal tersendiri dengan tata letak dan hak akses yang disesuaikan secara presisi untuk tugasnya.
            </p>
          </div>

          {/* Role Filter Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-b border-[#EDE3E9] pb-4">
            {ROLES_INFO.map((r) => {
              const active = activeRole === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setActiveRole(r.key)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm ${
                    active
                      ? "bg-[#501D45] text-white shadow-[0_4px_12px_rgba(80,29,69,0.20)]"
                      : "bg-[#FAF7F9] text-[#685664] hover:bg-[#FCEEF3] hover:text-[#501D45]"
                  }`}
                >
                  {r.nama}
                </button>
              );
            })}
          </div>

          {/* Active Role Showcase Card */}
          <div className="mt-8 rounded-2xl border border-[#EDE3E9] bg-[#FAF7F9] p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Left Column: Details & Capabilities */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-lg bg-[#FCEEF3] px-3 py-1 text-xs font-bold text-[#BD4564]">
                  Portal Khusus: {selectedRole.peran}
                </div>
                <h3 className="mt-3 text-2xl font-extrabold text-[#3D1437] sm:text-3xl">
                  {selectedRole.nama}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#685664] sm:text-base">
                  {selectedRole.ringkasan}
                </p>

                {/* Checklist */}
                <div className="mt-6 space-y-3">
                  {selectedRole.fitur.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#501D45] text-white">
                        <CheckIcon className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium text-[#3D1437]">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#501D45] px-6 text-xs font-bold text-white shadow-md transition-all hover:bg-[#3B1333]"
                  >
                    <span>Masuk sebagai {selectedRole.nama}</span>
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  </Link>
                  <span className="text-xs font-semibold text-[#8E7E8B]">
                    Kredensial: {selectedRole.loginNote.replace("Login menggunakan ", "")}
                  </span>
                </div>
              </div>

              {/* Right Column: Credential Specs Box */}
              <div className="lg:col-span-5">
                <div className="rounded-xl border border-[#EDE3E9] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#EDE3E9] pb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E7E8B]">Format Kredensial</p>
                      <p className="text-base font-bold text-[#3D1437]">{selectedRole.nama}</p>
                    </div>
                    <span className="rounded-lg bg-[#FAF7F9] p-2 text-[#501D45] ring-1 ring-[#EDE3E9]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-xs">
                    <div>
                      <span className="text-[#8E7E8B]">Identitas Masuk:</span>
                      <p className="font-semibold text-[#3D1437]">{selectedRole.loginNote}</p>
                    </div>
                    <div>
                      <span className="text-[#8E7E8B]">Contoh Format:</span>
                      <p className="font-mono text-xs text-[#501D45] bg-[#FAF7F9] p-2 rounded-md mt-1 border border-[#EDE3E9]">
                        {selectedRole.placeholder}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-[#EDE3E9] flex items-center justify-between">
                      <span className="text-[#8E7E8B]">Status Keamanan:</span>
                      <span className="font-semibold text-[#059669] flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                        Terenkripsi Bcrypt
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ALUR BELAJAR (4 TAHAPAN PRAKTIS)
      ========================================================= */}
      <section id="alur" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#BD4564]">
              Alur Pembelajaran
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#3D1437] sm:text-3xl lg:text-4xl">
              Langkah Sederhana Memulai Belajar
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#685664] sm:text-base">
              Hanya butuh 4 tahapan praktis untuk belajar, mengumpulkan tugas, dan memantau pencapaian prestasi akademik.
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                judul: "Masuk ke Akun",
                deskripsi: "Gunakan identitas akun (NISN / Email / NIP / Username) yang telah didaftarkan pihak sekolah.",
              },
              {
                step: "02",
                judul: "Pelajari Modul Materi",
                deskripsi: "Unduh materi digital format PDF atau pelajari tautan interaktif yang dibagikan bapak/ibu guru.",
              },
              {
                step: "03",
                judul: "Kerjakan Tugas & Kuis",
                deskripsi: "Kumpulkan tugas sebelum tenggat waktu dan selesaikan kuis pilihan ganda secara mandiri.",
              },
              {
                step: "04",
                judul: "Pantau Nilai & Evaluasi",
                deskripsi: "Dapatkan skor langsung setelah kuis dan pantau catatan perkembangan nilai di dashboard.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-[#EDE3E9] bg-white p-6 shadow-xs transition-all duration-200 hover:border-[#D45D79]/60 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#501D45] text-sm font-extrabold text-white shadow-sm">
                  {item.step}
                </div>
                <h4 className="mt-4 text-base font-bold text-[#3D1437]">
                  {item.judul}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[#685664]">
                  {item.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          KEUNGGULAN PLATFORM: 2-Column Institutional Feature
      ========================================================= */}
      <section id="keunggulan" className="border-t border-[#EDE3E9] bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Benefit List */}
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-wider text-[#BD4564]">
                Keunggulan Platform
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#3D1437] sm:text-3xl lg:text-4xl">
                Mengapa Memilih LMS SMK Citra Negara?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#685664] sm:text-base">
                Dirancang khusus untuk memenuhi standar pendidikan vokasi modern, menghubungkan teori dan kegiatan praktikum kejuruan secara harmonis.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    title: "Antarmuka Modern & Responsif",
                    desc: "Dapat diakses nyaman melalui laptop, tablet, maupun smartphone tanpa pengurangan fitur.",
                  },
                  {
                    title: "Hak Akses & Keamanan Ketat",
                    desc: "Setiap peran hanya mengakses data yang sesuai dengan wewenang dan tugas akademiknya.",
                  },
                  {
                    title: "Efisiensi Waktu Guru & Tenaga Pendidik",
                    desc: "Koreksi kuis otomatis dan ekspor rekap nilai menghemat jam kerja administrasi guru.",
                  },
                  {
                    title: "Transparansi Penilaian Objektif",
                    desc: "Siswa dan pimpinan sekolah dapat melihat progres akademik secara nyata dan akurat.",
                  },
                ].map((point, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 rounded-xl border border-[#EDE3E9] bg-[#FAF7F9] p-4 transition-all hover:bg-white hover:border-[#D45D79]/40"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#501D45] text-xs font-bold text-white">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#3D1437]">{point.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-[#685664]">{point.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Plum Showcase Banner */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3D1437] via-[#2A0E27] to-[#1A0618] p-8 text-white shadow-xl sm:p-10">
                {/* Glow decor */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#D45D79]/20 blur-2xl"
                />

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                    <Image
                      src="/logo.png"
                      alt="Logo SMK Citra Negara"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>

                  <h3 className="mt-6 text-xl font-extrabold sm:text-2xl">
                    Maju Bersama SMK Citra Negara
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-white/80 sm:text-sm">
                    Melalui digitalisasi pembelajaran, kami berkomitmen membentuk lulusan vokasi yang kompeten, berkarakter mulia, dan siap bersaing di dunia industri.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-6 text-center">
                    <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
                      <p className="text-lg font-extrabold text-white">Terakreditasi</p>
                      <p className="text-[11px] text-white/70">Predikat Unggul (A)</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
                      <p className="text-lg font-extrabold text-white">24 Jam</p>
                      <p className="text-[11px] text-white/70">Akses Fleksibel</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link
                      href="/login"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-xs font-bold text-[#3D1437] shadow-md transition-all hover:bg-[#FCEEF3]"
                    >
                      <span>Masuk ke LMS Sekarang</span>
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ SECTION: Accessible, Sleek Accordion
      ========================================================= */}
      <section id="faq" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#BD4564]">
              Tanya Jawab
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#3D1437] sm:text-3xl lg:text-4xl">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-3 text-sm text-[#685664]">
              Informasi lengkap seputar akun, kredensial, dan penggunaan LMS SMK Citra Negara.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`overflow-hidden rounded-xl border bg-white transition-all duration-200 ${
                    isOpen
                      ? "border-[#D45D79] shadow-[0_4px_16px_rgba(212,93,121,0.08)]"
                      : "border-[#EDE3E9] hover:border-[#D45D79]/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-[#3D1437] sm:text-base"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span
                      className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm transition-all duration-200 ${
                        isOpen
                          ? "bg-[#501D45] text-white"
                          : "bg-[#FAF7F9] text-[#685664]"
                      }`}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#EDE3E9] px-5 py-4 text-xs leading-relaxed text-[#685664] sm:text-sm">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CALL TO ACTION BANNER
      ========================================================= */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3D1437] via-[#501D45] to-[#652657] px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#D45D79]/20 blur-3xl"
            />

            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider text-white ring-1 ring-white/20">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                PORTAL LMS SIAP DIGUNAKAN
              </span>
              <h2 className="mt-4 text-2xl font-extrabold sm:text-4xl">
                Siap Memulai Aktivitas Pembelajaran Hari Ini?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                Masuk dengan kredensial resmi sekolah Anda untuk mengakses materi pembelajaran, pengumpulan tugas, kuis online, dan rekapitulasi penilaian terkini.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-[#3D1437] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FCEEF3]"
                >
                  <span>Masuk ke Portal LMS</span>
                  <ChevronRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#fitur"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-bold text-white transition-all hover:bg-white/20"
                >
                  Jelajahi Fitur
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER: Structured, Professional Education Footer
      ========================================================= */}
      <footer className="border-t border-[#EDE3E9] bg-[#220B20] text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Col 1: Identity */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 p-1 ring-1 ring-white/20">
                  <Image
                    src="/logo.png"
                    alt="Logo SMK Citra Negara"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold">SMK Citra Negara</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider">LMS Vokasi v2.0</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-white/70">
                Sistem Manajemen Pembelajaran resmi SMK Citra Negara untuk mendukung proses akademik vokasi yang modern, terintegrasi, dan terukur.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                <span className="text-xs font-semibold text-[#10B981]">Portal Aktif 24/7</span>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#E27B94]">Navigasi Cepat</p>
              <ul className="mt-4 space-y-2 text-xs text-white/70">
                <li><a href="#fitur" className="hover:text-white transition">Fitur Utama</a></li>
                <li><a href="#peran" className="hover:text-white transition">Peran Pengguna</a></li>
                <li><a href="#alur" className="hover:text-white transition">Alur Belajar</a></li>
                <li><a href="#keunggulan" className="hover:text-white transition">Keunggulan Platform</a></li>
                <li><a href="#faq" className="hover:text-white transition">Tanya Jawab (FAQ)</a></li>
              </ul>
            </div>

            {/* Col 3: Portal Login */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#E27B94]">Akses Portal</p>
              <ul className="mt-4 space-y-2 text-xs text-white/70">
                <li><Link href="/login" className="hover:text-white transition">Portal Siswa (NISN)</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Portal Guru (Email)</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Portal Kurikulum (Email)</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Portal Kepala Sekolah (NIP)</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Portal Administrator (Username)</Link></li>
              </ul>
            </div>

            {/* Col 4: School Info */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#E27B94]">Sekolah Kami</p>
              <div className="mt-4 space-y-1.5 text-xs text-white/70 leading-relaxed">
                <p className="font-semibold text-white">SMK Citra Negara Depok</p>
                <p>Jl. Tanah Baru No. 99, Beji,</p>
                <p>Kota Depok, Jawa Barat</p>
                <p className="pt-2 text-[11px] text-white/50">Akreditasi A &middot; Sekolah Menengah Kejuruan</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center sm:flex-row sm:text-left text-xs text-white/50">
            <p>&copy; {new Date().getFullYear()} SMK Citra Negara. Seluruh hak cipta dilindungi undang-undang.</p>
            <p>Dibangun untuk kemajuan pendidikan vokasi digital.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
