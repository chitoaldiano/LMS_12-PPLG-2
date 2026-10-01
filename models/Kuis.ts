// models/Kuis.ts
// Fitur: Guru "Buat Kuis/Ujian", Siswa "Kerjakan Kuis" (dinilai otomatis)

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISoal {
  pertanyaan: string;
  pilihan: string[]; // contoh: 4 opsi jawaban
  jawabanBenar: number; // index 0-based di array pilihan
}

export interface IAttempt {
  siswa: Types.ObjectId;
  jawaban: number[]; // index jawaban siswa per soal (-1 kalau tidak dijawab)
  skor: number; // 0-100
  waktuSelesai: Date;
}

export interface IKuis extends Document {
  judul: string;
  deskripsi?: string;
  mataPelajaran: string;
  kelas: string;
  guru: Types.ObjectId;
  durasiMenit: number;
  soal: ISoal[];
  attempts: IAttempt[];
  status: "aktif" | "nonaktif";
}

const SoalSchema = new Schema<ISoal>(
  {
    pertanyaan: { type: String, required: true },
    pilihan: { type: [String], required: true },
    jawabanBenar: { type: Number, required: true },
  },
  { _id: false }
);

const AttemptSchema = new Schema<IAttempt>(
  {
    siswa: { type: Schema.Types.ObjectId, ref: "User" },
    jawaban: [Number],
    skor: { type: Number, required: true },
    waktuSelesai: { type: Date, default: Date.now },
  },
  { _id: false }
);

const KuisSchema = new Schema<IKuis>(
  {
    judul: { type: String, required: true },
    deskripsi: { type: String },
    mataPelajaran: { type: String, required: true },
    kelas: { type: String, required: true },
    guru: { type: Schema.Types.ObjectId, ref: "User", required: true },
    durasiMenit: { type: Number, default: 30 },
    soal: { type: [SoalSchema], required: true },
    attempts: [AttemptSchema],
    status: { type: String, enum: ["aktif", "nonaktif"], default: "aktif" },
  },
  { timestamps: true }
);

export default (mongoose.models.Kuis as Model<IKuis>) || mongoose.model<IKuis>("Kuis", KuisSchema);