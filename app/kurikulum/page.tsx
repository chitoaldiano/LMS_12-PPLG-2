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
      <h1 className="text-2xl font-bold text-[#0F1B33]">Halo, {user.nama}!</h1>
      <p className="text-sm text-[#6B7280] mt-1 mb-8">Pantau pengajar per kelas dan rekap nilai sekolah.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total kelas" value={loading ? "..." : kelas.length} />
        <StatCard label="Guru aktif mengajar" value={loading ? "..." : guruUnik.size} />
        <StatCard label="Data nilai" value={loading ? "..." : rows.length} />
        <StatCard label="Rata-rata nilai" value={loading ? "..." : rata} />
      </div>

      <Box title="Menu Cepat">
        <div className="px-6 py-5 flex gap-3 flex-wrap">
          <button
            onClick={() => setNav("kelas")}
            className="px-4 py-2 rounded-lg border border-[#D8D3C8] text-sm font-medium text-[#1F2430] hover:bg-[#F5F3EE] transition"
          >
            Lihat guru per kelas
          </button>
          <button
            onClick={() => setNav("nilai")}
            className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition"
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