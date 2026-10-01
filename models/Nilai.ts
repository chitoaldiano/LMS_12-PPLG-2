// models/Nilai.ts
// Fitur: Asesmen (kuis, ujian online, penilaian) + Rekap nilai per mapel/kelas/jurusan
// Ini yang dipakai role Kurikulum buat "download nilai per mapel per guru"

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INilai extends Document {
  siswa: Types.ObjectId;
  guru: Types.ObjectId;
  mataPelajaran: string;
  kelas: string;
  jurusan?: string;
  jenis: "kuis" | "ujian_online" | "tugas" | "penilaian_manual";
  nilai: number;
}

const NilaiSchema = new Schema<INilai>(
  {
    siswa: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guru: {
      type: Schema.Types.ObjectId,
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

export default (mongoose.models.Nilai as Model<INilai>) || mongoose.model<INilai>("Nilai", NilaiSchema);