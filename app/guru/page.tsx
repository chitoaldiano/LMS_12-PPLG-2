"use client";

import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import type {
  UserItem,
  MateriItem,
  TugasItem,
  TugasSubmission,
  KuisItem,
  AttemptItem,
  NilaiItem,
  KelasItem,
  SiswaPopulated,
} from "@/types/lms";

const PATHS: Record<string, string> = {
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

const fmt = (d: string | Date | undefined | null) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";
const fmtJam = (d: string | Date | undefined | null) =>
  d ? new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";

function waktuRelatif(tanggal: string | Date | undefined | null): string {
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

function Ico({ k, className = "w-[18px] h-[18px]" }: { k: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d={PATHS[k] || PATHS.beranda} />
    </svg>
  );
}

function Box({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0DCE8] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#F0DCE8] flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-bold text-[#59234F] text-base">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

const Kosong = ({ text }: { text: string }) => <p className="px-6 py-10 text-sm text-[#B596AA] text-center">{text}</p>;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#81506F] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-xl border border-[#E8D5E1] bg-white text-sm text-[#59234F] focus:outline-none focus:ring-2 focus:ring-[#D94383] transition";
const btnPrimary = "px-4 py-2 rounded-xl bg-gradient-to-r from-[#70295F] to-[#913B7E] text-white text-sm font-semibold shadow-sm hover:from-[#5E2250] hover:to-[#7E326D] transition disabled:opacity-50";
const btnGhost = "px-3.5 py-1.5 rounded-xl border border-[#F0DCE8] text-xs font-semibold text-[#59234F] hover:bg-[#FFF0F6] transition";

interface GuruTugasItem extends TugasItem {
  jumlahKumpul?: number;
}

interface GuruKuisItem extends KuisItem {
  jumlahMengerjakan?: number;
  rataRata?: number | null;
}

interface HasilKuisDetail extends KuisItem {
  attempts: AttemptItem[];
  jumlahSoal: number;
}

export default function GuruDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserItem | null>(null);
  const [nav, setNav] = useState("beranda");
  const [loading, setLoading] = useState(true);

  const [materi, setMateri] = useState<MateriItem[]>([]);
  const [tugas, setTugas] = useState<GuruTugasItem[]>([]);
  const [kuisList, setKuisList] = useState<GuruKuisItem[]>([]);
  const [nilaiList, setNilaiList] = useState<NilaiItem[]>([]);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);

  // Notifikasi bell & mobile navigation
  const [bellOpen, setBellOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("lms_user");
    if (!s) {
      router.push("/login");
      return;
    }
    const u: UserItem = JSON.parse(s);
    if (u.role !== "guru") {
      router.push("/login");
      return;
    }
    setUser(u);
    setProfilForm({ noTelepon: u.noTelepon || "", alamat: u.alamat || "", foto: u.foto || "" });
    muat(u);
  }, [router]);

  async function muat(u: UserItem) {
    setLoading(true);
    const j = async <T,>(url: string): Promise<T[]> => {
      try {
        const res = await fetch(url);
        const r = await res.json();
        return r.success && Array.isArray(r.data) ? r.data : [];
      } catch {
        return [];
      }
    };
    const [m, t, k, n, kls] = await Promise.all([
      j<MateriItem>(`/api/materi?guru=${u._id}`),
      j<GuruTugasItem>(`/api/tugas?guru=${u._id}`),
      j<GuruKuisItem>(`/api/kuis?guru=${u._id}`),
      j<NilaiItem>(`/api/nilai?guru=${u._id}`),
      j<KelasItem>(`/api/kelas`),
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
  const [materiForm, setMateriForm] = useState<{
    judul: string;
    mataPelajaran: string;
    kelas: string;
    tipe: "link" | "pdf";
    fileUrl: string;
    namaFile: string;
  }>({ judul: "", mataPelajaran: "", kelas: "", tipe: "link", fileUrl: "", namaFile: "" });
  const [savingMateri, setSavingMateri] = useState(false);
  const [pesanMateri, setPesanMateri] = useState("");

  function pilihFileMateri(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") return setPesanMateri("File harus berformat PDF");
    if (file.size > 10 * 1024 * 1024) return setPesanMateri("Ukuran PDF maksimal 10MB");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setMateriForm((f) => ({ ...f, fileUrl: reader.result as string, namaFile: file.name }));
        setPesanMateri("");
      }
    };
    reader.readAsDataURL(file);
  }

  async function simpanMateri() {
    if (!user) return;
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

  async function hapusMateri(id: string) {
    if (!user) return;
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
    if (!user) return;
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

  async function hapusTugas(id: string) {
    if (!user) return;
    if (!window.confirm("Yakin mau hapus tugas ini? Semua kumpulan siswa ikut terhapus.")) return;
    const r = await fetch(`/api/tugas/${id}`, { method: "DELETE" }).then((x) => x.json());
    if (r.success) muat(user);
  }

  const [detailTugas, setDetailTugas] = useState<TugasItem | null>(null);
  const [nilaiInput, setNilaiInput] = useState<Record<string, string | number>>({});
  const [savingNilaiTugas, setSavingNilaiTugas] = useState("");

  async function lihatTugas(t: { _id: string }) {
    const r = await fetch(`/api/tugas/${t._id}`).then((x) => x.json());
    if (r.success) {
      setDetailTugas(r.data);
      const awal: Record<string, string | number> = {};
      (r.data.submissions || []).forEach((s: TugasSubmission) => {
        const sid = typeof s.siswa === "object" && s.siswa !== null ? s.siswa._id : String(s.siswa);
        awal[sid] = s.nilai ?? "";
      });
      setNilaiInput(awal);
    }
  }

  async function simpanNilaiTugas(siswaId: string) {
    if (!detailTugas) return;
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
  function hapusSoal(i: number) {
    if (soalForm.length <= 1) return;
    setSoalForm(soalForm.filter((_, idx) => idx !== i));
  }
  function updatePertanyaan(i: number, value: string) {
    const baru = [...soalForm];
    baru[i] = { ...baru[i], pertanyaan: value };
    setSoalForm(baru);
  }
  function updatePilihan(i: number, pIdx: number, value: string) {
    const baru = [...soalForm];
    const pilihan = [...baru[i].pilihan];
    pilihan[pIdx] = value;
    baru[i] = { ...baru[i], pilihan };
    setSoalForm(baru);
  }
  function updateJawabanBenar(i: number, idx: number) {
    const baru = [...soalForm];
    baru[i] = { ...baru[i], jawabanBenar: idx };
    setSoalForm(baru);
  }

  async function simpanKuis() {
    if (!user) return;
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

  async function hapusKuis(id: string) {
    if (!user) return;
    if (!window.confirm("Yakin mau hapus kuis ini? Semua hasil pengerjaan siswa ikut terhapus.")) return;
    const r = await fetch(`/api/kuis/${id}`, { method: "DELETE" }).then((x) => x.json());
    if (r.success) muat(user);
  }

  const [hasilKuisDetail, setHasilKuisDetail] = useState<HasilKuisDetail | null>(null);
  async function lihatHasilKuis(k: { _id: string }) {
    const r = await fetch(`/api/kuis/${k._id}/hasil`).then((x) => x.json());
    if (r.success) setHasilKuisDetail(r.data);
  }

  // ===================== NILAI MANUAL =====================
  const [showNilaiForm, setShowNilaiForm] = useState(false);
  const [nilaiForm, setNilaiForm] = useState<{
    siswa: string;
    mataPelajaran: string;
    kelas: string;
    jenis: "penilaian_manual" | "kuis" | "ujian_online" | "tugas";
    nilai: string;
  }>({ siswa: "", mataPelajaran: "", kelas: "", jenis: "penilaian_manual", nilai: "" });
  const [daftarSiswaKelas, setDaftarSiswaKelas] = useState<UserItem[]>([]);
  const [savingNilai, setSavingNilai] = useState(false);
  const [pesanNilai, setPesanNilai] = useState("");

  useEffect(() => {
    if (!nilaiForm.kelas) {
      setDaftarSiswaKelas([]);
      return;
    }
    fetch(`/api/users?role=siswa&kelas=${encodeURIComponent(nilaiForm.kelas)}`)
      .then((r) => r.json())
      .then((r) => setDaftarSiswaKelas(r.success && Array.isArray(r.data) ? r.data : []))
      .catch(() => setDaftarSiswaKelas([]));
  }, [nilaiForm.kelas]);

  async function simpanNilaiManual() {
    if (!user) return;
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

  function pilihFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setProfilPesan("File harus berupa gambar");
    if (file.size > 2 * 1024 * 1024) return setProfilPesan("Ukuran foto maksimal 2MB");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfilForm((f) => ({ ...f, foto: reader.result as string }));
        setProfilPesan("");
      }
    };
    reader.readAsDataURL(file);
  }

  async function simpanProfil() {
    if (!user) return;
    setSavingProfil(true);
    setProfilPesan("");
    const r = await fetch(`/api/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilForm),
    }).then((x) => x.json());
    setSavingProfil(false);
    if (r.success) {
      const userBaru: UserItem = { ...user, ...profilForm };
      setUser(userBaru);
      localStorage.setItem("lms_user", JSON.stringify(userBaru));
      setProfilPesan("Profil berhasil disimpan");
    } else {
      setProfilPesan(r.message || "Gagal menyimpan profil");
    }
  }

  if (!user) return null;

  // Aktivitas untuk notifikasi bell
  const aktivitas = [
    ...tugas.map((t) => ({ judul: `Tugas aktif: ${t.judul}`, waktu: t.createdAt })),
    ...kuisList.map((k) => ({ judul: `Kuis aktif: ${k.judul}`, waktu: k.createdAt })),
    ...materi.map((m) => ({ judul: `Materi dibuat: ${m.judul}`, waktu: m.createdAt })),
  ]
    .filter((a): a is { judul: string; waktu: string } => typeof a.waktu === "string")
    .sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());

  const stats = [
    { label: "Materi", value: materi.length, icon: "materi" },
    { label: "Tugas", value: tugas.length, icon: "tugas" },
    { label: "Kuis", value: kuisList.length, icon: "kuis" },
    { label: "Nilai diinput", value: nilaiList.length, icon: "nilai" },
  ];

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-[#FFF7FB] text-[#59234F]">
      {/* Backdrop overlay di mobile saat drawer terbuka */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar: Drawer di mobile (< md), compact di tablet (md), expanded di desktop (lg) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[260px] flex-col overflow-hidden bg-gradient-to-b from-[#70295F] via-[#5D2452] to-[#42183D] text-white shadow-2xl transition-transform duration-300 md:static md:translate-x-0 md:shadow-[8px_0_28px_rgba(76,25,61,0.08)] md:w-[76px] lg:w-[252px] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 md:justify-center lg:justify-start lg:px-5 lg:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#F3B8D3] bg-white shadow-md lg:h-11 lg:w-11">
              <img src="/logo.png" alt="Logo SMK Citra Negara" className="h-full w-full object-contain p-1" />
            </div>
            <div className="min-w-0 md:hidden lg:block">
              <p className="truncate text-[14px] font-bold leading-tight tracking-tight">SMK Citra Negara</p>
              <p className="mt-1 text-[10px] leading-tight text-white/65">Learning Management System</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
            aria-label="Tutup Menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-4 [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin] md:px-2 lg:px-3 lg:pt-5">
          <p className="mb-2 hidden items-center gap-2 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 lg:flex">
            <span className="h-px flex-1 bg-white/15" />Menu Utama<span className="h-px flex-1 bg-white/15" />
          </p>
          <div className="space-y-1">
            {NAV.map(([key, label]) => {
              const active = nav === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setNav(key);
                    setSidebarOpen(false);
                  }}
                  title={label}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-[42px] w-full items-center justify-start gap-3 rounded-xl px-3.5 py-2 text-left text-[13px] font-semibold transition-all duration-200 md:justify-center lg:justify-start ${
                    active
                      ? "bg-gradient-to-r from-[#F8D9E8] to-[#E9A6C6] text-[#541A45] shadow-[0_5px_14px_rgba(35,8,28,0.16)]"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Ico k={key} className={`h-[19px] w-[19px] shrink-0 transition-transform ${active ? "scale-105" : "group-hover:scale-105"}`} />
                  <span className="flex-1 truncate md:hidden lg:inline">{label}</span>
                  {active && <span className="hidden h-1.5 w-1.5 shrink-0 rounded-full bg-[#8C326B] lg:block" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 bg-black/[0.04] px-3 pb-3 pt-3 md:px-2 lg:px-3 lg:pb-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2 md:hidden lg:flex">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white ring-1 ring-white/15 overflow-hidden">
              {user.foto ? (
                <img src={user.foto} alt="" className="w-full h-full object-cover" />
              ) : (
                user.nama?.[0]?.toUpperCase() || "G"
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{user.nama}</span>
              <span className="block truncate text-[11px] text-white/60">Guru · {user.mataPelajaran?.[0] || "Pengampu"}</span>
            </span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="flex min-h-[42px] w-full items-center justify-start gap-3 rounded-xl px-3.5 py-2 text-[13px] font-semibold text-white/75 transition hover:bg-white/10 hover:text-white md:justify-center lg:justify-start"
          >
            <Ico k="logout" className="h-[19px] w-[19px] shrink-0" />
            <span className="md:hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <header className="sticky top-0 z-30 flex h-[68px] sm:h-[82px] min-h-[68px] sm:min-h-[82px] w-full shrink-0 items-center justify-between gap-3 border-b border-[#F0DCE8] bg-white/95 px-3 sm:px-6 xl:px-8 backdrop-blur">
          {/* Tombol Hamburger di Mobile */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F0DCE8] bg-white text-[#59234F] hover:bg-[#FFF0F6] transition shadow-xs"
              aria-label="Buka Menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-3 bg-white/90 border border-[#EEDCE7] rounded-full px-4 py-2.5 w-full max-w-[410px] shadow-[0_3px_15px_rgba(91,31,75,0.04)]">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#6B2858]" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <span className="text-sm text-[#A78A9D]">Cari fitur atau informasi...</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            <ThemeToggle compact />

            <div className="relative">
              <button
                onClick={() => setBellOpen((v) => !v)}
                className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full hover:bg-[#FFF0F6] flex items-center justify-center transition"
                aria-label="Notifikasi"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 sm:w-6 sm:h-6 text-[#59234F]">
                  <path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8ZM10 19a2 2 0 0 0 4 0" />
                </svg>
                {aktivitas.length > 0 && (
                  <span className="absolute top-0 right-0 min-w-5 h-5 px-1 rounded-full bg-[#D94383] text-[10px] font-bold text-white flex items-center justify-center">
                    {aktivitas.length > 9 ? "9+" : aktivitas.length}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute top-[52px] sm:top-[70px] right-0 sm:right-8 w-72 sm:w-80 bg-white rounded-2xl border border-[#F0DCE8] shadow-xl z-30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#F0DCE8]">
                    <p className="text-sm font-semibold text-[#59234F]">Aktivitas Mengajar</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {aktivitas.length === 0 ? (
                      <p className="px-4 py-6 text-xs text-[#B596AA] text-center">Belum ada aktivitas.</p>
                    ) : (
                      aktivitas.slice(0, 6).map((a, i) => (
                        <div key={i} className="px-4 py-2.5 border-b border-[#F9EAF2] last:border-0">
                          <p className="text-xs font-semibold text-[#59234F]">{a.judul}</p>
                          <p className="text-[10px] text-[#B596AA] mt-0.5">{waktuRelatif(a.waktu)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-7 sm:h-8 w-px bg-[#F0DCE8]" />

            <button onClick={() => setNav("profil")} className="flex items-center gap-2 sm:gap-3 text-left group">
              <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#70295F] text-white text-xs sm:text-sm font-bold flex items-center justify-center overflow-hidden shrink-0 shadow-sm ring-2 ring-transparent group-hover:ring-[#D94383]/30 transition">
                {user.foto ? (
                  <img src={user.foto} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.nama?.[0]?.toUpperCase() || "G"
                )}
              </span>
              <span className="hidden sm:block">
                <span className="block text-sm font-bold text-[#59234F]">{user.nama}</span>
                <span className="block text-xs text-[#B596AA]">Guru · {user.mataPelajaran?.join(", ") || "LMS"}</span>
              </span>
            </button>
          </div>
        </header>

        <div className="w-full min-w-0 flex-1 px-3 py-4 sm:px-6 sm:py-6 xl:px-8 xl:py-6">
          {/* ===== BERANDA ===== */}
          {nav === "beranda" && (
            <>
              {/* Hero Banner Guru */}
              <section className="relative mb-5 min-h-[190px] sm:min-h-[230px] w-full overflow-hidden rounded-[26px] border border-[#F1CFE0] bg-gradient-to-r from-[#FCE5F0] via-[#F8D8E8] to-[#E9BBD4] shadow-[0_8px_28px_rgba(91,31,75,0.07)] lg:min-h-[245px]">
                <div className="relative z-10 box-border w-full md:w-[60%] lg:w-[58%] min-w-0 px-5 py-6 sm:px-8 lg:px-9 lg:py-8">
                  <span className="inline-flex items-center rounded-full bg-[#70295F] text-white px-3 py-1 text-[10px] font-bold tracking-wider">
                    RUANG GURU
                  </span>
                  <h1 className="text-2xl sm:text-3xl xl:text-[38px] leading-tight font-extrabold text-[#572047] mt-3">
                    Halo, {user?.nama ? user.nama.split(" ")[0] : "Guru"}!<br />Semangat mengajar hari ini.
                  </h1>
                  <p className="text-xs sm:text-sm xl:text-base text-[#81506F] mt-2 sm:mt-3 leading-relaxed max-w-[560px]">
                    Kelola materi pembelajaran, berikan tugas dan kuis, serta pantau perkembangan nilai siswa di LMS SMK Citra Negara.
                  </p>
                  <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-[#70295F]">
                    <span className="w-2 h-2 rounded-full bg-[#D94383]" />
                    {user.mataPelajaran?.join(", ") || "Guru Pengampu"}
                  </div>
                </div>
                <div className="pointer-events-none absolute bottom-0 right-0 top-0 flex w-[55%] sm:w-[48%] md:w-[44%] items-end justify-center opacity-25 md:opacity-95">
                  <svg viewBox="0 0 520 260" className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                    <circle cx="405" cy="48" r="58" fill="#F9EAF2" opacity=".65" />
                    <path d="M40 116 250 28 470 116v144H40Z" fill="#F9F0F5" stroke="#B66C98" strokeWidth="7" />
                    <path d="M18 119 250 18 493 119" fill="none" stroke="#9C4D7D" strokeWidth="13" strokeLinejoin="round" />
                    <path d="M75 137h350v8H75zM75 205h350v8H75z" fill="#D49AB8" />
                    {Array.from({ length: 6 }, (_, i) => (
                      <g key={i}>
                        <rect x={88 + i * 55} y="153" width="36" height="38" rx="4" fill="#B66C98" />
                        <path d={`M${106 + i * 55} 153v38`} stroke="#F9EAF2" strokeWidth="3" />
                      </g>
                    ))}
                    <path d="M0 247h520v13H0z" fill="#B66C98" />
                    <path d="M28 188c-28-35 4-72 32-52 17-34 60-15 49 17 27 16 13 52-18 52H28Z" fill="#789B7D"/>
                    <path d="M72 200v55" stroke="#8D6B4F" strokeWidth="10" />
                    <path d="M445 193c-25-32 3-66 29-48 16-31 54-14 44 16 24 15 12 47-16 47h-57Z" fill="#789B7D" />
                    <path d="M478 205v50" stroke="#8D6B4F" strokeWidth="9" />
                  </svg>
                </div>
              </section>

              {/* Grid Statistik */}
              <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {stats.map((item) => (
                  <div key={item.label} className="flex min-h-[92px] sm:min-h-[116px] items-center gap-2.5 sm:gap-3 rounded-2xl border border-[#F5D8E7] bg-white px-3 sm:px-4 py-2.5 sm:py-4 shadow-[0_4px_14px_rgba(91,31,75,0.045)]">
                    <span className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-[#FCE4F0] text-[#B52D78]">
                      <Ico k={item.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[11px] sm:text-xs font-semibold leading-snug text-[#81506F]">{item.label}</p>
                      <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl lg:text-3xl font-extrabold leading-none text-[#59234F]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tugas Terbaru Card */}
              <Box title="Tugas Terbaru">
                {loading ? (
                  <Kosong text="Memuat..." />
                ) : tugas.length === 0 ? (
                  <Kosong text="Belum ada tugas yang kamu buat." />
                ) : (
                  tugas.slice(0, 5).map((t) => (
                    <div key={t._id} className="px-6 py-4 border-b border-[#F9EAF2] last:border-0 flex items-center justify-between gap-4 hover:bg-[#FFF7FB] transition">
                      <div className="min-w-0">
                        <p className="font-bold text-[#59234F] truncate">{t.judul}</p>
                        <p className="text-xs text-[#81506F] mt-0.5">{t.kelas} &middot; Deadline {fmtJam(t.deadline)}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#FCE4F0] text-[#70295F] text-xs font-semibold shrink-0">
                        {t.jumlahKumpul || 0} terkumpul
                      </span>
                    </div>
                  ))
                )}
              </Box>
            </>
          )}

          {/* ===== MATERI ===== */}
          {nav === "materi" && (
            <Box
              title="Materi Saya"
              action={
                <button onClick={() => setShowMateriForm((v) => !v)} className={btnPrimary}>
                  {showMateriForm ? "Tutup Form" : "+ Tambah Materi"}
                </button>
              }
            >
              {showMateriForm && (
                <div className="px-6 py-5 border-b border-[#F0DCE8] bg-[#FFF9FC] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Judul Materi">
                      <input
                        placeholder="Contoh: Pemrograman Dasar - Variabel & Tipe Data"
                        value={materiForm.judul}
                        onChange={(e) => setMateriForm({ ...materiForm, judul: e.target.value })}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Mata Pelajaran">
                      {daftarMapel.length ? (
                        <select value={materiForm.mataPelajaran} onChange={(e) => setMateriForm({ ...materiForm, mataPelajaran: e.target.value })} className={inputCls}>
                          <option value="">Pilih mata pelajaran</option>
                          {daftarMapel.map((m: string) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      ) : (
                        <input value={materiForm.mataPelajaran} onChange={(e) => setMateriForm({ ...materiForm, mataPelajaran: e.target.value })} placeholder="Contoh: Pemrograman Web" className={inputCls} />
                      )}
                    </Field>
                    <Field label="Kelas">
                      <select value={materiForm.kelas} onChange={(e) => setMateriForm({ ...materiForm, kelas: e.target.value })} className={inputCls}>
                        <option value="">Pilih kelas</option>
                        {kelasList.map((k) => <option key={k._id} value={k.namaKelas}>{k.namaKelas}</option>)}
                      </select>
                    </Field>
                    <Field label="Tipe Materi">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setMateriForm({ ...materiForm, tipe: "link", fileUrl: "", namaFile: "" })}
                          className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                            materiForm.tipe === "link"
                              ? "bg-[#70295F] text-white shadow-sm"
                              : "bg-white border border-[#E8D5E1] text-[#81506F] hover:bg-[#FFF0F6]"
                          }`}
                        >
                          Link Tautan
                        </button>
                        <button
                          type="button"
                          onClick={() => setMateriForm({ ...materiForm, tipe: "pdf", fileUrl: "", namaFile: "" })}
                          className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                            materiForm.tipe === "pdf"
                              ? "bg-[#70295F] text-white shadow-sm"
                              : "bg-white border border-[#E8D5E1] text-[#81506F] hover:bg-[#FFF0F6]"
                          }`}
                        >
                          Upload PDF
                        </button>
                      </div>
                    </Field>
                  </div>

                  {materiForm.tipe === "link" ? (
                    <Field label="Link Materi (Google Drive / Dokumen / YouTube)">
                      <input
                        value={materiForm.fileUrl}
                        onChange={(e) => setMateriForm({ ...materiForm, fileUrl: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        className={inputCls}
                      />
                    </Field>
                  ) : (
                    <Field label="File PDF (maksimal 10MB)">
                      <label className="block px-4 py-3 rounded-xl border border-dashed border-[#D9A9C4] bg-white text-sm text-[#81506F] cursor-pointer hover:border-[#A53D78] hover:bg-[#FFF7FB] transition">
                        <span className="font-semibold text-[#59234F]">{materiForm.namaFile || "Klik untuk pilih file PDF"}</span>
                        <input type="file" accept="application/pdf" onChange={pilihFileMateri} className="hidden" />
                      </label>
                    </Field>
                  )}

                  {pesanMateri && <p className="text-xs font-semibold text-red-600">{pesanMateri}</p>}
                  <button onClick={simpanMateri} disabled={savingMateri} className={btnPrimary}>
                    {savingMateri ? "Menyimpan..." : "Simpan Materi"}
                  </button>
                </div>
              )}

              {loading ? (
                <Kosong text="Memuat..." />
              ) : materi.length === 0 ? (
                <Kosong text="Belum ada materi yang kamu buat." />
              ) : (
                materi.map((m) => (
                  <div key={m._id} className="px-6 py-4 border-b border-[#F9EAF2] last:border-0 flex items-center justify-between gap-4 hover:bg-[#FFF7FB] transition">
                    <div className="min-w-0">
                      <p className="font-bold text-[#59234F]">{m.judul}</p>
                      <p className="text-xs text-[#81506F] mt-0.5">
                        {m.mataPelajaran} &middot; {m.kelas} &middot; {m.tipe === "pdf" ? "PDF" : "Tautan"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={m.fileUrl} target="_blank" rel="noreferrer" className={btnGhost}>
                        Buka
                      </a>
                      <button onClick={() => hapusMateri(m._id)} className="px-3 py-1.5 rounded-xl text-red-600 text-xs font-semibold hover:bg-red-50 transition">
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </Box>
          )}

          {/* ===== TUGAS ===== */}
          {nav === "tugas" &&
            (detailTugas ? (
              <Box
                title={`Kumpulan Siswa: ${detailTugas.judul}`}
                action={
                  <button onClick={() => setDetailTugas(null)} className={btnGhost}>
                    Kembali ke Daftar Tugas
                  </button>
                }
              >
                <div className="px-6 py-3.5 border-b border-[#F0DCE8] bg-[#FFF9FC] text-xs font-semibold text-[#81506F]">
                  Kelas {detailTugas.kelas} &middot; {detailTugas.mataPelajaran} &middot; Deadline: {fmtJam(detailTugas.deadline)}
                </div>
                {(detailTugas.submissions || []).length === 0 ? (
                  <Kosong text="Belum ada siswa yang mengumpulkan tugas ini." />
                ) : (
                  detailTugas.submissions?.map((s) => {
                    const sid = typeof s.siswa === "object" && s.siswa !== null ? s.siswa._id : String(s.siswa);
                    const namaSiswa = typeof s.siswa === "object" && s.siswa !== null ? s.siswa.nama : "Siswa";
                    const kelasSiswa = typeof s.siswa === "object" && s.siswa !== null ? s.siswa.kelas : "";
                    return (
                      <div key={sid} className="px-6 py-4 border-b border-[#F9EAF2] last:border-0 flex items-center justify-between gap-4 flex-wrap hover:bg-[#FFF7FB] transition">
                        <div className="min-w-0">
                          <p className="font-bold text-[#59234F]">{namaSiswa}</p>
                          <p className="text-xs text-[#81506F] mt-0.5">
                            {kelasSiswa ? `${kelasSiswa} · ` : ""}Dikumpulkan {fmtJam(s.waktuKumpul)} &middot;{" "}
                            <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-[#D94383] font-semibold underline hover:text-[#70295F]">
                              {s.tipe === "pdf" ? s.namaFile || "Lihat File PDF" : "Buka Tautan Tugas"}
                            </a>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="Nilai"
                            value={nilaiInput[sid] ?? ""}
                            onChange={(e) => setNilaiInput({ ...nilaiInput, [sid]: e.target.value })}
                            className="w-20 px-3 py-1.5 rounded-xl border border-[#E8D5E1] text-sm text-center font-bold text-[#59234F] focus:outline-none focus:ring-2 focus:ring-[#D94383]"
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
                action={
                  <button onClick={() => setShowTugasForm((v) => !v)} className={btnPrimary}>
                    {showTugasForm ? "Tutup Form" : "+ Tambah Tugas"}
                  </button>
                }
              >
                {showTugasForm && (
                  <div className="px-6 py-5 border-b border-[#F0DCE8] bg-[#FFF9FC] space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Judul Tugas">
                        <input
                          placeholder="Contoh: Latihan 1 - Struktur Algoritma"
                          value={tugasForm.judul}
                          onChange={(e) => setTugasForm({ ...tugasForm, judul: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Mata Pelajaran">
                        {daftarMapel.length ? (
                          <select value={tugasForm.mataPelajaran} onChange={(e) => setTugasForm({ ...tugasForm, mataPelajaran: e.target.value })} className={inputCls}>
                            <option value="">Pilih mata pelajaran</option>
                            {daftarMapel.map((m: string) => <option key={m} value={m}>{m}</option>)}
                          </select>
                        ) : (
                          <input value={tugasForm.mataPelajaran} onChange={(e) => setTugasForm({ ...tugasForm, mataPelajaran: e.target.value })} placeholder="Contoh: Basis Data" className={inputCls} />
                        )}
                      </Field>
                      <Field label="Kelas">
                        <select value={tugasForm.kelas} onChange={(e) => setTugasForm({ ...tugasForm, kelas: e.target.value })} className={inputCls}>
                          <option value="">Pilih kelas</option>
                          {kelasList.map((k) => <option key={k._id} value={k.namaKelas}>{k.namaKelas}</option>)}
                        </select>
                      </Field>
                      <Field label="Batas Waktu (Deadline)">
                        <input type="datetime-local" value={tugasForm.deadline} onChange={(e) => setTugasForm({ ...tugasForm, deadline: e.target.value })} className={inputCls} />
                      </Field>
                    </div>
                    <Field label="Petunjuk / Deskripsi Tugas (opsional)">
                      <textarea
                        rows={3}
                        placeholder="Tuliskan petunjuk pengerjaan tugas untuk siswa..."
                        value={tugasForm.deskripsi}
                        onChange={(e) => setTugasForm({ ...tugasForm, deskripsi: e.target.value })}
                        className={inputCls}
                      />
                    </Field>
                    {pesanTugas && <p className="text-xs font-semibold text-red-600">{pesanTugas}</p>}
                    <button onClick={simpanTugas} disabled={savingTugas} className={btnPrimary}>
                      {savingTugas ? "Menyimpan..." : "Simpan Tugas"}
                    </button>
                  </div>
                )}

                {loading ? (
                  <Kosong text="Memuat..." />
                ) : tugas.length === 0 ? (
                  <Kosong text="Belum ada tugas yang kamu buat." />
                ) : (
                  tugas.map((t) => (
                    <div key={t._id} className="px-6 py-4 border-b border-[#F9EAF2] last:border-0 flex items-center justify-between gap-4 hover:bg-[#FFF7FB] transition">
                      <div className="min-w-0">
                        <p className="font-bold text-[#59234F]">{t.judul}</p>
                        <p className="text-xs text-[#81506F] mt-0.5">
                          {t.kelas} &middot; Deadline: {fmtJam(t.deadline)} &middot;{" "}
                          <span className="font-semibold text-[#D94383]">{t.jumlahKumpul || 0} terkumpul</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => lihatTugas(t)} className={btnGhost}>
                          Lihat & Nilai
                        </button>
                        <button onClick={() => hapusTugas(t._id)} className="px-3 py-1.5 rounded-xl text-red-600 text-xs font-semibold hover:bg-red-50 transition">
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </Box>
            ))}

          {/* ===== KUIS ===== */}
          {nav === "kuis" &&
            (hasilKuisDetail ? (
              <Box
                title={`Hasil Kuis: ${hasilKuisDetail.judul}`}
                action={
                  <button onClick={() => setHasilKuisDetail(null)} className={btnGhost}>
                    Kembali ke Daftar Kuis
                  </button>
                }
              >
                <div className="px-6 py-3.5 border-b border-[#F0DCE8] bg-[#FFF9FC] text-xs font-semibold text-[#81506F]">
                  {hasilKuisDetail.kelas} &middot; {hasilKuisDetail.mataPelajaran} &middot; {hasilKuisDetail.jumlahSoal} soal
                </div>
                {hasilKuisDetail.attempts.length === 0 ? (
                  <Kosong text="Belum ada siswa yang mengerjakan kuis ini." />
                ) : (
                  hasilKuisDetail.attempts.map((a, i) => {
                    const namaSiswa = typeof a.siswa === "object" && a.siswa !== null ? (a.siswa as SiswaPopulated).nama : "Siswa";
                    const kelasSiswa = typeof a.siswa === "object" && a.siswa !== null ? (a.siswa as SiswaPopulated).kelas : "";
                    return (
                      <div key={i} className="px-6 py-3.5 border-b border-[#F9EAF2] last:border-0 flex items-center justify-between gap-4 hover:bg-[#FFF7FB] transition">
                        <div className="min-w-0">
                          <p className="font-bold text-[#59234F]">{namaSiswa}</p>
                          <p className="text-xs text-[#81506F]">{kelasSiswa ? `${kelasSiswa} · ` : ""}Selesai {fmtJam(a.waktuSelesai)}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold shrink-0">
                          Skor: {a.skor}
                        </span>
                      </div>
                    );
                  })
                )}
              </Box>
            ) : (
              <Box
                title="Kuis Saya"
                action={
                  <button onClick={() => setShowKuisForm((v) => !v)} className={btnPrimary}>
                    {showKuisForm ? "Tutup Form" : "+ Buat Kuis"}
                  </button>
                }
              >
                {showKuisForm && (
                  <div className="px-6 py-5 border-b border-[#F0DCE8] bg-[#FFF9FC] space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Judul Kuis">
                        <input
                          placeholder="Contoh: Kuis 1 - Pemahaman Dasar"
                          value={kuisForm.judul}
                          onChange={(e) => setKuisForm({ ...kuisForm, judul: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Mata Pelajaran">
                        {daftarMapel.length ? (
                          <select value={kuisForm.mataPelajaran} onChange={(e) => setKuisForm({ ...kuisForm, mataPelajaran: e.target.value })} className={inputCls}>
                            <option value="">Pilih mata pelajaran</option>
                            {daftarMapel.map((m: string) => <option key={m} value={m}>{m}</option>)}
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
                      <Field label="Durasi Pengerjaan (menit)">
                        <input
                          type="number"
                          min={1}
                          value={kuisForm.durasiMenit}
                          onChange={(e) => setKuisForm({ ...kuisForm, durasiMenit: Number(e.target.value) })}
                          className={inputCls}
                        />
                      </Field>
                    </div>
                    <Field label="Petunjuk Kuis (opsional)">
                      <textarea
                        rows={2}
                        placeholder="Petunjuk khusus untuk pengerjaan kuis..."
                        value={kuisForm.deskripsi}
                        onChange={(e) => setKuisForm({ ...kuisForm, deskripsi: e.target.value })}
                        className={inputCls}
                      />
                    </Field>

                    <div className="space-y-4 pt-2">
                      <p className="text-sm font-bold text-[#59234F]">Daftar Soal Pilihan Ganda</p>
                      {soalForm.map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-[#F0DCE8] p-4.5 space-y-3 shadow-sm">
                          <div className="flex items-start gap-2.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FCE4F0] text-xs font-bold text-[#B52D78]">
                              {i + 1}
                            </span>
                            <input
                              placeholder="Tuliskan pertanyaan soal di sini..."
                              value={s.pertanyaan}
                              onChange={(e) => updatePertanyaan(i, e.target.value)}
                              className={inputCls + " flex-1"}
                            />
                            {soalForm.length > 1 && (
                              <button
                                onClick={() => hapusSoal(i)}
                                className="text-red-600 text-xs font-semibold px-2.5 py-2 hover:bg-red-50 rounded-xl transition shrink-0"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pl-9">
                            {s.pilihan.map((p, pIdx) => (
                              <label key={pIdx} className="flex items-center gap-2 p-1.5 rounded-xl border border-[#F0DCE8] bg-[#FFF9FC] hover:bg-white transition">
                                <input
                                  type="radio"
                                  name={`jawaban-${i}`}
                                  checked={s.jawabanBenar === pIdx}
                                  onChange={() => updateJawabanBenar(i, pIdx)}
                                  className="accent-[#70295F] ml-1.5 h-4 w-4"
                                />
                                <input
                                  placeholder={`Pilihan ${String.fromCharCode(65 + pIdx)}`}
                                  value={p}
                                  onChange={(e) => updatePilihan(i, pIdx, e.target.value)}
                                  className="w-full bg-transparent px-2 py-1 text-sm text-[#59234F] focus:outline-none"
                                />
                              </label>
                            ))}
                          </div>
                          <p className="text-[11px] text-[#B596AA] pl-9">
                            Pilih bulatan di sebelah kiri opsi untuk menandai jawaban yang benar.
                          </p>
                        </div>
                      ))}
                      <button onClick={tambahSoal} className={btnGhost + " !text-xs font-semibold"}>
                        + Tambah Soal Baru
                      </button>
                    </div>

                    {pesanKuis && <p className="text-xs font-semibold text-red-600">{pesanKuis}</p>}
                    <button onClick={simpanKuis} disabled={savingKuis} className={btnPrimary}>
                      {savingKuis ? "Menyimpan..." : "Simpan Kuis"}
                    </button>
                  </div>
                )}

                {loading ? (
                  <Kosong text="Memuat..." />
                ) : kuisList.length === 0 ? (
                  <Kosong text="Belum ada kuis yang kamu buat." />
                ) : (
                  kuisList.map((k) => (
                    <div key={k._id} className="px-6 py-4 border-b border-[#F9EAF2] last:border-0 flex items-center justify-between gap-4 hover:bg-[#FFF7FB] transition">
                      <div className="min-w-0">
                        <p className="font-bold text-[#59234F]">{k.judul}</p>
                        <p className="text-xs text-[#81506F] mt-0.5">
                          {k.kelas} &middot; {k.jumlahSoal} soal &middot; {k.jumlahMengerjakan || 0} siswa mengerjakan
                          {k.rataRata != null && ` · Rata-rata: ${k.rataRata}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => lihatHasilKuis(k)} className={btnGhost}>
                          Lihat Hasil
                        </button>
                        <button onClick={() => hapusKuis(k._id)} className="px-3 py-1.5 rounded-xl text-red-600 text-xs font-semibold hover:bg-red-50 transition">
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </Box>
            ))}

          {/* ===== NILAI ===== */}
          {nav === "nilai" && (
            <Box
              title="Nilai Manual"
              action={
                <button onClick={() => setShowNilaiForm((v) => !v)} className={btnPrimary}>
                  {showNilaiForm ? "Tutup Form" : "+ Input Nilai"}
                </button>
              }
            >
              {showNilaiForm && (
                <div className="px-6 py-5 border-b border-[#F0DCE8] bg-[#FFF9FC] space-y-4">
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
                          {daftarMapel.map((m: string) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      ) : (
                        <input value={nilaiForm.mataPelajaran} onChange={(e) => setNilaiForm({ ...nilaiForm, mataPelajaran: e.target.value })} placeholder="Contoh: Matematika" className={inputCls} />
                      )}
                    </Field>
                    <Field label="Jenis Penilaian">
                      <select value={nilaiForm.jenis} onChange={(e) => setNilaiForm({ ...nilaiForm, jenis: e.target.value as "penilaian_manual" | "kuis" | "ujian_online" | "tugas" })} className={inputCls}>
                        <option value="penilaian_manual">Penilaian Manual</option>
                        <option value="tugas">Tugas</option>
                        <option value="kuis">Kuis</option>
                        <option value="ujian_online">Ujian Online</option>
                      </select>
                    </Field>
                    <Field label="Nilai (0-100)">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Contoh: 85"
                        value={nilaiForm.nilai}
                        onChange={(e) => setNilaiForm({ ...nilaiForm, nilai: e.target.value })}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  {pesanNilai && <p className="text-xs font-semibold text-red-600">{pesanNilai}</p>}
                  <button onClick={simpanNilaiManual} disabled={savingNilai} className={btnPrimary}>
                    {savingNilai ? "Menyimpan..." : "Simpan Nilai"}
                  </button>
                </div>
              )}

              {loading ? (
                <Kosong text="Memuat..." />
              ) : nilaiList.length === 0 ? (
                <Kosong text="Belum ada nilai yang kamu input." />
              ) : (
                nilaiList.map((n) => {
                  const namaSiswa = typeof n.siswa === "object" && n.siswa !== null ? (n.siswa as SiswaPopulated).nama : "Siswa";
                  return (
                    <div key={n._id} className="px-6 py-4 border-b border-[#F9EAF2] last:border-0 flex items-center justify-between gap-4 hover:bg-[#FFF7FB] transition">
                      <div className="min-w-0">
                        <p className="font-bold text-[#59234F]">{namaSiswa}</p>
                        <p className="text-xs text-[#81506F]">{n.mataPelajaran} &middot; {n.kelas} &middot; {n.jenis}</p>
                      </div>
                      <span className="font-extrabold text-xl text-[#59234F] shrink-0">{n.nilai}</span>
                    </div>
                  );
                })
              )}
            </Box>
          )}

          {/* ===== PROFIL ===== */}
          {nav === "profil" && (
            <Box title="Profil Saya">
              <div className="px-6 py-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#70295F] text-white text-2xl font-bold flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                    {profilForm.foto ? <img src={profilForm.foto} alt="" className="w-full h-full object-cover" /> : user.nama?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <label className="inline-block px-3.5 py-1.5 rounded-xl border border-[#F0DCE8] text-xs font-semibold text-[#70295F] cursor-pointer hover:bg-[#FFF0F6] transition shadow-sm">
                      Ganti Foto
                      <input type="file" accept="image/*" onChange={pilihFoto} className="hidden" />
                    </label>
                    <p className="text-[11px] text-[#B596AA] mt-1">JPG/PNG, maks 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="p-3.5 rounded-xl bg-[#FFF9FC] border border-[#F0DCE8]">
                    <label className="text-xs font-semibold text-[#81506F]">Nama</label>
                    <p className="text-sm text-[#59234F] font-bold mt-1">{user.nama}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FFF9FC] border border-[#F0DCE8]">
                    <label className="text-xs font-semibold text-[#81506F]">Email (Login)</label>
                    <p className="text-sm text-[#59234F] font-bold mt-1">{user.email || "-"}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FFF9FC] border border-[#F0DCE8]">
                    <label className="text-xs font-semibold text-[#81506F]">NIP</label>
                    <p className="text-sm text-[#59234F] font-bold mt-1">{user.nip || "-"}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FFF9FC] border border-[#F0DCE8]">
                    <label className="text-xs font-semibold text-[#81506F]">Mata Pelajaran</label>
                    <p className="text-sm text-[#59234F] font-bold mt-1">{user.mataPelajaran?.join(", ") || "-"}</p>
                  </div>
                </div>

                <p className="text-xs text-[#B596AA] mb-4">
                  Data di atas cuma bisa diubah oleh Admin. Kamu bisa ubah data di bawah ini sendiri:
                </p>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-semibold text-[#81506F]">No. Telepon</label>
                    <input
                      value={profilForm.noTelepon}
                      onChange={(e) => setProfilForm({ ...profilForm, noTelepon: e.target.value })}
                      className={inputCls + " mt-1"}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#81506F]">Alamat</label>
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
                  {profilPesan && <p className="text-xs font-semibold text-[#81506F]">{profilPesan}</p>}
                </div>
              </div>
            </Box>
          )}
        </div>
      </main>
    </div>
  );
}
