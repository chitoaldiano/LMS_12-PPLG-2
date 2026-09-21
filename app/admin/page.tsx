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
  username: "",
  password: "",
  role: "siswa",
  kelas: "",
  mataPelajaran: "",
};

const FORM_KELAS_KOSONG = {
  namaKelas: "",
  tingkat: "X",
  jurusan: "",
  waliKelas: "",
};

// Ikon-ikon sederhana (SVG inline, gak perlu install library tambahan)
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
  logout: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { key: "beranda", label: "Beranda", icon: Icon.beranda, href: "#beranda" },
  { key: "guru", label: "Guru", icon: Icon.guru, href: "#daftar-user", filterRole: "guru" },
  { key: "siswa", label: "Siswa", icon: Icon.siswa, href: "#daftar-user", filterRole: "siswa" },
  { key: "kelas", label: "Kelas", icon: Icon.kelas, href: "#kelola-kelas" },
  { key: "mapel", label: "Mata Pelajaran", icon: Icon.mapel, href: "#" },
  { key: "user", label: "User", icon: Icon.user, href: "#daftar-user", filterRole: "semua" },
  { key: "laporan", label: "Laporan", icon: Icon.laporan, href: "#" },
  { key: "peraturan", label: "Peraturan", icon: Icon.peraturan, href: "#" },
];

export default function AdminDashboard() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("beranda");
  const [activeTab, setActiveTab] = useState("semua");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_KOSONG);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userDihapus, setUserDihapus] = useState(null);

  const [kelasList, setKelasList] = useState([]);
  const [isLoadingKelas, setIsLoadingKelas] = useState(true);
  const [showFormKelas, setShowFormKelas] = useState(false);
  const [formKelas, setFormKelas] = useState(FORM_KELAS_KOSONG);
  const [formKelasError, setFormKelasError] = useState("");
  const [isSubmittingKelas, setIsSubmittingKelas] = useState(false);
  const [kelasDihapus, setKelasDihapus] = useState(null);

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

  function handleLogout() {
    localStorage.removeItem("lms_user");
    router.push("/login");
  }

  function handleNavClick(item) {
    setActiveNav(item.key);
    if (item.filterRole) setActiveTab(item.filterRole);
  }

  async function handleTambahUser(e) {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload = {
        nama: form.nama,
        username: form.username,
        password: form.password,
        role: form.role,
      };
      if (form.role === "siswa") payload.kelas = form.kelas;
      if (form.role === "guru") {
        payload.mataPelajaran = form.mataPelajaran
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean);
      }

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

  async function handleTambahKelas(e) {
    e.preventDefault();
    setFormKelasError("");
    setIsSubmittingKelas(true);

    try {
      const payload = {
        namaKelas: formKelas.namaKelas,
        tingkat: formKelas.tingkat,
        jurusan: formKelas.jurusan,
      };
      if (formKelas.waliKelas) payload.waliKelas = formKelas.waliKelas;

      const res = await fetch("/api/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!result.success) {
        setFormKelasError(result.message || "Gagal menambah kelas");
        setIsSubmittingKelas(false);
        return;
      }

      setShowFormKelas(false);
      setFormKelas(FORM_KELAS_KOSONG);
      setIsSubmittingKelas(false);
      muatUlangKelas();
    } catch (err) {
      setFormKelasError("Tidak bisa terhubung ke server");
      setIsSubmittingKelas(false);
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

  const daftarTertampil =
    activeTab === "semua" ? users : users.filter((u) => u.role === activeTab);

  const daftarGuru = users.filter((u) => u.role === "guru");

  function jumlahSiswaDiKelas(namaKelas) {
    return users.filter((u) => u.role === "siswa" && u.kelas === namaKelas).length;
  }

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
              <a
                key={item.key}
                href={item.href}
                onClick={() => handleNavClick(item)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-[#C6992F] text-[#0F1B33]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <IconComp className="w-[18px] h-[18px] shrink-0" />
                {item.label}
              </a>
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
      <main className="flex-1 px-8 py-8">
        <div id="beranda" className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1B33]">
              Selamat datang, {currentUser.nama.split(" ")[0]}!
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">Kelola data akademik dengan mudah</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white border border-[#E5E0D5] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="#0F1B33" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
                <path d="M10 21h4" />
              </svg>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#0F1B33] flex items-center justify-center text-[#C6992F] text-xs font-bold">
              {currentUser.nama.charAt(0)}
            </div>
          </div>
        </div>

        {/* Kartu statistik */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Guru" value={jumlahPerRole.guru} icon={Icon.guru} />
          <StatCard label="Total Siswa" value={jumlahPerRole.siswa} icon={Icon.siswa} />
          <StatCard label="Total Kepsek" value={jumlahPerRole.kepsek} icon={Icon.mapel} />
          <StatCard label="Total Kurikulum" value={jumlahPerRole.kurikulum} icon={Icon.kelas} />
        </div>

        {/* Daftar pengguna */}
        <div id="daftar-user" className="bg-white rounded-2xl border border-[#E5E0D5] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E5E0D5] flex items-center justify-between">
            <h2 className="font-semibold text-[#0F1B33]">Daftar pengguna</h2>
            <div className="flex gap-2">
              <Link
                href="/admin/siswa/tambah"
                className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition"
              >
                + Tambah Siswa
              </Link>
              <Link
                href="/admin/guru/tambah"
                className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition"
              >
                + Tambah Guru
              </Link>
              <button
                onClick={() => {
                  setForm(FORM_KOSONG);
                  setFormError("");
                  setShowForm(true);
                }}
                className="px-4 py-2 rounded-lg border border-[#D8D3C8] text-[#1F2430] text-sm font-medium hover:bg-[#F5F3EE] transition"
              >
                + Lainnya
              </button>
            </div>
          </div>

          <div className="px-6 pt-4 flex gap-1 border-b border-[#E5E0D5]">
            {["semua", "guru", "siswa", "kepsek", "kurikulum"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                  activeTab === tab
                    ? "text-[#0F1B33] border-b-2 border-[#C6992F]"
                    : "text-[#9CA3AF] hover:text-[#6B7280]"
                }`}
              >
                {tab === "semua" ? "Semua" : ROLE_LABEL[tab]}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="px-6 py-10 text-sm text-[#9CA3AF] text-center">Memuat data...</p>
          ) : daftarTertampil.length === 0 ? (
            <p className="px-6 py-10 text-sm text-[#9CA3AF] text-center">
              Belum ada pengguna di kategori ini.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#9CA3AF] border-b border-[#E5E0D5]">
                  <th className="px-6 py-3 font-medium">Nama</th>
                  <th className="px-6 py-3 font-medium">Username</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Kelas / Mapel</th>
                  <th className="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {daftarTertampil.map((u) => (
                  <tr key={u._id} className="border-b border-[#F0EDE3] last:border-0">
                    <td className="px-6 py-3.5 text-[#1F2430] font-medium">{u.nama}</td>
                    <td className="px-6 py-3.5 text-[#6B7280]">{u.username}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-[#F5F3EE] text-[#0F1B33] text-xs font-medium">
                        {ROLE_LABEL[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#6B7280]">
                      {u.role === "siswa" && (u.kelas || "-")}
                      {u.role === "guru" && (u.mataPelajaran?.join(", ") || "-")}
                      {u.role !== "siswa" && u.role !== "guru" && "-"}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setUserDihapus(u)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Kelola Kelas */}
        <div id="kelola-kelas" className="bg-white rounded-2xl border border-[#E5E0D5] overflow-hidden mt-8">
          <div className="px-6 py-5 border-b border-[#E5E0D5] flex items-center justify-between">
            <h2 className="font-semibold text-[#0F1B33]">Kelola Kelas</h2>
            <Link
              href="/admin/kelas/tambah"
              className="px-4 py-2 rounded-lg bg-[#0F1B33] text-white text-sm font-medium hover:bg-[#C6992F] hover:text-[#0F1B33] transition"
            >
              + Tambah Kelas
            </Link>
          </div>

          {isLoadingKelas ? (
            <p className="px-6 py-10 text-sm text-[#9CA3AF] text-center">Memuat data...</p>
          ) : kelasList.length === 0 ? (
            <p className="px-6 py-10 text-sm text-[#9CA3AF] text-center">
              Belum ada kelas. Klik "+ Tambah Kelas" untuk mulai.
            </p>
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
                      <button
                        onClick={() => setKelasDihapus(k)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal Tambah Pengguna */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#0F1B33] text-lg">Tambah Pengguna</h3>
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
              <Field label="Username">
                <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
              </Field>
              <Field label="Password">
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
              </Field>
              <Field label="Role">
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]">
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                  <option value="admin">Admin</option>
                  <option value="kepsek">Kepala Sekolah</option>
                  <option value="kurikulum">Kurikulum</option>
                </select>
              </Field>
              {form.role === "siswa" && (
                <Field label="Kelas">
                  <input required placeholder="Contoh: X PPLG 1" value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
                </Field>
              )}
              {form.role === "guru" && (
                <Field label="Mata pelajaran (pisahkan koma)">
                  <input required placeholder="Contoh: Matematika, Fisika" value={form.mataPelajaran} onChange={(e) => setForm({ ...form, mataPelajaran: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]" />
                </Field>
              )}
              <button type="submit" disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-[#0F1B33] text-white text-sm font-semibold hover:bg-[#C6992F] hover:text-[#0F1B33] transition disabled:opacity-60">
                {isSubmitting ? "Menyimpan..." : "Simpan Pengguna"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
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

      {/* Modal Tambah Kelas */}
      {showFormKelas && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#0F1B33] text-lg">Tambah Kelas</h3>
              <button onClick={() => setShowFormKelas(false)} className="text-[#9CA3AF] hover:text-[#6B7280] text-xl leading-none">
                &times;
              </button>
            </div>

            {formKelasError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {formKelasError}
              </div>
            )}

            <form onSubmit={handleTambahKelas} className="space-y-4">
              <Field label="Nama kelas">
                <input
                  required
                  placeholder="Contoh: X PPLG 1"
                  value={formKelas.namaKelas}
                  onChange={(e) => setFormKelas({ ...formKelas, namaKelas: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]"
                />
              </Field>

              <Field label="Tingkat">
                <select
                  value={formKelas.tingkat}
                  onChange={(e) => setFormKelas({ ...formKelas, tingkat: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]"
                >
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
              </Field>

              <Field label="Jurusan">
                <input
                  required
                  placeholder="Contoh: PPLG"
                  value={formKelas.jurusan}
                  onChange={(e) => setFormKelas({ ...formKelas, jurusan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]"
                />
              </Field>

              <Field label="Wali kelas (opsional)">
                <select
                  value={formKelas.waliKelas}
                  onChange={(e) => setFormKelas({ ...formKelas, waliKelas: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C6992F]"
                >
                  <option value="">- Belum ditentukan -</option>
                  {daftarGuru.map((g) => (
                    <option key={g._id} value={g._id}>{g.nama}</option>
                  ))}
                </select>
              </Field>

              <button
                type="submit"
                disabled={isSubmittingKelas}
                className="w-full py-2.5 rounded-lg bg-[#0F1B33] text-white text-sm font-semibold hover:bg-[#C6992F] hover:text-[#0F1B33] transition disabled:opacity-60"
              >
                {isSubmittingKelas ? "Menyimpan..." : "Simpan Kelas"}
              </button>
            </form>
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

function StatCard({ label, value, icon: IconComp }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D5] px-5 py-5 flex items-center justify-between">
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