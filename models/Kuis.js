// models/Kuis.js
// Fitur: Guru "Buat Kuis/Ujian", Siswa "Kerjakan Kuis" (dinilai otomatis)

import mongoose from "mongoose";

const SoalSchema = new mongoose.Schema(
  {
    pertanyaan: { type: String, required: true },
    pilihan: { type: [String], required: true }, // contoh: 4 opsi jawaban
    jawabanBenar: { type: Number, required: true }, // index 0-based di array pilihan
  },
  { _id: false }
);

const AttemptSchema = new mongoose.Schema(
  {
    siswa: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    jawaban: [Number], // index jawaban siswa per soal (-1 kalau tidak dijawab)
    skor: { type: Number, required: true }, // 0-100
    waktuSelesai: { type: Date, default: Date.now },
  },
  { _id: false }
);

const KuisSchema = new mongoose.Schema(
  {
    judul: { type: String, required: true },
    deskripsi: { type: String },
    mataPelajaran: { type: String, required: true },
    kelas: { type: String, required: true },
    guru: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    durasiMenit: { type: Number, default: 30 },
    soal: { type: [SoalSchema], required: true },
    attempts: [AttemptSchema],
    status: { type: String, enum: ["aktif", "nonaktif"], default: "aktif" },
  },
  { timestamps: true }
);

export default mongoose.models.Kuis || mongoose.model("Kuis", KuisSchema);