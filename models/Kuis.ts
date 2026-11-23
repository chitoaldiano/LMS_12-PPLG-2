// models/Kuis.ts
// Fitur: Guru "Buat Kuis/Ujian", Siswa "Kerjakan Kuis" (dinilai otomatis berbasis poin)

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISoal {
  pertanyaan: string;
  pilihan: string[]; // opsi jawaban (minimal 2, maksimal 8)
  jawabanBenar: number; // index 0-based di array pilihan
  poinBenar?: number; // poin jika benar (default: 1)
  poinSalah?: number; // poin jika salah (default: 0, bisa negatif)
}

export interface IAttempt {
  siswa: Types.ObjectId;
  jawaban: number[]; // index jawaban siswa per soal (-1 kalau tidak dijawab)
  skor: number; // skala 0-100
  poin: number; // total poin yang diperoleh
  poinMaks: number; // poin maksimal dari semua soal
  benar: number; // jumlah soal benar
  salah: number; // jumlah soal salah
  kosong: number; // jumlah soal kosong
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
  createdAt?: Date;
  updatedAt?: Date;
}

const SoalSchema = new Schema<ISoal>(
  {
    pertanyaan: { type: String, required: true },
    pilihan: { type: [String], required: true },
    jawabanBenar: { type: Number, required: true },
    poinBenar: { type: Number, default: 1 },
    poinSalah: { type: Number, default: 0 },
  },
  { _id: false }
);

const AttemptSchema = new Schema<IAttempt>(
  {
    siswa: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jawaban: [Number],
    skor: { type: Number, required: true },
    poin: { type: Number, default: 0 },
    poinMaks: { type: Number, default: 0 },
    benar: { type: Number, default: 0 },
    salah: { type: Number, default: 0 },
    kosong: { type: Number, default: 0 },
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
