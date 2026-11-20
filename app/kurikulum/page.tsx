"use client";

import { useEffect, useState } from "react";
import DashboardShell, { Box, Kosong, StatCard, ambilData } from "@/components/DashboardShell";
import ProfilPanel from "@/components/ProfilPanel";
import { RekapNilai, GuruPerKelas } from "@/components/Laporan";

function Beranda({ user, setNav }: { user: any; setNav: (k: string) => void }) {
  const [kelas, setKelas] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([ambilData("/api/laporan?jenis=guru-kelas"), ambilData("/api/laporan?jenis=rekap-nilai")]).then(
      ([k, r]) => {
        setKelas(k);
        setRows(r);
        setLoading(false);
      }
    );
  }, []);

  const guruUnik = new Set<string>();
  kelas.forEach((k) => k.guru.forEach((g: any) => guruUnik.add(g._id)));
  const rata = rows.length ? Math.round((rows.reduce((a, r) => a + r.nilai, 0) / rows.length) * 10) / 10 : "-";

  return (
    <>
      {/* Hero Banner mengikuti standar tampilan LMS SMK Citra Negara */}
      <section className="relative mb-5 min-h-[190px] sm:min-h-[230px] w-full overflow-hidden rounded-[26px] border border-[#F1CFE0] bg-gradient-to-r from-[#FCE5F0] via-[#F8D8E8] to-[#E9BBD4] shadow-[0_8px_28px_rgba(91,31,75,0.07)] lg:min-h-[245px]">
        <div className="relative z-10 box-border w-full md:w-[60%] lg:w-[58%] min-w-0 px-5 py-6 sm:px-8 lg:px-9 lg:py-8">
          <span className="inline-flex items-center rounded-full bg-[#70295F] text-white px-3 py-1 text-[10px] font-bold tracking-wider">
            RUANG KURIKULUM
          </span>
          <h1 className="text-2xl sm:text-3xl xl:text-[38px] leading-tight font-extrabold text-[#572047] mt-3">
            Halo, {user?.nama ? user.nama.split(" ")[0] : "Kurikulum"}!<br />Pantau kurikulum & pembelajaran.
          </h1>
          <p className="text-xs sm:text-sm xl:text-base text-[#81506F] mt-2 sm:mt-3 leading-relaxed max-w-[560px]">
            Pantau pengajar per kelas, rekapitulasi nilai sekolah, dan perkembangan kurikulum di LMS SMK Citra Negara.
          </p>
          <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-[#70295F]">
            <span className="w-2 h-2 rounded-full bg-[#D94383]" /> Tim Kurikulum · SMK Citra Negara
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 flex w-[55%] sm:w-[48%] md:w-[44%] items-end justify-center opacity-25 md:opacity-95">
          <svg viewBox="0 0 520 260" className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <circle cx="405" cy="48" r="58" fill="#F9EAF2" opacity=".65" />
            <path d="M40 116 250 28 470 116v144H40Z" fill="#F9F0F5" stroke="#B66C98" strokeWidth="7" />
            <path d="M18 119 250 18 493 119" fill="none" stroke="#9C4D7D" strokeWidth="13" strokeLinejoin="round" />
            <path d="M75 137h350v8H75zM75 205h350v8H75z" fill="#D49AB8" />
            {Array.from({ length: 6 }, (_, i) => (
              <g key={i}>
                <rect x={88 + i * 55} y="153" width="36" height="38" rx="4" fill="#B66C98" />
                <path d={`M${106 + i * 55} 153v38`} stroke="#F9EAF2" strokeWidth="3" />
              </g>
            ))}
            <path d="M0 247h520v13H0z" fill="#B66C98" />
            <path d="M28 188c-28-35 4-72 32-52 17-34 60-15 49 17 27 16 13 52-18 52H28Z" fill="#789B7D" />
            <path d="M72 200v55" stroke="#8D6B4F" strokeWidth="10" />
            <path d="M445 193c-25-32 3-66 29-48 16-31 54-14 44 16 24 15 12 47-16 47h-57Z" fill="#789B7D" />
            <path d="M478 205v50" stroke="#8D6B4F" strokeWidth="9" />
          </svg>
        </div>
      </section>

      {/* Grid Statistik */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <StatCard label="Total kelas" value={loading ? "..." : kelas.length} icon="kelas" />
        <StatCard label="Guru aktif mengajar" value={loading ? "..." : guruUnik.size} icon="guru" />
        <StatCard label="Data nilai" value={loading ? "..." : rows.length} icon="nilai" />
        <StatCard label="Rata-rata nilai" value={loading ? "..." : rata} icon="beranda" />
      </div>

      <Box title="Menu Cepat">
        <div className="px-6 py-5 flex gap-3 flex-wrap">
          <button
            onClick={() => setNav("kelas")}
            className="px-4 py-2.5 rounded-xl border border-[#F0DCE8] text-sm font-semibold text-[#59234F] hover:bg-[#FFF0F6] transition shadow-sm"
          >
            Lihat guru per kelas
          </button>
          <button
            onClick={() => setNav("nilai")}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#70295F] to-[#913B7E] text-white text-sm font-semibold hover:from-[#5E2250] hover:to-[#7E326D] transition shadow-sm"
          >
            Unduh rekap nilai
          </button>
        </div>
        {!loading && kelas.length === 0 && <Kosong text="Belum ada data kelas. Admin perlu menambahkan kelas dulu." />}
      </Box>
    </>
  );
}

export default function KurikulumPage() {
  return (
    <DashboardShell
      role="kurikulum"
      subtitle="Dashboard Kurikulum"
      items={[
        ["beranda", "Beranda"],
        ["kelas", "Guru per Kelas"],
        ["nilai", "Rekap Nilai"],
        ["profil", "Profil"],
      ]}
      render={({ user, nav, setNav, setUser }) => (
        <>
          {nav === "beranda" && <Beranda user={user} setNav={setNav} />}
          {nav === "kelas" && <GuruPerKelas />}
          {nav === "nilai" && <RekapNilai bolehUnduh />}
          {nav === "profil" && (
            <ProfilPanel
              user={user}
              onUpdate={setUser}
              info={[
                ["Nama", user.nama],
                ["Email (Login)", user.email || "-"],
              ]}
            />
          )}
        </>
      )}
    />
  );
}
