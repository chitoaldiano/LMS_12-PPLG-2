// models/Materi.js
// Fitur: Guru upload materi (pdf & link), siswa/guru/dst bisa download & preview

import mongoose from "mongoose";

const MateriSchema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: true,
    },
    mataPelajaran: {
      type: String,
      required: true,
    },
    kelas: {
      type: String, // materi ditujukan buat kelas mana
      required: true,
    },
    tipe: {
      type: String,
      enum: ["pdf", "link"], // sesuai catatan: "upload materi (pdf & link)"
      required: true,
    },
    fileUrl: {
      type: String, // link ke file (kalau tipe pdf) atau link eksternal (kalau tipe link)
      required: true,
    },
    guru: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // relasi ke guru yang upload
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Materi || mongoose.model("Materi", MateriSchema);
