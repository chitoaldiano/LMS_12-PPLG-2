"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TambahSiswaPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nama: "",
    nis: "",
    kelas: "",
    jurusan: "",
    noTelepon: "",
    jenisKelamin: "",
    alamat: "",
    email: "",
    username: "",
    password: "",
    status: "Aktif",
  });
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoBase64, setFotoBase64] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleUploadFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("Ukuran foto maksimal 20MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFotoPreview(reader.result);
      setFotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      // Username otomatis dibuat dari NIS kalau belum diisi manual
      const usernameFinal = form.username || form.nis;

      const payload = {
        nama: form.nama,
        username: usernameFinal,
        email: form.email,
        password: form.password,
        role: "siswa",
        nis: form.nis,
        kelas: form.kelas,
        jurusan: form.jurusan,
        noTelepon: form.noTelepon,
        jenisKelamin: form.jenisKelamin,
        alamat: form.alamat,
        status: form.status,
        foto: fotoBase64,
      };

      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!result.success) {
        setErrorMsg(result.message || "Gagal menambah siswa");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin#daftar-user");
    } catch (err) {
      setErrorMsg("Tidak bisa terhubung ke server");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE] px-8 py-8">
      {/* Breadcrumb + kembali */}
      <button
        onClick={() => router.push("/admin")}
        className="flex items-center gap-3 text-sm text-[#6B7280] mb-6 hover:text-[#0F1B33] transition"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Siswa &gt; Tambah Siswa
      </button>

      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-[#0F1B33]">Tambah Siswa Baru</h1>
        <p className="text-sm text-[#6B7280] mt-1 mb-8">Form data siswa</p>

        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm max-w-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-10 flex-wrap">
          {/* Upload foto */}
          <div className="shrink-0">
            <label className="cursor-pointer block">
              <div className="w-40 h-40 rounded-xl bg-white border border-[#D8D3C8] flex flex-col items-center justify-center relative overflow-hidden">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-[#9CA3AF]" fill="currentColor">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                    </svg>
                    <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-[#0F1B33] text-white flex items-center justify-center text-sm">
                      +
                    </div>
                  </>
                )}
              </div>
              <input type="file" accept="image/jpeg,image/png" onChange={handleUploadFoto} className="hidden" />
            </label>
            <p className="text-xs font-medium text-[#1F2430] mt-2 text-center">Upload Foto</p>
            <p className="text-[11px] text-[#9CA3AF] text-center">JPG, PNG, maksimal 20mb</p>
          </div>

          {/* Kolom 1 */}
          <div className="flex-1 min-w-[240px] space-y-5">
            <Field label="Nama Lengkap" required>
              <input required placeholder="Masukkan Nama Lengkap Anda" value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>

            <Field label="NIS" required>
              <input required placeholder="Masukkan NIS Anda" value={form.nis}
                onChange={(e) => setForm({ ...form, nis: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>

            <Field label="Kelas" required>
              <input required placeholder="Contoh: X PPLG 1" value={form.kelas}
                onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>

            <Field label="Jurusan" required>
              <input required placeholder="Contoh: PPLG" value={form.jurusan}
                onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>

            <Field label="Email">
              <input type="email" placeholder="Masukkan Email Anda" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>

            <Field label="Status" required>
              <select required value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]">
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </Field>
          </div>

          {/* Kolom 2 */}
          <div className="flex-1 min-w-[240px] space-y-5">
            <Field label="No. Telepon" required>
              <input required placeholder="Masukkan No. Telepon Anda" value={form.noTelepon}
                onChange={(e) => setForm({ ...form, noTelepon: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>

            <Field label="Jenis Kelamin" required>
              <select required value={form.jenisKelamin} onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]">
                <option value="">Pilih Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </Field>

            <Field label="Alamat" required>
              <textarea required rows={3} placeholder="Masukkan Alamat Lengkap Anda" value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>

            <Field label="Username (opsional, default: NIS)">
              <input placeholder="Kosongkan jika ingin memakai NIS" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>

            <Field label="Password" required>
              <input type="password" required placeholder="Masukkan Password Anda" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
            </Field>
          </div>

          {/* Tombol aksi */}
          <div className="w-full flex justify-end gap-3 pt-4">
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
