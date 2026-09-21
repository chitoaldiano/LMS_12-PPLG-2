// models/Tugas.js
// Fitur: Guru "Buat Tugas" & "Lihat Tugas", Siswa "Upload Tugas"

import mongoose from "mongoose";

const TugasSchema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: true,
    },
    deskripsi: {
      type: String,
    },
    mataPelajaran: {
      type: String,
      required: true,
    },
    kelas: {
      type: String,
      required: true,
    },
    guru: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    // Kumpulan submission dari siswa (via upload, sesuai catatanmu)
    submissions: [
      {
        siswa: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        fileUrl: { type: String, required: true }, // pdf atau link
        waktuKumpul: { type: Date, default: Date.now },
        nilai: { type: Number, default: null },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Tugas || mongoose.model("Tugas", TugasSchema);
