"use client";

import { useEffect, useState } from "react";
import { Box, Kosong, StatCard, ambilData } from "./DashboardShell";

const selectCls =
  "w-full px-3 py-2 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]";

const JENIS_LABEL: Record<string, string> = {
  tugas: "Tugas",
  kuis: "Kuis",
  ujian_online: "Ujian Online",
  penilaian_manual: "Penilaian Manual",
};

const fmtTanggal = (d: any) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort();
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// =====================================================================
// REKAP NILAI: gabungan nilai manual + nilai tugas + skor kuis
// =====================================================================
export function RekapNilai({ bolehUnduh = false }: { bolehUnduh?: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ kelas: "", mapel: "", guru: "", jurusan: "", jenis: "" });

  useEffect(() => {
    ambilData("/api/laporan?jenis=rekap-nilai").then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, []);

  const opsiKelas = uniq(rows.map((r) => r.kelas));
  const opsiMapel = uniq(rows.map((r) => r.mataPelajaran));
  const opsiJurusan = uniq(rows.map((r) => r.jurusan));
  const opsiGuru: [string, string][] = Array.from(
    new Map<string, string>(rows.filter((r) => r.guruId).map((r) => [r.guruId, r.guru] as [string, string])).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const tampil = rows.filter(
    (r) =>
      (!f.kelas || r.kelas === f.kelas) &&
      (!f.mapel || r.mataPelajaran === f.mapel) &&
      (!f.guru || r.guruId === f.guru) &&
      (!f.jurusan || r.jurusan === f.jurusan) &&
      (!f.jenis || r.jenis === f.jenis)
  );

  const n = tampil.length;
  const rata = n ? Math.round((tampil.reduce((a, r) => a + r.nilai, 0) / n) * 10) / 10 : "-";
  const tertinggi = n ? Math.max(...tampil.map((r) => r.nilai)) : "-";
  const terendah = n ? Math.min(...tampil.map((r) => r.nilai)) : "-";
  const BATAS = 300;

  function unduhCsv() {
    const header = ["Siswa", "Kelas", "Jurusan", "Mata Pelajaran", "Guru", "Jenis", "Judul", "Nilai", "Tanggal"];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const baris = tampil.map((r) => [
      r.siswa,
      r.kelas,
      r.jurusan,
      r.mataPelajaran,
      r.guru,
      JENIS_LABEL[r.jenis] || r.jenis,
      r.judul,
      r.nilai,
      fmtTanggal(r.tanggal),
    ]);
    // "\uFEFF" biar Excel membaca huruf dengan benar
    const csv = "\uFEFF" + [header, ...baris].map((b) => b.map(esc).join(",")).join("\r\n");

    const namaGuru = opsiGuru.find(([id]) => id === f.guru)?.[1] || "";
    const nama = ["rekap-nilai", slug(f.mapel), slug(namaGuru), slug(f.kelas)].filter(Boolean).join("-") + ".csv";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nama;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <Box
        title="Rekap Nilai"
        action={
          bolehUnduh ? (
            <button
              onClick={unduhCsv}
              disabled={n === 0}
              className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition disabled:opacity-40"
            >
              Unduh CSV ({n})
            </button>
          ) : undefined
        }
      >
        <div className="px-6 py-4 border-b border-[#E5E0D5] bg-[#FAF8F3] grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] mb-1">Kelas</label>
            <select value={f.kelas} onChange={(e) => setF({ ...f, kelas: e.target.value })} className={selectCls}>
              <option value="">Semua</option>
              {opsiKelas.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] mb-1">Mata Pelajaran</label>
            <select value={f.mapel} onChange={(e) => setF({ ...f, mapel: e.target.value })} className={selectCls}>
              <option value="">Semua</option>
              {opsiMapel.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] mb-1">Guru</label>
            <select value={f.guru} onChange={(e) => setF({ ...f, guru: e.target.value })} className={selectCls}>
              <option value="">Semua</option>
              {opsiGuru.map(([id, nama]) => <option key={id} value={id}>{nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] mb-1">Jurusan</label>
            <select value={f.jurusan} onChange={(e) => setF({ ...f, jurusan: e.target.value })} className={selectCls}>
              <option value="">Semua</option>
              {opsiJurusan.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] mb-1">Jenis</label>
            <select value={f.jenis} onChange={(e) => setF({ ...f, jenis: e.target.value })} className={selectCls}>
              <option value="">Semua</option>
              {Object.entries(JENIS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-[#E5E0D5]">
          <StatCard label="Jumlah data" value={n} />
          <StatCard label="Rata-rata" value={rata} />
          <StatCard label="Tertinggi" value={tertinggi} />
          <StatCard label="Terendah" value={terendah} />
        </div>

        {loading ? (
          <Kosong text="Memuat..." />
        ) : n === 0 ? (
          <Kosong text="Belum ada nilai yang cocok dengan filter ini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#9CA3AF] border-b border-[#E5E0D5]">
                  <th className="px-6 py-3 font-medium">Siswa</th>
                  <th className="px-4 py-3 font-medium">Kelas</th>
                  <th className="px-4 py-3 font-medium">Mapel</th>
                  <th className="px-4 py-3 font-medium">Guru</th>
                  <th className="px-4 py-3 font-medium">Jenis</th>
                  <th className="px-4 py-3 font-medium">Judul</th>
                  <th className="px-4 py-3 font-medium text-right">Nilai</th>
                  <th className="px-6 py-3 font-medium">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {tampil.slice(0, BATAS).map((r) => (
                  <tr key={r.id} className="border-b border-[#F0EDE3] last:border-0">
                    <td className="px-6 py-3 text-[#1F2430] font-medium">{r.siswa}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{r.kelas}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{r.mataPelajaran}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{r.guru}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{JENIS_LABEL[r.jenis] || r.jenis}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{r.judul || "-"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#0F1B33]">{r.nilai}</td>
                    <td className="px-6 py-3 text-[#6B7280] whitespace-nowrap">{fmtTanggal(r.tanggal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {n > BATAS && (
              <p className="px-6 py-3 text-xs text-[#9CA3AF]">
                Menampilkan {BATAS} dari {n} data. Persempit dengan filter{bolehUnduh ? ", atau unduh CSV untuk data lengkap" : ""}.
              </p>
            )}
          </div>
        )}
      </Box>
    </div>
  );
}

// =====================================================================
// GURU PER KELAS
// =====================================================================
export function GuruPerKelas() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pilih, setPilih] = useState("");

  useEffect(() => {
    ambilData("/api/laporan?jenis=guru-kelas").then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const tampil = pilih ? data.filter((k) => k.kelas === pilih) : data;

  return (
    <div className="space-y-5">
      <Box
        title="Guru per Kelas"
        action={
          <select value={pilih} onChange={(e) => setPilih(e.target.value)} className={selectCls + " !w-auto"}>
            <option value="">Semua kelas</option>
            {data.map((k) => <option key={k._id} value={k.kelas}>{k.kelas}</option>)}
          </select>
        }
      >
        <p className="px-6 py-3 text-xs text-[#9CA3AF] border-b border-[#E5E0D5]">
          Daftar guru dihitung otomatis dari guru yang pernah membuat materi, tugas, kuis, atau nilai untuk kelas tersebut.
        </p>
        {loading ? (
          <Kosong text="Memuat..." />
        ) : data.length === 0 ? (
          <Kosong text="Belum ada kelas. Admin bisa menambahkannya di menu Kelas." />
        ) : (
          tampil.map((k) => (
            <div key={k._id} className="px-6 py-5 border-b border-[#F0EDE3] last:border-0">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div>
                  <p className="font-semibold text-[#0F1B33]">{k.kelas}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Tingkat {k.tingkat} &middot; {k.jurusan} &middot; Wali kelas: {k.waliKelas || "-"}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#F5F3EE] text-[#0F1B33] text-xs font-medium">
                  {k.jumlahSiswa} siswa
                </span>
              </div>

              {k.guru.length === 0 ? (
                <p className="text-xs text-[#9CA3AF]">Belum ada guru yang tercatat mengajar di kelas ini.</p>
              ) : (
                <div className="space-y-2">
                  {k.guru.map((g: any) => (
                    <div key={g._id} className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-sm text-[#1F2430] font-medium">{g.nama}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {g.mataPelajaran.length === 0 ? (
                          <span className="text-xs text-[#9CA3AF]">-</span>
                        ) : (
                          g.mataPelajaran.map((m: string) => (
                            <span key={m} className="px-2 py-0.5 rounded-full bg-[#FAF3DF] text-[#8A6A1E] text-[11px] font-medium">
                              {m}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </Box>
    </div>
  );
}