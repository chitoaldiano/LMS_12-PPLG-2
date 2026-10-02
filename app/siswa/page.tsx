"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const PATHS = {
  beranda: "M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z",
  materi: "M5 4h11a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 1-1Z",
  tugas: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
  kuis: "M9 11l3 3 8-8M4 4h9M4 9h5M4 14h9M4 19h5",
  nilai: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  pengumuman: "M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1ZM16 8.5a5 5 0 0 1 0 7",
  profil: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20c0-4 3.6-6 8-6s8 2 8 6",
  logout: "M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9",
};
const NAV = [
  ["beranda", "Beranda"],
  ["materi", "Materi"],
  ["tugas", "Tugas"],
  ["kuis", "Kuis"],
  ["nilai", "Nilai"],
  ["pengumuman", "Pengumuman"],
  ["profil", "Profil"],
];

function fmtWaktu(detik) {
  if (detik == null) return "";
  const m = Math.floor(detik / 60);
  const s = detik % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
const fmt = (d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

function waktuRelatif(tanggal) {
  if (!tanggal) return "";
  const detik = Math.floor((Date.now() - new Date(tanggal).getTime()) / 1000);
  if (detik < 60) return "Baru saja";
  const menit = Math.floor(detik / 60);
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  return `${hari} hari lalu`;
}

function Ico({ k, className = "w-[18px] h-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d={PATHS[k]} />
    </svg>
  );
}
function Box({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D5] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E0D5]">
        <h2 className="font-semibold text-[#0F1B33]">{title}</h2>
      </div>
      {children}
    </div>
  );
}
const Kosong = ({ text }) => <p className="px-6 py-10 text-sm text-[#9CA3AF] text-center">{text}</p>;

function Pengumuman({ list }) {
  return list.map((p) => (
    <div key={p._id} className="px-6 py-4 border-b border-[#F0EDE3] last:border-0">
      <div className="flex items-center gap-2 mb-1">
        {p.prioritas === "penting" && (
          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-semibold">Penting</span>
        )}
        <span className="text-xs text-[#9CA3AF]">{fmt(p.createdAt)}</span>
      </div>
      <p className="font-semibold text-[#0F1B33]">{p.judul}</p>
      <p className="text-sm text-[#6B7280] mt-1 whitespace-pre-line">{p.isi}</p>
    </div>
  ));
}

export default function SiswaDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [nav, setNav] = useState("beranda");
  const [loading, setLoading] = useState(true);
  const [materi, setMateri] = useState([]);
  const [tugas, setTugas] = useState([]);
  const [nilai, setNilai] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);
  const [links, setLinks] = useState({});
  const [pesan, setPesan] = useState({});
  const [mode, setMode] = useState({}); // per tugas id: "link" atau "pdf"
  const [fileTerpilih, setFileTerpilih] = useState({}); // per tugas id: { dataUrl, namaFile }

  // ==== Kuis / Ujian Online ====
  const [kuisList, setKuisList] = useState([]);
  const [kuisAktif, setKuisAktif] = useState(null); // detail kuis yang sedang dikerjakan/dilihat
  const [hasilKuis, setHasilKuis] = useState(null); // { skor, benar, total, selesai, otomatis }
  const [sisaDetik, setSisaDetik] = useState(null);
  const kumpulkanKuisRef = useRef(() => {});

  // ==== Preview materi (PDF) ====
  const [previewMateri, setPreviewMateri] = useState(null); // id materi yang lagi dipratinjau

  // ==== Profil ====
  const [profilForm, setProfilForm] = useState({ noTelepon: "", alamat: "", foto: "" });
  const [savingProfil, setSavingProfil] = useState(false);
  const [profilPesan, setProfilPesan] = useState("");

  // ==== Notifikasi ====
  const [bellOpen, setBellOpen] = useState(false);
  const [bellExpand, setBellExpand] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("lms_user");
    if (!s) return router.push("/login");
    const u = JSON.parse(s);
    if (u.role !== "siswa") return router.push("/login");
    setUser(u);
    setProfilForm({ noTelepon: u.noTelepon || "", alamat: u.alamat || "", foto: u.foto || "" });
    muat(u);
  }, [router]);

  async function muat(u) {
    setLoading(true);
    const j = (url) => fetch(url).then((r) => r.json()).then((r) => (r.success ? r.data : [])).catch(() => []);
    const k = encodeURIComponent(u.kelas || "");
    const [m, t, n, p, q] = await Promise.all([
      j(`/api/materi?kelas=${k}`),
      j(`/api/tugas?kelas=${k}&siswa=${u._id}`),
      j(`/api/nilai?siswa=${u._id}`),
      j("/api/pengumuman?target=siswa"),
      j(`/api/kuis?kelas=${k}&siswa=${u._id}`),
    ]);
    setMateri(m); setTugas(t); setNilai(n); setPengumuman(p); setKuisList(q);
    setLoading(false);
  }

  // Mulai kerjakan kuis, atau langsung tampilkan hasil kalau sudah pernah dikerjakan
  async function mulaiKuis(k) {
    const r = await fetch(`/api/kuis/${k._id}?siswa=${user._id}`).then((x) => x.json());
    if (!r.success) return;
    const d = r.data;

    if (d.sudahDikerjakan) {
      setHasilKuis({ skor: d.skor, selesai: true });
      setSisaDetik(null);
      setKuisAktif({ ...d, jawabanSaya: d.soal.map((s) => (s.jawabanSaya != null ? s.jawabanSaya : null)) });
      return;
    }

    setHasilKuis(null);
    setKuisAktif({
      ...d,
      waktuBerakhir: Date.now() + d.durasiMenit * 60 * 1000,
      jawabanSaya: Array(d.soal.length).fill(null),
    });
  }

  function pilihJawabanKuis(i, idx) {
    if (hasilKuis?.selesai) return;
    setKuisAktif((prev) => {
      const jawabanSaya = [...prev.jawabanSaya];
      jawabanSaya[i] = idx;
      return { ...prev, jawabanSaya };
    });
  }

  async function kumpulkanKuis(otomatis = false) {
    if (!kuisAktif || hasilKuis?.selesai) return;
    const jawaban = kuisAktif.jawabanSaya.map((j) => (j == null ? -1 : j));
    const r = await fetch(`/api/kuis/${kuisAktif._id}/kumpul`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siswaId: user._id, jawaban }),
    }).then((x) => x.json());

    if (r.success) {
      setHasilKuis({ ...r.data, selesai: true, otomatis });
      setKuisAktif((prev) => ({
        ...prev,
        soal: prev.soal.map((s, i) => ({ ...s, jawabanBenar: r.data.pembahasan[i] })),
      }));
      muat(user);
    } else {
      setPesan({ ...pesan, kuis: r.message });
    }
  }

  function tutupKuis() {
    setKuisAktif(null);
    setHasilKuis(null);
    setSisaDetik(null);
  }

  useEffect(() => {
    kumpulkanKuisRef.current = kumpulkanKuis;
  });

  useEffect(() => {
    if (!kuisAktif || hasilKuis?.selesai) return;
    const tick = () => {
      const sisa = Math.max(0, Math.round((kuisAktif.waktuBerakhir - Date.now()) / 1000));
      setSisaDetik(sisa);
      if (sisa <= 0) {
        clearInterval(interval);
        kumpulkanKuisRef.current(true);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kuisAktif?._id]);

  function pilihFile(t, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setPesan({ ...pesan, [t._id]: "File harus berformat PDF" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPesan({ ...pesan, [t._id]: "Ukuran PDF maksimal 10MB" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFileTerpilih({ ...fileTerpilih, [t._id]: { dataUrl: reader.result, namaFile: file.name } });
      setPesan({ ...pesan, [t._id]: "" });
    };
    reader.readAsDataURL(file);
  }

  async function kumpul(t) {
    const modeAktif = mode[t._id] || "link";
    let payload;

    if (modeAktif === "pdf") {
      const dipilih = fileTerpilih[t._id];
      if (!dipilih) return setPesan({ ...pesan, [t._id]: "Pilih file PDF dulu" });
      payload = { siswaId: user._id, fileUrl: dipilih.dataUrl, namaFile: dipilih.namaFile, tipe: "pdf" };
    } else {
      const fileUrl = (links[t._id] || "").trim();
      if (!fileUrl) return setPesan({ ...pesan, [t._id]: "Isi link tugas dulu" });
      payload = { siswaId: user._id, fileUrl, tipe: "link" };
    }

    const r = await fetch(`/api/tugas/${t._id}/kumpul`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((x) => x.json());

    setPesan({ ...pesan, [t._id]: r.success ? "Tugas berhasil dikumpulkan" : r.message });
    if (r.success) {
      setLinks({ ...links, [t._id]: "" });
      setFileTerpilih({ ...fileTerpilih, [t._id]: null });
      muat(user);
    }
  }

  function logout() {
    localStorage.removeItem("lms_user");
    router.push("/login");
  }

  function pilihFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfilPesan("File harus berupa gambar");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfilPesan("Ukuran foto maksimal 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfilForm((f) => ({ ...f, foto: reader.result }));
      setProfilPesan("");
    };
    reader.readAsDataURL(file);
  }

  async function simpanProfil() {
    setSavingProfil(true);
    setProfilPesan("");
    const r = await fetch(`/api/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilForm),
    }).then((x) => x.json());
    setSavingProfil(false);
    if (r.success) {
      const userBaru = { ...user, ...profilForm };
      setUser(userBaru);
      localStorage.setItem("lms_user", JSON.stringify(userBaru));
      setProfilPesan("Profil berhasil disimpan");
    } else {
      setProfilPesan(r.message || "Gagal menyimpan profil");
    }
  }

  if (!user) return null;

  // Gabungan aktivitas terbaru buat notifikasi bell (materi, tugas, kuis, pengumuman)
  const aktivitas = [
    ...materi.map((m) => ({ judul: `Materi baru: ${m.judul}`, waktu: m.createdAt })),
    ...tugas.map((t) => ({ judul: `Tugas baru: ${t.judul}`, waktu: t.createdAt })),
    ...kuisList.map((k) => ({ judul: `Kuis baru: ${k.judul}`, waktu: k.createdAt })),
    ...pengumuman.map((p) => ({ judul: `Pengumuman: ${p.judul}`, waktu: p.createdAt })),
  ]
    .filter((a) => a.waktu)
    .sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());

  const belum = tugas.filter((t) => !t.pengumpulan).length;
  const kuisBelum = kuisList.filter((k) => !k.attemptSaya).length;
  const rata = nilai.length ? Math.round(nilai.reduce((a, n) => a + n.nilai, 0) / nilai.length) : "-";
  const stats = [
    ["Materi", materi.length],
    ["Tugas belum dikumpulkan", belum],
    ["Kuis belum dikerjakan", kuisBelum],
    ["Rata-rata nilai", rata],
    ["Pengumuman", pengumuman.length],
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex">
      <aside className="w-64 bg-[#0F1B33] text-white flex flex-col shrink-0">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-[#C6992F] font-bold text-xs border border-[#C6992F]/60 shrink-0">SMK</div>
          <div>
            <p className="font-bold text-sm leading-tight">LMS</p>
            <p className="text-[11px] text-white/60 leading-tight">SMK Citra Negara</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setNav(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                nav === key ? "bg-[#C6992F] text-[#0F1B33]" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Ico k={key} />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-5 border-t border-white/10">
          <div className="px-3 mb-3">
            <p className="text-sm font-medium truncate">{user.nama}</p>
            <p className="text-xs text-white/50">{user.kelas || "Siswa"}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition">
            <Ico k="logout" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-[#E5E0D5] px-8 flex items-center justify-end gap-3 shrink-0 relative">
          <button
            onClick={() => { setBellOpen((v) => !v); setBellExpand(false); }}
            className="relative w-10 h-10 rounded-full bg-[#F5F3EE] hover:bg-[#EDE9DD] flex items-center justify-center transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#0F1B33]">
              <path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8ZM10 19a2 2 0 0 0 4 0" />
            </svg>
            {aktivitas.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#C6992F] text-[9px] font-bold text-[#0F1B33] flex items-center justify-center">
                {aktivitas.length > 9 ? "9+" : aktivitas.length}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute top-14 right-8 w-80 bg-white rounded-xl border border-[#E5E0D5] shadow-lg z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E0D5]">
                <p className="text-sm font-semibold text-[#0F1B33]">Aktivitas Terbaru</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {aktivitas.length === 0 ? (
                  <p className="px-4 py-6 text-xs text-[#9CA3AF] text-center">Belum ada aktivitas.</p>
                ) : (
                  (bellExpand ? aktivitas.slice(0, 20) : aktivitas.slice(0, 5)).map((a, i) => (
                    <div key={i} className="px-4 py-2.5 border-b border-[#F0EDE3] last:border-0">
                      <p className="text-xs text-[#1F2430]">{a.judul}</p>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5">{waktuRelatif(a.waktu)}</p>
                    </div>
                  ))
                )}
              </div>
              {aktivitas.length > 5 && (
                <button
                  onClick={() => setBellExpand((v) => !v)}
                  className="w-full px-4 py-2 text-xs font-medium text-[#0F1B33] hover:bg-[#F5F3EE] transition border-t border-[#E5E0D5]"
                >
                  {bellExpand ? "Sembunyikan" : "Lihat Semua"}
                </button>
              )}
            </div>
          )}

          <button onClick={() => setNav("profil")} className="w-9 h-9 rounded-full bg-[#0F1B33] text-[#C6992F] text-xs font-bold flex items-center justify-center overflow-hidden shrink-0">
            {user.foto ? <img src={user.foto} alt="" className="w-full h-full object-cover" /> : user.nama?.[0]?.toUpperCase()}
          </button>
        </header>

      <div className="flex-1 px-8 py-8 max-w-5xl overflow-y-auto">
        {nav === "beranda" && (
          <>
            <h1 className="text-2xl font-bold text-[#0F1B33]">Halo, {user.nama.split(" ")[0]}!</h1>
            <p className="text-sm text-[#6B7280] mt-1 mb-8">Kelas {user.kelas || "-"} &middot; selamat belajar hari ini</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {stats.map(([label, v]) => (
                <div key={label} className="bg-white rounded-2xl border border-[#E5E0D5] shadow-sm px-5 py-5">
                  <p className="text-3xl font-bold text-[#0F1B33]">{v}</p>
                  <p className="text-xs font-medium text-[#6B7280] mt-1">{label}</p>
                </div>
              ))}
            </div>
            <Box title="Pengumuman Terbaru">
              {pengumuman.length === 0 ? <Kosong text="Belum ada pengumuman." /> : <Pengumuman list={pengumuman.slice(0, 3)} />}
            </Box>
          </>
        )}

        {nav === "materi" && (
          <Box title="Materi Pembelajaran">
            {loading ? <Kosong text="Memuat..." /> : materi.length === 0 ? <Kosong text="Belum ada materi untuk kelasmu." /> : materi.map((m) => (
              <div key={m._id} className="border-b border-[#F0EDE3] last:border-0">
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0F1B33]">{m.judul}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      {m.mataPelajaran} &middot; {m.guru?.nama || "Guru"} &middot; {m.tipe === "pdf" ? "PDF" : "Tautan"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.tipe === "pdf" && (
                      <button
                        onClick={() => setPreviewMateri(previewMateri === m._id ? null : m._id)}
                        className="px-3 py-2 rounded-lg border border-[#D8D3C8] text-[#1F2430] text-xs font-medium hover:bg-[#F5F3EE] transition"
                      >
                        {previewMateri === m._id ? "Tutup" : "Pratinjau"}
                      </button>
                    )}
                    <a href={m.fileUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-xs font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition">
                      Buka
                    </a>
                  </div>
                </div>
                {previewMateri === m._id && (
                  <div className="px-6 pb-5">
                    <iframe src={m.fileUrl} className="w-full h-[480px] rounded-lg border border-[#E5E0D5]" title={m.judul} />
                  </div>
                )}
              </div>
            ))}
          </Box>
        )}

        {nav === "tugas" && (
          <Box title="Tugas">
            {loading ? <Kosong text="Memuat..." /> : tugas.length === 0 ? <Kosong text="Belum ada tugas untuk kelasmu." /> : tugas.map((t) => {
              const telat = !t.pengumpulan && new Date(t.deadline) < new Date();
              const badge = t.pengumpulan
                ? ["Sudah dikumpulkan", "bg-green-50 text-green-700"]
                : telat
                ? ["Lewat deadline", "bg-red-50 text-red-600"]
                : ["Belum dikumpulkan", "bg-amber-50 text-amber-700"];
              return (
                <div key={t._id} className="px-6 py-5 border-b border-[#F0EDE3] last:border-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-[#0F1B33]">{t.judul}</p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        {t.mataPelajaran} &middot; Deadline {fmt(t.deadline)}
                      </p>
                      {t.deskripsi && <p className="text-sm text-[#6B7280] mt-2">{t.deskripsi}</p>}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge[1]}`}>{badge[0]}</span>
                  </div>
                  {t.pengumpulan?.nilai != null && (
                    <p className="text-sm text-[#0F1B33] mt-2">Nilai: <strong>{t.pengumpulan.nilai}</strong></p>
                  )}

                  {t.pengumpulan && (
                    <p className="text-xs text-[#6B7280] mt-2">
                      Terkumpul:{" "}
                      <a href={t.pengumpulan.fileUrl} target="_blank" rel="noreferrer" className="text-[#0F1B33] font-medium underline">
                        {t.pengumpulan.tipe === "pdf" ? t.pengumpulan.namaFile || "Lihat PDF" : "Lihat link"}
                      </a>
                    </p>
                  )}

                  <div className="mt-3">
                    <div className="flex gap-1 mb-2">
                      <button
                        onClick={() => setMode({ ...mode, [t._id]: "link" })}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                          (mode[t._id] || "link") === "link" ? "bg-[#0F1B33] text-white" : "bg-[#F5F3EE] text-[#6B7280]"
                        }`}
                      >
                        Link
                      </button>
                      <button
                        onClick={() => setMode({ ...mode, [t._id]: "pdf" })}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                          mode[t._id] === "pdf" ? "bg-[#0F1B33] text-white" : "bg-[#F5F3EE] text-[#6B7280]"
                        }`}
                      >
                        Upload PDF
                      </button>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {(mode[t._id] || "link") === "link" ? (
                        <input
                          placeholder="Tempel link tugas (Google Drive, dll)"
                          value={links[t._id] || ""}
                          onChange={(e) => setLinks({ ...links, [t._id]: e.target.value })}
                          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]"
                        />
                      ) : (
                        <label className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-dashed border-[#D8D3C8] text-sm text-[#6B7280] cursor-pointer hover:bg-[#F5F3EE] transition">
                          {fileTerpilih[t._id]?.namaFile || "Pilih file PDF (maks 10MB)"}
                          <input type="file" accept="application/pdf" onChange={(e) => pilihFile(t, e)} className="hidden" />
                        </label>
                      )}
                      <button onClick={() => kumpul(t)} className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition">
                        {t.pengumpulan ? "Kirim ulang" : "Kumpulkan"}
                      </button>
                    </div>
                  </div>
                  {pesan[t._id] && <p className="text-xs text-[#6B7280] mt-2">{pesan[t._id]}</p>}
                </div>
              );
            })}
          </Box>
        )}

        {nav === "kuis" && (
          kuisAktif ? (
            <div className="bg-white rounded-2xl border border-[#E5E0D5] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E0D5] flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-semibold text-[#0F1B33]">{kuisAktif.judul}</h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {kuisAktif.mataPelajaran} &middot; {kuisAktif.guru?.nama || "Guru"}
                  </p>
                </div>
                {!hasilKuis?.selesai && sisaDetik != null && (
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${sisaDetik < 60 ? "bg-red-50 text-red-600" : "bg-[#F5F3EE] text-[#0F1B33]"}`}>
                    Sisa waktu: {fmtWaktu(sisaDetik)}
                  </span>
                )}
              </div>

              {hasilKuis?.selesai && (
                <div className="px-6 py-4 bg-[#F5F3EE] border-b border-[#E5E0D5]">
                  <p className="font-semibold text-[#0F1B33]">
                    Skor kamu: {hasilKuis.skor}
                    {hasilKuis.benar != null && ` (${hasilKuis.benar}/${hasilKuis.total} benar)`}
                  </p>
                  {hasilKuis.otomatis && (
                    <p className="text-xs text-[#6B7280] mt-1">Waktu habis, jawaban terkirim otomatis.</p>
                  )}
                </div>
              )}

              <div className="px-6 py-5 space-y-6">
                {kuisAktif.soal.map((s, i) => (
                  <div key={i}>
                    <p className="font-medium text-[#0F1B33] mb-2">
                      {i + 1}. {s.pertanyaan}
                    </p>
                    <div className="space-y-1.5">
                      {s.pilihan.map((opsi, idx) => {
                        const terpilih = kuisAktif.jawabanSaya[i] === idx;
                        const sudahSelesai = !!hasilKuis?.selesai;
                        const benar = sudahSelesai && s.jawabanBenar === idx;
                        const salahDipilih = sudahSelesai && terpilih && s.jawabanBenar !== idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => pilihJawabanKuis(i, idx)}
                            disabled={sudahSelesai}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${
                              benar
                                ? "border-green-300 bg-green-50 text-green-700"
                                : salahDipilih
                                ? "border-red-300 bg-red-50 text-red-600"
                                : terpilih
                                ? "border-[#C6992F] bg-[#F5F3EE] text-[#0F1B33]"
                                : "border-[#E5E0D5] text-[#1F2430] hover:bg-[#F5F3EE]"
                            }`}
                          >
                            {opsi}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {pesan.kuis && <p className="px-6 text-xs text-red-600">{pesan.kuis}</p>}

              <div className="px-6 py-4 border-t border-[#E5E0D5] flex gap-3">
                <button onClick={tutupKuis} className="px-4 py-2 rounded-lg border border-[#D8D3C8] text-sm font-medium text-[#1F2430]">
                  {hasilKuis?.selesai ? "Kembali ke daftar" : "Batal"}
                </button>
                {!hasilKuis?.selesai && (
                  <button
                    onClick={() => kumpulkanKuis(false)}
                    className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition"
                  >
                    Kumpulkan Jawaban
                  </button>
                )}
              </div>
            </div>
          ) : (
            <Box title="Kuis & Ujian Online">
              {loading ? (
                <Kosong text="Memuat..." />
              ) : kuisList.length === 0 ? (
                <Kosong text="Belum ada kuis untuk kelasmu." />
              ) : (
                kuisList.map((k) => (
                  <div key={k._id} className="px-6 py-4 border-b border-[#F0EDE3] last:border-0 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-[#0F1B33]">{k.judul}</p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        {k.mataPelajaran} &middot; {k.jumlahSoal} soal &middot; {k.durasiMenit} menit
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {k.attemptSaya && (
                        <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                          Skor: {k.attemptSaya.skor}
                        </span>
                      )}
                      <button
                        onClick={() => mulaiKuis(k)}
                        className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition"
                      >
                        {k.attemptSaya ? "Lihat Hasil" : "Kerjakan"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </Box>
          )
        )}

        {nav === "nilai" && (
          <Box title="Nilai">
            {loading ? <Kosong text="Memuat..." /> : nilai.length === 0 ? <Kosong text="Belum ada nilai." /> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#9CA3AF] border-b border-[#E5E0D5]">
                    <th className="px-6 py-3 font-medium">Mata Pelajaran</th>
                    <th className="px-6 py-3 font-medium">Jenis</th>
                    <th className="px-6 py-3 font-medium">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {nilai.map((n) => (
                    <tr key={n._id} className="border-b border-[#F0EDE3] last:border-0">
                      <td className="px-6 py-3.5 text-[#1F2430] font-medium">{n.mataPelajaran}</td>
                      <td className="px-6 py-3.5 text-[#6B7280] capitalize">{n.jenis.replace("_", " ")}</td>
                      <td className="px-6 py-3.5 font-semibold text-[#0F1B33]">{n.nilai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Box>
        )}

        {nav === "pengumuman" && (
          <Box title="Pengumuman">
            {pengumuman.length === 0 ? <Kosong text="Belum ada pengumuman." /> : <Pengumuman list={pengumuman} />}
          </Box>
        )}

        {nav === "profil" && (
          <Box title="Profil Saya">
            <div className="px-6 py-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-[#0F1B33] text-[#C6992F] text-2xl font-bold flex items-center justify-center overflow-hidden shrink-0">
                  {profilForm.foto ? <img src={profilForm.foto} alt="" className="w-full h-full object-cover" /> : user.nama?.[0]?.toUpperCase()}
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
                <div>
                  <label className="text-xs font-medium text-[#6B7280]">Nama</label>
                  <p className="text-sm text-[#0F1B33] font-medium mt-1">{user.nama}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B7280]">Username</label>
                  <p className="text-sm text-[#0F1B33] font-medium mt-1">{user.username}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B7280]">NIS</label>
                  <p className="text-sm text-[#0F1B33] font-medium mt-1">{user.nis || "-"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B7280]">Kelas</label>
                  <p className="text-sm text-[#0F1B33] font-medium mt-1">{user.kelas || "-"}</p>
                </div>
              </div>

              <p className="text-xs text-[#9CA3AF] mb-4">
                Data di atas cuma bisa diubah oleh Admin. Kamu bisa ubah data di bawah ini sendiri:
              </p>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-medium text-[#6B7280]">No. Telepon</label>
                  <input
                    value={profilForm.noTelepon}
                    onChange={(e) => setProfilForm({ ...profilForm, noTelepon: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B7280]">Alamat</label>
                  <textarea
                    value={profilForm.alamat}
                    onChange={(e) => setProfilForm({ ...profilForm, alamat: e.target.value })}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]"
                  />
                </div>
                <button
                  onClick={simpanProfil}
                  disabled={savingProfil}
                  className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition disabled:opacity-50"
                >
                  {savingProfil ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                {profilPesan && <p className="text-xs text-[#6B7280]">{profilPesan}</p>}
              </div>
            </div>
          </Box>
        )}
      </div>
      </main>
    </div>
  );
}