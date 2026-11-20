"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import type {
  UserItem,
  MateriItem,
  TugasItem,
  NilaiItem,
  PengumumanItem,
  KuisItem,
  GuruPopulated,
} from "@/types/lms";

const PATHS: Record<string, string> = {
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

function fmtWaktu(detik: number | null | undefined): string {
  if (detik == null) return "";
  const m = Math.floor(detik / 60);
  const s = detik % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const fmt = (d: string | Date | undefined | null) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

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

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0DCE8] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#F0DCE8]">
        <h2 className="font-semibold text-[#59234F]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

const Kosong = ({ text }: { text: string }) => <p className="px-6 py-10 text-sm text-[#B596AA] text-center">{text}</p>;

function Pengumuman({ list }: { list: PengumumanItem[] }) {
  return (
    <>
      {list.map((p) => (
        <div key={p._id} className="px-6 py-4 border-b border-[#F9EAF2] last:border-0">
          <div className="flex items-center gap-2 mb-1">
            {p.prioritas === "penting" && (
              <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-semibold">Penting</span>
            )}
            <span className="text-xs text-[#B596AA]">{fmt(p.createdAt)}</span>
          </div>
          <p className="font-semibold text-[#59234F]">{p.judul}</p>
          <p className="text-sm text-[#8B6B82] mt-1 whitespace-pre-line">{p.isi}</p>
        </div>
      ))}
    </>
  );
}

interface KuisAktifState extends KuisItem {
  waktuBerakhir?: number;
  jawabanSaya: (number | null)[];
}

interface HasilKuisState {
  skor: number;
  benar?: number;
  total?: number;
  selesai: boolean;
  otomatis?: boolean;
}

export default function SiswaDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserItem | null>(null);
  const [nav, setNav] = useState("beranda");
  const [loading, setLoading] = useState(true);
  const [materi, setMateri] = useState<MateriItem[]>([]);
  const [tugas, setTugas] = useState<TugasItem[]>([]);
  const [nilai, setNilai] = useState<NilaiItem[]>([]);
  const [pengumuman, setPengumuman] = useState<PengumumanItem[]>([]);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [pesan, setPesan] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<Record<string, "link" | "pdf">>({});
  const [fileTerpilih, setFileTerpilih] = useState<Record<string, { dataUrl: string; namaFile: string } | null>>({});

  // ==== Kuis / Ujian Online ====
  const [kuisList, setKuisList] = useState<KuisItem[]>([]);
  const [kuisAktif, setKuisAktif] = useState<KuisAktifState | null>(null);
  const [hasilKuis, setHasilKuis] = useState<HasilKuisState | null>(null);
  const [sisaDetik, setSisaDetik] = useState<number | null>(null);
  const kumpulkanKuisRef = useRef<(otomatis?: boolean) => void>(() => {});

  // ==== Preview materi (PDF) ====
  const [previewMateri, setPreviewMateri] = useState<string | null>(null);

  // ==== Profil ====
  const [profilForm, setProfilForm] = useState({ noTelepon: "", alamat: "", foto: "" });
  const [savingProfil, setSavingProfil] = useState(false);
  const [profilPesan, setProfilPesan] = useState("");

  // ==== Notifikasi & Navigasi Mobile ====
  const [bellOpen, setBellOpen] = useState(false);
  const [bellExpand, setBellExpand] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("lms_user");
    if (!s) {
      router.push("/login");
      return;
    }
    const u: UserItem = JSON.parse(s);
    if (u.role !== "siswa") {
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
    const k = encodeURIComponent(u.kelas || "");
    const [m, t, n, p, q] = await Promise.all([
      j<MateriItem>(`/api/materi?kelas=${k}`),
      j<TugasItem>(`/api/tugas?kelas=${k}&siswa=${u._id}`),
      j<NilaiItem>(`/api/nilai?siswa=${u._id}`),
      j<PengumumanItem>("/api/pengumuman?target=siswa"),
      j<KuisItem>(`/api/kuis?kelas=${k}&siswa=${u._id}`),
    ]);
    setMateri(m); setTugas(t); setNilai(n); setPengumuman(p); setKuisList(q);
    setLoading(false);
  }

  // Mulai kerjakan kuis, atau langsung tampilkan hasil kalau sudah pernah dikerjakan
  async function mulaiKuis(k: KuisItem) {
    if (!user) return;
    const res = await fetch(`/api/kuis/${k._id}?siswa=${user._id}`);
    const r = await res.json();
    if (!r.success) return;
    const d = r.data;

    if (d.sudahDikerjakan) {
      setHasilKuis({ skor: d.skor, selesai: true });
      setSisaDetik(null);
      setKuisAktif({
        ...d,
        jawabanSaya: d.soal.map((s: { jawabanSaya?: number | null }) => (s.jawabanSaya != null ? s.jawabanSaya : null)),
      });
      return;
    }

    setHasilKuis(null);
    setKuisAktif({
      ...d,
      waktuBerakhir: Date.now() + d.durasiMenit * 60 * 1000,
      jawabanSaya: Array(d.soal.length).fill(null),
    });
  }

  function pilihJawabanKuis(i: number, idx: number) {
    if (hasilKuis?.selesai) return;
    setKuisAktif((prev) => {
      if (!prev) return null;
      const jawabanSaya = [...prev.jawabanSaya];
      jawabanSaya[i] = idx;
      return { ...prev, jawabanSaya };
    });
  }

  async function kumpulkanKuis(otomatis = false) {
    if (!kuisAktif || hasilKuis?.selesai || !user) return;
    const jawaban = kuisAktif.jawabanSaya.map((j) => (j == null ? -1 : j));
    const res = await fetch(`/api/kuis/${kuisAktif._id}/kumpul`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siswaId: user._id, jawaban }),
    });
    const r = await res.json();

    if (r.success) {
      setHasilKuis({ ...r.data, selesai: true, otomatis });
      setKuisAktif((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          soal: prev.soal.map((s, i) => ({ ...s, jawabanBenar: r.data.pembahasan[i] })),
        };
      });
      muat(user);
    } else {
      setPesan((prev) => ({ ...prev, kuis: r.message }));
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
    if (!kuisAktif || hasilKuis?.selesai || !kuisAktif.waktuBerakhir) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const tick = () => {
      const sisa = Math.max(0, Math.round((kuisAktif.waktuBerakhir! - Date.now()) / 1000));
      setSisaDetik(sisa);
      if (sisa <= 0) {
        if (interval) clearInterval(interval);
        kumpulkanKuisRef.current(true);
      }
    };
    tick();
    interval = setInterval(tick, 1000);
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kuisAktif?._id, hasilKuis?.selesai, kuisAktif?.waktuBerakhir]);

  function pilihFile(t: TugasItem, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setPesan((prev) => ({ ...prev, [t._id]: "File harus berformat PDF" }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPesan((prev) => ({ ...prev, [t._id]: "Ukuran PDF maksimal 10MB" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFileTerpilih((prev) => ({ ...prev, [t._id]: { dataUrl: reader.result as string, namaFile: file.name } }));
        setPesan((prev) => ({ ...prev, [t._id]: "" }));
      }
    };
    reader.readAsDataURL(file);
  }

  async function kumpul(t: TugasItem) {
    if (!user) return;
    const modeAktif = mode[t._id] || "link";
    let payload: { siswaId: string; fileUrl: string; namaFile?: string; tipe: "link" | "pdf" };

    if (modeAktif === "pdf") {
      const dipilih = fileTerpilih[t._id];
      if (!dipilih) return setPesan((prev) => ({ ...prev, [t._id]: "Pilih file PDF dulu" }));
      payload = { siswaId: user._id, fileUrl: dipilih.dataUrl, namaFile: dipilih.namaFile, tipe: "pdf" };
    } else {
      const fileUrl = (links[t._id] || "").trim();
      if (!fileUrl) return setPesan((prev) => ({ ...prev, [t._id]: "Isi link tugas dulu" }));
      payload = { siswaId: user._id, fileUrl, tipe: "link" };
    }

    const res = await fetch(`/api/tugas/${t._id}/kumpul`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const r = await res.json();

    setPesan((prev) => ({ ...prev, [t._id]: r.success ? "Tugas berhasil dikumpulkan" : r.message }));
    if (r.success) {
      setLinks((prev) => ({ ...prev, [t._id]: "" }));
      setFileTerpilih((prev) => ({ ...prev, [t._id]: null }));
      muat(user);
    }
  }

  function logout() {
    localStorage.removeItem("lms_user");
    router.push("/login");
  }

  function pilihFoto(e: ChangeEvent<HTMLInputElement>) {
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
    const res = await fetch(`/api/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilForm),
    });
    const r = await res.json();
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

  // Gabungan aktivitas terbaru buat notifikasi bell (materi, tugas, kuis, pengumuman)
  const aktivitas = [
    ...materi.map((m) => ({ judul: `Materi baru: ${m.judul}`, waktu: m.createdAt })),
    ...tugas.map((t) => ({ judul: `Tugas baru: ${t.judul}`, waktu: t.createdAt })),
    ...kuisList.map((k) => ({ judul: `Kuis baru: ${k.judul}`, waktu: k.createdAt })),
    ...pengumuman.map((p) => ({ judul: `Pengumuman: ${p.judul}`, waktu: p.createdAt })),
  ]
    .filter((a): a is { judul: string; waktu: string } => typeof a.waktu === "string")
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
              {user.foto ? <img src={user.foto} alt="" className="w-full h-full object-cover" /> : user.nama?.[0]?.toUpperCase() || "S"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{user.nama}</span>
              <span className="block truncate text-[11px] text-white/60">Siswa · {user.kelas || "-"}</span>
            </span>
          </div>
          <button onClick={logout} title="Logout" className="flex min-h-[42px] w-full items-center justify-start gap-3 rounded-xl px-3.5 py-2 text-[13px] font-semibold text-white/75 transition hover:bg-white/10 hover:text-white md:justify-center lg:justify-start">
            <Ico k="logout" className="h-[19px] w-[19px] shrink-0" />
            <span className="md:hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

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
            <span className="font-bold text-sm text-[#59234F] truncate md:hidden">SMK Citra Negara</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            <ThemeToggle compact />

            <div className="relative">
              <button
                onClick={() => { setBellOpen((v) => !v); setBellExpand(false); }}
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
                    <p className="text-sm font-semibold text-[#59234F]">Aktivitas Terbaru</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {aktivitas.length === 0 ? (
                      <p className="px-4 py-6 text-xs text-[#B596AA] text-center">Belum ada aktivitas.</p>
                    ) : (
                      (bellExpand ? aktivitas.slice(0, 20) : aktivitas.slice(0, 5)).map((a, i) => (
                        <div key={i} className="px-4 py-2.5 border-b border-[#F9EAF2] last:border-0">
                          <p className="text-xs text-[#59234F]">{a.judul}</p>
                          <p className="text-[10px] text-[#B596AA] mt-0.5">{waktuRelatif(a.waktu)}</p>
                        </div>
                      ))
                    )}
                  </div>
                  {aktivitas.length > 5 && (
                    <button onClick={() => setBellExpand((v) => !v)} className="w-full px-4 py-2 text-xs font-medium text-[#59234F] hover:bg-[#FFF7FB] transition border-t border-[#F0DCE8]">
                      {bellExpand ? "Sembunyikan" : "Lihat Semua"}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="h-7 sm:h-10 w-px bg-[#F0DCE8]" />

            <button onClick={() => setNav("profil")} className="flex items-center gap-2 sm:gap-3 text-left">
              <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#70295F] text-white text-xs sm:text-sm font-bold flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {user.foto ? <img src={user.foto} alt="" className="w-full h-full object-cover" /> : user.nama?.[0]?.toUpperCase()}
              </span>
              <span className="hidden sm:block">
                <span className="block text-sm font-bold text-[#59234F]">{user.nama}</span>
                <span className="block text-xs text-[#B596AA]">Siswa · {user.kelas || "-"}</span>
              </span>
            </button>
          </div>
        </header>

      <div className="w-full min-w-0 flex-1 px-3 py-4 sm:px-6 sm:py-6 xl:px-8 xl:py-6">
        {nav === "beranda" && (
          <>
            <section className="relative mb-5 min-h-[190px] sm:min-h-[230px] w-full overflow-hidden rounded-[26px] border border-[#F1CFE0] bg-gradient-to-r from-[#FCE5F0] via-[#F8D8E8] to-[#E9BBD4] shadow-[0_8px_28px_rgba(91,31,75,0.07)] lg:min-h-[245px]">
              <div className="relative z-10 box-border w-full md:w-[60%] lg:w-[58%] min-w-0 px-5 py-6 sm:px-8 lg:px-9 lg:py-8">
                <span className="inline-flex items-center rounded-full bg-[#70295F] text-white px-3 py-1 text-[10px] font-bold tracking-wider">RUANG BELAJAR SISWA</span>
                <h1 className="text-2xl sm:text-3xl xl:text-[38px] leading-tight font-extrabold text-[#572047] mt-3">Halo, {user?.nama ? user.nama.split(" ")[0] : "Siswa"}!<br />Semangat belajar hari ini.</h1>
                <p className="text-xs sm:text-sm xl:text-base text-[#81506F] mt-2 sm:mt-3 leading-relaxed max-w-[560px]">Pantau materi, kerjakan tugas, ikuti kuis, dan lihat perkembangan belajarmu di LMS SMK Citra Negara.</p>
                <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-[#70295F]">
                  <span className="w-2 h-2 rounded-full bg-[#D94383]" /> Kelas {user.kelas || "-"}
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-0 right-0 top-0 flex w-[55%] sm:w-[48%] md:w-[44%] items-end justify-center opacity-30 md:opacity-95">
                <svg viewBox="0 0 520 260" className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <circle cx="405" cy="48" r="58" fill="#F9EAF2" opacity=".65"/>
                  <path d="M40 116 250 28 470 116v144H40Z" fill="#F9F0F5" stroke="#B66C98" strokeWidth="7"/>
                  <path d="M18 119 250 18 493 119" fill="none" stroke="#9C4D7D" strokeWidth="13" strokeLinejoin="round"/>
                  <path d="M75 137h350v8H75zM75 205h350v8H75z" fill="#D49AB8"/>
                  {Array.from({length:6},(_,i)=><g key={i}><rect x={88+i*55} y="153" width="36" height="38" rx="4" fill="#B66C98"/><path d={`M${106+i*55} 153v38`} stroke="#F9EAF2" strokeWidth="3"/></g>)}
                  <path d="M0 247h520v13H0z" fill="#B66C98"/>
                  <path d="M28 188c-28-35 4-72 32-52 17-34 60-15 49 17 27 16 13 52-18 52H28Z" fill="#789B7D"/>
                  <path d="M72 200v55" stroke="#8D6B4F" strokeWidth="10"/>
                  <path d="M445 193c-25-32 3-66 29-48 16-31 54-14 44 16 24 15 12 47-16 47h-57Z" fill="#789B7D"/>
                  <path d="M478 205v50" stroke="#8D6B4F" strokeWidth="9"/>
                </svg>
              </div>
            </section>
            <div className="mb-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-5">
              {stats.map(([label, v], i) => (
                <div key={label} className="flex min-h-[92px] sm:min-h-[116px] items-center gap-2.5 sm:gap-3 rounded-2xl border border-[#F5D8E7] bg-white px-3 sm:px-4 py-2.5 sm:py-3.5 shadow-[0_4px_14px_rgba(91,31,75,0.045)]">
                  <span className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-[#FCE4F0] text-[#B52D78]">
                    <Ico k={["materi","tugas","kuis","nilai","pengumuman"][i]} className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[11px] sm:text-xs font-semibold leading-snug text-[#81506F]">{label}</p>
                    <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl lg:text-3xl font-extrabold leading-none text-[#59234F]">{v}</p>
                  </div>
                </div>
              ))}
            </div>
            <section className="overflow-hidden rounded-[24px] border border-[#F5D8E7] bg-white shadow-[0_6px_22px_rgba(91,31,75,0.05)]">
              <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FCE4F0] text-[#B52D78]">
                  <Ico k="pengumuman" className="h-6 w-6" />
                </span>
                <h2 className="text-lg font-bold text-[#59234F] sm:text-xl">Pengumuman Terbaru</h2>
                <button onClick={() => setNav("pengumuman")} className="ml-auto shrink-0 text-xs font-semibold text-[#D94383] transition hover:text-[#70295F] sm:text-sm">
                  Lihat Semua <span aria-hidden="true">→</span>
                </button>
              </div>
              <div className="mx-5 h-px bg-[#F5D8E7]" />
              {pengumuman.length === 0 ? (
                <div className="flex min-h-[190px] flex-col items-center justify-center px-5 py-7 text-center">
                  <div className="relative mb-3 flex h-[82px] w-[190px] items-center justify-center">
                    <div className="absolute bottom-1 h-10 w-44 rounded-full bg-[#FCE4F0]" />
                    <div className="absolute bottom-2 left-3 h-10 w-20 rounded-full bg-[#FCEAF3]" />
                    <div className="absolute bottom-2 right-3 h-9 w-20 rounded-full bg-[#FCEAF3]" />
                    <svg viewBox="0 0 120 100" className="relative z-10 h-[82px] w-[100px] -rotate-6" aria-hidden="true">
                      <path d="M18 38 76 18v56L18 54Z" fill="#EFA5CA" />
                      <path d="M76 18 103 9v74L76 74Z" fill="#B52D78" />
                      <path d="M26 54 42 82q5 8 13 2l7-6-20-26Z" fill="#76245F" />
                      <path d="M34 42 76 28v35L34 50Z" fill="#FFF5FA" opacity=".9" />
                      <path d="m93 4 9-9M108 23l12-3M108 67l12 4" stroke="#D94383" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-[#59234F]">Belum ada pengumuman terbaru</p>
                  <p className="mt-1 text-xs text-[#B596AA] sm:text-sm">Informasi dari sekolah dan guru akan muncul di sini.</p>
                </div>
              ) : <Pengumuman list={pengumuman.slice(0, 3)} />}
            </section>
          </>
        )}

        {nav === "materi" && (
          <Box title="Materi Pembelajaran">
            {loading ? <Kosong text="Memuat..." /> : materi.length === 0 ? <Kosong text="Belum ada materi untuk kelasmu." /> : materi.map((m) => {
              const guruNama = typeof m.guru === "object" && m.guru !== null ? (m.guru as GuruPopulated).nama : "Guru";
              return (
                <div key={m._id} className="border-b border-[#F9EAF2] last:border-0">
                  <div className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#59234F]">{m.judul}</p>
                      <p className="text-xs text-[#B596AA] mt-0.5">
                        {m.mataPelajaran} &middot; {guruNama} &middot; {m.tipe === "pdf" ? "PDF" : "Tautan"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {m.tipe === "pdf" && (
                        <button
                          onClick={() => setPreviewMateri(previewMateri === m._id ? null : m._id)}
                          className="px-3 py-2 rounded-lg border border-[#E8C9DA] text-[#59234F] text-xs font-medium hover:bg-[#FFF7FB] transition"
                        >
                          {previewMateri === m._id ? "Tutup" : "Pratinjau"}
                        </button>
                      )}
                      <a href={m.fileUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-[#59234F] text-white text-xs font-medium hover:bg-[#D85A93] hover:text-[#59234F] transition">
                        Buka
                      </a>
                    </div>
                  </div>
                  {previewMateri === m._id && (
                    <div className="px-6 pb-5">
                      <iframe src={m.fileUrl} className="w-full h-[480px] rounded-lg border border-[#F0DCE8]" title={m.judul} />
                    </div>
                  )}
                </div>
              );
            })}
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
                <div key={t._id} className="px-6 py-5 border-b border-[#F9EAF2] last:border-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-[#59234F]">{t.judul}</p>
                      <p className="text-xs text-[#B596AA] mt-0.5">
                        {t.mataPelajaran} &middot; Deadline {fmt(t.deadline)}
                      </p>
                      {t.deskripsi && <p className="text-sm text-[#8B6B82] mt-2">{t.deskripsi}</p>}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge[1]}`}>{badge[0]}</span>
                  </div>
                  {t.pengumpulan?.nilai != null && (
                    <p className="text-sm text-[#59234F] mt-2">Nilai: <strong>{t.pengumpulan.nilai}</strong></p>
                  )}

                  {t.pengumpulan && (
                    <p className="text-xs text-[#8B6B82] mt-2">
                      Terkumpul:{" "}
                      <a href={t.pengumpulan.fileUrl} target="_blank" rel="noreferrer" className="text-[#59234F] font-medium underline">
                        {t.pengumpulan.tipe === "pdf" ? t.pengumpulan.namaFile || "Lihat PDF" : "Lihat link"}
                      </a>
                    </p>
                  )}

                  <div className="mt-3">
                    <div className="flex gap-1 mb-2">
                      <button
                        onClick={() => setMode({ ...mode, [t._id]: "link" })}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                          (mode[t._id] || "link") === "link" ? "bg-[#59234F] text-white" : "bg-[#FFF7FB] text-[#8B6B82]"
                        }`}
                      >
                        Link
                      </button>
                      <button
                        onClick={() => setMode({ ...mode, [t._id]: "pdf" })}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                          mode[t._id] === "pdf" ? "bg-[#59234F] text-white" : "bg-[#FFF7FB] text-[#8B6B82]"
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
                          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-[#E8C9DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A93]"
                        />
                      ) : (
                        <label className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-dashed border-[#E8C9DA] text-sm text-[#8B6B82] cursor-pointer hover:bg-[#FFF7FB] transition">
                          {fileTerpilih[t._id]?.namaFile || "Pilih file PDF (maks 10MB)"}
                          <input type="file" accept="application/pdf" onChange={(e) => pilihFile(t, e)} className="hidden" />
                        </label>
                      )}
                      <button onClick={() => kumpul(t)} className="px-4 py-2 rounded-lg bg-[#59234F] text-white text-sm font-medium hover:bg-[#D85A93] hover:text-[#59234F] transition">
                        {t.pengumpulan ? "Kirim ulang" : "Kumpulkan"}
                      </button>
                    </div>
                  </div>
                  {pesan[t._id] && <p className="text-xs text-[#8B6B82] mt-2">{pesan[t._id]}</p>}
                </div>
              );
            })}
          </Box>
        )}

        {nav === "kuis" && (
          kuisAktif ? (
            <div className="bg-white rounded-2xl border border-[#F0DCE8] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F0DCE8] flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-semibold text-[#59234F]">{kuisAktif.judul}</h2>
                  <p className="text-xs text-[#B596AA] mt-0.5">
                    {kuisAktif.mataPelajaran} &middot; {typeof kuisAktif.guru === "object" && kuisAktif.guru !== null ? (kuisAktif.guru as GuruPopulated).nama : "Guru"}
                  </p>
                </div>
                {!hasilKuis?.selesai && sisaDetik != null && (
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${sisaDetik < 60 ? "bg-red-50 text-red-600" : "bg-[#FFF7FB] text-[#59234F]"}`}>
                    Sisa waktu: {fmtWaktu(sisaDetik)}
                  </span>
                )}
              </div>

              {hasilKuis?.selesai && (
                <div className="px-6 py-4 bg-[#FFF7FB] border-b border-[#F0DCE8]">
                  <p className="font-semibold text-[#59234F]">
                    Skor kamu: {hasilKuis.skor}
                    {hasilKuis.benar != null && ` (${hasilKuis.benar}/${hasilKuis.total} benar)`}
                  </p>
                  {hasilKuis.otomatis && (
                    <p className="text-xs text-[#8B6B82] mt-1">Waktu habis, jawaban terkirim otomatis.</p>
                  )}
                </div>
              )}

              <div className="px-6 py-5 space-y-6">
                {kuisAktif.soal.map((s, i: number) => (
                  <div key={i}>
                    <p className="font-medium text-[#59234F] mb-2">
                      {i + 1}. {s.pertanyaan}
                    </p>
                    <div className="space-y-1.5">
                      {s.pilihan.map((opsi: string, idx: number) => {
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
                                ? "border-[#D85A93] bg-[#FFF7FB] text-[#59234F]"
                                : "border-[#F0DCE8] text-[#59234F] hover:bg-[#FFF7FB]"
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

              <div className="px-6 py-4 border-t border-[#F0DCE8] flex gap-3">
                <button onClick={tutupKuis} className="px-4 py-2 rounded-lg border border-[#E8C9DA] text-sm font-medium text-[#59234F]">
                  {hasilKuis?.selesai ? "Kembali ke daftar" : "Batal"}
                </button>
                {!hasilKuis?.selesai && (
                  <button
                    onClick={() => kumpulkanKuis(false)}
                    className="px-4 py-2 rounded-lg bg-[#59234F] text-white text-sm font-medium hover:bg-[#D85A93] hover:text-[#59234F] transition"
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
                  <div key={k._id} className="px-6 py-4 border-b border-[#F9EAF2] last:border-0 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-[#59234F]">{k.judul}</p>
                      <p className="text-xs text-[#B596AA] mt-0.5">
                        {k.mataPelajaran} &middot; {k.jumlahSoal || k.soal?.length || 0} soal &middot; {k.durasiMenit} menit
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
                        className="px-4 py-2 rounded-lg bg-[#59234F] text-white text-sm font-medium hover:bg-[#D85A93] hover:text-[#59234F] transition"
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
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="text-left text-[#B596AA] border-b border-[#F0DCE8]">
                      <th className="px-6 py-3 font-medium">Mata Pelajaran</th>
                      <th className="px-6 py-3 font-medium">Jenis</th>
                      <th className="px-6 py-3 font-medium">Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nilai.map((n) => (
                      <tr key={n._id} className="border-b border-[#F9EAF2] last:border-0">
                        <td className="px-6 py-3.5 text-[#59234F] font-medium">{n.mataPelajaran}</td>
                        <td className="px-6 py-3.5 text-[#8B6B82] capitalize">{n.jenis.replace("_", " ")}</td>
                        <td className="px-6 py-3.5 font-semibold text-[#59234F]">{n.nilai}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                <div className="w-20 h-20 rounded-full bg-[#59234F] text-[#D85A93] text-2xl font-bold flex items-center justify-center overflow-hidden shrink-0">
                  {profilForm.foto ? <img src={profilForm.foto} alt="" className="w-full h-full object-cover" /> : user.nama?.[0]?.toUpperCase()}
                </div>
                <div>
                  <label className="inline-block px-3 py-1.5 rounded-lg border border-[#E8C9DA] text-xs font-medium text-[#59234F] cursor-pointer hover:bg-[#FFF7FB] transition">
                    Ganti Foto
                    <input type="file" accept="image/*" onChange={pilihFoto} className="hidden" />
                  </label>
                  <p className="text-[11px] text-[#B596AA] mt-1">JPG/PNG, maks 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs font-medium text-[#8B6B82]">Nama</label>
                  <p className="text-sm text-[#59234F] font-medium mt-1">{user.nama}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#8B6B82]">NISN (Login)</label>
                  <p className="text-sm text-[#59234F] font-medium mt-1">{user.nisn || user.username || "-"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#8B6B82]">NIS</label>
                  <p className="text-sm text-[#59234F] font-medium mt-1">{user.nis || "-"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#8B6B82]">Kelas</label>
                  <p className="text-sm text-[#59234F] font-medium mt-1">{user.kelas || "-"}</p>
                </div>
              </div>

              <p className="text-xs text-[#B596AA] mb-4">
                Data di atas cuma bisa diubah oleh Admin. Kamu bisa ubah data di bawah ini sendiri:
              </p>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-medium text-[#8B6B82]">No. Telepon</label>
                  <input
                    value={profilForm.noTelepon}
                    onChange={(e) => setProfilForm({ ...profilForm, noTelepon: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-[#E8C9DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A93]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#8B6B82]">Alamat</label>
                  <textarea
                    value={profilForm.alamat}
                    onChange={(e) => setProfilForm({ ...profilForm, alamat: e.target.value })}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-[#E8C9DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A93]"
                  />
                </div>
                <button
                  onClick={simpanProfil}
                  disabled={savingProfil}
                  className="px-4 py-2 rounded-lg bg-[#59234F] text-white text-sm font-medium hover:bg-[#D85A93] hover:text-[#59234F] transition disabled:opacity-50"
                >
                  {savingProfil ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                {profilPesan && <p className="text-xs text-[#8B6B82]">{profilPesan}</p>}
              </div>
            </div>
          </Box>
        )}
      </div>
      </main>
    </div>
  );
}
