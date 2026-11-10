"use client";

import { useState } from "react";
import { Box } from "./DashboardShell";

const inputCls =
  "w-full mt-1 px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]";

// info = data yang cuma bisa diubah Admin, contoh: [["Nama", "Budi"], ["NIP", "1234"]]
export default function ProfilPanel({
  user,
  onUpdate,
  info,
}: {
  user: any;
  onUpdate: (u: any) => void;
  info: [string, string][];
}) {
  const [form, setForm] = useState({
    noTelepon: user.noTelepon || "",
    alamat: user.alamat || "",
    foto: user.foto || "",
  });
  const [saving, setSaving] = useState(false);
  const [pesan, setPesan] = useState("");

  function pilihFoto(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPesan("File harus berupa gambar");
    if (file.size > 2 * 1024 * 1024) return setPesan("Ukuran foto maksimal 2MB");
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, foto: String(reader.result) }));
      setPesan("");
    };
    reader.readAsDataURL(file);
  }

  async function simpan() {
    setSaving(true);
    setPesan("");
    try {
      const r = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then((x) => x.json());

      if (r.success) {
        const userBaru = { ...user, ...form };
        localStorage.setItem("lms_user", JSON.stringify(userBaru));
        onUpdate(userBaru);
        setPesan("Profil berhasil disimpan");
      } else {
        setPesan(r.message || "Gagal menyimpan profil");
      }
    } catch {
      setPesan("Tidak bisa terhubung ke server");
    }
    setSaving(false);
  }

  return (
    <Box title="Profil Saya">
      <div className="px-6 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-[#0F1B33] text-[#C6992F] text-2xl font-bold flex items-center justify-center overflow-hidden shrink-0">
            {form.foto ? <img src={form.foto} alt="" className="w-full h-full object-cover" /> : user.nama?.[0]?.toUpperCase()}
          </div>
          <div>
            <label className="inline-block px-3 py-1.5 rounded-lg border border-[#D8D3C8] text-xs font-medium text-[#1F2430] cursor-pointer hover:bg-[#F5F3EE] transition">
              Ganti Foto
              <input type="file" accept="image/*" onChange={pilihFoto} className="hidden" />
            </label>
            <p className="text-[11px] text-[#9CA3AF] mt-1">JPG/PNG, maks 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {info.map(([label, nilai]) => (
            <div key={label}>
              <label className="text-xs font-medium text-[#6B7280]">{label}</label>
              <p className="text-sm text-[#0F1B33] font-medium mt-1">{nilai}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#9CA3AF] mb-4">
          Data di atas cuma bisa diubah oleh Admin. Kamu bisa ubah data di bawah ini sendiri:
        </p>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-medium text-[#6B7280]">No. Telepon</label>
            <input value={form.noTelepon} onChange={(e) => setForm({ ...form, noTelepon: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B7280]">Alamat</label>
            <textarea rows={3} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className={inputCls} />
          </div>
          <button
            onClick={simpan}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          {pesan && <p className="text-xs text-[#6B7280]">{pesan}</p>}
        </div>
      </div>
    </Box>
  );
}