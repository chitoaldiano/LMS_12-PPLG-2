// models/Nilai.js
// Fitur: Asesmen (kuis, ujian online, penilaian) + Rekap nilai per mapel/kelas/jurusan
// Ini yang dipakai role Kurikulum buat "download nilai per mapel per guru"

import mongoose from "mongoose";

const NilaiSchema = new mongoose.Schema(
  {
    siswa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guru: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mataPelajaran: {
      type: String,
      required: true,
    },
    kelas: {
      type: String,
      required: true,
    },
    jurusan: {
      type: String, // buat rekap "per jurusan" sesuai catatanmu
    },
    jenis: {
      type: String,
      enum: ["kuis", "ujian_online", "tugas", "penilaian_manual"],
      required: true,
    },
    nilai: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Nilai || mongoose.model("Nilai", NilaiSchema);
