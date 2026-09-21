// models/Kelas.js
// Data kelas: misal "X PPLG 1" -> tingkat X, jurusan PPLG, rombel 1

import mongoose from "mongoose";

const KelasSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Kelas || mongoose.model("Kelas", KelasSchema);