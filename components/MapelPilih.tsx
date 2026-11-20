"use client";

// Pemilih mata pelajaran (bisa pilih lebih dari satu) dari daftar yang dibuat Admin.
// Nilainya tetap berupa teks dipisah koma ("Matematika, Fisika"), jadi kode form yang lama tidak perlu diubah.
// Kalau Admin belum membuat daftar mapel sama sekali, tampil input teks biasa seperti sebelumnya.

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-[#E8D5E1] bg-white text-sm text-[#59234F] focus:outline-none focus:ring-2 focus:ring-[#D94383] transition";

export default function MapelPilih({
  value,
  onChange,
  daftar,
}: {
  value: string;
  onChange: (v: string) => void;
  daftar: string[];
}) {
  const terpilih = value
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  if (daftar.length === 0) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Contoh: Matematika, Fisika"
        className={inputCls}
      />
    );
  }

  function toggle(nama: string) {
    const baru = terpilih.includes(nama) ? terpilih.filter((m) => m !== nama) : [...terpilih, nama];
    onChange(baru.join(", "));
  }

  // Mapel lama milik guru yang tidak ada di daftar resmi tetap ditampilkan (supaya tidak hilang diam-diam)
  const tambahan = terpilih.filter((m) => !daftar.includes(m));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[...daftar, ...tambahan].map((nama) => {
          const aktif = terpilih.includes(nama);
          return (
            <button
              type="button"
              key={nama}
              onClick={() => toggle(nama)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                aktif
                  ? "bg-[#70295F] text-white border-[#70295F] shadow-sm"
                  : "bg-white text-[#81506F] border-[#E8D5E1] hover:border-[#D94383] hover:text-[#70295F]"
              }`}
            >
              {nama}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-[#B596AA] mt-1.5">
        Klik untuk memilih, bisa lebih dari satu. Belum ada di daftar? Tambahkan dulu di menu Mata Pelajaran.
      </p>
    </div>
  );
}
