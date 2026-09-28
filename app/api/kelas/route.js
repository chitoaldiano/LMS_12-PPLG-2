// app/api/kelas/route.js
// Akses: GET  /api/kelas  -> daftar semua kelas
//        POST /api/kelas  -> tambah kelas baru

import connectDB from "@/lib/mongodb";
import Kelas from "@/models/Kelas";
import User from "@/models/User"; // perlu diimpor biar populate waliKelas jalan

export async function GET() {
  try {
    await connectDB();

    const daftarKelas = await Kelas.find()
      .populate("waliKelas", "nama")
      .sort({ tingkat: 1, namaKelas: 1 });

    return Response.json({ success: true, data: daftarKelas });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { namaKelas, tingkat, jurusan, waliKelas } = body;

    if (!namaKelas || !tingkat || !jurusan) {
      return Response.json(
        { success: false, message: "Nama kelas, tingkat, dan jurusan wajib diisi" },
        { status: 400 }
      );
    }

    const kelasSudahAda = await Kelas.findOne({ namaKelas });
    if (kelasSudahAda) {
      return Response.json(
        { success: false, message: "Kelas dengan nama itu sudah ada" },
        { status: 409 }
      );
    }

    const dataBaru = { namaKelas, tingkat, jurusan };
    if (waliKelas) dataBaru.waliKelas = waliKelas;

    const kelasBaru = await Kelas.create(dataBaru);

    return Response.json({ success: true, data: kelasBaru }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}