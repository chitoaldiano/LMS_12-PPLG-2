// models/Tugas.ts
// Fitur: Guru "Buat Tugas" & "Lihat Tugas", Siswa "Upload Tugas"

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITugasSubmission {
  siswa: Types.ObjectId;
  fileUrl: string;
  namaFile?: string | null;
  tipe: "link" | "pdf";
  waktuKumpul: Date;
  nilai?: number | null;
}

export interface ITugas extends Document {
  judul: string;
  deskripsi?: string;
  mataPelajaran: string;
  kelas: string;
  guru: Types.ObjectId;
  deadline: Date;
  submissions: ITugasSubmission[];
}

const TugasSchema = new Schema<ITugas>(
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
      type: Schema.Types.ObjectId,
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
        siswa: { type: Schema.Types.ObjectId, ref: "User" },
        fileUrl: { type: String, required: true }, // link, atau data URI base64 kalau upload PDF
        namaFile: { type: String, default: null }, // nama file asli kalau upload PDF
        tipe: { type: String, enum: ["link", "pdf"], default: "link" },
        waktuKumpul: { type: Date, default: Date.now },
        nilai: { type: Number, default: null },
      },
    ],
  },
  { timestamps: true }
);

export default (mongoose.models.Tugas as Model<ITugas>) || mongoose.model<ITugas>("Tugas", TugasSchema);