export type UserRole = "admin" | "guru" | "siswa" | "kepsek" | "kurikulum";

export interface UserItem {
  _id: string;
  nama: string;
  username?: string;
  email?: string;
  password?: string;
  role: UserRole;
  noTelepon?: string;
  jenisKelamin?: "Laki-laki" | "Perempuan" | "";
  alamat?: string;
  status?: string;
  foto?: string;
  nis?: string;
  nisn?: string;
  kelas?: string;
  jurusan?: string;
  nip?: string;
  mataPelajaran?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WaliKelasPopulated {
  _id: string;
  nama: string;
}

export interface KelasItem {
  _id: string;
  namaKelas: string;
  tingkat: "X" | "XI" | "XII" | string;
  jurusan: string;
  tahunAjaran?: string;
  kapasitas?: number | null;
  waliKelas?: WaliKelasPopulated | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MataPelajaranItem {
  _id: string;
  nama: string;
  kode?: string;
  kelompok: "Umum" | "Kejuruan" | string;
  jurusan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PengumumanItem {
  _id: string;
  judul: string;
  isi: string;
  target: "semua" | "guru" | "siswa";
  prioritas: "biasa" | "penting";
  pembuat?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuruPopulated {
  _id: string;
  nama: string;
}

export interface SiswaPopulated {
  _id: string;
  nama: string;
  nis?: string;
  nisn?: string;
  kelas?: string;
}

export interface MateriItem {
  _id: string;
  judul: string;
  mataPelajaran: string;
  kelas: string;
  tipe: "pdf" | "link";
  fileUrl: string;
  namaFile?: string;
  guru?: GuruPopulated | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TugasSubmission {
  _id?: string;
  siswa: SiswaPopulated | string;
  fileUrl: string;
  namaFile?: string | null;
  tipe: "link" | "pdf";
  waktuKumpul: string | Date;
  nilai?: number | null;
}

export interface TugasItem {
  _id: string;
  judul: string;
  deskripsi?: string;
  mataPelajaran: string;
  kelas: string;
  guru: GuruPopulated | string;
  deadline: string;
  submissions?: TugasSubmission[];
  pengumpulan?: TugasSubmission | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SoalItem {
  pertanyaan: string;
  pilihan: string[];
  jawabanBenar?: number;
  jawabanSaya?: number | null;
}

export interface AttemptItem {
  siswa: SiswaPopulated | string;
  jawaban: number[];
  skor: number;
  waktuSelesai: string | Date;
}

export interface KuisItem {
  _id: string;
  judul: string;
  deskripsi?: string;
  mataPelajaran: string;
  kelas: string;
  guru: GuruPopulated | string;
  durasiMenit: number;
  soal: SoalItem[];
  attempts?: AttemptItem[];
  attemptSaya?: AttemptItem | null;
  jumlahSoal?: number;
  status?: "aktif" | "nonaktif";
  createdAt?: string;
  updatedAt?: string;
}

export interface NilaiItem {
  _id: string;
  siswa: SiswaPopulated | string;
  guru: GuruPopulated | string;
  mataPelajaran: string;
  kelas: string;
  jurusan?: string;
  jenis: "kuis" | "ujian_online" | "tugas" | "penilaian_manual";
  nilai: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AktivitasItem {
  label?: string;
  judul?: string;
  waktu: string | undefined;
}
