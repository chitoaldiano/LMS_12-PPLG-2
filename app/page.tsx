import Image from "next/image";
import Link from "next/link";

const FITUR = [
  {
    judul: "Materi Pembelajaran",
    deskripsi:
      "Guru unggah materi dalam bentuk PDF atau tautan, siswa bisa akses kapan saja.",
    icon: (p: React.SVGProps<SVGSVGElement>) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        {...p}
      >
        <path d="M5 4h11a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 1-1Z" />
      </svg>
    ),
  },
  {
    judul: "Tugas & Penilaian",
    deskripsi:
      "Kelola tugas, kuis, dan ujian online dengan rekap nilai otomatis per kelas.",
    icon: (p: React.SVGProps<SVGSVGElement>) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        {...p}
      >
        <path d="M9 11l3 3 8-8" />
        <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
      </svg>
    ),
  },
  {
    judul: "Manajemen Kelas",
    deskripsi:
      "Admin mengelola guru, siswa, dan kelas dalam satu dashboard yang rapi.",
    icon: (p: React.SVGProps<SVGSVGElement>) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        {...p}
      >
        <path d="M4 21V9l8-5 8 5v12" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF8F3] text-[#0F1B33] overflow-hidden">

      {/* ================= HEADER ================= */}
      <header className="relative z-20 px-6 sm:px-8 md:px-16 py-6 md:py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-[#C6992F]/20 rounded-full blur-md" />

              <Image
                src="/logo.png"
                alt="Logo SMK Citra Negara"
                width={56}
                height={56}
                priority
                className="relative rounded-full bg-white shadow-sm"
              />
            </div>

            <div>
              <p className="font-bold text-[#0F1B33] text-base md:text-lg leading-tight">
                SMK Citra Negara
              </p>

              <p className="text-[11px] md:text-xs text-[#9CA3AF] mt-1">
                Learning Management System
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="
              hidden sm:inline-flex
              items-center justify-center
              px-5 py-2.5
              rounded-xl
              border border-[#0F1B33]
              text-[#0F1B33]
              text-sm font-semibold
              transition-all duration-300
              hover:bg-[#0F1B33]
              hover:text-white
              hover:-translate-y-0.5
            "
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* ================= DECORATION ================= */}
      <div
        className="
          pointer-events-none
          absolute top-0 right-0
          w-[420px] md:w-[620px]
          h-[420px] md:h-[620px]
          rounded-full
          opacity-[0.08]
          blur-3xl
        "
        style={{
          background:
            "radial-gradient(circle, #C6992F 0%, transparent 70%)",
        }}
      />

      <div
        className="
          pointer-events-none
          absolute
          -top-32 -right-32
          w-[360px] md:w-[480px]
          h-[360px] md:h-[480px]
          rounded-full
          opacity-[0.13]
        "
        style={{
          background:
            "linear-gradient(135deg, #0F1B33, #1A2C52)",
        }}
      />

      {/* ================= HERO ================= */}
      <section className="relative z-10 px-6 sm:px-8 md:px-16 pt-10 pb-20 md:pt-16 md:pb-28">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* HERO TEXT */}
            <div className="w-full lg:w-[52%] max-w-2xl">

              <span
                className="
                  inline-flex items-center
                  px-4 py-2
                  rounded-full
                  bg-[#C6992F]/10
                  border border-[#C6992F]/20
                  text-[#8B6F3E]
                  text-xs
                  font-bold
                  tracking-[0.12em]
                  mb-6
                "
              >
                PLATFORM BELAJAR DIGITAL
              </span>

              <h1
                className="
                  text-4xl
                  sm:text-5xl
                  lg:text-[58px]
                  font-bold
                  text-[#0F1B33]
                  leading-[1.08]
                  tracking-[-0.025em]
                  mb-6
                "
              >
                Learning Management System{" "}
                <span className="text-[#C6992F]">
                  SMK Citra Negara
                </span>
              </h1>

              <p
                className="
                  text-base
                  md:text-lg
                  text-[#6B7280]
                  leading-8
                  max-w-xl
                  mb-9
                "
              >
                Satu platform digital untuk mendukung proses pembelajaran,
                kolaborasi, dan pengelolaan akademik bagi seluruh warga
                sekolah.
              </p>

              <div className="flex flex-wrap items-center gap-4">

           <Link
  href="/login"
  className="
    group
    inline-flex
    items-center
    justify-center
    gap-2
    px-6
    py-3
    rounded-full
    bg-[#0F1B33]
    text-white
    font-semibold
    text-sm
    shadow-[0_8px_25px_rgba(15,27,51,0.18)]
    transition-all
    duration-300
    hover:-translate-y-1
    hover:bg-[#C6992F]
    hover:text-[#0F1B33]
  "
>
  <span>Mulai Belajar</span>

  <span
    className="
      flex
      items-center
      justify-center
      w-6
      h-6
      rounded-full
      bg-white/10
      text-xs
      transition-all
      duration-300
      group-hover:bg-[#0F1B33]
      group-hover:text-white
      group-hover:translate-x-0.5
    "
  >
    →
  </span>
</Link>
                <div className="hidden sm:flex items-center gap-3 text-sm text-[#6B7280]">
                  <div className="w-8 h-px bg-[#D8D1C4]" />
                  <span>SMK Citra Negara</span>
                </div>

              </div>
            </div>

            {/* HERO IMAGE */}
            <div className="w-full lg:w-[48%] max-w-xl">
              <div className="relative">

                {/* Glow */}
                <div
                  className="
                    absolute
                    -inset-8
                    rounded-[3rem]
                    opacity-40
                    blur-3xl
                  "
                  style={{
                    background:
                      "radial-gradient(circle, #C6992F35 0%, transparent 70%)",
                  }}
                />

                {/* Image Container */}
                <div
                  className="
                    relative
                    rounded-[2rem]
                    bg-white/60
                    border border-white
                    shadow-[0_25px_70px_rgba(15,27,51,0.08)]
                    p-5 md:p-8
                    backdrop-blur-sm
                  "
                >
                  <Image
                    src="/ilustrasi.png"
                    alt="Ilustrasi pembelajaran"
                    width={640}
                    height={480}
                    priority
                    className="relative w-full h-auto"
                  />
                </div>

                {/* Small decorative circle */}
                <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-[#C6992F]/15 border border-[#C6992F]/20" />

                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-[#0F1B33]/10" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FITUR ================= */}
      <section className="relative bg-white border-t border-[#EEEAE2]">

        <div className="px-6 sm:px-8 md:px-16 py-20 md:py-24">
          <div className="max-w-7xl mx-auto">

            {/* Section Header */}
            <div className="max-w-2xl mb-12 md:mb-14">

              <span className="text-xs font-bold tracking-[0.15em] text-[#C6992F] uppercase">
                Fitur Utama
              </span>

              <h2
                className="
                  text-2xl
                  md:text-3xl
                  lg:text-4xl
                  font-bold
                  text-[#0F1B33]
                  mt-3
                  mb-4
                "
              >
                Semua yang dibutuhkan,
                <br className="hidden sm:block" />
                dalam satu tempat
              </h2>

              <p className="text-[#6B7280] leading-7">
                Dari materi, tugas, sampai penilaian — dirancang khusus
                untuk kebutuhan sekolah.
              </p>

            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {FITUR.map((f, index) => {
                const IconComp = f.icon;

                return (
                  <div
                    key={f.judul}
                    className="
                      group
                      relative
                      p-7
                      rounded-2xl
                      bg-[#FAF8F3]
                      border border-[#E5E0D5]
                      transition-all duration-300
                      hover:-translate-y-2
                      hover:bg-white
                      hover:border-[#C6992F]/40
                      hover:shadow-[0_20px_45px_rgba(15,27,51,0.08)]
                    "
                  >

                    {/* Number */}
                    <span
                      className="
                        absolute
                        top-6
                        right-6
                        text-xs
                        font-bold
                        text-[#C6992F]/50
                      "
                    >
                      0{index + 1}
                    </span>

                    {/* Icon */}
                    <div
                      className="
                        w-13 h-13
                        w-[52px] h-[52px]
                        rounded-xl
                        bg-[#0F1B33]
                        flex items-center justify-center
                        text-[#C6992F]
                        mb-6
                        shadow-lg shadow-[#0F1B33]/10
                        transition-all duration-300
                        group-hover:bg-[#C6992F]
                        group-hover:text-[#0F1B33]
                      "
                    >
                      <IconComp className="w-6 h-6" />
                    </div>

                    <h3 className="font-bold text-[#0F1B33] mb-3">
                      {f.judul}
                    </h3>

                    <p className="text-sm text-[#6B7280] leading-7">
                      {f.deskripsi}
                    </p>

                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#0F1B33] text-white">

        <div className="px-6 sm:px-8 md:px-16 py-8">
          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

              <p className="text-sm text-white/60">
                &copy; {new Date().getFullYear()} SMK Citra Negara
              </p>

              <p className="text-sm text-white/60">
                Platform pembelajaran digital terintegrasi
              </p>

            </div>

          </div>
        </div>

      </footer>

    </main>
  );
}