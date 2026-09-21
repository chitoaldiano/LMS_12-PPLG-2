"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TambahKelasPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    namaKelas: "",
    waliKelas: "",
    jurusan: "",
    tahunAjaran: "",
    tingkat: "X",
    kapasitas: "",
  });
  const [daftarGuru, setDaftarGuru] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/users?role=guru")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setDaftarGuru(result.data);
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const payload = {
        namaKelas: form.namaKelas,
        tingkat: form.tingkat,
        jurusan: form.jurusan,
        tahunAjaran: form.tahunAjaran,
        kapasitas: form.kapasitas ? Number(form.kapasitas) : undefined,
      };
      if (form.waliKelas) payload.waliKelas = form.waliKelas;

      const res = await fetch("/api/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!result.success) {
        setErrorMsg(result.message || "Gagal menambah kelas");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin#kelola-kelas");
    } catch (err) {
      setErrorMsg("Tidak bisa terhubung ke server");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE] px-8 py-8">
      <button
        onClick={() => router.push("/admin")}
        className="flex items-center gap-3 text-sm text-[#6B7280] mb-6 hover:text-[#0F1B33] transition"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Kelas &gt; Tambah Kelas
      </button>

      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-[#0F1B33]">Tambah Kelas Baru</h1>
        <p className="text-sm text-[#6B7280] mt-1 mb-8">Form data kelas</p>

        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <Field label="Nama Kelas" required>
              <input required placeholder="Contoh: X PPLG 1" value={form.namaKelas}
                onChange={(e) => setForm({ ...form, namaKelas: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>

            <Field label="Wali Kelas" required>
              <select required value={form.waliKelas} onChange={(e) => setForm({ ...form, waliKelas: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]">
                <option value="">Pilih wali kelas</option>
                {daftarGuru.map((g) => (
                  <option key={g._id} value={g._id}>{g.nama}</option>
                ))}
              </select>
            </Field>

            <Field label="Jurusan" required>
              <input required placeholder="Contoh: PPLG" value={form.jurusan}
                onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>

            <Field label="Tahun Ajaran" required>
              <input required placeholder="Contoh: 2026/2027" value={form.tahunAjaran}
                onChange={(e) => setForm({ ...form, tahunAjaran: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>

            <Field label="Tingkat" required>
              <select required value={form.tingkat} onChange={(e) => setForm({ ...form, tingkat: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]">
                <option value="X">X</option>
                <option value="XI">XI</option>
                <option value="XII">XII</option>
              </select>
            </Field>

            <Field label="Kapasitas Siswa" required>
              <input required type="number" min="1" placeholder="Contoh: 36" value={form.kapasitas}
                onChange={(e) => setForm({ ...form, kapasitas: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-8">
            <button type="button" onClick={() => router.push("/admin")}
              className="px-6 py-2.5 rounded-lg bg-[#E8E5DC] text-[#1F2430] text-sm font-semibold hover:bg-[#DDD9CC] transition">
              Batal Simpan
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#0F1B33] text-white text-sm font-semibold hover:bg-[#C6992F] hover:text-[#0F1B33] transition disabled:opacity-60">
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1F2430] mb-1.5">
        {label} {required && <span className="text-[#C6992F]">*</span>}
      </label>
      {children}
    </div>
  );
}