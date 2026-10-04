"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PATHS = {
  beranda: "M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z",
  materi: "M5 4h11a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 1-1Z",
  tugas: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
  kuis: "M9 11l3 3 8-8M4 4h9M4 9h5M4 14h9M4 19h5",
  nilai: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  profil: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20c0-4 3.6-6 8-6s8 2 8 6",
  logout: "M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9",
};
const NAV = [
  ["beranda", "Beranda"],
  ["materi", "Materi"],
  ["tugas", "Tugas"],
  ["kuis", "Kuis"],
  ["nilai", "Nilai"],
  ["profil", "Profil"],
];

const fmt = (d) => (d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-");
const fmtJam = (d) => (d ? new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-");

function Ico({ k, className = "w-[18px] h-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d={PATHS[k]} />
    </svg>
  );
}
function Box({ title, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D5] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E0D5] flex items-center justify-between gap-3">
        <h2 className="font-semibold text-[#0F1B33]">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
const Kosong = ({ text }) => <p className="px-6 py-10 text-sm text-[#9CA3AF] text-center">{text}</p>;

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B7280] mb-1">{label}</label>
      {children}
    </div>
  );
}
const inputCls = "w-full px-3 py-2 rounded-lg border border-[#D8D3C8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]";
const btnPrimary = "px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition disabled:opacity-50";
const btnGhost = "px-4 py-2 rounded-lg border border-[#D8D3C8] text-sm font-medium text-[#1F2430] hover:bg-[#F5F3EE] transition";

export default function GuruDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [nav, setNav] = useState("beranda");
  const [loading, setLoading] = useState(true);

  const [materi, setMateri] = useState([]);
  const [tugas, setTugas] = useState([]);
  const [kuisList, setKuisList] = useState([]);
  const [nilaiList, setNilaiList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  useEffect(() => {
    const s = localStorage.getItem("lms_user");
    if (!s) return router.push("/login");
    const u = JSON.parse(s);
    if (u.role !== "guru") return router.push("/login");
    setUser(u);
    setProfilForm({ noTelepon: u.noTelepon || "", alamat: u.alamat || "", foto: u.foto || "" });
    muat(u);
  }, [router]);

  async function muat(u) {
    setLoading(true);
    const j = (url) => fetch(url).then((r) => r.json()).then((r) => (r.success ? r.data : [])).catch(() => []);
    const [m, t, k, n, kls] = await Promise.all([
      j(`/api/materi?guru=${u._id}`),
      j(`/api/tugas?guru=${u._id}`),
      j(`/api/kuis?guru=${u._id}`),
      j(`/api/nilai?guru=${u._id}`),
      j(`/api/kelas`),
    ]);
    setMateri(m); setTugas(t); setKuisList(k); setNilaiList(n); setKelasList(kls);
    setLoading(false);
  }

  function logout() {
    localStorage.removeItem("lms_user");
    router.push("/login");
  }

  // Daftar mata pelajaran guru (buat dropdown), fallback ke input teks kalau kosong
  const daftarMapel = user?.mataPelajaran?.length ? user.mataPelajaran : [];

  // ===================== MATERI =====================
  const [showMateriForm, setShowMateriForm] = useState(false);
  const [materiForm, setMateriForm] = useState({ judul: "", mataPelajaran: "", kelas: "", tipe: "link", fileUrl: "", namaFile: "" });
  const [savingMateri, setSavingMateri] = useState(false);
  const [pesanMateri, setPesanMateri] = useState("");

  function pilihFileMateri(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") return setPesanMateri("File harus berformat PDF");
    if (file.size > 10 * 1024 * 1024) return setPesanMateri("Ukuran PDF maksimal 10MB");
    const reader = new FileReader();
    reader.onload = () => {
      setMateriForm((f) => ({ ...f, fileUrl: reader.result, namaFile: file.name }));
      setPesanMateri("");
    };
    reader.readAsDataURL(file);
  }

  async function simpanMateri() {
    if (!materiForm.judul || !materiForm.mataPelajaran || !materiForm.kelas || !materiForm.fileUrl) {
      return setPesanMateri("Judul, mata pelajaran, kelas, dan file/link wajib diisi");
    }
    setSavingMateri(true);
    const r = await fetch("/api/materi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...materiForm, guru: user._id }),
    }).then((x) => x.json());
    setSavingMateri(false);
    if (r.success) {
      setMateriForm({ judul: "", mataPelajaran: "", kelas: "", tipe: "link", fileUrl: "", namaFile: "" });
      setShowMateriForm(false);
      setPesanMateri("");
      muat(user);
    } else {
      setPesanMateri(r.message || "Gagal menyimpan materi");
    }
  }

  async function hapusMateri(id) {
    if (!window.confirm("Yakin mau hapus materi ini?")) return;
    const r = await fetch(`/api/materi/${id}`, { method: "DELETE" }).then((x) => x.json());
    if (r.success) muat(user);
  }

  // ===================== TUGAS =====================
  const [showTugasForm, setShowTugasForm] = useState(false);
  const [tugasForm, setTugasForm] = useState({ judul: "", deskripsi: "", mataPelajaran: "", kelas: "", deadline: "" });
  const [savingTugas, setSavingTugas] = useState(false);
  const [pesanTugas, setPesanTugas] = useState("");

  async function simpanTugas() {
    if (!tugasForm.judul || !tugasForm.mataPelajaran || !tugasForm.kelas || !tugasForm.deadline) {
      return setPesanTugas("Judul, mata pelajaran, kelas, dan deadline wajib diisi");
    }
    setSavingTugas(true);
    const r = await fetch("/api/tugas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tugasForm, deadline: new Date(tugasForm.deadline).toISOString(), guru: user._id }),
    }).then((x) => x.json());
    setSavingTugas(false);
    if (r.success) {
      setTugasForm({ judul: "", deskripsi: "", mataPelajaran: "", kelas: "", deadline: "" });
      setShowTugasForm(false);
      setPesanTugas("");
      muat(user);
    } else {
      setPesanTugas(r.message || "Gagal menyimpan tugas");
    }
  }

  async function hapusTugas(id) {
    if (!window.confirm("Yakin mau hapus tugas ini? Semua kumpulan siswa ikut terhapus.")) return;
    const r = await fetch(`/api/tugas/${id}`, { method: "DELETE" }).then((x) => x.json());
    if (r.success) muat(user);
  }

  const [detailTugas, setDetailTugas] = useState(null);
  const [nilaiInput, setNilaiInput] = useState({});
  const [savingNilaiTugas, setSavingNilaiTugas] = useState("");

  async function lihatTugas(t) {
    const r = await fetch(`/api/tugas/${t._id}`).then((x) => x.json());
    if (r.success) {
      setDetailTugas(r.data);
      const awal = {};
      (r.data.submissions || []).forEach((s) => { awal[s.siswa?._id || s.siswa] = s.nilai ?? ""; });
      setNilaiInput(awal);
    }
  }

  async function simpanNilaiTugas(siswaId) {
    setSavingNilaiTugas(siswaId);
    const r = await fetch(`/api/tugas/${detailTugas._id}/nilai`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siswaId, nilai: Number(nilaiInput[siswaId]) }),
    }).then((x) => x.json());
    setSavingNilaiTugas("");
    if (r.success) lihatTugas({ _id: detailTugas._id });
  }

  // ===================== KUIS =====================
  const [showKuisForm, setShowKuisForm] = useState(false);
  const [kuisForm, setKuisForm] = useState({ judul: "", deskripsi: "", mataPelajaran: "", kelas: "", durasiMenit: 30 });
  const [soalForm, setSoalForm] = useState([{ pertanyaan: "", pilihan: ["", "", "", ""], jawabanBenar: 0 }]);
  const [savingKuis, setSavingKuis] = useState(false);
  const [pesanKuis, setPesanKuis] = useState("");

  function tambahSoal() {
    setSoalForm([...soalForm, { pertanyaan: "", pilihan: ["", "", "", ""], jawabanBenar: 0 }]);
  }
  function hapusSoal(i) {
    if (soalForm.length <= 1) return;
    setSoalForm(soalForm.filter((_, idx) => idx !== i));
  }
  function updatePertanyaan(i, value) {
    const baru = [...soalForm];
    baru[i] = { ...baru[i], pertanyaan: value };
    setSoalForm(baru);
  }
  function updatePilihan(i, pIdx, value) {
    const baru = [...soalForm];
    const pilihan = [...baru[i].pilihan];
    pilihan[pIdx] = value;
    baru[i] = { ...baru[i], pilihan };
    setSoalForm(baru);
  }
  function updateJawabanBenar(i, idx) {
    const baru = [...soalForm];
    baru[i] = { ...baru[i], jawabanBenar: idx };
    setSoalForm(baru);
  }

  async function simpanKuis() {
    if (!kuisForm.judul || !kuisForm.mataPelajaran || !kuisForm.kelas) {
      return setPesanKuis("Judul, mata pelajaran, dan kelas wajib diisi");
    }
    const adaKosong = soalForm.some((s) => !s.pertanyaan || s.pilihan.some((p) => !p));
    if (adaKosong) return setPesanKuis("Semua soal & pilihan jawaban wajib diisi");

    setSavingKuis(true);
    const r = await fetch("/api/kuis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...kuisForm, durasiMenit: Number(kuisForm.durasiMenit) || 30, guru: user._id, soal: soalForm }),
    }).then((x) => x.json());
    setSavingKuis(false);
    if (r.success) {
      setKuisForm({ judul: "", deskripsi: "", mataPelajaran: "", kelas: "", durasiMenit: 30 });
      setSoalForm([{ pertanyaan: "", pilihan: ["", "", "", ""], jawabanBenar: 0 }]);
      setShowKuisForm(false);
      setPesanKuis("");
      muat(user);
    } else {
      setPesanKuis(r.message || "Gagal menyimpan kuis");
    }
  }

  async function hapusKuis(id) {
    if (!window.confirm("Yakin mau hapus kuis ini? Semua hasil pengerjaan siswa ikut terhapus.")) return;
    const r = await fetch(`/api/kuis/${id}`, { method: "DELETE" }).then((x) => x.json());
    if (r.success) muat(user);
  }

  const [hasilKuisDetail, setHasilKuisDetail] = useState(null);
  async function lihatHasilKuis(k) {
    const r = await fetch(`/api/kuis/${k._id}/hasil`).then((x) => x.json());
    if (r.success) setHasilKuisDetail(r.data);
  }

  // ===================== NILAI MANUAL =====================
  const [showNilaiForm, setShowNilaiForm] = useState(false);
  const [nilaiForm, setNilaiForm] = useState({ siswa: "", mataPelajaran: "", kelas: "", jenis: "penilaian_manual", nilai: "" });
  const [daftarSiswaKelas, setDaftarSiswaKelas] = useState([]);
  const [savingNilai, setSavingNilai] = useState(false);
  const [pesanNilai, setPesanNilai] = useState("");

  useEffect(() => {
    if (!nilaiForm.kelas) return setDaftarSiswaKelas([]);
    fetch(`/api/users?role=siswa&kelas=${encodeURIComponent(nilaiForm.kelas)}`)
      .then((r) => r.json())
      .then((r) => setDaftarSiswaKelas(r.success ? r.data : []))
      .catch(() => setDaftarSiswaKelas([]));
  }, [nilaiForm.kelas]);

  async function simpanNilaiManual() {
    if (!nilaiForm.siswa || !nilaiForm.mataPelajaran || !nilaiForm.kelas || nilaiForm.nilai === "") {
      return setPesanNilai("Siswa, mata pelajaran, kelas, dan nilai wajib diisi");
    }
    setSavingNilai(true);
    const r = await fetch("/api/nilai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nilaiForm, nilai: Number(nilaiForm.nilai), guru: user._id }),
    }).then((x) => x.json());
    setSavingNilai(false);
    if (r.success) {
      setNilaiForm({ siswa: "", mataPelajaran: "", kelas: "", jenis: "penilaian_manual", nilai: "" });
      setShowNilaiForm(false);
      setPesanNilai("");
      muat(user);
    } else {
      setPesanNilai(r.message || "Gagal menyimpan nilai");
    }
  }

  // ===================== PROFIL =====================
  const [profilForm, setProfilForm] = useState({ noTelepon: "", alamat: "", foto: "" });
  const [savingProfil, setSavingProfil] = useState(false);
  const [profilPesan, setProfilPesan] = useState("");

  function pilihFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setProfilPesan("File harus berupa gambar");
    if (file.size > 2 * 1024 * 1024) return setProfilPesan("Ukuran foto maksimal 2MB");
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

  const stats = [
    ["Materi", materi.length],
    ["Tugas", tugas.length],
    ["Kuis", kuisList.length],
    ["Nilai diinput", nilaiList.length],
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F3EE]">
      <aside className="w-64 bg-[#0F1B33] text-white flex flex-col shrink-0">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-[#C6992F] text-[#0F1B33] font-bold text-xs flex items-center justify-center shrink-0">SMK</div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">SMK Citra Negara</p>
            <p className="text-[11px] text-white/50">Dashboard Guru</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setNav(k)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                nav === k ? "bg-[#C6992F] text-[#0F1B33]" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Ico k={k} />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition">
            <Ico k="logout" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 px-8 py-8 max-w-5xl">
        {nav === "beranda" && (
          <>
            <h1 className="text-2xl font-bold text-[#0F1B33]">Halo, {user.nama}!</h1>
            <p className="text-sm text-[#6B7280] mt-1 mb-8">{user.mataPelajaran?.join(", ") || "Guru"}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map(([label, v]) => (
                <div key={label} className="bg-white rounded-2xl border border-[#E5E0D5] shadow-sm px-5 py-4">
                  <p className="text-2xl font-bold text-[#0F1B33]">{v}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{label}</p>
                </div>
              ))}
            </div>

            <Box title="Tugas Terbaru">
              {loading ? <Kosong text="Memuat..." /> : tugas.length === 0 ? <Kosong text="Belum ada tugas yang kamu buat." /> : tugas.slice(0, 5).map((t) => (
                <div key={t._id} className="px-6 py-3.5 border-b border-[#F0EDE3] last:border-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-[#0F1B33] truncate">{t.judul}</p>
                    <p className="text-xs text-[#9CA3AF]">{t.kelas} &middot; Deadline {fmtJam(t.deadline)}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#0F1B33] shrink-0">{t.jumlahKumpul || 0} terkumpul</span>
                </div>
              ))}
            </Box>
          </>
        )}

        {nav === "materi" && (
          <Box
            title="Materi Saya"
            action={<button onClick={() => setShowMateriForm((v) => !v)} className={btnPrimary}>{showMateriForm ? "Tutup" : "+ Tambah Materi"}</button>}
          >
            {showMateriForm && (
              <div className="px-6 py-5 border-b border-[#E5E0D5] bg-[#FAF8F3] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Judul">
                    <input value={materiForm.judul} onChange={(e) => setMateriForm({ ...materiForm, judul: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Mata Pelajaran">
                    {daftarMapel.length ? (
                      <select value={materiForm.mataPelajaran} onChange={(e) => setMateriForm({ ...materiForm, mataPelajaran: e.target.value })} className={inputCls}>
                        <option value="">Pilih mata pelajaran</option>
                        {daftarMapel.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    ) : (
                      <input value={materiForm.mataPelajaran} onChange={(e) => setMateriForm({ ...materiForm, mataPelajaran: e.target.value })} placeholder="Contoh: Matematika" className={inputCls} />
                    )}
                  </Field>
                  <Field label="Kelas">
                    <select value={materiForm.kelas} onChange={(e) => setMateriForm({ ...materiForm, kelas: e.target.value })} className={inputCls}>
                      <option value="">Pilih kelas</option>
                      {kelasList.map((k) => <option key={k._id} value={k.namaKelas}>{k.namaKelas}</option>)}
                    </select>
                  </Field>
                  <Field label="Tipe Materi">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setMateriForm({ ...materiForm, tipe: "link", fileUrl: "", namaFile: "" })}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition ${materiForm.tipe === "link" ? "bg-[#0F1B33] text-white" : "bg-white border border-[#D8D3C8] text-[#6B7280]"}`}>Link</button>
                      <button type="button" onClick={() => setMateriForm({ ...materiForm, tipe: "pdf", fileUrl: "", namaFile: "" })}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition ${materiForm.tipe === "pdf" ? "bg-[#0F1B33] text-white" : "bg-white border border-[#D8D3C8] text-[#6B7280]"}`}>Upload PDF</button>
                    </div>
                  </Field>
                </div>

                {materiForm.tipe === "link" ? (
                  <Field label="Link Materi">
                    <input value={materiForm.fileUrl} onChange={(e) => setMateriForm({ ...materiForm, fileUrl: e.target.value })} placeholder="https://drive.google.com/..." className={inputCls} />
                  </Field>
                ) : (
                  <Field label="File PDF (maks 10MB)">
                    <label className="block px-3 py-2 rounded-lg border border-dashed border-[#D8D3C8] text-sm text-[#6B7280] cursor-pointer hover:bg-white transition">
                      {materiForm.namaFile || "Pilih file PDF"}
                      <input type="file" accept="application/pdf" onChange={pilihFileMateri} className="hidden" />
                    </label>
                  </Field>
                )}

                {pesanMateri && <p className="text-xs text-red-600">{pesanMateri}</p>}
                <button onClick={simpanMateri} disabled={savingMateri} className={btnPrimary}>{savingMateri ? "Menyimpan..." : "Simpan Materi"}</button>
              </div>
            )}

            {loading ? <Kosong text="Memuat..." /> : materi.length === 0 ? <Kosong text="Belum ada materi yang kamu buat." /> : materi.map((m) => (
              <div key={m._id} className="px-6 py-4 border-b border-[#F0EDE3] last:border-0 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-[#0F1B33]">{m.judul}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{m.mataPelajaran} &middot; {m.kelas} &middot; {m.tipe === "pdf" ? "PDF" : "Tautan"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={m.fileUrl} target="_blank" rel="noreferrer" className={btnGhost}>Buka</a>
                  <button onClick={() => hapusMateri(m._id)} className="px-3 py-2 rounded-lg text-red-600 text-xs font-medium hover:bg-red-50 transition">Hapus</button>
                </div>
              </div>
            ))}
          </Box>
        )}

        {nav === "tugas" && (
          detailTugas ? (
            <Box title={`Kumpulan: ${detailTugas.judul}`} action={<button onClick={() => setDetailTugas(null)} className={btnGhost}>Kembali</button>}>
              <div className="px-6 py-3 border-b border-[#E5E0D5] text-xs text-[#9CA3AF]">
                {detailTugas.kelas} &middot; {detailTugas.mataPelajaran} &middot; Deadline {fmtJam(detailTugas.deadline)}
              </div>
              {(detailTugas.submissions || []).length === 0 ? (
                <Kosong text="Belum ada siswa yang mengumpulkan." />
              ) : (
                detailTugas.submissions.map((s) => {
                  const sid = s.siswa?._id || s.siswa;
                  return (
                    <div key={sid} className="px-6 py-4 border-b border-[#F0EDE3] last:border-0 flex items-center justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-medium text-[#0F1B33]">{s.siswa?.nama || "Siswa"}</p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">
                          {s.siswa?.kelas} &middot; Kumpul {fmtJam(s.waktuKumpul)} &middot;{" "}
                          <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-[#0F1B33] font-medium underline">
                            {s.tipe === "pdf" ? s.namaFile || "Lihat PDF" : "Lihat link"}
                          </a>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number" min={0} max={100} placeholder="Nilai"
                          value={nilaiInput[sid] ?? ""}
                          onChange={(e) => setNilaiInput({ ...nilaiInput, [sid]: e.target.value })}
                          className="w-20 px-2 py-1.5 rounded-lg border border-[#D8D3C8] text-sm"
                        />
                        <button onClick={() => simpanNilaiTugas(sid)} disabled={savingNilaiTugas === sid} className={btnPrimary}>
                          {savingNilaiTugas === sid ? "..." : "Simpan"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </Box>
          ) : (
            <Box
              title="Tugas Saya"
              action={<button onClick={() => setShowTugasForm((v) => !v)} className={btnPrimary}>{showTugasForm ? "Tutup" : "+ Tambah Tugas"}</button>}
            >
              {showTugasForm && (
                <div className="px-6 py-5 border-b border-[#E5E0D5] bg-[#FAF8F3] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Judul">
                      <input value={tugasForm.judul} onChange={(e) => setTugasForm({ ...tugasForm, judul: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Mata Pelajaran">
                      {daftarMapel.length ? (
                        <select value={tugasForm.mataPelajaran} onChange={(e) => setTugasForm({ ...tugasForm, mataPelajaran: e.target.value })} className={inputCls}>
                          <option value="">Pilih mata pelajaran</option>
                          {daftarMapel.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      ) : (
                        <input value={tugasForm.mataPelajaran} onChange={(e) => setTugasForm({ ...tugasForm, mataPelajaran: e.target.value })} className={inputCls} />
                      )}
                    </Field>
                    <Field label="Kelas">
                      <select value={tugasForm.kelas} onChange={(e) => setTugasForm({ ...tugasForm, kelas: e.target.value })} className={inputCls}>
                        <option value="">Pilih kelas</option>
                        {kelasList.map((k) => <option key={k._id} value={k.namaKelas}>{k.namaKelas}</option>)}
                      </select>
                    </Field>
                    <Field label="Deadline">
                      <input type="datetime-local" value={tugasForm.deadline} onChange={(e) => setTugasForm({ ...tugasForm, deadline: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Deskripsi (opsional)">
                    <textarea rows={3} value={tugasForm.deskripsi} onChange={(e) => setTugasForm({ ...tugasForm, deskripsi: e.target.value })} className={inputCls} />
                  </Field>
                  {pesanTugas && <p className="text-xs text-red-600">{pesanTugas}</p>}
                  <button onClick={simpanTugas} disabled={savingTugas} className={btnPrimary}>{savingTugas ? "Menyimpan..." : "Simpan Tugas"}</button>
                </div>
              )}

              {loading ? <Kosong text="Memuat..." /> : tugas.length === 0 ? <Kosong text="Belum ada tugas yang kamu buat." /> : tugas.map((t) => (
                <div key={t._id} className="px-6 py-4 border-b border-[#F0EDE3] last:border-0 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0F1B33]">{t.judul}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{t.kelas} &middot; Deadline {fmtJam(t.deadline)} &middot; {t.jumlahKumpul || 0} terkumpul</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => lihatTugas(t)} className={btnGhost}>Lihat & Nilai</button>
                    <button onClick={() => hapusTugas(t._id)} className="px-3 py-2 rounded-lg text-red-600 text-xs font-medium hover:bg-red-50 transition">Hapus</button>
                  </div>
                </div>
              ))}
            </Box>
          )
        )}

        {nav === "kuis" && (
          hasilKuisDetail ? (
            <Box title={`Hasil: ${hasilKuisDetail.judul}`} action={<button onClick={() => setHasilKuisDetail(null)} className={btnGhost}>Kembali</button>}>
              <div className="px-6 py-3 border-b border-[#E5E0D5] text-xs text-[#9CA3AF]">
                {hasilKuisDetail.kelas} &middot; {hasilKuisDetail.mataPelajaran} &middot; {hasilKuisDetail.jumlahSoal} soal
              </div>
              {hasilKuisDetail.attempts.length === 0 ? (
                <Kosong text="Belum ada siswa yang mengerjakan." />
              ) : (
                hasilKuisDetail.attempts.map((a, i) => (
                  <div key={i} className="px-6 py-3.5 border-b border-[#F0EDE3] last:border-0 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-[#0F1B33]">{a.siswa?.nama || "Siswa"}</p>
                      <p className="text-xs text-[#9CA3AF]">{a.siswa?.kelas} &middot; Selesai {fmtJam(a.waktuSelesai)}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold shrink-0">Skor: {a.skor}</span>
                  </div>
                ))
              )}
            </Box>
          ) : (
            <Box
              title="Kuis Saya"
              action={<button onClick={() => setShowKuisForm((v) => !v)} className={btnPrimary}>{showKuisForm ? "Tutup" : "+ Buat Kuis"}</button>}
            >
              {showKuisForm && (
                <div className="px-6 py-5 border-b border-[#E5E0D5] bg-[#FAF8F3] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Judul">
                      <input value={kuisForm.judul} onChange={(e) => setKuisForm({ ...kuisForm, judul: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Mata Pelajaran">
                      {daftarMapel.length ? (
                        <select value={kuisForm.mataPelajaran} onChange={(e) => setKuisForm({ ...kuisForm, mataPelajaran: e.target.value })} className={inputCls}>
                          <option value="">Pilih mata pelajaran</option>
                          {daftarMapel.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      ) : (
                        <input value={kuisForm.mataPelajaran} onChange={(e) => setKuisForm({ ...kuisForm, mataPelajaran: e.target.value })} className={inputCls} />
                      )}
                    </Field>
                    <Field label="Kelas">
                      <select value={kuisForm.kelas} onChange={(e) => setKuisForm({ ...kuisForm, kelas: e.target.value })} className={inputCls}>
                        <option value="">Pilih kelas</option>
                        {kelasList.map((k) => <option key={k._id} value={k.namaKelas}>{k.namaKelas}</option>)}
                      </select>
                    </Field>
                    <Field label="Durasi (menit)">
                      <input type="number" min={1} value={kuisForm.durasiMenit} onChange={(e) => setKuisForm({ ...kuisForm, durasiMenit: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Deskripsi (opsional)">
                    <textarea rows={2} value={kuisForm.deskripsi} onChange={(e) => setKuisForm({ ...kuisForm, deskripsi: e.target.value })} className={inputCls} />
                  </Field>

                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-[#0F1B33]">Soal</p>
                    {soalForm.map((s, i) => (
                      <div key={i} className="bg-white rounded-xl border border-[#E5E0D5] p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-[#9CA3AF] mt-2.5 shrink-0">{i + 1}.</span>
                          <input
                            placeholder="Tulis pertanyaan"
                            value={s.pertanyaan}
                            onChange={(e) => updatePertanyaan(i, e.target.value)}
                            className={inputCls + " flex-1"}
                          />
                          {soalForm.length > 1 && (
                            <button onClick={() => hapusSoal(i)} className="text-red-600 text-xs font-medium px-2 py-2 hover:bg-red-50 rounded-lg transition shrink-0">Hapus</button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                          {s.pilihan.map((p, pIdx) => (
                            <label key={pIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`jawaban-${i}`}
                                checked={s.jawabanBenar === pIdx}
                                onChange={() => updateJawabanBenar(i, pIdx)}
                                className="accent-[#C6992F]"
                              />
                              <input
                                placeholder={`Pilihan ${String.fromCharCode(65 + pIdx)}`}
                                value={p}
                                onChange={(e) => updatePilihan(i, pIdx, e.target.value)}
                                className={inputCls}
                              />
                            </label>
                          ))}
                        </div>
                        <p className="text-[11px] text-[#9CA3AF] pl-6">Klik bulatan di samping pilihan buat tandain jawaban yang benar</p>
                      </div>
                    ))}
                    <button onClick={tambahSoal} className={btnGhost}>+ Tambah Soal</button>
                  </div>

                  {pesanKuis && <p className="text-xs text-red-600">{pesanKuis}</p>}
                  <button onClick={simpanKuis} disabled={savingKuis} className={btnPrimary}>{savingKuis ? "Menyimpan..." : "Simpan Kuis"}</button>
                </div>
              )}

              {loading ? <Kosong text="Memuat..." /> : kuisList.length === 0 ? <Kosong text="Belum ada kuis yang kamu buat." /> : kuisList.map((k) => (
                <div key={k._id} className="px-6 py-4 border-b border-[#F0EDE3] last:border-0 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0F1B33]">{k.judul}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      {k.kelas} &middot; {k.jumlahSoal} soal &middot; {k.jumlahMengerjakan || 0} siswa mengerjakan
                      {k.rataRata != null && ` \u00b7 Rata-rata: ${k.rataRata}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => lihatHasilKuis(k)} className={btnGhost}>Lihat Hasil</button>
                    <button onClick={() => hapusKuis(k._id)} className="px-3 py-2 rounded-lg text-red-600 text-xs font-medium hover:bg-red-50 transition">Hapus</button>
                  </div>
                </div>
              ))}
            </Box>
          )
        )}

        {nav === "nilai" && (
          <Box
            title="Nilai Manual"
            action={<button onClick={() => setShowNilaiForm((v) => !v)} className={btnPrimary}>{showNilaiForm ? "Tutup" : "+ Input Nilai"}</button>}
          >
            {showNilaiForm && (
              <div className="px-6 py-5 border-b border-[#E5E0D5] bg-[#FAF8F3] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Kelas">
                    <select value={nilaiForm.kelas} onChange={(e) => setNilaiForm({ ...nilaiForm, kelas: e.target.value, siswa: "" })} className={inputCls}>
                      <option value="">Pilih kelas</option>
                      {kelasList.map((k) => <option key={k._id} value={k.namaKelas}>{k.namaKelas}</option>)}
                    </select>
                  </Field>
                  <Field label="Siswa">
                    <select value={nilaiForm.siswa} onChange={(e) => setNilaiForm({ ...nilaiForm, siswa: e.target.value })} className={inputCls} disabled={!nilaiForm.kelas}>
                      <option value="">Pilih siswa</option>
                      {daftarSiswaKelas.map((s) => <option key={s._id} value={s._id}>{s.nama}</option>)}
                    </select>
                  </Field>
                  <Field label="Mata Pelajaran">
                    {daftarMapel.length ? (
                      <select value={nilaiForm.mataPelajaran} onChange={(e) => setNilaiForm({ ...nilaiForm, mataPelajaran: e.target.value })} className={inputCls}>
                        <option value="">Pilih mata pelajaran</option>
                        {daftarMapel.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    ) : (
                      <input value={nilaiForm.mataPelajaran} onChange={(e) => setNilaiForm({ ...nilaiForm, mataPelajaran: e.target.value })} className={inputCls} />
                    )}
                  </Field>
                  <Field label="Jenis Penilaian">
                    <select value={nilaiForm.jenis} onChange={(e) => setNilaiForm({ ...nilaiForm, jenis: e.target.value })} className={inputCls}>
                      <option value="penilaian_manual">Penilaian Manual</option>
                      <option value="tugas">Tugas</option>
                      <option value="kuis">Kuis</option>
                      <option value="ujian_online">Ujian Online</option>
                    </select>
                  </Field>
                  <Field label="Nilai (0-100)">
                    <input type="number" min={0} max={100} value={nilaiForm.nilai} onChange={(e) => setNilaiForm({ ...nilaiForm, nilai: e.target.value })} className={inputCls} />
                  </Field>
                </div>
                {pesanNilai && <p className="text-xs text-red-600">{pesanNilai}</p>}
                <button onClick={simpanNilaiManual} disabled={savingNilai} className={btnPrimary}>{savingNilai ? "Menyimpan..." : "Simpan Nilai"}</button>
              </div>
            )}

            {loading ? <Kosong text="Memuat..." /> : nilaiList.length === 0 ? <Kosong text="Belum ada nilai yang kamu input." /> : nilaiList.map((n) => (
              <div key={n._id} className="px-6 py-3.5 border-b border-[#F0EDE3] last:border-0 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-[#0F1B33]">{n.siswa?.nama || "Siswa"}</p>
                  <p className="text-xs text-[#9CA3AF]">{n.mataPelajaran} &middot; {n.kelas} &middot; {n.jenis}</p>
                </div>
                <span className="font-semibold text-[#0F1B33] shrink-0">{n.nilai}</span>
              </div>
            ))}
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
                  <label className="text-xs font-medium text-[#6B7280]">Email (Login)</label>
                  <p className="text-sm text-[#0F1B33] font-medium mt-1">{user.email || "-"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B7280]">NIP</label>
                  <p className="text-sm text-[#0F1B33] font-medium mt-1">{user.nip || "-"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B7280]">Mata Pelajaran</label>
                  <p className="text-sm text-[#0F1B33] font-medium mt-1">{user.mataPelajaran?.join(", ") || "-"}</p>
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
                    className={inputCls + " mt-1"}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B7280]">Alamat</label>
                  <textarea
                    value={profilForm.alamat}
                    onChange={(e) => setProfilForm({ ...profilForm, alamat: e.target.value })}
                    rows={3}
                    className={inputCls + " mt-1"}
                  />
                </div>
                <button onClick={simpanProfil} disabled={savingProfil} className={btnPrimary}>
                  {savingProfil ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                {profilPesan && <p className="text-xs text-[#6B7280]">{profilPesan}</p>}
              </div>
            </div>
          </Box>
        )}
      </main>
    </div>
  );
}