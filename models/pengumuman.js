// models/Pengumuman.js
// Pengumuman dari admin, bisa ditargetkan ke semua orang, guru saja, atau siswa saja

import mongoose from "mongoose";

const PengumumanSchema = new mongoose.Schema(
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

export default mongoose.models.Pengumuman || mongoose.model("Pengumuman", PengumumanSchema);