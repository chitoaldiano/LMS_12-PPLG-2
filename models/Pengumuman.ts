// models/Pengumuman.ts
// Pengumuman dari admin, bisa ditargetkan ke semua orang, guru saja, atau siswa saja

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPengumuman extends Document {
  judul: string;
  isi: string;
  target: "semua" | "guru" | "siswa";
  prioritas: "biasa" | "penting";
  pembuat?: string;
}

const PengumumanSchema = new Schema<IPengumuman>(
  {
    judul: {
      type: String,
      required: true,
      trim: true,
    },
    isi: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      enum: ["semua", "guru", "siswa"],
      default: "semua",
    },
    prioritas: {
      type: String,
      enum: ["biasa", "penting"],
      default: "biasa",
    },
    pembuat: {
      type: String, // nama pembuat pengumuman
    },
  },
  { timestamps: true, collection: "pengumuman" }
);

export default (mongoose.models.Pengumuman as Model<IPengumuman>) || mongoose.model<IPengumuman>("Pengumuman", PengumumanSchema);