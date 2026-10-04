"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ROLE_LABEL = {
  admin: "Admin",
  guru: "Guru",
  siswa: "Siswa",
  kepsek: "Kepala Sekolah",
  kurikulum: "Kurikulum",
};

const FORM_KOSONG = {
  nama: "",
  username: "", // login khusus admin
  nip: "", // login khusus kepsek
  email: "", // login khusus kurikulum
  password: "",
  role: "kepsek",
  kelas: "",
  mataPelajaran: "",
};

const TARGET_LABEL = {
  semua: "Semua",
  guru: "Guru",
  siswa: "Siswa",
};

const FORM_PENGUMUMAN_KOSONG = {
  judul: "",
  isi: "",
  target: "semua",
  prioritas: "biasa",
};

const Icon = {
  beranda: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />
    </svg>
  ),
  guru: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M15 15c2.6.2 4.5 2 4.5 4.6" />
    </svg>
  ),
  siswa: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" />
    </svg>
  ),
  kelas: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M9 21v-6h6v6" />
      <path d="M4 11h16" />
    </svg>
  ),
  mapel: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M5 4h11a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 1-1Z" />
    </svg>
  ),
  user: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" />
      <path d="M19 8v3M17.5 9.5h3" />
    </svg>
  ),
  laporan: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M7 3h8l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M9 12h6M9 16h6M9 8h3" />
    </svg>
  ),
  peraturan: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </svg>
  ),
  pengumuman: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1Z" />
      <path d="M16 8.5a5 5 0 0 1 0 7" />
      <path d="M19 6a9 9 0 0 1 0 12" />
    </svg>
  ),
  logout: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
};

function waktuRelatif(tanggal) {
  const detik = Math.floor((new Date() - new Date(tanggal)) / 1000);
  if (detik < 60) return "Baru saja";
  const menit = Math.floor(detik / 60);
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;
  return new Date(tanggal).toLocaleDateString("id-ID");
}

const NAV_ITEMS = [
  { key: "beranda", label: "Beranda", icon: Icon.beranda },
  { key: "guru", label: "Guru", icon: Icon.guru },
  { key: "siswa", label: "Siswa", icon: Icon.siswa },
  { key: "kelas", label: "Kelas", icon: Icon.kelas },
  { key: "mapel", label: "Mata Pelajaran", icon: Icon.mapel },
  { key: "pengumuman", label: "Pengumuman", icon: Icon.pengumuman },
  { key: "user", label: "User", icon: Icon.user },
  { key: "laporan", label: "Laporan", icon: Icon.laporan },
  { key: "peraturan", label: "Peraturan", icon: Icon.peraturan },
];

export default function AdminDashboard() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("beranda");
  const [userTab, setUserTab] = useState("semua");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_KOSONG);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userDihapus, setUserDihapus] = useState(null);

  const [kelasList, setKelasList] = useState([]);
  const [isLoadingKelas, setIsLoadingKelas] = useState(true);
  const [kelasDihapus, setKelasDihapus] = useState(null);

  const [pengumumanList, setPengumumanList] = useState([]);
  const [isLoadingPengumuman, setIsLoadingPengumuman] = useState(true);
  const [showFormPengumuman, setShowFormPengumuman] = useState(false);
  const [formPengumuman, setFormPengumuman] = useState(FORM_PENGUMUMAN_KOSONG);
  const [formPengumumanError, setFormPengumumanError] = useState("");
  const [isSubmittingPengumuman, setIsSubmittingPengumuman] = useState(false);
  const [pengumumanDihapus, setPengumumanDihapus] = useState(null);

  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSemuaAktivitas, setShowSemuaAktivitas] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lms_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(stored);
    if (user.role !== "admin") {
      router.push("/login");
      return;
    }
    setCurrentUser(user);
    muatUlangUser();
    muatUlangKelas();
    muatUlangPengumuman();
  }, [router]);

  function muatUlangUser() {
    setIsLoading(true);
    fetch("/api/users")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setUsers(result.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }

  function muatUlangKelas() {
    setIsLoadingKelas(true);
    fetch("/api/kelas")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setKelasList(result.data);
        setIsLoadingKelas(false);
      })
      .catch(() => setIsLoadingKelas(false));
  }

  function muatUlangPengumuman() {
    setIsLoadingPengumuman(true);
    fetch("/api/pengumuman")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setPengumumanList(result.data);
        setIsLoadingPengumuman(false);
      })
      .catch(() => setIsLoadingPengumuman(false));
  }

  async function handleTambahPengumuman(e) {
    e.preventDefault();
    setFormPengumumanError("");
    setIsSubmittingPengumuman(true);

    try {
      const res = await fetch("/api/pengumuman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formPengumuman, pembuat: currentUser.nama }),
      });
      const result = await res.json();

      if (!result.success) {
        setFormPengumumanError(result.message || "Gagal membuat pengumuman");
        setIsSubmittingPengumuman(false);
        return;
      }

      setShowFormPengumuman(false);
      setFormPengumuman(FORM_PENGUMUMAN_KOSONG);
      setIsSubmittingPengumuman(false);
      muatUlangPengumuman();
    } catch (err) {
      setFormPengumumanError("Tidak bisa terhubung ke server");
      setIsSubmittingPengumuman(false);
    }
  }

  async function konfirmasiHapusPengumuman() {
    if (!pengumumanDihapus) return;
    try {
      await fetch(`/api/pengumuman/${pengumumanDihapus._id}`, { method: "DELETE" });
      setPengumumanDihapus(null);
      muatUlangPengumuman();
    } catch (err) {
      setPengumumanDihapus(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("lms_user");
    router.push("/login");
  }

  async function handleTambahUser(e) {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      // Field login beda-beda sesuai role: admin->username, kepsek->nip, kurikulum->email
      const payload: any = {
        nama: form.nama,
        password: form.password,
        role: form.role,
      };
      if (form.role === "admin") payload.username = form.username;
      if (form.role === "kepsek") payload.nip = form.nip;
      if (form.role === "kurikulum") payload.email = form.email;

      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!result.success) {
        setFormError(result.message || "Gagal menambah pengguna");
        setIsSubmitting(false);
        return;
      }

      setShowForm(false);
      setForm(FORM_KOSONG);
      setIsSubmitting(false);
      muatUlangUser();
    } catch (err) {
      setFormError("Tidak bisa terhubung ke server");
      setIsSubmitting(false);
    }
  }

  async function konfirmasiHapus() {
    if (!userDihapus) return;
    try {
      await fetch(`/api/users/${userDihapus._id}`, { method: "DELETE" });
      setUserDihapus(null);
      muatUlangUser();
    } catch (err) {
      setUserDihapus(null);
    }
  }

  async function konfirmasiHapusKelas() {
    if (!kelasDihapus) return;
    try {
      await fetch(`/api/kelas/${kelasDihapus._id}`, { method: "DELETE" });
      setKelasDihapus(null);
      muatUlangKelas();
    } catch (err) {
      setKelasDihapus(null);
    }
  }

  const jumlahPerRole = {
    guru: users.filter((u) => u.role === "guru").length,
    siswa: users.filter((u) => u.role === "siswa").length,
    kepsek: users.filter((u) => u.role === "kepsek").length,
    kurikulum: users.filter((u) => u.role === "kurikulum").length,
  };

  const daftarGuru = users.filter((u) => u.role === "guru");
  const daftarSiswa = users.filter((u) => u.role === "siswa");
  const daftarUserLain =
    userTab === "semua"
      ? users.filter((u) => ["admin", "kepsek", "kurikulum"].includes(u.role))
      : users.filter((u) => u.role === userTab);

  function jumlahSiswaDiKelas(namaKelas) {
    return users.filter((u) => u.role === "siswa" && u.kelas === namaKelas).length;
  }

  // Aktivitas terbaru: digabung dari data user & kelas asli (diurutkan dari yang terbaru)
  const daftarAktivitas = [
    ...users.map((u) => ({
      label: `Admin menambahkan ${ROLE_LABEL[u.role] || u.role} baru: ${u.nama}`,
      waktu: u.createdAt,
    })),
    ...pengumumanList.map((p) => ({
      label: `Admin membuat pengumuman: ${p.judul}`,
      waktu: p.createdAt,
    })),
    ...kelasList.map((k) => ({
      label: `Admin menambahkan kelas baru: ${k.namaKelas}`,
      waktu: k.createdAt,
    })),
  ]
    .filter((a) => a.waktu)
    .sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

  const aktivitasTertampil = showSemuaAktivitas ? daftarAktivitas.slice(0, 20) : daftarAktivitas.slice(0, 5);

  // Data distribusi pengguna buat pie chart
  const totalSemuaRole = jumlahPerRole.guru + jumlahPerRole.siswa + jumlahPerRole.kepsek + jumlahPerRole.kurikulum;
  const distribusi = [
    { label: "Guru", value: jumlahPerRole.guru, color: "#0F1B33" },
    { label: "Siswa", value: jumlahPerRole.siswa, color: "#C6992F" },
    { label: "Kepsek", value: jumlahPerRole.kepsek, color: "#8B6F3E" },
    { label: "Kurikulum", value: jumlahPerRole.kurikulum, color: "#9CA3AF" },
  ].filter((d) => d.value > 0);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F1B33] text-white flex flex-col shrink-0">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-[#C6992F] font-bold text-xs border border-[#C6992F]/60 shrink-0">
            SMK
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">LMS</p>
            <p className="text-[11px] text-white/60 leading-tight">SMK Citra Negara</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const IconComp = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${
                  isActive
                    ? "bg-[#C6992F] text-[#0F1B33]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <IconComp className="w-[18px] h-[18px] shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition"
          >
            <Icon.logout className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Konten utama */}
      <main className="flex-1 px-8 py-8 max-w-6xl">
        {/* ===== BERANDA ===== */}
        {activeNav === "beranda" && (
          <>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#0F1B33]">
                  Selamat datang, {currentUser.nama.split(" ")[0]}!
                </h1>
                <p className="text-sm text-[#6B7280] mt-1">Kelola data akademik dengan mudah</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Notifikasi */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotif(!showNotif);
                      setShowProfileMenu(false);
                    }}
                    className="relative w-10 h-10 rounded-full bg-white border border-[#E5E0D5] flex items-center justify-center hover:bg-[#F5F3EE] transition"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#0F1B33" strokeWidth="2">
                      <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
                      <path d="M10 21h4" />
                    </svg>
                    {daftarAktivitas.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C6992F]" />
                    )}
                  </button>

                  {showNotif && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-[#E5E0D5] shadow-lg z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#E5E0D5]">
                        <p className="text-sm font-semibold text-[#0F1B33]">Notifikasi</p>
                      </div>
                      {daftarAktivitas.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-[#9CA3AF] text-center">Belum ada aktivitas</p>
                      ) : (
                        <div className="max-h-72 overflow-y-auto">
                          {daftarAktivitas.slice(0, 5).map((a, i) => (
                            <div key={i} className="px-4 py-3 border-b border-[#F0EDE3] last:border-0">
                              <p className="text-sm text-[#1F2430]">{a.label}</p>
                              <p className="text-xs text-[#9CA3AF] mt-0.5">{waktuRelatif(a.waktu)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profil */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotif(false);
                    }}
                    className="w-10 h-10 rounded-full bg-[#0F1B33] flex items-center justify-center text-[#C6992F] font-bold hover:opacity-90 transition"
                  >
                    {currentUser.nama.charAt(0)}
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#E5E0D5] shadow-lg z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#E5E0D5]">
                        <p className="text-sm font-semibold text-[#0F1B33]">{currentUser.nama}</p>
                        <p className="text-xs text-[#9CA3AF]">Admin &middot; @{currentUser.username}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Guru" value={jumlahPerRole.guru} icon={Icon.guru} />
              <StatCard label="Total Siswa" value={jumlahPerRole.siswa} icon={Icon.siswa} />
              <StatCard label="Total Kepsek" value={jumlahPerRole.kepsek} icon={Icon.mapel} />
              <StatCard label="Total Kurikulum" value={jumlahPerRole.kurikulum} icon={Icon.kelas} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Aktivitas Terbaru */}
              <div className="bg-white rounded-2xl border border-[#E5E0D5] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-[#E5E0D5]">
                  <h2 className="font-semibold text-[#0F1B33]">Aktivitas Terbaru</h2>
                </div>
                {daftarAktivitas.length === 0 ? (
                  <p className="px-6 py-10 text-sm text-[#9CA3AF] text-center">Belum ada aktivitas tercatat.</p>
                ) : (
                  <>
                    <div>
                      {aktivitasTertampil.map((a, i) => (
                        <div key={i} className="px-6 py-3 border-b border-[#F0EDE3] last:border-0 flex items-center justify-between gap-4">
                          <p className="text-sm text-[#1F2430]">{a.label}</p>
                          <p className="text-xs text-[#9CA3AF] shrink-0">{waktuRelatif(a.waktu)}</p>
                        </div>
                      ))}
                    </div>
                    {daftarAktivitas.length > 5 && (
                      <div className="px-6 py-3 text-center border-t border-[#E5E0D5]">
                        <button
                          onClick={() => setShowSemuaAktivitas(!showSemuaAktivitas)}
                          className="px-4 py-1.5 rounded-lg bg-[#F5F3EE] text-[#1F2430] text-xs font-medium hover:bg-[#E8E5DC] transition"
                        >
                          {showSemuaAktivitas ? "Sembunyikan" : "Lihat Semua"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Distribusi Pengguna */}
              <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 shadow-sm">
                <h2 className="font-semibold text-[#0F1B33] mb-4">Distribusi Pengguna</h2>
                {totalSemuaRole === 0 ? (
                  <p className="text-sm text-[#9CA3AF] text-center py-10">Belum ada data pengguna.</p>
                ) : (
                  <div className="flex items-center gap-6 flex-wrap">
                    <DonutChart data={distribusi} total={totalSemuaRole} />
                    <div className="space-y-2">
                      {distribusi.map((d) => (
                        <div key={d.label} className="flex items-center gap-2 text-sm">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="text-[#1F2430]">
                            {d.label}: {Math.round((d.value / totalSemuaRole) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ===== GURU ===== */}
        {activeNav === "guru" && (
          <SectionCard title="Daftar Guru" tambahHref="/admin/guru/tambah" tambahLabel="+ Tambah Guru">
            {isLoading ? (
              <SkeletonTable />
            ) : daftarGuru.length === 0 ? (
              <Placeholder text='Belum ada guru. Klik "+ Tambah Guru" untuk mulai.' />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#9CA3AF] border-b border-[#E5E0D5]">
                    <th className="px-6 py-3 font-medium">Nama</th>
                    <th className="px-6 py-3 font-medium">Email (Login)</th>
                    <th className="px-6 py-3 font-medium">NIP</th>
                    <th className="px-6 py-3 font-medium">Mata Pelajaran</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {daftarGuru.map((u) => (
                    <tr key={u._id} className="border-b border-[#F0EDE3] last:border-0">
                      <td className="px-6 py-3.5 text-[#1F2430] font-medium">{u.nama}</td>
                      <td className="px-6 py-3.5 text-[#6B7280]">{u.email || "-"}</td>
                      <td className="px-6 py-3.5 text-[#6B7280]">{u.nip || "-"}</td>
                      <td className="px-6 py-3.5 text-[#6B7280]">{u.mataPelajaran?.join(", ") || "-"}</td>
                      <td className="px-6 py-3.5 text-right">
                        <button onClick={() => setUserDihapus(u)} className="text-xs font-medium text-red-600 hover:text-red-700">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        )}

        {/* ===== SISWA ===== */}
        {activeNav === "siswa" && (
          <SectionCard title="Daftar Siswa" tambahHref="/admin/siswa/tambah" tambahLabel="+ Tambah Siswa">
            {isLoading ? (
              <SkeletonTable />
            ) : daftarSiswa.length === 0 ? (
              <Placeholder text='Belum ada siswa. Klik "+ Tambah Siswa" untuk mulai.' />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#9CA3AF] border-b border-[#E5E0D5]">
                    <th className="px-6 py-3 font-medium">Nama</th>
                    <th className="px-6 py-3 font-medium">NIS</th>
                    <th className="px-6 py-3 font-medium">NISN (Login)</th>
                    <th className="px-6 py-3 font-medium">Kelas</th>
                    <th className="px-6 py-3 font-medium">Jurusan</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {daftarSiswa.map((u) => (
                    <tr key={u._id} className="border-b border-[#F0EDE3] last:border-0">
                      <td className="px-6 py-3.5 text-[#1F2430] font-medium">{u.nama}</td>
                      <td className="px-6 py-3.5 text-[#6B7280]">{u.nis || "-"}</td>
                      <td className="px-6 py-3.5 text-[#6B7280]">{u.nisn || "-"}</td>
                      <td className="px-6 py-3.5 text-[#6B7280]">{u.kelas || "-"}</td>
                      <td className="px-6 py-3.5 text-[#6B7280]">{u.jurusan || "-"}</td>
                      <td className="px-6 py-3.5 text-right">
                        <button onClick={() => setUserDihapus(u)} className="text-xs font-medium text-red-600 hover:text-red-700">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        )}

        {/* ===== KELAS ===== */}
        {activeNav === "kelas" && (
          <SectionCard title="Kelola Kelas" tambahHref="/admin/kelas/tambah" tambahLabel="+ Tambah Kelas">
            {isLoadingKelas ? (
              <SkeletonTable />
            ) : kelasList.length === 0 ? (
              <Placeholder text='Belum ada kelas. Klik "+ Tambah Kelas" untuk mulai.' />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#9CA3AF] border-b border-[#E5E0D5]">
                    <th className="px-6 py-3 font-medium">Nama Kelas</th>
                    <th className="px-6 py-3 font-medium">Tingkat</th>
                    <th className="px-6 py-3 font-medium">Jurusan</th>
                    <th className="px-6 py-3 font-medium">Wali Kelas</th>
                    <th className="px-6 py-3 font-medium">Jumlah Siswa</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kelasList.map((k) => (
                    <tr key={k._id} className="border-b border-[#F0EDE3] last:border-0">
                      <td className="px-6 py-3.5 text-[#1F2430] font-medium">{k.namaKelas}</td>
                      <td className="px-6 py-3.5 text-[#6B7280]">{k.tingkat}</td>
                      <td className="px-6 py-3.5 text-[#6B7280]">{k.jurusan}</td>
                      <td className="px-6 py-3.5 text-[#6B7280]">{k.waliKelas?.nama || "-"}</td>
                      <td className="px-6 py-3.5 text-[#6B7280]">{jumlahSiswaDiKelas(k.namaKelas)} siswa</td>
                      <td className="px-6 py-3.5 text-right">
                        <button onClick={() => setKelasDihapus(k)} className="text-xs font-medium text-red-600 hover:text-red-700">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        )}

        {/* ===== PENGUMUMAN ===== */}
        {activeNav === "pengumuman" && (
          <div className="bg-white rounded-2xl border border-[#E5E0D5] overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-[#E5E0D5] flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold text-[#0F1B33]">Pengumuman</h2>
              <button
                onClick={() => {
                  setFormPengumuman(FORM_PENGUMUMAN_KOSONG);
                  setFormPengumumanError("");
                  setShowFormPengumuman(true);
                }}
                className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition"
              >
                + Buat Pengumuman
              </button>
            </div>

            {isLoadingPengumuman ? (
              <SkeletonTable />
            ) : pengumumanList.length === 0 ? (
              <Placeholder text='Belum ada pengumuman. Klik "+ Buat Pengumuman" untuk mulai.' />
            ) : (
              <div>
                {pengumumanList.map((p) => (
                  <div key={p._id} className="px-6 py-5 border-b border-[#F0EDE3] last:border-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          {p.prioritas === "penting" && (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-semibold">
                              Penting
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-[#F5F3EE] text-[#0F1B33] text-[11px] font-medium">
                            Untuk: {TARGET_LABEL[p.target] || p.target}
                          </span>
                          <span className="text-xs text-[#9CA3AF]">{waktuRelatif(p.createdAt)}</span>
                        </div>
                        <h3 className="font-semibold text-[#0F1B33]">{p.judul}</h3>
                        <p className="text-sm text-[#6B7280] mt-1 whitespace-pre-line">{p.isi}</p>
                      </div>
                      <button
                        onClick={() => setPengumumanDihapus(p)}
                        className="text-xs font-medium text-red-600 hover:text-red-700 shrink-0"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== USER (admin/kepsek/kurikulum) ===== */}
        {activeNav === "user" && (
          <div className="bg-white rounded-2xl border border-[#E5E0D5] overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-[#E5E0D5] flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold text-[#0F1B33]">Kelola User Lain</h2>
              <button
                onClick={() => {
                  setForm(FORM_KOSONG);
                  setFormError("");
                  setShowForm(true);
                }}
                className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition"
              >
                + Tambah User
              </button>
            </div>

            <div className="px-6 pt-4 flex gap-1 border-b border-[#E5E0D5] flex-wrap">
              {["semua", "admin", "kepsek", "kurikulum"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setUserTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                    userTab === tab
                      ? "text-[#0F1B33] border-b-2 border-[#C6992F]"
                      : "text-[#9CA3AF] hover:text-[#6B7280]"
                  }`}
                >
                  {tab === "semua" ? "Semua" : ROLE_LABEL[tab]}
                </button>
              ))}
            </div>

            {isLoading ? (
              <SkeletonTable />
            ) : daftarUserLain.length === 0 ? (
              <Placeholder text="Belum ada pengguna di kategori ini." />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#9CA3AF] border-b border-[#E5E0D5]">
                    <th className="px-6 py-3 font-medium">Nama</th>
                    <th className="px-6 py-3 font-medium">Login</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {daftarUserLain.map((u) => (
                    <tr key={u._id} className="border-b border-[#F0EDE3] last:border-0">
                      <td className="px-6 py-3.5 text-[#1F2430] font-medium">{u.nama}</td>
                      <td className="px-6 py-3.5 text-[#6B7280]">{u.username || u.nip || u.email || "-"}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-[#F5F3EE] text-[#0F1B33] text-xs font-medium">
                          {ROLE_LABEL[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button onClick={() => setUserDihapus(u)} className="text-xs font-medium text-red-600 hover:text-red-700">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ===== PLACEHOLDER: Mapel, Laporan, Peraturan ===== */}
        {["mapel", "laporan", "peraturan"].includes(activeNav) && (
          <div className="bg-white rounded-2xl border border-[#E5E0D5] px-6 py-16 text-center shadow-sm">
            <p className="text-sm text-[#9CA3AF]">Fitur ini belum tersedia.</p>
          </div>
        )}
      </main>

      {/* Modal Tambah User (admin/kepsek/kurikulum) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#0F1B33] text-lg">Tambah User</h3>
              <button onClick={() => setShowForm(false)} className="text-[#9CA3AF] hover:text-[#6B7280] text-xl leading-none">
                &times;
              </button>
            </div>

            {formError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleTambahUser} className="space-y-4">
              <Field label="Nama lengkap">
                <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
              </Field>
              <Field label="Role">
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]">
                  <option value="admin">Admin</option>
                  <option value="kepsek">Kepala Sekolah</option>
                  <option value="kurikulum">Kurikulum</option>
                </select>
              </Field>

              {form.role === "admin" && (
                <Field label="Username (dipakai untuk login)">
                  <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
                </Field>
              )}
              {form.role === "kepsek" && (
                <Field label="NIP (dipakai untuk login)">
                  <input required value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
                </Field>
              )}
              {form.role === "kurikulum" && (
                <Field label="Email (dipakai untuk login)">
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
                </Field>
              )}

              <Field label="Password">
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
              </Field>
              <button type="submit" disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-[#0F1B33] text-white text-sm font-semibold hover:bg-[#C6992F] hover:text-[#0F1B33] transition disabled:opacity-60">
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus User */}
      {userDihapus && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="font-semibold text-[#0F1B33] text-lg mb-2">Hapus pengguna?</h3>
            <p className="text-sm text-[#6B7280] mb-6">
              Yakin mau hapus <strong>{userDihapus.nama}</strong>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setUserDihapus(null)} className="flex-1 py-2.5 rounded-lg border border-[#D8D3C8] text-sm font-medium text-[#1F2430]">
                Batal
              </button>
              <button onClick={konfirmasiHapus} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Pengumuman */}
      {showFormPengumuman && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#0F1B33] text-lg">Buat Pengumuman</h3>
              <button onClick={() => setShowFormPengumuman(false)} className="text-[#9CA3AF] hover:text-[#6B7280] text-xl leading-none">
                &times;
              </button>
            </div>

            {formPengumumanError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {formPengumumanError}
              </div>
            )}

            <form onSubmit={handleTambahPengumuman} className="space-y-4">
              <Field label="Judul">
                <input
                  required
                  placeholder="Contoh: Libur Semester Ganjil"
                  value={formPengumuman.judul}
                  onChange={(e) => setFormPengumuman({ ...formPengumuman, judul: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]"
                />
              </Field>

              <Field label="Isi pengumuman">
                <textarea
                  required
                  rows={5}
                  placeholder="Tulis isi pengumuman di sini..."
                  value={formPengumuman.isi}
                  onChange={(e) => setFormPengumuman({ ...formPengumuman, isi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C6992F]"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Ditujukan untuk">
                  <select
                    value={formPengumuman.target}
                    onChange={(e) => setFormPengumuman({ ...formPengumuman, target: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]"
                  >
                    <option value="semua">Semua</option>
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </Field>

                <Field label="Prioritas">
                  <select
                    value={formPengumuman.prioritas}
                    onChange={(e) => setFormPengumuman({ ...formPengumuman, prioritas: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]"
                  >
                    <option value="biasa">Biasa</option>
                    <option value="penting">Penting</option>
                  </select>
                </Field>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPengumuman}
                className="w-full py-2.5 rounded-lg bg-[#0F1B33] text-white text-sm font-semibold hover:bg-[#C6992F] hover:text-[#0F1B33] transition disabled:opacity-60"
              >
                {isSubmittingPengumuman ? "Menyimpan..." : "Terbitkan Pengumuman"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pengumuman */}
      {pengumumanDihapus && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="font-semibold text-[#0F1B33] text-lg mb-2">Hapus pengumuman?</h3>
            <p className="text-sm text-[#6B7280] mb-6">
              Yakin mau hapus <strong>{pengumumanDihapus.judul}</strong>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPengumumanDihapus(null)} className="flex-1 py-2.5 rounded-lg border border-[#D8D3C8] text-sm font-medium text-[#1F2430]">
                Batal
              </button>
              <button onClick={konfirmasiHapusPengumuman} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Kelas */}
      {kelasDihapus && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="font-semibold text-[#0F1B33] text-lg mb-2">Hapus kelas?</h3>
            <p className="text-sm text-[#6B7280] mb-6">
              Yakin mau hapus <strong>{kelasDihapus.namaKelas}</strong>? Data siswa di kelas ini tidak akan ikut terhapus.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setKelasDihapus(null)} className="flex-1 py-2.5 rounded-lg border border-[#D8D3C8] text-sm font-medium text-[#1F2430]">
                Batal
              </button>
              <button onClick={konfirmasiHapusKelas} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, tambahHref, tambahLabel, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D5] overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-[#E5E0D5] flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-[#0F1B33]">{title}</h2>
        <Link href={tambahHref} className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition">
          {tambahLabel}
        </Link>
      </div>
      {children}
    </div>
  );
}

function Placeholder({ text }) {
  return <p className="px-6 py-10 text-sm text-[#9CA3AF] text-center">{text}</p>;
}

function SkeletonTable() {
  return (
    <div className="px-6 py-4 space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-10 rounded-lg bg-[#F0EDE3]" />
      ))}
    </div>
  );
}

function DonutChart({ data, total }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let offsetAkumulasi = 0;

  return (
    <svg viewBox="0 0 120 120" className="w-32 h-32 shrink-0" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#F0EDE3" strokeWidth="16" />
      {data.map((d) => {
        const persen = d.value / total;
        const panjangSegmen = persen * circumference;
        const dashArray = `${panjangSegmen} ${circumference - panjangSegmen}`;
        const dashOffset = -offsetAkumulasi;
        offsetAkumulasi += panjangSegmen;
        return (
          <circle
            key={d.label}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth="16"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
          />
        );
      })}
    </svg>
  );
}

function StatCard({ label, value, icon: IconComp }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D5] px-5 py-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      <div>
        <p className="text-3xl font-bold text-[#0F1B33]">{value}</p>
        <p className="text-xs font-medium text-[#6B7280] mt-1 uppercase tracking-wide">{label}</p>
      </div>
      <div className="w-11 h-11 rounded-full bg-[#F5F3EE] flex items-center justify-center text-[#0F1B33]">
        <IconComp className="w-5 h-5" />
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2430] mb-1.5">{label}</label>
      {children}
    </div>
  );
}