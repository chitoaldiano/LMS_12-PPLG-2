"use client";

import { useEffect, useState } from "react";
import DashboardShell, { Box, Kosong, StatCard, Bar, ambilData } from "@/components/DashboardShell";
import ProfilPanel from "@/components/ProfilPanel";
import { RekapNilai, GuruPerKelas } from "@/components/Laporan";

// Rata-rata nilai dikelompokkan berdasarkan salah satu kolom (jurusan / mataPelajaran)
function rataPer(rows: any[], kolom: string) {
  const grup: Record<string, { total: number; jumlah: number }> = {};
  rows.forEach((r) => {
    const k = r[kolom] || "-";
    if (!grup[k]) grup[k] = { total: 0, jumlah: 0 };
    grup[k].total += r.nilai;
    grup[k].jumlah += 1;
  });
  return Object.entries(grup)
    .map(([label, g]) => ({ label, rata: Math.round((g.total / g.jumlah) * 10) / 10, jumlah: g.jumlah }))
    .sort((a, b) => b.rata - a.rata);
}

function Beranda({ user }: { user: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [kelas, setKelas] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ambilData("/api/users"),
      ambilData("/api/laporan?jenis=guru-kelas"),
      ambilData("/api/laporan?jenis=rekap-nilai"),
    ]).then(([u, k, r]) => {
      setUsers(u);
      setKelas(k);
      setRows(r);
      setLoading(false);
    });
  }, []);

  const jmlGuru = users.filter((u) => u.role === "guru").length;
  const jmlSiswa = users.filter((u) => u.role === "siswa").length;
  const rata = rows.length ? Math.round((rows.reduce((a, r) => a + r.nilai, 0) / rows.length) * 10) / 10 : "-";
  const perJurusan = rataPer(rows, "jurusan");
  const perMapel = rataPer(rows, "mataPelajaran").slice(0, 8);

  return (
    <>
      {/* Hero Banner Kepsek */}
      <section className="relative mb-5 min-h-[190px] sm:min-h-[230px] w-full overflow-hidden rounded-[26px] border border-[#F1CFE0] bg-gradient-to-r from-[#FCE5F0] via-[#F8D8E8] to-[#E9BBD4] shadow-[0_8px_28px_rgba(91,31,75,0.07)] lg:min-h-[245px]">
        <div className="relative z-10 box-border w-full md:w-[60%] lg:w-[58%] min-w-0 px-5 py-6 sm:px-8 lg:px-9 lg:py-8">
          <span className="inline-flex items-center rounded-full bg-[#70295F] text-white px-3 py-1 text-[10px] font-bold tracking-wider">
            RUANG KEPALA SEKOLAH
          </span>
          <h1 className="text-2xl sm:text-3xl xl:text-[38px] leading-tight font-extrabold text-[#572047] mt-3">
            Halo, {user?.nama ? user.nama.split(" ")[0] : "Kepala Sekolah"}!<br />Pantau kemajuan SMK Citra Negara.
          </h1>
          <p className="text-xs sm:text-sm xl:text-base text-[#81506F] mt-2 sm:mt-3 leading-relaxed max-w-[560px]">
            Ringkasan data guru, siswa, kelas, dan evaluasi hasil belajar di seluruh jurusan SMK Citra Negara.
          </p>
          <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-[#70295F]">
            <span className="w-2 h-2 rounded-full bg-[#D94383]" /> Kepala Sekolah · SMK Citra Negara
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
        <StatCard label="Total guru" value={loading ? "..." : jmlGuru} icon="guru" />
        <StatCard label="Total siswa" value={loading ? "..." : jmlSiswa} icon="siswa" />
        <StatCard label="Total kelas" value={loading ? "..." : kelas.length} icon="kelas" />
        <StatCard label="Rata-rata nilai" value={loading ? "..." : rata} icon="nilai" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Box title="Rata-rata Nilai per Jurusan">
          <div className="px-6 py-5">
            {loading ? (
              <p className="text-sm text-[#B596AA]">Memuat...</p>
            ) : perJurusan.length === 0 ? (
              <p className="text-sm text-[#B596AA]">Belum ada data nilai.</p>
            ) : (
              perJurusan.map((d) => <Bar key={d.label} label={d.label} value={d.rata} extra={`${d.jumlah} data`} />)
            )}
          </div>
        </Box>

        <Box title="Rata-rata Nilai per Mata Pelajaran">
          <div className="px-6 py-5">
            {loading ? (
              <p className="text-sm text-[#B596AA]">Memuat...</p>
            ) : perMapel.length === 0 ? (
              <p className="text-sm text-[#B596AA]">Belum ada data nilai.</p>
            ) : (
              perMapel.map((d) => <Bar key={d.label} label={d.label} value={d.rata} extra={`${d.jumlah} data`} />)
            )}
          </div>
        </Box>
      </div>
    </>
  );
}

function AktivitasGuru() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ambilData("/api/laporan?jenis=aktivitas-guru").then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  return (
    <Box title="Aktivitas Guru">
      <p className="px-6 py-3 text-xs text-[#81506F] border-b border-[#F0DCE8] bg-[#FFF9FC]">
        Jumlah materi, tugas, kuis, dan nilai manual yang sudah dibuat tiap guru.
      </p>
      {loading ? (
        <Kosong text="Memuat..." />
      ) : data.length === 0 ? (
        <Kosong text="Belum ada guru terdaftar." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#70295F] bg-[#FFF7FB] border-b border-[#F0DCE8]">
                <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Nama</th>
                <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-wider">Mata Pelajaran</th>
                <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-wider text-right">Materi</th>
                <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-wider text-right">Tugas</th>
                <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-wider text-right">Kuis</th>
                <th className="px-4 py-3.5 font-bold text-xs uppercase tracking-wider text-right">Nilai</th>
                <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((g) => {
                const kosong = g.materi + g.tugas + g.kuis + g.nilai === 0;
                return (
                  <tr key={g._id} className="border-b border-[#F9EAF2] last:border-0 hover:bg-[#FFF7FB] transition">
                    <td className="px-6 py-3.5">
                      <p className="text-[#59234F] font-semibold">{g.nama}</p>
                      <p className="text-xs text-[#B596AA]">{g.email || "-"}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[#81506F]">{g.mataPelajaran.join(", ") || "-"}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#59234F]">{g.materi}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#59234F]">{g.tugas}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#59234F]">{g.kuis}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#59234F]">{g.nilai}</td>
                    <td className="px-6 py-3.5">
                      {kosong ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-semibold">
                          Belum ada aktivitas
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-semibold">
                          Aktif
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Box>
  );
}

export default function KepsekPage() {
  return (
    <DashboardShell
      role="kepsek"
      subtitle="Dashboard Kepala Sekolah"
      items={[
        ["beranda", "Beranda"],
        ["guru", "Aktivitas Guru"],
        ["kelas", "Data Kelas"],
        ["nilai", "Rekap Nilai"],
        ["profil", "Profil"],
      ]}
      render={({ user, nav, setNav, setUser }) => (
        <>
          {nav === "beranda" && <Beranda user={user} />}
          {nav === "guru" && <AktivitasGuru />}
          {nav === "kelas" && <GuruPerKelas />}
          {nav === "nilai" && <RekapNilai />}
          {nav === "profil" && (
            <ProfilPanel
              user={user}
              onUpdate={setUser}
              info={[
                ["Nama", user.nama],
                ["NIP (Login)", user.nip || "-"],
              ]}
            />
          )}
        </>
      )}
    />
  );
}
