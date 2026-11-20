// models/MataPelajaran.ts
// Daftar mata pelajaran resmi sekolah (data master), dikelola Admin.
// Guru memilih mapelnya dari daftar ini supaya penulisannya seragam (tidak ada "matematika" vs "Matematika").
// Nama mapel dipakai sebagai penghubung ke guru, materi, tugas, kuis, dan nilai,
// jadi nama TIDAK bisa diubah setelah dibuat.

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMataPelajaran extends Document {
  nama: string;
  kode?: string;
  kelompok: "Umum" | "Kejuruan";
  jurusan?: string;
}

const MataPelajaranSchema = new Schema<IMataPelajaran>(
  {
    nama: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    kode: {
      type: String, // contoh: MTK, PDP
      trim: true,
      uppercase: true,
    },
    kelompok: {
      type: String,
      enum: ["Umum", "Kejuruan"],
      default: "Umum",
    },
    jurusan: {
      type: String, // contoh: PPLG (kosong = berlaku untuk semua jurusan)
      trim: true,
    },
  },
  { timestamps: true, collection: "mapel" }
);

export default (mongoose.models.MataPelajaran as Model<IMataPelajaran>) ||
  mongoose.model<IMataPelajaran>("MataPelajaran", MataPelajaranSchema);