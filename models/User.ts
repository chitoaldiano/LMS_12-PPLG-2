// models/User.js
// Sesuai catatan whiteboard-mu: ada 5 role -> admin, guru, siswa, kepsek, kurikulum
// Login pakai USERNAME. Field detail (NIS/NIP/telepon/dll) sesuai form Tambah Siswa/Guru.

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      lowercase: true,
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
      required: function () {
        return this.role === "siswa";
      },
    },
    kelas: {
      type: String, // contoh: "X PPLG 1"
      required: function () {
        return this.role === "siswa";
      },
    },
    jurusan: {
      type: String, // khusus siswa, contoh: PPLG
      required: false,
    },
    // Field khusus guru
    nip: {
      type: String,
      required: function () {
        return this.role === "guru";
      },
    },
    mataPelajaran: {
      type: [String],
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);