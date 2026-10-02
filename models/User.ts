// models/User.ts
// Sesuai catatan whiteboard-mu: ada 5 role -> admin, guru, siswa, kepsek, kurikulum
// Login pakai USERNAME. Field detail (NIS/NIP/telepon/dll) sesuai form Tambah Siswa/Guru.

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  nama: string;
  username?: string; // login khusus ADMIN
  email?: string; // login khusus GURU & KURIKULUM
  password: string;
  role: "admin" | "guru" | "siswa" | "kepsek" | "kurikulum";
  noTelepon?: string;
  jenisKelamin?: "Laki-laki" | "Perempuan" | "";
  alamat?: string;
  status?: string;
  foto?: string;
  nis?: string; // nomor induk sekolah (data internal, BUKAN login)
  nisn?: string; // login khusus SISWA
  kelas?: string;
  jurusan?: string;
  nip?: string; // login khusus KEPALA SEKOLAH
  mataPelajaran?: string[];
}

const UserSchema = new Schema<IUser>(
  {
    nama: {
      type: String,
      required: true,
    },
    // Login khusus ADMIN. Sparse = boleh kosong buat role lain tanpa bentrok unique index.
    username: {
      type: String,
      required: function (this: IUser) {
        return this.role === "admin";
      },
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    // Login khusus GURU & KURIKULUM
    email: {
      type: String,
      required: function (this: IUser) {
        return this.role === "guru" || this.role === "kurikulum";
      },
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    // Login khusus SISWA (beda dari NIS di bawah, yang cuma data internal sekolah)
    nisn: {
      type: String,
      required: function (this: IUser) {
        return this.role === "siswa";
      },
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // WAJIB di-hash pakai bcrypt sebelum disimpan!
    },
    role: {
      type: String,
      enum: ["admin", "guru", "siswa", "kepsek", "kurikulum"],
      required: true,
    },
    noTelepon: {
      type: String,
      required: false,
    },
    jenisKelamin: {
      type: String,
      enum: ["Laki-laki", "Perempuan", ""],
      required: false,
    },
    alamat: {
      type: String,
      required: false,
    },
    status: {
      type: String, // contoh: "Aktif", "Tidak Aktif"
      required: false,
      default: "Aktif",
    },
    foto: {
      type: String, // disimpan sebagai base64 (data URL), opsional
      required: false,
    },
    // Field khusus siswa
    nis: {
      type: String,
      required: function (this: IUser) {
        return this.role === "siswa";
      },
    },
    kelas: {
      type: String, // contoh: "X PPLG 1"
      required: function (this: IUser) {
        return this.role === "siswa";
      },
    },
    jurusan: {
      type: String, // khusus siswa, contoh: PPLG
      required: false,
    },
    // Login khusus KEPALA SEKOLAH. Guru masih boleh isi NIP sbg data, tapi tidak wajib & tidak dipakai login.
    nip: {
      type: String,
      required: function (this: IUser) {
        return this.role === "kepsek";
      },
      unique: true,
      sparse: true,
      trim: true,
    },
    mataPelajaran: {
      type: [String],
      required: false,
    },
  },
  { timestamps: true }
);

export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);