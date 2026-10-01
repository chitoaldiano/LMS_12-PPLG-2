// models/Materi.ts
// Fitur: Guru upload materi (pdf & link), siswa/guru/dst bisa download & preview

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMateri extends Document {
  judul: string;
  mataPelajaran: string;
  kelas: string;
  tipe: "pdf" | "link";
  fileUrl: string;
  guru: Types.ObjectId;
}

const MateriSchema = new Schema<IMateri>(
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
      type: Schema.Types.ObjectId,
      ref: "User", // relasi ke guru yang upload
      required: true,
    },
  },
  { timestamps: true }
);

export default (mongoose.models.Materi as Model<IMateri>) || mongoose.model<IMateri>("Materi", MateriSchema);