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
      <h1 className="text-2xl font-bold text-[#0F1B33]">Halo, {user.nama}!</h1>
      <p className="text-sm text-[#6B7280] mt-1 mb-8">Ringkasan kondisi sekolah saat ini.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total guru" value={loading ? "..." : jmlGuru} />
        <StatCard label="Total siswa" value={loading ? "..." : jmlSiswa} />
        <StatCard label="Total kelas" value={loading ? "..." : kelas.length} />
        <StatCard label="Rata-rata nilai" value={loading ? "..." : rata} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Box title="Rata-rata Nilai per Jurusan">
          <div className="px-6 py-5">
            {loading ? (
              <p className="text-sm text-[#9CA3AF]">Memuat...</p>
            ) : perJurusan.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">Belum ada data nilai.</p>
            ) : (
              perJurusan.map((d) => <Bar key={d.label} label={d.label} value={d.rata} extra={`${d.jumlah} data`} />)
            )}
          </div>
        </Box>

        <Box title="Rata-rata Nilai per Mata Pelajaran">
          <div className="px-6 py-5">
            {loading ? (
              <p className="text-sm text-[#9CA3AF]">Memuat...</p>
            ) : perMapel.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">Belum ada data nilai.</p>
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
      <p className="px-6 py-3 text-xs text-[#9CA3AF] border-b border-[#E5E0D5]">
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
              <tr className="text-left text-[#9CA3AF] border-b border-[#E5E0D5]">
                <th className="px-6 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Mata Pelajaran</th>
                <th className="px-4 py-3 font-medium text-right">Materi</th>
                <th className="px-4 py-3 font-medium text-right">Tugas</th>
                <th className="px-4 py-3 font-medium text-right">Kuis</th>
                <th className="px-4 py-3 font-medium text-right">Nilai</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((g) => {
                const kosong = g.materi + g.tugas + g.kuis + g.nilai === 0;
                return (
                  <tr key={g._id} className="border-b border-[#F0EDE3] last:border-0">
                    <td className="px-6 py-3.5">
                      <p className="text-[#1F2430] font-medium">{g.nama}</p>
                      <p className="text-xs text-[#9CA3AF]">{g.email || "-"}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[#6B7280]">{g.mataPelajaran.join(", ") || "-"}</td>
                    <td className="px-4 py-3.5 text-right text-[#1F2430]">{g.materi}</td>
                    <td className="px-4 py-3.5 text-right text-[#1F2430]">{g.tugas}</td>
                    <td className="px-4 py-3.5 text-right text-[#1F2430]">{g.kuis}</td>
                    <td className="px-4 py-3.5 text-right text-[#1F2430]">{g.nilai}</td>
                    <td className="px-6 py-3.5">
                      {kosong ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">Belum ada aktivitas</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">Aktif</span>
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
      render={({ user, nav, setUser }) => (
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