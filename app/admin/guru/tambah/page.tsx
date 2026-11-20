"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import MapelPilih from "@/components/MapelPilih";
import ThemeToggle from "@/components/ThemeToggle";

const INPUT_CLASS =
  "block w-full min-w-0 max-w-full rounded-xl border border-[#E9D5E1] bg-white px-4 py-3 text-sm text-[#4C3447] outline-none transition placeholder:text-[#B99EAF] hover:border-[#D9A9C4] focus:border-[#A53D78] focus:ring-4 focus:ring-[#D95A91]/10";

const LABEL_CLASS = "mb-2 block text-sm font-semibold text-[#5B1F4B]";

interface FormGuruState {
  nama: string;
  nip: string;
  mataPelajaran: string;
  noTelepon: string;
  jenisKelamin: string;
  alamat: string;
  email: string;
  password: string;
  status: string;
}

export default function TambahGuruPage() {
  const router = useRouter();

  const [daftarMapel, setDaftarMapel] = useState<string[]>([]);
  const [isLoadingMapel, setIsLoadingMapel] = useState(true);

  useEffect(() => {
    let aktif = true;

    fetch("/api/mapel")
      .then((response) => response.json())
      .then((result) => {
        if (aktif && result.success && Array.isArray(result.data)) {
          setDaftarMapel(result.data.map((mapel: { nama: string }) => mapel.nama));
        }
      })
      .catch(() => {
        // Daftar mapel kosong akan ditampilkan sebagai informasi pada form.
      })
      .finally(() => {
        if (aktif) setIsLoadingMapel(false);
      });

    return () => {
      aktif = false;
    };
  }, []);

  const [form, setForm] = useState<FormGuruState>({
    nama: "",
    nip: "",
    mataPelajaran: "",
    noTelepon: "",
    jenisKelamin: "",
    alamat: "",
    email: "",
    password: "",
    status: "Aktif",
  });

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleUploadFoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMsg("");

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrorMsg("Format foto harus JPG atau PNG.");
      event.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("Ukuran foto maksimal 20MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFotoPreview(reader.result);
        setFotoBase64(reader.result);
      }
    };
    reader.onerror = () => setErrorMsg("Foto tidak dapat dibaca. Silakan coba lagi.");
    reader.readAsDataURL(file);
  }

  function hapusFoto() {
    setFotoPreview(null);
    setFotoBase64("");
    const input = document.getElementById("foto-guru") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");

    if (!form.mataPelajaran.trim()) {
      setErrorMsg("Pilih minimal satu mata pelajaran.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nama: form.nama,
        email: form.email,
        password: form.password,
        role: "guru",
        nip: form.nip,
        mataPelajaran: form.mataPelajaran
          .split(",")
          .map((mapel) => mapel.trim())
          .filter(Boolean),
        noTelepon: form.noTelepon,
        jenisKelamin: form.jenisKelamin,
        alamat: form.alamat,
        status: form.status,
        foto: fotoBase64,
      };

      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMsg(result.message || "Gagal menambah guru. Periksa kembali data yang dimasukkan.");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin#daftar-user");
    } catch {
      setErrorMsg("Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[radial-gradient(circle_at_top_right,_#F8E5EF_0,_#FCF8FA_38%,_#F8F5F8_100%)] px-4 py-5 text-[#4C3447] sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-0 w-full min-w-0 max-w-none">
        {/* Navigasi halaman */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="group inline-flex items-center gap-2 rounded-full border border-[#EAD7E3] bg-white px-4 py-2.5 text-sm font-semibold text-[#80516E] shadow-sm transition hover:border-[#D9A9C4] hover:bg-[#FFF9FC] hover:text-[#5B1F4B]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Kembali ke Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#EAD7E3] bg-white/80 px-3.5 py-2 text-xs font-bold tracking-wide text-[#96527B]">
              <span className="h-2 w-2 rounded-full bg-[#D95A91]" />
              ADMINISTRASI GURU
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Header dibuat lebar dan jelas */}
        <header className="relative mb-6 overflow-hidden rounded-3xl border border-[#EED8E5] bg-gradient-to-r from-[#FBEAF2] via-[#F8E4EE] to-[#F1D5E5] px-5 py-6 shadow-[0_8px_28px_rgba(91,31,75,0.05)] sm:px-7 lg:px-8">
          <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[28px] border-white/30" />
          <div className="pointer-events-none absolute -bottom-28 right-44 h-56 w-56 rounded-full bg-white/25" />
          <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="min-w-0 max-w-3xl">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#A84E7E]">Manajemen pengguna</p>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#5B1F4B] sm:text-3xl">Tambah Guru Baru</h1>
              <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-[#805D74] sm:text-base [overflow-wrap:anywhere]">
                Lengkapi informasi pribadi, mata pelajaran, dan akun login guru untuk menambahkan data ke LMS SMK Citra Negara.
              </p>
            </div>
            <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FCE7F1] text-[#963D70]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                  <circle cx="9.5" cy="7" r="4" />
                  <path d="M19 8v6M22 11h-6" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#A4879A]">Formulir pendaftaran</p>
                <p className="text-sm font-bold text-[#5B1F4B]">Data guru baru</p>
              </div>
            </div>
          </div>
        </header>

        {errorMsg && (
          <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid w-full min-w-0 max-w-full grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(260px,310px)_minmax(0,1fr)]">
          {/* Panel foto profil */}
          <aside className="w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-[#F0DDE8] bg-white p-4 shadow-[0_10px_32px_rgba(91,31,75,0.06)] sm:p-5 xl:sticky xl:top-5">
            <div className="mb-4">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#B65A89]">Profil pengajar</p>
              <h2 className="text-lg font-bold text-[#5B1F4B]">Foto Profil Guru</h2>
              <p className="mt-1 text-sm leading-5 text-[#A4879A]">Tambahkan foto agar guru lebih mudah dikenali.</p>
            </div>

            <label
              htmlFor="foto-guru"
              className="group relative mx-auto flex aspect-square w-full max-w-[230px] min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-[#E5C6D8] bg-gradient-to-br from-[#FFF8FB] to-[#F8E8F1] transition hover:border-[#C66A98] hover:from-[#FDF0F6] hover:to-[#F4DFEA]"
            >
              {fotoPreview ? (
                <img src={fotoPreview} alt="Preview foto guru" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center px-5 text-center">
                  <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#C17AA0] shadow-sm ring-8 ring-white/50">
                    <svg viewBox="0 0 24 24" className="h-11 w-11" fill="currentColor">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-[#75405F]">Pilih foto guru</span>
                  <span className="mt-1 text-xs text-[#B391A5]">Klik untuk mengunggah</span>
                </div>
              )}
              <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-2xl border-4 border-white bg-[#7B285F] text-white shadow-lg transition group-hover:scale-105 group-hover:bg-[#D95A91]">
                {fotoPreview ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                )}
              </span>
            </label>
            <input id="foto-guru" type="file" accept="image/jpeg,image/png" onChange={handleUploadFoto} className="sr-only" />

            <div className="mt-4 rounded-2xl bg-[#FBF5F8] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#80516E]">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#B65A89]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 17v3h14v-3" />
                </svg>
                Ketentuan foto
              </div>
              <p className="mt-1.5 text-xs leading-5 text-[#A4879A]">Format JPG atau PNG, ukuran maksimal 20MB. Foto bersifat opsional.</p>
            </div>

            {fotoPreview && (
              <button
                type="button"
                onClick={hapusFoto}
                className="mt-3 w-full rounded-xl border border-[#EAD7E3] px-3 py-2.5 text-sm font-semibold text-[#9B4D78] transition hover:bg-[#FDF1F6]"
              >
                Hapus foto
              </button>
            )}
          </aside>

          {/* Area formulir utama menggunakan seluruh lebar yang tersedia */}
          <div className="w-full min-w-0 max-w-full space-y-5">
            <section className="w-full min-w-0 max-w-full rounded-3xl border border-[#F0DDE8] bg-white p-4 shadow-[0_10px_32px_rgba(91,31,75,0.055)] sm:p-6 lg:p-7">
              <SectionHeading
                number="01"
                title="Informasi Pribadi"
                description="Masukkan identitas dan informasi kontak guru."
                icon={<UserIcon />}
              />

              <div className="grid w-full min-w-0 max-w-full gap-x-6 gap-y-5 md:grid-cols-2">
                <Field label="Nama Lengkap" required>
                  <input required autoComplete="name" placeholder="Masukkan nama lengkap guru" value={form.nama} onChange={(event) => setForm({ ...form, nama: event.target.value })} className={INPUT_CLASS} />
                </Field>
                <Field label="Nomor Telepon" required>
                  <input required type="tel" autoComplete="tel" placeholder="Contoh: 081234567890" value={form.noTelepon} onChange={(event) => setForm({ ...form, noTelepon: event.target.value })} className={INPUT_CLASS} />
                </Field>
                <Field label="NIP" hint="Opsional">
                  <input placeholder="Masukkan NIP guru" value={form.nip} onChange={(event) => setForm({ ...form, nip: event.target.value })} className={INPUT_CLASS} />
                </Field>
                <Field label="Jenis Kelamin" required>
                  <select required value={form.jenisKelamin} onChange={(event) => setForm({ ...form, jenisKelamin: event.target.value })} className={INPUT_CLASS}>
                    <option value="">Pilih jenis kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Alamat Lengkap" required>
                    <textarea required rows={3} placeholder="Masukkan alamat lengkap guru" value={form.alamat} onChange={(event) => setForm({ ...form, alamat: event.target.value })} className={`${INPUT_CLASS} min-h-[112px] resize-y`} />
                  </Field>
                </div>
              </div>
            </section>

            <section className="w-full min-w-0 max-w-full rounded-3xl border border-[#F0DDE8] bg-white p-4 shadow-[0_10px_32px_rgba(91,31,75,0.055)] sm:p-6 lg:p-7">
              <SectionHeading
                number="02"
                title="Informasi Akademik"
                description="Tentukan mata pelajaran yang akan diampu oleh guru."
                icon={<BookIcon />}
              />
              <Field label="Mata Pelajaran" required>
                <div className="w-full min-w-0 max-w-full rounded-xl border border-[#E9D5E1] bg-white p-2 [overflow-wrap:anywhere] transition focus-within:border-[#A53D78] focus-within:ring-4 focus-within:ring-[#D95A91]/10 [&_*]:max-w-full [&_input]:min-w-0 [&_input]:w-full [&_button]:whitespace-normal [&_button]:break-words">
                  <MapelPilih value={form.mataPelajaran} onChange={(value) => setForm({ ...form, mataPelajaran: value })} daftar={daftarMapel} />
                </div>
                <p className="mt-2 text-xs leading-5 text-[#A4879A]">
                  {isLoadingMapel
                    ? "Memuat daftar mata pelajaran..."
                    : daftarMapel.length > 0
                      ? `${daftarMapel.length} mata pelajaran tersedia dari data master.`
                      : "Belum ada mata pelajaran. Tambahkan terlebih dahulu melalui menu Mata Pelajaran."}
                </p>
              </Field>
            </section>

            <section className="w-full min-w-0 max-w-full rounded-3xl border border-[#F0DDE8] bg-white p-4 shadow-[0_10px_32px_rgba(91,31,75,0.055)] sm:p-6 lg:p-7">
              <SectionHeading
                number="03"
                title="Informasi Akun"
                description="Data berikut digunakan guru untuk masuk ke LMS."
                icon={<LockIcon />}
              />

              <div className="grid w-full min-w-0 max-w-full gap-x-6 gap-y-5 md:grid-cols-2">
                <Field label="Email Login" required>
                  <input required type="email" autoComplete="email" placeholder="nama@email.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={INPUT_CLASS} />
                </Field>
                <Field label="Password" required>
                  <div className="relative">
                    <input required type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Masukkan password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className={`${INPUT_CLASS} pr-12`} />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} className="absolute inset-y-0 right-0 flex items-center px-4 text-[#A4879A] transition hover:text-[#7B285F]">
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </Field>
                <Field label="Status Akun" required>
                  <select required value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={INPUT_CLASS}>
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </Field>
              </div>
            </section>

            {/* Footer form dibuat terpisah agar tombol tidak menempel pada field */}
            <footer className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden rounded-3xl border border-[#F0DDE8] bg-white p-4 shadow-[0_10px_32px_rgba(91,31,75,0.05)] sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:px-7">
              <p className="min-w-0 break-words text-xs leading-5 text-[#A4879A] [overflow-wrap:anywhere]"><span className="font-bold text-[#D95A91]">*</span> Wajib diisi sebelum menyimpan data.</p>
              <div className="flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:shrink-0">
                <button type="button" onClick={() => router.push("/admin")} disabled={isSubmitting} className="whitespace-nowrap rounded-xl border border-[#E8D3E0] bg-white px-6 py-3 text-sm font-semibold text-[#80516E] transition hover:bg-[#FBF2F7] disabled:cursor-not-allowed disabled:opacity-50">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-[#702653] to-[#A53D78] px-7 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(123,40,95,0.2)] transition hover:-translate-y-0.5 hover:from-[#61204A] hover:to-[#923267] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">
                  {isSubmitting ? (
                    <>
                      <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      Simpan Guru
                    </>
                  )}
                </button>
              </div>
            </footer>
          </div>
        </form>
      </div>
    </main>
  );
}

function SectionHeading({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="mb-6 flex w-full min-w-0 max-w-full items-start gap-3 border-b border-[#F4E7EE] pb-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FCEAF2] text-[#9C3D72]">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="min-w-0 break-words text-base font-bold text-[#5B1F4B] sm:text-lg [overflow-wrap:anywhere]">{title}</h2>
          <span className="rounded-full bg-[#FBF0F6] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#B45B89]">{number}</span>
        </div>
        <p className="mt-1 break-words text-sm leading-5 text-[#A4879A] [overflow-wrap:anywhere]">{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full min-w-0 max-w-full">
      <label className={`${LABEL_CLASS} break-words [overflow-wrap:anywhere]`}>
        {label} {required && <span className="text-[#D95A91]">*</span>}
        {hint && <span className="ml-1.5 text-xs font-normal text-[#B99EAF]">({hint})</span>}
      </label>
      <div className="w-full min-w-0 max-w-full">{children}</div>
    </div>
  );
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
}

function BookIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h8" /></svg>;
}

function LockIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" /></svg>;
}

function EyeIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

function EyeOffIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.1-2.3 3.1M6.2 6.2C3.8 7.7 2.8 10 2.5 12c.5 1.2 1.5 2.7 3.5 4a10.6 10.6 0 0 0 6 2c1 0 2-.2 2.8-.5" /></svg>;
}
