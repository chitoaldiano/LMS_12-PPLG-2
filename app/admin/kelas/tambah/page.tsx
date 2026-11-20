"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Guru = {
  _id: string;
  nama: string;
};

type FormState = {
  namaKelas: string;
  waliKelas: string;
  jurusan: string;
  tahunAjaran: string;
  tingkat: string;
  kapasitas: string;
};

export default function TambahKelasPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    namaKelas: "",
    waliKelas: "",
    jurusan: "",
    tahunAjaran: "",
    tingkat: "X",
    kapasitas: "",
  });
  const [daftarGuru, setDaftarGuru] = useState<Guru[]>([]);
  const [isLoadingGuru, setIsLoadingGuru] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let aktif = true;

    async function ambilGuru() {
      try {
        const res = await fetch("/api/users?role=guru");
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.message || "Daftar guru tidak dapat dimuat");
        }

        if (aktif) setDaftarGuru(Array.isArray(result.data) ? result.data : []);
      } catch {
        if (aktif) setErrorMsg("Daftar guru gagal dimuat. Muat ulang halaman atau periksa koneksi server.");
      } finally {
        if (aktif) setIsLoadingGuru(false);
      }
    }

    ambilGuru();
    return () => {
      aktif = false;
    };
  }, []);

  function ubahForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    if (!form.waliKelas) {
      setErrorMsg("Pilih wali kelas terlebih dahulu.");
      return;
    }

    if (!form.kapasitas || Number(form.kapasitas) < 1) {
      setErrorMsg("Kapasitas siswa minimal 1.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: {
        namaKelas: string;
        tingkat: string;
        jurusan: string;
        tahunAjaran: string;
        kapasitas: number;
        waliKelas?: string;
      } = {
        namaKelas: form.namaKelas.trim(),
        tingkat: form.tingkat,
        jurusan: form.jurusan.trim(),
        tahunAjaran: form.tahunAjaran.trim(),
        kapasitas: Number(form.kapasitas),
      };

      if (form.waliKelas) payload.waliKelas = form.waliKelas;

      const res = await fetch("/api/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setErrorMsg(result.message || "Gagal menambah kelas");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin#kelola-kelas");
    } catch {
      setErrorMsg("Tidak bisa terhubung ke server");
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "block w-full min-w-0 max-w-full rounded-xl border border-[#E9C9D9] bg-white px-4 py-3 text-sm text-[#552044] outline-none transition placeholder:text-[#B78DA6] focus:border-[#B64D83] focus:ring-4 focus:ring-[#F7E3ED]";

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#FBF6F9] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto w-full max-w-[1440px] min-w-0">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mb-5 inline-flex max-w-full items-center gap-2 rounded-lg text-sm font-medium text-[#8A6680] transition hover:text-[#702653]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          <span className="truncate">Kembali ke Dashboard</span>
        </button>

        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#F0D3E1] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#A33F76]">
              <span className="h-2 w-2 rounded-full bg-[#D85B96]" />
              Administrasi kelas
            </div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#B65B8A]">
              Manajemen akademik
            </p>
            <h1 className="break-words text-2xl font-bold tracking-tight text-[#572044] sm:text-3xl">
              Tambah Kelas Baru
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#96758A]">
              Lengkapi informasi kelas, wali kelas, dan kapasitas untuk menambahkan kelas baru ke LMS SMK Citra Negara.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-[#F0D8E4] bg-white px-4 py-3 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBEAF2] text-[#A33F76]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
                <path d="M4 5.5v16M8 7h8M8 11h8" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#A9879B]">Formulir</p>
              <p className="text-sm font-semibold text-[#572044]">Data kelas baru</p>
            </div>
          </div>
        </header>

        {errorMsg && (
          <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-[#F1C5CE] bg-[#FFF1F2] px-4 py-3 text-sm text-[#A8324A]">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5m0 3h.01" />
            </svg>
            <span className="min-w-0 break-words">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-[#EFD6E2] bg-white shadow-[0_8px_28px_rgba(112,38,83,0.06)]">
            <div className="flex items-center gap-3 border-b border-[#F3E4EB] bg-gradient-to-r from-[#FFF8FB] to-white px-5 py-4 sm:px-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBEAF2] text-[#A33F76]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M8 9h.01M12 9h.01M16 9h.01" />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="break-words text-base font-bold text-[#572044]">Informasi Kelas</h2>
                <p className="mt-0.5 text-xs leading-5 text-[#A9879B]">Masukkan identitas dan detail kelas.</p>
              </div>
              <span className="ml-auto shrink-0 rounded-full bg-[#FBEAF2] px-3 py-1 text-[11px] font-bold text-[#A33F76]">01</span>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
              <Field label="Nama Kelas" required>
                <input
                  required
                  value={form.namaKelas}
                  onChange={(e) => ubahForm("namaKelas", e.target.value)}
                  placeholder="Contoh: X PPLG 1"
                  className={inputClass}
                />
              </Field>

              <Field label="Wali Kelas" required>
                <select
                  required
                  value={form.waliKelas}
                  onChange={(e) => ubahForm("waliKelas", e.target.value)}
                  className={inputClass}
                  disabled={isLoadingGuru}
                >
                  <option value="">{isLoadingGuru ? "Memuat daftar guru..." : "Pilih wali kelas"}</option>
                  {daftarGuru.map((guru) => (
                    <option key={guru._id} value={guru._id}>{guru.nama}</option>
                  ))}
                </select>
                {!isLoadingGuru && daftarGuru.length === 0 && (
                  <p className="mt-1.5 text-xs leading-5 text-[#B65B8A]">Belum ada data guru. Tambahkan guru terlebih dahulu.</p>
                )}
              </Field>

              <Field label="Jurusan" required>
                <input
                  required
                  value={form.jurusan}
                  onChange={(e) => ubahForm("jurusan", e.target.value)}
                  placeholder="Contoh: PPLG"
                  className={inputClass}
                />
              </Field>

              <Field label="Tahun Ajaran" required>
                <input
                  required
                  value={form.tahunAjaran}
                  onChange={(e) => ubahForm("tahunAjaran", e.target.value)}
                  placeholder="Contoh: 2026/2027"
                  className={inputClass}
                />
              </Field>

              <Field label="Tingkat" required>
                <select
                  required
                  value={form.tingkat}
                  onChange={(e) => ubahForm("tingkat", e.target.value)}
                  className={inputClass}
                >
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
              </Field>

              <Field label="Kapasitas Siswa" required>
                <div className="relative min-w-0">
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.kapasitas}
                    onChange={(e) => ubahForm("kapasitas", e.target.value)}
                    placeholder="Contoh: 36"
                    className={`${inputClass} pr-20`}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#A9879B]">
                    siswa
                  </span>
                </div>
              </Field>
            </div>
          </section>

          <aside className="min-w-0 space-y-5">
            <section className="overflow-hidden rounded-2xl border border-[#EFD6E2] bg-white shadow-[0_8px_28px_rgba(112,38,83,0.06)]">
              <div className="border-b border-[#F3E4EB] px-5 py-4">
                <h2 className="text-sm font-bold text-[#572044]">Ringkasan Kelas</h2>
                <p className="mt-1 text-xs leading-5 text-[#A9879B]">Pratinjau data yang sedang diisi.</p>
              </div>
              <div className="space-y-4 p-5">
                <div className="rounded-xl bg-gradient-to-br from-[#FCEBF3] to-[#FFF7FA] p-4">
                  <p className="text-xs font-medium text-[#A16B89]">Nama kelas</p>
                  <p className="mt-1 break-words text-xl font-bold text-[#702653]">
                    {form.namaKelas.trim() || "Nama kelas"}
                  </p>
                  <p className="mt-1 text-xs text-[#A9879B]">
                    {form.jurusan.trim() || "Jurusan"} · Tingkat {form.tingkat}
                  </p>
                </div>
                <SummaryRow label="Wali kelas" value={daftarGuru.find((g) => g._id === form.waliKelas)?.nama || "Belum dipilih"} />
                <SummaryRow label="Tahun ajaran" value={form.tahunAjaran || "Belum diisi"} />
                <SummaryRow label="Kapasitas" value={form.kapasitas ? `${form.kapasitas} siswa` : "Belum diisi"} />
              </div>
            </section>

            <section className="rounded-2xl border border-[#EFD6E2] bg-gradient-to-br from-[#702653] to-[#963D70] p-5 text-white shadow-[0_8px_28px_rgba(112,38,83,0.12)]">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5m0-8h.01" />
                </svg>
                <h2 className="text-sm font-semibold">Catatan</h2>
              </div>
              <p className="mt-2 text-xs leading-5 text-white/80">
                Pastikan wali kelas sudah terdaftar sebagai guru dan kapasitas sesuai kebutuhan kelas sebelum menyimpan data.
              </p>
            </section>
          </aside>

          <div className="flex min-w-0 flex-col-reverse gap-3 border-t border-[#EFD6E2] pt-5 sm:flex-row sm:justify-end xl:col-span-2">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="inline-flex items-center justify-center rounded-xl border border-[#E8C9D9] bg-white px-6 py-3 text-sm font-semibold text-[#81536D] transition hover:bg-[#FFF4F8]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingGuru || daftarGuru.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#702653] to-[#A23E78] px-7 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(112,38,83,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Kelas"}
              {!isSubmitting && (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block break-words text-sm font-semibold text-[#572044]">
        {label} {required && <span className="text-[#D45A91]">*</span>}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 border-b border-[#F4E8EE] pb-3 last:border-0 last:pb-0">
      <span className="shrink-0 text-xs text-[#A9879B]">{label}</span>
      <span className="min-w-0 break-words text-right text-xs font-semibold text-[#572044]">{value}</span>
    </div>
  );
}
