// models/Kelas.ts
// Data kelas: misal "X PPLG 1" -> tingkat X, jurusan PPLG, rombel 1

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IKelas extends Document {
  namaKelas: string;
  tingkat: "X" | "XI" | "XII";
  jurusan: string;
  tahunAjaran?: string;
  kapasitas?: number;
  waliKelas?: Types.ObjectId;
}

const KelasSchema = new Schema<IKelas>(
  {
    namaKelas: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    tingkat: {
      type: String,
      enum: ["X", "XI", "XII"],
      required: true,
    },
    jurusan: {
      type: String,
      required: true,
    },
    tahunAjaran: {
      type: String, // contoh: "2026/2027"
      required: false,
    },
    kapasitas: {
      type: Number,
      required: false,
    },
    waliKelas: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

export default (mongoose.models.Kelas as Model<IKelas>) || mongoose.model<IKelas>("Kelas", KelasSchema);