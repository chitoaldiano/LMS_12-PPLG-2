"use client";

import { useEffect, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import MapelPilih from "@/components/MapelPilih";
import { RekapNilai, GuruPerKelas } from "@/components/Laporan";
import type {
  UserItem,
  KelasItem,
  MataPelajaranItem,
  PengumumanItem,
  WaliKelasPopulated,
} from "@/types/lms";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  guru: "Guru",
  siswa: "Siswa",
  kepsek: "Kepala Sekolah",
  kurikulum: "Kurikulum",
};

interface FormUserState {
  nama: string;
  username: string; // login khusus admin
  nip: string; // login khusus kepsek
  email: string; // login khusus kurikulum
  password: string;
  role: string;
  kelas: string;
  mataPelajaran: string;
}

const FORM_KOSONG: FormUserState = {
  nama: "",
  username: "",
  nip: "",
  email: "",
  password: "",
  role: "kepsek",
  kelas: "",
  mataPelajaran: "",
};

const TARGET_LABEL: Record<string, string> = {
  semua: "Semua",
  guru: "Guru",
  siswa: "Siswa",
};

interface FormPengumumanState {
  judul: string;
  isi: string;
  target: "semua" | "guru" | "siswa";
  prioritas: "biasa" | "penting";
}

const FORM_PENGUMUMAN_KOSONG: FormPengumumanState = {
  judul: "",
  isi: "",
  target: "semua",
  prioritas: "biasa",
};

const INPUT_EDIT =
  "w-full px-3 py-2 rounded-lg border border-[#E8D5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#D95A91]";

interface FormMapelState {
  nama: string;
  kode: string;
  kelompok: "Umum" | "Kejuruan";
  jurusan: string;
}

const FORM_MAPEL_KOSONG: FormMapelState = {
  nama: "",
  kode: "",
  kelompok: "Umum",
  jurusan: "",
};

interface FormEditUserState {
  nama: string;
  username: string;
  email: string;
  nip: string;
  nis: string;
  nisn: string;
  kelas: string;
  jurusan: string;
  noTelepon: string;
  jenisKelamin: string;
  alamat: string;
  status: string;
  mataPelajaran: string;
  password: string;
}

interface FormEditKelasState {
  namaKelas: string;
  tingkat: string;
  jurusan: string;
  tahunAjaran: string;
  kapasitas: string | number;
  waliKelas: string;
}

type SvgIconProps = ComponentProps<"svg">;

const Icon = {
  beranda: (p: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />
    </svg>
  ),
  guru: (p: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M15 15c2.6.2 4.5 2 4.5 4.6" />
    </svg>
  ),
  siswa: (p: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" />
    </svg>
  ),
  kelas: (p: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M9 21v-6h6v6" />
      <path d="M4 11h16" />
    </svg>
  ),
  mapel: (p: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M5 4h11a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 1-1Z" />
    </svg>
  ),
  pengumuman: (p: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  user: (p: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" />
      <path d="M19 8v3M17.5 9.5h3" />
    </svg>
  ),
  laporan: (p: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M7 3h8l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M9 12h6M9 16h6M9 8h3" />
    </svg>
  ),
  peraturan: (p: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </svg>
  ),
  logout: (p: SvgIconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
};

function waktuRelatif(tanggal: string | Date | undefined | null): string {
  if (!tanggal) return "";
  const detik = Math.floor((Date.now() - new Date(tanggal).getTime()) / 1000);
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

  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("beranda");
  const [userTab, setUserTab] = useState("semua");
  const [cariTeks, setCariTeks] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormUserState>(FORM_KOSONG);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userDihapus, setUserDihapus] = useState<UserItem | null>(null);

  const [userDiedit, setUserDiedit] = useState<UserItem | null>(null);
  const [formEdit, setFormEdit] = useState<FormEditUserState>({
    nama: "",
    username: "",
    email: "",
    nip: "",
    nis: "",
    nisn: "",
    kelas: "",
    jurusan: "",
    noTelepon: "",
    jenisKelamin: "",
    alamat: "",
    status: "Aktif",
    mataPelajaran: "",
    password: "",
  });
  const [formEditError, setFormEditError] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [isLoadingKelas, setIsLoadingKelas] = useState(true);
  const [kelasDihapus, setKelasDihapus] = useState<KelasItem | null>(null);

  const [kelasDiedit, setKelasDiedit] = useState<KelasItem | null>(null);
  const [formEditKelas, setFormEditKelas] = useState<FormEditKelasState>({
    namaKelas: "",
    tingkat: "X",
    jurusan: "",
    tahunAjaran: "",
    kapasitas: "",
    waliKelas: "",
  });
  const [formEditKelasError, setFormEditKelasError] = useState("");
  const [isSubmittingEditKelas, setIsSubmittingEditKelas] = useState(false);

  const [pengumumanList, setPengumumanList] = useState<PengumumanItem[]>([]);
  const [isLoadingPengumuman, setIsLoadingPengumuman] = useState(true);
  const [showFormPengumuman, setShowFormPengumuman] = useState(false);
  const [formPengumuman, setFormPengumuman] = useState<FormPengumumanState>(FORM_PENGUMUMAN_KOSONG);
  const [formPengumumanError, setFormPengumumanError] = useState("");
  const [isSubmittingPengumuman, setIsSubmittingPengumuman] = useState(false);
  const [pengumumanDihapus, setPengumumanDihapus] = useState<PengumumanItem | null>(null);

  const [mapelList, setMapelList] = useState<MataPelajaranItem[]>([]);
  const [isLoadingMapel, setIsLoadingMapel] = useState(true);
  const [showFormMapel, setShowFormMapel] = useState(false);
  const [mapelEditId, setMapelEditId] = useState<string | null>(null);
  const [formMapel, setFormMapel] = useState<FormMapelState>(FORM_MAPEL_KOSONG);
  const [formMapelError, setFormMapelError] = useState("");
  const [isSubmittingMapel, setIsSubmittingMapel] = useState(false);
  const [mapelDihapus, setMapelDihapus] = useState<MataPelajaranItem | null>(null);

  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSemuaAktivitas, setShowSemuaAktivitas] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpenAdmin, setSearchOpenAdmin] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash === "daftar-user" || hash === "guru") setActiveNav("guru");
      else if (hash === "siswa") setActiveNav("siswa");
      else if (hash === "kelas") setActiveNav("kelas");
      else if (hash === "mapel") setActiveNav("mapel");
      else if (hash === "pengumuman") setActiveNav("pengumuman");
      else if (hash === "user") setActiveNav("user");
      else if (hash === "laporan") setActiveNav("laporan");
      else if (hash === "peraturan") setActiveNav("peraturan");
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("lms_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const user: UserItem = JSON.parse(stored);
    if (user.role !== "admin") {
      router.push("/login");
      return;
    }
    setCurrentUser(user);
    muatUlangUser();
    muatUlangKelas();
    muatUlangPengumuman();
    muatUlangMapel();
  }, [router]);

  function muatUlangUser() {
    setIsLoading(true);
    fetch("/api/users")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) setUsers(result.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }

  function muatUlangKelas() {
    setIsLoadingKelas(true);
    fetch("/api/kelas")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) setKelasList(result.data);
        setIsLoadingKelas(false);
      })
      .catch(() => setIsLoadingKelas(false));
  }

  function muatUlangMapel() {
    setIsLoadingMapel(true);
    fetch("/api/mapel")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) setMapelList(result.data);
        setIsLoadingMapel(false);
      })
      .catch(() => setIsLoadingMapel(false));
  }

  function bukaTambahMapel() {
    setMapelEditId(null);
    setFormMapel(FORM_MAPEL_KOSONG);
    setFormMapelError("");
    setShowFormMapel(true);
  }

  function bukaEditMapel(m: MataPelajaranItem) {
    setMapelEditId(m._id);
    setFormMapel({
      nama: m.nama || "",
      kode: m.kode || "",
      kelompok: m.kelompok === "Kejuruan" ? "Kejuruan" : "Umum",
      jurusan: m.jurusan || "",
    });
    setFormMapelError("");
    setShowFormMapel(true);
  }

  async function handleSimpanMapel(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormMapelError("");
    setIsSubmittingMapel(true);

    try {
      const res = await fetch(mapelEditId ? `/api/mapel/${mapelEditId}` : "/api/mapel", {
        method: mapelEditId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formMapel),
      });
      const result = await res.json();

      if (!result.success) {
        setFormMapelError(result.message || "Gagal menyimpan mata pelajaran");
        setIsSubmittingMapel(false);
        return;
      }

      setShowFormMapel(false);
      setIsSubmittingMapel(false);
      muatUlangMapel();
    } catch {
      setFormMapelError("Tidak bisa terhubung ke server");
      setIsSubmittingMapel(false);
    }
  }

  async function konfirmasiHapusMapel() {
    if (!mapelDihapus) return;
    try {
      await fetch(`/api/mapel/${mapelDihapus._id}`, { method: "DELETE" });
    } catch {
      // abaikan, daftar dimuat ulang di bawah
    }
    setMapelDihapus(null);
    muatUlangMapel();
  }

  function muatUlangPengumuman() {
    setIsLoadingPengumuman(true);
    fetch("/api/pengumuman")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) setPengumumanList(result.data);
        setIsLoadingPengumuman(false);
      })
      .catch(() => setIsLoadingPengumuman(false));
  }

  async function handleTambahPengumuman(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormPengumumanError("");
    setIsSubmittingPengumuman(true);

    try {
      const res = await fetch("/api/pengumuman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formPengumuman, pembuat: currentUser?.nama || "Admin" }),
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
    } catch {
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
    } catch {
      setPengumumanDihapus(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("lms_user");
    router.push("/login");
  }

  async function handleTambahUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      // Field login beda-beda sesuai role: admin->username, kepsek->nip, kurikulum->email
      const payload: Record<string, string> = {
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
    } catch {
      setFormError("Tidak bisa terhubung ke server");
      setIsSubmitting(false);
    }
  }

  function bukaEditUser(u: UserItem) {
    setFormEditError("");
    setUserDiedit(u);
    setFormEdit({
      nama: u.nama || "",
      username: u.username || "",
      email: u.email || "",
      nip: u.nip || "",
      nis: u.nis || "",
      nisn: u.nisn || "",
      kelas: u.kelas || "",
      jurusan: u.jurusan || "",
      noTelepon: u.noTelepon || "",
      jenisKelamin: u.jenisKelamin || "",
      alamat: u.alamat || "",
      status: u.status || "Aktif",
      mataPelajaran: (u.mataPelajaran || []).join(", "),
      password: "",
    });
  }

  async function handleSimpanEditUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userDiedit) return;
    setFormEditError("");
    setIsSubmittingEdit(true);

    try {
      const role = userDiedit.role;
      const payload: Record<string, unknown> = { nama: formEdit.nama };

      // Field login beda per role: admin->username, kepsek->nip, kurikulum/guru->email, siswa->nisn
      if (role === "admin") payload.username = formEdit.username;
      if (role === "kepsek") payload.nip = formEdit.nip;
      if (role === "kurikulum") payload.email = formEdit.email;
      if (role === "siswa") {
        Object.assign(payload, {
          nis: formEdit.nis,
          nisn: formEdit.nisn,
          kelas: formEdit.kelas,
          jurusan: formEdit.jurusan,
          email: formEdit.email,
          noTelepon: formEdit.noTelepon,
          jenisKelamin: formEdit.jenisKelamin,
          alamat: formEdit.alamat,
          status: formEdit.status,
        });
      }
      if (role === "guru") {
        Object.assign(payload, {
          email: formEdit.email,
          nip: formEdit.nip,
          mataPelajaran: String(formEdit.mataPelajaran || "")
            .split(",")
            .map((m) => m.trim())
            .filter(Boolean),
          noTelepon: formEdit.noTelepon,
          jenisKelamin: formEdit.jenisKelamin,
          alamat: formEdit.alamat,
          status: formEdit.status,
        });
      }
      if (formEdit.password) payload.password = formEdit.password;

      const res = await fetch(`/api/users/${userDiedit._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!result.success) {
        setFormEditError(result.message || "Gagal menyimpan perubahan");
        setIsSubmittingEdit(false);
        return;
      }

      // Kalau admin mengedit akunnya sendiri, samakan data login di browser
      if (currentUser && userDiedit._id === currentUser._id) {
        const baru: UserItem = { ...currentUser, ...result.data };
        localStorage.setItem("lms_user", JSON.stringify(baru));
        setCurrentUser(baru);
      }

      setUserDiedit(null);
      setIsSubmittingEdit(false);
      muatUlangUser();
    } catch {
      setFormEditError("Tidak bisa terhubung ke server");
      setIsSubmittingEdit(false);
    }
  }

  function bukaEditKelas(k: KelasItem) {
    setFormEditKelasError("");
    setKelasDiedit(k);
    const waliId =
      typeof k.waliKelas === "object" && k.waliKelas !== null
        ? (k.waliKelas as WaliKelasPopulated)._id
        : typeof k.waliKelas === "string"
        ? k.waliKelas
        : "";
    setFormEditKelas({
      namaKelas: k.namaKelas || "",
      tingkat: k.tingkat || "X",
      jurusan: k.jurusan || "",
      tahunAjaran: k.tahunAjaran || "",
      kapasitas: k.kapasitas ?? "",
      waliKelas: waliId,
    });
  }

  async function handleSimpanEditKelas(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!kelasDiedit) return;
    setFormEditKelasError("");
    setIsSubmittingEditKelas(true);

    try {
      // Nama kelas sengaja TIDAK dikirim (nggak bisa diubah) supaya data siswa/materi/tugas/kuis tetap nyambung
      const payload: {
        tingkat: string;
        jurusan: string;
        tahunAjaran: string;
        kapasitas: number | null;
        waliKelas: string | null;
      } = {
        tingkat: formEditKelas.tingkat,
        jurusan: formEditKelas.jurusan,
        tahunAjaran: formEditKelas.tahunAjaran,
        kapasitas: formEditKelas.kapasitas === "" ? null : Number(formEditKelas.kapasitas),
        waliKelas: formEditKelas.waliKelas || null,
      };

      const res = await fetch(`/api/kelas/${kelasDiedit._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!result.success) {
        setFormEditKelasError(result.message || "Gagal menyimpan perubahan");
        setIsSubmittingEditKelas(false);
        return;
      }

      setKelasDiedit(null);
      setIsSubmittingEditKelas(false);
      muatUlangKelas();
    } catch {
      setFormEditKelasError("Tidak bisa terhubung ke server");
      setIsSubmittingEditKelas(false);
    }
  }

  async function konfirmasiHapus() {
    if (!userDihapus) return;
    try {
      await fetch(`/api/users/${userDihapus._id}`, { method: "DELETE" });
      setUserDihapus(null);
      muatUlangUser();
    } catch {
      setUserDihapus(null);
    }
  }

  async function konfirmasiHapusKelas() {
    if (!kelasDihapus) return;
    try {
      await fetch(`/api/kelas/${kelasDihapus._id}`, { method: "DELETE" });
      setKelasDihapus(null);
      muatUlangKelas();
    } catch {
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

  // Guru yang mata pelajarannya mengandung nama mapel ini
  function guruPengampu(namaMapel: string): UserItem[] {
    return daftarGuru.filter((g) => (g.mataPelajaran || []).includes(namaMapel));
  }
  const daftarSiswa = users.filter((u) => u.role === "siswa");
  const daftarUserLain =
    userTab === "semua"
      ? users.filter((u) => ["admin", "kepsek", "kurikulum"].includes(u.role))
      : users.filter((u) => u.role === userTab);

  const query = cariTeks.toLowerCase().trim();
  const daftarGuruTampil = query
    ? daftarGuru.filter(
        (g) =>
          g.nama.toLowerCase().includes(query) ||
          (g.email && g.email.toLowerCase().includes(query)) ||
          (g.nip && g.nip.toLowerCase().includes(query)) ||
          (g.mataPelajaran && g.mataPelajaran.some((m) => m.toLowerCase().includes(query)))
      )
    : daftarGuru;

  const daftarSiswaTampil = query
    ? daftarSiswa.filter(
        (s) =>
          s.nama.toLowerCase().includes(query) ||
          (s.nis && s.nis.toLowerCase().includes(query)) ||
          (s.nisn && s.nisn.toLowerCase().includes(query)) ||
          (s.kelas && s.kelas.toLowerCase().includes(query)) ||
          (s.jurusan && s.jurusan.toLowerCase().includes(query))
      )
    : daftarSiswa;

  const kelasListTampil = query
    ? kelasList.filter(
        (k) =>
          k.namaKelas.toLowerCase().includes(query) ||
          k.tingkat.toLowerCase().includes(query) ||
          k.jurusan.toLowerCase().includes(query) ||
          (typeof k.waliKelas === "object" && k.waliKelas && (k.waliKelas as WaliKelasPopulated).nama?.toLowerCase().includes(query))
      )
    : kelasList;

  const mapelListTampil = query
    ? mapelList.filter(
        (m) =>
          m.nama.toLowerCase().includes(query) ||
          (m.kode && m.kode.toLowerCase().includes(query)) ||
          (m.jurusan && m.jurusan.toLowerCase().includes(query))
      )
    : mapelList;

  const daftarUserLainTampil = query
    ? daftarUserLain.filter(
        (u) =>
          u.nama.toLowerCase().includes(query) ||
          (u.username && u.username.toLowerCase().includes(query)) ||
          (u.email && u.email.toLowerCase().includes(query)) ||
          (u.nip && u.nip.toLowerCase().includes(query)) ||
          u.role.toLowerCase().includes(query)
      )
    : daftarUserLain;

  const pengumumanListTampil = query
    ? pengumumanList.filter(
        (p) =>
          p.judul.toLowerCase().includes(query) ||
          p.isi.toLowerCase().includes(query) ||
          p.target.toLowerCase().includes(query)
      )
    : pengumumanList;

  function jumlahSiswaDiKelas(namaKelas: string): number {
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
    .filter((a): a is { label: string; waktu: string } => typeof a.waktu === "string")
    .sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());

  const aktivitasTertampil = showSemuaAktivitas ? daftarAktivitas.slice(0, 20) : daftarAktivitas.slice(0, 5);

  // Data distribusi pengguna buat pie chart
  const totalSemuaRole = jumlahPerRole.guru + jumlahPerRole.siswa + jumlahPerRole.kepsek + jumlahPerRole.kurikulum;
  const distribusi = [
    { label: "Guru", value: jumlahPerRole.guru, color: "#6B2858" },
    { label: "Siswa", value: jumlahPerRole.siswa, color: "#D95A91" },
    { label: "Kepsek", value: jumlahPerRole.kepsek, color: "#A44B78" },
    { label: "Kurikulum", value: jumlahPerRole.kurikulum, color: "#C9AFC0" },
  ].filter((d) => d.value > 0);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#FCF7FA] flex text-[#4C3447]">
      {/* Backdrop overlay di mobile saat drawer terbuka */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar: Drawer di mobile (< md), compact di tablet (md), expanded di desktop (lg) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[260px] flex-col overflow-hidden bg-gradient-to-b from-[#682653] via-[#5B1F4B] to-[#451638] text-white shadow-2xl transition-transform duration-300 md:static md:translate-x-0 md:shadow-[8px_0_28px_rgba(76,25,61,0.08)] md:w-[76px] lg:w-[252px] border-r border-white/[0.06] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Identitas sekolah */}
        <div className="px-4 py-4 md:px-2 lg:px-5 lg:py-5 flex items-center justify-between md:justify-center lg:justify-start gap-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white border-2 border-[#F2B8D2] shrink-0 shadow-md overflow-hidden flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo SMK Citra Negara"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="min-w-0 md:hidden lg:block">
              <p className="font-bold text-[14px] leading-tight tracking-tight">SMK Citra Negara</p>
              <p className="text-[10px] text-white/65 leading-tight mt-1">Learning Management System</p>
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

        {/* Menu utama */}
        <nav className="flex-1 min-h-0 px-3 md:px-2 lg:px-3 pt-4 lg:pt-5 pb-3 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent]">
          <p className="hidden lg:flex items-center gap-2 px-3 mb-2 text-[9px] font-bold tracking-[0.18em] text-white/45 uppercase">
            <span className="h-px flex-1 bg-white/15" /> Menu Utama <span className="h-px flex-1 bg-white/15" />
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive = activeNav === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveNav(item.key);
                    setSidebarOpen(false);
                  }}
                  title={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`group w-full min-h-[42px] flex items-center justify-start md:justify-center lg:justify-start gap-3 px-3.5 md:px-2 lg:px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 text-left ${
                    isActive
                      ? "bg-gradient-to-r from-[#F8D9E8] to-[#E9A6C6] text-[#541A45] shadow-[0_5px_14px_rgba(35,8,28,0.16)]"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <IconComp className={`w-[19px] h-[19px] shrink-0 transition-transform duration-200 ${isActive ? "scale-105" : "group-hover:scale-105"}`} />
                  <span className="flex-1 truncate md:hidden lg:inline">{item.label}</span>
                  {isActive && <span className="hidden lg:block w-1.5 h-1.5 rounded-full bg-[#8C326B] shrink-0" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Aksi keluar */}
        <div className="shrink-0 px-3 md:px-2 lg:px-3 pt-3 pb-4 border-t border-white/10 bg-black/[0.04]">
          <button
            onClick={handleLogout}
            className="w-full min-h-[42px] flex items-center justify-start md:justify-center lg:justify-start gap-3 px-3.5 md:px-2 lg:px-3.5 py-2 rounded-xl text-[13px] font-semibold text-white/75 hover:bg-white/10 hover:text-white transition"
          >
            <Icon.logout className="w-[19px] h-[19px] shrink-0" />
            <span className="md:hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* Konten utama */}
      <main className="flex-1 min-w-0 pb-8 max-w-none overflow-x-hidden flex flex-col">
        {/* Sticky Topbar — tampil di semua tab */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#F0DCE8] shadow-[0_2px_12px_rgba(91,31,75,0.06)] shrink-0">
          {/* Mobile row */}
          <div className="md:hidden flex h-[58px] items-center justify-between px-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F0DCE8] bg-white text-[#542044] hover:bg-[#FFF0F6] transition shadow-xs"
              aria-label="Buka Menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-bold text-sm text-[#542044] truncate">Panel Administrator</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSearchOpenAdmin(!searchOpenAdmin)}
                className="w-9 h-9 rounded-xl border border-[#F0DCE8] bg-white text-[#542044] hover:bg-[#FFF0F6] flex items-center justify-center transition"
                aria-label="Cari"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#6B2858]" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
                </svg>
              </button>
              <ThemeToggle className="w-9 h-9 sm:w-9 sm:h-9" />
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-red-600 px-2.5 py-1.5 rounded-lg border border-red-200 bg-white"
              >
                Keluar
              </button>
            </div>
          </div>
          {/* Desktop topbar */}
          <div className="hidden md:flex h-[72px] items-center justify-between gap-4 px-6 xl:px-8">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold tracking-widest uppercase text-[#B99EAF]">
                {NAV_ITEMS.find(n => n.key === activeNav)?.label ?? "Dashboard"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle className="w-10 h-10 sm:w-10 sm:h-10" />

              {/* Desktop Search Bar */}
              <div className="relative hidden sm:block w-full max-w-[320px] lg:max-w-[380px]">
                <div className="flex items-center gap-2.5 bg-white border border-[#EEDCE7] rounded-full px-3.5 py-2 shadow-[0_3px_15px_rgba(91,31,75,0.04)] focus-within:ring-2 focus-within:ring-[#D94383] focus-within:border-transparent transition">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#6B2858] shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
                  </svg>
                  <input
                    type="text"
                    value={cariTeks}
                    onChange={(e) => {
                      setCariTeks(e.target.value);
                      setSearchOpenAdmin(true);
                    }}
                    onFocus={() => setSearchOpenAdmin(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const q = cariTeks.toLowerCase().trim();
                        if (!q) return;
                        const matchedNav = NAV_ITEMS.find((n) => n.label.toLowerCase().includes(q) || n.key.toLowerCase().includes(q));
                        if (matchedNav) {
                          setActiveNav(matchedNav.key);
                          setSearchOpenAdmin(false);
                        } else if (daftarGuruTampil.length > 0) {
                          setActiveNav("guru");
                          setSearchOpenAdmin(false);
                        } else if (daftarSiswaTampil.length > 0) {
                          setActiveNav("siswa");
                          setSearchOpenAdmin(false);
                        } else if (kelasListTampil.length > 0) {
                          setActiveNav("kelas");
                          setSearchOpenAdmin(false);
                        } else if (mapelListTampil.length > 0) {
                          setActiveNav("mapel");
                          setSearchOpenAdmin(false);
                        }
                      } else if (e.key === "Escape") {
                        setSearchOpenAdmin(false);
                      }
                    }}
                    placeholder="Cari fitur (guru, siswa, kelas)..."
                    className="w-full bg-transparent text-sm text-[#542044] placeholder:text-[#A78A9D] outline-none"
                  />
                  {cariTeks && (
                    <button
                      type="button"
                      onClick={() => {
                        setCariTeks("");
                        setSearchOpenAdmin(false);
                      }}
                      className="text-[#A78A9D] hover:text-[#542044] text-xs font-bold p-0.5"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Dropdown Hasil Pencarian & Pintasan Fitur */}
                {searchOpenAdmin && (
                  <div className="absolute left-0 mt-2 w-full bg-white rounded-2xl border border-[#F0DDE8] shadow-2xl z-50 overflow-hidden py-1 max-h-[380px] overflow-y-auto">
                    <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[#F0DDE8] bg-[#FFF9FC]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#B99EAF]">
                        {cariTeks ? `Hasil untuk "${cariTeks}"` : "Pintasan Fitur Cepat"}
                      </p>
                      <button onClick={() => setSearchOpenAdmin(false)} className="text-[10px] text-[#A78A9D] hover:text-[#542044]">
                        Tutup
                      </button>
                    </div>

                    <div className="p-1">
                      {NAV_ITEMS.filter((n) => !cariTeks || n.label.toLowerCase().includes(cariTeks.toLowerCase().trim()) || n.key.toLowerCase().includes(cariTeks.toLowerCase().trim())).map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setActiveNav(item.key);
                            setSearchOpenAdmin(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold transition ${
                            activeNav === item.key ? "bg-[#FCEAF2] text-[#8B3569]" : "text-[#542044] hover:bg-[#FFF0F6]"
                          }`}
                        >
                          <span className="p-1 rounded-lg bg-[#F9E6F0] text-[#8B3569]">
                            <item.icon className="w-4 h-4" />
                          </span>
                          <span className="flex-1">Buka Menu {item.label}</span>
                          <span className="text-[10px] text-[#B99EAF]">Buka &rarr;</span>
                        </button>
                      ))}
                    </div>

                    {cariTeks.trim() && (
                      <div className="border-t border-[#F0DDE8] p-1 bg-[#FAFAFA]">
                        {daftarGuruTampil.length > 0 && (
                          <div className="mb-1">
                            <p className="px-3 py-1 text-[10px] font-bold text-[#8A7182]">Guru ({daftarGuruTampil.length})</p>
                            {daftarGuruTampil.slice(0, 2).map((g) => (
                              <button
                                key={g._id}
                                onClick={() => {
                                  setActiveNav("guru");
                                  setSearchOpenAdmin(false);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-[#FFF0F6] flex justify-between"
                              >
                                <span className="font-semibold text-[#542044]">{g.nama}</span>
                                <span className="text-[10px] text-[#B99EAF]">{g.mataPelajaran?.join(", ") || "Guru"}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {daftarSiswaTampil.length > 0 && (
                          <div className="mb-1">
                            <p className="px-3 py-1 text-[10px] font-bold text-[#8A7182]">Siswa ({daftarSiswaTampil.length})</p>
                            {daftarSiswaTampil.slice(0, 2).map((s) => (
                              <button
                                key={s._id}
                                onClick={() => {
                                  setActiveNav("siswa");
                                  setSearchOpenAdmin(false);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-[#FFF0F6] flex justify-between"
                              >
                                <span className="font-semibold text-[#542044]">{s.nama}</span>
                                <span className="text-[10px] text-[#B99EAF]">{s.kelas || "-"}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {kelasListTampil.length > 0 && (
                          <div className="mb-1">
                            <p className="px-3 py-1 text-[10px] font-bold text-[#8A7182]">Kelas ({kelasListTampil.length})</p>
                            {kelasListTampil.slice(0, 2).map((k) => (
                              <button
                                key={k._id}
                                onClick={() => {
                                  setActiveNav("kelas");
                                  setSearchOpenAdmin(false);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-[#FFF0F6] flex justify-between"
                              >
                                <span className="font-semibold text-[#542044]">{k.namaKelas}</span>
                                <span className="text-[10px] text-[#B99EAF]">{k.jurusan}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => { setShowNotif(!showNotif); setShowProfileMenu(false); }}
                  className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#5B1F4B] hover:bg-[#F6E8F0] transition"
                  aria-label="Notifikasi"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>
                  </svg>
                  {daftarAktivitas.length > 0 && <span className="absolute top-0 right-0 min-w-[17px] h-[17px] px-1 rounded-full bg-[#D83E78] text-white text-[10px] flex items-center justify-center">{Math.min(daftarAktivitas.length, 9)}</span>}
                </button>
                {showNotif && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-[#F0DDE8] shadow-xl z-30 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#F3E5ED] font-semibold text-sm text-[#5B1F4B]">Notifikasi terbaru</div>
                    {daftarAktivitas.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-[#B99EAF] text-center">Belum ada aktivitas</p>
                    ) : (
                      <div className="max-h-72 overflow-y-auto">
                        {daftarAktivitas.slice(0, 5).map((a, i) => (
                          <div key={i} className="px-4 py-3 border-b border-[#F8EDF3] last:border-0">
                            <p className="text-sm text-[#4C3447]">{a.label}</p>
                            <p className="text-xs text-[#B99EAF] mt-1">{waktuRelatif(a.waktu)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="h-8 w-px bg-[#E8D5E1] mx-1" />
              <div className="relative">
                <button
                  onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotif(false); }}
                  className="flex items-center gap-3 rounded-full hover:bg-[#F9EEF4] py-1 pl-1 pr-2 transition"
                >
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B3569] to-[#5B1F4B] text-white flex items-center justify-center font-semibold shadow-sm text-sm">{currentUser.nama.charAt(0).toUpperCase()}</span>
                  <span className="hidden sm:block text-left">
                    <span className="block text-sm font-semibold text-[#542044]">Admin</span>
                    <span className="block text-[11px] text-[#A78A9D]">{currentUser.nama}</span>
                  </span>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#6B2858]" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl border border-[#F0DDE8] shadow-xl z-30 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#F0DDE8]">
                      <p className="text-sm font-semibold text-[#5B1F4B]">{currentUser.nama}</p>
                      <p className="text-xs text-[#B99EAF] mt-1">Administrator LMS</p>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50">Keluar dari akun</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Search Overlay */}
        {searchOpenAdmin && (
          <div className="md:hidden px-3 py-2.5 bg-white border-b border-[#F0DDE8] shadow-md z-20">
            <div className="flex items-center gap-2 bg-[#FFF7FB] border border-[#EEDCE7] rounded-xl px-3 py-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#6B2858] shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
              </svg>
              <input
                type="text"
                autoFocus
                value={cariTeks}
                onChange={(e) => setCariTeks(e.target.value)}
                placeholder="Cari fitur (guru, siswa, kelas)..."
                className="w-full bg-transparent text-sm text-[#542044] outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpenAdmin(false)}
                className="text-xs font-semibold text-[#8B3569] hover:text-[#542044] px-1"
              >
                Tutup
              </button>
            </div>
            <div className="mt-2 max-h-56 overflow-y-auto space-y-1">
              {NAV_ITEMS.filter((n) => !cariTeks || n.label.toLowerCase().includes(cariTeks.toLowerCase().trim()) || n.key.toLowerCase().includes(cariTeks.toLowerCase().trim())).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveNav(item.key);
                    setSearchOpenAdmin(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-[#542044] hover:bg-[#FFF0F6] transition"
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-[#8B3569]" />
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[#B99EAF]">Buka &rarr;</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 px-3 sm:px-6 xl:px-8 pt-5">

        {/* ===== BERANDA ===== */}
        {activeNav === "beranda" && (
          <>
            {/* Topbar (kept for spacing/compat, now empty) */}
            <div className="hidden">
              <div className="hidden sm:flex items-center gap-3 bg-white/90 border border-[#EEDCE7] rounded-full px-4 py-3 w-full max-w-[410px] shadow-[0_3px_15px_rgba(91,31,75,0.04)]">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#6B2858]" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
                </svg>
                <span className="text-sm text-[#A78A9D]">Cari fitur atau informasi...</span>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <div className="relative">
                  <button
                    onClick={() => { setShowNotif(!showNotif); setShowProfileMenu(false); }}
                    className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#5B1F4B] hover:bg-[#F6E8F0] transition"
                    aria-label="Notifikasi"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>
                    </svg>
                    {daftarAktivitas.length > 0 && <span className="absolute top-0 right-0 min-w-[17px] h-[17px] px-1 rounded-full bg-[#D83E78] text-white text-[10px] flex items-center justify-center">{Math.min(daftarAktivitas.length, 9)}</span>}
                  </button>
                  {showNotif && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-[#F0DDE8] shadow-xl z-30 overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#F3E5ED] font-semibold text-sm text-[#5B1F4B]">Notifikasi terbaru</div>
                      {daftarAktivitas.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-[#B99EAF] text-center">Belum ada aktivitas</p>
                      ) : (
                        <div className="max-h-72 overflow-y-auto">
                          {daftarAktivitas.slice(0, 5).map((a, i) => (
                            <div key={i} className="px-4 py-3 border-b border-[#F8EDF3] last:border-0">
                              <p className="text-sm text-[#4C3447]">{a.label}</p>
                              <p className="text-xs text-[#B99EAF] mt-1">{waktuRelatif(a.waktu)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="h-8 w-px bg-[#E8D5E1] mx-1" />
                <div className="relative">
                  <button
                    onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotif(false); }}
                    className="flex items-center gap-3 rounded-full hover:bg-white/70 py-1 pl-1 pr-2 transition"
                  >
                    <span className="w-10 h-10 rounded-full bg-[#6B2858] text-white flex items-center justify-center font-semibold shadow-sm">{currentUser.nama.charAt(0).toUpperCase()}</span>
                    <span className="hidden sm:block text-left">
                      <span className="block text-sm font-semibold text-[#542044]">Admin</span>
                      <span className="block text-[11px] text-[#A78A9D]">{currentUser.nama}</span>
                    </span>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#6B2858]" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl border border-[#F0DDE8] shadow-xl z-30 overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#F0DDE8]">
                        <p className="text-sm font-semibold text-[#5B1F4B]">{currentUser.nama}</p>
                        <p className="text-xs text-[#B99EAF] mt-1">Administrator LMS</p>
                      </div>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50">Keluar dari akun</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hero banner */}
            <section className="relative min-h-[190px] sm:min-h-[220px] lg:min-h-[225px] overflow-hidden rounded-[26px] mb-5 border border-[#EBCBDD] bg-gradient-to-r from-[#FCEAF2] via-[#F7DCE9] to-[#E7B0CD] shadow-[0_8px_28px_rgba(91,31,75,0.07)]">
              <div className="absolute -right-14 -top-32 w-[390px] h-[390px] rounded-full border-[38px] border-white/30"/>
              <div className="absolute right-[22%] -bottom-44 w-[330px] h-[330px] rounded-full bg-[#B54D83]/15"/>
              <div className="absolute right-0 bottom-0 w-[58%] h-full opacity-25 md:opacity-95 pointer-events-none">
                <svg viewBox="0 0 650 280" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
                  <defs>
                    <linearGradient id="schoolSky" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#F9E9F2"/><stop offset="1" stopColor="#D99AB9"/></linearGradient>
                    <linearGradient id="schoolWall" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#FFFDFE"/><stop offset="1" stopColor="#E9D4E0"/></linearGradient>
                  </defs>
                  <path d="M0 0h650v280H0z" fill="url(#schoolSky)"/>
                  <circle cx="515" cy="48" r="75" fill="#fff" opacity=".24"/>
                  <path d="M0 208 90 158l76 45 83-63 95 64 86-53 105 62 115-57v124H0Z" fill="#8D5277" opacity=".22"/>
                  <path d="M60 245V112l165-52 164 52v133Z" fill="url(#schoolWall)" stroke="#C78EAD" strokeWidth="3"/>
                  <path d="M45 115 225 45l181 70" fill="none" stroke="#9B4E7A" strokeWidth="12" strokeLinejoin="round"/>
                  <path d="M80 127h290M80 184h290" stroke="#D4A9C0" strokeWidth="5"/>
                  {Array.from({length:6}).map((_,i)=><g key={i}><rect x={91+i*45} y="137" width="27" height="34" rx="3" fill="#9D6688"/><rect x={91+i*45} y="192" width="27" height="38" rx="3" fill="#9D6688"/><path d={`M${104+i*45} 137v34M${91+i*45} 154h27M${104+i*45} 192v38`} stroke="#F8EAF1" strokeWidth="2"/></g>)}
                  <path d="M420 245V145l92-30 92 30v100Z" fill="#F9F0F5" stroke="#C78EAD" strokeWidth="3"/>
                  <path d="m408 148 104-43 104 43" fill="none" stroke="#9B4E7A" strokeWidth="10"/>
                  {Array.from({length:4}).map((_,i)=><rect key={i} x={435+i*42} y="165" width="25" height="34" rx="3" fill="#A46B8D"/>)}
                  <path d="M0 250h650" stroke="#9D6688" strokeWidth="8" opacity=".45"/>
                  <g fill="#6F9470"><circle cx="34" cy="196" r="28"/><circle cx="20" cy="177" r="20"/><circle cx="50" cy="173" r="22"/><rect x="29" y="196" width="9" height="54" fill="#8C6A5A"/></g>
                  <g fill="#6F9470"><circle cx="610" cy="192" r="30"/><circle cx="590" cy="171" r="22"/><circle cx="630" cy="166" r="24"/><rect x="606" y="190" width="9" height="60" fill="#8C6A5A"/></g>
                </svg>
              </div>
              <div className="absolute inset-y-0 right-[42%] w-24 bg-gradient-to-r from-[#F7DCE9] to-transparent pointer-events-none"/>
              <div className="relative z-10 px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8 max-w-[600px]">
                <span className="inline-flex items-center rounded-full bg-[#6B2858] text-white px-3.5 py-1.5 text-[11px] font-semibold tracking-wide shadow-sm mb-3">PANEL ADMINISTRATOR</span>
                <h1 className="text-xl sm:text-[28px] lg:text-[32px] leading-[1.15] font-extrabold text-[#542044] max-w-[520px]">Kelola data akademik dengan mudah dan efisien.</h1>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm lg:text-[15px] leading-relaxed text-[#70415F] max-w-[420px]">Pantau aktivitas, kelola pengguna, dan optimalkan proses pembelajaran di LMS SMK Citra Negara.</p>
              </div>
            </section>

            {/* Statistik */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
              <StatCard label="Total Guru" value={jumlahPerRole.guru} icon={Icon.guru} onClick={() => setActiveNav("guru")} />
              <StatCard label="Total Siswa" value={jumlahPerRole.siswa} icon={Icon.siswa} onClick={() => setActiveNav("siswa")} />
              <StatCard label="Total Kelas" value={kelasList.length} icon={Icon.kelas} onClick={() => setActiveNav("kelas")} />
              <StatCard label="Total Mapel" value={mapelList.length} icon={Icon.mapel} onClick={() => setActiveNav("mapel")} />
            </div>

            {/* Distribusi pengguna */}
            <div className="grid grid-cols-1 mb-4">
              <section className="bg-white rounded-[22px] border border-[#F0DDE8] p-5 lg:p-6 shadow-[0_6px_24px_rgba(91,31,75,0.045)]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-9 h-9 rounded-xl bg-[#F9E6F0] text-[#8B3569] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></svg>
                  </span>
                  <h2 className="font-bold text-[#542044]">Distribusi Pengguna</h2>
                </div>
                {totalSemuaRole === 0 ? (
                  <p className="text-sm text-[#B99EAF] text-center py-10">Belum ada data pengguna.</p>
                ) : (
                  <div className="flex items-center justify-center gap-5 flex-wrap">
                    <div className="relative">
                      <DonutChart data={distribusi} total={totalSemuaRole}/>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-extrabold text-[#542044]">{totalSemuaRole}</span>
                        <span className="text-[11px] text-[#8A7182]">Total User</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 min-w-[150px]">
                      {distribusi.map((d) => {
                        const targetNav =
                          d.label.toLowerCase() === "guru"
                            ? "guru"
                            : d.label.toLowerCase() === "siswa"
                            ? "siswa"
                            : "user";
                        return (
                          <button
                            key={d.label}
                            type="button"
                            onClick={() => {
                              setActiveNav(targetNav);
                              if (targetNav === "user") {
                                const roleKey = d.label.toLowerCase();
                                if (["admin", "kepsek", "kurikulum"].includes(roleKey)) {
                                  setUserTab(roleKey);
                                }
                              }
                            }}
                            className="w-full flex items-center gap-2 text-sm px-2.5 py-1.5 rounded-xl hover:bg-[#FFF0F6] transition cursor-pointer text-left group"
                          >
                            <span className="w-3 h-3 rounded-full shrink-0 group-hover:scale-125 transition-transform" style={{ background: d.color }} />
                            <span className="text-[#70415F] flex-1 font-medium group-hover:text-[#542044]">{d.label}</span>
                            <span className="font-semibold text-[#542044] tabular-nums mr-1">{Math.round(d.value / totalSemuaRole * 100)}%</span>
                            <span className="text-[10px] text-[#D95A91] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Buka →</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Aktivitas dan pengumuman */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <section className="bg-white rounded-[22px] border border-[#F0DDE8] p-5 lg:p-6 shadow-[0_6px_24px_rgba(91,31,75,0.045)]">
                <div className="flex items-center justify-between gap-3 pb-3 mb-1 border-b border-[#F3E5ED]">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-[#F9E6F0] text-[#8B3569] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                    </span>
                    <h2 className="font-bold text-[#542044]">Aktivitas Terbaru</h2>
                  </div>
                  {daftarAktivitas.length > 5 && <button onClick={() => setShowSemuaAktivitas(!showSemuaAktivitas)} className="text-xs font-semibold text-[#8B3569] hover:text-[#D95A91]">{showSemuaAktivitas ? "Ringkas" : "Lihat Semua"} →</button>}
                </div>
                {daftarAktivitas.length === 0 ? (
                  <p className="py-8 text-sm text-[#B99EAF] text-center">Belum ada aktivitas tercatat.</p>
                ) : (
                  <div>
                    {aktivitasTertampil.map((a,i)=>(
                      <div key={i} className="flex items-start gap-3 py-3 border-b border-[#F8EDF3] last:border-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D95A91] mt-1.5 shrink-0"/>
                        <p className="text-[13px] leading-relaxed text-[#5C3B53] flex-1">{a.label}</p>
                        <span className="text-[11px] text-[#B99EAF] whitespace-nowrap pt-0.5">{waktuRelatif(a.waktu)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-[22px] border border-[#F0DDE8] p-5 lg:p-6 shadow-[0_6px_24px_rgba(91,31,75,0.045)]">
                <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-[#F3E5ED]">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-[#F9E6F0] text-[#8B3569] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10v4h4l5 4V6l-5 4H3Z"/><path d="M16 9a5 5 0 0 1 0 6M19 6a9 9 0 0 1 0 12"/></svg>
                    </span>
                    <h2 className="font-bold text-[#542044]">Pengumuman Terbaru</h2>
                  </div>
                  <button onClick={() => setActiveNav("pengumuman")} className="text-xs font-semibold text-[#8B3569] hover:text-[#D95A91]">Lihat Semua →</button>
                </div>
                {pengumumanList.length === 0 ? (
                  <div className="rounded-2xl bg-[#FCF5F9] px-4 py-7 text-center">
                    <p className="text-sm font-medium text-[#70415F]">Belum ada pengumuman</p>
                    <button onClick={() => {setFormPengumuman(FORM_PENGUMUMAN_KOSONG);setFormPengumumanError("");setShowFormPengumuman(true);}} className="mt-3 text-xs font-semibold text-[#8B3569]">+ Buat pengumuman pertama</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pengumumanList.slice(0,2).map((p)=>(
                      <article key={p._id} className="rounded-2xl bg-gradient-to-r from-[#FCF0F6] to-[#F8E4EF] p-4 border border-[#F2D9E6]">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-[#A04478]">{p.prioritas === "penting" ? "Penting" : "Informasi"} · {TARGET_LABEL[p.target] || p.target}</span>
                          <span className="text-[10px] text-[#A78A9D]">{waktuRelatif(p.createdAt)}</span>
                        </div>
                        <h3 className="font-bold text-sm text-[#542044]">{p.judul}</h3>
                        <p className="text-xs text-[#70415F] mt-1.5 leading-relaxed line-clamp-2">{p.isi}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        {/* ===== GURU ===== */}
        {activeNav === "guru" && (
          <SectionCard title="Daftar Guru" tambahHref="/admin/guru/tambah" tambahLabel="+ Tambah Guru">
            {isLoading ? (
              <SkeletonTable />
            ) : daftarGuruTampil.length === 0 ? (
              <Placeholder text={cariTeks ? `Tidak ada guru yang cocok dengan "${cariTeks}".` : 'Belum ada guru. Klik "+ Tambah Guru" untuk mulai.'} />
            ) : (
              <div className="w-full overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-[#B99EAF] border-b border-[#F0DDE8]">
                    <th className="px-6 py-3 font-medium">Nama</th>
                    <th className="px-6 py-3 font-medium">Email (Login)</th>
                    <th className="px-6 py-3 font-medium">NIP</th>
                    <th className="px-6 py-3 font-medium">Mata Pelajaran</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {daftarGuruTampil.map((u) => (
                    <tr key={u._id} className="border-b border-[#F8EDF3] last:border-0 hover:bg-[#FFF9FC] transition">
                      <td className="px-6 py-3.5 text-[#4C3447] font-medium">{u.nama}</td>
                      <td className="px-6 py-3.5 text-[#8A7182]">{u.email || "-"}</td>
                      <td className="px-6 py-3.5 text-[#8A7182]">{u.nip || "-"}</td>
                      <td className="px-6 py-3.5 text-[#8A7182]">{u.mataPelajaran?.join(", ") || "-"}</td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => bukaEditUser(u)} className="text-xs font-medium text-[#5B1F4B] hover:text-[#D95A91]">
                            Edit
                          </button>
                          <button onClick={() => setUserDihapus(u)} className="text-xs font-medium text-red-600 hover:text-red-700">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </SectionCard>
        )}

        {/* ===== SISWA ===== */}
        {activeNav === "siswa" && (
          <SectionCard title="Daftar Siswa" tambahHref="/admin/siswa/tambah" tambahLabel="+ Tambah Siswa">
            {isLoading ? (
              <SkeletonTable />
            ) : daftarSiswaTampil.length === 0 ? (
              <Placeholder text={cariTeks ? `Tidak ada siswa yang cocok dengan "${cariTeks}".` : 'Belum ada siswa. Klik "+ Tambah Siswa" untuk mulai.'} />
            ) : (
              <div className="w-full overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-[#B99EAF] border-b border-[#F0DDE8]">
                    <th className="px-6 py-3 font-medium">Nama</th>
                    <th className="px-6 py-3 font-medium">NIS</th>
                    <th className="px-6 py-3 font-medium">NISN (Login)</th>
                    <th className="px-6 py-3 font-medium">Kelas</th>
                    <th className="px-6 py-3 font-medium">Jurusan</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {daftarSiswaTampil.map((u) => (
                    <tr key={u._id} className="border-b border-[#F8EDF3] last:border-0 hover:bg-[#FFF9FC] transition">
                      <td className="px-6 py-3.5 text-[#4C3447] font-medium">{u.nama}</td>
                      <td className="px-6 py-3.5 text-[#8A7182]">{u.nis || "-"}</td>
                      <td className="px-6 py-3.5 text-[#8A7182]">{u.nisn || "-"}</td>
                      <td className="px-6 py-3.5 text-[#8A7182]">{u.kelas || "-"}</td>
                      <td className="px-6 py-3.5 text-[#8A7182]">{u.jurusan || "-"}</td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => bukaEditUser(u)} className="text-xs font-medium text-[#5B1F4B] hover:text-[#D95A91]">
                            Edit
                          </button>
                          <button onClick={() => setUserDihapus(u)} className="text-xs font-medium text-red-600 hover:text-red-700">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </SectionCard>
        )}

        {/* ===== KELAS ===== */}
        {activeNav === "kelas" && (
          <SectionCard title="Kelola Kelas" tambahHref="/admin/kelas/tambah" tambahLabel="+ Tambah Kelas">
            {isLoadingKelas ? (
              <SkeletonTable />
            ) : kelasListTampil.length === 0 ? (
              <Placeholder text={cariTeks ? `Tidak ada kelas yang cocok dengan "${cariTeks}".` : 'Belum ada kelas. Klik "+ Tambah Kelas" untuk mulai.'} />
            ) : (
              <div className="w-full overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-[#B99EAF] border-b border-[#F0DDE8]">
                    <th className="px-6 py-3 font-medium">Nama Kelas</th>
                    <th className="px-6 py-3 font-medium">Tingkat</th>
                    <th className="px-6 py-3 font-medium">Jurusan</th>
                    <th className="px-6 py-3 font-medium">Wali Kelas</th>
                    <th className="px-6 py-3 font-medium">Jumlah Siswa</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kelasListTampil.map((k) => {
                    const namaWali =
                      typeof k.waliKelas === "object" && k.waliKelas !== null
                        ? (k.waliKelas as WaliKelasPopulated).nama
                        : "-";
                    return (
                      <tr key={k._id} className="border-b border-[#F8EDF3] last:border-0 hover:bg-[#FFF9FC] transition">
                        <td className="px-6 py-3.5 text-[#4C3447] font-medium">{k.namaKelas}</td>
                        <td className="px-6 py-3.5 text-[#8A7182]">{k.tingkat}</td>
                        <td className="px-6 py-3.5 text-[#8A7182]">{k.jurusan}</td>
                        <td className="px-6 py-3.5 text-[#8A7182]">{namaWali}</td>
                        <td className="px-6 py-3.5 text-[#8A7182]">{jumlahSiswaDiKelas(k.namaKelas)} siswa</td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => bukaEditKelas(k)} className="text-xs font-medium text-[#5B1F4B] hover:text-[#D95A91]">
                              Edit
                            </button>
                            <button onClick={() => setKelasDihapus(k)} className="text-xs font-medium text-red-600 hover:text-red-700">
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table></div>
            )}
          </SectionCard>
        )}

        {/* ===== PENGUMUMAN ===== */}
        {activeNav === "pengumuman" && (
          <div className="bg-white rounded-2xl border border-[#F0DDE8] overflow-hidden shadow-[0_8px_30px_rgba(91,31,75,0.05)]">
            <div className="px-6 py-5 border-b border-[#F0DDE8] flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold text-[#5B1F4B]">Pengumuman</h2>
              <button
                onClick={() => {
                  setFormPengumuman(FORM_PENGUMUMAN_KOSONG);
                  setFormPengumumanError("");
                  setShowFormPengumuman(true);
                }}
                className="px-4 py-2 rounded-lg bg-[#5B1F4B] text-white text-sm font-medium hover:bg-[#D95A91] hover:text-[#5B1F4B] transition"
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
                  <div key={p._id} className="px-6 py-5 border-b border-[#F8EDF3] last:border-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          {p.prioritas === "penting" && (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-semibold">
                              Penting
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-[#FBF7FA] text-[#5B1F4B] text-[11px] font-medium">
                            Untuk: {TARGET_LABEL[p.target] || p.target}
                          </span>
                          <span className="text-xs text-[#B99EAF]">{waktuRelatif(p.createdAt)}</span>
                        </div>
                        <h3 className="font-semibold text-[#5B1F4B]">{p.judul}</h3>
                        <p className="text-sm text-[#8A7182] mt-1 whitespace-pre-line">{p.isi}</p>
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
          <div className="bg-white rounded-2xl border border-[#F0DDE8] overflow-hidden shadow-[0_8px_30px_rgba(91,31,75,0.05)]">
            <div className="px-6 py-5 border-b border-[#F0DDE8] flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold text-[#5B1F4B]">Kelola User Lain</h2>
              <button
                onClick={() => {
                  setForm(FORM_KOSONG);
                  setFormError("");
                  setShowForm(true);
                }}
                className="px-4 py-2 rounded-lg bg-[#5B1F4B] text-white text-sm font-medium hover:bg-[#D95A91] hover:text-[#5B1F4B] transition"
              >
                + Tambah User
              </button>
            </div>

            <div className="px-6 pt-4 flex gap-1 border-b border-[#F0DDE8] flex-wrap">
              {["semua", "admin", "kepsek", "kurikulum"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setUserTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                    userTab === tab
                      ? "text-[#5B1F4B] border-b-2 border-[#D95A91]"
                      : "text-[#B99EAF] hover:text-[#8A7182]"
                  }`}
                >
                  {tab === "semua" ? "Semua" : ROLE_LABEL[tab]}
                </button>
              ))}
            </div>

            {isLoading ? (
              <SkeletonTable />
            ) : daftarUserLainTampil.length === 0 ? (
              <Placeholder text={cariTeks ? `Tidak ada user yang cocok dengan "${cariTeks}".` : "Belum ada pengguna di kategori ini."} />
            ) : (
              <div className="w-full overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-[#B99EAF] border-b border-[#F0DDE8]">
                    <th className="px-6 py-3 font-medium">Nama</th>
                    <th className="px-6 py-3 font-medium">Login</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {daftarUserLainTampil.map((u) => (
                    <tr key={u._id} className="border-b border-[#F8EDF3] last:border-0 hover:bg-[#FFF9FC] transition">
                      <td className="px-6 py-3.5 text-[#4C3447] font-medium">{u.nama}</td>
                      <td className="px-6 py-3.5 text-[#8A7182]">{u.username || u.nip || u.email || "-"}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-[#FBF7FA] text-[#5B1F4B] text-xs font-medium">
                          {ROLE_LABEL[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => bukaEditUser(u)} className="text-xs font-medium text-[#5B1F4B] hover:text-[#D95A91]">
                            Edit
                          </button>
                          <button onClick={() => setUserDihapus(u)} className="text-xs font-medium text-red-600 hover:text-red-700">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>
        )}

        {/* ===== MATA PELAJARAN ===== */}
        {activeNav === "mapel" && (
          <div className="bg-white rounded-2xl border border-[#F0DDE8] overflow-hidden shadow-[0_8px_30px_rgba(91,31,75,0.05)]">
            <div className="px-6 py-5 border-b border-[#F0DDE8] flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold text-[#5B1F4B]">Kelola Mata Pelajaran</h2>
              <button
                onClick={bukaTambahMapel}
                className="px-4 py-2 rounded-lg bg-[#5B1F4B] text-white text-sm font-medium hover:bg-[#D95A91] hover:text-[#5B1F4B] transition"
              >
                + Tambah Mata Pelajaran
              </button>
            </div>

            {isLoadingMapel ? (
              <SkeletonTable />
            ) : mapelListTampil.length === 0 ? (
              <Placeholder text={cariTeks ? `Tidak ada mata pelajaran yang cocok dengan "${cariTeks}".` : 'Belum ada mata pelajaran. Klik "+ Tambah Mata Pelajaran" untuk mulai.'} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="text-left text-[#B99EAF] border-b border-[#F0DDE8]">
                      <th className="px-6 py-3 font-medium">Kode</th>
                      <th className="px-6 py-3 font-medium">Mata Pelajaran</th>
                      <th className="px-6 py-3 font-medium">Kelompok</th>
                      <th className="px-6 py-3 font-medium">Jurusan</th>
                      <th className="px-6 py-3 font-medium">Guru Pengampu</th>
                      <th className="px-6 py-3 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mapelListTampil.map((m) => {
                      const pengampu = guruPengampu(m.nama);
                      return (
                        <tr key={m._id} className="border-b border-[#F8EDF3] last:border-0 hover:bg-[#FFF9FC] transition">
                          <td className="px-6 py-3.5 text-[#8A7182]">{m.kode || "-"}</td>
                          <td className="px-6 py-3.5 text-[#4C3447] font-medium">{m.nama}</td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                m.kelompok === "Kejuruan" ? "bg-[#FCEAF2] text-[#A83E75]" : "bg-[#FBF7FA] text-[#8A7182]"
                              }`}
                            >
                              {m.kelompok}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-[#8A7182]">{m.jurusan || "Semua"}</td>
                          <td className="px-6 py-3.5 text-[#8A7182]">
                            {pengampu.length === 0 ? "-" : pengampu.map((g) => g.nama).join(", ")}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => bukaEditMapel(m)} className="text-xs font-medium text-[#5B1F4B] hover:text-[#D95A91]">
                                Edit
                              </button>
                              <button onClick={() => setMapelDihapus(m)} className="text-xs font-medium text-red-600 hover:text-red-700">
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== LAPORAN ===== */}
        {activeNav === "laporan" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#F0DDE8] p-5 lg:p-6 shadow-[0_6px_24px_rgba(91,31,75,0.045)]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#F9E6F0] text-[#8B3569] flex items-center justify-center">
                  <Icon.laporan className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#542044]">Laporan & Rekapitulasi Akademik</h2>
                  <p className="text-xs text-[#70415F] mt-0.5">Pantau data rekapitulasi nilai sekolah dan pembagian pengajar per kelas secara terpadu.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <GuruPerKelas />
              <RekapNilai bolehUnduh />
            </div>
          </div>
        )}

        {/* ===== PERATURAN ===== */}
        {activeNav === "peraturan" && (
          <div className="bg-white rounded-2xl border border-[#F0DDE8] p-6 lg:p-8 shadow-[0_6px_24px_rgba(91,31,75,0.045)]">
            <div className="border-b border-[#F0DDE8] pb-4 mb-6">
              <h2 className="text-xl font-bold text-[#542044]">Tata Tertib & Peraturan LMS SMK Citra Negara</h2>
              <p className="text-sm text-[#70415F] mt-1">Pedoman dan tata cara pelaksanaan pembelajaran daring, evaluasi tugas, dan kuis online.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl border border-[#F5D8E7] bg-[#FFF9FC]">
                <h3 className="font-bold text-[#70295F] text-sm mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D94383]" /> Tata Tertib Guru Pengampu
                </h3>
                <ul className="text-xs text-[#59234F] space-y-2 list-disc list-inside leading-relaxed">
                  <li>Mengunggah materi pembelajaran dan modul sesuai dengan silabus kurikulum.</li>
                  <li>Memberikan tenggat waktu tugas yang wajar dan jelas bagi seluruh siswa.</li>
                  <li>Memeriksa jawaban tugas dan menginput nilai secara berkala dan transparan.</li>
                  <li>Menjaga kerahasiaan soal kuis dan akun akses pendidik.</li>
                </ul>
              </div>
              <div className="p-5 rounded-2xl border border-[#F5D8E7] bg-[#FFF9FC]">
                <h3 className="font-bold text-[#70295F] text-sm mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D94383]" /> Tata Tertib Siswa
                </h3>
                <ul className="text-xs text-[#59234F] space-y-2 list-disc list-inside leading-relaxed">
                  <li>Mengikuti kegiatan pembelajaran dan mengunduh materi tepat waktu.</li>
                  <li>Mengumpulkan tugas sebelum batas deadline yang telah ditentukan.</li>
                  <li>Mengerjakan kuis daring secara mandiri, jujur, dan tidak berbuat curang.</li>
                  <li>Menjaga etika, kesopanan, dan kerahasiaan akun login NISN masing-masing.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Modal Tambah User (admin/kepsek/kurikulum) */}
      {showForm && (
        <div className="fixed inset-0 bg-[#32112B]/45 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#5B1F4B] text-lg">Tambah User</h3>
              <button onClick={() => setShowForm(false)} className="text-[#B99EAF] hover:text-[#8A7182] text-xl leading-none">
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
                  className="w-full px-3 py-2 rounded-lg border border-[#E8D5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#D95A91]" />
              </Field>
              <Field label="Role">
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8D5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#D95A91]">
                  <option value="admin">Admin</option>
                  <option value="kepsek">Kepala Sekolah</option>
                  <option value="kurikulum">Kurikulum</option>
                </select>
              </Field>

              {form.role === "admin" && (
                <Field label="Username (dipakai untuk login)">
                  <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8D5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#D95A91]" />
                </Field>
              )}
              {form.role === "kepsek" && (
                <Field label="NIP (dipakai untuk login)">
                  <input required value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8D5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#D95A91]" />
                </Field>
              )}
              {form.role === "kurikulum" && (
                <Field label="Email (dipakai untuk login)">
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8D5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#D95A91]" />
                </Field>
              )}

              <Field label="Password">
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8D5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#D95A91]" />
              </Field>
              <button type="submit" disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-[#5B1F4B] text-white text-sm font-semibold hover:bg-[#D95A91] hover:text-[#5B1F4B] transition disabled:opacity-60">
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit User (guru / siswa / admin / kepsek / kurikulum) */}
      {userDiedit && (
        <div className="fixed inset-0 bg-[#32112B]/45 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#5B1F4B] text-lg">Edit {ROLE_LABEL[userDiedit.role] || "User"}</h3>
              <button onClick={() => setUserDiedit(null)} className="text-[#B99EAF] hover:text-[#8A7182] text-xl leading-none">
                &times;
              </button>
            </div>

            {formEditError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {formEditError}
              </div>
            )}

            <form onSubmit={handleSimpanEditUser} className="space-y-4">
              <Field label="Nama lengkap">
                <input required value={formEdit.nama} onChange={(e) => setFormEdit({ ...formEdit, nama: e.target.value })} className={INPUT_EDIT} />
              </Field>

              {userDiedit.role === "admin" && (
                <Field label="Username (dipakai untuk login)">
                  <input required value={formEdit.username} onChange={(e) => setFormEdit({ ...formEdit, username: e.target.value })} className={INPUT_EDIT} />
                </Field>
              )}
              {userDiedit.role === "kepsek" && (
                <Field label="NIP (dipakai untuk login)">
                  <input required value={formEdit.nip} onChange={(e) => setFormEdit({ ...formEdit, nip: e.target.value })} className={INPUT_EDIT} />
                </Field>
              )}
              {userDiedit.role === "kurikulum" && (
                <Field label="Email (dipakai untuk login)">
                  <input type="email" required value={formEdit.email} onChange={(e) => setFormEdit({ ...formEdit, email: e.target.value })} className={INPUT_EDIT} />
                </Field>
              )}

              {userDiedit.role === "siswa" && (
                <>
                  <Field label="NIS (data sekolah)">
                    <input required value={formEdit.nis} onChange={(e) => setFormEdit({ ...formEdit, nis: e.target.value })} className={INPUT_EDIT} />
                  </Field>
                  <Field label="NISN (dipakai untuk login)">
                    <input required value={formEdit.nisn} onChange={(e) => setFormEdit({ ...formEdit, nisn: e.target.value })} className={INPUT_EDIT} />
                  </Field>
                  <Field label="Kelas">
                    <input required value={formEdit.kelas} onChange={(e) => setFormEdit({ ...formEdit, kelas: e.target.value })} placeholder="Contoh: X PPLG 1" className={INPUT_EDIT} />
                  </Field>
                  <Field label="Jurusan">
                    <input required value={formEdit.jurusan} onChange={(e) => setFormEdit({ ...formEdit, jurusan: e.target.value })} className={INPUT_EDIT} />
                  </Field>
                  <Field label="Email (opsional)">
                    <input type="email" value={formEdit.email} onChange={(e) => setFormEdit({ ...formEdit, email: e.target.value })} className={INPUT_EDIT} />
                  </Field>
                </>
              )}

              {userDiedit.role === "guru" && (
                <>
                  <Field label="Email (dipakai untuk login)">
                    <input type="email" required value={formEdit.email} onChange={(e) => setFormEdit({ ...formEdit, email: e.target.value })} className={INPUT_EDIT} />
                  </Field>
                  <Field label="NIP (opsional)">
                    <input value={formEdit.nip} onChange={(e) => setFormEdit({ ...formEdit, nip: e.target.value })} className={INPUT_EDIT} />
                  </Field>
                  <Field label="Mata Pelajaran">
                    <MapelPilih
                      value={formEdit.mataPelajaran || ""}
                      onChange={(v) => setFormEdit({ ...formEdit, mataPelajaran: v })}
                      daftar={mapelList.map((m) => m.nama)}
                    />
                  </Field>
                </>
              )}

              {(userDiedit.role === "siswa" || userDiedit.role === "guru") && (
                <>
                  <Field label="No. Telepon">
                    <input value={formEdit.noTelepon} onChange={(e) => setFormEdit({ ...formEdit, noTelepon: e.target.value })} className={INPUT_EDIT} />
                  </Field>
                  <Field label="Jenis Kelamin">
                    <select value={formEdit.jenisKelamin} onChange={(e) => setFormEdit({ ...formEdit, jenisKelamin: e.target.value })} className={INPUT_EDIT}>
                      <option value="">Pilih Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </Field>
                  <Field label="Alamat">
                    <textarea rows={2} value={formEdit.alamat} onChange={(e) => setFormEdit({ ...formEdit, alamat: e.target.value })} className={INPUT_EDIT} />
                  </Field>
                  <Field label="Status">
                    <select value={formEdit.status} onChange={(e) => setFormEdit({ ...formEdit, status: e.target.value })} className={INPUT_EDIT}>
                      <option value="Aktif">Aktif</option>
                      <option value="Tidak Aktif">Tidak Aktif</option>
                    </select>
                  </Field>
                </>
              )}

              <Field label="Password baru (kosongkan kalau tidak diubah)">
                <input type="password" value={formEdit.password} onChange={(e) => setFormEdit({ ...formEdit, password: e.target.value })} className={INPUT_EDIT} />
              </Field>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setUserDiedit(null)} className="flex-1 py-2.5 rounded-lg border border-[#E8D5E1] text-sm font-medium text-[#4C3447]">
                  Batal
                </button>
                <button type="submit" disabled={isSubmittingEdit}
                  className="flex-1 py-2.5 rounded-lg bg-[#5B1F4B] text-white text-sm font-semibold hover:bg-[#D95A91] hover:text-[#5B1F4B] transition disabled:opacity-60">
                  {isSubmittingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Kelas */}
      {kelasDiedit && (
        <div className="fixed inset-0 bg-[#32112B]/45 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#5B1F4B] text-lg">Edit Kelas</h3>
              <button onClick={() => setKelasDiedit(null)} className="text-[#B99EAF] hover:text-[#8A7182] text-xl leading-none">
                &times;
              </button>
            </div>

            {formEditKelasError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {formEditKelasError}
              </div>
            )}

            <form onSubmit={handleSimpanEditKelas} className="space-y-4">
              <Field label="Nama Kelas">
                <input disabled value={formEditKelas.namaKelas} className={INPUT_EDIT + " bg-[#FBF7FA] text-[#B99EAF]"} />
                <p className="text-[11px] text-[#B99EAF] mt-1">
                  Nama kelas tidak bisa diubah, supaya data siswa, materi, tugas, dan kuis tetap nyambung. Kalau salah nama, hapus lalu buat kelas baru.
                </p>
              </Field>
              <Field label="Wali Kelas">
                <select value={formEditKelas.waliKelas} onChange={(e) => setFormEditKelas({ ...formEditKelas, waliKelas: e.target.value })} className={INPUT_EDIT}>
                  <option value="">Tidak ada</option>
                  {daftarGuru.map((g) => (
                    <option key={g._id} value={g._id}>{g.nama}</option>
                  ))}
                </select>
              </Field>
              <Field label="Jurusan">
                <input required value={formEditKelas.jurusan} onChange={(e) => setFormEditKelas({ ...formEditKelas, jurusan: e.target.value })} className={INPUT_EDIT} />
              </Field>
              <Field label="Tahun Ajaran">
                <input value={formEditKelas.tahunAjaran} onChange={(e) => setFormEditKelas({ ...formEditKelas, tahunAjaran: e.target.value })} placeholder="Contoh: 2026/2027" className={INPUT_EDIT} />
              </Field>
              <Field label="Tingkat">
                <select value={formEditKelas.tingkat} onChange={(e) => setFormEditKelas({ ...formEditKelas, tingkat: e.target.value })} className={INPUT_EDIT}>
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
              </Field>
              <Field label="Kapasitas Siswa">
                <input type="number" min="1" value={formEditKelas.kapasitas} onChange={(e) => setFormEditKelas({ ...formEditKelas, kapasitas: e.target.value })} className={INPUT_EDIT} />
              </Field>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setKelasDiedit(null)} className="flex-1 py-2.5 rounded-lg border border-[#E8D5E1] text-sm font-medium text-[#4C3447]">
                  Batal
                </button>
                <button type="submit" disabled={isSubmittingEditKelas}
                  className="flex-1 py-2.5 rounded-lg bg-[#5B1F4B] text-white text-sm font-semibold hover:bg-[#D95A91] hover:text-[#5B1F4B] transition disabled:opacity-60">
                  {isSubmittingEditKelas ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus User */}
      {userDihapus && (
        <div className="fixed inset-0 bg-[#32112B]/45 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="font-semibold text-[#5B1F4B] text-lg mb-2">Hapus pengguna?</h3>
            <p className="text-sm text-[#8A7182] mb-6">
              Yakin mau hapus <strong>{userDihapus.nama}</strong>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setUserDihapus(null)} className="flex-1 py-2.5 rounded-lg border border-[#E8D5E1] text-sm font-medium text-[#4C3447]">
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
        <div className="fixed inset-0 bg-[#32112B]/45 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#5B1F4B] text-lg">Buat Pengumuman</h3>
              <button onClick={() => setShowFormPengumuman(false)} className="text-[#B99EAF] hover:text-[#8A7182] text-xl leading-none">
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
                  className="w-full px-3 py-2 rounded-lg border border-[#E8D5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#D95A91]"
                />
              </Field>

              <Field label="Isi pengumuman">
                <textarea
                  required
                  rows={5}
                  placeholder="Tulis isi pengumuman di sini..."
                  value={formPengumuman.isi}
                  onChange={(e) => setFormPengumuman({ ...formPengumuman, isi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8D5E1] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#D95A91]"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Ditujukan untuk">
                  <select
                    value={formPengumuman.target}
                    onChange={(e) => setFormPengumuman({ ...formPengumuman, target: e.target.value as "semua" | "guru" | "siswa" })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8D5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#D95A91]"
                  >
                    <option value="semua">Semua</option>
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </Field>

                <Field label="Prioritas">
                  <select
                    value={formPengumuman.prioritas}
                    onChange={(e) => setFormPengumuman({ ...formPengumuman, prioritas: e.target.value as "biasa" | "penting" })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8D5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#D95A91]"
                  >
                    <option value="biasa">Biasa</option>
                    <option value="penting">Penting</option>
                  </select>
                </Field>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPengumuman}
                className="w-full py-2.5 rounded-lg bg-[#5B1F4B] text-white text-sm font-semibold hover:bg-[#D95A91] hover:text-[#5B1F4B] transition disabled:opacity-60"
              >
                {isSubmittingPengumuman ? "Menyimpan..." : "Terbitkan Pengumuman"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pengumuman */}
      {pengumumanDihapus && (
        <div className="fixed inset-0 bg-[#32112B]/45 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="font-semibold text-[#5B1F4B] text-lg mb-2">Hapus pengumuman?</h3>
            <p className="text-sm text-[#8A7182] mb-6">
              Yakin mau hapus <strong>{pengumumanDihapus.judul}</strong>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPengumumanDihapus(null)} className="flex-1 py-2.5 rounded-lg border border-[#E8D5E1] text-sm font-medium text-[#4C3447]">
                Batal
              </button>
              <button onClick={konfirmasiHapusPengumuman} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Mata Pelajaran */}
      {showFormMapel && (
        <div className="fixed inset-0 bg-[#32112B]/45 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#5B1F4B] text-lg">
                {mapelEditId ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
              </h3>
              <button onClick={() => setShowFormMapel(false)} className="text-[#B99EAF] hover:text-[#8A7182] text-xl leading-none">
                &times;
              </button>
            </div>

            {formMapelError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {formMapelError}
              </div>
            )}

            <form onSubmit={handleSimpanMapel} className="space-y-4">
              <Field label="Nama Mata Pelajaran">
                <input
                  required
                  disabled={!!mapelEditId}
                  value={formMapel.nama}
                  onChange={(e) => setFormMapel({ ...formMapel, nama: e.target.value })}
                  placeholder="Contoh: Matematika"
                  className={INPUT_EDIT + (mapelEditId ? " bg-[#FBF7FA] text-[#B99EAF]" : "")}
                />
                {mapelEditId && (
                  <p className="text-[11px] text-[#B99EAF] mt-1">
                    Nama tidak bisa diubah, supaya data guru, materi, tugas, dan kuis tetap nyambung. Kalau salah nama, hapus lalu buat baru.
                  </p>
                )}
              </Field>
              <Field label="Kode (opsional)">
                <input
                  value={formMapel.kode}
                  onChange={(e) => setFormMapel({ ...formMapel, kode: e.target.value })}
                  placeholder="Contoh: MTK"
                  className={INPUT_EDIT}
                />
              </Field>
              <Field label="Kelompok">
                <select
                  value={formMapel.kelompok}
                  onChange={(e) => setFormMapel({ ...formMapel, kelompok: e.target.value as "Umum" | "Kejuruan" })}
                  className={INPUT_EDIT}
                >
                  <option value="Umum">Umum</option>
                  <option value="Kejuruan">Kejuruan</option>
                </select>
              </Field>
              <Field label="Jurusan (opsional)">
                <input
                  value={formMapel.jurusan}
                  onChange={(e) => setFormMapel({ ...formMapel, jurusan: e.target.value })}
                  placeholder="Contoh: PPLG. Kosongkan kalau untuk semua jurusan"
                  className={INPUT_EDIT}
                />
              </Field>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowFormMapel(false)} className="flex-1 py-2.5 rounded-lg border border-[#E8D5E1] text-sm font-medium text-[#4C3447]">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMapel}
                  className="flex-1 py-2.5 rounded-lg bg-[#5B1F4B] text-white text-sm font-semibold hover:bg-[#D95A91] hover:text-[#5B1F4B] transition disabled:opacity-60"
                >
                  {isSubmittingMapel ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Mata Pelajaran */}
      {mapelDihapus && (
        <div className="fixed inset-0 bg-[#32112B]/45 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="font-semibold text-[#5B1F4B] text-lg mb-2">Hapus mata pelajaran?</h3>
            <p className="text-sm text-[#8A7182] mb-3">
              Yakin mau hapus <strong>{mapelDihapus.nama}</strong> dari daftar?
            </p>
            {guruPengampu(mapelDihapus.nama).length > 0 && (
              <p className="text-xs text-[#A83E75] bg-[#FCEAF2] rounded-lg px-3 py-2 mb-3">
                Masih dipakai {guruPengampu(mapelDihapus.nama).length} guru. Data mereka tidak ikut terhapus, tapi mapel ini tidak muncul lagi sebagai pilihan.
              </p>
            )}
            <div className="flex gap-3 mt-3">
              <button onClick={() => setMapelDihapus(null)} className="flex-1 py-2.5 rounded-lg border border-[#E8D5E1] text-sm font-medium text-[#4C3447]">
                Batal
              </button>
              <button onClick={konfirmasiHapusMapel} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Kelas */}
      {kelasDihapus && (
        <div className="fixed inset-0 bg-[#32112B]/45 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="font-semibold text-[#5B1F4B] text-lg mb-2">Hapus kelas?</h3>
            <p className="text-sm text-[#8A7182] mb-6">
              Yakin mau hapus <strong>{kelasDihapus.namaKelas}</strong>? Data siswa di kelas ini tidak akan ikut terhapus.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setKelasDihapus(null)} className="flex-1 py-2.5 rounded-lg border border-[#E8D5E1] text-sm font-medium text-[#4C3447]">
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

function SectionCard({
  title,
  tambahHref,
  tambahLabel,
  children,
}: {
  title: string;
  tambahHref: string;
  tambahLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0DDE8] overflow-hidden shadow-[0_8px_30px_rgba(91,31,75,0.05)]">
      <div className="px-6 py-5 border-b border-[#F0DDE8] flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-[#5B1F4B]">{title}</h2>
        <Link href={tambahHref} className="px-4 py-2 rounded-lg bg-[#5B1F4B] text-white text-sm font-medium hover:bg-[#D95A91] hover:text-[#5B1F4B] transition">
          {tambahLabel}
        </Link>
      </div>
      {children}
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return <p className="px-6 py-10 text-sm text-[#B99EAF] text-center">{text}</p>;
}

function SkeletonTable() {
  return (
    <div className="px-6 py-4 space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-10 rounded-lg bg-[#F8EDF3]" />
      ))}
    </div>
  );
}

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ data, total }: { data: DonutSlice[]; total: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let akumulasi = 0;
  const segmenList = data.map((d) => {
    const persen = d.value / total;
    const panjangSegmen = persen * circumference;
    const dashOffset = -akumulasi;
    akumulasi += panjangSegmen;
    return {
      ...d,
      dashArray: `${panjangSegmen} ${circumference - panjangSegmen}`,
      dashOffset,
    };
  });

  return (
    <svg viewBox="0 0 120 120" className="w-32 h-32 shrink-0" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#F3E5ED" strokeWidth="16" />
      {segmenList.map((d) => (
        <circle
          key={d.label}
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={d.color}
          strokeWidth="16"
          strokeDasharray={d.dashArray}
          strokeDashoffset={d.dashOffset}
        />
      ))}
    </svg>
  );
}

function StatCard({
  label,
  value,
  icon: IconComp,
  onClick,
}: {
  label: string;
  value: number | string;
  icon: (props: SvgIconProps) => ReactNode;
  onClick?: () => void;
}) {
  const isClickable = !!onClick;
  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`group bg-white rounded-[20px] border border-[#F0DDE8] px-4 lg:px-5 py-4 flex items-center justify-between gap-3 shadow-[0_5px_20px_rgba(91,31,75,0.045)] transition-all ${
        isClickable
          ? "cursor-pointer hover:-translate-y-1 hover:border-[#D95A91]/50 hover:shadow-[0_12px_28px_rgba(91,31,75,0.12)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#D94383]"
          : "hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(91,31,75,0.09)]"
      }`}
    >
      <div className="min-w-0">
        <p className="text-[11px] lg:text-xs font-semibold text-[#8A7182]">{label}</p>
        <p className="text-2xl lg:text-[30px] leading-tight font-extrabold text-[#5B1F4B] mt-1 tabular-nums">{value}</p>
        <p className="text-[10px] text-[#B99EAF] mt-1 font-medium group-hover:text-[#D95A91] transition-colors flex items-center gap-1">
          {isClickable ? `Buka data ${label.replace("Total ", "")} →` : "Data terdaftar"}
        </p>
      </div>
      <div
        className={`w-12 h-12 lg:w-[66px] lg:h-[66px] rounded-full bg-[#FBEAF2] flex items-center justify-center text-[#8B3569] shrink-0 transition-transform ${
          isClickable ? "group-hover:scale-110 group-hover:bg-[#F5D5E5]" : "group-hover:bg-[#F5D5E5]"
        }`}
      >
        <IconComp className="w-6 h-6 lg:w-7 lg:h-7" />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#4C3447] mb-1.5">{label}</label>
      {children}
    </div>
  );
}
